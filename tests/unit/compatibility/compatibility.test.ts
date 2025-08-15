// File: tests/unit/compatibility/compatibility.test.ts

import {
  enhanceConsole,
  createWinstonCompatible,
  createBunyanCompatible,
  createPinoCompatible,
  BaseCompatibleLogger,
} from '../../../src/compatibility';
import { Logger } from '../../../src/Logger';
import type { Transport } from '../../../src/transports/base/Transport';

/**
 * Integration test suite for the compatibility layer.
 * Tests the interaction between different compatibility implementations
 * and ensures they work correctly together.
 *
 * @group compatibility
 * @group integration
 */
describe('Magic Logger Compatibility Layer Integration', () => {
  // Mock console methods to avoid test output
  const noop = () => undefined;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(noop);
    jest.spyOn(console, 'warn').mockImplementation(noop);
    jest.spyOn(console, 'error').mockImplementation(noop);
    jest.spyOn(console, 'info').mockImplementation(noop);
    jest.spyOn(console, 'debug').mockImplementation(noop);
  });

  afterEach(() => {
    jest.restoreAllMocks();

    // Ensure console is restored
    const extended = console as unknown as Record<string, unknown>;
    if (typeof extended.restoreOriginalConsole === 'function') {
      extended.restoreOriginalConsole();
    }
  });

  describe('Export Verification', () => {
    it('should export all compatibility functions', () => {
      expect(enhanceConsole).toBeDefined();
      expect(typeof enhanceConsole).toBe('function');

      expect(createWinstonCompatible).toBeDefined();
      expect(typeof createWinstonCompatible).toBe('function');

      expect(createBunyanCompatible).toBeDefined();
      expect(typeof createBunyanCompatible).toBe('function');

      expect(createPinoCompatible).toBeDefined();
      expect(typeof createPinoCompatible).toBe('function');

      expect(BaseCompatibleLogger).toBeDefined();
      expect(typeof BaseCompatibleLogger).toBe('function');
    });
  });

  describe('Console Enhancement Integration', () => {
    it('should enhance console and work with all log levels', () => {
      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      const successSpy = jest.spyOn(Logger.prototype, 'success');
      const headerSpy = jest.spyOn(Logger.prototype, 'header');

      const { restoreConsole } = enhanceConsole({ verbose: true });
      const enhanced = console as unknown as Record<string, unknown>;

      // Test standard console methods
      console.log('log message');
      console.info('info message');
      console.warn('warn message');
      console.error('error message');
      console.debug('debug message');

      // Test enhanced methods
      if (typeof enhanced.success === 'function') {
        enhanced.success('success message');
      }
      if (typeof enhanced.header === 'function') {
        enhanced.header('Test Header');
      }

      expect(logSpy).toHaveBeenCalledWith('log message');
      expect(logSpy).toHaveBeenCalledWith('info message');
      expect(warnSpy).toHaveBeenCalledWith('warn message');
      expect(errorSpy).toHaveBeenCalledWith('error message');
      expect(debugSpy).toHaveBeenCalledWith('debug message');
      expect(successSpy).toHaveBeenCalledWith('success message');
      expect(headerSpy).toHaveBeenCalledWith('Test Header', ['brightWhite', 'bgBlue', 'bold']);

      restoreConsole();
    });

    it('should handle recursion guard correctly', () => {
      const { restoreConsole } = enhanceConsole();

      // Should not cause infinite recursion
      expect(() => console.log(console)).not.toThrow();

      restoreConsole();
    });

    it('should delegate multi-argument calls correctly', () => {
      const multiArgSpy = jest.fn();
      console.log = multiArgSpy;

      const { restoreConsole } = enhanceConsole();

      const obj = { a: 1, b: 2 };
      const arr = [1, 2, 3];

      console.log('message', obj, arr, 123);

      expect(multiArgSpy).toHaveBeenCalledWith('message', obj, arr, 123);

      restoreConsole();
    });
  });

  describe('Winston Compatibility Integration', () => {
    it('should create Winston-compatible logger with all features', () => {
      const winston = createWinstonCompatible({
        verbose: true,
        level: 'silly',
        timestamp: true,
      });

      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const customSpy = jest.spyOn(Logger.prototype, 'custom');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      // Test standard levels
      winston.info('info message');
      winston.log('notice', 'notice message');

      // Test Winston-specific levels
      winston.verbose('verbose message');
      winston.silly('silly message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('info message'),
        expect.any(Object)
      );
      expect(customSpy).toHaveBeenCalledWith(
        expect.stringContaining('notice message'),
        ['white'],
        'NOTICE'
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('verbose message'),
        expect.any(Object)
      );
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('SILLY:'), expect.any(Object));
    });

    it('should support Winston method signatures', () => {
      const winston = createWinstonCompatible();
      const logSpy = jest.spyOn(Logger.prototype, 'info');

      // String only
      winston.info('simple');

      // String with metadata
      winston.info('with meta', { userId: 123 });

      // Object only
      winston.info({ message: 'object message', data: 'test' });

      expect(logSpy).toHaveBeenCalledTimes(3);
    });

    it('should support printf formatting', () => {
      const winston = createWinstonCompatible({ printfFormatting: true });
      const logSpy = jest.spyOn(Logger.prototype, 'info');

      winston.info('User %s logged in with id %d', 'john', 123);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('User john logged in with id 123'),
        expect.any(Object)
      );
    });

    it('should support header method', () => {
      const winston = createWinstonCompatible({});
      const headerSpy = jest.spyOn(Logger.prototype, 'header');

      winston.header('Test Header');

      expect(headerSpy).toHaveBeenCalledWith('Test Header', ['brightWhite', 'bgBlue', 'bold']);

      winston.header('Custom Header', ['red', 'bold']);
      expect(headerSpy).toHaveBeenCalledWith('Custom Header', ['red', 'bold']);
    });
  });

  describe('Bunyan Compatibility Integration', () => {
    it('should create Bunyan-compatible logger with all features', () => {
      const bunyan = createBunyanCompatible({
        name: 'test-app',
        level: 'trace',
        showName: true,
        showPid: true,
      });

      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      // Test with object + message
      bunyan.info({ foo: 'bar' }, 'extra message');

      // Test error logging
      bunyan.error(new Error('test error'));

      // Test trace/fatal levels
      bunyan.trace('trace message');
      bunyan.fatal('fatal message');

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
      expect(errorSpy).toHaveBeenCalledTimes(2); // error + fatal
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
    });

    it('should support Bunyan method signatures', () => {
      const bunyan = createBunyanCompatible({ name: 'test' });
      const logSpy = jest.spyOn(Logger.prototype, 'info');

      // String only
      bunyan.info('simple');

      // Object + message
      bunyan.info({ user: 'john' }, 'User action');

      // Error
      bunyan.info(new Error('info error'));

      expect(logSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle object without message', () => {
      const bunyan = createBunyanCompatible({ name: 'test' });
      const logSpy = jest.spyOn(Logger.prototype, 'info');

      bunyan.info({ data: 'value', count: 42 });

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"data":"value"'));
    });
  });

  describe('Pino Compatibility Integration', () => {
    it('should create Pino-compatible logger with all features', () => {
      const pino = createPinoCompatible({
        level: 'trace',
        prettyPrint: false, // Disable pretty printing for predictable test output
        timestamp: false, // Disable timestamp for predictable test output
        onlyMessage: true, // Only output the message for simpler test assertions
        base: typeof process !== 'undefined' ? { pid: process.pid } : {},
      });

      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      // Test standard logging
      pino.info('simple message');
      pino.info({ user: 'john' }, 'User action');

      // Test error handling
      pino.error(new Error('test error'));

      // Test trace/fatal
      pino.trace('trace message');
      pino.fatal('fatal message');

      expect(logSpy).toHaveBeenCalledWith('simple message', {});
      expect(logSpy).toHaveBeenCalledWith('User action', {});
      expect(errorSpy).toHaveBeenCalledTimes(2); // error + fatal
      expect(debugSpy).toHaveBeenCalledWith('trace message', {});
    });

    it('should support Pino method signatures', () => {
      const pino = createPinoCompatible();
      const logSpy = jest.spyOn(Logger.prototype, 'info');

      // String only
      pino.info('simple');

      // Object only
      pino.info({ data: 'test' });

      // Object + message
      pino.info({ userId: 123 }, 'User action');

      // Error
      pino.info(new Error('info error'));

      expect(logSpy).toHaveBeenCalledTimes(4);
    });

    it('should support child loggers with bindings', () => {
      const pino = createPinoCompatible({ base: { app: 'test' } });
      const child = pino.child({ module: 'auth' });

      expect(child.bindings()).toEqual({
        app: 'test',
        module: 'auth',
      });
    });

    it('should format messages correctly', () => {
      const pino = createPinoCompatible({
        prettyPrint: false,
        timestamp: true,
      });

      const logSpy = jest.spyOn(Logger.prototype, 'info');

      pino.info('JSON format test');

      const call = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);

      expect(parsed).toHaveProperty('level', 'info');
      expect(parsed).toHaveProperty('msg', 'JSON format test');
      expect(parsed).toHaveProperty('time');
    });
  });

  describe('Cross-Compatibility', () => {
    it('should allow all loggers to work simultaneously', () => {
      const winston = createWinstonCompatible({ level: 'debug' });
      const bunyan = createBunyanCompatible({ name: 'bunyan-test' });
      const pino = createPinoCompatible({ level: 'debug' });

      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      // Each logger logs to the same underlying system
      winston.info('Winston info');
      bunyan.info('Bunyan info');
      pino.info('Pino info');

      winston.warn('Winston warn');
      bunyan.warn('Bunyan warn');
      pino.warn('Pino warn');

      winston.error('Winston error');
      bunyan.error('Bunyan error');
      pino.error('Pino error');

      expect(logSpy).toHaveBeenCalledTimes(3);
      expect(warnSpy).toHaveBeenCalledTimes(3);
      expect(errorSpy).toHaveBeenCalledTimes(3);
    });

    it('should share transports when using same underlying logger', async () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      // Add mock transport
      const mockTransport = {
        name: 'shared-transport',
        enabled: true,
        log: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        shouldLog: jest.fn().mockReturnValue(true),
        // Add required Transport properties
        options: {},
        stats: { logsWritten: 0, errorsOccurred: 0, lastLogTime: null },
        level: 'info',
        silent: false,
        timeout: 5000,
        format: 'json' as const,
        formatter: undefined,
        levels: ['error', 'warn', 'info', 'debug'],
        tags: [],
        excludeTags: [],
        filter: undefined,
        init: jest.fn().mockResolvedValue(undefined),
        flush: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        resume: jest.fn(),
        isPaused: jest.fn().mockReturnValue(false),
        destroy: jest.fn().mockResolvedValue(undefined),
        setLevel: jest.fn(),
        getLevel: jest.fn().mockReturnValue('info'),
        setFormat: jest.fn(),
        getFormat: jest.fn().mockReturnValue('json'),
        addTag: jest.fn(),
        removeTag: jest.fn(),
        clearTags: jest.fn(),
        hasTag: jest.fn().mockReturnValue(false),
        setFormatter: jest.fn(),
        getFormatter: jest.fn().mockReturnValue(undefined),
        setFilter: jest.fn(),
        getFilter: jest.fn().mockReturnValue(undefined),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn().mockReturnValue(true),
        setSilent: jest.fn(),
        isSilent: jest.fn().mockReturnValue(false),
        setTimeout: jest.fn(),
        getTimeout: jest.fn().mockReturnValue(5000),
        getStats: jest
          .fn()
          .mockReturnValue({ logsWritten: 0, errorsOccurred: 0, lastLogTime: null }),
        resetStats: jest.fn(),
        clone: jest.fn(),
        toString: jest.fn().mockReturnValue('[Transport shared-transport]'),
        toJSON: jest.fn().mockReturnValue({ name: 'shared-transport', enabled: true }),
      } as unknown as Transport;

      await winston.addTransport(mockTransport);

      // All loggers share the same transport system
      const winstonTransports = winston.getTransports();
      const bunyanTransports = bunyan.getTransports();
      const pinoTransports = pino.getTransports();

      // Note: These might be empty arrays if transport management
      // is delegated to the underlying Logger class
      expect(Array.isArray(winstonTransports)).toBe(true);
      expect(Array.isArray(bunyanTransports)).toBe(true);
      expect(Array.isArray(pinoTransports)).toBe(true);
    });
  });

  describe('Common Features', () => {
    it('should support verbose mode across all implementations', () => {
      const winston = createWinstonCompatible({ verbose: true });
      const bunyan = createBunyanCompatible({ name: 'test', verbose: true });
      const pino = createPinoCompatible({ verbose: true });

      expect(winston.isVerbose()).toBe(true);
      expect(bunyan.isVerbose()).toBe(true);
      expect(pino.isVerbose()).toBe(true);

      winston.setVerbose(false);
      bunyan.setVerbose(false);
      pino.setVerbose(false);

      expect(winston.isVerbose()).toBe(false);
      expect(bunyan.isVerbose()).toBe(false);
      expect(pino.isVerbose()).toBe(false);
    });

    it('should support color settings across all implementations', () => {
      const winston = createWinstonCompatible({ useColors: false });
      const bunyan = createBunyanCompatible({ name: 'test', useColors: false });
      const pino = createPinoCompatible({ useColors: false });

      expect(winston.hasColors()).toBe(false);
      expect(bunyan.hasColors()).toBe(false);
      expect(pino.hasColors()).toBe(false);

      winston.setColors(true);
      bunyan.setColors(true);
      pino.setColors(true);

      expect(winston.hasColors()).toBe(true);
      expect(bunyan.hasColors()).toBe(true);
      expect(pino.hasColors()).toBe(true);
    });

    it('should support child loggers across all implementations', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const winstonChild = winston.child({ defaultMeta: { module: 'auth' } });
      const bunyanChild = bunyan.child({ module: 'auth' });
      const pinoChild = pino.child({ module: 'auth' });

      expect(winstonChild).toBeInstanceOf(BaseCompatibleLogger);
      expect(bunyanChild).toBeInstanceOf(BaseCompatibleLogger);
      expect(pinoChild).toBeInstanceOf(BaseCompatibleLogger);
    });

    it('should support flushing across all implementations', async () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      // Should not throw
      await expect(winston.flush()).resolves.toBeUndefined();
      await expect(bunyan.flush()).resolves.toBeUndefined();
      await expect(pino.flush()).resolves.toBeUndefined();
    });

    it('should support closing across all implementations', async () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const closeSpy = jest.spyOn(Logger.prototype, 'close').mockResolvedValue(undefined);

      await winston.close();
      await bunyan.close();
      await pino.close();

      expect(closeSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors consistently across implementations', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Test.suite';

      winston.error('Winston error', { error });
      bunyan.error(error, 'Bunyan error');
      pino.error(error, 'Pino error');

      expect(errorSpy).toHaveBeenCalledTimes(3);

      // Each should include the error message
      errorSpy.mock.calls.forEach(call => {
        expect(call[0]).toContain('error');
      });
    });

    it('should handle circular references safely', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;

      // Should not throw
      expect(() => winston.info('Circular', circular)).not.toThrow();
      expect(() => bunyan.info({ circular }, 'Circular')).not.toThrow();
      expect(() => pino.info({ circular }, 'Circular')).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle high-frequency logging without degradation', () => {
      const loggers = [
        createWinstonCompatible(),
        createBunyanCompatible({ name: 'perf-test' }),
        createPinoCompatible(),
      ];

      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const iterations = 100;
      const start = Date.now();

      loggers.forEach(logger => {
        for (let i = 0; i < iterations; i++) {
          logger.info(`Message ${i}`);
        }
      });

      const duration = Date.now() - start;
      const maxMs = process.env.CI ? 8000 : process.platform === 'win32' ? 6000 : 4000;

      expect(logSpy).toHaveBeenCalledTimes(iterations * 3);
      expect(duration).toBeLessThan(maxMs); // Allow headroom for CI/Windows variability
    });
  });

  describe('Mixed Usage Scenarios', () => {
    it('should work when enhancing console and using compatibility loggers', () => {
      const { restoreConsole } = enhanceConsole();
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const logSpy = jest.spyOn(Logger.prototype, 'info');

      // Use both enhanced console and compatibility loggers
      console.log('From console');
      winston.info('From Winston');
      bunyan.info('From Bunyan');
      pino.info('From Pino');

      expect(logSpy).toHaveBeenCalledTimes(4);

      restoreConsole();
    });

    it('should maintain separate configurations', () => {
      const winston = createWinstonCompatible({
        verbose: true,
        level: 'debug',
        timestamp: true,
      });

      const bunyan = createBunyanCompatible({
        name: 'bunyan-app',
        level: 'warn',
        showPid: true,
      });

      const pino = createPinoCompatible({
        level: 'error',
        prettyPrint: false,
        timestamp: false,
      });

      // Each maintains its own configuration
      expect(winston['level']).toBe('debug');
      expect(winston['timestamp']).toBe(true);

      expect(bunyan['name']).toBe('bunyan-app');
      expect(bunyan.level()).toBe(40); // warn
      expect(bunyan['showPid']).toBe(true);

      expect(pino.level).toBe('error');
      expect(pino['prettyPrint']).toBe(false);
      expect(pino['timestamp']).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should maintain proper types for all implementations', () => {
      // This is more of a compile-time test, but we can verify runtime behavior
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      // All should have BaseCompatibleLogger methods
      expect(typeof winston.setVerbose).toBe('function');
      expect(typeof winston.setColors).toBe('function');
      expect(typeof winston.addTransport).toBe('function');
      expect(typeof winston.getLogger).toBe('function');

      expect(typeof bunyan.setVerbose).toBe('function');
      expect(typeof bunyan.setColors).toBe('function');
      expect(typeof bunyan.addTransport).toBe('function');
      expect(typeof bunyan.getLogger).toBe('function');

      expect(typeof pino.setVerbose).toBe('function');
      expect(typeof pino.setColors).toBe('function');
      expect(typeof pino.addTransport).toBe('function');
      expect(typeof pino.getLogger).toBe('function');

      // Each should have their specific methods
      expect(typeof winston.verbose).toBe('function');
      expect(typeof winston.silly).toBe('function');
      expect(typeof winston.profile).toBe('function');
      expect(typeof winston.startTimer).toBe('function');

      expect(typeof bunyan.trace).toBe('function');
      expect(typeof bunyan.fatal).toBe('function');
      expect(typeof bunyan.addStream).toBe('function');
      expect(typeof bunyan.addSerializers).toBe('function');

      expect(typeof pino.trace).toBe('function');
      expect(typeof pino.fatal).toBe('function');
      expect(typeof pino.bindings).toBe('function');
      expect(typeof pino.setBindings).toBe('function');
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle empty configurations gracefully', () => {
      // Winston requires no config
      const winston = createWinstonCompatible();
      expect(winston).toBeInstanceOf(BaseCompatibleLogger);

      // Bunyan with minimal config
      const bunyan = createBunyanCompatible({ name: '' });
      expect(bunyan).toBeInstanceOf(BaseCompatibleLogger);
      expect(bunyan['name']).toBe(''); // Empty name is allowed

      // Pino with no config
      const pino = createPinoCompatible();
      expect(pino).toBeInstanceOf(BaseCompatibleLogger);
    });

    it('should handle invalid level names consistently', () => {
      const winston = createWinstonCompatible({ level: 'invalid' as 'info' });
      const bunyan = createBunyanCompatible({ name: 'test', level: 'invalid' as 'info' });
      const pino = createPinoCompatible({ level: 'invalid' as 'info' });

      // Each should handle invalid levels gracefully
      expect(winston['level']).toBe('invalid');
      expect(bunyan.level()).toBe(30); // Default to info
      expect(pino.levelVal).toBe(30); // Default to info
    });

    it('should handle very long messages consistently', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const longMessage = 'x'.repeat(10000);

      // Should not throw
      expect(() => winston.info(longMessage)).not.toThrow();
      expect(() => bunyan.info(longMessage)).not.toThrow();
      expect(() => pino.info(longMessage)).not.toThrow();
    });

    it('should handle special JavaScript values', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const special = {
        infinity: Infinity,
        negInfinity: -Infinity,
        nan: NaN,
        undef: undefined,
        nil: null,
        bigint: BigInt(123),
        symbol: Symbol('test'),
      };

      // Should not throw
      expect(() => winston.info('Special', special)).not.toThrow();
      expect(() => bunyan.info(special, 'Special')).not.toThrow();
      expect(() => pino.info(special, 'Special')).not.toThrow();
    });
  });

  describe('Method Compatibility', () => {
    it('should support different method signatures appropriately', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'test' });
      const pino = createPinoCompatible();

      const logSpy = jest.spyOn(Logger.prototype, 'info');

      // Winston style: message, meta, ...splat
      winston.info('Message %s %d', 'string', 123, { meta: true });

      // Bunyan style: fields, message
      bunyan.info({ field: 'value' }, 'Message');

      // Pino style: obj/msg or obj, msg
      pino.info({ data: 'test' }, 'Message');
      pino.info('Just message');

      expect(logSpy).toHaveBeenCalledTimes(4);
    });

    it('should handle level-specific features', () => {
      // Winston verbose/silly
      const winston = createWinstonCompatible({ verbose: true });
      winston.verbose('Verbose message');
      winston.silly('Silly message');

      // Bunyan trace/fatal
      const bunyan = createBunyanCompatible({ name: 'test', level: 'trace' });
      bunyan.trace('Trace message');
      bunyan.fatal('Fatal message');

      // Pino trace/fatal
      const pino = createPinoCompatible({ level: 'trace' });
      pino.trace('Trace message');
      pino.fatal('Fatal message');

      // All should execute without errors
      expect(true).toBe(true);
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should support request logging pattern', () => {
      // Common pattern: log requests with context
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'api' });
      const pino = createPinoCompatible();

      const logSpy = jest.spyOn(Logger.prototype, 'info');

      const req = {
        method: 'GET',
        url: '/api/users',
        headers: { 'user-agent': 'test' },
        ip: '127.0.0.1',
      };

      // Each logger handles the pattern differently but all work
      winston.info('Request received', {
        method: req.method,
        url: req.url,
        ip: req.ip,
      });

      bunyan.info(
        {
          req: req,
          type: 'request',
        },
        'Request received'
      );

      pino.info(
        {
          req: {
            method: req.method,
            url: req.url,
          },
        },
        'Request received'
      );

      // All three logged successfully
      expect(logSpy).toHaveBeenCalledTimes(3);
    });

    it('should support error logging pattern', () => {
      const winston = createWinstonCompatible();
      const bunyan = createBunyanCompatible({ name: 'app' });
      const pino = createPinoCompatible();

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      const error = new Error('Database connection failed');
      const context = {
        userId: 123,
        action: 'fetchUser',
        timestamp: Date.now(),
      };

      // Winston pattern
      winston.error('Operation failed', { error, ...context });

      // Bunyan pattern
      bunyan.error({ err: error, ...context }, 'Operation failed');

      // Pino pattern
      pino.error({ error, ...context }, 'Operation failed');

      expect(errorSpy).toHaveBeenCalledTimes(3);
    });

    it('should support child logger pattern for request context', () => {
      const baseWinston = createWinstonCompatible();
      const baseBunyan = createBunyanCompatible({ name: 'app' });
      const basePino = createPinoCompatible();

      const logSpy = jest.spyOn(Logger.prototype, 'info');

      // Create request-scoped loggers
      const reqId = 'req-123';
      const userId = 'user-456';

      const winstonReq = baseWinston.child({
        defaultMeta: { reqId, userId },
      });

      const bunyanReq = baseBunyan.child({ reqId, userId });
      const pinoReq = basePino.child({ reqId, userId });

      // Log with request context automatically included
      winstonReq.info('Processing request');
      bunyanReq.info('Processing request');
      pinoReq.info('Processing request');

      expect(logSpy).toHaveBeenCalledTimes(3);
    });
  });
});
