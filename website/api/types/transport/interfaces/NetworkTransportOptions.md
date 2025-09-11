# Interface: NetworkTransportOptions

Defined in: [src/types/transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L436)

Options for network-based transports (HTTP, S3, etc).

## Extends

- [`BatchingTransportOptions`](BatchingTransportOptions.md)

## Extended by

- [`HTTPTransportOptions`](HTTPTransportOptions.md)
- [`S3TransportOptions`](S3TransportOptions.md)
- [`MongoDBTransportOptions`](MongoDBTransportOptions.md)

## Properties

### circuitBreaker?

> `optional` **circuitBreaker**: `object`

Defined in: [src/types/transport.ts:490](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L490)

Circuit breaker configuration.

#### enabled

> **enabled**: `boolean`

#### errorThreshold?

> `optional` **errorThreshold**: `number`

#### resetTimeout?

> `optional` **resetTimeout**: `number`

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

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: [src/types/transport.ts:445](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L445)

Connection timeout in milliseconds.

***

### dlq?

> `optional` **dlq**: `object`

Defined in: [src/types/transport.ts:510](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L510)

Dead letter queue configuration for failed logs.

#### enabled

> **enabled**: `boolean`

#### filepath?

> `optional` **filepath**: `string`

#### maxAge?

> `optional` **maxAge**: `number`

#### maxSize?

> `optional` **maxSize**: `number`

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

### fallback?

> `optional` **fallback**: `string` \| [`Transport`](Transport.md)

Defined in: [src/types/transport.ts:505](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L505)

Fallback transport to use when this transport fails.
Can be 'file', 'console', or a Transport instance.

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

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/types/transport.ts:520](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L520)

Request headers to include with all requests.

***

### healthCheckInterval?

> `optional` **healthCheckInterval**: `number`

Defined in: [src/types/transport.ts:480](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L480)

Health check interval in milliseconds.

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

### keepAliveInterval?

> `optional` **keepAliveInterval**: `number`

Defined in: [src/types/transport.ts:485](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L485)

Keep-alive interval in milliseconds.

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

### maxOfflineQueueSize?

> `optional` **maxOfflineQueueSize**: `number`

Defined in: [src/types/transport.ts:470](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L470)

Maximum offline queue size.

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

### maxReconnectAttempts?

> `optional` **maxReconnectAttempts**: `number`

Defined in: [src/types/transport.ts:455](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L455)

Maximum reconnection attempts.

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

### queueWhenOffline?

> `optional` **queueWhenOffline**: `boolean`

Defined in: [src/types/transport.ts:475](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L475)

Whether to queue logs when offline.

***

### reconnectBackoff?

> `optional` **reconnectBackoff**: `boolean`

Defined in: [src/types/transport.ts:465](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L465)

Whether to use exponential backoff for reconnects.

***

### reconnectDelay?

> `optional` **reconnectDelay**: `number`

Defined in: [src/types/transport.ts:460](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L460)

Delay between reconnection attempts.

***

### requestTimeout?

> `optional` **requestTimeout**: `number`

Defined in: [src/types/transport.ts:450](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L450)

Request timeout in milliseconds.

***

### retry?

> `optional` **retry**: [`RetryOptions`](RetryOptions.md)

Defined in: [src/types/transport.ts:499](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L499)

Retry configuration for failed requests.

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

### tls?

> `optional` **tls**: `object`

Defined in: [src/types/transport.ts:525](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L525)

TLS/SSL options for HTTPS connections.

#### ca?

> `optional` **ca**: `string`

#### cert?

> `optional` **cert**: `string`

#### key?

> `optional` **key**: `string`

#### rejectUnauthorized?

> `optional` **rejectUnauthorized**: `boolean`

***

### url?

> `optional` **url**: `string`

Defined in: [src/types/transport.ts:440](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L440)

Network endpoint URL.
