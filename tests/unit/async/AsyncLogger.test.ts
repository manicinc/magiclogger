import { AsyncLogger, type AsyncLoggerOptions } from '../../../src/async/AsyncLogger';
import { AsyncBuffer } from '../../../src/async/AsyncBuffer';
import type { LogEntry, LogLevel } from '../../../src/types/transport';

// Mock the AsyncBuffer
jest.mock('../../../src/async/AsyncBuffer');

describe('AsyncLogger', () => {
  let asyncLogger: AsyncLogger;
  let mockOnFlush: jest.Mock;
  let mockCreateEntry: jest.Mock<LogEntry, [LogLevel, string, unknown?]>;
  let mockAsyncBuffer: jest.Mocked<AsyncBuffer>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOnFlush = jest.fn();
    mockCreateEntry = jest.fn<LogEntry, [LogLevel, string, unknown?]>(
      (level: LogLevel, message: string, meta?: unknown) => ({
        id: 'test-id',
        level,
        message,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        context: meta as Record<string, unknown> | undefined,
      })
    );
    // ensure LogEntry type import is used
    const _unusedLogEntryShape: Partial<LogEntry> = {};
    void _unusedLogEntryShape;

    // Mock AsyncBuffer instance
    mockAsyncBuffer = {
      add: jest.fn().mockReturnValue(true), // Performance optimized: returns boolean, not AddResult
      flush: jest.fn(),
      flushAndWait: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getStats: jest.fn().mockReturnValue({
        size: 0,
        capacity: 8192,
        utilization: 0,
        metrics: {
          totalAdded: 0,
          totalFlushed: 0,
          totalDropped: 0,
          flushCount: 0,
          lastFlushTime: 0,
          avgFlushSize: 0,
        },
      }),
      isEmpty: jest.fn().mockReturnValue(true),
      isFull: jest.fn().mockReturnValue(false),
      getSize: jest.fn().mockReturnValue(0),
      resetMetrics: jest.fn(),
      isBackpressured: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<AsyncBuffer>;

    (AsyncBuffer as jest.MockedClass<typeof AsyncBuffer>).mockImplementation(() => mockAsyncBuffer);
  });

  afterEach(async () => {
    if (asyncLogger) {
      await asyncLogger.close();
    }
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const options: AsyncLoggerOptions = {
        onFlush: mockOnFlush,
      };

      asyncLogger = new AsyncLogger(options, mockCreateEntry);

      expect(AsyncBuffer).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 8192,
          flushInterval: 100,
          flushSize: 1000,
          onFlush: expect.any(Function),
          overflowStrategy: 'drop-oldest',
          enableMetrics: true,
        })
      );
    });

    it('should initialize with custom buffer options', () => {
      const options: AsyncLoggerOptions = {
        buffer: {
          size: 16384,
          flushInterval: 200,
          flushSize: 2000,
        },
        enableMetrics: false,
        onFlush: mockOnFlush,
      };

      asyncLogger = new AsyncLogger(options, mockCreateEntry);

      expect(AsyncBuffer).toHaveBeenCalledWith({
        size: 16384,
        flushInterval: 200,
        flushSize: 2000,
        onFlush: expect.any(Function),
        overflowStrategy: 'drop-oldest',
        enableMetrics: false,
        onDrop: expect.any(Function),
        onHighWater: expect.any(Function),
        onLowWater: expect.any(Function),
      });
    });

    it('should initialize with operational utilities', () => {
      const options: AsyncLoggerOptions = {
        redactor: { preset: 'standard' },
        rateLimiter: { max: 100, window: 60000 },
        sampler: { rate: 0.5 },
        onFlush: mockOnFlush,
      };

      asyncLogger = new AsyncLogger(options, mockCreateEntry);

      // Verify AsyncBuffer is initialized
      expect(AsyncBuffer).toHaveBeenCalled();
    });
  });

  describe('logging methods with explicit backpressure', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);
    });

    it('should return success result when buffer accepts entry', () => {
      mockAsyncBuffer.add.mockReturnValue(true); // Fast path returns boolean

      const result = asyncLogger.info('Test message');

      expect(result.success).toBe(true);
      // Fast path doesn't include buffer stats when successful
      expect(result.bufferStats).toBeUndefined();
      expect(mockCreateEntry).toHaveBeenCalledWith('info', 'Test message', undefined);
    });

    it('should return failure result when buffer is full', () => {
      mockAsyncBuffer.add.mockReturnValue(false); // Fast path returns false on failure
      mockAsyncBuffer.getStats.mockReturnValue({
        size: 8192,
        capacity: 8192,
        utilization: 1.0,
      });

      const result = asyncLogger.info('Test message');

      expect(result.success).toBe(false);
      // Fast path provides buffer stats lazily when failed
      expect(result.bufferStats?.utilization).toBe(1.0);
    });

    it('should handle successful buffer add in fast path', () => {
      mockAsyncBuffer.add.mockReturnValue(true); // Fast path success

      const result = asyncLogger.warn('New message');

      expect(result.success).toBe(true);
      // Fast path doesn't provide extra metadata when successful
      expect(result.reason).toBeUndefined();
      expect(result.dropped).toBeUndefined();
    });

    it('should work with all log levels', () => {
      mockAsyncBuffer.add.mockReturnValue(true); // Fast path returns boolean

      const methods = ['info', 'warn', 'error', 'debug', 'success'] as const;

      methods.forEach(method => {
        const result = asyncLogger[method]('Test message', { extra: 'data' });
        expect(result.success).toBe(true);
        expect(mockCreateEntry).toHaveBeenCalledWith(method, 'Test message', { extra: 'data' });
      });
    });
  });

  describe('critical logging', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should succeed when buffer accepts entry on first try', async () => {
      mockAsyncBuffer.add.mockReturnValue(true); // Fast path success

      const promise = asyncLogger.logCritical('error', 'Critical error');
      jest.runAllTimers();

      await expect(promise).resolves.toBeUndefined();
      expect(mockAsyncBuffer.add).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      mockAsyncBuffer.add
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const promise = asyncLogger.logCritical('error', 'Critical error');
      jest.runAllTimers();

      await expect(promise).resolves.toBeUndefined();
      expect(mockAsyncBuffer.add).toHaveBeenCalledTimes(3);
    });

    it('should throw error if buffer is closing', async () => {
      mockAsyncBuffer.add.mockReturnValue(false);

      const promise = asyncLogger.logCritical('error', 'Critical error');
      jest.runAllTimers();

      await expect(promise).rejects.toThrow('Failed to log after 10 attempts');
    });

    it('should throw error after max attempts', async () => {
      mockAsyncBuffer.add.mockReturnValue(false);

      const promise = asyncLogger.logCritical('error', 'Critical error');
      jest.runAllTimers();

      await expect(promise).rejects.toThrow('Failed to log after 10 attempts');
      expect(mockAsyncBuffer.add).toHaveBeenCalledTimes(10);
    });
  });

  describe('backpressure monitoring', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);
    });

    it('should report backpressure status', () => {
      expect(asyncLogger.isBackpressured()).toBe(false);
    });

    it('should report drop statistics', () => {
      const stats = asyncLogger.getDropStats();
      expect(stats).toEqual({ total: 0, rate: 0 });
    });
  });

  describe('statistics and monitoring', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);
    });

    it('should start with buffer statistics', () => {
      const stats = asyncLogger.getStats();

      expect(stats.buffer).toBeDefined();
      expect(stats.buffer.capacity).toBe(8192);
      expect(stats.buffer.utilization).toBe(0);
    });

    it('should report utilization percentage', () => {
      mockAsyncBuffer.getStats.mockReturnValue({
        size: 4096,
        capacity: 8192,
        utilization: 0.5,
      });

      const utilization = asyncLogger.getUtilization();
      expect(utilization).toBe(50);
    });

    it('should report ready status based on buffer', () => {
      mockAsyncBuffer.isEmpty.mockReturnValue(false);
      expect(asyncLogger.isReady()).toBe(true);

      mockAsyncBuffer.isEmpty.mockReturnValue(true);
      expect(asyncLogger.isReady()).toBe(false);
    });
  });

  describe('resource management', () => {
    it('should flush manually', () => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);

      asyncLogger.flush();

      expect(mockAsyncBuffer.flush).toHaveBeenCalled();
    });

    it('should flush and wait', async () => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);

      await asyncLogger.flushAndWait();

      expect(mockAsyncBuffer.flushAndWait).toHaveBeenCalled();
    });

    it('should close gracefully', async () => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);

      await asyncLogger.close();

      expect(mockAsyncBuffer.close).toHaveBeenCalled();
    });

    it('should reset metrics', () => {
      asyncLogger = new AsyncLogger({ onFlush: mockOnFlush }, mockCreateEntry);

      asyncLogger.resetMetrics();

      expect(mockAsyncBuffer.resetMetrics).toHaveBeenCalled();
    });
  });

  describe('operational utilities integration', () => {
    it('should handle sampling rejection', () => {
      const options: AsyncLoggerOptions = {
        sampler: { rate: 0 }, // Sample nothing
        onFlush: mockOnFlush,
      };

      asyncLogger = new AsyncLogger(options, mockCreateEntry);

      const result = asyncLogger.info('Should be sampled out');

      // Should be rejected by sampler before reaching buffer
      expect(result.success).toBe(false);
      expect(mockAsyncBuffer.add).not.toHaveBeenCalled();
    });

    it('should handle rate limiting', () => {
      const options: AsyncLoggerOptions = {
        rateLimiter: { max: 0, window: 1000 }, // Allow nothing
        onFlush: mockOnFlush,
      };

      asyncLogger = new AsyncLogger(options, mockCreateEntry);

      const result = asyncLogger.info('Should be rate limited');

      // Should be rejected by rate limiter before reaching buffer
      expect(result.success).toBe(false);
      expect(mockAsyncBuffer.add).not.toHaveBeenCalled();
    });
  });
});
