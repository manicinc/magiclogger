/* eslint-disable @typescript-eslint/no-explicit-any */
// File: tests/transports/OTLPTransport.test.ts

import { OTLPTransport } from 'magiclogger/transports/otlp';
import type { LogEntry } from 'magiclogger/types';

// Mock Node.js modules
const mockGzip = jest.fn((data, callback) => {
  callback(null, Buffer.from('compressed'));
});

const mockRequest = {
  on: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
  destroy: jest.fn()
};

const mockResponse = {
  statusCode: 200,
  on: jest.fn((event, callback) => {
    if (event === 'data') {
      callback('response data');
    } else if (event === 'end') {
      setTimeout(callback, 0);
    }
  })
};

const mockHttp = {
  request: jest.fn((options, callback) => {
    callback(mockResponse);
    return mockRequest;
  })
};

const mockHttps = {
  request: jest.fn((options, callback) => {
    callback(mockResponse);
    return mockRequest;
  })
};

// Mock require for Node.js modules
jest.mock('zlib', () => ({
  gzip: mockGzip
}), { virtual: true });

jest.mock('http', () => mockHttp, { virtual: true });
jest.mock('https', () => mockHttps, { virtual: true });

// Mock fetch for browser environment (typed with 2 args so mock.calls[0][1] is defined)
const mockFetch = (jest.fn(() =>
  Promise.resolve({ ok: true, status: 200, statusText: 'OK' })
) as unknown) as jest.Mock<Promise<{ ok: boolean; status: number; statusText: string }>, [any, any]>;

// Store original fetch
const originalFetch = global.fetch;

