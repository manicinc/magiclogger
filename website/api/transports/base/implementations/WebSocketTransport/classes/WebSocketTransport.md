# Class: WebSocketTransport

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:63](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L63)

WebSocket transport for real-time log streaming.

Features:
- Automatic reconnection with exponential backoff
- Message queuing during disconnections
- Binary protocol support (JSON, MessagePack, Protobuf)
- Heartbeat/ping-pong for connection health
- Authentication support
- Compression support
- Real-time bidirectional communication

 WebSocketTransport

## Example

```typescript
const wsTransport = new WebSocketTransport({
  name: 'websocket',
  url: 'wss://logs.example.com/stream',
  reconnect: {
    enabled: true,
    maxAttempts: 10,
    delay: 1000
  },
  auth: {
    token: process.env.WS_AUTH_TOKEN
  }
});
```

## Extends

- [`NetworkTransport`](../../../classes/NetworkTransport.md)

## Constructors

### Constructor

> **new WebSocketTransport**(`options`): `WebSocketTransport`

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:178](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L178)

Creates a new WebSocketTransport instance.

#### Parameters

##### options

[`WebSocketTransportOptions`](../../../../../types/transport/interfaces/WebSocketTransportOptions.md)

Transport configuration

#### Returns

`WebSocketTransport`

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`constructor`](../../../classes/NetworkTransport.md#constructor)

## Properties

### circuitBreaker?

> `protected` `readonly` `optional` **circuitBreaker**: `object`

Defined in: [src/transports/base/NetworkTransport.ts:142](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L142)

Circuit breaker configuration.

#### enabled

> **enabled**: `boolean`

#### errorThreshold?

> `optional` **errorThreshold**: `number`

#### resetTimeout?

> `optional` **resetTimeout**: `number`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`circuitBreaker`](../../../classes/NetworkTransport.md#circuitbreaker)

***

### circuitBreakerOpen

> `protected` **circuitBreakerOpen**: `boolean` = `false`

Defined in: [src/transports/base/NetworkTransport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L234)

Circuit breaker open state.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`circuitBreakerOpen`](../../../classes/NetworkTransport.md#circuitbreakeropen)

***

### circuitBreakerOpenUntil

> `protected` **circuitBreakerOpenUntil**: `number` = `0`

Defined in: [src/transports/base/NetworkTransport.ts:240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L240)

Circuit breaker open until timestamp.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`circuitBreakerOpenUntil`](../../../classes/NetworkTransport.md#circuitbreakeropenuntil)

***

### circuitBreakerState

> `protected` **circuitBreakerState**: `object`

Defined in: [src/transports/base/NetworkTransport.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L202)

Circuit breaker state.

#### failures

> **failures**: `number`

#### isOpen

> **isOpen**: `boolean`

#### lastFailureTime?

> `optional` **lastFailureTime**: `number`

#### nextRetryTime?

> `optional` **nextRetryTime**: `number`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`circuitBreakerState`](../../../classes/NetworkTransport.md#circuitbreakerstate)

***

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L156)

Flag to track if transport is currently closing.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`closing`](../../../classes/NetworkTransport.md#closing)

***

### connectionState

> `protected` **connectionState**: [`ConnectionState`](../../../../../types/transport/type-aliases/ConnectionState.md) = `'disconnected'`

Defined in: [src/transports/base/NetworkTransport.ts:166](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L166)

Current connection state.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`connectionState`](../../../classes/NetworkTransport.md#connectionstate)

***

### connectionTimeout

> `protected` `readonly` **connectionTimeout**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L76)

