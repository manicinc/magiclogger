# Function: createAsyncLogger()

> **createAsyncLogger**(`options?`): [`AsyncLogger`](../classes/AsyncLogger.md)

Defined in: [src/async/AsyncLogger.ts:1233](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L1233)

Creates a new AsyncLogger instance.

## Parameters

### options?

[`AsyncLoggerOptions`](../interfaces/AsyncLoggerOptions.md)

Logger options

## Returns

[`AsyncLogger`](../classes/AsyncLogger.md)

Logger instance

## Since

1.0.0

## Example

```typescript
const logger = createAsyncLogger({
  transports: [new ConsoleTransport()],
  worker: { poolSize: 2 }
});
```
