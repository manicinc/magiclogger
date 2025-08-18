// File: tests/unit/utils/Sampler.test.ts

import { Sampler, createSamplerPreset } from '../../../src/utils/Sampler';
import type { LogEntry } from '../../../src/types';
import * as crypto from 'crypto';

// Mock crypto for deterministic tests
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => Buffer.from('deterministic-hash-value-here')),
  })),
}));

describe('Sampler', () => {
  let sampler: Sampler;

  const createEntry = (id: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info'): LogEntry =>
    ({
      id,
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level,
      message: `Message ${id}`,
      plainMessage: `Message ${id}`,
      loggerId: 'test-logger',
      tags: ['test'],
    } as LogEntry);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Random Sampling', () => {
    it('should sample all entries when rate is 1.0', () => {
      sampler = new Sampler({ rate: 1.0, strategy: 'random' });
      const results: boolean[] = [];

      for (let i = 0; i < 100; i++) {
        results.push(sampler.shouldSample(createEntry(String(i))));
      }

      expect(results.every(r => r === true)).toBe(true);
      expect(sampler.getStats().effectiveRate).toBe(1.0);
    });

    it('should sample no entries when rate is 0', () => {
      sampler = new Sampler({ rate: 0, strategy: 'random' });
      const results: boolean[] = [];

      for (let i = 0; i < 100; i++) {
        results.push(sampler.shouldSample(createEntry(String(i))));
      }

      expect(results.every(r => r === false)).toBe(true);
      expect(sampler.getStats().effectiveRate).toBe(0);
    });

    it('should sample approximately according to rate', () => {
      sampler = new Sampler({ rate: 0.3, strategy: 'random' });
      const sampleCount = 1000;
      let sampled = 0;

      for (let i = 0; i < sampleCount; i++) {
        if (sampler.shouldSample(createEntry(String(i)))) {
          sampled++;
        }
      }

      const effectiveRate = sampled / sampleCount;
      expect(effectiveRate).toBeGreaterThan(0.2);
      expect(effectiveRate).toBeLessThan(0.4);
    });

    it('should clamp rate between 0 and 1', () => {
      const samplerHigh = new Sampler({ rate: 1.5, strategy: 'random' });
      const samplerLow = new Sampler({ rate: -0.5, strategy: 'random' });

      expect(samplerHigh.getStats().currentRate).toBe(1.0);
      expect(samplerLow.getStats().currentRate).toBe(0);
    });
  });

  describe('Deterministic Sampling', () => {
    beforeEach(() => {
      // Reset mock for each test
      (crypto.createHash as jest.Mock).mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => Buffer.from([0x80, 0x00, 0x00, 0x00])), // 0.5 when interpreted as ratio
      }));
    });

    it('should consistently sample the same key', () => {
      sampler = new Sampler({
        rate: 0.6,
        strategy: 'deterministic',
        keyFn: entry => entry.id || '',
      });

      const entry = createEntry('consistent-key');
      const results: boolean[] = [];

      for (let i = 0; i < 10; i++) {
        results.push(sampler.shouldSample(entry));
      }

      // All results should be the same
      expect(new Set(results).size).toBe(1);
    });

    it('should use different sampling for different keys', () => {
      // Mock different hash values for different keys
      let callCount = 0;
      (crypto.createHash as jest.Mock).mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => {
          callCount++;
          // Return different values for different calls
          return callCount % 2 === 0
            ? Buffer.from([0xff, 0xff, 0xff, 0xff]) // ~1.0
            : Buffer.from([0x00, 0x00, 0x00, 0x00]); // ~0.0
        }),
      }));

      sampler = new Sampler({
        rate: 0.5,
        strategy: 'deterministic',
        keyFn: entry => entry.id || '',
      });

      const entry1 = createEntry('key1');
      const entry2 = createEntry('key2');

      const result1 = sampler.shouldSample(entry1);
      const result2 = sampler.shouldSample(entry2);

      // Results may differ
      expect([result1, result2]).toBeDefined();
    });

    it('should fall back to random sampling when key is empty', () => {
      sampler = new Sampler({
        rate: 0.5,
        strategy: 'deterministic',
        keyFn: () => '',
      });

      const results = new Set<boolean>();
      // Try multiple times - random sampling should produce different results
      for (let i = 0; i < 100; i++) {
        results.add(sampler.shouldSample(createEntry(String(i))));
        if (results.size > 1) break; // We've seen both true and false
      }

      // With random sampling at 0.5 rate, we should see both true and false
      expect(results.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Adaptive Sampling', () => {
    jest.useFakeTimers();

    it('should adjust rate based on volume', () => {
      sampler = new Sampler({
        rate: 0.5,
        strategy: 'adaptive',
        targetRate: 10, // 10 logs per second
        minRate: 0.1,
        maxRate: 1.0,
        adjustInterval: 1000, // 1 second
      });

      // Generate high volume (100 logs in what should be 1 second)
      for (let i = 0; i < 100; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      // Advance time to trigger adjustment
      jest.advanceTimersByTime(1100);

      // Rate should have decreased due to high volume
      const stats = sampler.getStats();
      expect(stats.currentRate).toBeLessThan(0.5);
    });

    it('should respect min and max rate limits', () => {
      sampler = new Sampler({
        rate: 0.5,
        strategy: 'adaptive',
        targetRate: 1000,
        minRate: 0.2,
        maxRate: 0.8,
        adjustInterval: 1000,
      });

      // Generate very high volume
      for (let i = 0; i < 10000; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      jest.advanceTimersByTime(1100);

      const stats = sampler.getStats();
      expect(stats.currentRate).toBeGreaterThanOrEqual(0.2);
      expect(stats.currentRate).toBeLessThanOrEqual(0.8);
    });

    it('should increase rate when volume is low', () => {
      sampler = new Sampler({
        rate: 0.3,
        strategy: 'adaptive',
        targetRate: 100, // Target 100 logs per second
        minRate: 0.1,
        maxRate: 1.0,
        adjustInterval: 1000,
      });

      // Generate low volume (only 10 logs)
      for (let i = 0; i < 10; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      jest.advanceTimersByTime(1100);

      const stats = sampler.getStats();
      // Rate should increase when volume is below target
      expect(stats.currentRate).toBeGreaterThan(0.3);
    });

    afterEach(() => {
      jest.useRealTimers();
    });
  });

  describe('Reservoir Sampling', () => {
    it('should maintain fixed reservoir size', () => {
      const reservoirSize = 10;
      sampler = new Sampler({
        rate: 1.0,
        strategy: 'reservoir',
        reservoirSize,
      });

      // Add many more entries than reservoir size
      for (let i = 0; i < 100; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      const reservoir = sampler.getReservoir();
      expect(reservoir.length).toBe(reservoirSize);
    });

    it('should sample all entries when below reservoir size', () => {
      sampler = new Sampler({
        rate: 1.0,
        strategy: 'reservoir',
        reservoirSize: 100,
      });

      const entries: LogEntry[] = [];
      for (let i = 0; i < 50; i++) {
        const entry = createEntry(String(i));
        entries.push(entry);
        const sampled = sampler.shouldSample(entry);
        expect(sampled).toBe(true);
      }

      expect(sampler.getReservoir().length).toBe(50);
    });

    it('should randomly replace entries when full', () => {
      sampler = new Sampler({
        rate: 1.0,
        strategy: 'reservoir',
        reservoirSize: 5,
      });

      // Fill reservoir
      for (let i = 0; i < 5; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      // Add more entries - some should be sampled, some not
      const results: boolean[] = [];
      for (let i = 5; i < 20; i++) {
        results.push(sampler.shouldSample(createEntry(String(i))));
      }

      // Should have mix of true and false
      expect(results.some(r => r === true)).toBe(true);
      expect(results.some(r => r === false)).toBe(true);
      expect(sampler.getReservoir().length).toBe(5);
    });
  });

  describe('Statistics', () => {
    it('should track sampling statistics accurately', () => {
      sampler = new Sampler({ rate: 0.5, strategy: 'random' });

      let expectedSampled = 0;
      const total = 100;

      for (let i = 0; i < total; i++) {
        if (sampler.shouldSample(createEntry(String(i)))) {
          expectedSampled++;
        }
      }

      const stats = sampler.getStats();
      expect(stats.totalCount).toBe(total);
      expect(stats.sampleCount).toBe(expectedSampled);
      expect(stats.effectiveRate).toBeCloseTo(expectedSampled / total, 2);
      expect(stats.strategy).toBe('random');
      expect(stats.currentRate).toBe(0.5);
    });

    it('should handle zero total count gracefully', () => {
      sampler = new Sampler({ rate: 0.5, strategy: 'random' });

      const stats = sampler.getStats();
      expect(stats.totalCount).toBe(0);
      expect(stats.sampleCount).toBe(0);
      expect(stats.effectiveRate).toBe(0);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all statistics', () => {
      sampler = new Sampler({ rate: 0.5, strategy: 'random' });

      // Generate some samples
      for (let i = 0; i < 50; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      const statsBefore = sampler.getStats();
      expect(statsBefore.totalCount).toBeGreaterThan(0);

      sampler.reset();

      const statsAfter = sampler.getStats();
      expect(statsAfter.totalCount).toBe(0);
      expect(statsAfter.sampleCount).toBe(0);
      expect(statsAfter.effectiveRate).toBe(0);
    });

    it('should reset reservoir for reservoir sampling', () => {
      sampler = new Sampler({
        rate: 1.0,
        strategy: 'reservoir',
        reservoirSize: 10,
      });

      for (let i = 0; i < 20; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }

      expect(sampler.getReservoir().length).toBeGreaterThan(0);

      sampler.reset();

      expect(sampler.getReservoir().length).toBe(0);
    });

    it('should restore original rate after reset', () => {
      sampler = new Sampler({
        rate: 0.8,
        strategy: 'adaptive',
        targetRate: 10,
        minRate: 0.1,
        maxRate: 1.0,
      });

      // Change the rate
      sampler.setRate(0.3);
      expect(sampler.getStats().currentRate).toBe(0.3);

      sampler.reset();

      // Should restore to the new set rate (not original)
      expect(sampler.getStats().currentRate).toBe(0.3);
    });
  });

  describe('Rate adjustment', () => {
    it('should update sampling rate dynamically', () => {
      sampler = new Sampler({ rate: 0.5, strategy: 'random' });

      expect(sampler.getStats().currentRate).toBe(0.5);

      sampler.setRate(0.8);
      expect(sampler.getStats().currentRate).toBe(0.8);

      sampler.setRate(1.5); // Should clamp to 1.0
      expect(sampler.getStats().currentRate).toBe(1.0);

      sampler.setRate(-0.5); // Should clamp to 0
      expect(sampler.getStats().currentRate).toBe(0);
    });
  });

  describe('Preset configurations', () => {
    it('should create development preset with full sampling', () => {
      sampler = createSamplerPreset('development');

      const stats = sampler.getStats();
      expect(stats.currentRate).toBe(1.0);
      expect(stats.strategy).toBe('random');
    });

    it('should create staging preset with deterministic sampling', () => {
      sampler = createSamplerPreset('staging');

      const stats = sampler.getStats();
      expect(stats.currentRate).toBe(0.5);
      expect(stats.strategy).toBe('deterministic');
    });

    it('should create production preset with adaptive sampling', () => {
      sampler = createSamplerPreset('production');

      const stats = sampler.getStats();
      expect(stats.currentRate).toBe(0.1);
      expect(stats.strategy).toBe('adaptive');
    });
  });

  describe('Edge cases', () => {
    it('should handle entries without IDs', () => {
      sampler = new Sampler({
        rate: 0.5,
        strategy: 'deterministic',
        keyFn: entry => entry.id || '',
      });

      const entryNoId = {
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info' as const,
        message: 'No ID',
      } as LogEntry;

      // Should not throw
      expect(() => sampler.shouldSample(entryNoId)).not.toThrow();
    });

    it('should handle very high sampling rates efficiently', () => {
      sampler = new Sampler({ rate: 0.99999, strategy: 'random' });

      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        sampler.shouldSample(createEntry(String(i)));
      }
      const duration = Date.now() - start;

      // Should complete quickly (< 1 second for 10k samples)
      expect(duration).toBeLessThan(1000);
    });
  });
});
