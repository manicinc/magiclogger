# Function: createHTTPTransport()

> **createHTTPTransport**(`endpoint`, `options?`): [`HTTPTransport`](../../HTTPTransport/classes/HTTPTransport.md)

Defined in: [src/transports/http.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/http.ts#L55)

Creates an HTTP transport using worker threads.

All network operations happen in a dedicated worker thread,
including batching, compression, and retries.

## Parameters

### endpoint

`string`

HTTP endpoint URL

### options?

`Record`\<`string`, `unknown`\>

Transport options

## Returns

[`HTTPTransport`](../../HTTPTransport/classes/HTTPTransport.md)

Worker-based HTTP transport

## Example

```typescript
const transport = createHTTPTransport('https://logs.example.com', {
  batchSize: 200,
  flushInterval: 5000,
  compress: true,
  maxRetries: 5,
  circuitBreakerThreshold: 3
});
```
