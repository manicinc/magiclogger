// File: tests/unit/compatibility/Winston.test.ts

import {
  createWinstonCompatible,
  WinstonCompatibleLogger,
} from '../../../src/compatibility/Winston';
import { Logger } from '../../../src/Logger';
import type { Transport } from '../../../src/transports/base/Transport';

/**
 * Comprehensive test suite for WinstonCompatibleLogger.
 * Tests Winston API compatibility including:
 * - Winston method signatures (message, message + meta, splat args)
 * - Metadata and splat support
 * - Winston-style formatting and printf
 * - Exception and rejection handling
 * - Query interface
 * - Child loggers
 * - Profile and timer methods
 * - Transport compatibility methods
 * 
 * @group compatibility
 * @group winston
 */
describe('WinstonCompatibleLogger', () => {
  let winston: WinstonCompatibleLogger;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let customSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Spy on underlying Logger methods
    infoSpy = jest.spyOn(Logger.prototype, 'info').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    customSpy = jest.spyOn(Logger.prototype, 'custom').mockImplementation(() => undefined);

    // Create default test logger
    winston = createWinstonCompatible({
      level: 'info',
      timestamp: true,
      timestampFormat: 'ISO',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should create logger with default options', () => {
      const logger = createWinstonCompatible();
      
      expect(logger).toBeInstanceOf(WinstonCompatibleLogger);
      expect(logger['level']).toBe('info');
      expect(logger['timestamp']).toBe(false);
      expect(logger['timestampFormat']).toBe('HH:mm:ss');
      expect(logger['printfFormatting']).toBe(true);
      expect(logger['handleExceptions']).toBe(false);
      expect(logger['handleRejections']).toBe(false);
      expect(logger['exitOnError']).toBe(true);
    });

    it('should initialize with all configuration options', () => {
      const format = jest.fn((info) => JSON.stringify(info));
      
      const logger = createWinstonCompatible({
        level: 'debug',
        timestamp: true,
        timestampFormat: 'epoch',
        defaultTags: ['app', 'v1'],
        defaultContext: { service: 'api' },
        printfFormatting: false,
        handleExceptions: true,
        handleRejections: true,
        format,
        exitOnError: false,
      });

      expect(logger['level']).toBe('debug');
      expect(logger['timestamp']).toBe(true);
      expect(logger['timestampFormat']).toBe('epoch');
      expect(logger['defaultTags']).toEqual(['app', 'v1']);
      expect(logger['defaultContext']).toEqual({ service: 'api' });
      expect(logger['printfFormatting']).toBe(false);
      expect(logger['handleExceptions']).toBe(true);
      expect(logger['handleRejections']).toBe(true);
      expect(logger['formatFn']).toBe(format);
      expect(logger['exitOnError']).toBe(false);
    });

    it('should configure exception handling', () => {
      const processOnSpy = jest.spyOn(process, 'on');
      
      createWinstonCompatible({
        handleExceptions: true,
        handleRejections: true,
      });

      expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });

    it('should not set up handlers when disabled', () => {
      const processOnSpy = jest.spyOn(process, 'on');
      
      createWinstonCompatible({
        handleExceptions: false,
        handleRejections: false,
      });

      expect(processOnSpy).not.toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(processOnSpy).not.toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });
  });

  describe('Timestamp Formatting', () => {
    it('should format ISO timestamps', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const logger = createWinstonCompatible({
        timestamp: true,
        timestampFormat: 'ISO',
      });

      logger.info('Test');
      
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[2023-01-01T12:00:00.000Z]')
      );
    });

    it('should format epoch timestamps', () => {
      const mockTime = 1672574400000;
      const mockDate = new Date(mockTime);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const logger = createWinstonCompatible({
        timestamp: true,
        timestampFormat: 'epoch',
      });

      logger.info('Test');
      
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[${mockTime}]`)
      );
    });

    it('should format HH:mm:ss timestamps', () => {
      const mockDate = new Date('2023-01-01T15:30:45.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);
      mockDate.getHours = () => 15;
      mockDate.getMinutes = () => 30;
      mockDate.getSeconds = () => 45;

      const logger = createWinstonCompatible({
        timestamp: true,
        timestampFormat: 'HH:mm:ss',
      });

      logger.info('Test');
      
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[15:30:45]')
      );
    });

    it('should handle single digit time values', () => {
      const mockDate = new Date('2023-01-01T05:05:05.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);
      mockDate.getHours = () => 5;
      mockDate.getMinutes = () => 5;
      mockDate.getSeconds = () => 5;

      const logger = createWinstonCompatible({
        timestamp: true,
        timestampFormat: 'HH:mm:ss',
      });

      logger.info('Test');
      
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[05:05:05]')
      );
    });

    it('should not include timestamp when disabled', () => {
      const logger = createWinstonCompatible({
        timestamp: false,
      });

      logger.info('No timestamp');
      
      const call = infoSpy.mock.calls[0][0];
      expect(call).not.toMatch(/\[\d/); // No bracket-enclosed numbers
      expect(call).toBe('No timestamp');
    });
  });

  describe('Logging Methods', () => {
    describe('Standard methods', () => {
      it('should log info messages', () => {
        winston.info('Info message');
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Info message'),
          expect.any(Object)
        );
      });

      it('should log warning messages', () => {
        winston.warn('Warning message');
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Warning message'),
          expect.any(Object)
        );
      });

      it('should log error messages', () => {
        winston.error('Error message');
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error message'),
          expect.any(Object)
        );
      });

      it('should log debug messages', () => {
        winston.debug('Debug message');
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('Debug message'),
          expect.any(Object)
        );
      });
    });

    describe('Winston-specific methods', () => {
      it('should log verbose messages when verbose is true', () => {
        const logger = createWinstonCompatible({ verbose: true });
        
        logger.verbose('Verbose message');
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('Verbose message'),
          expect.any(Object)
        );
      });

      it('should not log verbose messages when verbose is false', () => {
        const logger = createWinstonCompatible({ verbose: false });
        
        logger.verbose('Should not log');
        expect(debugSpy).not.toHaveBeenCalled();
      });

      it('should log silly messages', () => {
        winston.silly('Silly message');
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('SILLY: Silly message'),
          expect.any(Object)
        );
      });
    });

    describe('Method signatures', () => {
      it('should handle string-only logging', () => {
        winston.info('Simple message');
        
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Simple message'),
          expect.objectContaining({})
        );
      });

      it('should handle string with metadata', () => {
        const meta = { userId: 123, action: 'login' };
        winston.info('User action', meta);
        
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('User action'),
          expect.objectContaining(meta)
        );
      });

      it('should handle string with splat arguments', () => {
        winston.info('User %s performed %s', 'john', 'login', { extra: 'data' });
        
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('User john performed login'),
          expect.objectContaining({ extra: 'data' })
        );
      });

      it('should handle object-only logging', () => {
        const obj = { message: 'Object message', level: 'info', data: 'test' };
        winston.info(obj);
        
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Object message'),
          expect.objectContaining({ level: 'info', data: 'test' })
        );
      });

      it('should handle metadata with splat', () => {
        const meta = { userId: 123 };
        winston.info('Multiple: %s, %d', 'string', 42, meta);
        
        expect(infoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Multiple: string, 42'),
          expect.objectContaining({ userId: 123 })
        );
      });
    });
  });

  describe('Printf Formatting', () => {
    it('should support %s string substitution', () => {
      winston.info('Hello %s', 'world');
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Hello world'),
        expect.any(Object)
      );
    });

    it('should support %d number substitution', () => {
      winston.info('Count: %d', 42);
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Count: 42'),
        expect.any(Object)
      );
    });

    it('should support %j JSON substitution', () => {
      winston.info('Data: %j', { a: 1, b: 2 });
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Data: {"a":1,"b":2}'),
        expect.any(Object)
      );
    });

    it('should support %% literal percent', () => {
      winston.info('Progress: 100%%');
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Progress: 100%'),
        expect.any(Object)
      );
    });

    it('should handle multiple substitutions', () => {
      winston.info('%s: %d%% complete (%j)', 'Task', 75, { eta: '5m' });
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task: 75% complete ({"eta":"5m"})'),
        expect.any(Object)
      );
    });

    it('should handle missing arguments', () => {
      winston.info('Missing: %s %d %j', 'only one');
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing: only one %d %j'),
        expect.any(Object)
      );
    });

    it('should handle circular references in %j', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      
      winston.info('Circular: %j', circular);
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Circular]'),
        expect.any(Object)
      );
    });

    it('should disable printf when printfFormatting is false', () => {
      const logger = createWinstonCompatible({ printfFormatting: false });
      
      logger.info('No formatting: %s', 'test');
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('No formatting: %s'),
        expect.objectContaining({ splat: ['test'] })
      );
    });
  });

  describe('Error Handling', () => {
    it('should serialize Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Test.suite';
      
      winston.error('Error occurred', { error });
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred'),
        expect.objectContaining({
          error: expect.objectContaining({
            errorName: 'Error',
            errorMessage: 'Test error',
            errorStack: error.stack,
          })
        })
      );
    });

    it('should handle errors with additional properties', () => {
      const error = new Error('Custom error') as Error & { code?: string; statusCode?: number };
      error.code = 'ERR_CUSTOM';
      error.statusCode = 500;
      
      winston.error('Custom error', { error });
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'ERR_CUSTOM',
            statusCode: 500,
          })
        })
      );
    });

    it('should handle exception events when enabled', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      const logger = createWinstonCompatible({
        handleExceptions: true,
        exitOnError: true,
      });

      expect(logger).toBeDefined(); // Ensure logger is created

      // Simulate uncaught exception
      const error = new Error('Uncaught');
      process.emit('uncaughtException', error);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Uncaught Exception'),
        expect.any(Object)
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      
      exitSpy.mockRestore();
    });

    it('should handle rejection events when enabled', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      const logger = createWinstonCompatible({
        handleRejections: true,
        exitOnError: true,
      });

      expect(logger).toBeDefined(); // Ensure logger is created

      // Simulate unhandled rejection
      const reason = new Error('Rejected');
      const promise = Promise.reject(reason);
      process.emit('unhandledRejection', reason, promise);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unhandled Rejection'),
        expect.any(Object)
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      
      exitSpy.mockRestore();
    });

    it('should not exit when exitOnError is false', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      const logger = createWinstonCompatible({
        handleExceptions: true,
        exitOnError: false,
      });

      expect(logger).toBeDefined(); // Ensure logger is created

      const error = new Error('Non-fatal');
      process.emit('uncaughtException', error);

      expect(errorSpy).toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalled();
      
      exitSpy.mockRestore();
    });
  });

  describe('Generic log() method', () => {
    it('should handle standard levels', () => {
      winston.log('info', 'Info via log');
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Info via log'),
        expect.any(Object)
      );

      winston.log('warn', 'Warn via log');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warn via log'),
        expect.any(Object)
      );

      winston.log('error', 'Error via log');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error via log'),
        expect.any(Object)
      );
    });

    it('should normalize level aliases', () => {
      winston.log('warning', 'Warning message');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning message'),
        expect.any(Object)
      );
    });

    it('should route verbose and silly through log()', () => {
      const logger = createWinstonCompatible({ verbose: true });
      
      logger.log('verbose', 'Verbose via log');
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Verbose via log'),
        expect.any(Object)
      );

      logger.log('silly', 'Silly via log');
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('SILLY: Silly via log'),
        expect.any(Object)
      );
    });

    it('should handle custom levels when strictLevels is false', () => {
      winston.log('custom', 'Custom level');
      expect(customSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom level'),
        ['white'],
        'CUSTOM'
      );
    });

    it('should throw for unknown levels when strictLevels is true', () => {
      const logger = createWinstonCompatible({ strictLevels: true });
      
      expect(() => logger.log('unknown', 'Message')).toThrow(
        'Unknown log level: unknown'
      );
    });

    it('should apply custom format function', () => {
      const format = jest.fn((info) => `FORMATTED: ${info.message}`);
      const logger = createWinstonCompatible({ format });

      logger.log('info', 'Test message', { extra: 'data' });

      expect(format).toHaveBeenCalledWith({
        level: 'info',
        message: expect.stringContaining('Test message'),
        timestamp: expect.any(String),
        extra: 'data',
      });
      
      expect(infoSpy).toHaveBeenCalledWith(
        'FORMATTED: Test message',
        expect.any(Object)
      );
    });
  });

  describe('Metadata Enhancement', () => {
    it('should merge default tags and context', () => {
      const logger = createWinstonCompatible({
        defaultTags: ['app', 'v1'],
        defaultContext: { service: 'api', env: 'prod' },
      });

      logger.info('Test', {
        tags: ['request'],
        userId: 123,
      });

      expect(infoSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tags: ['app', 'v1', 'request'],
          service: 'api',
          env: 'prod',
          userId: 123,
        })
      );
    });

    it('should handle empty metadata', () => {
      winston.info('No metadata');
      
      expect(infoSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({})
      );
    });

    it('should preserve existing metadata properties', () => {
      const logger = createWinstonCompatible({
        defaultContext: { version: '1.0' },
      });

      logger.info('Test', {
        version: '2.0', // Override default
        custom: 'value',
      });

      expect(infoSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          version: '2.0',
          custom: 'value',
        })
      );
    });
  });

  describe('Child Loggers', () => {
    it('should create child with additional options', () => {
      const child = winston.child({
        defaultTags: ['child'],
        defaultContext: { childId: 123 },
      });

      expect(child).toBeInstanceOf(WinstonCompatibleLogger);
      expect(child['defaultTags']).toEqual(['child']);
      expect(child['defaultContext']).toEqual({ childId: 123 });
    });

    it('should merge parent and child tags', () => {
      const parent = createWinstonCompatible({
        defaultTags: ['parent'],
      });

      const child = parent.child({
        defaultTags: ['child'],
      });

      expect(child['defaultTags']).toEqual(['parent', 'child']);
    });

    it('should merge parent and child context', () => {
      const parent = createWinstonCompatible({
        defaultContext: { parentId: 1 },
      });

      const child = parent.child({
        defaultContext: { childId: 2 },
      });

      expect(child['defaultContext']).toEqual({
        parentId: 1,
        childId: 2,
      });
    });

    it('should inherit parent configuration', () => {
      const formatter = jest.fn();
      const parent = createWinstonCompatible({
        level: 'debug',
        timestamp: true,
        timestampFormat: 'epoch',
        format: formatter,
      });

      const child = parent.child({});

      expect(child['level']).toBe('debug');
      expect(child['timestamp']).toBe(true);
      expect(child['timestampFormat']).toBe('epoch');
      expect(child['formatFn']).toBe(formatter);
    });

    it('should allow child to override parent settings', () => {
      const parent = createWinstonCompatible({
        level: 'info',
        timestamp: true,
      });

      const child = parent.child({
        level: 'debug',
        timestamp: false,
      });

      expect(child['level']).toBe('debug');
      expect(child['timestamp']).toBe(false);
    });
  });

  describe('Transport Compatibility Methods', () => {
    // Mock transport that satisfies Transport interface
    const mockTransport = {
      name: 'test-transport',
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
      getStats: jest.fn().mockReturnValue({ logsWritten: 0, errorsOccurred: 0, lastLogTime: null }),
      resetStats: jest.fn(),
      clone: jest.fn(),
      toString: jest.fn().mockReturnValue('[Transport test-transport]'),
      toJSON: jest.fn().mockReturnValue({ name: 'test-transport', enabled: true }),
      // Additional properties that may be required
      initialized: false,
      closing: false,
      logBatch: jest.fn().mockResolvedValue(undefined),
      formatEntry: jest.fn().mockReturnValue('formatted-entry'),
    } as unknown as Transport;

    it('should warn when using add()', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      winston.add(mockTransport);
      
      expect(warnSpy).toHaveBeenCalledWith(
        '[Winston Compatibility] Transport management should be done through MagicLogger'
      );
      expect(winston.add(mockTransport)).toBe(winston); // Chainable
      
      warnSpy.mockRestore();
    });

    it('should warn when using remove()', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      winston.remove(mockTransport);
      
      expect(warnSpy).toHaveBeenCalledWith(
        '[Winston Compatibility] Transport management should be done through MagicLogger'
      );
      expect(winston.remove(mockTransport)).toBe(winston); // Chainable
      
      warnSpy.mockRestore();
    });

    it('should warn when using clear()', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      winston.clear();
      
      expect(warnSpy).toHaveBeenCalledWith(
        '[Winston Compatibility] Transport management should be done through MagicLogger'
      );
      expect(winston.clear()).toBe(winston); // Chainable
      
      warnSpy.mockRestore();
    });
  });

  describe('Query Interface', () => {
    it('should warn when no query handlers registered', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const results = await winston.query({ from: new Date() });
      
      expect(warnSpy).toHaveBeenCalledWith(
        '[Winston Compatibility] No query handlers registered'
      );
      expect(results).toEqual([]);
      
      warnSpy.mockRestore();
    });

    it('should execute registered query handlers', async () => {
      const handler1 = jest.fn().mockResolvedValue([
        { message: 'Log 1', level: 'info' },
        { message: 'Log 2', level: 'error' },
      ]);
      
      const handler2 = jest.fn().mockResolvedValue([
        { message: 'Log 3', level: 'warn' },
      ]);

      winston.addQueryHandler(handler1);
      winston.addQueryHandler(handler2);

      const options = { from: new Date(), level: 'error' };
      const results = await winston.query(options);

      expect(handler1).toHaveBeenCalledWith(options);
      expect(handler2).toHaveBeenCalledWith(options);
      expect(results).toHaveLength(3);
      expect(results).toContainEqual({ message: 'Log 1', level: 'info' });
      expect(results).toContainEqual({ message: 'Log 2', level: 'error' });
      expect(results).toContainEqual({ message: 'Log 3', level: 'warn' });
    });

    it('should handle query handler errors', async () => {
      const handler1 = jest.fn().mockRejectedValue(new Error('Query failed'));
      const handler2 = jest.fn().mockResolvedValue([{ message: 'Success' }]);

      winston.addQueryHandler(handler1);
      winston.addQueryHandler(handler2);

      // Should not throw, but will only return results from successful handler
      await expect(winston.query({})).rejects.toThrow('Query failed');
    });
  });

  describe('Stream Interface', () => {
    it('should return stream-like object', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const stream = winston.stream({ level: 'info' });
      
      expect(warnSpy).toHaveBeenCalledWith(
        '[Winston Compatibility] Streaming not implemented'
      );
      expect(stream).toHaveProperty('on');
      expect(stream).toHaveProperty('destroy');
      expect(stream.on()).toBe(winston);
      
      // Should not throw
      expect(() => stream.destroy()).not.toThrow();
      
      warnSpy.mockRestore();
    });
  });

  describe('Profile Method', () => {
    it('should start profiling on first call', () => {
      winston.profile('operation-1');
      
      expect(winston['profileData'].has('operation-1')).toBe(true);
      expect(winston['profileData'].get('operation-1')).toHaveProperty('start');
    });

    it('should end profiling and log duration on second call', () => {
      const startTime = Date.now() - 1234; // 1.234 seconds ago
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + 1234);

      winston.profile('operation-2');
      winston.profile('operation-2', { extra: 'data' });

      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Profiling [operation-2]'),
        expect.objectContaining({
          duration: 1234,
          durationHuman: '1.23s',
          extra: 'data',
        })
      );
      
      expect(winston['profileData'].has('operation-2')).toBe(false);
    });

    it('should format durations correctly', () => {
      const formatter = winston['formatDuration'];
      
      expect(formatter(123)).toBe('123ms');
      expect(formatter(1234)).toBe('1.23s');
      expect(formatter(12345)).toBe('12.35s');
      expect(formatter(123456)).toBe('2.06m');
      expect(formatter(1234567)).toBe('20.58m');
    });
  });

  describe('Timer Method', () => {
    it('should create timer object', () => {
      const timer = winston.startTimer();
      
      expect(timer).toHaveProperty('done');
      expect(typeof timer.done).toBe('function');
    });

    it('should log duration when done() is called', () => {
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2500);

      const timer = winston.startTimer();
      timer.done({ operation: 'test' });

      expect(infoSpy).toHaveBeenCalledWith(
        'Timer',
        expect.objectContaining({
          operation: 'test',
          duration: 1500,
          durationHuman: '1.50s',
        })
      );
    });

    it('should work without additional info', () => {
      const timer = winston.startTimer();
      timer.done();

      expect(infoSpy).toHaveBeenCalledWith(
        'Timer',
        expect.objectContaining({
          duration: expect.any(Number),
          durationHuman: expect.any(String),
        })
      );
    });
  });

  describe('Level Checking', () => {
    it('should check if level is enabled', () => {
      winston['level'] = 'warn';
      
      expect(winston.isLevelEnabled('silly')).toBe(false);
      expect(winston.isLevelEnabled('debug')).toBe(false);
      expect(winston.isLevelEnabled('verbose')).toBe(false);
      expect(winston.isLevelEnabled('info')).toBe(false);
      expect(winston.isLevelEnabled('warn')).toBe(true);
      expect(winston.isLevelEnabled('error')).toBe(true);
    });

    it('should handle unknown levels', () => {
      expect(winston.isLevelEnabled('unknown')).toBe(false);
    });

    it('should expose Winston levels object', () => {
      expect(winston.levels).toEqual({
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty log calls', () => {
      winston.info(''); // Fixed: Added empty string argument
      expect(infoSpy).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle null and undefined arguments', () => {
      winston.info(null as unknown as string);
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('null'),
        expect.any(Object)
      );

      winston.info(undefined as unknown as string);
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('undefined'),
        expect.any(Object)
      );
    });

    it('should handle circular references in metadata', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;

      winston.info('Circular', circular);
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      winston.info(longMessage);
      
      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining(longMessage),
        expect.any(Object)
      );
    });

    it('should handle special values in metadata', () => {
      winston.info('Special', {
        infinity: Infinity,
        negInfinity: -Infinity,
        nan: NaN,
        date: new Date(),
        regex: /test/,
        symbol: Symbol('test'),
      });

      expect(infoSpy).toHaveBeenCalled();
    });
  });

  describe('Integration with BaseCompatibleLogger', () => {
    it('should properly extend BaseCompatibleLogger', () => {
      expect(winston).toHaveProperty('setVerbose');
      expect(winston).toHaveProperty('setColors');
      expect(winston).toHaveProperty('addTransport');
      expect(winston).toHaveProperty('removeTransport');
      expect(winston).toHaveProperty('flush');
      expect(winston).toHaveProperty('close');
      expect(winston).toHaveProperty('getLogger');
    });

    it('should use underlying Logger for output', () => {
      winston.info('Test integration');
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should inherit configuration methods', () => {
      winston.setVerbose(true);
      expect(winston.isVerbose()).toBe(true);

      winston.setColors(false);
      expect(winston.hasColors()).toBe(false);

      winston.setName('new-name');
      expect(winston.getName()).toBe('new-name');
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency logging', () => {
      const iterations = 1000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        winston.info(`Message ${i}`, { index: i });
      }

      const duration = Date.now() - start;
      
      expect(infoSpy).toHaveBeenCalledTimes(iterations);
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });

    it('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        return new Promise<void>(resolve => {
          setImmediate(() => {
            winston.info(`Concurrent ${i}`);
            resolve();
          });
        });
      });

      await Promise.all(promises);
      expect(infoSpy).toHaveBeenCalledTimes(100);
    });
  });
});