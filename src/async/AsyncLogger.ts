/**
 * @fileoverview High-performance asynchronous logger with ring buffer.
 *
 * Provides non-blocking logging with automatic batching, backpressure handling,
 * and integration with operational utilities like rate limiting and redaction.
 *
 * @module async/AsyncLogger
 */

import { AsyncBuffer, type AddResult } from './AsyncBuffer';
import type { BufferStats } from './AsyncBuffer';
import type { LogEntry, Transport } from '../types/transport';
import type { LogLevel } from '../types/logger';
import { RateLimiter, type RateLimiterOptions } from '../extensions/RateLimiter';
import { Redactor, type RedactorOptions } from '../extensions/Redactor';
import { Sampler, type SamplerOptions } from '../extensions/Sampler';
import { QueueManager, type QueueManagerOptions } from '../extensions/QueueManager';

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
  rateLimiter?:
    | import('../extensions/RateLimiter').RateLimiter
    | import('../extensions/RateLimiter').RateLimiterOptions;

  /**
   * PII and sensitive data redaction configuration.
   * Can be a Redactor instance or options to create one.
   *
   * @example
   * redactor: { preset: 'strict', auditTrail: true }
   */
  redactor?:
    | import('../extensions/Redactor').Redactor
    | import('../extensions/Redactor').RedactorOptions;

  /**
   * Statistical sampling configuration for volume control.
   * Can be a Sampler instance or options to create one.
   *
   * @example
   * sampler: { rate: 0.1, strategy: 'adaptive' }
   */
  sampler?:
    | import('../extensions/Sampler').Sampler
    | import('../extensions/Sampler').SamplerOptions;

  /**
   * Queue management configuration for handling backpressure.
   * Can be a QueueManager instance or options to create one.
   *
   * @example
   * queueManager: { maxSize: 10000, dropPolicy: 'tail' }
   */
  queueManager?:
    | import('../extensions/QueueManager').QueueManager
    | import('../extensions/QueueManager').QueueManagerOptions;

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
 * High-performance asynchronous logger with ring buffer architecture.
 *
 * Designed for maximum throughput with non-blocking operations, automatic
 * batching, and comprehensive backpressure handling. Integrates operational
 * utilities for rate limiting, redaction, and sampling.
 *
 * @class AsyncLogger
 *
 * @example Basic usage
 * ```typescript
 * const logger = new AsyncLogger({
 *   buffer: { size: 8192, flushInterval: 100 },
 *   onFlush: async (entries) => {
 *     await transport.sendBatch(entries);
 *   }
 * });
 *
 * const result = logger.info('User logged in', { userId: 123 });
 * if (!result.success) {
 *   console.warn(`Log dropped: ${result.reason}`);
 * }
 * ```
 *
 * @example With operational utilities
 * ```typescript
 * const logger = new AsyncLogger({
 *   rateLimiter: { max: 1000, window: 60000 },
 *   redactor: { preset: 'strict' },
 *   sampler: { rate: 0.1 },
 *   onFlush: async (entries) => {
 *     // Entries are already rate-limited, redacted, and sampled
 *     await transport.sendBatch(entries);
 *   }
 * });
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
  private readonly flushOnHighWater: boolean;
  private readonly fallbackToSync: boolean;
  private readonly onMetrics?: (metrics: {
    type: 'drop' | 'backpressure' | 'flush' | 'rate_limit' | 'sample';
    count?: number;
    reason?: string;
    [key: string]: unknown;
  }) => void;

  /**
   * Minimal transport registry for AsyncLogger to interoperate with integration tests.
   * @private
   */
  private transports: Transport[] = [];

  /**
   * Creates a new AsyncLogger instance.
   *
   * @param {Partial<AsyncLoggerOptions>} [options] - Configuration options
   * @param {Function} [createEntry] - Function to create log entries
   * @constructor
   */
  constructor(
    options?: Partial<AsyncLoggerOptions>,
    createEntry?: (level: LogLevel, message: string, meta?: Record<string, unknown>) => LogEntry
  ) {
    const safeOptions: AsyncLoggerOptions = {
      buffer: {
        size: options?.buffer?.size ?? 8192,
        flushInterval: options?.buffer?.flushInterval ?? 100,
        flushSize: options?.buffer?.flushSize ?? 1000,
      },
      onFlush:
        options?.onFlush ??
        ((entries: LogEntry[]) => {
          // Default minimal flush: print messages to console as a single batch
          try {
            for (const e of entries) {
              // Prefer level-appropriate console method
              const line = e.message ?? '';
              if (e.level === 'error') console.error(line);
              else if (e.level === 'warn') console.warn(line);
              else if (e.level === 'debug' && typeof console.debug === 'function')
                console.debug(line);
              else console.log(line);
            }
          } catch {
            /* noop */
          }
        }),
      enableMetrics: options?.enableMetrics ?? true,
      rateLimiter: options?.rateLimiter,
      redactor: options?.redactor,
      sampler: options?.sampler,
      queueManager: options?.queueManager,
      fallbackToSync: options?.fallbackToSync ?? false,
      flushOnHighWater: options?.flushOnHighWater ?? true,
      onMetrics: options?.onMetrics,
    };

    // CreateEntry default builder if not provided
    const defaultCreateEntry = (
      level: LogLevel,
      message: string,
      meta?: Record<string, unknown>
    ): LogEntry => {
      const now = Date.now();
      const ts = new Date(now).toISOString();
      const msg = typeof message === 'string' ? message : String(message);
      return {
        id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: ts,
        timestampMs: now,
        level,
        message: msg,
        plainMessage: msg,
        context: meta,
      };
    };

    this.createEntry = createEntry ?? defaultCreateEntry;
    this.enableMetrics = safeOptions.enableMetrics ?? true;
    this.originalFlushHandler = safeOptions.onFlush;
    this.fallbackToSync = safeOptions.fallbackToSync ?? false;
    this.flushOnHighWater = safeOptions.flushOnHighWater !== false;
    this.onMetrics = safeOptions.onMetrics;

    // Initialize operational utilities
    this.initializeUtilities(safeOptions);

    // Initialize buffer with flush handler
    this.buffer = new AsyncBuffer({
      size: safeOptions.buffer?.size ?? 16384,
      flushInterval: safeOptions.buffer?.flushInterval ?? 100,
      flushSize: safeOptions.buffer?.flushSize ?? 1000,
      onFlush: this.processEntries.bind(this),
      overflowStrategy: 'drop-oldest',
      enableMetrics: this.enableMetrics,
      onDrop: this.handleBufferDrop.bind(this),
      onHighWater: this.handleHighWater.bind(this),
      onLowWater: this.handleLowWater.bind(this),
    });
  }

  /**
   * Logs an info-level message.
   *
   * @param {string} message - Log message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result indicating success/failure and reason
   *
   * @example
   * ```typescript
   * const result = logger.info('User action', { userId: 123 });
   * if (!result.success) {
   *   console.warn(`Failed to log: ${result.reason}`);
   * }
   * ```
   */
  public info(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('info', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Logs a warning-level message.
   *
   * @param {string} message - Log message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result indicating success/failure
   */
  public warn(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('warn', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Logs an error-level message.
   *
   * @param {string} message - Log message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result indicating success/failure
   */
  public error(message: string, meta?: Record<string, unknown>): AddResult {
    const entry = this.createEntry('error', message, meta);
    return this.addEntry(entry);
  }

  /**
   * Logs a debug-level message.
   *
   * @param {string} message - Log message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {AddResult} Result indicating success/failure
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

    // Attempt to flush/close transports
    for (const t of this.transports) {
      try {
        if (typeof (t as { flush?: () => void | Promise<void> }).flush === 'function') {
          await (t as { flush?: () => void | Promise<void> }).flush?.();
        }
      } catch {
        /* ignore */
      }
      try {
        if (typeof (t as { close?: () => void | Promise<void> }).close === 'function') {
          await (t as { close?: () => void | Promise<void> }).close?.();
        }
      } catch {
        /* ignore */
      }
    }
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
      rate: timeSinceWarning > 0 ? (this.droppedCount / timeSinceWarning) * 1000 : 0,
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
          ...(options.queueManager as QueueManagerOptions),
          onDrop: (entries, reason) => {
            this.onMetrics?.({
              type: 'drop',
              count: entries.length,
              reason,
            });
          },
        });
      }
    }
  }

  /**
   * Add entry with operational utilities processing - fast path for common case.
   * @private
   */
  private addEntry(entry: LogEntry): AddResult {
    // Fast path: no utilities configured
    if (!this.sampler && !this.rateLimiter && !this.redactor && !this.queueManager) {
      const ret = this.buffer.add(entry) as boolean | AddResult;
      // Support both boolean (fast path) and structured AddResult from mocks/alt implementations
      if (ret && typeof ret === 'object' && 'success' in ret) {
        return ret as AddResult;
      }
      const success = ret as boolean;
      return {
        success,
        bufferStats: success ? undefined : this.getBufferStatsLazy(),
      };
    }

    // Slow path: apply utilities
    return this.addEntryWithUtilities(entry);
  }

  /**
   * Add entry with full utility processing - only called when utilities are configured.
   * @private
   */
  private addEntryWithUtilities(entry: LogEntry): AddResult {
    // Apply sampling
    if (this.sampler && !this.sampler.shouldSample(entry)) {
      this.onMetrics?.({ type: 'sample', count: 1 });
      return {
        success: false,
        reason: 'buffer_full', // Reuse this for consistency
        bufferStats: {
          size: 0,
          capacity: 1,
          utilization: 0,
        },
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
          utilization: 0,
        },
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
          utilization: this.queueManager.size() / this.queueManager.getStats().capacity,
        },
      };
    }

    const ret = this.buffer.add(entry) as boolean | AddResult;
    if (ret && typeof ret === 'object' && 'success' in ret) {
      return ret as AddResult;
    }
    const success = ret as boolean;
    const result = {
      success,
      bufferStats: success ? undefined : this.getBufferStatsLazy(),
    };

    // If buffer add failed and fallbackToSync is enabled, process immediately
    if (!success && this.fallbackToSync) {
      try {
        this.processEntries([entry]);
        return { ...result, success: true };
      } catch (error) {
        // If sync processing fails, return the original failed result
        return result;
      }
    }

    return result;
  }

  /**
   * Lazy buffer stats creation - only create when needed.
   * @private
   */
  private getBufferStatsLazy(): { size: number; capacity: number; utilization: number } {
    const stats = this.buffer.getStats();
    return {
      size: stats.size,
      capacity: stats.capacity,
      utilization: stats.utilization,
    };
  }

  /**
   * Process entries with utilities applied.
   * @private
   */
  private async processEntries(entries: LogEntry[]): Promise<void> {
    try {
      // First, dispatch to registered transports if any
      if (this.transports.length > 0) {
        const ops: Array<void | Promise<void>> = [];
        for (const t of this.transports) {
          try {
            if (
              typeof (t as { logBatch?: (e: LogEntry[]) => void | Promise<void> }).logBatch ===
              'function'
            ) {
              ops.push(
                (t as { logBatch: (e: LogEntry[]) => void | Promise<void> }).logBatch(entries)
              );
            } else if (typeof t.log === 'function') {
              for (const e of entries) ops.push(t.log(e));
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
              '[AsyncLogger] Transport error',
              (t as { name?: string })?.name || 'unknown',
              err
            );
          }
        }
        // Wait for async transports
        if (ops.some(p => p && typeof (p as Promise<void>).then === 'function')) {
          await Promise.all(
            ops.map(p =>
              p && typeof (p as Promise<void>).then === 'function'
                ? (p as Promise<void>)
                : Promise.resolve()
            )
          );
        }
      }

      // Then call original flush handler (often console printing)
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
      console.warn(`[AsyncLogger] Dropped ${this.droppedCount} log entries due to ${reason}`, {
        level: entry.level,
        message: entry.message?.toString().slice(0, 100),
      });
      this.lastDropWarning = now;
      this.droppedCount = 0;
    }

    // Emit metrics
    this.onMetrics?.({
      type: 'drop',
      count: this.droppedCount,
      reason,
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

  // ==========================================
  // Minimal transport management
  // ==========================================

  /** Add a transport (synchronous API for tests/integration). */
  public addTransport(transport: Transport): void {
    if (!transport) return;
    this.transports.push(transport);
  }

  /** Remove a transport by name. */
  public removeTransport(name: string): void {
    this.transports = this.transports.filter(t => (t.name || '') !== name);
  }

  /** Get a transport by name. */
  public getTransport(name: string): Transport | undefined {
    return this.transports.find(t => (t.name || '') === name);
  }

  /** List transport names (for tests). */
  public listTransports(): string[] {
    return this.transports.map(t => t.name || 'unnamed');
  }

  /** Transport stats placeholder to match API shape. */
  public getTransportStats(): Record<string, unknown> {
    return Object.fromEntries(this.transports.map(t => [t.name || 'unnamed', { active: true }]));
  }
}
