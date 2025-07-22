// File: tests/unit/async/AsyncLogger.test.ts

import { AsyncLogger, AsyncLoggerOptions } from '../../../src/async/AsyncLogger';
import { AsyncBuffer } from '../../../src/async/AsyncBuffer';
import type { LogEntry, LogLevel } from '../../../src/types';

// Mock AsyncBuffer
jest.mock('../../../src/async/AsyncBuffer');

// Mock Worker
class MockWorker {
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: ErrorEvent) => void) | null = null;
  public postMessage = jest.fn();
  public terminate = jest.fn();
  public addEventListener = jest.fn((event: string, handler: Function) => {
    if (event === 'message') this.onmessage = handler as any;
    if (event === 'error') this.onerror = handler as any;
  });
  public removeEventListener = jest.fn();
}

// Replace global Worker
(global as any).Worker = MockWorker;

describe('AsyncLogger', () => {
  let asyncLogger: AsyncLogger;
  let mockCreateEntry: jest.Mock;
  let mockOnFlush: jest.Mock;
  let mockBuffer: jest.Mocked<AsyncBuffer>;

  const createMockEntry = (level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry => ({
    id: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    level,
    message,
    plainMessage: message,
    context: meta,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreateEntry = jest.fn(createMockEntry);
    mockOnFlush = jest.fn();
    
    // Setup mock buffer
    mockBuffer = {
      add: jest.fn().mockReturnValue(true),
      flush: jest.fn(),
      flushAndWait: jest.fn().mockResolvedValue(undefined),
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
      close: jest.fn().mockResolvedValue(undefined),
      isEmpty: jest.fn().mockReturnValue(true),
      isFull: jest.fn().mockReturnValue(false),
      getSize: jest.fn().mockReturnValue(0),
      resetMetrics: jest.fn(),
    } as any;
    
    (AsyncBuffer as jest.MockedClass<typeof AsyncBuffer>).mockImplementation(() => mockBuffer);
  });

  afterEach(async () => {
    if (asyncLogger) {
      await asyncLogger.close();
    }
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      asyncLogger = new AsyncLogger(
        { onFlush: mockOnFlush },
        mockCreateEntry
      );
      
      expect(AsyncBuffer).toHaveBeenCalledWith({
        size: 8192,
        flushInterval: 100,
        flushSize: 1000,
        onFlush: mockOnFlush,
        overflowStrategy: 'drop-oldest',
        enableMetrics: true,
      });
    });

    it('should create with custom options', () => {
      const options: AsyncLoggerOptions = {
        buffer: {
          size: 16384,
          flushInterval: 200,
          flushSize: 2000,
        },
        useWorkers: false,
        enableMetrics: false,
        onFlush: mockOnFlush,
      };
      
      asyncLogger = new AsyncLogger(options, mockCreateEntry);
      
      expect(AsyncBuffer).toHaveBeenCalledWith({
        size: 16384,
        flushInterval: 200,
        flushSize: 2000,
        onFlush: mockOnFlush,
        overflowStrategy: 'drop-oldest',
        enableMetrics: false,
      });
    });

    it('should initialize workers when enabled', () => {
      const options: AsyncLoggerOptions = {
        useWorkers: true,
        workerCount: 4,
        workerPath: './custom-worker.js',
        onFlush: mockOnFlush,
      };
      
      asyncLogger = new AsyncLogger(options, mockCreateEntry);
      
      // Should create 4 workers
      expect(MockWorker).toHaveBeenCalledTimes(4);
    });

    it('should handle worker initialization failure', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Make Worker constructor throw
      (global as any).Worker = jest.fn(() => {
        throw new Error('Worker not supported');
      });
      
      asyncLogger = new AsyncLogger(
        { useWorkers: true, onFlush: mockOnFlush },
        mockCreateEntry
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncLogger] Failed to initialize workers:',
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[AsyncLogger] Falling back to main thread processing'
      );
      
      // Should recreate buffer without worker handler
      expect(AsyncBuffer).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      
      // Restore MockWorker
      (global as any).Worker = MockWorker;
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger(
        { onFlush: mockOnFlush },
        mockCreateEntry
      );
    });

    it('should log info message', () => {
      asyncLogger.info('Info message', { key: 'value' });
      
      expect(mockCreateEntry).toHaveBeenCalledWith('info', 'Info message', { key: 'value' });
      expect(mockBuffer.add).toHaveBeenCalledWith(expect.objectContaining({
        level: 'info',
        message: 'Info message',
      }));
    });

    it('should log warn message', () => {
      asyncLogger.warn('Warning message');
      
      expect(mockCreateEntry).toHaveBeenCalledWith('warn', 'Warning message', undefined);
      expect(mockBuffer.add).toHaveBeenCalled();
    });

    it('should log error message', () => {
      asyncLogger.error('Error message', { error: new Error('test') });
      
      expect(mockCreateEntry).toHaveBeenCalledWith('error', 'Error message', { error: new Error('test') });
      expect(mockBuffer.add).toHaveBeenCalled();
    });

    it('should log debug message', () => {
      asyncLogger.debug('Debug message');
      
      expect(mockCreateEntry).toHaveBeenCalledWith('debug', 'Debug message', undefined);
      expect(mockBuffer.add).toHaveBeenCalled();
    });

    it('should log success message', () => {
      asyncLogger.success('Success message');
      
      expect(mockCreateEntry).toHaveBeenCalledWith('success', 'Success message', undefined);
      expect(mockBuffer.add).toHaveBeenCalled();
    });

    it('should log with custom level', () => {
      asyncLogger.log('Custom message', 'custom' as LogLevel, { data: 'test' });
      
      expect(mockCreateEntry).toHaveBeenCalledWith('custom', 'Custom message', { data: 'test' });
      expect(mockBuffer.add).toHaveBeenCalled();
    });

    it('should use default level when not specified', () => {
      asyncLogger.log('Default level message');
      
      expect(mockCreateEntry).toHaveBeenCalledWith('info', 'Default level message', undefined);
    });
  });

  describe('flush operations', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger(
        { onFlush: mockOnFlush },
        mockCreateEntry
      );
    });

    it('should flush buffer', () => {
      asyncLogger.flush();
      
      expect(mockBuffer.flush).toHaveBeenCalled();
    });

    it('should flush and wait', async () => {
      await asyncLogger.flushAndWait();
      
      expect(mockBuffer.flushAndWait).toHaveBeenCalled();
    });
  });

  describe('worker operations', () => {
    let mockWorkers: MockWorker[];

    beforeEach(() => {
      mockWorkers = [];
      
      // Track created workers
      (global as any).Worker = jest.fn(() => {
        const worker = new MockWorker();
        mockWorkers.push(worker);
        return worker;
      });
    });

    afterEach(() => {
      (global as any).Worker = MockWorker;
    });

    it('should send entries to least loaded worker', () => {
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 2,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      // Get the flush handler that was passed to AsyncBuffer
      const workerFlushHandler = (AsyncBuffer as jest.MockedClass<typeof AsyncBuffer>).mock.calls[0][0].onFlush;
      
      const entries = [createMockEntry('info', 'Test 1')];
      
      // Call the flush handler
      workerFlushHandler(entries);
      
      // Should send to first worker
      expect(mockWorkers[0].postMessage).toHaveBeenCalledWith({
        type: 'logs',
        entries,
      });
    });

    it('should handle worker messages', () => {
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 1,
          onFlush: mockOnFlush,
          enableMetrics: true,
        },
        mockCreateEntry
      );
      
      const worker = mockWorkers[0];
      
      // Simulate processed message
      worker.onmessage!({ data: { type: 'processed', metrics: {} } } as MessageEvent);
      
      // Worker should be marked as less busy
      const stats = asyncLogger.getStats();
      expect(stats.workers.totalProcessing).toBe(0);
    });

    it('should handle worker ready message', () => {
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 1,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      const worker = mockWorkers[0];
      
      // Simulate ready message
      worker.onmessage!({ data: { type: 'ready' } } as MessageEvent);
      
      const stats = asyncLogger.getStats();
      expect(stats.workers.active).toBe(1);
    });

    it('should handle worker errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 1,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      const worker = mockWorkers[0];
      
      // Simulate error message
      worker.onmessage!({ 
        data: { type: 'error', error: 'Worker processing failed' } 
      } as MessageEvent);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncLogger] Worker error:',
        'Worker processing failed'
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle worker failure and attempt restart', () => {
      jest.useFakeTimers();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 2,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      const worker = mockWorkers[0];
      
      // Simulate worker error
      const errorEvent = new ErrorEvent('error', { message: 'Worker crashed' });
      worker.onerror!(errorEvent);
      
      expect(consoleSpy).toHaveBeenCalledWith('[AsyncLogger] Worker error:', errorEvent);
      
      // Worker should be removed
      const statsBefore = asyncLogger.getStats();
      expect(statsBefore.workers.count).toBe(1);
      
      // Should attempt restart after timeout
      jest.advanceTimersByTime(1000);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[AsyncLogger] Attempting to restart worker');
      
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should fallback to direct processing when no workers available', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 0,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      // Get the flush handler
      const workerFlushHandler = (AsyncBuffer as jest.MockedClass<typeof AsyncBuffer>).mock.calls[0][0].onFlush;
      
      const entries = [createMockEntry('info', 'Test')];
      workerFlushHandler(entries);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncLogger] No workers available, falling back to direct processing'
      );
      expect(mockOnFlush).toHaveBeenCalledWith(entries);
      
      consoleSpy.mockRestore();
    });

    it('should handle worker send failure', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 1,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      // Make postMessage throw
      mockWorkers[0].postMessage.mockImplementation(() => {
        throw new Error('PostMessage failed');
      });
      
      const workerFlushHandler = (AsyncBuffer as jest.MockedClass<typeof AsyncBuffer>).mock.calls[0][0].onFlush;
      const entries = [createMockEntry('info', 'Test')];
      
      workerFlushHandler(entries);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncLogger] Failed to send to worker:',
        expect.any(Error)
      );
      
      // Should fallback to direct processing
      expect(mockOnFlush).toHaveBeenCalledWith(entries);
      
      consoleSpy.mockRestore();
    });
  });

  describe('close and cleanup', () => {
    it('should close buffer and terminate workers', async () => {
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 2,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      // Get workers
      const workers = (asyncLogger as any).workers.map((w: any) => w.worker);
      
      await asyncLogger.close();
      
      expect(mockBuffer.close).toHaveBeenCalled();
      
      // All workers should receive shutdown message and be terminated
      workers.forEach((worker: MockWorker) => {
        expect(worker.postMessage).toHaveBeenCalledWith({ type: 'shutdown' });
        expect(worker.terminate).toHaveBeenCalled();
      });
    });

    it('should handle close without workers', async () => {
      asyncLogger = new AsyncLogger(
        { onFlush: mockOnFlush },
        mockCreateEntry
      );
      
      await asyncLogger.close();
      
      expect(mockBuffer.close).toHaveBeenCalled();
    });
  });

  describe('statistics and metrics', () => {
    beforeEach(() => {
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 2,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
    });

    it('should return complete stats', () => {
      const stats = asyncLogger.getStats();
      
      expect(stats).toEqual({
        buffer: {
          size: 0,
          capacity: 8192,
          utilization: 0,
          metrics: expect.any(Object),
        },
        workers: {
          enabled: true,
          count: 2,
          active: 2,
          totalProcessing: 0,
        },
      });
    });

    it('should reset metrics', () => {
      asyncLogger.resetMetrics();
      
      expect(mockBuffer.resetMetrics).toHaveBeenCalled();
    });

    it('should calculate utilization percentage', () => {
      mockBuffer.getStats.mockReturnValue({
        size: 4096,
        capacity: 8192,
        utilization: 0.5,
      });
      
      expect(asyncLogger.getUtilization()).toBe(50);
    });

    it('should check if ready', () => {
      mockBuffer.isEmpty.mockReturnValue(false);
      
      expect(asyncLogger.isReady()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle async flush handler errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockOnFlush.mockRejectedValue(new Error('Async flush failed'));
      
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 1,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      // Get the flush handler
      const workerFlushHandler = (AsyncBuffer as jest.MockedClass<typeof AsyncBuffer>).mock.calls[0][0].onFlush;
      
      // Make worker unavailable
      (asyncLogger as any).workers = [];
      
      const entries = [createMockEntry('info', 'Test')];
      workerFlushHandler(entries);
      
      // Wait for promise to reject
      setImmediate(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[AsyncLogger] Flush handler error:',
          expect.any(Error)
        );
        consoleSpy.mockRestore();
      });
    });

    it('should handle unknown worker message types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      asyncLogger = new AsyncLogger(
        { 
          useWorkers: true,
          workerCount: 1,
          onFlush: mockOnFlush 
        },
        mockCreateEntry
      );
      
      const worker = (asyncLogger as any).workers[0].worker;
      
      // Send unknown message type
      worker.onmessage({ data: { type: 'unknown', data: 'test' } } as MessageEvent);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncLogger] Unknown worker message type:',
        'unknown'
      );
      
      consoleSpy.mockRestore();
    });
  });
});