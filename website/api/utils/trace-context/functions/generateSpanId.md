# Function: generateSpanId()

> **generateSpanId**(): `string`

Defined in: [src/utils/trace-context.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L228)

Generates a cryptographically random span ID.

Creates a 64-bit (16 hex character) span identifier for identifying
individual operations within a trace. Uses crypto.getRandomValues
in browsers or Math.random as fallback.

## Returns

`string`

A 16 character hexadecimal span ID

## Example

```typescript
const childSpan = {
  traceId: parentContext.traceId, // Keep same trace ID
  spanId: generateSpanId(),        // New span ID
  parentSpanId: parentContext.spanId
};
```