Connection timeout in milliseconds.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`connectionTimeout`](../../../classes/NetworkTransport.md#connectiontimeout)

***

### consecutiveFailures

> `protected` **consecutiveFailures**: `number` = `0`

Defined in: [src/transports/base/NetworkTransport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L228)

Consecutive failure count.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`consecutiveFailures`](../../../classes/NetworkTransport.md#consecutivefailures)

***

### dlq?

> `protected` `readonly` `optional` **dlq**: `object`

Defined in: [src/transports/base/NetworkTransport.ts:154](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L154)

Dead letter queue configuration.

#### enabled

> **enabled**: `boolean`

#### filepath?

> `optional` **filepath**: `string`

#### maxAge?

> `optional` **maxAge**: `number`

#### maxSize?

> `optional` **maxSize**: `number`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`dlq`](../../../classes/NetworkTransport.md#dlq)

***

### dlqFileManager?

> `protected` `optional` **dlqFileManager**: `unknown`

Defined in: [src/transports/base/NetworkTransport.ts:216](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L216)

Dead letter queue file manager.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`dlqFileManager`](../../../classes/NetworkTransport.md#dlqfilemanager)

***

### enabled

> **enabled**: `boolean`

Defined in: [src/transports/base/Transport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L70)

Whether this transport is currently active and processing logs.
Can be toggled at runtime to enable/disable specific transports.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`enabled`](../../../classes/NetworkTransport.md#enabled)

***

### excludeTags?

> `protected` `readonly` `optional` **excludeTags**: `string`[]

Defined in: [src/transports/base/Transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L114)

Tags that exclude logs from being processed.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`excludeTags`](../../../classes/NetworkTransport.md#excludetags)

***

### fallbackConfig?

> `protected` `readonly` `optional` **fallbackConfig**: `string` \| [`Transport`](../../../../../types/transport/interfaces/Transport.md)

Defined in: [src/transports/base/NetworkTransport.ts:160](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L160)

Fallback transport configuration.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`fallbackConfig`](../../../classes/NetworkTransport.md#fallbackconfig)

***

### fallbackTransport?

> `protected` `optional` **fallbackTransport**: [`Transport`](../../../../../types/transport/interfaces/Transport.md)

Defined in: [src/transports/base/NetworkTransport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L222)

Fallback transport instance.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`fallbackTransport`](../../../classes/NetworkTransport.md#fallbacktransport)

***

### filter()?

> `protected` `readonly` `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/transports/base/Transport.ts:120](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L120)

Custom filter function for advanced filtering.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`filter`](../../../classes/NetworkTransport.md#filter)

***

### format

> `protected` `readonly` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/transports/base/Transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L138)

Output format for this transport.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`format`](../../../classes/NetworkTransport.md#format)

***

### formatter()?

> `protected` `readonly` `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:144](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L144)

Custom formatter function.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`formatter`](../../../classes/NetworkTransport.md#formatter)

***

### headers?

> `protected` `readonly` `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/transports/base/NetworkTransport.ts:130](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L130)

Custom headers for requests.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`headers`](../../../classes/NetworkTransport.md#headers)

***

### healthCheckInterval

> `protected` `readonly` **healthCheckInterval**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:118](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L118)

Health check interval in milliseconds.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`healthCheckInterval`](../../../classes/NetworkTransport.md#healthcheckinterval)

***

### healthCheckTimer?

> `protected` `optional` **healthCheckTimer**: `Timeout`

Defined in: [src/transports/base/NetworkTransport.ts:184](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L184)

Health check timer.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`healthCheckTimer`](../../../classes/NetworkTransport.md#healthchecktimer)

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L150)

Flag to track if transport has been initialized.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`initialized`](../../../classes/NetworkTransport.md#initialized)

***

### keepAliveInterval?

> `protected` `readonly` `optional` **keepAliveInterval**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:124](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L124)

Keep-alive interval in milliseconds.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`keepAliveInterval`](../../../classes/NetworkTransport.md#keepaliveinterval)

***

### keepAliveTimer?

> `protected` `optional` **keepAliveTimer**: `Timeout`

Defined in: [src/transports/base/NetworkTransport.ts:190](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L190)

Keep-alive timer.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`keepAliveTimer`](../../../classes/NetworkTransport.md#keepalivetimer)

***

### level

> `protected` `readonly` **level**: `string`

Defined in: [src/transports/base/Transport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L96)

Minimum log level for this transport.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`level`](../../../classes/NetworkTransport.md#level)

***

### levels?

> `protected` `readonly` `optional` **levels**: `string`[]

Defined in: [src/transports/base/Transport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L102)

Specific levels this transport handles (if specified).

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`levels`](../../../classes/NetworkTransport.md#levels)

***

### maxBatchBytes

> `protected` `readonly` **maxBatchBytes**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L55)

Maximum size in bytes per batch.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxBatchBytes`](../../../classes/NetworkTransport.md#maxbatchbytes)

***

### maxBatchSize

> `protected` `readonly` **maxBatchSize**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L43)

