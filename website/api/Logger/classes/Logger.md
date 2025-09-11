# Class: Logger

Defined in: [src/Logger.ts:117](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L117)

Main Logger class that provides a unified logging interface.

This class automatically detects the runtime environment (Node.js or Browser)
and instantiates the appropriate underlying logger implementation.
It manages transports for flexible log delivery to various destinations
and provides multiple styling APIs for rich text formatting.

 Logger

## Example

```typescript
// Basic usage with styling
const logger = new Logger({ useColors: true });

// Standard logging
logger.info('Server started');
logger.error('Connection failed');

// Styled logging with multiple APIs
logger.info(logger.s.green.bold('✓ Success'));
logger.error(logger.fmt`@red.bold{Error:} ${message}`);
logger.warn(logger.parts([['Warning:', 'yellow', 'bold']]));
logger.info('<green>Success:</> Operation complete');
```

## Constructors

### Constructor

> **new Logger**(`options?`, `writeToDisk?`, `useColors?`): `Logger`

Defined in: [src/Logger.ts:195](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L195)

Creates a new Logger instance with the specified options.

#### Parameters

##### options?

Logger configuration options or verbose flag

`boolean` | [`LoggerOptions`](../../types/logger/interfaces/LoggerOptions.md)

##### writeToDisk?

`boolean`

Whether to write to disk (backward compatibility)

##### useColors?

`boolean`

Whether to use colors (backward compatibility)

#### Returns

`Logger`

## Accessors

### fmt

#### Get Signature

> **get** **fmt**(): [`TemplateFormatter`](../../types/styling/type-aliases/TemplateFormatter.md)

Defined in: [src/Logger.ts:610](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L610)

Template literal formatter for inline styling.
Pre-initialized for performance.

##### Example

```typescript
const user = 'john';
logger.info(logger.fmt`@green.bold{User ${user}} logged in`);
logger.error(logger.fmt`@red{Error:} @yellow{${errorMessage}}`);
```

##### Returns

[`TemplateFormatter`](../../types/styling/type-aliases/TemplateFormatter.md)

Template formatter function

***

### logDir

#### Get Signature

> **get** **logDir**(): `string`

Defined in: [src/Logger.ts:1706](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1706)

Gets the log directory path (deprecated).

##### Deprecated

Use transports instead

##### Returns

`string`

Log directory path

***

### logFile

#### Get Signature

> **get** **logFile**(): `null` \| `string`

Defined in: [src/Logger.ts:1715](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1715)

Gets the current log file path (deprecated).

##### Deprecated

Use transports instead

##### Returns

`null` \| `string`

Current log file path or null

***

### logRetentionDays

#### Get Signature

> **get** **logRetentionDays**(): `number`

Defined in: [src/Logger.ts:1697](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1697)

Gets the log retention days setting (deprecated).

##### Deprecated

Use transports instead

##### Returns

`number`

Number of days to retain logs

***

### s

#### Get Signature

> **get** **s**(): [`IStyleBuilder`](../../types/styling/interfaces/IStyleBuilder.md)

Defined in: [src/Logger.ts:582](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L582)

Chainable style builder for creating styled strings.
Pre-initialized for performance.

##### Example

```typescript
// Chain multiple styles
logger.info(logger.s.red.bold('Error:') + ' Failed');

// Create reusable styles
const error = logger.s.red.bold;
logger.error(error('Critical failure'));
```

##### Returns

[`IStyleBuilder`](../../types/styling/interfaces/IStyleBuilder.md)

Chainable style builder

***

### style

#### Get Signature

> **get** **style**(): [`IStyleBuilder`](../../types/styling/interfaces/IStyleBuilder.md)

Defined in: [src/Logger.ts:593](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L593)

Alias for the style builder (s).
Provides a more descriptive name for the chainable style API.

##### Returns

[`IStyleBuilder`](../../types/styling/interfaces/IStyleBuilder.md)

Chainable style builder

***

### theme

#### Get Signature

