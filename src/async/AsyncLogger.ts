// File: src/async/AsyncLogger.ts

import { AsyncBuffer } from './AsyncBuffer';
import type { LogEntry, LogLevel } from '../types';

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
     * Size of the ring buffer (will be rounded to next power of 2).
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
   * Enable worker thread processing.
   * @default false
   */
  useWorkers?: boolean;

  /**
   * Number of worker threads to spawn.
   * @default 2
   */
  workerCount?: number;

  /**
   * Path to worker script.
   * @default './workers/log-processor.worker.js'
   */
  workerPath?: string;

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
}

/**
 * Worker state tracking interface.
 * @interface
 */
interface TrackedWorker {
  worker: Worker;
  active: boolean;
  processing: number;
}

/**
 * Async logging interface for high-performance logging.
 *
 * This class provides async logging methods that use a lock-free ring buffer
 * for zero-allocation logging. It's designed to work with the main Logger
 * class to provide both sync and async APIs.
 *
 * Features:
 * - Zero allocation in the hot path
 * - Lock-free ring buffer for single producer
 * - Optional worker thread processing
 * - Automatic batching and flushing
 * - Backpressure handling
 * - Performance metrics
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
 *   useWorkers: true,
 *   workerCount: 4,
 *   onFlush: async (entries) => {
 *     // Process entries
 *     await transport.sendBatch(entries);
 *   }
 * }, createLogEntry);
 *
 * // Log without blocking - returns immediately
 * asyncLogger.info('High frequency log', { data: 'value' });
 *
 * // Get performance stats
 * const stats = asyncLogger.getStats();
 * console.log(`Processed: ${stats.buffer.metrics.totalFlushed} logs`);
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
   * Worker threads for processing logs.
   * @private
   */
  private workers: TrackedWorker[] = [];

  // (Removed unused workerIndex previously intended for round-robin distribution)

  /**
   * Number of worker threads.
   * @private
   */
  private readonly workerCount: number;

  /**
   * Whether workers are enabled.
   * @private
   */
  private readonly useWorkers: boolean;

  /**
   * Path to worker script.
   * @private
   */
  private readonly workerPath: string;

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
    this.useWorkers = options.useWorkers || false;
    this.workerCount = options.workerCount ?? 2;
    this.workerPath = options.workerPath || './workers/log-processor.worker.js';
    this.enableMetrics = options.enableMetrics ?? true;
    this.originalFlushHandler = options.onFlush;

    // Initialize buffer with appropriate flush handler
    this.buffer = new AsyncBuffer({
      size: options.buffer?.size || 8192,
      flushInterval: options.buffer?.flushInterval || 100,
      flushSize: options.buffer?.flushSize || 1000,
      onFlush: this.useWorkers ? this.sendToWorker.bind(this) : options.onFlush,
      overflowStrategy: 'drop-oldest',
      enableMetrics: this.enableMetrics,
    });

    // Initialize workers if enabled
    if (this.useWorkers && typeof Worker !== 'undefined') {
      this.initializeWorkers();
    }
  }

  /**
   * Log an info message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a warning message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log an error message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   */
  public error(message: string, meta?: Record<string, unknown>): void {
    const entry = this.createEntry('error', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a debug message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a success message asynchronously.
   *
   * @param {string} message - The message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   */
  public success(message: string, meta?: Record<string, unknown>): void {
    const entry = this.createEntry('success', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a message with custom level asynchronously.
   *
   * @param {string} message - The message to log
   * @param {LogLevel} [level='info'] - The log level
   * @param {Record<string, unknown>} [meta] - Optional metadata
   */
  public log(message: string, level: LogLevel = 'info', meta?: Record<string, unknown>): void {
    const entry = this.createEntry(level, message, meta);
    this.buffer.add(entry);
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
   * @returns {object} Statistics including buffer stats and worker info
   */
  public getStats(): {
    buffer: ReturnType<AsyncBuffer['getStats']>;
    workers: {
      enabled: boolean;
      count: number;
      active: number;
      totalProcessing: number;
    };
  } {
    return {
      buffer: this.buffer.getStats(),
      workers: {
        enabled: this.useWorkers,
        count: this.workers.length,
        active: this.workers.filter(w => w.active).length,
        totalProcessing: this.workers.reduce((sum, w) => sum + w.processing, 0),
      },
    };
  }

  /**
   * Close the async logger and clean up resources.
   *
   * @returns {Promise<void>} Resolves when logger is closed
   */
  public async close(): Promise<void> {
    // Close buffer first
    await this.buffer.close();

    // Terminate workers
    if (this.workers.length > 0) {
      await Promise.all(this.workers.map(({ worker }) => this.terminateWorker(worker)));
      this.workers = [];
    }
  }

  /**
   * Initialize worker threads for log processing.
   * @private
   */
  private initializeWorkers(): void {
    try {
      // Create worker threads
      for (let i = 0; i < this.workerCount; i++) {
        const worker = new Worker(this.workerPath);

        // Set up worker event handlers
        worker.addEventListener('message', event => {
          this.handleWorkerMessage(worker, event);
        });

        worker.addEventListener('error', error => {
          this.handleWorkerError(worker, error);
        });

        this.workers.push({
          worker,
          active: true,
          processing: 0,
        });
      }

      console.log(`[AsyncLogger] Initialized ${this.workers.length} worker threads`);
    } catch (error) {
      console.error('[AsyncLogger] Failed to initialize workers:', error);
      console.log('[AsyncLogger] Falling back to main thread processing');

      // Recreate buffer with direct flush handler
      this.buffer = new AsyncBuffer({
        size: this.buffer.getStats().capacity,
        flushInterval: 100,
        flushSize: 1000,
        onFlush: this.originalFlushHandler,
        overflowStrategy: 'drop-oldest',
        enableMetrics: this.enableMetrics,
      });
    }
  }

  /**
   * Send log entries to worker thread.
   *
   * @param {LogEntry[]} entries - Log entries to process
   * @private
   */
  private sendToWorker(entries: LogEntry[]): void {
    if (this.workers.length === 0) {
      console.error('[AsyncLogger] No workers available, falling back to direct processing');
      // Fallback to direct processing
      const result = this.originalFlushHandler(entries);
      if (result && typeof result.then === 'function') {
        result.catch(error => {
          console.error('[AsyncLogger] Flush handler error:', error);
        });
      }
      return;
    }

    // Find worker with least load
    let selectedWorker: TrackedWorker | undefined = this.workers[0];
    let minLoad = selectedWorker ? selectedWorker.processing : Number.MAX_SAFE_INTEGER;

    for (const worker of this.workers) {
      if (worker.active && worker.processing < minLoad) {
        selectedWorker = worker;
        minLoad = worker.processing;
      }
    }

    // Send entries to worker
    if (!selectedWorker) {
      // Should not happen due to earlier length check, but guard for TS
      const direct = this.originalFlushHandler(entries);
      if (direct && typeof (direct as Promise<void>).then === 'function') {
        (direct as Promise<void>).catch(err =>
          console.error('[AsyncLogger] Flush handler error:', err)
        );
      }
      return;
    }

    try {
      selectedWorker.processing++;
      selectedWorker.worker.postMessage({ type: 'logs', entries });
    } catch (error) {
      selectedWorker.processing--;
      console.error('[AsyncLogger] Failed to send to worker:', error);

      // Fallback to direct processing
      const result = this.originalFlushHandler(entries);
      if (result && typeof result.then === 'function') {
        result.catch(err => {
          console.error('[AsyncLogger] Fallback flush handler error:', err);
        });
      }
    }
  }

  /**
   * Handle message from worker thread.
   *
   * @param {Worker} worker - The worker that sent the message
   * @param {MessageEvent} event - The message event
   * @private
   */
  private handleWorkerMessage(worker: Worker, event: MessageEvent): void {
    const { type, ...data } = event.data;

    // Find tracked worker
    const trackedWorker = this.workers.find(w => w.worker === worker);
    if (!trackedWorker) return;

    switch (type) {
      case 'processed':
        // Worker successfully processed logs
        trackedWorker.processing = Math.max(0, trackedWorker.processing - 1);
        if (data.metrics && this.enableMetrics) {
          // Could aggregate worker metrics here
        }
        break;

      case 'ready':
        // Worker is ready
        trackedWorker.active = true;
        break;

      case 'error':
        // Worker encountered an error
        console.error('[AsyncLogger] Worker error:', data.error);
        break;

      default:
        console.warn('[AsyncLogger] Unknown worker message type:', type);
    }
  }

  /**
   * Handle worker thread error.
   *
   * @param {Worker} worker - The worker that errored
   * @param {ErrorEvent} error - The error event
   * @private
   */
  private handleWorkerError(worker: Worker, error: ErrorEvent): void {
    console.error('[AsyncLogger] Worker error:', error);

    // Find and mark worker as inactive
    const trackedWorker = this.workers.find(w => w.worker === worker);
    if (trackedWorker) {
      trackedWorker.active = false;
      trackedWorker.processing = 0;
    }

    // Remove failed worker
    const index = this.workers.findIndex(w => w.worker === worker);
    if (index >= 0) {
      this.workers.splice(index, 1);
    }

    // Attempt to restart worker
    if (this.workers.length < this.workerCount && this.useWorkers) {
      console.log('[AsyncLogger] Attempting to restart worker');
      setTimeout(() => this.initializeWorkers(), 1000);
    }
  }

  /**
   * Terminate a worker thread gracefully.
   *
   * @param {Worker} worker - The worker to terminate
   * @returns {Promise<void>} Resolves when worker is terminated
   * @private
   */
  private async terminateWorker(worker: Worker): Promise<void> {
    return new Promise(resolve => {
      // Send shutdown message
      worker.postMessage({ type: 'shutdown' });

      // Give worker time to cleanup
      setTimeout(() => {
        worker.terminate();
        resolve();
      }, 100);
    });
  }

  /**
   * Check if the async logger is ready.
   *
   * @returns {boolean} True if logger is ready
   */
  public isReady(): boolean {
    return !this.buffer.isEmpty() || this.workers.some(w => w.active);
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
}
