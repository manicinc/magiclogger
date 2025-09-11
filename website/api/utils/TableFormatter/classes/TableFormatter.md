# Class: TableFormatter

Defined in: [src/utils/TableFormatter.ts:127](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L127)

## Constructors

### Constructor

> **new TableFormatter**(): `TableFormatter`

#### Returns

`TableFormatter`

## Methods

### box()

> `static` **box**(`text`, `options`, `useColors`): `string`[]

Defined in: [src/utils/TableFormatter.ts:339](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L339)

#### Parameters

##### text

`string`

##### options

###### border?

`"single"` \| `"double"` \| `"rounded"` \| `"heavy"`

###### borderColor?

`string`[]

###### color?

`string`[]

###### padding?

`number`

##### useColors

`boolean` = `true`

#### Returns

`string`[]

***

### format()

> `static` **format**(`data`, `options`, `useColors`): `string`[]

Defined in: [src/utils/TableFormatter.ts:201](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L201)

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

##### options

[`TableOptions`](../interfaces/TableOptions.md) = `{}`

##### useColors

`boolean` = `true`

#### Returns

`string`[]

***

### formatTable()

> `static` **formatTable**(`data`, `options`): `string`

Defined in: [src/utils/TableFormatter.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L131)

Main public API for formatting data as a table

#### Parameters

##### data

`any`

##### options

[`TableOptions`](../interfaces/TableOptions.md) = `{}`

#### Returns

`string`

***

### list()

> `static` **list**(`items`, `options`, `useColors`): `string`[]

Defined in: [src/utils/TableFormatter.ts:397](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L397)

#### Parameters

##### items

`string`[]

##### options

###### bullet?

`string`

###### bulletColor?

`string`[]

###### indent?

`number`

###### itemColor?

`string`[]

##### useColors

`boolean` = `true`

#### Returns

`string`[]

***

### padString()

> `static` **padString**(`str`, `width`, `align`): `string`

Defined in: [src/utils/TableFormatter.ts:186](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L186)

#### Parameters

##### str

`string`

##### width

`number`

##### align

`string` = `'left'`

#### Returns

`string`

***

### separator()

> `static` **separator**(`char`, `width`, `color?`, `useColors?`): `string`

Defined in: [src/utils/TableFormatter.ts:334](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L334)

#### Parameters

##### char

`string` = `'─'`

##### width

`number` = `50`

##### color?

`string`[]

##### useColors?

`boolean` = `true`

#### Returns

`string`

***

### stripAnsi()

> `static` **stripAnsi**(`str`): `string`

Defined in: [src/utils/TableFormatter.ts:181](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/TableFormatter.ts#L181)

#### Parameters

##### str

`string`

#### Returns

`string`
