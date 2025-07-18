// File: src/transports/base/BatchingTransport.ts

import { Transport } from './Transport';
import type {
  TransportOptions,
  BatchingOptions,
  LogEntry,
  TransportStats,
} from '../../types/transport';

/**
 * Configuration interface for BatchingTransport.
 * Combines base transport options with batching-specific options.
 */
export interface BatchingTransportOptions extends TransportOptions, BatchingOptions {}

/**
 * Represents a batch of logs waiting to be sent.
 * Tracks size, count, and creation time for batch management.
 */
interface LogBatch {
  /**
   * Unique identifier for this batch.
   */
  id: string;

  /**
   * Log entries in this batch.
   */
  entries: LogEntry[];

  /**
   * Total size of entries in bytes.
   */
  sizeBytes: number;

  /**
   * Timestamp when the batch was created.
   */
  createdAt: number;

  /**
   * Number of retry attempts for this batch.
   */
  retryCount: number;
}

/**
 * Abstract base class for transports that batch logs before sending.
 * 
 * This class extends the base Transport to add intelligent batching capabilities:
 * - Size-based batching (by count or bytes)
 * - Time-based batching (maximum wait time)
 * - Immediate mode for critical logs
 * - Compression support for network efficiency
 * - Automatic flush on close
 * 
 * Batching helps reduce network overhead and improve throughput for
 * high-volume logging scenarios while maintaining reasonable latency.
 * 
 * @abstract
 * @extends {Transport}
 * 
 * @example
 * ```typescript
 * class HTTPTransport extends BatchingTransport {
 *   protected async sendBatch(batch: LogEntry[]): Promise<void> {
 *     await fetch(this.url, {
 *       method: 'POST',
 *       body: JSON.stringify(batch)
 *     });
 *   }
 * }
 * ```
 */
export abstract class BatchingTransport extends Transport {
  /**
   * Maximum number of logs to batch before sending.
   * @protected
   */
  protected readonly maxBatchSize: number;

  /**
   * Maximum time to wait before sending a batch (milliseconds).
   * @protected
   */
  protected readonly maxBatchTime: number;

  /**
   * Maximum size in bytes before sending a batch.
   * @protected
   */
  protected readonly maxBatchBytes: number;

  /**
   * Whether to send logs immediately without batching.
   * @protected
   */
  protected readonly immediate: boolean;

  /**
   * Whether to compress batches before sending.
   * @protected
   */
  protected readonly compress: boolean;

  /**
   * Current batch being accumulated.
   * @protected
   */
  protected currentBatch: LogBatch | null = null;

  /**
   * Timer for time-based batch sending.
   * @protected
   */
  protected batchTimer: NodeJS.Timeout | null = null;

  /**
   * Queue of batches waiting to be sent.
   * Used when retries are needed or network is slow.
   * @protected
   */
  protected batchQueue: LogBatch[] = [];

  /**
   * Flag indicating if a batch is currently being sent.
   * Prevents concurrent sends which could cause issues.
   * @protected
   */
  protected sending = false;

  /**
   * Creates a new BatchingTransport instance.
   * 
   * @param {BatchingTransportOptions} options - Configuration options
   */
  constructor(options: BatchingTransportOptions) {
    super(options);

    // Set batching configuration with defaults
    this.maxBatchSize = options.maxBatchSize || 100;
    this.maxBatchTime = options.maxBatchTime || 5000;
    this.maxBatchBytes = options.maxBatchBytes || 1048576; // 1MB
    this.immediate = options.immediate || false;
    this.compress = options.compress || false;

    // Validate configuration
    this.validateBatchingConfig();
  }

  /**
   * Validates batching configuration for sanity.
   * 
   * @throws {Error} If configuration is invalid
   * @private
   */
  private validateBatchingConfig(): void {
    if (this.maxBatchSize < 1) {
      throw new Error('maxBatchSize must be at least 1');
    }

    if (this.maxBatchTime < 0) {
      throw new Error('maxBatchTime must be non-negative');
    }

    if (this.maxBatchBytes < 1) {
      throw new Error('maxBatchBytes must be at least 1');
    }
  }