Maximum number of entries per batch.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxBatchSize`](../../../classes/NetworkTransport.md#maxbatchsize)

***

### maxBatchTime

> `protected` `readonly` **maxBatchTime**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L49)

Maximum time to wait before sending a batch (ms).

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxBatchTime`](../../../classes/NetworkTransport.md#maxbatchtime)

***

### maxOfflineQueueSize

> `protected` `readonly` **maxOfflineQueueSize**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L106)

Maximum offline queue size.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxOfflineQueueSize`](../../../classes/NetworkTransport.md#maxofflinequeuesize)

***

### maxQueueSize

> `protected` `readonly` **maxQueueSize**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L79)

Maximum queue size.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxQueueSize`](../../../classes/NetworkTransport.md#maxqueuesize)

***

### maxReconnectAttempts

> `protected` `readonly` **maxReconnectAttempts**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:88](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L88)

Maximum reconnection attempts.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxReconnectAttempts`](../../../classes/NetworkTransport.md#maxreconnectattempts)

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L61)

Maximum retry attempts for failed batches.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`maxRetries`](../../../classes/NetworkTransport.md#maxretries)

***

### name

> `readonly` **name**: `string`

Defined in: [src/transports/base/Transport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L64)

Unique identifier for this transport instance.
Used for managing multiple transports and debugging.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`name`](../../../classes/NetworkTransport.md#name)

***

### offlineQueue

> `protected` **offlineQueue**: [`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)[] = `[]`

Defined in: [src/transports/base/NetworkTransport.ts:172](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L172)

Offline queue for storing logs when disconnected.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`offlineQueue`](../../../classes/NetworkTransport.md#offlinequeue)

***

### options

> `protected` `readonly` **options**: [`TransportOptions`](../../../../../types/transport/interfaces/TransportOptions.md)

Defined in: [src/transports/base/Transport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L76)

Transport configuration options.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`options`](../../../classes/NetworkTransport.md#options)

***

### queueWhenOffline

> `protected` `readonly` **queueWhenOffline**: `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:112](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L112)

Whether to queue logs when offline.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`queueWhenOffline`](../../../classes/NetworkTransport.md#queuewhenoffline)

***

### reconnectAttempts

> `protected` **reconnectAttempts**: `number` = `0`

Defined in: [src/transports/base/NetworkTransport.ts:178](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L178)

Current reconnection attempt count.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`reconnectAttempts`](../../../classes/NetworkTransport.md#reconnectattempts)

***

### reconnectBackoff

> `protected` `readonly` **reconnectBackoff**: `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:100](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L100)

Whether to use exponential backoff for reconnects.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`reconnectBackoff`](../../../classes/NetworkTransport.md#reconnectbackoff)

***

### reconnectDelay

> `protected` `readonly` **reconnectDelay**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L94)

Delay between reconnection attempts.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`reconnectDelay`](../../../classes/NetworkTransport.md#reconnectdelay)

***

### reconnectTimer?

> `protected` `optional` **reconnectTimer**: `Timeout`

Defined in: [src/transports/base/NetworkTransport.ts:196](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L196)

Connection retry timer.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`reconnectTimer`](../../../classes/NetworkTransport.md#reconnecttimer)

***

### requestTimeout

> `protected` `readonly` **requestTimeout**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L82)

Request timeout in milliseconds.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`requestTimeout`](../../../classes/NetworkTransport.md#requesttimeout)

***

### retry

> `protected` `readonly` **retry**: [`RetryOptions`](../../../../../types/transport/interfaces/RetryOptions.md)

Defined in: [src/transports/base/NetworkTransport.ts:148](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L148)

Retry options.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`retry`](../../../classes/NetworkTransport.md#retry)

***

### retryDelay

> `protected` `readonly` **retryDelay**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L67)

