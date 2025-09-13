// File: tests/unit/transports/base/Transport.test.ts

import { Transport } from '../../../../src/transports/base/Transport';
import { EventEmitter } from 'events';
import type { LogEntry, TransportOptions, LogLevel } from '../../../../src/types/transport';

/**
 * Concrete implementation of Transport for testing
 */
class TestTransport extends Transport {
  public initCalls = 0;
  public logCalls: LogEntry[] = [];
  public batchCalls: LogEntry[][] = [];
  public closeCalls = 0;
  public flushCalls = 0;
  public testDoInitOverride?: () => Promise<void>;
  public testDoLogOverride?: (entry: LogEntry) => Promise<void>;
  public testDoLogBatchOverride?: (entries: LogEntry[]) => Promise<void>;
  public testDoCloseOverride?: () => Promise<void>;

  protected async doInit(): Promise<void> {
    this.initCalls++;
    // Allow test to override this method
    if (this.testDoInitOverride) {
      return this.testDoInitOverride();
    }
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    this.logCalls.push(entry);

    // Allow test to override this method
    if (this.testDoLogOverride) {
      return this.testDoLogOverride(entry);
    }
  }

  protected async doLogBatch(entries: LogEntry[]): Promise<void> {
    this.batchCalls.push(entries);

    // Allow test to override this method
    if (this.testDoLogBatchOverride) {
      return this.testDoLogBatchOverride(entries);
    }
  }

  protected async doClose(): Promise<void> {
    this.closeCalls++;

    // Allow test to override this method
    if (this.testDoCloseOverride) {
      return this.testDoCloseOverride();
    }
  }

  public async flush(): Promise<void> {
    this.flushCalls++;
    return super.flush();
  }

  // Expose protected methods for testing
  public testShouldLog(entry: LogEntry): boolean {
    return this.shouldLog(entry);
  }

  public testIsLevelEnabled(level: LogLevel): boolean {
    return this.isLevelEnabled(level);
  }

  public testFormatEntry(entry: LogEntry): string | Buffer {
    return this.formatEntry(entry);
  }

  // Expose protected methods for testing
  public testDoInit(): Promise<void> {
    return this.doInit();
  }

  public testDoLog(entry: LogEntry): Promise<void> {
    return this.doLog(entry);
  }

  public testDoLogBatch(entries: LogEntry[]): Promise<void> {
    return this.doLogBatch(entries);
  }

  public testDoClose(): Promise<void> {
    return this.doClose();
  }

  public testHandleError(error: Error, entry?: LogEntry): void {
    this.handleError(error, entry);
  }

  public testWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return this.withTimeout(promise, ms);
  }

  public testGenerateId(): string {
    return this.generateId();
  }
}

/**
 * Comprehensive test suite for Transport abstract base class.
 *
 * Tests lifecycle, filtering, formatting, error handling, and statistics.
 */
