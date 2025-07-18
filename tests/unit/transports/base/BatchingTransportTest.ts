// File: tests/unit/transports/base/BatchingTransport.test.ts

import { BatchingTransport } from '../../../../src/transports/base/BatchingTransport';
import type { LogEntry, BatchingTransportOptions } from '../../../../src/types/transport';

/**
 * Concrete implementation of BatchingTransport for testing
 */
class TestBatchingTransport extends BatchingTransport {
  public sendBatchCalls: Array<{ data: any; batch: any }> = [];
  public sendBatchErrors: Error[] = [];
  public compressCalls = 0;

  protected async doInit(): Promise<void> {
    // No-op for testing
  }

  protected async sendBatch(data: any, batch: any): Promise<void> {
    this.sendBatchCalls.push({ data, batch });
    
    // Simulate errors if configured
    if (this.sendBatchErrors.length > 0) {
      const error = this.sendBatchErrors.shift()!;
      throw error;
    }
  }

  protected async doClose(): Promise<void> {
    // Handled by parent BatchingTransport
  }

  // Expose protected methods for testing
  public async testAddToBatch(entry: LogEntry): Promise<void> {
    return this.addToBatch(entry);
  }

  public testCalculateEntrySize(entry: LogEntry): number {
    return this.calculateEntrySize(entry);
  }

  public testCreateBatch(): any {
    return this.createBatch();
  }

  public async testFlushCurrentBatch(): Promise<void> {
    return this.flushCurrentBatch();
  }

  public async testProcessQueue(): Promise<void> {
    return this.processQueue();
  }

  public async testPrepareBatch(batch: any): Promise<any> {
    return this.prepareBatch(batch);
  }

  public async testCompressBatch(data: any): Promise<any> {
    this.compressCalls++;
    return this.compressBatch(data);
  }

  public async testShouldRetry(error: Error, batch: any): Promise<boolean> {
    return this.shouldRetry(error, batch);
  }

  public async testWaitForRetry(retryCount: number): Promise<void> {
    return this.waitForRetry(retryCount);
  }

  public getCurrentBatch(): any {
    return this.currentBatch;
  }

  public getBatchQueue(): any[] {
    return this.batchQueue;
  }

  public getSending(): boolean {
    return this.sending;
  }
}

/**
 * Comprehensive test suite for BatchingTransport abstract class.
 * 
 * Tests batching logic, size/time limits, compression, retries, and queue management.
 */
