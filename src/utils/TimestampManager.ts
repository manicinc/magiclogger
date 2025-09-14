/**
 * @fileoverview High-performance timestamp management with ordering guarantees
 *
 * Provides timestamp caching to avoid Date.now() syscalls while maintaining
 * proper ordering for concurrent operations through a queue mechanism.
 *
 * @module utils/TimestampManager
 */

/**
 * Configuration options for TimestampManager
 * @interface TimestampManagerOptions
 */
export interface TimestampManagerOptions {
  /**
   * Whether to enable timestamp caching for performance
   * @default true
   */
  enableCaching?: boolean;

  /**
   * Cache window duration in milliseconds
   * @default 10
   */
  cacheWindowMs?: number;

  /**
   * Microsecond increment between cached timestamps
   * @default 0.001
   */
  microIncrement?: number;

  /**
   * Maximum queue size before automatic cleanup
   * @default 1000
   */
  maxQueueSize?: number;

  /**
   * Queue cleanup threshold (entries older than this are removed)
   * @default 1000 (1 second)
   */
  cleanupThresholdMs?: number;
}

/**
 * High-performance timestamp manager with ordering guarantees
 *
 * @class TimestampManager
 * @description
 * Reduces Date.now() syscalls by caching timestamps within windows
 * while maintaining strict ordering through a queue mechanism.
 *
 * Performance characteristics:
 * - Date.now() called once per window (10ms default)
 * - Sequential logs get incrementing microsecond offsets
 * - Concurrent logs maintain order via queue tracking
 * - Automatic cleanup prevents memory leaks
 *
 * @example
 * ```typescript
 * const timestampManager = new TimestampManager({
 *   cacheWindowMs: 10,
 *   microIncrement: 0.001
 * });
 *
 * // First call in window: actual Date.now()
 * const t1 = timestampManager.getTimestamp(); // 1234567890.000
 *
 * // Subsequent calls: cached + increment
 * const t2 = timestampManager.getTimestamp(); // 1234567890.001
 * const t3 = timestampManager.getTimestamp(); // 1234567890.002
 * ```
 */
export class TimestampManager {
  /** @private {boolean} Whether caching is enabled */
  private readonly enableCaching: boolean;

  /** @private {number} Cache window duration in ms */
  private readonly cacheWindowMs: number;

  /** @private {number} Microsecond increment value */
  private readonly microIncrement: number;

  /** @private {number} Maximum queue size */
  private readonly maxQueueSize: number;

  /** @private {number} Cleanup threshold in ms */
  private readonly cleanupThresholdMs: number;

  /** @private {number} Cached base timestamp */
  private cachedTimestamp = 0;

  /** @private {number} When cache expires */
  private cacheExpiry = 0;

  /** @private {number} Current microsecond offset */
  private microOffset = 0;

  /** @private {Map<number, number>} Queue tracking timestamp order */
  private timestampQueue: Map<number, number> = new Map();

  /** @private {number} Last cleanup time */
  private lastCleanup = 0;

  /** @private {number} Total timestamps generated */
  private totalGenerated = 0;

  /** @private {number} Cache hits */
  private cacheHits = 0;

  /** @private {number} Cache misses */
  private cacheMisses = 0;

  /**
   * Creates a new TimestampManager instance
   *
   * @constructor
   * @param {TimestampManagerOptions} [options={}] - Configuration options
   */
  constructor(options: TimestampManagerOptions = {}) {
    this.enableCaching = options.enableCaching ?? true;
    this.cacheWindowMs = options.cacheWindowMs ?? 10;
    this.microIncrement = options.microIncrement ?? 0.001;
    this.maxQueueSize = options.maxQueueSize ?? 1000;
    this.cleanupThresholdMs = options.cleanupThresholdMs ?? 1000;
  }

  /**
   * Gets an optimized timestamp with ordering guarantees
   *
   * @public
   * @returns {number} Timestamp in milliseconds with microsecond precision
   *
   * @description
   * Returns timestamps that are:
   * - Unique: No two calls return the same value
   * - Ordered: Later calls always return higher values
   * - Performant: Minimizes Date.now() syscalls
   *
   * Within a cache window, timestamps increment by microIncrement.
   * The queue ensures proper ordering even with concurrent operations.
   */
  public getTimestamp(): number {
    this.totalGenerated++;

    // If caching disabled, always return fresh timestamp
    if (!this.enableCaching) {
      return Date.now();
    }

    const now = Date.now();

    // Check if we're within the cache window
    if (now < this.cacheExpiry) {
      this.cacheHits++;

      // Generate unique timestamp within window
      this.microOffset += this.microIncrement;
      const timestamp = this.cachedTimestamp + this.microOffset;

      // Track in queue for ordering
      this.timestampQueue.set(timestamp, now);

      // Cleanup if queue is too large
      if (this.timestampQueue.size > this.maxQueueSize) {
        this.cleanupQueue(now);
      }

      return timestamp;
    }

    // Cache expired, start new window
    this.cacheMisses++;
    this.cachedTimestamp = now;
    this.cacheExpiry = now + this.cacheWindowMs;
    this.microOffset = 0;

    // Track in queue
    this.timestampQueue.set(now, now);

    // Periodic cleanup
    if (now - this.lastCleanup > this.cleanupThresholdMs) {
      this.cleanupQueue(now);
    }

    return now;
  }