> **get** **theme**(): `Record`\<`string`, [`ColorName`](../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/Logger.ts:1336](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1336)

Gets the current theme configuration.

##### Returns

`Record`\<`string`, [`ColorName`](../../types/colors/type-aliases/ColorName.md)[]\>

***

### useColors

#### Get Signature

> **get** **useColors**(): `boolean`

Defined in: [src/Logger.ts:1684](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1684)

Gets the colors enabled setting.

##### Returns

`boolean`

Whether colors are enabled

***

### verbose

#### Get Signature

> **get** **verbose**(): `boolean`

Defined in: [src/Logger.ts:1667](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1667)

Gets the verbose mode setting.

##### Returns

`boolean`

Whether verbose mode is enabled

***

### writeToDisk

#### Get Signature

> **get** **writeToDisk**(): `boolean`

Defined in: [src/Logger.ts:1676](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1676)

Gets the write-to-disk setting (deprecated).

##### Deprecated

Use transports instead

##### Returns

`boolean`

Whether file logging is enabled

## Methods

### addContext()

> **addContext**(`context`): `void`

Defined in: [src/Logger.ts:1483](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1483)

Add to existing context (merges with existing).

#### Parameters

##### context

`Record`\<`string`, `any`\>

Context to merge

#### Returns

`void`

***

### addTags()

> **addTags**(`tags`): `void`

Defined in: [src/Logger.ts:1502](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1502)

Add tags to existing tags.

#### Parameters

##### tags

`string`[]

Tags to add

#### Returns

`void`

***

### addTransport()

> **addTransport**(`transport`): `Promise`\<`void`\>

Defined in: [src/Logger.ts:916](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L916)

Adds a transport to the logger.

#### Parameters

##### transport

[`Transport`](../../types/transport/interfaces/Transport.md)

#### Returns

`Promise`\<`void`\>

#### Async

***

### applyPreset()

> **applyPreset**(`text`, `preset`): `string`

Defined in: [src/Logger.ts:1755](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1755)

Applies a preset style to text.

#### Parameters

##### text

`string`

##### preset

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

#### Returns

`string`

***

### box()

> **box**(`text`, `options`): `void`

Defined in: [src/Logger.ts:1135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1135)

Prints text in a decorative box with customizable borders.

#### Parameters

##### text

`string`

Text to display inside the box (supports multiline)

##### options

Box formatting options

###### border?

`"single"` \| `"double"` \| `"rounded"` \| `"heavy"`

Border style: 'single' | 'double' | 'rounded' | 'heavy' (default: 'single')

###### borderColor?

`string`[]

Colors for the box borders

###### color?

`string`[]

Colors for the text inside the box

###### padding?

`number`

Padding around the text (default: 1)

#### Returns

`void`

#### Example

```typescript
logger.box('Success!', {
  border: 'double',
  borderColor: ['green'],
  color: ['green', 'bold']
});
```

***

### child()

> **child**(`options`): `Logger`

Defined in: [src/Logger.ts:1388](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1388)

Creates a child logger with merged options.

#### Parameters

##### options

`Partial`\<[`LoggerOptions`](../../types/logger/interfaces/LoggerOptions.md)\>

#### Returns

`Logger`

***

### ~~cleanupOldLogs()~~

> **cleanupOldLogs**(): `void`

Defined in: [src/Logger.ts:1785](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1785)

Cleans up old log files (deprecated).

#### Returns

`void`

#### Deprecated

Use file transports instead

***

### ~~clearLogs()~~

> **clearLogs**(): `void`

Defined in: [src/Logger.ts:1874](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1874)

Clears all stored logs from browser storage (deprecated).

#### Returns

`void`

#### Deprecated

Use browser transports instead

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/Logger.ts:964](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L964)

Closes the logger and all transports.

#### Returns

`Promise`\<`void`\>

#### Async

***

### color()

> **color**(...`colors`): (`text`) => `string`

Defined in: [src/Logger.ts:1213](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1213)

