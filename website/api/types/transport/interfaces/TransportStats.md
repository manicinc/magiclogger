# Interface: TransportStats

Defined in: [src/types/transport.ts:1245](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1245)

Transport statistics for monitoring.

## Extended by

- [`SyncFileTransportStats`](../../../transports/SyncFileTransport/interfaces/SyncFileTransportStats.md)

## Properties

### custom?

> `optional` **custom**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/transport.ts:1283](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1283)

Transport-specific metrics.

***

### failed

> **failed**: `number`

Defined in: [src/types/transport.ts:1259](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1259)

Total logs that failed to send.

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

***

### lastSuccess?

> `optional` **lastSuccess**: `Date`

Defined in: [src/types/transport.ts:1269](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1269)

Last successful log timestamp.

***

### logged?

> `optional` **logged**: `number`

Defined in: [src/types/transport.ts:1293](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1293)

Alias for succeeded count, provided for readability in some consumers/tests.

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:1288](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1288)

Optional transport identifier for convenience in tests/metrics.

***

### processed

> **processed**: `number`

Defined in: [src/types/transport.ts:1249](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1249)

Total logs processed by this transport.

***

### queued?

> `optional` **queued**: `number`

Defined in: [src/types/transport.ts:1264](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1264)

Current number of logs in queue (if applicable).

***

### sent?

> `optional` **sent**: `number`

Defined in: [src/types/transport.ts:1298](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1298)

Additional alias for succeeded count expected by some tests/consumers.

***

### succeeded

> **succeeded**: `number`

Defined in: [src/types/transport.ts:1254](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1254)

Total logs successfully sent.
