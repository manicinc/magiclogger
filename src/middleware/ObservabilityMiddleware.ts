// File: src/middleware/ObservabilityMiddleware.ts

import { Middleware, type MiddlewareResult, type MiddlewareContext } from './Middleware';
import type { LogEntry } from '../types/transport';

/**
 * Metrics collector interface for observability.
 */
export interface MetricsCollector {
  /**
   * Increment a counter metric.
   */
  increment(name: string, value?: number, tags?: Record<string, string>): void;
  
  /**
   * Record a gauge metric.
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * Record a histogram metric.
   */
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * Record timing metric.
   */
  timing(name: string, duration: number, tags?: Record<string, string>): void;
}

/**
 * Trace context for OpenTelemetry integration.
 */
export interface TraceContext {
  traceId?: string;
  spanId?: string;
  traceFlags?: string;
  traceState?: string;
}

/**
 * Observability middleware configuration.
 */
export interface ObservabilityMiddlewareOptions {
  /**
   * Enable performance metrics collection.
   * @default true
   */
  collectMetrics?: boolean;
  
  /**
   * Enable trace context injection for OpenTelemetry.
   * @default true
   */
  injectTraceContext?: boolean;
  
  /**
   * Enable automatic correlation ID generation.
   * @default true
   */
  generateCorrelationId?: boolean;
  
  /**
   * Custom metrics collector implementation.
   */
  metricsCollector?: MetricsCollector;
  
  /**
   * Function to get current trace context (for OpenTelemetry integration).
   */
  getTraceContext?: () => TraceContext | undefined;
  
  /**
   * Enable health check metadata.
   * @default false
   */
  includeHealthMetadata?: boolean;
  
  /**
   * Enable resource utilization tracking.
   * @default false
   */
  trackResourceUsage?: boolean;
  
  /**
   * Callback for metrics events.
   */
  onMetrics?: (metrics: LogMetrics) => void;
  
  /**
   * Callback for slow log detection.
   */
  onSlowLog?: (entry: LogEntry, duration: number) => void;
  
  /**
   * Slow log threshold in milliseconds.
   * @default 100
   */
  slowLogThreshold?: number;
  
  /**
   * Sample rate for detailed metrics (0-1).
   * @default 0.1
   */
  metricsSampleRate?: number;
}

/**
 * Log metrics data.
 */
export interface LogMetrics {
  timestamp: number;
  level: string;
  loggerId: string;
  processingTime?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  droppedCount?: number;
  bufferUtilization?: number;
  transportLatency?: Record<string, number>;
  tags?: Record<string, string>;
}

/**
 * Observability middleware for monitoring and OpenTelemetry integration.
 * 
 * This middleware provides:
 * - OpenTelemetry trace context injection
 * - Metrics collection and reporting
 * - Correlation ID generation
 * - Performance monitoring
 * - Resource usage tracking
 * - Health metadata injection
 * 
 * @class ObservabilityMiddleware
 * @extends {Middleware}
 * 
 * @example
 * ```typescript
 * // With OpenTelemetry
 * import { trace } from '@opentelemetry/api';
 * 
 * const observability = new ObservabilityMiddleware({
 *   injectTraceContext: true,
 *   getTraceContext: () => {
 *     const span = trace.getActiveSpan();
 *     if (!span) return undefined;
 *     const context = span.spanContext();
 *     return {
 *       traceId: context.traceId,
 *       spanId: context.spanId,
 *       traceFlags: context.traceFlags.toString(),
 *     };
 *   },
 *   onMetrics: (metrics) => {
 *     // Send to your metrics backend
 *     metricsBackend.send(metrics);
 *   }
 * });
 * 
 * logger.addMiddleware(observability);
 * ```
 */
export class ObservabilityMiddleware extends Middleware {
  readonly name = 'observability';
  readonly priority = 20; // Run early but after security
  
  private readonly options: Required<Omit<ObservabilityMiddlewareOptions, 'metricsCollector' | 'getTraceContext' | 'onMetrics' | 'onSlowLog'>>;
  private readonly metricsCollector?: MetricsCollector;
  private readonly getTraceContext?: () => TraceContext | undefined;
  private readonly onMetrics?: (metrics: LogMetrics) => void;
  private readonly onSlowLog?: (entry: LogEntry, duration: number) => void;
  
