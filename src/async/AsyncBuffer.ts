// File: src/core/AsyncBuffer.ts

import type { LogEntry } from '../types/transport';

// Robust timer availability check and polyfill
const ensureTimers = () => {
  if (typeof global !== 'undefined') {
    // Try to get Node.js timers if global timers are missing
    try {
      if (!global.setInterval || !global.clearInterval) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodeTimers = require('timers');
        global.setInterval = global.setInterval || nodeTimers.setInterval;
        global.clearInterval = global.clearInterval || nodeTimers.clearInterval;
      }
    } catch (error) {
      // If require fails, try to use built-in timers
      if (typeof setInterval !== 'undefined' && typeof clearInterval !== 'undefined') {
        global.setInterval = global.setInterval || setInterval;
        global.clearInterval = global.clearInterval || clearInterval;
      }
    }
  }
};

// Initialize timers
ensureTimers();

/**
 * Result of adding an entry to the buffer.
 */
export interface AddResult {
  success: boolean;
  reason?: 'buffer_full' | 'closing' | 'dropped';
  dropped?: LogEntry;
  bufferStats?: {
    size: number;
    capacity: number;
    utilization: number;
  };
}

/**
 * Buffer statistics for monitoring.
 */
export interface BufferStats {
  size: number;
  capacity: number;
  utilization: number;
}

/**
 * Configuration options for AsyncBuffer.
 */
export interface AsyncBufferOptions {
  /**
   * Size of the ring buffer.
   * @default 10000
   */
  size?: number;

  /**
   * Flush interval in milliseconds.
   * @default 100
   */
  flushInterval?: number;

  /**
   * Number of entries to trigger flush.
   * @default 1000
   */
  flushSize?: number;

  /**
   * Handler function called when buffer is flushed.
   */
  onFlush: (entries: LogEntry[]) => void | Promise<void>;

  /**
   * Strategy when buffer is full.
   * @default 'drop-oldest'
   */
  overflowStrategy?: 'drop-oldest' | 'drop-newest' | 'block';

  /**
   * Enable high-resolution timing for performance monitoring.
   * @default false
   */
  enableMetrics?: boolean;

  /**
   * Called when an entry is dropped.
   */
  onDrop?: (entry: LogEntry, reason: 'buffer_full' | 'overflow') => void;

  /**
   * Called when buffer reaches high water mark.
   */
  onHighWater?: (stats: BufferStats) => void;

  /**
   * Called when buffer returns to low water mark.
   */
  onLowWater?: (stats: BufferStats) => void;

  /**
   * High water mark (percentage of capacity).
   * @default 0.8
   */
  highWaterMark?: number;

  /**
   * Low water mark (percentage of capacity).
   * @default 0.5
   */
  lowWaterMark?: number;
}

/**
 * High-performance ring buffer for async logging.
 *
 * This implementation avoids promises in the hot path and uses a pre-allocated
 * ring buffer for zero-allocation logging. The buffer is flushed based on size,
 * time, or manual triggers.
 *
 * @example
 * ```typescript
 * const buffer = new AsyncBuffer({
 *   size: 10000,
 *   flushInterval: 100,
 *   onFlush: (entries) => {
 *     // Process entries in background
 *     transport.sendBatch(entries);
 *   }
 * });
 *
 * // Add logs - no promises, no allocations
 * buffer.add(logEntry);
 * ```
 */
export class AsyncBuffer {
  /**
   * Pre-allocated ring buffer array.
   * @private
   */
  private readonly buffer: Array<LogEntry | null>;

  /**
   * Buffer capacity.
   * @private
   */
  private readonly capacity: number;

  /**
   * Write position in the ring buffer.
   * @private
   */
  private writePos = 0;

  /**
   * Read position in the ring buffer.
   * @private
   */
  private readPos = 0;

  /**
   * Current number of entries in buffer.
   * @private
   */
  private size = 0;

