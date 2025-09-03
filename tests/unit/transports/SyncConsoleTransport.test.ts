import { SyncConsoleTransport } from '../../../src/transports/SyncConsoleTransport';
import type { LogEntry } from '../../../src/types/transport';

describe('SyncConsoleTransport', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    info: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create transport with default options', () => {
      const transport = new SyncConsoleTransport();
      expect(transport.name).toBe('sync-console');
      expect(transport.enabled).toBe(true);
    });

    it('should create transport with custom name', () => {
      const transport = new SyncConsoleTransport({ name: 'custom-console' });
      expect(transport.name).toBe('custom-console');
    });

    it('should respect enabled option', () => {
      const transport = new SyncConsoleTransport({ enabled: false });
      expect(transport.enabled).toBe(false);
    });

    it('should accept useColors option', () => {
      const transport = new SyncConsoleTransport({ useColors: false });
      expect(transport).toBeDefined();
    });
  });

  describe('Synchronous logging', () => {
    it('should log info messages synchronously', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test info message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log error messages to console.error', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '124',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'error',
        message: 'Test error message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log warning messages to console.warn', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '125',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'warn',
        message: 'Test warning message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log debug messages to console.debug', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '126',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'debug',
        message: 'Test debug message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should handle success level messages', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '127',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'success',
        message: 'Test success message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should not log when transport is disabled', () => {
      const transport = new SyncConsoleTransport({ enabled: false });
      const entry: LogEntry = {
        id: '128',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Should not log',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('Color formatting', () => {
    it('should apply colors when useColors is true', () => {
      const transport = new SyncConsoleTransport({ useColors: true });
      const entry: LogEntry = {
        id: '129',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Colored message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
      // Check that ANSI color codes are included
      const callArgs = consoleSpy.log.mock.calls[0];
      expect(callArgs.some(arg => typeof arg === 'string' && arg.includes('\x1b'))).toBe(true);
    });

    it('should not apply colors when useColors is false', () => {
      const transport = new SyncConsoleTransport({ useColors: false });
      const entry: LogEntry = {
        id: '130',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Plain message',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
      // Check that no ANSI color codes are included
      const callArgs = consoleSpy.log.mock.calls[0];
      expect(callArgs.every(arg => typeof arg !== 'string' || !arg.includes('\x1b'))).toBe(true);
    });
  });

  describe('Metadata and context', () => {
    it('should log entries with metadata', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '131',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Message with metadata',
        loggerId: 'test-logger',
        context: {
          user: 'john',
          action: 'login',
          ip: '127.0.0.1'
        }
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
      const callArgs = consoleSpy.log.mock.calls[0];
      const logOutput = callArgs.join(' ');
      expect(logOutput).toContain('john');
    });

    it('should handle entries with tags', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '132',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Tagged message',
        loggerId: 'test-logger',
        tags: ['api', 'auth', 'v2']
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle entries with errors', () => {
      const transport = new SyncConsoleTransport();
      const testError = new Error('Test error');
      const entry: LogEntry = {
        id: '133',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'error',
        message: 'Error occurred',
        loggerId: 'test-logger',
        error: testError,
        context: {
          stack: testError.stack
        }
      };

      transport.log(entry);
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('Protected methods', () => {
    class TestableTransport extends SyncConsoleTransport {
      public testDoInit() {
        return this.doInit();
      }

      public testDoLog(entry: LogEntry) {
        return this.doLog(entry);
      }

      public testDoClose() {
        return this.doClose();
      }

      public testFormatEntry(entry: LogEntry) {
        return this.formatEntry(entry);
      }

      public getOptions() {
        return this.options;
      }
    }

    it('should initialize successfully', async () => {
      const transport = new TestableTransport();
      await expect(transport.testDoInit()).resolves.toBeUndefined();
    });

    it('should close successfully', async () => {
      const transport = new TestableTransport();
      await expect(transport.testDoClose()).resolves.toBeUndefined();
    });

    it('should format entries correctly', () => {
      const transport = new TestableTransport();
      const entry: LogEntry = {
        id: '134',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test format',
        loggerId: 'test-logger',
      };

      const formatted = transport.testFormatEntry(entry);
      expect(formatted).toContain('Test format');
      expect(formatted).toContain('INFO');
    });

    it('should handle doLog with valid entry', async () => {
      const transport = new TestableTransport();
      const entry: LogEntry = {
        id: '135',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test doLog',
        loggerId: 'test-logger',
      };

      await transport.testDoLog(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('Level-specific console methods', () => {
    it('should use appropriate console method for each level', () => {
      const transport = new SyncConsoleTransport();
      
      const levels: Array<[LogEntry['level'], keyof typeof consoleSpy]> = [
        ['info', 'log'],
        ['error', 'error'],
        ['warn', 'warn'],
        ['debug', 'debug'],
        ['success', 'log'],
      ];

      levels.forEach(([level, method]) => {
        jest.clearAllMocks();
        
        const entry: LogEntry = {
          id: `test-${level}`,
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level,
          message: `Test ${level} message`,
          loggerId: 'test-logger',
        };

        transport.log(entry);
        expect(consoleSpy[method]).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '136',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: '',
        loggerId: 'test-logger',
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle undefined context', () => {
      const transport = new SyncConsoleTransport();
      const entry: LogEntry = {
        id: '137',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
        context: undefined,
      };

      transport.log(entry);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle circular reference in context', () => {
      const transport = new SyncConsoleTransport();
      const circular: any = { a: 1 };
      circular.self = circular;
      
      const entry: LogEntry = {
        id: '138',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Circular reference',
        loggerId: 'test-logger',
        context: circular,
      };

      expect(() => transport.log(entry)).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });
});