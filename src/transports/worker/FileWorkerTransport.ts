/**
 * @fileoverview File transport that uses worker threads for non-blocking I/O.
 * Similar to Pino's file transport architecture.
 *
 * @module transports/worker/FileWorkerTransport
 */

import { Worker } from 'worker_threads';
import { Transport } from '../base/Transport';
import type { LogEntry, LogLevel } from '../../types/transport';
import * as path from 'path';

/**
 * Configuration options for FileWorkerTransport.
 *
 * @interface FileWorkerTransportOptions
 */
export interface FileWorkerTransportOptions {
  /** Transport name */
  name?: string;
  /** Whether enabled */
  enabled?: boolean;
  /** Minimum log level */
  level?: LogLevel;
  /** File path to write logs to */
  path: string;
  /** Whether to append to existing file */
  append?: boolean;
  /** Buffer size for batching */
  bufferSize?: number;
  /** Flush interval in ms */
  flushInterval?: number;
}

/**
 * File transport with worker thread for non-blocking I/O.
 * Implements the Pino pattern where transports use workers.
 *
 * @class FileWorkerTransport
 * @extends {Transport}
 *
 * @example
 * ```typescript
 * const fileTransport = new FileWorkerTransport({
 *   path: 'logs/app.log',
 *   bufferSize: 100,
 *   flushInterval: 50
 * });
 *
 * // Logs written to file in worker thread
 * logger.addTransport(fileTransport);
 * ```
 */
export class FileWorkerTransport extends Transport {
  private worker: Worker | null = null;
  protected readonly options: Required<FileWorkerTransportOptions>;
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  /**
   * Creates a new file worker transport.
   *
   * @constructor
   * @param {FileWorkerTransportOptions} options - Configuration options.
   */
  constructor(options: FileWorkerTransportOptions) {
    super({
      name: options.name || 'file-worker',
      enabled: options.enabled !== false,
      level: options.level || 'debug',
    });

    this.options = {
      name: options.name || 'file-worker',
      enabled: options.enabled !== false,
      level: options.level || 'debug',
      path: options.path,
      append: options.append !== false,
      bufferSize: options.bufferSize || 100,
      // Preserve explicit 0
      flushInterval: options.flushInterval ?? 50,
    };

    this.initializeWorker();
  }

  /**
   * Initializes the worker thread for file I/O.
   *
   * @private
   * @returns {void}
   */
  private initializeWorker(): void {
    try {
      // Worker path relative to dist directory
      const workerPath = path.join(process.cwd(), 'dist', 'transports', 'worker', 'FileWorker.js');

      // Create worker with file configuration
      this.worker = new Worker(workerPath, {
        workerData: {
          filePath: this.options.path,
          append: this.options.append,
        },
      });

      // Handle worker errors
      this.worker.on('error', error => {
        console.error('[FileWorkerTransport] Worker error:', error);
      });

      // Handle worker exit
      this.worker.on('exit', code => {
        if (code !== 0) {
          console.error(`[FileWorkerTransport] Worker exited with code ${code}`);
        }
        this.worker = null;
      });

      // Start flush timer
      if (this.options.flushInterval > 0) {
        this.flushTimer = setInterval(() => this.flushBuffer(), this.options.flushInterval);
        (this.flushTimer as NodeJS.Timeout & { unref?: () => void }).unref?.();
      } // else branch: interval disabled (tested)
    } catch (error) {
      console.error('[FileWorkerTransport] Failed to initialize worker:', error);
    }
  }

  /**
   * Logs an entry by buffering it for worker processing.
   *
   * @protected
   * @override
   * @param {LogEntry} entry - Log entry to write.
   * @returns {Promise<void>} Resolves immediately (non-blocking).
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    // Add to buffer
    this.buffer.push(entry);

    // Flush if buffer is full
    if (this.buffer.length >= this.options.bufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Flushes buffered logs to worker thread.
   *
   * @private
   * @returns {void}
   */
  private flushBuffer(): void {
    if (this.buffer.length === 0 || !this.worker) return;

    // Send batch to worker
    this.worker.postMessage({
      type: 'WRITE_BATCH',
      entries: this.buffer,
    });

    // Clear buffer
    this.buffer = [];
  }

  /**
   * Initializes the transport.
   *
   * @protected
   * @override
   * @returns {Promise<void>}
   */
  protected async doInit(): Promise<void> {
    // Worker already initialized in constructor
  }

  /**
   * Flushes pending logs.
   *
   * @public
   * @override
   * @returns {Promise<void>}
   */
  public async flush(): Promise<void> {
    this.flushBuffer();

    // Tell worker to flush its internal buffers
    if (this.worker) {
      this.worker.postMessage({ type: 'FLUSH' });
    }

    // Wait a bit for flush to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Closes the transport and worker.
   *
   * @protected
   * @override
   * @returns {Promise<void>}
   */
  protected async doClose(): Promise<void> {
    // Final flush
    await this.flush();

    // Stop flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Terminate worker
    if (this.worker) {
      this.worker.postMessage({ type: 'SHUTDOWN' });
      await new Promise<void>(resolve => {
        if (this.worker) {
          this.worker.once('exit', () => resolve());
        } else {
          resolve();
        }
      });
      this.worker = null;
    }
  }
}
