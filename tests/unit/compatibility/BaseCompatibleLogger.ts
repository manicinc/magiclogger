import { Logger } from '../../../src/Logger';
import {
  BaseCompatibleLogger,
  LogCompatibilityOptions,
} from '../../../src/compatibility/BaseCompatibleLogger';

import { ColorName } from '../../../src/types';

class TestLogger extends BaseCompatibleLogger {
  log(level: string, message: string): void {
    switch (level) {
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      case 'error':
        this.logger.error(message);
        break;
      case 'debug':
        this.logger.debug(message);
        break;
      case 'trace':
        this.logger.debug(`TRACE: ${message}`);
        break;
      case 'fatal':
        this.logger.error(`FATAL: ${message}`);
        break;
      default:
        if (this.strictLevels) throw new Error(`Unknown log level: ${level}`);
        this.logger.custom(message, ['white'], level.toUpperCase());
    }
  }

  // Forward additional methods to support test coverage
  header(title: string): void {
    this.logger.header(title);
  }

  table(data: Record<string, any>[]): void {
    this.logger.table(data);
  }

  progress(percent: number): void {
    this.logger.progressBar(percent);
  }

  custom(msg: string, colors: ColorName[], prefix = 'LOG'): void {
    this.logger.custom(msg, colors, prefix);
  }

  get magicLogger(): Logger {
    return this.logger;
  }
}

type ProtectedLoggerProperties = {
  logger: Logger;
  name: string;
  serializeObjects: boolean;
  maxSerializationDepth: number;
};

describe('BaseCompatibleLogger (TestLogger)', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(jest.fn());
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('constructs with default options', () => {
    const logger = new TestLogger();
    const privateLogger = logger as unknown as ProtectedLoggerProperties;
    expect(privateLogger.name).toBe('app');
    expect(privateLogger.serializeObjects).toBe(true);
    expect(privateLogger.maxSerializationDepth).toBe(3);
  });

  it('constructs with custom options including strictLevels', () => {
    const options: LogCompatibilityOptions = {
      name: 'custom-app',
      serializeObjects: false,
      maxSerializationDepth: 5,
      strictLevels: true,
    };

    const logger = new TestLogger(options);
    const privateLogger = logger as unknown as ProtectedLoggerProperties;
    expect(privateLogger.name).toBe('custom-app');
    expect(privateLogger.serializeObjects).toBe(false);
    expect(privateLogger.maxSerializationDepth).toBe(5);
  });

  it('logs known levels without error', () => {
    const logger = new TestLogger({ strictLevels: true });
    logger.log('info', 'Hello info');
    logger.log('warn', 'Hello warn');
    logger.log('error', 'Hello error');
    logger.log('debug', 'Hello debug');
    logger.log('trace', 'Hello trace');
    logger.log('fatal', 'Hello fatal');

    expect(logSpy).toHaveBeenCalledWith('Hello info');
    expect(warnSpy).toHaveBeenCalledWith('Hello warn');
    expect(errorSpy).toHaveBeenCalledWith('Hello error');
    expect(debugSpy).toHaveBeenCalledWith('Hello debug');
    expect(debugSpy).toHaveBeenCalledWith('TRACE: Hello trace');
    expect(errorSpy).toHaveBeenCalledWith('FATAL: Hello fatal');
  });

  it('logs custom level when strictLevels is false (default)', () => {
    const customSpy = jest.spyOn(Logger.prototype, 'custom').mockImplementation(jest.fn());
    const logger = new TestLogger();
    logger.log('custom', 'Hello custom');
    expect(customSpy).toHaveBeenCalledWith('Hello custom', ['white'], 'CUSTOM');
  });

  it('throws error on unknown level when strictLevels is true', () => {
    const logger = new TestLogger({ strictLevels: true });
    expect(() => logger.log('custom', 'Invalid log')).toThrow('Unknown log level: custom');
  });

  it('provides access to the magicLogger instance', () => {
    const logger = new TestLogger();
    expect(logger.magicLogger).toBeInstanceOf(Logger);
  });

  it('safely serializes circular and complex objects', () => {
    const logger = new TestLogger();
    const safeSerialize = (logger as any).safeSerialize.bind(logger);
    const circular: any = {};
    circular.self = circular;
    expect(safeSerialize(circular)).toContain('[Circular]');
    expect(safeSerialize(new Error('fail'))).toContain('fail');
    expect(safeSerialize([1, 2, 3])).toBe('[1,2,3]');
  });

  it('handles broken serializers and fallback', () => {
    const failingSerializer = jest.fn(() => {
      throw new Error('fail');
    });
    const logger = new TestLogger({ serializer: failingSerializer });
    const safeSerialize = (logger as any).safeSerialize.bind(logger);
    expect(safeSerialize({ oops: true })).toContain('[Error serializing object');
  });

  it('formats messages with and without objects', () => {
    const logger = new TestLogger();
    const format = (logger as any).formatMessage.bind(logger);
    expect(format('raw')).toBe('raw');
    expect(format({ foo: 1 })).toBe('{"foo":1}');
    expect(format({ bar: 2 }, 'Extra:')).toBe('Extra: {"bar":2}');
  });

  it('implements enhanced logging API methods', () => {
    const headerSpy = jest.spyOn(Logger.prototype, 'header').mockImplementation(jest.fn());
    const tableSpy = jest.spyOn(Logger.prototype, 'table').mockImplementation(jest.fn());
    const progressSpy = jest.spyOn(Logger.prototype, 'progressBar').mockImplementation(jest.fn());
    const customSpy = jest.spyOn(Logger.prototype, 'custom').mockImplementation(jest.fn());

    const logger = new TestLogger();
    logger.header('hello');
    logger.table([{ x: 1 }]);
    logger.progress(50);
    logger.custom('msg', ['red'], 'X');

    expect(headerSpy).toHaveBeenCalled();
    expect(tableSpy).toHaveBeenCalled();
    expect(progressSpy).toHaveBeenCalled();
    expect(customSpy).toHaveBeenCalled();
  });
});
