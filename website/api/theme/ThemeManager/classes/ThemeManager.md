# Class: ThemeManager

Defined in: [src/theme/ThemeManager.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L64)

ThemeManager handles theme loading, application, and CSS generation.
Provides both terminal ANSI and web CSS styling capabilities.

## Constructors

### Constructor

> **new ThemeManager**(): `ThemeManager`

Defined in: [src/theme/ThemeManager.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L68)

#### Returns

`ThemeManager`

## Accessors

### cssStyleMap

#### Get Signature

> **get** **cssStyleMap**(): `Record`\<`string`, `string`\>

Defined in: [src/theme/ThemeManager.ts:225](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L225)

Get CSS style mapping

##### Returns

`Record`\<`string`, `string`\>

***

### themes

#### Get Signature

> **get** **themes**(): `Record`\<`string`, [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)\>

Defined in: [src/theme/ThemeManager.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L79)

Get all available themes

##### Returns

`Record`\<`string`, [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)\>

#### Set Signature

> **set** **themes**(`value`): `void`

Defined in: [src/theme/ThemeManager.ts:86](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L86)

Allow tests/consumers to override themes

##### Parameters

###### value

`Record`\<`string`, [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)\>

##### Returns

`void`

## Methods

### applyStyles()

> **applyStyles**(`styles`, `message`): `string`

Defined in: [src/theme/ThemeManager.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L133)

Apply styles to a message using ANSI colors

#### Parameters

##### styles

`string`[]

##### message

`string`

#### Returns

`string`

***

### getCssStyles()

> **getCssStyles**(`level`): `string`

Defined in: [src/theme/ThemeManager.ts:158](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L158)

Get CSS styles for a given level

#### Parameters

##### level

`string`

#### Returns

`string`

***

### getCurrentTheme()

> **getCurrentTheme**(): [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)

Defined in: [src/theme/ThemeManager.ts:218](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L218)

Get the current theme

#### Returns

[`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)

***

### getTheme()

> **getTheme**(`name`): `undefined` \| [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)

Defined in: [src/theme/ThemeManager.ts:112](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L112)

Get a theme by name

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)

***

### listThemes()

> **listThemes**(): `string`[]

Defined in: [src/theme/ThemeManager.ts:124](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L124)

List available theme names

#### Returns

`string`[]

***

### setTheme()

> **setTheme**(`theme`): `void`

Defined in: [src/theme/ThemeManager.ts:204](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/theme/ThemeManager.ts#L204)

Set the current theme

#### Parameters

##### theme

`string` | [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)

#### Returns

`void`
