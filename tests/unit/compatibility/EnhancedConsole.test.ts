import { enhanceConsole, type EnhancedConsole } from '../../../src/compatibility';
import { Logger } from '../../../src/Logger';

describe('EnhancedConsole', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => void 0);
    jest.spyOn(console, 'warn').mockImplementation(() => void 0);
    jest.spyOn(console, 'error').mockImplementation(() => void 0);
    jest.spyOn(console, 'info').mockImplementation(() => void 0);
    jest.spyOn(console, 'debug').mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    const extended = console as unknown as EnhancedConsole;
    if (typeof extended.restoreOriginalConsole === 'function') {
      extended.restoreOriginalConsole();
    }
  });

  it('overrides console methods safely', () => {
    const spy = jest.spyOn(Logger.prototype, 'log');
    const { restoreConsole } = enhanceConsole();
    console.log('hello');
    expect(spy).toHaveBeenCalledWith('hello');
    restoreConsole();
  });

  it('delegates complex arguments to original console', () => {
    const logSpy = jest.fn();
    const warnSpy = jest.fn();
    const errSpy = jest.fn();
    const infoSpy = jest.fn();
    const debugSpy = jest.fn();

    console.log = logSpy;
    console.warn = warnSpy;
    console.error = errSpy;
    console.info = infoSpy;
    console.debug = debugSpy;

    const { restoreConsole } = enhanceConsole();

    const obj = { a: 1 };
    const arr = [1, 2];
    const err = new Error('fail');

    console.log('msg', obj, arr);
    console.warn('warn', err);
    console.error('err', obj);
    console.info('info', arr);
    console.debug('debug', obj, err);

    expect(logSpy).toHaveBeenCalledWith('msg', obj, arr);
    expect(warnSpy).toHaveBeenCalledWith('warn', err);
    expect(errSpy).toHaveBeenCalledWith('err', obj);
    expect(infoSpy).toHaveBeenCalledWith('info', arr);
    expect(debugSpy).toHaveBeenCalledWith('debug', obj, err);

    restoreConsole();
  });

  it('adds extended methods to console', () => {
    const { restoreConsole } = enhanceConsole();
    const extended = console as unknown as EnhancedConsole;
    expect(typeof extended.header).toBe('function');
    expect(typeof extended.success).toBe('function');
    expect(typeof extended.colorParts).toBe('function');
    expect(typeof extended.styled).toBe('function');
    expect(typeof extended.custom).toBe('function');
    restoreConsole();
  });

  it('restores original console after enhanceConsole', () => {
    const { restoreConsole } = enhanceConsole();
    restoreConsole();
    expect(console.log).toBe(originalConsole.log);
    expect(console.warn).toBe(originalConsole.warn);
  });

  it('avoids infinite recursion and fallback loops', () => {
    const { restoreConsole } = enhanceConsole();
    expect(() => console.log(console)).not.toThrow();
    expect(() => console.warn(console)).not.toThrow();
    restoreConsole();
  });

  it('initializes recursion guard using Symbol', () => {
    const { restoreConsole } = enhanceConsole();
    const symbols = Object.getOwnPropertySymbols(console);
    const guard = symbols.find(sym => String(sym) === 'Symbol(recursionGuard)');
    expect(guard).toBeDefined();

    // DOUBLE-CAST console to access symbol-based index
    const guardValue = (console as unknown as Record<symbol, unknown>)[guard as symbol];
    expect(guardValue).toBe(false);

    restoreConsole();
  });

  it('handles multiple enhanceConsole calls safely', () => {
    const { restoreConsole: r1 } = enhanceConsole();
    const firstHeader = (console as unknown as EnhancedConsole).header;

    enhanceConsole(); // r2 intentionally unused to test override layering
    const secondHeader = (console as unknown as EnhancedConsole).header;

    expect(firstHeader).not.toBe(secondHeader);

    r1();
    expect((console as unknown as EnhancedConsole).header).toBeUndefined();

    const { restoreConsole: r3 } = enhanceConsole();
    expect(typeof (console as unknown as EnhancedConsole).header).toBe('function');
    r3();
  });

  it('calls correct logger methods by level with recursion guard', () => {
    const { logger, restoreConsole } = enhanceConsole();

    const infoSpy = jest.spyOn(logger, 'info');
    const debugSpy = jest.spyOn(logger, 'debug');
    const warnSpy = jest.spyOn(logger, 'warn');
    const errSpy = jest.spyOn(logger, 'error');
    const logSpy = jest.spyOn(logger, 'log');

    console.info('info msg');
    console.debug('debug msg');
    console.warn('warn msg');
    console.error('error msg');
    console.log('generic');

    expect(infoSpy).toHaveBeenCalledWith('info msg');
    expect(debugSpy).toHaveBeenCalledWith('debug msg');
    expect(warnSpy).toHaveBeenCalledWith('warn msg');
    expect(errSpy).toHaveBeenCalledWith('error msg');
    expect(logSpy).toHaveBeenCalledWith('generic');

    restoreConsole();
  });

  it('handles errors inside logger without recursion failure', () => {
    const errorMock = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {
      throw new Error('Simulated error');
    });

    const { restoreConsole } = enhanceConsole();

    expect(() => {
      console.log('trigger fail');
    }).toThrow('Simulated error');

    errorMock.mockRestore();
    restoreConsole();
  });
});
