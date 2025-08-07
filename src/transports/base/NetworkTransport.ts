// File: src/transports/base/NetworkTransport.ts

/**
 * Abstract base class for network-based transports.
 * 
 * This module extends BatchingTransport and provides additional functionality
 * specific to network operations such as connection management, health checking,
 * retries with exponential backoff, and offline queue management.
 * 
 * @module transports/base
 */

import { BatchingTransport } from './BatchingTransport';
import type {
  NetworkTransportOptions,
  LogEntry,
  ConnectionState,
  TransportStats,
  RetryOptions,
  BatchingTransportOptions,
  Transport,
} from '../../types/transport';
import type { EventEmitter } from 'events';

/**
 * Extended options for network transports.
 * 
 * @interface NetworkTransportOptionsExtended
 * @extends {BatchingTransportOptions}
 * @extends {NetworkTransportOptions}
 */
interface NetworkTransportOptionsExtended extends BatchingTransportOptions, NetworkTransportOptions {}

/**
 * Network transport base class for sending logs over network protocols.
 * 
 * Features:
 * - Automatic connection management with reconnection
 * - Health checking and circuit breaker pattern
 * - Offline queue with configurable limits
 * - Retry logic with exponential backoff
 * - Connection pooling support
 * - TLS/SSL configuration
 * - Request/response transformation
 * 
 * @abstract
 * @class NetworkTransport
 * @extends {BatchingTransport}
 * 
 * @example
 * ```typescript
 * class MyNetworkTransport extends NetworkTransport {
 *   protected async connect(): Promise<void> {
 *     this.client = await createConnection(this.url);
 *   }
 *   
 *   protected async sendData(data: unknown): Promise<void> {
 *     await this.client.send(data);
 *   }
 * }
 * ```
 */
export abstract class NetworkTransport extends BatchingTransport {
  /**
   * Network endpoint URL.
   * @protected
   */
  protected url?: string;

  /**
   * Connection timeout in milliseconds.
   * @protected
   */
  protected readonly connectionTimeout: number;

  /**
   * Request timeout in milliseconds.
   * @protected
   */
  protected readonly requestTimeout: number;

  /**
   * Maximum reconnection attempts.
   * @protected
   */
  protected readonly maxReconnectAttempts: number;

  /**
   * Delay between reconnection attempts.
   * @protected
   */
  protected readonly reconnectDelay: number;

  /**
   * Whether to use exponential backoff for reconnects.
   * @protected
   */
  protected readonly reconnectBackoff: boolean;

  /**
   * Maximum offline queue size.
   * @protected
   */
  protected readonly maxOfflineQueueSize: number;

  /**
   * Whether to queue logs when offline.
   * @protected
   */
  protected readonly queueWhenOffline: boolean;

  /**
   * Health check interval in milliseconds.
   * @protected
   */
  protected readonly healthCheckInterval: number;

  /**
   * Keep-alive interval in milliseconds.
   * @protected
   */
  protected readonly keepAliveInterval?: number;

  /**
   * Custom headers for requests.
   * @protected
   */
  protected readonly headers?: Record<string, string>;

  /**
   * TLS/SSL configuration.
   * @protected
   */
  protected readonly tls?: NetworkTransportOptions['tls'];

  /**
   * Circuit breaker configuration.
   * @protected
   */
  protected readonly circuitBreaker?: NetworkTransportOptions['circuitBreaker'];

  /**
   * Retry options.
   * @protected
   */
  protected readonly retry: RetryOptions;

  /**
   * Dead letter queue configuration.
   * @protected
   */
  protected readonly dlq?: NetworkTransportOptions['dlq'];

  /**
   * Fallback transport configuration.
   * @protected
   */
  protected readonly fallbackConfig?: string | Transport;

  /**
   * Current connection state.
   * @protected
   */
  protected connectionState: ConnectionState = 'disconnected';

  /**
   * Offline queue for storing logs when disconnected.
   * @protected
   */
  protected offlineQueue: LogEntry[] = [];

  /**
   * Current reconnection attempt count.
   * @protected
   */
  protected reconnectAttempts = 0;

