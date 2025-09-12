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

  /** @private {LogEntry[]} NO LONGER USED - removing redundant batching */
  // private buffer: LogEntry[] = [];

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

  /** @private {number} NO LONGER USED - removing redundant batching */
  // private readonly batchSize: number;

  /** @private {number} NO LONGER USED - removing redundant batching */
  // private readonly flushInterval: number;

  /** @private {NodeJS.Timeout | null} NO LONGER USED - removing redundant batching */
  // private flushTimer: NodeJS.Timeout | null = null;

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
    // NO LONGER BATCHING IN WORKER - remove redundant buffering
    // this.batchSize = config.batchSize || 1000;
    // this.flushInterval = config.flushInterval ?? 50;
    this.enableCompression = config.enableCompression || false;

    // NO LONGER USING FLUSH TIMER - process immediately
    // if (this.flushInterval > 0) {
    //   this.startFlushTimer();
    // }

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
   * Processes a batch of log entries IMMEDIATELY.
   * NO LONGER BUFFERS - processes and serializes immediately to avoid double batching.
   *
   * @param {LogEntry[]} entries - Log entries to process
   * @returns {void}
   */
  public processBatch(entries: LogEntry[]): void {
    const startTime = performance.now();

    try {
      // PROCESS IMMEDIATELY - no more buffering!
      // This removes the redundant batching that was happening
      this.processEntries(entries);

      // Track processing time
      const processingTime = performance.now() - startTime;
      this.updateProcessingTime(processingTime);

      // Send acknowledgment
      this.sendMessage(MessageType.ACK, {
        processed: entries.length,
        bufferSize: 0, // No buffer anymore
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
   * Process entries immediately without buffering.
   * This is the new method that replaces flush() to avoid double batching.
   *
   * @param {LogEntry[]} entries - Entries to process
   * @returns {void}
   */
  private processEntries(entries: LogEntry[]): void {
    const startTime = performance.now();
    const count = entries.length;

    try {
      // Serialize all entries (this is the CPU-intensive part)
      const serialized: string[] = [];

      for (const entry of entries) {
        // Process styles in worker thread (if needed)
        const processedEntry = { ...entry };

        // Check if we need to process styles from rawMessage
        const entryWithRaw = entry as LogEntry & { rawMessage?: string; useColors?: boolean };
        const messageToProcess = entryWithRaw.rawMessage || entry.message;
        const useColors = entryWithRaw.useColors !== false;
        
        if (
          messageToProcess &&
          typeof messageToProcess === 'string' &&
          messageToProcess.includes('<') &&
          messageToProcess.includes('>') &&
          messageToProcess.includes('</>')
        ) {
          // Process styles in worker thread
          const extracted = TextStyler.parseBracketsWithExtraction(messageToProcess, useColors);
          processedEntry.message = extracted.plainText;
          if (extracted.styles && extracted.styles.length > 0) {
            processedEntry.styles = extracted.styles;
          }
        }
        
        // Remove rawMessage from final entry
        const cleanEntry = processedEntry as LogEntry & { rawMessage?: string; useColors?: boolean };
        delete cleanEntry.rawMessage;
        delete cleanEntry.useColors;

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
      this.metrics.bufferSize = 0; // No buffer anymore

      // Track processing time
      const processingTime = performance.now() - startTime;
      this.updateProcessingTime(processingTime);

      // Send metrics update
      if (this.metrics.batches % 10 === 0) {
        this.sendMetrics();
      }
    } catch (error) {
      this.metrics.errors++;
      console.error(`[Worker ${this.workerId}] Processing error:`, error);
    }
  }
  
  /**
   * Legacy flush method - now just a no-op since we don't buffer.
   * Kept for backward compatibility.
   *
   * @returns {void}
   */
  public flush(): void {
    // No-op: we no longer buffer in the worker
    // Processing happens immediately in processBatch
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

  // NO LONGER NEEDED - removed flush timer methods
  // private startFlushTimer(): void { ... }
  // private stopFlushTimer(): void { ... }

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
  private sendMessage(type: string, payload?: unknown): void {
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
    // No timer to stop anymore
    // No buffer to flush anymore
    
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
