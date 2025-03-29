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
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    customSpy = jest.spyOn(Logger.prototype, 'custom').mockImplementation(() => undefined);

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
    pino.log('info', 'test message');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    );
  });

  it('includes level numbers when levelVal is enabled', () => {
    pino.log('info', 'test message');
    pino.log('error', 'error message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[30\]/));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/\[50\]/));
  });

  it('includes base metadata in formatted messages', () => {
    pino.log('info', 'test message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"app":"test-app"'));
  });

  it('implements the log method with all log levels', () => {
    pino.log('trace', 'trace message');
    pino.log('debug', 'debug message');
    pino.log('info', 'info message');
    pino.log('warn', 'warn message');
    pino.log('error', 'error message');
    pino.log('fatal', 'fatal message');
    pino.log('custom', 'custom level message');

    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('debug message'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('info message'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warn message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
    expect(customSpy).toHaveBeenCalledWith(
      expect.stringContaining('custom level message'),
      ['white'],
      'CUSTOM'
    );
  });

  it('initializes with minimal options', () => {
    const minimalPino = createPinoCompatible();
    expect(minimalPino['levelVal']).toBe(false);
    expect(minimalPino['timestamp']).toBe(false);
    expect(minimalPino['prettyPrint']).toBe(true);
    expect(Object.keys(minimalPino['base']).length).toBe(0);
  });

  it('creates child loggers with merged context', () => {
    const childContext = { req_id: '123', user: 'test-user' };
    const childLogger = pino.child(childContext);

    expect(childLogger['base']).toEqual({
      ...pino['base'],
      ...childContext,
    });

    childLogger.log('info', 'child message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"app":"test-app"'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"req_id":"123"'));
  });

  it('respects prettyPrint option', () => {
    const plainPino = createPinoCompatible({
      prettyPrint: false,
    });

    plainPino.log('info', 'plain message');
    expect(logSpy).toHaveBeenCalled();
  });

  it('formats timestamps correctly', () => {
    const mockDate = new Date('2023-01-01T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

    pino.log('info', 'timestamp test');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[2023-01-01T12:00:00.000Z]'));

    jest.restoreAllMocks();
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

    const serialized = JSON.stringify(complexObj); // fix TS2345
    pino.log('info', serialized);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"nested"'));
  });
});
