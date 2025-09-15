// File: tests/unit/middleware/ObservabilityMiddleware.test.ts

// Jest is configured globally, no imports needed for describe, it, expect
const vi = { fn: jest.fn };
import {
  ObservabilityMiddleware,
  createOTLPObservability,
  type MetricsCollector,
  type TraceContext,
} from '../../../src/middleware/ObservabilityMiddleware';
import type { LogEntry } from '../../../src/types/transport';
import type { MiddlewareContext } from '../../../src/middleware/Middleware';

describe('ObservabilityMiddleware', () => {
  let mockEntry: LogEntry;
  let mockContext: MiddlewareContext;
  let originalCrypto: Crypto | undefined;

  beforeEach(() => {
    mockEntry = {
      id: 'test-123',
      timestamp: 1704067200000,
      level: 'info',
      message: 'Test message',
      loggerId: 'test-logger',
      context: {},
    };

    mockContext = {
      loggerId: 'test-logger',
      index: 0,
      total: 1,
      state: new Map(),
    };

    // Mock crypto.randomUUID
    originalCrypto = global.crypto;
    global.crypto = {
      randomUUID: vi.fn(() => 'mock-uuid-123'),
    } as unknown as Crypto;
  });

  afterEach(() => {
    if (originalCrypto) {
      global.crypto = originalCrypto;
    }
  });

  describe('Trace Context Injection', () => {
    it('should inject trace context when provided', () => {
      const traceContext: TraceContext = {
        traceId: 'trace-123',
        spanId: 'span-456',
        traceFlags: '01',
        traceState: 'vendor=value',
      };

      const middleware = new ObservabilityMiddleware({
        injectTraceContext: true,
        getTraceContext: () => traceContext,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.continue).toBe(true);
      expect(result.entry?.context?.traceId).toBe('trace-123');
      expect(result.entry?.context?.spanId).toBe('span-456');
      expect(result.entry?.context?.traceFlags).toBe('01');
      expect(result.entry?.context?.traceState).toBe('vendor=value');

      // Should also add to metadata for OTLP transport
      expect(result.entry?.metadata?.trace).toEqual({
        traceId: 'trace-123',
        spanId: 'span-456',
        traceFlags: '01',
        traceState: 'vendor=value',
      });
    });

    it('should not inject trace context when disabled', () => {
      const traceContext: TraceContext = {
        traceId: 'trace-123',
        spanId: 'span-456',
      };

      const middleware = new ObservabilityMiddleware({
        injectTraceContext: false,
        getTraceContext: () => traceContext,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.traceId).toBeUndefined();
      expect(result.entry?.context?.spanId).toBeUndefined();
    });

    it('should handle missing trace context gracefully', () => {
      const middleware = new ObservabilityMiddleware({
        injectTraceContext: true,
        getTraceContext: () => undefined,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.continue).toBe(true);
      expect(result.entry?.context?.traceId).toBeUndefined();
    });
  });

  describe('Correlation ID Generation', () => {
    it('should generate correlation ID when not present', () => {
      const middleware = new ObservabilityMiddleware({
        generateCorrelationId: true,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.correlationId).toBe('mock-uuid-123');
    });

    it('should not override existing correlation ID', () => {
      const middleware = new ObservabilityMiddleware({
        generateCorrelationId: true,
      });

      mockEntry.context = { correlationId: 'existing-id' };

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.correlationId).toBe('existing-id');
    });

    it('should use fallback when crypto.randomUUID is not available', () => {
      global.crypto = {} as unknown as Crypto; // No randomUUID

      const middleware = new ObservabilityMiddleware({
        generateCorrelationId: true,
      });

      const result = middleware.process(mockEntry, mockContext);

      // Should match UUID format or fallback format (timestamp-counter-hex)
      expect(result.entry?.context?.correlationId).toMatch(
        /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+-\d{5}-[0-9a-f]{6})$/
      );
    });
  });

  describe('Health Metadata', () => {
    it('should include health metadata when enabled', () => {
      const originalProcess = global.process;
      global.process = {
        uptime: () => 123.456,
        pid: 12345,
      } as unknown as NodeJS.Process;

      const middleware = new ObservabilityMiddleware({
        includeHealthMetadata: true,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.metadata?.health).toBeDefined();
      expect(result.entry?.metadata?.health?.timestamp).toBeGreaterThan(0);
      expect(result.entry?.metadata?.health?.uptime).toBe(123.456);
      expect(result.entry?.metadata?.health?.pid).toBe(12345);

      global.process = originalProcess;
    });

    it('should not include health metadata when disabled', () => {
      const middleware = new ObservabilityMiddleware({
        includeHealthMetadata: false,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.metadata?.health).toBeUndefined();
    });
  });

  describe('Resource Usage Tracking', () => {
    it('should track resource usage when enabled and sampled', () => {
      const originalProcess = global.process;
      global.process = {
        memoryUsage: () => ({
          rss: 100000,
          heapTotal: 80000,
          heapUsed: 60000,
          external: 10000,
          arrayBuffers: 5000,
        }),
        cpuUsage: vi.fn(() => ({ user: 1000, system: 500 })),
      } as unknown as NodeJS.Process;

      const middleware = new ObservabilityMiddleware({
        trackResourceUsage: true,
        metricsSampleRate: 1.0, // Always sample
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.metadata?.resources).toBeDefined();
      expect(result.entry?.metadata?.resources?.memory).toEqual({
        rss: 100000,
        heapTotal: 80000,
        heapUsed: 60000,
        external: 10000,
        arrayBuffers: 5000,
      });
      expect(result.entry?.metadata?.resources?.cpu).toBeDefined();

      global.process = originalProcess;
    });

    it('should respect sampling rate', () => {
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.5);

      const middleware = new ObservabilityMiddleware({
        trackResourceUsage: true,
        metricsSampleRate: 0.1, // 10% sample rate
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.metadata?.resources).toBeUndefined();

      Math.random = originalRandom;
    });
  });

  describe('Metrics Collection', () => {
    it('should collect metrics when enabled', () => {
      const metricsCollector: MetricsCollector = {
        increment: vi.fn(),
        gauge: vi.fn(),
        histogram: vi.fn(),
        timing: vi.fn(),
      };

      const middleware = new ObservabilityMiddleware({
        collectMetrics: true,
        metricsCollector,
      });

      middleware.process(mockEntry, mockContext);

      expect(metricsCollector.increment).toHaveBeenCalledWith('logs.total', 1, {
        level: 'info',
        logger: 'test-logger',
      });
      expect(metricsCollector.histogram).toHaveBeenCalled();
    });

    it('should track metrics by level', () => {
      const middleware = new ObservabilityMiddleware({
        collectMetrics: true,
      });

      middleware.process(mockEntry, mockContext);
      mockEntry.level = 'error';
      middleware.process(mockEntry, mockContext);
      mockEntry.level = 'error';
      middleware.process(mockEntry, mockContext);

      const metrics = middleware.getMetrics();
      expect(metrics.total).toBe(3);
      expect(metrics.byLevel.info).toBe(1);
      expect(metrics.byLevel.error).toBe(2);
    });

    it('should detect slow logs', () => {
      const onSlowLog = vi.fn();
      const metricsCollector: MetricsCollector = {
        increment: vi.fn(),
        gauge: vi.fn(),
        histogram: vi.fn(),
        timing: vi.fn(),
      };

      const middleware = new ObservabilityMiddleware({
        collectMetrics: true,
        slowLogThreshold: 0, // Everything is slow
        onSlowLog,
        metricsCollector,
      });

      middleware.process(mockEntry, mockContext);

      expect(onSlowLog).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-123',
          level: 'info',
          message: 'Test message',
        }),
        expect.any(Number)
      );
      expect(metricsCollector.increment).toHaveBeenCalledWith('logs.slow', 1, {
        level: 'info',
        logger: 'test-logger',
      });
    });

    it('should emit metrics events', () => {
      const onMetrics = vi.fn();

      const middleware = new ObservabilityMiddleware({
        collectMetrics: true,
        onMetrics,
        metricsSampleRate: 1.0, // Always emit
      });

      middleware.process(mockEntry, mockContext);

      expect(onMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          level: 'info',
          loggerId: 'test-logger',
          processingTime: expect.any(Number),
          droppedCount: 0,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const middleware = new ObservabilityMiddleware({
        getTraceContext: () => {
          throw new Error('Trace context error');
        },
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.continue).toBe(true);
      const metrics = middleware.getMetrics();
      expect(metrics.errors).toBe(1);
    });
  });

  describe('Metrics Management', () => {
    it('should reset metrics', () => {
      const middleware = new ObservabilityMiddleware({
        collectMetrics: true,
      });

      middleware.process(mockEntry, mockContext);
      middleware.process(mockEntry, mockContext);

      let metrics = middleware.getMetrics();
      expect(metrics.total).toBe(2);

      middleware.resetMetrics();

      metrics = middleware.getMetrics();
      expect(metrics.total).toBe(0);
      expect(metrics.byLevel).toEqual({});
      expect(metrics.dropped).toBe(0);
      expect(metrics.errors).toBe(0);
    });
  });

  describe('Priority', () => {
    it('should have appropriate priority', () => {
      const middleware = new ObservabilityMiddleware();
      expect(middleware.priority).toBe(20); // Should run early but after security
    });
  });

  describe('createOTLPObservability Helper', () => {
    it('should create middleware with OpenTelemetry integration', () => {
      const mockSpan = {
        spanContext: () => ({
          traceId: 'otel-trace-123',
          spanId: 'otel-span-456',
          traceFlags: 1,
          traceState: { serialize: () => 'vendor=otel' },
        }),
      };

      const mockTrace = {
        getActiveSpan: () => mockSpan,
      };

      const onMetrics = vi.fn();

      const middleware = createOTLPObservability({
        api: { trace: mockTrace },
        onMetrics,
        config: {
          generateCorrelationId: true,
        },
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.entry?.context?.traceId).toBe('otel-trace-123');
      expect(result.entry?.context?.spanId).toBe('otel-span-456');
      expect(result.entry?.context?.traceFlags).toBe('1');
      expect(result.entry?.context?.traceState).toBe('vendor=otel');
      expect(result.entry?.context?.correlationId).toBeDefined();
    });

    it('should handle missing OpenTelemetry API gracefully', () => {
      const middleware = createOTLPObservability({
        api: undefined,
      });

      const result = middleware.process(mockEntry, mockContext);

      expect(result.continue).toBe(true);
      expect(result.entry?.context?.traceId).toBeUndefined();
    });
  });
});
