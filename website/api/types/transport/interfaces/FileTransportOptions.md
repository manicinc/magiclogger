# Interface: FileTransportOptions

Defined in: [src/types/transport.ts:763](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L763)

File transport specific options.

## Extends

- [`TransportOptions`](TransportOptions.md)

## Properties

### append?

> `optional` **append**: `boolean`

Defined in: [src/types/transport.ts:803](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L803)

Whether to append to existing files.

#### Default

```ts
true
```

***

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/types/transport.ts:791](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L791)

Whether to compress archived files.

#### Default

```ts
false
```

***

### createDir?

> `optional` **createDir**: `boolean`

Defined in: [src/types/transport.ts:821](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L821)

Whether to create directories if they don't exist.

#### Default

```ts
true
```

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

[`TransportOptions`](TransportOptions.md).[`enabled`](TransportOptions.md#enabled)

***

### encoding?

> `optional` **encoding**: `BufferEncoding`

Defined in: [src/types/transport.ts:809](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L809)

File encoding.

#### Default

```ts
'utf8'
```

***

### eol?

> `optional` **eol**: `string`

Defined in: [src/types/transport.ts:832](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L832)

Line ending to use.

#### Default

```ts
'\n'
```

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L234)

Tags that exclude logs from this transport.
Logs with any of these tags are skipped.

#### Inherited from

[`TransportOptions`](TransportOptions.md).[`excludeTags`](TransportOptions.md#excludetags)

***

### filepath

> **filepath**: `string`

Defined in: [src/types/transport.ts:767](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L767)

Path to the log file.

***

### filter()?

> `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/types/transport.ts:240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L240)

Custom filter function for advanced filtering logic.
Return true to process the log, false to skip.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`boolean`

#### Inherited from

[`TransportOptions`](TransportOptions.md).[`filter`](TransportOptions.md#filter)

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

[`TransportOptions`](TransportOptions.md).[`format`](TransportOptions.md#format)

***

### formatter()?

> `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/types/transport.ts:252](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L252)

Custom formatter function.
Used when format is 'custom'.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Inherited from

[`TransportOptions`](TransportOptions.md).[`formatter`](TransportOptions.md#formatter)

***

### includeTimestamp?

> `optional` **includeTimestamp**: `boolean`

Defined in: [src/types/transport.ts:815](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L815)

Whether to include timestamp in log lines.

#### Default

```ts
true
```

***

### isDirectory?

> `optional` **isDirectory**: `boolean`

Defined in: [src/types/transport.ts:773](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L773)

Whether the filepath is a directory.

#### Default

```ts
false
```

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

[`TransportOptions`](TransportOptions.md).[`level`](TransportOptions.md#level)

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L222)

Custom levels this transport should handle.
Allows fine-grained control over what gets logged where.

#### Inherited from

[`TransportOptions`](TransportOptions.md).[`levels`](TransportOptions.md#levels)

***

### maxBatchSize?

> `optional` **maxBatchSize**: `number`

Defined in: [src/types/transport.ts:837](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L837)

Maximum batch size for batching.

***

### maxBatchTime?

> `optional` **maxBatchTime**: `number`

Defined in: [src/types/transport.ts:842](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L842)

Maximum batch time for batching.

***

### maxFiles?

> `optional` **maxFiles**: `number`

Defined in: [src/types/transport.ts:785](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L785)

Maximum number of files to keep.

#### Default

```ts
5
```

***

### maxFileSize?

> `optional` **maxFileSize**: `number`

Defined in: [src/types/transport.ts:779](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L779)

Maximum size of log file before rotation (in bytes).

#### Default

```ts
10485760 (10MB)
```

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

#### Inherited from

[`TransportOptions`](TransportOptions.md).[`name`](TransportOptions.md#name)

***

### retentionDays?

> `optional` **retentionDays**: `number`

Defined in: [src/types/transport.ts:826](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L826)

Number of days to retain log files.

***

### rotation?

> `optional` **rotation**: `"none"` \| `"daily"` \| `"hourly"` \| `"size"`

Defined in: [src/types/transport.ts:797](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L797)

Rotation strategy.

#### Default

```ts
'none'
```

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

[`TransportOptions`](TransportOptions.md).[`silent`](TransportOptions.md#silent)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L228)

Tags that must be present for this transport to handle a log.
If specified, only logs with at least one matching tag are processed.

#### Inherited from

[`TransportOptions`](TransportOptions.md).[`tags`](TransportOptions.md#tags)

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

[`TransportOptions`](TransportOptions.md).[`timeout`](TransportOptions.md#timeout)