  /**
   * Health check timer.
   * @protected
   */
  protected healthCheckTimer?: NodeJS.Timeout;

  /**
   * Keep-alive timer.
   * @protected
   */
  protected keepAliveTimer?: NodeJS.Timeout;

  /**
   * Connection retry timer.
   * @protected
   */
  protected reconnectTimer?: NodeJS.Timeout;

  /**
   * Circuit breaker state.
   * @protected
   */
  protected circuitBreakerState: {
    isOpen: boolean;
    failures: number;
    lastFailureTime?: number;
    nextRetryTime?: number;
  } = {
    isOpen: false,
    failures: 0,
  };

  /**
   * Dead letter queue file manager.
   * @protected
   */
  protected dlqFileManager?: unknown;

  /**
   * Fallback transport instance.
   * @protected
   */
  protected fallbackTransport?: Transport;

  /**
   * Consecutive failure count.
   * @protected
   */
  protected consecutiveFailures = 0;

  /**
   * Circuit breaker open state.
   * @protected
   */
  protected circuitBreakerOpen = false;

  /**
   * Circuit breaker open until timestamp.
   * @protected
   */
  protected circuitBreakerOpenUntil = 0;

  /**
   * Creates a new NetworkTransport instance.
   * 
   * @param {NetworkTransportOptionsExtended} options - Transport configuration
   */
  constructor(options: NetworkTransportOptionsExtended) {
    super(options);

    this.url = options.url;
    this.connectionTimeout = options.connectionTimeout || 30000;
    this.requestTimeout = options.requestTimeout || 30000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.reconnectBackoff = options.reconnectBackoff ?? true;
    this.maxOfflineQueueSize = options.maxOfflineQueueSize || 1000;
    this.queueWhenOffline = options.queueWhenOffline ?? true;
    this.healthCheckInterval = options.healthCheckInterval || 60000;
    this.keepAliveInterval = options.keepAliveInterval;
    this.headers = options.headers;
    this.tls = options.tls;
    this.circuitBreaker = options.circuitBreaker;
    this.dlq = options.dlq;
    this.fallbackConfig = options.fallback;
    
    // Initialize retry options
    this.retry = {
      maxRetries: options.retry?.maxRetries ?? 3,
      initialDelay: options.retry?.initialDelay ?? 1000,
      maxDelay: options.retry?.maxDelay ?? 30000,
      backoffFactor: options.retry?.backoffFactor ?? 2,
      jitter: options.retry?.jitter ?? false,
      retryCondition: options.retry?.retryCondition,
    };

    // Validate options
    if ((this.retry.maxRetries ?? 0) < 0) {
      throw new Error('maxRetries must be non-negative');
    }
    if ((this.retry.initialDelay ?? 0) < 0) {
      throw new Error('initialDelay must be non-negative');
    }
    if ((this.retry.backoffFactor ?? 1) < 1) {
      throw new Error('backoffFactor must be at least 1');
    }
    if (this.dlq?.enabled && !this.dlq.filepath) {
      throw new Error('DLQ enabled but no filepath provided');
    }
  }

  /**
   * Initialize the network transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    await this.initializeNetwork();
    
    // Initialize DLQ if enabled
    if (this.dlq?.enabled) {
      await this.initializeDLQ();
    }
    
    // Initialize fallback transport
    if (this.fallbackConfig) {
      await this.initializeFallback();
    }
    
    await this.establishConnection();
    this.startHealthChecking();
    this.startKeepAlive();
  }

  /**
   * Initialize network-specific resources.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async initializeNetwork(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Initialize dead letter queue.
   * 
   * @returns {Promise<void>} Resolves when DLQ is initialized
   * @private
   */
  private async initializeDLQ(): Promise<void> {
    if (!this.dlq?.enabled || !this.dlq.filepath) return;
    
    const { FileManager } = await import('../../core/FileManager');
    const path = await import('path');
    
    const dir = path.dirname(this.dlq.filepath);
    this.dlqFileManager = new FileManager(dir, 7); // 7 days retention
    await (this.dlqFileManager as { initLogFile(filepath: string): Promise<void> }).initLogFile(this.dlq.filepath);
  }

