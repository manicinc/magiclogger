/**
 * @fileoverview Tests for EnhancedConsole utility
 */

import { EnhancedConsole } from '../../../src/utils/EnhancedConsole';

describe('EnhancedConsole', () => {
  let originalConsole: any;
  let mockConsole: any;

  beforeEach(() => {
    // Reset singleton instance
    (EnhancedConsole as any).resetInstance();
    
    originalConsole = { ...console };
    mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      group: jest.fn(),
      groupEnd: jest.fn(),
      table: jest.fn(),
      time: jest.fn(),
      timeEnd: jest.fn(),
      clear: jest.fn(),
      dir: jest.fn(),
      dirxml: jest.fn(),
      count: jest.fn(),
      countReset: jest.fn(),
      assert: jest.fn(),
      profile: jest.fn(),
      profileEnd: jest.fn(),
      timeLog: jest.fn(),
      timeStamp: jest.fn()
    };
    
    // Replace global console
    Object.keys(mockConsole).forEach(key => {
      (console as any)[key] = mockConsole[key];
    });
  });

  afterEach(() => {
    // Restore original console
    Object.keys(originalConsole).forEach(key => {
      (console as any)[key] = originalConsole[key];
    });
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = EnhancedConsole.getInstance();
      const instance2 = EnhancedConsole.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Logging Methods', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      // Console is already mocked in the parent beforeEach
      // Now create the EnhancedConsole instance which will store the mocked console
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should call console.log', () => {
      enhancedConsole.log('test message', { data: 'value' });
      expect(mockConsole.log).toHaveBeenCalledWith('test message', { data: 'value' });
    });

    it('should call console.error', () => {
      enhancedConsole.error('error message');
      expect(mockConsole.error).toHaveBeenCalledWith('error message');
    });

    it('should call console.warn', () => {
      enhancedConsole.warn('warning message');
      expect(mockConsole.warn).toHaveBeenCalledWith('warning message');
    });

    it('should call console.info', () => {
      enhancedConsole.info('info message');
      expect(mockConsole.info).toHaveBeenCalledWith('info message');
    });

    it('should call console.debug', () => {
      enhancedConsole.debug('debug message');
      expect(mockConsole.debug).toHaveBeenCalledWith('debug message');
    });

    it('should call console.trace', () => {
      enhancedConsole.trace('trace message');
      expect(mockConsole.trace).toHaveBeenCalledWith('trace message');
    });

    it('should handle multiple arguments', () => {
      enhancedConsole.log('msg', 1, true, { obj: 'value' }, ['array']);
      expect(mockConsole.log).toHaveBeenCalledWith('msg', 1, true, { obj: 'value' }, ['array']);
    });

    it('should handle no arguments', () => {
      enhancedConsole.log();
      expect(mockConsole.log).toHaveBeenCalledWith();
    });
  });

  describe('Grouping Methods', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should call console.group', () => {
      enhancedConsole.group('Group Label');
      expect(mockConsole.group).toHaveBeenCalledWith('Group Label');
    });

    it('should call console.groupEnd', () => {
      enhancedConsole.groupEnd();
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should handle nested groups', () => {
      enhancedConsole.group('Outer');
      enhancedConsole.group('Inner');
      enhancedConsole.groupEnd();
      enhancedConsole.groupEnd();
      
      expect(mockConsole.group).toHaveBeenCalledTimes(2);
      expect(mockConsole.groupEnd).toHaveBeenCalledTimes(2);
    });
  });

  describe('Table Method', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should call console.table with data', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ];
      enhancedConsole.table(data);
      expect(mockConsole.table).toHaveBeenCalledWith(data);
    });

    it('should call console.table with columns', () => {
      const data = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } };
      const columns = ['x'];
      enhancedConsole.table(data, columns);
      expect(mockConsole.table).toHaveBeenCalledWith(data, columns);
    });
  });

  describe('Timing Methods', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should call console.time', () => {
      enhancedConsole.time('timer1');
      expect(mockConsole.time).toHaveBeenCalledWith('timer1');
    });

    it('should call console.timeEnd', () => {
      enhancedConsole.timeEnd('timer1');
      expect(mockConsole.timeEnd).toHaveBeenCalledWith('timer1');
    });

    it('should call console.timeLog', () => {
      enhancedConsole.timeLog('timer1', 'checkpoint');
      expect(mockConsole.timeLog).toHaveBeenCalledWith('timer1', 'checkpoint');
    });
  });

  describe('Utility Methods', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should call console.clear', () => {
      enhancedConsole.clear();
      expect(mockConsole.clear).toHaveBeenCalled();
    });

    it('should call console.dir', () => {
      const obj = { key: 'value' };
      const options = { depth: 2 };
      enhancedConsole.dir(obj, options);
      expect(mockConsole.dir).toHaveBeenCalledWith(obj, options);
    });

    it('should call console.dirxml', () => {
      const element = { tag: 'div' };
      enhancedConsole.dirxml(element);
      expect(mockConsole.dirxml).toHaveBeenCalledWith(element);
    });

    it('should call console.count', () => {
      enhancedConsole.count('counter1');
      expect(mockConsole.count).toHaveBeenCalledWith('counter1');
    });

    it('should call console.countReset', () => {
      enhancedConsole.countReset('counter1');
      expect(mockConsole.countReset).toHaveBeenCalledWith('counter1');
    });

    it('should call console.assert', () => {
      enhancedConsole.assert(false, 'Assertion failed');
      expect(mockConsole.assert).toHaveBeenCalledWith(false, 'Assertion failed');
    });
  });

  describe('Profiling Methods', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should call console.profile if available', () => {
      enhancedConsole.profile('profile1');
      expect(mockConsole.profile).toHaveBeenCalledWith('profile1');
    });

    it('should call console.profileEnd if available', () => {
      enhancedConsole.profileEnd('profile1');
      expect(mockConsole.profileEnd).toHaveBeenCalledWith('profile1');
    });
  });

  describe('Custom Methods', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should provide custom method signatures', () => {
      expect(typeof enhancedConsole.success).toBe('function');
      expect(typeof enhancedConsole.failure).toBe('function');
      expect(typeof enhancedConsole.highlight).toBe('function');
      expect(typeof enhancedConsole.box).toBe('function');
    });

    it('should call success method', () => {
      enhancedConsole.success('Success message');
      expect(mockConsole.log).toHaveBeenCalled();
    });

    it('should call failure method', () => {
      enhancedConsole.failure('Failure message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should call highlight method', () => {
      enhancedConsole.highlight('Highlighted message');
      expect(mockConsole.log).toHaveBeenCalled();
    });

    it('should call box method', () => {
      enhancedConsole.box('Boxed message');
      expect(mockConsole.log).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should handle console method not existing', () => {
      delete (console as any).profile;
      expect(() => enhancedConsole.profile('test')).not.toThrow();
    });

    it('should handle errors in console methods gracefully', () => {
      mockConsole.log.mockImplementation(() => {
        throw new Error('Console error');
      });
      
      expect(() => enhancedConsole.log('test')).not.toThrow();
    });
  });

  describe('Special Cases', () => {
    let enhancedConsole: EnhancedConsole;

    beforeEach(() => {
      enhancedConsole = EnhancedConsole.getInstance();
    });

    it('should handle circular references', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      
      enhancedConsole.log(obj);
      expect(mockConsole.log).toHaveBeenCalledWith(obj);
    });

    it('should handle undefined and null', () => {
      enhancedConsole.log(undefined, null);
      expect(mockConsole.log).toHaveBeenCalledWith(undefined, null);
    });

    it('should handle symbols', () => {
      const sym = Symbol('test');
      enhancedConsole.log(sym);
      expect(mockConsole.log).toHaveBeenCalledWith(sym);
    });

    it('should handle BigInt', () => {
      const big = BigInt(123);
      enhancedConsole.log(big);
      expect(mockConsole.log).toHaveBeenCalledWith(big);
    });
  });
});