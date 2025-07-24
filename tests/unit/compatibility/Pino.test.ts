// File: tests/unit/compatibility/Pino.test.ts

import {
  createPinoCompatible,
  PinoCompatibleLogger,
  type PinoCompatibleOptions,
} from '../../../src/compatibility/PinoCompatibleLogger';
import { Logger } from '../../../src/Logger';

/**
 * Comprehensive test suite for Pino compatibility layer.
 * Tests all Pino logger features including:
 * - Constructor and configuration
 * - Log levels (trace, debug, info, warn, error, fatal)
 * - Pino method signatures
 * - Bindings and child loggers
 * - Serializers and redaction
 * - Output formatting
 * - Edge cases
 * 
 * @group compatibility
 * @group pino
 */
describe('PinoCompatibleLogger', () => {
  let pino: PinoCompatibleLogger;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock Logger methods
    logSpy = jest.spyOn(Logger.prototype, 'info').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

    // Create default Pino-compatible logger
    pino = createPinoCompatible();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should create logger with default options', () => {
      expect(pino).toBeInstanceOf(PinoCompatibleLogger);
      expect(pino.level).toBe('info');
      expect(pino.levelVal).toBe(30); // Info level
    });

    it('should accept all Pino options', () => {
      const options: PinoCompatibleOptions = {
        level: 'debug',
        prettyPrint: true,
        timestamp: true,
        messageKey: 'message',
        base: { pid: process.pid, hostname: 'test-host' },
        serializers: {
          err: (err: unknown) => ({ message: (err as Error).message }),
        },
        redact: {
          paths: ['password', 'secret'],
          censor: '[REDACTED]',
        },
        mixin: () => ({ customField: 'value' }),
        formatters: {
          level: (label: string) => ({ level: label }),
          bindings: (bindings: Record<string, unknown>) => ({ ...bindings, custom: true }),
          log: (object: Record<string, unknown>) => ({ ...object, formatted: true }),
        },
        enabled: true,
        onlyMessage: false,
        verbose: true,
        useColors: true,
      };

      const logger = createPinoCompatible(options);

      expect(logger).toBeInstanceOf(PinoCompatibleLogger);
      expect(logger.level).toBe('debug');
      expect(logger['prettyPrint']).toBe(true);
      expect(logger['timestamp']).toBe(true);
      expect(logger['messageKey']).toBe('message');
    });

    it('should handle numeric log levels', () => {
      const levels = [
        { numeric: 10, string: 'trace' },
        { numeric: 20, string: 'debug' },
        { numeric: 30, string: 'info' },
        { numeric: 40, string: 'warn' },
        { numeric: 50, string: 'error' },
        { numeric: 60, string: 'fatal' },
      ];

      levels.forEach(({ numeric, string }) => {
        const logger = createPinoCompatible({ level: numeric });
        expect(logger.level).toBe(string);
        expect(logger.levelVal).toBe(numeric);
      });
    });

    it('should handle invalid numeric levels', () => {
      const logger = createPinoCompatible({ level: 35 }); // Between info and warn
      expect(logger.level).toBe('info'); // Default to info
      expect(logger.levelVal).toBe(30);
    });
  });

  describe('Standard Log Methods', () => {
    it('should support trace level', () => {
      pino.trace('Trace message');
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('TRACE: Trace message'),
        expect.any(Object)
      );
    });

    it('should support debug level', () => {
      pino.debug('Debug message');
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Debug message'),
        expect.any(Object)
      );
    });

    it('should support info level', () => {
      pino.info('Info message');
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Info message'),
        expect.any(Object)
      );
    });

    it('should support warn level', () => {
      pino.warn('Warning message');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning message'),
        expect.any(Object)
      );
    });

    it('should support error level', () => {
      pino.error('Error message');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        expect.any(Object)
      );
    });

    it('should support fatal level', () => {
      pino.fatal('Fatal message');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('FATAL: Fatal message'),
        expect.any(Object)
      );
    });

    it('should support silent level', () => {
      const logger = createPinoCompatible({ level: 'silent' });
      logger.info('Should not be logged');
      
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('Pino Method Signatures', () => {
    it('should handle string message only', () => {
      pino.info('Simple message');
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Simple message'),
        expect.any(Object)
      );
    });

    it('should handle object only', () => {
      pino.info({ user: 'john', action: 'login' });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"user":"john"'),
        expect.any(Object)
      );
    });

    it('should handle object with message', () => {
      pino.info({ user: 'john' }, 'User logged in');
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('User logged in'),
        expect.objectContaining({ user: 'john' })
      );
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at Test.suite';
      
      pino.error(error);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
        expect.objectContaining({
          err: expect.objectContaining({
            type: 'Error',
            message: 'Test error',
            stack: expect.stringContaining('Test error'),
          })
        })
      );
    });

    it('should handle Error with message', () => {
      const error = new Error('Database error');
      pino.error(error, 'Failed to save user');
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save user'),
        expect.objectContaining({
          err: expect.objectContaining({
            message: 'Database error',
          })
        })
      );
    });

    it('should handle Error with object', () => {
      const error = new Error('API error');
      pino.error({ userId: 123, err: error }, 'User operation failed');
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('User operation failed'),
        expect.objectContaining({
          userId: 123,
          err: expect.objectContaining({
            message: 'API error',
          })
        })
      );
    });
  });

  describe('JSON Formatting', () => {
    it('should format as JSON when prettyPrint is false', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        timestamp: true,
      });

      logger.info({ user: 'john' }, 'Test message');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('level', 'info');
      expect(parsed).toHaveProperty('msg', 'Test message');
      expect(parsed).toHaveProperty('user', 'john');
      expect(parsed).toHaveProperty('time');
    });

    it('should use custom message key', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        messageKey: 'message',
      });

      logger.info('Custom key test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('message', 'Custom key test');
      expect(parsed).not.toHaveProperty('msg');
    });

    it('should include base fields', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        base: { pid: 12345, hostname: 'test-host' },
      });

      logger.info('Base fields test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('pid', 12345);
      expect(parsed).toHaveProperty('hostname', 'test-host');
    });
  });

  describe('Bindings and Child Loggers', () => {
    it('should support bindings', () => {
      pino.setBindings({ app: 'myapp', version: '1.0.0' });
      
      expect(pino.bindings()).toEqual({
        app: 'myapp',
        version: '1.0.0',
      });
    });

    it('should create child logger with bindings', () => {
      const child = pino.child({ requestId: '123', userId: 'abc' });
      
      expect(child).toBeInstanceOf(PinoCompatibleLogger);
      expect(child.bindings()).toEqual({
        requestId: '123',
        userId: 'abc',
      });
    });

    it('should merge parent and child bindings', () => {
      pino.setBindings({ app: 'myapp' });
      const child = pino.child({ requestId: '123' });
      
      expect(child.bindings()).toEqual({
        app: 'myapp',
        requestId: '123',
      });
    });

    it('should include bindings in log output', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        base: { app: 'test' },
      });

      const child = logger.child({ requestId: '123' });
      child.info('Child log');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('app', 'test');
      expect(parsed).toHaveProperty('requestId', '123');
    });
  });

  describe('Serializers', () => {
    it('should apply default error serializer', () => {
      const logger = createPinoCompatible({ prettyPrint: false });
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at Test.suite';
      
      logger.error({ err: error }, 'Error occurred');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.err).toEqual({
        type: 'Error',
        message: 'Test error',
        stack: expect.stringContaining('Test error'),
      });
    });

    it('should apply custom serializers', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        serializers: {
          user: (user: unknown) => ({ id: (user as { id?: unknown }).id }),
        },
      });

      // Test through actual logging
      logger.info({ user: { id: 123, password: 'secret' } }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.user).toEqual({ id: 123 });
    });

    it('should preserve non-serialized fields', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        serializers: {
          custom: (val: unknown) => `custom-${val}`,
        },
      });

      logger.info({
        custom: 'value',
        regular: 'unchanged',
      }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.custom).toBe('custom-value');
      expect(parsed.regular).toBe('unchanged');
    });
  });

  describe('Redaction', () => {
    it('should redact specified paths', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        redact: {
          paths: ['password', 'user.password', 'credentials.secret'],
          censor: '[REDACTED]',
        },
      });

      logger.info({
        password: 'secret123',
        user: { name: 'john', password: 'userpass' },
        credentials: { secret: 'api-key' },
        safe: 'visible',
      }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.password).toBe('[REDACTED]');
      expect(parsed.user.password).toBe('[REDACTED]');
      expect(parsed.credentials.secret).toBe('[REDACTED]');
      expect(parsed.safe).toBe('visible');
    });

    it('should handle non-existent paths gracefully', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        redact: {
          paths: ['nonexistent.path'],
          censor: '[REDACTED]',
        },
      });

      logger.info({
        data: 'value',
      }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.data).toBe('value');
    });

    it('should use custom censor function', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        redact: {
          paths: ['secret'],
          censor: (value: unknown) => `***${String(value).slice(-4)}`,
        },
      });

      logger.info({
        secret: 'password1234',
        safe: 'visible',
      }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.secret).toBe('***1234');
    });

    it('should handle array paths', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        redact: {
          paths: ['users[*].password', 'items[*].secret'],
          censor: '[REDACTED]',
        },
      });

      logger.info({
        users: [
          { name: 'john', password: 'pass1' },
          { name: 'jane', password: 'pass2' },
        ],
        items: [
          { id: 1, secret: 'key1' },
          { id: 2, secret: 'key2' },
        ],
      }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.users[0].password).toBe('[REDACTED]');
      expect(parsed.users[1].password).toBe('[REDACTED]');
      expect(parsed.items[0].secret).toBe('[REDACTED]');
      expect(parsed.items[1].secret).toBe('[REDACTED]');
    });

    it('should handle nested wildcard paths', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        redact: {
          paths: ['a.*.b.*.c'],
          censor: 'X',
        },
      });

      logger.info({
        a: {
          x: { b: { y: { c: 'secret1' } } },
          z: { b: { w: { c: 'secret2' } } },
        },
        regular: 'visible',
      }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed.a.x.b.y.c).toBe('X');
      expect(parsed.a.z.b.w.c).toBe('X');
    });
  });

  describe('Mixin Function', () => {
    it('should apply mixin to each log', () => {
      let counter = 0;
      const logger = createPinoCompatible({
        prettyPrint: false,
        mixin: () => ({ requestId: `req-${++counter}` }),
      });

      logger.info('First');
      logger.info('Second');
      
      const firstCall = JSON.parse(logSpy.mock.calls[0][0]);
      const secondCall = JSON.parse(logSpy.mock.calls[1][0]);
      
      expect(firstCall.requestId).toBe('req-1');
      expect(secondCall.requestId).toBe('req-2');
    });

    it('should receive level and bindings in mixin', () => {
      const mixinFn = jest.fn(() => ({ mixed: true }));
      const logger = createPinoCompatible({
        prettyPrint: false,
        mixin: mixinFn,
        base: { app: 'test' },
      });

      logger.info('Test');
      
      expect(mixinFn).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info' }),
        30
      );
    });
  });

  describe('Formatters', () => {
    it('should apply level formatter', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        formatters: {
          level: (_label: string, number: number) => ({ levelValue: number }),
        },
      });

      logger.info('Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('levelValue', 30);
      expect(parsed).not.toHaveProperty('level');
    });

    it('should apply bindings formatter', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        base: { pid: 123 },
        formatters: {
          bindings: (bindings: Record<string, unknown>) => ({
            ...bindings,
            formatted: true,
          }),
        },
      });

      logger.info('Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('pid', 123);
      expect(parsed).toHaveProperty('formatted', true);
    });

    it('should apply log formatter', () => {
      const logger = createPinoCompatible({
        prettyPrint: false,
        formatters: {
          log: (object: Record<string, unknown>) => ({
            ...object,
            transformed: true,
          }),
        },
      });

      logger.info({ custom: 'field' }, 'Test');
      
      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toHaveProperty('custom', 'field');
      expect(parsed).toHaveProperty('transformed', true);
    });
  });

  describe('Output Modes', () => {
    it('should support onlyMessage mode', () => {
      const logger = createPinoCompatible({
        onlyMessage: true,
      });

      logger.info({ extra: 'data' }, 'Only this message');
      
      expect(logSpy).toHaveBeenCalledWith(
        'Only this message',
        expect.any(Object)
      );
    });

    it('should support pretty print mode', () => {
      const logger = createPinoCompatible({
        prettyPrint: true,
        base: { pid: 123 },
      });

      logger.info({ user: 'john' }, 'Pretty message');
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.objectContaining({
          user: 'john',
          pid: 123,
        })
      );
    });

    it('should support disabled logger', () => {
      const logger = createPinoCompatible({
        enabled: false,
      });

      logger.info('Should not log');
      logger.error('Should not log');
      
      expect(logSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Level Management', () => {
    it('should filter logs by level', () => {
      const logger = createPinoCompatible({ level: 'warn' });
      
      logger.trace('Trace - should not log');
      logger.debug('Debug - should not log');
      logger.info('Info - should not log');
      logger.warn('Warn - should log');
      logger.error('Error - should log');
      
      expect(debugSpy).not.toHaveBeenCalled();
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should check if level is enabled', () => {
      const logger = createPinoCompatible({ level: 'info' });
      
      expect(logger.isLevelEnabled('trace')).toBe(false);
      expect(logger.isLevelEnabled('debug')).toBe(false);
      expect(logger.isLevelEnabled('info')).toBe(true);
      expect(logger.isLevelEnabled('warn')).toBe(true);
      expect(logger.isLevelEnabled('error')).toBe(true);
      expect(logger.isLevelEnabled('fatal')).toBe(true);
    });

    it('should expose level values', () => {
      expect(PinoCompatibleLogger.levels).toEqual({
        trace: 10,
        debug: 20,
        info: 30,
        warn: 40,
        error: 50,
        fatal: 60,
        silent: Infinity,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty log calls', () => {
      pino.info('');
      expect(logSpy).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle null and undefined', () => {
      pino.info(null as unknown as string);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('null'),
        expect.any(Object)
      );

      pino.info(undefined as unknown as string);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('undefined'),
        expect.any(Object)
      );
    });

    it('should handle circular references', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      
      pino.info(circular);
      expect(logSpy).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      pino.info(longMessage);
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(longMessage),
        expect.any(Object)
      );
    });

    it('should handle special values', () => {
      pino.info({
        infinity: Infinity,
        negInfinity: -Infinity,
        nan: NaN,
        date: new Date(),
        regex: /test/,
        symbol: Symbol('test'),
      });
      
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('Integration with BaseCompatibleLogger', () => {
    it('should properly extend BaseCompatibleLogger', () => {
      expect(pino).toHaveProperty('setVerbose');
      expect(pino).toHaveProperty('setColors');
      expect(pino).toHaveProperty('addTransport');
      expect(pino).toHaveProperty('removeTransport');
      expect(pino).toHaveProperty('flush');
      expect(pino).toHaveProperty('close');
      expect(pino).toHaveProperty('getLogger');
    });

    it('should use underlying Logger for output', () => {
      pino.info('Test integration');
      expect(logSpy).toHaveBeenCalled();
    });

    it('should inherit configuration methods', () => {
      pino.setVerbose(true);
      expect(pino.isVerbose()).toBe(true);

      pino.setColors(false);
      expect(pino.hasColors()).toBe(false);

      pino.setName('new-name');
      expect(pino.getName()).toBe('new-name');
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency logging', () => {
      const iterations = 1000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        pino.info(`Message ${i}`, { index: i });
      }

      const duration = Date.now() - start;
      
      expect(logSpy).toHaveBeenCalledTimes(iterations);
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });

    it('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        return new Promise<void>(resolve => {
          setImmediate(() => {
            pino.info(`Concurrent ${i}`);
            resolve();
          });
        });
      });

      await Promise.all(promises);
      expect(logSpy).toHaveBeenCalledTimes(100);
    });
  });
});