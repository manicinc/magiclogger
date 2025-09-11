# Class: SchemaSerializer

Defined in: [src/utils/LazySerializer.ts:71](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L71)

Schema-based serialization for faster JSON generation

## Constructors

### Constructor

> **new SchemaSerializer**(): `SchemaSerializer`

Defined in: [src/utils/LazySerializer.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L74)

#### Returns

`SchemaSerializer`

## Methods

### serialize()

> **serialize**(`entry`): `string`

Defined in: [src/utils/LazySerializer.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/LazySerializer.ts#L94)

Fast serialization using predefined schema

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string`
