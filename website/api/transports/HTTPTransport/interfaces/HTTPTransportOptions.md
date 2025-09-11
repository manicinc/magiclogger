# Interface: HTTPTransportOptions

Defined in: [src/transports/HTTPTransport.ts:27](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L27)

Configuration options for HTTPWorkerTransport.

 HTTPTransportOptions

## Properties

### batchSize?

> `optional` **batchSize**: `number`

Defined in: [src/transports/HTTPTransport.ts:69](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L69)

Number of logs to batch before sending.
Higher values reduce network overhead but increase latency.

#### Default

```ts
100
```

***

### circuitBreakerResetTimeout?

> `optional` **circuitBreakerResetTimeout**: `number`

Defined in: [src/transports/HTTPTransport.ts:124](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L124)

Circuit breaker reset timeout in milliseconds.
Time to wait before attempting to close circuit.

#### Default

```ts
60000
```

***

### circuitBreakerThreshold?

> `optional` **circuitBreakerThreshold**: `number`

Defined in: [src/transports/HTTPTransport.ts:117](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L117)

Circuit breaker threshold.
Opens circuit after this many consecutive failures.

#### Default

```ts
5
```

***

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/transports/HTTPTransport.ts:103](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L103)

Enable gzip compression for request body.
Reduces bandwidth but adds CPU overhead in worker.

#### Default

```ts
false
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/transports/HTTPTransport.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L38)

Whether the transport is enabled.

#### Default

```ts
true
```

***

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [src/transports/HTTPTransport.ts:44](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L44)

HTTP endpoint URL for log submission.

#### Example

```ts
'https://logs.example.com/api/logs'
```

***

### flushInterval?

> `optional` **flushInterval**: `number`

Defined in: [src/transports/HTTPTransport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L76)

Maximum time to wait before flushing batch (milliseconds).
Ensures logs are sent even if batch size isn't reached.

#### Default

```ts
5000
```

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/transports/HTTPTransport.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L62)

Custom HTTP headers.

#### Example

```ts
{ 'Authorization': 'Bearer token', 'X-API-Key': 'key' }
```

***

### maxBufferSize?

> `optional` **maxBufferSize**: `number`

Defined in: [src/transports/HTTPTransport.ts:110](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L110)

Maximum size of the internal buffer in worker.
Older entries are dropped when exceeded.

#### Default

```ts
10000
```

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/transports/HTTPTransport.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L83)

Maximum retries for failed requests.
Uses exponential backoff between retries.

#### Default

```ts
3
```

***

### method?

> `optional` **method**: `"POST"` \| `"PUT"` \| `"PATCH"`

Defined in: [src/transports/HTTPTransport.ts:56](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L56)

HTTP method to use.

#### Default

```ts
'POST'
```

***

### name?

> `optional` **name**: `string`

Defined in: [src/transports/HTTPTransport.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L32)

Transport name for identification.

#### Default

```ts
'http-worker'
```

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [src/transports/HTTPTransport.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L90)

Initial retry delay in milliseconds.
Doubles with each retry (exponential backoff).

#### Default

```ts
1000
```

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/transports/HTTPTransport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L96)

Request timeout in milliseconds.

#### Default

```ts
30000
```

***

### url?

> `optional` **url**: `string`

Defined in: [src/transports/HTTPTransport.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/HTTPTransport.ts#L50)

Alias for endpoint for backward compatibility.

#### Example

```ts
'https://logs.example.com/api/logs'
```