Creates a reusable color function (legacy method).

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

### colorize()

> **colorize**(`text`, `colors`): `string`

Defined in: [src/Logger.ts:1728](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1728)

Applies colors to text using ANSI escape codes.

#### Parameters

##### text

`string`

##### colors

`string`[]

#### Returns

`string`

***

### ~~colorParts()~~

> **colorParts**(`message`, `colorMap`): `string`

Defined in: [src/Logger.ts:1240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1240)

Applies different colors to specific parts of a message (legacy method).

#### Parameters

##### message

`string`

##### colorMap

`Record`\<`string`, [`ColorName`](../../types/colors/type-aliases/ColorName.md)[]\>

#### Returns

`string`

#### Deprecated

Use parts() or styleByIndex() for better control

***

### count()

> **count**(`label`): `void`

Defined in: [src/Logger.ts:2027](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L2027)

Counts the number of times this method is called with the same label.

#### Parameters

##### label

`string` = `'default'`

Label for the counter (default: 'default')

#### Returns

`void`

#### Example

```typescript
logger.count('api-calls'); // Logs: "api-calls: 1"
logger.count('api-calls'); // Logs: "api-calls: 2"
logger.count('api-calls'); // Logs: "api-calls: 3"
logger.countReset('api-calls');
logger.count('api-calls'); // Logs: "api-calls: 1"
```

***

### countReset()

> **countReset**(`label`): `void`

Defined in: [src/Logger.ts:2048](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L2048)

Resets a counter to zero.

#### Parameters

##### label

`string` = `'default'`

Label of the counter to reset (default: 'default')

#### Returns

`void`

#### Example

```typescript
logger.count('errors'); // "errors: 1"
logger.count('errors'); // "errors: 2"
logger.countReset('errors');
logger.count('errors'); // "errors: 1"
```

***

### ~~custom()~~

> **custom**(`msg`, `colors`, `prefix`): `void`

Defined in: [src/Logger.ts:977](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L977)

Logs a custom message with custom colors (legacy method).

#### Parameters

##### msg

`string`

##### colors

`string`[] = `...`

##### prefix

`string` = `'LOG'`

#### Returns

`void`

#### Deprecated

Use standard log methods with transports for better control

***

### debug()

#### Call Signature

> **debug**(`msg`, `meta?`): `void`

Defined in: [src/Logger.ts:887](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L887)

Logs a debug message.
Enhanced to support angle bracket syntax <style>text</>.
Only shown when verbose mode is enabled.

##### Parameters

###### msg

`string`

Debug message (supports <style> syntax)

###### meta?

[`LogEntryMeta`](../type-aliases/LogEntryMeta.md)

Additional metadata

##### Returns

`void`

#### Call Signature

> **debug**(...`args`): `void`

Defined in: [src/Logger.ts:888](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L888)

Logs a debug message.
Enhanced to support angle bracket syntax <style>text</>.
Only shown when verbose mode is enabled.

##### Parameters

###### args

...`unknown`[]

##### Returns

`void`

***

### ~~downloadLogs()~~

> **downloadLogs**(`_filename`): `void`

Defined in: [src/Logger.ts:1883](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1883)

Downloads stored logs as a text file (deprecated).

#### Parameters

##### \_filename

`string` = `'logs.txt'`

#### Returns

`void`

#### Deprecated

Use browser transports instead

***

### error()

#### Call Signature

> **error**(`msg`, `meta?`): `void`

Defined in: [src/Logger.ts:857](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L857)

Logs an error message.
Enhanced to support angle bracket syntax <style>text</>.

##### Parameters

###### msg

`string`

Error message (supports <style> syntax)

###### meta?

[`LogEntryMeta`](../type-aliases/LogEntryMeta.md)

Additional metadata or error object

##### Returns

`void`

#### Call Signature

> **error**(...`args`): `void`

Defined in: [src/Logger.ts:858](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L858)

Logs an error message.
Enhanced to support angle bracket syntax <style>text</>.

