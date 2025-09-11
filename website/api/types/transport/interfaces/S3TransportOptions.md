# Interface: S3TransportOptions

Defined in: [src/types/transport.ts:661](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L661)

S3 transport specific options.

## Extends

- [`NetworkTransportOptions`](NetworkTransportOptions.md)

## Properties

### bucket

> **bucket**: `string`

Defined in: [src/types/transport.ts:665](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L665)

S3 bucket name.

***

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

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`circuitBreaker`](NetworkTransportOptions.md#circuitbreaker)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`compress`](NetworkTransportOptions.md#compress)

***

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: [src/types/transport.ts:445](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L445)

Connection timeout in milliseconds.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`connectionTimeout`](NetworkTransportOptions.md#connectiontimeout)

***

### credentials?

> `optional` **credentials**: `object`

Defined in: [src/types/transport.ts:683](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L683)

AWS credentials.
If not provided, uses default credential chain.

#### accessKeyId?

> `optional` **accessKeyId**: `string`

#### secretAccessKey?

> `optional` **secretAccessKey**: `string`

#### sessionToken?

> `optional` **sessionToken**: `string`

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

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`dlq`](NetworkTransportOptions.md#dlq)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`enabled`](NetworkTransportOptions.md#enabled)

***

### encryption?

> `optional` **encryption**: `object`

Defined in: [src/types/transport.ts:704](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L704)

Server-side encryption settings.

#### kmsKeyId?

> `optional` **kmsKeyId**: `string`

#### type

> **type**: `"AES256"` \| `"KMS"`

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L234)

Tags that exclude logs from this transport.
Logs with any of these tags are skipped.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`excludeTags`](NetworkTransportOptions.md#excludetags)

***

### fallback?

> `optional` **fallback**: `string` \| [`Transport`](Transport.md)

Defined in: [src/types/transport.ts:505](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L505)

Fallback transport to use when this transport fails.
Can be 'file', 'console', or a Transport instance.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`fallback`](NetworkTransportOptions.md#fallback)

***

### fileFormat?

> `optional` **fileFormat**: `"json"` \| `"jsonl"` \| `"csv"` \| `"parquet"`

Defined in: [src/types/transport.ts:724](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L724)

File format for S3 objects.

#### Default

```ts
'jsonl'
```

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`filter`](NetworkTransportOptions.md#filter)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`format`](NetworkTransportOptions.md#format)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`formatter`](NetworkTransportOptions.md#formatter)

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/types/transport.ts:520](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L520)

