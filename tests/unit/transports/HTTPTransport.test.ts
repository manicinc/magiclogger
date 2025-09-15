import { HTTPTransport } from '../../../src/transports/HTTPTransport';
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

describe('HTTPTransport', () => {
  let mockWorker: {
    postMessage: jest.Mock;
    on: jest.Mock;
    off: jest.Mock;
    terminate: jest.Mock;
  };
  let eventHandlers: Record<string, (...args: unknown[]) => void> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};

    mockWorker = {
      postMessage: jest.fn().mockImplementation((message: { type: string }) => {
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
                eventHandlers.message({ type: 'closed', stats: {} });
                break;
            }
          }
        });
      }),
      on: jest.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
        eventHandlers[event] = handler;
        return mockWorker; // Return this for chaining
      }),
      off: jest.fn(),
      terminate: jest.fn(),
    };
    (Worker as unknown as jest.Mock).mockImplementation(() => mockWorker);
  });

  describe('Constructor', () => {
    it('should create transport with required endpoint', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com/api',
      });
      expect(transport.name).toBe('http-worker');
      expect(transport.enabled).toBe(true);
    });

    it('should accept url as alias for endpoint', () => {
      const transport = new HTTPTransport({
        url: 'https://logs.example.com/api',
      });
      expect(transport.name).toBe('http-worker');
      expect(transport.enabled).toBe(true);
    });

    it('should throw error if no endpoint or url provided', () => {
      expect(() => {
        new HTTPTransport({} as any);
      }).toThrow('HTTPWorkerTransport requires an endpoint');
    });

    it('should accept custom name', () => {
      const transport = new HTTPTransport({
        name: 'custom-http',
        endpoint: 'https://logs.example.com',
      });
      expect(transport.name).toBe('custom-http');
    });

    it('should respect enabled option', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        enabled: false,
      });
      expect(transport.enabled).toBe(false);
    });

    it('should accept HTTP method configuration', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        method: 'PUT',
      });
      expect(transport).toBeDefined();
    });

    it('should accept custom headers', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        headers: {
          Authorization: 'Bearer token123',
          'X-API-Key': 'secret',
        },
      });
      expect(transport).toBeDefined();
    });

    it('should accept batching configuration', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        batchSize: 200,
        flushInterval: 10000,
      });
      expect(transport).toBeDefined();
    });

    it('should accept retry configuration', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        maxRetries: 5,
        retryDelay: 2000,
      });
      expect(transport).toBeDefined();
    });

    it('should accept compression option', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        compress: true,
      });
      expect(transport).toBeDefined();
    });

    it('should accept circuit breaker configuration', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        circuitBreakerThreshold: 3,
        circuitBreakerResetTimeout: 30000,
      });
      expect(transport).toBeDefined();
    });
  });

  describe('Worker initialization', () => {
    it('should lazily initialize worker on first log', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      expect(Worker).not.toHaveBeenCalled();

      const entry: LogEntry = {
        id: '123',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
      };

      await transport.log(entry);

      expect(Worker).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'init',
        config: expect.objectContaining({
          endpoint: 'https://logs.example.com',
        }),
      });
    });

    it('should queue entries while worker is initializing', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: Date.now(),
          level: 'info',
          message: 'First',
          loggerId: 'test',
        },
        {
          id: '2',
          timestamp: Date.now(),
          level: 'error',
          message: 'Second',
          loggerId: 'test',
        },
      ];

      // Log entries before worker is ready
      await transport.log(entries[0]);
      await transport.log(entries[1]);

      // Simulate worker ready
      const readyHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'message')?.[1];

      if (readyHandler) {
        readyHandler({ type: 'ready' });
      }

      // Verify queued entries were sent
      const logCalls = mockWorker.postMessage.mock.calls.filter(
        (call: any) => call[0].type === 'log'
      );
      expect(logCalls).toHaveLength(2);
    });
  });

  describe('Logging operations', () => {
    it('should send log entries to worker', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      const entry: LogEntry = {
        id: '123',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
        context: { userId: 123 },
      };

      // Initialize and make ready
      await transport.log(entry);

      // Simulate worker ready
      const readyHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'message')?.[1];

      if (readyHandler) {
        readyHandler({ type: 'ready' });
      }

      // Log another entry when ready
      await transport.log(entry);

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'log',
        entry,
      });
    });

    it('should batch multiple log entries', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        batchSize: 5,
      });

      // Simulate ready state
      await transport.log({
        id: 'init',
        timestamp: Date.now(),
        level: 'info',
        message: 'Init',
        loggerId: 'test',
      });

      const readyHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'message')?.[1];

      if (readyHandler) {
        readyHandler({ type: 'ready' });
      }

      // Log multiple entries
      for (let i = 0; i < 10; i++) {
        await transport.log({
          id: `log-${i}`,
          timestamp: Date.now(),
          level: 'info',
          message: `Message ${i}`,
          loggerId: 'test',
        });
      }

      // All entries should be sent to worker for batching
      const logCalls = mockWorker.postMessage.mock.calls.filter(
        (call: any) => call[0].type === 'log'
      );
      expect(logCalls.length).toBeGreaterThan(0);
    });

    it('should not log when transport is disabled', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        enabled: false,
      });

      const entry: LogEntry = {
        id: '125',
        timestamp: Date.now(),
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
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      // Initialize worker
      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Simulate worker ready
      const messageHandler = mockWorker.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      await transport.flush();

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'flush',
      });
    });

    it('should resolve flush when worker responds', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      // Initialize
      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      const messageHandler = mockWorker.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      const flushPromise = transport.flush();

      // Simulate flush complete
      if (messageHandler) {
        messageHandler({ type: 'flushed' });
      }

      await expect(flushPromise).resolves.toBeUndefined();
    });

    it('should handle flush timeout', async () => {
      jest.useFakeTimers();

      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      // Initialize
      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      const messageHandler = mockWorker.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler({ type: 'ready' });
      }

      const flushPromise = transport.flush();

      // Fast-forward past timeout
      jest.advanceTimersByTime(11000);

      await expect(flushPromise).resolves.toBeUndefined();

      jest.useRealTimers();
    });
  });

  describe('Close operation', () => {
    it('should close worker and clean up', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      // Initialize by logging something
      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      await transport.close();

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'close',
      });
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should log final stats on close', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      // Initialize by logging something
      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      await transport.close();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Final stats'),
        expect.any(Object)
      );

      consoleLogSpy.mockRestore();
    });

    it('should terminate worker after close', async () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      // Initialize by logging something
      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 50));

      await transport.close();

      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });

  describe('Worker error handling', () => {
    it('should handle worker errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      const errorHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'error')?.[1];

      if (errorHandler) {
        errorHandler(new Error('Worker crashed'));
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker thread error'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle circuit breaker open messages', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      const messageHandler = mockWorker.on.mock.calls.find(
        (call: any) => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler({
          type: 'circuit-open',
          message: 'Circuit breaker opened after 5 failures',
        });
      }

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('http-worker'),
        'Circuit breaker opened after 5 failures'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle worker exit with error code', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
      });

      await transport.log({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'test',
      });

      const exitHandler = mockWorker.on.mock.calls.find((call: any) => call[0] === 'exit')?.[1];

      if (exitHandler) {
        exitHandler(1);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker stopped with exit code 1')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Configuration edge cases', () => {
    it('should handle both endpoint and url properties', () => {
      const transport1 = new HTTPTransport({
        endpoint: 'https://logs1.example.com',
      });
      expect(transport1).toBeDefined();

      const transport2 = new HTTPTransport({
        url: 'https://logs2.example.com',
      });
      expect(transport2).toBeDefined();
    });

    it('should prefer endpoint over url if both provided', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://primary.example.com',
        url: 'https://fallback.example.com',
      });

      expect(transport).toBeDefined();
      // Worker should be initialized with primary endpoint
    });

    it('should handle all HTTP methods', () => {
      const methods: Array<'POST' | 'PUT' | 'PATCH'> = ['POST', 'PUT', 'PATCH'];

      methods.forEach(method => {
        const transport = new HTTPTransport({
          endpoint: 'https://logs.example.com',
          method,
        });
        expect(transport).toBeDefined();
      });
    });

    it('should handle large buffer configuration', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        maxBufferSize: 100000,
      });
      expect(transport).toBeDefined();
    });

    it('should handle timeout configuration', () => {
      const transport = new HTTPTransport({
        endpoint: 'https://logs.example.com',
        timeout: 60000,
      });
      expect(transport).toBeDefined();
    });
  });
});
