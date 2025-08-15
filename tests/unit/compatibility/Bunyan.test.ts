import {
  createBunyanCompatible,
  BunyanCompatibleLogger,
} from '../../../src/compatibility/loggers/BunyanCompatibleLogger';
import { Logger } from '../../../src/Logger';

describe('BunyanCompatibleLogger', () => {
  let logger: BunyanCompatibleLogger;
  let infoSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock underlying Logger methods
    infoSpy = jest.spyOn(Logger.prototype, 'info').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    logger = createBunyanCompatible({ name: 'test-app' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a Bunyan-compatible logger', () => {
    expect(logger).toBeInstanceOf(BunyanCompatibleLogger);
    expect(logger.getName()).toBe('test-app');
  });

  it('should log messages with Bunyan-style format', () => {
    logger.info('test message');
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('test message'));
  });

  it('should handle object logging', () => {
    logger.info({ userId: 123 }, 'user action');
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('userId'));
  });

  it('should support different log levels', () => {
    logger.info('info message');
    logger.error('error message');
    logger.warn('warn message');

    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('info message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error message'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warn message'));
  });
});
