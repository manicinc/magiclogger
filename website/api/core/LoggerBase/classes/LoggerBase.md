# Abstract Class: LoggerBase

Defined in: [src/core/LoggerBase.ts:39](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L39)

Abstract base class for all logger implementations.

This class provides core functionality shared between Node.js and Browser loggers:
- Theme management
- Color and style handling
- Preset management
- Event emission
- Base configuration

 LoggerBase

## Example

```typescript
class CustomLogger extends LoggerBase {
  public info(msg: string): void {
    this.print('INFO', msg, 'info');
  }

  protected print(level: string, msg: string, preset: StylePreset): void {
    // Custom implementation
  }
}
```

## Extends

- [`Emitter`](../../events-compat/variables/Emitter.md)

## Extended by

- [`BrowserLogger`](../../BrowserLogger/classes/BrowserLogger.md)
- [`NodeLogger`](../../NodeLogger/classes/NodeLogger.md)

## Constructors

### Constructor

> **new LoggerBase**(`options`): `LoggerBase`

Defined in: [src/core/LoggerBase.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L132)

Creates a new LoggerBase instance.

#### Parameters

##### options

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md) = `{}`

Logger configuration

#### Returns

`LoggerBase`

#### Overrides

`EventEmitter.constructor`

## Properties

### context?

> `protected` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/core/LoggerBase.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L56)

Global context data.

***

### customPresets

> `protected` **customPresets**: `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\> = `{}`

Defined in: [src/core/LoggerBase.ts:93](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L93)

Custom presets added by user.

***

### id?

> `protected` `optional` **id**: `string`

Defined in: [src/core/LoggerBase.ts:44](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L44)

Logger instance ID.

***

### levelHierarchy

> `protected` `readonly` **levelHierarchy**: `Record`\<[`LogLevel`](../../../types/logger/type-aliases/LogLevel.md), `number`\>

Defined in: [src/core/LoggerBase.ts:113](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L113)

Log level hierarchy for filtering.

***

### maxListeners

> `protected` `readonly` **maxListeners**: `100` = `100`

Defined in: [src/core/LoggerBase.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L125)

Maximum listeners to prevent memory leaks.

***

### performanceData

> `protected` **performanceData**: `Map`\<`string`, \{ `count`: `number`; `maxTime`: `number`; `minTime`: `number`; `totalTime`: `number`; \}\>

Defined in: [src/core/LoggerBase.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L99)

Performance tracking data.

***

### strictLevels

> `protected` **strictLevels**: `boolean`

Defined in: [src/core/LoggerBase.ts:81](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L81)

Whether to enforce strict log levels.

***

### tags?

> `protected` `optional` **tags**: `string`[]

Defined in: [src/core/LoggerBase.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L50)

Global tags for all logs.

***

### theme

> `protected` **theme**: `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/core/LoggerBase.ts:87](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L87)

Current theme configuration.

***

### themeByTag?

> `protected` `optional` **themeByTag**: `Record`\<`string`, `string`\>

Defined in: [src/core/LoggerBase.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L75)

Optional mapping of tags to theme names for brand-based themes.
If set, when a logger has tags and no explicit object theme was provided,
the first matching tag in this map will select the theme.

***

### useColors

> `protected` **useColors**: `boolean`

Defined in: [src/core/LoggerBase.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L68)

Whether to use colors in output.

***

### verbose

> `protected` **verbose**: `boolean`

Defined in: [src/core/LoggerBase.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L62)

Whether verbose (debug) mode is enabled.

## Methods

### addListener()

> **addListener**(`event`, `listener`): `this`

Defined in: [src/core/events-compat.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L20)

#### Parameters

##### event

`string` | `symbol`

##### listener

`Listener`

#### Returns

`this`

#### Inherited from

`EventEmitter.addListener`

***

### addPreset()

> **addPreset**(`name`, `colors`): `void`

Defined in: [src/core/LoggerBase.ts:431](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L431)

