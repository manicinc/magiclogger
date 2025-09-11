# Class: XMLFormatter

Defined in: [src/transports/formatters/XMLFormatter.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/XMLFormatter.ts#L33)

XML formatter for log entries.

## Example

```ts
import { XMLFormatter } from 'magiclogger/transports/formatters/XMLFormatter';
const xf = new XMLFormatter();
const xml = xf.format(entry);
```

## Extends

- [`CustomFormatter`](../../BaseFormatter/classes/CustomFormatter.md)

## Constructors

### Constructor

> **new XMLFormatter**(): `XMLFormatter`

#### Returns

`XMLFormatter`

#### Inherited from

[`CustomFormatter`](../../BaseFormatter/classes/CustomFormatter.md).[`constructor`](../../BaseFormatter/classes/CustomFormatter.md#constructor)

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

[`CustomFormatter`](../../BaseFormatter/classes/CustomFormatter.md).[`escape`](../../BaseFormatter/classes/CustomFormatter.md#escape)

***

### format()

> **format**(`entry`): `string`

Defined in: [src/transports/formatters/XMLFormatter.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/XMLFormatter.ts#L36)

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string`

#### Overrides

[`CustomFormatter`](../../BaseFormatter/classes/CustomFormatter.md).[`format`](../../BaseFormatter/classes/CustomFormatter.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: [src/transports/formatters/XMLFormatter.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/XMLFormatter.ts#L99)

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`string`

#### Overrides

[`CustomFormatter`](../../BaseFormatter/classes/CustomFormatter.md).[`formatBatch`](../../BaseFormatter/classes/CustomFormatter.md#formatbatch)

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

[`CustomFormatter`](../../BaseFormatter/classes/CustomFormatter.md).[`stringify`](../../BaseFormatter/classes/CustomFormatter.md#stringify)
