import { createBunyanCompatible, BunyanCompatibleLogger } from '../../../src/compatibility/Bunyan';

describe('BunyanCompatibleLogger', () => {
  let logger: BunyanCompatibleLogger;

  beforeEach(() => {
    logger = createBunyanCompatible({ name: 'test-app' });
  });

  it('should create a Bunyan-compatible logger', () => {
    expect(logger).toBeInstanceOf(BunyanCompatibleLogger);
    expect(logger.loggerName).toBe('test-app');
  });

  it('should log messages with Bunyan-style format', () => {
    const spy = jest.spyOn(logger, 'log').mockImplementation(jest.fn());
    logger.info('test message');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('test message'), 'info');
    spy.mockRestore();
  });

  it('should handle object logging', () => {
    const spy = jest.spyOn(logger, 'log').mockImplementation(jest.fn());
    logger.info({ userId: 123 }, 'user action');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('userId'), 'info');
    spy.mockRestore();
  });

  it('should support different log levels', () => {
    const infoSpy = jest.spyOn(logger, 'log').mockImplementation(jest.fn());
    const errorSpy = jest.spyOn(logger, 'log').mockImplementation(jest.fn());
    const warnSpy = jest.spyOn(logger, 'log').mockImplementation(jest.fn());

    logger.info('info message');
    logger.error('error message');
    logger.warn('warn message');

    expect(infoSpy).toHaveBeenCalledWith('info message', 'info');
    expect(errorSpy).toHaveBeenCalledWith('error message', 'error');
    expect(warnSpy).toHaveBeenCalledWith('warn message', 'warn');

    infoSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
