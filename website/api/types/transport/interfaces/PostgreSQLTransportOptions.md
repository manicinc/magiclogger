# Interface: PostgreSQLTransportOptions

Defined in: [src/types/transport.ts:536](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L536)

PostgreSQL transport configuration options.

## Extends

- [`BatchingTransportOptions`](BatchingTransportOptions.md)

## Properties

### batchSize?

> `optional` **batchSize**: `number`

Defined in: [src/types/transport.ts:566](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L566)

Logical batch size override

***

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/types/transport.ts:300](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L300)

Compress batches before sending (gzip).

#### Default

```ts
false
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`compress`](BatchingTransportOptions.md#compress)

***

### connectionString?

> `optional` **connectionString**: `string`

Defined in: [src/types/transport.ts:538](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L538)

Full connection string, or provide discrete connection fields

***

### createTable?

> `optional` **createTable**: `boolean`

Defined in: [src/types/transport.ts:556](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L556)

Create table if it does not exist (default: true)

***

### database?

> `optional` **database**: `string`

Defined in: [src/types/transport.ts:544](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L544)

Database name

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`enabled`](BatchingTransportOptions.md#enabled)

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L234)

Tags that exclude logs from this transport.
Logs with any of these tags are skipped.

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`excludeTags`](BatchingTransportOptions.md#excludetags)

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`filter`](BatchingTransportOptions.md#filter)

***

### flushInterval?

> `optional` **flushInterval**: `number`

Defined in: [src/types/transport.ts:564](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L564)

Flush interval override for batching (ms)

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`format`](BatchingTransportOptions.md#format)

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`formatter`](BatchingTransportOptions.md#formatter)

***

### host?

> `optional` **host**: `string`

Defined in: [src/types/transport.ts:540](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L540)

Hostname of the PostgreSQL server

***

### immediate?

> `optional` **immediate**: `boolean`

Defined in: [src/types/transport.ts:294](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L294)

Whether to send logs immediately without batching.
Overrides other batch settings when true.

#### Default

```ts
false
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`immediate`](BatchingTransportOptions.md#immediate)

***

### indexes?

> `optional` **indexes**: `string`[]

Defined in: [src/types/transport.ts:560](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L560)

Columns to create indexes on

***

### jsonColumns?

> `optional` **jsonColumns**: `string`[]

Defined in: [src/types/transport.ts:558](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L558)

JSON/JSONB columns to store structured fields

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`level`](BatchingTransportOptions.md#level)

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L222)

Custom levels this transport should handle.
Allows fine-grained control over what gets logged where.

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`levels`](BatchingTransportOptions.md#levels)

***

### maxBatchBytes?

> `optional` **maxBatchBytes**: `number`

Defined in: [src/types/transport.ts:287](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L287)

Maximum size in bytes before sending a batch.

#### Default

```ts
1048576 (1MB)
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`maxBatchBytes`](BatchingTransportOptions.md#maxbatchbytes)

***

### maxBatchSize?

> `optional` **maxBatchSize**: `number`

Defined in: [src/types/transport.ts:275](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L275)

Maximum number of logs to batch before sending.

#### Default

```ts
100
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`maxBatchSize`](BatchingTransportOptions.md#maxbatchsize)

***

### maxBatchTime?

> `optional` **maxBatchTime**: `number`

Defined in: [src/types/transport.ts:281](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L281)

Maximum time to wait before sending a batch (milliseconds).

#### Default

```ts
5000 (5 seconds)
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`maxBatchTime`](BatchingTransportOptions.md#maxbatchtime)

***

### maxQueueSize?

> `optional` **maxQueueSize**: `number`

Defined in: [src/types/transport.ts:329](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L329)

Maximum queue size.

#### Default

```ts
10000
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`maxQueueSize`](BatchingTransportOptions.md#maxqueuesize)

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/transport.ts:311](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L311)

Maximum retry attempts for failed batches.

#### Default

```ts
3
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`maxRetries`](BatchingTransportOptions.md#maxretries)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`name`](BatchingTransportOptions.md#name)

***

### partitioning?

> `optional` **partitioning**: `object`

Defined in: [src/types/transport.ts:568](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L568)

Optional simple partitioning configuration

#### enabled

> **enabled**: `boolean`

#### interval

> **interval**: `"daily"` \| `"weekly"` \| `"monthly"`

#### retention

> **retention**: `number`

***

### password?

> `optional` **password**: `string`

Defined in: [src/types/transport.ts:548](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L548)

Password

***

### poolSize?

> `optional` **poolSize**: `number`

Defined in: [src/types/transport.ts:562](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L562)

Connection pool size

***

### port?

> `optional` **port**: `number`

Defined in: [src/types/transport.ts:542](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L542)

Port number

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [src/types/transport.ts:317](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L317)

Initial retry delay in milliseconds.

#### Default

```ts
1000
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`retryDelay`](BatchingTransportOptions.md#retrydelay)

***

### retryOnFailure?

> `optional` **retryOnFailure**: `boolean`

Defined in: [src/types/transport.ts:323](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L323)

Whether to retry on failure.

#### Default

```ts
true
```

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`retryOnFailure`](BatchingTransportOptions.md#retryonfailure)

***

### schema?

> `optional` **schema**: `string`

Defined in: [src/types/transport.ts:552](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L552)

Schema name (default: public)

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`silent`](BatchingTransportOptions.md#silent)

***

### ssl?

> `optional` **ssl**: `boolean`

Defined in: [src/types/transport.ts:550](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L550)

Enable SSL

***

### table?

> `optional` **table**: `string`

Defined in: [src/types/transport.ts:554](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L554)

Table name (default: logs)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L228)

Tags that must be present for this transport to handle a log.
If specified, only logs with at least one matching tag are processed.

#### Inherited from

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`tags`](BatchingTransportOptions.md#tags)

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

[`BatchingTransportOptions`](BatchingTransportOptions.md).[`timeout`](BatchingTransportOptions.md#timeout)

***

### user?

> `optional` **user**: `string`

Defined in: [src/types/transport.ts:546](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L546)

Username
