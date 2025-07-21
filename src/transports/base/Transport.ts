// File: src/transports/base/Transport.ts

import { EventEmitter } from 'events';
import type {
  Transport as ITransport,
  TransportOptions,
  TransportStats,
  LogEntry,
  LogLevel,
} from '../../types/transport';

/**
 * Abstract base class for all MagicLogger transports.
 * 
 * This class provides the foundational functionality that all transports share:
 * - Event emission for lifecycle management
 * - Filtering logic based on levels, tags, and custom filters
 * - Statistics tracking for monitoring
 * - Error handling and silent mode support
 * - Lifecycle methods for initialization and cleanup
 * 
 * Concrete transport implementations should extend this class and implement
 * the abstract methods for their specific transport mechanism.
 * 
 * @abstract
 * @class Transport
 * @extends {EventEmitter}
 * @implements {ITransport}
 * 
 * @example
 * ```typescript
 * class ConsoleTransport extends Transport {
 *   protected async doInit(): Promise<void> {
 *     // Initialize console-specific resources
 *   }
 *   
 *   protected async doLog(entry: LogEntry): Promise<void> {
 *     console.log(this.formatEntry(entry));
 *   }
 *   
 *   protected async doClose(): Promise<void> {
 *     // Clean up console-specific resources
 *   }
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Using transports with filtering
 * const errorTransport = new FileTransport({
 *   name: 'error-logs',
 *   filepath: './logs/errors.log',
 *   level: 'error', // Only log errors and above
 * });
 * 
 * const taggedTransport = new ConsoleTransport({
 *   name: 'api-console',
 *   tags: ['api', 'http'], // Only log entries with these tags
 *   filter: (entry) => !entry.message.includes('health-check'), // Custom filter
 * });
 * ```
 */
export abstract class Transport extends EventEmitter implements ITransport {
  /**
   * Unique identifier for this transport instance.
   * Used for managing multiple transports and debugging.
   */
  public readonly name: string;

  /**
   * Whether this transport is currently active and processing logs.
   * Can be toggled at runtime to enable/disable specific transports.
   */
  public enabled: boolean;

  /**
   * Transport configuration options.
   * @protected
   */
  protected readonly options: TransportOptions;

