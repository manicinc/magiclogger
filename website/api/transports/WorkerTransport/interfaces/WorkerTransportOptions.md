# Interface: WorkerTransportOptions

Defined in: [src/transports/WorkerTransport.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L19)

Worker thread transport configuration.

 WorkerTransportOptions

## Properties

### batchSize?

> `optional` **batchSize**: `number`

Defined in: [src/transports/WorkerTransport.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L33)

Batch size for flushing

***

### bufferSize?

> `optional` **bufferSize**: `number`

Defined in: [src/transports/WorkerTransport.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L31)

Ring buffer size (power of 2 for performance)

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/transports/WorkerTransport.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L23)

Whether enabled

***

### flushInterval?

> `optional` **flushInterval**: `number`

Defined in: [src/transports/WorkerTransport.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L35)

Flush interval in ms

***

### level?

> `optional` **level**: `string`

Defined in: [src/transports/WorkerTransport.ts:25](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L25)

Minimum log level

***

### name?

> `optional` **name**: `string`

Defined in: [src/transports/WorkerTransport.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L21)

Transport name

***

### workerOptions?

> `optional` **workerOptions**: `Record`\<`string`, `unknown`\>

Defined in: [src/transports/WorkerTransport.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L29)

Worker options

***

### workerPath

> **workerPath**: `string`

Defined in: [src/transports/WorkerTransport.ts:27](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/WorkerTransport.ts#L27)

Worker script path
