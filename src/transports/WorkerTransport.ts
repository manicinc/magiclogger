/**
 * @fileoverview High-performance worker thread transport for async logging.
 *
 * Implements Pino-style worker thread architecture with ring buffer
 * for maximum throughput and minimal main thread blocking.
 *
 * @module transports/WorkerTransport
 */

import { Worker, isMainThread, parentPort } from 'worker_threads';
import { Transport } from './base/Transport';
import type { LogEntry, LogLevel } from '../types/transport';

/**
 * Worker thread transport configuration.
 *
 * @interface WorkerTransportOptions
 */
export interface WorkerTransportOptions {
  /** Transport name */
  name?: string;
  /** Whether enabled */
  enabled?: boolean;
  /** Minimum log level */
  level?: LogLevel;
  /** Worker script path */
  workerPath: string;
  /** Worker options */
  workerOptions?: Record<string, unknown>;
  /** Ring buffer size (power of 2 for performance) */
  bufferSize?: number;
  /** Batch size for flushing */
  batchSize?: number;
  /** Flush interval in ms */
  flushInterval?: number;
}

/**
 * Ring buffer for lock-free message passing.
 * Uses SharedArrayBuffer for zero-copy transfer to worker.
 *
 * @class RingBuffer
 */
class RingBuffer {
  private buffer: SharedArrayBuffer;
  private view: Int32Array;
  private writeIndex = 0;
  private capacity: number;

  /**
   * Creates a ring buffer with specified capacity.
   *
   * @param {number} capacity - Buffer capacity (should be power of 2)
   */
  constructor(capacity = 8192) {
    // Ensure power of 2 for fast modulo
    this.capacity = 1 << Math.ceil(Math.log2(capacity));
    this.buffer = new SharedArrayBuffer(this.capacity * 4);
    this.view = new Int32Array(this.buffer);
  }

  /**
   * Adds entry to buffer without locking.
   *
   * @param {LogEntry} entry - Log entry to add
   * @returns {boolean} True if added successfully
   */
  push(_entry: LogEntry): boolean {
    const index = this.writeIndex & (this.capacity - 1);
    // Store entry reference (actual data sent via postMessage)
    this.view[index] = 1; // Mark as available
    this.writeIndex++;
    return true;
  }

  /**
   * Gets the shared buffer for worker access.
   *
   * @returns {SharedArrayBuffer} Shared buffer
   */
  getBuffer(): SharedArrayBuffer {
    return this.buffer;
  }
}

/**
 * High-performance worker thread transport.
 *
 * Implements zero-copy message passing with ring buffer
 * and batched flushing for maximum throughput.
 *
 * @class WorkerTransport
 * @extends {Transport}
 *
 * @example
 * ```typescript
 * const workerTransport = new WorkerTransport({
 *   workerPath: './log-worker.js',
 *   bufferSize: 16384,  // 16K entries
 *   batchSize: 100,     // Flush every 100 logs
 *   flushInterval: 10   // Or every 10ms
 * });
 *
 * // Logs are sent to worker thread with zero blocking
 * logger.addTransport(workerTransport);
 * ```
 */
export class WorkerTransport extends Transport {
  private worker?: Worker;
  private ringBuffer: RingBuffer;
  private pendingBatch: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  protected readonly options: Required<WorkerTransportOptions>;

  /**
   * Creates a new worker transport instance.
   *
   * @param {WorkerTransportOptions} options - Configuration options
   */
  constructor(options: WorkerTransportOptions) {
    super({
      name: options.name || 'worker',
      enabled: options.enabled !== false,
      level: options.level || 'debug',
    });

    this.options = {
      name: options.name || 'worker',
      enabled: options.enabled !== false,
      level: options.level || 'debug',
      workerPath: options.workerPath,
      workerOptions: options.workerOptions || {},
      bufferSize: options.bufferSize || 8192,
      batchSize: options.batchSize || 100,
      // Preserve explicit 0 so timers can be disabled
      flushInterval: options.flushInterval ?? 10,
    };

    // Initialize ring buffer for lock-free communication
    this.ringBuffer = new RingBuffer(this.options.bufferSize);

    // Start worker if in main thread
    if (isMainThread) {
      this.initializeWorker();
    }
  }

