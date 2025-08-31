import { NullTransport } from '../../../src/transports/null';
import type { LogEntry } from '../../../src/types/transport';

describe('NullTransport', () => {
  let transport: NullTransport;

  beforeEach(() => {
    transport = new NullTransport();
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
    }
  });

  describe('Constructor', () => {
    it('should create transport with default options', () => {
      const transport = new NullTransport();
      expect(transport).toBeDefined();
      expect(transport.getName()).toBe('null');
      expect(transport.isEnabled()).toBe(true);
    });

    it('should create transport with custom name', () => {
      const transport = new NullTransport({ name: 'custom-null' });
      expect(transport.getName()).toBe('custom-null');
    });

    it('should respect enabled option', () => {
      const transport = new NullTransport({ enabled: false });
      expect(transport.isEnabled()).toBe(false);
    });

    it('should set silent mode by default', () => {
      const transport = new NullTransport();
      // Silent mode is internal, but we can verify it doesn't throw
      expect(transport).toBeDefined();
    });

    it('should accept custom level', () => {
      const transport = new NullTransport({ level: 'error' });
      expect(transport).toBeDefined();
    });

    it('should accept custom format', () => {
      const transport = new NullTransport({ format: 'plain' });
      expect(transport).toBeDefined();
    });
  });

  describe('Logging', () => {
    it('should not throw when logging entries', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
      };

      await expect(transport.log(entry)).resolves.not.toThrow();
    });

    it('should handle multiple log entries', async () => {
      const entries: LogEntry[] = [
        {
          id: 'test-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          timestampMs: Date.now(),
          level: 'info',
          message: 'Message 1',
        },
        {
          id: 'test-2',
          timestamp: '2024-01-01T00:00:01.000Z',
          timestampMs: Date.now() + 1000,
          level: 'error',
          message: 'Message 2',
        },
      ];

      for (const entry of entries) {
        await expect(transport.log(entry)).resolves.not.toThrow();
      }
    });

    it('should handle entries with metadata', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
        context: {
          userId: '12345',
          requestId: 'req-abc',
        },
        metadata: {
          hostname: 'test-host',
          pid: 1234,
        },
      };

      await expect(transport.log(entry)).resolves.not.toThrow();
    });
  });

  describe('Lifecycle', () => {
    it('should initialize without errors', async () => {
      const transport = new NullTransport();
      await expect(transport.init()).resolves.not.toThrow();
    });

    it('should close without errors', async () => {
      const transport = new NullTransport();
      await transport.init();
      await expect(transport.close()).resolves.not.toThrow();
    });

    it('should handle multiple init calls', async () => {
      const transport = new NullTransport();
      await transport.init();
      await expect(transport.init()).resolves.not.toThrow();
    });

    it('should handle close without init', async () => {
      const transport = new NullTransport();
      await expect(transport.close()).resolves.not.toThrow();
    });
  });

  describe('Batching', () => {
    it('should not support batching', () => {
      expect(transport.supportsBatching()).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle high volume of logs efficiently', async () => {
      // Pre-create log entry template to minimize object creation overhead
      const timestamp = new Date().toISOString();
      const timestampMs = Date.now();
      const baseEntry = {
        timestamp,
        timestampMs,
        level: 'info' as const,
        message: '',
      };

      // Warm up the transport
      await transport.log({ ...baseEntry, id: 'warmup' });

      const startTime = Date.now();
      const numLogs = 1000;

      const promises = [];
      for (let i = 0; i < numLogs; i++) {
        promises.push(
          transport.log({
            ...baseEntry,
            id: `test-${i}`,
            message: `Message ${i}`,
          })
        );
      }

      await Promise.all(promises);

      const duration = Date.now() - startTime;
      // NullTransport with optimized no-op should be fast
      // In CI environments with limited resources, Promise.all with 1000 promises
      // can take longer due to event loop scheduling overhead
      expect(duration).toBeLessThan(3000); // Less than 3 seconds for 1k no-op logs

      // Also verify it's reasonably fast per operation
      const avgTimePerLog = duration / numLogs;
      expect(avgTimePerLog).toBeLessThan(3); // Less than 3ms per log on average
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info',
        message: '',
      };

      await expect(transport.log(entry)).resolves.not.toThrow();
    });

    it('should handle very large messages', async () => {
      const largeMessage = 'x'.repeat(1000000); // 1MB message
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info',
        message: largeMessage,
      };

      await expect(transport.log(entry)).resolves.not.toThrow();
    });

    it('should handle special characters in messages', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: Date.now(),
        level: 'info',
        message: '特殊文字 🎉 \n\t\r',
      };

      await expect(transport.log(entry)).resolves.not.toThrow();
    });
  });
});