  /**
   * Initialize fallback transport.
   * 
   * @returns {Promise<void>} Resolves when fallback is initialized
   * @private
   */
  private async initializeFallback(): Promise<void> {
    if (!this.fallbackConfig) return;
    
    if (typeof this.fallbackConfig === 'string') {
      switch (this.fallbackConfig) {
        case 'file': {
          const { FileTransport } = await import('./implementations/FileTransport');
          this.fallbackTransport = new FileTransport({
            name: `${this.name}-fallback`,
            filepath: './logs/fallback.log',
            isDirectory: false,
          });
          break;
        }
        case 'console': {
          const { ConsoleTransport } = await import('./implementations/ConsoleTransport');
          this.fallbackTransport = new ConsoleTransport({
            name: `${this.name}-fallback`,
          });
          break;
        }
        default:
          throw new Error(`Unknown fallback transport: ${this.fallbackConfig}`);
      }
      
      if (this.fallbackTransport.init) {
        await this.fallbackTransport.init();
      }
    } else {
      this.fallbackTransport = this.fallbackConfig;
      if (this.fallbackTransport.init) {
        await this.fallbackTransport.init();
      }
    }
  }

  /**
   * Establish network connection with retry logic.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @private
   */
  private async establishConnection(): Promise<void> {
    if (this.connectionState === 'connected') {
      return;
    }

    this.connectionState = 'connecting';

    try {
      await this.withTimeout(this.connect(), this.connectionTimeout);
      
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      
      this.emitExtended('connected');
      
      // Process offline queue if any
      await this.processOfflineQueue();
      
    } catch (error) {
      this.connectionState = 'disconnected';
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  /**
   * Handle connection errors and trigger reconnection.
   * 
   * @param {Error} error - Connection error
   * @private
   */
  private handleConnectionError(error: Error): void {
    this.emitExtended('connectionError', error);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.emitExtended('connectionFailed', {
        attempts: this.reconnectAttempts,
        error,
      });
    }
  }

  /**
   * Schedule a reconnection attempt.
   * 
   * @private
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.connectionState === 'connected') {
      return;
    }

    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;

    let delay = this.reconnectDelay;
    
    if (this.reconnectBackoff) {
      // Exponential backoff with jitter
      delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        60000 // Max 1 minute
      );
      
      // Add jitter (±25%)
      delay = delay * (0.75 + Math.random() * 0.5);
    }

    this.emitExtended('reconnecting', {
      attempt: this.reconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = undefined;
      
      try {
        await this.establishConnection();
      } catch (error) {
        // Connection will handle its own retry
      }
    }, delay);
  }

  /**
   * Process queued logs after reconnection.
   * 
   * @returns {Promise<void>} Resolves when queue is processed
   * @private
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) {
      return;
    }

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    this.emitExtended('processingOfflineQueue', {
      count: queue.length,
    });

    try {
      // Process in batches
      const batchSize = this.maxBatchSize;
      for (let i = 0; i < queue.length; i += batchSize) {
        const batch = queue.slice(i, i + batchSize);
        await this.sendBatch(batch);
      }

      this.emitExtended('offlineQueueProcessed', {
        count: queue.length,
      });
    } catch (error) {
      // Re-queue failed entries
      this.offlineQueue = [...queue, ...this.offlineQueue].slice(0, this.maxOfflineQueueSize);
      throw error;
    }
  }

  /**
   * Start health checking.
   * 
   * @private
   */
  private startHealthChecking(): void {
    if (!this.healthCheckInterval || this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      if (this.connectionState !== 'connected') {
        return;
      }

      try {
        await this.withTimeout(this.checkHealth(), 10000);
        this.emitExtended('healthCheckPassed');
      } catch (error) {
        this.emitExtended('healthCheckFailed', error);
        
        // Trigger reconnection if health check fails
        this.connectionState = 'disconnected';
        await this.disconnect();
        this.scheduleReconnect();
      }
    }, this.healthCheckInterval);
  }

