// File: tests/unit/compatibility/BaseCompatibleLogger.test.ts

import { Logger } from '../../../src/Logger';
import {
  BaseCompatibleLogger,
  LogCompatibilityOptions,
} from '../../../src/compatibility/BaseCompatibleLogger';
import type { Transport } from '../../../src/transports/base/Transport';

/**
 * Concrete implementation of BaseCompatibleLogger for testing purposes.
 * This class implements all abstract methods required by the base class
 * and adds method tracking for test assertions.
 * 
 * @class TestCompatibleLogger
 * @extends {BaseCompatibleLogger}
 */
class TestCompatibleLogger extends BaseCompatibleLogger {
  /**
   * Track all method calls for testing verification.
   * Each entry contains the method name and arguments passed.
   */
  public methodCalls: Array<{ method: string; args: unknown[] }> = [];

  /**
   * Implement abstract info method.
   * Logs an info-level message to the underlying logger.
   * 
   * @param {...unknown} args - Arguments passed to the info method
   */
  public info(...args: unknown[]): void {
    this.methodCalls.push({ method: 'info', args });
    const { message, meta } = this.parseArgs(args);
    this.logger.info(message, meta);
  }

  /**
   * Implement abstract warn method.
   * Logs a warning-level message to the underlying logger.
   * 
   * @param {...unknown} args - Arguments passed to the warn method
   */
  public warn(...args: unknown[]): void {
    this.methodCalls.push({ method: 'warn', args });
    const { message, meta } = this.parseArgs(args);
    this.logger.warn(message, meta);
  }

  /**
   * Implement abstract error method.
   * Logs an error-level message to the underlying logger.
   * 
   * @param {...unknown} args - Arguments passed to the error method
   */
  public error(...args: unknown[]): void {
    this.methodCalls.push({ method: 'error', args });
    const { message, meta } = this.parseArgs(args);
    this.logger.error(message, meta);
  }

  /**
   * Implement abstract debug method.
   * Logs a debug-level message to the underlying logger.
   * 
   * @param {...unknown} args - Arguments passed to the debug method
   */
  public debug(...args: unknown[]): void {
    this.methodCalls.push({ method: 'debug', args });
    const { message, meta } = this.parseArgs(args);
    this.logger.debug(message, meta);
  }

  /**
   * Implement abstract log method.
   * Logs a message at any specified level.
   * 
   * @param {string} level - Log level
   * @param {...unknown} args - Arguments passed to the log method
   * @throws {Error} When strictLevels is true and level is unknown
   */
  public log(level: string, ...args: unknown[]): void {
    this.methodCalls.push({ method: 'log', args: [level, ...args] });
    
    const normalizedLevel = this.normalizeLevel(level);
    const { message, meta } = this.parseArgs(args);
    
    switch (normalizedLevel) {
      case 'info':
        this.logger.info(message, meta);
        break;
      case 'warn':
        this.logger.warn(message, meta);
        break;
      case 'error':
        this.logger.error(message, meta);
        break;
      case 'debug':
        this.logger.debug(message, meta);
        break;
      case 'success':
        this.logger.success(message, meta);
        break;
      default:
        if (this.strictLevels) {
          throw new Error(`Unknown log level: ${level}`);
        }
        this.logger.custom(message, ['white'], level.toUpperCase());
    }
  }

  /**
   * Implement abstract child method.
   * Creates a child logger with merged configuration.
   * 
   * @param {Record<string, unknown>} options - Child logger options
   * @returns {TestCompatibleLogger} New child logger instance
   */
  public child(options: Record<string, unknown>): TestCompatibleLogger {
    const childOptions: LogCompatibilityOptions = {
      ...this.getConfig(),
      ...options,
      // Merge arrays properly
      tags: [...(this.getConfig().tags || []), ...((options.tags as string[]) || [])],
      // Deep merge objects
      context: { ...this.getConfig().context, ...(options.context as Record<string, unknown>) },
    };
    
    const child = new TestCompatibleLogger(childOptions);
    this.children.set(child, child);
    return child;
  }

