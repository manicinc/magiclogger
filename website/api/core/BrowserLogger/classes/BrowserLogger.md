# Class: BrowserLogger

Defined in: [src/core/BrowserLogger.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L36)

Browser implementation of the Logger.

This class provides optimized logging for browser environments:
- Console styling with CSS
- LocalStorage/SessionStorage support
- Browser DevTools integration
- Performance optimizations for browsers
- Angle bracket syntax parsing for inline styles

 BrowserLogger

## Example

```typescript
const logger = new BrowserLogger({
  useColors: true,
  storageName: 'app-logs',
  maxStoredLogs: 1000
});

// Automatic angle bracket parsing
logger.info('<green.bold>SUCCESS:</> Page loaded in <yellow>250ms</>');
logger.error('<red>Error:</> Failed to fetch <cyan>user data</>');
```

## Extends

- [`LoggerBase`](../../LoggerBase/classes/LoggerBase.md)

## Constructors

### Constructor

> **new BrowserLogger**(`options`): `BrowserLogger`

Defined in: [src/core/BrowserLogger.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L106)

Creates a new BrowserLogger instance.

#### Parameters

##### options

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md) = `{}`

Logger configuration

#### Returns

`BrowserLogger`

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`constructor`](../../LoggerBase/classes/LoggerBase.md#constructor)

## Properties

### context?

> `protected` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/core/LoggerBase.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L56)

Global context data.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`context`](../../LoggerBase/classes/LoggerBase.md#context)

***

### customPresets

> `protected` **customPresets**: `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\> = `{}`

Defined in: [src/core/LoggerBase.ts:93](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L93)

Custom presets added by user.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`customPresets`](../../LoggerBase/classes/LoggerBase.md#custompresets)

***

### id?

> `protected` `optional` **id**: `string`

Defined in: [src/core/LoggerBase.ts:44](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L44)

Logger instance ID.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`id`](../../LoggerBase/classes/LoggerBase.md#id)

***

### levelHierarchy

> `protected` `readonly` **levelHierarchy**: `Record`\<[`LogLevel`](../../../types/logger/type-aliases/LogLevel.md), `number`\>

Defined in: [src/core/LoggerBase.ts:113](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L113)

Log level hierarchy for filtering.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`levelHierarchy`](../../LoggerBase/classes/LoggerBase.md#levelhierarchy)

***

### maxListeners

> `protected` `readonly` **maxListeners**: `100` = `100`

Defined in: [src/core/LoggerBase.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L125)

Maximum listeners to prevent memory leaks.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`maxListeners`](../../LoggerBase/classes/LoggerBase.md#maxlisteners)

***

### performanceData

> `protected` **performanceData**: `Map`\<`string`, \{ `count`: `number`; `maxTime`: `number`; `minTime`: `number`; `totalTime`: `number`; \}\>

Defined in: [src/core/LoggerBase.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L99)

Performance tracking data.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`performanceData`](../../LoggerBase/classes/LoggerBase.md#performancedata)

***

### strictLevels

> `protected` **strictLevels**: `boolean`

Defined in: [src/core/LoggerBase.ts:81](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L81)

Whether to enforce strict log levels.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`strictLevels`](../../LoggerBase/classes/LoggerBase.md#strictlevels)

***

### tags?

> `protected` `optional` **tags**: `string`[]

Defined in: [src/core/LoggerBase.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L50)

Global tags for all logs.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`tags`](../../LoggerBase/classes/LoggerBase.md#tags)

***

### theme

> `protected` **theme**: `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/core/LoggerBase.ts:87](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L87)

