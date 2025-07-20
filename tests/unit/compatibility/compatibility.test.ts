import {
  enhanceConsole,
  createWinstonCompatible,
  createBunyanCompatible,
  createPinoCompatible,
} from '../../../src/compatibility';
import { Logger } from '../../../src/Logger';
import type { EnhancedConsole } from '../../../src/compatibility'; // Update this to match your project structure

const noop = () => undefined;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(noop);
  jest.spyOn(console, 'warn').mockImplementation(noop);
  jest.spyOn(console, 'error').mockImplementation(noop);
  jest.spyOn(console, 'info').mockImplementation(noop);
  jest.spyOn(console, 'debug').mockImplementation(noop);
});

afterEach(() => {
  jest.restoreAllMocks();
  const extended = console as unknown as Partial<EnhancedConsole>;
  extended.restoreOriginalConsole?.();
});

describe('Magic Logger Compatibility Layer', () => {
  describe('enhanceConsole', () => {
    it('attaches and restores extended console methods', () => {
      const original = console.log;
      const { restoreConsole } = enhanceConsole({ verbose: true });
      const enhanced = console as unknown as EnhancedConsole;

      expect(typeof enhanced.header).toBe('function');
      expect(typeof enhanced.success).toBe('function');

      restoreConsole();
      expect(console.log).toBe(original);
      expect((console as any).header).toBeUndefined();
    });

    it('handles recursion guard and throws safely', () => {
      const failingImpl = jest.fn(() => {
        throw new Error('fail');
      });
      console.log = failingImpl;
      const { restoreConsole } = enhanceConsole();
      expect(() => console.log('trigger')).not.toThrow();
      restoreConsole();
    });

    it('logs multi-arg fallbacks correctly', () => {
      const multiArg = jest.fn();
      console.log = multiArg;
      const { restoreConsole } = enhanceConsole();
      console.log('msg', { a: 1 }, [1, 2]);
      expect(multiArg).toHaveBeenCalledWith('msg', { a: 1 }, [1, 2]);
      restoreConsole();
    });
  });

  describe('createWinstonCompatible', () => {
    const winston = createWinstonCompatible({ verbose: true });

    it('logs info and custom levels', () => {
      const log = jest.spyOn(Logger.prototype, 'log');
      const custom = jest.spyOn(Logger.prototype, 'custom');
      winston.info('info');
      winston.log('notice', 'notice msg');
      expect(log).toHaveBeenCalledWith('info');
      expect(custom).toHaveBeenCalledWith('notice msg', ['white'], 'NOTICE');
    });

    it('calls extended header method if supported', () => {
      // Create a spy on the header method
      const headerSpy = jest.spyOn(Logger.prototype, 'header').mockImplementation(() => {
        // Provide a no-op implementation to satisfy the method call
        return;
      });

      // Create a winston-compatible logger instance
      const winston = createWinstonCompatible({});

      // Call the header method
      winston.header('My Header');

      // Verify the header method was called with the correct argument
      expect(headerSpy).toHaveBeenCalledWith('HEADER: My Header');

      // Restore the original method after the test
      headerSpy.mockRestore();
    });
  });

  describe('createBunyanCompatible', () => {
    const bunyan = createBunyanCompatible({ name: 'bun' });

    it('logs object + message', () => {
      const spy = jest.spyOn(Logger.prototype, 'log');
      bunyan.log('info', JSON.stringify({ foo: 'bar', message: 'extra' }));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('"foo":"bar"'));
    });

    it('logs trace and fatal', () => {
      const err = jest.spyOn(Logger.prototype, 'error');
      const dbg = jest.spyOn(Logger.prototype, 'debug');
      bunyan.log('trace', 'trace it');
      bunyan.log('fatal', 'fail');
      expect(err).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
      expect(dbg).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
    });

    it('logs object without message', () => {
      const log = jest.spyOn(Logger.prototype, 'log');
      bunyan.log('info', JSON.stringify({ a: 1 }));
      expect(log).toHaveBeenCalledWith(expect.stringContaining('"a":1'));
    });
  });

  describe('createPinoCompatible', () => {
    const pino = createPinoCompatible({ verbose: true });

    it('logs strings and JSON strings', () => {
      const spy = jest.spyOn(Logger.prototype, 'log');
      pino.log('info', 'one');
      pino.log('info', JSON.stringify({ test: true, message: 'hi' }));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('one'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('test'));
    });

    it('logs trace and fatal', () => {
      const err = jest.spyOn(Logger.prototype, 'error');
      const dbg = jest.spyOn(Logger.prototype, 'debug');
      pino.log('trace', 'trace msg');
      pino.log('fatal', 'fatal crash');
      expect(dbg).toHaveBeenCalledWith(expect.stringContaining('TRACE:'));
      expect(err).toHaveBeenCalledWith(expect.stringContaining('FATAL:'));
    });

    it('supports all levels', () => {
      const spyMap = {
        log: jest.spyOn(Logger.prototype, 'log'),
        warn: jest.spyOn(Logger.prototype, 'warn'),
        error: jest.spyOn(Logger.prototype, 'error'),
        debug: jest.spyOn(Logger.prototype, 'debug'),
      };

      pino.log('info', 'info');
      pino.log('warn', 'warn');
      pino.log('error', 'error');
      pino.log('debug', 'debug');

      Object.values(spyMap).forEach(spy => expect(spy).toHaveBeenCalled());
    });
  });
});
