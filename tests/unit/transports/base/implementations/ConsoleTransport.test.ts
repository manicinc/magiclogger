// File: tests/unit/transports/base/implementations/ConsoleTransport.test.ts
import { ConsoleTransport, createConsoleTransport } from '../../../../../src/transports/base/implementations/ConsoleTransport';
import type { LogEntry, LogLevel } from '../../../../../src/types/transport';

// Adapted tests for current ConsoleTransport (no external Formatter usage).

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

    consoleMocks = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };

    transport = new ConsoleTransport({
      name: 'console',
      format: 'json'
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
    Object.values(consoleMocks).forEach(m => m.mockRestore());
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const t = new ConsoleTransport({ name: 'test' });
      expect(t.name).toBe('test');
      expect(t.enabled).toBe(true);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        name: 'custom',
        enabled: false as const,
        useColors: false,
        showTimestamp: false,
        showLevel: false,
        showLoggerId: true,
        showTags: true,
        showMetadata: false,
        prefix: 'APP',
        consoleMethods: {
          debug: 'log' as const,
          info: 'log' as const,
          warn: 'error' as const,
          error: 'error' as const
        }
      };
      const t = new ConsoleTransport(customOptions);
      expect(t.name).toBe('custom');
      expect(t.enabled).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should init (no-op)', async () => {
      await expect(transport.init()).resolves.not.toThrow();
    });

    it('should accept custom console method mapping without validation', async () => {
      transport = new ConsoleTransport({
        name: 'custom-map',
        consoleMethods: { info: 'warn', error: 'log' }
      });
      await expect(transport.init()).resolves.not.toThrow();
    });
  });

  describe('log formatting (plain)', () => {
    beforeEach(async () => {
      transport = new ConsoleTransport({
        name: 'plain-console',
        format: 'plain',
        showLoggerId: true,
        showMetadata: true,
        showTags: true,
        showTimestamp: true
      });
      await transport.init();
    });

    it('should format log with all components', async () => {
      await transport.log(mockEntry);
      const call = consoleMocks.info.mock.calls[0]?.[0];
      expect(call).toContain('Test message');
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(call).toMatch(/INFO/);
      expect(call).toContain('[test-logger]');
      expect(call).toMatch(/\{test, unit\}/);
    });

    it('should skip timestamp when disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-ts', format: 'plain', showTimestamp: false });
      await transport.init();
      await transport.log(mockEntry);
      const call = consoleMocks.info.mock.calls[0]?.[0];
      expect(call).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    });

    it('should skip level when disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-level', format: 'plain', showLevel: false });
      await transport.init();
      await transport.log(mockEntry);
      const call = consoleMocks.info.mock.calls[0]?.[0];
      expect(call).not.toMatch(/INFO/);
    });

    it('should show logger ID when enabled', async () => {
      transport = new ConsoleTransport({ name: 'with-id', format: 'plain', showLoggerId: true });
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info.mock.calls[0]?.[0]).toContain('[test-logger]');
    });

    it('should show tags when enabled', async () => {
      transport = new ConsoleTransport({ name: 'with-tags', format: 'plain', showTags: true });
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info.mock.calls[0]?.[0]).toMatch(/\{test, unit\}/);
    });

    it('should add custom prefix', async () => {
      transport = new ConsoleTransport({ name: 'with-prefix', format: 'plain', prefix: 'MyApp' });
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info.mock.calls[0]?.[0]).toContain('MyApp');
    });

    it('should use plain message when colors disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-colors', format: 'plain', useColors: false });
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info).toHaveBeenCalledWith(expect.stringContaining('Test message'));
    });
  });

  describe('console method mapping', () => {
    beforeEach(async () => {
      transport = new ConsoleTransport({ name: 'map', format: 'plain' });
      await transport.init();
    });

    it('should use correct console method for each level', async () => {
      const levels: Array<[LogLevel, keyof typeof consoleMocks]> = [
        ['debug', 'debug'],
        ['info', 'info'],
        ['warn', 'warn'],
        ['error', 'error']
      ];
      for (const [lvl, method] of levels) {
        await transport.log({ ...mockEntry, level: lvl });
        expect(consoleMocks[method]).toHaveBeenCalled();
      }
    });

    it('should use default method for unknown levels (log)', async () => {
      await transport.log({ ...mockEntry, level: 'custom' as LogLevel });
      expect(consoleMocks.log).toHaveBeenCalled();
    });

    it('should respect custom mapping', async () => {
      transport = new ConsoleTransport({ name: 'custom-map', format: 'plain', consoleMethods: { info: 'warn', error: 'log' } });
      await transport.init();
      await transport.log({ ...mockEntry, level: 'info' });
      expect(consoleMocks.warn).toHaveBeenCalled();
      await transport.log({ ...mockEntry, level: 'error' });
      expect(consoleMocks.log).toHaveBeenCalled();
    });
  });

  describe('metadata & errors (plain)', () => {
    beforeEach(async () => {
      transport = new ConsoleTransport({ name: 'meta', format: 'plain', showMetadata: true, showLoggerId: true });
      await transport.init();
    });

    it('should display error details', async () => {
      await transport.log({
        ...mockEntry,
        error: { name: 'TestError', message: 'Something went wrong', stack: 'Error: Something went wrong\n  at test.js:1:1' }
      });
      const output = consoleMocks.info.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('Error: TestError - Something went wrong');
      expect(output).toContain('at test.js:1:1');
    });

    it('should display context', async () => {
      await transport.log(mockEntry);
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).toContain('Test message');
      const full = consoleMocks.info.mock.calls.map(c => c[0]).join('\n');
      expect(full).toContain('Context');
    });

    it('should display metadata', async () => {
      await transport.log(mockEntry);
      const full = consoleMocks.info.mock.calls.map(c => c[0]).join('\n');
      expect(full).toContain('Metadata');
    });

    it('should skip metadata when disabled', async () => {
      transport = new ConsoleTransport({ name: 'no-meta', format: 'plain', showMetadata: false });
      await transport.init();
      await transport.log(mockEntry);
      const full = consoleMocks.info.mock.calls.map(c => c[0]).join('\n');
      expect(full).not.toContain('Metadata');
    });
  });

  describe('formatting options (json)', () => {
    it('should format as JSON by default', async () => {
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info).toHaveBeenCalledWith(expect.stringMatching(/^\{.*\}$/));
    });

    it('should format as plain when specified', async () => {
      transport = new ConsoleTransport({ name: 'plain', format: 'plain' });
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should use custom formatter when provided', async () => {
      transport = new ConsoleTransport({ name: 'custom', format: 'custom', formatter: e => `X:${e.message}` });
      await transport.init();
      await transport.log(mockEntry);
      expect(consoleMocks.info).toHaveBeenCalledWith('X:Test message');
    });
  });

  describe('statistics', () => {
    it('should expose processed count after logging', async () => {
      await transport.init();
      await transport.log(mockEntry);
      const stats = (transport as unknown as { stats: { processed: number } }).stats;
      expect(stats.processed).toBeGreaterThan(0);
    });
  });

  describe('close', () => {
    it('should close gracefully (no logging expected)', async () => {
      await transport.close();
      expect(transport.enabled).toBe(false);
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      transport = new ConsoleTransport({ name: 'edge', format: 'plain', showMetadata: true });
      await transport.init();
    });

    it('should handle minimal entry', async () => {
      const minimal: LogEntry = { id: 'm', timestamp: new Date().toISOString(), timestampMs: Date.now(), level: 'info', message: 'Minimal' };
      await transport.log(minimal);
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'x'.repeat(1000);
      await transport.log({ ...mockEntry, message: longMessage });
      expect(consoleMocks.info.mock.calls[0][0]).toContain(longMessage);
    });

    it('should handle special characters in tags', async () => {
      await transport.log({ ...mockEntry, tags: ['special:char', 'with,comma', 'with space'] });
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).toContain('with,comma');
    });

    it('should handle circular references in context (ignored in output)', async () => {
      const circular: Record<string, unknown> = { a: 1 };
      (circular as unknown as { self?: unknown }).self = circular; // edge case linkage
      await transport.log({ ...mockEntry, context: circular });
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should handle null/undefined in context', async () => {
      await transport.log({ ...mockEntry, context: { nullValue: null, undefinedValue: undefined, valid: 'data' } });
      const full = consoleMocks.info.mock.calls.map(c => c[0]).join('\n');
      expect(full).toContain('nullValue');
      expect(full).toContain('valid');
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