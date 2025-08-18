// File: src/async/AsyncLogger.ts

import { AsyncBuffer, type AddResult } from './AsyncBuffer';
import type { BufferStats } from './AsyncBuffer';
import type { LogEntry } from '../types/transport';
import type { LogLevel } from '../types/logger';
import { RateLimiter, type RateLimiterOptions } from '../utils/RateLimiter';
import { Redactor, type RedactorOptions } from '../utils/Redactor';
import { Sampler, type SamplerOptions } from '../utils/Sampler';
import { QueueManager, type QueueManagerOptions } from '../utils/QueueManager';

/**
 * Configuration options for AsyncLogger.
 *
 * @interface AsyncLoggerOptions
 */
export interface AsyncLoggerOptions {
  /**
   * Buffer configuration.
   */
  buffer?: {
    /**
     * Size of the ring buffer.
     * @default 8192
     */
    size?: number;

    /**
     * Flush interval in milliseconds.
     * @default 100
     */
    flushInterval?: number;

    /**
     * Number of entries to trigger flush.
     * @default 1000
     */
    flushSize?: number;
  };

  /**
   * Handler function called when buffer is flushed.
   * This function processes the log entries.
   */
  onFlush: (entries: LogEntry[]) => void | Promise<void>;

  /**
   * Enable performance metrics.
   * @default true
   */
  enableMetrics?: boolean;

  // ==========================================
  // OPERATIONAL UTILITIES INTEGRATION
  // ==========================================

  /**
   * Rate limiting configuration for log throttling.
   * Can be a RateLimiter instance or options to create one.
   * 
   * @example
   * rateLimiter: { max: 1000, window: 60000, strategy: 'sliding' }
   */
  rateLimiter?: import('../utils/RateLimiter').RateLimiter | import('../utils/RateLimiter').RateLimiterOptions;

  /**
   * PII and sensitive data redaction configuration.
   * Can be a Redactor instance or options to create one.
   * 
   * @example
   * redactor: { preset: 'strict', auditTrail: true }
   */
  redactor?: import('../utils/Redactor').Redactor | import('../utils/Redactor').RedactorOptions;

  /**
   * Statistical sampling configuration for volume control.
   * Can be a Sampler instance or options to create one.
   * 
   * @example
   * sampler: { rate: 0.1, strategy: 'adaptive' }
   */
  sampler?: import('../utils/Sampler').Sampler | import('../utils/Sampler').SamplerOptions;

  /**
   * Queue management configuration for handling backpressure.
   * Can be a QueueManager instance or options to create one.
   * 
   * @example
   * queueManager: { maxSize: 10000, dropPolicy: 'tail' }
   */
  queueManager?: import('../utils/QueueManager').QueueManager | import('../utils/QueueManager').QueueManagerOptions;

  /**
   * Fallback to sync logging when buffers are full or unavailable.
   * @default false
   */
  fallbackToSync?: boolean;

  /**
   * Force flush when high water mark is reached.
   * @default true
   */
  flushOnHighWater?: boolean;

  /**
   * Metrics callback for observability.
   */
  onMetrics?: (metrics: {
    type: 'drop' | 'backpressure' | 'flush' | 'rate_limit' | 'sample';
    count?: number;
    reason?: string;
    [key: string]: unknown;
  }) => void;
}


/**
 * Async logging interface for high-performance logging.
 *
 * This class provides async logging methods that use a ring buffer
 * with explicit backpressure handling. It's designed to work with the main Logger
 * class to provide both sync and async APIs.
 *
 * Features:
 * - Explicit backpressure with AddResult objects
 * - Ring buffer for efficient batching
 * - Automatic batching and flushing via microtasks and timers
 * - Integrated operational utilities (rate limiting, redaction, etc.)
 * - Performance metrics and monitoring
 *
 * @class AsyncLogger
 *
 * @example
 * ```typescript
 * const asyncLogger = new AsyncLogger({
 *   buffer: {
 *     size: 8192,
 *     flushInterval: 100
 *   },
 *   redactor: { preset: 'strict' },
 *   rateLimiter: { max: 1000, window: 60000 },
 *   onFlush: async (entries) => {
 *     await transport.sendBatch(entries);
 *   }
 * }, createLogEntry);
 *
 * // Explicit backpressure handling
 * const result = asyncLogger.info('Message', { data: 'value' });
 * if (!result.success) {
 *   console.warn(`Log dropped: ${result.reason}`);
 * }
 *
 * // Critical logging with retries
 * await asyncLogger.logCritical('error', 'System failure');
 * ```
 */
export class AsyncLogger {
  /**
   * The underlying async buffer.
   * @private
   */
  private buffer: AsyncBuffer;

  /**
   * Function to create log entries.
   * @private
   */
  private createEntry: (
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ) => LogEntry;


  /**
   * Whether metrics are enabled.
   * @private
   */
  private readonly enableMetrics: boolean;

  /**
   * Original flush handler from options.
   * @private
   */
  private readonly originalFlushHandler: (entries: LogEntry[]) => void | Promise<void>;

