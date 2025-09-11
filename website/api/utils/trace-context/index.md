# utils/trace-context

## Fileoverview

W3C Trace Context utilities for distributed tracing.

This module provides utilities for working with W3C Trace Context headers,
enabling distributed tracing correlation across microservices and systems.
These utilities are used internally by MagicLogger's transport system but
can also be used directly for custom trace context handling.

## See

[W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)

## Interfaces

- [W3CTraceContext](interfaces/W3CTraceContext.md)

## Functions

- [createTraceparent](functions/createTraceparent.md)
- [extractTraceContext](functions/extractTraceContext.md)
- [generateSpanId](functions/generateSpanId.md)
- [generateTraceId](functions/generateTraceId.md)
