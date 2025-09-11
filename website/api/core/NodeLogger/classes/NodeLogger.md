# Class: NodeLogger

Defined in: [src/core/NodeLogger.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L43)

Node.js implementation of the Logger.

This class provides full-featured logging for Node.js environments:
- Terminal color support with automatic detection
- File logging with rotation and retention
- Rich formatting (tables, progress bars, headers)
- Performance optimizations for Node.js
- Angle bracket syntax parsing for inline styles

 NodeLogger

## Example

```typescript
const logger = new NodeLogger({
  useColors: true,
  writeToDisk: true,
  logDir: './logs',
  verbose: false
});

// Automatic angle bracket parsing
logger.info('<green.bold>SUCCESS:</> Server started on <cyan>port 3000</>');
logger.error('<red>Error:</> Connection to <yellow>database</> failed');
```

## Extends

- [`LoggerBase`](../../LoggerBase/classes/LoggerBase.md)

## Constructors

### Constructor

> **new NodeLogger**(`options`): `NodeLogger`

Defined in: [src/core/NodeLogger.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L106)

Creates a new NodeLogger instance.

#### Parameters

##### options

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md) = `{}`

Logger configuration

#### Returns

`NodeLogger`

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

### child()

> **child**(`options`): `NodeLogger`

Defined in: [src/core/NodeLogger.ts:903](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L903)

Creates a child logger with merged configuration.

#### Parameters

##### options

`Partial`\<[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md)\>

Child logger options

#### Returns

`NodeLogger`

Child logger instance

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`child`](../../LoggerBase/classes/LoggerBase.md#child)

***

### cleanupOldLogs()

> **cleanupOldLogs**(): `void`

Defined in: [src/core/NodeLogger.ts:802](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L802)

Cleans up old log files based on retention policy.

#### Returns

`void`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/core/NodeLogger.ts:917](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L917)

Closes the logger and cleans up resources.

#### Returns

`Promise`\<`void`\>

***

### color()

> **color**(...`colors`): (`text`) => `string`

Defined in: [src/core/NodeLogger.ts:748](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L748)

Creates a reusable color function.

#### Parameters

##### colors

...`string`[]

Colors to apply

#### Returns

Function that applies the colors to text

> (`text`): `string`

##### Parameters

###### text

`string`

##### Returns

`string`

#### Example

