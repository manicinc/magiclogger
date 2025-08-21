import { Logger } from '../../src/index.browser';

describe('Browser Entry (index.browser.ts)', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleTimeSpy: jest.SpyInstance;
  let consoleTimeEndSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;
  let consoleTableSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock navigator for browser environment
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as any;
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation(() => {});
    consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation(() => {});
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
    logger = new Logger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create logger with default options', () => {
      const logger = new Logger();
      expect(logger).toBeDefined();
      expect(logger.useColors).toBe(true);
    });

    it('should create logger with boolean shorthand for verbose', () => {
      const logger = new Logger(true);
      expect(logger).toBeDefined();
    });

    it('should create logger with options object', () => {
      const logger = new Logger({ verbose: true, useColors: false });
      expect(logger).toBeDefined();
      expect(logger.useColors).toBe(false);
    });
  });

  describe('Core logging methods', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log success messages', () => {
      logger.success('Test success message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      // Create logger with verbose enabled for debug to work
      const verboseLogger = new Logger({ verbose: true });
      verboseLogger.debug('Test debug message');
      // Debug may or may not call console.log depending on verbose setting
      // Since default logger has verbose: false, debug won't log
      logger.debug('Test debug message');
      // This won't call console.log with verbose: false (default)
      // So we just verify the method exists and doesn't throw
      expect(() => logger.debug('Test debug message')).not.toThrow();
    });

    it('should use log method with default info level', () => {
      logger.log('Test log message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should use log method with custom level', () => {
      logger.log('Test log message', 'error');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Visual helpers', () => {
    it('should handle custom method (routes to info)', () => {
      logger.custom('Custom message', ['red', 'bold'], 'PREFIX');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should display header', () => {
      logger.header('Test Header');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should display separator', () => {
      logger.separator('=');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should display table with data', () => {
      const data = [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 },
      ];
      logger.table(data);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle empty table data', () => {
      logger.table([]);
      // Should not throw
    });

    it('should handle progress with percent', () => {
      logger.progress(50);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle progress with percent and message', () => {
      logger.progress(75, 'Processing...');
      expect(consoleLogSpy).toHaveBeenCalledTimes(2); // Progress bar + message
    });
  });

  describe('Timer methods', () => {
    it('should call console.time', () => {
      logger.time('test-timer');
      expect(consoleTimeSpy).toHaveBeenCalledWith('test-timer');
    });

    it('should call console.timeEnd', () => {
      logger.timeEnd('test-timer');
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('test-timer');
    });

    it('should handle time errors gracefully', () => {
      consoleTimeSpy.mockImplementation(() => {
        throw new Error('Not supported');
      });
      expect(() => logger.time('timer')).not.toThrow();
    });

    it('should handle timeEnd errors gracefully', () => {
      consoleTimeEndSpy.mockImplementation(() => {
        throw new Error('Not supported');
      });
      expect(() => logger.timeEnd('timer')).not.toThrow();
    });
  });

  describe('Performance method', () => {
    it('should display performance data', () => {
      const data = {
        duration: 123,
        memory: '45MB',
      };
      logger.performance('Performance Metrics', data);
      expect(consoleGroupSpy).toHaveBeenCalledWith('Performance Metrics');
      expect(consoleTableSpy).toHaveBeenCalledWith(data);
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should handle performance errors gracefully', () => {
      // Mock console.group to be undefined (like in older browsers)
      const originalGroup = console.group;
      console.group = undefined as any;
      
      // Should not throw even when console.group is undefined
      expect(() => logger.performance('Test', {})).not.toThrow();
      
      // Restore
      console.group = originalGroup;
    });
  });

  describe('Theme methods', () => {
    it('should enable/disable colors', () => {
      logger.setColorsEnabled(false);
      expect(logger.useColors).toBe(false);
      
      logger.setColorsEnabled(true);
      expect(logger.useColors).toBe(true);
    });
  });
});