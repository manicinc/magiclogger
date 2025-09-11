# Abstract Class: CustomFormatter

Defined in: [src/transports/formatters/BaseFormatter.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L13)

## Extended by

- [`FunctionFormatter`](FunctionFormatter.md)
- [`CSVFormatter`](../../classes/CSVFormatter.md)
- [`XMLFormatter`](../../XMLFormatter/classes/XMLFormatter.md)

## Implements

- [`ICustomFormatter`](../interfaces/ICustomFormatter.md)

## Constructors

### Constructor

> **new CustomFormatter**(): `CustomFormatter`

#### Returns

`CustomFormatter`

## Methods

### escape()

> `protected` **escape**(`str`): `string`

Defined in: [src/transports/formatters/BaseFormatter.ts:18](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L18)

#### Parameters

##### str

`string`

#### Returns

`string`

***

### format()

> `abstract` **format**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/formatters/BaseFormatter.ts:14](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L14)

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Implementation of

[`ICustomFormatter`](../interfaces/ICustomFormatter.md).[`format`](../interfaces/ICustomFormatter.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string` \| `Buffer`

Defined in: [src/transports/formatters/BaseFormatter.ts:15](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L15)

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`string` \| `Buffer`

#### Implementation of

[`ICustomFormatter`](../interfaces/ICustomFormatter.md).[`formatBatch`](../interfaces/ICustomFormatter.md#formatbatch)

***

### stringify()

> `protected` **stringify**(`value`): `string`

Defined in: [src/transports/formatters/BaseFormatter.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L21)

#### Parameters

##### value

`unknown`

#### Returns

`string`
