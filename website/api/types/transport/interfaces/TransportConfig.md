# Interface: TransportConfig

Defined in: [src/types/transport.ts:354](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L354)

Transport configuration for dynamic creation.
Base configuration interface that all transport configs extend.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/transport.ts:362](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L362)

Whether the transport is enabled

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:374](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L374)

Tags to exclude

***

### filter()?

> `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/types/transport.ts:377](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L377)

Custom filter function

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`boolean`

***

### format?

> `optional` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/types/transport.ts:380](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L380)

Output format

***

### formatter()?

> `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/types/transport.ts:383](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L383)

Custom formatter

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`string` \| `Buffer`

***

### level?

> `optional` **level**: `string`

Defined in: [src/types/transport.ts:365](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L365)

Minimum log level to handle

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:368](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L368)

Specific levels to handle (overrides level if provided)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:359](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L359)

Optional transport name (auto-generated if not provided)

***

### silent?

> `optional` **silent**: `boolean`

Defined in: [src/types/transport.ts:386](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L386)

Silent mode

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:371](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L371)

Tags to filter on

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/transport.ts:389](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L389)

Operation timeout

***

### type

> **type**: [`TransportType`](../type-aliases/TransportType.md)

Defined in: [src/types/transport.ts:356](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L356)

Transport type identifier