  /**
   * Helper method to parse various argument formats.
   * Handles string messages, objects with message property, and metadata.
   * 
   * @private
   * @param {unknown[]} args - Arguments to parse
   * @returns {{ message: string; meta?: Record<string, unknown> }} Parsed message and metadata
   */
  private parseArgs(args: unknown[]): { message: string; meta?: Record<string, unknown> } {
    if (args.length === 0) {
      return { message: '' };
    }
    
    if (typeof args[0] === 'string') {
      return {
        message: args[0],
        meta: args[1] as Record<string, unknown>,
      };
    }
    
    if (typeof args[0] === 'object' && args[0] !== null) {
      return {
        message: this.safeSerialize(args[0]),
        meta: args[0] as Record<string, unknown>,
      };
    }
    
    return { message: String(args[0]) };
  }

  /**
   * Override getConfig to return full configuration.
   * 
   * @returns {LogCompatibilityOptions} Current configuration
   */
  public getConfig(): LogCompatibilityOptions {
    return {
      name: this.name,
      format: this.format,
      formatter: this.formatter,
      verbose: this._verbose,
      useColors: this.useColors,
      writeToDisk: this.writeToDisk,
      logDir: this.logDir,
      logRetentionDays: this.logRetentionDays,
      strictLevels: this.strictLevels,
      transports: this.getTransports(),
    };
  }
}

