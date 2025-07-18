// File: src/transports/base/NetworkTransport.ts

import { BatchingTransport } from './BatchingTransport';
import { FileManager } from '../../core/FileManager';
import type {
  NetworkTransportOptions,
  RetryOptions,
  LogEntry,
  Transport as ITransport,
  TransportStats,
  TransportOptions,
} from '../../types/transport';

/**
 * Represents a batch with additional network-specific metadata.
 */
interface NetworkBatch {
  id: string;
  entries: LogEntry[];
  sizeBytes: number;
  createdAt: number;
  retryCount: number;
  lastError?: Error;
  backoffUntil?: number;
}

/**
 * Abstract base class for network-based transports (HTTP, S3, etc.).
 * 
 * This class extends BatchingTransport to add:
 * - Intelligent retry logic with exponential backoff
 * - Dead Letter Queue (DLQ) for failed logs
 * - Fallback transport support
 * - Network-specific error handling
 * - Connection health monitoring
 * 
 * Network transports face unique challenges like connectivity issues,
 * rate limiting, and service outages. This class provides robust
 * handling for these scenarios while maintaining data integrity.
 * 
 * @abstract
 * @extends {BatchingTransport}
 * 
 * @example
 * ```typescript
 * class S3Transport extends NetworkTransport {
 *   protected async performNetworkRequest(data: any): Promise<void> {
 *     await s3Client.putObject({
 *       Bucket: this.bucket,
 *       Key: this.generateKey(),
 *       Body: data
 *     });
 *   }
 * }
 * ```
 */
export abstract class NetworkTransport extends BatchingTransport {
  /**
   * Retry configuration for failed requests.
   * @protected
   */
  protected readonly retryOptions: Required<RetryOptions>;

  /**
   * Dead Letter Queue configuration.
   * @protected
   */
  protected readonly dlqEnabled: boolean;
  protected readonly dlqPath?: string;
  protected readonly dlqMaxSize: number;
  protected readonly dlqMaxAge: number;

  /**
   * Fallback transport for when this transport fails.
   * @protected
   */
  protected fallbackTransport?: ITransport;
  protected readonly fallbackConfig?: string | ITransport | TransportOptions;

  /**
   * File manager for DLQ operations.
   * @protected
   */
  protected dlqFileManager?: FileManager;

  /**
   * Headers to include with all network requests.
   * @protected
   */
  protected readonly headers: Record<string, string>;

  /**
   * TLS/SSL configuration.
   * @protected
   */
  protected readonly tls?: NetworkTransportOptions['tls'];

  /**
   * Track consecutive failures for circuit breaker pattern.
   * @protected
   */
  protected consecutiveFailures = 0;
  protected circuitBreakerOpen = false;
  protected circuitBreakerOpenUntil = 0;

  /**
   * Maximum consecutive failures before opening circuit breaker.
   * @protected
   */
  protected readonly maxConsecutiveFailures = 5;

  /**
   * Circuit breaker cool-down period in milliseconds.
   * @protected
   */
  protected readonly circuitBreakerCooldown = 60000; // 1 minute

  /**
   * Creates a new NetworkTransport instance.
   * 
   * @param {NetworkTransportOptions} options - Configuration options
   */
  constructor(options: NetworkTransportOptions) {
    super(options);

    // Initialize retry options with defaults
    this.retryOptions = {
      maxRetries: options.retry?.maxRetries ?? 3,
      initialDelay: options.retry?.initialDelay ?? 1000,
      maxDelay: options.retry?.maxDelay ?? 30000,
      backoffFactor: options.retry?.backoffFactor ?? 2,
      jitter: options.retry?.jitter ?? true,
      retryCondition: options.retry?.retryCondition ?? this.defaultRetryCondition.bind(this),
    };

    // Initialize DLQ configuration
    this.dlqEnabled = options.dlq?.enabled ?? false;
    this.dlqPath = options.dlq?.filepath;
    this.dlqMaxSize = options.dlq?.maxSize ?? 10485760; // 10MB
    this.dlqMaxAge = options.dlq?.maxAge ?? 604800000; // 7 days

    // Store fallback configuration
    this.fallbackConfig = options.fallback;

    // Initialize headers
    this.headers = { ...options.headers };

    // Store TLS configuration
    this.tls = options.tls;

    // Validate configuration
    this.validateNetworkConfig();
  }