describe('Transport', () => {
  let transport: TestTransport;
  let mockEntry: LogEntry;

  beforeEach(() => {
    jest.clearAllMocks();

    transport = new TestTransport({
      name: 'test-transport',
      level: 'info',
      enabled: true,
    });

    // Add error event handler to prevent unhandled error warnings in tests
    transport.on('error', () => {
      // Ignore errors in tests - they're expected
    });

    mockEntry = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      loggerId: 'test-logger',
      tags: ['test'],
      context: { test: true },
    };
  });

  describe('constructor', () => {
    it('should initialize with required options', () => {
      const t = new TestTransport({ name: 'test' });

      expect(t.name).toBe('test');
      expect(t.enabled).toBe(true); // Default
      expect(t instanceof EventEmitter).toBe(true);
    });

    it('should initialize with all options', () => {
      const options: TransportOptions = {
        name: 'full-test',
        enabled: false,
        level: 'debug',
        levels: ['error', 'warn'],
        tags: ['production'],
        excludeTags: ['debug'],
        filter: entry => entry.level === 'error',
        silent: false,
        timeout: 5000,
        format: 'plain',
        formatter: entry => `Custom: ${entry.message}`,
      };

      const t = new TestTransport(options);

      expect(t.name).toBe('full-test');
      expect(t.enabled).toBe(false);
    });

    it('should throw error if name is missing', () => {
      expect(() => new TestTransport({} as TransportOptions)).toThrow('Transport name is required');
    });

    it('should set default values', () => {
      const t = new TestTransport({ name: 'defaults' });

      expect(t.enabled).toBe(true);
      // Internal properties would need to be exposed or tested through behavior
    });

    it('should set max listeners to prevent warnings', () => {
      const t = new TestTransport({ name: 'test' });
      expect(t.getMaxListeners()).toBe(20);
    });
  });

  describe('init', () => {
    it('should initialize transport once', async () => {
      await transport.init();

      expect(transport.initCalls).toBe(1);
    });

    it('should not initialize twice', async () => {
      await transport.init();
      await transport.init();

      expect(transport.initCalls).toBe(1);
    });

    it('should emit ready event on successful init', async () => {
      const readySpy = jest.fn();
      transport.on('ready', readySpy);

      await transport.init();

      expect(readySpy).toHaveBeenCalled();
    });

    it('should handle init errors', async () => {
      const errorTransport = new TestTransport({ name: 'error' });
      errorTransport.testDoInitOverride = jest.fn().mockRejectedValue(new Error('Init failed'));

      const errorSpy = jest.fn();
      errorTransport.on('error', errorSpy);

      await expect(errorTransport.init()).rejects.toThrow('Init failed');
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('log', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should log entry when enabled', async () => {
      await transport.log(mockEntry);

      expect(transport.logCalls).toHaveLength(1);
      expect(transport.logCalls[0]).toBe(mockEntry);
    });

    it('should not log when disabled', async () => {
      transport.enabled = false;
      await transport.log(mockEntry);

      expect(transport.logCalls).toHaveLength(0);
    });

    it('should not log when closing', async () => {
      transport.close(); // Start closing
      await transport.log(mockEntry);

      expect(transport.logCalls).toHaveLength(0);
    });

    it('should respect filtering', async () => {
      transport = new TestTransport({
        name: 'filtered',
        level: 'warn',
      });

      await transport.log(mockEntry); // info level
      expect(transport.logCalls).toHaveLength(0);

      const warnEntry = { ...mockEntry, level: 'warn' as LogLevel };
      await transport.log(warnEntry);
      expect(transport.logCalls).toHaveLength(1);
    });

    it('should update statistics on success', async () => {
      await transport.log(mockEntry);

      const stats = transport.getStats();
      expect(stats.processed).toBe(1);
      expect(stats.succeeded).toBe(1);
      expect(stats.failed).toBe(0);
      expect(stats.lastSuccess).toBeDefined();
    });

    it('should update statistics on failure', async () => {
      transport.testDoLogOverride = jest.fn().mockRejectedValue(new Error('Log failed'));

      await transport.log(mockEntry);

      const stats = transport.getStats();
      expect(stats.processed).toBe(1);
      expect(stats.succeeded).toBe(0);
      expect(stats.failed).toBe(1);
    });

    it('should emit logged event on success', async () => {
      const loggedSpy = jest.fn();
      transport.on('logged', loggedSpy);

      await transport.log(mockEntry);

      expect(loggedSpy).toHaveBeenCalledWith(mockEntry);
    });

    it('should handle errors', async () => {
      transport.testDoLogOverride = jest.fn().mockRejectedValue(new Error('Transport error'));
      const errorSpy = jest.fn();
      transport.on('error', errorSpy);

      await transport.log(mockEntry);

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should apply timeout', async () => {
      transport = new TestTransport({
        name: 'timeout-test',
        timeout: 100,
      });

      // Attach error listener to avoid unhandled 'error' event during timeout
      transport.on('error', () => {
        /* expected in test */
      });

      transport.testDoLogOverride = jest
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));

      await transport.log(mockEntry);

      const stats = transport.getStats();
      expect(stats.failed).toBe(1);
    });
  });

  describe('logBatch', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should log batch of entries', async () => {
      const entries = [
        mockEntry,
        { ...mockEntry, id: 'test-124', message: 'Second message' },
        { ...mockEntry, id: 'test-125', message: 'Third message' },
      ];

      await transport.logBatch(entries);

      expect(transport.batchCalls).toHaveLength(1);
      expect(transport.batchCalls[0]).toHaveLength(3);
    });

    it('should filter entries in batch', async () => {
      transport = new TestTransport({
        name: 'batch-filter',
        level: 'warn',
      });

      const entries = [
        { ...mockEntry, level: 'info' as LogLevel },
        { ...mockEntry, level: 'warn' as LogLevel },
        { ...mockEntry, level: 'error' as LogLevel },
      ];

      await transport.logBatch(entries);

      expect(transport.batchCalls).toHaveLength(1);
      expect(transport.batchCalls[0]).toHaveLength(2); // warn and error only
    });

    it('should fall back to individual logging if no batch method', async () => {
      // Create a transport without batch method
      class NoBatchTransport extends Transport {
        public logCalls: LogEntry[] = [];

        protected async doInit(): Promise<void> {
          // No-op
        }

        protected async doLog(entry: LogEntry): Promise<void> {
          this.logCalls.push(entry);
        }

        // No doLogBatch method defined
      }

      const noBatchTransport = new NoBatchTransport({ name: 'no-batch' });
      await noBatchTransport.init();

      const entries = [mockEntry, { ...mockEntry, id: 'test-124' }];
      await noBatchTransport.logBatch(entries);

      expect(noBatchTransport.logCalls).toHaveLength(2);
    });

    it('should handle partial failures in individual mode', async () => {
      // Create a transport without batch method
      class NoBatchFailTransport extends Transport {
        public logCalls: LogEntry[] = [];
        private callCount = 0;

        protected async doInit(): Promise<void> {
          // No-op
        }

        protected async doLog(entry: LogEntry): Promise<void> {
          this.callCount++;
          if (this.callCount === 2) {
            throw new Error('Second failed');
          }
          this.logCalls.push(entry);
        }

        // No doLogBatch method defined
      }

      const noBatchTransport = new NoBatchFailTransport({ name: 'no-batch-fail' });

      // Add error event handler to prevent unhandled error warnings
      noBatchTransport.on('error', () => {
        // Ignore errors in tests - they're expected
      });

      await noBatchTransport.init();

      const entries = [mockEntry, { ...mockEntry, id: 'fail' }, { ...mockEntry, id: 'test-125' }];

      await noBatchTransport.logBatch(entries);

      const stats = noBatchTransport.getStats();
      expect(stats.processed).toBe(3); // All 3 were processed (attempted)
      expect(stats.succeeded).toBe(2); // 2 succeeded
      expect(stats.failed).toBe(1); // 1 failed
    });

    it('should emit batch event', async () => {
      const batchSpy = jest.fn();
      transport.on('batch', batchSpy);

      const entries = [mockEntry];
      await transport.logBatch(entries);

      expect(batchSpy).toHaveBeenCalledWith(entries, 1);
    });

    it('should not process empty batch', async () => {
      await transport.logBatch([]);

      expect(transport.batchCalls).toHaveLength(0);
      expect(transport.logCalls).toHaveLength(0);
    });
  });

  describe('shouldLog', () => {
    it('should check level filtering', () => {
      transport = new TestTransport({
        name: 'level-test',
        level: 'warn',
      });

      expect(transport.testShouldLog({ ...mockEntry, level: 'debug' })).toBe(false);
      expect(transport.testShouldLog({ ...mockEntry, level: 'info' })).toBe(false);
      expect(transport.testShouldLog({ ...mockEntry, level: 'warn' })).toBe(true);
      expect(transport.testShouldLog({ ...mockEntry, level: 'error' })).toBe(true);
    });

    it('should check specific levels', () => {
      transport = new TestTransport({
        name: 'specific-levels',
        levels: ['error', 'debug'],
      });

      expect(transport.testShouldLog({ ...mockEntry, level: 'info' })).toBe(false);
      expect(transport.testShouldLog({ ...mockEntry, level: 'error' })).toBe(true);
      expect(transport.testShouldLog({ ...mockEntry, level: 'debug' })).toBe(true);
    });

    it('should check tag inclusion', () => {
      transport = new TestTransport({
        name: 'tag-include',
        tags: ['production', 'api'],
      });

      expect(transport.testShouldLog({ ...mockEntry, tags: ['test'] })).toBe(false);
      expect(transport.testShouldLog({ ...mockEntry, tags: ['api'] })).toBe(true);
      expect(transport.testShouldLog({ ...mockEntry, tags: ['other', 'production'] })).toBe(true);
      expect(transport.testShouldLog({ ...mockEntry, tags: undefined })).toBe(false);
    });

    it('should check tag exclusion', () => {
      transport = new TestTransport({
        name: 'tag-exclude',
        excludeTags: ['debug', 'verbose'],
      });

      expect(transport.testShouldLog({ ...mockEntry, tags: ['normal'] })).toBe(true);
      expect(transport.testShouldLog({ ...mockEntry, tags: ['debug'] })).toBe(false);
      expect(transport.testShouldLog({ ...mockEntry, tags: ['api', 'verbose'] })).toBe(false);
    });

    it('should apply custom filter', () => {
      transport = new TestTransport({
        name: 'custom-filter',
        filter: entry => entry.context?.important === true,
      });

      expect(transport.testShouldLog(mockEntry)).toBe(false);
      expect(
        transport.testShouldLog({
          ...mockEntry,
          context: { important: true },
        })
      ).toBe(true);
    });

    it('should handle filter errors', () => {
      transport = new TestTransport({
        name: 'error-filter',
        filter: () => {
          throw new Error('Filter error');
        },
      });

      const errorSpy = jest.fn();
      transport.on('error', errorSpy);

      expect(transport.testShouldLog(mockEntry)).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should allow custom log levels', () => {
      transport = new TestTransport({
        name: 'custom-level',
        level: 'info',
      });

      // Unknown levels should be allowed
      expect(transport.testShouldLog({ ...mockEntry, level: 'custom' as LogLevel })).toBe(true);
    });
  });

  describe('close', () => {
    it('should close transport', async () => {
      await transport.init();
      await transport.close();

      expect(transport.closeCalls).toBe(1);
    });

    it('should flush before closing', async () => {
      await transport.close();

      expect(transport.flushCalls).toBe(1);
    });

    it('should emit closing and closed events', async () => {
      const closingSpy = jest.fn();
      const closedSpy = jest.fn();

      transport.on('closing', closingSpy);
      transport.on('closed', closedSpy);

      await transport.close();

      expect(closingSpy).toHaveBeenCalled();
      expect(closedSpy).toHaveBeenCalled();
    });

    it('should prevent multiple closes', async () => {
      await transport.close();
      await transport.close();

      expect(transport.closeCalls).toBe(1);
    });

    it('should disable transport when closing', async () => {
      const closePromise = transport.close();

      expect(transport.enabled).toBe(false);

      await closePromise;
    });

    it('should remove all listeners', async () => {
      transport.on('ready', jest.fn());
      expect(transport.listenerCount('ready')).toBe(1);

      await transport.close();

      expect(transport.listenerCount('ready')).toBe(0);
    });

    it('should handle close errors', async () => {
      transport.testDoCloseOverride = jest.fn().mockRejectedValue(new Error('Close failed'));

      await expect(transport.close()).rejects.toThrow('Close failed');
    });
  });

  describe('formatEntry', () => {
    it('should format as JSON by default', () => {
      const result = transport.testFormatEntry(mockEntry);

      expect(result).toBe(JSON.stringify(mockEntry));
    });

    it('should format as plain text', () => {
      transport = new TestTransport({
        name: 'plain',
        format: 'plain',
      });

      const result = transport.testFormatEntry(mockEntry);

      expect(result).toContain(mockEntry.timestamp);
      expect(result).toContain('[INFO]');
      expect(result).toContain('Test message');
    });

    it('should use custom formatter', () => {
      transport = new TestTransport({
        name: 'custom',
        format: 'custom',
        formatter: entry => `CUSTOM: ${entry.message}`,
      });

      const result = transport.testFormatEntry(mockEntry);

      expect(result).toBe('CUSTOM: Test message');
    });

    it('should throw if custom formatter not provided', () => {
      transport = new TestTransport({
        name: 'custom-missing',
        format: 'custom',
      });

      expect(() => transport.testFormatEntry(mockEntry)).toThrow('Custom formatter not provided');
    });

    it('should format error details in plain text', () => {
      transport = new TestTransport({
        name: 'plain-error',
        format: 'plain',
      });

      const entryWithError = {
        ...mockEntry,
        error: {
          name: 'TestError',
          message: 'Something failed',
          stack: 'Error: Something failed\n  at test.js:1:1',
        },
      };

      const result = transport.testFormatEntry(entryWithError) as string;

      expect(result).toContain('Error: Something failed');
      expect(result).toContain('Stack:');
    });

    it('should format context in plain text', () => {
      transport = new TestTransport({
        name: 'plain-context',
        format: 'plain',
      });

      const result = transport.testFormatEntry(mockEntry) as string;

      expect(result).toContain('Context: {"test":true}');
    });
  });

  describe('error handling', () => {
    it('should update error statistics', () => {
      const error = new Error('Test error');
      transport.testHandleError(error);

      const stats = transport.getStats();
      expect(stats.lastError).toEqual({
        timestamp: expect.any(Date),
        message: 'Test error',
        count: 1,
      });
    });

    it('should increment error count for repeated errors', () => {
      const error = new Error('Same error');

      transport.testHandleError(error);
      transport.testHandleError(error);
      transport.testHandleError(error);

      const stats = transport.getStats();
      expect(stats.lastError?.count).toBe(3);
    });

    it('should emit error event', () => {
      const errorSpy = jest.fn();
      transport.on('error', errorSpy);

      const error = new Error('Test');
      transport.testHandleError(error, mockEntry);

      expect(errorSpy).toHaveBeenCalledWith(error, mockEntry);
    });

    it('should log to console when not silent', () => {
      // Temporarily restore console.error for this test
      (console.error as jest.Mock).mockRestore();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      transport = new TestTransport({
        name: 'not-silent',
        silent: false,
      });

      // Add error event handler to prevent unhandled error warnings
      transport.on('error', () => {
        // Ignore errors in tests - they're expected
      });

      transport.testHandleError(new Error('Visible error'));

      expect(consoleSpy).toHaveBeenCalledWith('[not-silent] Transport error:', 'Visible error');

      consoleSpy.mockRestore();
      // Re-mock console.error for other tests
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    it('should not log to console when silent', () => {
      // Temporarily restore console.error for this test
      (console.error as jest.Mock).mockRestore();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      transport = new TestTransport({
        name: 'silent',
        silent: true,
      });

      // Add error event handler to prevent unhandled error warnings
      transport.on('error', () => {
        // Ignore errors in tests - they're expected
      });

      transport.testHandleError(new Error('Silent error'));

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      // Re-mock console.error for other tests
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });
  });

  describe('utility methods', () => {
    it('should apply timeout to promises', async () => {
      const slowPromise = new Promise(resolve => setTimeout(resolve, 200));

      await expect(transport.testWithTimeout(slowPromise, 100)).rejects.toThrow(
        'Operation timed out after 100ms'
      );
    });

    it('should not timeout fast promises', async () => {
      const fastPromise = Promise.resolve('fast');

      const result = await transport.testWithTimeout(fastPromise, 100);
      expect(result).toBe('fast');
    });

    it('should check if level is enabled', () => {
      transport = new TestTransport({
        name: 'level-check',
        level: 'warn',
      });

      expect(transport.testIsLevelEnabled('debug')).toBe(false);
      expect(transport.testIsLevelEnabled('info')).toBe(false);
      expect(transport.testIsLevelEnabled('warn')).toBe(true);
      expect(transport.testIsLevelEnabled('error')).toBe(true);
      expect(transport.testIsLevelEnabled('success')).toBe(true);
    });

    it('should allow unknown levels', () => {
      expect(transport.testIsLevelEnabled('custom' as LogLevel)).toBe(true);
    });

    it('should generate unique IDs', () => {
      const id1 = transport.testGenerateId();
      const id2 = transport.testGenerateId();

      expect(id1).not.toBe(id2);
      // Should match UUID format or fallback format (timestamp-counter-hex)
      expect(id1).toMatch(
        /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+-\d{5}-[0-9a-f]{6})$/
      );
    });
  });

  describe('getStats', () => {
    it('should return copy of statistics', async () => {
      await transport.log(mockEntry);

      const stats1 = transport.getStats();
      const stats2 = transport.getStats();

      expect(stats1).not.toBe(stats2); // Different objects
      expect(stats1).toEqual(stats2); // Same content
    });

    it('should include all stat fields', () => {
      const stats = transport.getStats();

      expect(stats).toHaveProperty('processed');
      expect(stats).toHaveProperty('succeeded');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('queued');
      expect(stats).toHaveProperty('lastSuccess');
      expect(stats).toHaveProperty('lastError');
      expect(stats).toHaveProperty('custom');
    });
  });
});

