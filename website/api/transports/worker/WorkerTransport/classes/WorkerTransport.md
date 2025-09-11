# Class: WorkerTransport

Defined in: [src/transports/worker/WorkerTransport.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L35)

High-performance worker thread transport

## Implements

- [`Transport`](../../../../types/transport/interfaces/Transport.md)

## Constructors

### Constructor

> **new WorkerTransport**(`options`): `WorkerTransport`

Defined in: [src/transports/worker/WorkerTransport.ts:46](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L46)

#### Parameters

##### options

###### bufferSize?

`number`

###### maxRetries?

`number`

###### workerPath?

`string`

#### Returns

`WorkerTransport`

## Properties

### enabled

> **enabled**: `boolean` = `true`

Defined in: [src/transports/worker/WorkerTransport.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L37)

Whether this transport is currently enabled.

#### Implementation of

[`Transport`](../../../../types/transport/interfaces/Transport.md).[`enabled`](../../../../types/transport/interfaces/Transport.md#enabled)

***

### name

> **name**: `"worker"`

Defined in: [src/transports/worker/WorkerTransport.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L36)

Unique name of this transport instance.

#### Implementation of

[`Transport`](../../../../types/transport/interfaces/Transport.md).[`name`](../../../../types/transport/interfaces/Transport.md#name)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transports/worker/WorkerTransport.ts:92](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L92)

Close the transport and clean up resources.
Should flush any pending logs.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../../../../types/transport/interfaces/Transport.md).[`close`](../../../../types/transport/interfaces/Transport.md#close)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/transports/worker/WorkerTransport.ts:54](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L54)

Initialize the transport.
Called when transport is added to logger.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../../../../types/transport/interfaces/Transport.md).[`init`](../../../../types/transport/interfaces/Transport.md#init)

***

### log()

> **log**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/worker/WorkerTransport.ts:115](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L115)

Log a single entry.
Should handle the entry according to transport's configuration.

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../../../../types/transport/interfaces/Transport.md).[`log`](../../../../types/transport/interfaces/Transport.md#log)

***

### shouldLog()

> **shouldLog**(): `boolean`

Defined in: [src/transports/worker/WorkerTransport.ts:111](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/worker/WorkerTransport.ts#L111)

Check if transport should handle this log entry.

#### Returns

`boolean`

#### Implementation of

[`Transport`](../../../../types/transport/interfaces/Transport.md).[`shouldLog`](../../../../types/transport/interfaces/Transport.md#shouldlog)
