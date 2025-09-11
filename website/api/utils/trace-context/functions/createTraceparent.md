# Function: createTraceparent()

> **createTraceparent**(`context`): `string`

Defined in: [src/utils/trace-context.ts:160](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L160)

Creates a W3C traceparent header string from trace context.

Formats trace context into the standard W3C traceparent header format
for propagating trace context to downstream services.

## Parameters

### context

[`W3CTraceContext`](../interfaces/W3CTraceContext.md)

Trace context object

## Returns

`string`

Formatted traceparent header value

## Examples

```typescript
const traceparent = createTraceparent({
  traceId: '0af7651916cd43dd8448eb211c80319c',
  spanId: 'b7ad6b7169203331',
  sampled: true
});
// Returns: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"

// Use in outgoing request
fetch(url, {
  headers: {
    'traceparent': traceparent
  }
});
```

```typescript
const traceparent = createTraceparent({
  traceId: '0af7651916cd43dd8448eb211c80319c',
  sampled: false
});
// Span ID will be auto-generated
```