Current theme configuration.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`theme`](../../LoggerBase/classes/LoggerBase.md#theme)

***

### themeByTag?

> `protected` `optional` **themeByTag**: `Record`\<`string`, `string`\>

Defined in: [src/core/LoggerBase.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L75)

Optional mapping of tags to theme names for brand-based themes.
If set, when a logger has tags and no explicit object theme was provided,
the first matching tag in this map will select the theme.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`themeByTag`](../../LoggerBase/classes/LoggerBase.md#themebytag)

***

### useColors

> `protected` **useColors**: `boolean`

Defined in: [src/core/LoggerBase.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L68)

Whether to use colors in output.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`useColors`](../../LoggerBase/classes/LoggerBase.md#usecolors)

***

### verbose

> `protected` **verbose**: `boolean`

Defined in: [src/core/LoggerBase.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L62)

Whether verbose (debug) mode is enabled.

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`verbose`](../../LoggerBase/classes/LoggerBase.md#verbose)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`addListener`](../../LoggerBase/classes/LoggerBase.md#addlistener)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`addPreset`](../../LoggerBase/classes/LoggerBase.md#addpreset)

***

### areColorsEnabled()

> **areColorsEnabled**(): `boolean`

Defined in: [src/core/LoggerBase.ts:402](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L402)

Check if colors are enabled.

#### Returns

`boolean`

Whether colors are enabled

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`areColorsEnabled`](../../LoggerBase/classes/LoggerBase.md#arecolorsenabled)

***

### box()

> **box**(`text`, `options`): `void`

Defined in: [src/core/BrowserLogger.ts:1339](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1339)

Displays text in a decorative box (browser console limitation).
Falls back to styled console output.

#### Parameters

##### text

`string`

Text to display in box

##### options

Box formatting options

###### border?

`"single"` \| `"double"` \| `"rounded"` \| `"heavy"`

###### borderColor?

`string`[]

###### color?

`string`[]

###### padding?

`number`

#### Returns

`void`

#### Example

```typescript
logger.box('Success!', {
  borderColor: ['green']
});
```

***

### child()

> **child**(`options`): `BrowserLogger`

Defined in: [src/core/BrowserLogger.ts:1229](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1229)

Creates a child logger with merged configuration.

#### Parameters

##### options

`Partial`\<[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md)\>

Child logger options

#### Returns

`BrowserLogger`

Child logger instance

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`child`](../../LoggerBase/classes/LoggerBase.md#child)

***

### clearLogs()

> **clearLogs**(): `void`

Defined in: [src/core/BrowserLogger.ts:924](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L924)

Clears all stored logs.

#### Returns

`void`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/core/BrowserLogger.ts:1243](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1243)

Closes the logger and cleans up resources.

#### Returns

`Promise`\<`void`\>

***

### color()

> **color**(...`_colors`): (`text`) => `string`

Defined in: [src/core/BrowserLogger.ts:879](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L879)

Creates a reusable color function.

#### Parameters

##### \_colors

...`string`[]

#### Returns

Function that applies colors

> (`text`): `string`

##### Parameters

###### text

`string`

##### Returns

`string`

#### Example

