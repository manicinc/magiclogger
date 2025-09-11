# Function: extractTraceContext()

> **extractTraceContext**(`headers`): `undefined` \| [`W3CTraceContext`](../interfaces/W3CTraceContext.md)

Defined in: [src/utils/trace-context.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L75)

Extracts W3C Trace Context from HTTP headers.

This function parses the standard W3C traceparent and tracestate headers
used by OpenTelemetry, Jaeger, Zipkin, and other distributed tracing systems.
It validates the format according to W3C specifications and returns a
structured trace context object.

**Note:** In most cases, you don't need to call this directly. Use the
TraceContextMiddleware for automatic extraction, or configure your transport
with autoExtractTrace: true.

## Parameters

### headers

`Record`\<`string`, `string` \| `string`[] \| `undefined`\>

HTTP headers object

## Returns

`undefined` \| [`W3CTraceContext`](../interfaces/W3CTraceContext.md)

Parsed trace context or undefined if not present/invalid

## Examples

```typescript
import { extractTraceContext } from 'magiclogger/utils/trace-context';

app.post('/api/endpoint', (req, res) => {
  const traceContext = extractTraceContext(req.headers);
  if (traceContext) {
    logger.info('Request received', { trace: traceContext });
  }
});
```

```typescript
const headers = {
  'traceparent': '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
  'tracestate': 'vendor=value'
};
const context = extractTraceContext(headers);
// Returns: { traceId: '4bf92...', spanId: '00f06...', sampled: true, ... }
```

## See

 - [Traceparent Header](https://www.w3.org/TR/trace-context/#traceparent-header)
 - [Tracestate Header](https://www.w3.org/TR/trace-context/#tracestate-header)
