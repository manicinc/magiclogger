# Class: SyncLogger

Defined in: [src/sync/SyncLogger.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L75)

Synchronous logger with blocking I/O for guaranteed delivery.

All operations complete before returning, ensuring logs are written
immediately. Perfect for security auditing, debugging, and crash-resilient
logging at the cost of blocking application execution.

 SyncLogger

## Examples

```typescript
const logger = new SyncLogger();
logger.info('Step 1');  // Blocks until written
logger.info('Step 2');  // Executes after Step 1 completes
```

```typescript
const audit = new SyncLogger({
  file: './audit.log',
  forceFlush: true,     // fsync after each write
  useConsole: false
});

audit.info('User login', { userId: 123 });
// Log guaranteed on disk before continuing
```

## Constructors

### Constructor

> **new SyncLogger**(`options?`): `SyncLogger`

Defined in: [src/sync/SyncLogger.ts:112](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L112)

Creates a new synchronous logger instance.

#### Parameters

##### options?

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md) = `{}`

Configuration options

#### Returns

`SyncLogger`

#### Remarks

All operations are synchronous and block until complete.
File output uses sync I/O with optional fsync for durability.
Perfect for audit logging and scenarios requiring guaranteed delivery.

#### Example

```typescript
const logger = new SyncLogger({
  file: './audit.log',
  forceFlush: true,
  useColors: false  // Clean logs for parsing
});
```

## Accessors

### s

#### Get Signature

> **get** **s**(): [`IStyleBuilder`](../../../types/styling/interfaces/IStyleBuilder.md)

Defined in: [src/sync/SyncLogger.ts:603](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L603)

Gets the chainable style builder for formatting text.

##### Remarks

Provides fluent API for applying colors and styles to text.
Styles are applied synchronously when the chain is executed.

##### Example

```typescript
const styled = logger.s.red.bold('Error!');
logger.info(styled);
// Styled text guaranteed written before continuing
```

##### Returns

[`IStyleBuilder`](../../../types/styling/interfaces/IStyleBuilder.md)

The style builder instance

## Methods

### box()

> **box**(`text`, `options`): `void`

Defined in: [src/sync/SyncLogger.ts:846](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L846)

Prints text in a decorative box.

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
  border: 'double',
  borderColor: ['green']
});
```

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/sync/SyncLogger.ts:526](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L526)

Closes file handles and performs cleanup.

#### Returns

`Promise`\<`void`\>

#### Remarks

Always call this when done logging to:
- Close file descriptors
- Flush any pending writes
- Free system resources

#### Example

```typescript
const logger = new SyncLogger({ file: './app.log' });
try {
  logger.info('Processing');
} finally {
  logger.close();  // Always cleanup
}
```

***

### colorParts()

> **colorParts**(`message`, `colorMap`): `string`

Defined in: [src/sync/SyncLogger.ts:774](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L774)

Colors specific parts of a message based on a color map.

#### Parameters

##### message

`string`

The message to log

##### colorMap

`Record`\<`string`, [`ColorName`](../../../types/colors/type-aliases/ColorName.md)[]\>

Map of text patterns to color arrays

#### Returns

`string`

The styled message string

#### Example

```typescript
logger.colorParts('User john_doe uploaded data.json', {
  'john_doe': ['cyan', 'bold'],
  'data.json': ['yellow']
});
```

***

### count()

> **count**(`label`): `void`

Defined in: [src/sync/SyncLogger.ts:936](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L936)

Counts occurrences with a label.

#### Parameters

##### label

`string` = `'default'`

Counter label

#### Returns

`void`

#### Example

```typescript
logger.count('api-calls'); // "api-calls: 1"
logger.count('api-calls'); // "api-calls: 2"
```

***

### countReset()

> **countReset**(`label`): `void`

Defined in: [src/sync/SyncLogger.ts:949](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L949)

Resets a counter.

#### Parameters

##### label

`string` = `'default'`

Counter label to reset

#### Returns

`void`

***

### custom()

> **custom**(`msg`, `colors`, `prefix`): `void`

Defined in: [src/sync/SyncLogger.ts:733](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L733)

Logs a custom styled message with optional prefix.
Supports arbitrary color combinations and custom prefixes.

#### Parameters

##### msg

`string`

Message to log

##### colors

`string`[] = `...`

Array of color names to apply (default: ['white'])

##### prefix

`string` = `'LOG'`

Custom prefix for the message (default: 'LOG')

#### Returns

`void`

#### Example

```typescript
logger.custom('Database connected', ['green', 'bold'], 'DB');
logger.custom('API rate limit warning', ['yellow', 'italic'], 'RATE');
```

***

### debug()

> **debug**(`message`, `meta?`): `void`

Defined in: [src/sync/SyncLogger.ts:451](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L451)

Logs a debug-level message synchronously.

#### Parameters

##### message

`string`

The debug message to log

##### meta?

`LogEntryMeta`

Optional metadata object

#### Returns

`void`

#### Remarks

Only outputs when verbose mode is enabled. Blocks until written.
Use for detailed diagnostic information during development.

#### Example

```typescript
logger.debug('Processing item', {
  index: i,
  value: item,
  timestamp: Date.now()
});
// Debug info guaranteed written before next operation
```

***

### error()

> **error**(`message`, `error?`, `meta?`): `void`

Defined in: [src/sync/SyncLogger.ts:388](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L388)

Logs an error-level message synchronously with optional Error object.

#### Parameters

##### message

`string`

The error message

##### error?

Error object or metadata

`Error` | `LogEntryMeta`

##### meta?

`LogEntryMeta`

Additional metadata if error is an Error

#### Returns

`void`

#### Remarks

Blocks until written. Automatically extracts stack traces from Error objects.
Critical for debugging as the error is guaranteed to be logged before continuing.

#### Example

```typescript
try {
  dangerousOperation();
} catch (err) {
  logger.error('Operation failed', err);
  // Error is guaranteed logged before cleanup
}
```

***

### flush()

> **flush**(): `void`

Defined in: [src/sync/SyncLogger.ts:576](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L576)

Forces an fsync to ensure all data is written to disk.

#### Returns

`void`

#### Remarks

Usually not needed as SyncLogger flushes after each write by default.
Use this if you disabled forceFlush in options but need to ensure
a critical log is persisted.

#### Example

```typescript
const logger = new SyncLogger({
  file: './app.log',
  forceFlush: false  // Disabled for performance
});

