# Function: generateTraceId()

> **generateTraceId**(): `string`

Defined in: [src/utils/trace-context.ts:192](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/trace-context.ts#L192)

Generates a cryptographically random trace ID.

Creates a 128-bit (32 hex character) trace identifier suitable for
starting a new trace or creating root spans. Uses crypto.getRandomValues
in browsers or Math.random as fallback.

## Returns

`string`

A 32 character hexadecimal trace ID

## Example

```typescript
const traceId = generateTraceId();
const spanId = generateSpanId();

const traceContext = {
  traceId,
  spanId,
  sampled: true
};

logger.info('Starting new trace', { trace: traceContext });
```
