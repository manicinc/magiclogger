# Class: LazyLogEntry

Defined in: [src/utils/LazySerializer.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L13)

Lazy log entry that defers serialization

## Constructors

### Constructor

> **new LazyLogEntry**(`entry`): `LazyLogEntry`

Defined in: [src/utils/LazySerializer.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L17)

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`LazyLogEntry`

## Methods

### getField()

> **getField**\<`K`\>(`field`): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)\[`K`\]

Defined in: [src/utils/LazySerializer.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L51)

Get specific fields without full serialization

#### Type Parameters

##### K

`K` *extends* keyof [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Parameters

##### field

`K`

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)\[`K`\]

***

### getRaw()

> **getRaw**(): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

Defined in: [src/utils/LazySerializer.ts:24](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L24)

Get the raw log entry without serialization

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

***

### matches()

> **matches**(`filter`): `boolean`

Defined in: [src/utils/LazySerializer.ts:58](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L58)

Check if entry matches filter criteria without serialization

#### Parameters

##### filter

`Partial`\<[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)\>

#### Returns

`boolean`

***

### toJSON()

> **toJSON**(): `string`

Defined in: [src/utils/LazySerializer.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L31)

Get the serialized JSON string (cached after first call)

#### Returns

`string`
