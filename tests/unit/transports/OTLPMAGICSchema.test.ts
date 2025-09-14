// File: tests/unit/transports/OTLPMAGICSchema.test.ts

// Jest is configured globally, no imports needed for describe, it, expect
const vi = { fn: jest.fn, restoreAllMocks: jest.restoreAllMocks };
import { OTLPTransport } from '../../../src/transports/base/implementations/OTLPTransport';
import type { LogEntry } from '../../../src/types/transport';

interface OTLPAttribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: string;
    doubleValue?: number;
    boolValue?: boolean;
    kvlistValue?: { values: OTLPAttribute[] };
  };
}

interface OTLPLogRecord {
  timeUnixNano: string;
  severityNumber: number;
  severityText: string;
  body: { stringValue: string };
  attributes: OTLPAttribute[];
  traceId?: string;
  spanId?: string;
  flags?: number;
}

interface OTLPRequestBody {
  resourceLogs: Array<{
    scopeLogs: Array<{
      logRecords: OTLPLogRecord[];
    }>;
  }>;
}

/**
 * Tests for OTLP Transport's MAGIC Schema compliance.
 * Ensures proper mapping of MAGIC fields to OTLP format.
 */
describe('OTLP Transport - MAGIC Schema Integration', () => {
  let transport: OTLPTransport;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock fetch for HTTP transport
    mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
      })
    );
    global.fetch = mockFetch as typeof fetch;

    transport = new OTLPTransport({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      endpoint: 'http://localhost:4318',
      protocol: 'http/json',
    });
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
    }
    vi.restoreAllMocks();
  });

  describe('MAGIC Core Fields Mapping', () => {
    it('should map ID and schema version', async () => {
      const entry: LogEntry = {
        id: '1704067200000-abc123xyz',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test message',
        schemaVersion: 'v1',
      };

      await transport.log(entry);
      await transport.flush();

      expect(mockFetch).toHaveBeenCalled();
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Check ID mapping
      const idAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'log.id');
      expect(idAttr?.value.stringValue).toBe('1704067200000-abc123xyz');

      // Check schema version
      const schemaAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'magiclog.schema_version'
      );
      expect(schemaAttr?.value.stringValue).toBe('v1');
    });

    it('should use message field (now always plain text)', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Plain message text',
        styles: [[0, 5, 'red.bold']], // Style info stored separately
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Message is now always plain text
      expect(logRecord.body.stringValue).toBe('Plain message text');
    });

    it('should map service and environment fields', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
        service: 'api-gateway',
        environment: 'production',
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Check service name attribute
      const serviceAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'service.name');
      expect(serviceAttr?.value.stringValue).toBe('api-gateway');

      // Check environment attribute
      const envAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'deployment.environment'
      );
      expect(envAttr?.value.stringValue).toBe('production');
    });
  });

  describe('Distributed Tracing Integration', () => {
    it('should map trace context from root trace field', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
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

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Check trace ID and span ID at root level
      expect(logRecord.traceId).toBe('0af7651916cd43dd8448eb211c80319c');
      expect(logRecord.spanId).toBe('b7ad6b7169203331');

      // Check parent span ID as attribute
      const parentAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'trace.parent_span_id'
      );
      expect(parentAttr?.value.stringValue).toBe('0020000000000001');

      // Check trace flags and state
      const flagsAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'trace.flags');
      expect(flagsAttr?.value.stringValue).toBe('01');

      const stateAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'trace.state');
      expect(stateAttr?.value.stringValue).toBe('vendor=value');
    });

    it('should map trace context from metadata.trace for backward compatibility', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
        metadata: {
          trace: {
            traceId: '0af7651916cd43dd8448eb211c80319c',
            spanId: 'b7ad6b7169203331',
          },
        },
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      expect(logRecord.traceId).toBe('0af7651916cd43dd8448eb211c80319c');
      expect(logRecord.spanId).toBe('b7ad6b7169203331');
    });

    it('should prioritize root trace over metadata.trace', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
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

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Should use root trace, not metadata.trace
      expect(logRecord.traceId).toBe('root-trace-id');
      expect(logRecord.spanId).toBe('root-span-id');
    });
  });

  describe('Runtime Metadata Mapping', () => {
    it('should map hostname and process info', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
        metadata: {
          hostname: 'server-01',
          pid: 12345,
        },
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      const hostnameAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'host.name');
      expect(hostnameAttr?.value.stringValue).toBe('server-01');

      const pidAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'process.pid');
      expect(pidAttr?.value.intValue).toBe('12345');
    });

    it('should map resource utilization metrics', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
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

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Check memory metrics
      const heapUsedAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'process.runtime.memory.heap_used'
      );
      expect(heapUsedAttr?.value.intValue).toBe('60000000');

      const heapTotalAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'process.runtime.memory.heap_total'
      );
      expect(heapTotalAttr?.value.intValue).toBe('80000000');

      // Check CPU metrics
      const cpuUserAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'process.runtime.cpu.user'
      );
      expect(cpuUserAttr?.value.intValue).toBe('1234567');

      const cpuSystemAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'process.runtime.cpu.system'
      );
      expect(cpuSystemAttr?.value.intValue).toBe('234567');
    });

    it('should map health metrics', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
        metadata: {
          health: {
            timestamp: 1704067200000,
            uptime: 3600.5,
            pid: 12345,
          },
        },
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      const uptimeAttr = logRecord.attributes.find(
        (a: OTLPAttribute) => a.key === 'process.uptime'
      );
      expect(uptimeAttr?.value.intValue).toBe('3600');
    });
  });

  describe('Context Mapping', () => {
    it('should map context fields as attributes', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
        context: {
          userId: '12345',
          requestId: 'req-abc',
          duration: 150.5,
          success: true,
        },
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Check string attribute
      const userIdAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'userId');
      expect(userIdAttr?.value.stringValue).toBe('12345');

      // Check number attribute (should be doubleValue for float)
      const durationAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'duration');
      expect(durationAttr?.value.doubleValue).toBe(150.5);

      // Check boolean attribute
      const successAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'success');
      expect(successAttr?.value.boolValue).toBe(true);
    });

    it('should skip trace fields in context when already present at root', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        timestampMs: 1704067200000,
        level: 'info',
        message: 'Test',
        trace: {
          traceId: 'root-trace',
          spanId: 'root-span',
        },
        context: {
          traceId: 'context-trace', // Should be skipped
          spanId: 'context-span', // Should be skipped
          userId: '12345', // Should be included
        },
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Root trace should be used
      expect(logRecord.traceId).toBe('root-trace');
      expect(logRecord.spanId).toBe('root-span');

      // Context trace fields should not be duplicated as attributes
      const contextTraceAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'traceId');
      expect(contextTraceAttr).toBeUndefined();

      // Other context fields should be included
      const userIdAttr = logRecord.attributes.find((a: OTLPAttribute) => a.key === 'userId');
      expect(userIdAttr?.value.stringValue).toBe('12345');
    });
  });

  describe('Timestamp Conversion', () => {
    it('should convert milliseconds to nanoseconds', async () => {
      const entry: LogEntry = {
        id: 'test-123',
        timestamp: 1704067200000,
        level: 'info',
        message: 'Test',
      };

      await transport.log(entry);
      await transport.flush();

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body) as OTLPRequestBody;
      const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

      // Check nanosecond conversion
      expect(logRecord.timeUnixNano).toBe('1704067200000000000');
    });
  });

  describe('Severity Mapping', () => {
    it('should map MAGIC levels to OTLP severity numbers', async () => {
      const levelMappings = [
        { level: 'trace', severityNumber: 1 },
        { level: 'debug', severityNumber: 5 },
        { level: 'info', severityNumber: 9 },
        { level: 'warn', severityNumber: 13 },
        { level: 'error', severityNumber: 17 },
        { level: 'fatal', severityNumber: 21 },
        { level: 'success', severityNumber: 9 }, // Maps to INFO
      ];

      for (const { level, severityNumber } of levelMappings) {
        const entry: LogEntry = {
          id: 'test-123',
          timestamp: '2024-01-01T00:00:00.000Z',
          timestampMs: 1704067200000,
          level: level as LogEntry['level'],
          message: 'Test',
        };

        await transport.log(entry);
        await transport.flush();

        const requestBody = JSON.parse(
          mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1].body
        );
        const logRecord = requestBody.resourceLogs[0].scopeLogs[0].logRecords[0];

        expect(logRecord.severityNumber).toBe(severityNumber);
        expect(logRecord.severityText).toBe(level.toUpperCase());
      }
    });
  });
});
