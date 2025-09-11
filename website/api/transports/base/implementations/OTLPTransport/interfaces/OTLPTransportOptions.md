# Interface: OTLPTransportOptions

Defined in: [src/transports/base/implementations/OTLPTransport.ts:12](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L12)

OTLP (OpenTelemetry Protocol) Transport Options.

 OTLPTransportOptions

## Extends

- [`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md)

## Properties

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/types/transport.ts:300](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L300)

Compress batches before sending (gzip).

#### Default

```ts
false
```

#### Inherited from

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`compress`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#compress)

***

### compression?

> `optional` **compression**: `"none"` \| `"gzip"`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L61)

Compression to use.

#### Default

```ts
'gzip'
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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`enabled`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#enabled)

***

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L17)

OTLP endpoint URL.

#### Default

```ts
'http://localhost:4318'
```

***

### excludeTags?

> `optional` **excludeTags**: `string`[]

Defined in: [src/types/transport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L234)

Tags that exclude logs from this transport.
Logs with any of these tags are skipped.

#### Inherited from

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`excludeTags`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#excludetags)

***

### exportPath?

> `optional` **exportPath**: `string`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L55)

Export path for HTTP protocol.

#### Default

```ts
'/v1/logs'
```

***

### exportTimeout?

> `optional` **exportTimeout**: `number`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L67)

Timeout for export requests.

#### Default

```ts
10000
```

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`filter`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#filter)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`format`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#format)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`formatter`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#formatter)

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/transports/base/implementations/OTLPTransport.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L43)

Headers to include with requests.

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`immediate`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#immediate)

***

### includeTraceContext?

> `optional` **includeTraceContext**: `boolean`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L49)

Whether to include trace context automatically.

#### Default

```ts
true
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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`level`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#level)

***

### levels?

> `optional` **levels**: `string`[]

Defined in: [src/types/transport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L222)

Custom levels this transport should handle.
Allows fine-grained control over what gets logged where.

#### Inherited from

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`levels`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#levels)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`maxBatchBytes`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#maxbatchbytes)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`maxBatchSize`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#maxbatchsize)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`maxBatchTime`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#maxbatchtime)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`maxQueueSize`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#maxqueuesize)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`maxRetries`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#maxretries)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/transport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L202)

Unique name identifier for this transport instance.
Used for managing multiple transports.

#### Inherited from

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`name`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#name)

***

### protocol?

> `optional` **protocol**: `"http/protobuf"` \| `"http/json"` \| `"grpc"`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L23)

Protocol to use.

#### Default

```ts
'http/protobuf'
```

***

### resource?

> `optional` **resource**: `Record`\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [src/transports/base/implementations/OTLPTransport.ts:38](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L38)

Additional resource attributes.

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`retryDelay`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#retrydelay)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`retryOnFailure`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#retryonfailure)

***

### serviceName

> **serviceName**: `string`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:28](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L28)

Service name for resource attributes.

***

### serviceVersion?

> `optional` **serviceVersion**: `string`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L33)

Service version.

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`silent`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#silent)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/transport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L228)

Tags that must be present for this transport to handle a log.
If specified, only logs with at least one matching tag are processed.

#### Inherited from

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`tags`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#tags)

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

[`BatchingTransportOptions`](../../../../../types/transport/interfaces/BatchingTransportOptions.md).[`timeout`](../../../../../types/transport/interfaces/BatchingTransportOptions.md#timeout)

***

### tls?

> `optional` **tls**: `object`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L78)

TLS configuration.

#### ca?

> `optional` **ca**: `string`

#### cert?

> `optional` **cert**: `string`

#### key?

> `optional` **key**: `string`

#### rejectUnauthorized?

> `optional` **rejectUnauthorized**: `boolean`

***

### useTLS?

> `optional` **useTLS**: `boolean`

Defined in: [src/transports/base/implementations/OTLPTransport.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/OTLPTransport.ts#L73)

Whether to use TLS/SSL.

#### Default

```ts
false
```
