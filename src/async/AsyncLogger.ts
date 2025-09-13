/**
 * @fileoverview Asynchronous logger with non-blocking I/O and immediate dispatch.
 *
 * Provides high-performance logging with immediate dispatch to transports.
 * Each transport handles its own batching and I/O optimization.
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
 *   transports: [new ConsoleTransport()]
 * });
 *
 * logger.info('Application started');
 * await logger.close();
 * ```
 *
 * @example With metrics monitoring
 * ```typescript
 * const logger = new AsyncLogger({
 *   enableMetrics: true
 * });
 *
 * logger.on('metrics', (metrics) => {
 *   console.log(`Processed: ${metrics.totalLogs}`);
 *   console.log(`Dropped: ${metrics.droppedLogs}`);
 * });
 * ```
 *
 * @example Custom transport handler
 * ```typescript
 * const logger = new AsyncLogger({
 *   onFlush: (entries) => {
 *     // Custom transport logic
 *     console.log(`Processing ${entries.length} log entries`);
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
import { WorkerTransport } from '../transports/worker/WorkerTransport';

// Performance optimization: Use Date.now() directly for simplicity
// TODO: Re-enable high-resolution timestamps once testing issues are resolved

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
  /** Enable performance metrics collection */
  enableMetrics?: boolean;
  /** Callback when logs are flushed */
  onFlush?: (entries: LogEntry[]) => void | Promise<void>;
  /** Whether to use console transport by default (default: true) */
  useConsole?: boolean;
  /** Whether to enable color/style support (default: true) */
  useColors?: boolean;
  /** Buffer configuration (for backward compatibility with tests) */
  buffer?: {
    /** Buffer size/capacity */
    size?: number;
    /** Flush interval in ms */
    flushInterval?: number;
  };
  /** Worker thread configuration */
  worker?: {
    /** Number of worker threads (default: 1) */
    poolSize?: number;
    /** Compatibility: batch size */
    batchSize?: number;
    /** Compatibility: batch timeout */
    batchTimeout?: number;
    /** Periodic flush interval in ms (default: 50) */
    flushInterval?: number;
    /** Enable worker threads (default: false for better performance) */
    enabled?: boolean;
    /** Use high-performance ring buffer transport (default: true when workers enabled) */
    useRingBuffer?: boolean;
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
 * High-performance asynchronous logger using worker threads.
 *
 * Offloads CPU-intensive operations like serialization and I/O to worker
 * threads, keeping the main event loop responsive. Ideal for high-throughput
 * applications that cannot afford blocking operations.
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

  /** @private {boolean} Whether to use colors */
  private readonly useColors: boolean;

  /** @private {StyleBuilder} Style builder instance for chainable styling */
  private readonly styleBuilder: StyleBuilder;

  /** @private {TemplateParser} Template parser instance for template literal styling */
  private readonly templateParser: TemplateParser;

  /** @private {TemplateFormatter} Cached template formatter function */
  private readonly templateFormatter: TemplateFormatter;

  /** @private {WorkerTransport | null} High-performance ring buffer transport */
  private workerTransport: WorkerTransport | null = null;

  /** @private {WorkerThread[]} Legacy worker thread pool (for fallback) */
  private workers: WorkerThread[] = [];

  /** @private {number} Current worker index for round-robin */
  private currentWorker = 0;
  
  /** @private {boolean} Use ring buffer for maximum performance */
  private useRingBuffer = false;

  /** @private {LogEntry[]} Micro-batch buffer for efficiency */
  private batch: LogEntry[] = [];
  
  /** @private {NodeJS.Timeout | null} Micro-batch timer */
  private batchTimer: NodeJS.Timeout | null = null;
  
  /** @private {LogEntry[][]} Pool of reusable batch arrays to reduce allocations */
  private batchPool: LogEntry[][] = [];
  private readonly maxPoolSize = 10;

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

  /** @private {typeof import('../utils/TextStyler').TextStyler | undefined} Cached TextStyler module */
  private textStyler?: typeof import('../utils/TextStyler').TextStyler;
  

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
         * This ensures logs are properly written regardless of transport type.
         */
        for (const entry of entries) {
          for (const transport of this.transports) {
            try {
              transport.log(entry);
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
        }
      });

    this.id = options.id || `async-logger-${Date.now()}`;
    this.enableMetrics = options.enableMetrics || false;
    this.useColors = options.useColors !== false; // Default to true for styling support

    this.styleBuilder = new StyleBuilder(this.useColors);
    this.templateParser = new TemplateParser(this.useColors);
    this.templateFormatter = this.templateParser.createFormatter();

    // Worker configuration - optional for CPU-intensive workloads
    const workerConfig = options.worker || {};
    this.poolSize = workerConfig.poolSize || 2;
    // Compatibility properties
    this.batchSize = workerConfig.batchSize || options.buffer?.size || 100;
    this.flushInterval = workerConfig.flushInterval || options.buffer?.flushInterval || 100;
    // Workers are optional - enable with worker.enabled: true
    this.useWorkers = workerConfig.enabled === true && typeof Worker !== 'undefined';
    // Use ring buffer for maximum performance when workers are enabled
    // Note: Ring buffer requires worker-thread.js to be deployed to dist/
    this.useRingBuffer = this.useWorkers && (workerConfig.useRingBuffer === true);

    // Pre-allocate batch arrays in the pool for better performance
    for (let i = 0; i < 5; i++) {
      this.batchPool.push([]);
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

    // Start periodic flush timer
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
    
    // Try high-performance ring buffer transport first
    if (this.useRingBuffer) {
      try {
        this.workerTransport = new WorkerTransport({
          bufferSize: 65536, // 64KB ring buffer for lock-free performance
          maxRetries: 3
        });
        await this.workerTransport.init();
        // Only log in non-test environments
        if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
          console.info(`[${this.id}] Using high-performance ring buffer transport`);
        }
        return; // Skip legacy worker initialization
      } catch (error) {
        // Only log in non-test environments
        if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
          console.warn(`[${this.id}] Failed to initialize ring buffer transport, falling back to regular workers:`, error);
        }
        this.useRingBuffer = false;
        this.workerTransport = null;
      }
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
   * Gets a timestamp for the log entry.
   * 
   * @private
   * @returns {number} Timestamp in milliseconds
   */
  private getTimestamp(): number {
    // Use Date.now() for simplicity
    // TODO: Re-enable high-resolution timestamps with performance.now()
    return Date.now();
  }

  /**
   * Processes a log entry immediately.
   * NO BATCHING - transports handle their own batching.
   *
   * @private
   * @param {LogEntry} entry - Log entry to process
   * @returns {void}
   */
  private processEntry(entry: LogEntry): void {
    // Cache property access
    const metrics = this.enableMetrics ? this.metrics : null;
    if (metrics) {
      metrics.totalLogs++;
    }
    
    // Add to micro-batch
    this.batch.push(entry);
    
    // Cache batch size check
    const batchLength = this.batch.length;
    const maxBatchSize = this.batchSize;
    
    // Flush immediately if batch is full (default 100)
    if (batchLength >= maxBatchSize) {
      this.flushBatch();
      return;
    }
    
    // Schedule micro-batch flush using setTimeout(0) for good performance
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        this.flushBatch();
      }, 0);
    }
  }
  
  /**
   * Flushes the micro-batch to transports.
   * @private
   */
  private flushBatch(): void {
    if (this.batch.length === 0) return;
    
    const entries = this.batch;
    // Get a new batch array from pool or create new one
    this.batch = this.batchPool.pop() || [];
    
    // Clear any pending timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Use high-performance ring buffer if available
    if (this.workerTransport && this.workerTransport.shouldLog()) {
      // Send each entry through ring buffer (zero-copy, lock-free)
      for (const entry of entries) {
        this.workerTransport.log(entry).catch((error: Error) => {
          if (this.enableMetrics) {
            this.metrics.droppedLogs++;
          }
          this.emit('error', error);
        });
      }
      // Return array to pool
      if (this.batchPool.length < this.maxPoolSize) {
        entries.length = 0;
        this.batchPool.push(entries);
      }
      return;
    }
    
    // Fallback to legacy workers if available
    if (this.workers.length > 0) {
      const worker = this.selectWorker();
      if (worker) {
        worker.send({
          type: WorkerMessageType.LOG_BATCH,
          payload: entries,
        });
      } else if (this.enableMetrics) {
        this.metrics.droppedLogs += entries.length;
      }
    } else {
      // Send batch to transports
      if (this.onFlush) {
        try {
          // Pass a copy to avoid mutations affecting the callback
          const entriesCopy = [...entries];
          const result = this.onFlush(entriesCopy);
          // Handle async transports
          if (result && typeof result === 'object' && 'then' in result) {
            (result as Promise<void>).catch(error => {
              if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
                console.error(`[${this.id}] Transport error:`, error);
              }
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
            console.error(`[${this.id}] Transport error:`, error);
          }
        }
      }
      
      // Return array to pool after processing
      if (this.batchPool.length < this.maxPoolSize) {
        entries.length = 0;
        this.batchPool.push(entries);
      }
    }
  }

  /**
   * Flushes the current batch to workers or transports.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when flush is complete
   */
  public async flush(): Promise<void> {
    // Flush any pending micro-batch
    this.flushBatch();


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
    // Optimized timestamp generation with caching
    const now = this.getTimestamp();
    
    // Skip style processing for plain text (fast path)
    const hasStyles = this.useColors && message.indexOf('<') !== -1;
    let processedMessage = message;
    let styles: Array<[number, number, string]> | undefined;
    
    if (!this.useWorkers && hasStyles) {
      // Cache TextStyler to avoid repeated requires
      if (!this.textStyler) {
        // Use require to avoid async in synchronous context
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const textStylerModule = require('../utils/TextStyler');
        const { TextStyler } = textStylerModule;
        this.textStyler = TextStyler;
      }
      const result = this.textStyler.parseBracketsWithExtraction(message, this.useColors);
      processedMessage = result.plainText;
      styles = result.styles;
    }
    
    // Pre-size object with known properties to avoid dynamic property addition
    const entry: Partial<LogEntry> & { time?: number } = {
      level,
      message: processedMessage,
      timestamp: now,
      time: now, // Keep for backward compatibility
      styles: undefined,
      context: undefined,
      loggerId: undefined
    };
    
    // Add styles if extracted
    if (styles && styles.length > 0) {
      entry.styles = styles;
    }
    
    // When using workers, tell them to process styles
    if (this.useWorkers && hasStyles) {
      entry.context = {
        _rawMessage: message, // Send original for worker processing
        _useColors: this.useColors,
        ...(meta || {})
      };
    } else if (meta && Object.keys(meta).length > 0) {
      entry.context = meta;
    }

    // Only add logger ID if not default
    if (this.id && !this.id.startsWith('async-logger-')) {
      entry.loggerId = this.id;
    }
    
    // Clean up undefined properties to reduce memory
    if (!entry.styles) delete entry.styles;
    if (!entry.context) delete entry.context;
    if (!entry.loggerId) delete entry.loggerId;

    // Immediate dispatch to transports
    this.processEntry(entry as LogEntry);
    return { success: true };
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
    // Compatibility method - always returns 0 with immediate dispatch
    return 0;
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
    // Flush all transports
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

    // Close ring buffer transport if active
    if (this.workerTransport) {
      await this.workerTransport.close();
      this.workerTransport = null;
    }

    // Terminate legacy workers
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
