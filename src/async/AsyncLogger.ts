/**
 * @fileoverview Asynchronous logger with true non-blocking I/O using worker threads.
 *
 * Provides high-performance logging that doesn't block the main event loop by
 * offloading serialization and I/O to a dedicated worker thread pool.
 *
 * @module async/AsyncLogger
 * @author MagicLogger Contributors
 * @copyright 2024 MagicLogger
 * @license MIT
 * @since 1.0.0
 *
 * @example Basic usage
 * ```typescript
 * import { AsyncLogger } from 'magiclogger';
 *
 * const logger = new AsyncLogger({
 *   transports: [new ConsoleTransport()],
 *   worker: { poolSize: 2 }
 * });
 *
 * logger.info('Application started');
 * await logger.close();
 * ```
 *
 * @example With metrics monitoring
 * ```typescript
 * const logger = new AsyncLogger({
 *   enableMetrics: true,
 *   worker: {
 *     poolSize: 4,
 *     batchSize: 1000,
 *     flushInterval: 100
 *   }
 * });
 *
 * logger.on('metrics', (metrics) => {
 *   console.log(`Processed: ${metrics.totalLogs}`);
 *   console.log(`Worker utilization: ${metrics.workerUtilization}%`);
 * });
 * ```
 *
 * @example Custom onFlush callback
 * ```typescript
 * const logger = new AsyncLogger({
 *   onFlush: (entries) => {
 *     // Custom processing of flushed entries
 *     console.log(`Flushing ${entries.length} log entries`);
 *   }
 * });
 * ```
 */

import { Worker } from 'node:worker_threads';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { EventEmitter } from 'events';
import { StyleBuilder } from '../core/StyleBuilder';
import { TemplateParser } from '../parsers/TemplateParser';
import type { IStyleBuilder, TemplateFormatter } from '../types/styling';
import type { LogEntry, Transport } from '../types/transport';
import type { LogLevel } from '../types/logger';
import { SyncConsoleTransport } from '../transports/SyncConsoleTransport';

/**
 * High-performance ring buffer for lock-free log storage.
 *
 * Provides O(1) push/pop operations with zero memory allocation after init.
 * When full, old logs are overwritten (circular buffer behavior).
 *
 * @class RingBuffer
 * @since 3.0.0
 */
class RingBuffer {
  private buffer: Array<LogEntry | null>;
  private capacity: number;
  private writeIndex = 0;
  private readIndex = 0;
  private size = 0;

  /**
   * Creates a ring buffer with specified capacity.
   * Capacity is rounded up to nearest power of 2 for fast modulo.
   *
   * @param {number} capacity - Buffer capacity
   */
  constructor(capacity = 8192) {
    // Round up to power of 2 for fast bitwise modulo
    this.capacity = 1 << Math.ceil(Math.log2(capacity));
    this.buffer = new Array(this.capacity).fill(null);
  }

  /**
   * Adds entry to ring buffer.
   * If buffer is full, overwrites oldest entry.
   *
   * @param {LogEntry} entry - Log entry to add
   * @returns {boolean} True if added, false if overwritten
   */
  push(entry: LogEntry): boolean {
    const index = this.writeIndex & (this.capacity - 1);
    const overwritten = this.size === this.capacity;

    this.buffer[index] = entry;
    this.writeIndex++;

    if (overwritten) {
      this.readIndex++;
    } else {
      this.size++;
    }

    return !overwritten;
  }

  /**
   * Removes and returns entries up to specified count.
   *
   * @param {number} count - Maximum entries to retrieve
   * @returns {LogEntry[]} Array of entries
   */
  drain(count = this.size): LogEntry[] {
    const result: LogEntry[] = [];
    const toDrain = Math.min(count, this.size);

    for (let i = 0; i < toDrain; i++) {
      const index = this.readIndex & (this.capacity - 1);
      const entry = this.buffer[index];
      if (entry) {
        result.push(entry);
        this.buffer[index] = null; // Free reference for GC
      }
      this.readIndex++;
      this.size--;
    }

    return result;
  }

  /**
   * Gets current buffer size.
   *
   * @returns {number} Number of entries in buffer
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Gets the capacity of the buffer.
   *
   * @returns {number} Buffer capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Checks if buffer is full.
   *
   * @returns {boolean} True if at capacity
   */
  isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * Clears all entries from buffer.
   */
  clear(): void {
    this.buffer.fill(null);
    this.writeIndex = 0;
    this.readIndex = 0;
    this.size = 0;
  }
}

/**
 * Configuration options for the AsyncLogger.
 *
 * @interface AsyncLoggerOptions
 * @since 1.0.0
 */
export interface AsyncLoggerOptions {
  /** Array of transports to use for output */
  transports?: Transport[];
  /** Unique identifier for this logger instance */
  id?: string;
  /** Service name for MAGIC schema compliance */
  service?: string;
  /** Enable performance metrics collection */
  enableMetrics?: boolean;
  /** Callback when logs are flushed */
  onFlush?: (entries: LogEntry[]) => void | Promise<void>;
  /** Whether to use console transport by default (default: true) */
  useConsole?: boolean;
  /** Whether to enable color/style support (default: true) */
  useColors?: boolean;
  /**
   * Enable timestamp caching for performance (default: true).
   * When enabled, timestamps are cached for 10ms windows with microsecond increments.
   * Disable for audit logs that require exact timestamps.
   */
  timestampCaching?: boolean;
  /** Buffer configuration (for backward compatibility with tests) */
  buffer?: {
    /** Buffer size/capacity */
    size?: number;
    /** Flush interval in ms */
    flushInterval?: number;
  };
  /** Worker thread configuration */
  worker?: {
    /** Number of worker threads (default: 2) */
    poolSize?: number;
    /** Batch size before auto-flush (default: 100) */
    batchSize?: number;
    /** Timeout before auto-flush in ms (default: 10) */
    batchTimeout?: number;
    /** Periodic flush interval in ms (default: 0 - disabled) */
    flushInterval?: number;
    /** Enable worker threads (default: false) */
    enabled?: boolean;
    /** Use ring buffer for high-performance (default: false) */
    useRingBuffer?: boolean;
  };
  /** Ring buffer configuration */
  ringBuffer?: {
    /** Enable ring buffer for better performance (default: true) */
    enabled?: boolean;
    /** Buffer capacity, power of 2 (default: 8192) */
    capacity?: number;
  };
}

