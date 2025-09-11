# Function: default()

> **default**(`options`): [`Logger`](../../Logger/classes/Logger.md) \| [`AsyncLogger`](../../async/AsyncLogger/classes/AsyncLogger.md) \| [`SyncLogger`](../../sync/SyncLogger/classes/SyncLogger.md)

Defined in: [src/index.ts:149](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.ts#L149)

Default export - creates an async logger.

## Parameters

### options

`Partial`\<[`LoggerOptions`](../../types/logger/interfaces/LoggerOptions.md) & [`AsyncLoggerOptions`](../../async/AsyncLogger/interfaces/AsyncLoggerOptions.md)\> = `{}`

## Returns

[`Logger`](../../Logger/classes/Logger.md) \| [`AsyncLogger`](../../async/AsyncLogger/classes/AsyncLogger.md) \| [`SyncLogger`](../../sync/SyncLogger/classes/SyncLogger.md)

## Example

```typescript
import logger from 'magiclogger';
const log = logger();
log.info('Hello world');
```
