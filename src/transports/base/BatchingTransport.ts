// File: src/transports/base/BatchingTransport.ts

import { Transport } from './Transport';
import type { LogEntry, TransportStats, BatchingTransportOptions } from '../../types/transport';

/**
 * Abstract base class for transports that batch log entries.
 *
 * This class provides automatic batching functionality for transports that
 * benefit from processing multiple log entries at once (e.g., network transports).
 * It handles:
 * - Automatic batching based on size, time, or memory limits
 * - Queue management with configurable limits
 * - Retry logic with exponential backoff
 * - Graceful shutdown with queue flushing
 *
 * @abstract
 * @class BatchingTransport
 * @extends {Transport}
 *
 * @example
 * ```typescript
 * class MyBatchTransport extends BatchingTransport {
 *   protected async sendBatch(entries: LogEntry[]): Promise<void> {
 *     // Send entries to remote service
 *     await this.api.post('/logs', entries);
 *   }
 * }
 *
 * const transport = new MyBatchTransport({
 *   name: 'my-batch-transport',
 *   maxBatchSize: 100,
 *   maxBatchTime: 5000, // 5 seconds
 *   maxBatchBytes: 1024 * 1024, // 1MB
 * });
 * ```
 */
export abstract class BatchingTransport extends Transport {
  /**
   * Maximum number of entries per batch.
   * @protected
   */
  protected readonly maxBatchSize: number;

  /**
   * Maximum time to wait before sending a batch (ms).
   * @protected
   */
  protected readonly maxBatchTime: number;

  /**
   * Maximum size in bytes per batch.
   * @protected
   */
  protected readonly maxBatchBytes: number;

  /**
   * Maximum retry attempts for failed batches.
   * @protected
   */
  protected readonly maxRetries: number;

  /**
   * Initial retry delay in milliseconds.
   * @protected
   */
  protected readonly retryDelay: number;

  /**
   * Whether to retry on failure.
   * @protected
   */
  protected readonly retryOnFailure: boolean;

  /**
   * Maximum queue size.
   * @protected
   */
  protected readonly maxQueueSize: number;

  /**
   * Current batch being accumulated.
   * @private
   */
  private currentBatch: LogEntry[] = [];

  /**
   * Current batch size in bytes.
   * @private
   */
  private currentBatchBytes = 0;

  /**
   * Timer for batch timeout.
   * @private
   */
  private batchTimer?: NodeJS.Timeout;

  /**
   * Queue of batches waiting to be sent.
   * @private
   */
  private sendQueue: LogEntry[][] = [];

  /**
   * Whether currently sending a batch.
   * @private
   */
  private sending = false;

  /**
   * Number of entries currently queued.
   * @private
   */
  private queuedEntries = 0;

  /**
   * Creates a new BatchingTransport instance.
   *
   * @param {BatchingTransportOptions} options - Configuration options
   */
  constructor(options: BatchingTransportOptions) {
    super(options);

    // Set batching parameters with defaults
    this.maxBatchSize = options.maxBatchSize ?? 100;
    this.maxBatchTime = options.maxBatchTime ?? 5000;
    this.maxBatchBytes = options.maxBatchBytes ?? 1024 * 1024; // 1MB default
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.retryOnFailure = options.retryOnFailure !== false;
    this.maxQueueSize = options.maxQueueSize ?? 10000;
  }

  /**
   * Log a single entry.
   *
   * Adds the entry to the current batch and triggers sending if limits are reached.
   *
   * @param {LogEntry} entry - The log entry to process
   * @returns {Promise<void>} Resolves when the entry is queued
   */
  protected async doLog(entry: LogEntry): Promise<void> {
    // Check queue size limit
    if (this.queuedEntries >= this.maxQueueSize) {
      throw new Error(`Queue size limit exceeded (${this.maxQueueSize})`);
    }

    // Calculate entry size
    const entrySize = this.calculateEntrySize(entry);

    // Check if adding this entry would exceed batch limits
    if (this.shouldFlushBatch(entrySize)) {
      await this.flushBatch();
    }

    // Add to current batch
    this.currentBatch.push(entry);
    this.currentBatchBytes += entrySize;
    this.queuedEntries++;

    // Update stats
    this.stats.queued = this.queuedEntries;

    // Check if batch is full
    if (
      this.currentBatch.length >= this.maxBatchSize ||
      this.currentBatchBytes >= this.maxBatchBytes
    ) {
      // Hitting size limit: flush immediately and avoid scheduling timer
      await this.flushBatch();
    } else {
      // Reset/start timer on adds that don't immediately flush
      this.startBatchTimer();
    }
  }

