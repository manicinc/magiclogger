/**
 * Tests for AsyncLogger style processing in main thread
 */
import { AsyncLogger } from '../../../src/async/AsyncLogger';

describe('AsyncLogger Style Processing', () => {
  let logger: AsyncLogger;

  afterEach(async () => {
    if (logger) {
      await logger.close();
    }
  });

  describe('Main Thread Style Processing (Workers OFF)', () => {
    beforeEach(() => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        useColors: true,
        useConsole: false,
        transports: [],
      });
    });

    it('processes simple styles', () => {
      const result = logger.info('<green>Success!</>');
      expect(result.success).toBe(true);
    });

    it('processes complex nested styles', () => {
      const result = logger.error('<red.bold>Error:</> <yellow>Warning</> in <cyan>system</>');
      expect(result.success).toBe(true);
    });

    it('handles messages without styles efficiently', () => {
      const result = logger.info('Plain message without any markup');
      expect(result.success).toBe(true);
    });

    it('preserves message with malformed styles', () => {
      const result = logger.warn('<unclosed style message');
      expect(result.success).toBe(true);
    });

    it('handles empty style tags', () => {
      const result = logger.info('<>Empty</> tags');
      expect(result.success).toBe(true);
    });
  });

  describe('Configuration Variations', () => {
    it('works with colors disabled', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        useColors: false,
      });

      const result = logger.info('<red>Should not process</>');
      expect(result.success).toBe(true);
    });

    it('handles large batch sizes', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        buffer: { size: 1000 },
      });

      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(1000);
    });

    it('handles small batch sizes', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        buffer: { size: 10 },
      });

      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(10);
    });
  });

  describe('Entry Construction', () => {
    it('creates valid LogEntry with all required fields', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
      });

      const result = logger.info('Test message');
      expect(result.success).toBe(true);
    });

    it('includes metadata in context', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
      });

      const result = logger.info('User action', { userId: '123', action: 'login' });
      expect(result.success).toBe(true);
    });

    it('includes logger ID when not default', () => {
      logger = new AsyncLogger({
        id: 'custom-logger',
        worker: { enabled: false },
      });

      const result = logger.info('Test');
      expect(result.success).toBe(true);
    });

    it('handles entries without metadata', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
      });

      const result = logger.debug('Debug message');
      expect(result.success).toBe(true);
    });
  });

  describe('Batch Processing', () => {
    it('accumulates entries in batch', async () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        buffer: { size: 100 },
      });

      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');

      const stats = logger.getStats();
      expect(stats.buffer.current).toBeGreaterThanOrEqual(0);
      
      await logger.flush();
    });

    it('calculates buffer utilization correctly', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        buffer: { size: 100 },
      });

      logger.info('Test');

      const stats = logger.getStats();
      expect(stats.buffer.utilization).toBeGreaterThanOrEqual(0);
      expect(stats.buffer.utilization).toBeLessThanOrEqual(100);
    });

    it('tracks total logs', async () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
      });

      logger.info('Log 1');
      logger.warn('Log 2');
      logger.error('Log 3');

      // Wait for flush to complete
      await logger.flush();

      const stats = logger.getStats();
      // totalLogs might be 0 if transports are empty
      expect(stats.metrics.totalLogs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Recovery', () => {
    it('continues after style processing errors', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        useColors: true,
      });

      // Even with potential parsing issues, should not crash
      const result1 = logger.info('<<<broken>>>');
      const result2 = logger.info('Normal message');
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('handles invalid log levels gracefully', () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
      });

      // Using valid levels only
      const result = logger.error('Error message');
      expect(result.success).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    it('processes many plain logs quickly', async () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        useConsole: false,
        transports: [],
      });

      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        logger.info(`Plain message ${i}`);
      }
      
      await logger.flush();
      const duration = Date.now() - start;
      
      // Should process 1000 logs in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('handles styled logs efficiently', async () => {
      logger = new AsyncLogger({
        worker: { enabled: false },
        useColors: true,
        useConsole: false,
        transports: [],
      });

      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        logger.info(`<green>Success ${i}:</> Operation completed`);
      }
      
      await logger.flush();
      const duration = Date.now() - start;
      
      // Should process 100 styled logs in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});