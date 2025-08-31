// File: tests/unit/Logger/Logger.console.test.ts

import { Logger } from '../../../src/Logger';
import type { LogEntry } from '../../../src/types/transport';

/**
 * Test suite for Logger console transport functionality.
 * Verifies that useConsole option properly adds console transport with styled output.
 */
describe('Logger Console Transport', () => {
  let consoleMocks: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    consoleMocks = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    Object.values(consoleMocks).forEach(mock => mock.mockRestore());
  });

  describe('useConsole option', () => {
    it('should add console transport when useConsole is true', async () => {
      const logger = new Logger({
        useConsole: true,
        useColors: false, // Disable colors for easier testing
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info('Test message');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0]?.[0];
      expect(output).toContain('Test message');
    });

    it('should not add console transport when useConsole is false', async () => {
      const logger = new Logger({
        useConsole: false,
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info('Test message');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleMocks.info).not.toHaveBeenCalled();
    });

    it('should add console transport by default (useConsole not specified)', async () => {
      const logger = new Logger({});

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info('Default console test');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0]?.[0];
      expect(output).toContain('Default console test');
    });
  });

  describe('styled console output', () => {
    it('should output plain text format not JSON', async () => {
      const logger = new Logger({
        useConsole: true,
        useColors: false,
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info('Plain text message');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const output = consoleMocks.info.mock.calls[0]?.[0];
      
      // Should NOT be JSON
      expect(() => JSON.parse(output)).toThrow();
      
      // Should be plain text with the message
      expect(output).toContain('Plain text message');
      expect(output).toContain('INFO');
    });

    it('should preserve styled messages in console output', async () => {
      const logger = new Logger({
        useConsole: true,
        useColors: true,
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // Log with angle bracket syntax
      logger.info('<green>Success:</> Operation completed');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const output = consoleMocks.info.mock.calls[0]?.[0];
      
      // Should contain the message (styles would be ANSI codes)
      expect(output).toContain('Success:');
      expect(output).toContain('Operation completed');
      
      // Should NOT show angle brackets
      expect(output).not.toContain('<green>');
      expect(output).not.toContain('</>');
    });

    it('should use appropriate console methods for different log levels', async () => {
      const logger = new Logger({
        useConsole: true,
        verbose: true, // Enable debug level
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleMocks.debug).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
      expect(consoleMocks.info).toHaveBeenCalledWith(expect.stringContaining('Info message'));
      expect(consoleMocks.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
      expect(consoleMocks.error).toHaveBeenCalledWith(expect.stringContaining('Error message'));
    });
  });

  describe('console transport configuration', () => {
    it('should respect verbose option for log level', async () => {
      const logger = new Logger({
        useConsole: true,
        verbose: false, // Should filter out debug messages
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.debug('Debug should be filtered');
      logger.info('Info should show');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleMocks.debug).not.toHaveBeenCalled();
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should list console transport when added', async () => {
      const logger = new Logger({
        useConsole: true,
      });

      // Wait for async transport initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      const transports = logger.listTransports();
      expect(transports).toContain('console');
    });
  });
});