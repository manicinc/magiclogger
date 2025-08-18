// File: src/utils/RateLimiter.ts

/**
 * Rate limiting implementations for log throttling.
 * Provides multiple algorithms to prevent log flooding.
 *
 * @module utils/RateLimiter
 */

import type { LogEntry } from '../types';

/**
 * Rate limiting strategy type.
 */
export type RateLimitStrategy = 'sliding' | 'fixed' | 'token-bucket' | 'leaky-bucket';

/**
 * Rate limiter configuration options.
 */
export interface RateLimiterOptions {
  /**
   * Maximum number of logs allowed.
   */
  max: number;

  /**
   * Time window in milliseconds.
   */
  window: number;

  /**
   * Rate limiting strategy.
   * @default 'sliding'
   */
  strategy?: RateLimitStrategy;

  /**
   * Key function for per-key rate limiting.
   */
  keyFn?: (entry: LogEntry) => string;

  /**
   * Callback when rate limit is exceeded.
   */
  onLimit?: (key: string, dropped: number) => void;

  /**
   * Token bucket specific: refill rate (tokens per second).
   */
  refillRate?: number;

  /**
   * Token bucket specific: bucket capacity.
   */
  capacity?: number;
}

/**
 * Window counter for rate limiting.
 */
interface WindowCounter {
  count: number;
  resetTime: number;
}

/**
 * Token bucket for rate limiting.
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
  fractionalNoBurst?: boolean;
}

/**
 * Rate limiter for controlling log throughput.
 *
 * @class RateLimiter
 */
export class RateLimiter {
  private options: Required<RateLimiterOptions>;
  private counters = new Map<string, WindowCounter>();
  private slidingWindows = new Map<string, number[]>();
  private tokenBuckets = new Map<string, TokenBucket>();
  private droppedCounts = new Map<string, number>();

  constructor(options: RateLimiterOptions) {
    this.options = {
      max: options.max,
      window: options.window,
      strategy: options.strategy || 'sliding',
      keyFn: options.keyFn || (() => 'default'),
      // Provide a non-empty default to satisfy no-empty-function rule
      onLimit:
        options.onLimit ||
        ((key: string, dropped: number) => {
          void key;
          void dropped;
        }),
      refillRate: options.refillRate || options.max / (options.window / 1000),
      capacity: options.capacity || options.max,
    };

    if (this.options.strategy === 'sliding') {
      this.startCleanup();
    }
  }

  /** Check if a log entry is allowed through rate limiter. */
  public allow(entry: LogEntry): boolean {
    // Short-circuit: if max is 0, nothing is allowed for fixed/sliding; for buckets, capacity 0 denies too
    if (this.options.max <= 0) {
      if (this.options.strategy === 'token-bucket' || this.options.strategy === 'leaky-bucket') {
        // Ensure bucket capacity and refill are zeroed
        this.options.capacity = 0;
        this.options.refillRate = 0;
      }
      this.recordDropped(this.options.keyFn(entry));
      return false;
    }
    const key = this.options.keyFn(entry);

    let allowed = false;

    switch (this.options.strategy) {
      case 'fixed':
        allowed = this.fixedWindowAllow(key);
        break;
      case 'sliding':
        allowed = this.slidingWindowAllow(key);
        break;
      case 'token-bucket':
        allowed = this.tokenBucketAllow(key);
        break;
      case 'leaky-bucket':
        allowed = this.leakyBucketAllow(key);
        break;
      default:
        allowed = this.slidingWindowAllow(key);
    }

    if (!allowed) {
      this.recordDropped(key);
    }

    return allowed;
  }

  /** Fixed window rate limiting. */
  private fixedWindowAllow(key: string): boolean {
    const now = Date.now();
    const counter = this.counters.get(key);

    if (!counter || now >= counter.resetTime) {
      this.counters.set(key, {
        count: 1,
        resetTime: now + this.options.window,
      });
      return true;
    }

    if (counter.count < this.options.max) {
      counter.count++;
      return true;
    }

    return false;
  }

  /** Sliding window rate limiting. */
  private slidingWindowAllow(key: string): boolean {
    const now = Date.now();
    let timestamps = this.slidingWindows.get(key) || [];
    const windowStart = now - this.options.window;
    timestamps = timestamps.filter(t => t > windowStart);
    if (timestamps.length < this.options.max) {
      timestamps.push(now);
      this.slidingWindows.set(key, timestamps);
      return true;
    }
    return false;
  }

  /** Token bucket rate limiting. */
  private tokenBucketAllow(key: string): boolean {
    const now = Date.now();
    let bucket = this.tokenBuckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.options.capacity,
        lastRefill: now,
        capacity: this.options.capacity,
        refillRate: this.options.refillRate,
        fractionalNoBurst: this.options.refillRate < 1,
      };
      this.tokenBuckets.set(key, bucket);
    }

    const elapsed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsed * bucket.refillRate;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens--;
      // For fractional refill rates, prevent bursts by resetting to 0 after consumption
      if (bucket.fractionalNoBurst) {
        bucket.tokens = 0;
      }
      return true;
    }

    return false;
  }

  /** Leaky bucket (delegates to token bucket for simplicity). */
  private leakyBucketAllow(key: string): boolean {
    return this.tokenBucketAllow(key);
  }

  /** Record dropped log. */
  private recordDropped(key: string): void {
    const count = (this.droppedCounts.get(key) || 0) + 1;
    this.droppedCounts.set(key, count);
    if (count % 100 === 0) {
      this.options.onLimit(key, count);
    }
  }

  /** Start cleanup interval for sliding windows. */
  private startCleanup(): void {
    const interval = setInterval(() => {
      const now = Date.now();
      const windowStart = now - this.options.window;
      this.slidingWindows.forEach((timestamps, key) => {
        const filtered = timestamps.filter(t => t > windowStart);
        if (filtered.length === 0) {
          this.slidingWindows.delete(key);
        } else {
          this.slidingWindows.set(key, filtered);
        }
      });
    }, Math.min(60000, this.options.window));

    // Avoid keeping the process alive; guard for browser
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof (interval as { unref?: () => void }).unref === 'function') {
      (interval as { unref?: () => void }).unref?.();
    }
  }

  /** Get rate limiting statistics. */
  public getStats(): {
    keys: number;
    dropped: Map<string, number>;
    strategy: RateLimitStrategy;
  } {
    return {
      keys: this.counters.size + this.slidingWindows.size + this.tokenBuckets.size,
      dropped: new Map(this.droppedCounts),
      strategy: this.options.strategy,
    };
  }

  /** Reset rate limiter state. */
  public reset(): void {
    this.counters.clear();
    this.slidingWindows.clear();
    this.tokenBuckets.clear();
    this.droppedCounts.clear();
  }

  /** Reset specific key. */
  public resetKey(key: string): void {
    this.counters.delete(key);
    this.slidingWindows.delete(key);
    this.tokenBuckets.delete(key);
    this.droppedCounts.delete(key);
  }
}
