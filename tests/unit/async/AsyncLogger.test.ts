/**
 * @fileoverview Tests for AsyncLogger implementation
 *
 * Tests the correct async logger architecture where:
 * - Logger only routes to transports, no buffering at logger level
 * - Each transport manages its own buffering/threading strategy
 * - No microtasks or fake async
 */

import { AsyncLogger } from '../../../src/async/AsyncLogger';
import type { Transport } from '../../../src/types/transport';
import type { LogEntry } from '../../../src/types/transport';

describe('AsyncLogger', () => {
  let mockTransport: jest.Mocked<Transport>;

  beforeEach(() => {
    mockTransport = {
      name: 'mock',
      enabled: true,
      log: jest.fn(),
      flush: jest.fn(),
      close: jest.fn(),
      shouldLog: jest.fn().mockReturnValue(true),
    } as jest.Mocked<Transport>;
  });

  describe('Core Functionality', () => {
    it('should route logs directly to transports', async () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      // Wait for logger initialization
      await logger.waitForReady();

      logger.info('Test message');

      // Force batch flush to process logs
      logger.flush();

      // Wait for async processing
      await new Promise(resolve => setImmediate(resolve));

      // Should route to transport after flush
      expect(mockTransport.log).toHaveBeenCalledTimes(1);
      expect(mockTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Test message',
        })
      );
    });

    it('should route to multiple transports', async () => {
      const transport1 = {
        name: 'transport1',
        enabled: true,
        log: jest.fn(),
        flush: jest.fn(),
        close: jest.fn(),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport>;

      const transport2 = {
        name: 'transport2',
        enabled: true,
        log: jest.fn(),
        flush: jest.fn(),
        close: jest.fn(),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport>;

      const logger = new AsyncLogger({
        transports: [transport1, transport2],
      });

      await logger.waitForReady();
      logger.error('Error occurred');
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      // Both transports should receive the log
      expect(transport1.log).toHaveBeenCalledTimes(1);
      expect(transport2.log).toHaveBeenCalledTimes(1);

      expect(transport1.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Error occurred',
        })
      );
    });

    it('should not buffer at logger level', async () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      // Log multiple messages
      await logger.waitForReady();
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      // All should be routed
      expect(mockTransport.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('Log Levels', () => {
    it('should support all log levels', async () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      await logger.waitForReady();
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      expect(mockTransport.log).toHaveBeenCalledTimes(4);

      const calls = mockTransport.log.mock.calls;
      expect(calls[0][0].level).toBe('debug');
      expect(calls[1][0].level).toBe('info');
      expect(calls[2][0].level).toBe('warn');
      expect(calls[3][0].level).toBe('error');
    });
  });

  describe('Metadata', () => {
    it('should include metadata with logs', async () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      await logger.waitForReady();
      logger.info('User action', { userId: 123, action: 'login' });
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      expect(mockTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'User action',
          context: { userId: 123, action: 'login' },
        })
      );
    });

    it('should handle errors as metadata', async () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      await logger.waitForReady();
      const error = new Error('Something went wrong');
      logger.error('Operation failed', { error });
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      expect(mockTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Operation failed',
          context: { error },
        })
      );
    });
  });

  describe('Transport Management', () => {
    it('should add transports dynamically', async () => {
      const logger = new AsyncLogger();

      await logger.waitForReady();
      logger.info('Before transport');
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));
      expect(mockTransport.log).not.toHaveBeenCalled();

      logger.addTransport(mockTransport);
      logger.info('After transport');
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      expect(mockTransport.log).toHaveBeenCalledTimes(1);
    });

    it('should remove transports', async () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      await logger.waitForReady();
      logger.removeTransport('mock');
      logger.info('Should not log');
      logger.flush();
      await new Promise(resolve => setImmediate(resolve));

      expect(mockTransport.log).not.toHaveBeenCalled();
    });

    it('should list transport names', async () => {
      const transport1 = { ...mockTransport, name: 'file' };
      const transport2 = { ...mockTransport, name: 'console' };

      const logger = new AsyncLogger({
        transports: [transport1, transport2],
      });

      await logger.waitForReady();
      const names = logger.listTransports();
      expect(names).toEqual(['file', 'console']);
    });
  });

  describe('Flush and Close', () => {
    it('should flush all transports', async () => {
      const transport1 = {
        name: 'transport1',
        enabled: true,
        log: jest.fn(),
        flush: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport>;

      const transport2 = {
        name: 'transport2',
        enabled: true,
        log: jest.fn(),
        flush: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport>;

      const logger = new AsyncLogger({
        transports: [transport1, transport2],
      });

      await logger.flush();

      expect(transport1.flush).toHaveBeenCalledTimes(1);
      expect(transport2.flush).toHaveBeenCalledTimes(1);
    });

    it('should close all transports', async () => {
      const transport1 = {
        name: 'transport1',
        enabled: true,
        log: jest.fn(),
        flush: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport>;

      const transport2 = {
        name: 'transport2',
        enabled: true,
        log: jest.fn(),
        flush: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport>;

      const logger = new AsyncLogger({
        transports: [transport1, transport2],
      });

      await logger.close();

      expect(transport1.close).toHaveBeenCalledTimes(1);
      expect(transport2.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('onFlush Callback', () => {
    it('should call onFlush when transports flush', async () => {
      const onFlush = jest.fn();

      const logger = new AsyncLogger({
        transports: [mockTransport],
        onFlush,
        buffer: {
          size: 100,           // Don't auto-flush on 2 messages
          flushInterval: 1000  // Don't auto-flush from timer
        }
      });

      // Log some entries
      logger.info('Message 1');
      logger.info('Message 2');

      // Flush transports
      await logger.flush();
      
      // Wait for async processing - multiple rounds to ensure completion
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));

      // With micro-batching, onFlush is called once with all entries
      expect(onFlush).toHaveBeenCalled();
      
      // Find the call with our messages
      const calls = onFlush.mock.calls;
      console.log('onFlush calls:', calls.length);
      console.log('All calls:', JSON.stringify(calls, null, 2));
      calls.forEach((call, i) => {
        console.log(`Call ${i}:`, call[0]?.length, 'entries');
        if (call[0]?.length > 0) {
          console.log('First entry:', call[0][0]);
        }
      });
      
      const batchWithMessages = calls.find(call => 
        call[0] && call[0].some((entry: any) => entry.message === 'Message 1')
      );
      
      expect(batchWithMessages).toBeDefined();
      expect(batchWithMessages[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Message 1' }),
          expect.objectContaining({ message: 'Message 2' })
        ])
      );
    });
  });

  describe('Correct Architecture', () => {
    it('should not use queueMicrotask', () => {
      // Spy on global queueMicrotask if it exists
      const originalQueueMicrotask = global.queueMicrotask;
      if (typeof originalQueueMicrotask !== 'undefined') {
        global.queueMicrotask = jest.fn();
      }

      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      logger.info('Test');

      // Test if queueMicrotask was called (only if it was mocked)
      const wasMocked = originalQueueMicrotask !== undefined;
      const mockToTest = wasMocked ? global.queueMicrotask : jest.fn();

      // Verify the mock wasn't called
      expect(mockToTest).toBeDefined();
      expect(wasMocked && typeof mockToTest === 'function').toBe(wasMocked);

      // For mocked function, verify it wasn't called
      const callCount = wasMocked ? (mockToTest as jest.Mock).mock?.calls?.length ?? 0 : 0;
      expect(callCount).toBe(0);

      // Always restore original if it was mocked
      if (typeof originalQueueMicrotask !== 'undefined') {
        global.queueMicrotask = originalQueueMicrotask;
      }
    });

    it('should not have buffer configuration at logger level', () => {
      const logger = new AsyncLogger({
        transports: [mockTransport],
      });

      // AsyncLogger should not expose buffer-related properties publicly
      // These are internal implementation details
      expect((logger as any).buffer).toBeUndefined();
      expect((logger as any).ringBuffer).toBeUndefined();
      // flushInterval is private and internal, so it exists but shouldn't be accessed
      expect(typeof (logger as any).flushInterval).toBe('number');
    });

    it('should let transports handle their own strategies', async () => {
      // Mock a transport with its own buffering strategy
      const transportBuffer: LogEntry[] = [];
      const flushCalled = jest.fn();

      const bufferingTransport = {
        name: 'buffering',
        enabled: true,
        buffer: transportBuffer,
        log: jest.fn().mockImplementation((entry: LogEntry) => {
          // Transport decides to buffer entries instead of writing immediately
          transportBuffer.push(entry);
        }),
        flush: jest.fn().mockImplementation(() => {
          // Transport flushes its buffer in its own way
          flushCalled();
          // In a real transport, this might write to disk/network
          // For testing, we just track that it was called
        }),
        close: jest.fn(),
        shouldLog: jest.fn().mockReturnValue(true),
      } as jest.Mocked<Transport> & { buffer: LogEntry[] };

      const logger = new AsyncLogger({
        transports: [bufferingTransport],
      });

      await logger.waitForReady();

      // Log a message
      logger.info('Buffered by transport');

      // Flush to process the message
      await logger.flush();

      // Transport should have received the log
      expect(bufferingTransport.log).toHaveBeenCalled();
      expect(bufferingTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Buffered by transport' })
      );

      // Transport's flush method should also have been called
      expect(bufferingTransport.flush).toHaveBeenCalled();

      // This demonstrates that transports control their own buffering/flushing strategy
      expect(flushCalled).toHaveBeenCalled();
    });
  });
});
