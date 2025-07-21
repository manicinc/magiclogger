// File: src/transports/base/BatchingTransport.ts

import { Transport } from './Transport';
import type { 
  BatchingTransportOptions, 
  LogEntry,
  TransportStats 
} from '../../types/transport';

/**
 * Abstract base class for transports that batch log entries.
 * 
 * Features:
 * - Automatic batching by size and time
 * - Configurable batch size and interval
 * - Retry logic for failed batches
 * - Memory-efficient buffering
 * - Graceful shutdown with flush
 * 
 * @abstract
 * @class BatchingTransport
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * class MyBatchingTransport extends BatchingTransport {
 *   protected async processBatch(entries: LogEntry[]): Promise<void> {
 *     // Send batch to destination
 *     await this.sendToAPI(entries);
 *   }
 * }
 * 
 * const transport = new MyBatchingTransport({
 *   batchSize: 100,
 *   flushInterval: 5000
 * });
 * ```
 */
export abstract class BatchingTransport extends Transport {
  /**
   * Current batch buffer.
   * @protected
   */
  protected batch: LogEntry[] = [];

  /**
   * Maximum batch size.
   * @protected
   */
  protected readonly batchSize: number;

  /**
   * Flush interval in milliseconds.
   * @protected
   */
  protected readonly flushInterval: number;

  /**
   * Timer for automatic flushing.
   * @private
   */
  private flushTimer?: NodeJS.Timeout;

  /**
   * Whether currently processing a batch.
   * @private
   */
  private processing = false;

  /**
   * Queue for batches being processed.
   * @private
   */
  private processingQueue: LogEntry[][] = [];

  /**
   * Maximum retry attempts.
   * @protected
   */
  protected readonly maxRetries: number;

  /**
   * Retry delay in milliseconds.
   * @protected
   */
  protected readonly retryDelay: number;

  /**
   * Whether to retry failed batches.
   * @protected
   */
  protected readonly retryOnFailure: boolean;

  /**
   * Maximum queue size for processing.
   * @private
   */
  private readonly maxQueueSize: number;

  /**
   * Number of dropped batches.
   * @private
   */
  private droppedBatches = 0;

  /**
   * Creates a new BatchingTransport instance.
   * 
   * @param {BatchingTransportOptions} options - Transport options
   */
  constructor(options: BatchingTransportOptions) {
    super(options);

    // Handle both property names
    this.batchSize = options.batchSize || options.maxBatchSize || 100;
    this.flushInterval = options.flushInterval || options.maxBatchTime || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.retryOnFailure = options.retryOnFailure !== false;
    this.maxQueueSize = options.maxQueueSize || 10;
  }

  /**
   * Initialize the batching transport.
   * 
   * @returns {Promise<void>} Resolves when initialized
   * @protected
   */
  protected async doInit(): Promise<void> {
    // Start flush timer
    this.startFlushTimer();
  }

  /**
   * Start the automatic flush timer.
   * @private
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.batch.length > 0) {
        this.flush().catch(error => {
          this.handleError(error);
        });
      }
    }, this.flushInterval);

    // Ensure timer doesn't prevent process exit
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  /**
   * Stop the flush timer.
   * @private
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Log a single entry (adds to batch).
   * 
   * @param {LogEntry} entry - Log entry
   * @returns {Promise<void>} Resolves when added
   * @protected
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    this.batch.push(entry);
    this.stats.queued = this.batch.length;

    // Check if batch is full
    if (this.batch.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Process multiple entries efficiently.
   * 
   * @param {LogEntry[]} entries - Log entries
   * @returns {Promise<void>} Resolves when added
   * @protected
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    // Add all entries to batch
    this.batch.push(...entries);
    this.stats.queued = this.batch.length;

    // Flush if needed
    while (this.batch.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Flush the current batch.
   * 
   * @returns {Promise<void>} Resolves when flushed
   */
  public async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    // Extract current batch
    const batchToProcess = this.batch.splice(0, this.batchSize);
    this.stats.queued = this.batch.length;

