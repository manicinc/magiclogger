// File: tests/unit/compatibility/EnhancedConsole.test.ts

import { enhanceConsole } from '../../../src/compatibility/EnhancedConsole';
import { Logger } from '../../../src/Logger';
import type { ColorName } from '../../../src/types';

/**
 * Comprehensive test suite for EnhancedConsole.
 * Tests console enhancement functionality including:
 * - Safe console method overrides
 * - Additional methods (success, header, progress, etc.)
 * - Recursion prevention
 * - Multi-argument delegation
 * - Restoration of original console
 * - Edge cases and error handling
 * 
 * @group compatibility
 * @group console
 */
describe('EnhancedConsole', () => {
  // Store original console methods for restoration
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  // Extended console type for testing
  type ExtendedConsole = Console & {
    success?: (message: string, ...args: unknown[]) => void;
    header?: (title: string, colors?: ColorName[]) => void;
    progress?: (value: number, length?: number, completeChar?: string, incompleteChar?: string) => void;
    custom?: (msg: string, colors?: ColorName[], prefix?: string) => void;
    styled?: (msg: string, preset: string) => void;
    color?: (...colors: ColorName[]) => (text: string) => string;
    colorParts?: (message: string, colorMap: Record<string, ColorName[]>) => string;
    table?: (data: Record<string, unknown>[]) => void;
    [key: string]: unknown;
  };

  beforeEach(() => {
    // Mock all console methods to avoid test output
    jest.spyOn(console, 'log').mockImplementation(() => void 0);
    jest.spyOn(console, 'warn').mockImplementation(() => void 0);
    jest.spyOn(console, 'error').mockImplementation(() => void 0);
    jest.spyOn(console, 'info').mockImplementation(() => void 0);
    jest.spyOn(console, 'debug').mockImplementation(() => void 0);
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
    
    // Ensure console is restored
    Object.assign(console, originalConsole);
    
    // Remove any enhanced methods
    const extended = console as ExtendedConsole;
    const keysToDelete = ['success', 'header', 'progress', 'custom', 'styled', 'color', 'colorParts', 'table'];
    keysToDelete.forEach(key => {
      if (key in extended) {
        // Use Reflect.deleteProperty for proper deletion
        Reflect.deleteProperty(extended, key);
      }
    });
  });

  describe('Basic Enhancement', () => {
    it('should enhance console with additional methods', () => {
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      expect(typeof extended.success).toBe('function');
      expect(typeof extended.header).toBe('function');
      expect(typeof extended.progress).toBe('function');
      expect(typeof extended.custom).toBe('function');
      expect(typeof extended.styled).toBe('function');
      expect(typeof extended.color).toBe('function');
      expect(typeof extended.colorParts).toBe('function');
      
      restoreConsole();
    });

    it('should return logger instance and restore function', () => {
      const result = enhanceConsole();
      
      expect(result).toHaveProperty('logger');
      expect(result).toHaveProperty('restoreConsole');
      expect(result.logger).toBeInstanceOf(Logger);
      expect(typeof result.restoreConsole).toBe('function');
      
      result.restoreConsole();
    });

    it('should accept configuration options', () => {
      const { logger, restoreConsole } = enhanceConsole({
        verbose: true,
        useColors: false,
        id: 'test-console',
      });
      
      expect(logger).toBeInstanceOf(Logger);
      
      restoreConsole();
    });
  });

  describe('Console Method Overrides', () => {
    it('should override console.log to use Logger', () => {
      const logSpy = jest.spyOn(Logger.prototype, 'info');
      const { restoreConsole } = enhanceConsole();
      
      console.log('Test message');
      
      expect(logSpy).toHaveBeenCalledWith('Test message');
      
      restoreConsole();
    });

    it('should override console.info to use Logger', () => {
      const infoSpy = jest.spyOn(Logger.prototype, 'info');
      const { restoreConsole } = enhanceConsole();
      
      console.info('Info message');
      
      expect(infoSpy).toHaveBeenCalledWith('Info message');
      
      restoreConsole();
    });

    it('should override console.warn to use Logger', () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      const { restoreConsole } = enhanceConsole();
      
      console.warn('Warning message');
      
      expect(warnSpy).toHaveBeenCalledWith('Warning message');
      
      restoreConsole();
    });

    it('should override console.error to use Logger', () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const { restoreConsole } = enhanceConsole();
      
      console.error('Error message');
      
      expect(errorSpy).toHaveBeenCalledWith('Error message');
      
      restoreConsole();
    });

    it('should override console.debug to use Logger', () => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      const { restoreConsole } = enhanceConsole();
      
      console.debug('Debug message');
      
      expect(debugSpy).toHaveBeenCalledWith('Debug message');
      
      restoreConsole();
    });
  });

  describe('Multi-Argument Handling', () => {
    it('should delegate multi-argument calls to original console', () => {
      const logSpy = jest.fn();
      const warnSpy = jest.fn();
      const errorSpy = jest.fn();
      const infoSpy = jest.fn();
      const debugSpy = jest.fn();

      // Override console methods with spies
      console.log = logSpy;
      console.warn = warnSpy;
      console.error = errorSpy;
      console.info = infoSpy;
      console.debug = debugSpy;

      const { restoreConsole } = enhanceConsole();

      // Test various multi-argument scenarios
      const obj = { a: 1, b: 2 };
      const arr = [1, 2, 3];
      const err = new Error('Test error');

      console.log('Multiple', obj, arr);
      console.warn('Warning', err);
      console.error('Error', obj, 123);
      console.info('Info', arr, 'extra');
      console.debug('Debug', obj, err, true);

      expect(logSpy).toHaveBeenCalledWith('Multiple', obj, arr);
      expect(warnSpy).toHaveBeenCalledWith('Warning', err);
      expect(errorSpy).toHaveBeenCalledWith('Error', obj, 123);
      expect(infoSpy).toHaveBeenCalledWith('Info', arr, 'extra');
      expect(debugSpy).toHaveBeenCalledWith('Debug', obj, err, true);

      restoreConsole();
    });

    it('should handle complex nested objects', () => {
      const complexSpy = jest.fn();
      console.log = complexSpy;

      const { restoreConsole } = enhanceConsole();

      const complex: Record<string, unknown> = {
        nested: {
          deeply: {
            value: 'deep',
            array: [1, 2, { more: 'nesting' }],
          },
        },
        circular: null as Record<string, unknown> | null,
      };
      complex.circular = complex;

      console.log('Complex', complex, [complex]);

      expect(complexSpy).toHaveBeenCalledWith('Complex', complex, [complex]);

      restoreConsole();
    });
  });

  describe('Enhanced Methods', () => {
    it('should add success method', () => {
      const successSpy = jest.spyOn(Logger.prototype, 'success');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      extended.success?.('Success message');
      
      expect(successSpy).toHaveBeenCalledWith('Success message');
      
      restoreConsole();
    });

    it('should add header method', () => {
      const headerSpy = jest.spyOn(Logger.prototype, 'header');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      extended.header?.('Title');
      expect(headerSpy).toHaveBeenCalledWith('Title', ['brightWhite', 'bgBlue', 'bold']);
      
      extended.header?.('Custom Title', ['red', 'bold']);
      expect(headerSpy).toHaveBeenCalledWith('Custom Title', ['red', 'bold']);
      
      restoreConsole();
    });

    it('should add progress method', () => {
      const progressSpy = jest.spyOn(Logger.prototype, 'progressBar');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      extended.progress?.(50);
      expect(progressSpy).toHaveBeenCalledWith(50, undefined, undefined, undefined);
      
      extended.progress?.(75, 30, '=', '-');
      expect(progressSpy).toHaveBeenCalledWith(75, 30, '=', '-');
      
      restoreConsole();
    });

    it('should add table method', () => {
      const tableSpy = jest.spyOn(Logger.prototype, 'table');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      
      extended.table?.(data);
      expect(tableSpy).toHaveBeenCalledWith(data);
      
      restoreConsole();
    });

    it('should add custom method', () => {
      const customSpy = jest.spyOn(Logger.prototype, 'custom');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      extended.custom?.('Custom message');
      expect(customSpy).toHaveBeenCalledWith('Custom message', undefined, 'LOG');
      
      extended.custom?.('Colored', ['red', 'bold'], 'ERROR');
      expect(customSpy).toHaveBeenCalledWith('Colored', ['red', 'bold'], 'ERROR');
      
      restoreConsole();
    });

    it('should add styled method', () => {
      const styledSpy = jest.spyOn(Logger.prototype, 'styled');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      extended.styled?.('Styled message', 'info');
      expect(styledSpy).toHaveBeenCalledWith('Styled message', 'info');
      
      // Should use 'info' as fallback for invalid preset
      extended.styled?.('Invalid preset', 'invalid');
      expect(styledSpy).toHaveBeenCalledWith('Invalid preset', 'info');
      
      restoreConsole();
    });

    it('should add color method', () => {
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      const colorFn = extended.color?.('red', 'bold');
      expect(typeof colorFn).toBe('function');
      
      const colored = colorFn?.('Test text');
      expect(typeof colored).toBe('string');
      
      restoreConsole();
    });

    it('should add colorParts method', () => {
      const colorPartsSpy = jest.spyOn(Logger.prototype, 'colorParts');
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      const colorMap: Record<string, ColorName[]> = {
        'error': ['red' as ColorName, 'bold' as ColorName],
        'success': ['green' as ColorName],
      };
      
      extended.colorParts?.('error and success', colorMap);
      expect(colorPartsSpy).toHaveBeenCalledWith('error and success', colorMap);
      
      restoreConsole();
    });
  });

  describe('Recursion Prevention', () => {
    it('should add recursion guard symbol', () => {
      const { restoreConsole } = enhanceConsole();
      
      const symbols = Object.getOwnPropertySymbols(console);
      const guardSymbol = symbols.find(sym => String(sym).includes('recursionGuard'));
      
      expect(guardSymbol).toBeDefined();
      
      restoreConsole();
    });

    it('should prevent infinite recursion when logging console object', () => {
      const { restoreConsole } = enhanceConsole();
      
      // These should not cause infinite recursion
      expect(() => console.log(console)).not.toThrow();
      expect(() => console.warn(console)).not.toThrow();
      expect(() => console.error(console)).not.toThrow();
      expect(() => console.info(console)).not.toThrow();
      expect(() => console.debug(console)).not.toThrow();
      
      restoreConsole();
    });

    it('should handle errors in logger methods gracefully', () => {
      const errorMock = jest.spyOn(Logger.prototype, 'info').mockImplementation(() => {
        throw new Error('Logger error');
      });

      const { restoreConsole } = enhanceConsole();

      // Should throw the error (not catch it)
      expect(() => console.log('Test')).toThrow('Logger error');

      errorMock.mockRestore();
      restoreConsole();
    });
  });

  describe('Restoration', () => {
    it('should restore original console methods', () => {
      const { restoreConsole } = enhanceConsole();
      
      // Methods should be enhanced
      expect(console.log).not.toBe(originalConsole.log);
      
      restoreConsole();
      
      // Methods should be restored
      expect(console.log).toBe(originalConsole.log);
      expect(console.warn).toBe(originalConsole.warn);
      expect(console.error).toBe(originalConsole.error);
      expect(console.info).toBe(originalConsole.info);
      expect(console.debug).toBe(originalConsole.debug);
    });

    it('should remove enhanced methods', () => {
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      // Enhanced methods should exist
      expect(extended.success).toBeDefined();
      expect(extended.header).toBeDefined();
      expect(extended.progress).toBeDefined();
      
      restoreConsole();
      
      // Enhanced methods should be removed
      expect(extended.success).toBeUndefined();
      expect(extended.header).toBeUndefined();
      expect(extended.progress).toBeUndefined();
      expect(extended.custom).toBeUndefined();
      expect(extended.styled).toBeUndefined();
      expect(extended.color).toBeUndefined();
      expect(extended.colorParts).toBeUndefined();
    });

    it('should remove recursion guard symbol', () => {
      const { restoreConsole } = enhanceConsole();
      
      let symbols = Object.getOwnPropertySymbols(console);
      let guardSymbol = symbols.find(sym => String(sym).includes('recursionGuard'));
      expect(guardSymbol).toBeDefined();
      
      restoreConsole();
      
      symbols = Object.getOwnPropertySymbols(console);
      guardSymbol = symbols.find(sym => String(sym).includes('recursionGuard'));
      expect(guardSymbol).toBeUndefined();
    });
  });

  describe('Multiple Enhancements', () => {
    it('should handle multiple enhance/restore cycles', () => {
      // First enhancement
      const { restoreConsole: restore1 } = enhanceConsole();
      const extended1 = console as ExtendedConsole;
      expect(extended1.success).toBeDefined();
      
      // Second enhancement (overwrites first)
      const { restoreConsole: restore2 } = enhanceConsole();
      const extended2 = console as ExtendedConsole;
      expect(extended2.success).toBeDefined();
      
      // Restore second enhancement
      restore2();
      
      // First restore should still work
      restore1();
      expect(extended1.success).toBeUndefined();
      
      // Re-enhance
      const { restoreConsole: restore3 } = enhanceConsole();
      const extended3 = console as ExtendedConsole;
      expect(extended3.success).toBeDefined();
      
      // Final restore
      restore3();
      expect(extended3.success).toBeUndefined();
    });

    it('should handle nested enhancements correctly', () => {
      const { restoreConsole: restore1 } = enhanceConsole();
      const firstLog = console.log;
      
      const { restoreConsole: restore2 } = enhanceConsole();
      const secondLog = console.log;
      
      expect(firstLog).not.toBe(secondLog);
      expect(secondLog).not.toBe(originalConsole.log);
      
      restore2();
      expect(console.log).not.toBe(originalConsole.log); // Still enhanced by first
      
      restore1();
      expect(console.log).toBe(originalConsole.log); // Fully restored
    });
  });

  describe('restoreOnExit Option', () => {
    it('should set up exit handler when restoreOnExit is true', () => {
      const processOnSpy = jest.spyOn(process, 'on');
      
      const { restoreConsole } = enhanceConsole({ restoreOnExit: true });
      
      expect(processOnSpy).toHaveBeenCalledWith('exit', expect.any(Function));
      
      restoreConsole();
      processOnSpy.mockRestore();
    });

    it('should not set up exit handler when restoreOnExit is false', () => {
      const processOnSpy = jest.spyOn(process, 'on');
      
      const { restoreConsole } = enhanceConsole({ restoreOnExit: false });
      
      expect(processOnSpy).not.toHaveBeenCalledWith('exit', expect.any(Function));
      
      restoreConsole();
      processOnSpy.mockRestore();
    });

    it('should handle missing process object (browser environment)', () => {
      const originalProcess = global.process;
      Reflect.deleteProperty(global, 'process');
      
      // Should not throw
      expect(() => {
        const { restoreConsole } = enhanceConsole({ restoreOnExit: true });
        restoreConsole();
      }).not.toThrow();
      
      global.process = originalProcess;
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty calls', () => {
      const { restoreConsole } = enhanceConsole();
      const extended = console as ExtendedConsole;
      
      // Should not throw
      expect(() => {
        console.log();
        console.info();
        console.warn();
        console.error();
        console.debug();
        extended.success?.('');
        extended.header?.('');
        extended.custom?.('');
      }).not.toThrow();
      
      restoreConsole();
    });

    it('should handle null and undefined arguments', () => {
      const { restoreConsole } = enhanceConsole();
      
      // Should not throw
      expect(() => {
        console.log(null);
        console.log(undefined);
        console.log(null, undefined);
      }).not.toThrow();
      
      restoreConsole();
    });

    it('should handle special values', () => {
      const { restoreConsole } = enhanceConsole();
      
      // Should not throw
      expect(() => {
        console.log(Infinity);
        console.log(-Infinity);
        console.log(NaN);
        console.log(Symbol('test'));
        console.log(BigInt(123));
      }).not.toThrow();
      
      restoreConsole();
    });

    it('should handle very long messages', () => {
      const { restoreConsole } = enhanceConsole();
      
      const longMessage = 'x'.repeat(10000);
      
      // Should not throw
      expect(() => {
        console.log(longMessage);
      }).not.toThrow();
      
      restoreConsole();
    });
  });

  describe('Integration with Logger', () => {
    it('should use the same logger instance across all methods', () => {
      const { logger, restoreConsole } = enhanceConsole();
      
      const infoSpy = jest.spyOn(logger, 'info');
      const warnSpy = jest.spyOn(logger, 'warn');
      const errorSpy = jest.spyOn(logger, 'error');
      const debugSpy = jest.spyOn(logger, 'debug');
      const successSpy = jest.spyOn(logger, 'success');
      
      console.log('log');
      console.info('info');
      console.warn('warn');
      console.error('error');
      console.debug('debug');
      const extended = console as ExtendedConsole;
      extended.success?.('success');
      
      expect(infoSpy).toHaveBeenCalledTimes(2); // log + info
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      
      restoreConsole();
    });

    it('should pass logger options correctly', () => {
      const { logger, restoreConsole } = enhanceConsole({
        verbose: true,
        useColors: false,
        id: 'enhanced-console',
        tags: ['console', 'enhanced'],
      });
      
      expect(logger).toBeInstanceOf(Logger);
      
      restoreConsole();
    });
  });
});