```typescript
const error = logger.color('red', 'bold');
console.log(error('This is an error'));
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`color`](../../LoggerBase/classes/LoggerBase.md#color)

***

### colorize()

> **colorize**(`text`, `colors`): `string`

Defined in: [src/core/NodeLogger.ts:922](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L922)

Direct colorization passthrough for tests

#### Parameters

##### text

`string`

##### colors

`string`[]

#### Returns

`string`

***

### colorParts()

> **colorParts**(`message`, `colorMap`): `string`

Defined in: [src/core/NodeLogger.ts:772](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L772)

Applies different colors to specific parts of a message.

#### Parameters

##### message

`string`

Message to color

##### colorMap

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Map of text to colors

#### Returns

`string`

Colored message

#### Example

```typescript
const msg = logger.colorParts('Error: Connection failed', {
  'Error:': ['red', 'bold'],
  'failed': ['yellow']
});
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`colorParts`](../../LoggerBase/classes/LoggerBase.md#colorparts)

***

### custom()

> **custom**(`msg`, `colors`, `prefix?`): `void`

Defined in: [src/core/NodeLogger.ts:469](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L469)

Logs a custom message with custom colors.
Automatically parses angle bracket syntax.

#### Parameters

##### msg

`string`

Message to log (supports <style> syntax)

##### colors

`string`[] = `...`

Colors to apply (if no angle brackets)

##### prefix?

`string` = `'LOG'`

Prefix for the message

#### Returns

`void`

#### Example

```typescript
logger.custom('<magenta>Custom:</> Special event', ['magenta'], 'EVENT');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`custom`](../../LoggerBase/classes/LoggerBase.md#custom)

***

### debug()

> **debug**(`msg`): `void`

Defined in: [src/core/NodeLogger.ts:435](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L435)

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
logger.debug('<dim>Debug:</> Cache hit for <cyan>user_123</>');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`debug`](../../LoggerBase/classes/LoggerBase.md#debug)

***

### destroy()

> **destroy**(): `void`

Defined in: [src/core/LoggerBase.ts:746](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/LoggerBase.ts#L746)

Clean up resources.

#### Returns

`void`

#### Inherited from

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

Defined in: [src/core/NodeLogger.ts:420](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L420)

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
logger.error('<red>Error:</> Connection <yellow>timeout</>');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`error`](../../LoggerBase/classes/LoggerBase.md#error)

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

### getContextManager()

> **getContextManager**(): `undefined` \| [`ContextManager`](../../ContextManager/classes/ContextManager.md)

Defined in: [src/core/NodeLogger.ts:946](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L946)

Expose managers for tests

#### Returns

`undefined` \| [`ContextManager`](../../ContextManager/classes/ContextManager.md)

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

Defined in: [src/core/NodeLogger.ts:835](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L835)

Gets the log directory.

#### Returns

`string`

Log directory path

***

### getLogFilePath()

> **getLogFilePath**(): `null` \| `string`

Defined in: [src/core/NodeLogger.ts:825](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L825)

Gets the current log file path.

#### Returns

`null` \| `string`

Current log file path or null

***

### getLogRetentionDays()

> **getLogRetentionDays**(): `number`

Defined in: [src/core/NodeLogger.ts:863](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L863)

Gets the log retention period.

#### Returns

`number`

Retention period in days

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

### getTagManager()

> **getTagManager**(): [`TagManager`](../../TagManager/classes/TagManager.md)

Defined in: [src/core/NodeLogger.ts:949](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L949)

#### Returns

[`TagManager`](../../TagManager/classes/TagManager.md)

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

### header()

> **header**(`title`, `colors?`): `void`

Defined in: [src/core/NodeLogger.ts:562](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L562)

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
logger.header('🚀 DEPLOYMENT PROCESS');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`header`](../../LoggerBase/classes/LoggerBase.md#header)

***

### info()

> **info**(`msg`): `void`

Defined in: [src/core/NodeLogger.ts:390](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L390)

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
logger.info('<green>Success:</> Operation completed');
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

### isWriteToDiskEnabled()

> **isWriteToDiskEnabled**(): `boolean`

Defined in: [src/core/NodeLogger.ts:893](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L893)

Checks if file logging is enabled.

#### Returns

`boolean`

Whether writing to disk is enabled

***

### link()

> **link**(`url`, `description?`): `void`

Defined in: [src/core/NodeLogger.ts:720](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L720)

Logs a clickable link (if terminal supports it).

#### Parameters

##### url

`string`

URL to link to

##### description?

`string`

Link description

#### Returns

`void`

#### Example

```typescript
logger.link('https://github.com/user/repo', 'View on GitHub');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`link`](../../LoggerBase/classes/LoggerBase.md#link)

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

> `protected` **print**(`level`, `msg`, `preset`): `void`

Defined in: [src/core/NodeLogger.ts:327](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L327)

Core print method that handles all output.

#### Parameters

##### level

`string`

Log level

##### msg

`string`

Message to print

##### preset

Style preset to use

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

#### Returns

`void`

***

### progressBar()

> **progressBar**(`progress`, `length?`, `completeChar?`, `incompleteChar?`, `clear?`): `void`

Defined in: [src/core/NodeLogger.ts:659](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L659)

Prints a progress bar.

#### Parameters

##### progress

`number`

Progress percentage (0-100)

##### length?

`number` = `20`

Length of the progress bar

##### completeChar?

`string` = `'█'`

Character for completed portion

##### incompleteChar?

`string` = `'░'`

Character for incomplete portion

##### clear?

`boolean` = `false`

#### Returns

`void`

#### Example

```typescript
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i);
  await sleep(100);
}
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

### separator()

> **separator**(`char?`, `length?`): `void`

Defined in: [src/core/NodeLogger.ts:588](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L588)

Prints a separator line.

#### Parameters

##### char?

`string` = `'-'`

Character to use for the separator

##### length?

`number`

Length of the separator (defaults to terminal width)

#### Returns

`void`

#### Example

```typescript
logger.separator('=', 50);
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`separator`](../../LoggerBase/classes/LoggerBase.md#separator)

***

### setColorsEnabled()

> **setColorsEnabled**(`enabled`): `void`

Defined in: [src/core/NodeLogger.ts:954](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L954)

Keep formatter in sync with color setting

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`setColorsEnabled`](../../LoggerBase/classes/LoggerBase.md#setcolorsenabled)

***

### setFileLogging()

> **setFileLogging**(`enabled`): `void`

Defined in: [src/core/NodeLogger.ts:927](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L927)

Enable or disable file logging at runtime

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### setLogDirectory()

> **setLogDirectory**(`dir`, `reinit`): `void`

Defined in: [src/core/NodeLogger.ts:844](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L844)

Sets the log directory.

#### Parameters

##### dir

`string`

New log directory

##### reinit

`boolean` = `false`

#### Returns

`void`

***

### setLogRetentionDays()

> **setLogRetentionDays**(`days`, `cleanNow?`): `void`

Defined in: [src/core/NodeLogger.ts:873](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L873)

Sets the log retention period.

#### Parameters

##### days

`number`

Retention period in days

##### cleanNow?

`boolean` = `false`

Whether to clean immediately

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

Defined in: [src/core/NodeLogger.ts:506](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L506)

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
logger.styled('<cyan>Info:</> System status', 'highlight');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`styled`](../../LoggerBase/classes/LoggerBase.md#styled)

***

### success()

> **success**(`msg`): `void`

Defined in: [src/core/NodeLogger.ts:452](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L452)

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
logger.success('<green.bold>✓</> All tests passed');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`success`](../../LoggerBase/classes/LoggerBase.md#success)

***

### table()

> **table**(`data`, `headerColor?`): `void`

Defined in: [src/core/NodeLogger.ts:614](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L614)

Prints a table from an array of objects.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

Data to display

##### headerColor?

`string`[] = `...`

Colors for the header

#### Returns

`void`

#### Example

```typescript
logger.table([
  { name: 'API', status: 'healthy', uptime: '99.9%' },
  { name: 'DB', status: 'degraded', uptime: '95.2%' }
]);
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`table`](../../LoggerBase/classes/LoggerBase.md#table)

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

Defined in: [src/core/NodeLogger.ts:405](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/NodeLogger.ts#L405)

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
logger.warn('<yellow.bold>Warning:</> High memory usage');
```

#### Overrides

[`LoggerBase`](../../LoggerBase/classes/LoggerBase.md).[`warn`](../../LoggerBase/classes/LoggerBase.md#warn)
