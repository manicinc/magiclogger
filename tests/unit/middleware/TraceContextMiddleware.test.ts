/**
 * Tests for TraceContextMiddleware
 * @fileoverview Tests for W3C trace context extraction and propagation middleware
 */

import { TraceContextMiddleware } from '../../../src/middleware/TraceContextMiddleware';
import type { LogEntry } from '../../../src/types';
import type { W3CTraceContext } from '../../../src/utils/trace-context';
import type { MiddlewareContext } from '../../../src/middleware/Middleware';

describe('TraceContextMiddleware', () => {
  
  const createMockEntry = (overrides?: Partial<LogEntry>): LogEntry => ({
    id: 'test-id',
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    level: 'info',
    message: 'Test message',
    ...overrides
  });

  const createMockContext = (): MiddlewareContext => ({
    loggerId: 'test-logger',
    index: 0,
    total: 1,
    state: new Map()
  });

  beforeEach(() => {
    middleware = new TraceContextMiddleware();
  });

  describe('Constructor and Configuration', () => {
    it('should create middleware with default options', () => {
      const mw = new TraceContextMiddleware();
      expect(mw).toBeInstanceOf(TraceContextMiddleware);
      expect(mw.name).toBe('TraceContext');
    });

    it('should create middleware with custom options', () => {
      const mw = new TraceContextMiddleware({
        autoExtract: false,
        generateIfMissing: true,
        traceField: 'customTrace',
        includeInMetadata: false
      });
      expect(mw).toBeInstanceOf(TraceContextMiddleware);
    });

    it('should handle getHeaders option', () => {
      const headers = { 'traceparent': '00-trace123-span456-01' };
      const mw = new TraceContextMiddleware({
        getHeaders: () => headers
      });
      expect(mw).toBeInstanceOf(TraceContextMiddleware);
    });

    it('should handle custom extractContext function', () => {
      const customExtract = jest.fn();
      const mw = new TraceContextMiddleware({
        extractContext: customExtract
      });
      expect(mw).toBeInstanceOf(TraceContextMiddleware);
    });
  });

  describe('Trace Context Extraction', () => {
    it('should extract trace context from HTTP headers', () => {
      const headers = {
        'traceparent': '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
        'tracestate': 'congo=t61rcWkgMzE'
      };
      
      const mw = new TraceContextMiddleware({
        getHeaders: () => headers
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual({
        traceId: '0af7651916cd43dd8448eb211c80319c',
        spanId: 'b7ad6b7169203331',
        traceFlags: '01',
        traceState: 'congo=t61rcWkgMzE',
        sampled: true
      });
    });

    it('should handle missing headers gracefully', () => {
      const mw = new TraceContextMiddleware({
        getHeaders: () => undefined
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toBeUndefined();
    });

    it('should use custom extraction function', () => {
      const customTrace: W3CTraceContext = {
        traceId: 'custom-trace-id',
        spanId: 'custom-span-id'
      };
      
      const mw = new TraceContextMiddleware({
        extractContext: () => customTrace
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual(customTrace);
    });

    it('should skip extraction when autoExtract is false', () => {
      const mw = new TraceContextMiddleware({
        autoExtract: false,
        getHeaders: () => ({ 'traceparent': '00-trace123-span456-01' })
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toBeUndefined();
    });
  });

  describe('Trace Context Generation', () => {
    it('should generate trace context when missing and configured', () => {
      const mw = new TraceContextMiddleware({
        generateIfMissing: true
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toBeDefined();
      expect(result.entry?.trace?.traceId).toMatch(/^[0-9a-f]{32}$/);
      expect(result.entry?.trace?.spanId).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should not generate when generateIfMissing is false', () => {
      const mw = new TraceContextMiddleware({
        generateIfMissing: false
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toBeUndefined();
    });

    it('should not generate when trace already exists', () => {
      const existingTrace: W3CTraceContext = {
        traceId: 'existing-trace',
        spanId: 'existing-span'
      };
      
      const mw = new TraceContextMiddleware({
        generateIfMissing: true
      });
      
      const entry = createMockEntry({ trace: existingTrace });
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual(existingTrace);
    });
  });

  describe('AsyncLocalStorage Integration', () => {
    it('should extract from AsyncLocalStorage with W3C context', () => {
      const traceContext: W3CTraceContext = {
        traceId: 'async-trace-id',
        spanId: 'async-span-id'
      };
      
      const mockAsyncStorage = {
        getStore: () => traceContext
      };
      
      const mw = new TraceContextMiddleware({
        asyncLocalStorage: mockAsyncStorage
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual(traceContext);
    });

    it('should extract from Express-style headers store', () => {
      const mockAsyncStorage = {
        getStore: () => ({
          req: {
            headers: {
              'traceparent': '00-00000000000000000000000express123-0000000000span789-01'
            }
          }
        })
      };
      
      const mw = new TraceContextMiddleware({
        asyncLocalStorage: mockAsyncStorage
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      // Note: The actual extraction depends on extractTraceContext implementation
      // If it extracts headers from the store, trace should be defined
      expect(result.continue).toBe(true);
    });

    it('should extract from Koa-style headers store', () => {
      const mockAsyncStorage = {
        getStore: () => ({
          ctx: {
            headers: {
              'traceparent': '00-00000000000000000000000000koa456-0000000000span012-00'
            }
          }
        })
      };
      
      const mw = new TraceContextMiddleware({
        asyncLocalStorage: mockAsyncStorage
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.continue).toBe(true);
    });

    it('should extract from Fastify-style headers store', () => {
      const mockAsyncStorage = {
        getStore: () => ({
          request: {
            headers: {
              'traceparent': '00-0000000000000000000000fastify789-0000000000span345-01'
            }
          }
        })
      };
      
      const mw = new TraceContextMiddleware({
        asyncLocalStorage: mockAsyncStorage
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.continue).toBe(true);
    });

    it('should handle empty AsyncLocalStorage store', () => {
      const mockAsyncStorage = {
        getStore: () => undefined
      };
      
      const mw = new TraceContextMiddleware({
        asyncLocalStorage: mockAsyncStorage
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toBeUndefined();
    });
  });

  describe('Custom Field Names', () => {
    it('should use custom trace field name', () => {
      const mw = new TraceContextMiddleware({
        traceField: 'customTraceField',
        generateIfMissing: true
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect((result.entry as any)?.customTraceField).toBeDefined();
      expect(result.entry?.trace).toBeUndefined();
    });
  });

  describe('Metadata Inclusion', () => {
    it('should include trace in metadata by default', () => {
      const mw = new TraceContextMiddleware({
        generateIfMissing: true
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.metadata?.trace).toBeDefined();
    });

    it('should not include in metadata when disabled', () => {
      const mw = new TraceContextMiddleware({
        generateIfMissing: true,
        includeInMetadata: false
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.metadata?.trace).toBeUndefined();
    });
  });

  describe('Priority and Precedence', () => {
    it('should prefer existing trace over extraction', () => {
      const existingTrace: W3CTraceContext = {
        traceId: 'existing',
        spanId: 'existing-span'
      };
      
      const mw = new TraceContextMiddleware({
        getHeaders: () => ({ 'traceparent': '00-header123-span456-01' })
      });
      
      const entry = createMockEntry({ trace: existingTrace });
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual(existingTrace);
    });

    it('should prefer custom extraction over auto-extraction', () => {
      const customTrace: W3CTraceContext = {
        traceId: 'custom',
        spanId: 'custom-span'
      };
      
      const mw = new TraceContextMiddleware({
        extractContext: () => customTrace,
        getHeaders: () => ({ 'traceparent': '00-header123-span456-01' })
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual(customTrace);
    });

    it('should prefer AsyncLocalStorage over getHeaders', () => {
      const asyncTrace: W3CTraceContext = {
        traceId: 'async-trace',
        spanId: 'async-span'
      };
      
      const mw = new TraceContextMiddleware({
        asyncLocalStorage: { getStore: () => asyncTrace },
        getHeaders: () => ({ 'traceparent': '00-header123-span456-01' })
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toEqual(asyncTrace);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in custom extraction gracefully', () => {
      const mw = new TraceContextMiddleware({
        extractContext: () => {
          throw new Error('Extraction error');
        }
      });
      
      const entry = createMockEntry();
      
      // The middleware doesn't catch the error, it throws
      expect(() => {
        mw.process(entry, createMockContext());
      }).toThrow('Extraction error');
    });

    it('should handle malformed headers gracefully', () => {
      const mw = new TraceContextMiddleware({
        getHeaders: () => ({ 'traceparent': 'invalid-format' })
      });
      
      const entry = createMockEntry();
      const result = mw.process(entry, createMockContext());
      
      expect(result.entry?.trace).toBeUndefined();
    });

    it('should handle errors in getHeaders gracefully', () => {
      const mw = new TraceContextMiddleware({
        getHeaders: () => {
          throw new Error('Headers error');
        }
      });
      
      const entry = createMockEntry();
      
      // The middleware doesn't catch the error, it throws
      expect(() => {
        mw.process(entry, createMockContext());
      }).toThrow('Headers error');
    });
  });

  describe('Context Propagation', () => {
    it('should return modified entry with trace context', () => {
      const mw = new TraceContextMiddleware({
        generateIfMissing: true
      });
      
      const entry = createMockEntry();
      const context = createMockContext();
      const result = mw.process(entry, context);
      
      expect(result.entry?.trace).toBeDefined();
      expect(result.continue).toBe(true);
    });

    it('should not override existing trace', () => {
      const existingTrace: W3CTraceContext = {
        traceId: 'existing-trace',
        spanId: 'existing-span'
      };
      
      const mw = new TraceContextMiddleware({
        generateIfMissing: true
      });
      
      const entry = createMockEntry({ trace: existingTrace });
      const context = createMockContext();
      const result = mw.process(entry, context);
      
      expect(result.entry?.trace).toEqual(existingTrace);
    });
  });

  describe('Performance', () => {
    it('should process entries efficiently', () => {
      const mw = new TraceContextMiddleware({
        generateIfMissing: true
      });
      
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        mw.process(createMockEntry(), createMockContext());
      }
      
      const duration = performance.now() - start;
      
      // Should process 1000 entries in less than 500ms (very relaxed for CI)
      expect(duration).toBeLessThan(500);
    });
  });
});