##### Parameters

###### args

...`unknown`[]

##### Returns

`void`

***

### getBindings()

> **getBindings**(): `Record`\<`string`, `any`\>

Defined in: [src/Logger.ts:1463](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1463)

Get all logger bindings (context + metadata).
Similar to Pino's bindings() method.

#### Returns

`Record`\<`string`, `any`\>

Combined context and metadata

***

### getContext()

> **getContext**(): `undefined` \| `Record`\<`string`, `any`\>

Defined in: [src/Logger.ts:1422](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1422)

Get the current context object.

#### Returns

`undefined` \| `Record`\<`string`, `any`\>

Current context

***

### getCustomColors()

> **getCustomColors**(): `Promise`\<`string`[]\>

Defined in: [src/Logger.ts:1649](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1649)

Get list of all registered custom colors.

#### Returns

`Promise`\<`string`[]\>

Array of custom color names

***

### getId()

> **getId**(): `undefined` \| `string`

Defined in: [src/Logger.ts:1454](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1454)

Get logger ID.

#### Returns

`undefined` \| `string`

Logger instance ID

***

### getLevel()

> **getLevel**(): `undefined` \| `string`

Defined in: [src/Logger.ts:1438](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1438)

Get the current log level.

#### Returns

`undefined` \| `string`

Current minimum log level

***

### ~~getLogDir()~~

> **getLogDir**(): `string`

Defined in: [src/Logger.ts:1809](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1809)

Gets the current log directory (deprecated).

#### Returns

`string`

#### Deprecated

Use file transports instead

***

### ~~getLogRetentionDays()~~

> **getLogRetentionDays**(): `number`

Defined in: [src/Logger.ts:1829](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1829)

Gets the log retention period in days (deprecated).

#### Returns

`number`

#### Deprecated

Use file transports instead

***

### ~~getLogs()~~

> **getLogs**(): `null` \| `string`[]

Defined in: [src/Logger.ts:1864](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1864)

Gets all stored logs from browser storage (deprecated).

#### Returns

`null` \| `string`[]

#### Deprecated

Use browser transports instead

***

### ~~getPath()~~

> **getPath**(): `null` \| `string`

Defined in: [src/Logger.ts:1799](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1799)

Gets the current log file path (deprecated).

#### Returns

`null` \| `string`

#### Deprecated

Use file transports instead

***

### getTags()

> **getTags**(): `undefined` \| `string`[]

Defined in: [src/Logger.ts:1430](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1430)

Get the current tags array.

#### Returns

`undefined` \| `string`[]

Current tags

***

### getTheme()

> **getTheme**(): `Record`\<`string`, [`ColorName`](../../types/colors/type-aliases/ColorName.md)[]\>

Defined in: [src/Logger.ts:1371](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1371)

Gets the current theme object (convenience for tests/integration).

#### Returns

`Record`\<`string`, [`ColorName`](../../types/colors/type-aliases/ColorName.md)[]\>

***

### getTransport()

> **getTransport**(`name`): `undefined` \| [`Transport`](../../types/transport/interfaces/Transport.md)

Defined in: [src/Logger.ts:939](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L939)

Gets a transport by name.

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`Transport`](../../types/transport/interfaces/Transport.md)

***

### getTransports()

> **getTransports**(): [`Transport`](../../types/transport/interfaces/Transport.md)[]

Defined in: [src/Logger.ts:1446](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1446)

Get all transports.

#### Returns

[`Transport`](../../types/transport/interfaces/Transport.md)[]

Array of configured transports

***

### getTransportStats()

> **getTransportStats**(): `Record`\<`string`, `unknown`\>

Defined in: [src/Logger.ts:955](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L955)

Gets statistics for all transports.

#### Returns

`Record`\<`string`, `unknown`\>

***

### group()

> **group**(`label`): `void`

Defined in: [src/Logger.ts:2068](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L2068)

Creates a collapsible group of log messages.
All logs after group() and before groupEnd() are visually grouped.