  /**
   * Start keep-alive mechanism.
   * 
   * @private
   */
  private startKeepAlive(): void {
    if (!this.keepAliveInterval || this.keepAliveTimer) {
      return;
    }

    this.keepAliveTimer = setInterval(async () => {
      if (this.connectionState !== 'connected') {
        return;
      }

      try {
        await this.sendKeepAlive();
      } catch (error) {
        // Keep-alive failures are non-critical
        this.emitExtended('keepAliveFailed', error);
      }
    }, this.keepAliveInterval);
  }

  /**
   * Send keep-alive signal.
   * 
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendKeepAlive(): Promise<void> {
    // Override in subclasses that need keep-alive
  }

  /**
   * Send a batch of log entries over the network.
   * 
   * @param {unknown} data - Data to send
   * @param {unknown} [batch] - Optional batch metadata
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendBatch(data: unknown, batch?: unknown): Promise<void> {
    // Check circuit breaker
    if (this.isCircuitBreakerOpen()) {
      throw new Error('Circuit breaker is open');
    }

    // Check connection
    if (this.connectionState !== 'connected') {
      if (this.queueWhenOffline && Array.isArray(data)) {
        this.queueOffline(data as LogEntry[]);
        return;
      }
      throw new Error('Not connected');
    }

    let retryCount = 0;
    let lastError: Error | undefined;

    while (retryCount <= (this.retry.maxRetries ?? 3)) {
      try {
        // Perform the actual network request
        await this.withTimeout(
          this.performNetworkRequest(data, batch),
          this.requestTimeout
        );

        // Reset circuit breaker on success
        this.consecutiveFailures = 0;
        this.circuitBreakerState.failures = 0;
        this.circuitBreakerState.isOpen = false;

        return;

      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry
        if (this.shouldRetryError(lastError, retryCount)) {
          retryCount++;
          
          this.emitExtended('retry', {
            transport: this.name,
            batch: (batch as { id?: string })?.id || 'unknown',
            attempt: retryCount,
            delay: this.calculateRetryDelay(retryCount),
            error: lastError.message,
          });
          
          await this.sleepMs(this.calculateRetryDelay(retryCount));
        } else {
          break;
        }
      }
    }

    // All retries failed
    this.handleNetworkFailure(lastError as Error, batch);
    throw lastError;
  }

  /**
   * Check if circuit breaker is open.
   * 
   * @returns {boolean} True if circuit breaker is open
   * @protected
   */
  protected isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreaker?.enabled) {
      return false;
    }

    if (this.circuitBreakerOpen && Date.now() < this.circuitBreakerOpenUntil) {
      return true;
    }

    // Reset if cooldown period has passed
    if (this.circuitBreakerOpen && Date.now() >= this.circuitBreakerOpenUntil) {
      this.circuitBreakerOpen = false;
      this.consecutiveFailures = 0;
    }

    return false;
  }

  /**
   * Handle network failure.
   * 
   * @param {Error} error - The error
   * @param {unknown} [batch] - The batch that failed
   * @protected
   */
  protected handleNetworkFailure(error: Error, batch?: unknown): void {
    this.consecutiveFailures++;
    
    // Update circuit breaker
    if (this.circuitBreaker?.enabled && 
        this.consecutiveFailures >= (this.circuitBreaker.errorThreshold || 5)) {
      this.circuitBreakerOpen = true;
      this.circuitBreakerOpenUntil = Date.now() + (this.circuitBreaker.resetTimeout || 60000);
      
      this.emitExtended('circuitBreakerOpen', {
        transport: this.name,
        failures: this.consecutiveFailures,
        until: new Date(this.circuitBreakerOpenUntil),
      });
    }
    
    // Write to DLQ
    if (batch) {
      this.writeToDLQ(batch, error);
    }
    
    // Send to fallback
    if (batch) {
      this.sendToFallback(batch).catch(() => {
        // Fallback failed, already logged
      });
    }
  }

  /**
   * Write batch to dead letter queue.
   * 
   * @param {unknown} batch - The failed batch
   * @param {Error} error - The error
   * @protected
   */
  protected writeToDLQ(batch: unknown, error: Error): void {
    if (!this.dlq?.enabled || !this.dlqFileManager) return;
    
    try {
      const dlqEntry = {
        timestamp: new Date().toISOString(),
        transport: this.name,
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as Error & { code?: string }).code,
        },
        batch: (batch as { id?: string })?.id,
        entries: (batch as { entries?: unknown[] })?.entries || [],
      };
      
      (this.dlqFileManager as { appendToFile(content: string): void }).appendToFile(JSON.stringify(dlqEntry) + '\n');
    } catch (dlqError) {
      this.handleError(new Error(`DLQ write failed: ${dlqError}`));
    }
  }

  /**
   * Send batch to fallback transport.
   * 
   * @param {unknown} batch - The batch to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   */
  protected async sendToFallback(batch: unknown): Promise<void> {
    if (!this.fallbackTransport || !this.fallbackTransport.enabled) return;
    
    try {
      const entries = (batch as { entries?: LogEntry[] })?.entries || [];
      
      for (const entry of entries) {
        await this.fallbackTransport.log(entry);
      }
      
      this.emitExtended('fallback', {
        transport: this.name,
        fallback: this.fallbackTransport.name,
        count: entries.length,
      });
    } catch (error) {
      this.handleError(new Error(`Fallback transport failed: ${error}`));
    }
  }

  /**
   * Queue entries for offline processing.
   * 
   * @param {LogEntry[]} entries - Entries to queue
   * @private
   */
  private queueOffline(entries: LogEntry[]): void {
    const availableSpace = this.maxOfflineQueueSize - this.offlineQueue.length;
    
    if (availableSpace <= 0) {
      this.emitExtended('offlineQueueFull', {
        dropped: entries.length,
      });
      return;
    }

    const toQueue = entries.slice(0, availableSpace);
    this.offlineQueue.push(...toQueue);

    if (toQueue.length < entries.length) {
      this.emitExtended('offlineQueueOverflow', {
        queued: toQueue.length,
        dropped: entries.length - toQueue.length,
      });
    }

    this.stats.queued = this.offlineQueue.length;
  }

  /**
   * Check if error is retryable.
   * 
   * @param {Error} error - Error to check
   * @param {number} retryCount - Current retry count
   * @returns {boolean} True if retryable
   * @protected
   */
  protected shouldRetryError(error: Error, retryCount: number): boolean {
    if (retryCount >= (this.retry.maxRetries ?? 3)) {
      return false;
    }
    
    // Check custom retry condition
    if (this.retry.retryCondition) {
      return this.retry.retryCondition(error);
    }

    return this.defaultRetryCondition(error);
  }

  /**
   * Default retry condition.
   * 
   * @param {Error} error - Error to check
   * @returns {boolean} True if retryable
   * @protected
   */
  protected defaultRetryCondition(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Retry on connection errors
    if (this.isConnectionError(error)) {
      return true;
    }

    // Retry on timeout
    if (message.includes('timeout')) {
      return true;
    }

    // Retry on specific HTTP status codes
    const statusMatch = message.match(/status[:\s]+(\d+)/i);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return status >= 500 || status === 429 || status === 408;
    }

    return false;
  }

  /**
   * Check if error is a connection error.
   * 
   * @param {Error} error - Error to check
   * @returns {boolean} True if connection error
   * @protected
   */
  protected isConnectionError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    return (
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('etimedout') ||
      message.includes('econnreset') ||
      message.includes('epipe') ||
      message.includes('enetunreach')
    );
  }

  /**
   * Calculate retry delay with exponential backoff.
   * 
   * @param {number} retryCount - Current retry count
   * @returns {number} Delay in milliseconds
   * @protected
   */
  protected calculateRetryDelay(retryCount: number): number {
    const initialDelay = this.retry.initialDelay ?? 1000;
    const backoffFactor = this.retry.backoffFactor ?? 2;
    const maxDelay = this.retry.maxDelay ?? 30000;
    
    let delay = initialDelay * Math.pow(backoffFactor, retryCount - 1);
    
    // Cap at max delay
    delay = Math.min(delay, maxDelay);
    
    // Add jitter if enabled
    if (this.retry.jitter) {
      const jitter = delay * 0.25;
      delay = delay + (Math.random() * 2 - 1) * jitter;
    }
    
    return Math.round(delay);
  }

  /**
   * Build request headers.
   * 
   * @returns {Promise<Record<string, string>>} Headers object
   * @protected
   */
  protected async buildHeaders(): Promise<Record<string, string>> {
    return {
      'User-Agent': `MagicLogger/${this.constructor.name}`,
      'X-Transport-Name': this.name,
      ...this.headers,
    };
  }

  /**
   * Sleep for specified duration.
   * 
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>} Resolves after delay
   * @protected
   */
  protected sleepMs(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close network transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Stop timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = undefined;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Close connection
    if (this.connectionState === 'connected') {
      this.connectionState = 'closing';
      await this.disconnect();
    }

    // Clear offline queue
    this.offlineQueue = [];

    // Close fallback transport
    if (this.fallbackTransport) {
      await this.fallbackTransport.close();
    }

    // Call parent close
    await super.doClose();
    
    // Close network-specific resources
    await this.closeNetwork();
  }

  /**
   * Close network-specific resources.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async closeNetwork(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Get transport statistics including network-specific stats.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();
    
    return {
      ...stats,
      custom: {
        ...stats.custom,
        connectionState: this.connectionState,
        reconnectAttempts: this.reconnectAttempts,
        offlineQueueSize: this.offlineQueue.length,
        circuitBreaker: {
          isOpen: this.circuitBreakerState.isOpen,
          failures: this.circuitBreakerState.failures,
        },
        consecutiveFailures: this.consecutiveFailures,
        circuitBreakerOpen: this.circuitBreakerOpen,
        dlqEnabled: this.dlq?.enabled || false,
        fallbackEnabled: !!this.fallbackTransport,
      },
    };
  }

  /**
   * Check if transport is healthy.
   * 
   * @returns {Promise<boolean>} True if healthy
   */
  public async isHealthy(): Promise<boolean> {
    if (!await super.isHealthy()) {
      return false;
    }

    return this.connectionState === 'connected' && !this.isCircuitBreakerOpen();
  }

  /**
   * Force reconnection.
   * 
   * @returns {Promise<void>} Resolves when reconnected
   */
  public async reconnect(): Promise<void> {
    if (this.connectionState === 'connected') {
      await this.disconnect();
    }

    this.reconnectAttempts = 0;
    await this.establishConnection();
  }

  /**
   * Emit extended events that may not be in base TransportEvents.
   * 
   * @param {string} event - Event name
   * @param {...unknown[]} args - Event arguments
   * @protected
   */
  protected emitExtended(event: string, ...args: unknown[]): void {
    // Emit extended events using inherited EventEmitter functionality
    // Cast to EventEmitter to bypass transport event restrictions
    (this as EventEmitter).emit(event, ...args);
  }

  /**
   * Abstract method to establish connection.
   * 
   * @returns {Promise<void>} Resolves when connected
   * @protected
   * @abstract
   */
  protected abstract connect(): Promise<void>;

  /**
   * Abstract method to close connection.
   * 
   * @returns {Promise<void>} Resolves when disconnected
   * @protected
   * @abstract
   */
  protected abstract disconnect(): Promise<void>;

  /**
   * Abstract method to send data over the network.
   * 
   * @param {unknown} data - Data to send
   * @returns {Promise<void>} Resolves when sent
   * @protected
   * @abstract
   */
  protected abstract sendData(data: unknown): Promise<void>;

  /**
   * Abstract method to check connection health.
   * 
   * @returns {Promise<void>} Resolves if healthy, rejects if not
   * @protected
   * @abstract
   */
  protected abstract checkHealth(): Promise<void>;

  /**
   * Abstract method to perform the actual network request.
   * 
   * @param {unknown} data - Data to send
   * @param {unknown} [batch] - Optional batch metadata
   * @returns {Promise<void>} Resolves when sent
   * @protected
   * @abstract
   */
  protected abstract performNetworkRequest(data: unknown, batch?: unknown): Promise<void>;
}