/**
 * Performance metrics for monitoring logger health.
 *
 * @interface AsyncLoggerMetrics
 * @since 1.0.0
 */
interface AsyncLoggerMetrics {
  /** Total number of log entries processed */
  totalLogs: number;
  /** Number of batches sent to workers */
  batchesSent: number;
  /** Current batch size */
  batchSize: number;
  /** Average batch size over time */
  avgBatchSize: number;
  /** Number of dropped logs due to backpressure */
  droppedLogs: number;
  /** Current worker pool utilization */
  workerUtilization: number;
}

/**
 * Message types for worker communication protocol.
 *
 * @enum {string}
 * @readonly
 * @since 1.0.0
 */
const WorkerMessageType = {
  INIT: 'INIT',
  LOG_BATCH: 'LOG_BATCH',
  FLUSH: 'FLUSH',
  SHUTDOWN: 'SHUTDOWN',
  READY: 'READY',
  ACK: 'ACK',
  ERROR: 'ERROR',
  METRICS: 'METRICS',
} as const;

/**
 * Worker thread wrapper for managed lifecycle.
 *
 * @class WorkerThread
 * @since 1.0.0
 */
class WorkerThread extends EventEmitter {
  private worker: Worker | null = null;
  private ready = false;
  private processing = 0;
  private readonly id: number;

  /**
   * Creates a new worker thread wrapper.
   *
   * @param {number} id - Worker ID for identification
   * @param {string} workerPath - Path to worker script
   */
  constructor(id: number, workerPath: string) {
    super();
    this.id = id;
    this.initWorker(workerPath);
  }

  /**
   * Initializes the worker thread and sets up communication.
   *
   * @private
   * @param {string} workerPath - Path to worker script
   * @returns {void}
   */
  private initWorker(workerPath: string): void {
    // Worker files need proper extension - use .cjs for CommonJS environments
    // The async worker should work with both .js and .cjs but .cjs is more compatible
    let finalWorkerPath = workerPath;

    // Always try .cjs first if the original path ends with .js
    // This provides better compatibility across different module systems
    if (workerPath.endsWith('.js') && !workerPath.includes('AsyncLoggerWorker.cjs')) {
      const cjsPath = workerPath.replace(/\.js$/, '.cjs');
      finalWorkerPath = cjsPath;
    }

    this.worker = new Worker(finalWorkerPath, {
      workerData: { workerId: this.id },
      // Add eval option to support both CJS and ESM contexts
      eval: false,
    });

    this.worker.on('message', msg => {
      switch (msg.type) {
        case WorkerMessageType.READY:
          this.ready = true;
          this.emit('ready');
          break;
        case WorkerMessageType.ACK:
          this.processing--;
          this.emit('processed', msg.payload);
          break;
        case WorkerMessageType.ERROR:
          this.emit('error', new Error(msg.error));
          break;
        case WorkerMessageType.METRICS:
          this.emit('metrics', msg.payload);
          break;
      }
    });

    this.worker.on('error', error => {
      this.emit('error', error);
    });

    this.worker.on('exit', code => {
      if (code !== 0) {
        this.emit('error', new Error(`Worker ${this.id} exited with code ${code}`));
      }
      this.worker = null;
      this.ready = false;
    });
  }

  /**
   * Sends a message to the worker thread.
   *
   * @param {any} message - Message to send
   * @returns {boolean} Success status
   */
  send(message: unknown): boolean {
    if (!this.ready || !this.worker) return false;
    this.processing++;
    this.worker.postMessage(message);
    return true;
  }

  /**
   * Gets the current load on this worker.
   *
   * @returns {number} Number of pending operations
   */
  getLoad(): number {
    return this.processing;
  }

  /**
   * Checks if the worker is available for processing.
   *
   * @returns {boolean} Availability status
   */
  isAvailable(): boolean {
    return this.ready && this.processing < 100; // Increased to 100 concurrent ops per worker for better throughput
  }

  /**
   * Terminates the worker thread gracefully.
   *
   * @returns {Promise<void>} Resolves when terminated
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      this.worker.postMessage({ type: WorkerMessageType.SHUTDOWN });
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

/**
 * High-performance asynchronous logger optimized for minimal latency.
 *
 * Provides efficient batched logging with optional worker thread support.
 * Worker threads are OFF by default for lowest latency. Enable only for
 * CPU-intensive workloads with worker.enabled: true.
 *
 * @class AsyncLogger
 * @extends {EventEmitter}
 * @since 1.0.0
 *
 * @example Basic usage
 * ```typescript
 * const logger = new AsyncLogger({
 *   transports: [new ConsoleTransport()],
 *   worker: { poolSize: 2 }
 * });
 *
 * // Non-blocking log operations
 * logger.info('Server started');
 * logger.error('Connection failed', { host: 'db.example.com' });
 *
 * // Graceful shutdown
 * await logger.close();
 * ```
 *
 * @example With metrics monitoring
 * ```typescript
 * const logger = new AsyncLogger({
 *   enableMetrics: true,
 *   worker: {
 *     poolSize: 4,
 *     batchSize: 1000
 *   }
 * });
 *
 * // Monitor performance
 * logger.on('metrics', (metrics) => {
 *   console.log(`Processed: ${metrics.totalLogs}`);
 *   console.log(`Worker utilization: ${metrics.workerUtilization}%`);
 * });
 * ```
 */
export class AsyncLogger extends EventEmitter {
  /** @private {Transport[]} Active transports */
  private readonly transports: Transport[];