// ==============================================
// TRANSPORT MODULE EXPORTS TESTS
// ==============================================

describe('Transport Module Exports', () => {
  describe('src/transports.ts exports', () => {
    it('should export all core transport classes', async () => {
      const transportsModule = await import('../../../../src/transports');

      expect(transportsModule.ConsoleTransport).toBeDefined();
      expect(transportsModule.FileTransport).toBeDefined();
      expect(transportsModule.StreamTransport).toBeDefined();
      expect(transportsModule.HTTPTransport).toBeDefined();
      expect(transportsModule.Transport).toBeDefined();
      expect(transportsModule.NetworkTransport).toBeDefined();
    });

    it('should export optional transport classes', async () => {
      const transportsModule = await import('../../../../src/transports');

      expect(transportsModule.S3Transport).toBeDefined();
      expect(transportsModule.MongoDBTransport).toBeDefined();
      expect(transportsModule.WebSocketTransport).toBeDefined();
    });

    it('should export transport registry', async () => {
      const transportsModule = await import('../../../../src/transports');

      expect(transportsModule.TransportRegistry).toBeDefined();
      expect(typeof transportsModule.TransportRegistry).toBe('function');
    });

    it('should export convenience factory functions', async () => {
      const transportsModule = await import('../../../../src/transports');

      expect(transportsModule.createConsole).toBeDefined();
      expect(transportsModule.createFile).toBeDefined();
      expect(transportsModule.createHTTP).toBeDefined();
      expect(transportsModule.createStream).toBeDefined();

      expect(typeof transportsModule.createConsole).toBe('function');
      expect(typeof transportsModule.createFile).toBe('function');
      expect(typeof transportsModule.createHTTP).toBe('function');
      expect(typeof transportsModule.createStream).toBe('function');
    });

    it('should export transport types', async () => {
      // Import for runtime verification
      const transportsModule = await import('../../../../src/transports');

      // Verify module has exports (types are compile-time only)
      expect(Object.keys(transportsModule).length).toBeGreaterThan(0);

      // Verify classes can be instantiated with proper types
      const console = new transportsModule.ConsoleTransport({ name: 'test-console' });
      expect(console.name).toBe('test-console');
    });
  });

  describe('Convenience factory functions', () => {
    it('should create console transport with default name', async () => {
      const { createConsole } = await import('../../../../src/transports');

      const transport = await createConsole();
      expect(transport.name).toBe('console');
      expect(transport.enabled).toBe(true);
    });

    it('should create console transport with custom options', async () => {
      const { createConsole } = await import('../../../../src/transports');

      const transport = await createConsole({
        name: 'custom-console',
        enabled: false,
        colorize: false,
      });

      expect(transport.name).toBe('custom-console');
      expect(transport.enabled).toBe(false);
    });

    it('should create file transport with sanitized name', async () => {
      const { createFile } = await import('../../../../src/transports');

      const transport = await createFile('/tmp/my-app.log');
      expect(transport.name).toBe('file--tmp-my-app-log');
      expect(transport.enabled).toBe(true);
    });

    it('should create HTTP transport with hostname-based name', async () => {
      const { createHTTP } = await import('../../../../src/transports');

      const transport = await createHTTP('https://api.example.com/logs');
      expect(transport.name).toBe('http-api.example.com');
      expect(transport.enabled).toBe(true);
    });

    it('should create stream transport with default name', async () => {
      const { createStream } = await import('../../../../src/transports');
      const { Writable } = await import('stream');

      const mockStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      const transport = await createStream(mockStream);
      expect(transport.name).toBe('stream');
      expect(transport.enabled).toBe(true);
    });
  });

  describe('Tree-shaking support', () => {
    it('should allow selective import of core transports', async () => {
      // Test selective imports don't break
      const { ConsoleTransport, FileTransport } = await import('../../../../src/transports');

      expect(ConsoleTransport).toBeDefined();
      expect(FileTransport).toBeDefined();

      const console = new ConsoleTransport({ name: 'selective-console' });
      const file = new FileTransport({ name: 'selective-file', filepath: '/tmp/test.log' });

      expect(console.name).toBe('selective-console');
      expect(file.name).toBe('selective-file');
    });

    it('should allow selective import of optional transports', async () => {
      const { S3Transport, MongoDBTransport } = await import('../../../../src/transports');

      expect(S3Transport).toBeDefined();
      expect(MongoDBTransport).toBeDefined();

      // These should be importable even if external deps aren't available
      expect(typeof S3Transport).toBe('function');
      expect(typeof MongoDBTransport).toBe('function');
    });

    it('should allow selective import of factory functions', async () => {
      const { createConsole, createFile } = await import('../../../../src/transports');

      expect(createConsole).toBeDefined();
      expect(createFile).toBeDefined();

      const console = await createConsole({ name: 'tree-shaken-console' });
      const file = await createFile('/tmp/tree-shaken.log', { name: 'tree-shaken-file' });

      expect(console.name).toBe('tree-shaken-console');
      expect(file.name).toBe('tree-shaken-file');
    });
  });
});