Initial retry delay in milliseconds.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`retryDelay`](../../../classes/NetworkTransport.md#retrydelay)

***

### retryOnFailure

> `protected` `readonly` **retryOnFailure**: `boolean`

Defined in: [src/transports/base/BatchingTransport.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L73)

Whether to retry on failure.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`retryOnFailure`](../../../classes/NetworkTransport.md#retryonfailure)

***

### silent

> `protected` `readonly` **silent**: `boolean`

Defined in: [src/transports/base/Transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L126)

Whether to suppress errors from this transport.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`silent`](../../../classes/NetworkTransport.md#silent)

***

### stats

> `protected` **stats**: [`TransportStats`](../../../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L82)

Statistics tracking for this transport.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`stats`](../../../classes/NetworkTransport.md#stats)

***

### tags?

> `protected` `readonly` `optional` **tags**: `string`[]

Defined in: [src/transports/base/Transport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L108)

Tags that must be present for logs to be processed.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`tags`](../../../classes/NetworkTransport.md#tags)

***

### timeout

> `protected` `readonly` **timeout**: `number`

Defined in: [src/transports/base/Transport.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L132)

Operation timeout in milliseconds.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`timeout`](../../../classes/NetworkTransport.md#timeout)

***

### tls?

> `protected` `readonly` `optional` **tls**: `object`

Defined in: [src/transports/base/NetworkTransport.ts:136](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L136)

TLS/SSL configuration.

#### ca?

> `optional` **ca**: `string`

#### cert?

> `optional` **cert**: `string`

#### key?

> `optional` **key**: `string`

#### rejectUnauthorized?

> `optional` **rejectUnauthorized**: `boolean`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`tls`](../../../classes/NetworkTransport.md#tls)

***

### url?

> `protected` `optional` **url**: `string`

Defined in: [src/transports/base/NetworkTransport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L70)

Network endpoint URL.

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`url`](../../../classes/NetworkTransport.md#url)

## Accessors

### lastHeartbeat

#### Get Signature

> **get** **lastHeartbeat**(): `number`

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L131)

Expose lastHeartbeat via accessor so tests mutating the property directly
Tests may coerce the instance to unknown and set lastHeartbeat directly to simulate inactivity
without needing the interval to fire (their fake timers start AFTER init).

##### Returns

`number`

#### Set Signature

> **set** **lastHeartbeat**(`value`): `void`

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:134](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L134)

##### Parameters

###### value

`number`

##### Returns

`void`

## Methods

### buildHeaders()

> `protected` **buildHeaders**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [src/transports/base/NetworkTransport.ts:951](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L951)

Build request headers.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

Headers object

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`buildHeaders`](../../../classes/NetworkTransport.md#buildheaders)

***

### calculateRetryDelay()

> `protected` **calculateRetryDelay**(`retryCount`): `number`

Defined in: [src/transports/base/NetworkTransport.ts:926](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L926)

Calculate retry delay with exponential backoff.

#### Parameters

##### retryCount

`number`

Current retry count

#### Returns

`number`

Delay in milliseconds

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`calculateRetryDelay`](../../../classes/NetworkTransport.md#calculateretrydelay)

***

### checkHealth()

> `protected` **checkHealth**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:584](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L584)

Check WebSocket connection health.

#### Returns

`Promise`\<`void`\>

Resolves if healthy

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`checkHealth`](../../../classes/NetworkTransport.md#checkhealth)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1183](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1183)

Close the transport and ensure network-specific resources are cleaned up.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`close`](../../../classes/NetworkTransport.md#close)

***

### closeNetwork()

> `protected` **closeNetwork**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:886](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L886)

Close network connection.

#### Returns

`Promise`\<`void`\>

Resolves when closed

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`closeNetwork`](../../../classes/NetworkTransport.md#closenetwork)

***

### connect()

> `protected` **connect**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:258](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L258)

Connect to WebSocket server.

#### Returns

`Promise`\<`void`\>

