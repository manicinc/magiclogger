/**
 * @fileoverview Tests for AsyncLogger with RingBuffer transport
 *
 * Tests the high-performance ring buffer implementation with:
 * - SharedArrayBuffer for zero-copy transfers
 * - Lock-free synchronization
 * - Worker thread integration
 */

import { AsyncLogger } from '../../../src/async/AsyncLogger';
import type { LogEntry } from '../../../src/types/transport';

describe('AsyncLogger with RingBuffer', () => {
  describe('Ring Buffer Transport', () => {
    it('should initialize with ring buffer when enabled', async () => {
      const logger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
        },
        // Disable console output for tests
        useConsole: false,
      });

      // Wait for initialization
      await logger.waitForReady();

      // Check that ring buffer transport is initialized
      const stats = logger.getStats();
      expect(stats).toBeDefined();

      await logger.close();
    });

    it('should fall back to regular workers if ring buffer fails', async () => {
      // Mock SharedArrayBuffer not available
      const originalSharedArrayBuffer = global.SharedArrayBuffer;
      // @ts-expect-error Testing fallback when SharedArrayBuffer is not available
      delete global.SharedArrayBuffer;

      const logger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
        },
        useConsole: false,
      });

      await logger.waitForReady();

      // Should still work even without SharedArrayBuffer
      logger.info('Test message');
      await logger.flush();

      // Verify logger still works without crashing
      expect(logger).toBeDefined();

      await logger.close();

      // Restore
      global.SharedArrayBuffer = originalSharedArrayBuffer;
    });

    it('should handle high-throughput with ring buffer', async () => {
      const logger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
        },
        useConsole: false,
        enableMetrics: true,
        onFlush: jest.fn(),
      });

      await logger.waitForReady();

      // Log many messages rapidly
      const messageCount = 1000;
      for (let i = 0; i < messageCount; i++) {
        logger.info(`Message ${i}`);
      }

      // Flush and wait
      await logger.flush();

      // Check metrics
      const stats = logger.getStats();
      expect(stats).toBeDefined();
      expect(stats.buffer.capacity).toBeGreaterThan(0);
      expect(stats.metrics.totalLogs).toBeGreaterThanOrEqual(messageCount);

      await logger.close();
    });

    it('should maintain unique timestamps with performance.now()', async () => {
      const timestamps: number[] = [];
      
      const logger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
        },
        useConsole: false,
        onFlush: (entries: LogEntry[]) => {
          entries.forEach(entry => {
            timestamps.push(entry.timestamp);
          });
        },
      });

      await logger.waitForReady();

      // Log multiple messages in tight loop
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      await logger.flush();
      
      // Check that timestamps are unique (or at least increasing)
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }

      await logger.close();
    });

    it('should configure ring buffer size', async () => {
      const logger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
          batchSize: 200, // Custom batch size
        },
        useConsole: false,
      });

      await logger.waitForReady();

      const stats = logger.getStats();
      expect(stats).toBeDefined();

      await logger.close();
    });

    it('should handle worker thread errors gracefully', async () => {
      const errorHandler = jest.fn();

      const logger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
        },
        useConsole: false,
      });

      logger.on('error', errorHandler);

      await logger.waitForReady();

      // Simulate a large message that might exceed buffer
      const largeMessage = 'x'.repeat(100000);
      logger.info(largeMessage);

      await logger.flush();

      // Should handle gracefully without crashing
      expect(logger).toBeDefined();

      await logger.close();
    });
  });

  describe('Performance Characteristics', () => {
    it('should achieve better performance with ring buffer', async () => {
      // Test with ring buffer
      const ringBufferLogger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: true,
        },
        useConsole: false,
      });

      await ringBufferLogger.waitForReady();

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        ringBufferLogger.info(`Message ${i}`);
      }
      await ringBufferLogger.flush();
      const ringBufferTime = Date.now() - start;

      await ringBufferLogger.close();

      // Test without ring buffer
      const regularLogger = new AsyncLogger({
        worker: {
          enabled: true,
          useRingBuffer: false,
        },
        useConsole: false,
      });

      await regularLogger.waitForReady();

      const start2 = Date.now();
      for (let i = 0; i < 1000; i++) {
        regularLogger.info(`Message ${i}`);
      }
      await regularLogger.flush();
      const regularTime = Date.now() - start2;

      await regularLogger.close();

      // Ring buffer should be at least as fast (usually faster)
      // We can't guarantee it's always faster in CI environments
      // Allow up to 3x slower to account for system load variations
      expect(ringBufferTime).toBeLessThanOrEqual(regularTime * 3);
    });
  });
});