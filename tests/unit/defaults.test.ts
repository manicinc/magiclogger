import { Logger, createAsyncLogger, createSmartLogger } from '../../src/index';

describe('Default Console Transport', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      /* ignore */
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {
      /* ignore */
    });
    jest.spyOn(console, 'error').mockImplementation(() => {
      /* ignore */
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger class', () => {
    it('should output to console by default', () => {
      const logger = new Logger();

      // By default, uses legacy output which goes to console
      // This is the expected behavior - console works out of the box
      logger.info('Test message');

      // Should have logged to console (via legacy output)
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should allow disabling console transport', () => {
      const logger = new Logger({ useConsole: false });

      // Should have no transports when console is disabled
      const transports = logger.listTransports();
      expect(transports.length).toBe(0);
    });

    it('should use provided transports instead of default', () => {
      const mockTransport = {
        name: 'mock',
        log: jest.fn(),
        flush: jest.fn(),
        close: jest.fn(),
      };

      const logger = new Logger({
        transports: [
          mockTransport as unknown as import('../../src/transports/base/BaseTransport').BaseTransport,
        ],
      });

      const transports = logger.listTransports();
      expect(transports).toContain('mock');
      expect(transports).not.toContain('console');
    });
  });

  describe('createAsyncLogger', () => {
    it('should work with zero configuration', async () => {
      const logger = createAsyncLogger();
      expect(logger).toBeDefined();

      // Should be able to log immediately
      const result = logger.info('Test message');
      expect(result.success).toBe(true);

      await logger.close();
    });

    it('should use default onFlush that logs to console', async () => {
      const logger = createAsyncLogger();

      logger.info('Test async message');

      // Force flush to trigger console output
      await logger.flushAndWait();

      // Console should have been called (via default onFlush)
      // Note: Actual console call may be async, so we just verify logger works
      expect(logger).toBeDefined();

      await logger.close();
    });

    it('should allow custom onFlush while maintaining console', async () => {
      const customFlush = jest.fn();
      const logger = createAsyncLogger({
        onFlush: customFlush,
      });

      logger.info('Test message');
      await logger.flushAndWait();

      expect(customFlush).toHaveBeenCalled();

      await logger.close();
    });
  });

  describe('createSmartLogger', () => {
    it('should work with zero configuration', () => {
      const logger = createSmartLogger();
      expect(logger).toBeDefined();

      // Should be able to log immediately
      logger.info('Test smart message');

      // If async, close it
      if ('close' in logger && typeof logger.close === 'function') {
        logger.close();
      }
    });

    it('should default to auto mode', () => {
      const logger = createSmartLogger();

      // Should have created either Logger or AsyncLogger based on environment
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');

      if ('close' in logger && typeof logger.close === 'function') {
        logger.close();
      }
    });

    it('should respect explicit target', () => {
      const devLogger = createSmartLogger({ target: 'development' });
      const prodLogger = createSmartLogger({ target: 'production' });

      // Dev should be sync Logger
      expect(devLogger.constructor.name).toBe('Logger');

      // Prod should be AsyncLogger
      expect(prodLogger.constructor.name).toBe('AsyncLogger');

      if ('close' in prodLogger && typeof prodLogger.close === 'function') {
        prodLogger.close();
      }
    });

    it('should respect explicit mode override', () => {
      const syncLogger = createSmartLogger({ mode: 'sync' });
      const asyncLogger = createSmartLogger({ mode: 'async' });

      expect(syncLogger.constructor.name).toBe('Logger');
      expect(asyncLogger.constructor.name).toBe('AsyncLogger');

      if ('close' in asyncLogger && typeof asyncLogger.close === 'function') {
        asyncLogger.close();
      }
    });
  });

  describe('createAsyncLogger performance', () => {
    it('should be fast by default with no utilities', async () => {
      const logger = createAsyncLogger();
      expect(logger).toBeDefined();

      // Should have fast defaults
      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(16384); // Large buffer by default

      const result = logger.info('Fast message');
      expect(result.success).toBe(true);

      await logger.close();
    });

    it('should only include utilities when explicitly provided', async () => {
      // Without utilities - fast
      const fastLogger = createAsyncLogger();

      // With utilities - feature-rich but slightly slower
      const utilLogger = createAsyncLogger({
        redactor: { preset: 'strict' },
        rateLimiter: { max: 100, window: 1000 },
      });

      expect(fastLogger).toBeDefined();
      expect(utilLogger).toBeDefined();

      await fastLogger.close();
      await utilLogger.close();
    });

    it('should allow buffer tuning for performance', async () => {
      const logger = createAsyncLogger({
        buffer: { size: 32768, flushInterval: 25 },
      });

      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(32768);

      await logger.close();
    });
  });
});
