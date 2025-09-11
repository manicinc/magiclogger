# Function: createLogger()

> **createLogger**(`options`): [`Logger`](../../Logger/classes/Logger.md) \| [`AsyncLogger`](../../async/AsyncLogger/classes/AsyncLogger.md) \| [`SyncLogger`](../../sync/SyncLogger/classes/SyncLogger.md)

Defined in: [src/index.ts:95](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.ts#L95)

Creates a logger with configurable behavior.

## Parameters

### options

`Partial`\<[`LoggerOptions`](../../types/logger/interfaces/LoggerOptions.md) & [`AsyncLoggerOptions`](../../async/AsyncLogger/interfaces/AsyncLoggerOptions.md)\> = `{}`

Configuration options

## Returns

[`Logger`](../../Logger/classes/Logger.md) \| [`AsyncLogger`](../../async/AsyncLogger/classes/AsyncLogger.md) \| [`SyncLogger`](../../sync/SyncLogger/classes/SyncLogger.md)

Logger instance

## Example

```typescript
// Default async logger for high performance
const logger = createLogger();

// Explicit async mode
const asyncLogger = createLogger({ mode: 'async' });

// Sync logger for debugging or auditing
const syncLogger = createLogger({ mode: 'sync' });

// Auto-detect based on environment
const autoLogger = createLogger({ mode: 'auto' });
```
