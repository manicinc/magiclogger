# Class: FunctionFormatter

Defined in: [src/transports/formatters/BaseFormatter.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L36)

## Extends

- [`CustomFormatter`](CustomFormatter.md)

## Constructors

### Constructor

> **new FunctionFormatter**(`fn`): `FunctionFormatter`

Defined in: [src/transports/formatters/BaseFormatter.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L38)

#### Parameters

##### fn

(`entry`) => `string` \| `Buffer`

#### Returns

`FunctionFormatter`

#### Overrides

[`CustomFormatter`](CustomFormatter.md).[`constructor`](CustomFormatter.md#constructor)

## Methods

### escape()

> `protected` **escape**(`str`): `string`

Defined in: [src/transports/formatters/BaseFormatter.ts:18](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L18)

#### Parameters

##### str

`string`

#### Returns

`string`

#### Inherited from

[`CustomFormatter`](CustomFormatter.md).[`escape`](CustomFormatter.md#escape)

***

### format()

> **format**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/formatters/BaseFormatter.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L42)

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Overrides

[`CustomFormatter`](CustomFormatter.md).[`format`](CustomFormatter.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string` \| `Buffer`

Defined in: [src/transports/formatters/BaseFormatter.ts:15](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L15)

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`string` \| `Buffer`

#### Inherited from

[`CustomFormatter`](CustomFormatter.md).[`formatBatch`](CustomFormatter.md#formatbatch)

***

### stringify()

> `protected` **stringify**(`value`): `string`

Defined in: [src/transports/formatters/BaseFormatter.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L21)

#### Parameters

##### value

`unknown`

#### Returns

`string`

#### Inherited from

[`CustomFormatter`](CustomFormatter.md).[`stringify`](CustomFormatter.md#stringify)