#### Parameters

##### label

`string`

Label for the group

#### Returns

`void`

#### Example

```typescript
logger.group('Processing batch');
logger.info('Item 1 processed');
logger.info('Item 2 processed');
logger.info('Item 3 processed');
logger.groupEnd();
```

***

### groupEnd()

> **groupEnd**(): `void`

Defined in: [src/Logger.ts:2084](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L2084)

Ends the current log group.

#### Returns

`void`

#### Example

```typescript
logger.group('Database operations');
logger.info('Connected to database');
logger.info('Query executed');
logger.groupEnd();
```

***

### header()

> **header**(`title`, `colors?`): `void`

Defined in: [src/Logger.ts:1023](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1023)

Prints a section header (legacy method).

#### Parameters

##### title

`string`

##### colors?

`string`[]

#### Returns

`void`

***

### info()

> **info**(...`args`): `void`

Defined in: [src/Logger.ts:771](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L771)

Logs an info-level message.
Enhanced to support angle bracket syntax <style>text</>.

#### Parameters

##### args

...`any`[]

#### Returns

`void`

***

### ~~initLogFile()~~

> **initLogFile**(): `void`

Defined in: [src/Logger.ts:1775](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1775)

Initializes log file (deprecated).

#### Returns

`void`

#### Deprecated

Use file transports instead

***

### isLevelEnabled()

> **isLevelEnabled**(`level`): `boolean`

Defined in: [src/Logger.ts:1520](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1520)

Check if a log level is enabled.

#### Parameters

##### level

`string`

Level to check

#### Returns

`boolean`

True if the level would be logged

***

### link()

> **link**(`url`, `description?`): `void`

Defined in: [src/Logger.ts:1200](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1200)

Logs a clickable link (legacy method).

#### Parameters

##### url

`string`

##### description?

`string`

#### Returns

`void`

***

### list()

> **list**(`items`, `options`): `void`

Defined in: [src/Logger.ts:1154](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1154)

Prints a formatted list with bullets.

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

#### Returns

`void`

***

### listTransports()

> **listTransports**(): `string`[]

Defined in: [src/Logger.ts:947](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L947)

Lists all configured transport names.

#### Returns

`string`[]

***

### log()

> **log**(`msg`, `level?`, `meta?`): `void`

Defined in: [src/Logger.ts:703](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L703)

High-performance core logging method optimized for speed.
Implements fast paths for plain messages (90% of use cases).
Supports angle bracket syntax for styled messages.

#### Parameters

##### msg

`string`

The message to log (supports <style> syntax)

##### level?

`string` = `'info'`

Log level

##### meta?

[`LogEntryMeta`](../type-aliases/LogEntryMeta.md)

Additional metadata or error

#### Returns

`void`

***

### normalizePath()

> **normalizePath**(`path`): `string`

Defined in: [src/Logger.ts:1766](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1766)

Normalizes path separators to use forward slashes.

#### Parameters

##### path

`string`

#### Returns

`string`

***

### parseBrackets()

> **parseBrackets**(`text`): `string`

Defined in: [src/Logger.ts:679](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L679)

Parses and applies angle bracket syntax styling <style>text</>.
Angle brackets avoid conflicts with regular brackets in text.
This method is automatically applied to all log messages.

#### Parameters

##### text

`string`

Text with angle bracket syntax

#### Returns

`string`

Styled text

#### Example

```typescript
logger.info(logger.parseBrackets(
  '<green.bold>SUCCESS:</> All <yellow>10</> tests passed'
));

// Or use directly in log methods (auto-parsed)
logger.info('<green.bold>SUCCESS:</> Operation complete');
```

***

### parts()

> **parts**(`parts`): `string`

Defined in: [src/Logger.ts:631](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L631)

Styles an array of text parts with explicit style control.
Each part is a tuple of [text, ...styles].

#### Parameters

##### parts

[`StyledPart`](../../types/styling/type-aliases/StyledPart.md)[]

Array of text parts with styles