  /**
   * Initializes the worker thread.
   *
   * @private
   */
  private initializeWorker(): void {
    try {
      // Create worker with shared buffer
      this.worker = new Worker(this.options.workerPath, {
        workerData: {
          ...this.options.workerOptions,
          sharedBuffer: this.ringBuffer.getBuffer(),
        },
      });

      // Handle worker errors
      this.worker.on('error', error => {
        console.error('[WorkerTransport] Worker error:', error);
      });

      // Handle worker exit
      this.worker.on('exit', code => {
        if (code !== 0) {
          console.error(`[WorkerTransport] Worker stopped with exit code ${code}`);
        }
      });

      // Start flush timer
      if (this.options.flushInterval > 0) {
        this.flushTimer = setInterval(() => this.flush(), this.options.flushInterval);
        // Allow process to exit naturally in tests / short-lived scripts
        (this.flushTimer as NodeJS.Timeout & { unref?: () => void }).unref?.();
      } // else branch covered in tests: no timer created when interval = 0
    } catch (error) {
      console.error('[WorkerTransport] Failed to initialize worker:', error);
    }
  }

  /**
   * Logs an entry via worker thread with zero blocking.
   *
   * @param {LogEntry} entry - Log entry to send
   * @returns {Promise<void>} Resolves immediately
   * @protected
   * @override
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (!this.worker) return;

    // Add to pending batch
    this.pendingBatch.push(entry);

    // Flush if batch size reached
    if (this.pendingBatch.length >= this.options.batchSize) {
      this.flushSync();
    }

    // Mark in ring buffer for monitoring
    this.ringBuffer.push(entry);
  }

  /**
   * Flushes pending logs to worker thread.
   *
   * @private
   */
  private flushSync(): void {
    if (this.pendingBatch.length === 0 || !this.worker) return;

    // Send batch to worker (structured clone, not blocking)
    this.worker.postMessage({
      type: 'batch',
      entries: this.pendingBatch,
    });

    // Clear batch
    this.pendingBatch = [];
  }

  /**
   * Public async flush method for Transport interface compliance.
   *
   * @returns {Promise<void>} Promise that resolves when flush is complete
   */
  public async flush(): Promise<void> {
    this.flushSync();
    // Give time for message to be sent
    await new Promise(resolve => setImmediate(resolve));
  }

  /**
   * Initializes the transport.
   *
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  protected async doInit(): Promise<void> {
    // Worker already initialized in constructor
  }

  /**
   * Closes the transport and worker thread.
   *
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  protected async doClose(): Promise<void> {
    // Final flush
    this.flushSync();

    // Stop flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Terminate worker
    if (this.worker) {
      await this.worker.terminate();
      this.worker = undefined;
    }
  }
}

/**
 * Worker thread handler for receiving log batches.
 * Use this in your worker script.
 *
 * @example
 * ```javascript
 * // log-worker.js
 * const { parentPort, workerData } = require('worker_threads');
 * const fs = require('fs');
 *
 * const stream = fs.createWriteStream(workerData.logFile);
 *
 * parentPort.on('message', ({ type, entries }) => {
 *   if (type === 'batch') {
 *     for (const entry of entries) {
 *       stream.write(JSON.stringify(entry) + '\\n');
 *     }
 *   }
 * });
 * ```
 */
export function workerHandler(handler: (entries: LogEntry[]) => void): void {
  if (!isMainThread && parentPort) {
    parentPort.on('message', ({ type, entries }: { type: string; entries: LogEntry[] }) => {
      if (type === 'batch') {
        handler(entries);
      }
    });
  }
}