  /** @private {string} Logger instance ID */
  private readonly id: string;

  /** @private {string | undefined} Service name for MAGIC schema */
  private readonly service?: string;

  /** @private {boolean} Whether to use colors */
  private readonly useColors: boolean;

  /** @private {StyleBuilder} Style builder instance for chainable styling */
  private readonly styleBuilder: StyleBuilder;

  /** @private {TemplateParser} Template parser instance for template literal styling */
  private readonly templateParser: TemplateParser;

  /** @private {TemplateFormatter} Cached template formatter function */
  private readonly templateFormatter: TemplateFormatter;

  /** @private {any} Cached TextStyler class for style processing */
  private textStyler: any = null;

  /** @private {number} Counter for unique ID generation */
  private idCounter = 0;

  /** @private {number} Last timestamp used for ID generation */
  private lastTimestamp = 0;

  /** @private {number} Cached timestamp for performance */
  private cachedTimestamp = 0;

  /** @private {number} When cached timestamp expires */
  private cacheExpiry = 0;

  /** @private {number} Microsecond offset within cache window */
  private microOffset = 0;

  /** @private {boolean} Whether to use timestamp caching for performance */
  private readonly timestampCaching: boolean;

  /** @private {WorkerThread[]} Worker thread pool */
  private workers: WorkerThread[] = [];

  /** @private {number} Current worker index for round-robin */
  private currentWorker = 0;

  /** @private {LogEntry[]} Batch buffer - will be replaced by ring buffer */
  private batch: LogEntry[] = [];

  /** @private {RingBuffer | null} Ring buffer for lock-free log storage */
  private ringBuffer: RingBuffer | null = null;

  /** @private {boolean} Use ring buffer instead of array */
  private useRingBuffer = false;

  /** @private {NodeJS.Timeout | null} Batch flush timer */
  private batchTimer: NodeJS.Timeout | null = null;

  /** @private {NodeJS.Timeout | null} Periodic flush timer */
  private flushTimer: NodeJS.Timeout | null = null;

  /** @private {AsyncLoggerMetrics} Performance metrics */
  private readonly metrics: AsyncLoggerMetrics = {
    totalLogs: 0,
    batchesSent: 0,
    batchSize: 0,
    avgBatchSize: 0,
    droppedLogs: 0,
    workerUtilization: 0,
  };

  /** @private {boolean} Metrics collection enabled */
  private readonly enableMetrics: boolean;

  /** @private {number} Batch size configuration */
  private readonly batchSize: number;

  /** @private {number} Batch timeout configuration */
  private readonly batchTimeout: number;

  /** @private {number} Flush interval configuration */
  private readonly flushInterval: number;

  /** @private {boolean} Worker threads enabled - default false for better performance */
  private readonly useWorkers: boolean;

  /** @private {number} Worker pool size */
  private readonly poolSize: number;

  /** @private {(entries: LogEntry[]) => void | Promise<void> | undefined} Callback for flush events */
  private readonly onFlush?: (entries: LogEntry[]) => void | Promise<void>;

  /** @private {boolean} Logger initialization state */
  private initialized = false;

  /** @private {Promise<void>} Initialization promise */
  private initPromise: Promise<void>;

  /** @private {boolean} Logger is closing */
  private isClosing = false;

  /** @private {Set<Transport>} Transports that have been closed */
  private closedTransports = new Set<Transport>();

  /**
   * Creates a new AsyncLogger instance.
   *
   * @param {AsyncLoggerOptions} [options={}] - Configuration options
   * @throws {Error} If worker thread creation fails
   */
  constructor(options: AsyncLoggerOptions = {}) {
    super();

    /**
     * Initialize transports with intelligent defaults.
     * When no transports are provided, a console transport is added by default
     * unless explicitly disabled via useConsole: false.
     */
    if (options.transports && options.transports.length > 0) {
      this.transports = options.transports;
    } else if (options.useConsole !== false) {
      this.transports = [new SyncConsoleTransport({ name: 'console' })];
    } else {
      this.transports = [];
    }

    /**
     * Configure the flush callback for batch processing.
     * The onFlush callback is invoked when log entries need to be written
     * to transports. If not provided, a default implementation writes to
     * all configured transports.
     */
    this.onFlush =
      options.onFlush ||
      ((entries: LogEntry[]) => {
        /**
         * Default flush implementation sends entries to all transports.
         * PERFORMANCE: Batch write to transports that support it.
         */
        for (const transport of this.transports) {
          try {
            // Check if transport supports batch writing
            if ('logBatch' in transport && typeof (transport as any).logBatch === 'function') {
              // Send entire batch at once for maximum performance
              (transport as any).logBatch(entries);
            } else {
              // Fallback to individual writes
              for (const entry of entries) {
                // Use sync method if available for better performance
                if ('logSync' in transport && typeof (transport as any).logSync === 'function') {
                  (transport as any).logSync(entry);
                } else {
                  transport.log(entry);
                }
              }
            }
          } catch (error) {
            /**
             * Transport errors are caught to prevent one failing transport
             * from affecting others. Errors are only logged in non-test
             * environments to avoid noise during testing.
             */
            if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
              console.error(`[${this.id}] Transport ${transport.name} error:`, error);
            }
          }
        }
      });

    this.id = options.id || `async-logger-${Date.now()}`;
    this.service = options.service;
    this.enableMetrics = options.enableMetrics || false;
    this.useColors = options.useColors !== false; // Default to true for styling support

    this.styleBuilder = new StyleBuilder(this.useColors);
    this.templateParser = new TemplateParser(this.useColors);
    this.templateFormatter = this.templateParser.createFormatter();

    // Timestamp caching enabled by default for performance
    // Can be disabled for audit logs requiring exact timestamps
    this.timestampCaching = options.timestampCaching ?? true;

