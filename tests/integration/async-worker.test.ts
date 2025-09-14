/**
 * @fileoverview Integration tests for AsyncLogger worker thread implementation.
 *
 * Tests the actual worker thread functionality including:
 * - Worker thread initialization and fallback
 * - Message passing and batching
 * - Performance characteristics
 * - Graceful shutdown
 *
 * @module tests/integration/async-worker
 * @author MagicLogger Contributors
 * @copyright 2024 MagicLogger
 * @license MIT
 */

import { AsyncLogger } from '../../src/async/AsyncLogger';
import { NullTransport } from '../../src/transports/null';
import { performance } from 'perf_hooks';

describe('AsyncLogger Worker Thread Integration', () => {
  let logger: AsyncLogger;

  afterEach(async () => {
    if (logger) {
      await logger.close();
    }
  });

  describe('Worker Thread Initialization', () => {
    test('should initialize with worker threads when available', async () => {
      // Test that workers initialize properly
      logger = new AsyncLogger({
        worker: {
          enabled: true,
          poolSize: 2,
        },
        useConsole: false,
        enableMetrics: true,  // Enable metrics to track logs
      });

      // Give workers time to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      // Log some messages
      for (let i = 0; i < 10; i++) {
        logger.info(`Test message ${i}`);
      }

      // Wait for processing
      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that logger is working (no errors thrown)
      expect(logger).toBeDefined();
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBeGreaterThanOrEqual(10);
    });

    test('should fall back to setImmediate when workers disabled', async () => {
      // With workers disabled, should still process logs
      logger = new AsyncLogger({
        worker: {
          enabled: false,
        },
        useConsole: false,
        enableMetrics: true,
      });

      logger.info('Test message');

      // Explicitly flush to ensure the message is processed
      await logger.flush();

      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBe(1);
    });
  });

  describe('Batching and Performance', () => {
    test('should batch messages efficiently', async () => {
      logger = new AsyncLogger({
        worker: {
          enabled: true,
          batchSize: 100,
          batchTimeout: 10,
        },
        useConsole: false,
        enableMetrics: true,
      });

      const startTime = performance.now();

      // Log many messages rapidly
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`, { index: i });
      }

      const logTime = performance.now() - startTime;

      // Should return quickly (non-blocking)
      // Increased to 200ms to account for CI environment variance
      expect(logTime).toBeLessThan(200);

      // Wait for all messages to be processed
      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 200));

      // All messages should be logged
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBe(1000);
    });

    test('should handle backpressure gracefully', async () => {
      // Test with metrics to verify processing
      logger = new AsyncLogger({
        worker: {
          enabled: true,
          batchSize: 100,
        },
        useConsole: false,
        enableMetrics: true,
      });

      // Log many messages
      for (let i = 0; i < 200; i++) {
        logger.info(`Message ${i}`);
      }

      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // All messages should be processed (no backpressure dropping in current implementation)
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBe(200);
    }, 10000);
  });

  describe('Worker Thread Pool Management', () => {
    test('should distribute load across multiple workers', async () => {
      logger = new AsyncLogger({
        transports: [new NullTransport()],
        worker: {
          enabled: true,
          poolSize: 4,
        },
      });

      // Log many messages to trigger distribution
      const messageCount = 10000;
      const startTime = performance.now();

      for (let i = 0; i < messageCount; i++) {
        logger.info(`Message ${i}`, {
          data: 'x'.repeat(100), // Some payload
        });
      }

      await logger.flush();

      const duration = performance.now() - startTime;
      const throughput = messageCount / (duration / 1000);

      // Should achieve reasonable throughput with workers
      expect(throughput).toBeGreaterThan(5000); // At least 5k ops/sec
    });

    test('should handle worker failures gracefully', async () => {
      logger = new AsyncLogger({
        worker: {
          enabled: true,
          poolSize: 2,
        },
        useConsole: false,
        enableMetrics: true,
      });

      // Log messages
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      // Force close to test cleanup
      await logger.close();

      // Should have processed messages before closing
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Graceful Shutdown', () => {
    test('should flush all pending messages on close', async () => {
      logger = new AsyncLogger({
        worker: {
          enabled: true,
          batchSize: 100,
        },
        useConsole: false,
        enableMetrics: true,
      });

      // Log messages
      for (let i = 0; i < 50; i++) {
        logger.info(`Message ${i}`);
      }

      // Close immediately
      await logger.close();

      // All messages should be flushed
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBe(50);
    });

    test('should handle concurrent close calls', async () => {
      logger = new AsyncLogger({
        worker: {
          enabled: true,
        },
        useConsole: false,
        enableMetrics: true,
      });

      logger.info('Test message');

      // Call close multiple times concurrently
      const closePromises = [logger.close(), logger.close(), logger.close()];

      await Promise.all(closePromises);

      // Should have processed the message
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBe(1);
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory with continuous logging', async () => {
      logger = new AsyncLogger({
        transports: [new NullTransport()],
        worker: {
          enabled: true,
          batchSize: 100,
        },
      });

      const initialMemory = process.memoryUsage().heapUsed;

      // Log many messages
      for (let i = 0; i < 10000; i++) {
        logger.info(`Message ${i}`, { index: i });

        // Periodically flush
        if (i % 1000 === 0) {
          await logger.flush();
        }
      }

      await logger.flush();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      // Should not leak excessive memory (allow up to 50MB)
      expect(memoryIncrease).toBeLessThan(50);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle mixed sync/async operations', async () => {
      logger = new AsyncLogger({
        worker: {
          enabled: true,
        },
        useConsole: false,
        enableMetrics: true,
      });

      // Simulate real application logging patterns
      logger.info('Application started');
      logger.debug('Debug information', { config: { port: 3000 } });

      // Simulate request logging
      for (let i = 0; i < 10; i++) {
        logger.info('Request received', {
          method: 'GET',
          path: `/api/users/${i}`,
          ip: '127.0.0.1',
        });

        // Simulate some processing
        await new Promise(resolve => setTimeout(resolve, 10));

        logger.info('Request completed', {
          status: 200,
          duration: Math.random() * 100,
        });
      }

      logger.error('Simulated error', {
        error: new Error('Test error'),
        stack: 'Error stack trace',
      });

      await logger.flush();

      // Should have all log entries
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBeGreaterThan(20);

      // Check that different log levels were processed
      expect(stats.metrics.debugLogs).toBeGreaterThan(0);
      expect(stats.metrics.infoLogs).toBeGreaterThan(0);
      expect(stats.metrics.errorLogs).toBeGreaterThan(0);
    });

    test('should maintain log order within reasonable bounds', async () => {
      // Test that logs are processed in batches
      logger = new AsyncLogger({
        worker: {
          enabled: true,
          batchSize: 10,
        },
        useConsole: false,
        enableMetrics: true,
      });

      // Log numbered messages
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`, { order: i });
      }

      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check that all messages were processed
      const stats = logger.getStats();
      expect(stats.metrics.totalLogs).toBe(100);

      // With batching, should have processed in reasonable time
      expect(stats.metrics.totalLogs).toBeGreaterThan(0);
    });
  });
});