// ==============================================
// INDIVIDUAL TRANSPORT ENTRY POINTS TESTS
// ==============================================

describe('Individual Transport Entry Points', () => {
  describe('console.ts entry point', () => {
    it('should export console transport class', async () => {
      const consoleModule = await import('../../../../src/transports/console');

      expect(consoleModule.ConsoleTransport).toBeDefined();
      expect(typeof consoleModule.ConsoleTransport).toBe('function');
    });

    it('should export console transport options type', async () => {
      // Types are compile-time, but we can verify the module structure
      const consoleModule = await import('../../../../src/transports/console');
      expect(Object.keys(consoleModule).length).toBeGreaterThan(0);
    });

    it('should register console transport with TransportRegistry', async () => {
      await import('../../../../src/transports/console');
      const { TransportRegistry } = await import('../../../../src/transports');

      // Verify registration occurred
      expect(TransportRegistry.has('console')).toBe(true);
    });

    it('should create console transport via registry', async () => {
      await import('../../../../src/transports/console'); // Ensure registration
      const { TransportRegistry } = await import('../../../../src/transports');

      const factory = TransportRegistry.get('console');
      expect(factory).toBeDefined();

      if (!factory) {
        throw new Error('Console transport factory not found in registry');
      }

      const transport = (factory as (opts: Record<string, unknown>) => TestTransport)({
        type: 'console',
        name: 'registry-console',
        enabled: true,
      });

      expect(transport.name).toBe('registry-console');
      expect(transport.enabled).toBe(true);
    });
  });

  describe('file.ts entry point', () => {
    it('should export file transport class', async () => {
      const fileModule = await import('../../../../src/transports/file');

      expect(fileModule.FileTransport).toBeDefined();
      expect(typeof fileModule.FileTransport).toBe('function');
    });

    it('should register file transport with TransportRegistry', async () => {
      await import('../../../../src/transports/file');
      const { TransportRegistry } = await import('../../../../src/transports');

      expect(TransportRegistry.has('file')).toBe(true);
    });

    it('should create file transport via registry', async () => {
      await import('../../../../src/transports/file'); // Ensure registration
      const { TransportRegistry } = await import('../../../../src/transports');

      const factory = TransportRegistry.get('file');
      expect(factory).toBeDefined();

      if (!factory) {
        throw new Error('File transport factory not found in registry');
      }

      const transport = factory({
        type: 'file',
        name: 'registry-file',
        filepath: '/tmp/registry-test.log',
        enabled: true,
      });

      expect(transport.name).toBe('registry-file');
      expect(transport.enabled).toBe(true);
    });
  });

  describe('http.ts entry point', () => {
    it('should export HTTP transport class', async () => {
      const httpModule = await import('../../../../src/transports/http');

      expect(httpModule.HTTPTransport).toBeDefined();
      expect(typeof httpModule.HTTPTransport).toBe('function');
    });

    it('should register HTTP transport with TransportRegistry', async () => {
      await import('../../../../src/transports/http');
      const { TransportRegistry } = await import('../../../../src/transports');

      expect(TransportRegistry.has('http')).toBe(true);
    });

    it('should create HTTP transport via registry', async () => {
      await import('../../../../src/transports/http'); // Ensure registration
      const { TransportRegistry } = await import('../../../../src/transports');

      const factory = TransportRegistry.get('http');
      expect(factory).toBeDefined();

      if (!factory) {
        throw new Error('HTTP transport factory not found in registry');
      }

      const transport = factory({
        type: 'http',
        name: 'registry-http',
        url: 'https://api.example.com/logs',
        enabled: true,
      });

      expect(transport.name).toBe('registry-http');
      expect(transport.enabled).toBe(true);
    });
  });

  describe('Entry point integration', () => {
    it('should allow mixing entry points and main exports', async () => {
      // Import individual entry points
      await import('../../../../src/transports/console');
      await import('../../../../src/transports/file');

      // Import main transport module
      const { TransportRegistry, createConsole } = await import('../../../../src/transports');

      // Should work together
      const factory = TransportRegistry.get('console');
      expect(factory).toBeDefined();

      if (!factory) {
        throw new Error('Console transport factory not found in registry');
      }

      const registryConsole = factory({
        type: 'console',
        name: 'mixed-registry-console',
      });

      const factoryConsole = await createConsole({ name: 'mixed-factory-console' });

      expect(registryConsole.name).toBe('mixed-registry-console');
      expect(factoryConsole.name).toBe('mixed-factory-console');
    });

    it('should handle multiple imports of same entry point', async () => {
      // Import same entry point multiple times
      const console1 = await import('../../../../src/transports/console');
      const console2 = await import('../../../../src/transports/console');

      // Should be same reference
      expect(console1.ConsoleTransport).toBe(console2.ConsoleTransport);

      // Registry should only have one registration
      const { TransportRegistry } = await import('../../../../src/transports');
      expect(TransportRegistry.has('console')).toBe(true);
    });
  });
});
