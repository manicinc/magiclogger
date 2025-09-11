# Class: CSVFormatter

Defined in: [src/transports/formatters/index.ts:14](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/index.ts#L14)

CSV formatter for log entries.

Formats log entries as CSV with configurable columns and escaping.

## Extends

- [`CustomFormatter`](../BaseFormatter/classes/CustomFormatter.md)

## Constructors

### Constructor

> **new CSVFormatter**(`includeHeaders`): `CSVFormatter`

Defined in: [src/transports/formatters/index.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/index.ts#L29)

#### Parameters

##### includeHeaders

`boolean` = `true`

#### Returns

`CSVFormatter`

#### Overrides

[`CustomFormatter`](../BaseFormatter/classes/CustomFormatter.md).[`constructor`](../BaseFormatter/classes/CustomFormatter.md#constructor)

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

[`CustomFormatter`](../BaseFormatter/classes/CustomFormatter.md).[`escape`](../BaseFormatter/classes/CustomFormatter.md#escape)

***

### format()

> **format**(`entry`): `string`

Defined in: [src/transports/formatters/index.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/index.ts#L34)

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string`

#### Overrides

[`CustomFormatter`](../BaseFormatter/classes/CustomFormatter.md).[`format`](../BaseFormatter/classes/CustomFormatter.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: [src/transports/formatters/index.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/index.ts#L65)

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`string`

#### Overrides

[`CustomFormatter`](../BaseFormatter/classes/CustomFormatter.md).[`formatBatch`](../BaseFormatter/classes/CustomFormatter.md#formatbatch)

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

[`CustomFormatter`](../BaseFormatter/classes/CustomFormatter.md).[`stringify`](../BaseFormatter/classes/CustomFormatter.md#stringify)
