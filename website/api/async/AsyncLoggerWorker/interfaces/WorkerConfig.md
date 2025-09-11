# Interface: WorkerConfig

Defined in: [src/async/AsyncLoggerWorker.ts:44](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L44)

Worker configuration interface.

 WorkerConfig

## Since

1.0.0

## Properties

### batchSize?

> `optional` **batchSize**: `number`

Defined in: [src/async/AsyncLoggerWorker.ts:48](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L48)

Batch size for buffering

***

### enableCompression?

> `optional` **enableCompression**: `boolean`

Defined in: [src/async/AsyncLoggerWorker.ts:52](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L52)

Enable compression for large batches

***

### flushInterval?

> `optional` **flushInterval**: `number`

Defined in: [src/async/AsyncLoggerWorker.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L50)

Flush interval in milliseconds

***

### workerId

> **workerId**: `number`

Defined in: [src/async/AsyncLoggerWorker.ts:46](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L46)

Worker ID for identification