  /**
   * Validates network-specific configuration.
   * 
   * @throws {Error} If configuration is invalid
   * @private
   */
  private validateNetworkConfig(): void {
    if (this.retryOptions.maxRetries < 0) {
      throw new Error('maxRetries must be non-negative');
    }

    if (this.retryOptions.initialDelay < 0) {
      throw new Error('initialDelay must be non-negative');
    }

    if (this.retryOptions.backoffFactor < 1) {
      throw new Error('backoffFactor must be at least 1');
    }

    if (this.dlqEnabled && !this.dlqPath) {
      throw new Error('DLQ enabled but no filepath provided');
    }
  }

  /**
   * Initialize the transport and its dependencies.
   * 
   * @returns {Promise<void>} Resolves when initialization is complete
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Initialize DLQ if enabled
    if (this.dlqEnabled && this.dlqPath) {
      this.dlqFileManager = new FileManager(
        this.dlqPath.substring(0, this.dlqPath.lastIndexOf('/')),
        Math.floor(this.dlqMaxAge / 86400000) // Convert ms to days
      );
      await this.dlqFileManager.initLogFile();
    }

    // Initialize fallback transport if configured
    if (this.fallbackConfig) {
      await this.initializeFallbackTransport();
    }

    // Perform transport-specific initialization
    await this.initializeNetwork();
  }

  /**
   * Initialize the fallback transport.
   * 
   * @returns {Promise<void>} Resolves when fallback is initialized
   * @private
   */
  private async initializeFallbackTransport(): Promise<void> {
    if (typeof this.fallbackConfig === 'string') {
      // Handle built-in fallback types
      switch (this.fallbackConfig) {
        case 'file': {
          // Dynamic import to avoid circular dependencies
          const { FileTransport } = await import('./implementations/FileTransport');
          this.fallbackTransport = new FileTransport({
            name: `${this.name}-fallback`,
            enabled: true,
            filepath: `./logs/fallback-${this.name}.log`,
          });
          break;
        }

        case 'console': {
          const { ConsoleTransport } = await import('./implementations/ConsoleTransport');
          this.fallbackTransport = new ConsoleTransport({
            name: `${this.name}-fallback`,
            enabled: true,
          });
          break;
        }

        default:
          throw new Error(`Unknown fallback transport: ${this.fallbackConfig}`);
      }
    } else if (this.fallbackConfig && typeof this.fallbackConfig === 'object') {
      // Check if it's a Transport instance or TransportOptions
      if ('log' in this.fallbackConfig && 'close' in this.fallbackConfig) {
        // It's a Transport instance
        this.fallbackTransport = this.fallbackConfig as ITransport;
      } else {
        // It's TransportOptions - we need to create an appropriate transport
        throw new Error(`TransportOptions provided as fallback but automatic conversion not implemented. Please provide a Transport instance or string type.`);
      }
    }

    // Initialize the fallback transport
    if (this.fallbackTransport) {
      await this.fallbackTransport.init?.();
    }
  }