describe('OTLPTransport', () => {
  let transport: OTLPTransport;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up fetch mock
    global.fetch = mockFetch as any;
    
    // Reset AbortSignal if it exists
    if (!global.AbortSignal) {
      (global as any).AbortSignal = {
        timeout: jest.fn(() => ({}))
      };
    }
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
    }
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('Constructor', () => {
    it('should create with default options', () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });
      
      expect(transport).toBeDefined();
      expect(transport.getName()).toBe('otlp-transport');
    });

    it('should create with custom options', () => {
      transport = new OTLPTransport({
        name: 'custom-otlp',
        serviceName: 'my-service',
        serviceVersion: '2.0.0',
        endpoint: 'http://localhost:4318',
        protocol: 'http/json',
        resource: {
          'deployment.environment': 'production',
          'service.namespace': 'backend'
        },
        headers: {
          'x-api-key': 'test-key'
        },
        includeTraceContext: true,
        exportPath: '/v1/logs',
        compression: 'gzip',
        exportTimeout: 5000,
        maxBatchSize: 50,
        maxBatchTime: 2000
      });
      
      expect(transport.getName()).toBe('custom-otlp');
    });

    it('should set appropriate content type for protocols', () => {
      const protobufTransport = new OTLPTransport({
        serviceName: 'test',
        protocol: 'http/protobuf'
      });
      
      const jsonTransport = new OTLPTransport({
        serviceName: 'test',
        protocol: 'http/json'
      });
      
      // Headers are set internally
      expect(protobufTransport).toBeDefined();
      expect(jsonTransport).toBeDefined();
      
      protobufTransport.close();
      jsonTransport.close();
    });

    it('should handle HTTPS endpoint', () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        endpoint: 'https://secure.example.com:4318'
      });
      
      expect(transport).toBeDefined();
    });
  });

  describe('Log Processing', () => {
    beforeEach(() => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        maxBatchSize: 3,
        maxBatchTime: 100
      });
    });

    it('should process single log entry', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test message',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      
      // Wait for batch processing
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should batch multiple log entries', async () => {
      const entries: LogEntry[] = [
        {
          level: 'info',
          message: 'Message 1',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        },
        {
          level: 'error',
          message: 'Message 2',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        },
        {
          level: 'debug',
          message: 'Message 3',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        }
      ];

      for (const entry of entries) {
        await transport.log(entry);
      }
      
      // Should trigger batch immediately when reaching maxBatchSize
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle log entry with all fields', async () => {
      const entry: LogEntry = {
        level: 'error',
        message: 'Error occurred',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        loggerId: 'test-logger',
        tags: ['api', 'error'],
        context: {
          userId: '123',
          requestId: 'abc-def',
          customField: 42,
          booleanField: true
        },
        error: new Error('Test error')
      };

      await transport.log(entry);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      // Verify structure
      expect(body.resourceLogs).toBeDefined();
      expect(body.resourceLogs[0].scopeLogs).toBeDefined();
      expect(body.resourceLogs[0].scopeLogs[0].logRecords).toBeDefined();
      expect(body.resourceLogs[0].scopeLogs[0].logRecords).toHaveLength(1);
      
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      expect(logRecord.severityText).toBe('ERROR');
      expect(logRecord.body.stringValue).toBe('Error occurred');
    });
  });

  describe('Severity Mapping', () => {
    beforeEach(() => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });
    });

    it('should map log levels to severity numbers correctly', async () => {
      const testCases = [
        { level: 'trace', expectedNumber: 1 },
        { level: 'debug', expectedNumber: 5 },
        { level: 'info', expectedNumber: 9 },
        { level: 'warn', expectedNumber: 13 },
        { level: 'warning', expectedNumber: 13 },
        { level: 'error', expectedNumber: 17 },
        { level: 'fatal', expectedNumber: 21 },
        { level: 'success', expectedNumber: 9 },
        { level: 'unknown', expectedNumber: 9 } // default
      ];

      for (const testCase of testCases) {
        const entry: LogEntry = {
          level: testCase.level,
          message: `Test ${testCase.level}`,
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
      }

      // Trigger batch
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFetch).toHaveBeenCalled();
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecords = body.resourceLogs[0].scopeLogs[0].logRecords;
      
      testCases.forEach((testCase, index) => {
        expect(logRecords[index].severityNumber).toBe(testCase.expectedNumber);
        expect(logRecords[index].severityText).toBe(testCase.level.toUpperCase());
      });
    });
  });

  describe('Resource Attributes', () => {
    it('should include default resource attributes', async () => {
      transport = new OTLPTransport({
        serviceName: 'my-service',
        serviceVersion: '1.2.3'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const resource = body.resourceLogs[0].resource;
      
      expect(resource.attributes).toContainEqual({
        key: 'service.name',
        value: { stringValue: 'my-service' }
      });
      
      expect(resource.attributes).toContainEqual({
        key: 'service.version',
        value: { stringValue: '1.2.3' }
      });
      
      expect(resource.attributes).toContainEqual({
        key: 'telemetry.sdk.name',
        value: { stringValue: 'magiclogger' }
      });
    });

    it('should include custom resource attributes', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        resource: {
          'deployment.environment': 'production',
          'service.namespace': 'backend',
          'custom.number': 42,
          'custom.boolean': true
        }
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const resource = body.resourceLogs[0].resource;
      
      expect(resource.attributes).toContainEqual({
        key: 'deployment.environment',
        value: { stringValue: 'production' }
      });
      
      expect(resource.attributes).toContainEqual({
        key: 'custom.number',
        value: { intValue: '42' }
      });
      
      expect(resource.attributes).toContainEqual({
        key: 'custom.boolean',
        value: { boolValue: true }
      });
    });
  });

  describe('Trace Context', () => {
    it('should include trace context when available', async () => {
      // Mock OpenTelemetry API
      const mockSpanContext = {
        traceId: 'trace123',
        spanId: 'span456'
      };
      
      (global as any).otel = {
        trace: {
          getActiveSpan: jest.fn(() => ({
            spanContext: () => mockSpanContext
          }))
        }
      };

      transport = new OTLPTransport({
        serviceName: 'test-service',
        includeTraceContext: true
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Test with trace',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.traceId).toBe('trace123');
      expect(logRecord.spanId).toBe('span456');
      
      delete (global as any).otel;
    });

    it('should handle missing trace context gracefully', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        includeTraceContext: true
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Test without trace',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.traceId).toBeUndefined();
      expect(logRecord.spanId).toBeUndefined();
    });

    it('should skip trace context when disabled', async () => {
      (global as any).otel = {
        trace: {
          getActiveSpan: jest.fn(() => ({
            spanContext: () => ({ traceId: 'trace123', spanId: 'span456' })
          }))
        }
      };

      transport = new OTLPTransport({
        serviceName: 'test-service',
        includeTraceContext: false
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.traceId).toBeUndefined();
      expect(logRecord.spanId).toBeUndefined();
      
      delete (global as any).otel;
    });
  });

  describe('Export Methods', () => {
    describe('Browser (fetch)', () => {
      it('should export using fetch in browser environment', async () => {
        transport = new OTLPTransport({
          serviceName: 'test-service',
          endpoint: 'http://localhost:4318',
          exportPath: '/v1/logs'
        });

        const entry: LogEntry = {
          level: 'info',
          message: 'Browser test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4318/v1/logs',
          expect.objectContaining({
            method: 'POST',
            headers: expect.any(Object),
            body: expect.any(String)
          })
        );
      });

      it('should handle fetch errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        transport = new OTLPTransport({
          serviceName: 'test-service'
        });

        const entry: LogEntry = {
          level: 'error',
          message: 'Test error',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Should handle error gracefully
        expect(transport.getStats().failed).toBeGreaterThan(0);
      });

      it('should handle non-OK responses', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

        transport = new OTLPTransport({
          serviceName: 'test-service'
        });

        const entry: LogEntry = {
          level: 'error',
          message: 'Test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(transport.getStats().failed).toBeGreaterThan(0);
      });
    });

    describe('Node.js (http/https)', () => {
      beforeEach(() => {
        // Remove fetch to simulate Node.js environment
        delete (global as any).fetch;
        delete (global as any).window;
      });

      afterEach(() => {
        global.fetch = mockFetch as any;
      });

      it('should export using http module in Node.js', async () => {
        transport = new OTLPTransport({
          serviceName: 'test-service',
          endpoint: 'http://localhost:4318'
        });

        const entry: LogEntry = {
          level: 'info',
          message: 'Node.js test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(mockHttp.request).toHaveBeenCalled();
        expect(mockRequest.write).toHaveBeenCalled();
        expect(mockRequest.end).toHaveBeenCalled();
      });

      it('should use https for secure endpoints', async () => {
        transport = new OTLPTransport({
          serviceName: 'test-service',
          endpoint: 'https://secure.example.com:4318'
        });

        const entry: LogEntry = {
          level: 'info',
          message: 'HTTPS test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(mockHttps.request).toHaveBeenCalled();
      });

      it('should handle http errors', async () => {
        mockRequest.on.mockImplementation((event, callback) => {
          if (event === 'error') {
            callback(new Error('Connection failed'));
          }
        });

        transport = new OTLPTransport({
          serviceName: 'test-service'
        });

        const entry: LogEntry = {
          level: 'error',
          message: 'Test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(transport.getStats().failed).toBeGreaterThan(0);
      });

      it('should handle timeout', async () => {
        mockRequest.on.mockImplementation((event, callback) => {
          if (event === 'timeout') {
            callback();
          }
        });

        transport = new OTLPTransport({
          serviceName: 'test-service',
          exportTimeout: 100
        });

        const entry: LogEntry = {
          level: 'info',
          message: 'Timeout test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(mockRequest.destroy).toHaveBeenCalled();
      });

      it('should handle non-200 status codes', async () => {
        mockResponse.statusCode = 500;

        transport = new OTLPTransport({
          serviceName: 'test-service'
        });

        const entry: LogEntry = {
          level: 'error',
          message: 'Test',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        };

        await transport.log(entry);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        expect(transport.getStats().failed).toBeGreaterThan(0);
        
        // Reset
        mockResponse.statusCode = 200;
      });
    });
  });

  describe('Compression', () => {
    beforeEach(() => {
      delete (global as any).fetch;
      delete (global as any).window;
    });

    afterEach(() => {
      global.fetch = mockFetch as any;
    });

    it('should compress data when gzip enabled', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        compression: 'gzip'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Compression test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockGzip).toHaveBeenCalled();
      expect(mockRequest.write).toHaveBeenCalledWith(Buffer.from('compressed'));
    });

    it('should not compress when compression disabled', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        compression: 'none'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'No compression',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockGzip).not.toHaveBeenCalled();
    });

    it('should handle compression errors', async () => {
      mockGzip.mockImplementationOnce((data, callback) => {
        callback(new Error('Compression failed'));
      });

      transport = new OTLPTransport({
        serviceName: 'test-service',
        compression: 'gzip'
      });

      const entry: LogEntry = {
        level: 'error',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(transport.getStats().failed).toBeGreaterThan(0);
    });
  });

  describe('Protocol Handling', () => {
    it('should handle http/json protocol', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        protocol: 'http/json'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'JSON test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFetch).toHaveBeenCalled();
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should handle http/protobuf protocol', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        protocol: 'http/protobuf'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Protobuf test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFetch).toHaveBeenCalled();
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/x-protobuf');
    });
  });

  describe('Headers', () => {
    it('should include custom headers', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        headers: {
          'x-api-key': 'secret-key',
          'x-custom-header': 'custom-value'
        }
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Headers test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['x-api-key']).toBe('secret-key');
      expect(headers['x-custom-header']).toBe('custom-value');
    });

    it('should set compression header when enabled', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        compression: 'gzip'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Content-Encoding']).toBe('gzip');
    });
  });

  describe('Statistics', () => {
    it('should track custom statistics', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        endpoint: 'http://custom.endpoint:4318',
        protocol: 'http/json',
        compression: 'gzip'
      });

      const stats = transport.getStats();
      
      expect(stats.custom).toMatchObject({
        endpoint: 'http://custom.endpoint:4318',
        protocol: 'http/json',
        serviceName: 'test-service',
        compression: 'gzip'
      });
    });

    it('should update statistics on successful export', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const initialStats = transport.getStats();
      
      const entry: LogEntry = {
        level: 'info',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const finalStats = transport.getStats();
  expect((finalStats.sent ?? 0)).toBeGreaterThan((initialStats.sent ?? 0));
    });

    it('should track failed exports', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Export failed'));

      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const entry: LogEntry = {
        level: 'error',
        message: 'Test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const stats = transport.getStats();
      expect(stats.failed).toBeGreaterThan(0);
    });
  });

  describe('Timestamp Handling', () => {
    it('should convert timestamp to Unix nanoseconds', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const timestampMs = 1609459200000; // 2021-01-01T00:00:00.000Z
      const entry: LogEntry = {
        level: 'info',
        message: 'Timestamp test',
        timestamp: new Date(timestampMs).toISOString(),
        timestampMs
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.timeUnixNano).toBe('1609459200000000000');
    });
  });

  describe('Error Handling', () => {
    it('should include error information in log records', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\n    at testFunction';
      
      const entry: LogEntry = {
        level: 'error',
        message: 'Error occurred',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        error
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.attributes).toContainEqual({
        key: 'exception.type',
        value: { stringValue: 'Error' }
      });
      
      expect(logRecord.attributes).toContainEqual({
        key: 'exception.message',
        value: { stringValue: 'Test error message' }
      });
      
      expect(logRecord.attributes).toContainEqual({
        key: 'exception.stacktrace',
        value: { stringValue: error.stack }
      });
    });
  });

  describe('Batching', () => {
    it('should respect maxBatchSize', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        maxBatchSize: 2,
        maxBatchTime: 10000 // Long timeout
      });

      const entries: LogEntry[] = [
        {
          level: 'info',
          message: 'Message 1',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        },
        {
          level: 'info',
          message: 'Message 2',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        }
      ];

      for (const entry of entries) {
        await transport.log(entry);
      }

      // Should trigger immediately when batch size reached
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecords = body.resourceLogs[0].scopeLogs[0].logRecords;
      expect(logRecords).toHaveLength(2);
    });

    it('should respect maxBatchTime', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service',
        maxBatchSize: 100, // High limit
        maxBatchTime: 50
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Single message',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      
      // Should not send immediately
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Wait for batch timeout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty batches', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      // Force sending empty batch (shouldn't actually send)
      await (transport as any).sendBatch([]);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Scope Information', () => {
    it('should include scope information', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Scope test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const scope = body.resourceLogs[0].scopeLogs[0].scope;
      
      expect(scope.name).toBe('magiclogger');
      expect(scope.version).toBe('1.0.0');
    });
  });

  describe('Context Attributes', () => {
    it('should include logger ID as attribute', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Logger ID test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        loggerId: 'custom-logger-id'
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.attributes).toContainEqual({
        key: 'logger.id',
        value: { stringValue: 'custom-logger-id' }
      });
    });

    it('should include tags as attribute', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Tags test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        tags: ['api', 'production', 'critical']
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.attributes).toContainEqual({
        key: 'tags',
        value: { stringValue: 'api,production,critical' }
      });
    });

    it('should include context as attributes', async () => {
      transport = new OTLPTransport({
        serviceName: 'test-service'
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Context test',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        context: {
          stringField: 'value',
          numberField: 42,
          booleanField: true,
          nullField: null,
          undefinedField: undefined,
          objectField: { nested: 'object' }
        }
      };

      await transport.log(entry);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const logRecord = body.resourceLogs[0].scopeLogs[0].logRecords[0];
      
      expect(logRecord.attributes).toContainEqual({
        key: 'stringField',
        value: { stringValue: 'value' }
      });
      
      expect(logRecord.attributes).toContainEqual({
        key: 'numberField',
        value: { intValue: '42' }
      });
      
      expect(logRecord.attributes).toContainEqual({
        key: 'booleanField',
        value: { boolValue: true }
      });
      
      // null, undefined, and objects are not included
      expect(logRecord.attributes.find((a: any) => a.key === 'nullField')).toBeUndefined();
      expect(logRecord.attributes.find((a: any) => a.key === 'undefinedField')).toBeUndefined();
      expect(logRecord.attributes.find((a: any) => a.key === 'objectField')).toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should handle full lifecycle', async () => {
      transport = new OTLPTransport({
        serviceName: 'integration-test',
        maxBatchSize: 3,
        maxBatchTime: 100
      });

      // Log multiple entries
      for (let i = 0; i < 5; i++) {
        await transport.log({
          level: i % 2 === 0 ? 'info' : 'error',
          message: `Message ${i}`,
          timestamp: new Date().toISOString(),
          timestampMs: Date.now()
        });
        
        // Small delay between logs
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Wait for final batch
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should have sent two batches (3 + 2)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Close transport
      await transport.close();
      
      // Verify stats
      const stats = transport.getStats();
  expect((stats.sent ?? 0)).toBe(5);
    });
  });
});