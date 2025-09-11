# Function: createAsyncLogger()

> **createAsyncLogger**(`options`): [`AsyncLogger`](../../async/AsyncLogger/classes/AsyncLogger.md)

Defined in: [src/index.ts:299](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.ts#L299)

Creates a high-performance async logger that routes directly to transports.
Each transport manages its own buffering and threading strategy for optimal performance.

## Parameters

### options

`Partial`\<[`AsyncLoggerOptions`](../../async/AsyncLogger/interfaces/AsyncLoggerOptions.md)\> = `{}`

Configuration options for async logger

## Returns

[`AsyncLogger`](../../async/AsyncLogger/classes/AsyncLogger.md)

AsyncLogger instance that routes logs directly to transports

## Example

```typescript
// Create async logger with worker thread transports
const logger = createAsyncLogger({
  transports: [
    new FileWorkerTransport({ filepath: 'app.log' }),
    new HTTPWorkerTransport({ endpoint: 'https://logs.example.com' }),
    new SyncConsoleTransport() // Immediate feedback in development
  ]
});

// Logs are routed directly to each transport
logger.info('Each transport handles this independently');
```