Resolves when connected

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`connect`](../../../classes/NetworkTransport.md#connect)

***

### defaultRetryCondition()

> `protected` **defaultRetryCondition**(`error`): `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:864](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L864)

Default retry condition.

#### Parameters

##### error

`Error`

Error to check

#### Returns

`boolean`

True if retryable

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`defaultRetryCondition`](../../../classes/NetworkTransport.md#defaultretrycondition)

***

### disable()

> **disable**(): `void`

Defined in: [src/transports/base/Transport.ts:627](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L627)

Disable the transport.

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`disable`](../../../classes/NetworkTransport.md#disable)

***

### disconnect()

> `protected` **disconnect**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:519](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L519)

Disconnect from WebSocket server.

#### Returns

`Promise`\<`void`\>

Resolves when disconnected

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`disconnect`](../../../classes/NetworkTransport.md#disconnect)

***

### doClose()

> `protected` **doClose**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1044](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1044)

Close network transport.

#### Returns

`Promise`\<`void`\>

Resolves when closed

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`doClose`](../../../classes/NetworkTransport.md#doclose)

***

### doInit()

> `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:300](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L300)

Initialize the network transport.

#### Returns

`Promise`\<`void`\>

Resolves when initialized

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`doInit`](../../../classes/NetworkTransport.md#doinit)

***

### doLog()

> `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:706](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L706)

Ensure single log sends immediately (flush underlying batch).

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`doLog`](../../../classes/NetworkTransport.md#dolog)

***

### doLogBatch()

> `protected` **doLogBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:724](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L724)

Ensure batch log sends immediately.

#### Parameters

##### entries

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`Promise`\<`void`\>

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`doLogBatch`](../../../classes/NetworkTransport.md#dologbatch)

***

### emit()

> **emit**(`event`, ...`args`): `boolean`

Defined in: [src/transports/base/Transport.ts:719](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L719)

Synchronously calls each of the listeners registered for the event named`eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import EventEmitter from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Parameters

##### event

keyof [`TransportEvents`](../../../../../types/transport/interfaces/TransportEvents.md)

##### args

...`unknown`[]

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`emit`](../../../classes/NetworkTransport.md#emit)

***

### emitExtended()

> `protected` **emitExtended**(`event`, ...`args`): `void`

Defined in: [src/transports/base/NetworkTransport.ts:1174](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1174)

Emit extended events that may not be in base TransportEvents.

#### Parameters

##### event

`string`

Event name

##### args

...`unknown`[]

Event arguments

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`emitExtended`](../../../classes/NetworkTransport.md#emitextended)

***

### enable()

> **enable**(): `void`

Defined in: [src/transports/base/Transport.ts:619](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L619)

Enable the transport.

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`enable`](../../../classes/NetworkTransport.md#enable)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:383](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L383)

Flush any pending logs.

#### Returns

`Promise`\<`void`\>

Resolves when all pending logs are sent

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`flush`](../../../classes/NetworkTransport.md#flush)

***

### formatEntry()

> `protected` **formatEntry**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:447](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L447)

Format a log entry according to the configured format.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string` \| `Buffer`

Formatted log entry

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`formatEntry`](../../../classes/NetworkTransport.md#formatentry)

***

### formatPlain()

> `protected` **formatPlain**(`entry`): `string`

Defined in: [src/transports/base/Transport.ts:473](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L473)

Format a log entry as plain text.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

Plain text formatted log entry

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`formatPlain`](../../../classes/NetworkTransport.md#formatplain)

***

### generateId()

> `protected` **generateId**(): `string`

Defined in: [src/transports/base/Transport.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L590)

Generate a unique ID for tracking purposes.

#### Returns

`string`

A unique identifier

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`generateId`](../../../classes/NetworkTransport.md#generateid)

***

### getName()

> **getName**(): `string`

Defined in: [src/transports/base/Transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L436)

Get the transport name.

#### Returns

`string`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`getName`](../../../classes/NetworkTransport.md#getname)

***

### getStats()

> **getStats**(): [`TransportStats`](../../../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:839](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L839)

Get transport statistics.

#### Returns

[`TransportStats`](../../../../../types/transport/interfaces/TransportStats.md)

Transport statistics

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`getStats`](../../../classes/NetworkTransport.md#getstats)

***

### handleError()

> `protected` **handleError**(`error`, `entry?`): `void`

Defined in: [src/transports/base/Transport.ts:507](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L507)

Handle errors according to the transport's configuration.

#### Parameters

##### error

`Error`

The error that occurred

##### entry?

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry that caused the error (if applicable)

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`handleError`](../../../classes/NetworkTransport.md#handleerror)

***

### handleNetworkFailure()

> `protected` **handleNetworkFailure**(`error`, `batch?`): `void`

Defined in: [src/transports/base/NetworkTransport.ts:694](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L694)

Handle network failure.

#### Parameters

##### error

`Error`

The error

##### batch?

`unknown`

The batch that failed

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`handleNetworkFailure`](../../../classes/NetworkTransport.md#handlenetworkfailure)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:196](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L196)

Initialize the transport.

#### Returns

`Promise`\<`void`\>

Resolves when initialization is complete

#### Throws

If initialization fails

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`init`](../../../classes/NetworkTransport.md#init)

***

### initializeNetwork()

> `protected` **initializeNetwork**(): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:863](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L863)

Initialize network (WebSocket-specific).

#### Returns

`Promise`\<`void`\>

Resolves when initialized

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`initializeNetwork`](../../../classes/NetworkTransport.md#initializenetwork)

***

### isCircuitBreakerOpen()

> `protected` **isCircuitBreakerOpen**(): `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:668](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L668)