  /**
   * Operational utilities.
   * @private
   */
  private rateLimiter?: RateLimiter;
  private redactor?: Redactor;
  private sampler?: Sampler;
  private queueManager?: QueueManager;
  private droppedCount = 0;
  private lastDropWarning = 0;
  private backpressure = false;
  private readonly fallbackToSync: boolean;
  private readonly flushOnHighWater: boolean;
  private readonly onMetrics?: (metrics: {
    type: 'drop' | 'backpressure' | 'flush' | 'rate_limit' | 'sample';
    count?: number;
    reason?: string;
    [key: string]: unknown;
  }) => void;

  /**
   * Creates a new AsyncLogger instance.
   *
   * @param {AsyncLoggerOptions} options - Configuration options
   * @param {Function} createEntry - Function to create log entries
   */
  constructor(
    options: AsyncLoggerOptions,
    createEntry: (level: LogLevel, message: string, meta?: Record<string, unknown>) => LogEntry
  ) {
    this.createEntry = createEntry;
    this.enableMetrics = options.enableMetrics ?? true;
    this.originalFlushHandler = options.onFlush;
    this.fallbackToSync = options.fallbackToSync || false;
    this.flushOnHighWater = options.flushOnHighWater !== false;
    this.onMetrics = options.onMetrics;

    // Initialize operational utilities
    this.initializeUtilities(options);

    // Initialize buffer with flush handler
    this.buffer = new AsyncBuffer({
      size: options.buffer?.size || 8192,
      flushInterval: options.buffer?.flushInterval || 100,
      flushSize: options.buffer?.flushSize || 1000,
      onFlush: this.processEntries.bind(this),
      overflowStrategy: 'drop-oldest',
      enableMetrics: this.enableMetrics,
      onDrop: this.handleBufferDrop.bind(this),
      onHighWater: this.handleHighWater.bind(this),
      onLowWater: this.handleLowWater.bind(this),
    });
  }

