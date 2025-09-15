/**
 * @fileoverview Worker-based File Transport
 *
 * File transport that uses a dedicated worker thread for I/O isolation.
 * Useful when log processing requires CPU-intensive transformations.
 *
 * Key features:
 * - All I/O in worker thread
 * - Automatic file rotation
 * - Compression support
 * - Buffering in worker
 * - Structured cloning for efficient data transfer
 *
 * @module transports/WorkerFileTransport
 */

import { Worker } from 'worker_threads';
import { Transport } from './base/Transport';
import type { LogEntry } from '../types/transport';

/**
 * Configuration options for WorkerFileTransport.
 *
 * @interface WorkerFileTransportOptions
 */
export interface WorkerFileTransportOptions {
  /**
   * Transport name.
   */
  name?: string;

  /**
   * File path to write logs to.
   */
  filepath: string;

  /**
   * Whether this transport is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Buffer size in the worker.
   * @default 10000
   */
  bufferSize?: number;

  /**
   * Flush interval in milliseconds.
   * @default 100
   */
  flushInterval?: number;

  /**
   * Format for log entries.
   * @default 'json'
   */
  format?: 'json' | 'plain';

  /**
   * Maximum file size before rotation (bytes).
   */
  maxFileSize?: number;

  /**
   * Whether to compress rotated files.
   * @default false
   */
  compress?: boolean;
}

/**
 * File transport that uses a worker thread for all I/O operations.
 *
 * This is the correct implementation that moves all heavy work
 * (buffering, serialization, file I/O) to a worker thread, keeping
 * the main thread free for application logic.
 *
 * @class WorkerFileTransport
 * @extends {Transport}
 *
 * @example
 * ```typescript
 * const fileTransport = new WorkerFileTransport({
 *   filepath: './logs/app.log',
 *   bufferSize: 10000,    // Buffer in worker
 *   flushInterval: 100    // Flush every 100ms
 * });
 *
 * // Main thread just passes the entry
 * fileTransport.log(entry);  // Non-blocking
 * ```
 */
export class WorkerFileTransport extends Transport {
  /**
   * Worker thread instance.
   * @private
   */
  private worker: Worker | null = null;

  /**
   * Transport configuration.
   * @private
   */
  private readonly config: WorkerFileTransportOptions;

  /**
   * Whether the worker is ready.
   * @private
   */
  private ready = false;

  /**
   * Queue for entries while worker is initializing.
   * @private
   */
  private initQueue: LogEntry[] = [];

  /**
   * Creates a new WorkerFileTransport instance.
   *
   * @param {WorkerFileTransportOptions} options - Transport configuration.
   */
  constructor(options: WorkerFileTransportOptions) {
    super({
      name: options.name || 'file-worker',
      enabled: options.enabled !== undefined ? options.enabled : true,
    });

    this.config = options;
    // Lazy initialization - worker will be created on first use
  }