  /**
   * Metrics counters.
   * @private
   */
  private metrics = {
    total: 0,
    byLevel: new Map<string, number>(),
    dropped: 0,
    errors: 0,
  };
  
  /**
   * Last CPU usage for delta calculation.
   * @private
   */
  private lastCpuUsage?: NodeJS.CpuUsage;
  
  constructor(options: ObservabilityMiddlewareOptions = {}) {
    super();
    this.options = {
      collectMetrics: options.collectMetrics ?? true,
      injectTraceContext: options.injectTraceContext ?? true,
      generateCorrelationId: options.generateCorrelationId ?? true,
      includeHealthMetadata: options.includeHealthMetadata ?? false,
      trackResourceUsage: options.trackResourceUsage ?? false,
      slowLogThreshold: options.slowLogThreshold ?? 100,
      metricsSampleRate: options.metricsSampleRate ?? 0.1,
    };
    
    this.metricsCollector = options.metricsCollector;
    this.getTraceContext = options.getTraceContext;
    this.onMetrics = options.onMetrics;
    this.onSlowLog = options.onSlowLog;
    
    // Initialize CPU usage baseline
    if (this.options.trackResourceUsage && typeof process !== 'undefined' && process.cpuUsage) {
      this.lastCpuUsage = process.cpuUsage();
    }
  }
  
  process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
    const startTime = this.options.collectMetrics ? performance.now() : 0;
    