  /**
   * Statistics tracking for this transport.
   * @protected
   */
  protected stats: TransportStats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    queued: 0,
    lastSuccess: undefined,
    lastError: undefined,
    custom: {},
  };

  /**
   * Minimum log level for this transport.
   * @protected
   */
  protected readonly level: LogLevel;

  /**
   * Specific levels this transport handles (if specified).
   * @protected
   */
  protected readonly levels?: LogLevel[];

  /**
   * Tags that must be present for logs to be processed.
   * @protected
   */
  protected readonly tags?: string[];

  /**
   * Tags that exclude logs from being processed.
   * @protected
   */
  protected readonly excludeTags?: string[];

  /**
   * Custom filter function for advanced filtering.
   * @protected
   */
  protected readonly filter?: (entry: LogEntry) => boolean;

  /**
   * Whether to suppress errors from this transport.
   * @protected
   */
  protected readonly silent: boolean;

  /**
   * Operation timeout in milliseconds.
   * @protected
   */
  protected readonly timeout: number;

  /**
   * Output format for this transport.
   * @protected
   */
  protected readonly format: 'json' | 'plain' | 'custom';

  /**
   * Custom formatter function.
   * @protected
   */
  protected readonly formatter?: (entry: LogEntry) => string | Buffer;

  /**
   * Flag to track if transport has been initialized.
   * @protected
   */
  protected initialized = false;

  /**
   * Flag to track if transport is currently closing.
   * @protected
   */
  protected closing = false;

  /**
   * Creates a new Transport instance.
   * 
   * @param {TransportOptions} options - Configuration options for the transport
   * @throws {Error} If required options are missing or invalid
   * 
   * @example
   * ```typescript
   * const transport = new MyTransport({
   *   name: 'my-transport',
   *   level: 'info',
   *   format: 'json',
   *   silent: false,
   *   timeout: 30000,
   *   filter: (entry) => !entry.tags?.includes('internal'),
   * });
   * ```
   */
  constructor(options: TransportOptions) {
    super();
    
    // Validate required options
    if (!options.name) {
      throw new Error('Transport name is required');
    }

    this.name = options.name;
    this.options = options;
    this.enabled = options.enabled !== false;
    this.level = options.level || 'info';
    this.levels = options.levels;
    this.tags = options.tags;
    this.excludeTags = options.excludeTags;
    this.filter = options.filter;
    this.silent = options.silent !== false;
    this.timeout = options.timeout || 30000;
    this.format = options.format || 'json';
    this.formatter = options.formatter;

    // Set max listeners to prevent warnings for transports with many listeners
    this.setMaxListeners(20);
  }

  /**
   * Initialize the transport.
   * 
   * This method is called when the transport is added to a logger.
   * Subclasses should override doInit() to perform any necessary setup.
   * 
   * @returns {Promise<void>} Resolves when initialization is complete
   * @throws {Error} If initialization fails
   * 
   * @example
   * ```typescript
   * await transport.init();
   * // Transport is now ready to receive logs
   * ```
   */
  public async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.doInit();
      this.initialized = true;
      this.emit('ready');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Log a single entry.
   * 
   * This method handles filtering, formatting, and error handling,
   * then delegates to the concrete implementation via doLog().
   * 
   * @param {LogEntry} entry - The log entry to process
   * @returns {Promise<void>} Resolves when the log has been processed
   * 
   * @example
   * ```typescript
   * await transport.log({
   *   id: '123',
   *   timestamp: new Date().toISOString(),
   *   timestampMs: Date.now(),
   *   level: 'info',
   *   message: 'User logged in',
   *   tags: ['auth', 'user'],
   *   context: { userId: 'user123' },
   * });
   * ```
   */
  public async log(entry: LogEntry): Promise<void> {
    if (!this.enabled || this.closing) {
      return;
    }

    // Check if this transport should handle this log
    if (!this.shouldLog(entry)) {
      return;
    }

    this.stats.processed++;

    try {
      // Apply timeout to the log operation
      await this.withTimeout(this.doLog(entry), this.timeout);
      
      this.stats.succeeded++;
      this.stats.lastSuccess = new Date();
      this.emit('logged', entry);
    } catch (error) {
      this.stats.failed++;
      this.handleError(error as Error, entry);
    }
  }

  /**
   * Log multiple entries at once.
   * 
   * Default implementation logs each entry individually.
   * Subclasses can override for more efficient batch processing.
   * 
   * @param {LogEntry[]} entries - Array of log entries to process
   * @returns {Promise<void>} Resolves when all logs have been processed
   * 
   * @example
   * ```typescript
   * await transport.logBatch([
   *   { id: '1', level: 'info', message: 'First log', ... },
   *   { id: '2', level: 'warn', message: 'Second log', ... },
   *   { id: '3', level: 'error', message: 'Third log', ... },
   * ]);
   * ```
   */
  public async logBatch(entries: LogEntry[]): Promise<void> {
    if (!this.enabled || this.closing) {
      return;
    }

    // Filter entries that this transport should handle
    const validEntries = entries.filter(entry => this.shouldLog(entry));
    
    if (validEntries.length === 0) {
      return;
    }

    this.stats.processed += validEntries.length;

    try {
      // Check if subclass implements batch logging
      if (this.doLogBatch) {
        await this.withTimeout(this.doLogBatch(validEntries), this.timeout);
        this.stats.succeeded += validEntries.length;
      } else {
        // Fall back to individual logging
        const results = await Promise.allSettled(
          validEntries.map(entry => this.doLog(entry))
        );
        
        // Count successes and failures
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            this.stats.succeeded++;
          } else {
            this.stats.failed++;
            this.handleError(result.reason, validEntries[index]);
          }
        });
      }

      this.stats.lastSuccess = new Date();
      this.emit('batch', validEntries, validEntries.length);
    } catch (error) {
      this.stats.failed += validEntries.length;
      this.handleError(error as Error);
    }
  }

  /**
   * Check if this transport should handle a given log entry.
   * 
   * Applies all configured filters:
   * 1. Level filtering
   * 2. Tag inclusion/exclusion
   * 3. Custom filter function
   * 
   * @param {LogEntry} entry - The log entry to check
   * @returns {boolean} True if the entry should be logged by this transport
   * 
   * @example
   * ```typescript
   * const transport = new FileTransport({
   *   name: 'errors',
   *   level: 'error',
   *   tags: ['important'],
   *   excludeTags: ['test'],
   *   filter: (entry) => entry.context?.production === true,
   * });
   * 
   * // This will return true only for:
   * // - Logs with level 'error' or higher
   * // - Logs tagged with 'important'
   * // - Logs NOT tagged with 'test'
   * // - Logs with context.production === true
   * ```
   */
  public shouldLog(entry: LogEntry): boolean {
    // Check if specific levels are configured
    if (this.levels && this.levels.length > 0) {
      if (!this.levels.includes(entry.level)) {
        return false;
      }
    } else {
      // Check minimum level
      if (!this.isLevelEnabled(entry.level)) {
        return false;
      }
    }

    // Check tag inclusion
    if (this.tags && this.tags.length > 0) {
      if (!entry.tags || !entry.tags.some(tag => this.tags!.includes(tag))) {
        return false;
      }
    }

    // Check tag exclusion
    if (this.excludeTags && this.excludeTags.length > 0 && entry.tags) {
      if (entry.tags.some(tag => this.excludeTags!.includes(tag))) {
        return false;
      }
    }

    // Apply custom filter
    if (this.filter) {
      try {
        return this.filter(entry);
      } catch (error) {
        this.handleError(new Error(`Filter function error: ${error}`));
        return false;
      }
    }

    return true;
  }

  /**
   * Close the transport and clean up resources.
   * 
   * This method ensures proper cleanup and prevents new logs from being processed.
   * Subclasses should override doClose() to implement specific cleanup logic.
   * 
   * @returns {Promise<void>} Resolves when the transport is fully closed
   * @throws {Error} If cleanup fails
   * 
   * @example
   * ```typescript
   * await transport.close();
   * // Transport is now closed and will not accept new logs
   * ```
   */
  public async close(): Promise<void> {
    if (this.closing) {
      return;
    }

    this.closing = true;
    this.enabled = false;
    this.emit('closing');

    try {
      // Flush any pending logs
      if (this.flush) {
        await this.flush();
      }

      // Perform transport-specific cleanup
      await this.doClose();
      
      this.emit('closed');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    } finally {
      // Remove all listeners to prevent memory leaks
      this.removeAllListeners();
    }
  }

  /**
   * Flush any buffered logs immediately.
   * 
   * Default implementation does nothing.
   * Subclasses that buffer logs should override this method.
   * 
   * @returns {Promise<void>} Resolves when flush is complete
   * 
   * @example
   * ```typescript
   * // Flush all pending logs before shutdown
   * await transport.flush();
   * await transport.close();
   * ```
   */
  public async flush(): Promise<void> {
    // Default implementation - override in subclasses that buffer
    return Promise.resolve();
  }

  /**
   * Get current transport statistics.
   * 
   * @returns {TransportStats} Current statistics for this transport
   * 
   * @example
   * ```typescript
   * const stats = transport.getStats();
   * console.log(`Processed: ${stats.processed}`);
   * console.log(`Succeeded: ${stats.succeeded}`);
   * console.log(`Failed: ${stats.failed}`);
   * console.log(`Queued: ${stats.queued}`);
   * ```
   */
  public getStats(): TransportStats {
    return { ...this.stats };
  }

  /**
   * Format a log entry according to the configured format.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string | Buffer} Formatted log entry
   * @protected
   * 
   * @example
   * ```typescript
   * // JSON format (default)
   * const json = this.formatEntry(entry);
   * // Returns: '{"id":"123","level":"info","message":"Test",...}'
   * 
   * // Plain text format
   * const plain = this.formatEntry(entry);
   * // Returns: '2024-01-15T10:30:45.123Z [INFO] Test'
   * 
   * // Custom format
   * const custom = this.formatEntry(entry);
   * // Returns whatever the custom formatter produces
   * ```
   */
  protected formatEntry(entry: LogEntry): string | Buffer {
    switch (this.format) {
      case 'json':
        return JSON.stringify(entry);
      
      case 'plain':
        return this.formatPlain(entry);
      
      case 'custom':
        if (!this.formatter) {
          throw new Error('Custom formatter not provided');
        }
        return this.formatter(entry);
      
      default:
        return JSON.stringify(entry);
    }
  }

  /**
   * Format a log entry as plain text.
   * 
   * @param {LogEntry} entry - The log entry to format
   * @returns {string} Plain text formatted log entry
   * @protected
   * 
   * @example
   * ```typescript
   * const formatted = this.formatPlain({
   *   timestamp: '2024-01-15T10:30:45.123Z',
   *   level: 'info',
   *   message: 'User action',
   *   loggerId: 'api-server',
   *   tags: ['user', 'action'],
   *   error: { name: 'Error', message: 'Something failed' },
   *   context: { userId: '123' },
   * });
   * // Returns:
   * // 2024-01-15T10:30:45.123Z [INFO] [api-server] [user,action] User action
   * // Error: Something failed
   * // Context: {"userId":"123"}
   * ```
   */
  protected formatPlain(entry: LogEntry): string {
    const parts: string[] = [
      entry.timestamp,
      `[${entry.level.toUpperCase()}]`,
    ];

    if (entry.loggerId) {
      parts.push(`[${entry.loggerId}]`);
    }

    if (entry.tags && entry.tags.length > 0) {
      parts.push(`[${entry.tags.join(',')}]`);
    }

    parts.push(entry.plainMessage || entry.message);

    if (entry.error) {
      parts.push(`\nError: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`\nStack: ${entry.error.stack}`);
      }
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`\nContext: ${JSON.stringify(entry.context)}`);
    }

    return parts.join(' ');
  }

  /**
   * Handle errors according to the transport's configuration.
   * 
   * @param {Error} error - The error that occurred
   * @param {LogEntry} [entry] - The log entry that caused the error (if applicable)
   * @protected
   * 
   * @example
   * ```typescript
   * try {
   *   await this.doLog(entry);
   * } catch (error) {
   *   this.handleError(error as Error, entry);
   *   // Error is logged if not silent
   *   // Stats are updated
   *   // Error event is emitted
   * }
   * ```
   */
  protected handleError(error: Error, entry?: LogEntry): void {
    // Update error stats
    if (!this.stats.lastError || this.stats.lastError.message !== error.message) {
      this.stats.lastError = {
        timestamp: new Date(),
        message: error.message,
        count: 1,
      };
    } else {
      this.stats.lastError.count++;
      this.stats.lastError.timestamp = new Date();
    }

    // Emit error event
    this.emit('error', error, entry);

    // Log to console if not in silent mode
    if (!this.silent) {
      console.error(`[${this.name}] Transport error:`, error.message);
      if (entry) {
        console.error('Failed log entry:', entry.id);
      }
    }
  }

  /**
   * Check if transport is enabled.
   * 
   * @returns {boolean} True if enabled
   * 
   * @example
   * ```typescript
   * if (transport.isEnabled()) {
   *   await transport.log(entry);
   * }
   * ```
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Apply a timeout to an async operation.
   * 
   * @param {Promise<T>} promise - The promise to apply timeout to
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise<T>} The original promise with timeout applied
   * @protected
   * @throws {Error} If operation times out
   * 
   * @example
   * ```typescript
   * try {
   *   await this.withTimeout(
   *     this.sendToRemote(data),
   *     5000 // 5 second timeout
   *   );
   * } catch (error) {
   *   if (error.message.includes('timed out')) {
   *     // Handle timeout
   *   }
   * }
   * ```
   */
  protected async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });

    return Promise.race([promise, timeout]);
  }

  /**
   * Check if a log level is enabled based on minimum level.
   * 
   * @param {LogLevel} level - The level to check
   * @returns {boolean} True if the level is enabled
   * @protected
   * 
   * @example
   * ```typescript
   * this.level = 'info';
   * 
   * this.isLevelEnabled('debug');  // false
   * this.isLevelEnabled('info');   // true
   * this.isLevelEnabled('warn');   // true
   * this.isLevelEnabled('error');  // true
   * ```
   */
  protected isLevelEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success'];
    const minIndex = levels.indexOf(this.level);
    const levelIndex = levels.indexOf(level);

    // If either level is not in standard levels, allow it
    if (minIndex === -1 || levelIndex === -1) {
      return true;
    }

    return levelIndex >= minIndex;
  }

  /**
   * Generate a unique ID for tracking purposes.
   * 
   * @returns {string} A unique identifier
   * @protected
   * 
   * @example
   * ```typescript
   * const id = this.generateId();
   * // Returns: "1642339845123-a1b2c3d4e"
   * ```
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if transport is healthy.
   * Default implementation checks if transport is enabled and initialized.
   * 
   * @returns {Promise<boolean>} True if transport is healthy
   * 
   * @example
   * ```typescript
   * const isHealthy = await transport.isHealthy();
   * if (!isHealthy) {
   *   console.warn('Transport is unhealthy');
   * }
   * ```
   */
  public async isHealthy(): Promise<boolean> {
    return this.enabled && this.initialized && !this.closing;
  }

  /**
   * Enable the transport.
   * 
   * @example
   * ```typescript
   * transport.enable();
   * // Transport will now process logs
   * ```
   */
  public enable(): void {
    this.enabled = true;
    this.emit('enabled');
  }

  /**
   * Disable the transport.
   * 
   * @example
   * ```typescript
   * transport.disable();
   * // Transport will not process new logs
   * ```
   */
  public disable(): void {
    this.enabled = false;
    this.emit('disabled');
  }

  /**
   * Check if transport supports batching.
   * 
   * @returns {boolean} True if batching is supported
   * 
   * @example
   * ```typescript
   * if (transport.supportsBatching()) {
   *   await transport.logBatch(entries);
   * } else {
   *   for (const entry of entries) {
   *     await transport.log(entry);
   *   }
   * }
   * ```
   */
  public supportsBatching(): boolean {
    return typeof this.doLogBatch === 'function';
  }

  /**
   * Reset transport statistics.
   * 
   * @example
   * ```typescript
   * transport.resetStats();
   * const stats = transport.getStats();
   * // All counters are now 0
   * ```
   */
  public resetStats(): void {
    this.stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      queued: 0,
      lastSuccess: undefined,
      lastError: undefined,
      custom: {},
    };
  }

  /**
   * Abstract method for transport-specific initialization.
   * Subclasses must implement this method.
   * 
   * @returns {Promise<void>} Resolves when initialization is complete
   * @protected
   * @abstract
   * 
   * @example
   * ```typescript
   * protected async doInit(): Promise<void> {
   *   // Connect to database
   *   await this.connect();
   *   
   *   // Create necessary resources
   *   await this.createTables();
   *   
   *   // Start background tasks
   *   this.startHealthCheck();
   * }
   * ```
   */
  protected abstract doInit(): Promise<void>;

  /**
   * Abstract method for transport-specific logging.
   * Subclasses must implement this method.
   * 
   * @param {LogEntry} entry - The log entry to process
   * @returns {Promise<void>} Resolves when the log has been processed
   * @protected
   * @abstract
   * 
   * @example
   * ```typescript
   * protected async doLog(entry: LogEntry): Promise<void> {
   *   const formatted = this.formatEntry(entry);
   *   await this.writeToDestination(formatted);
   * }
   * ```
   */
  protected abstract doLog(entry: LogEntry): Promise<void>;

  /**
   * Optional method for transport-specific batch logging.
   * Subclasses can implement this for efficient batch processing.
   * 
   * @param {LogEntry[]} entries - Array of log entries to process
   * @returns {Promise<void>} Resolves when all logs have been processed
   * @protected
   * 
   * @example
   * ```typescript
   * protected async doLogBatch(entries: LogEntry[]): Promise<void> {
   *   const batch = entries.map(e => this.formatEntry(e));
   *   await this.writeBatchToDestination(batch);
   * }
   * ```
   */
  protected doLogBatch?(entries: LogEntry[]): Promise<void>;

  /**
   * Abstract method for transport-specific cleanup.
   * Subclasses must implement this method.
   * 
   * @returns {Promise<void>} Resolves when cleanup is complete
   * @protected
   * @abstract
   * 
   * @example
   * ```typescript
   * protected async doClose(): Promise<void> {
   *   // Stop background tasks
   *   this.stopHealthCheck();
   *   
   *   // Close connections
   *   await this.disconnect();
   *   
   *   // Clean up resources
   *   this.cleanup();
   * }
   * ```
   */
  protected abstract doClose(): Promise<void>;
}

// Type guards for checking transport capabilities
export function isAsyncTransport(transport: unknown): transport is Transport {
  return (
    typeof transport === 'object' &&
    transport !== null &&
    'log' in transport &&
    typeof (transport as Transport).log === 'function'
  );
}

export function isBatchingTransport(transport: unknown): transport is Transport & { logBatch: (entries: LogEntry[]) => Promise<void> } {
  return (
    isAsyncTransport(transport) &&
    'logBatch' in transport &&
    typeof (transport as Transport).logBatch === 'function'
  );
}

export function hasStats(transport: unknown): transport is Transport & { getStats: () => TransportStats } {
  return (
    isAsyncTransport(transport) &&
    'getStats' in transport &&
    typeof (transport as Transport).getStats === 'function'
  );
}