    // Worker configuration - OFF by default for better performance
    // Workers add IPC overhead and are only beneficial for CPU-intensive workloads
    const workerConfig = options.worker || {};
    this.poolSize = workerConfig.poolSize || 2;
    // Batch configuration - defaults optimized for async performance
    // batchSize: 100 - accumulate logs before flushing for better throughput
    // batchTimeout: 10ms - flush after timeout even if batch not full for low latency
    this.batchSize = workerConfig.batchSize ?? options.buffer?.size ?? 100;
    this.batchTimeout = workerConfig.batchTimeout ?? 10; // 10ms default for time-based batching
    this.flushInterval = workerConfig.flushInterval || options.buffer?.flushInterval || 0; // No periodic flush needed
    // PERFORMANCE: Workers OFF by default to avoid IPC overhead
    // Only enable for CPU-intensive workloads with worker.enabled: true
    this.useWorkers = workerConfig.enabled === true && typeof Worker !== 'undefined';

    // Ring buffer configuration - OFF by default for better performance
    // Only enable for burst protection scenarios (adds ~40% overhead)
    const ringBufferConfig = options.ringBuffer || {};
    this.useRingBuffer = ringBufferConfig.enabled === true && !this.useWorkers;

    // Initialize ring buffer if enabled and not using workers
    // Workers have their own ring buffer implementation
    if (this.useRingBuffer) {
      const capacity = ringBufferConfig.capacity || 8192;
      this.ringBuffer = new RingBuffer(capacity);
      // Only log in debug environments to avoid leaking info in production
      if (
        (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'debug') &&
        !process.env.JEST_WORKER_ID
      ) {
        console.log(`[${this.id}] Using ring buffer with capacity ${capacity}`);
      }
    }

    // Initialize based on worker availability
    this.initPromise = this.initialize();
  }

  /**
   * Initializes the logger and worker thread pool.
   *
   * @private
   * @returns {Promise<void>} Resolves when initialization complete
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.useWorkers) {
      try {
        await this.initializeWorkers();
      } catch (error) {
        // Only log in non-test environments to avoid Jest warnings
        if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
          console.warn(`[${this.id}] Worker initialization failed, using fallback:`, error);
        }
        this.setupFallbackMode();
      }
    } else {
      this.setupFallbackMode();
    }

    // Skip periodic flush timer when interval is 0
    // Direct mode doesn't need periodic flushing
    if (this.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        // Use async IIFE to handle the Promise
        (async () => {
          await this.flush();
        })();
      }, this.flushInterval);

      // Allow process to exit even if timer is active (for tests)
      if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
        this.flushTimer.unref();
      }
    }

    this.initialized = true;
    this.emit('ready');
  }

  /**
   * Initializes the worker thread pool for parallel log processing.
   *
   * Worker threads provide true parallelism for CPU-intensive operations
   * like serialization and compression, keeping the main thread responsive.
   *
   * @private
   * @returns {Promise<void>} Resolves when workers are ready
   * @throws {Error} If worker initialization fails
   */
  private async initializeWorkers(): Promise<void> {
    /**
     * Worker threads are disabled in test environments because:
     * 1. Jest doesn't support worker threads with TypeScript
     * 2. Tests need synchronous, predictable behavior
     * 3. Worker overhead isn't worth it for small test datasets
     */
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
      throw new Error('Worker threads disabled in test environment');
    }

    /**
     * Resolve worker script path based on the runtime environment.
     * The worker script must be a compiled JavaScript file.
     */
    let workerPath = '';

    /**
     * Strategy 1: Check for __dirname (CommonJS environments).
     * This is the most reliable method when available.
     */
    if (typeof __dirname !== 'undefined') {
      // In CommonJS, use .cjs extension for better compatibility
      workerPath = join(__dirname, 'AsyncLoggerWorker.cjs');
    } else if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      /**
       * Strategy 2: For ESM environments, we skip dynamic import.meta detection
       * to avoid bundler issues and potential runtime errors.
       * Instead, we rely on the build output structure being predictable.
       */
      // For ESM environments, we need to find the worker file without using require('fs')
      // Strategy: Use import.meta.url if available, otherwise use process.cwd()

