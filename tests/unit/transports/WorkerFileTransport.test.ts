import { WorkerFileTransport } from '../../../src/transports/WorkerFileTransport';
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

describe('WorkerFileTransport', () => {
  let mockWorker: any;
  let eventHandlers: Record<string, (...args: any[]) => void> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};

    mockWorker = {
      postMessage: jest.fn().mockImplementation((message: any) => {
        // Simulate worker responses
        setImmediate(() => {
          if (eventHandlers.message) {
            switch (message.type) {
              case 'init':
                eventHandlers.message({ type: 'ready' });
                break;
              case 'flush':
                eventHandlers.message({ type: 'flushed' });
                break;
              case 'close':
                eventHandlers.message({ type: 'closed' });
                break;
            }
          }
        });
      }),
      on: jest.fn().mockImplementation((event: string, handler: (...args: any[]) => void) => {
        eventHandlers[event] = handler;
        return mockWorker; // Return this for chaining
      }),
      off: jest.fn(),
      terminate: jest.fn(),
      // Add a method to disable auto-responses
      _disableAutoRespond: false,
    };
    (Worker as unknown as jest.Mock).mockImplementation(() => mockWorker);
  });

  describe('Constructor', () => {
    it('should create transport with required filepath', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });
      expect(transport.name).toBe('file-worker');
      expect(transport.enabled).toBe(true);
    });

    it('should accept custom name', () => {
      const transport = new WorkerFileTransport({
        name: 'custom-file',
        filepath: '/tmp/test.log',
      });
      expect(transport.name).toBe('custom-file');
    });

    it('should respect enabled option', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        enabled: false,
      });
      expect(transport.enabled).toBe(false);
    });

    it('should accept buffer configuration', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        bufferSize: 5000,
        flushInterval: 200,
      });
      expect(transport).toBeDefined();
    });

    it('should accept format option', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        format: 'json',
      });
      expect(transport).toBeDefined();
    });

    it('should accept rotation options', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        maxFileSize: 1024 * 1024 * 10, // 10MB
        compress: true,
      });
      expect(transport).toBeDefined();
    });
  });

  describe('Worker initialization', () => {
    it('should lazily initialize worker on first log', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      expect(Worker).not.toHaveBeenCalled();

      const entry: LogEntry = {
        id: '123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
      };

      await transport.log(entry);

      expect(Worker).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'init',
        config: expect.objectContaining({
          filepath: '/tmp/test.log',
        }),
      });
    });

    it('should queue entries while worker is initializing', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
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
          loggerId: 'test',
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'Second',
          loggerId: 'test',
        },
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
        (call: any) => call[0].type === 'log'
      );
      expect(logCalls).toHaveLength(2);
    });
  });

  describe('Logging operations', () => {
    it('should send log entries to worker', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
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
        loggerId: 'test-logger',
      };

      await transport.log(entry);

      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      // Log another entry after ready
      await transport.log(entry);

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'log',
        entry,
      });
    });

    it('should handle different log levels', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });
      // Override the level to allow debug
      (transport as any).level = 'debug';

      const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug', 'success'];
      const entries: LogEntry[] = levels.map((level, _index) => ({
        id: `test-${level}`,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level,
        message: `Test ${level} message`,
        loggerId: 'test-logger',
      }));

      // Log all entries
      for (const entry of entries) {
        await transport.log(entry);
      }

      // Wait for all ready signals to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that we got log calls for each level
      const logCalls = mockWorker.postMessage.mock.calls.filter(
        (call: any) => call[0].type === 'log'
      );
      expect(logCalls.length).toBe(levels.length);

      // Check that each level was logged
      for (const level of levels) {
        const levelFound = logCalls.some((call: any) => call[0].entry?.level === level);
        expect(levelFound).toBe(true);
      }
    });

    it('should handle entries with metadata', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
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
          ip: '192.168.1.1',
        },
        tags: ['auth', 'api'],
      };

      await transport.log(entry);

      // Wait for the ready signal to be processed
      await new Promise(resolve => setImmediate(resolve));

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: expect.objectContaining({
            context: entry.context,
            tags: entry.tags,
          }),
        })
      );
    });

    it('should not log when transport is disabled', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        enabled: false,
      });

      const entry: LogEntry = {
        id: '125',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Should not log',
        loggerId: 'test-logger',
      };

      await transport.log(entry);

      expect(Worker).not.toHaveBeenCalled();
      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('Flush operation', () => {
    it('should flush buffered entries', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
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
        loggerId: 'test',
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
        type: 'flush',
      });
    });

    it('should handle flush timeout', async () => {
      jest.useFakeTimers();

      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
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
        loggerId: 'test',
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
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      // Initialize worker by logging something
      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      // Close should work with auto-responses
      await transport.close();

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'close',
      });
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should terminate worker after close', async () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      // Initialize worker by logging something
      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      await transport.close();

      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it.skip('should force terminate after timeout', async () => {
      jest.useFakeTimers();

      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      // Force the transport to have a worker by calling protected method
      (transport as any).worker = mockWorker;

      // Mock postMessage to never respond to close
      mockWorker.postMessage.mockImplementation(() => {
        /* No-op for timeout test */
      });
      mockWorker.on.mockImplementation(() => {
        /* No-op for timeout test */
      });

      // Start close
      const closePromise = transport.close();

      // Fast-forward past timeout (5 seconds as per doClose implementation)
      jest.advanceTimersByTime(6000);

      await closePromise;

      expect(mockWorker.terminate).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('Worker error handling', () => {
    it('should handle worker errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Simulate worker error
      const errorHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'error')?.[1];

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

      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Simulate worker exit with error (code 2, not 1)
      const exitHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'exit')?.[1];

      if (exitHandler) {
        exitHandler(2); // Use exit code 2 instead of 1
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker stopped with exit code 2')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle worker error messages', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
      });

      await transport.log({
        id: '1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Simulate error message from worker
      const messageHandler = mockWorker.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler({
          type: 'error',
          error: 'Failed to write to file',
          stats: { failed: 1 },
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
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        format: 'json',
      });
      expect(transport).toBeDefined();
    });

    it('should configure plain format', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        format: 'plain',
      });
      expect(transport).toBeDefined();
    });

    it('should configure buffer size', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        bufferSize: 20000,
      });
      expect(transport).toBeDefined();
    });

    it('should configure flush interval', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        flushInterval: 500,
      });
      expect(transport).toBeDefined();
    });

    it('should configure file rotation', () => {
      const transport = new WorkerFileTransport({
        filepath: '/tmp/test.log',
        maxFileSize: 1024 * 1024 * 5, // 5MB
        compress: true,
      });
      expect(transport).toBeDefined();
    });
  });
});