#### Returns

`string`

Combined styled string

#### Example

```typescript
logger.info(logger.parts([
  ['SUCCESS:', 'green', 'bold'],
  [' All tests passed'],
  [' (100%)', 'dim']
]));
```

***

### preserveLinks()

> **preserveLinks**(`text`): `string`

Defined in: [src/Logger.ts:1288](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1288)

Preserve links in text by formatting them with ANSI codes.
Passes through null/undefined unchanged; non-strings are stringified.

#### Parameters

##### text

`unknown`

#### Returns

`string`

***

### progressBar()

> **progressBar**(`progress`, `length`, `completeChar`, `incompleteChar`, `clear`): `void`

Defined in: [src/Logger.ts:1173](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1173)

Prints a progress bar (legacy method).

#### Parameters

##### progress

`number`

##### length

`number` = `20`

##### completeChar

`string` = `'█'`

##### incompleteChar

`string` = `'░'`

##### clear

`boolean` = `false`

#### Returns

`void`

***

### registerCustomColor()

> **registerCustomColor**(`name`, `definition`): `void`

Defined in: [src/Logger.ts:1556](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1556)

Register custom colors for use in themes and styling.

⚠️ WARNING: Custom colors may not work in all terminals!
Use predefined colors for maximum compatibility.

#### Parameters

##### name

`string`

Custom color name

##### definition

Color definition

###### ansi?

`string`

Direct ANSI escape sequence

###### code256?

`number`

256-color palette code

###### description?

`string`

###### fallback?

`string`

Fallback color name

###### hex?

`string`

Hex color (e.g., '#FF5733')

###### rgb?

\[`number`, `number`, `number`\]

RGB values

#### Returns

`void`

#### Example

```typescript
// Register a custom brand color
logger.registerCustomColor('brandOrange', {
  hex: '#FF5733',
  fallback: 'orange'
});

// Use in theme
logger.setTheme({
  header: ['brandOrange', 'bold']
});
```

***

### registerCustomColors()

> **registerCustomColors**(`colors`): `void`

Defined in: [src/Logger.ts:1595](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1595)

Register multiple custom colors at once.

#### Parameters

##### colors

`Record`\<`string`, \{ `ansi?`: `string`; `code256?`: `number`; `description?`: `string`; `fallback?`: `string`; `hex?`: `string`; `rgb?`: \[`number`, `number`, `number`\]; \}\>

Map of color definitions

#### Returns

`void`

#### Example

```typescript
logger.registerCustomColors({
  brandPrimary: { hex: '#FF5733', fallback: 'orange' },
  brandSecondary: { hex: '#3366FF', fallback: 'blue' },
  brandAccent: { rgb: [0, 255, 127], fallback: 'green' }
});
```

***

### removeCustomColor()

> **removeCustomColor**(`name`): `Promise`\<`boolean`\>

Defined in: [src/Logger.ts:1628](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1628)

Remove a custom color registration.

#### Parameters

##### name

`string`

Color name to remove

#### Returns

`Promise`\<`boolean`\>

True if removed

***

### removeTransport()

> **removeTransport**(`name`): `Promise`\<`void`\>

Defined in: [src/Logger.ts:928](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L928)

Removes a transport by name.

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>

#### Async

***

### separator()

> **separator**(`char`, `width`, `color?`): `void`

Defined in: [src/Logger.ts:1110](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1110)

Prints a separator line.

#### Parameters

##### char

`string` = `'─'`

Character to use for the separator (default: '─')

##### width

`number` = `50`

Width of the separator line (default: 50)

##### color?

`string`[]

Optional colors to apply to the separator

#### Returns

`void`

#### Example

```typescript
logger.separator('═', 60, ['cyan']);
logger.separator(); // Uses defaults: '─' repeated 50 times
```

***

### setColorsEnabled()

> **setColorsEnabled**(`enabled`): `void`

Defined in: [src/Logger.ts:1318](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1318)

Enables or disables color output.

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### setContext()

