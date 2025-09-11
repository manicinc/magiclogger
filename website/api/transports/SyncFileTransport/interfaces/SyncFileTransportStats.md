# Interface: SyncFileTransportStats

Defined in: [src/transports/SyncFileTransport.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L31)

Extended statistics interface for SyncFileTransport
Includes file-specific metrics in addition to base transport stats

## Extends

- [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

## Properties

### averageFlushSize

> **averageFlushSize**: `number`

Defined in: [src/transports/SyncFileTransport.ts:40](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L40)

***

### bufferLength

> **bufferLength**: `number`

Defined in: [src/transports/SyncFileTransport.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L38)

***

### bufferSize

> **bufferSize**: `number`

Defined in: [src/transports/SyncFileTransport.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L34)

***

### bytesWritten

> **bytesWritten**: `number`

Defined in: [src/transports/SyncFileTransport.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L37)

***

### currentFileSize

> **currentFileSize**: `number`

Defined in: [src/transports/SyncFileTransport.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L33)

***

### custom?

> `optional` **custom**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/transport.ts:1283](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1283)

Transport-specific metrics.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`custom`](../../../types/transport/interfaces/TransportStats.md#custom)

***

### failed

> **failed**: `number`

Defined in: [src/types/transport.ts:1259](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1259)

Total logs that failed to send.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`failed`](../../../types/transport/interfaces/TransportStats.md#failed)

***

### filepath

> **filepath**: `string`

Defined in: [src/transports/SyncFileTransport.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L32)

***

### flushCount

> **flushCount**: `number`

Defined in: [src/transports/SyncFileTransport.ts:39](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L39)

***

### flushInterval

> **flushInterval**: `number`

Defined in: [src/transports/SyncFileTransport.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L35)

***

### lastError?

> `optional` **lastError**: `object`

Defined in: [src/types/transport.ts:1274](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1274)

Last error that occurred.

#### count

> **count**: `number`

#### message

> **message**: `string`

#### timestamp

> **timestamp**: `Date`

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`lastError`](../../../types/transport/interfaces/TransportStats.md#lasterror)

***

### lastSuccess?

> `optional` **lastSuccess**: `Date`

Defined in: [src/types/transport.ts:1269](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1269)

Last successful log timestamp.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`lastSuccess`](../../../types/transport/interfaces/TransportStats.md#lastsuccess)

***

### lastWrite

> **lastWrite**: `number`

Defined in: [src/transports/SyncFileTransport.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L42)

***

### logged?

> `optional` **logged**: `number`

Defined in: [src/types/transport.ts:1293](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1293)

Alias for succeeded count, provided for readability in some consumers/tests.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`logged`](../../../types/transport/interfaces/TransportStats.md#logged)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:1288](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1288)

Optional transport identifier for convenience in tests/metrics.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`name`](../../../types/transport/interfaces/TransportStats.md#name)

***

### processed

> **processed**: `number`

Defined in: [src/types/transport.ts:1249](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1249)

Total logs processed by this transport.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`processed`](../../../types/transport/interfaces/TransportStats.md#processed)

***

### queued?

> `optional` **queued**: `number`

Defined in: [src/types/transport.ts:1264](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1264)

Current number of logs in queue (if applicable).

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`queued`](../../../types/transport/interfaces/TransportStats.md#queued)

***

### rotations

> **rotations**: `number`

Defined in: [src/transports/SyncFileTransport.ts:41](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L41)

***

### sent?

> `optional` **sent**: `number`

Defined in: [src/types/transport.ts:1298](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1298)

Additional alias for succeeded count expected by some tests/consumers.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`sent`](../../../types/transport/interfaces/TransportStats.md#sent)

***

### succeeded

> **succeeded**: `number`

Defined in: [src/types/transport.ts:1254](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1254)

Total logs successfully sent.

#### Inherited from

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md).[`succeeded`](../../../types/transport/interfaces/TransportStats.md#succeeded)

***

### writeCount

> **writeCount**: `number`

Defined in: [src/transports/SyncFileTransport.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/SyncFileTransport.ts#L36)