    // Add to processing queue
    this.addToProcessingQueue(batchToProcess);

    // Process queue if not already processing
    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * Add batch to processing queue.
   * 
   * @param {LogEntry[]} batch - Batch to add
   * @private
   */
  private addToProcessingQueue(batch: LogEntry[]): void {
    if (this.processingQueue.length >= this.maxQueueSize) {
      // Drop oldest batch
      const dropped = this.processingQueue.shift();
      if (dropped) {
        this.droppedBatches++;
        this.stats.failed += dropped.length;
        this.emit('batchDropped', { size: dropped.length });
      }
    }

    this.processingQueue.push(batch);
  }

  /**
   * Process all batches in the queue.
   * @private
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.processingQueue.length === 0) return;

    this.processing = true;

    while (this.processingQueue.length > 0) {
      const batch = this.processingQueue.shift();
      if (!batch) continue;

      try {
        await this.processBatchWithRetry(batch);
        this.stats.succeeded += batch.length;
      } catch (error) {
        this.stats.failed += batch.length;
        this.handleError(error as Error);
        
        // Emit batch failure event
        this.emit('batchFailed', {
          size: batch.length,
          error,
        });
      }
    }

    this.processing = false;
  }

  /**
   * Process a batch with retry logic.
   * 
   * @param {LogEntry[]} batch - Batch to process
   * @returns {Promise<void>} Resolves when processed
   * @private
   */
  private async processBatchWithRetry(batch: LogEntry[]): Promise<void> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        await this.processBatch(batch);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        
        if (!this.retryOnFailure || attempt === this.maxRetries) {
          throw error;
        }

        // Wait before retry
        await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    throw lastError;
  }

  /**
   * Delay helper for retries.
   * 
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>} Resolves after delay
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Abstract method to process a batch of entries.
   * Must be implemented by subclasses.
   * 
   * @param {LogEntry[]} entries - Batch of entries
   * @returns {Promise<void>} Resolves when processed
   * @protected
   * @abstract
   */
  protected abstract processBatch(entries: LogEntry[]): Promise<void>;

  /**
   * Close the transport.
   * 
   * @returns {Promise<void>} Resolves when closed
   * @protected
   */
  protected async doClose(): Promise<void> {
    // Stop flush timer
    this.stopFlushTimer();

    // Flush remaining entries
    if (this.batch.length > 0) {
      await this.flush();
    }

    // Wait for processing to complete
    let attempts = 0;
    while (this.processing && attempts < 100) {
      await this.delay(100);
      attempts++;
    }

    // Force process remaining queue
    if (this.processingQueue.length > 0) {
      await this.processQueue();
    }
  }

  /**
   * Get transport statistics.
   * 
   * @returns {TransportStats} Transport statistics
   */
  public getStats(): TransportStats {
    const baseStats = super.getStats();
    
    return {
      ...baseStats,
      custom: {
        ...baseStats.custom,
        batchSize: this.batchSize,
        currentBatchSize: this.batch.length,
        processingQueueSize: this.processingQueue.length,
        droppedBatches: this.droppedBatches,
        isProcessing: this.processing,
      },
    };
  }

  /**
   * Check if transport supports batching.
   * 
   * @returns {boolean} Always true for batching transport
   */
  public supportsBatching(): boolean {
    return true;
  }

  /**
   * Force flush all batches immediately.
   * 
   * @returns {Promise<void>} Resolves when flushed
   */
  public async forceFlush(): Promise<void> {
    // Stop timer temporarily
    this.stopFlushTimer();

    try {
      // Flush all entries
      while (this.batch.length > 0) {
        const batch = this.batch.splice(0, this.batchSize);
        this.processingQueue.push(batch);
      }

      // Process all
      await this.processQueue();
    } finally {
      // Restart timer
      this.startFlushTimer();
    }
  }

  /**
   * Get batch configuration.
   * 
   * @returns {object} Batch configuration
   */
  public getBatchConfig(): {
    batchSize: number;
    flushInterval: number;
    maxRetries: number;
    retryDelay: number;
  } {
    return {
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
    };
  }
}