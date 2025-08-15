// File: tests/unit/transports/base/BatchingTransport.test.ts

import { BatchingTransport } from '../../../../src/transports/base/BatchingTransport';
import type { LogEntry, BatchingTransportOptions } from '../../../../src/types/transport';

/**
 * Concrete implementation of BatchingTransport for testing current API
 */
class TestBatchingTransport extends BatchingTransport {
  public sendBatchCalls: LogEntry[][] = [];
  public errorsToThrow: Error[] = [];

  protected async doInit(): Promise<void> {
    // No-op for testing
  }

  protected async sendBatch(entries: LogEntry[]): Promise<void> {
    // Record the batch
    this.sendBatchCalls.push(entries);

    // Simulate configured errors (used in retry/failed-path tests)
    if (this.errorsToThrow.length > 0) {
      const err = this.errorsToThrow.shift();
      if (err) throw err;
    }
  }

  protected async doClose(): Promise<void> {
    // Parent handles flush in doClose via close()
  }
}

/**
 * Comprehensive test suite for BatchingTransport abstract class (current implementation).
 *
 * Tests batching by size/time/bytes, queue limits, flush/close, and stats.
 */
describe('BatchingTransport', () => {
  let transport: TestBatchingTransport;
  let mockEntry: LogEntry;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.useFakeTimers({ doNotFake: ['setImmediate', 'nextTick'] });

    transport = new TestBatchingTransport({
      name: 'test-batching',
      maxBatchSize: 3,
      maxBatchTime: 5000,
      maxBatchBytes: 1024,
      // keep retry behavior default
    });

    mockEntry = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      plainMessage: 'Test message',
      loggerId: 'test-logger',
      tags: ['test'],
      context: { test: true },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const t = new TestBatchingTransport({ name: 'defaults' });
      expect(t).toBeDefined();
    });

    it('should accept custom options', () => {
      const opts: BatchingTransportOptions = {
        name: 'custom',
        maxBatchSize: 5,
        maxBatchTime: 1000,
        maxBatchBytes: 2048,
        retryDelay: 200,
      };
      const t = new TestBatchingTransport(opts);
      expect(t).toBeDefined();
    });
  });

  describe('log with batching', () => {
    it('should add entry to current batch and update stats', async () => {
      await transport.log(mockEntry);
      const stats = transport.getStats();
      expect(stats.custom?.currentBatchSize).toBe(1);
      expect(stats.queued).toBe(1);
    });

    it('should start batch timer on first entry', async () => {
      await transport.log(mockEntry);
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    it('should flush when size limit is reached', async () => {
      transport = new TestBatchingTransport({ name: 'size', maxBatchSize: 2 });

      await transport.log({ ...mockEntry, id: '1' });
      await transport.log({ ...mockEntry, id: '2' });

      // Allow any queued microtasks
      await Promise.resolve();

      expect(transport.sendBatchCalls.length).toBeGreaterThanOrEqual(1);
      expect(transport.sendBatchCalls[0]).toHaveLength(2);
    });

    it('should flush when byte limit is reached', async () => {
      transport = new TestBatchingTransport({ name: 'bytes', maxBatchBytes: 800 });
      const large = { ...mockEntry, message: 'x'.repeat(600) };

      await transport.log(large);
      await transport.log(large);
      await Promise.resolve();

      expect(transport.sendBatchCalls.length).toBeGreaterThan(0);
    });

    it('should flush on timer', async () => {
      await transport.log(mockEntry);
      expect(transport.sendBatchCalls).toHaveLength(0);

      jest.advanceTimersByTime(5000);
      // Let the flush promise chain settle
      await Promise.resolve();

      expect(transport.sendBatchCalls).toHaveLength(1);
    });

    it('should respect queue size limit and count as failure', async () => {
      transport = new TestBatchingTransport({ name: 'limit', maxQueueSize: 1 });
      await transport.log({ ...mockEntry, id: 'first' });
      await transport.log({ ...mockEntry, id: 'second' }); // exceeds limit -> handled as failure

      const stats = transport.getStats();
      expect(stats.failed).toBe(1);
      expect(stats.queued).toBe(1);
    });
  });

  describe('flush', () => {
    it('should flush current batch', async () => {
      await transport.log(mockEntry);
      expect(transport.sendBatchCalls).toHaveLength(0);

      await transport.flush();
      expect(transport.sendBatchCalls).toHaveLength(1);
    });

    it('should eventually drain the queue even on failures when retry disabled', async () => {
      transport = new TestBatchingTransport({ name: 'no-retry', retryOnFailure: false });
      transport.errorsToThrow = [new Error('fail')];

      await transport.log(mockEntry);
      await transport.flush();

      const stats = transport.getStats();
      expect(stats.failed).toBeGreaterThanOrEqual(1);
      expect(stats.queued).toBe(0);
    });
  });

  describe('close', () => {
    it('should flush before closing and stop timers', async () => {
      await transport.log(mockEntry);
      expect(jest.getTimerCount()).toBeGreaterThan(0);

      await transport.close();

      // Timer cleared
      expect(jest.getTimerCount()).toBe(0);
      // Log sent
      expect(transport.sendBatchCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('statistics', () => {
    it('should include batching custom stats', () => {
      const stats = transport.getStats();
      expect(stats.custom).toEqual(
        expect.objectContaining({
          currentBatchSize: expect.any(Number),
          currentBatchBytes: expect.any(Number),
          sendQueueLength: expect.any(Number),
          sending: expect.any(Boolean),
          maxBatchSize: expect.any(Number),
          maxBatchTime: expect.any(Number),
          maxBatchBytes: expect.any(Number),
        })
      );
    });
  });
});
