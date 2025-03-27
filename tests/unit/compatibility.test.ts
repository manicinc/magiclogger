// tests/unit/compatibility.test.ts
import {
    enhanceConsole,
    createWinstonCompatible,
    createBunyanCompatible,
    createPinoCompatible
  } from '../../src/compatibility';
  import * as compatibilityModule from '../../src/compatibility';
  import { Logger } from '../../src/Logger';
  
  /**
   * Test setup and teardown
   */
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };
  
  beforeEach(() => {
    // Mock console methods to prevent test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore original console methods
    jest.restoreAllMocks();
    
    // Make sure any enhanced console is restored
    if ((console as any).restoreOriginalConsole) {
      (console as any).restoreOriginalConsole();
    }
  });
  
  describe('Magic Logger Compatibility Layer', () => {
    describe('enhanceConsole', () => {
      afterEach(() => {
        (console as any).restoreOriginalConsole?.();
      });
  
      it('should override console methods with logger versions', () => {
        const spy = jest.spyOn(Logger.prototype, 'log');
        const { restoreConsole } = enhanceConsole({ verbose: true });
        console.log('test message');
        expect(spy).toHaveBeenCalledWith('test message');
        restoreConsole();
      });
  
      it('should avoid infinite recursion', () => {
        const { restoreConsole } = enhanceConsole({ verbose: true });
        console.log(console.log); // Should not crash
        restoreConsole();
      });
  
      it('should support logger extensions on console', () => {
        const { restoreConsole } = enhanceConsole();
        expect(typeof (console as any).header).toBe('function');
        expect(typeof (console as any).progress).toBe('function');
        expect(typeof (console as any).colorParts).toBe('function');
        restoreConsole();
      });
  
      it('should restore original console methods', () => {
        const original = console.log;
        const { restoreConsole } = enhanceConsole();
        restoreConsole();
        expect(console.log).toBe(original);
      });
      
      it('handles complex args and passes them to original console methods', () => {
        // First backup original methods
        const origLog = console.log;
        const origWarn = console.warn;
        const origError = console.error;
        const origInfo = console.info;
        const origDebug = console.debug;
        
        // Create real mocks that we can verify were called
        const logSpy = jest.fn();
        const warnSpy = jest.fn();
        const errorSpy = jest.fn();
        const infoSpy = jest.fn();
        const debugSpy = jest.fn();
        
        // Replace console methods with our spies
        console.log = logSpy;
        console.warn = warnSpy;
        console.error = errorSpy;
        console.info = infoSpy;
        console.debug = debugSpy;
        
        // Now enhance console
        const { restoreConsole } = enhanceConsole();
        
        // Test with multiple args
        console.log('message', { data: 123 }, [1, 2, 3]);
        console.warn('warning', new Error('test'));
        console.error('error', { code: 500 });
        console.info('info', { status: 'ok' });
        console.debug('debug', { level: 'debug' });
        
        // Verify our spies were called
        expect(logSpy).toHaveBeenCalledWith('message', { data: 123 }, [1, 2, 3]);
        expect(warnSpy).toHaveBeenCalledWith('warning', expect.any(Error));
        expect(errorSpy).toHaveBeenCalledWith('error', { code: 500 });
        expect(infoSpy).toHaveBeenCalledWith('info', { status: 'ok' });
        expect(debugSpy).toHaveBeenCalledWith('debug', { level: 'debug' });
        
        // Cleanup
        restoreConsole();
        
        // Restore original console methods
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
        console.info = origInfo;
        console.debug = origDebug;
      });
      
      it('handles recursion prevention in all console methods', () => {
        const { logger, restoreConsole } = enhanceConsole();
        
        // Create spies on the logger methods
        const logSpy = jest.spyOn(logger, 'log');
        const warnSpy = jest.spyOn(logger, 'warn');
        const errorSpy = jest.spyOn(logger, 'error');
        const successSpy = jest.spyOn(logger, 'success');
        const debugSpy = jest.spyOn(logger, 'debug');
        
        // Reset the call counts
        logSpy.mockClear();
        warnSpy.mockClear();
        errorSpy.mockClear();
        successSpy.mockClear();
        debugSpy.mockClear();
        
        // Use basic string messages to test logger methods
        console.log('test');
        console.warn('test');
        console.error('test');
        console.info('test');
        console.debug('test');
        
        // Logger methods should be called exactly once for each direct call
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(successSpy).toHaveBeenCalledTimes(1);
        expect(debugSpy).toHaveBeenCalledTimes(1);
        
        // Cleanup
        restoreConsole();
      });

      it('tests all enhanced console methods', () => {
        // Create a mock Logger instance
        const mockedLogger = {
          header: jest.fn(),
          progressBar: jest.fn(),
          success: jest.fn(),
          custom: jest.fn(),
          styled: jest.fn(),
          color: jest.fn().mockReturnValue((text: string) => text),
          colorParts: jest.fn(),
          log: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn()
        };
      
        // Save the original Logger constructor
        const OriginalLogger = require('../../src/Logger').Logger;
        
        // Replace the Logger constructor in the module cache
        require('../../src/Logger').Logger = jest.fn().mockImplementation(() => mockedLogger);
        
        // Now enhance the console with our mocked Logger
        const { restoreConsole } = enhanceConsole();
        
        // Call all the enhanced console methods
        (console as any).header('Test Header');
        (console as any).progress(50);
        (console as any).success('Success message');
        (console as any).custom('Custom message', ['green'], 'CUSTOM');
        (console as any).styled('Styled message', 'info');
        
        const colorFn = (console as any).colorize('blue');
        colorFn('Colored text');
        
        (console as any).colorParts('Testing parts', { 'parts': ['red'] });
        
        // Verify all methods were called
        expect(mockedLogger.header).toHaveBeenCalledWith('Test Header');
        expect(mockedLogger.progressBar).toHaveBeenCalledWith(50);
        expect(mockedLogger.success).toHaveBeenCalledWith('Success message');
        expect(mockedLogger.custom).toHaveBeenCalledWith('Custom message', ['green'], 'CUSTOM');
        expect(mockedLogger.styled).toHaveBeenCalledWith('Styled message', 'info');
        expect(mockedLogger.color).toHaveBeenCalledWith('blue');
        expect(mockedLogger.colorParts).toHaveBeenCalledWith('Testing parts', { 'parts': ['red'] });
        
        // Cleanup
        restoreConsole();
        
        // Restore original Logger
        require('../../src/Logger').Logger = OriginalLogger;
      });
    });
  
    describe('createWinstonCompatible', () => {
      let winston: ReturnType<typeof createWinstonCompatible>;
  
      beforeEach(() => {
        winston = createWinstonCompatible({ verbose: true });
      });
  
      it('should log info messages', () => {
        const spy = jest.spyOn(Logger.prototype, 'log');
        winston.info('winston info');
        expect(spy).toHaveBeenCalledWith('winston info');
      });
  
      it('should support log(level, message)', () => {
        const customSpy = jest.spyOn(Logger.prototype, 'custom');
        winston.log('notice', 'custom level');
        expect(customSpy).toHaveBeenCalledWith('custom level', ['white'], 'NOTICE');
      });
  
      it('should log all predefined levels', () => {
        const debug = jest.spyOn(Logger.prototype, 'debug');
        const warn = jest.spyOn(Logger.prototype, 'warn');
        const error = jest.spyOn(Logger.prototype, 'error');
  
        winston.warn('warn msg');
        winston.error('err msg');
        winston.debug('debug msg');
        winston.verbose('verbose msg');
  
        expect(warn).toHaveBeenCalledWith('warn msg');
        expect(error).toHaveBeenCalledWith('err msg');
        expect(debug).toHaveBeenCalledTimes(2);
      });
  
      it('should expose original logger', () => {
        expect(winston.magicLogger).toBeInstanceOf(Logger);
      });
      
      it('should support all extended methods', () => {
        // Mock Logger instance methods
        const mockMethods = {
          header: jest.fn(),
          table: jest.fn(),
          progressBar: jest.fn(),
          success: jest.fn(),
          custom: jest.fn(),
          styled: jest.fn(),
          color: jest.fn(() => (text: string) => text),
          colorParts: jest.fn()
        };
        
        // Mock the Logger prototype methods to return our mocks
        jest.spyOn(Logger.prototype, 'header').mockImplementation(mockMethods.header);
        jest.spyOn(Logger.prototype, 'table').mockImplementation(mockMethods.table);
        jest.spyOn(Logger.prototype, 'progressBar').mockImplementation(mockMethods.progressBar);
        jest.spyOn(Logger.prototype, 'success').mockImplementation(mockMethods.success);
        jest.spyOn(Logger.prototype, 'custom').mockImplementation(mockMethods.custom);
        jest.spyOn(Logger.prototype, 'styled').mockImplementation(mockMethods.styled);
        jest.spyOn(Logger.prototype, 'color').mockImplementation(mockMethods.color);
        jest.spyOn(Logger.prototype, 'colorParts').mockImplementation(mockMethods.colorParts);
        
        // Create a fresh winston instance with our mocks
        const mockWinston = createWinstonCompatible();
        
        // Call all the extended methods
        mockWinston.header('Test Header');
        mockWinston.table([{ name: 'test', value: 123 }]);
        mockWinston.progress(50);
        mockWinston.success('Success message');
        mockWinston.custom('Custom message', ['green'], 'CUSTOM');
        mockWinston.styled('Styled message', 'info');
        
        const colorFn = mockWinston.colorize('blue');
        colorFn('Colored text');
        
        mockWinston.colorParts('Testing parts', { 'parts': ['red'] });
        
        // Verify all our mocks were called
        expect(mockMethods.header).toHaveBeenCalled();
        expect(mockMethods.table).toHaveBeenCalled();
        expect(mockMethods.progressBar).toHaveBeenCalled();
        expect(mockMethods.success).toHaveBeenCalled();
        expect(mockMethods.custom).toHaveBeenCalled();
        expect(mockMethods.styled).toHaveBeenCalled();
        expect(mockMethods.color).toHaveBeenCalled();
        expect(mockMethods.colorParts).toHaveBeenCalled();
      });
      
      it('should create logger with default options', () => {
        const defaultWinston = createWinstonCompatible();
        expect(defaultWinston.magicLogger).toBeInstanceOf(Logger);
        
        // Test default logger values
        expect(defaultWinston.magicLogger['verbose']).toBe(false);
        expect(defaultWinston.magicLogger['writeToDisk']).toBe(false);
      });
      
      // Test all standard logging levels through log method
      it('should handle all log level variations through log method', () => {
        const logSpy = jest.spyOn(winston.magicLogger, 'log');
        const warnSpy = jest.spyOn(winston.magicLogger, 'warn');
        const errorSpy = jest.spyOn(winston.magicLogger, 'error');
        const debugSpy = jest.spyOn(winston.magicLogger, 'debug');
        
        winston.log('info', 'info via log');
        winston.log('warn', 'warn via log');
        winston.log('error', 'error via log');
        winston.log('debug', 'debug via log');
        winston.log('verbose', 'verbose via log');
        
        expect(logSpy).toHaveBeenCalledWith('info via log');
        expect(warnSpy).toHaveBeenCalledWith('warn via log');
        expect(errorSpy).toHaveBeenCalledWith('error via log');
        expect(debugSpy).toHaveBeenCalledWith('debug via log');
        expect(debugSpy).toHaveBeenCalledWith('verbose via log');
      });
    });
  
    describe('createBunyanCompatible', () => {
      let bunyan: ReturnType<typeof createBunyanCompatible>;
  
      beforeEach(() => {
        bunyan = createBunyanCompatible({ verbose: true });
      });
  
      it('should log object and message', () => {
        const spy = jest.spyOn(Logger.prototype, 'log');
        bunyan.info({ foo: 1 }, 'with object');
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('"foo":1'));
      });
  
      it('should handle all levels with string only', () => {
        const log = jest.spyOn(Logger.prototype, 'log');
        const warn = jest.spyOn(Logger.prototype, 'warn');
        const error = jest.spyOn(Logger.prototype, 'error');
        const debug = jest.spyOn(Logger.prototype, 'debug');
  
        bunyan.info('info-only');
        bunyan.warn('warn-only');
        bunyan.error('error-only');
        bunyan.debug('debug-only');
  
        expect(log).toHaveBeenCalledWith('info-only');
        expect(warn).toHaveBeenCalledWith('warn-only');
        expect(error).toHaveBeenCalledWith('error-only');
        expect(debug).toHaveBeenCalledWith('debug-only');
      });
  
      it('should support fatal and trace logging', () => {
        const error = jest.spyOn(Logger.prototype, 'error');
        const debug = jest.spyOn(Logger.prototype, 'debug');
  
        bunyan.fatal({ code: 500 }, 'bad crash');
        bunyan.trace({ step: 1 }, 'step info');
  
        expect(error).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
        expect(debug).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
      });
      
      it('should support all extended methods', () => {
        // Mock Logger instance methods
        const mockMethods = {
          header: jest.fn(),
          table: jest.fn(),
          progressBar: jest.fn(),
          success: jest.fn(),
          custom: jest.fn(),
          styled: jest.fn(),
          color: jest.fn(() => (text: string) => text),
          colorParts: jest.fn()
        };
        
        // Mock the Logger prototype methods to return our mocks
        jest.spyOn(Logger.prototype, 'header').mockImplementation(mockMethods.header);
        jest.spyOn(Logger.prototype, 'table').mockImplementation(mockMethods.table);
        jest.spyOn(Logger.prototype, 'progressBar').mockImplementation(mockMethods.progressBar);
        jest.spyOn(Logger.prototype, 'success').mockImplementation(mockMethods.success);
        jest.spyOn(Logger.prototype, 'custom').mockImplementation(mockMethods.custom);
        jest.spyOn(Logger.prototype, 'styled').mockImplementation(mockMethods.styled);
        jest.spyOn(Logger.prototype, 'color').mockImplementation(mockMethods.color);
        jest.spyOn(Logger.prototype, 'colorParts').mockImplementation(mockMethods.colorParts);
        
        // Create a fresh bunyan instance with our mocks
        const mockBunyan = createBunyanCompatible();
        
        // Call all the extended methods
        mockBunyan.header('Test Header');
        mockBunyan.table([{ name: 'test', value: 123 }]);
        mockBunyan.progress(50);
        mockBunyan.success('Success message');
        mockBunyan.custom('Custom message', ['green'], 'CUSTOM');
        mockBunyan.styled('Styled message', 'info');
        
        const colorFn = mockBunyan.colorize('blue');
        colorFn('Colored text');
        
        mockBunyan.colorParts('Testing parts', { 'parts': ['red'] });
        
        // Verify all our mocks were called
        expect(mockMethods.header).toHaveBeenCalled();
        expect(mockMethods.table).toHaveBeenCalled();
        expect(mockMethods.progressBar).toHaveBeenCalled();
        expect(mockMethods.success).toHaveBeenCalled();
        expect(mockMethods.custom).toHaveBeenCalled();
        expect(mockMethods.styled).toHaveBeenCalled();
        expect(mockMethods.color).toHaveBeenCalled();
        expect(mockMethods.colorParts).toHaveBeenCalled();
      });
      
      it('should create logger with name option', () => {
        const namedBunyan = createBunyanCompatible({ name: 'test-logger' });
        expect(namedBunyan.magicLogger).toBeInstanceOf(Logger);
      });
      
      it('should handle object logging without message', () => {
        const logSpy = jest.spyOn(Logger.prototype, 'log');
        const warnSpy = jest.spyOn(Logger.prototype, 'warn');
        const errorSpy = jest.spyOn(Logger.prototype, 'error');
        const debugSpy = jest.spyOn(Logger.prototype, 'debug');
        
        const testObj = { id: 1, name: 'test' };
        
        bunyan.info(testObj);
        bunyan.warn(testObj);
        bunyan.error(testObj);
        bunyan.debug(testObj);
        
        expect(logSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        expect(warnSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        expect(errorSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        expect(debugSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
      });
      
      it('should test all method overloads for complete coverage', () => {
        // Test all Bunyan method overloads to ensure complete coverage
        
        // Direct string calls
        bunyan.info('info string');
        bunyan.warn('warn string');
        bunyan.error('error string');
        bunyan.debug('debug string');
        bunyan.trace('trace string');
        bunyan.fatal('fatal string');
        
        // Test with objects and no message
        const obj = { key: 'value' };
        bunyan.info(obj);
        bunyan.warn(obj);
        bunyan.error(obj);
        bunyan.debug(obj);
        bunyan.trace(obj);
        bunyan.fatal(obj);
        
        // Test with objects and message
        bunyan.info(obj, 'info with object');
        bunyan.warn(obj, 'warn with object');
        bunyan.error(obj, 'error with object');
        bunyan.debug(obj, 'debug with object');
        bunyan.trace(obj, 'trace with object');
        bunyan.fatal(obj, 'fatal with object');
      });
    });
  
    describe('createPinoCompatible', () => {
      let pino: ReturnType<typeof createPinoCompatible>;
  
      beforeEach(() => {
        pino = createPinoCompatible({ verbose: true });
      });
  
      it('should log string and object with optional message', () => {
        const log = jest.spyOn(Logger.prototype, 'log');
  
        pino.info('simple');
        pino.info({ status: 'ok' });
        pino.info({ status: 'ok' }, 'extra');
  
        expect(log).toHaveBeenCalledWith('simple');
        expect(log).toHaveBeenCalledWith(expect.stringContaining('"status":"ok"'));
      });
  
      it('should support all levels', () => {
        const debug = jest.spyOn(Logger.prototype, 'debug');
        const warn = jest.spyOn(Logger.prototype, 'warn');
        const error = jest.spyOn(Logger.prototype, 'error');
  
        pino.debug('test');
        pino.warn('warn test');
        pino.error('err test');
  
        expect(debug).toHaveBeenCalledWith('test');
        expect(warn).toHaveBeenCalledWith('warn test');
        expect(error).toHaveBeenCalledWith('err test');
      });
  
      it('should handle trace and fatal messages', () => {
        const debug = jest.spyOn(Logger.prototype, 'debug');
        const error = jest.spyOn(Logger.prototype, 'error');
  
        pino.trace('traced');
        pino.fatal('fatal');
  
        expect(debug).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
        expect(error).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
      });
      
      it('should support all extended methods', () => {
        // Mock Logger instance methods
        const mockMethods = {
          header: jest.fn(),
          table: jest.fn(),
          progressBar: jest.fn(),
          success: jest.fn(),
          custom: jest.fn(),
          styled: jest.fn(),
          color: jest.fn(() => (text: string) => text),
          colorParts: jest.fn()
        };
        
        // Mock the Logger prototype methods to return our mocks
        jest.spyOn(Logger.prototype, 'header').mockImplementation(mockMethods.header);
        jest.spyOn(Logger.prototype, 'table').mockImplementation(mockMethods.table);
        jest.spyOn(Logger.prototype, 'progressBar').mockImplementation(mockMethods.progressBar);
        jest.spyOn(Logger.prototype, 'success').mockImplementation(mockMethods.success);
        jest.spyOn(Logger.prototype, 'custom').mockImplementation(mockMethods.custom);
        jest.spyOn(Logger.prototype, 'styled').mockImplementation(mockMethods.styled);
        jest.spyOn(Logger.prototype, 'color').mockImplementation(mockMethods.color);
        jest.spyOn(Logger.prototype, 'colorParts').mockImplementation(mockMethods.colorParts);
        
        // Create a fresh pino instance with our mocks
        const mockPino = createPinoCompatible();
        
        // Call all the extended methods
        mockPino.header('Test Header');
        mockPino.table([{ name: 'test', value: 123 }]);
        mockPino.progress(50);
        mockPino.success('Success message');
        mockPino.custom('Custom message', ['green'], 'CUSTOM');
        mockPino.styled('Styled message', 'info');
        
        const colorFn = mockPino.colorize('blue');
        colorFn('Colored text');
        
        mockPino.colorParts('Testing parts', { 'parts': ['red'] });
        
        // Verify all our mocks were called
        expect(mockMethods.header).toHaveBeenCalled();
        expect(mockMethods.table).toHaveBeenCalled();
        expect(mockMethods.progressBar).toHaveBeenCalled();
        expect(mockMethods.success).toHaveBeenCalled();
        expect(mockMethods.custom).toHaveBeenCalled();
        expect(mockMethods.styled).toHaveBeenCalled();
        expect(mockMethods.color).toHaveBeenCalled();
        expect(mockMethods.colorParts).toHaveBeenCalled();
      });
      
      it('should create logger with default options', () => {
        const defaultPino = createPinoCompatible();
        expect(defaultPino.magicLogger).toBeInstanceOf(Logger);
        
        // Test default logger values
        expect(defaultPino.magicLogger['verbose']).toBe(false);
        expect(defaultPino.magicLogger['writeToDisk']).toBe(false);
      });
      
      it('should handle all parameter variations', () => {
        const logSpy = jest.spyOn(Logger.prototype, 'log');
        const warnSpy = jest.spyOn(Logger.prototype, 'warn');
        const errorSpy = jest.spyOn(Logger.prototype, 'error');
        const debugSpy = jest.spyOn(Logger.prototype, 'debug');
        
        // String only
        pino.info('string message');
        pino.warn('warning message');
        pino.error('error message');
        pino.debug('debug message');
        
        expect(logSpy).toHaveBeenCalledWith('string message');
        expect(warnSpy).toHaveBeenCalledWith('warning message');
        expect(errorSpy).toHaveBeenCalledWith('error message');
        expect(debugSpy).toHaveBeenCalledWith('debug message');
        
        // Object only
        const testObj = { id: 123, name: 'test-object' };
        
        pino.info(testObj);
        pino.warn(testObj);
        pino.error(testObj);
        pino.debug(testObj);
        
        expect(logSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        expect(warnSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        expect(errorSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        expect(debugSpy).toHaveBeenCalledWith(JSON.stringify(testObj));
        
        // Object with message
        pino.info(testObj, 'with info message');
        pino.warn(testObj, 'with warn message');
        pino.error(testObj, 'with error message');
        pino.debug(testObj, 'with debug message');
        
        expect(logSpy).toHaveBeenCalledWith(`with info message ${JSON.stringify(testObj)}`);
        expect(warnSpy).toHaveBeenCalledWith(`with warn message ${JSON.stringify(testObj)}`);
        expect(errorSpy).toHaveBeenCalledWith(`with error message ${JSON.stringify(testObj)}`);
        expect(debugSpy).toHaveBeenCalledWith(`with debug message ${JSON.stringify(testObj)}`);
        
        // Trace and fatal
        pino.trace('trace message');
        pino.fatal('fatal message');
        
        expect(debugSpy).toHaveBeenCalledWith('TRACE: trace message');
        expect(errorSpy).toHaveBeenCalledWith('FATAL: fatal message');
        
        // Trace and fatal with object
        pino.trace(testObj);
        pino.fatal(testObj);
        
        expect(debugSpy).toHaveBeenCalledWith(`TRACE: ${JSON.stringify(testObj)}`);
        expect(errorSpy).toHaveBeenCalledWith(`FATAL: ${JSON.stringify(testObj)}`);
        
        // Trace and fatal with object and message
        pino.trace(testObj, 'trace with object');
        pino.fatal(testObj, 'fatal with object');
        
        expect(debugSpy).toHaveBeenCalledWith(`TRACE: trace with object ${JSON.stringify(testObj)}`);
        expect(errorSpy).toHaveBeenCalledWith(`FATAL: fatal with object ${JSON.stringify(testObj)}`);
      });
      
      it('should test all method overloads for complete coverage', () => {
        // Test all Pino method overloads to ensure complete coverage
        
        // Direct string calls
        pino.info('info string');
        pino.warn('warn string');
        pino.error('error string');
        pino.debug('debug string');
        pino.trace('trace string');
        pino.fatal('fatal string');
        
        // Test with objects and no message
        const obj = { key: 'value' };
        pino.info(obj);
        pino.warn(obj);
        pino.error(obj);
        pino.debug(obj);
        pino.trace(obj);
        pino.fatal(obj);
        
        // Test with objects and message
        pino.info(obj, 'info with object');
        pino.warn(obj, 'warn with object');
        pino.error(obj, 'error with object');
        pino.debug(obj, 'debug with object');
        pino.trace(obj, 'trace with object');
        pino.fatal(obj, 'fatal with object');
      });
    });
  });