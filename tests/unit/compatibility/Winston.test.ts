import {
  createWinstonCompatible,
  WinstonCompatibleLogger,
} from '../../../src/compatibility/Winston';
import { Logger } from '../../../src/Logger';

describe('WinstonCompatibleLogger', () => {
  let winston: WinstonCompatibleLogger;
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

    winston = createWinstonCompatible({
      verbose: true,
      writeToDisk: false,
      useColors: true,
      level: 'info',
      timestamp: true,
      timestampFormat: 'ISO',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs messages with ISO timestamps', () => {
    winston.info('iso timestamp');
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T/));
  });

  it('logs messages with epoch timestamps', () => {
    const epochLogger = createWinstonCompatible({
      timestamp: true,
      timestampFormat: 'epoch',
    });
    epochLogger.info('epoch timestamp');
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[\d{10,}]/));
  });

  it('logs messages with HH:mm:ss timestamps', () => {
    const timeLogger = createWinstonCompatible({
      timestamp: true,
      timestampFormat: 'HH:mm:ss',
    });
    timeLogger.info('time timestamp');
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[\d{2}:\d{2}:\d{2}]/));
  });

  it('supports all standard Winston log levels', () => {
    winston.log('info', 'info');
    winston.log('warn', 'warn');
    winston.log('warning', 'warning');
    winston.log('error', 'error');
    winston.log('debug', 'debug');
    winston.log('verbose', 'verbose');
    winston.log('silly', 'silly');
    winston.log('custom', 'custom log');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('info'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warn'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warning'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('debug'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('verbose'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('SILLY:'));
    expect(customSpy).toHaveBeenCalledWith(expect.any(String), ['white'], 'CUSTOM');
  });

  it('logs messages with metadata', () => {
    const meta = { user: 'test', action: 'update' };
    winston.log('info', 'msg with meta', meta);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"user":"test"'));
  });

  it('omits empty metadata from output', () => {
    winston.log('info', 'no metadata', {});
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('no metadata'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('{}'));
  });

  it('supports .verbose() and .silly() as methods', () => {
    winston.verbose('v msg');
    winston.silly('s msg');
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('v msg'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('SILLY: s msg'));
  });

  it('uses sensible defaults for options', () => {
    const defaultLogger = createWinstonCompatible();
    expect(defaultLogger['timestamp']).toBe(false);
    expect(defaultLogger['timestampFormat']).toBe('HH:mm:ss');
    expect(defaultLogger['level']).toBe('info');
  });

  it('supports timestamp rendering with mocked Date', () => {
    const mockISO = '2025-01-01T00:00:00.000Z';
    const mockEpoch = 1735689600000;

    const mockDate = new Date(mockISO);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    mockDate.toISOString = () => mockISO;
    mockDate.getTime = () => mockEpoch;
    mockDate.getHours = () => 0;
    mockDate.getMinutes = () => 0;
    mockDate.getSeconds = () => 0;

    const isoLogger = createWinstonCompatible({ timestamp: true, timestampFormat: 'ISO' });
    isoLogger.info('with mocked ISO');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`[${mockISO}]`));

    const epochLogger = createWinstonCompatible({ timestamp: true, timestampFormat: 'epoch' });
    epochLogger.info('with mocked epoch');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`[${mockEpoch}]`));

    const timeLogger = createWinstonCompatible({ timestamp: true });
    timeLogger.info('with mocked time');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[00:00:00]'));
  });
});