```typescript
const error = logger.color('red', 'bold');
console.log(error('Error message'));
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`color`](../../LoggerBase/classes/LoggerBase.md#color)

***

### colorParts()

> **colorParts**(`message`, `_colorMap`): `string`

Defined in: [src/core/BrowserLogger.ts:898](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L898)

Applies different colors to specific parts of a message.

#### Parameters

##### message

`string`

Message to color

##### \_colorMap

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

#### Returns

`string`

Colored message

#### Example

```typescript
const msg = logger.colorParts('Status: OK', {
  'Status:': ['blue', 'bold'],
  'OK': ['green']
});
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`colorParts`](../../LoggerBase/classes/LoggerBase.md#colorparts)

***

### count()

> **count**(`label`): `void`

Defined in: [src/core/BrowserLogger.ts:1307](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1307)

Counts the number of times this method is called with the same label.

#### Parameters

##### label

`string` = `'default'`

Label for the counter (default: 'default')

#### Returns

`void`

#### Example

```typescript
logger.count('button-clicks'); // "button-clicks: 1"
logger.count('button-clicks'); // "button-clicks: 2"
```

***

### countReset()

> **countReset**(`label`): `void`

Defined in: [src/core/BrowserLogger.ts:1320](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1320)

Resets a counter to zero.

#### Parameters

##### label

`string` = `'default'`

Label of the counter to reset

#### Returns

`void`

***

### custom()

> **custom**(`msg`, `colors`, `prefix?`): `void`

Defined in: [src/core/BrowserLogger.ts:651](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L651)

Logs a custom message with custom colors.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

##### colors

`string`[] = `...`

Colors to apply

##### prefix?

`string` = `'LOG'`

Prefix for the message

#### Returns

`void`

#### Example

```typescript
logger.custom('<magenta>Special:</> Custom event', ['magenta'], 'EVENT');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`custom`](../../LoggerBase/classes/LoggerBase.md#custom)

***

### debug()

> **debug**(`msg`): `void`

Defined in: [src/core/BrowserLogger.ts:617](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L617)

Logs a debug message (only if verbose mode is enabled).
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

#### Returns

`void`

#### Example

```typescript
logger.debug('<dim>Debug:</> Cache size: <yellow>1.2MB</>');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`debug`](../../LoggerBase/classes/LoggerBase.md#debug)

***

### destroy()

> **destroy**(): `void`

Defined in: [src/core/BrowserLogger.ts:1250](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1250)

Ensure caches are cleared on destroy (test expectation)

#### Returns

`void`

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`destroy`](../../LoggerBase/classes/LoggerBase.md#destroy)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`disableLevels`](../../LoggerBase/classes/LoggerBase.md#disablelevels)

***

### downloadLogs()

> **downloadLogs**(`filename?`): `void`

Defined in: [src/core/BrowserLogger.ts:986](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L986)

Downloads logs as a text file.

#### Parameters

##### filename?

`string` = `'logs.txt'`

Filename for download

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`emit`](../../LoggerBase/classes/LoggerBase.md#emit)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`enableLevels`](../../LoggerBase/classes/LoggerBase.md#enablelevels)

***

### error()

> **error**(`msg`): `void`

Defined in: [src/core/BrowserLogger.ts:602](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L602)

Logs an error message.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

#### Returns

`void`

#### Example

```typescript
logger.error('<red>Error:</> Failed to load <cyan>module</>');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`error`](../../LoggerBase/classes/LoggerBase.md#error)

***

### exportLogs()

> **exportLogs**(`format`): `Promise`\<`string`\>

Defined in: [src/core/BrowserLogger.ts:1139](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1139)

Export logs to a given format.

#### Parameters

##### format

`"json"` | `"txt"` | `"csv"`

#### Returns

`Promise`\<`string`\>

***

### flush()

> **flush**(): `void`

Defined in: [src/core/BrowserLogger.ts:1211](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1211)

Flushes any pending operations.

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`getConfig`](../../LoggerBase/classes/LoggerBase.md#getconfig)

***

### getEventNames()

> **getEventNames**(): `string`[]

Defined in: [src/core/LoggerBase.ts:726](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L726)

Get event names this logger can emit.

#### Returns

`string`[]

Event names

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`getEventNames`](../../LoggerBase/classes/LoggerBase.md#geteventnames)

***

### getLogDirectory()

> **getLogDirectory**(): `string`

Defined in: [src/core/BrowserLogger.ts:1192](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1192)

#### Returns

`string`

***

### getLogFilePath()

> **getLogFilePath**(): `null` \| `string`

Defined in: [src/core/BrowserLogger.ts:1189](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1189)

#### Returns

`null` \| `string`

***

### getLogRetentionDays()

> **getLogRetentionDays**(): `number`

Defined in: [src/core/BrowserLogger.ts:1195](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1195)

#### Returns

`number`

***

### getLogs()

> **getLogs**(): `null` \| `string`[]

Defined in: [src/core/BrowserLogger.ts:907](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L907)

Gets all stored logs.

#### Returns

`null` \| `string`[]

Array of log messages or null

***

### getLogsAsync()

> **getLogsAsync**(): `Promise`\<`string`[]\>

Defined in: [src/core/BrowserLogger.ts:1057](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1057)

Browser-only: async retrieval of logs (mirrors getLogs in localStorage path).

#### Returns

`Promise`\<`string`[]\>

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: [src/core/events-compat.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/events-compat.ts#L68)

#### Returns

`number`

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`getMaxListeners`](../../LoggerBase/classes/LoggerBase.md#getmaxlisteners)

***

### getPerformanceStats()

> **getPerformanceStats**(): `Record`\<`string`, \{ `avgTime`: `number`; `count`: `number`; `maxTime`: `number`; `minTime`: `number`; \}\>

Defined in: [src/core/LoggerBase.ts:569](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L569)

Get performance statistics.

#### Returns

`Record`\<`string`, \{ `avgTime`: `number`; `count`: `number`; `maxTime`: `number`; `minTime`: `number`; \}\>

Performance stats by level

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`getPerformanceStats`](../../LoggerBase/classes/LoggerBase.md#getperformancestats)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`getPresetColors`](../../LoggerBase/classes/LoggerBase.md#getpresetcolors)

***

### getTheme()

> **getTheme**(): `Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/core/LoggerBase.ts:421](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L421)

Get the current theme.

