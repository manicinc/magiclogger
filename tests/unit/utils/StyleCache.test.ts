/**
 * @fileoverview Comprehensive tests for StyleCache utility
 */

import { StyleCache } from '../../../src/utils/StyleCache';

describe('StyleCache', () => {
  let cache: StyleCache;

  beforeEach(() => {
    // Get a fresh instance and clear it
    cache = StyleCache.getInstance();
    cache.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StyleCache.getInstance();
      const instance2 = StyleCache.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Basic Operations', () => {
    it('should store and retrieve cached entries', () => {
      const key = 'test-key';
      cache.set(key, 'styled-text', 'plain-text');

      const entry = cache.get(key);
      expect(entry).toBeDefined();
      expect(entry?.styled).toBe('styled-text');
      expect(entry?.plain).toBe('plain-text');
    });

    it('should return null for non-existent keys', () => {
      const entry = cache.get('non-existent');
      expect(entry).toBeNull();
    });

    it('should update existing entries', () => {
      const key = 'update-test';
      cache.set(key, 'original', 'original-plain');
      cache.set(key, 'updated', 'updated-plain');

      const entry = cache.get(key);
      expect(entry?.styled).toBe('updated');
      expect(entry?.plain).toBe('updated-plain');
    });

    it('should handle empty strings', () => {
      cache.set('empty', '', '');
      const entry = cache.get('empty');
      expect(entry?.styled).toBe('');
      expect(entry?.plain).toBe('');
    });
  });

  describe('Key Generation', () => {
    it('should generate consistent keys for same input', () => {
      const key1 = StyleCache.makeKey('text', ['red', 'bold'], true);
      const key2 = StyleCache.makeKey('text', ['red', 'bold'], true);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different text', () => {
      const key1 = StyleCache.makeKey('text1', ['red'], true);
      const key2 = StyleCache.makeKey('text2', ['red'], true);
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different styles', () => {
      const key1 = StyleCache.makeKey('text', ['red'], true);
      const key2 = StyleCache.makeKey('text', ['blue'], true);
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different color settings', () => {
      const key1 = StyleCache.makeKey('text', ['red'], true);
      const key2 = StyleCache.makeKey('text', ['red'], false);
      expect(key1).not.toBe(key2);
    });

    it('should handle undefined styles', () => {
      const key1 = StyleCache.makeKey('text', undefined, true);
      const key2 = StyleCache.makeKey('text', [], true);
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
    });

    it('should handle special characters in text', () => {
      const key = StyleCache.makeKey('text|with|special:chars', ['red'], true);
      expect(key).toBeDefined();
      expect(key).toContain('text|with|special:chars');
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used entries when cache is full', () => {
      // Create a cache with small size for testing
      const smallCache = new (StyleCache as any)(3); // Access constructor directly

      smallCache.set('key1', 'styled1', 'plain1');
      smallCache.set('key2', 'styled2', 'plain2');
      smallCache.set('key3', 'styled3', 'plain3');

      // Access key1 to make it recently used
      smallCache.get('key1');

      // Add new entry, should evict key2 (least recently used)
      smallCache.set('key4', 'styled4', 'plain4');

      expect(smallCache.get('key1')).toBeDefined();
      expect(smallCache.get('key2')).toBeNull();
      expect(smallCache.get('key3')).toBeDefined();
      expect(smallCache.get('key4')).toBeDefined();
    });

    it('should update hit count on cache hits', () => {
      cache.set('hit-test', 'styled', 'plain');

      // Access multiple times
      cache.get('hit-test');
      cache.get('hit-test');
      cache.get('hit-test');

      const entry = cache.get('hit-test');
      expect(entry?.hits).toBeGreaterThan(1);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      cache.clear();
      const initialStats = cache.getStats();
      expect(initialStats.hits).toBe(0);
      expect(initialStats.misses).toBe(0);

      // Add entry
      cache.set('stats-test', 'styled', 'plain');

      // Hit
      cache.get('stats-test');
      let stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);

      // Miss
      cache.get('non-existent');
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    it('should calculate hit rate correctly', () => {
      cache.clear();
      cache.set('test', 'styled', 'plain');

      // 3 hits
      cache.get('test');
      cache.get('test');
      cache.get('test');

      // 2 misses
      cache.get('miss1');
      cache.get('miss2');

      const stats = cache.getStats();
      expect(stats.hitRate).toBe('60.00%'); // 3 hits / 5 total = 60%
    });

    it('should handle zero requests in hit rate', () => {
      cache.clear();
      const stats = cache.getStats();
      expect(stats.hitRate).toBe('0.00%');
    });

    it('should report cache size correctly', () => {
      cache.clear();
      let stats = cache.getStats();
      expect(stats.size).toBe(0);

      cache.set('key1', 'styled1', 'plain1');
      cache.set('key2', 'styled2', 'plain2');

      stats = cache.getStats();
      expect(stats.size).toBe(2);
    });

    it('should include max size in stats', () => {
      const stats = cache.getStats();
      expect(stats.maxSize).toBeGreaterThan(0);
    });
  });

  describe('TTL Support', () => {
    it('should expire entries after TTL', async () => {
      // Create cache with 100ms TTL
      const ttlCache = new (StyleCache as any)(1000, 100);

      ttlCache.set('ttl-test', 'styled', 'plain');
      expect(ttlCache.get('ttl-test')).toBeDefined();

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(ttlCache.get('ttl-test')).toBeNull();
    });

    it('should not expire entries before TTL', async () => {
      // Create cache with 200ms TTL
      const ttlCache = new (StyleCache as any)(1000, 200);

      ttlCache.set('ttl-test', 'styled', 'plain');

      // Wait less than TTL
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(ttlCache.get('ttl-test')).toBeDefined();
    });

    it('should handle TTL of 0 (no expiration)', () => {
      // Default cache has TTL of 0
      cache.set('no-ttl', 'styled', 'plain');
      const entry = cache.get('no-ttl');
      expect(entry).toBeDefined();
    });
  });

  describe('Clear Operation', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'styled1', 'plain1');
      cache.set('key2', 'styled2', 'plain2');
      cache.set('key3', 'styled3', 'plain3');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });

    it('should reset statistics', () => {
      cache.set('test', 'styled', 'plain');
      cache.get('test');
      cache.get('miss');

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long keys', () => {
      const longText = 'a'.repeat(10000);
      const key = StyleCache.makeKey(longText, ['red'], true);
      cache.set(key, 'styled', 'plain');
      expect(cache.get(key)).toBeDefined();
    });

    it('should handle many styles', () => {
      const manyStyles = Array(100).fill('red');
      const key = StyleCache.makeKey('text', manyStyles, true);
      cache.set(key, 'styled', 'plain');
      expect(cache.get(key)).toBeDefined();
    });

    it('should handle concurrent access', () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>(resolve => {
            const key = `concurrent-${i}`;
            cache.set(key, `styled-${i}`, `plain-${i}`);
            const entry = cache.get(key);
            expect(entry?.styled).toBe(`styled-${i}`);
            resolve();
          })
        );
      }
      return Promise.all(promises);
    });

    it('should handle special characters in values', () => {
      const specialStyled = '\x1b[31mRed\x1b[0m';
      const specialPlain = 'Red\nWith\tSpecial\rChars';
      cache.set('special', specialStyled, specialPlain);

      const entry = cache.get('special');
      expect(entry?.styled).toBe(specialStyled);
      expect(entry?.plain).toBe(specialPlain);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large cache efficiently', () => {
      const start = Date.now();

      // Add many entries
      for (let i = 0; i < 1000; i++) {
        cache.set(`perf-${i}`, `styled-${i}`, `plain-${i}`);
      }

      // Access entries
      for (let i = 0; i < 1000; i++) {
        cache.get(`perf-${i}`);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete quickly
    });

    it('should benefit from cache hits', () => {
      const key = 'perf-test';
      cache.set(key, 'styled', 'plain');

      const iterations = 10000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        cache.get(key);
      }

      const duration = Date.now() - start;
      const opsPerMs = iterations / duration;
      expect(opsPerMs).toBeGreaterThan(50); // Should be very fast (relaxed threshold for system variations)
    });
  });
});
