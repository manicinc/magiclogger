# Class: Logger

Defined in: [src/index.browser.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L17)

## Constructors

### Constructor

> **new Logger**(`options`): `Logger`

Defined in: [src/index.browser.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L20)

#### Parameters

##### options

`boolean` | `Partial`\<[`LoggerOptions`](../../types/logger/interfaces/LoggerOptions.md)\>

#### Returns

`Logger`

## Accessors

### useColors

#### Get Signature

> **get** **useColors**(): `boolean`

Defined in: [src/index.browser.ts:151](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L151)

##### Returns

`boolean`

## Methods

### box()

> **box**(`text`, `options?`): `void`

Defined in: [src/index.browser.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L131)

#### Parameters

##### text

`string`

##### options?

`any`

#### Returns

`void`

***

### colorParts()

> **colorParts**(`message`, `colorMap`): `string`

Defined in: [src/index.browser.ts:143](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L143)

#### Parameters

##### message

`string`

##### colorMap

`Record`\<`string`, [`ColorName`](../../types/colors/type-aliases/ColorName.md)[]\>

#### Returns

`string`

***

### count()

> **count**(`label?`): `void`

Defined in: [src/index.browser.ts:115](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L115)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### countReset()

> **countReset**(`label?`): `void`

Defined in: [src/index.browser.ts:119](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L119)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### custom()

> **custom**(`msg`, `colors`, `prefix`): `void`

Defined in: [src/index.browser.ts:53](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L53)

#### Parameters

##### msg

`string`

##### colors

`string`[] = `...`

##### prefix

`string` = `'LOG'`

#### Returns

`void`

***

### debug()

> **debug**(`msg`): `void`

Defined in: [src/index.browser.ts:48](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L48)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### error()

> **error**(`msg`): `void`

Defined in: [src/index.browser.ts:45](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L45)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### group()

> **group**(`label`, `collapsed?`): `void`

Defined in: [src/index.browser.ts:123](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L123)

#### Parameters

##### label

`string`

##### collapsed?

`boolean`

#### Returns

`void`

***

### groupEnd()

> **groupEnd**(): `void`

Defined in: [src/index.browser.ts:127](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L127)

#### Returns

`void`

***

### header()

> **header**(`title`, `_colors`): `void`

Defined in: [src/index.browser.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L56)

#### Parameters

##### title

`string`

##### \_colors

`string`[] = `...`

#### Returns

`void`

***

### info()

> **info**(`msg`): `void`

Defined in: [src/index.browser.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L36)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### list()

> **list**(`items`, `options?`): `void`

Defined in: [src/index.browser.ts:135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L135)

#### Parameters

##### items

`string`[]

##### options?

`any`

#### Returns

`void`

***

### log()

> **log**(`msg`, `level`): `void`

Defined in: [src/index.browser.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L33)

#### Parameters

##### msg

`string`

##### level

`string` = `'info'`

#### Returns

`void`

***

### performance()

> **performance**(`label`, `data`): `void`

Defined in: [src/index.browser.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L84)

#### Parameters

##### label

`string`

##### data

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### progress()

> **progress**(`percent`, `message?`): `void`

Defined in: [src/index.browser.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L97)

#### Parameters

##### percent

`number`

##### message?

`string`

#### Returns

`void`

***

### progressBar()

> **progressBar**(`progress`, `length?`, `completeChar?`, `incompleteChar?`): `void`

Defined in: [src/index.browser.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L106)

#### Parameters

##### progress

`number`

##### length?

`number`

##### completeChar?

`string`

##### incompleteChar?

`string`

#### Returns

`void`

***

### separator()

> **separator**(`char`): `void`

Defined in: [src/index.browser.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L59)

#### Parameters

##### char

`string` = `'─'`

#### Returns

`void`

***

### setColorsEnabled()

> **setColorsEnabled**(`enabled`): `void`

Defined in: [src/index.browser.ts:148](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L148)

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### styled()

> **styled**(`msg`, `preset`): `void`

Defined in: [src/index.browser.ts:139](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L139)

#### Parameters

##### msg

`string`

##### preset

`any`

#### Returns

`void`

***

### success()

> **success**(`msg`): `void`

Defined in: [src/index.browser.ts:39](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L39)

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### table()

> **table**(`data`, `headerColor`): `void`

Defined in: [src/index.browser.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L62)

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

##### headerColor

`string`[] = `...`

#### Returns

`void`

***

### time()

> **time**(`label`): `void`

Defined in: [src/index.browser.ts:69](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L69)

#### Parameters

##### label

`string`

#### Returns

`void`

***

### timeEnd()

> **timeEnd**(`label`): `void`

Defined in: [src/index.browser.ts:77](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L77)

#### Parameters

##### label

`string`

#### Returns

`void`

***

### warn()

> **warn**(`msg`): `void`

Defined in: [src/index.browser.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/index.browser.ts#L42)

#### Parameters

##### msg

`string`

#### Returns

`void`
