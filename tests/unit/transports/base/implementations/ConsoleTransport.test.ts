// File: tests/unit/transports/base/implementations/ConsoleTransport.test.ts

import { ConsoleTransport } from '../../../../../src/transports/base/implementations/ConsoleTransport';
import { Formatter } from '../../../../../src/core/Formatter';
import type { LogEntry, ConsoleTransportOptions } from '../../../../../src/types/transport';

// Mock Formatter
jest.mock('../../../../../src/core/Formatter');

/**
 * Comprehensive test suite for ConsoleTransport class.
 * 
 * Tests console output formatting, color support, metadata display, and level mapping.
 */
describe('ConsoleTransport', () => {
  let transport: ConsoleTransport;
  let mockFormatter: jest.Mocked<Formatter>;
  let mockEntry: LogEntry;
  let consoleMocks: {
    log: jest.SpyInstance;
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Formatter mock
    mockFormatter = {
      colorize: jest.fn((text, colors) => `[${colors.join(',')}]${text}[/color]`),
      applyPreset: jest.fn(),
      preserveLinks: jest.fn((text) => text),
      formatLine: jest.fn(),
      setTheme: jest.fn()
    } as any;
    (Formatter as jest.MockedClass<typeof Formatter>).mockImplementation(() => mockFormatter);

    // Setup console mocks
    consoleMocks = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };

    transport = new ConsoleTransport({
      name: 'console',
      enabled: true
    });

    mockEntry = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      plainMessage: 'Test message',
      loggerId: 'test-logger',
      tags: ['test', 'unit'],
      context: { test: true, value: 42 },
      metadata: { hostname: 'test-host', pid: 1234 }
    };
  });

  afterEach(() => {
    Object.values(consoleMocks).forEach(mock => mock.mockRestore());
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const t = new ConsoleTransport({ name: 'test' });
      expect(t.name).toBe('test');
      expect(t.enabled).toBe(true);
    });

    it('should initialize with custom options', () => {
      const options: ConsoleTransportOptions = {
        name: 'custom',
        enabled: false,
        useColors: false,
        showTimestamp: false,
        showLevel: false,
        showLoggerId: true,
        showTags: true,
        showMetadata: false,
        prefix: 'APP',
        consoleMethods: {
          debug: 'log',
          info: 'log',
          warn: 'error',
          error: 'error',
          default: 'info'
        }
      };

      const t = new ConsoleTransport(options);
      expect(t.name).toBe('custom');
      expect(t.enabled).toBe(false);
    });

    it('should create formatter with color support', () => {
      new ConsoleTransport({ name: 'colors', useColors: true });
      expect(Formatter).toHaveBeenCalledWith(true);
    });

    it('should create formatter without color support', () => {
      new ConsoleTransport({ name: 'no-colors', useColors: false });
      expect(Formatter).toHaveBeenCalledWith(false);
    });
  });

  describe('initialization', () => {
    it('should validate console methods', async () => {
      await expect(transport.init()).resolves.not.toThrow();
    });

    it('should throw for invalid console methods', async () => {
      transport = new ConsoleTransport({
        name: 'invalid',
        consoleMethods: {
          debug: 'notAMethod' as any
        }
      });

      await expect(transport.init()).rejects.toThrow("Console method 'notAMethod' does not exist");
    });

    it('should validate all configured methods', async () => {
      transport = new ConsoleTransport({
        name: 'multi',
        consoleMethods: {
          debug: 'log',
          info: 'info',
          warn: 'warn',
          error: 'error',
          default: 'debug'
        }
      });

      await expect(transport.init()).resolves.not.toThrow();
    });
  });

  describe('log formatting', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should format log with all components', async () => {
      await transport.log(mockEntry);

      // Check formatter was called for each component
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        expect.stringMatching(/\d{2}:\d{2}:\d{2}\.\d{3}/), // timestamp
        ['gray']
      );
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[INFO   ]', expect.any(Array));
      
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should skip timestamp when disabled', async () => {
      transport = new ConsoleTransport({
        name: 'no-timestamp',
        showTimestamp: false
      });
      await transport.init();

      await transport.log(mockEntry);

      const colorizeCallsForTimestamp = mockFormatter.colorize.mock.calls
        .filter(call => call[0].match(/\d{2}:\d{2}:\d{2}/));
      expect(colorizeCallsForTimestamp).toHaveLength(0);
    });

    it('should skip level when disabled', async () => {
      transport = new ConsoleTransport({
        name: 'no-level',
        showLevel: false
      });
      await transport.init();

      await transport.log(mockEntry);

      const colorizeCallsForLevel = mockFormatter.colorize.mock.calls
        .filter(call => call[0].includes('[INFO'));
      expect(colorizeCallsForLevel).toHaveLength(0);
    });

    it('should show logger ID when enabled', async () => {
      transport = new ConsoleTransport({
        name: 'with-logger-id',
        showLoggerId: true
      });
      await transport.init();

      await transport.log(mockEntry);

      expect(mockFormatter.colorize).toHaveBeenCalledWith('[test-logger]', ['blue']);
    });

    it('should show tags when enabled', async () => {
      transport = new ConsoleTransport({
        name: 'with-tags',
        showTags: true
      });
      await transport.init();

      await transport.log(mockEntry);

      expect(mockFormatter.colorize).toHaveBeenCalledWith('[test,unit]', ['magenta']);
    });

    it('should add custom prefix', async () => {
      transport = new ConsoleTransport({
        name: 'with-prefix',
        prefix: 'MyApp'
      });
      await transport.init();

      await transport.log(mockEntry);

      expect(mockFormatter.colorize).toHaveBeenCalledWith('[MyApp]', ['magenta', 'bold']);
    });

    it('should use colored message when colors enabled', async () => {
      await transport.log(mockEntry);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });

    it('should use plain message when colors disabled', async () => {
      transport = new ConsoleTransport({
        name: 'no-colors',
        useColors: false
      });
      await transport.init();
      
      // Reset mock to return plain text
      mockFormatter.colorize.mockImplementation(text => text);

      await transport.log(mockEntry);

      expect(consoleMocks.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });
  });

  describe('console method mapping', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should use correct console method for each level', async () => {
      const levels: Array<[string, keyof typeof consoleMocks]> = [
        ['debug', 'debug'],
        ['info', 'info'],
        ['warn', 'warn'],
        ['error', 'error']
      ];

      for (const [level, method] of levels) {
        await transport.log({ ...mockEntry, level: level as any });
        expect(consoleMocks[method]).toHaveBeenCalled();
      }
    });

    it('should use default method for unknown levels', async () => {
      await transport.log({ ...mockEntry, level: 'custom' as any });
      expect(consoleMocks.log).toHaveBeenCalled();
    });

    it('should respect custom method mapping', async () => {
      transport = new ConsoleTransport({
        name: 'custom-methods',
        consoleMethods: {
          info: 'warn',
          error: 'log'
        }
      });
      await transport.init();

      await transport.log({ ...mockEntry, level: 'info' });
      expect(consoleMocks.warn).toHaveBeenCalled();

      await transport.log({ ...mockEntry, level: 'error' });
      expect(consoleMocks.log).toHaveBeenCalled();
    });

    it('should handle success level', async () => {
      await transport.log({ ...mockEntry, level: 'success' });
      expect(consoleMocks.log).toHaveBeenCalled(); // Default
    });
  });

  describe('level formatting', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should pad level names', async () => {
      await transport.log({ ...mockEntry, level: 'info' });
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[INFO   ]', expect.any(Array));

      await transport.log({ ...mockEntry, level: 'warn' });
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[WARN   ]', expect.any(Array));
    });

    it('should apply appropriate colors to levels', async () => {
      const levelColors = {
        debug: ['gray', 'italic'],
        info: ['cyan', 'bold'],
        warn: ['yellow', 'bold'],
        error: ['brightRed', 'bold'],
        success: ['green', 'bold']
      };

      for (const [level, expectedColors] of Object.entries(levelColors)) {
        await transport.log({ ...mockEntry, level: level as any });
        
        const colorizeCall = mockFormatter.colorize.mock.calls
          .find(call => call[0].includes(level.toUpperCase()));
        
        expect(colorizeCall?.[1]).toEqual(expectedColors);
      }
    });
  });

  describe('metadata display', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should display error details', async () => {
      const entryWithError = {
        ...mockEntry,
        error: {
          name: 'TestError',
          message: 'Something went wrong',
          stack: 'Error: Something went wrong\n  at test.js:1:1',
          code: 'ERR_TEST'
        }
      };

      await transport.log(entryWithError);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Error:'),
        'Something went wrong'
      );
      expect(consoleMocks.info).toHaveBeenCalledWith(
        'Error: Something went wrong\n  at test.js:1:1'
      );
    });

    it('should display context', async () => {
      await transport.log(mockEntry);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Context:'),
        { test: true, value: 42 }
      );
    });

    it('should display metadata when enabled', async () => {
      await transport.log(mockEntry);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Metadata:'),
        { hostname: 'test-host', pid: 1234 }
      );
    });

    it('should skip metadata when disabled', async () => {
      transport = new ConsoleTransport({
        name: 'no-metadata',
        showMetadata: false
      });
      await transport.init();

      await transport.log(mockEntry);

      const metadataCalls = consoleMocks.info.mock.calls
        .filter(call => call[0]?.includes('Metadata:'));
      expect(metadataCalls).toHaveLength(0);
    });

    it('should skip empty context', async () => {
      await transport.log({ ...mockEntry, context: {} });

      const contextCalls = consoleMocks.info.mock.calls
        .filter(call => call[0]?.includes('Context:'));
      expect(contextCalls).toHaveLength(0);
    });

    it('should handle error without stack', async () => {
      const entryWithError = {
        ...mockEntry,
        error: {
          name: 'SimpleError',
          message: 'No stack trace'
        }
      };

      await transport.log(entryWithError);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Error:'),
        'No stack trace'
      );
    });

    it('should display additional error properties', async () => {
      const entryWithError = {
        ...mockEntry,
        error: {
          name: 'CustomError',
          message: 'Test',
          stack: 'stack',
          code: 'ERR_CODE',
          statusCode: 500,
          details: { extra: 'info' }
        }
      };

      await transport.log(entryWithError);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Error Details:'),
        expect.objectContaining({
          code: 'ERR_CODE',
          statusCode: 500,
          details: { extra: 'info' }
        })
      );
    });
  });

  describe('formatting options', () => {
    it('should format as JSON', async () => {
      transport = new ConsoleTransport({
        name: 'json',
        format: 'json'
      });
      await transport.init();

      await transport.log(mockEntry);

      expect(consoleMocks.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\{.*\}$/)
      );
    });

    it('should format as plain text', async () => {
      transport = new ConsoleTransport({
        name: 'plain',
        format: 'plain'
      });
      await transport.init();

      await transport.log(mockEntry);

      expect(consoleMocks.log).toHaveBeenCalled();
    });

    it('should throw for missing custom formatter', async () => {
      transport = new ConsoleTransport({
        name: 'custom',
        format: 'custom'
      });
      await transport.init();

      // Should throw when trying to format
      await expect(transport.log(mockEntry)).rejects.toThrow('Custom formatter not provided');
    });
  });

  describe('statistics', () => {
    it('should include console-specific stats', () => {
      transport = new ConsoleTransport({
        name: 'stats',
        useColors: false,
        showTimestamp: false,
        showLevel: true,
        showLoggerId: true,
        showTags: true,
        showMetadata: false
      });

      const stats = transport.getStats();

      expect(stats.custom).toMatchObject({
        useColors: false,
        showTimestamp: false,
        showLevel: true,
        showLoggerId: true,
        showTags: true,
        showMetadata: false
      });
    });
  });

  describe('close', () => {
    it('should close gracefully', async () => {
      await transport.close();
      
      // Should not throw
      expect(transport.enabled).toBe(false);
    });

    it('should log debug message on close', async () => {
      transport = new ConsoleTransport({
        name: 'debug-close',
        level: 'debug',
        enabled: true
      });

      await transport.close();

      expect(consoleMocks.debug).toHaveBeenCalledWith('[debug-close] Console transport closed');
    });

    it('should not log on close when not debug level', async () => {
      transport = new ConsoleTransport({
        name: 'info-close',
        level: 'info'
      });

      await transport.close();

      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should handle entries without optional fields', async () => {
      const minimalEntry: LogEntry = {
        id: 'min',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Minimal'
      };

      await transport.log(minimalEntry);

      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'x'.repeat(1000);
      await transport.log({ ...mockEntry, message: longMessage });

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining(longMessage)
      );
    });

    it('should handle special characters in tags', async () => {
      await transport.log({
        ...mockEntry,
        tags: ['special:char', 'with,comma', 'with space']
      });

      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        '[special:char,with,comma,with space]',
        ['magenta']
      );
    });

    it('should handle circular references in context', async () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      await transport.log({
        ...mockEntry,
        context: circular
      });

      // Should not throw
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should handle null/undefined in context', async () => {
      await transport.log({
        ...mockEntry,
        context: {
          nullValue: null,
          undefinedValue: undefined,
          valid: 'data'
        }
      });

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Context:'),
        expect.objectContaining({
          nullValue: null,
          undefinedValue: undefined,
          valid: 'data'
        })
      );
    });
  });

  describe('factory function', () => {
    it('should create transport with defaults', () => {
      const { createConsoleTransport } = require('../../../../../src/transports/base/implementations/ConsoleTransport');
      
      const t = createConsoleTransport();
      
      expect(t.name).toBe('console');
      expect(t.enabled).toBe(true);
    });

    it('should merge options', () => {
      const { createConsoleTransport } = require('../../../../../src/transports/base/implementations/ConsoleTransport');
      
      const t = createConsoleTransport({
        name: 'custom-console',
        showTags: true
      });
      
      expect(t.name).toBe('custom-console');
    });
  });
});