import { describe, it, expect, beforeEach } from '@jest/globals';
import { NullTransport } from '../../../src/transports/null';
import type { LogEntry } from '../../../src/types/transport';

describe('NullTransport', () => {
  let transport: NullTransport;
  let mockLogEntry: LogEntry;

  beforeEach(() => {
    transport = new NullTransport();
    mockLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Test message',
      metadata: {},
      tags: [],
      context: {},
    };
  });

  describe('initialization', () => {
    it('should have correct name', () => {
      expect(transport.name).toBe('null');
    });

    it('should be enabled by default', () => {
      expect(transport.enabled).toBe(true);
    });

    it('should initialize without errors', async () => {
      await expect(transport.init()).resolves.toBeUndefined();
    });

    it('should close without errors', async () => {
      await expect(transport.close()).resolves.toBeUndefined();
    });
  });

  describe('shouldLog', () => {
    it('should return true for valid log level', () => {
      expect(transport.shouldLog(mockLogEntry)).toBe(true);
    });

    it('should respect level filtering', () => {
      const errorTransport = new NullTransport({ level: 'error' });
      expect(errorTransport.shouldLog(mockLogEntry)).toBe(false); // info level won't log

      const errorEntry: LogEntry = {
        ...mockLogEntry,
        level: 'error',
      };
      expect(errorTransport.shouldLog(errorEntry)).toBe(true);
    });

    it('should handle all log levels when set to debug', () => {
      const levels = ['debug', 'info', 'warn', 'error', 'fatal'] as const;
      for (const level of levels) {
        const entry: LogEntry = { ...mockLogEntry, level };
        expect(transport.shouldLog(entry)).toBe(true);
      }
    });
  });

  describe('log', () => {
    it('should accept log entries without error', async () => {
      await expect(transport.log(mockLogEntry)).resolves.toBeUndefined();
    });

    it('should respect enabled property', async () => {
      transport.enabled = false;
      await expect(transport.log(mockLogEntry)).resolves.toBeUndefined();
      // No error should be thrown, it just returns early
    });

    it('should handle multiple log calls', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          transport.log({
            ...mockLogEntry,
            message: `Message ${i}`,
          })
        );
      }
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should not throw on various log levels', async () => {
      const levels = ['debug', 'info', 'warn', 'error', 'fatal'] as const;
      for (const level of levels) {
        await expect(
          transport.log({
            ...mockLogEntry,
            level,
          })
        ).resolves.toBeUndefined();
      }
    });

    it('should handle entries with complex metadata', async () => {
      const complexEntry: LogEntry = {
        ...mockLogEntry,
        metadata: {
          nested: {
            deeply: {
              value: 'test',
            },
          },
          array: [1, 2, 3],
          bool: true,
          null: null,
        },
        tags: ['tag1', 'tag2', 'tag3'],
        context: {
          requestId: '123',
          userId: 'user-456',
        },
      };
      await expect(transport.log(complexEntry)).resolves.toBeUndefined();
    });
  });

  describe('flush', () => {
    it('should flush without errors', async () => {
      await expect(transport.flush()).resolves.toBeUndefined();
    });

    it('should flush even when no logs have been sent', async () => {
      await expect(transport.flush()).resolves.toBeUndefined();
    });

    it('should flush after logging', async () => {
      await transport.log(mockLogEntry);
      await expect(transport.flush()).resolves.toBeUndefined();
    });
  });

  describe('performance characteristics', () => {
    it('should have minimal overhead', async () => {
      const startTime = performance.now();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        await transport.log(mockLogEntry);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const opsPerSecond = iterations / (duration / 1000);

      // NullTransport should be very fast (> 80k ops/sec)
      expect(opsPerSecond).toBeGreaterThan(80000);
    });

    it('should not accumulate memory', async () => {
      // Log many entries to ensure no buffering occurs
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(
          transport.log({
            ...mockLogEntry,
            message: `Message ${i}`,
            metadata: { index: i, data: 'x'.repeat(1000) },
          })
        );
      }
      await Promise.all(promises);

      // Transport extends base class so has more properties, but shouldn't accumulate data
      // Just verify it doesn't grow unbounded
      const initialKeys = Object.keys(transport).length;

      // Log more entries
      for (let i = 0; i < 1000; i++) {
        await transport.log(mockLogEntry);
      }

      const finalKeys = Object.keys(transport).length;
      expect(finalKeys).toBe(initialKeys);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined metadata gracefully', async () => {
      const entry: LogEntry = {
        ...mockLogEntry,
        metadata: undefined as any,
      };
      await expect(transport.log(entry)).resolves.toBeUndefined();
    });

    it('should handle circular references in metadata', async () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      const entry: LogEntry = {
        ...mockLogEntry,
        metadata: circular,
      };
      await expect(transport.log(entry)).resolves.toBeUndefined();
    });

    it('should handle very large messages', async () => {
      const largeMessage = 'x'.repeat(1000000); // 1MB string
      const entry: LogEntry = {
        ...mockLogEntry,
        message: largeMessage,
      };
      await expect(transport.log(entry)).resolves.toBeUndefined();
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent init/close/log operations', async () => {
      const operations = [
        transport.init(),
        transport.log(mockLogEntry),
        transport.flush(),
        transport.log(mockLogEntry),
        transport.close(),
        transport.init(),
        transport.log(mockLogEntry),
        transport.flush(),
      ];

      await expect(Promise.all(operations)).resolves.toBeDefined();
    });
  });

  describe('batch operations', () => {
    it('should handle logBatch method', async () => {
      const entries = [
        mockLogEntry,
        { ...mockLogEntry, message: 'Message 2' },
        { ...mockLogEntry, message: 'Message 3' },
      ];
      await expect(transport.logBatch(entries)).resolves.toBeUndefined();
    });

    it('should respect enabled property in logBatch', async () => {
      transport.enabled = false;
      const entries = [mockLogEntry, { ...mockLogEntry, message: 'Message 2' }];
      await expect(transport.logBatch(entries)).resolves.toBeUndefined();
      // Re-enable for other tests
      transport.enabled = true;
    });

    it('should not support batching', () => {
      expect(transport.supportsBatching()).toBe(false);
    });
  });

  describe('constructor options', () => {
    it('should accept custom options', () => {
      const customTransport = new NullTransport({
        name: 'custom-null',
        level: 'error',
        enabled: false,
      });

      expect(customTransport.name).toBe('custom-null');
      expect(customTransport.enabled).toBe(false);
    });

    it('should use default options when not provided', () => {
      const defaultTransport = new NullTransport();
      expect(defaultTransport.name).toBe('null');
      expect(defaultTransport.enabled).toBe(true);
    });
  });
});
