// File: tests/unit/schema/MagicLogSchema.test.ts

// Jest is configured globally, no imports needed for describe, it, expect
import type { LogEntry } from '../../../src/types/transport';

/**
 * Tests for MagicLog Schema v1 compliance.
 * Ensures all log entries conform to the standardized schema.
 */
describe('MagicLog Schema v1 Compliance', () => {
  describe('Required Fields', () => {
    it('should have all required identity and timing fields', () => {
      const entry: LogEntry = {
        id: '1704067200000-abc123xyz',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test message',
      };

      expect(entry.id).toMatch(/^\d+-[a-z0-9]+$/);
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(entry.timestampMs).toBeGreaterThan(0);
      expect(entry.level).toBeDefined();
      expect(entry.message).toBeDefined();
    });

    it('should accept valid log levels', () => {
      const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'success'];

      validLevels.forEach(level => {
        const entry: LogEntry = {
          id: 'test-123',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: level as any,
          message: 'Test',
        };

        expect(entry.level).toBe(level);
      });
    });
  });

  describe('Optional Fields', () => {
    it('should support schema version', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        schemaVersion: 'v1',
      };

      expect(entry.schemaVersion).toBe('v1');
    });

    it('should support plain message for ANSI-free content', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: '\x1b[31mColored message\x1b[0m',
        plainMessage: 'Colored message',
      };

      expect(entry.message).toContain('\x1b[31m');
      expect(entry.plainMessage).not.toContain('\x1b');
    });

    it('should support logger context fields', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        loggerId: 'my-logger',
        service: 'api-gateway',
        environment: 'production',
        tags: ['http', 'auth', 'api'],
      };

      expect(entry.loggerId).toBe('my-logger');
      expect(entry.service).toBe('api-gateway');
      expect(entry.environment).toBe('production');
      expect(entry.tags).toHaveLength(3);
    });
  });

  describe('Structured Data', () => {
    it('should support arbitrary context data', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'User action',
        context: {
          userId: '12345',
          action: 'login',
          ip: '192.168.1.1',
          nested: {
            browser: 'Chrome',
            version: '120.0',
          },
        },
      };

      expect(entry.context).toBeDefined();
      expect(entry.context?.userId).toBe('12345');
      expect((entry.context?.nested as any).browser).toBe('Chrome');
    });

    it('should support structured error information', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'error',
        message: 'Operation failed',
        error: {
          name: 'ValidationError',
          message: 'Invalid input',
          stack: 'Error: Invalid input\n    at validate()',
          code: 'ERR_VALIDATION',
          cause: { field: 'email', reason: 'invalid format' },
        },
      };

      expect(entry.error).toBeDefined();
      expect(entry.error?.name).toBe('ValidationError');
      expect(entry.error?.code).toBe('ERR_VALIDATION');
      expect(entry.error?.cause).toBeDefined();
    });
  });

  describe('Runtime Metadata', () => {
    it('should support basic runtime metadata', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        metadata: {
          hostname: 'server-01',
          pid: 12345,
          platform: 'linux',
          nodeVersion: 'v20.10.0',
          userAgent: 'Mozilla/5.0...',
        },
      };

      expect(entry.metadata?.hostname).toBe('server-01');
      expect(entry.metadata?.pid).toBe(12345);
      expect(entry.metadata?.platform).toBe('linux');
    });

    it('should support trace metadata for OpenTelemetry', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        metadata: {
          trace: {
            traceId: '0af7651916cd43dd8448eb211c80319c',
            spanId: 'b7ad6b7169203331',
            parentSpanId: '0020000000000001',
            traceFlags: '01',
            traceState: 'vendor1=value1,vendor2=value2',
          },
        },
      };

      expect(entry.metadata?.trace?.traceId).toHaveLength(32);
      expect(entry.metadata?.trace?.spanId).toHaveLength(16);
      expect(entry.metadata?.trace?.traceFlags).toBe('01');
    });

    it('should support resource utilization metadata', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        metadata: {
          resources: {
            memory: {
              rss: 100000000,
              heapTotal: 80000000,
              heapUsed: 60000000,
              external: 10000000,
              arrayBuffers: 5000000,
            },
            cpu: {
              user: 1234567,
              system: 234567,
            },
          },
        },
      };

      expect(entry.metadata?.resources?.memory?.heapUsed).toBe(60000000);
      expect(entry.metadata?.resources?.cpu?.user).toBe(1234567);
    });

    it('should support health indicators', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        metadata: {
          health: {
            timestamp: Date.now(),
            uptime: 3600.5,
            pid: 12345,
          },
        },
      };

      expect(entry.metadata?.health?.uptime).toBe(3600.5);
      expect(entry.metadata?.health?.pid).toBe(12345);
    });
  });

  describe('Distributed Tracing', () => {
    it('should support trace context at root level', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        trace: {
          traceId: '0af7651916cd43dd8448eb211c80319c',
          spanId: 'b7ad6b7169203331',
          parentSpanId: '0020000000000001',
          traceFlags: '01',
          traceState: 'vendor=value',
        },
      };

      expect(entry.trace).toBeDefined();
      expect(entry.trace?.traceId).toHaveLength(32);
      expect(entry.trace?.spanId).toHaveLength(16);
      expect(entry.trace?.parentSpanId).toBeDefined();
    });

    it('should support both root trace and metadata.trace for compatibility', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        trace: {
          traceId: 'root-trace-id',
          spanId: 'root-span-id',
        },
        metadata: {
          trace: {
            traceId: 'metadata-trace-id',
            spanId: 'metadata-span-id',
          },
        },
      };

      // Both should be allowed for backward compatibility
      expect(entry.trace?.traceId).toBe('root-trace-id');
      expect(entry.metadata?.trace?.traceId).toBe('metadata-trace-id');
    });
  });

  describe('Schema Evolution', () => {
    it('should allow additional fields for forward compatibility', () => {
      const entry: LogEntry & { futureField?: string } = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        futureField: 'future value',
      };

      expect(entry.futureField).toBe('future value');
    });

    it('should support extensible metadata', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        metadata: {
          customField: 'custom value',
          nestedCustom: {
            field1: 'value1',
            field2: 123,
          },
        },
      };

      expect(entry.metadata?.customField).toBe('custom value');
      expect(entry.metadata?.nestedCustom).toBeDefined();
    });
  });

  describe('Transport Compatibility', () => {
    it('should provide fields needed for Loki', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        service: 'my-service',
        environment: 'production',
        loggerId: 'logger-1',
      };

      // Loki needs these for labels
      expect(entry.service).toBeDefined();
      expect(entry.environment).toBeDefined();
      expect(entry.level).toBeDefined();
      expect(entry.loggerId).toBeDefined();
    });

    it('should provide fields needed for Elasticsearch', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test message',
        plainMessage: 'Test message',
        tags: ['tag1', 'tag2'],
        context: { key: 'value' },
      };

      // Elasticsearch needs these for indexing
      expect(entry.id).toBeDefined(); // Keyword field
      expect(entry.timestamp).toBeDefined(); // Date field
      expect(entry.message).toBeDefined(); // Text field
      expect(entry.tags).toBeInstanceOf(Array); // Keyword array
    });

    it('should provide fields needed for OTLP', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'Test',
        plainMessage: 'Test', // OTLP should use plain message
        service: 'my-service',
        trace: {
          traceId: '0af7651916cd43dd8448eb211c80319c',
          spanId: 'b7ad6b7169203331',
        },
        metadata: {
          hostname: 'server-01',
        },
      };

      // OTLP needs these fields
      expect(entry.timestampMs).toBeDefined(); // For nanosecond conversion
      expect(entry.plainMessage).toBeDefined(); // For body.stringValue
      expect(entry.trace?.traceId).toBeDefined(); // For trace correlation
      expect(entry.service).toBeDefined(); // For resource.service.name
    });
  });

  describe('ID Generation', () => {
    it('should follow the ID format convention', () => {
      const ids = ['1704067200000-abc123xyz', '1704067200001-def456uvw', '1704067200002-ghi789rst'];

      ids.forEach(id => {
        expect(id).toMatch(/^\d{13}-[a-z0-9]{9}$/);

        const [timestamp, random] = id.split('-');
        expect(parseInt(timestamp)).toBeGreaterThan(0);
        expect(random).toHaveLength(9);
      });
    });
  });

  describe('Timestamp Formats', () => {
    it('should use ISO 8601 format with millisecond precision', () => {
      const timestamps = [
        '2024-01-01T00:00:00.000Z',
        '2024-12-31T23:59:59.999Z',
        '2024-06-15T12:30:45.123Z',
      ];

      timestamps.forEach(timestamp => {
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(new Date(timestamp).toISOString()).toBe(timestamp);
      });
    });

    it('should have matching timestamp and timestampMs', () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
      };

      const dateFromISO = new Date(entry.timestamp).getTime();
      expect(dateFromISO).toBe(entry.timestampMs);
    });
  });
});
