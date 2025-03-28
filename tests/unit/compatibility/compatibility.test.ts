import {
  enhanceConsole,
  createWinstonCompatible,
  createBunyanCompatible,
  createPinoCompatible,
  type EnhancedConsole,
} from '../../../src/compatibility';
import { Logger } from '../../../src/Logger';

const noop = () => undefined;

beforeEach(() => {
  // Suppress actual console output in tests
  jest.spyOn(console, 'log').mockImplementation(noop);
  jest.spyOn(console, 'warn').mockImplementation(noop);
  jest.spyOn(console, 'error').mockImplementation(noop);
  jest.spyOn(console, 'info').mockImplementation(noop);
  jest.spyOn(console, 'debug').mockImplementation(noop);
});

afterEach(() => {
  jest.restoreAllMocks();
  const extendedConsole = console as EnhancedConsole;
  if (extendedConsole.restoreOriginalConsole) extendedConsole.restoreOriginalConsole();
});

describe('Magic Logger Compatibility Layer', () => {
  describe('enhanceConsole', () => {
    it('attaches and restores extended console methods', () => {
      const original = console.log;
      const { restoreConsole } = enhanceConsole({ verbose: true });
      const enhanced = console as EnhancedConsole;

      expect(typeof enhanced.header).toBe('function');
      expect(typeof enhanced.success).toBe('function');
      expect(typeof enhanced.colorize).toBe('function');

      restoreConsole();
      expect(console.log).toBe(original);
      expect((console as any).header).toBeUndefined();
    });

    it('prevents recursion and logs safely even if console methods throw', () => {
      const failingImpl = jest.fn(() => {
        throw new Error('fail');
      });
      console.log = failingImpl;

      const { restoreConsole } = enhanceConsole();
      expect(() => console.log('trigger')).not.toThrow();

      restoreConsole();
    });

    it('logs fallback to original when passed multiple args', () => {
      const multiArg = jest.fn();
      console.log = multiArg;

      const { restoreConsole } = enhanceConsole();
      console.log('msg', { a: 1 }, [1, 2]);

      expect(multiArg).toHaveBeenCalledWith('msg', { a: 1 }, [1, 2]);
      restoreConsole();
    });

    it('handles multiple enhanceConsole and restoreConsole without conflict', () => {
      const { restoreConsole: r1 } = enhanceConsole();
      const { header: h1 } = console as EnhancedConsole;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { restoreConsole } = enhanceConsole();

      const { header: h2 } = console as EnhancedConsole;

      expect(h1).not.toBe(h2);
      r1();

      expect((console as EnhancedConsole).header).toBeUndefined();

      const { restoreConsole: r3 } = enhanceConsole();
      expect(typeof (console as EnhancedConsole).header).toBe('function');

      r3();
    });

    it('initializes recursion guard symbol on first enhance', () => {
      delete (console as any).recursionGuard;
      const { restoreConsole } = enhanceConsole();
      expect(typeof (console as any).recursionGuard).not.toBe('undefined');
      restoreConsole();
    });
  });

  describe('createWinstonCompatible', () => {
    const winston = createWinstonCompatible({ verbose: true });

    it('logs info using logger', () => {
      const spy = jest.spyOn(Logger.prototype, 'log');
      winston.info('info');
      expect(spy).toHaveBeenCalledWith('info');
    });

    it('logs custom levels via log(level, msg)', () => {
      const spy = jest.spyOn(Logger.prototype, 'custom');
      winston.log('notice', 'msg');
      expect(spy).toHaveBeenCalledWith('msg', ['white'], 'NOTICE');
    });

    it('supports logger extensions', () => {
      const header = jest.fn();
      jest.spyOn(Logger.prototype, 'header').mockImplementation(header);

      winston.header('My Header');
      expect(header).toHaveBeenCalled();
    });
  });

  describe('createBunyanCompatible', () => {
    const bunyan = createBunyanCompatible({ name: 'test' });

    it('logs object + message', () => {
      const spy = jest.spyOn(Logger.prototype, 'log');
      bunyan.info({ foo: 'bar' }, 'extra');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
    });

    it('logs trace and fatal correctly', () => {
      const err = jest.spyOn(Logger.prototype, 'error');
      const dbg = jest.spyOn(Logger.prototype, 'debug');

      bunyan.trace('trace it');
      bunyan.fatal('fail hard');

      expect(err).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
      expect(dbg).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
    });

    it('handles logging object with no message', () => {
      const log = jest.spyOn(Logger.prototype, 'log');
      bunyan.info({ a: 1 });
      expect(log).toHaveBeenCalledWith(expect.stringMatching(/"a":1/));
    });
  });

  describe('createPinoCompatible', () => {
    const pino = createPinoCompatible({ verbose: true });

    it('logs strings and object+message combos', () => {
      const log = jest.spyOn(Logger.prototype, 'log');
      pino.info('one');
      pino.info(JSON.stringify({ test: true, message: 'and this' }));

      expect(log).toHaveBeenCalledWith('one');
      expect(log).toHaveBeenCalledWith(expect.stringContaining('test'));
    });

    it('supports trace/fatal and formats correctly', () => {
      const err = jest.spyOn(Logger.prototype, 'error');
      const dbg = jest.spyOn(Logger.prototype, 'debug');

      pino.trace('trace msg');
      pino.fatal({ crash: true }, 'crashed');

      expect(dbg).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
      expect(err).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
    });

    it('calls logger methods for all levels', () => {
      const levels = {
        log: jest.spyOn(Logger.prototype, 'log'),
        warn: jest.spyOn(Logger.prototype, 'warn'),
        error: jest.spyOn(Logger.prototype, 'error'),
        debug: jest.spyOn(Logger.prototype, 'debug'),
      };

      pino.info('info');
      pino.warn('warn');
      pino.error('error');
      pino.debug('debug');

      Object.values(levels).forEach(spy => expect(spy).toHaveBeenCalled());
    });
  });
});