Add a custom preset.

#### Parameters

##### name

`string`

Preset name

##### colors

`string`[]

Colors for the preset

#### Returns

`void`

***

### areColorsEnabled()

> **areColorsEnabled**(): `boolean`

Defined in: [src/core/LoggerBase.ts:402](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L402)

Check if colors are enabled.

#### Returns

`boolean`

Whether colors are enabled

***

### child()

> **child**(`_options`): `LoggerBase`

Defined in: [src/core/LoggerBase.ts:685](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L685)

Create a child logger with merged configuration.

#### Parameters

##### \_options

`Partial`\<[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md)\>

Child logger options (unused in base implementation)

#### Returns

`LoggerBase`

Child logger instance

#### Throws

Always throws as this method must be implemented by concrete classes

***

### color()

> `abstract` **color**(...`colors`): (`text`) => `string`

Defined in: [src/core/LoggerBase.ts:293](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L293)

Abstract method for color functions.

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

> `abstract` **colorParts**(`message`, `colorMap`): `string`

Defined in: [src/core/LoggerBase.ts:299](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L299)

Abstract method for coloring parts.

#### Parameters

##### message

`string`

##### colorMap

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

#### Returns

`string`

***

### custom()

> `abstract` **custom**(`msg`, `colors`, `prefix`): `void`

Defined in: [src/core/LoggerBase.ts:251](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L251)

Abstract method for custom logging.

#### Parameters

##### msg

`string`

##### colors

`string`[]

##### prefix

`string`

#### Returns

`void`

***

### debug()

> `abstract` **debug**(`msg`): `void`

Defined in: [src/core/LoggerBase.ts:239](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L239)

Abstract method for logging debug messages.

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [src/core/LoggerBase.ts:746](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L746)

Clean up resources.

#### Returns

`void`

***

### disableLevels()

> **disableLevels**(`levels`): `void`

Defined in: [src/core/LoggerBase.ts:706](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L706)

Disable specific log levels.

#### Parameters

##### levels

`string`[]

Levels to disable

#### Returns

`void`

***

### emit()

> **emit**(`event`, ...`args`): `boolean`

Defined in: [src/core/events-compat.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L51)

#### Parameters

##### event

`string` | `symbol`

##### args

...`unknown`[]

#### Returns

`boolean`

#### Inherited from

`EventEmitter.emit`

***

### enableLevels()

> **enableLevels**(`levels`): `void`

Defined in: [src/core/LoggerBase.ts:696](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L696)

Enable specific log levels.

#### Parameters

##### levels

`string`[]

Levels to enable

#### Returns

`void`

***

### error()

> `abstract` **error**(`msg`): `void`

Defined in: [src/core/LoggerBase.ts:233](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L233)

Abstract method for logging error messages.

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### getConfig()

> **getConfig**(): `object`

Defined in: [src/core/LoggerBase.ts:656](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L656)

Get logger configuration.

#### Returns

`object`

Current configuration

##### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

##### id?

> `optional` **id**: `string`

##### strictLevels

> **strictLevels**: `boolean`

##### tags?

> `optional` **tags**: `string`[]

##### theme

> **theme**: `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

##### themeByTag?

> `optional` **themeByTag**: `Record`\<`string`, `string`\>

##### useColors

> **useColors**: `boolean`

##### verbose

> **verbose**: `boolean`

***

### getEventNames()

> **getEventNames**(): `string`[]

Defined in: [src/core/LoggerBase.ts:726](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L726)

Get event names this logger can emit.

#### Returns

`string`[]

Event names

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: [src/core/events-compat.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L68)

#### Returns

`number`

#### Inherited from

`EventEmitter.getMaxListeners`

***

### getPerformanceStats()

> **getPerformanceStats**(): `Record`\<`string`, \{ `avgTime`: `number`; `count`: `number`; `maxTime`: `number`; `minTime`: `number`; \}\>

Defined in: [src/core/LoggerBase.ts:569](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L569)

Get performance statistics.

#### Returns

`Record`\<`string`, \{ `avgTime`: `number`; `count`: `number`; `maxTime`: `number`; `minTime`: `number`; \}\>

Performance stats by level

***

### getPresetColors()

> `protected` **getPresetColors**(`preset`): `string`[]

Defined in: [src/core/LoggerBase.ts:455](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L455)

Get colors for a preset.

#### Parameters

##### preset

`string`

Preset name

#### Returns

`string`[]

Colors for the preset

***

### getTheme()

> **getTheme**(): `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/core/LoggerBase.ts:421](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L421)