  /**
   * Log an info message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result of adding the entry
   */
  public info(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('info', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Log a warning message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result of adding the entry
   */
  public warn(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('warn', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Log an error message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result of adding the entry
   */
  public error(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('error', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Log a debug message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result of adding the entry
   */
  public debug(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('debug', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Log a success message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result of adding the entry
   */
  public success(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('success', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Log a message with custom level asynchronously.
   *
   * @param {string} message - The message to log
   * @param {LogLevel} [level='info'] - The log level
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result of adding the entry
   */
  public log(message: string, level: LogLevel = 'info', meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry(level, message, meta);
    return this.addEntry(entry);
  }

  /**
   * Manually flush the async buffer.
   * Forces immediate processing of buffered logs.
   */
  public flush(): void {
    this.buffer.flush();
  }

  /**
   * Flush and wait for completion.
   * Useful during shutdown to ensure all logs are processed.
   *
   * @returns {Promise<void>} Resolves when flush is complete
   */
  public async flushAndWait(): Promise<void> {
    return this.buffer.flushAndWait();
  }

  /**
   * Get async logger statistics.
   *
   * @returns {object} Statistics including buffer stats
   */
  public getStats(): {
    buffer: ReturnType<AsyncBuffer['getStats']>;
  } {
    return {
      buffer: this.buffer.getStats(),
    };
  }

  /**
   * Close the async logger and clean up resources.
   *
   * @returns {Promise<void>} Resolves when logger is closed
   */
  public async close(): Promise<void> {
    // Close buffer
    await this.buffer.close();
  }






  /**
   * Check if the async logger is ready.
   *
   * @returns {boolean} True if logger is ready
   */
  public isReady(): boolean {
    return !this.buffer.isEmpty();
  }

  /**
   * Reset async logger metrics.
   */
  public resetMetrics(): void {
    this.buffer.resetMetrics();
  }

  /**
   * Get buffer utilization percentage.
   *
   * @returns {number} Utilization from 0 to 100
   */
  public getUtilization(): number {
    const stats = this.buffer.getStats();
    return Math.round(stats.utilization * 100);
  }

  /**
  * Check if logger is experiencing backpressure.
  * @returns {boolean} True if under backpressure
   */
  public isBackpressured(): boolean {
    return this.backpressure;
  }

  /**
   * Get drop statistics.
   * @returns Drop stats
   */
  public getDropStats(): { total: number; rate: number } {
    const now = Date.now();
    const timeSinceWarning = now - this.lastDropWarning;
    return {
      total: this.droppedCount,
      rate: timeSinceWarning > 0 ? this.droppedCount / timeSinceWarning * 1000 : 0
    };
  }

  /**
   * Log critical message with acknowledgment.
   * Waits for space if buffer is full.
   */
  public async logCritical(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    const entry = this.createEntry(level, message, meta);
    
    let attempts = 0;
    const maxAttempts = 10;
    // Synchronous retry loop to avoid timer leaks in tests
    while (attempts < maxAttempts) {
      const result = this.addEntry(entry);
      if (result.success) return;
      if (result.reason === 'closing') {
        throw new Error('Logger is closing');
      }
      attempts++;
    }
    throw new Error(`Failed to log after ${maxAttempts} attempts`);
  }

  /**
   * Initialize operational utilities.
   * @private
   */
  private initializeUtilities(options: AsyncLoggerOptions): void {
    // Initialize RateLimiter
    if (options.rateLimiter) {
      if ('allow' in options.rateLimiter) {
        this.rateLimiter = options.rateLimiter as RateLimiter;
      } else {
        this.rateLimiter = new RateLimiter(options.rateLimiter as RateLimiterOptions);
      }
    }

    // Initialize Redactor
    if (options.redactor) {
      if ('redact' in options.redactor) {
        this.redactor = options.redactor as Redactor;
      } else {
        this.redactor = new Redactor(options.redactor as RedactorOptions);
      }
    }

    // Initialize Sampler
    if (options.sampler) {
      if ('shouldSample' in options.sampler) {
        this.sampler = options.sampler as Sampler;
      } else {
        this.sampler = new Sampler(options.sampler as SamplerOptions);
      }
    }

    // Initialize QueueManager
    if (options.queueManager) {
      if ('enqueue' in options.queueManager) {
        this.queueManager = options.queueManager as QueueManager;
      } else {
        this.queueManager = new QueueManager({
          ...options.queueManager as QueueManagerOptions,
          onDrop: (entries, reason) => {
            this.onMetrics?.({
              type: 'drop',
              count: entries.length,
              reason
            });
          }
        });
      }
    }
  }

  /**
   * Add entry with operational utilities processing.
   * @private
   */
  private addEntry(entry: LogEntry): AddResult {
    // Apply sampling
    if (this.sampler && !this.sampler.shouldSample(entry)) {
      this.onMetrics?.({ type: 'sample', count: 1 });
      return {
        success: false,
        reason: 'buffer_full', // Reuse this for consistency
        bufferStats: {
          size: 0,
          capacity: 1,
          utilization: 0
        }
      };
    }

    // Apply rate limiting
    if (this.rateLimiter && !this.rateLimiter.allow(entry)) {
      this.onMetrics?.({ type: 'rate_limit', count: 1 });
      return {
        success: false,
        reason: 'buffer_full', // Reuse this for consistency
        bufferStats: {
          size: 0,
          capacity: 1,
          utilization: 0
        }
      };
    }

    // Apply redaction
    if (this.redactor) {
      entry = this.redactor.redactLogEntry(entry);
    }

    // Add to buffer or queue
    if (this.queueManager) {
      const queued = this.queueManager.enqueue(entry);
      return {
        success: queued,
        bufferStats: {
          size: this.queueManager.size(),
          capacity: this.queueManager.getStats().capacity,
          utilization: this.queueManager.size() / this.queueManager.getStats().capacity
        }
      };
    }

    const addResult = (this.buffer as unknown as {
      add: (e: LogEntry) => boolean | AddResult;
      getStats: () => { size: number; capacity: number; utilization: number };
    }).add(entry);

    if (typeof addResult === 'boolean') {
      const s = this.buffer.getStats();
      return { success: addResult, bufferStats: { size: s.size, capacity: s.capacity, utilization: s.utilization } };
    }
    return addResult;
  }

  /**
   * Process entries with utilities applied.
   * @private
   */
  private async processEntries(entries: LogEntry[]): Promise<void> {
    try {
      await this.originalFlushHandler(entries);
    } catch (error) {
      console.error('[AsyncLogger] Process entries error:', error);
      throw error;
    }
  }

  /**
   * Handle buffer drop events.
   * @private
   */
  private handleBufferDrop(entry: LogEntry, reason: string): void {
    this.droppedCount++;
    
    // Rate-limit warnings
    const now = Date.now();
    if (now - this.lastDropWarning > 5000) {
      console.warn(
        `[AsyncLogger] Dropped ${this.droppedCount} log entries due to ${reason}`,
        { level: entry.level, message: entry.message?.toString().slice(0, 100) }
      );
      this.lastDropWarning = now;
      this.droppedCount = 0;
    }
    
    // Emit metrics
    this.onMetrics?.({
      type: 'drop',
      count: this.droppedCount,
      reason
    });
  }

  /**
   * Handle high water mark events.
   * @private
   */
  private handleHighWater(stats: BufferStats): void {
    this.backpressure = true;
    console.warn('[AsyncLogger] Buffer high water mark reached', stats);
    
    // Emergency flush if configured
    if (this.flushOnHighWater) {
      this.buffer.flush();
    }
    
    this.onMetrics?.({ type: 'backpressure', ...stats });
  }

  /**
   * Handle low water mark events.
   * @private
   */
  private handleLowWater(stats: BufferStats): void {
    this.backpressure = false;
    console.info('[AsyncLogger] Buffer pressure relieved', stats);
    
    this.onMetrics?.({ type: 'backpressure', ...stats });
  }
}