  /**
   * Log multiple entries at once.
   *
   * @param {LogEntry[]} entries - Array of log entries to process
   * @returns {Promise<void>} Resolves when all entries are queued
   */
  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    // For batching transports, we can optimize by adding all entries at once
    for (const entry of entries) {
      await this.doLog(entry);
    }
  }

  /**
   * Check if batch should be flushed before adding an entry.
   *
   * @param {number} entrySize - Size of the entry to be added
   * @returns {boolean} True if batch should be flushed
   * @private
   */
  private shouldFlushBatch(entrySize: number): boolean {
    if (this.currentBatch.length === 0) {
      return false;
    }

    return (
      this.currentBatch.length >= this.maxBatchSize ||
      this.currentBatchBytes + entrySize > this.maxBatchBytes
    );
  }

  /**
   * Calculate the size of a log entry in bytes.
   *
   * @param {LogEntry} entry - The log entry
   * @returns {number} Size in bytes
   * @private
   */
  private calculateEntrySize(entry: LogEntry): number {
    // Estimate size by stringifying
    // In production, you might want a more efficient method
    return Buffer.byteLength(JSON.stringify(entry), 'utf8');
  }

  /**
   * Start the batch timer.
   *
   * @private
   */
  private startBatchTimer(): void {
    // Always reset the timer to delay flush until maxBatchTime after last add
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.batchTimer = setTimeout(() => {
      this.flushBatch().catch(error => {
        this.handleError(error);
      });
    }, this.maxBatchTime);
    // Prevent keeping the Node process alive in tests/environments
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (
      this.batchTimer &&
      typeof (this.batchTimer as unknown as { unref?: () => void }).unref === 'function'
    ) {
      (this.batchTimer as unknown as { unref?: () => void }).unref?.();
    }
  }

  /**
   * Stop the batch timer.
   *
   * @private
   */
  private stopBatchTimer(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Flush the current batch.
   *
   * @returns {Promise<void>} Resolves when batch is queued for sending
   * @private
   */
  private async flushBatch(): Promise<void> {
    this.stopBatchTimer();

    if (this.currentBatch.length === 0) {
      return;
    }

    // Move current batch to send queue
    this.sendQueue.push(this.currentBatch);

    // Reset current batch
    this.currentBatch = [];
    this.currentBatchBytes = 0;

    // Process send queue
    await this.processSendQueue();
  }

  /**
   * Process the send queue.
   *
   * @private
   */
  private async processSendQueue(): Promise<void> {
    if (this.sending || this.sendQueue.length === 0) {
      return;
    }

    this.sending = true;

    while (this.sendQueue.length > 0) {
      const batch = this.sendQueue.shift();
      if (!batch) continue; // This should never happen but satisfies TypeScript

      try {
        await this.sendBatchWithRetry(batch);

        // Update stats on success
        this.queuedEntries -= batch.length;
        this.stats.queued = this.queuedEntries;
        this.stats.succeeded += batch.length;
        this.stats.lastSuccess = new Date();
      } catch (error) {
        // Put batch back at front of queue for retry
        if (this.retryOnFailure) {
          this.sendQueue.unshift(batch);
        } else {
          // Update failed stats when not retrying
          this.queuedEntries -= batch.length;
          this.stats.queued = this.queuedEntries;
          this.stats.failed += batch.length;
        }

        this.handleError(error as Error);
        // If retrying, stop to respect backoff handled in sendBatchWithRetry flow
        if (this.retryOnFailure) break;
      }
    }

    this.sending = false;
  }

  /**
   * Send a batch with retry logic.
   *
   * @param {LogEntry[]} batch - The batch to send
   * @returns {Promise<void>} Resolves when batch is sent successfully
   * @private
   */
  private async sendBatchWithRetry(batch: LogEntry[]): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        await this.sendBatch(batch);

        // Success - emit event
        this.emit('batch', batch, batch.length);
        return;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt < this.maxRetries) {
          // Calculate delay with exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw lastError || new Error('Failed to send batch after retries');
  }

  /**
   * Sleep for a specified duration.
   *
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>} Resolves after the duration
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      const t = setTimeout(resolve, ms);
      // Avoid keeping the process alive in tests/environments
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (typeof (t as unknown as { unref?: () => void }).unref === 'function') {
        (t as unknown as { unref?: () => void }).unref?.();
      }
    });
  }

  /**
   * Flush any pending logs.
   *
   * @returns {Promise<void>} Resolves when all pending logs are sent
   */
  public async flush(): Promise<void> {
    // Flush current batch
    await this.flushBatch();

    // Wait for send queue to empty
    while (this.sendQueue.length > 0 || this.sending) {
      // If we're not currently sending but there's still work, kick the processor
      if (!this.sending && this.sendQueue.length > 0) {
        await this.processSendQueue();
        // Loop again to re-check state
        continue;
      }
      await this.sleep(50);
    }
  }

  /**
   * Close the transport.
   *
   * @returns {Promise<void>} Resolves when transport is closed
   */
  protected async doClose(): Promise<void> {
    // Stop accepting new logs
    this.closing = true;

    // Stop batch timer
    this.stopBatchTimer();

    // Flush remaining logs
    await this.flush();
  }

  /**
   * Get transport statistics.
   *
   * @returns {TransportStats} Current statistics
   */
  public getStats(): TransportStats {
    const stats = super.getStats();

    return {
      ...stats,
      custom: {
        ...stats.custom,
        currentBatchSize: this.currentBatch.length,
        currentBatchBytes: this.currentBatchBytes,
        sendQueueLength: this.sendQueue.length,
        sending: this.sending,
        maxBatchSize: this.maxBatchSize,
        maxBatchTime: this.maxBatchTime,
        maxBatchBytes: this.maxBatchBytes,
      },
    };
  }

  /**
   * Check if transport supports batching.
   *
   * @returns {boolean} Always true for batching transports
   */
  public supportsBatching(): boolean {
    return true;
  }

  /**
   * Abstract method to send a batch of entries.
   * Subclasses must implement this method.
   *
   * @param {LogEntry[]} entries - The batch of entries to send
   * @returns {Promise<void>} Resolves when batch is sent
   * @protected
   * @abstract
   */
  protected abstract sendBatch(entries: LogEntry[]): Promise<void>;
}
