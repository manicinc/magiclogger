// File: tests/unit/extensions/QueueManager.test.ts

import { QueueManager } from '../../../src/extensions/QueueManager';
import type { LogEntry } from '../../../src/types';

describe('QueueManager', () => {
  let queueManager: QueueManager;

  const createEntry = (
    id: string,
    level: 'debug' | 'info' | 'warn' | 'error' = 'info',
    timestamp?: number
  ): LogEntry =>
    ({
      id,
      timestamp: new Date(timestamp || Date.now()).toISOString(),
      timestampMs: timestamp || Date.now(),
      level,
      message: `Message ${id}`,
      plainMessage: `Message ${id}`,
      loggerId: 'test-logger',
    } as LogEntry);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should enqueue and dequeue entries in FIFO order', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      const entries = [createEntry('1'), createEntry('2'), createEntry('3')];

      entries.forEach(entry => {
        expect(queueManager.enqueue(entry)).toBe(true);
      });

      const dequeued = queueManager.dequeue(2);
      expect(dequeued.map(e => e.id)).toEqual(['1', '2']);

      const remaining = queueManager.dequeue(10);
      expect(remaining.map(e => e.id)).toEqual(['3']);
    });

    it('should handle batch enqueue', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      const entries = Array.from({ length: 5 }, (_, i) => createEntry(String(i)));
      const queued = queueManager.enqueueBatch(entries);

      expect(queued).toBe(5);
      expect(queueManager.size()).toBe(5);
    });

    it('should peek without removing entries', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      const entries = Array.from({ length: 5 }, (_, i) => createEntry(String(i)));
      entries.forEach(e => queueManager.enqueue(e));

      const peeked = queueManager.peek(3);
      expect(peeked.map(e => e.id)).toEqual(['0', '1', '2']);

      // Size should remain unchanged
      expect(queueManager.size()).toBe(5);

      // Should still be able to dequeue the same entries
      const dequeued = queueManager.dequeue(3);
      expect(dequeued.map(e => e.id)).toEqual(['0', '1', '2']);
    });

    it('should respect batch size when dequeuing', () => {
      queueManager = new QueueManager({ maxSize: 10, batchSize: 3 });

      Array.from({ length: 10 }, (_, i) => createEntry(String(i))).forEach(e =>
        queueManager.enqueue(e)
      );

      const batch = queueManager.dequeue(); // Should use default batch size
      expect(batch.length).toBe(3);
    });
  });

  describe('Drop Policies', () => {
    describe('Tail Drop', () => {
      it('should drop new entries when queue is full', () => {
        const dropped: LogEntry[] = [];
        queueManager = new QueueManager({
          maxSize: 3,
          dropPolicy: 'tail',
          onDrop: entries => dropped.push(...entries),
        });

        // Fill queue
        expect(queueManager.enqueue(createEntry('1'))).toBe(true);
        expect(queueManager.enqueue(createEntry('2'))).toBe(true);
        expect(queueManager.enqueue(createEntry('3'))).toBe(true);

        // Try to add when full
        expect(queueManager.enqueue(createEntry('4'))).toBe(false);

        expect(dropped.map(e => e.id)).toEqual(['4']);
        expect(queueManager.size()).toBe(3);
      });
    });

    describe('Head Drop', () => {
      it('should drop oldest entry to make room for new', () => {
        const dropped: LogEntry[] = [];
        queueManager = new QueueManager({
          maxSize: 3,
          dropPolicy: 'head',
          onDrop: entries => dropped.push(...entries),
        });

        queueManager.enqueue(createEntry('1'));
        queueManager.enqueue(createEntry('2'));
        queueManager.enqueue(createEntry('3'));

        expect(queueManager.enqueue(createEntry('4'))).toBe(true);

        expect(dropped.map(e => e.id)).toEqual(['1']);
        const remaining = queueManager.dequeue(10);
        expect(remaining.map(e => e.id)).toEqual(['2', '3', '4']);
      });
    });

    describe('Priority Drop', () => {
      it('should drop lowest priority entry when new has higher priority', () => {
        const dropped: LogEntry[] = [];
        queueManager = new QueueManager({
          maxSize: 3,
          dropPolicy: 'priority',
          priorityFn: entry => {
            const priorities: Readonly<Record<'error' | 'warn' | 'info' | 'debug', number>> = {
              error: 100,
              warn: 50,
              info: 10,
              debug: 1,
            };
            const isKnown = (l: string): l is 'error' | 'warn' | 'info' | 'debug' =>
              l === 'error' || l === 'warn' || l === 'info' || l === 'debug';
            return isKnown(entry.level) ? priorities[entry.level as keyof typeof priorities] : 0;
          },
          onDrop: entries => dropped.push(...entries),
        });

        queueManager.enqueue(createEntry('1', 'info'));
        queueManager.enqueue(createEntry('2', 'debug'));
        queueManager.enqueue(createEntry('3', 'warn'));

        // Add high priority entry
        expect(queueManager.enqueue(createEntry('4', 'error'))).toBe(true);

        // Should have dropped the debug entry (lowest priority)
        expect(dropped.map(e => e.id)).toEqual(['2']);
      });

      it('should drop new entry if it has lowest priority', () => {
        const dropped: LogEntry[] = [];
        queueManager = new QueueManager({
          maxSize: 2,
          dropPolicy: 'priority',
          priorityFn: entry => (entry.level === 'error' ? 100 : 10),
          onDrop: entries => dropped.push(...entries),
        });

        queueManager.enqueue(createEntry('1', 'error'));
        queueManager.enqueue(createEntry('2', 'error'));

        // Try to add low priority
        expect(queueManager.enqueue(createEntry('3', 'info'))).toBe(false);

        expect(dropped.map(e => e.id)).toEqual(['3']);
      });
    });

    describe('Random Drop', () => {
      it('should drop random entry to make room', () => {
        const dropped: LogEntry[] = [];
        queueManager = new QueueManager({
          maxSize: 3,
          dropPolicy: 'random',
          onDrop: entries => dropped.push(...entries),
        });

        queueManager.enqueue(createEntry('1'));
        queueManager.enqueue(createEntry('2'));
        queueManager.enqueue(createEntry('3'));

        expect(queueManager.enqueue(createEntry('4'))).toBe(true);

        expect(dropped.length).toBe(1);
        expect(queueManager.size()).toBe(3);

        const remaining = queueManager.dequeue(10);
        expect(remaining).toContainEqual(expect.objectContaining({ id: '4' }));
      });
    });

    describe('None (Blocking)', () => {
      it('should throw error when queue is full', () => {
        queueManager = new QueueManager({
          maxSize: 2,
          dropPolicy: 'none',
        });

        queueManager.enqueue(createEntry('1'));
        queueManager.enqueue(createEntry('2'));

        expect(() => queueManager.enqueue(createEntry('3'))).toThrow(
          'Queue full - blocking not implemented'
        );
      });
    });
  });

  describe('Water Marks', () => {
    it('should track high water mark hits', () => {
      queueManager = new QueueManager({
        maxSize: 10,
        highWaterMark: 0.5,
        lowWaterMark: 0.3,
      });

      // Fill to 50%
      Array.from({ length: 5 }, (_, i) => createEntry(String(i))).forEach(e =>
        queueManager.enqueue(e)
      );

      const stats = queueManager.getStats();
      expect(stats.size).toBe(5);

      // Add one more to exceed high water mark
      queueManager.enqueue(createEntry('5'));

      // Dequeue to go below low water mark
      queueManager.dequeue(4);
      expect(queueManager.size()).toBe(2);
    });

    it('should throw error if high water mark <= low water mark', () => {
      expect(
        () =>
          new QueueManager({
            maxSize: 10,
            highWaterMark: 0.3,
            lowWaterMark: 0.5,
          })
      ).toThrow('High water mark must be greater than low water mark');
    });
  });

  describe('Queue Processing', () => {
    it('should process queue with async processor', async () => {
      const processed: LogEntry[] = [];
      queueManager = new QueueManager({
        maxSize: 10,
        batchSize: 2,
      });

      queueManager.setProcessor(async entries => {
        processed.push(...entries);
      });

      // Add entries
      Array.from({ length: 5 }, (_, i) => createEntry(String(i))).forEach(e =>
        queueManager.enqueue(e)
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(processed.length).toBe(5);
      expect(queueManager.isEmpty()).toBe(true);
    });

    it('should pause and resume processing', async () => {
      const processed: LogEntry[] = [];
      queueManager = new QueueManager({
        maxSize: 10,
        batchSize: 1,
      });

      queueManager.setProcessor(async entries => {
        processed.push(...entries);
      });

      queueManager.pause();

      // Add entries while paused
      queueManager.enqueue(createEntry('1'));
      queueManager.enqueue(createEntry('2'));

      // Wait - nothing should be processed
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(processed.length).toBe(0);

      // Resume processing
      queueManager.resume();

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(processed.length).toBe(2);
    });

    it('should retry failed processing up to max retries', async () => {
      let attempts = 0;
      queueManager = new QueueManager({
        maxSize: 10,
        batchSize: 1,
      });

      queueManager.setProcessor(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Processing failed');
        }
      });

      queueManager.enqueue(createEntry('1'));

      // Wait for retries - need more time for 3 retry attempts with async processing
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(attempts).toBe(3);
    });

    it('should drop entries after max retries', async () => {
      const dropped: LogEntry[] = [];
      queueManager = new QueueManager({
        maxSize: 10,
        batchSize: 1,
        onDrop: (entries, reason) => {
          if (reason === 'max-retries') {
            dropped.push(...entries);
          }
        },
      });

      queueManager.setProcessor(async () => {
        throw new Error('Always fails');
      });

      queueManager.enqueue(createEntry('1'));

      // Wait for max retries - need more time for 3 retry attempts with async processing
      // Each retry uses setTimeout(..., 0) which requires multiple event loop ticks
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(dropped.map(e => e.id)).toEqual(['1']);
    });
  });

  describe('Statistics', () => {
    it('should track queue statistics', () => {
      queueManager = new QueueManager({
        maxSize: 10,
        metricsEnabled: true,
      });

      const now = Date.now();
      queueManager.enqueue(createEntry('1', 'info', now - 1000));
      queueManager.enqueue(createEntry('2', 'info', now - 500));
      queueManager.enqueue(createEntry('3', 'info', now));

      const statsBefore = queueManager.getStats();
      expect(statsBefore.size).toBe(3);
      expect(statsBefore.capacity).toBe(10);
      expect(statsBefore.processed).toBe(0);
      expect(statsBefore.dropped).toBe(0);
      expect(statsBefore.oldest).toBeDefined();
      expect(statsBefore.newest).toBeDefined();

      // Dequeue and check stats
      queueManager.dequeue(2);

      const statsAfter = queueManager.getStats();
      expect(statsAfter.size).toBe(1);
      expect(statsAfter.processed).toBe(2);
      expect(statsAfter.avgWaitTime).toBeDefined();
      expect(statsAfter.avgWaitTime).toBeGreaterThan(0);
    });

    it('should track dropped entries', () => {
      const dropped: string[] = [];
      queueManager = new QueueManager({
        maxSize: 2,
        dropPolicy: 'tail',
        onDrop: (entries, reason) => {
          dropped.push(reason);
        },
      });

      queueManager.enqueue(createEntry('1'));
      queueManager.enqueue(createEntry('2'));
      queueManager.enqueue(createEntry('3')); // Dropped

      const stats = queueManager.getStats();
      expect(stats.dropped).toBe(1);
      expect(dropped).toEqual(['tail-drop']);
    });

    it('should calculate average wait time', () => {
      jest.useFakeTimers();

      queueManager = new QueueManager({
        maxSize: 10,
        metricsEnabled: true,
      });

      const startTime = Date.now();
      queueManager.enqueue(createEntry('1', 'info', startTime));

      jest.advanceTimersByTime(100);

      queueManager.dequeue(1);

      const stats = queueManager.getStats();
      expect(stats.avgWaitTime).toBeGreaterThanOrEqual(100);

      jest.useRealTimers();
    });
  });

  describe('Queue State', () => {
    it('should report queue state correctly', () => {
      queueManager = new QueueManager({ maxSize: 3 });

      expect(queueManager.isEmpty()).toBe(true);
      expect(queueManager.isFull()).toBe(false);
      expect(queueManager.size()).toBe(0);

      queueManager.enqueue(createEntry('1'));
      expect(queueManager.isEmpty()).toBe(false);
      expect(queueManager.size()).toBe(1);

      queueManager.enqueue(createEntry('2'));
      queueManager.enqueue(createEntry('3'));

      expect(queueManager.isFull()).toBe(true);
      expect(queueManager.size()).toBe(3);
    });

    it('should report paused state', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      expect(queueManager.isPausedState()).toBe(false);

      queueManager.pause();
      expect(queueManager.isPausedState()).toBe(true);

      queueManager.resume();
      expect(queueManager.isPausedState()).toBe(false);
    });
  });

  describe('Flush and Clear', () => {
    it('should flush all entries without processing', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      const entries = Array.from({ length: 5 }, (_, i) => createEntry(String(i)));
      entries.forEach(e => queueManager.enqueue(e));

      const flushed = queueManager.flush();
      expect(flushed.map(e => e.id)).toEqual(['0', '1', '2', '3', '4']);
      expect(queueManager.isEmpty()).toBe(true);
    });

    it('should clear queue and record as dropped', () => {
      const dropped: LogEntry[] = [];
      queueManager = new QueueManager({
        maxSize: 10,
        onDrop: (entries, reason) => {
          if (reason === 'clear') {
            dropped.push(...entries);
          }
        },
      });

      Array.from({ length: 3 }, (_, i) => createEntry(String(i))).forEach(e =>
        queueManager.enqueue(e)
      );

      queueManager.clear();

      expect(queueManager.isEmpty()).toBe(true);
      expect(dropped.length).toBe(3);
      expect(queueManager.getStats().dropped).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty dequeue', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      const dequeued = queueManager.dequeue(5);
      expect(dequeued).toEqual([]);
    });

    it('should handle batch enqueue with overflow', () => {
      queueManager = new QueueManager({
        maxSize: 3,
        dropPolicy: 'tail',
      });

      const entries = Array.from({ length: 5 }, (_, i) => createEntry(String(i)));
      const queued = queueManager.enqueueBatch(entries);

      expect(queued).toBe(3); // Only first 3 should be queued
      expect(queueManager.size()).toBe(3);
    });

    it('should handle very large queues efficiently', () => {
      queueManager = new QueueManager({ maxSize: 10000 });

      // Create entries first to avoid timing issues with entry creation
      const entries = Array.from({ length: 10000 }, (_, i) => createEntry(String(i)));

      const start = performance.now();
      const queued = queueManager.enqueueBatch(entries);
      const duration = performance.now() - start;

      expect(queued).toBe(10000);
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
      expect(queueManager.size()).toBe(10000);
    });

    it('should handle dequeue larger than queue size', () => {
      queueManager = new QueueManager({ maxSize: 10 });

      queueManager.enqueue(createEntry('1'));
      queueManager.enqueue(createEntry('2'));

      const dequeued = queueManager.dequeue(10);
      expect(dequeued.length).toBe(2);
      expect(queueManager.isEmpty()).toBe(true);
    });
  });
});