  /**
   * Flush configuration.
   * @private
   */
  private readonly flushSize: number;
  private readonly flushInterval: number;
  private readonly onFlush: (entries: LogEntry[]) => void | Promise<void>;
  private readonly overflowStrategy: 'drop-oldest' | 'drop-newest' | 'block';
  private readonly highWaterMark: number;
  private readonly lowWaterMark: number;
  private aboveHighWater = false;
  private readonly onDrop?: (entry: LogEntry, reason: 'buffer_full' | 'overflow') => void;
  private readonly onHighWater?: (stats: BufferStats) => void;
  private readonly onLowWater?: (stats: BufferStats) => void;

  /**
   * Flush timer reference.
   * @private
   */
  private flushTimer: NodeJS.Timeout | null = null;

  /**
   * Flag to prevent concurrent flushes.
   * @private
   */
  private flushing = false;

  /**
   * Performance metrics.
   * @private
   */
  private metrics = {
    totalAdded: 0,
    totalFlushed: 0,
    totalDropped: 0,
    flushCount: 0,
    lastFlushTime: 0,
    avgFlushSize: 0,
  };

  /**
   * Whether metrics collection is enabled.
   * @private
   */
  private readonly enableMetrics: boolean;

  /**
   * Flag to track if buffer is closing.
   * @private
   */
  private closing = false;

  /**
   * Creates a new AsyncBuffer instance.
   *
   * @param {AsyncBufferOptions} options - Configuration options
   */
  constructor(options: AsyncBufferOptions) {
    this.capacity = options.size || 10000;
    this.flushSize = options.flushSize || 1000;
    this.flushInterval = options.flushInterval ?? 100; // Use nullish coalescing to allow 0
    this.onFlush = options.onFlush;
    this.overflowStrategy = options.overflowStrategy || 'drop-oldest';
    this.enableMetrics = options.enableMetrics || false;
    this.highWaterMark = options.highWaterMark || 0.8;
    this.lowWaterMark = options.lowWaterMark || 0.5;
    this.onDrop = options.onDrop;
    this.onHighWater = options.onHighWater;
    this.onLowWater = options.onLowWater;

    if (this.highWaterMark <= this.lowWaterMark) {
      throw new Error('High water mark must be greater than low water mark');
    }

    // Pre-allocate buffer
    this.buffer = new Array(this.capacity).fill(null);

    // Start flush timer
    this.startFlushTimer();
  }

  /**
   * Add a log entry to the buffer with explicit result.
   *
   * This method is designed to be as fast as possible:
   * - No promises
   * - No allocations (except when buffer is full)
   * - Direct array access
   * - Explicit backpressure signals
   *
   * @param {LogEntry} entry - The log entry to add
   * @returns {AddResult} Result with success status and metadata
   */
  /**
   * Add a log entry to the buffer and return detailed result.
   * This is the primary implementation used by advanced integrations.
   */
  public addDetailed(entry: LogEntry): AddResult {
    const bufferStats = this.getBufferStats();

    if (this.closing) {
      return {
        success: false,
        reason: 'closing',
        bufferStats,
      };
    }

    // Handle buffer overflow
    if (this.size === this.capacity) {
      switch (this.overflowStrategy) {
        case 'drop-newest': {
          if (this.enableMetrics) {
            this.metrics.totalDropped++;
          }
          this.onDrop?.(entry, 'buffer_full');
          return {
            success: false,
            reason: 'buffer_full',
            dropped: entry,
            bufferStats,
          };
        }
        case 'drop-oldest': {
          const droppedEntry = this.buffer[this.readPos];
          this.readPos = (this.readPos + 1) % this.capacity;
          this.size--;

          // Add new entry
          this.buffer[this.writePos] = entry;
          this.writePos = (this.writePos + 1) % this.capacity;
          this.size++;

          if (this.enableMetrics) {
            this.metrics.totalAdded++;
            this.metrics.totalDropped++;
          }

          if (droppedEntry) {
            this.onDrop?.(droppedEntry, 'overflow');
          }

          this.checkWaterMarks();

          // Check if we should flush
          if (this.size >= this.flushSize) {
            this.flush();
          }

          return {
            success: true,
            reason: 'dropped',
            dropped: droppedEntry || undefined,
            bufferStats: this.getBufferStats(),
          };
        }
        case 'block': {
          // Explicit rejection and account as dropped
          if (this.enableMetrics) {
            this.metrics.totalDropped++;
          }
          this.onDrop?.(entry, 'buffer_full');
          return {
            success: false,
            reason: 'buffer_full',
            bufferStats,
          };
        }
      }
    }

    // Normal add
    this.buffer[this.writePos] = entry;
    this.writePos = (this.writePos + 1) % this.capacity;
    this.size++;

    if (this.enableMetrics) {
      this.metrics.totalAdded++;
    }

    this.checkWaterMarks();

    // Check if we should flush
    if (this.size >= this.flushSize) {
      this.flush();
    }

    return {
      success: true,
      bufferStats: this.getBufferStats(),
    };
  }

