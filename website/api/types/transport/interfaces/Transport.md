# Interface: Transport

Defined in: [src/types/transport.ts:1151](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1151)

Core transport interface that all transports must implement.

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [src/types/transport.ts:1160](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1160)

Whether this transport is currently enabled.

***

### name

> `readonly` **name**: `string`

Defined in: [src/types/transport.ts:1155](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1155)

Unique name of this transport instance.

## Methods

### close()

> **close**(): `void` \| `Promise`\<`void`\>

Defined in: [src/types/transport.ts:1183](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1183)

Close the transport and clean up resources.
Should flush any pending logs.

#### Returns

`void` \| `Promise`\<`void`\>

***

### disable()?

> `optional` **disable**(): `void`

Defined in: [src/types/transport.ts:1221](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1221)

Disable this transport (optional).

#### Returns

`void`

***

### emit()?

> `optional` **emit**(`event`, ...`args`): `boolean`

Defined in: [src/types/transport.ts:1233](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1233)

#### Parameters

##### event

keyof [`TransportEvents`](TransportEvents.md)

##### args

...`unknown`[]

#### Returns

`boolean`

***

### enable()?

> `optional` **enable**(): `void`

Defined in: [src/types/transport.ts:1218](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1218)

Enable this transport (optional).

#### Returns

`void`

***

### flush()?

> `optional` **flush**(): `void` \| `Promise`\<`void`\>

Defined in: [src/types/transport.ts:1188](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1188)

Flush any buffered logs immediately.

#### Returns

`void` \| `Promise`\<`void`\>

***

### getName()?

> `optional` **getName**(): `string`

Defined in: [src/types/transport.ts:1205](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1205)

Get the transport name.
Matches class Transport API for structural typing.

#### Returns

`string`

***

### getStats()?

> `optional` **getStats**(): [`TransportStats`](TransportStats.md)

Defined in: [src/types/transport.ts:1226](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1226)

Get transport statistics.

#### Returns

[`TransportStats`](TransportStats.md)

***

### init()?

> `optional` **init**(): `void` \| `Promise`\<`void`\>

Defined in: [src/types/transport.ts:1177](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1177)

Initialize the transport.
Called when transport is added to logger.

#### Returns

`void` \| `Promise`\<`void`\>

***

### isEnabled()?

> `optional` **isEnabled**(): `boolean`

Defined in: [src/types/transport.ts:1199](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1199)

Check if transport is currently enabled.
Matches class Transport API for structural typing.

#### Returns

`boolean`

***

### isHealthy()?

> `optional` **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/types/transport.ts:1215](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1215)

Optional health check method.

#### Returns

`Promise`\<`boolean`\>

***

### log()

> **log**(`entry`): `void` \| `Promise`\<`void`\>

Defined in: [src/types/transport.ts:1166](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1166)

Log a single entry.
Should handle the entry according to transport's configuration.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### logBatch()?

> `optional` **logBatch**(`entries`): `void` \| `Promise`\<`void`\>

Defined in: [src/types/transport.ts:1171](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1171)

Log multiple entries at once (for batch support).

#### Parameters

##### entries

[`LogEntry`](LogEntry.md)[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### off()?

> `optional` **off**(`event`, `listener`): `this`

Defined in: [src/types/transport.ts:1232](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1232)

#### Parameters

##### event

keyof [`TransportEvents`](TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

***

### on()?

> `optional` **on**(`event`, `listener`): `this`

Defined in: [src/types/transport.ts:1231](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1231)

Event emitter methods (optional but recommended).

#### Parameters

##### event

keyof [`TransportEvents`](TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

***

### once()?

> `optional` **once**(`event`, `listener`): `this`

Defined in: [src/types/transport.ts:1235](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1235)

Optional event helpers common on Node.js EventEmitter

#### Parameters

##### event

keyof [`TransportEvents`](TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

***

### removeListener()?

> `optional` **removeListener**(`event`, `listener`): `this`

Defined in: [src/types/transport.ts:1236](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1236)

#### Parameters

##### event

keyof [`TransportEvents`](TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

***

### resetStats()?

> `optional` **resetStats**(): `void`

Defined in: [src/types/transport.ts:1239](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1239)

Reset transport statistics (optional, but used by manager when available).

#### Returns

`void`

***

### shouldLog()

> **shouldLog**(`entry`): `boolean`

Defined in: [src/types/transport.ts:1193](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1193)

Check if transport should handle this log entry.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`boolean`

***

### supportsBatching()?

> `optional` **supportsBatching**(): `boolean`

Defined in: [src/types/transport.ts:1210](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1210)

Whether this transport supports batching (optional).

#### Returns

`boolean`