  /**
   * Log a single entry, adding it to the current batch.
   * 
   * @param {LogEntry} entry - The log entry to process
   * @returns {Promise<void>} Resolves when the entry is added to batch
   */
  public async log(entry: LogEntry): Promise<void> {
    if (!this.enabled || this.closing) {
      return;
    }

    // Check if this transport should handle this log
    if (!this.shouldLog(entry)) {
      return;
    }

    this.stats.processed++;

    try {
      // Send immediately if configured
      if (this.immediate) {
        const batch: LogBatch = {
          id: this.generateId(),
          entries: [entry],
          createdAt: Date.now(),
          sizeBytes: JSON.stringify(entry).length,
          retryCount: 0
        };
        await this.sendBatch([entry], batch);
        return;
      }

      // Add to current batch
      await this.addToBatch(entry);
    } catch (error) {
      this.stats.failed++;
      this.handleError(error as Error, entry);
    }
  }

  /**
   * Add a log entry to the current batch.
   * 
   * Creates a new batch if needed and manages batch lifecycle.
   * 
   * @param {LogEntry} entry - The log entry to add
   * @returns {Promise<void>} Resolves when entry is added
   * @protected
   */
  protected async addToBatch(entry: LogEntry): Promise<void> {
    const entrySize = this.calculateEntrySize(entry);

    // Create new batch if needed
    if (!this.currentBatch) {
      this.currentBatch = this.createBatch();
      this.startBatchTimer();
    }

    // Check if adding this entry would exceed limits
    const wouldExceedSize = this.currentBatch.entries.length >= this.maxBatchSize;
    const wouldExceedBytes = this.currentBatch.sizeBytes + entrySize > this.maxBatchBytes;

    if (wouldExceedSize || wouldExceedBytes) {
      // Send current batch and create new one
      await this.flushCurrentBatch();
      this.currentBatch = this.createBatch();
      this.startBatchTimer();
    }

    // Add entry to batch
    this.currentBatch.entries.push(entry);
    this.currentBatch.sizeBytes += entrySize;

    // Update stats
    this.stats.queued = this.currentBatch.entries.length;
  }

  /**
   * Calculate the size of a log entry in bytes.
   * 
   * @param {LogEntry} entry - The log entry to measure
   * @returns {number} Size in bytes
   * @protected
   */
  protected calculateEntrySize(entry: LogEntry): number {
    // Simple estimation - serialize and measure
    // In production, you might want to cache or optimize this
    const serialized = JSON.stringify(entry);
    return Buffer.byteLength(serialized, 'utf8');
  }

  /**
   * Create a new empty batch.
   * 
   * @returns {LogBatch} New batch object
   * @protected
   */
  protected createBatch(): LogBatch {
    return {
      id: this.generateId(),
      entries: [],
      sizeBytes: 0,
      createdAt: Date.now(),
      retryCount: 0,
    };
  }

  /**
   * Start the batch timer for time-based flushing.
   * 
   * @protected
   */
  protected startBatchTimer(): void {
    // Clear existing timer
    this.stopBatchTimer();

    // Don't start timer if time-based batching is disabled
    if (this.maxBatchTime <= 0) {
      return;
    }

    // Start new timer
    this.batchTimer = setTimeout(() => {
      this.flushCurrentBatch().catch(error => {
        this.handleError(error as Error);
      });
    }, this.maxBatchTime);
  }

