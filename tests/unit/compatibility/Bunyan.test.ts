import { createBunyanCompatible } from '../../../src/compatibility/Bunyan';
import { Logger } from '../../../src/Logger';
import * as os from 'os';

describe('BunyanCompatibleLogger', () => {
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('formats messages with name, pid, and hostname', () => {
    const bunyan = createBunyanCompatible({
      name: 'test-bunyan',
      showName: true,
      showPid: true,
      showHostname: true,
    });

    bunyan.info('test message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[test-bunyan]'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`[pid:${process.pid}]`));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`[host:`));
  });

  it('handles os.hostname errors gracefully', () => {
    const hostnameSpy = jest.spyOn(os, 'hostname').mockImplementation(() => {
      throw new Error('fail');
    });

    const bunyan = createBunyanCompatible({
      name: 'error-host',
      showName: true,
      showPid: true,
      showHostname: true,
    });

    expect(() => bunyan.info('safe despite error')).not.toThrow();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[error-host]'));
    hostnameSpy.mockRestore();
  });

  it('respects showName=false', () => {
    const bunyan = createBunyanCompatible({
      name: 'hidden-name',
      showName: false,
    });

    bunyan.info('no name');
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('[hidden-name]'));
  });

  it('respects showPid and showHostname', () => {
    const bunyan = createBunyanCompatible({
      name: 'flags',
      showPid: true,
      showHostname: false,
    });

    bunyan.info('flags');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[pid:'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('[host:'));
  });

  it('respects default formatting values', () => {
    const bunyan = createBunyanCompatible({ name: 'defaults' });

    expect(bunyan['showName']).toBe(true);
    expect(bunyan['showPid']).toBe(false);
    expect(bunyan['showHostname']).toBe(false);
  });

  it('implements all standard and custom log levels', () => {
    const bunyan = createBunyanCompatible({ name: 'levels' });

    bunyan.log('trace', 'trace msg');
    bunyan.log('debug', 'debug msg');
    bunyan.log('info', 'info msg');
    bunyan.log('warn', 'warn msg');
    bunyan.log('error', 'error msg');
    bunyan.log('fatal', 'fatal msg');
    bunyan.log('custom', 'custom msg');

    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('debug msg'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('info msg'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warn msg'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error msg'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
    expect(customSpy).toHaveBeenCalledWith(expect.any(String), ['white'], 'CUSTOM');
  });

  it('supports object+message input', () => {
    const bunyan = createBunyanCompatible({ name: 'obj' });

    const data = { foo: 'bar' };
    bunyan.info(data, 'details:');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('details:'));
  });

  it('logs serialized object without message', () => {
    const bunyan = createBunyanCompatible({ name: 'solo' });

    const obj = { test: true };
    bunyan.info(obj);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"test":true'));
  });

  it('allows custom serializer', () => {
    const serializer = jest.fn(() => 'CUSTOM_SERIALIZED');
    const bunyan = createBunyanCompatible({
      name: 'serializer',
      serializer,
    });

    bunyan.info({ x: 1 });
    expect(serializer).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('CUSTOM_SERIALIZED'));
  });

  it('handles failing serializer safely', () => {
    const serializer = jest.fn(() => {
      throw new Error('fail');
    });

    const bunyan = createBunyanCompatible({
      name: 'fail-safe',
      serializer,
    });

    bunyan.info({ oops: true });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Error serializing object:'));
  });
  it('serializes circular objects safely', () => {
    const bunyan = createBunyanCompatible({ name: 'circular' });

    // Declare object and assign circular reference
    const obj: Record<string, unknown> = {};
    (obj as Record<string, unknown>)['self'] = obj;

    // Call logger with single object argument
    bunyan.info(obj);

    // Assert output contains circular placeholder
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Circular]'));
  });
});
