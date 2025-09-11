# middleware/TraceContextMiddleware

## Fileoverview

Middleware for automatic W3C trace context extraction and propagation.
Automatically extracts trace context from various sources (HTTP headers, AsyncLocalStorage, etc.)
and injects it into log entries for distributed tracing correlation.

## Classes

- [TraceContextMiddleware](classes/TraceContextMiddleware.md)

## Interfaces

- [TraceContextMiddlewareOptions](interfaces/TraceContextMiddlewareOptions.md)

## Functions

- [createExpressTraceMiddleware](functions/createExpressTraceMiddleware.md)
- [createFastifyTraceMiddleware](functions/createFastifyTraceMiddleware.md)
- [createKoaTraceMiddleware](functions/createKoaTraceMiddleware.md)

## References

### W3CTraceContext

Re-exports [W3CTraceContext](../../utils/trace-context/interfaces/W3CTraceContext.md)