> **setContext**(`context`): `void`

Defined in: [src/Logger.ts:1475](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1475)

Set the context (replaces existing).

#### Parameters

##### context

`Record`\<`string`, `any`\>

New context object

#### Returns

`void`

***

### ~~setFileLogging()~~

> **setFileLogging**(`enabled`): `void`

Defined in: [src/Logger.ts:1849](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1849)

Enables or disables file logging (deprecated).

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

#### Deprecated

Use file transports instead

***

### setLevel()

> **setLevel**(`level`): `void`

Defined in: [src/Logger.ts:1511](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1511)

Set the minimum log level.

#### Parameters

##### level

`string`

New minimum log level

#### Returns

`void`

***

### ~~setLogDir()~~

> **setLogDir**(`dir`, `_reinitialize`): `void`

Defined in: [src/Logger.ts:1818](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1818)

Sets the log directory (deprecated).

#### Parameters

##### dir

`string`

##### \_reinitialize

`boolean` = `false`

#### Returns

`void`

#### Deprecated

Use file transports instead

***

### ~~setLogRetentionDays()~~

> **setLogRetentionDays**(`days`, `_cleanNow`): `void`

Defined in: [src/Logger.ts:1838](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1838)

Sets the log retention period in days (deprecated).

#### Parameters

##### days

`number`

##### \_cleanNow

`boolean` = `false`

#### Returns

`void`

#### Deprecated

Use file transports instead

***

### ~~setStorageEnabled()~~

> **setStorageEnabled**(`_enabled`): `void`

Defined in: [src/Logger.ts:1892](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1892)

Enables or disables browser storage (deprecated).

#### Parameters

##### \_enabled

`boolean`

#### Returns

`void`

#### Deprecated

Use browser transports instead

***

### setTags()

> **setTags**(`tags`): `void`

Defined in: [src/Logger.ts:1494](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1494)

Set tags (replaces existing).

#### Parameters

##### tags

`string`[]

New tags array

#### Returns

`void`

***

### setTheme()

> **setTheme**(`theme`): `void`

Defined in: [src/Logger.ts:1349](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1349)

Sets or replaces the theme configuration.

#### Parameters

##### theme

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### setVerbose()

> **setVerbose**(`enabled`): `void`

Defined in: [src/Logger.ts:1300](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1300)

Sets verbose mode for the logger.

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### styleByIndex()

> **styleByIndex**(`text`, `styleMap`): `string`

Defined in: [src/Logger.ts:657](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L657)

Styles text by applying colors to specific word indices.
Words are indexed starting from 0, whitespace is ignored.

#### Parameters

##### text

`string`

Text to style

##### styleMap

[`WordStyleMap`](../../types/styling/type-aliases/WordStyleMap.md)

Map of word indices to styles

#### Returns

`string`

Styled text

#### Example

```typescript
logger.info(logger.styleByIndex(
  'GET /api/users 200 OK 45ms',
  {
    0: ['blue', 'bold'],    // "GET"
    1: ['cyan'],            // "/api/users"
    2: ['green', 'bold'],   // "200"
    3: ['green'],           // "OK"
    4: ['magenta']          // "45ms"
  }
));
```

***

### ~~styled()~~

> **styled**(`msg`, `preset`): `void`

Defined in: [src/Logger.ts:997](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L997)

Logs a message with a preset style (legacy method).

#### Parameters

##### msg

`string`

##### preset

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

#### Returns

`void`

#### Deprecated

Use standard log methods for better consistency

***

### success()

#### Call Signature

> **success**(`msg`, `meta?`): `void`

Defined in: [src/Logger.ts:799](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L799)

Logs a success message.
Enhanced to support angle bracket syntax <style>text</>.

##### Parameters

###### msg

`string`

Success message (supports <style> syntax)

###### meta?

[`LogEntryMeta`](../type-aliases/LogEntryMeta.md)

Additional metadata

##### Returns

`void`

#### Call Signature

> **success**(...`args`): `void`

