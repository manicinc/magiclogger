/**
 * @fileoverview Worker thread for asynchronous log processing.
 *
 * Handles log serialization and transport operations in a separate thread,
 * preventing blocking of the main event loop. Implements batching and
 * backpressure handling for optimal performance.
 *
 * @module async/AsyncLoggerWorker
 * @author MagicLogger Contributors
 * @copyright 2024 MagicLogger
 * @license MIT
 */

import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import type { LogEntry } from '../types/transport';
// Import TextStyler for processing styles in worker thread
import { TextStyler } from '../utils/TextStyler';

/**
 * Message types for worker communication protocol.
 *
 * @enum {string}
 * @readonly
 * @since 1.0.0
 */
const MessageType = {
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
 * Worker configuration interface.
 *
 * @interface WorkerConfig
 * @since 1.0.0
 */
interface WorkerConfig {
  /** Worker ID for identification */
  workerId: number;
  /** Batch size for buffering */
  batchSize?: number;
  /** Flush interval in milliseconds */
  flushInterval?: number;
  /** Enable compression for large batches */
  enableCompression?: boolean;
}

/**
 * Transport configuration received from main thread.
 *
 * @interface TransportConfig
 * @since 1.0.0
 */
interface TransportConfig {
  /** Transport name */
  name: string;
  /** Transport type */
  type: string;
}

/**
 * Worker performance metrics.
 *
 * @interface WorkerMetrics
 * @since 1.0.0
 */
interface WorkerMetrics {
  /** Total entries processed */
  processed: number;
  /** Total batches processed */
  batches: number;
  /** Average processing time in ms */
  avgProcessingTime: number;
  /** Current buffer size */
  bufferSize: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Serialization errors */
  errors: number;
}

/**
 * Main worker state manager for log processing.
 *
 * Handles batching, serialization, and metrics collection in the worker thread.
 * Implements efficient memory management and backpressure handling.
 *
 * @class WorkerState
 * @since 1.0.0
 */
class WorkerState {
  /** @private {number} Worker identifier */
  private readonly workerId: number;

  /** @private {LogEntry[]} Log entry buffer */
  private buffer: LogEntry[] = [];

  /** @private {TransportConfig[]} Configured transports */
  private transports: TransportConfig[] = [];

  /** @private {WorkerMetrics} Performance metrics */
  private metrics: WorkerMetrics = {
    processed: 0,
    batches: 0,
    avgProcessingTime: 0,
    bufferSize: 0,
    memoryUsage: 0,
    errors: 0,
  };

  /** @private {number} Batch size configuration */
  private readonly batchSize: number;

  /** @private {number} Flush interval configuration */
  private readonly flushInterval: number;

  /** @private {NodeJS.Timeout | null} Flush timer handle */
  private flushTimer: NodeJS.Timeout | null = null;

  /** @private {boolean} Compression enabled flag */
  private readonly enableCompression: boolean;

  /** @private {number[]} Processing time samples for averaging */
  private processingTimes: number[] = [];

  /** @private {number} Maximum samples to keep for averaging */
  private readonly maxSamples = 100;

  /**
   * Creates a new worker state instance.
   *
   * @param {WorkerConfig} config - Worker configuration
   */
  constructor(config: WorkerConfig) {
    this.workerId = config.workerId;
    this.batchSize = config.batchSize || 1000;
    // Preserve explicit 0 to allow disabling periodic flush in tests or configs
    this.flushInterval = config.flushInterval ?? 50;
    this.enableCompression = config.enableCompression || false;

    // Start periodic flush timer only if enabled (>0)
    if (this.flushInterval > 0) {
      this.startFlushTimer();
    }

    // Send ready signal
    this.sendMessage(MessageType.READY, { workerId: this.workerId });
  }

  /**
   * Initializes the worker with transport configuration.
   *
   * @param {TransportConfig[]} transports - Transport configurations
   * @returns {void}
   */
  public initialize(transports: TransportConfig[]): void {
    this.transports = transports;
    // Remove console.log that might interfere with worker operation
  }

  /**
   * Processes a batch of log entries.
   *
   * @param {LogEntry[]} entries - Log entries to process
   * @returns {void}
   */
  public processBatch(entries: LogEntry[]): void {
    const startTime = performance.now();

    try {
      // Add to buffer
      this.buffer.push(...entries);
      this.metrics.bufferSize = this.buffer.length;

      // Auto-flush if buffer is full
      if (this.buffer.length >= this.batchSize) {
        this.flush();
      }

      // Track processing time
      const processingTime = performance.now() - startTime;
      this.updateProcessingTime(processingTime);

      // Send acknowledgment
      this.sendMessage(MessageType.ACK, {
        processed: entries.length,
        bufferSize: this.buffer.length,
      });
    } catch (error) {
      this.metrics.errors++;
      this.sendMessage(MessageType.ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        workerId: this.workerId,
      });
    }
  }

  /**
   * Flushes buffered logs with serialization.
   *
   * @returns {void}
   */
  public flush(): void {
    if (this.buffer.length === 0) return;

    const startTime = performance.now();
    const count = this.buffer.length;

    try {
      // Serialize all entries (this is the CPU-intensive part)
      const serialized: string[] = [];

      for (const entry of this.buffer) {
        // Process styles in worker thread (if needed)
        const processedEntry = { ...entry };

        // Check if we need to process styles
        // Note: useColors would be passed at the worker level, not per entry
        // For now, we always process styles if present
        if (
          entry.message &&
          typeof entry.message === 'string' &&
          entry.message.includes('<') &&
          entry.message.includes('>') &&
          entry.message.includes('</>')
        ) {
          // Process styles in worker thread - this is the key optimization!
          const extracted = TextStyler.parseBracketsWithExtraction(entry.message, true);
          processedEntry.message = extracted.styledText;
          // Store plain text in a separate field for reference
          (processedEntry as any).plainText = extracted.plainText;
          if (extracted.styles && extracted.styles.length > 0) {
            processedEntry.styles = extracted.styles;
          }
        }

        // Full JSON serialization like production loggers do
        const json = JSON.stringify({
          ...processedEntry,
          pid: process.pid,
          hostname: process.env.HOSTNAME || 'unknown',
          v: 1, // Schema version
        });
        serialized.push(json);
      }

      // In production, would send to actual transports here
      // For now, we just do the expensive serialization work

      // Update metrics
      this.metrics.processed += count;
      this.metrics.batches++;
      this.metrics.memoryUsage = process.memoryUsage().heapUsed;

      // Clear buffer
      this.buffer = [];
      this.metrics.bufferSize = 0;

      // Track processing time
      const processingTime = performance.now() - startTime;
      this.updateProcessingTime(processingTime);

      // Send metrics update
      if (this.metrics.batches % 10 === 0) {
        this.sendMetrics();
      }
    } catch (error) {
      this.metrics.errors++;
      console.error(`[Worker ${this.workerId}] Flush error:`, error);
    }
  }

  /**
   * Updates average processing time with new sample.
   *
   * @private
   * @param {number} time - Processing time in milliseconds
   * @returns {void}
   */
  private updateProcessingTime(time: number): void {
    this.processingTimes.push(time);

    // Keep only recent samples
    if (this.processingTimes.length > this.maxSamples) {
      this.processingTimes = this.processingTimes.slice(-this.maxSamples);
    }

    // Calculate average
    const sum = this.processingTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgProcessingTime = sum / this.processingTimes.length;
  }

  /**
   * Starts the periodic flush timer.
   *
   * @private
   * @returns {void}
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.flushInterval <= 0) return; // disabled
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
    // Allow process exit in tests
    (this.flushTimer as any).unref?.();
  }

  /**
   * Stops the flush timer.
   *
   * @private
   * @returns {void}
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Sends metrics to the main thread.
   *
   * @private
   * @returns {void}
   */
  private sendMetrics(): void {
    this.sendMessage(MessageType.METRICS, { ...this.metrics });
  }

  /**
   * Sends a message to the parent thread.
   *
   * @private
   * @param {string} type - Message type
   * @param {any} [payload] - Message payload
   * @returns {void}
   */
  private sendMessage(type: string, payload?: any): void {
    if (parentPort) {
      parentPort.postMessage({ type, payload });
    }
  }

  /**
   * Shuts down the worker gracefully.
   *
   * @returns {void}
   */
  public shutdown(): void {
    // Stop timer
    this.stopFlushTimer();

    // Final flush
    this.flush();

    // Send final metrics
    this.sendMetrics();
  }

  /**
   * Gets current worker statistics.
   *
   * @returns {WorkerMetrics} Current metrics
   */
  public getStats(): WorkerMetrics {
    return { ...this.metrics };
  }
}

