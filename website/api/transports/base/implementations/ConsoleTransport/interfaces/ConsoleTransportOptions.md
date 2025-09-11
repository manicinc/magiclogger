# Interface: ConsoleTransportOptions

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:10](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L10)

Console transport specific options.

## Extends

- [`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md)

## Properties

### colorize?

> `optional` **colorize**: `boolean`

Defined in: [src/types/transport.ts:740](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L740)

Whether to use colors in console output.

#### Default

```ts
true (when terminal supports it)
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`colorize`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#colorize)

***

### consoleMethods?

> `optional` **consoleMethods**: `Record`\<`string`, `"log"` \| `"info"` \| `"error"` \| `"debug"` \| `"warn"`\>

Defined in: [src/types/transport.ts:757](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L757)

Console method mapping for different log levels.

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`consoleMethods`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#consolemethods)

***

### debugStdout?

> `optional` **debugStdout**: `boolean`

Defined in: [src/types/transport.ts:752](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L752)

Whether to inspect objects deeply.

#### Default

```ts
false
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`debugStdout`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#debugstdout)

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/transport.ts:209](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L209)

Whether this transport is currently active.
Allows runtime enabling/disabling of transports.

#### Default

```ts
true
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`enabled`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#enabled)

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L234)

Tags that exclude logs from this transport.
Logs with any of these tags are skipped.

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`excludeTags`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#excludetags)

***

### filter()?

> `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/types/transport.ts:240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L240)

Custom filter function for advanced filtering logic.
Return true to process the log, false to skip.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`filter`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#filter)

***

### format?

> `optional` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/types/transport.ts:246](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L246)

Output format for this transport.

#### Default

```ts
'json'
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`format`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#format)

***

### formatter()?

> `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/types/transport.ts:252](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L252)

Custom formatter function.
Used when format is 'custom'.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`formatter`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#formatter)

***

### level?

> `optional` **level**: `string`

Defined in: [src/types/transport.ts:216](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L216)

Minimum log level this transport will handle.
Logs below this level are ignored by this transport.

#### Default

```ts
'info'
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`level`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#level)

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L222)

Custom levels this transport should handle.
Allows fine-grained control over what gets logged where.

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`levels`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#levels)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`name`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#name)

***

### prefix?

> `optional` **prefix**: `string`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L17)

***

### showLevel?

> `optional` **showLevel**: `boolean`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L13)

***

### showLoggerId?

> `optional` **showLoggerId**: `boolean`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:14](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L14)

***

### showMetadata?

> `optional` **showMetadata**: `boolean`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:16](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L16)

***

### showTags?

> `optional` **showTags**: `boolean`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:15](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L15)

***

### showTimestamp?

> `optional` **showTimestamp**: `boolean`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:12](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L12)

***

### silent?

> `optional` **silent**: `boolean`

Defined in: [src/types/transport.ts:258](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L258)

Whether to handle errors silently or propagate them.

#### Default

```ts
true
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`silent`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#silent)

***

### stderrLevels?

> `optional` **stderrLevels**: `boolean` \| `string`[]

Defined in: [src/types/transport.ts:746](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L746)

Whether to use stderr for error/warn levels.

#### Default

```ts
true
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`stderrLevels`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#stderrlevels)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L228)

Tags that must be present for this transport to handle a log.
If specified, only logs with at least one matching tag are processed.

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`tags`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#tags)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/transport.ts:264](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L264)

Timeout for transport operations in milliseconds.

#### Default

```ts
30000 (30 seconds)
```

#### Inherited from

[`ConsoleTransportOptions`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md).[`timeout`](../../../../../types/transport/interfaces/ConsoleTransportOptions.md#timeout)

***

### useColors?

> `optional` **useColors**: `boolean`

Defined in: [src/transports/base/implementations/ConsoleTransport.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/ConsoleTransport.ts#L19)