  /**
   * Legacy add method for backward compatibility.
   *
   * @param {LogEntry} entry - The log entry to add
   * @returns {boolean} True if entry was added, false if dropped
   */
  public addLegacy(entry: LogEntry): boolean {
    return this.addDetailed(entry).success;
  }

  /**
   * Add a log entry to the buffer.
   * Returns a simple boolean for backward compatibility with older code/tests.
   * Advanced users should call addDetailed for structured results.
   */
  public add(entry: LogEntry): boolean | AddResult {
    // Keep runtime behavior boolean for backward compatibility; tests/mocks can still return AddResult
    const res = this.addDetailed(entry);
    return res.success;
  }

  /**
   * Manually flush the buffer.
   *
   * This method extracts all entries and calls the flush handler.
   * It's designed to be non-blocking and handle errors gracefully.
   */
  public flush(): void {
    if (this.flushing || this.size === 0) {
      return;
    }

    this.flushing = true;

    // Extract entries
    const entries: LogEntry[] = [];
    const startTime = this.enableMetrics ? Date.now() : 0;

    while (this.size > 0) {
      const entry = this.buffer[this.readPos];
      if (entry) {
        entries.push(entry);
        this.buffer[this.readPos] = null; // Clear reference
      }
      this.readPos = (this.readPos + 1) % this.capacity;
      this.size--;
    }

    if (entries.length > 0) {
      // Update metrics
      if (this.enableMetrics) {
        this.metrics.totalFlushed += entries.length;
        this.metrics.flushCount++;
        this.metrics.avgFlushSize =
          (this.metrics.avgFlushSize * (this.metrics.flushCount - 1) + entries.length) /
          this.metrics.flushCount;
        this.metrics.lastFlushTime = Date.now() - startTime;
      }

      // Call flush handler
      try {
        const result = this.onFlush(entries);

        // Handle promise if returned
        if (result && typeof result.then === 'function') {
          result.catch(error => {
            console.error('[AsyncBuffer] Flush handler error:', error);
          });
        }
      } catch (error) {
        console.error('[AsyncBuffer] Flush handler error:', error);
      }
    }

    this.flushing = false;
  }