Defined in: [src/Logger.ts:800](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L800)

Logs a success message.
Enhanced to support angle bracket syntax <style>text</>.

##### Parameters

###### args

...`unknown`[]

##### Returns

`void`

***

### table()

> **table**(`data`, `options`): `void`

Defined in: [src/Logger.ts:1061](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1061)

Prints a formatted table with borders and proper alignment.
Automatically handles ANSI escape codes and column width calculation.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

Array of objects to display as table rows

##### options

Table formatting options

###### alignment?

`"left"` \| `"right"` \| `"center"`

Text alignment: 'left' | 'center' | 'right' (default: 'left')

###### alternateRowColors?

`boolean`

Enable alternating row colors

###### border?

`"none"` \| `"single"` \| `"double"` \| `"rounded"` \| `"heavy"`

Border style: 'single' | 'double' | 'rounded' | 'heavy' | 'none' (default: 'single')

###### borderColor?

`string`[]

Colors for borders (default: ['dim'])

###### headerColor?

`string`[]

Colors for header row (default: ['brightWhite', 'bold'])

#### Returns

`void`

#### Example

```typescript
logger.table([
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' }
], {
  border: 'double',
  headerColor: ['cyan', 'bold'],
  borderColor: ['blue']
});
```

***

### time()

> **time**(`label`): `void`

Defined in: [src/Logger.ts:1983](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1983)

Starts a timer with the given label.
Use timeEnd() to stop the timer and log the elapsed time.

#### Parameters

##### label

`string`

Label for the timer

#### Returns

`void`

#### Example

```typescript
logger.time('database-query');
const results = await db.query('SELECT * FROM users');
logger.timeEnd('database-query'); // Logs: "database-query: 145ms"
```

***

### timeEnd()

> **timeEnd**(`label`): `void`

Defined in: [src/Logger.ts:2000](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L2000)

Stops a timer and logs the elapsed time.

#### Parameters

##### label

`string`

Label of the timer to stop

#### Returns

`void`

#### Example

```typescript
logger.time('api-call');
await fetch('https://api.example.com/data');
logger.timeEnd('api-call'); // Logs: "api-call: 234ms"
```

***

### warn()

#### Call Signature

> **warn**(`msg`, `meta?`): `void`

Defined in: [src/Logger.ts:828](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L828)

Logs a warning message.
Enhanced to support angle bracket syntax <style>text</>.

##### Parameters

###### msg

`string`

Warning message (supports <style> syntax)

###### meta?

[`LogEntryMeta`](../type-aliases/LogEntryMeta.md)

Additional metadata

##### Returns

`void`

#### Call Signature

> **warn**(...`args`): `void`

Defined in: [src/Logger.ts:829](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L829)

Logs a warning message.
Enhanced to support angle bracket syntax <style>text</>.

##### Parameters

###### args

...`unknown`[]

##### Returns

`void`

***

### cleanupDirectory()

> `static` **cleanupDirectory**(`dir`): `void`

Defined in: [src/Logger.ts:1944](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1944)

Recursively cleans up a directory and its contents.

#### Parameters

##### dir

`string`

#### Returns

`void`

#### Static

***

### isLinkLike()

> `static` **isLinkLike**(`text`): `boolean`

Defined in: [src/Logger.ts:1925](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1925)

Checks if a string looks like a URL or file path.

#### Parameters

##### text

`string`

#### Returns

`boolean`

#### Static

***

### normalizeLineEndings()

> `static` **normalizeLineEndings**(`text`): `string`

Defined in: [src/Logger.ts:1915](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1915)

Normalizes line endings to LF (\n).

#### Parameters

##### text

`string`

#### Returns

`string`

#### Static

***

### normalizePath()

> `static` **normalizePath**(`path`): `string`

Defined in: [src/Logger.ts:1905](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/Logger.ts#L1905)

Normalizes path separators to use forward slashes.

#### Parameters

##### path

`string`

#### Returns

`string`

#### Static
