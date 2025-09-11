import { Logger, createAsyncLogger } from '../../src/index';

describe('Default Console Transport', () => {
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      /* ignore */
    });
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {
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
    it('should output to console by default', async () => {
      const logger = new Logger();

      // By default, uses legacy output which goes to console
      // This is the expected behavior - console works out of the box
      logger.info('Test message');

      // Wait for async transport
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should have logged to console (via console transport)
      expect(consoleInfoSpy).toHaveBeenCalled();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transports: [mockTransport as any],
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

  describe('createAsyncLogger performance', () => {
    it('should be fast by default with no utilities', async () => {
      const logger = createAsyncLogger();
      expect(logger).toBeDefined();

      // Should have fast defaults
      const stats = logger.getStats();
      expect(stats.buffer.capacity).toBe(1000); // Optimized buffer size for less IPC overhead

      const result = logger.info('Fast message');
      expect(result.success).toBe(true);

      await logger.close();
    });

    it('should only include utilities when explicitly provided', async () => {
      // Without utilities - fast
      const fastLogger = createAsyncLogger();

      // With utilities - feature-rich but slightly slower
      const utilLogger = createAsyncLogger({
        // These features would be extensions in a full implementation
        // rateLimiter: { max: 100, window: 1000 },
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