  /**
   * Force flush and wait for completion.
   *
   * This method is async and waits for the flush to complete.
   * Used during shutdown to ensure all logs are processed.
   *
   * @returns {Promise<void>} Resolves when flush is complete
   */
  public async flushAndWait(): Promise<void> {
    return new Promise(resolve => {
      if (this.size === 0) {
        resolve();
        return;
      }

      // Temporarily replace flush handler
      const originalHandler = this.onFlush;
      const entries: LogEntry[] = [];

      // Collect entries
      while (this.size > 0) {
        const entry = this.buffer[this.readPos];
        if (entry) {
          entries.push(entry);
          this.buffer[this.readPos] = null;
        }
        this.readPos = (this.readPos + 1) % this.capacity;
        this.size--;
      }

      if (entries.length > 0) {
        // Call original handler and wait
        const result = originalHandler(entries);
        if (result && typeof result.then === 'function') {
          result.then(() => resolve()).catch(() => resolve());
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Get current buffer statistics.
   *
   * @returns {object} Buffer statistics
   */
  public getStats(): {
    size: number;
    capacity: number;
    utilization: number;
    metrics?: typeof AsyncBuffer.prototype.metrics;
  } {
    const stats = {
      size: this.size,
      capacity: this.capacity,
      utilization: this.size / this.capacity,
    };

    if (this.enableMetrics) {
      return { ...stats, metrics: { ...this.metrics } };
    }

    return stats;
  }

  /**
   * Close the buffer and clean up resources.
   *
   * @returns {Promise<void>} Resolves when buffer is closed
   */
  public async close(): Promise<void> {
    this.closing = true;

    // Stop flush timer
    this.stopFlushTimer();

    // Final flush
    await this.flushAndWait();

    // Clear buffer references
    this.buffer.fill(null);
  }

  /**
   * Start the automatic flush timer.
   * @private
   */
  private startFlushTimer(): void {
    if (this.flushInterval <= 0) {
      return;
    }

    // Use consistent timer method selection
    let timerFunction: typeof setInterval;
    if (
      typeof global !== 'undefined' &&
      (global as { setInterval?: typeof setInterval }).setInterval
    ) {
      timerFunction = (global as { setInterval: typeof setInterval }).setInterval;
    } else if (typeof setInterval !== 'undefined') {
      timerFunction = setInterval;
    } else {
      console.warn('setInterval not available, flush timer cannot be started');
      return;
    }

    this.flushTimer = timerFunction(() => {
      if (!this.closing) {
        this.flush();
      }
    }, this.flushInterval);

    // Ensure timer doesn't prevent process exit
    if (this.flushTimer && this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  /**
   * Stop the flush timer.
   * @private
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      // Use the same method we used to set the timer
      if (
        typeof global !== 'undefined' &&
        (global as { clearInterval?: typeof clearInterval }).clearInterval
      ) {
        (global as { clearInterval: typeof clearInterval }).clearInterval(this.flushTimer);
      } else if (typeof clearInterval !== 'undefined') {
        clearInterval(this.flushTimer);
      } else {
        // Fallback for environments without clearInterval
        console.warn('clearInterval not available, timer may not be properly cleared');
      }
      this.flushTimer = null;
    }
  }

  /**
   * Check if buffer is empty.
   *
   * @returns {boolean} True if buffer is empty
   */
  public isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Check if buffer is full.
   *
   * @returns {boolean} True if buffer is full
   */
  public isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * Get current buffer size.
   *
   * @returns {number} Number of entries in buffer
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Reset buffer metrics.
   */
  public resetMetrics(): void {
    if (this.enableMetrics) {
      this.metrics = {
        totalAdded: 0,
        totalFlushed: 0,
        totalDropped: 0,
        flushCount: 0,
        lastFlushTime: 0,
        avgFlushSize: 0,
      };
    }
  }

  /**
   * Check and handle water marks for backpressure signaling.
   * @private
   */
  private checkWaterMarks(): void {
    const utilization = this.size / this.capacity;

    if (!this.aboveHighWater && utilization >= this.highWaterMark) {
      this.aboveHighWater = true;
      this.onHighWater?.({
        size: this.size,
        capacity: this.capacity,
        utilization,
      });
    } else if (this.aboveHighWater && utilization <= this.lowWaterMark) {
      this.aboveHighWater = false;
      this.onLowWater?.({
        size: this.size,
        capacity: this.capacity,
        utilization,
      });
    }
  }

  /**
   * Get current buffer statistics.
   * @private
   */
  private getBufferStats(): BufferStats {
    return {
      size: this.size,
      capacity: this.capacity,
      utilization: this.size / this.capacity,
    };
  }

  /**
   * Check if buffer is currently experiencing backpressure.
   * @returns {boolean} True if above high water mark
   */
  public isBackpressured(): boolean {
    return this.aboveHighWater;
  }
}