#### Returns

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Current theme

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`getTheme`](../../LoggerBase/classes/LoggerBase.md#gettheme)

***

### group()

> **group**(`label`, `collapsed?`): `void`

Defined in: [src/core/BrowserLogger.ts:708](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L708)

Creates a collapsible group in the console.

#### Parameters

##### label

`string`

Group label

##### collapsed?

`boolean` = `false`

Whether to start collapsed

#### Returns

`void`

#### Example

```typescript
logger.group('API Calls');
logger.info('GET /users');
logger.info('GET /posts');
logger.groupEnd();
```

***

### groupEnd()

> **groupEnd**(): `void`

Defined in: [src/core/BrowserLogger.ts:732](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L732)

Ends a console group.

#### Returns

`void`

***

### header()

> **header**(`title`, `colors?`): `void`

Defined in: [src/core/BrowserLogger.ts:750](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L750)

Prints a section header.

#### Parameters

##### title

`string`

Header title

##### colors?

`string`[] = `...`

Colors for the header

#### Returns

`void`

#### Example

```typescript
logger.header('🚀 Application Started');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`header`](../../LoggerBase/classes/LoggerBase.md#header)

***

### info()

> **info**(`msg`): `void`

Defined in: [src/core/BrowserLogger.ts:572](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L572)

Logs an info message.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

#### Returns

`void`

#### Example

```typescript
logger.info('<green>Success:</> User <cyan>logged in</>');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`info`](../../LoggerBase/classes/LoggerBase.md#info)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`isValidLevel`](../../LoggerBase/classes/LoggerBase.md#isvalidlevel)

***

### isVerbose()

> **isVerbose**(): `boolean`

Defined in: [src/core/LoggerBase.ts:383](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L383)

Get verbose mode status.

#### Returns

`boolean`

Whether verbose mode is enabled

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`isVerbose`](../../LoggerBase/classes/LoggerBase.md#isverbose)

***

### link()

> **link**(`url`, `description?`): `void`

Defined in: [src/core/BrowserLogger.ts:853](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L853)

Logs a clickable link (browser automatically makes URLs clickable).

#### Parameters

##### url

`string`

URL to link

##### description?

`string`

Link description

#### Returns

`void`

#### Example

```typescript
logger.link('https://example.com', 'Visit our site');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`link`](../../LoggerBase/classes/LoggerBase.md#link)

***

### list()

> **list**(`items`, `options`): `void`

Defined in: [src/core/BrowserLogger.ts:1370](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1370)

Prints a formatted list with bullets.

#### Parameters

##### items

`string`[]

Array of items to display

##### options

List formatting options

###### bullet?

`string`

###### bulletColor?

`string`[]

###### indent?

`number`

###### itemColor?

`string`[]

#### Returns

`void`

#### Example

```typescript
logger.list(['Item 1', 'Item 2', 'Item 3']);
```

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`listenerCount`](../../LoggerBase/classes/LoggerBase.md#listenercount)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`listeners`](../../LoggerBase/classes/LoggerBase.md#listeners)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`loadTheme`](../../LoggerBase/classes/LoggerBase.md#loadtheme)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`log`](../../LoggerBase/classes/LoggerBase.md#log)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`off`](../../LoggerBase/classes/LoggerBase.md#off)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`on`](../../LoggerBase/classes/LoggerBase.md#on)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`once`](../../LoggerBase/classes/LoggerBase.md#once)

***

### print()

> `protected` **print**(`level`, `msg`, `preset`, `_consoleMethod`): `void`

Defined in: [src/core/BrowserLogger.ts:408](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L408)

Core print method for console output.

#### Parameters

##### level

`string`

Log level

##### msg

`string`

Message to print

##### preset

Style preset

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

##### \_consoleMethod

`"log"` | `"info"` | `"error"` | `"debug"` | `"warn"`

#### Returns

`void`

***

### processStorageQueue()

> **processStorageQueue**(): `Promise`\<`void`\>

Defined in: [src/core/BrowserLogger.ts:467](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L467)

Persist queued logs to storage (localStorage or IndexedDB)

#### Returns

`Promise`\<`void`\>

***

### progressBar()

> **progressBar**(`progress`, `length?`, `completeChar?`, `incompleteChar?`, `_clear?`): `void`

Defined in: [src/core/BrowserLogger.ts:808](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L808)

Prints a progress bar (uses console.log).

#### Parameters

##### progress

`number`

Progress percentage (0-100)

##### length?

`number` = `20`

Length of progress bar

##### completeChar?

`string` = `'█'`

Complete character

##### incompleteChar?

`string` = `'░'`

Incomplete character

##### \_clear?

`boolean` = `false`

#### Returns

`void`

#### Example

```typescript
logger.progressBar(75);
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`progressBar`](../../LoggerBase/classes/LoggerBase.md#progressbar)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`removeAllListeners`](../../LoggerBase/classes/LoggerBase.md#removealllisteners)

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`removeListener`](../../LoggerBase/classes/LoggerBase.md#removelistener)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`removePreset`](../../LoggerBase/classes/LoggerBase.md#removepreset)

***

### resetPerformanceStats()

> **resetPerformanceStats**(): `void`

Defined in: [src/core/LoggerBase.ts:603](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L603)

Reset performance statistics.

#### Returns

`void`

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`resetPerformanceStats`](../../LoggerBase/classes/LoggerBase.md#resetperformancestats)

***

### searchLogs()

> **searchLogs**(`query`, `opts?`): `Promise`\<`string`[]\>

Defined in: [src/core/BrowserLogger.ts:1160](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1160)

Simple search over stored logs.

#### Parameters

##### query

`string`

##### opts?

###### limit?

`number`

###### regex?

`boolean`

#### Returns

`Promise`\<`string`[]\>

***

### separator()

> **separator**(`char`, `width`, `color?`): `void`

Defined in: [src/core/BrowserLogger.ts:1451](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1451)

Prints a separator line (browser console limitation).

#### Parameters

##### char

`string` = `'─'`

Character to use for separator

##### width

`number` = `50`

Width of separator

##### color?

`string`[]

Colors to apply

#### Returns

`void`

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`separator`](../../LoggerBase/classes/LoggerBase.md#separator)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`setColorsEnabled`](../../LoggerBase/classes/LoggerBase.md#setcolorsenabled)

***

### setFileLogging()

> **setFileLogging**(`enabled`): `void`

Defined in: [src/core/BrowserLogger.ts:1198](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1198)

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### setLogDirectory()

> **setLogDirectory**(`_dir`): `void`

Defined in: [src/core/BrowserLogger.ts:1201](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1201)

#### Parameters

##### \_dir

`string`

#### Returns

`void`

***

### setLogRetentionDays()

> **setLogRetentionDays**(`_days`): `void`

Defined in: [src/core/BrowserLogger.ts:1204](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1204)

#### Parameters

##### \_days

`number`

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

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`setMaxListeners`](../../LoggerBase/classes/LoggerBase.md#setmaxlisteners)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`setMinLevel`](../../LoggerBase/classes/LoggerBase.md#setminlevel)

***

### setStorageEnabled()

> **setStorageEnabled**(`enabled`): `void`

Defined in: [src/core/BrowserLogger.ts:1039](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1039)

Enables or disables storage.

#### Parameters

##### enabled

`boolean`

Whether to enable storage

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`setTheme`](../../LoggerBase/classes/LoggerBase.md#settheme)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`setVerbose`](../../LoggerBase/classes/LoggerBase.md#setverbose)

***

### styled()

> **styled**(`msg`, `preset`): `void`

Defined in: [src/core/BrowserLogger.ts:690](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L690)

Logs a message with a specific style preset.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

##### preset

Style preset to use

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

#### Returns

`void`

#### Example

```typescript
logger.styled('<cyan>Info:</> System ready', 'highlight');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`styled`](../../LoggerBase/classes/LoggerBase.md#styled)

***

### success()

> **success**(`msg`): `void`

Defined in: [src/core/BrowserLogger.ts:634](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L634)

Logs a success message.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

#### Returns

`void`

#### Example

```typescript
logger.success('<green.bold>✓</> All tests <green>passed</>');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`success`](../../LoggerBase/classes/LoggerBase.md#success)

***

### table()

> **table**(`data`, `_headerColor?`): `void`

Defined in: [src/core/BrowserLogger.ts:779](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L779)

Prints a table from an array of objects.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

Data to display

##### \_headerColor?

`string`[]

Header colors (unused in browser)

#### Returns

`void`

#### Example

```typescript
logger.table([
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'London' }
]);
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`table`](../../LoggerBase/classes/LoggerBase.md#table)

***

### time()

> **time**(`label`): `void`

Defined in: [src/core/BrowserLogger.ts:1273](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1273)

Starts a timer with the given label.
Uses browser's performance.now() for high precision.

#### Parameters

##### label

`string`

Label for the timer

#### Returns

`void`

#### Example

```typescript
logger.time('api-call');
await fetch('/api/data');
logger.timeEnd('api-call'); // Logs: "api-call: 234.5ms"
```

***

### timeEnd()

> **timeEnd**(`label`): `void`

Defined in: [src/core/BrowserLogger.ts:1283](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L1283)

Stops a timer and logs the elapsed time.

#### Parameters

##### label

`string`

Label of the timer to stop

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`trackPerformance`](../../LoggerBase/classes/LoggerBase.md#trackperformance)

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

#### Inherited from

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`updateConfig`](../../LoggerBase/classes/LoggerBase.md#updateconfig)

***

### warn()

> **warn**(`msg`): `void`

Defined in: [src/core/BrowserLogger.ts:587](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/BrowserLogger.ts#L587)

Logs a warning message.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

#### Returns

`void`

#### Example

```typescript
logger.warn('<yellow.bold>Warning:</> <red>High</> memory usage');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`warn`](../../LoggerBase/classes/LoggerBase.md#warn)
