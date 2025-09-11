# Class: WorkerState

Defined in: [src/async/AsyncLoggerWorker.ts:98](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L98)

Main worker state manager for log processing.

Handles batching, serialization, and metrics collection in the worker thread.
Implements efficient memory management and backpressure handling.

 WorkerState

## Since

1.0.0

## Constructors

### Constructor

> **new WorkerState**(`config`): `WorkerState`

Defined in: [src/async/AsyncLoggerWorker.ts:141](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L141)

Creates a new worker state instance.

#### Parameters

##### config

[`WorkerConfig`](../interfaces/WorkerConfig.md)

Worker configuration

#### Returns

`WorkerState`

## Methods

### flush()

> **flush**(): `void`

Defined in: [src/async/AsyncLoggerWorker.ts:210](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L210)

Flushes buffered logs with serialization.

#### Returns

`void`

***

### getStats()

> **getStats**(): [`WorkerMetrics`](../interfaces/WorkerMetrics.md)

Defined in: [src/async/AsyncLoggerWorker.ts:376](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L376)

Gets current worker statistics.

#### Returns

[`WorkerMetrics`](../interfaces/WorkerMetrics.md)

Current metrics

***

### initialize()

> **initialize**(`transports`): `void`

Defined in: [src/async/AsyncLoggerWorker.ts:163](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L163)

Initializes the worker with transport configuration.

#### Parameters

##### transports

`TransportConfig`[]

Transport configurations

#### Returns

`void`

***

### processBatch()

> **processBatch**(`entries`): `void`

Defined in: [src/async/AsyncLoggerWorker.ts:174](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L174)

Processes a batch of log entries.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Log entries to process

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `void`

Defined in: [src/async/AsyncLoggerWorker.ts:360](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLoggerWorker.ts#L360)

Shuts down the worker gracefully.

#### Returns

`void`
