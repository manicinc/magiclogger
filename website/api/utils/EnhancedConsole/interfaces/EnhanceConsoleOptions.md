# Interface: EnhanceConsoleOptions

Defined in: [src/utils/EnhancedConsole.ts:12](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L12)

Options for enhancing the console

## Extends

- [`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md)

## Properties

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/logger.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L51)

Optional default context applied to all logs.
Can include environment metadata, user data, etc.
Individual log calls may override this.

#### Example

```ts
{ env: 'staging', region: 'us-east-1' }
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`context`](../../../types/logger/interfaces/LoggerOptions.md#context)

***

### fallbackToSync?

> `optional` **fallbackToSync**: `boolean`

Defined in: [src/types/logger.ts:255](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L255)

Fallback to synchronous logging when async buffers are full.
Only applies when mode is 'async' or 'balanced'.

#### Default

```ts
true
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`fallbackToSync`](../../../types/logger/interfaces/LoggerOptions.md#fallbacktosync)

***

### file?

> `optional` **file**: `string`

Defined in: [src/types/logger.ts:175](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L175)

File path for log output (SyncLogger only).
When provided, logs will be written to this file synchronously.

#### Example

```ts
'./audit.log'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`file`](../../../types/logger/interfaces/LoggerOptions.md#file)

***

### forceFlush?

> `optional` **forceFlush**: `boolean`

Defined in: [src/types/logger.ts:183](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L183)

Force flush to disk after each write (SyncLogger only).
Uses fsync to ensure data is written to disk.

#### Default

```ts
true
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`forceFlush`](../../../types/logger/interfaces/LoggerOptions.md#forceflush)

***

### id?

> `optional` **id**: `string`

Defined in: [src/types/logger.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L34)

Unique identifier for the logger instance.
Used for filtering logs across services or systems.

#### Example

```ts
'auth-service'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`id`](../../../types/logger/interfaces/LoggerOptions.md#id)

***

### idGenerator()?

> `optional` **idGenerator**: () => `string`

Defined in: [src/types/logger.ts:195](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L195)

Custom ID generator function for log entries.

#### Returns

`string`

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`idGenerator`](../../../types/logger/interfaces/LoggerOptions.md#idgenerator)

***

### level?

> `optional` **level**: `string`

Defined in: [src/types/logger.ts:60](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L60)

Minimum log level to output.
Messages below this level will be filtered out.

#### Example

```ts
'info' // Only info, warn, error, fatal will be logged
```

#### Default

```ts
'info'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`level`](../../../types/logger/interfaces/LoggerOptions.md#level)

***

### logDir?

> `optional` **logDir**: `string`

Defined in: [src/types/logger.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L97)

Directory to store log files in (Node only).

#### Default

```ts
'logs'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`logDir`](../../../types/logger/interfaces/LoggerOptions.md#logdir)

***

### logRetentionDays?

> `optional` **logRetentionDays**: `number`

Defined in: [src/types/logger.ts:104](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L104)

Number of days to retain log files before pruning (Node only).

#### Default

```ts
30
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`logRetentionDays`](../../../types/logger/interfaces/LoggerOptions.md#logretentiondays)

***

### maxStoredLogs?

> `optional` **maxStoredLogs**: `number`

Defined in: [src/types/logger.ts:151](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L151)

Maximum number of log entries to keep in browser storage.
Has no effect in Node.js environments.

#### Default

```ts
1000
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`maxStoredLogs`](../../../types/logger/interfaces/LoggerOptions.md#maxstoredlogs)

***

### mode?

> `optional` **mode**: `"sync"` \| `"async"` \| `"auto"` \| `"balanced"`

Defined in: [src/types/logger.ts:237](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L237)

Logger performance mode configuration.
- 'sync': Always synchronous (immediate output)
- 'async': Always asynchronous (uses internal AsyncLogger)
- 'auto': Smart detection based on environment
- 'balanced': Micro-async buffer with sync fallback

#### Default

```ts
'sync'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`mode`](../../../types/logger/interfaces/LoggerOptions.md#mode)

***

### performance?

> `optional` **performance**: `"features"` \| `"balanced"` \| `"speed"`

Defined in: [src/types/logger.ts:247](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L247)

Performance target hint for auto mode detection.
- 'features': Prioritize rich styling and features (sync)
- 'speed': Prioritize throughput (async)
- 'balanced': Balance between features and speed

#### Default

```ts
'balanced'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`performance`](../../../types/logger/interfaces/LoggerOptions.md#performance)

***

### performanceMode?

> `optional` **performanceMode**: `boolean`

Defined in: [src/types/logger.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L82)

Enable performance mode to disable styling for maximum throughput.
When enabled, all styling is bypassed for 3x+ performance improvement.

#### Default

```ts
false
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`performanceMode`](../../../types/logger/interfaces/LoggerOptions.md#performancemode)

***

### prettyPrint?

> `optional` **prettyPrint**: `"json"` \| `"inspect"`

Defined in: [src/types/logger.ts:215](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L215)

Pretty-printing mode for non-string variadic args.
'inspect' uses util.inspect in Node (with colors when enabled);
'json' uses JSON.stringify; default is 'inspect'.

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`prettyPrint`](../../../types/logger/interfaces/LoggerOptions.md#prettyprint)

***

### printMetaInDebug?

> `optional` **printMetaInDebug**: `boolean`

Defined in: [src/types/logger.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L222)

When true, and verbose mode is enabled, append a compact [meta] summary
of selected keys after the printed message. Meta remains structured for transports.
Default: false

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`printMetaInDebug`](../../../types/logger/interfaces/LoggerOptions.md#printmetaindebug)

***

### queueManager?

> `optional` **queueManager**: [`QueueManagerOptions`](../../../extensions/QueueManager/interfaces/QueueManagerOptions.md) \| [`QueueManager`](../../../extensions/QueueManager/classes/QueueManager.md)

Defined in: [src/types/logger.ts:317](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L317)

Queue management configuration for handling backpressure.
Can be a QueueManager instance or options to create one.

#### Example

```ts
// Using options
queueManager: { maxSize: 10000, dropPolicy: 'tail', highWaterMark: 0.8 }

// Using instance
queueManager: new QueueManager({ maxSize: 5000, dropPolicy: 'priority' })
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`queueManager`](../../../types/logger/interfaces/LoggerOptions.md#queuemanager)

***

### rateLimiter?

> `optional` **rateLimiter**: [`RateLimiterOptions`](../../../extensions/RateLimiter/interfaces/RateLimiterOptions.md) \| [`RateLimiter`](../../../extensions/RateLimiter/classes/RateLimiter.md)

Defined in: [src/types/logger.ts:272](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L272)

Rate limiting configuration for log throttling.
Can be a RateLimiter instance or options to create one.

#### Example

```ts
// Using options
rateLimiter: { max: 1000, window: 60000, strategy: 'sliding' }

// Using instance
rateLimiter: new RateLimiter({ max: 100, window: 10000 })
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`rateLimiter`](../../../types/logger/interfaces/LoggerOptions.md#ratelimiter)

***

### redactor?

> `optional` **redactor**: [`RedactorOptions`](../../../extensions/Redactor/interfaces/RedactorOptions.md) \| [`Redactor`](../../../extensions/Redactor/classes/Redactor.md)

Defined in: [src/types/logger.ts:287](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L287)

PII and sensitive data redaction configuration.
Can be a Redactor instance or options to create one.

#### Example

```ts
// Using preset
redactor: { preset: 'strict' }

// Using instance
redactor: new Redactor({ preset: 'paranoid', auditTrail: true })
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`redactor`](../../../types/logger/interfaces/LoggerOptions.md#redactor)

***

### restoreOnExit?

> `optional` **restoreOnExit**: `boolean`

Defined in: [src/utils/EnhancedConsole.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/utils/EnhancedConsole.ts#L13)

***

### sampler?

> `optional` **sampler**: [`SamplerOptions`](../../../extensions/Sampler/interfaces/SamplerOptions.md) \| [`Sampler`](../../../extensions/Sampler/classes/Sampler.md)

Defined in: [src/types/logger.ts:302](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L302)

Statistical sampling configuration for volume control.
Can be a Sampler instance or options to create one.

#### Example

```ts
// Using options
sampler: { rate: 0.1, strategy: 'adaptive', targetRate: 1000 }

// Using instance
sampler: createSamplerPreset('production')
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`sampler`](../../../types/logger/interfaces/LoggerOptions.md#sampler)

***

### storageName?

> `optional` **storageName**: `string`

Defined in: [src/types/logger.ts:159](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L159)

Name to use for browser storage (localStorage key or IndexedDB name).
Has no effect in Node.js environments.

#### Default

```ts
'magiclogger-logs'
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`storageName`](../../../types/logger/interfaces/LoggerOptions.md#storagename)

***

### storeInBrowser?

> `optional` **storeInBrowser**: `boolean`

Defined in: [src/types/logger.ts:143](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L143)

Whether to store logs in browser storage when in browser environment.
Has no effect in Node.js environments.

#### Default

```ts
false
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`storeInBrowser`](../../../types/logger/interfaces/LoggerOptions.md#storeinbrowser)

***

### strictLevels?

> `optional` **strictLevels**: `boolean`

Defined in: [src/types/logger.ts:113](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L113)

Enforces strict log level behavior.
If true, unknown levels passed to `.log()` will throw.
If false, unknown levels are treated as custom and passed to `.custom()`.

#### Default

```ts
false
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`strictLevels`](../../../types/logger/interfaces/LoggerOptions.md#strictlevels)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/logger.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L42)

Optional static tags applied to all logs from this logger.
Helps group or filter logs by functional or organizational tag.

#### Example

```ts
['api', 'auth']
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`tags`](../../../types/logger/interfaces/LoggerOptions.md#tags)

***

### theme?

> `optional` **theme**: `string` \| [`ThemeDefinition`](../../../types/theme/type-aliases/ThemeDefinition.md)

Defined in: [src/types/logger.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L126)

Theme used to style logger output.
Can be a string (theme name from ThemeManager) or a full object.

#### Examples

```ts
'dark'
```

```ts
{
   *   info: ['cyan', 'bold'],
   *   error: ['brightRed', 'bold'],
   *   header: ['brightWhite', 'bgBlue', 'bold']
   * }
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`theme`](../../../types/logger/interfaces/LoggerOptions.md#theme)

***

### themeByTag?

> `optional` **themeByTag**: `Record`\<`string`, `string`\>

Defined in: [src/types/logger.ts:135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L135)

Optional mapping of tags to theme names. When provided, if a logger has
any tag present in this map and no explicit theme is set, the mapped theme
will be auto-applied. This enables brand/company-specific themes via tags.

#### Example

```ts
{ acme: 'acme', contoso: 'contoso-dark' }
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`themeByTag`](../../../types/logger/interfaces/LoggerOptions.md#themebytag)

***

### transports?

> `optional` **transports**: [`Transport`](../../../types/transport/interfaces/Transport.md)[]

Defined in: [src/types/logger.ts:190](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L190)

Array of transports to use for logging.

#### Default

```ts
[]
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`transports`](../../../types/logger/interfaces/LoggerOptions.md#transports)

***

### useColors?

> `optional` **useColors**: `boolean`

Defined in: [src/types/logger.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L74)

Enables or disables terminal or console color output.

#### Default

```ts
true
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`useColors`](../../../types/logger/interfaces/LoggerOptions.md#usecolors)

***

### useConsole?

> `optional` **useConsole**: `boolean`

Defined in: [src/types/logger.ts:208](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L208)

Whether to use console transport by default.
Set to false to disable automatic console output.

#### Default

```ts
true
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`useConsole`](../../../types/logger/interfaces/LoggerOptions.md#useconsole)

***

### useDefaultTransports?

> `optional` **useDefaultTransports**: `boolean`

Defined in: [src/types/logger.ts:201](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L201)

Whether to automatically create default transports.

#### Default

```ts
false
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`useDefaultTransports`](../../../types/logger/interfaces/LoggerOptions.md#usedefaulttransports)

***

### useLocalStorage?

> `optional` **useLocalStorage**: `boolean`

Defined in: [src/types/logger.ts:167](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L167)

Whether to use localStorage (true) or IndexedDB (false) for browser storage.
Has no effect in Node.js environments.

#### Default

```ts
true
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`useLocalStorage`](../../../types/logger/interfaces/LoggerOptions.md#uselocalstorage)

***

### verbose?

> `optional` **verbose**: `boolean`

Defined in: [src/types/logger.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L67)

If enabled, debug-level logs will be shown.

#### Default

```ts
false
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`verbose`](../../../types/logger/interfaces/LoggerOptions.md#verbose)

***

### writeToDisk?

> `optional` **writeToDisk**: `boolean`

Defined in: [src/types/logger.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/logger.ts#L90)

Writes logs to disk in timestamped `.log` files (Node only).
Ignored in browsers.

#### Default

```ts
false
```

#### Inherited from

[`LoggerOptions`](../../../types/logger/interfaces/LoggerOptions.md).[`writeToDisk`](../../../types/logger/interfaces/LoggerOptions.md#writetodisk)
