// File: tests/unit/utils/trace-context.test.ts

import {
  extractTraceContext,
  createTraceparent,
  generateTraceId,
  generateSpanId,
  type W3CTraceContext,
} from '../../../src/utils/trace-context';

describe('trace-context utilities', () => {
  describe('extractTraceContext', () => {
    it('should extract valid W3C trace context from headers', () => {
      const headers = {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        tracestate: 'vendor1=value1,vendor2=value2',
      };

      const context = extractTraceContext(headers);

      expect(context).toEqual({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        traceFlags: '01',
        traceState: 'vendor1=value1,vendor2=value2',
        sampled: true,
      });
    });

    it('should handle case-insensitive header names', () => {
      const headers = {
        TraceParent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00',
        TraceState: 'vendor=value',
      };

      const context = extractTraceContext(headers);

      expect(context).toBeDefined();
      expect(context?.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
      expect(context?.sampled).toBe(false);
    });

    it('should handle headers with array values', () => {
      const headers = {
        traceparent: ['00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'],
        tracestate: ['vendor=value'],
      };

      const context = extractTraceContext(headers);

      expect(context).toBeDefined();
      expect(context?.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
    });

    it('should return undefined for missing traceparent', () => {
      const headers = {
        tracestate: 'vendor=value',
      };

      const context = extractTraceContext(headers);

      expect(context).toBeUndefined();
    });

    it('should return undefined for invalid traceparent format', () => {
      const testCases = [
        'invalid',
        '00-invalid-00f067aa0ba902b7-01',
        '00-4bf92f3577b34da6a3ce929d0e0e4736-invalid-01',
        '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7',
        '01-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01', // Wrong version
      ];

      testCases.forEach(traceparent => {
        const context = extractTraceContext({ traceparent });
        expect(context).toBeUndefined();
      });
    });

    it('should reject all-zero trace ID', () => {
      const headers = {
        traceparent: '00-00000000000000000000000000000000-00f067aa0ba902b7-01',
      };

      const context = extractTraceContext(headers);

      expect(context).toBeUndefined();
    });

    it('should reject all-zero span ID', () => {
      const headers = {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01',
      };

      const context = extractTraceContext(headers);

      expect(context).toBeUndefined();
    });

    it('should parse sampled flag correctly', () => {
      const sampledHeaders = {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
      };

      const notSampledHeaders = {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00',
      };

      expect(extractTraceContext(sampledHeaders)?.sampled).toBe(true);
      expect(extractTraceContext(notSampledHeaders)?.sampled).toBe(false);
    });

    it('should handle various trace flags', () => {
      const testCases = [
        { flags: '00', sampled: false },
        { flags: '01', sampled: true },
        { flags: '02', sampled: false },
        { flags: '03', sampled: true },
        { flags: 'ff', sampled: true },
      ];

      testCases.forEach(({ flags, sampled }) => {
        const headers = {
          traceparent: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-${flags}`,
        };

        const context = extractTraceContext(headers);
        expect(context?.sampled).toBe(sampled);
        expect(context?.traceFlags).toBe(flags);
      });
    });

    it('should handle missing tracestate gracefully', () => {
      const headers = {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
      };

      const context = extractTraceContext(headers);

      expect(context).toBeDefined();
      expect(context?.traceState).toBeUndefined();
    });

    it('should work with Express-like headers', () => {
      const expressHeaders = {
        'content-type': 'application/json',
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        'x-custom-header': 'value',
      };

      const context = extractTraceContext(expressHeaders);

      expect(context).toBeDefined();
      expect(context?.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
    });
  });

  describe('createTraceparent', () => {
    it('should create valid traceparent header', () => {
      const context: W3CTraceContext = {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        sampled: true,
      };

      const traceparent = createTraceparent(context);

      expect(traceparent).toBe('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01');
    });

    it('should use provided trace flags', () => {
      const context: W3CTraceContext = {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        traceFlags: 'ff',
        sampled: false, // Should be overridden by traceFlags
      };

      const traceparent = createTraceparent(context);

      expect(traceparent).toBe('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-ff');
    });

    it('should generate span ID if missing', () => {
      const context: W3CTraceContext = {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        sampled: true,
      };

      const traceparent = createTraceparent(context);

      expect(traceparent).toMatch(/^00-4bf92f3577b34da6a3ce929d0e0e4736-[0-9a-f]{16}-01$/);
    });

    it('should handle not sampled traces', () => {
      const context: W3CTraceContext = {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        sampled: false,
      };

      const traceparent = createTraceparent(context);

      expect(traceparent).toBe('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00');
    });

    it('should round-trip with extractTraceContext', () => {
      const original: W3CTraceContext = {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        traceFlags: '01',
        sampled: true,
      };

      const traceparent = createTraceparent(original);
      const extracted = extractTraceContext({ traceparent });

      expect(extracted?.traceId).toBe(original.traceId);
      expect(extracted?.spanId).toBe(original.spanId);
      expect(extracted?.traceFlags).toBe(original.traceFlags);
      expect(extracted?.sampled).toBe(original.sampled);
    });
  });

  describe('generateTraceId', () => {
    it('should generate 32 character hex string', () => {
      const traceId = generateTraceId();

      expect(traceId).toMatch(/^[0-9a-f]{32}$/);
      expect(traceId.length).toBe(32);
    });

    it('should generate unique trace IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTraceId());
      }

      expect(ids.size).toBe(100);
    });

    it('should never generate all zeros', () => {
      // Statistical test - extremely unlikely to fail
      for (let i = 0; i < 100; i++) {
        const traceId = generateTraceId();
        expect(traceId).not.toBe('00000000000000000000000000000000');
      }
    });

    it('should use crypto.getRandomValues when available', () => {
      const originalCrypto = global.crypto;
      const mockGetRandomValues = jest.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i + 1;
        }
        return array;
      });

      global.crypto = {
        getRandomValues: mockGetRandomValues,
      } as unknown as Crypto;

      const traceId = generateTraceId();

      expect(mockGetRandomValues).toHaveBeenCalled();
      expect(traceId).toBe('0102030405060708090a0b0c0d0e0f10');

      global.crypto = originalCrypto;
    });

    it('should fall back to Math.random when crypto is unavailable', () => {
      const originalCrypto = global.crypto;
      const originalRandom = Math.random;

      // @ts-expect-error - Intentionally removing crypto for testing fallback
      delete global.crypto;

      Math.random = jest.fn(() => 0.5);

      const traceId = generateTraceId();

      expect(traceId).toBeDefined();
      expect(traceId.length).toBe(32);

      Math.random = originalRandom;
      global.crypto = originalCrypto;
    });
  });

  describe('generateSpanId', () => {
    it('should generate 16 character hex string', () => {
      const spanId = generateSpanId();

      expect(spanId).toMatch(/^[0-9a-f]{16}$/);
      expect(spanId.length).toBe(16);
    });

    it('should generate unique span IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSpanId());
      }

      expect(ids.size).toBe(100);
    });

    it('should never generate all zeros', () => {
      // Statistical test - extremely unlikely to fail
      for (let i = 0; i < 100; i++) {
        const spanId = generateSpanId();
        expect(spanId).not.toBe('0000000000000000');
      }
    });

    it('should use crypto.getRandomValues when available', () => {
      const originalCrypto = global.crypto;
      const mockGetRandomValues = jest.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i + 1;
        }
        return array;
      });

      global.crypto = {
        getRandomValues: mockGetRandomValues,
      } as unknown as Crypto;

      const spanId = generateSpanId();

      expect(mockGetRandomValues).toHaveBeenCalled();
      expect(spanId).toBe('0102030405060708');

      global.crypto = originalCrypto;
    });

    it('should fall back to Math.random when crypto is unavailable', () => {
      const originalCrypto = global.crypto;
      const originalRandom = Math.random;

      // @ts-expect-error - Intentionally removing crypto for testing fallback
      delete global.crypto;

      Math.random = jest.fn(() => 0.5);

      const spanId = generateSpanId();

      expect(spanId).toBeDefined();
      expect(spanId.length).toBe(16);

      Math.random = originalRandom;
      global.crypto = originalCrypto;
    });
  });

  describe('Integration scenarios', () => {
    it('should handle parent-child span relationship', () => {
      // Parent span
      const parentContext: W3CTraceContext = {
        traceId: generateTraceId(),
        spanId: generateSpanId(),
        sampled: true,
      };

      // Child span
      const childContext: W3CTraceContext = {
        traceId: parentContext.traceId, // Same trace
        spanId: generateSpanId(), // New span
        parentSpanId: parentContext.spanId,
        sampled: parentContext.sampled,
      };

      expect(childContext.traceId).toBe(parentContext.traceId);
      expect(childContext.spanId).not.toBe(parentContext.spanId);
      expect(childContext.parentSpanId).toBe(parentContext.spanId);
    });

    it('should propagate through HTTP headers', () => {
      // Service A creates trace
      const serviceAContext: W3CTraceContext = {
        traceId: generateTraceId(),
        spanId: generateSpanId(),
        sampled: true,
      };

      // Service A sends request to Service B
      const outgoingHeaders = {
        traceparent: createTraceparent(serviceAContext),
      };

      // Service B receives and extracts
      const serviceBContext = extractTraceContext(outgoingHeaders);

      expect(serviceBContext?.traceId).toBe(serviceAContext.traceId);
      expect(serviceBContext?.spanId).toBe(serviceAContext.spanId);
      expect(serviceBContext?.sampled).toBe(serviceAContext.sampled);
    });

    it('should handle vendor-specific tracestate', () => {
      const headers = {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        tracestate: 'vendor1=opaque1,vendor2=opaque2,vendor3=opaque3',
      };

      const context = extractTraceContext(headers);

      expect(context?.traceState).toBe('vendor1=opaque1,vendor2=opaque2,vendor3=opaque3');
    });
  });
});
