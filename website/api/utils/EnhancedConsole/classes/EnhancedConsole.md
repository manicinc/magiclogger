# Class: EnhancedConsole

Defined in: [src/utils/EnhancedConsole.ts:39](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L39)

Enhanced console that extends the standard console with additional formatting and logging capabilities.

## Constructors

### Constructor

> **new EnhancedConsole**(`options`): `EnhancedConsole`

Defined in: [src/utils/EnhancedConsole.ts:63](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L63)

#### Parameters

##### options

[`EnhanceConsoleOptions`](../interfaces/EnhanceConsoleOptions.md) = `{}`

#### Returns

`EnhancedConsole`

## Properties

### logger

> **logger**: [`Logger`](../../../Logger/classes/Logger.md)

Defined in: [src/utils/EnhancedConsole.ts:41](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L41)

## Methods

### assert()

> **assert**(`condition?`, ...`data?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:155](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L155)

#### Parameters

##### condition?

`boolean`

##### data?

...`unknown`[]

#### Returns

`void`

***

### box()

> **box**(`message`, ...`_args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:184](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L184)

#### Parameters

##### message

`string`

##### \_args

...`unknown`[]

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/EnhancedConsole.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L133)

#### Returns

`void`

***

### color()

> **color**(...`colors`): (`text`) => `string`

Defined in: [src/utils/EnhancedConsole.ts:237](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L237)

#### Parameters

##### colors

...`string`[]

#### Returns

> (`text`): `string`

##### Parameters

###### text

`string`

##### Returns

`string`

***

### colorParts()

> **colorParts**(`message`, `colorMap`): `string`

Defined in: [src/utils/EnhancedConsole.ts:241](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L241)

#### Parameters

##### message

`string`

##### colorMap

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

#### Returns

`string`

***

### count()

> **count**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:147](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L147)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### countReset()

> **countReset**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:151](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L151)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### custom()

> **custom**(`msg`, `colors?`, `prefix?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:205](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L205)

#### Parameters

##### msg

`string`

##### colors?

`string`[]

##### prefix?

`string`

#### Returns

`void`

***

### customFormat()

> **customFormat**(`message`, `options`): `string`

Defined in: [src/utils/EnhancedConsole.ts:219](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L219)

#### Parameters

##### message

`string`

##### options

###### color?

`string`

###### prefix?

`string`

#### Returns

`string`

***

### debug()

> **debug**(`message`, ...`args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L102)

#### Parameters

##### message

`unknown`

##### args

...`unknown`[]

#### Returns

`void`

***

### dir()

> **dir**(`obj`, `options?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:137](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L137)

#### Parameters

##### obj

`unknown`

##### options?

`any`

#### Returns

`void`

***

### dirxml()

> **dirxml**(...`data`): `void`

Defined in: [src/utils/EnhancedConsole.ts:141](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L141)

#### Parameters

##### data

...`unknown`[]

#### Returns

`void`

***

### error()

> **error**(`message`, ...`args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L97)

#### Parameters

##### message

`unknown`

##### args

...`unknown`[]

#### Returns

`void`

***

### failure()

> **failure**(`message`, ...`_args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:175](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L175)

#### Parameters

##### message

`string`

##### \_args

...`unknown`[]

#### Returns

`void`

***

### group()

> **group**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:111](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L111)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### groupEnd()

> **groupEnd**(): `void`

Defined in: [src/utils/EnhancedConsole.ts:115](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L115)

#### Returns

`void`

***

### header()

> **header**(`title`, `colors?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:189](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L189)

#### Parameters

##### title

`string`

##### colors?

`string`[]

#### Returns

`void`

***

### highlight()

> **highlight**(`message`, ...`_args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:179](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L179)

#### Parameters

##### message

`string`

##### \_args

...`unknown`[]

#### Returns

`void`

***

### info()

> **info**(`message`, ...`args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:87](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L87)

#### Parameters

##### message

`unknown`

##### args

...`unknown`[]

#### Returns

`void`

***

### log()

> **log**(`message?`, ...`args?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L74)

#### Parameters

##### message?

`unknown`

##### args?

...`unknown`[]

#### Returns

`void`

***

### profile()

> **profile**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:159](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L159)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### profileEnd()

> **profileEnd**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:165](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L165)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### progress()

> **progress**(`value`, `length?`, `completeChar?`, `incompleteChar?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:193](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L193)

#### Parameters

##### value

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

### restoreOriginalConsole()

> **restoreOriginalConsole**(): `void`

Defined in: [src/utils/EnhancedConsole.ts:245](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L245)

#### Returns

`void`

***

### styled()

> **styled**(`msg`, `preset`): `void`

Defined in: [src/utils/EnhancedConsole.ts:209](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L209)

#### Parameters

##### msg

`string`

##### preset

`string`

#### Returns

`void`

***

### success()

> **success**(`message`, ...`_args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:171](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L171)

#### Parameters

##### message

`string`

##### \_args

...`unknown`[]

#### Returns

`void`

***

### table()

> **table**(`data`, `columns?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:197](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L197)

#### Parameters

##### data

`any`

##### columns?

`string`[]

#### Returns

`void`

***

### time()

> **time**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:119](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L119)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### timeEnd()

> **timeEnd**(`label?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:123](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L123)

#### Parameters

##### label?

`string`

#### Returns

`void`

***

### timeLog()

> **timeLog**(`label?`, ...`data?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:127](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L127)

#### Parameters

##### label?

`string`

##### data?

...`unknown`[]

#### Returns

`void`

***

### trace()

> **trace**(`message?`, ...`args?`): `void`

Defined in: [src/utils/EnhancedConsole.ts:107](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L107)

#### Parameters

##### message?

`unknown`

##### args?

...`unknown`[]

#### Returns

`void`

***

### warn()

> **warn**(`message`, ...`args`): `void`

Defined in: [src/utils/EnhancedConsole.ts:92](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L92)

#### Parameters

##### message

`unknown`

##### args

...`unknown`[]

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(`options?`): `EnhancedConsole`

Defined in: [src/utils/EnhancedConsole.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L49)

Get singleton instance of EnhancedConsole

#### Parameters

##### options?

[`EnhanceConsoleOptions`](../interfaces/EnhanceConsoleOptions.md)

#### Returns

`EnhancedConsole`

***

### resetInstance()

> `static` **resetInstance**(): `void`

Defined in: [src/utils/EnhancedConsole.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L59)

Reset singleton instance (for testing)

#### Returns

`void`