logger.info('Normal log');  // May be buffered by OS
logger.error('Critical error');
logger.flush();  // Force critical error to disk
```

***

### fmt()

> **fmt**(`strings`, ...`values`): `string`

Defined in: [src/sync/SyncLogger.ts:626](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L626)

Formats text using template literal syntax with embedded styles.

#### Parameters

##### strings

`TemplateStringsArray`

Template literal strings

##### values

...`unknown`[]

Interpolated values

#### Returns

`string`

The formatted string with styles applied

#### Remarks

Supports @-style tags for styling within template literals.
Processing is synchronous and returns formatted string immediately.

#### Example

```typescript
const msg = logger.fmt`@red{Error:} ${errorMessage} at @blue{${line}}`;
logger.info(msg);
// Formatted message guaranteed written
```

***

### getFilePath()

> **getFilePath**(): `undefined` \| `string`

Defined in: [src/sync/SyncLogger.ts:543](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L543)

Gets the current log file path.

#### Returns

`undefined` \| `string`

The path to the log file, or undefined if not using file output

#### Example

```typescript
const logger = new SyncLogger({ file: './app.log' });
console.log(logger.getFilePath()); // './app.log'
```

***

### getWriteCount()

> **getWriteCount**(): `number`

Defined in: [src/sync/SyncLogger.ts:550](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L550)

Gets the number of writes to the file (for debugging).

#### Returns

`number`

***

### group()

> **group**(`label`): `void`

Defined in: [src/sync/SyncLogger.ts:959](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L959)

Creates a log group (for API compatibility).

#### Parameters

##### label

`string`

Group label

#### Returns

`void`

***

### groupEnd()

> **groupEnd**(): `void`

Defined in: [src/sync/SyncLogger.ts:967](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L967)

Ends a log group (for API compatibility).

#### Returns

`void`

***

### header()

> **header**(`text`, `styles?`): `void`

Defined in: [src/sync/SyncLogger.ts:648](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L648)

Prints a formatted header with separators.

#### Parameters

##### text

`string`

The header text to display

##### styles?

`string`[]

Optional array of color names to apply

#### Returns

`void`

#### Remarks

Creates a visually distinct header with separator lines.
Output is written synchronously before method returns.

#### Example

```typescript
logger.header('Configuration', ['blue', 'bold']);
// Header guaranteed printed before next log
logger.info('Config loaded');
```

***

### info()

> **info**(`message`, `meta?`): `void`

Defined in: [src/sync/SyncLogger.ts:362](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L362)

Logs an info-level message synchronously.

#### Parameters

##### message

`string`

The message to log

##### meta?

`LogEntryMeta`

Optional metadata object

#### Returns

`void`

#### Remarks

Blocks until the message is written to all outputs.
Use for general informational messages.

#### Example

```typescript
logger.info('Server started', { port: 3000 });
// Execution pauses here until log is written
```

***

### list()

> **list**(`items`, `options`): `void`

Defined in: [src/sync/SyncLogger.ts:873](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L873)

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

### log()

> **log**(`message`, `level?`, `meta?`): `void`

Defined in: [src/sync/SyncLogger.ts:501](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L501)

Generic synchronous logging method with custom level.

#### Parameters

##### message

`string`

The message to log

##### level?

`string` = `'info'`

The severity level

##### meta?

`LogEntryMeta`

Optional metadata object

#### Returns

`void`

#### Remarks

Blocks until written. Allows specifying any valid log level.
Prefer using specific level methods (info, error, etc.) when possible.

#### Example

```typescript
logger.log('Custom message', 'trace', {
  module: 'auth',
  action: 'validate'
});
// Custom level log guaranteed written
```

***

### progressBar()

> **progressBar**(`percentage`, `width?`, `fillChar?`, `emptyChar?`): `void`

Defined in: [src/sync/SyncLogger.ts:710](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L710)

Displays a text-based progress bar.

#### Parameters

##### percentage

`number`

Progress percentage (0-100)

##### width?

`number` = `40`

Width of the progress bar in characters

##### fillChar?

`string` = `'█'`

Character for filled portion

##### emptyChar?

`string` = `'░'`

Character for empty portion

#### Returns

`void`

#### Remarks

Renders a visual progress indicator synchronously.
Useful for batch operations where each step must complete before continuing.

#### Example

```typescript
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i, 50);
  // Progress guaranteed displayed before next iteration
  processNextBatch();
}
```

***

### separator()

> **separator**(`char?`, `length?`): `void`

Defined in: [src/sync/SyncLogger.ts:684](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L684)

Prints a separator line.

#### Parameters

##### char?

`string` = `'-'`

Character to repeat for the separator

##### length?

`number` = `60`

Length of the separator line

#### Returns

`void`

#### Remarks

Creates visual separation between log sections.
Output is written synchronously.

#### Example

```typescript
logger.info('Phase 1 complete');
logger.separator('=', 80);
logger.info('Starting Phase 2');
// Separator guaranteed printed between phases
```

***

### styled()

> **styled**(`msg`, `preset`): `void`

Defined in: [src/sync/SyncLogger.ts:752](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L752)

Logs a message with a predefined style preset.

#### Parameters

##### msg

`string`

Message to log

##### preset

Style preset name

`"info"` | `"success"` | `"warning"` | `"error"` | `"debug"` | `"important"` | `"highlight"` | `"muted"` | `"special"` | `"code"` | `"header"`

#### Returns

`void`

#### Example

```typescript
logger.styled('Critical system failure', 'error');
logger.styled('Operation completed', 'success');
```

***

### success()

> **success**(`message`, `meta?`): `void`

Defined in: [src/sync/SyncLogger.ts:476](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L476)

Logs a success-level message synchronously.

#### Parameters

##### message

`string`

The success message to log

##### meta?

`LogEntryMeta`

Optional metadata object

#### Returns

`void`

#### Remarks

Blocks until written. Use to indicate successful completion
of operations. Typically displayed in green when colors enabled.

#### Example

```typescript
await database.connect();
logger.success('Database connected', {
  host: dbHost,
  port: dbPort
});
// Success guaranteed logged before proceeding
```

***

### table()

> **table**(`data`, `options`): `void`

Defined in: [src/sync/SyncLogger.ts:799](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L799)

Displays data in a formatted table.

#### Parameters

##### data

`Record`\<`string`, `unknown`\>[]

Array of objects to display

##### options

Table formatting options

###### alignment?

`"left"` \| `"right"` \| `"center"`

###### alternateRowColors?

`boolean`

###### border?

`"none"` \| `"single"` \| `"double"` \| `"rounded"` \| `"heavy"`

###### borderColor?

`string`[]

###### headerColor?

`string`[]

#### Returns

`void`

#### Example

```typescript
logger.table([
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'User' }
]);
```

***

### time()

> **time**(`label`): `void`

Defined in: [src/sync/SyncLogger.ts:903](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L903)

Starts a timer with the given label.

#### Parameters

##### label

`string`

Timer label

#### Returns

`void`

#### Example

```typescript
logger.time('operation');
// ... do work ...
logger.timeEnd('operation');
```

***

### timeEnd()

> **timeEnd**(`label`): `void`

Defined in: [src/sync/SyncLogger.ts:913](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L913)

Stops a timer and logs elapsed time.

#### Parameters

##### label

`string`

Timer label to stop

#### Returns

`void`

***

### warn()

> **warn**(`message`, `meta?`): `void`

Defined in: [src/sync/SyncLogger.ts:426](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/sync/SyncLogger.ts#L426)

Logs a warning-level message synchronously.

#### Parameters

##### message

`string`

The warning message

##### meta?

`LogEntryMeta`

Optional metadata

#### Returns

`void`

#### Remarks

Blocks until written. Use for potentially problematic situations
that don't prevent operation but should be addressed.

#### Example

```typescript
if (cacheSize > threshold) {
  logger.warn('Cache size exceeding threshold', {
    size: cacheSize,
    threshold
  });
  // Warning guaranteed logged before continuing
}
```