Check if circuit breaker is open.

#### Returns

`boolean`

True if circuit breaker is open

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`isCircuitBreakerOpen`](../../../classes/NetworkTransport.md#iscircuitbreakeropen)

***

### isConnectionError()

> `protected` **isConnectionError**(`error`): `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:906](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L906)

Check if error is a connection error.

#### Parameters

##### error

`Error`

Error to check

#### Returns

`boolean`

True if connection error

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`isConnectionError`](../../../classes/NetworkTransport.md#isconnectionerror)

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/transports/base/Transport.ts:637](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L637)

Check if the transport is currently enabled.

#### Returns

`boolean`

True if transport is enabled

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`isEnabled`](../../../classes/NetworkTransport.md#isenabled)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/transports/base/NetworkTransport.ts:1140](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1140)

Check if transport is healthy.

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`isHealthy`](../../../classes/NetworkTransport.md#ishealthy)

***

### isLevelEnabled()

> `protected` **isLevelEnabled**(`level`): `boolean`

Defined in: [src/transports/base/Transport.ts:571](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L571)

Check if a log level is enabled based on minimum level.

#### Parameters

##### level

`string`

The level to check

#### Returns

`boolean`

True if the level is enabled

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`isLevelEnabled`](../../../classes/NetworkTransport.md#islevelenabled)

***

### log()

> **log**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:739](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L739)

Override base log to perform early connection state validation OUTSIDE base try/catch so rejection propagates.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`log`](../../../classes/NetworkTransport.md#log)

***

### logBatch()

> **logBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:763](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L763)

Override base batch log similarly for disconnected state.

#### Parameters

##### entries

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`Promise`\<`void`\>

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`logBatch`](../../../classes/NetworkTransport.md#logbatch)

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:715](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L715)

Alias for `emitter.removeListener()`.

#### Parameters

##### event

keyof [`TransportEvents`](../../../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v10.0.0

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`off`](../../../classes/NetworkTransport.md#off)

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:711](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L711)

Implement EventEmitter methods explicitly for ITransport interface.

#### Parameters

##### event

keyof [`TransportEvents`](../../../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`on`](../../../classes/NetworkTransport.md#on)

***

### performNetworkRequest()

> `protected` **performNetworkRequest**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:687](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L687)

Perform the network request to send logs.

#### Parameters

##### entries

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)[]

Log entries to send

#### Returns

`Promise`\<`void`\>

Resolves when sent

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`performNetworkRequest`](../../../classes/NetworkTransport.md#performnetworkrequest)

***

### reconnect()

> **reconnect**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1158](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1158)

Force reconnection.

#### Returns

`Promise`\<`void`\>

Resolves when reconnected

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`reconnect`](../../../classes/NetworkTransport.md#reconnect)

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/Transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L655)

Reset transport statistics.

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`resetStats`](../../../classes/NetworkTransport.md#resetstats)

***

### sendBatch()

> `protected` **sendBatch**(`data`, `batch?`): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:586](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L586)

Send a batch of log entries over the network.

#### Parameters

##### data

`unknown`

Data to send

##### batch?

`unknown`

Optional batch metadata

#### Returns

`Promise`\<`void`\>

Resolves when sent

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`sendBatch`](../../../classes/NetworkTransport.md#sendbatch)

***

### sendData()

> `protected` **sendData**(`data`): `Promise`\<`void`\>

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:367](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L367)

Send data via WebSocket.

#### Parameters

##### data

`unknown`

Data to send

#### Returns

`Promise`\<`void`\>

Resolves when sent

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`sendData`](../../../classes/NetworkTransport.md#senddata)

***

### sendKeepAlive()

> `protected` **sendKeepAlive**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:574](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L574)

Send keep-alive signal.

#### Returns

`Promise`\<`void`\>

Resolves when sent

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`sendKeepAlive`](../../../classes/NetworkTransport.md#sendkeepalive)

***

### sendToFallback()

> `protected` **sendToFallback**(`batch`): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:776](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L776)

Send batch to fallback transport.

#### Parameters

##### batch

`unknown`

The batch to send

#### Returns

`Promise`\<`void`\>

Resolves when sent

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`sendToFallback`](../../../classes/NetworkTransport.md#sendtofallback)

***

### shouldLog()

> **shouldLog**(`entry`): `boolean`

Defined in: [src/transports/base/Transport.ts:329](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L329)

Check if this transport should handle a given log entry.

#### Parameters

##### entry

[`LogEntry`](../../../../../types/transport/interfaces/LogEntry.md)

The log entry to check

#### Returns

`boolean`

True if the entry should be logged by this transport

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`shouldLog`](../../../classes/NetworkTransport.md#shouldlog)

***

### shouldPropagateErrors()

> `protected` **shouldPropagateErrors**(): `boolean`

Defined in: [src/transports/base/implementations/WebSocketTransport.ts:876](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/implementations/WebSocketTransport.ts#L876)

Propagate errors for WebSocket operations.

#### Returns

`boolean`

#### Overrides

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`shouldPropagateErrors`](../../../classes/NetworkTransport.md#shouldpropagateerrors)

***

### shouldRetryError()

> `protected` **shouldRetryError**(`error`, `retryCount`): `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:840](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L840)

