// File: tests/unit/transports/base/implementations/ConsoleTransport.test.ts

import { ConsoleTransport, createConsoleTransport } from '../../../../../src/transports/base/implementations/ConsoleTransport';
import type { LogEntry } from '../../../../../src/types/transport';
import type { ConsoleTransportOptions } from '../../../../../src/transports/base/implementations/ConsoleTransport';

/**
 * Comprehensive test suite for ConsoleTransport class.
 *
 * Tests console output formatting, metadata display, and level mapping.
 */
describe('ConsoleTransport', () => {
  let transport: ConsoleTransport;
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
      enabled: true,
      format: 'plain'
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
      const t = new ConsoleTransport({ name: 'test', format: 'plain' });
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
        showMetadata: true,
        prefix: 'APP',
        consoleMethods: {
          debug: 'log',
          info: 'log',
          warn: 'error',
          error: 'error',
          default: 'info'
        },
        format: 'plain'
      };

      const t = new ConsoleTransport(options);
      expect(t.name).toBe('custom');
      expect(t.enabled).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should init (no-op)', async () => {
      await expect(transport.init()).resolves.not.toThrow();
    });

    it('should accept custom console method mapping without validation', async () => {
      const t = new ConsoleTransport({
        name: 'invalid',
        // Cast to bypass TS while ensuring runtime fallback works
        consoleMethods: { debug: 'notAMethod' as unknown as keyof Console },
        format: 'plain'
      });
      await expect(t.init()).resolves.not.toThrow();
    });
  });

  describe('log formatting (plain)', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should format log with all components', async () => {
      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO timestamp
      expect(out).toContain('INFO   '); // level padded
      expect(out).toContain('[test-logger]');
      expect(out).toContain('{test, unit}');
      expect(out).toContain('Test message');
    });

    it('should skip timestamp when disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-timestamp', showTimestamp: false, format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    });

    it('should skip level when disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-level', showLevel: false, format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).not.toMatch(/INFO\s{3,}/);
    });

    it('should show logger ID when enabled', async () => {
      transport = new ConsoleTransport({ name: 'with-logger-id', showLoggerId: true, format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('[test-logger]');
    });

    it('should show tags when enabled', async () => {
      transport = new ConsoleTransport({ name: 'with-tags', showTags: true, format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('{test, unit}');
    });

    it('should add custom prefix', async () => {
      transport = new ConsoleTransport({ name: 'with-prefix', prefix: 'MyApp', format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('MyApp');
    });

    it('should use plain message when colors disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-colors', useColors: false, format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('Test message');
    });
  });

  describe('console method mapping', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should use correct console method for each level', async () => {
      const levels: Array<[LogEntry['level'], keyof typeof consoleMocks]> = [
        ['debug', 'debug'],
        ['info', 'info'],
        ['warn', 'warn'],
        ['error', 'error']
      ];

      for (const [lvl, method] of levels) {
        // reset spies for clean assertion per level
        Object.values(consoleMocks).forEach(m => m.mockClear());
        await transport.log({ ...mockEntry, level: lvl });
        expect(consoleMocks[method]).toHaveBeenCalled();
      }
    });

    it('should use default method for unknown levels (log)', async () => {
      await transport.log({ ...mockEntry, level: 'custom' as unknown as LogEntry['level'] });
      expect(consoleMocks.log).toHaveBeenCalled();
    });

    it('should respect custom mapping', async () => {
      transport = new ConsoleTransport({
        name: 'custom-methods',
        consoleMethods: { info: 'warn', error: 'log' },
        format: 'plain'
      });
      await transport.init();

      await transport.log({ ...mockEntry, level: 'info' });
      expect(consoleMocks.warn).toHaveBeenCalled();

      await transport.log({ ...mockEntry, level: 'error' });
      expect(consoleMocks.log).toHaveBeenCalled();
    });

    it('should handle success level', async () => {
      await transport.log({ ...mockEntry, level: 'success' });
      expect(consoleMocks.log).toHaveBeenCalled();
    });
  });

  describe('metadata & errors (plain)', () => {
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

      consoleMocks.info.mockClear();
      await transport.log(entryWithError);

      const output = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(output).toContain('Error: TestError - Something went wrong');
      expect(output).toContain('at test.js:1:1');
    });

    it('should display context', async () => {
      transport = new ConsoleTransport({ name: 'with-context', showMetadata: true, format: 'plain' });
      await transport.init();
      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('Context:');
      expect(out).toContain('"test": true');
    });

    it('should display metadata when enabled', async () => {
      transport = new ConsoleTransport({ name: 'with-metadata', showMetadata: true, format: 'plain' });
      await transport.init();
      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('Metadata:');
      expect(out).toContain('"hostname": "test-host"');
    });

    it('should skip metadata when disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-metadata', showMetadata: false, format: 'plain' });
      await transport.init();
      consoleMocks.info.mockClear();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).not.toContain('Metadata');
    });

    it('should skip empty context', async () => {
      transport = new ConsoleTransport({ name: 'empty-context', showMetadata: true, format: 'plain' });
      await transport.init();
      consoleMocks.info.mockClear();
      await transport.log({ ...mockEntry, context: {} });

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).not.toContain('Context:');
    });

    it('should handle error without stack', async () => {
      const entryWithError = { ...mockEntry, error: { name: 'SimpleError', message: 'No stack trace' } };

      consoleMocks.info.mockClear();
      await transport.log(entryWithError);

      const output = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(output).toContain('Error: SimpleError - No stack trace');
    });
  });

  describe('formatting options (json)', () => {
    it('should format as JSON by default', async () => {
      transport = new ConsoleTransport({ name: 'json', format: 'json' });
      await transport.init();
      await transport.log(mockEntry);

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(() => JSON.parse(out)).not.toThrow();
      const parsed = JSON.parse(out) as Record<string, unknown>;
      expect(parsed.message).toBe('Test message');
    });

    it('should format as plain when specified', async () => {
      transport = new ConsoleTransport({ name: 'plain', format: 'plain' });
      await transport.init();
      await transport.log(mockEntry);

      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should use custom formatter when provided', async () => {
      transport = new ConsoleTransport({
        name: 'custom',
        format: 'custom',
        formatter: () => 'CUSTOM-OUTPUT'
      });
      await transport.init();

      await transport.log(mockEntry);
      const out = (consoleMocks.info.mock.calls[0]?.[0] as string);
      expect(out).toBe('CUSTOM-OUTPUT');
    });
  });

  describe('statistics', () => {
    it('should expose processed count after logging', async () => {
      transport = new ConsoleTransport({ name: 'stats', format: 'plain' });
      await transport.init();
      await transport.log(mockEntry);
      const stats = transport.getStats();
      expect(stats.processed).toBeGreaterThanOrEqual(1);
      expect(stats.succeeded).toBeGreaterThanOrEqual(1);
    });
  });

  describe('close', () => {
    it('should close gracefully (no logging expected)', async () => {
      await transport.close();
      expect(transport.enabled).toBe(false);
    });

    it('should not log on close when not debug level', async () => {
      transport = new ConsoleTransport({ name: 'info-close', level: 'info', format: 'plain' });
      await transport.close();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should handle minimal entry', async () => {
      const minimalEntry: LogEntry = {
        id: 'min',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Minimal'
      };

      consoleMocks.info.mockClear();
      await transport.log(minimalEntry);

      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'x'.repeat(1000);
      consoleMocks.info.mockClear();
      await transport.log({ ...mockEntry, message: longMessage, plainMessage: longMessage });

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain(longMessage);
    });

    it('should handle special characters in tags', async () => {
      consoleMocks.info.mockClear();
      await transport.log({ ...mockEntry, tags: ['special:char', 'with,comma', 'with space'] });

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('{special:char, with,comma, with space}');
    });

    it('should handle circular references in context (ignored in output)', async () => {
      const circular: Record<string, unknown> = { a: 1 };
      (circular as Record<string, unknown>)['self'] = circular;

      consoleMocks.info.mockClear();
      await transport.log({ ...mockEntry, context: circular });

      // Should not throw
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should handle null/undefined in context', async () => {
      transport = new ConsoleTransport({ name: 'context-null', showMetadata: true, format: 'plain' });
      await transport.init();

      consoleMocks.info.mockClear();
      await transport.log({
        ...mockEntry,
        context: { nullValue: null, undefinedValue: undefined, valid: 'data' }
      });

      const out = consoleMocks.info.mock.calls[0]?.[0] as string;
      expect(out).toContain('Context:');
      expect(out).toContain('"nullValue": null');
      expect(out).toContain('"valid": "data"');
    });
  });

  describe('factory function', () => {
    it('should create transport with defaults', () => {
      const t = createConsoleTransport();
      expect(t.name).toBe('console');
      expect(t.enabled).toBe(true);
    });

    it('should merge options', () => {
      const t = createConsoleTransport({ name: 'custom-console', showTags: true });
      expect(t.name).toBe('custom-console');
    });
  });
});