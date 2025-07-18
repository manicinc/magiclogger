// File: tests/unit/transports/base/implementations/HTTPTransport.test.ts

import { HTTPTransport } from '../../../../../src/transports/base/implementations/HTTPTransport';
import type { HTTPTransportOptions, LogEntry } from '../../../../../src/types/transport';

// Mock dynamic imports
const mockAxios = {
  request: jest.fn(),
  default: { request: jest.fn() }
};

const mockFormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  getHeaders: jest.fn().mockReturnValue({ 'content-type': 'multipart/form-data' })
}));

// Mock window fetch
const mockFetch = jest.fn();
const mockAbortController = {
  abort: jest.fn(),
  signal: {}
};

global.fetch = mockFetch as any;
global.AbortController = jest.fn().mockImplementation(() => mockAbortController) as any;

// Mock compression
global.CompressionStream = jest.fn().mockImplementation(() => ({
  writable: {
    getWriter: () => ({
      write: jest.fn(),
      close: jest.fn()
    })
  },
  readable: {
    getReader: () => ({
      read: jest.fn().mockResolvedValue({ done: true, value: new Uint8Array() })
    })
  }
})) as any;

// Mock modules
jest.mock('http', () => ({
  Agent: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('https', () => ({
  Agent: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('zlib', () => ({
  gzip: jest.fn((data, cb) => cb(null, Buffer.from('compressed')))
}));

/**
 * Comprehensive test suite for HTTPTransport class.
 * 
 * Tests HTTP requests, authentication, formatting, compression, and error handling.
 */
describe('HTTPTransport', () => {
  let transport: HTTPTransport;
  let mockEntry: LogEntry;
  let originalWindow: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    originalWindow = global.window;

    // Default to Node.js environment
    delete (global as any).window;

    transport = new HTTPTransport({
      name: 'http',
      url: 'https://logs.example.com/ingest'
    });

    mockEntry = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      plainMessage: 'Test message',
      loggerId: 'test-logger',
      tags: ['test'],
      context: { test: true }
    };

    // Default axios mock response
    mockAxios.request.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true }
    });
    mockAxios.default.request = mockAxios.request;
  });

  afterEach(() => {
    jest.useRealTimers();
    if (originalWindow) {
      global.window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });

  describe('constructor', () => {
    it('should require url option', () => {
      expect(() => new HTTPTransport({ name: 'test' } as HTTPTransportOptions))
        .toThrow('HTTPTransport requires url option');
    });

    it('should validate URL format', () => {
      expect(() => new HTTPTransport({
        name: 'test',
        url: 'not a url'
      })).toThrow('Invalid URL: not a url');
    });

    it('should initialize with default options', () => {
      const t = new HTTPTransport({
        name: 'test',
        url: 'https://example.com'
      });
      
      expect(t.name).toBe('test');
    });

    it('should initialize with all options', () => {
      const t = new HTTPTransport({
        name: 'full',
        url: 'https://logs.example.com',
        method: 'PUT',
        auth: {
          type: 'bearer',
          token: 'secret'
        },
        bodyFormat: 'ndjson',
        headers: {
          'X-Custom': 'value'
        },
        transformRequest: (logs) => ({ logs, metadata: {} }),
        compress: true
      });
      
      expect(t).toBeDefined();
    });
  });

  describe('initialization', () => {
    it('should load HTTP client in Node.js', async () => {
      // Mock dynamic imports
      jest.doMock('axios', () => mockAxios, { virtual: true });
      jest.doMock('form-data', () => mockFormData, { virtual: true });
      
      await transport.init();
      
      expect((transport as any).axios).toBeDefined();
    });

    it('should use fetch in browser', async () => {
      global.window = {} as any;
      
      const t = new HTTPTransport({
        name: 'browser',
        url: 'https://example.com'
      });
      
      await t.init();
      
      // Should not have axios in browser
      expect((transport as any).axios).toBeUndefined();
    });

    it('should create HTTP agents', async () => {
      const http = require('http');
      const https = require('https');
      
      await transport.init();
      
      expect(http.Agent).toHaveBeenCalled();
      expect(https.Agent).toHaveBeenCalled();
    });

    it('should verify endpoint in non-production', async () => {
      process.env.NODE_ENV = 'development';
      
      await transport.init();
      
      // Should make OPTIONS request
      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'OPTIONS',
          url: 'https://logs.example.com/ingest'
        })
      );
      
      delete process.env.NODE_ENV;
    });

    it('should handle endpoint verification errors', async () => {
      process.env.NODE_ENV = 'development';
      mockAxios.request.mockRejectedValueOnce(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await transport.init();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unable to verify endpoint'),
        expect.any(String)
      );
      
      consoleSpy.mockRestore();
      delete process.env.NODE_ENV;
    });

    it('should ignore 405 on OPTIONS', async () => {
      process.env.NODE_ENV = 'development';
      mockAxios.request.mockRejectedValueOnce({
        response: { status: 405 }
      });
      
      await transport.init(); // Should not throw
      
      delete process.env.NODE_ENV;
    });
  });

  describe('batch sending', () => {
    beforeEach(async () => {
      (transport as any).axios = mockAxios;
      await transport.init();
    });

    it('should send batch successfully', async () => {
      const batch = {
        id: 'batch-1',
        entries: [mockEntry],
        sizeBytes: 100,
        createdAt: Date.now(),
        retryCount: 0
      };
      
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://logs.example.com/ingest',
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'MagicLogger/HTTPTransport'
          }),
          data: JSON.stringify([mockEntry])
        })
      );
    });

    it('should emit httpSuccess event', async () => {
      const successSpy = jest.fn();
      transport.on('httpSuccess', successSpy);
      
      const batch = {
        id: 'batch-1',
        entries: [mockEntry],
        sizeBytes: 100,
        createdAt: Date.now(),
        retryCount: 0
      };
      
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(successSpy).toHaveBeenCalledWith({
        url: 'https://logs.example.com/ingest',
        method: 'POST',
        status: 200,
        entryCount: 1
      });
    });

    it('should handle response validation errors', async () => {
      mockAxios.request.mockResolvedValueOnce({
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Invalid format' }
      });
      
      const batch = {
        id: 'batch-1',
        entries: [mockEntry],
        sizeBytes: 100,
        createdAt: Date.now(),
        retryCount: 0
      };
      
      await expect((transport as any).performNetworkRequest('data', batch))
        .rejects.toThrow('HTTP 400 Bad Request: Invalid format');
    });
  });

  describe('authentication', () => {
    it('should add basic auth headers', async () => {
      transport = new HTTPTransport({
        name: 'basic',
        url: 'https://example.com',
        auth: {
          type: 'basic',
          username: 'user',
          password: 'pass'
        }
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      const authHeader = mockAxios.request.mock.calls[0][0].headers.Authorization;
      expect(authHeader).toBe(`Basic ${Buffer.from('user:pass').toString('base64')}`);
    });

    it('should add bearer token', async () => {
      transport = new HTTPTransport({
        name: 'bearer',
        url: 'https://example.com',
        auth: {
          type: 'bearer',
          token: 'secret-token'
        }
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockAxios.request.mock.calls[0][0].headers.Authorization)
        .toBe('Bearer secret-token');
    });

    it('should add API key', async () => {
      transport = new HTTPTransport({
        name: 'apikey',
        url: 'https://example.com',
        auth: {
          type: 'apikey',
          apiKey: 'my-api-key'
        }
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockAxios.request.mock.calls[0][0].headers['X-API-Key'])
        .toBe('my-api-key');
    });

    it('should use custom API key header', async () => {
      transport = new HTTPTransport({
        name: 'apikey-custom',
        url: 'https://example.com',
        auth: {
          type: 'apikey',
          apiKey: 'key123',
          apiKeyHeader: 'X-Auth-Token'
        }
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockAxios.request.mock.calls[0][0].headers['X-Auth-Token'])
        .toBe('key123');
    });

    it('should use custom auth function', async () => {
      transport = new HTTPTransport({
        name: 'custom',
        url: 'https://example.com',
        auth: {
          type: 'custom',
          customAuth: async () => ({
            'X-Custom-Auth': 'generated-token',
            'X-Request-ID': '12345'
          })
        }
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      const headers = mockAxios.request.mock.calls[0][0].headers;
      expect(headers['X-Custom-Auth']).toBe('generated-token');
      expect(headers['X-Request-ID']).toBe('12345');
    });
  });

  describe('body formats', () => {
    beforeEach(async () => {
      (transport as any).axios = mockAxios;
    });

    it('should format as JSON', async () => {
      const batch = { entries: [mockEntry, mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockAxios.request.mock.calls[0][0].data)
        .toBe(JSON.stringify([mockEntry, mockEntry]));
    });

    it('should format as NDJSON', async () => {
      transport = new HTTPTransport({
        name: 'ndjson',
        url: 'https://example.com',
        bodyFormat: 'ndjson'
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry, mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      const expectedBody = JSON.stringify(mockEntry) + '\n' + 
                          JSON.stringify(mockEntry) + '\n';
      
      expect(mockAxios.request.mock.calls[0][0].data).toBe(expectedBody);
      expect(mockAxios.request.mock.calls[0][0].headers['Content-Type'])
        .toBe('application/x-ndjson');
    });

    it('should format as form data in Node.js', async () => {
      transport = new HTTPTransport({
        name: 'form',
        url: 'https://example.com',
        bodyFormat: 'form'
      });
      (transport as any).axios = mockAxios;
      (transport as any).FormData = mockFormData;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockFormData).toHaveBeenCalled();
      const formInstance = mockFormData.mock.results[0].value;
      expect(formInstance.append).toHaveBeenCalledWith('logs', JSON.stringify([mockEntry]));
    });

    it('should format as form data in browser', async () => {
      global.window = {} as any;
      global.FormData = jest.fn().mockImplementation(() => ({
        append: jest.fn()
      })) as any;
      
      transport = new HTTPTransport({
        name: 'form-browser',
        url: 'https://example.com',
        bodyFormat: 'form'
      });
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(global.FormData).toHaveBeenCalled();
    });

    it('should use custom transform', async () => {
      transport = new HTTPTransport({
        name: 'transform',
        url: 'https://example.com',
        transformRequest: (logs) => ({
          timestamp: Date.now(),
          logs: logs,
          count: logs.length
        })
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      const sentData = JSON.parse(mockAxios.request.mock.calls[0][0].data);
      expect(sentData).toHaveProperty('timestamp');
      expect(sentData).toHaveProperty('logs');
      expect(sentData).toHaveProperty('count', 1);
    });
  });

  describe('compression', () => {
    it('should compress in Node.js', async () => {
      const zlib = require('zlib');
      
      transport = new HTTPTransport({
        name: 'compress',
        url: 'https://example.com',
        compress: true
      });
      (transport as any).axios = mockAxios;
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(zlib.gzip).toHaveBeenCalled();
      expect(mockAxios.request.mock.calls[0][0].headers['Content-Encoding'])
        .toBe('gzip');
      expect(mockAxios.request.mock.calls[0][0].data.toString())
        .toBe('compressed');
    });

    it('should compress in browser with CompressionStream', async () => {
      global.window = {} as any;
      
      transport = new HTTPTransport({
        name: 'compress-browser',
        url: 'https://example.com',
        compress: true
      });
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(global.CompressionStream).toHaveBeenCalledWith('gzip');
    });

    it('should skip compression if not available in browser', async () => {
      global.window = {} as any;
      delete (global as any).CompressionStream;
      
      transport = new HTTPTransport({
        name: 'no-compress',
        url: 'https://example.com',
        compress: true
      });
      
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      // Should work without compression
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('browser fetch', () => {
    beforeEach(() => {
      global.window = {} as any;
      mockFetch.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: async () => '{"success":true}'
      });
    });

    it('should use fetch API in browser', async () => {
      const batch = { entries: [mockEntry] };
      await (transport as any).performNetworkRequest('data', batch);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://logs.example.com/ingest',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify([mockEntry]),
          signal: mockAbortController.signal
        })
      );
    });

    it('should handle fetch timeout', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      transport = new HTTPTransport({
        name: 'timeout',
        url: 'https://example.com',
        timeout: 100
      });
      
      const batch = { entries: [mockEntry] };
      const promise = (transport as any).performNetworkRequest('data', batch);
      
      jest.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow('Request timeout after 100ms');
      expect(mockAbortController.abort).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network failed'));
      
      const batch = { entries: [mockEntry] };
      await expect((transport as any).performNetworkRequest('data', batch))
        .rejects.toThrow('Network failed');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (transport as any).axios = mockAxios;
    });

    it('should extract error from JSON response', async () => {
      mockAxios.request.mockResolvedValueOnce({
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Missing required field' }
      });
      
      const batch = { entries: [mockEntry] };
      await expect((transport as any).performNetworkRequest('data', batch))
        .rejects.toThrow('HTTP 400 Bad Request: Missing required field');
    });

    it('should extract message from response', async () => {
      mockAxios.request.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Database connection failed' }
      });
      
      const batch = { entries: [mockEntry] };
      await expect((transport as any).performNetworkRequest('data', batch))
        .rejects.toThrow('HTTP 500 Internal Server Error: Database connection failed');
    });

    it('should include raw response for short errors', async () => {
      mockAxios.request.mockResolvedValueOnce({
        status: 403,
        statusText: 'Forbidden',
        data: 'Access denied'
      });
      
      const batch = { entries: [mockEntry] };
      await expect((transport as any).performNetworkRequest('data', batch))
        .rejects.toThrow('HTTP 403 Forbidden: Access denied');
    });

    it('should not include long raw responses', async () => {
      mockAxios.request.mockResolvedValueOnce({
        status: 500,
        statusText: 'Error',
        data: 'x'.repeat(300)
      });
      
      const batch = { entries: [mockEntry] };
      await expect((transport as any).performNetworkRequest('data', batch))
        .rejects.toThrow('HTTP 500 Error');
    });

    it('should include status and response in error', async () => {
      const response = {
        status: 429,
        statusText: 'Too Many Requests',
        data: { retryAfter: 60 }
      };
      mockAxios.request.mockResolvedValueOnce(response);
      
      const batch = { entries: [mockEntry] };
      
      try {
        await (transport as any).performNetworkRequest('data', batch);
      } catch (error: any) {
        expect(error.status).toBe(429);
        expect(error.response).toBe(response);
      }
    });
  });

  describe('statistics', () => {
    it('should include HTTP-specific stats', () => {
      transport = new HTTPTransport({
        name: 'stats',
        url: 'https://example.com',
        method: 'PUT',
        auth: { type: 'bearer', token: 'token' },
        bodyFormat: 'ndjson',
        compress: true
      });
      
      const stats = transport.getStats();
      
      expect(stats.custom).toMatchObject({
        url: 'https://example.com',
        method: 'PUT',
        authType: 'bearer',
        bodyFormat: 'ndjson',
        compressed: true
      });
    });
  });

  describe('cleanup', () => {
    it('should destroy HTTP agents', async () => {
      const mockAgent = { destroy: jest.fn() };
      (transport as any).httpAgent = mockAgent;
      (transport as any).httpsAgent = mockAgent;
      
      await transport.close();
      
      expect(mockAgent.destroy).toHaveBeenCalledTimes(2);
    });
  });

  describe('factory function', () => {
    it('should create transport with defaults', () => {
      const { createHTTPTransport } = require('../../../../../src/transports/base/implementations/HTTPTransport');
      
      const t = createHTTPTransport({ url: 'https://example.com' });
      
      expect(t.name).toBe('http');
      expect(t.enabled).toBe(true);
    });

    it('should throw without URL', () => {
      const { createHTTPTransport } = require('../../../../../src/transports/base/implementations/HTTPTransport');
      
      expect(() => createHTTPTransport({}))
        .toThrow('HTTPTransport requires url option');
    });
  });
});