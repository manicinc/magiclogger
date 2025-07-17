import { createBunyanCompatible, BunyanCompatibleLogger } from '../../../src/compatibility/Bunyan';
import { Logger } from '../../../src/Logger';

describe('BunyanCompatibleLogger', () => {
  let logger: BunyanCompatibleLogger;

  beforeEach(() => {
    logger = createBunyanCompatible({ name: 'test-app' });
  });

  it('should create a Bunyan-compatible logger', () => {
    expect(logger).toBeInstanceOf(BunyanCompatibleLogger);
    expect(logger.name).toBe('test-app');
  });

  it('should log messages with Bunyan-style format', () => {
    const spy = jest.spyOn(Logger.prototype, 'info').mockImplementation(jest.fn());
    logger.info('test message');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('test message'));
    spy.mockRestore();
  });

  it('should handle object logging', () => {
    const spy = jest.spyOn(Logger.prototype, 'info').mockImplementation(jest.fn());
    logger.info({ userId: 123 }, 'user action');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('userId'));
    spy.mockRestore();
  });

  it('should support different log levels', () => {
    const infoSpy = jest.spyOn(Logger.prototype, 'info').mockImplementation(jest.fn());
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(jest.fn());

    logger.info('info message');
    logger.error('error message');
    logger.warn('warn message');

    expect(infoSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();

    infoSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