      // Try to determine the best path based on current working directory
      // Since we can't use import.meta.url reliably in all contexts, we'll use cwd-based detection
      {
        // Fallback: Use predictable paths relative to cwd
        // Most common case: running from project root or scripts/performance
        const cwd = process.cwd();
        const possiblePaths = [
          // Running from project root - try .cjs first for better compatibility
          join(cwd, 'dist', 'async', 'AsyncLoggerWorker.cjs'),
          join(cwd, 'dist', 'async', 'AsyncLoggerWorker.js'),
          // Running from scripts/performance
          join(cwd, '..', '..', 'dist', 'async', 'AsyncLoggerWorker.cjs'),
          join(cwd, '..', '..', 'dist', 'async', 'AsyncLoggerWorker.js'),
          // Running from scripts
          join(cwd, '..', 'dist', 'async', 'AsyncLoggerWorker.cjs'),
          join(cwd, '..', 'dist', 'async', 'AsyncLoggerWorker.js'),
          // Running from dist
          join(cwd, 'async', 'AsyncLoggerWorker.cjs'),
          join(cwd, 'async', 'AsyncLoggerWorker.js'),
        ];

        // Try each path - first one wins
        // We can't check if file exists in ESM without fs, so we'll just try the most likely path
        workerPath = possiblePaths[0] || '';

        // For scripts/performance directory specifically - prefer .cjs
        if (cwd.includes('scripts') && cwd.includes('performance')) {
          workerPath = join(cwd, '..', '..', 'dist', 'async', 'AsyncLoggerWorker.cjs');
        } else if (cwd.endsWith('scripts')) {
          workerPath = join(cwd, '..', 'dist', 'async', 'AsyncLoggerWorker.cjs');
        }
      }
    } else {
      /**
       * Strategy 3: Use relative path from dist folder.
       * This works in production builds where files are compiled.
       */
      /**
       * Try multiple possible locations for the worker file.
       * This handles different build configurations.
       */
      const possiblePaths = [
        join(process.cwd(), 'dist', 'async', 'AsyncLoggerWorker.js'),
        join(process.cwd(), 'dist', 'AsyncLoggerWorker.js'),
        join(process.cwd(), 'lib', 'async', 'AsyncLoggerWorker.js'),
        join(process.cwd(), 'build', 'async', 'AsyncLoggerWorker.js'),
      ];

      /**
       * Find the first existing worker file.
       */
      for (const candidatePath of possiblePaths) {
        if (existsSync(candidatePath)) {
          workerPath = candidatePath;
          break;
        }
      }

      /**
       * If no worker file found, use the first candidate.
       * The error will be caught and handled gracefully.
       */
      if (!workerPath) {
        workerPath = possiblePaths[0] || '';
      }
    }

    // Ensure workerPath is assigned
    if (!workerPath) {
      throw new Error('Unable to determine worker path');
    }

    // Create worker pool
    const workerPromises: Promise<void>[] = [];

    for (let i = 0; i < this.poolSize; i++) {
      const worker = new WorkerThread(i, workerPath);

      const readyPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Worker ${i} initialization timeout`));
        }, 5000);

        worker.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });

        worker.once('error', error => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.workers.push(worker);
      workerPromises.push(readyPromise);

      // Set up worker event handlers
      worker.on('error', error => {
        // Only log in non-test environments to avoid Jest warnings
        if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
          console.error(`[${this.id}] Worker ${i} error:`, error);
        }
      });

      worker.on('metrics', metrics => {
        if (this.enableMetrics) {
          this.updateMetrics(metrics);
        }
      });
    }

    // Wait for all workers to be ready
    await Promise.all(workerPromises);

    // Initialize workers with transports
    for (const worker of this.workers) {
      worker.send({
        type: WorkerMessageType.INIT,
        transports: this.transports.map(t => ({
          name: t.name,
          type: 'custom', // Transport interface doesn't have type property
        })),
      });
    }
  }

  /**
   * Sets up fallback mode without worker threads.
   *
   * @private
   * @returns {void}
   */
  private setupFallbackMode(): void {
    // In fallback mode, we use setImmediate for async behavior
    // Only log in non-test environments to avoid Jest warnings
    if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
      console.info(`[${this.id}] Running in fallback mode without worker threads`);
    }
  }

  /**
   * Updates performance metrics.
   *
   * @private
   * @param {Partial<AsyncLoggerMetrics>} updates - Metric updates
   * @returns {void}
   */
  private updateMetrics(updates: Partial<AsyncLoggerMetrics>): void {
    Object.assign(this.metrics, updates);
    this.emit('metrics', { ...this.metrics });
  }

  /**
   * Selects the next available worker using round-robin.
   *
   * @private
   * @returns {WorkerThread | null} Selected worker or null
   */
  private selectWorker(): WorkerThread | null {
    if (this.workers.length === 0) return null;

    // Try to find an available worker
    for (let i = 0; i < this.workers.length; i++) {
      const idx = (this.currentWorker + i) % this.workers.length;
      const worker = this.workers[idx];
      if (!worker) continue;

      if (worker.isAvailable()) {
        this.currentWorker = (idx + 1) % this.workers.length;
        return worker;
      }
    }

    // All workers busy, use least loaded
    let minLoad = Infinity;
    let selected = this.workers[0];
    if (!selected) return null;

    for (const worker of this.workers) {
      const load = worker.getLoad();
      if (load < minLoad) {
        minLoad = load;
        selected = worker;
      }
    }

    return selected;
  }

  /**
   * Adds a log entry to the batch buffer.
   * Uses efficient batching to reduce I/O overhead.
   *
   * @private
   * @param {LogEntry} entry - Log entry to buffer
   * @returns {void}
   */
  private addToBatch(entry: LogEntry): void {
    // Use ring buffer if available for better performance
    if (this.useRingBuffer && this.ringBuffer) {
      const added = this.ringBuffer.push(entry);

      if (!added && this.enableMetrics) {
        // Log was overwritten due to full buffer
        this.metrics.droppedLogs++;
      }

      if (this.enableMetrics) {
        this.metrics.batchSize = this.ringBuffer.getSize();
        this.metrics.totalLogs++;
      }

      // Auto-flush when ring buffer reaches batch size
      if (this.ringBuffer.getSize() >= this.batchSize) {
        this.flushSync(); // Use synchronous flush for better performance
        return;
      }
    } else {
      // Fallback to array-based batching
      this.batch.push(entry);

      if (this.enableMetrics) {
        this.metrics.batchSize = this.batch.length;
        this.metrics.totalLogs++;
      }

      // Auto-flush when batch is full
      if (this.batch.length >= this.batchSize) {
        this.flushSync(); // Use synchronous flush for better performance
        return;
      }
    }

    // Schedule batch flush with timeout (for both ring buffer and array)
    // Only schedule if we haven't already flushed above
    if (this.batchTimeout > 0 && !this.batchTimer) {
      // Use setTimeout only when there's an actual timeout
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        this.flushSync();
      }, this.batchTimeout);
    }
  }

  /**
   * Synchronous flush for better performance in hot path.
   * Used internally to avoid Promise overhead.
   *
   * @private
   * @returns {void}
   */
  private flushSync(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Get entries from ring buffer or array batch
    let entries: LogEntry[];
    if (this.useRingBuffer && this.ringBuffer && this.ringBuffer.getSize() > 0) {
      entries = this.ringBuffer.drain(this.batchSize);
    } else if (this.batch.length > 0) {
      // Convert minimal entries to full LogEntry objects at flush time
      const rawBatch = [...this.batch];
      this.batch = [];

      // Process minimal entries into full entries
      entries = rawBatch.map((item: any) => {
        // Check if it's a minimal entry (has 'm' key) or already a full entry
        if ('m' in item) {
          // Convert minimal entry to full LogEntry
          const timestampMs = item.t || Date.now();
          return {
            id: this.generateId(timestampMs),
            timestampMs,
            level: item.l || 'info',
            message: item.m,
            context: item.x,
          } as LogEntry;
        }
        // Already a full entry
        return item as LogEntry;
      });
    } else {
      return; // Nothing to flush
    }

    if (entries.length === 0) return;

    // PERFORMANCE: Skip deferred style processing when batch size is 1
    // Styles are already processed in logInternal for better performance

    if (this.enableMetrics) {
      this.metrics.batchesSent++;
      this.metrics.avgBatchSize =
        (this.metrics.avgBatchSize * (this.metrics.batchesSent - 1) + entries.length) /
        this.metrics.batchesSent;
      this.metrics.batchSize = 0;
    }

    // PERFORMANCE: Direct synchronous write for non-worker mode
    if (this.workers.length === 0 && this.onFlush) {
      try {
        // Call onFlush synchronously - transports should use logSync/logBatch
        const result = this.onFlush(entries);
        // Handle promises that might be returned
        if (result && typeof result === 'object' && 'then' in result) {
          (result as Promise<void>).catch(error => {
            if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
              console.error(`[${this.id}] Async flush error:`, error);
            }
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
          console.error(`[${this.id}] Sync flush error:`, error);
        }
      }
    } else if (this.workers.length > 0) {
      // Worker path - still async but not used in default config
      const worker = this.selectWorker();
      if (worker) {
        worker.send({
          type: WorkerMessageType.LOG_BATCH,
          payload: entries,
        });
      }
    }
  }

  /**
   * Flushes the current batch to workers or transports.
   * Optimized with fast path for non-worker mode.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when flush is complete
   */
  public async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Get entries from ring buffer or array batch
    let entries: LogEntry[] | undefined;
    if (this.useRingBuffer && this.ringBuffer && this.ringBuffer.getSize() > 0) {
      entries = this.ringBuffer.drain(this.batchSize);
    } else if (this.batch.length > 0) {
      // Convert minimal entries to full LogEntry objects at flush time
      const rawBatch = [...this.batch];
      this.batch = [];

      // Process minimal entries into full entries
      entries = rawBatch.map((item: any) => {
        // Check if it's a minimal entry (has 'm' key) or already a full entry
        if ('m' in item) {
          // Convert minimal entry to full LogEntry
          const timestampMs = item.t || Date.now();
          return {
            id: this.generateId(timestampMs),
            timestampMs,
            level: item.l || 'info',
            message: item.m,
            context: item.x,
          } as LogEntry;
        }
        // Already a full entry
        return item as LogEntry;
      });
    }

    if (entries && entries.length > 0) {
      if (this.enableMetrics) {
        this.metrics.batchesSent++;
        this.metrics.avgBatchSize =
          (this.metrics.avgBatchSize * (this.metrics.batchesSent - 1) + entries.length) /
          this.metrics.batchesSent;
        this.metrics.batchSize = 0;
      }

      // PERFORMANCE: Fast path for non-worker mode (most common)
      if (this.workers.length === 0 && this.onFlush) {
        try {
          const result = this.onFlush(entries);
          // Only await if result is a promise
          if (result && typeof result === 'object' && 'then' in result) {
            await (result as Promise<void>).catch(error => {
              if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
                console.error(`[${this.id}] Async flush error:`, error);
              }
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
            console.error(`[${this.id}] Flush error:`, error);
          }
        }
      } else if (this.workers.length > 0) {
        // Worker path
        const worker = this.selectWorker();
        if (worker) {
          worker.send({
            type: WorkerMessageType.LOG_BATCH,
            payload: entries,
          });

          if (this.enableMetrics) {
            const totalLoad = this.workers.reduce((sum, w) => sum + w.getLoad(), 0);
            const maxLoad = this.workers.length * 10;
            this.metrics.workerUtilization = (totalLoad / maxLoad) * 100;
          }
        } else {
          // All workers overloaded, drop logs
          if (this.enableMetrics) {
            this.metrics.droppedLogs += entries.length;
          }
          if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
            console.warn(`[${this.id}] Dropping ${entries.length} logs due to backpressure`);
          }
        }
      }
    }

    // Always flush transports regardless of whether we had entries
    const flushPromises = this.transports
      .filter(t => typeof t.flush === 'function')
      .map(t => (t.flush as () => Promise<void>)());

    if (flushPromises.length > 0) {
      await Promise.all(flushPromises);
    }
  }

  /**
   * Internal log method optimized for minimal allocations.
   * When workers are disabled, processes styles in main thread.
   * When workers are enabled, defers style processing to worker.
   *
   * @private
   * @param {string} message - Log message
   * @param {LogLevel} level - Log level
   * @param {Record<string, unknown>} [meta] - Metadata
   * @returns {{ success: boolean }} Result of the log operation
   */
  private logInternal(
    message: string,
    level: LogLevel,
    meta?: Record<string, unknown>
  ): { success: boolean } {
    // PERFORMANCE: Ultra-fast path for batching mode with minimal overhead
    // When batching, skip most processing and just queue the raw data
    if (this.batchSize > 1 && !this.useWorkers && !this.useRingBuffer) {
      // Minimal entry for batching - defer all processing to flush time
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const minimalEntry: any = {
        m: message, // Short key for message
        l: level, // Short key for level
        t: Date.now(), // Timestamp
        x: meta, // Short key for context/meta
      };

      this.batch.push(minimalEntry);

      if (this.enableMetrics) {
        this.metrics.batchSize = this.batch.length;
        this.metrics.totalLogs++;
      }

      // Auto-flush when batch is full
      if (this.batch.length >= this.batchSize) {
        this.flushSync();
        return { success: true };
      }

      // Schedule batch flush with timeout
      if (this.batchTimeout > 0 && !this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.batchTimer = null;
          this.flushSync();
        }, this.batchTimeout);
      }

      return { success: true };
    }

    // Original full processing path for non-batching or special cases
    const timestampMs = this.getOptimizedTimestamp();

    let processedMessage = message;
    let styles: Array<[number, number, string]> | undefined;

    const hasStyles = this.useColors && message.indexOf('<') !== -1 && message.indexOf('</') !== -1;

    if (!this.useWorkers && hasStyles && this.batchSize > 1) {
      if (!this.textStyler) {
        const { TextStyler } =
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('../utils/TextStyler') as typeof import('../utils/TextStyler');
        this.textStyler = TextStyler;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = this.textStyler!.parseBracketsWithExtraction(message, this.useColors);
      processedMessage = result.plainText;
      styles = result.styles;
    }

    const entry: LogEntry = {
      id: this.generateId(timestampMs),
      timestampMs,
      level,
      message: processedMessage,
    } as LogEntry;

    if (styles?.length) {
      entry.styles = styles;
    }

    if (this.useWorkers && message.includes('<')) {
      entry.context = {
        _rawMessage: message,
        _useColors: this.useColors,
        ...(meta || {}),
      };
    } else if (meta && Object.keys(meta).length > 0) {
      entry.context = meta;
    }

    if (this.service) {
      entry.service = this.service;
    }

    if (this.id && !this.id.startsWith('async-logger-')) {
      entry.loggerId = this.id;
    }

    // Direct mode when batch size is 1
    if (this.batchSize === 1 && !this.useRingBuffer && !this.useWorkers) {
      if (this.onFlush) {
        try {
          const result = this.onFlush([entry]);
          if (result && typeof result === 'object' && 'then' in result) {
            (result as Promise<void>).catch(() => {
              if (this.enableMetrics) {
                this.metrics.droppedLogs++;
              }
            });
          }
        } catch (error) {
          if (this.enableMetrics) {
            this.metrics.droppedLogs++;
          }
        }
      } else {
        for (const transport of this.transports) {
          try {
            if ('logSync' in transport && typeof (transport as any).logSync === 'function') {
              (transport as any).logSync(entry);
            } else {
              const promise = transport.log(entry);
              if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                  if (this.enableMetrics) {
                    this.metrics.droppedLogs++;
                  }
                });
              }
            }
          } catch (error) {
            if (this.enableMetrics) {
              this.metrics.droppedLogs++;
            }
          }
        }
      }

      if (this.enableMetrics) {
        this.metrics.totalLogs++;
      }

      return { success: true };
    }

    this.addToBatch(entry);
    return { success: true };
  }

  /**
   * Generates a unique ID for log entries.
   * Uses counter-based approach for 5x better performance than Math.random().
   *
   * @private
   * @param {number} timestampMs - Current timestamp in milliseconds
   * @returns {string} Unique ID
   */
  /**
   * Get optimized timestamp with caching.
   * Only calls Date.now() once per 10ms window, then increments by 0.001ms.
   * Simple and fast without Map overhead.
   *
   * @private
   * @returns {number} Timestamp in milliseconds (with microsecond precision)
   */
  private getOptimizedTimestamp(): number {
    // For audit logs or when caching disabled, always use real timestamp
    if (!this.timestampCaching) {
      return Date.now();
    }

    const now = Date.now();

    // Check if we're within the cache window (10ms)
    if (now < this.cacheExpiry) {
      // Return cached timestamp with microsecond offset
      this.microOffset += 0.001;
      return this.cachedTimestamp + this.microOffset;
    }

    // Cache expired, update it
    this.cachedTimestamp = now;
    this.cacheExpiry = now + 10; // 10ms cache window
    this.microOffset = 0;
    return now;
  }

  private generateId(timestampMs: number): string {
    // Reset counter on new timestamp to prevent overflow
    // Compare full timestamp (including fractional milliseconds) for uniqueness
    if (timestampMs !== this.lastTimestamp) {
      this.lastTimestamp = timestampMs;
      this.idCounter = 0;
      return `${timestampMs}-0`;
    }
    // Use incrementing counter for same millisecond
    return `${timestampMs}-${++this.idCounter}`;
  }

  /**
   * Logs an info-level message.
   *
   * @public
   * @param {string} message - Message to log
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {{ success: boolean }} Result of the log operation
   *
   * @example
   * ```typescript
   * logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
   * ```
   */
  public info(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.logInternal(message, 'info', meta);
  }

  /**
   * Logs an error-level message.
   *
   * @public
   * @param {string} message - Error message
   * @param {Error | Record<string, unknown>} [error] - Error or metadata
   * @returns {{ success: boolean }} Result of the log operation
   *
   * @example
   * ```typescript
   * try {
   *   await database.connect();
   * } catch (error) {
   *   logger.error('Database connection failed', error);
   * }
   * ```
   */
  public error(message: string, error?: Error | Record<string, unknown>): { success: boolean } {
    const meta =
      error instanceof Error
        ? { error: { name: error.name, message: error.message, stack: error.stack } }
        : error;
    return this.logInternal(message, 'error', meta);
  }

  /**
   * Logs a warning-level message.
   *
   * @public
   * @param {string} message - Warning message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {{ success: boolean }} Result of the log operation
   */
  public warn(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.logInternal(message, 'warn', meta);
  }

  /**
   * Logs a debug-level message.
   *
   * @public
   * @param {string} message - Debug message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {{ success: boolean }} Result of the log operation
   */
  public debug(message: string, meta?: Record<string, unknown>): { success: boolean } {
    return this.logInternal(message, 'debug', meta);
  }

  /**
   * Logs a critical message with retry on failure.
   *
   * @public
   * @param {LogLevel} level - Log level
   * @param {string} message - Log message
   * @param {Record<string, unknown>} [meta] - Optional metadata
   * @returns {Promise<void>} Promise that resolves when logged
   */
  public async logCritical(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    // Log the message
    this.logInternal(message, level, meta);

    // Immediately flush for critical logs
    await this.flush();
  }

  /**
   * Gets the current buffer utilization percentage.
   *
   * @public
   * @returns {number} Utilization percentage (0-100)
   */
  public getUtilization(): number {
    if (this.useRingBuffer && this.ringBuffer) {
      // Ring buffer utilization
      const size = this.ringBuffer.getSize();
      const capacity = this.ringBuffer.getCapacity();
      return capacity > 0 ? (size / capacity) * 100 : 0;
    } else {
      // Batch array utilization
      const capacity = this.batchSize;
      return capacity > 0 ? (this.batch.length / capacity) * 100 : 0;
    }
  }

  /**
   * Checks if the logger is experiencing backpressure.
   *
   * @public
   * @returns {boolean} True if backpressured
   */
  public isBackpressured(): boolean {
    // Consider backpressured if buffer is more than 80% full
    return this.getUtilization() > 80;
  }

  /**
   * Gets current performance metrics.
   *
   * @public
   * @returns {AsyncLoggerMetrics} Current metrics
   */
  public getMetrics(): AsyncLoggerMetrics {
    return { ...this.metrics };
  }

  /**
   * Gets current logger statistics including buffer information.
   *
   * @public
   * @returns {object} Statistics object with buffer and performance info
   */
  public getStats(): {
    buffer: {
      size: number;
      capacity: number;
      current: number;
      dropped: number;
      utilization: number;
    };
    metrics: AsyncLoggerMetrics;
  } {
    // Use the actual configured batch size
    const capacity = this.batchSize;
    const current = this.batch.length;
    const utilization = capacity > 0 ? (current / capacity) * 100 : 0;

    return {
      buffer: {
        size: current,
        capacity,
        current,
        dropped: this.metrics.droppedLogs,
        utilization,
      },
      metrics: { ...this.metrics },
    };
  }

  /**
   * Flushes all pending logs and waits for completion.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when flush is complete
   */
  public async flushAndWait(): Promise<void> {
    // Flush the current batch and wait for it
    await this.flush();
  }

  /**
   * Adds a transport to the logger.
   *
   * @public
   * @param {Transport} transport - Transport to add
   * @returns {void}
   */
  public addTransport(transport: Transport): void {
    if (!this.transports.find(t => t.name === transport.name)) {
      this.transports.push(transport);
      this.emit('transportAdded', transport.name);
    }
  }

  /**
   * Removes a transport from the logger.
   *
   * @public
   * @param {string} name - Name of transport to remove
   * @returns {void}
   */
  public removeTransport(name: string): void {
    const index = this.transports.findIndex(t => t.name === name);
    if (index !== -1) {
      this.transports.splice(index, 1);
      this.emit('transportRemoved', name);
    }
  }

  /**
   * Lists all transport names.
   *
   * @public
   * @returns {string[]} Array of transport names
   */
  public listTransports(): string[] {
    return this.transports.map(t => t.name);
  }

  /**
   * Style chain for creating styled messages (matches Logger API).
   * Provides chainable style methods for text formatting.
   *
   * @public
   * @readonly
   * @returns {IStyleBuilder} Chainable style builder
   * @example
   * ```typescript
   * logger.info(logger.s.red.bold('Error:') + ' Connection failed');
   * ```
   */
  public get s(): IStyleBuilder {
    return this.styleBuilder as unknown as IStyleBuilder;
  }

  /**
   * Alias for the style builder (s).
   * Provides a more descriptive name for the chainable style API.
   *
   * @public
   * @readonly
   * @returns {IStyleBuilder} Chainable style builder
   */
  public get style(): IStyleBuilder {
    return this.s;
  }

  /**
   * Template literal formatter for inline styling.
   * Uses the same TemplateParser as Logger for consistency.
   *
   * @public
   * @readonly
   * @returns {TemplateFormatter} Template formatter function
   * @example
   * ```typescript
   * const user = 'john';
   * logger.info(logger.fmt`@green.bold{User ${user}} logged in`);
   * logger.error(logger.fmt`@red{Error:} @yellow{${errorMessage}}`);
   * ```
   */
  public get fmt(): TemplateFormatter {
    return this.templateFormatter;
  }

  /**
   * Waits for logger initialization to complete.
   *
   * @public
   * @returns {Promise<void>} Resolves when ready
   */
  public async waitForReady(): Promise<void> {
    await this.initPromise;
  }

  /**
   * Closes the logger and terminates worker threads.
   *
   * @public
   * @returns {Promise<void>} Resolves when closed
   *
   * @example
   * ```typescript
   * // Graceful shutdown
   * process.on('SIGTERM', async () => {
   *   await logger.close();
   *   process.exit(0);
   * });
   * ```
   */
  public async close(): Promise<void> {
    // Prevent multiple close operations
    if (this.isClosing) {
      return;
    }
    this.isClosing = true;

    // Clear timers
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Flush remaining logs
    await this.flush();

    // Terminate workers
    await Promise.all(this.workers.map(w => w.terminate()));
    this.workers = [];

    // Close transports (only ones not already closed)
    const closePromises: Promise<void>[] = [];
    for (const transport of this.transports) {
      if (!this.closedTransports.has(transport) && transport.close) {
        this.closedTransports.add(transport);
        const closeResult = transport.close();
        if (closeResult instanceof Promise) {
          closePromises.push(closeResult);
        }
      }
    }
    await Promise.all(closePromises);

    this.initialized = false;
    this.emit('closed');
  }
}

/**
 * Creates a new AsyncLogger instance.
 *
 * @param {AsyncLoggerOptions} [options] - Logger options
 * @returns {AsyncLogger} Logger instance
 *
 * @since 1.0.0
 * @example
 * ```typescript
 * const logger = createAsyncLogger({
 *   transports: [new ConsoleTransport()],
 *   worker: { poolSize: 2 }
 * });
 * ```
 */
export function createAsyncLogger(options?: AsyncLoggerOptions): AsyncLogger {
  return new AsyncLogger(options);
}

export default AsyncLogger;
