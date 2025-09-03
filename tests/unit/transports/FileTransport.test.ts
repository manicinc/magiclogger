import { FileTransport } from '../../../src/transports/FileTransport';
import { Worker } from 'worker_threads';
import type { LogEntry } from '../../../src/types/transport';

// Mock worker_threads
jest.mock('worker_threads', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    postMessage: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    terminate: jest.fn(),
  })),
}));

describe('FileTransport', () => {
  let mockWorker: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorker = {
      postMessage: jest.fn(),
      on: jest.fn(),
      off: jest.fn(), 
      terminate: jest.fn(),
    };
    (Worker as jest.Mock).mockImplementation(() => mockWorker);
  });

  describe('Constructor', () => {
    it('should create transport with required filepath', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });
      expect(transport.name).toBe('file-worker');
      expect(transport.enabled).toBe(true);
    });

    it('should accept custom name', () => {
      const transport = new FileTransport({
        name: 'custom-file',
        filepath: '/tmp/test.log'
      });
      expect(transport.name).toBe('custom-file');
    });

    it('should respect enabled option', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        enabled: false
      });
      expect(transport.enabled).toBe(false);
    });

    it('should accept buffer configuration', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        bufferSize: 5000,
        flushInterval: 200
      });
      expect(transport).toBeDefined();
    });

    it('should accept format option', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        format: 'json'
      });
      expect(transport).toBeDefined();
    });

    it('should accept rotation options', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        maxFileSize: 1024 * 1024 * 10, // 10MB
        compress: true
      });
      expect(transport).toBeDefined();
    });
  });

  describe('Worker initialization', () => {
    it('should lazily initialize worker on first log', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });
      
      expect(Worker).not.toHaveBeenCalled();

      const entry: LogEntry = {
        id: '123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger'
      };

      await transport.log(entry);
      
      expect(Worker).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'init',
        config: expect.objectContaining({
          filepath: '/tmp/test.log'
        })
      });
    });

    it('should queue entries while worker is initializing', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Set up message handler before logging
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'First',
          loggerId: 'test'
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'Second',
          loggerId: 'test'
        }
      ];

      // Log entries before worker is ready
      await transport.log(entries[0]);
      await transport.log(entries[1]);

      // Simulate worker ready
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      // Wait a tick for queued entries to be sent
      await new Promise(resolve => setImmediate(resolve));

      // Verify queued entries were sent
      const logCalls = mockWorker.postMessage.mock.calls.filter(
        call => call[0].type === 'log'
      );
      expect(logCalls).toHaveLength(2);
    });
  });

  describe('Logging operations', () => {
    it('should send log entries to worker', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Set up message handler
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      const entry: LogEntry = {
        id: '123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger'
      };
      
      await transport.log(entry);
      
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      // Log another entry after ready
      await transport.log(entry);

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'log',
        entry
      });
    });

    it('should handle different log levels', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug', 'success'];
      
      for (const level of levels) {
        const entry: LogEntry = {
          id: `test-${level}`,
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level,
          message: `Test ${level} message`,
          loggerId: 'test-logger'
        };

        await transport.log(entry);
        
        expect(mockWorker.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            entry: expect.objectContaining({ level })
          })
        );
      }
    });

    it('should handle entries with metadata', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      const entry: LogEntry = {
        id: '124',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Message with context',
        loggerId: 'test-logger',
        context: {
          user: 'john',
          action: 'login',
          ip: '192.168.1.1'
        },
        tags: ['auth', 'api']
      };

      await transport.log(entry);
      
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: expect.objectContaining({
            context: entry.context,
            tags: entry.tags
          })
        })
      );
    });

    it('should not log when transport is disabled', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        enabled: false
      });

      const entry: LogEntry = {
        id: '125',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Should not log',
        loggerId: 'test-logger'
      };

      await transport.log(entry);
      
      expect(Worker).not.toHaveBeenCalled();
      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('Flush operation', () => {
    it('should flush buffered entries', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Initialize worker and set up message handler immediately
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate worker ready
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      // Start flush and immediately respond
      const flushPromise = transport.flush();
      
      // Simulate flushed response
      if (messageHandler) {
        messageHandler({ type: 'flushed' });
      }
      
      await flushPromise;

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'flush'
      });
    });

    it('should handle flush timeout', async () => {
      jest.useFakeTimers();
      
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Set up message handler
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      // Initialize worker
      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate ready
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      // Don't send flushed message, let it timeout
      const flushPromise = transport.flush();
      
      // Fast-forward timers
      jest.advanceTimersByTime(11000);
      
      await expect(flushPromise).resolves.toBeUndefined();
      
      jest.useRealTimers();
    });
  });

  describe('Close operation', () => {
    it('should close worker and clean up', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Set up message handler
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      // Initialize worker
      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate ready
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      // Start close and immediately respond
      const closePromise = transport.close();
      
      // Simulate closed response
      if (messageHandler) {
        messageHandler({ type: 'closed', stats: {} });
      }
      
      await closePromise;

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'close'
      });
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should terminate worker after close', async () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Set up message handler
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      // Initialize worker
      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate ready
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }
      
      const closePromise = transport.close();
      
      if (messageHandler) {
        messageHandler({ type: 'closed', stats: {} });
      }

      await closePromise;

      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should force terminate after timeout', async () => {
      jest.useFakeTimers();
      
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      // Set up message handler
      let messageHandler: any;
      mockWorker.on.mockImplementation((event: string, handler: any) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      // Initialize worker
      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate ready
      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      const closePromise = transport.close();
      
      // Fast-forward past timeout
      jest.advanceTimersByTime(31000);
      
      await closePromise;

      expect(mockWorker.terminate).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Worker error handling', () => {
    it('should handle worker errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate worker error
      const errorHandler = mockWorker.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      
      if (errorHandler) {
        errorHandler(new Error('Worker error'));
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker thread error'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle worker exit with error code', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate worker exit with error
      const exitHandler = mockWorker.on.mock.calls.find(
        call => call[0] === 'exit'
      )?.[1];
      
      if (exitHandler) {
        exitHandler(1);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker stopped with exit code 1')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle worker error messages', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const transport = new FileTransport({
        filepath: '/tmp/test.log'
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test'
      });

      // Simulate error message from worker
      const messageHandler = mockWorker.on.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      
      if (messageHandler) {
        messageHandler({ 
          type: 'error', 
          error: 'Failed to write to file',
          stats: { failed: 1 }
        });
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker error'),
        'Failed to write to file'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Configuration options', () => {
    it('should configure JSON format', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        format: 'json'
      });
      expect(transport).toBeDefined();
    });

    it('should configure plain format', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        format: 'plain'
      });
      expect(transport).toBeDefined();
    });

    it('should configure buffer size', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        bufferSize: 20000
      });
      expect(transport).toBeDefined();
    });

    it('should configure flush interval', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        flushInterval: 500
      });
      expect(transport).toBeDefined();
    });

    it('should configure file rotation', () => {
      const transport = new FileTransport({
        filepath: '/tmp/test.log',
        maxFileSize: 1024 * 1024 * 5, // 5MB
        compress: true
      });
      expect(transport).toBeDefined();
    });
  });
});