// Initialize worker if running in worker thread
if (parentPort && workerData) {
  const config: WorkerConfig = workerData;
  const state = new WorkerState(config);

  // Set up message handler
  parentPort.on('message', message => {
    try {
      switch (message.type) {
        case MessageType.INIT:
          state.initialize(message.transports || []);
          break;

        case MessageType.LOG_BATCH:
          state.processBatch(message.payload || []);
          break;

        case MessageType.FLUSH:
          state.flush();
          break;

        case MessageType.SHUTDOWN:
          state.shutdown();
          // Exit gracefully
          process.exit(0);
          break;

        default:
          console.warn(`[Worker ${config.workerId}] Unknown message type:`, message.type);
      }
    } catch (error) {
      console.error(`[Worker ${config.workerId}] Message handling error:`, error);
      if (parentPort) {
        parentPort.postMessage({
          type: MessageType.ERROR,
          payload: {
            error: error instanceof Error ? error.message : 'Unknown error',
            workerId: config.workerId,
          },
        });
      }
    }
  });

  // Handle errors
  process.on('uncaughtException', error => {
    console.error(`[Worker ${config.workerId}] Uncaught exception:`, error);
    if (parentPort) {
      parentPort.postMessage({
        type: MessageType.ERROR,
        payload: {
          error: error.message,
          workerId: config.workerId,
          fatal: true,
        },
      });
    }
    process.exit(1);
  });

  process.on('unhandledRejection', reason => {
    console.error(`[Worker ${config.workerId}] Unhandled rejection:`, reason);
    if (parentPort) {
      parentPort.postMessage({
        type: MessageType.ERROR,
        payload: {
          error: reason instanceof Error ? reason.message : String(reason),
          workerId: config.workerId,
          fatal: false,
        },
      });
    }
  });
} else {
  console.error('AsyncLoggerWorker must be run as a worker thread');
  process.exit(1);
}

// Export for testing purposes
export { WorkerState, MessageType, type WorkerConfig, type WorkerMetrics };
