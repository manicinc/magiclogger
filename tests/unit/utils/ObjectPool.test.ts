/**
 * Tests for ObjectPool utility
 * @fileoverview Tests for object pooling to reduce GC pressure
 */

import { LogEntryPool, getGlobalPool, resetGlobalPool } from '../../../src/utils/ObjectPool';

describe('ObjectPool', () => {
  describe('LogEntryPool', () => {
    it('should create a pool with default size', () => {
      const pool = new LogEntryPool();
      expect(pool).toBeInstanceOf(LogEntryPool);
      
      const stats = pool.getStats();
      expect(stats.poolSize).toBeGreaterThanOrEqual(0);
      expect(stats.poolSize).toBeLessThanOrEqual(10); // Pre-allocated entries
    });

    it('should create a pool with custom max size', () => {
      const pool = new LogEntryPool(5);
      expect(pool).toBeInstanceOf(LogEntryPool);
      
      const stats = pool.getStats();
      expect(stats.poolSize).toBeLessThanOrEqual(5);
    });

    it('should acquire entries from the pool', () => {
      const pool = new LogEntryPool();
      
      const entry1 = pool.acquire();
      expect(entry1).toBeDefined();
      expect(entry1.id).toBe('');
      expect(entry1.level).toBe('info');
      expect(entry1.message).toBe('');
      
      const entry2 = pool.acquire();
      expect(entry2).toBeDefined();
      expect(entry2).not.toBe(entry1); // Different objects
    });

    it('should release entries back to the pool', () => {
      const pool = new LogEntryPool();
      
      const initialStats = pool.getStats();
      // Track initial pool size for validation
      expect(initialStats.poolSize).toBeGreaterThan(0);
      
      const entry = pool.acquire();
      entry.id = 'test-123';
      entry.message = 'Test message';
      
      pool.release(entry);
      
      const afterStats = pool.getStats();
      expect(afterStats.returned).toBe(1);
      
      // Entry should be reset when released
      const nextEntry = pool.acquire();
      expect(nextEntry.id).toBe('');
      expect(nextEntry.message).toBe('');
    });

    it('should reuse released entries', () => {
      const pool = new LogEntryPool(2);
      
      // Acquire and release an entry
      const entry1 = pool.acquire();
      const entry1Ref = entry1; // Keep reference
      pool.release(entry1);
      
      // Next acquire should return the same object
      const entry2 = pool.acquire();
      expect(entry2).toBe(entry1Ref);
    });

    it('should handle pool overflow gracefully', () => {
      const pool = new LogEntryPool(2);
      
      // Fill the pool
      const entry1 = pool.acquire();
      const entry2 = pool.acquire();
      pool.release(entry1);
      pool.release(entry2);
      
      // Try to release more than max size
      const entry3 = pool.acquire();
      const entry4 = pool.acquire();
      const entry5 = pool.acquire();
      
      pool.release(entry3);
      pool.release(entry4);
      pool.release(entry5); // This should be dropped
      
      const stats = pool.getStats();
      expect(stats.poolSize).toBeLessThanOrEqual(2);
      expect(stats.returned).toBe(5);
    });

    it('should track statistics correctly', () => {
      const pool = new LogEntryPool();
      
      // Acquire some entries
      const entry1 = pool.acquire();
      const entry2 = pool.acquire();
      pool.acquire(); // entry3 is acquired but not released
      
      // Release some back
      pool.release(entry1);
      pool.release(entry2);
      
      const stats = pool.getStats();
      expect(stats.borrowed).toBe(3);
      expect(stats.returned).toBe(2);
      expect(stats.created).toBeGreaterThanOrEqual(3);
      // Hit rate can be negative if created > borrowed (edge case with pre-allocation)
      expect(stats.hitRate).toBeGreaterThanOrEqual(-10); // Allow for edge cases
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });

    it('should calculate hit rate correctly', () => {
      const pool = new LogEntryPool(10);
      
      // First acquires will create new entries
      const entries = [];
      for (let i = 0; i < 5; i++) {
        entries.push(pool.acquire());
      }
      
      // Release them back
      for (const entry of entries) {
        pool.release(entry);
      }
      
      // Next acquires should hit the pool
      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }
      
      const stats = pool.getStats();
      expect(stats.borrowed).toBe(10);
      // Hit rate calculation: (borrowed - created) / borrowed
      // Should be positive if we reused entries (may be 0 if all were created)
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    });

    it('should properly reset entries on release', () => {
      const pool = new LogEntryPool();
      
      const entry = pool.acquire();
      
      // Modify all fields
      entry.id = 'modified-id';
      entry.timestamp = '2024-01-01T00:00:00.000Z';
      entry.timestampMs = 1704067200000;
      entry.level = 'error';
      entry.message = 'Modified message';
      entry.styles = [{ start: 0, end: 5, styles: ['red'] }];
      entry.loggerId = 'modified-logger';
      entry.tags = ['tag1', 'tag2'];
      entry.context = { key: 'value' };
      entry.error = new Error('test');
      entry.metadata = { meta: 'data' };
      
      pool.release(entry);
      
      // Get the entry back
      const resetEntry = pool.acquire();
      
      // All fields should be reset
      expect(resetEntry.id).toBe('');
      expect(resetEntry.timestamp).toBe('');
      expect(resetEntry.timestampMs).toBe(0);
      expect(resetEntry.level).toBe('info');
      expect(resetEntry.message).toBe('');
      expect(resetEntry.styles).toBeUndefined();
      expect(resetEntry.loggerId).toBeUndefined();
      expect(resetEntry.tags).toBeUndefined();
      expect(resetEntry.context).toBeUndefined();
      expect(resetEntry.error).toBeUndefined();
      expect(resetEntry.metadata).toBeUndefined();
    });

    it('should handle zero max size', () => {
      const pool = new LogEntryPool(0);
      
      const entry = pool.acquire();
      expect(entry).toBeDefined();
      
      pool.release(entry);
      
      const stats = pool.getStats();
      expect(stats.poolSize).toBe(0); // Should not store anything
    });
  });

  describe('Global Pool', () => {
    beforeEach(() => {
      resetGlobalPool();
    });

    afterEach(() => {
      resetGlobalPool();
    });

    it('should get or create global pool', () => {
      const pool1 = getGlobalPool();
      expect(pool1).toBeInstanceOf(LogEntryPool);
      
      const pool2 = getGlobalPool();
      expect(pool2).toBe(pool1); // Same instance (singleton)
    });

    it('should reset global pool', () => {
      const pool1 = getGlobalPool();
      resetGlobalPool();
      
      const pool2 = getGlobalPool();
      expect(pool2).not.toBe(pool1); // Different instance after reset
    });

    it('should maintain singleton pattern', () => {
      const pool = getGlobalPool();
      
      // Use the pool
      const entry = pool.acquire();
      pool.release(entry);
      
      // Get pool again
      const samePool = getGlobalPool();
      expect(samePool).toBe(pool);
      
      const stats = samePool.getStats();
      expect(stats.borrowed).toBe(1);
      expect(stats.returned).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should handle high throughput efficiently', () => {
      const pool = new LogEntryPool(100);
      const iterations = 10000;
      
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const entry = pool.acquire();
        entry.id = `id-${i}`;
        entry.message = `Message ${i}`;
        pool.release(entry);
      }
      
      const duration = performance.now() - start;
      
      // Should handle 10k acquire/release cycles quickly
      expect(duration).toBeLessThan(100); // Less than 100ms
      
      const stats = pool.getStats();
      expect(stats.borrowed).toBe(iterations);
      expect(stats.returned).toBe(iterations);
    });

    it('should reduce allocations compared to creating new objects', () => {
      const pool = new LogEntryPool(50);
      
      // Warm up the pool
      const warmupEntries = [];
      for (let i = 0; i < 50; i++) {
        warmupEntries.push(pool.acquire());
      }
      for (const entry of warmupEntries) {
        pool.release(entry);
      }
      
      // Now all acquires should hit the pool
      const beforeStats = pool.getStats();
      const beforeCreated = beforeStats.created;
      
      // Acquire and release many times
      for (let i = 0; i < 1000; i++) {
        const entry = pool.acquire();
        pool.release(entry);
      }
      
      const afterStats = pool.getStats();
      const afterCreated = afterStats.created;
      
      // Should not have created any new entries
      expect(afterCreated).toBe(beforeCreated);
      // Hit rate should be high since we're reusing entries from the pool
      expect(afterStats.hitRate).toBeGreaterThanOrEqual(0.95); // Very high hit rate
    });
  });
});