Get the current theme.

#### Returns

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Current theme

***

### header()

> `abstract` **header**(`title`, `colors`): `void`

Defined in: [src/core/LoggerBase.ts:263](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L263)

Abstract method for headers.

#### Parameters

##### title

`string`

##### colors

`string`[]

#### Returns

`void`

***

### info()

> `abstract` **info**(`msg`): `void`

Defined in: [src/core/LoggerBase.ts:221](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L221)

Abstract method for logging info messages.

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### isValidLevel()

> `protected` **isValidLevel**(`level`): `boolean`

Defined in: [src/core/LoggerBase.ts:533](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L533)

Check if a log level is valid.

#### Parameters

##### level

`string`

Level to check

#### Returns

`boolean`

Whether level is valid

***

### isVerbose()

> **isVerbose**(): `boolean`

Defined in: [src/core/LoggerBase.ts:383](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L383)

Get verbose mode status.

#### Returns

`boolean`

Whether verbose mode is enabled

***

### link()

> `abstract` **link**(`url`, `description?`): `void`

Defined in: [src/core/LoggerBase.ts:287](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L287)

Abstract method for links.

#### Parameters

##### url

`string`

##### description?

`string`

#### Returns

`void`

***

### listenerCount()

> **listenerCount**(`event`): `number`

Defined in: [src/core/events-compat.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L74)

#### Parameters

##### event

`string` | `symbol`

#### Returns

`number`

#### Inherited from

`EventEmitter.listenerCount`

***

### listeners()

> **listeners**(`event`): `Listener`[]

Defined in: [src/core/events-compat.ts:71](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L71)

#### Parameters

##### event

`string` | `symbol`

#### Returns

`Listener`[]

#### Inherited from

`EventEmitter.listeners`

***

### loadTheme()

