import { createPinoCompatible, PinoCompatibleLogger } from '../../../src/compatibility/Pino';
import { Logger } from '../../../src/Logger';

describe('PinoCompatibleLogger', () => {
  let pino: PinoCompatibleLogger;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let customSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create spies for Logger methods
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    customSpy = jest.spyOn(Logger.prototype, 'custom').mockImplementation(() => undefined);

    // Create a Pino logger with complete options
    pino = createPinoCompatible({
      verbose: true,
      writeToDisk: false,
      useColors: true,
      level: 'info',
      prettyPrint: true,
      timestamp: true,
      levelVal: true,
      base: { app: 'test-app', env: 'test' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('formats messages with timestamps when enabled', () => {
    // Test timestamp formatting
    pino.info('test message');

    // Should include ISO timestamp when timestamp is enabled
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    );
  });

  it('includes level numbers when levelVal is enabled', () => {
    // Test level number inclusion
    pino.info('test message');
    pino.error('error message');

    // Should include level numbers
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[30\]/));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/\[50\]/));
  });

  it('includes base metadata in formatted messages', () => {
    // Test base metadata inclusion
    pino.info('test message');

    // Should include base metadata
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"app":"test-app"'));
  });

  it('implements the log method with all log levels', () => {
    // Test all log levels using the log method
    pino.log('trace', 'trace message');
    pino.log('debug', 'debug message');
    pino.log('info', 'info message');
    pino.log('warn', 'warn message');
    pino.log('error', 'error message');
    pino.log('fatal', 'fatal message');
    pino.log('custom', 'custom level message');

    // Verify each level maps to the correct logger method
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('debug message'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('info message'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warn message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
    // Custom level should use custom method
    expect(customSpy).toHaveBeenCalledWith(
      expect.stringContaining('custom level message'),
      ['white'],
      'CUSTOM'
    );
  });

  it('initializes with minimal options', () => {
    // Create Pino logger with no options
    const minimalPino = createPinoCompatible();

    // Should use default values for all options
    expect(minimalPino['levelVal']).toBe(false);
    expect(minimalPino['timestamp']).toBe(false);
    expect(minimalPino['prettyPrint']).toBe(true);
    expect(Object.keys(minimalPino['base']).length).toBe(0);
  });

  it('creates child loggers with merged context', () => {
    // Create child logger with additional context
    const childContext = { req_id: '123', user: 'test-user' };
    const childLogger = pino.child(childContext);

    // Child logger should have merged context
    expect(childLogger['base']).toEqual({
      ...pino['base'],
      ...childContext,
    });

    // Log with child logger and verify merged context is used
    childLogger.info('child message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"app":"test-app"'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"req_id":"123"'));
  });

  it('respects prettyPrint option', () => {
    // Create logger with prettyPrint disabled
    const plainPino = createPinoCompatible({
      prettyPrint: false,
    });

    // Should still function correctly
    plainPino.info('plain message');
    expect(logSpy).toHaveBeenCalled();
  });

  it('formats timestamps correctly', () => {
    // Mock Date.toISOString for consistent testing
    const mockDate = new Date('2023-01-01T12:00:00Z');
    global.Date = jest.fn(() => mockDate) as unknown as DateConstructor;

    pino.info('timestamp test');

    // Should include the mocked timestamp
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[2023-01-01T12:00:00.000Z]'));

    // Restore original Date
    jest.spyOn(global, 'Date').mockRestore();
  });

  it('handles serialization of complex objects', () => {
    const complexObj = {
      nested: {
        array: [1, 2, 3],
        object: { a: 1, b: 2 },
      },
      fn: function () {
        return true;
      },
    };

    // Should properly serialize complex objects
    pino.info(complexObj);
    expect(logSpy).toHaveBeenCalled();
  });
});
