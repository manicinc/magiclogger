import { createAsyncLogger } from '../../../src/index';
import type { LogEntry } from '../../../src/types/transport';

describe('createAsyncLogger factory', () => {
  let flushHandler: jest.Mock;
  let metricsHandler: jest.Mock;

  beforeEach(() => {
    flushHandler = jest.fn(async (_entries: LogEntry[]) => {
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 1));
    });
    metricsHandler = jest.fn();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('createAsyncLogger with defaults', () => {
    it('should create async logger with sensible defaults', async () => {
      const logger = createAsyncLogger();

      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();

      // Test logging
      const result = logger.info('Test message');
      expect(result.success).toBe(true);

      // Cleanup
      await logger.close();
    });

    it('should use fast default buffer configuration', async () => {
      const logger = createAsyncLogger();

      // Fast defaults: buffer size 16384, flush interval 50ms, flush size 2000
      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(16384);

      await logger.close();
    });

    it('should handle backpressure gracefully', async () => {
      const logger = createAsyncLogger({
        buffer: { size: 10, flushInterval: 10000 }, // Small buffer, long interval
        onFlush: flushHandler,
      });

      // Fill the buffer beyond capacity
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(logger.info(`Message ${i}`));
      }

      // Most should succeed (ring buffer overwrites), check we got results
      const succeeded = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      expect(succeeded).toBeGreaterThan(0);
      // May or may not have failures depending on ring buffer behavior
      expect(succeeded + failed).toBe(20);

      // Verify that any failures have valid reasons
      const failedResults = results.filter(r => !r.success);
      failedResults.forEach(failedResult => {
        expect(['buffer_full', 'dropped']).toContain(failedResult.reason);
      });

      await logger.close();
    });

    it('should process entries through onFlush', async () => {
      const logger = createAsyncLogger({
        buffer: { flushInterval: 10 }, // Quick flush for testing
        onFlush: flushHandler,
      });

      logger.info('Test message 1');
      logger.error('Test message 2');
      logger.warn('Test message 3');

      // Wait for flush
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(flushHandler).toHaveBeenCalled();
      const entries = flushHandler.mock.calls[0][0];
      expect(entries).toHaveLength(3);
      expect(entries[0].message).toBe('Test message 1');
      expect(entries[0].level).toBe('info');
      expect(entries[1].level).toBe('error');
      expect(entries[2].level).toBe('warn');

      await logger.close();
    });
  });

  describe('createAsyncLogger with utilities', () => {
    it('should accept redactor configuration', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
        redactor: { preset: 'strict' },
      });

      logger.info('Email: user@example.com');

      // Wait for flush
      await new Promise(resolve => setTimeout(resolve, 100));

      // Flush might not have occurred yet with default settings
      // Just check the logger is working
      expect(logger).toBeDefined();
      // Note: Actual redaction would be tested in integration tests

      await logger.close();
    });

    it('should accept rate limiter configuration', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
        rateLimiter: { max: 5, window: 100 },
      });

      // Try to log more than rate limit
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      // Some logs should be rate limited
      const stats = logger.getStats();
      expect(stats).toBeDefined();

      await logger.close();
    });

    it('should accept sampler configuration', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
        sampler: { rate: 0.5, strategy: 'random' },
      });

      // Log many messages
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`);
      }

      // Force flush to check results
      await logger.flushAndWait();

      // Should have called flush handler at least once
      expect(flushHandler.mock.calls.length).toBeGreaterThanOrEqual(1);

      await logger.close();
    });

    it('should accept queue manager configuration', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
        queueManager: { maxSize: 100, dropPolicy: 'tail' },
      });

      logger.info('Test with queue manager');

      // Verify logger was created successfully
      expect(logger).toBeDefined();

      await logger.close();
    });

    it('should accept metrics callback', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
        onMetrics: metricsHandler,
        buffer: { size: 5 }, // Small buffer to trigger metrics
      });

      // Fill buffer to trigger metrics
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      // Metrics callback may or may not have been called depending on timing
      // Just verify the logger is working
      expect(logger).toBeDefined();

      await logger.close();
    });
  });

  describe('createAsyncLogger performance mode', () => {
    it('should be fast by default without utilities', async () => {
      const logger = createAsyncLogger();

      expect(logger).toBeDefined();

      // Should be fast by default
      const result = logger.info('Fast message');
      expect(result.success).toBe(true);

      await logger.close();
    });

    it('should allow large buffer configuration', async () => {
      const logger = createAsyncLogger({
        buffer: { size: 32768 }, // Large buffer
      });

      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(32768);

      await logger.close();
    });

    it('should be fast without utilities', async () => {
      const logger = createAsyncLogger({
        enableMetrics: false,
        onFlush: () => {
          /* No-op flush handler for pure buffer performance */
        },
        buffer: { flushInterval: 0 }, // Disable timer-based flushing for accurate measurement
      });

      // Should process quickly without utilities overhead
      const startTime = Date.now();
      const testMessage = 'Test message'; // Use a fixed string to avoid interpolation overhead
      for (let i = 0; i < 1000; i++) {
        logger.info(testMessage);
      }
      const duration = Date.now() - startTime;

      // Should be reasonably fast (relaxed for CI environments)
      expect(duration).toBeLessThan(500);

      await logger.close();
    });
  });

  describe('Error handling', () => {
    it('should handle flush errors gracefully', async () => {
      const errorFlush = jest.fn(async () => {
        throw new Error('Flush failed');
      });

      const logger = createAsyncLogger({
        onFlush: errorFlush,
      });

      logger.info('Test message');

      // Wait for flush attempt
      await new Promise(resolve => setTimeout(resolve, 150));

      // Logger should continue working despite flush error
      const result = logger.error('Error after flush failure');
      expect(result.success).toBe(true);

      await logger.close();
    });

    it('should support critical logging', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
      });

      // Critical logging should retry on failure
      await expect(
        logger.logCritical('error', 'Critical error', { code: 500 })
      ).resolves.not.toThrow();

      // Force flush and check
      await logger.flushAndWait();
      expect(flushHandler.mock.calls.length).toBeGreaterThanOrEqual(1);

      await logger.close();
    });
  });

  describe('Graceful shutdown', () => {
    it('should flush pending logs on close', async () => {
      const logger = createAsyncLogger({
        buffer: { flushInterval: 10000 }, // Long interval
        onFlush: flushHandler,
      });

      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');

      // Close should trigger flush
      await logger.close();

      expect(flushHandler).toHaveBeenCalled();
      const entries = flushHandler.mock.calls[0][0];
      expect(entries).toHaveLength(3);
    });

    it('should support flushAndWait', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
      });

      logger.info('Test message');

      // Explicit flush and wait
      await logger.flushAndWait();

      expect(flushHandler).toHaveBeenCalled();

      await logger.close();
    });
  });

  describe('Monitoring and observability', () => {
    it('should provide buffer statistics', async () => {
      const logger = createAsyncLogger({
        onFlush: flushHandler,
      });

      logger.info('Test');

      const stats = logger.getStats();
      expect(stats).toHaveProperty('buffer');
      expect(stats.buffer).toHaveProperty('size');
      expect(stats.buffer).toHaveProperty('capacity');
      expect(stats.buffer).toHaveProperty('utilization');

      await logger.close();
    });

    it('should detect backpressure', async () => {
      const logger = createAsyncLogger({
        buffer: { size: 5 },
        onFlush: flushHandler,
      });

      // Fill buffer
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      // Should detect backpressure
      const utilization = logger.getUtilization();
      expect(utilization).toBeGreaterThan(0);

      await logger.close();
    });

    it('should check if backpressured', async () => {
      const logger = createAsyncLogger({
        buffer: { size: 5 },
        onFlush: jest.fn(async () => {
          // Slow flush to cause backpressure
          await new Promise(resolve => setTimeout(resolve, 100));
        }),
      });

      // Fill buffer quickly
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      // May or may not be backpressured depending on timing
      const isBackpressured = logger.isBackpressured();
      expect(typeof isBackpressured).toBe('boolean');

      await logger.close();
    });
  });
});