  /**
   * Send a batch of logs over the network.
   * 
   * Implements retry logic and circuit breaker pattern.
   * 
   * @param {unknown} data - Prepared batch data
   * @param {NetworkBatch} batch - Original batch object
   * @returns {Promise<void>} Resolves when batch is sent
   * @protected
   */
  protected async sendBatch(data: unknown, batch: NetworkBatch): Promise<void> {
    // Check circuit breaker
    if (this.isCircuitBreakerOpen()) {
      throw new Error('Circuit breaker is open - transport temporarily disabled');
    }

    let lastError: Error | undefined;
    let retryCount = 0;

    while (retryCount <= this.retryOptions.maxRetries) {
      try {
        // Attempt to send
        await this.performNetworkRequest(data, batch);

        // Success - reset failure tracking
        this.consecutiveFailures = 0;
        this.circuitBreakerOpen = false;

        return;
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry
        if (!this.shouldRetryError(error as Error, retryCount)) {
          break;
        }

        // Calculate retry delay
        const delay = this.calculateRetryDelay(retryCount);
        
        // Log retry attempt
        this.emit('retry', {
          transport: this.name,
          batch: batch.id,
          attempt: retryCount + 1,
          delay,
          error: lastError.message,
        });

        // Wait before retrying
        await this.sleep(delay);
        retryCount++;
      }
    }

    // All retries failed
    if (lastError) {
      this.handleNetworkFailure(lastError, batch);
      throw lastError;
    } else {
      const error = new Error('Network request failed with unknown error');
      this.handleNetworkFailure(error, batch);
      throw error;
    }
  }