Check if error is retryable.

#### Parameters

##### error

`Error`

Error to check

##### retryCount

`number`

Current retry count

#### Returns

`boolean`

True if retryable

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`shouldRetryError`](../../../classes/NetworkTransport.md#shouldretryerror)

***

### sleepMs()

> `protected` **sleepMs**(`ms`): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:974](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L974)

Sleep for specified duration.

#### Parameters

##### ms

`number`

Duration in milliseconds

#### Returns

`Promise`\<`void`\>

Resolves after delay

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`sleepMs`](../../../classes/NetworkTransport.md#sleepms)

***

### supportsBatching()

> **supportsBatching**(): `boolean`

Defined in: [src/transports/base/BatchingTransport.ts:443](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L443)

Check if transport supports batching.

#### Returns

`boolean`

Always true for batching transports

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`supportsBatching`](../../../classes/NetworkTransport.md#supportsbatching)

***

### withTimeout()

> `protected` **withTimeout**\<`T`\>(`promise`, `ms`): `Promise`\<`T`\>

Defined in: [src/transports/base/Transport.ts:551](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L551)

Apply a timeout to an async operation.

#### Type Parameters

##### T

`T`

#### Parameters

##### promise

`Promise`\<`T`\>

The promise to apply timeout to

##### ms

`number`

Timeout in milliseconds

#### Returns

`Promise`\<`T`\>

The original promise with timeout applied

#### Throws

If operation times out

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`withTimeout`](../../../classes/NetworkTransport.md#withtimeout)

***

### writeToDLQ()

> `protected` **writeToDLQ**(`batch`, `error`): `void`

Defined in: [src/transports/base/NetworkTransport.ts:737](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L737)

Write batch to dead letter queue.

#### Parameters

##### batch

`unknown`

The failed batch

##### error

`Error`

The error

#### Returns

`void`

#### Inherited from

[`NetworkTransport`](../../../classes/NetworkTransport.md).[`writeToDLQ`](../../../classes/NetworkTransport.md#writetodlq)
