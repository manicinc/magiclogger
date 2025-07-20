// File: src/core/AsyncLogger.ts

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
     * Size of the ring buffer.
     * @default 10000
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
   */
  workerPath?: string;

  /**
   * Handler function called when buffer is flushed.
   * This function processes the log entries.
   */
  onFlush: (entries: LogEntry[]) => void | Promise<void>;
}

/**
 * Async logging interface for high-performance logging.
 * 
 * This class provides async logging methods that use a ring buffer
 * for zero-allocation logging. It's designed to work with the main
 * Logger class to provide both sync and async APIs.
 * 
 * The async logger is optimized for:
 * - High-frequency logging scenarios
 * - Minimal impact on application performance
 * - Zero allocations in the hot path
 * - Optional worker thread processing
 * 
 * @class AsyncLogger
 * 
 * @example
 * ```typescript
 * const asyncLogger = new AsyncLogger({
 *   buffer: { size: 10000 },
 *   useWorkers: true,
 *   onFlush: (entries) => {
 *     // Process entries
 *     entries.forEach(entry => console.log(entry));
 *   }
 * }, createLogEntry);
 * 
 * // Log without blocking
 * asyncLogger.info('High frequency log');
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
  private createEntry: (level: LogLevel, message: string, meta?: any) => LogEntry;

  /**
   * Worker threads for processing logs.
   * @private
   */
  private workers: Worker[] = [];

  /**
   * Current worker index for round-robin distribution.
   * @private
   */
  private workerIndex = 0;

  /**
   * Number of worker threads.
   * @private
   */
  private workerCount: number;

  /**
   * Whether workers are enabled.
   * @private
   */
  private useWorkers: boolean;

  /**
   * Creates a new AsyncLogger instance.
   * 
   * @param {AsyncLoggerOptions} options - Configuration options
   * @param {Function} createEntry - Function to create log entries
   */
  constructor(
    options: AsyncLoggerOptions,
    createEntry: (level: LogLevel, message: string, meta?: any) => LogEntry
  ) {
    this.createEntry = createEntry;
    this.useWorkers = options.useWorkers || false;
    this.workerCount = options.workerCount || 2;

    // Initialize buffer with appropriate flush handler
    this.buffer = new AsyncBuffer({
      size: options.buffer?.size || 10000,
      flushInterval: options.buffer?.flushInterval || 100,
      flushSize: options.buffer?.flushSize || 1000,
      onFlush: this.useWorkers ? this.sendToWorker.bind(this) : options.onFlush,
      overflowStrategy: 'drop-oldest',
      enableMetrics: true,
    });

    // Initialize workers if enabled
    if (this.useWorkers && typeof Worker !== 'undefined') {
      this.initializeWorkers(options.workerPath);
    }
  }

  /**
   * Log an info message asynchronously.
   * 
   * @param {string} message - The message to log
   * @param {any} [meta] - Optional metadata
   */
  public info(message: string, meta?: any): void {
    const entry = this.createEntry('info', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a warning message asynchronously.
   * 
   * @param {string} message - The message to log
   * @param {any} [meta] - Optional metadata
   */
  public warn(message: string, meta?: any): void {
    const entry = this.createEntry('warn', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log an error message asynchronously.
   * 
   * @param {string} message - The message to log
   * @param {any} [meta] - Optional metadata
   */
  public error(message: string, meta?: any): void {
    const entry = this.createEntry('error', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a debug message asynchronously.
   * 
   * @param {string} message - The message to log
   * @param {any} [meta] - Optional metadata
   */
  public debug(message: string, meta?: any): void {
    const entry = this.createEntry('debug', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a success message asynchronously.
   * 
   * @param {string} message - The message to log
   * @param {any} [meta] - Optional metadata
   */
  public success(message: string, meta?: any): void {
    const entry = this.createEntry('success', message, meta);
    this.buffer.add(entry);
  }

  /**
   * Log a message with custom level asynchronously.
   * 
   * @param {string} message - The message to log
   * @param {LogLevel} [level='info'] - The log level
   * @param {any} [meta] - Optional metadata
   */
  public log(message: string, level: LogLevel = 'info', meta?: any): void {
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
    };
  } {
    return {
      buffer: this.buffer.getStats(),
      workers: {
        enabled: this.useWorkers,
        count: this.workers.length,
        active: this.workers.filter(w => w.state === 'running').length,
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
      await Promise.all(
        this.workers.map(worker => this.terminateWorker(worker))
      );
      this.workers = [];
    }
  }

  /**
   * Initialize worker threads for log processing.
   * 
   * @param {string} [workerPath] - Path to worker script
   * @private
   */
  private initializeWorkers(workerPath?: string): void {
    // Check if we're in a Node.js environment with Worker support
    if (typeof Worker === 'undefined') {
      console.warn('[AsyncLogger] Worker threads not available in this environment');
      this.useWorkers = false;
      return;
    }

    // Default worker script if not provided
    const scriptPath = workerPath || this.getDefaultWorkerScript();

    try {
      // Create worker threads
      for (let i = 0; i < this.workerCount; i++) {
        const worker = new Worker(scriptPath);
        
        // Set up worker event handlers
        worker.addEventListener('message', (event) => {
          this.handleWorkerMessage(worker, event);
        });

        worker.addEventListener('error', (error) => {
          this.handleWorkerError(worker, error);
        });

        this.workers.push(worker);
      }

      console.log(`[AsyncLogger] Initialized ${this.workers.length} worker threads`);
    } catch (error) {
      console.error('[AsyncLogger] Failed to initialize workers:', error);
      this.useWorkers = false;
    }
  }

  /**
   * Get default worker script path.
   * 
   * @returns {string} Worker script path
   * @private
   */
  private getDefaultWorkerScript(): string {
    // In a real implementation, this would return the path to a bundled worker script
    // For now, we'll use inline worker code
    const workerCode = `
      self.addEventListener('message', (event) => {
        const { type, entries } = event.data;
        
        if (type === 'logs') {
          // Process logs in worker thread
          // In a real implementation, this would handle formatting, serialization, etc.
          console.log('[Worker] Processing', entries.length, 'log entries');
          
          // Send acknowledgment
          self.postMessage({ type: 'processed', count: entries.length });
        }
      });
    `;

    // Create blob URL for inline worker
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }

  /**
   * Send log entries to worker thread.
   * 
   * @param {LogEntry[]} entries - Log entries to process
   * @private
   */
  private sendToWorker(entries: LogEntry[]): void {
    if (this.workers.length === 0) {
      // Fallback if no workers available
      console.error('[AsyncLogger] No workers available');
      return;
    }

    // Round-robin distribution to workers
    const worker = this.workers[this.workerIndex];
    this.workerIndex = (this.workerIndex + 1) % this.workers.length;

    // Send entries to worker
    try {
      worker.postMessage({ type: 'logs', entries });
    } catch (error) {
      console.error('[AsyncLogger] Failed to send to worker:', error);
      // Could implement fallback here
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

    switch (type) {
      case 'processed':
        // Worker successfully processed logs
        if (data.count) {
          // Could track metrics here
        }
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

    // Remove failed worker
    const index = this.workers.indexOf(worker);
    if (index >= 0) {
      this.workers.splice(index, 1);
    }

    // Attempt to restart worker if we're below minimum count
    if (this.workers.length < this.workerCount && this.useWorkers) {
      console.log('[AsyncLogger] Attempting to restart worker');
      this.initializeWorkers();
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
    return new Promise((resolve) => {
      // Give worker time to finish current work
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
    return !this.buffer.isEmpty() || this.workers.length > 0;
  }

  /**
   * Reset async logger metrics.
   */
  public resetMetrics(): void {
    this.buffer.resetMetrics();
  }
}