    try {
      // Create enriched entry
      const enriched: LogEntry = { ...entry };
      
      // Add OpenTelemetry trace context
      if (this.options.injectTraceContext && this.getTraceContext) {
        const traceContext = this.getTraceContext();
        if (traceContext) {
          enriched.context = {
            ...enriched.context,
            traceId: traceContext.traceId,
            spanId: traceContext.spanId,
            traceFlags: traceContext.traceFlags,
            traceState: traceContext.traceState,
          };
          
          // Add trace context to metadata for OTLP transport
          enriched.metadata = {
            ...enriched.metadata,
            trace: {
              traceId: traceContext.traceId,
              spanId: traceContext.spanId,
              traceFlags: traceContext.traceFlags,
              traceState: traceContext.traceState,
            },
          };
        }
      }
      
      // Generate correlation ID if not present
      if (this.options.generateCorrelationId && !enriched.context?.correlationId) {
        enriched.context = {
          ...enriched.context,
          correlationId: this.generateCorrelationId(),
        };
      }
      
      // Add health metadata
      if (this.options.includeHealthMetadata) {
        enriched.metadata = {
          ...enriched.metadata,
          health: {
            timestamp: Date.now(),
            uptime: typeof process !== 'undefined' ? process.uptime() : undefined,
            pid: typeof process !== 'undefined' ? process.pid : undefined,
          },
        };
      }
      
      // Track resource usage
      if (this.options.trackResourceUsage && this.shouldSample()) {
        const resourceMetrics = this.collectResourceMetrics();
        enriched.metadata = {
          ...enriched.metadata,
          resources: resourceMetrics,
        };
      }
      
      // Collect metrics
      if (this.options.collectMetrics) {
        this.collectLogMetrics(enriched, startTime, context);
      }
      
      return { continue: true, entry: enriched };
    } catch (error) {
      this.metrics.errors++;
      return this.handleError(error as Error, entry, context);
    }
  }
  
  /**
   * Generate a correlation ID.
   * @private
   */
  private generateCorrelationId(): string {
    // Use crypto.randomUUID if available (Node.js 14.17+, modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback to timestamp + random
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Collect resource metrics.
   * @private
   */
  private collectResourceMetrics(): Record<string, unknown> {
    const metrics: Record<string, unknown> = {};
    
    if (typeof process !== 'undefined') {
      // Memory usage
      if (process.memoryUsage) {
        const memory = process.memoryUsage();
        metrics.memory = {
          rss: memory.rss,
          heapTotal: memory.heapTotal,
          heapUsed: memory.heapUsed,
          external: memory.external,
          arrayBuffers: memory.arrayBuffers,
        };
      }
      
      // CPU usage
      if (process.cpuUsage && this.lastCpuUsage) {
        const currentCpu = process.cpuUsage(this.lastCpuUsage);
        metrics.cpu = {
          user: currentCpu.user,
          system: currentCpu.system,
        };
        this.lastCpuUsage = process.cpuUsage();
      }
    }
    
    return metrics;
  }
  
  /**
   * Collect and report log metrics.
   * @private
   */
  private collectLogMetrics(entry: LogEntry, startTime: number, context: MiddlewareContext): void {
    const processingTime = performance.now() - startTime;
    
    // Update counters
    this.metrics.total++;
    const levelCount = this.metrics.byLevel.get(entry.level) || 0;
    this.metrics.byLevel.set(entry.level, levelCount + 1);
    
    // Report to metrics collector
    if (this.metricsCollector) {
      this.metricsCollector.increment('logs.total', 1, {
        level: entry.level,
        logger: context.loggerId,
      });
      
      this.metricsCollector.histogram('logs.processing_time', processingTime, {
        level: entry.level,
        logger: context.loggerId,
      });
    }
    
    // Check for slow logs
    if (processingTime > this.options.slowLogThreshold) {
      this.onSlowLog?.(entry, processingTime);
      
      if (this.metricsCollector) {
        this.metricsCollector.increment('logs.slow', 1, {
          level: entry.level,
          logger: context.loggerId,
        });
      }
    }
    
    // Emit metrics event periodically or on sample
    if (this.onMetrics && this.shouldSample()) {
      const metrics: LogMetrics = {
        timestamp: Date.now(),
        level: entry.level,
        loggerId: context.loggerId,
        processingTime,
        droppedCount: this.metrics.dropped,
      };
      
      // Add resource metrics if available
      if (this.options.trackResourceUsage && typeof process !== 'undefined') {
        if (process.memoryUsage) {
          metrics.memoryUsage = process.memoryUsage();
        }
        if (process.cpuUsage) {
          metrics.cpuUsage = process.cpuUsage();
        }
      }
      
      this.onMetrics(metrics);
    }
  }
  
  /**
   * Determine if we should sample this log for detailed metrics.
   * @private
   */
  private shouldSample(): boolean {
    return Math.random() < this.options.metricsSampleRate;
  }
  
  /**
   * Get current metrics snapshot.
   */
  getMetrics(): {
    total: number;
    byLevel: Record<string, number>;
    dropped: number;
    errors: number;
  } {
    return {
      total: this.metrics.total,
      byLevel: Object.fromEntries(this.metrics.byLevel),
      dropped: this.metrics.dropped,
      errors: this.metrics.errors,
    };
  }
  
  /**
   * Reset metrics counters.
   */
  resetMetrics(): void {
    this.metrics.total = 0;
    this.metrics.byLevel.clear();
    this.metrics.dropped = 0;
    this.metrics.errors = 0;
  }
}

/**
 * OpenTelemetry helper for easy integration.
 * 
 * @example
 * ```typescript
 * import { trace } from '@opentelemetry/api';
 * import { createOTLPObservability } from 'magiclogger/middleware';
 * 
 * const observability = createOTLPObservability({
 *   api: { trace },
 *   onMetrics: (metrics) => console.log('Metrics:', metrics)
 * });
 * 
 * logger.addMiddleware(observability);
 * ```
 */
export function createOTLPObservability(options: {
  api?: { trace?: any };
  metricsCollector?: MetricsCollector;
  onMetrics?: (metrics: LogMetrics) => void;
  config?: Partial<ObservabilityMiddlewareOptions>;
}): ObservabilityMiddleware {
  const getTraceContext = options.api?.trace ? (): TraceContext | undefined => {
    try {
      const span = options.api?.trace?.getActiveSpan();
      if (!span) return undefined;
      
      const context = span.spanContext();
      if (!context) return undefined;
      
      return {
        traceId: context.traceId,
        spanId: context.spanId,
        traceFlags: context.traceFlags?.toString(),
        traceState: context.traceState?.serialize?.(),
      };
    } catch {
      return undefined;
    }
  } : undefined;
  
  return new ObservabilityMiddleware({
    ...options.config,
    getTraceContext,
    metricsCollector: options.metricsCollector,
    onMetrics: options.onMetrics,
    injectTraceContext: true,
    generateCorrelationId: true,
  });
}