> `protected` **loadTheme**(`themeName`): `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/core/LoggerBase.ts:482](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L482)

Load a named theme.

#### Parameters

##### themeName

`string`

Name of the theme to load

#### Returns

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Theme definition

***

### log()

> **log**(`msg`, `level`): `void`

Defined in: [src/core/LoggerBase.ts:313](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L313)

Log a message at any level.

#### Parameters

##### msg

`string`

Message to log

##### level

`string` = `'info'`

Log level

#### Returns

`void`

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [src/core/events-compat.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L32)

#### Parameters

##### event

`string` | `symbol`

##### listener

`Listener`

#### Returns

`this`

#### Inherited from

`EventEmitter.off`

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [src/core/events-compat.ts:10](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L10)

#### Parameters

##### event

`string` | `symbol`

##### listener

`Listener`

#### Returns

`this`

#### Inherited from

`EventEmitter.on`

***

### once()

> **once**(`event`, `listener`): `this`

Defined in: [src/core/events-compat.ts:24](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L24)

#### Parameters

##### event

`string` | `symbol`

##### listener

`Listener`

#### Returns

`this`

#### Inherited from

`EventEmitter.once`

***

### progressBar()

> `abstract` **progressBar**(`progress`, `length`, `completeChar`, `incompleteChar`, `clear?`): `void`

Defined in: [src/core/LoggerBase.ts:275](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L275)

Abstract method for progress bars.

#### Parameters

##### progress

`number`

##### length

`number`

##### completeChar

`string`

##### incompleteChar

`string`

##### clear?

`boolean`

#### Returns

`void`

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `this`

Defined in: [src/core/events-compat.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L42)

#### Parameters

##### event?

`string` | `symbol`

#### Returns

`this`

#### Inherited from

`EventEmitter.removeAllListeners`

***

### removeListener()

> **removeListener**(`event`, `listener`): `this`

Defined in: [src/core/events-compat.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L38)

#### Parameters

##### event

`string` | `symbol`

##### listener

`Listener`

#### Returns

`this`

#### Inherited from

`EventEmitter.removeListener`

***

### removePreset()

> **removePreset**(`name`): `void`

Defined in: [src/core/LoggerBase.ts:441](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L441)

Remove a custom preset.

#### Parameters

##### name

`string`

Preset name to remove

#### Returns

`void`

***

### resetPerformanceStats()

> **resetPerformanceStats**(): `void`

Defined in: [src/core/LoggerBase.ts:603](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L603)

Reset performance statistics.

#### Returns

`void`

***

### separator()

> `abstract` **separator**(`char`, `length`): `void`

Defined in: [src/core/LoggerBase.ts:305](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L305)

Abstract method for separators.

#### Parameters

##### char

`string`

##### length

`number`

#### Returns

`void`

***

### setColorsEnabled()

> **setColorsEnabled**(`enabled`): `void`

Defined in: [src/core/LoggerBase.ts:392](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L392)

Enable or disable colors.

#### Parameters

##### enabled

`boolean`

Whether to enable colors

#### Returns

`void`

***

### setMaxListeners()

> **setMaxListeners**(`_n`): `this`

Defined in: [src/core/events-compat.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L65)

#### Parameters

##### \_n

`number`

#### Returns

`this`

#### Inherited from

`EventEmitter.setMaxListeners`

***

### setMinLevel()

> **setMinLevel**(`level`): `void`

Defined in: [src/core/LoggerBase.ts:716](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L716)

Set minimum log level.

#### Parameters

##### level

`string`

Minimum level to log

#### Returns

`void`

***

### setTheme()

> **setTheme**(`theme`): `void`

Defined in: [src/core/LoggerBase.ts:411](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L411)

Set or update the theme.

#### Parameters

##### theme

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Theme definition

#### Returns

`void`

***

### setVerbose()

> **setVerbose**(`enabled`): `void`

Defined in: [src/core/LoggerBase.ts:373](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L373)

Set verbose mode.

#### Parameters

##### enabled

`boolean`

Whether to enable verbose mode

#### Returns

`void`

***

### styled()

> `abstract` **styled**(`msg`, `preset`): `void`

Defined in: [src/core/LoggerBase.ts:257](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L257)

Abstract method for styled logging.

#### Parameters

##### msg

`string`

##### preset

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

#### Returns

`void`

***

### success()

> `abstract` **success**(`msg`): `void`

Defined in: [src/core/LoggerBase.ts:245](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L245)

Abstract method for logging success messages.

#### Parameters

##### msg

`string`

#### Returns

`void`

***

### table()

> `abstract` **table**(`data`, `headerColor`): `void`

Defined in: [src/core/LoggerBase.ts:269](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L269)

Abstract method for tables.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

##### headerColor

`string`[]

#### Returns

`void`

***

### trackPerformance()

> `protected` **trackPerformance**(`level`, `time`): `void`

Defined in: [src/core/LoggerBase.ts:545](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L545)

Track performance metrics.

#### Parameters

##### level

`string`

Log level

##### time

`number`

Time in milliseconds

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`options`): `void`

Defined in: [src/core/LoggerBase.ts:612](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L612)

Update logger configuration.

#### Parameters

##### options

`Partial`\<[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md)\>

Options to update

#### Returns

`void`

***

### warn()

> `abstract` **warn**(`msg`): `void`

Defined in: [src/core/LoggerBase.ts:227](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L227)

Abstract method for logging warning messages.

#### Parameters

##### msg

`string`

#### Returns

`void`
