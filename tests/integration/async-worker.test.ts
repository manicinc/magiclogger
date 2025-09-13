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
import type { LogEntry } from '../../src/types/transport';
import { performance } from 'perf_hooks';

/**
 * Custom transport for testing that tracks all logged entries.
 *
 * @class TestTransport
 * @since 1.0.0
 */
class TestTransport {
  public readonly name = 'test';
  public enabled = true;
  public entries: LogEntry[] = [];
  public flushCount = 0;
  public closeCount = 0;

  /**
   * Logs an entry to the test buffer.
   *
   * @param {LogEntry} entry - Log entry to store
   * @returns {void}
   */
  log(entry: LogEntry): void {
    this.entries.push(entry);
  }

  /**
   * Flushes the transport.
   *
   * @returns {Promise<void>} Promise that resolves when flushed
   */
  async flush(): Promise<void> {
    this.flushCount++;
  }

  /**
   * Closes the transport.
   *
   * @returns {Promise<void>} Promise that resolves when closed
   */
  async close(): Promise<void> {
    this.closeCount++;
  }

  /**
   * Determines if entry should be logged.
   *
   * @param {LogEntry} entry - Entry to check
   * @returns {boolean} Always true for testing
   */
  shouldLog(_entry: LogEntry): boolean {
    return true;
  }
}

describe('AsyncLogger Worker Thread Integration', () => {
  let logger: AsyncLogger;
  let transport: TestTransport;

  beforeEach(() => {
    transport = new TestTransport();
  });

  afterEach(async () => {
    if (logger) {
      await logger.close();
    }
  });

  describe('Worker Thread Initialization', () => {
    test('should initialize with worker threads when available', async () => {
      logger = new AsyncLogger({
        transports: [transport],
        worker: {
          enabled: true,
          poolSize: 2,
        },
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

      expect(transport.entries.length).toBeGreaterThan(0);
    });

    test('should fall back to setImmediate when workers disabled', async () => {
      logger = new AsyncLogger({
        transports: [transport],
        worker: {
          enabled: false,
        },
      });

      logger.info('Test message');

      // Explicitly flush to ensure the message is processed
      await logger.flush();

      expect(transport.entries.length).toBe(1);
    });
  });

  describe('Batching and Performance', () => {
    test('should batch messages efficiently', async () => {
      logger = new AsyncLogger({
        transports: [transport],
        worker: {
          enabled: true,
          batchSize: 100,
          batchTimeout: 10,
        },
      });

      const startTime = performance.now();

      // Log many messages rapidly
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`, { index: i });
      }

      const logTime = performance.now() - startTime;

      // Should return quickly (non-blocking)
      // Increased to 250ms to account for CI/Windows environment variance
      expect(logTime).toBeLessThan(250);

      // Wait for all messages to be processed
      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 200));

      // All messages should be logged
      expect(transport.entries.length).toBe(1000);
    });

    test('should handle backpressure gracefully', async () => {
      const slowTransport = {
        name: 'slow',
        enabled: true,
        entries: [] as LogEntry[],
        async log(entry: LogEntry): Promise<void> {
          // Simulate slow I/O
          await new Promise(resolve => setTimeout(resolve, 10));
          this.entries.push(entry);
        },
        async flush(): Promise<void> {
          /* No-op for test */
        },
        async close(): Promise<void> {
          /* No-op for test */
        },
        shouldLog(): boolean {
          return true;
        },
      };

      logger = new AsyncLogger({
        transports: [slowTransport],
        worker: {
          enabled: true,
          batchSize: 100,
        },
      });

      // Log many messages
      for (let i = 0; i < 200; i++) {
        logger.info(`Message ${i}`);
      }

      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Some messages may be dropped due to backpressure
      expect(slowTransport.entries.length).toBeGreaterThan(50);
      expect(slowTransport.entries.length).toBeLessThanOrEqual(200);
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
        transports: [transport],
        worker: {
          enabled: true,
          poolSize: 2,
        },
      });

      // Log messages
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      // Force close to test cleanup
      await logger.close();

      // Should have closed transport
      expect(transport.closeCount).toBe(1);
    });
  });

  describe('Graceful Shutdown', () => {
    test('should flush all pending messages on close', async () => {
      logger = new AsyncLogger({
        transports: [transport],
        worker: {
          enabled: true,
          batchSize: 100,
        },
      });

      // Log messages
      for (let i = 0; i < 50; i++) {
        logger.info(`Message ${i}`);
      }

      // Close immediately
      await logger.close();

      // All messages should be flushed
      expect(transport.entries.length).toBe(50);
      expect(transport.flushCount).toBeGreaterThan(0);
      expect(transport.closeCount).toBe(1);
    });

    test('should handle concurrent close calls', async () => {
      logger = new AsyncLogger({
        transports: [transport],
        worker: {
          enabled: true,
        },
      });

      logger.info('Test message');

      // Call close multiple times concurrently
      const closePromises = [logger.close(), logger.close(), logger.close()];

      await Promise.all(closePromises);

      // Should only close once
      expect(transport.closeCount).toBe(1);
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
        transports: [transport],
        worker: {
          enabled: true,
        },
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
      expect(transport.entries.length).toBeGreaterThan(20);

      // Check log levels are preserved
      const levels = transport.entries.map(e => e.level);
      expect(levels).toContain('info');
      expect(levels).toContain('debug');
      expect(levels).toContain('error');
    });

    test('should maintain log order within reasonable bounds', async () => {
      logger = new AsyncLogger({
        transports: [transport],
        worker: {
          enabled: true,
          batchSize: 10,
        },
      });

      // Log numbered messages
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`, { order: i });
      }

      await logger.flush();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check that messages are mostly in order
      // Allow some reordering due to async nature
      let outOfOrder = 0;
      for (let i = 1; i < transport.entries.length; i++) {
        const prevOrder = (transport.entries[i - 1].context as any)?.order ?? 0;
        const currOrder = (transport.entries[i].context as any)?.order ?? 0;
        if (currOrder < prevOrder) {
          outOfOrder++;
        }
      }

      // Should maintain reasonable ordering (allow up to 10% out of order)
      expect(outOfOrder).toBeLessThan(transport.entries.length * 0.1);
    });
  });
});
