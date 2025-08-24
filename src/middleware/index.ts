// File: src/middleware/index.ts

// Core middleware infrastructure
export {
  Middleware,
  AsyncMiddleware,
  MiddlewarePipeline,
  type MiddlewareResult,
  type MiddlewareContext,
} from './Middleware';

// Security middleware
export { SecurityMiddleware, type SecurityMiddlewareOptions } from './SecurityMiddleware';

// Observability middleware
export {
  ObservabilityMiddleware,
  createOTLPObservability,
  type ObservabilityMiddlewareOptions,
  type MetricsCollector,
  type TraceContext,
  type LogMetrics,
} from './ObservabilityMiddleware';

// Trace context middleware
export {
  TraceContextMiddleware,
  createExpressTraceMiddleware,
  createKoaTraceMiddleware,
  createFastifyTraceMiddleware,
  type TraceContextMiddlewareOptions,
} from './TraceContextMiddleware';
