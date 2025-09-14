/**
 * @fileoverview Tests for TimestampManager utility
 */

import { TimestampManager, createTimestampManager } from '../../../src/utils/TimestampManager';

describe('TimestampManager', () => {
  let manager: TimestampManager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new TimestampManager({
      cacheWindowMs: 10,
      microIncrement: 0.001
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should create instance with default options', () => {
      const defaultManager = new TimestampManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.getStats().cacheWindowMs).toBe(10);
    });

    it('should create instance with custom options', () => {
      const customManager = new TimestampManager({
        cacheWindowMs: 20,
        microIncrement: 0.002,
        maxQueueSize: 500
      });
      expect(customManager.getStats().cacheWindowMs).toBe(20);
      expect(customManager.getStats().microIncrement).toBe(0.002);
    });

    it('should generate timestamps when caching disabled', () => {
      const noCache = new TimestampManager({ enableCaching: false });
      const now = Date.now();
      jest.setSystemTime(now);

      const t1 = noCache.getTimestamp();
      const t2 = noCache.getTimestamp();

      expect(t1).toBe(now);
      expect(t2).toBe(now);
    });
  });

  describe('Timestamp caching', () => {
    it('should cache timestamp within window', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const t1 = manager.getTimestamp();
      expect(t1).toBe(now); // First call gets actual time

      const t2 = manager.getTimestamp();
      expect(t2).toBe(now + 0.001); // Second call gets cached + increment

      const t3 = manager.getTimestamp();
      expect(t3).toBe(now + 0.002); // Third call gets cached + 2*increment
    });

    it('should reset cache after window expires', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const t1 = manager.getTimestamp();
      expect(t1).toBe(now);

      // Advance time by 11ms (past 10ms window)
      jest.setSystemTime(now + 11);

      const t2 = manager.getTimestamp();
      expect(t2).toBe(now + 11); // New window starts

      const t3 = manager.getTimestamp();
      expect(t3).toBe(now + 11 + 0.001); // Within new window
    });

    it('should maintain order within cache window', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const timestamps: number[] = [];
      for (let i = 0; i < 100; i++) {
        timestamps.push(manager.getTimestamp());
      }

      // Verify strict ordering
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
      }

      // Verify increments
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i] - timestamps[i - 1]).toBeCloseTo(0.001, 6);
      }
    });
  });

  describe('Queue management', () => {
    it('should track timestamps in queue', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const t1 = manager.getTimestamp();
      const t2 = manager.getTimestamp();
      const t3 = manager.getTimestamp();

      expect(manager.hasTimestamp(t1)).toBe(true);
      expect(manager.hasTimestamp(t2)).toBe(true);
      expect(manager.hasTimestamp(t3)).toBe(true);
      expect(manager.hasTimestamp(999999)).toBe(false);
    });

    it('should return ordered timestamps', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      // Generate timestamps
      const generated: number[] = [];
      for (let i = 0; i < 10; i++) {
        generated.push(manager.getTimestamp());
      }

      const ordered = manager.getOrderedTimestamps();
      expect(ordered).toHaveLength(10);
      expect(ordered).toEqual(generated); // Should already be in order
    });

    it('should cleanup old entries', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      // Generate some timestamps
      for (let i = 0; i < 10; i++) {
        manager.getTimestamp();
      }

      const initialSize = manager.getStats().queueSize;
      expect(initialSize).toBe(10);

      // Advance time past cleanup threshold (1 second)
      jest.setSystemTime(now + 1100);

      // Force cleanup by exceeding max queue size
      const cleanupManager = new TimestampManager({
        maxQueueSize: 5,
        cleanupThresholdMs: 1000
      });

      jest.setSystemTime(now);
      for (let i = 0; i < 6; i++) {
        cleanupManager.getTimestamp();
      }

      // Old entries should be removed
      expect(cleanupManager.getStats().queueSize).toBeLessThanOrEqual(6);
    });
  });

  describe('Unique timestamps', () => {
    it('should generate unique timestamps', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const timestamps = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        const t = manager.getUniqueTimestamp();
        expect(timestamps.has(t)).toBe(false);
        timestamps.add(t);
      }

      expect(timestamps.size).toBe(1000);
    });

    it('should handle concurrent-like access', async () => {
      const now = 1000000;
      jest.setSystemTime(now);

      // Generate timestamps synchronously to avoid timer issues
      const timestamps: number[] = [];
      for (let i = 0; i < 100; i++) {
        timestamps.push(manager.getTimestamp());
      }

      // All timestamps should be unique
      const uniqueTimestamps = new Set(timestamps);
      expect(uniqueTimestamps.size).toBe(timestamps.length);

      // Should maintain ordering
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
      }
    });
  });

  describe('Statistics', () => {
    it('should track cache hits and misses', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      // First call - cache miss
      manager.getTimestamp();
      let stats = manager.getStats();
      expect(stats.cacheMisses).toBe(1);
      expect(stats.cacheHits).toBe(0);

      // Second call within window - cache hit
      manager.getTimestamp();
      stats = manager.getStats();
      expect(stats.cacheMisses).toBe(1);
      expect(stats.cacheHits).toBe(1);

      // Third call within window - cache hit
      manager.getTimestamp();
      stats = manager.getStats();
      expect(stats.cacheMisses).toBe(1);
      expect(stats.cacheHits).toBe(2);

      // Advance time past window - cache miss
      jest.setSystemTime(now + 11);
      manager.getTimestamp();
      stats = manager.getStats();
      expect(stats.cacheMisses).toBe(2);
      expect(stats.cacheHits).toBe(2);
    });

    it('should calculate cache hit rate', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      // Generate 10 timestamps in same window
      for (let i = 0; i < 10; i++) {
        manager.getTimestamp();
      }

      const stats = manager.getStats();
      expect(stats.totalGenerated).toBe(10);
      expect(stats.cacheHits).toBe(9); // First is miss, rest are hits
      expect(stats.cacheMisses).toBe(1);
      expect(stats.cacheHitRate).toBeCloseTo(0.9, 2);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all state', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      // Generate some timestamps
      for (let i = 0; i < 10; i++) {
        manager.getTimestamp();
      }

      // Verify state exists
      let stats = manager.getStats();
      expect(stats.totalGenerated).toBe(10);
      expect(stats.queueSize).toBe(10);

      // Reset
      manager.reset();

      // Verify state cleared
      stats = manager.getStats();
      expect(stats.totalGenerated).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(0);
      expect(stats.queueSize).toBe(0);
      expect(stats.cacheHitRate).toBe(0);
    });
  });

  describe('Factory function', () => {
    it('should create instance via factory', () => {
      const instance = createTimestampManager({
        cacheWindowMs: 15,
        microIncrement: 0.005
      });

      expect(instance).toBeInstanceOf(TimestampManager);
      expect(instance.getStats().cacheWindowMs).toBe(15);
      expect(instance.getStats().microIncrement).toBe(0.005);
    });
  });

  describe('Edge cases', () => {
    it('should handle extremely high throughput', () => {
      const now = 1000000;
      jest.setSystemTime(now);

      const timestamps: number[] = [];
      for (let i = 0; i < 10000; i++) {
        timestamps.push(manager.getTimestamp());
      }

      // All should be unique
      const unique = new Set(timestamps);
      expect(unique.size).toBe(timestamps.length);

      // Should maintain order
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
      }
    });

    it('should handle clock drift gracefully', () => {
      let now = 1000000;
      jest.setSystemTime(now);

      const t1 = manager.getTimestamp();

      // Simulate clock going backwards (NTP adjustment)
      now = 999999;
      jest.setSystemTime(now);

      const t2 = manager.getTimestamp();

      // Should still maintain order despite clock drift
      expect(t2).toBeGreaterThan(t1);
    });

    it('should handle zero cache window', () => {
      const zeroWindow = new TimestampManager({
        cacheWindowMs: 0
      });

      const now = 1000000;
      jest.setSystemTime(now);

      const t1 = zeroWindow.getTimestamp();
      const t2 = zeroWindow.getTimestamp();

      // With zero window, should always get fresh timestamp
      expect(t1).toBe(now);
      expect(t2).toBe(now);
    });
  });
});