describe('BaseCompatibleLogger', () => {
  let logger: TestCompatibleLogger;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create test instance with default configuration
    logger = new TestCompatibleLogger({
      name: 'test-logger',
      verbose: true,
      useColors: true,
      strictLevels: false,
    });

    // Get reference to mocked underlying logger
    mockLogger = logger['logger'] as jest.Mocked<Logger>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default options when none provided', () => {
      const defaultLogger = new TestCompatibleLogger();
      
      expect(defaultLogger.getName()).toBe('app');
      expect(defaultLogger.getFormat()).toBe('plain');
      expect(defaultLogger.isVerbose()).toBe(false);
      expect(defaultLogger.hasColors()).toBe(true);
      expect(defaultLogger['writeToDisk']).toBe(false);
      expect(defaultLogger['logDir']).toBe('./logs');
      expect(defaultLogger['logRetentionDays']).toBe(30);
      expect(defaultLogger['strictLevels']).toBe(false);
    });

    it('should initialize with all custom options', () => {
      const customLogger = new TestCompatibleLogger({
        name: 'custom-app',
        format: 'json',
        verbose: true,
        useColors: false,
        writeToDisk: true,
        logDir: '/custom/logs',
        logRetentionDays: 60,
        strictLevels: true,
        formatter: (entry) => `Custom: ${entry}`,
      });

      expect(customLogger.getName()).toBe('custom-app');
      expect(customLogger.getFormat()).toBe('json');
      expect(customLogger.isVerbose()).toBe(true);
      expect(customLogger.hasColors()).toBe(false);
      expect(customLogger['writeToDisk']).toBe(true);
      expect(customLogger['logDir']).toBe('/custom/logs');
      expect(customLogger['logRetentionDays']).toBe(60);
      expect(customLogger['strictLevels']).toBe(true);
      expect(customLogger['formatter']).toBeDefined();
    });

    it('should update configuration dynamically using setters', () => {
      // Test name setter
      logger.setName('updated-name');
      expect(logger.getName()).toBe('updated-name');

      // Test verbose setter
      logger.setVerbose(false);
      expect(logger.isVerbose()).toBe(false);
      
      // Verify underlying logger is updated
      expect(mockLogger.setVerbose).toHaveBeenCalledWith(false);

      // Test colors setter
      logger.setColors(false);
      expect(logger.hasColors()).toBe(false);
      expect(mockLogger.setColorsEnabled).toHaveBeenCalledWith(false);

      // Test format setter
      logger.setFormat('json');
      expect(logger.getFormat()).toBe('json');
    });

    it('should create underlying Logger with transports when provided', () => {
      const mockTransport: Partial<Transport> = {
        name: 'test-transport',
        enabled: true,
        log: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        shouldLog: jest.fn().mockReturnValue(true),
      };

      const options: LogCompatibilityOptions = {
        name: 'test',
        verbose: true,
        useColors: false,
        transports: [mockTransport as Transport],
      };

      const testLogger = new TestCompatibleLogger(options);
      expect(testLogger['logger']).toBeInstanceOf(Logger);
    });

    it('should enable file logging when writeToDisk is true', () => {
      const setFileLoggingSpy = jest.spyOn(Logger.prototype, 'setFileLogging');
      const setLogDirSpy = jest.spyOn(Logger.prototype, 'setLogDir');
      const setLogRetentionDaysSpy = jest.spyOn(Logger.prototype, 'setLogRetentionDays');

      new TestCompatibleLogger({
        writeToDisk: true,
        logDir: '/test/logs',
        logRetentionDays: 7,
      });

      expect(setFileLoggingSpy).toHaveBeenCalledWith(true);
      expect(setLogDirSpy).toHaveBeenCalledWith('/test/logs');
      expect(setLogRetentionDaysSpy).toHaveBeenCalledWith(7);
    });
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      // Mock all logger methods
      jest.spyOn(mockLogger, 'info').mockImplementation(() => undefined);
      jest.spyOn(mockLogger, 'warn').mockImplementation(() => undefined);
      jest.spyOn(mockLogger, 'error').mockImplementation(() => undefined);
      jest.spyOn(mockLogger, 'debug').mockImplementation(() => undefined);
      jest.spyOn(mockLogger, 'success').mockImplementation(() => undefined);
      jest.spyOn(mockLogger, 'custom').mockImplementation(() => undefined);
    });

    describe('info()', () => {
      it('should log simple info messages', () => {
        logger.info('Test info message');
        
        expect(mockLogger.info).toHaveBeenCalledWith('Test info message', undefined);
        expect(logger.methodCalls).toContainEqual({
          method: 'info',
          args: ['Test info message'],
        });
      });

      it('should log info messages with metadata', () => {
        const meta = { userId: 123, action: 'login', timestamp: Date.now() };
        logger.info('User logged in', meta);
        
        expect(mockLogger.info).toHaveBeenCalledWith('User logged in', meta);
        expect(logger.methodCalls).toContainEqual({
          method: 'info',
          args: ['User logged in', meta],
        });
      });

      it('should handle object-only logging', () => {
        const obj = { message: 'Object message', data: { value: 42 } };
        logger.info(obj);
        
        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Object message'),
          obj
        );
      });
    });

    describe('warn()', () => {
      it('should log warning messages', () => {
        logger.warn('Warning message');
        expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', undefined);
      });

      it('should log warnings with metadata', () => {
        const meta = { code: 'WARN001', severity: 'medium' };
        logger.warn('Deprecation warning', meta);
        expect(mockLogger.warn).toHaveBeenCalledWith('Deprecation warning', meta);
      });
    });

    describe('error()', () => {
      it('should log error messages', () => {
        logger.error('Error message');
        expect(mockLogger.error).toHaveBeenCalledWith('Error message', undefined);
      });

      it('should log errors with Error objects', () => {
        const error = new Error('Test error');
        error.stack = 'Error: Test error\n    at Test.suite';
        
        logger.error('Error occurred', error);
        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', error);
      });

      it('should log errors with metadata containing error', () => {
        const error = new Error('Database connection failed');
        const meta = { error, retries: 3, host: 'localhost' };
        
        logger.error('Connection error', meta);
        expect(mockLogger.error).toHaveBeenCalledWith('Connection error', meta);
      });
    });

    describe('debug()', () => {
      it('should log debug messages', () => {
        logger.debug('Debug message');
        expect(mockLogger.debug).toHaveBeenCalledWith('Debug message', undefined);
      });

      it('should log debug with complex objects', () => {
        const debugData = {
          query: 'SELECT * FROM users',
          params: [1, 2, 3],
          timing: { start: 100, end: 150, duration: 50 },
        };
        
        logger.debug('Database query', debugData);
        expect(mockLogger.debug).toHaveBeenCalledWith('Database query', debugData);
      });
    });

    describe('log() generic method', () => {
      it('should route standard levels to appropriate methods', () => {
        logger.log('info', 'Info via log');
        expect(mockLogger.info).toHaveBeenCalledWith('Info via log', undefined);

        logger.log('warn', 'Warn via log');
        expect(mockLogger.warn).toHaveBeenCalledWith('Warn via log', undefined);

        logger.log('error', 'Error via log');
        expect(mockLogger.error).toHaveBeenCalledWith('Error via log', undefined);

        logger.log('debug', 'Debug via log');
        expect(mockLogger.debug).toHaveBeenCalledWith('Debug via log', undefined);

        logger.log('success', 'Success via log');
        expect(mockLogger.success).toHaveBeenCalledWith('Success via log', undefined);
      });

      it('should normalize common level aliases', () => {
        logger.log('warning', 'Warning normalized');
        expect(mockLogger.warn).toHaveBeenCalledWith('Warning normalized', undefined);

        logger.log('err', 'Error normalized');
        expect(mockLogger.error).toHaveBeenCalledWith('Error normalized', undefined);

        logger.log('log', 'Log normalized to info');
        expect(mockLogger.info).toHaveBeenCalledWith('Log normalized to info', undefined);
      });

      it('should handle custom levels when strictLevels is false', () => {
        logger.log('custom', 'Custom level message');
        expect(mockLogger.custom).toHaveBeenCalledWith(
          'Custom level message',
          ['white'],
          'CUSTOM'
        );

        logger.log('trace', 'Trace level message');
        expect(mockLogger.custom).toHaveBeenCalledWith(
          'Trace level message',
          ['white'],
          'TRACE'
        );
      });

      it('should throw error for unknown levels when strictLevels is true', () => {
        const strictLogger = new TestCompatibleLogger({ strictLevels: true });
        
        expect(() => strictLogger.log('unknown', 'Message')).toThrow(
          'Unknown log level: unknown'
        );
        
        expect(() => strictLogger.log('custom', 'Message')).toThrow(
          'Unknown log level: custom'
        );
      });

      it('should handle empty arguments', () => {
        logger.info();
        expect(mockLogger.info).toHaveBeenCalledWith('', undefined);
      });

      it('should handle null arguments', () => {
        logger.info(null as unknown as string);
        expect(mockLogger.info).toHaveBeenCalledWith('null', undefined);
      });

      it('should handle undefined arguments', () => {
        logger.info(undefined as unknown as string);
        expect(mockLogger.info).toHaveBeenCalledWith('undefined', undefined);
      });

      it('should handle non-string, non-object arguments', () => {
        logger.info(123 as unknown as string);
        expect(mockLogger.info).toHaveBeenCalledWith('123', undefined);

        logger.info(true as unknown as string);
        expect(mockLogger.info).toHaveBeenCalledWith('true', undefined);
      });
    });
  });

  describe('Serialization', () => {
    it('should serialize simple objects correctly', () => {
      const obj = { a: 1, b: 'test', c: true, d: null };
      const serialized = logger['safeSerialize'](obj);
      
      expect(serialized).toBe('{"a":1,"b":"test","c":true,"d":null}');
      expect(JSON.parse(serialized)).toEqual(obj);
    });

    it('should handle circular references gracefully', () => {
      const circular: Record<string, unknown> = { a: 1, b: 'test' };
      circular.self = circular;
      circular.nested = { parent: circular };
      
      const serialized = logger['safeSerialize'](circular);
      expect(serialized).toContain('[Circular]');
      expect(serialized).toContain('"a":1');
      expect(serialized).toContain('"b":"test"');
      
      // Should be parseable despite circular references
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should handle serialization errors', () => {
      // Object that throws during serialization
      const badObj = {
        toJSON() {
          throw new Error('Serialization error');
        },
      };

      const result = logger['safeSerialize'](badObj);
      expect(result).toContain('[Unable to serialize:');
      expect(result).toContain('Serialization error');
    });

    it('should handle BigInt serialization error', () => {
      const objWithBigInt = { value: BigInt(123), other: 'data' };
      const result = logger['safeSerialize'](objWithBigInt);
      
      expect(result).toContain('[Unable to serialize:');
      // BigInt serialization throws TypeError
      expect(result).toContain('TypeError');
    });

    it('should handle complex nested structures', () => {
      const complex = {
        array: [1, 2, { nested: true }],
        date: new Date('2023-01-01'),
        regex: /test/gi,
        func: function() { return 'test'; },
        undef: undefined,
        symbol: Symbol('test'),
      };
      
      const serialized = logger['safeSerialize'](complex);
      expect(serialized).toContain('"array":[1,2,{"nested":true}]');
      expect(serialized).toContain('"date":"2023-01-01T00:00:00.000Z"');
      expect(serialized).toContain('"regex":{}'); // RegExp serializes to {}
    });
  });

  describe('Format Entry', () => {
    it('should format entries as JSON when format is json', () => {
      logger.setFormat('json');
      
      const entry = { message: 'Test', level: 'info', timestamp: Date.now() };
      const formatted = logger['formatEntry'](entry);
      
      expect(formatted).toBe(JSON.stringify(entry));
      expect(JSON.parse(formatted)).toEqual(entry);
    });

    it('should format strings as-is when format is plain', () => {
      logger.setFormat('plain');
      
      const message = 'Plain text message';
      const formatted = logger['formatEntry'](message);
      
      expect(formatted).toBe(message);
    });

    it('should extract message property from objects in plain format', () => {
      logger.setFormat('plain');
      
      const entry = { 
        message: 'Object message', 
        extra: 'data',
        timestamp: Date.now() 
      };
      const formatted = logger['formatEntry'](entry);
      
      expect(formatted).toBe('Object message');
    });

    it('should serialize objects without message property in plain format', () => {
      logger.setFormat('plain');
      
      const entry = { data: 'value', count: 42 };
      const formatted = logger['formatEntry'](entry);
      
      expect(formatted).toBe(JSON.stringify(entry));
    });

    it('should use custom formatter when format is custom', () => {
      const customFormatter = jest.fn((entry) => `CUSTOM: ${JSON.stringify(entry)}`);
      const customLogger = new TestCompatibleLogger({
        format: 'custom',
        formatter: customFormatter,
      });

      const entry = { message: 'Test', level: 'info' };
      const formatted = customLogger['formatEntry'](entry);
      
      expect(customFormatter).toHaveBeenCalledWith(entry);
      expect(formatted).toBe(`CUSTOM: ${JSON.stringify(entry)}`);
    });

    it('should fall back to plain format when custom formatter is missing', () => {
      const customLogger = new TestCompatibleLogger({ format: 'custom' });
      
      const message = 'Fallback message';
      const formatted = customLogger['formatEntry'](message);
      
      expect(formatted).toBe(message);
    });

    it('should handle formatter errors gracefully', () => {
      const errorFormatter = jest.fn(() => {
        throw new Error('Formatter error');
      });
      
      const customLogger = new TestCompatibleLogger({
        format: 'custom',
        formatter: errorFormatter,
      });

      // Should not throw, should fall back to serialization
      const entry = { message: 'Test' };
      expect(() => customLogger['formatEntry'](entry)).not.toThrow();
    });
  });

  describe('Transport Management', () => {
    let mockTransport1: Partial<Transport>;
    let mockTransport2: Partial<Transport>;

    beforeEach(() => {
      mockTransport1 = {
        name: 'transport-1',
        enabled: true,
        log: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        shouldLog: jest.fn().mockReturnValue(true),
      };

      mockTransport2 = {
        name: 'transport-2',
        enabled: true,
        log: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        shouldLog: jest.fn().mockReturnValue(true),
      };

      jest.spyOn(mockLogger, 'addTransport').mockResolvedValue(undefined);
      jest.spyOn(mockLogger, 'removeTransport').mockResolvedValue(undefined);
      jest.spyOn(mockLogger, 'getTransport').mockImplementation((name) => {
        if (name === 'transport-1') return mockTransport1 as Transport;
        if (name === 'transport-2') return mockTransport2 as Transport;
        return undefined;
      });
      jest.spyOn(mockLogger, 'listTransports').mockReturnValue(['transport-1', 'transport-2']);
    });

    it('should add transports to underlying logger', async () => {
      await logger.addTransport(mockTransport1 as Transport);
      expect(mockLogger.addTransport).toHaveBeenCalledWith(mockTransport1);
      
      await logger.addTransport(mockTransport2 as Transport);
      expect(mockLogger.addTransport).toHaveBeenCalledWith(mockTransport2);
    });

    it('should remove transports by name', async () => {
      await logger.removeTransport('transport-1');
      expect(mockLogger.removeTransport).toHaveBeenCalledWith('transport-1');
    });

    it('should clear all transports', () => {
      logger.clearTransports();

      expect(mockLogger.removeTransport).toHaveBeenCalledTimes(2);
      expect(mockLogger.removeTransport).toHaveBeenCalledWith('transport-1');
      expect(mockLogger.removeTransport).toHaveBeenCalledWith('transport-2');
    });

    it('should get list of transports', () => {
      const transports = logger.getTransports();
      
      expect(transports).toHaveLength(2);
      expect(transports).toContainEqual(expect.objectContaining({ name: 'transport-1' }));
      expect(transports).toContainEqual(expect.objectContaining({ name: 'transport-2' }));
      expect(mockLogger.listTransports).toHaveBeenCalled();
    });

    it('should filter out undefined transports', () => {
      jest.spyOn(mockLogger, 'listTransports').mockReturnValue([
        'transport-1',
        'transport-missing',
        'transport-2',
      ]);
      
      jest.spyOn(mockLogger, 'getTransport').mockImplementation((name) => {
        if (name === 'transport-1') return mockTransport1 as Transport;
        if (name === 'transport-2') return mockTransport2 as Transport;
        return undefined; // transport-missing returns undefined
      });

      const transports = logger.getTransports();
      expect(transports).toHaveLength(2);
      expect(transports).not.toContain(undefined);
    });

    it('should handle empty transport list', () => {
      jest.spyOn(mockLogger, 'listTransports').mockReturnValue([]);
      
      const transports = logger.getTransports();
      expect(transports).toEqual([]);
    });
  });

  describe('Metadata Enhancement', () => {
    it('should add timestamp to metadata if not present', () => {
      const meta = { userId: 123, action: 'test' };
      const enhanced = logger['enhanceMetadata'](meta);
      
      expect(enhanced).toHaveProperty('timestamp');
      expect(enhanced.userId).toBe(123);
      expect(enhanced.action).toBe('test');
      
      // Verify timestamp is valid ISO string
      const timestamp = enhanced.timestamp as string;
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('should preserve existing timestamp', () => {
      const originalTimestamp = '2023-01-01T00:00:00.000Z';
      const meta = { timestamp: originalTimestamp, data: 'test' };
      const enhanced = logger['enhanceMetadata'](meta);
      
      expect(enhanced.timestamp).toBe(originalTimestamp);
      expect(enhanced.data).toBe('test');
    });

    it('should add logger name to metadata', () => {
      const meta = { data: 'test' };
      const enhanced = logger['enhanceMetadata'](meta);
      
      expect(enhanced.logger).toBe('test-logger');
      expect(enhanced.data).toBe('test');
    });

    it('should preserve existing logger name', () => {
      const meta = { logger: 'custom-logger', data: 'test' };
      const enhanced = logger['enhanceMetadata'](meta);
      
      expect(enhanced.logger).toBe('custom-logger');
    });

    it('should handle empty metadata', () => {
      const enhanced = logger['enhanceMetadata']({});
      
      expect(enhanced).toHaveProperty('timestamp');
      expect(enhanced).toHaveProperty('logger');
      expect(Object.keys(enhanced).length).toBeGreaterThanOrEqual(2);
    });

    it('should handle null/undefined metadata gracefully', () => {
      const enhanced1 = logger['enhanceMetadata'](null as unknown as Record<string, unknown>);
      expect(enhanced1).toHaveProperty('timestamp');
      expect(enhanced1).toHaveProperty('logger');

      const enhanced2 = logger['enhanceMetadata'](undefined as unknown as Record<string, unknown>);
      expect(enhanced2).toHaveProperty('timestamp');
      expect(enhanced2).toHaveProperty('logger');
    });
  });

  describe('Level Validation', () => {
    it('should validate all standard log levels', () => {
      const validLevels = ['debug', 'info', 'warn', 'error', 'success'];
      
      validLevels.forEach(level => {
        expect(logger['isValidLevel'](level)).toBe(true);
      });
    });

    it('should reject non-standard levels', () => {
      const invalidLevels = ['custom', 'fatal', 'trace', 'verbose', 'silly'];
      
      invalidLevels.forEach(level => {
        expect(logger['isValidLevel'](level)).toBe(false);
      });
    });

    it('should validate levels case-insensitively', () => {
      expect(logger['isValidLevel']('INFO')).toBe(true);
      expect(logger['isValidLevel']('Debug')).toBe(true);
      expect(logger['isValidLevel']('ERROR')).toBe(true);
      expect(logger['isValidLevel']('WaRn')).toBe(true);
      expect(logger['isValidLevel']('SUCCESS')).toBe(true);
    });

    it('should handle empty and invalid input', () => {
      expect(logger['isValidLevel']('')).toBe(false);
      expect(logger['isValidLevel'](null as unknown as string)).toBe(false);
      expect(logger['isValidLevel'](undefined as unknown as string)).toBe(false);
      expect(logger['isValidLevel'](123 as unknown as string)).toBe(false);
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with merged configuration', () => {
      const child = logger.child({
        name: 'child-logger',
        tags: ['child'],
        context: { childId: 456 },
      });

      expect(child).toBeInstanceOf(TestCompatibleLogger);
      expect(child.getName()).toBe('child-logger');
      
      const config = child.getConfig();
      expect(config.tags).toEqual(['child']);
      expect(config.context).toEqual({ childId: 456 });
    });

    it('should properly merge parent and child arrays', () => {
      const parentLogger = new TestCompatibleLogger({
        tags: ['parent', 'app'],
        context: { parentId: 123, env: 'test' },
      });

      const child = parentLogger.child({
        tags: ['child', 'module'],
        context: { childId: 456, module: 'auth' },
      });

      const config = child.getConfig();
      expect(config.tags).toEqual(['parent', 'app', 'child', 'module']);
      expect(config.context).toEqual({
        parentId: 123,
        env: 'test',
        childId: 456,
        module: 'auth',
      });
    });

    it('should store child reference in WeakMap', () => {
      const child1 = logger.child({ name: 'child-1' });
      const child2 = logger.child({ name: 'child-2' });

      expect(logger['children'].has(child1)).toBe(true);
      expect(logger['children'].has(child2)).toBe(true);
    });

    it('should inherit parent configuration', () => {
      const parentLogger = new TestCompatibleLogger({
        verbose: true,
        useColors: false,
        format: 'json',
        strictLevels: true,
      });

      const child = parentLogger.child({ name: 'child' });
      const config = child.getConfig();

      expect(config.verbose).toBe(true);
      expect(config.useColors).toBe(false);
      expect(config.format).toBe('json');
      expect(config.strictLevels).toBe(true);
    });

    it('should allow child to override parent configuration', () => {
      const child = logger.child({
        verbose: false,
        format: 'json',
      });

      const config = child.getConfig();
      expect(config.verbose).toBe(false);
      expect(config.format).toBe('json');
      expect(config.useColors).toBe(true); // Inherited from parent
    });
  });

  describe('Lifecycle Methods', () => {
    it('should flush transports when async logger is available', async () => {
      const flushAndWaitSpy = jest.fn().mockResolvedValue(undefined);
      (mockLogger as unknown as { async: { flushAndWait: jest.Mock } }).async = {
        flushAndWait: flushAndWaitSpy,
      };

      await logger.flush();
      expect(flushAndWaitSpy).toHaveBeenCalled();
    });

    it('should handle flush gracefully when async logger is not available', async () => {
      (mockLogger as unknown as { async: undefined }).async = undefined;
      
      await expect(logger.flush()).resolves.toBeUndefined();
    });

    it('should close logger and all transports', async () => {
      const closeSpy = jest.fn().mockResolvedValue(undefined);
      mockLogger.close = closeSpy;

      await logger.close();
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should warn about unimplemented pause/resume functionality', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.pause();
      expect(warnSpy).toHaveBeenCalledWith(
        'pause() is not implemented in the underlying Logger'
      );

      logger.resume();
      expect(warnSpy).toHaveBeenCalledWith(
        'resume() is not implemented in the underlying Logger'
      );

      expect(logger.isPaused()).toBe(false);

      warnSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      logger.info(longMessage);
      
      expect(mockLogger.info).toHaveBeenCalledWith(longMessage, undefined);
    });

    it('should handle deeply nested objects', () => {
      const createDeepObject = (depth: number): Record<string, unknown> => {
        if (depth === 0) return { value: 'deep' };
        return { level: depth, nested: createDeepObject(depth - 1) };
      };

      const deepObject = createDeepObject(100);
      logger.info('Deep object', deepObject);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Deep object', deepObject);
    });

    it('should handle special JavaScript values', () => {
      const specialValues = {
        infinity: Infinity,
        negInfinity: -Infinity,
        nan: NaN,
        undef: undefined,
        nil: null,
        date: new Date('2023-01-01'),
        regex: /test/gi,
        error: new Error('test'),
      };

      logger.info('Special values', specialValues);
      expect(mockLogger.info).toHaveBeenCalledWith('Special values', specialValues);
    });

    it('should handle arrays with mixed types', () => {
      const mixedArray = [
        'string',
        123,
        true,
        null,
        undefined,
        { nested: true },
        [1, 2, 3],
        new Date(),
      ];

      logger.info('Mixed array', { array: mixedArray });
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('Getters and Configuration', () => {
    it('should get underlying logger instance', () => {
      const underlyingLogger = logger.getLogger();
      expect(underlyingLogger).toBe(mockLogger);
      expect(underlyingLogger).toBeInstanceOf(Logger);
    });

    it('should get complete configuration snapshot', () => {
      const config = logger.getConfig();
      
      expect(config).toEqual({
        name: 'test-logger',
        format: 'plain',
        formatter: undefined,
        verbose: true,
        useColors: true,
        writeToDisk: false,
        logDir: './logs',
        logRetentionDays: 30,
        strictLevels: false,
        transports: [],
      });
    });

    it('should return new config object each time to prevent mutations', () => {
      const config1 = logger.getConfig();
      const config2 = logger.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different object references
      
      // Mutating one should not affect the other
      config1.name = 'mutated';
      expect(config2.name).toBe('test-logger');
    });

    it('should include formatter in config when present', () => {
      const formatter = (entry: Record<string, unknown>) => `Formatted: ${entry}`;
      const loggerWithFormatter = new TestCompatibleLogger({
        formatter,
      });

      const config = loggerWithFormatter.getConfig();
      expect(config.formatter).toBe(formatter);
    });
  });

  describe('Integration with Underlying Logger', () => {
    it('should properly delegate all log methods', () => {
      const allMethods = ['info', 'warn', 'error', 'debug'];
      
      allMethods.forEach(method => {
        const logMethod = logger[method as keyof TestCompatibleLogger] as (...args: unknown[]) => void;
        logMethod('Test message');
      });

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should update underlying logger when configuration changes', () => {
      logger.setVerbose(true);
      expect(mockLogger.setVerbose).toHaveBeenCalledWith(true);

      logger.setColors(false);
      expect(mockLogger.setColorsEnabled).toHaveBeenCalledWith(false);
    });
  });
});