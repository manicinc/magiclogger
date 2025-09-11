# Interface: IStyledLogger

Defined in: [src/types/styling.ts:393](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L393)

Extended logger with styling capabilities.
Combines standard logging with styling APIs.

 IStyledLogger

## Properties

### fmt

> **fmt**: [`TemplateFormatter`](../type-aliases/TemplateFormatter.md)

Defined in: [src/types/styling.ts:404](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L404)

***

### s

> **s**: [`IStyleBuilder`](IStyleBuilder.md)

Defined in: [src/types/styling.ts:402](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L402)

***

### style

> **style**: [`IStyleBuilder`](IStyleBuilder.md)

Defined in: [src/types/styling.ts:403](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L403)

## Methods

### areColorsEnabled()

> **areColorsEnabled**(): `boolean`

Defined in: [src/types/styling.ts:411](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L411)

#### Returns

`boolean`

***

### debug()

> **debug**(`message`, ...`args`): `void`

Defined in: [src/types/styling.ts:398](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L398)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### error()

> **error**(`message`, ...`args`): `void`

Defined in: [src/types/styling.ts:397](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L397)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### info()

> **info**(`message`, ...`args`): `void`

Defined in: [src/types/styling.ts:395](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L395)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### parseBrackets()

> **parseBrackets**(`text`): `string`

Defined in: [src/types/styling.ts:407](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L407)

#### Parameters

##### text

`string`

#### Returns

`string`

***

### parts()

> **parts**(`parts`): `string`

Defined in: [src/types/styling.ts:405](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L405)

#### Parameters

##### parts

[`StyledPart`](../type-aliases/StyledPart.md)[]

#### Returns

`string`

***

### setColorsEnabled()

> **setColorsEnabled**(`enabled`): `void`

Defined in: [src/types/styling.ts:410](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L410)

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### styleByIndex()

> **styleByIndex**(`text`, `styleMap`): `string`

Defined in: [src/types/styling.ts:406](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L406)

#### Parameters

##### text

`string`

##### styleMap

[`WordStyleMap`](../type-aliases/WordStyleMap.md)

#### Returns

`string`

***

### success()

> **success**(`message`, ...`args`): `void`

Defined in: [src/types/styling.ts:399](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L399)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### warn()

> **warn**(`message`, ...`args`): `void`

Defined in: [src/types/styling.ts:396](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L396)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