Request headers to include with all requests.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`headers`](NetworkTransportOptions.md#headers)

***

### healthCheckInterval?

> `optional` **healthCheckInterval**: `number`

Defined in: [src/types/transport.ts:480](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L480)

Health check interval in milliseconds.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`healthCheckInterval`](NetworkTransportOptions.md#healthcheckinterval)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`immediate`](NetworkTransportOptions.md#immediate)

***

### keepAliveInterval?

> `optional` **keepAliveInterval**: `number`

Defined in: [src/types/transport.ts:485](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L485)

Keep-alive interval in milliseconds.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`keepAliveInterval`](NetworkTransportOptions.md#keepaliveinterval)

***

### keyGenerator()?

> `optional` **keyGenerator**: (`logs`) => `string`

Defined in: [src/types/transport.ts:718](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L718)

Custom key generator function.

#### Parameters

##### logs

[`LogEntry`](LogEntry.md)[]

#### Returns

`string`

***

### keyStrategy?

> `optional` **keyStrategy**: `"custom"` \| `"timestamp"` \| `"date-hierarchy"` \| `"hourly"`

Defined in: [src/types/transport.ts:713](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L713)

Key naming strategy.

#### Default

```ts
'timestamp'
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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`level`](NetworkTransportOptions.md#level)

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L222)

Custom levels this transport should handle.
Allows fine-grained control over what gets logged where.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`levels`](NetworkTransportOptions.md#levels)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxBatchBytes`](NetworkTransportOptions.md#maxbatchbytes)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxBatchSize`](NetworkTransportOptions.md#maxbatchsize)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxBatchTime`](NetworkTransportOptions.md#maxbatchtime)

***

### maxOfflineQueueSize?

> `optional` **maxOfflineQueueSize**: `number`

Defined in: [src/types/transport.ts:470](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L470)

Maximum offline queue size.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxOfflineQueueSize`](NetworkTransportOptions.md#maxofflinequeuesize)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxQueueSize`](NetworkTransportOptions.md#maxqueuesize)

***

### maxReconnectAttempts?

> `optional` **maxReconnectAttempts**: `number`

Defined in: [src/types/transport.ts:455](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L455)

Maximum reconnection attempts.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxReconnectAttempts`](NetworkTransportOptions.md#maxreconnectattempts)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`maxRetries`](NetworkTransportOptions.md#maxretries)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`name`](NetworkTransportOptions.md#name)

***

### objectTags?

> `optional` **objectTags**: `Record`\<`string`, `string`\>

Defined in: [src/types/transport.ts:729](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L729)

Tags to apply to S3 objects.

***

### prefix?

> `optional` **prefix**: `string`

Defined in: [src/types/transport.ts:671](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L671)

S3 key prefix for log files.

#### Default

```ts
'logs/'
```

***

### queueWhenOffline?

> `optional` **queueWhenOffline**: `boolean`

Defined in: [src/types/transport.ts:475](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L475)

Whether to queue logs when offline.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`queueWhenOffline`](NetworkTransportOptions.md#queuewhenoffline)

***

### reconnectBackoff?

> `optional` **reconnectBackoff**: `boolean`

Defined in: [src/types/transport.ts:465](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L465)

Whether to use exponential backoff for reconnects.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`reconnectBackoff`](NetworkTransportOptions.md#reconnectbackoff)

***

### reconnectDelay?

> `optional` **reconnectDelay**: `number`

Defined in: [src/types/transport.ts:460](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L460)

Delay between reconnection attempts.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`reconnectDelay`](NetworkTransportOptions.md#reconnectdelay)

***

### region?

> `optional` **region**: `string`

Defined in: [src/types/transport.ts:677](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L677)

AWS region.

#### Default

```ts
'us-east-1'
```

***

### requestTimeout?

> `optional` **requestTimeout**: `number`

Defined in: [src/types/transport.ts:450](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L450)

Request timeout in milliseconds.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`requestTimeout`](NetworkTransportOptions.md#requesttimeout)

***

### retry?

> `optional` **retry**: [`RetryOptions`](RetryOptions.md)

Defined in: [src/types/transport.ts:499](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L499)

Retry configuration for failed requests.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`retry`](NetworkTransportOptions.md#retry)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`retryDelay`](NetworkTransportOptions.md#retrydelay)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`retryOnFailure`](NetworkTransportOptions.md#retryonfailure)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`silent`](NetworkTransportOptions.md#silent)

***

### storageClass?

> `optional` **storageClass**: `"STANDARD"` \| `"STANDARD_IA"` \| `"ONEZONE_IA"` \| `"INTELLIGENT_TIERING"` \| `"GLACIER"` \| `"DEEP_ARCHIVE"`

Defined in: [src/types/transport.ts:693](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L693)

S3 storage class.

#### Default

```ts
'STANDARD'
```

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L228)

Tags that must be present for this transport to handle a log.
If specified, only logs with at least one matching tag are processed.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`tags`](NetworkTransportOptions.md#tags)

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

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`timeout`](NetworkTransportOptions.md#timeout)

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

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`tls`](NetworkTransportOptions.md#tls)

***

### url?

> `optional` **url**: `string`

Defined in: [src/types/transport.ts:440](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L440)

Network endpoint URL.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`url`](NetworkTransportOptions.md#url)