  /**
   * Stop the batch timer.
   * 
   * @protected
   */
  protected stopBatchTimer(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Flush the current batch immediately.
   * 
   * @returns {Promise<void>} Resolves when batch is sent or queued
   * @protected
   */
  protected async flushCurrentBatch(): Promise<void> {
    if (!this.currentBatch || this.currentBatch.entries.length === 0) {
      return;
    }

    // Stop timer
    this.stopBatchTimer();

    // Move batch to queue
    const batch = this.currentBatch;
    this.batchQueue.push(batch);
    this.currentBatch = null;
    this.stats.queued = 0;

    // Process queue
    await this.processQueue();
  }

  /**
   * Process the batch queue, sending batches in order.
   * 
   * @returns {Promise<void>} Resolves when queue processing is complete
   * @protected
   */
  protected async processQueue(): Promise<void> {
    // Prevent concurrent processing
    if (this.sending || this.batchQueue.length === 0) {
      return;
    }

    this.sending = true;

    try {
      while (this.batchQueue.length > 0 && !this.closing) {
        const batch = this.batchQueue[0];

        try {
          // Prepare batch data
          const data = await this.prepareBatch(batch);

          // Send the batch
          await this.withTimeout(
            this.sendBatch(data, batch),
            this.timeout
          );

          // Success - remove from queue and update stats
          this.batchQueue.shift();
          this.stats.succeeded += batch.entries.length;
          this.stats.lastSuccess = new Date();
          this.emit('batch', batch.entries, batch.entries.length);
        } catch (error) {
          // Handle send failure
          batch.retryCount++;
          
          if (await this.shouldRetry(error as Error, batch)) {
            // Move to end of queue for retry
            this.batchQueue.push(this.batchQueue.shift()!);
            
            // Wait before retrying
            await this.waitForRetry(batch.retryCount);
          } else {
            // Give up on this batch
            this.batchQueue.shift();
            this.stats.failed += batch.entries.length;
            
            // Call failover handling
            await this.handleBatchFailure(batch, error as Error);
          }
        }
      }
    } finally {
      this.sending = false;
    }
  }

  /**
   * Prepare batch data for sending.
   * 
   * Handles formatting and optional compression.
   * 
   * @param {LogBatch} batch - The batch to prepare
   * @returns {Promise<any>} Prepared batch data
   * @protected
   */
  protected async prepareBatch(batch: LogBatch): Promise<any> {
    // Format entries
    const formatted = batch.entries.map(entry => this.formatEntry(entry));

    // Compress if enabled
    if (this.compress) {
      return this.compressBatch(formatted);
    }

    return formatted;
  }

  /**
   * Compress batch data.
   * 
   * Default implementation uses JSON stringification.
   * Subclasses can override for actual compression.
   * 
   * @param {any} data - Data to compress
   * @returns {Promise<any>} Compressed data
   * @protected
   */
  protected async compressBatch(data: any): Promise<any> {
    // Default implementation - subclasses should override
    // for actual compression (gzip, etc.)
    return JSON.stringify(data);
  }

  /**
   * Determine if a failed batch should be retried.
   * 
   * @param {Error} error - The error that occurred
   * @param {LogBatch} batch - The failed batch
   * @returns {Promise<boolean>} True if should retry
   * @protected
   */
  protected async shouldRetry(error: Error, batch: LogBatch): Promise<boolean> {
    // Default implementation - can be overridden
    return batch.retryCount < 3;
  }

  /**
   * Wait before retrying a failed batch.
   * 
   * Implements exponential backoff by default.
   * 
   * @param {number} retryCount - Number of retries so far
   * @returns {Promise<void>} Resolves after wait period
   * @protected
   */
  protected async waitForRetry(retryCount: number): Promise<void> {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Handle a batch that failed permanently.
   * 
   * Default implementation logs the error.
   * Subclasses can override to implement DLQ or other fallbacks.
   * 
   * @param {LogBatch} batch - The failed batch
   * @param {Error} error - The error that caused the failure
   * @returns {Promise<void>} Resolves when handling is complete
   * @protected
   */
  protected async handleBatchFailure(batch: LogBatch, error: Error): Promise<void> {
    // Emit error for each entry
    batch.entries.forEach(entry => {
      this.handleError(error, entry);
    });
  }

  /**
   * Flush any buffered logs immediately.
   * 
   * @returns {Promise<void>} Resolves when all batches are sent
   */
  public async flush(): Promise<void> {
    // Flush current batch
    await this.flushCurrentBatch();

    // Wait for queue to empty
    while (this.batchQueue.length > 0 && !this.closing) {
      await this.processQueue();
      
      // Small delay to prevent tight loop
      if (this.batchQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Close the transport, ensuring all batches are sent.
   * 
   * @returns {Promise<void>} Resolves when transport is closed
   */
  protected async doClose(): Promise<void> {
    // Stop accepting new logs
    this.stopBatchTimer();

    // Try to flush remaining logs
    try {
      await this.flush();
    } catch (error) {
      // Log but don't throw - we're closing anyway
      this.handleError(error as Error);
    }
  }

  /**
   * Get transport statistics including queue information.
   * 
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();
    
    // Add queue size
    stats.queued = (this.currentBatch?.entries.length || 0) + 
                   this.batchQueue.reduce((sum, batch) => sum + batch.entries.length, 0);
    
    // Add custom batching stats
    stats.custom = {
      ...stats.custom,
      currentBatchSize: this.currentBatch?.entries.length || 0,
      queuedBatches: this.batchQueue.length,
      totalBatchesSent: Math.floor(stats.succeeded / this.maxBatchSize),
    };

    return stats;
  }

  /**
   * Abstract method for sending a batch of logs.
   * Subclasses must implement the actual send logic.
   * 
   * @param {any} data - Prepared batch data
   * @param {LogBatch} batch - Original batch object
   * @returns {Promise<void>} Resolves when batch is sent
   * @protected
   * @abstract
   */
  protected abstract sendBatch(data: any, batch: LogBatch): Promise<void>;
}