describe('BatchingTransport', () => {
  let transport: TestBatchingTransport;
  let mockEntry: LogEntry;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    transport = new TestBatchingTransport({
      name: 'test-batching',
      maxBatchSize: 3,
      maxBatchTime: 5000,
      maxBatchBytes: 1024,
      immediate: false,
      compress: false
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
      context: { test: true }
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const t = new TestBatchingTransport({ name: 'defaults' });
      
      // Test through behavior since properties are protected
      expect(t).toBeDefined();
    });

    it('should validate batch size', () => {
      expect(() => new TestBatchingTransport({
        name: 'invalid-size',
        maxBatchSize: 0
      })).toThrow('maxBatchSize must be at least 1');
    });

    it('should validate batch time', () => {
      expect(() => new TestBatchingTransport({
        name: 'invalid-time',
        maxBatchTime: -1
      })).toThrow('maxBatchTime must be non-negative');
    });

    it('should validate batch bytes', () => {
      expect(() => new TestBatchingTransport({
        name: 'invalid-bytes',
        maxBatchBytes: 0
      })).toThrow('maxBatchBytes must be at least 1');
    });
  });

  describe('log with batching', () => {
    it('should add entry to batch', async () => {
      await transport.log(mockEntry);
      
      const batch = transport.getCurrentBatch();
      expect(batch).toBeDefined();
      expect(batch.entries).toHaveLength(1);
      expect(batch.entries[0]).toBe(mockEntry);
    });

    it('should create batch on first log', async () => {
      expect(transport.getCurrentBatch()).toBeNull();
      
      await transport.log(mockEntry);
      
      expect(transport.getCurrentBatch()).toBeDefined();
    });

    it('should start batch timer', async () => {
      await transport.log(mockEntry);
      
      // Timer should be started
      expect(jest.getTimerCount()).toBe(1);
    });

    it('should flush batch when size limit reached', async () => {
      // maxBatchSize is 3
      await transport.log(mockEntry);
      await transport.log({ ...mockEntry, id: '2' });
      await transport.log({ ...mockEntry, id: '3' });
      
      // Should have flushed
      expect(transport.sendBatchCalls).toHaveLength(1);
      expect(transport.sendBatchCalls[0].data).toHaveLength(3);
      
      // Fourth entry starts new batch
      await transport.log({ ...mockEntry, id: '4' });
      expect(transport.getCurrentBatch()?.entries).toHaveLength(1);
    });

    it('should flush batch when byte limit reached', async () => {
      // Create large entry
      const largeEntry = {
        ...mockEntry,
        message: 'x'.repeat(500) // Large message
      };
      
      await transport.log(largeEntry);
      await transport.log(largeEntry);
      
      // Should have flushed due to size
      expect(transport.sendBatchCalls.length).toBeGreaterThan(0);
    });

    it('should flush batch on timer', async () => {
      await transport.log(mockEntry);
      
      expect(transport.sendBatchCalls).toHaveLength(0);
      
      // Advance time to trigger flush
      jest.advanceTimersByTime(5000);
      await Promise.resolve(); // Let promises settle
      
      expect(transport.sendBatchCalls).toHaveLength(1);
    });

    it('should handle immediate mode', async () => {
      transport = new TestBatchingTransport({
        name: 'immediate',
        immediate: true
      });
      
      await transport.log(mockEntry);
      
      // Should send immediately
      expect(transport.sendBatchCalls).toHaveLength(1);
      expect(transport.sendBatchCalls[0].data).toHaveLength(1);
    });

    it('should not start timer when maxBatchTime is 0', async () => {
      transport = new TestBatchingTransport({
        name: 'no-timer',
        maxBatchTime: 0
      });
      
      await transport.log(mockEntry);
      
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should handle log errors', async () => {
      // Force an error in addToBatch
      jest.spyOn(transport, 'testAddToBatch').mockRejectedValue(new Error('Add failed'));
      
      await transport.log(mockEntry);
      
      const stats = transport.getStats();
      expect(stats.failed).toBe(1);
    });
  });

  describe('batch management', () => {
    it('should calculate entry size', () => {
      const size = transport.testCalculateEntrySize(mockEntry);
      
      expect(size).toBeGreaterThan(0);
      expect(size).toBe(Buffer.byteLength(JSON.stringify(mockEntry), 'utf8'));
    });

    it('should create batch with metadata', () => {
      const batch = transport.testCreateBatch();
      
      expect(batch).toHaveProperty('id');
      expect(batch).toHaveProperty('entries');
      expect(batch).toHaveProperty('sizeBytes');
      expect(batch).toHaveProperty('createdAt');
      expect(batch).toHaveProperty('retryCount');
      expect(batch.entries).toEqual([]);
      expect(batch.sizeBytes).toBe(0);
      expect(batch.retryCount).toBe(0);
    });

    it('should update batch statistics', async () => {
      await transport.testAddToBatch(mockEntry);
      
      const batch = transport.getCurrentBatch();
      expect(batch.entries).toHaveLength(1);
      expect(batch.sizeBytes).toBeGreaterThan(0);
      
      const stats = transport.getStats();
      expect(stats.queued).toBe(1);
    });

    it('should clear batch timer on flush', async () => {
      await transport.log(mockEntry);
      expect(jest.getTimerCount()).toBe(1);
      
      await transport.testFlushCurrentBatch();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should move batch to queue on flush', async () => {
      await transport.log(mockEntry);
      expect(transport.getBatchQueue()).toHaveLength(0);
      
      await transport.testFlushCurrentBatch();
      expect(transport.getBatchQueue()).toHaveLength(1);
      expect(transport.getCurrentBatch()).toBeNull();
    });

    it('should not flush empty batch', async () => {
      await transport.testFlushCurrentBatch();
      
      expect(transport.getBatchQueue()).toHaveLength(0);
      expect(transport.sendBatchCalls).toHaveLength(0);
    });
  });

  describe('queue processing', () => {
    it('should process queued batches', async () => {
      await transport.log(mockEntry);
      await transport.testFlushCurrentBatch();
      
      await transport.testProcessQueue();
      
      expect(transport.sendBatchCalls).toHaveLength(1);
      expect(transport.getBatchQueue()).toHaveLength(0);
    });

    it('should prevent concurrent processing', async () => {
      await transport.log(mockEntry);
      await transport.testFlushCurrentBatch();
      
      // Start processing
      const process1 = transport.testProcessQueue();
      const process2 = transport.testProcessQueue();
      
      await Promise.all([process1, process2]);
      
      // Should only send once
      expect(transport.sendBatchCalls).toHaveLength(1);
    });

    it('should handle send errors with retry', async () => {
      transport.sendBatchErrors = [
        new Error('First attempt failed'),
        new Error('Second attempt failed')
      ];
      
      await transport.log(mockEntry);
      await transport.testFlushCurrentBatch();
      
      await transport.testProcessQueue();
      
      // Should have retried
      expect(transport.sendBatchCalls).toHaveLength(3); // 2 failures + 1 success
    });

    it('should give up after max retries', async () => {
      transport.sendBatchErrors = [
        new Error('Fail 1'),
        new Error('Fail 2'),
        new Error('Fail 3'),
        new Error('Fail 4')
      ];
      
      await transport.log(mockEntry);
      await transport.testFlushCurrentBatch();
      
      await transport.testProcessQueue();
      
      // Default max retries is 3
      expect(transport.sendBatchCalls).toHaveLength(3);
      expect(transport.getBatchQueue()).toHaveLength(0); // Batch removed
    });

    it('should handle batch preparation', async () => {
      await transport.log(mockEntry);
      const batch = transport.getCurrentBatch();
      
      const prepared = await transport.testPrepareBatch(batch);
      
      expect(Array.isArray(prepared)).toBe(true);
      expect(prepared).toHaveLength(1);
    });

    it('should compress batch when enabled', async () => {
      transport = new TestBatchingTransport({
        name: 'compress',
        compress: true
      });
      
      await transport.log(mockEntry);
      const batch = transport.getCurrentBatch();
      
      await transport.testPrepareBatch(batch);
      
      expect(transport.compressCalls).toBe(1);
    });

    it('should wait with exponential backoff on retry', async () => {
      const spy = jest.spyOn(transport, 'testWaitForRetry');
      
      transport.sendBatchErrors = [
        new Error('Fail'),
        new Error('Fail again')
      ];
      
      await transport.log(mockEntry);
      await transport.testFlushCurrentBatch();
      await transport.testProcessQueue();
      
      expect(spy).toHaveBeenCalledWith(1);
      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should update statistics on success', async () => {
      await transport.log(mockEntry);
      await transport.log({ ...mockEntry, id: '2' });
      await transport.flush();
      
      const stats = transport.getStats();
      expect(stats.succeeded).toBe(2);
      expect(stats.lastSuccess).toBeDefined();
    });

    it('should emit batch event on success', async () => {
      const batchSpy = jest.fn();
      transport.on('batch', batchSpy);
      
      await transport.log(mockEntry);
      await transport.flush();
      
      expect(batchSpy).toHaveBeenCalledWith([mockEntry], 1);
    });
  });

  describe('retry logic', () => {
    it('should determine retry eligibility', async () => {
      const batch = transport.testCreateBatch();
      batch.retryCount = 0;
      
      expect(await transport.testShouldRetry(new Error('Network error'), batch)).toBe(true);
      
      batch.retryCount = 3;
      expect(await transport.testShouldRetry(new Error('Network error'), batch)).toBe(false);
    });

    it('should calculate retry delay with exponential backoff', async () => {
      const startTime = Date.now();
      
      await transport.testWaitForRetry(1);
      const delay1 = Date.now() - startTime;
      
      // Should be around 1000ms (1s)
      expect(delay1).toBeGreaterThanOrEqual(900);
      expect(delay1).toBeLessThan(1200);
    });

    it('should cap retry delay at maximum', async () => {
      // High retry count
      const startTime = Date.now();
      await transport.testWaitForRetry(10);
      const delay = Date.now() - startTime;
      
      // Should be capped at 30s
      expect(delay).toBeLessThanOrEqual(30100);
    });

    it('should handle batch failure', async () => {
      const errorSpy = jest.fn();
      transport.on('error', errorSpy);
      
      const batch = transport.testCreateBatch();
      batch.entries = [mockEntry];
      
      await transport['handleBatchFailure'](batch, new Error('Permanent failure'));
      
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('flush', () => {
    it('should flush current batch', async () => {
      await transport.log(mockEntry);
      expect(transport.sendBatchCalls).toHaveLength(0);
      
      await transport.flush();
      
      expect(transport.sendBatchCalls).toHaveLength(1);
    });

    it('should wait for queue to empty', async () => {
      // Add multiple batches
      await transport.log(mockEntry);
      await transport.testFlushCurrentBatch();
      await transport.log({ ...mockEntry, id: '2' });
      await transport.testFlushCurrentBatch();
      
      expect(transport.getBatchQueue()).toHaveLength(2);
      
      await transport.flush();
      
      expect(transport.getBatchQueue()).toHaveLength(0);
      expect(transport.sendBatchCalls).toHaveLength(2);
    });

    it('should handle flush with slow sends', async () => {
      // Make sendBatch slow
      transport.sendBatch = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      await transport.log(mockEntry);
      await transport.flush();
      
      expect(transport.sendBatch).toHaveBeenCalled();
    });

    it('should prevent infinite loop on persistent queue', async () => {
      // Make batches always fail
      transport.sendBatch = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await transport.log(mockEntry);
      
      // This should eventually complete
      await transport.flush();
      
      // Queue should be cleared even with failures
      expect(transport.getBatchQueue()).toHaveLength(0);
    });
  });

  describe('close', () => {
    it('should flush before closing', async () => {
      const flushSpy = jest.spyOn(transport, 'flush');
      
      await transport.log(mockEntry);
      await transport.close();
      
      expect(flushSpy).toHaveBeenCalled();
      expect(transport.sendBatchCalls).toHaveLength(1);
    });

    it('should stop timer on close', async () => {
      await transport.log(mockEntry);
      expect(jest.getTimerCount()).toBe(1);
      
      await transport.close();
      
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should handle flush errors on close', async () => {
      transport.flush = jest.fn().mockRejectedValue(new Error('Flush failed'));
      const errorSpy = jest.fn();
      transport.on('error', errorSpy);
      
      await transport.close();
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('compression', () => {
    it('should compress batch data', async () => {
      const data = [{ test: 'data' }];
      const compressed = await transport.testCompressBatch(data);
      
      // Default implementation uses JSON.stringify
      expect(compressed).toBe(JSON.stringify(data));
    });

    it('should handle compression of various data types', async () => {
      const testCases = [
        'string data',
        123,
        true,
        null,
        { object: 'data' },
        ['array', 'data']
      ];
      
      for (const data of testCases) {
        const compressed = await transport.testCompressBatch(data);
        expect(typeof compressed).toBe('string');
      }
    });
  });

  describe('statistics', () => {
    it('should track queue statistics', async () => {
      await transport.log(mockEntry);
      await transport.log({ ...mockEntry, id: '2' });
      
      let stats = transport.getStats();
      expect(stats.queued).toBe(2);
      
      await transport.flush();
      
      stats = transport.getStats();
      expect(stats.queued).toBe(0);
      expect(stats.custom.totalBatchesSent).toBe(1);
    });

    it('should include custom batch statistics', () => {
      const stats = transport.getStats();
      
      expect(stats.custom).toHaveProperty('currentBatchSize');
      expect(stats.custom).toHaveProperty('queuedBatches');
      expect(stats.custom).toHaveProperty('totalBatchesSent');
    });
  });

  describe('edge cases', () => {
    it('should handle very large batches', async () => {
      transport = new TestBatchingTransport({
        name: 'large',
        maxBatchSize: 1000
      });
      
      // Add many entries
      for (let i = 0; i < 100; i++) {
        await transport.log({ ...mockEntry, id: `entry-${i}` });
      }
      
      expect(transport.getCurrentBatch()?.entries).toHaveLength(100);
    });

    it('should handle zero maxBatchTime', async () => {
      transport = new TestBatchingTransport({
        name: 'no-time',
        maxBatchTime: 0,
        maxBatchSize: 100
      });
      
      await transport.log(mockEntry);
      
      // Should not have timer
      expect(jest.getTimerCount()).toBe(0);
      
      // Should still batch by size
      expect(transport.getCurrentBatch()).toBeDefined();
    });

    it('should handle transport disabled during batching', async () => {
      await transport.log(mockEntry);
      
      transport.enabled = false;
      
      await transport.log({ ...mockEntry, id: '2' });
      
      // Second entry should not be added
      expect(transport.getCurrentBatch()?.entries).toHaveLength(1);
    });

    it('should handle filtering in batched entries', async () => {
      transport = new TestBatchingTransport({
        name: 'filtered',
        level: 'warn'
      });
      
      await transport.log({ ...mockEntry, level: 'debug' });
      await transport.log({ ...mockEntry, level: 'warn' });
      
      // Only warn should be in batch
      expect(transport.getCurrentBatch()?.entries).toHaveLength(1);
      expect(transport.getCurrentBatch()?.entries[0].level).toBe('warn');
    });
  });
});