  /**
   * Check if circuit breaker is currently open.
   * 
   * @returns {boolean} True if circuit breaker is open
   * @protected
   */
  protected isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreakerOpen) {
      return false;
    }

    // Check if cooldown period has passed
    if (Date.now() >= this.circuitBreakerOpenUntil) {
      this.circuitBreakerOpen = false;
      this.consecutiveFailures = 0;
      return false;
    }

    return true;
  }

  /**
   * Handle a network failure, potentially opening circuit breaker.
   * 
   * @param {Error} error - The error that occurred
   * @param {NetworkBatch} batch - The failed batch
   * @protected
   */
  protected handleNetworkFailure(error: Error, batch: NetworkBatch): void {
    // Increment failure count
    this.consecutiveFailures++;

    // Check if we should open circuit breaker
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      this.circuitBreakerOpen = true;
      this.circuitBreakerOpenUntil = Date.now() + this.circuitBreakerCooldown;
      
      this.emit('circuitBreakerOpen', {
        transport: this.name,
        failures: this.consecutiveFailures,
        until: new Date(this.circuitBreakerOpenUntil),
      });
    }

    // Write to DLQ if enabled
    if (this.dlqEnabled) {
      this.writeToDLQ(batch, error);
    }

    // Use fallback transport if available
    if (this.fallbackTransport && this.fallbackTransport.enabled) {
      this.sendToFallback(batch);
    }
  }

  /**
   * Determine if an error should trigger a retry.
   * 
   * @param {Error} error - The error to check
   * @param {number} retryCount - Current retry attempt
   * @returns {boolean} True if should retry
   * @protected
   */
  protected shouldRetryError(error: Error, retryCount: number): boolean {
    if (retryCount >= this.retryOptions.maxRetries) {
      return false;
    }

    return this.retryOptions.retryCondition(error);
  }

  /**
   * Default retry condition - retry on network errors and 5xx status codes.
   * 
   * @param {Error} error - The error to check
   * @returns {boolean} True if error is retryable
   * @protected
   */
  protected defaultRetryCondition(error: Error): boolean {
    // Network errors
    if (error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ENETUNREACH')) {
      return true;
    }

    // HTTP status codes (if error includes status)
    const statusMatch = error.message.match(/status[:\s]+(\d+)/i);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      // Retry on 5xx errors and specific 4xx errors
      return status >= 500 || status === 429 || status === 408;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter.
   * 
   * @param {number} retryCount - Current retry attempt (0-based)
   * @returns {number} Delay in milliseconds
   * @protected
   */
  protected calculateRetryDelay(retryCount: number): number {
    // Exponential backoff
    let delay = this.retryOptions.initialDelay * 
                Math.pow(this.retryOptions.backoffFactor, retryCount);

    // Cap at maximum delay
    delay = Math.min(delay, this.retryOptions.maxDelay);

    // Add jitter if enabled
    if (this.retryOptions.jitter) {
      // Random jitter between 0-25% of delay
      const jitter = delay * 0.25 * Math.random();
      delay = delay + jitter;
    }

    return Math.floor(delay);
  }

  /**
   * Write failed batch to Dead Letter Queue.
   * 
   * @param {NetworkBatch} batch - The failed batch
   * @param {Error} error - The error that caused the failure
   * @protected
   */
  protected writeToDLQ(batch: NetworkBatch, error: Error): void {
    if (!this.dlqFileManager) {
      return;
    }

    try {
      const dlqEntry = {
        timestamp: new Date().toISOString(),
        transport: this.name,
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as Error & { code?: string | number }).code,
        },
        batch: {
          id: batch.id,
          entryCount: batch.entries.length,
          sizeBytes: batch.sizeBytes,
          retryCount: batch.retryCount,
          createdAt: new Date(batch.createdAt).toISOString(),
        },
        entries: batch.entries,
      };

      this.dlqFileManager.appendToFile(JSON.stringify(dlqEntry));
    } catch (dlqError) {
      // Log but don't throw - DLQ failure shouldn't break transport
      this.handleError(new Error(`DLQ write failed: ${dlqError}`));
    }
  }

  /**
   * Send failed batch to fallback transport.
   * 
   * @param {NetworkBatch} batch - The failed batch
   * @protected
   */
  protected async sendToFallback(batch: NetworkBatch): Promise<void> {
    if (!this.fallbackTransport) {
      return;
    }

    try {
      // Send each entry to fallback
      if (this.fallbackTransport) {
        await Promise.all(
          batch.entries.map(entry => this.fallbackTransport?.log(entry))
        );

        this.emit('fallback', {
          transport: this.name,
          fallback: this.fallbackTransport.name,
          count: batch.entries.length,
        });
      }
    } catch (fallbackError) {
      // Log but don't throw - fallback failure shouldn't break transport
      this.handleError(new Error(`Fallback transport failed: ${fallbackError}`));
    }
  }

  /**
   * Sleep for specified milliseconds.
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} Resolves after delay
   * @protected
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build headers for network request.
   * 
   * Combines configured headers with dynamic headers.
   * 
   * @returns {Promise<Record<string, string>>} Headers object
   * @protected
   */
  protected async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...this.headers,
      'User-Agent': `MagicLogger/${this.constructor.name}`,
      'X-Transport-Name': this.name,
    };

    return headers;
  }

  /**
   * Get transport statistics with network-specific metrics.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    // Add network-specific stats
    stats.custom = {
      ...stats.custom,
      consecutiveFailures: this.consecutiveFailures,
      circuitBreakerOpen: this.circuitBreakerOpen,
      dlqEnabled: this.dlqEnabled,
      fallbackEnabled: !!this.fallbackTransport,
    };

    return stats;
  }

  /**
   * Close the transport and clean up resources.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Close parent resources
    await super.doClose();

    // Close fallback transport
    if (this.fallbackTransport) {
      await this.fallbackTransport.close();
    }

    // Clean up DLQ
    if (this.dlqFileManager) {
      // Just ensure any pending writes are flushed
      // Don't delete files as they may be needed for recovery
    }

    // Clean up network resources
    await this.closeNetwork();
  }

  /**
   * Abstract method for transport-specific network initialization.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   * @abstract
   */
  protected abstract initializeNetwork(): Promise<void>;

  /**
   * Abstract method for performing the actual network request.
   * 
   * @param {unknown} data - The data to send
   * @param {NetworkBatch} batch - The batch being sent
   * @returns {Promise<void>} Resolves when request succeeds
   * @protected
   * @abstract
   */
  protected abstract performNetworkRequest(data: unknown, batch: NetworkBatch): Promise<void>;

  /**
   * Abstract method for transport-specific cleanup.
   * 
   * @returns {Promise<void>} Resolves when cleaned up
   * @protected
   * @abstract
   */
  protected abstract closeNetwork(): Promise<void>;
}