  /**
   * Initializes the worker thread.
   *
   * @private
   */
  private initializeWorker(): void {
    // Create worker from inline code
    const workerCode = `
      const { parentPort } = require('worker_threads');
      const fs = require('fs');
      const path = require('path');
      const { promisify } = require('util');
      const zlib = require('zlib');
      
      const gzip = promisify(zlib.gzip);
      
      class FileWorker {
        constructor() {
          this.buffer = [];
          this.stream = null;
          this.config = {};
          this.currentSize = 0;
          this.flushTimer = null;
        }
        
        initialize(config) {
          this.config = config;
          
          // Ensure directory exists
          const dir = path.dirname(config.filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          // Create write stream
          this.stream = fs.createWriteStream(config.filepath, {
            flags: 'a',
            encoding: 'utf8',
            highWaterMark: 64 * 1024  // 64KB buffer
          });
          
          // Start flush timer
          if (config.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
              this.flush();
            }, config.flushInterval);
          }
          
          // Get current file size
          try {
            const stats = fs.statSync(config.filepath);
            this.currentSize = stats.size;
          } catch {
            this.currentSize = 0;
          }
        }
        
        addEntry(entry) {
          this.buffer.push(entry);
          
          // Check if we should flush
          if (this.buffer.length >= (this.config.bufferSize || 10000)) {
            this.flush();
          }
        }
        
        flush() {
          if (this.buffer.length === 0 || !this.stream) return;
          
          // Serialize entries in the worker
          const lines = this.buffer.map(entry => {
            if (this.config.format === 'plain') {
              return \`[\${entry.timestamp}] [\${entry.level}] \${entry.message}\`;
            } else {
              return JSON.stringify(entry);
            }
          });
          
          const chunk = lines.join('\\n') + '\\n';
          this.currentSize += Buffer.byteLength(chunk);
          
          // Write to file
          this.stream.write(chunk);
          
          // Clear buffer
          this.buffer = [];
          
          // Check rotation
          if (this.config.maxFileSize && this.currentSize >= this.config.maxFileSize) {
            this.rotate();
          }
        }
        
        async rotate() {
          if (!this.stream) return;
          
          // Close current stream
          this.stream.end();
          
          // Rename current file
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedPath = this.config.filepath + '.' + timestamp;
          
          try {
            fs.renameSync(this.config.filepath, rotatedPath);
            
            // Compress if configured
            if (this.config.compress) {
              const content = fs.readFileSync(rotatedPath);
              const compressed = await gzip(content);
              fs.writeFileSync(rotatedPath + '.gz', compressed);
              fs.unlinkSync(rotatedPath);
            }
          } catch (error) {
            parentPort.postMessage({
              type: 'error',
              error: error.message
            });
          }
          
          // Create new stream
          this.stream = fs.createWriteStream(this.config.filepath, {
            flags: 'a',
            encoding: 'utf8',
            highWaterMark: 64 * 1024
          });
          
          this.currentSize = 0;
        }
        
        close() {
          // Final flush
          this.flush();
          
          // Clear timer
          if (this.flushTimer) {
            clearInterval(this.flushTimer);
          }
          
          // Close stream
          if (this.stream) {
            this.stream.end();
          }
        }
      }
      
      const worker = new FileWorker();
      
      parentPort.on('message', (msg) => {
        switch (msg.type) {
          case 'init':
            worker.initialize(msg.config);
            parentPort.postMessage({ type: 'ready' });
            break;
            
          case 'log':
            worker.addEntry(msg.entry);
            break;
            
          case 'flush':
            worker.flush();
            parentPort.postMessage({ type: 'flushed' });
            break;
            
          case 'close':
            worker.close();
            parentPort.postMessage({ type: 'closed' });
            break;
        }
      });
    `;

    // Create worker from string
    this.worker = new Worker(workerCode, {
      eval: true,
      workerData: { config: this.config },
    });

    // Set up worker event handlers
    this.worker.on('message', msg => {
      if (msg.type === 'ready') {
        this.ready = true;
        // Process queued entries
        for (const entry of this.initQueue) {
          this.worker?.postMessage({ type: 'log', entry });
        }
        this.initQueue = [];
      } else if (msg.type === 'error') {
        console.error('[WorkerFileTransport] Worker error:', msg.error);
      }
    });

    this.worker.on('error', error => {
      console.error('[WorkerFileTransport] Worker thread error:', error);
    });

    this.worker.on('exit', code => {
      // Exit code 1 is expected when we call terminate()
      if (code !== 0 && code !== 1) {
        console.error(`[WorkerFileTransport] Worker stopped with exit code ${code}`);
      }
      this.worker = null;
      this.ready = false;
    });

    // Initialize the worker
    this.worker.postMessage({
      type: 'init',
      config: this.config,
    });
  }

  /**
   * Logs an entry by passing it to the worker thread.
   *
   * This is the key method that demonstrates the correct architecture:
   * the main thread just passes the raw object to the worker,
   * with no serialization or I/O happening on the main thread.
   *
   * @param {LogEntry} entry - The log entry.
   * @returns {void}
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    if (!this.worker) {
      this.initializeWorker();
      // Queue entry while worker is initializing
      this.initQueue.push(entry);
      return;
    }

    if (!this.ready) {
      // Queue entry while worker is initializing
      this.initQueue.push(entry);
      return;
    }

    // Pass raw object to worker - no serialization here!
    this.worker.postMessage({ type: 'log', entry });
  }

  /**
   * Flushes the worker's buffer.
   *
   * @returns {Promise<void>}
   */
  public async flush(): Promise<void> {
    return new Promise(resolve => {
      if (!this.worker || !this.ready) {
        resolve();
        return;
      }

      const handler = (msg: { type: string }) => {
        if (msg.type === 'flushed') {
          this.worker?.off('message', handler);
          resolve();
        }
      };

      this.worker.on('message', handler);
      this.worker.postMessage({ type: 'flush' });

      // Timeout after 5 seconds
      setTimeout(() => {
        this.worker?.off('message', handler);
        resolve();
      }, 5000);
    });
  }

  /**
   * Closes the transport and terminates the worker.
   *
   * @returns {Promise<void>}
   * @protected
   */
  protected async doClose(): Promise<void> {
    if (!this.worker) return;

    return new Promise(resolve => {
      const handler = (msg: { type: string }) => {
        if (msg.type === 'closed') {
          this.worker?.terminate();
          this.worker = null;
          resolve();
        }
      };

      this.worker?.on('message', handler);
      this.worker?.postMessage({ type: 'close' });

      // Force terminate after 5 seconds
      setTimeout(() => {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        resolve();
      }, 5000);
    });
  }

  /**
   * Initializes the transport.
   *
   * @returns {Promise<void>}
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Worker is initialized in constructor
    // Wait for ready signal
    if (!this.ready) {
      await new Promise<void>(resolve => {
        const checkReady = () => {
          if (this.ready) {
            resolve();
          } else {
            setTimeout(checkReady, 10);
          }
        };
        checkReady();
      });
    }
  }
}