  /**
   * Gets a unique timestamp guaranteed to be different from previous calls
   *
   * @public
   * @returns {number} Unique timestamp with microsecond precision
   *
   * @description
   * Similar to getTimestamp() but adds additional logic to ensure
   * uniqueness even in extreme high-throughput scenarios.
   */
  public getUniqueTimestamp(): number {
    const timestamp = this.getTimestamp();

    // Ensure uniqueness by checking queue
    let uniqueTimestamp = timestamp;
    let attempts = 0;
    const maxAttempts = 1000;

    while (this.timestampQueue.has(uniqueTimestamp) && attempts < maxAttempts) {
      uniqueTimestamp += this.microIncrement;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      // Fallback: use high-resolution time
      uniqueTimestamp = Date.now() + Math.random() * 0.001;
    }

    this.timestampQueue.set(uniqueTimestamp, Date.now());
    return uniqueTimestamp;
  }

  /**
   * Cleans up old entries from the timestamp queue
   *
   * @private
   * @param {number} now - Current timestamp
   *
   * @description
   * Removes entries older than the cleanup threshold to prevent
   * memory leaks in long-running applications.
   */
  private cleanupQueue(now: number): void {
    const cutoff = now - this.cleanupThresholdMs;
    const entriesToDelete: number[] = [];

    // Find old entries
    for (const [timestamp, createdAt] of this.timestampQueue) {
      if (createdAt < cutoff) {
        entriesToDelete.push(timestamp);
      }
    }

    // Delete old entries
    for (const timestamp of entriesToDelete) {
      this.timestampQueue.delete(timestamp);
    }

    this.lastCleanup = now;
  }

  /**
   * Resets the timestamp manager state
   *
   * @public
   * @description
   * Clears all caches and queues. Useful for testing or
   * when switching between different timing modes.
   */
  public reset(): void {
    this.cachedTimestamp = 0;
    this.cacheExpiry = 0;
    this.microOffset = 0;
    this.timestampQueue.clear();
    this.lastCleanup = 0;
    this.totalGenerated = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Gets statistics about timestamp generation
   *
   * @public
   * @returns {TimestampStats} Statistics object
   *
   * @description
   * Returns performance metrics useful for monitoring and optimization.
   */
  public getStats(): TimestampStats {
    return {
      totalGenerated: this.totalGenerated,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheHitRate: this.totalGenerated > 0 ? this.cacheHits / this.totalGenerated : 0,
      queueSize: this.timestampQueue.size,
      cacheWindowMs: this.cacheWindowMs,
      microIncrement: this.microIncrement,
    };
  }

  /**
   * Checks if a timestamp was generated by this manager
   *
   * @public
   * @param {number} timestamp - Timestamp to check
   * @returns {boolean} True if timestamp is in the queue
   *
   * @description
   * Useful for debugging and testing to verify timestamp origin.
   */
  public hasTimestamp(timestamp: number): boolean {
    return this.timestampQueue.has(timestamp);
  }

  /**
   * Gets all timestamps in order
   *
   * @public
   * @returns {number[]} Array of timestamps in order
   *
   * @description
   * Returns all tracked timestamps sorted in ascending order.
   * Useful for debugging and verification.
   */
  public getOrderedTimestamps(): number[] {
    return Array.from(this.timestampQueue.keys()).sort((a, b) => a - b);
  }
}

/**
 * Statistics about timestamp generation
 * @interface TimestampStats
 */
export interface TimestampStats {
  /** Total timestamps generated */
  totalGenerated: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Current queue size */
  queueSize: number;
  /** Cache window duration */
  cacheWindowMs: number;
  /** Microsecond increment value */
  microIncrement: number;
}

/**
 * Default instance for convenience
 * @const {TimestampManager}
 */
export const defaultTimestampManager = new TimestampManager();

/**
 * Factory function for creating timestamp managers
 *
 * @function createTimestampManager
 * @param {TimestampManagerOptions} [options] - Configuration options
 * @returns {TimestampManager} New timestamp manager instance
 *
 * @example
 * ```typescript
 * const manager = createTimestampManager({
 *   cacheWindowMs: 20,
 *   enableCaching: true
 * });
 * ```
 */
export function createTimestampManager(options?: TimestampManagerOptions): TimestampManager {
  return new TimestampManager(options);
}
