// File: tests/unit/extensions/RateLimiter.test.ts

import { RateLimiter } from '../../../src/extensions/RateLimiter';
import type { LogEntry } from '../../../src/types';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  const createEntry = (id: string, level: 'info' | 'error' = 'info'): LogEntry =>
    ({
      id,
        timestamp: Date.now(),
      level,
      message: `Message ${id}`,
      plainMessage: `Message ${id}`,
      loggerId: 'test-logger',
    } as LogEntry);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fixed Window Strategy', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow up to max entries within window', () => {
      rateLimiter = new RateLimiter({
        max: 3,
        window: 1000,
        strategy: 'fixed',
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(true);
      expect(rateLimiter.allow(createEntry('2'))).toBe(true);
      expect(rateLimiter.allow(createEntry('3'))).toBe(true);
      expect(rateLimiter.allow(createEntry('4'))).toBe(false);
    });

    it('should reset counter after window expires', () => {
      rateLimiter = new RateLimiter({
        max: 2,
        window: 100,
        strategy: 'fixed',
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(true);
      expect(rateLimiter.allow(createEntry('2'))).toBe(true);
      expect(rateLimiter.allow(createEntry('3'))).toBe(false);

      jest.advanceTimersByTime(101);

      expect(rateLimiter.allow(createEntry('4'))).toBe(true);
      expect(rateLimiter.allow(createEntry('5'))).toBe(true);
      expect(rateLimiter.allow(createEntry('6'))).toBe(false);
    });

    it('should handle multiple keys independently', () => {
      rateLimiter = new RateLimiter({
        max: 2,
        window: 1000,
        strategy: 'fixed',
        keyFn: entry => entry.level,
      });

      expect(rateLimiter.allow(createEntry('1', 'info'))).toBe(true);
      expect(rateLimiter.allow(createEntry('2', 'info'))).toBe(true);
      expect(rateLimiter.allow(createEntry('3', 'info'))).toBe(false);

      expect(rateLimiter.allow(createEntry('4', 'error'))).toBe(true);
      expect(rateLimiter.allow(createEntry('5', 'error'))).toBe(true);
      expect(rateLimiter.allow(createEntry('6', 'error'))).toBe(false);
    });
  });

  describe('Sliding Window Strategy', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should track entries within sliding window', () => {
      const now = Date.now();
      jest.setSystemTime(now);

      rateLimiter = new RateLimiter({
        max: 3,
        window: 1000,
        strategy: 'sliding',
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(true);

      jest.advanceTimersByTime(300);
      expect(rateLimiter.allow(createEntry('2'))).toBe(true);

      jest.advanceTimersByTime(300);
      expect(rateLimiter.allow(createEntry('3'))).toBe(true);

      // Still within window from first entry
      expect(rateLimiter.allow(createEntry('4'))).toBe(false);

      // Advance past first entry's window
      jest.advanceTimersByTime(400);
      expect(rateLimiter.allow(createEntry('5'))).toBe(true);
    });

    it('should clean up old timestamps', () => {
      const now = Date.now();
      jest.setSystemTime(now);

      rateLimiter = new RateLimiter({
        max: 2,
        window: 500,
        strategy: 'sliding',
      });

      // Add entries
      rateLimiter.allow(createEntry('1'));
      rateLimiter.allow(createEntry('2'));

      // Advance past window
      jest.advanceTimersByTime(600);

      // Old entries should be cleaned up
      rateLimiter.allow(createEntry('3'));
      rateLimiter.allow(createEntry('4'));

      const stats = rateLimiter.getStats();
      expect(stats.keys).toBeGreaterThan(0);
    });

    it('should handle cleanup interval properly', () => {
      jest.useRealTimers(); // Use real timers for this test

      rateLimiter = new RateLimiter({
        max: 5,
        window: 100,
        strategy: 'sliding',
      });

      // Add some entries
      for (let i = 0; i < 5; i++) {
        rateLimiter.allow(createEntry(String(i)));
      }

      // Cleanup should happen automatically
      const stats = rateLimiter.getStats();
      expect(stats.keys).toBeGreaterThan(0);
    });
  });

  describe('Token Bucket Strategy', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should consume tokens and refill over time', () => {
      const now = Date.now();
      jest.setSystemTime(now);

      rateLimiter = new RateLimiter({
        max: 5,
        window: 1000,
        strategy: 'token-bucket',
        capacity: 5,
        refillRate: 2, // 2 tokens per second
      });

      // Consume all tokens
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.allow(createEntry(String(i)))).toBe(true);
      }
      expect(rateLimiter.allow(createEntry('6'))).toBe(false);

      // Wait for refill (0.5 seconds = 1 token)
      jest.advanceTimersByTime(500);
      expect(rateLimiter.allow(createEntry('7'))).toBe(true);
      expect(rateLimiter.allow(createEntry('8'))).toBe(false);

      // Wait for more refill
      jest.advanceTimersByTime(1000); // 2 more tokens
      expect(rateLimiter.allow(createEntry('9'))).toBe(true);
      expect(rateLimiter.allow(createEntry('10'))).toBe(true);
      expect(rateLimiter.allow(createEntry('11'))).toBe(false);
    });

    it('should not exceed capacity when refilling', () => {
      const now = Date.now();
      jest.setSystemTime(now);

      rateLimiter = new RateLimiter({
        max: 3,
        window: 1000,
        strategy: 'token-bucket',
        capacity: 3,
        refillRate: 10, // High refill rate
      });

      // Wait long enough to potentially overflow
      jest.advanceTimersByTime(5000);

      // Should only be able to use capacity amount
      let allowed = 0;
      for (let i = 0; i < 10; i++) {
        if (rateLimiter.allow(createEntry(String(i)))) {
          allowed++;
        }
      }

      expect(allowed).toBe(3);
    });

    it('should handle fractional tokens correctly', () => {
      const now = Date.now();
      jest.setSystemTime(now);

      rateLimiter = new RateLimiter({
        max: 10,
        window: 1000,
        strategy: 'token-bucket',
        capacity: 10,
        refillRate: 0.5, // 0.5 tokens per second
      });

      // Use one token
      expect(rateLimiter.allow(createEntry('1'))).toBe(true);

      // Wait 1 second (should add 0.5 tokens, not enough for 1)
      jest.advanceTimersByTime(1000);
      expect(rateLimiter.allow(createEntry('2'))).toBe(false);

      // Wait another second (now we have 1 token)
      jest.advanceTimersByTime(1000);
      expect(rateLimiter.allow(createEntry('3'))).toBe(true);
    });
  });

  describe('Leaky Bucket Strategy', () => {
    it('should behave similar to token bucket', () => {
      jest.useFakeTimers();

      rateLimiter = new RateLimiter({
        max: 3,
        window: 1000,
        strategy: 'leaky-bucket',
        capacity: 3,
        refillRate: 1,
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(true);
      expect(rateLimiter.allow(createEntry('2'))).toBe(true);
      expect(rateLimiter.allow(createEntry('3'))).toBe(true);
      expect(rateLimiter.allow(createEntry('4'))).toBe(false);

      jest.advanceTimersByTime(1100);
      expect(rateLimiter.allow(createEntry('5'))).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('Per-Key Rate Limiting', () => {
    it('should track different keys independently', () => {
      rateLimiter = new RateLimiter({
        max: 2,
        window: 1000,
        strategy: 'sliding',
        keyFn: entry => entry.loggerId || 'default',
      });

      const entry1 = { ...createEntry('1'), loggerId: 'logger-1' };
      const entry2 = { ...createEntry('2'), loggerId: 'logger-1' };
      const entry3 = { ...createEntry('3'), loggerId: 'logger-1' };
      const entry4 = { ...createEntry('4'), loggerId: 'logger-2' };
      const entry5 = { ...createEntry('5'), loggerId: 'logger-2' };

      expect(rateLimiter.allow(entry1)).toBe(true);
      expect(rateLimiter.allow(entry2)).toBe(true);
      expect(rateLimiter.allow(entry3)).toBe(false); // logger-1 limit reached

      expect(rateLimiter.allow(entry4)).toBe(true); // logger-2 still has capacity
      expect(rateLimiter.allow(entry5)).toBe(true);
    });

    it('should use default key when keyFn returns empty string', () => {
      rateLimiter = new RateLimiter({
        max: 2,
        window: 1000,
        strategy: 'fixed',
        keyFn: () => '',
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(true);
      expect(rateLimiter.allow(createEntry('2'))).toBe(true);
      expect(rateLimiter.allow(createEntry('3'))).toBe(false);
    });
  });

  describe('Drop Tracking', () => {
    it('should track dropped entries', () => {
      const droppedCallback = jest.fn();
      rateLimiter = new RateLimiter({
        max: 1,
        window: 1000,
        strategy: 'fixed',
        onLimit: droppedCallback,
      });

      rateLimiter.allow(createEntry('1'));

      // Drop 100 entries to trigger callback
      for (let i = 2; i <= 101; i++) {
        rateLimiter.allow(createEntry(String(i)));
      }

      expect(droppedCallback).toHaveBeenCalledWith('default', 100);

      const stats = rateLimiter.getStats();
      expect(stats.dropped.get('default')).toBe(100);
    });

    it('should track drops per key', () => {
      rateLimiter = new RateLimiter({
        max: 1,
        window: 1000,
        strategy: 'fixed',
        keyFn: entry => entry.level,
      });

      rateLimiter.allow(createEntry('1', 'info'));
      rateLimiter.allow(createEntry('2', 'info')); // dropped
      rateLimiter.allow(createEntry('3', 'info')); // dropped

      rateLimiter.allow(createEntry('4', 'error'));
      rateLimiter.allow(createEntry('5', 'error')); // dropped

      const stats = rateLimiter.getStats();
      expect(stats.dropped.get('info')).toBe(2);
      expect(stats.dropped.get('error')).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      rateLimiter = new RateLimiter({
        max: 2,
        window: 1000,
        strategy: 'sliding',
        keyFn: entry => entry.level,
      });

      rateLimiter.allow(createEntry('1', 'info'));
      rateLimiter.allow(createEntry('2', 'error'));
      rateLimiter.allow(createEntry('3', 'info'));
      rateLimiter.allow(createEntry('4', 'info')); // dropped

      const stats = rateLimiter.getStats();
      expect(stats.strategy).toBe('sliding');
      expect(stats.keys).toBeGreaterThanOrEqual(1);
      expect(stats.dropped.size).toBeGreaterThan(0);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state', () => {
      rateLimiter = new RateLimiter({
        max: 2,
        window: 1000,
        strategy: 'fixed',
      });

      rateLimiter.allow(createEntry('1'));
      rateLimiter.allow(createEntry('2'));
      rateLimiter.allow(createEntry('3')); // dropped

      rateLimiter.reset();

      const stats = rateLimiter.getStats();
      expect(stats.keys).toBe(0);
      expect(stats.dropped.size).toBe(0);

      // Should be able to allow again
      expect(rateLimiter.allow(createEntry('4'))).toBe(true);
      expect(rateLimiter.allow(createEntry('5'))).toBe(true);
    });

    it('should reset specific key', () => {
      rateLimiter = new RateLimiter({
        max: 1,
        window: 1000,
        strategy: 'fixed',
        keyFn: entry => entry.level,
      });

      rateLimiter.allow(createEntry('1', 'info'));
      rateLimiter.allow(createEntry('2', 'info')); // dropped
      rateLimiter.allow(createEntry('3', 'error'));

      rateLimiter.resetKey('info');

      // info should be reset
      expect(rateLimiter.allow(createEntry('4', 'info'))).toBe(true);
      // error should still be limited
      expect(rateLimiter.allow(createEntry('5', 'error'))).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero max', () => {
      rateLimiter = new RateLimiter({
        max: 0,
        window: 1000,
        strategy: 'fixed',
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(false);
      expect(rateLimiter.allow(createEntry('2'))).toBe(false);
    });

    it('should handle very small windows', () => {
      jest.useFakeTimers();

      rateLimiter = new RateLimiter({
        max: 1,
        window: 1, // 1ms window
        strategy: 'fixed',
      });

      expect(rateLimiter.allow(createEntry('1'))).toBe(true);
      jest.advanceTimersByTime(2);
      expect(rateLimiter.allow(createEntry('2'))).toBe(true);

      jest.useRealTimers();
    });

    it('should handle high concurrency', () => {
      rateLimiter = new RateLimiter({
        max: 100,
        window: 1000,
        strategy: 'sliding',
      });

      const promises = Array.from({ length: 200 }, (_, i) =>
        Promise.resolve(rateLimiter.allow(createEntry(String(i))))
      );

      return Promise.all(promises).then(results => {
        const allowed = results.filter(r => r === true).length;
        expect(allowed).toBe(100);
      });
    });

    it('should handle custom refill rates', () => {
      jest.useFakeTimers();

      rateLimiter = new RateLimiter({
        max: 10,
        window: 1000,
        strategy: 'token-bucket',
        refillRate: 5,
        capacity: 10,
      });

      // Use all tokens
      for (let i = 0; i < 10; i++) {
        rateLimiter.allow(createEntry(String(i)));
      }

      // Wait for partial refill
      jest.advanceTimersByTime(400); // Should add 2 tokens (5 * 0.4)

      let allowed = 0;
      for (let i = 10; i < 15; i++) {
        if (rateLimiter.allow(createEntry(String(i)))) {
          allowed++;
        }
      }

      expect(allowed).toBe(2);

      jest.useRealTimers();
    });
  });
});
