# ~~Function: createSyncLogger()~~

> **createSyncLogger**(`options`): [`SyncLogger`](../../sync/SyncLogger/classes/SyncLogger.md)

Defined in: [src/index.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.ts#L131)

Creates a synchronous logger with blocking I/O.

## Parameters

### options

`Partial`\<[`LoggerOptions`](../../types/logger/interfaces/LoggerOptions.md)\> = `{}`

Configuration options

## Returns

[`SyncLogger`](../../sync/SyncLogger/classes/SyncLogger.md)

Logger instance in sync mode

## Deprecated

Use createLogger({ mode: 'sync' }) instead
