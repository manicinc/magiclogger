# Interface: ICustomFormatter

Defined in: [src/transports/formatters/BaseFormatter.ts:8](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L8)

## Methods

### format()

> **format**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/formatters/BaseFormatter.ts:9](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L9)

#### Parameters

##### entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

***

### formatBatch()?

> `optional` **formatBatch**(`entries`): `string` \| `Buffer`

Defined in: [src/transports/formatters/BaseFormatter.ts:10](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/formatters/BaseFormatter.ts#L10)

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`string` \| `Buffer`
