# Interface: HTTPTransportOptions

Defined in: [src/types/transport.ts:578](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L578)

HTTP transport specific options.

## Extends

- [`NetworkTransportOptions`](NetworkTransportOptions.md)

## Properties

### auth?

> `optional` **auth**: `object`

Defined in: [src/types/transport.ts:593](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L593)

Authentication configuration.

#### apiKey?

> `optional` **apiKey**: `string`

#### apiKeyHeader?

> `optional` **apiKeyHeader**: `string`

#### customAuth()?

> `optional` **customAuth**: () => `Promise`\<`Record`\<`string`, `string`\>\>

##### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

#### password?

> `optional` **password**: `string`

#### token?

> `optional` **token**: `string`

#### type

> **type**: `"basic"` \| `"custom"` \| `"bearer"` \| `"apikey"`

#### username?

> `optional` **username**: `string`

***

### bodyFormat?

> `optional` **bodyFormat**: `"json"` \| `"custom"` \| `"ndjson"` \| `"form"`

Defined in: [src/types/transport.ts:607](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L607)

Request body encoding.

#### Default

```ts
'json'
```

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

### circuitBreakerResetTimeout?

> `optional` **circuitBreakerResetTimeout**: `number`

Defined in: [src/types/transport.ts:648](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L648)

***

### circuitBreakerSuccessThreshold?

> `optional` **circuitBreakerSuccessThreshold**: `number`

Defined in: [src/types/transport.ts:649](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L649)

***

### circuitBreakerThreshold?

> `optional` **circuitBreakerThreshold**: `number`

Defined in: [src/types/transport.ts:647](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L647)

Circuit breaker specific thresholds for HTTP transport.

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

### followRedirects?

> `optional` **followRedirects**: `boolean`

Defined in: [src/types/transport.ts:623](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L623)

Whether to follow HTTP redirects.

#### Default

```ts
true
```

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

### maxFreeSockets?

> `optional` **maxFreeSockets**: `number`

Defined in: [src/types/transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L655)

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

### maxRedirects?

> `optional` **maxRedirects**: `number`

Defined in: [src/types/transport.ts:629](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L629)

Maximum number of redirects to follow.

#### Default

```ts
5
```

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

### maxSockets?

> `optional` **maxSockets**: `number`

Defined in: [src/types/transport.ts:654](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L654)

HTTP agent configuration.

***

### method?

> `optional` **method**: `"POST"` \| `"PUT"` \| `"PATCH"`

Defined in: [src/types/transport.ts:588](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L588)

HTTP method to use.

#### Default

```ts
'POST'
```

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

#### Inherited from

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`name`](NetworkTransportOptions.md#name)

***

### proxy?

> `optional` **proxy**: `object`

Defined in: [src/types/transport.ts:634](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L634)

Proxy configuration.

#### auth?

> `optional` **auth**: `object`

##### auth.password

> **password**: `string`

##### auth.username

> **username**: `string`

#### host

> **host**: `string`

#### port

> **port**: `number`

#### protocol?

> `optional` **protocol**: `string`

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

### transformRequest()?

> `optional` **transformRequest**: (`logs`) => `unknown`

Defined in: [src/types/transport.ts:612](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L612)

Custom request transformer.

#### Parameters

##### logs

[`LogEntry`](LogEntry.md)[]

#### Returns

`unknown`

***

### transformResponse()?

> `optional` **transformResponse**: (`response`) => `void`

Defined in: [src/types/transport.ts:617](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L617)

Custom response transformer.

#### Parameters

##### response

`unknown`

#### Returns

`void`

***

### url

> **url**: `string`

Defined in: [src/types/transport.ts:582](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L582)

Target URL endpoint for log delivery.

#### Overrides

[`NetworkTransportOptions`](NetworkTransportOptions.md).[`url`](NetworkTransportOptions.md#url)
