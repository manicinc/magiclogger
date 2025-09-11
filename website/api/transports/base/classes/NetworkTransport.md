# Abstract Class: NetworkTransport

Defined in: [src/transports/base/NetworkTransport.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L65)

Network transport base class for sending logs over network protocols.

Features:
- Automatic connection management with reconnection
- Health checking and circuit breaker pattern
- Offline queue with configurable limits
- Retry logic with exponential backoff
- Connection pooling support
- TLS/SSL configuration
- Request/response transformation

 NetworkTransport

## Example

```typescript
class MyNetworkTransport extends NetworkTransport {
  protected async connect(): Promise<void> {
    this.client = await createConnection(this.url);
  }

  protected async sendData(data: unknown): Promise<void> {
    await this.client.send(data);
  }
}
```

## Extends

- [`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md)

## Extended by

- [`MongoDBTransport`](../implementations/MongoDBTransport/classes/MongoDBTransport.md)
- [`S3Transport`](../implementations/S3Transport/classes/S3Transport.md)
- [`WebSocketTransport`](../implementations/WebSocketTransport/classes/WebSocketTransport.md)

## Constructors

### Constructor

> **new NetworkTransport**(`options`): `NetworkTransport`

Defined in: [src/transports/base/NetworkTransport.ts:250](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L250)

Creates a new NetworkTransport instance.

#### Parameters

##### options

`NetworkTransportOptionsExtended`

Transport configuration

#### Returns

`NetworkTransport`

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`constructor`](../BatchingTransport/classes/BatchingTransport.md#constructor)

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

***

### circuitBreakerOpen

> `protected` **circuitBreakerOpen**: `boolean` = `false`

Defined in: [src/transports/base/NetworkTransport.ts:234](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L234)

Circuit breaker open state.

***

### circuitBreakerOpenUntil

> `protected` **circuitBreakerOpenUntil**: `number` = `0`

Defined in: [src/transports/base/NetworkTransport.ts:240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L240)

Circuit breaker open until timestamp.

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

***

### closing

> `protected` **closing**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:156](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L156)

Flag to track if transport is currently closing.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`closing`](../BatchingTransport/classes/BatchingTransport.md#closing)

***

### connectionState

> `protected` **connectionState**: [`ConnectionState`](../../../types/transport/type-aliases/ConnectionState.md) = `'disconnected'`

Defined in: [src/transports/base/NetworkTransport.ts:166](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L166)

Current connection state.

***

### connectionTimeout

> `protected` `readonly` **connectionTimeout**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L76)

Connection timeout in milliseconds.

***

### consecutiveFailures

> `protected` **consecutiveFailures**: `number` = `0`

Defined in: [src/transports/base/NetworkTransport.ts:228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L228)

Consecutive failure count.

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

***

### dlqFileManager?

> `protected` `optional` **dlqFileManager**: `unknown`

Defined in: [src/transports/base/NetworkTransport.ts:216](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L216)

Dead letter queue file manager.

***

### enabled

> **enabled**: `boolean`

Defined in: [src/transports/base/Transport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L70)

Whether this transport is currently active and processing logs.
Can be toggled at runtime to enable/disable specific transports.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`enabled`](../BatchingTransport/classes/BatchingTransport.md#enabled)

***

### excludeTags?

> `protected` `readonly` `optional` **excludeTags**: `string`[]

Defined in: [src/transports/base/Transport.ts:114](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L114)

Tags that exclude logs from being processed.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`excludeTags`](../BatchingTransport/classes/BatchingTransport.md#excludetags)

***

### fallbackConfig?

> `protected` `readonly` `optional` **fallbackConfig**: `string` \| [`Transport`](../../../types/transport/interfaces/Transport.md)

Defined in: [src/transports/base/NetworkTransport.ts:160](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L160)

Fallback transport configuration.

***

### fallbackTransport?

> `protected` `optional` **fallbackTransport**: [`Transport`](../../../types/transport/interfaces/Transport.md)

Defined in: [src/transports/base/NetworkTransport.ts:222](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L222)

Fallback transport instance.

***

### filter()?

> `protected` `readonly` `optional` **filter**: (`entry`) => `boolean`

Defined in: [src/transports/base/Transport.ts:120](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L120)

Custom filter function for advanced filtering.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`filter`](../BatchingTransport/classes/BatchingTransport.md#filter)

***

### format

> `protected` `readonly` **format**: `"json"` \| `"plain"` \| `"custom"`

Defined in: [src/transports/base/Transport.ts:138](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L138)

Output format for this transport.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`format`](../BatchingTransport/classes/BatchingTransport.md#format)

***

### formatter()?

> `protected` `readonly` `optional` **formatter**: (`entry`) => `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:144](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L144)

Custom formatter function.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string` \| `Buffer`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`formatter`](../BatchingTransport/classes/BatchingTransport.md#formatter)

***

### headers?

> `protected` `readonly` `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/transports/base/NetworkTransport.ts:130](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L130)

Custom headers for requests.

***

### healthCheckInterval

> `protected` `readonly` **healthCheckInterval**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:118](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L118)

Health check interval in milliseconds.

***

### healthCheckTimer?

> `protected` `optional` **healthCheckTimer**: `Timeout`

Defined in: [src/transports/base/NetworkTransport.ts:184](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L184)

Health check timer.

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [src/transports/base/Transport.ts:150](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L150)

Flag to track if transport has been initialized.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`initialized`](../BatchingTransport/classes/BatchingTransport.md#initialized)

***

### keepAliveInterval?

> `protected` `readonly` `optional` **keepAliveInterval**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:124](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L124)

Keep-alive interval in milliseconds.

***

### keepAliveTimer?

> `protected` `optional` **keepAliveTimer**: `Timeout`

Defined in: [src/transports/base/NetworkTransport.ts:190](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L190)

Keep-alive timer.

***

### level

> `protected` `readonly` **level**: `string`

Defined in: [src/transports/base/Transport.ts:96](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L96)

Minimum log level for this transport.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`level`](../BatchingTransport/classes/BatchingTransport.md#level)

***

### levels?

> `protected` `readonly` `optional` **levels**: `string`[]

Defined in: [src/transports/base/Transport.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L102)

Specific levels this transport handles (if specified).

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`levels`](../BatchingTransport/classes/BatchingTransport.md#levels)

***

### maxBatchBytes

> `protected` `readonly` **maxBatchBytes**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L55)

Maximum size in bytes per batch.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`maxBatchBytes`](../BatchingTransport/classes/BatchingTransport.md#maxbatchbytes)

***

### maxBatchSize

> `protected` `readonly` **maxBatchSize**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L43)

Maximum number of entries per batch.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`maxBatchSize`](../BatchingTransport/classes/BatchingTransport.md#maxbatchsize)

***

### maxBatchTime

> `protected` `readonly` **maxBatchTime**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L49)

Maximum time to wait before sending a batch (ms).

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`maxBatchTime`](../BatchingTransport/classes/BatchingTransport.md#maxbatchtime)

***

### maxOfflineQueueSize

> `protected` `readonly` **maxOfflineQueueSize**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:106](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L106)

Maximum offline queue size.

***

### maxQueueSize

> `protected` `readonly` **maxQueueSize**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L79)

Maximum queue size.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`maxQueueSize`](../BatchingTransport/classes/BatchingTransport.md#maxqueuesize)

***

### maxReconnectAttempts

> `protected` `readonly` **maxReconnectAttempts**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:88](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L88)

Maximum reconnection attempts.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:61](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L61)

Maximum retry attempts for failed batches.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`maxRetries`](../BatchingTransport/classes/BatchingTransport.md#maxretries)

***

### name

> `readonly` **name**: `string`

Defined in: [src/transports/base/Transport.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L64)

Unique identifier for this transport instance.
Used for managing multiple transports and debugging.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`name`](../BatchingTransport/classes/BatchingTransport.md#name)

***

### offlineQueue

> `protected` **offlineQueue**: [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[] = `[]`

Defined in: [src/transports/base/NetworkTransport.ts:172](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L172)

Offline queue for storing logs when disconnected.

***

### options

> `protected` `readonly` **options**: [`TransportOptions`](../../../types/transport/interfaces/TransportOptions.md)

Defined in: [src/transports/base/Transport.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L76)

Transport configuration options.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`options`](../BatchingTransport/classes/BatchingTransport.md#options)

***

### queueWhenOffline

> `protected` `readonly` **queueWhenOffline**: `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:112](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L112)

Whether to queue logs when offline.

***

### reconnectAttempts

> `protected` **reconnectAttempts**: `number` = `0`

Defined in: [src/transports/base/NetworkTransport.ts:178](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L178)

Current reconnection attempt count.

***

### reconnectBackoff

> `protected` `readonly` **reconnectBackoff**: `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:100](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L100)

Whether to use exponential backoff for reconnects.

***

### reconnectDelay

> `protected` `readonly` **reconnectDelay**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L94)

Delay between reconnection attempts.

***

### reconnectTimer?

> `protected` `optional` **reconnectTimer**: `Timeout`

Defined in: [src/transports/base/NetworkTransport.ts:196](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L196)

Connection retry timer.

***

### requestTimeout

> `protected` `readonly` **requestTimeout**: `number`

Defined in: [src/transports/base/NetworkTransport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L82)

Request timeout in milliseconds.

***

### retry

> `protected` `readonly` **retry**: [`RetryOptions`](../../../types/transport/interfaces/RetryOptions.md)

Defined in: [src/transports/base/NetworkTransport.ts:148](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L148)

Retry options.

***

### retryDelay

> `protected` `readonly` **retryDelay**: `number`

Defined in: [src/transports/base/BatchingTransport.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L67)

Initial retry delay in milliseconds.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`retryDelay`](../BatchingTransport/classes/BatchingTransport.md#retrydelay)

***

### retryOnFailure

> `protected` `readonly` **retryOnFailure**: `boolean`

Defined in: [src/transports/base/BatchingTransport.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L73)

Whether to retry on failure.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`retryOnFailure`](../BatchingTransport/classes/BatchingTransport.md#retryonfailure)

***

### silent

> `protected` `readonly` **silent**: `boolean`

Defined in: [src/transports/base/Transport.ts:126](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L126)

Whether to suppress errors from this transport.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`silent`](../BatchingTransport/classes/BatchingTransport.md#silent)

***

### stats

> `protected` **stats**: [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/Transport.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L82)

Statistics tracking for this transport.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`stats`](../BatchingTransport/classes/BatchingTransport.md#stats)

***

### tags?

> `protected` `readonly` `optional` **tags**: `string`[]

Defined in: [src/transports/base/Transport.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L108)

Tags that must be present for logs to be processed.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`tags`](../BatchingTransport/classes/BatchingTransport.md#tags)

***

### timeout

> `protected` `readonly` **timeout**: `number`

Defined in: [src/transports/base/Transport.ts:132](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L132)

Operation timeout in milliseconds.

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`timeout`](../BatchingTransport/classes/BatchingTransport.md#timeout)

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

***

### url?

> `protected` `optional` **url**: `string`

Defined in: [src/transports/base/NetworkTransport.ts:70](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L70)

Network endpoint URL.

## Methods

### buildHeaders()

> `protected` **buildHeaders**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [src/transports/base/NetworkTransport.ts:951](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L951)

Build request headers.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

Headers object

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

***

### checkHealth()

> `abstract` `protected` **checkHealth**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1228](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1228)

Abstract method to check connection health.

#### Returns

`Promise`\<`void`\>

Resolves if healthy, rejects if not

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1183](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1183)

Close the transport and ensure network-specific resources are cleaned up.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`close`](../BatchingTransport/classes/BatchingTransport.md#close)

***

### closeNetwork()

> `protected` **closeNetwork**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1097](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1097)

Close network-specific resources.

#### Returns

`Promise`\<`void`\>

Resolves when closed

***

### connect()

> `abstract` `protected` **connect**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1200](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1200)

Abstract method to establish connection.

#### Returns

`Promise`\<`void`\>

Resolves when connected

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

***

### disable()

> **disable**(): `void`

Defined in: [src/transports/base/Transport.ts:627](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L627)

Disable the transport.

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`disable`](../BatchingTransport/classes/BatchingTransport.md#disable)

***

### disconnect()

> `abstract` `protected` **disconnect**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1209](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1209)

Abstract method to close connection.

#### Returns

`Promise`\<`void`\>

Resolves when disconnected

***

### doClose()

> `protected` **doClose**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1044](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1044)

Close network transport.

#### Returns

`Promise`\<`void`\>

Resolves when closed

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`doClose`](../BatchingTransport/classes/BatchingTransport.md#doclose)

***

### doInit()

> `protected` **doInit**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:300](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L300)

Initialize the network transport.

#### Returns

`Promise`\<`void`\>

Resolves when initialized

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`doInit`](../BatchingTransport/classes/BatchingTransport.md#doinit)

***

### doLog()

> `protected` **doLog**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:143](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L143)

Log a single entry.

Adds the entry to the current batch and triggers sending if limits are reached.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Resolves when the entry is queued

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`doLog`](../BatchingTransport/classes/BatchingTransport.md#dolog)

***

### doLogBatch()

> `protected` **doLogBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:184](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L184)

Log multiple entries at once.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries to process

#### Returns

`Promise`\<`void`\>

Resolves when all entries are queued

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`doLogBatch`](../BatchingTransport/classes/BatchingTransport.md#dologbatch)

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

keyof [`TransportEvents`](../../../types/transport/interfaces/TransportEvents.md)

##### args

...`unknown`[]

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`emit`](../BatchingTransport/classes/BatchingTransport.md#emit)

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

***

### enable()

> **enable**(): `void`

Defined in: [src/transports/base/Transport.ts:619](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L619)

Enable the transport.

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`enable`](../BatchingTransport/classes/BatchingTransport.md#enable)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/base/BatchingTransport.ts:383](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L383)

Flush any pending logs.

#### Returns

`Promise`\<`void`\>

Resolves when all pending logs are sent

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`flush`](../BatchingTransport/classes/BatchingTransport.md#flush)

***

### formatEntry()

> `protected` **formatEntry**(`entry`): `string` \| `Buffer`

Defined in: [src/transports/base/Transport.ts:447](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L447)

Format a log entry according to the configured format.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string` \| `Buffer`

Formatted log entry

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`formatEntry`](../BatchingTransport/classes/BatchingTransport.md#formatentry)

***

### formatPlain()

> `protected` **formatPlain**(`entry`): `string`

Defined in: [src/transports/base/Transport.ts:473](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L473)

Format a log entry as plain text.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to format

#### Returns

`string`

Plain text formatted log entry

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`formatPlain`](../BatchingTransport/classes/BatchingTransport.md#formatplain)

***

### generateId()

> `protected` **generateId**(): `string`

Defined in: [src/transports/base/Transport.ts:590](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L590)

Generate a unique ID for tracking purposes.

#### Returns

`string`

A unique identifier

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`generateId`](../BatchingTransport/classes/BatchingTransport.md#generateid)

***

### getName()

> **getName**(): `string`

Defined in: [src/transports/base/Transport.ts:436](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L436)

Get the transport name.

#### Returns

`string`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`getName`](../BatchingTransport/classes/BatchingTransport.md#getname)

***

### getStats()

> **getStats**(): [`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Defined in: [src/transports/base/NetworkTransport.ts:1113](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1113)

Get transport statistics including network-specific stats.

#### Returns

[`TransportStats`](../../../types/transport/interfaces/TransportStats.md)

Current statistics

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`getStats`](../BatchingTransport/classes/BatchingTransport.md#getstats)

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

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry that caused the error (if applicable)

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`handleError`](../BatchingTransport/classes/BatchingTransport.md#handleerror)

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

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`init`](../BatchingTransport/classes/BatchingTransport.md#init)

***

### initializeNetwork()

> `protected` **initializeNetwork**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:324](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L324)

Initialize network-specific resources.

#### Returns

`Promise`\<`void`\>

Resolves when initialized

***

### isCircuitBreakerOpen()

> `protected` **isCircuitBreakerOpen**(): `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:668](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L668)

Check if circuit breaker is open.

#### Returns

`boolean`

True if circuit breaker is open

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

***

### isEnabled()

> **isEnabled**(): `boolean`

Defined in: [src/transports/base/Transport.ts:637](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L637)

Check if the transport is currently enabled.

#### Returns

`boolean`

True if transport is enabled

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`isEnabled`](../BatchingTransport/classes/BatchingTransport.md#isenabled)

***

### isHealthy()

> **isHealthy**(): `Promise`\<`boolean`\>

Defined in: [src/transports/base/NetworkTransport.ts:1140](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1140)

Check if transport is healthy.

#### Returns

`Promise`\<`boolean`\>

True if healthy

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`isHealthy`](../BatchingTransport/classes/BatchingTransport.md#ishealthy)

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

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`isLevelEnabled`](../BatchingTransport/classes/BatchingTransport.md#islevelenabled)

***

### log()

> **log**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:217](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L217)

Log a single entry.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<`void`\>

Resolves when the log has been processed

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`log`](../BatchingTransport/classes/BatchingTransport.md#log)

***

### logBatch()

> **logBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/Transport.ts:257](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L257)

Log multiple entries at once.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Array of log entries to process

#### Returns

`Promise`\<`void`\>

Resolves when all logs have been processed

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`logBatch`](../BatchingTransport/classes/BatchingTransport.md#logbatch)

***

### off()

> **off**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:715](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L715)

Alias for `emitter.removeListener()`.

#### Parameters

##### event

keyof [`TransportEvents`](../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Since

v10.0.0

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`off`](../BatchingTransport/classes/BatchingTransport.md#off)

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: [src/transports/base/Transport.ts:711](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L711)

Implement EventEmitter methods explicitly for ITransport interface.

#### Parameters

##### event

keyof [`TransportEvents`](../../../types/transport/interfaces/TransportEvents.md)

##### listener

(...`args`) => `void`

#### Returns

`this`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`on`](../BatchingTransport/classes/BatchingTransport.md#on)

***

### performNetworkRequest()

> `abstract` `protected` **performNetworkRequest**(`data`, `batch?`): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1239](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1239)

Abstract method to perform the actual network request.

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

***

### reconnect()

> **reconnect**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1158](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1158)

Force reconnection.

#### Returns

`Promise`\<`void`\>

Resolves when reconnected

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/Transport.ts:655](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L655)

Reset transport statistics.

#### Returns

`void`

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`resetStats`](../BatchingTransport/classes/BatchingTransport.md#resetstats)

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

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`sendBatch`](../BatchingTransport/classes/BatchingTransport.md#sendbatch)

***

### sendData()

> `abstract` `protected` **sendData**(`data`): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:1219](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1219)

Abstract method to send data over the network.

#### Parameters

##### data

`unknown`

Data to send

#### Returns

`Promise`\<`void`\>

Resolves when sent

***

### sendKeepAlive()

> `protected` **sendKeepAlive**(): `Promise`\<`void`\>

Defined in: [src/transports/base/NetworkTransport.ts:574](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L574)

Send keep-alive signal.

#### Returns

`Promise`\<`void`\>

Resolves when sent

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

***

### shouldLog()

> **shouldLog**(`entry`): `boolean`

Defined in: [src/transports/base/Transport.ts:329](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/Transport.ts#L329)

Check if this transport should handle a given log entry.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to check

#### Returns

`boolean`

True if the entry should be logged by this transport

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`shouldLog`](../BatchingTransport/classes/BatchingTransport.md#shouldlog)

***

### shouldPropagateErrors()

> `protected` **shouldPropagateErrors**(): `boolean`

Defined in: [src/transports/base/NetworkTransport.ts:1149](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/NetworkTransport.ts#L1149)

Whether this transport should rethrow errors encountered during log operations.
Network-based transports typically want propagation so callers/tests can assert failures.
Base transports default to swallowing errors after emitting events and updating stats.

#### Returns

`boolean`

#### Overrides

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`shouldPropagateErrors`](../BatchingTransport/classes/BatchingTransport.md#shouldpropagateerrors)

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

***

### supportsBatching()

> **supportsBatching**(): `boolean`

Defined in: [src/transports/base/BatchingTransport.ts:443](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/BatchingTransport.ts#L443)

Check if transport supports batching.

#### Returns

`boolean`

Always true for batching transports

#### Inherited from

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`supportsBatching`](../BatchingTransport/classes/BatchingTransport.md#supportsbatching)

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

[`BatchingTransport`](../BatchingTransport/classes/BatchingTransport.md).[`withTimeout`](../BatchingTransport/classes/BatchingTransport.md#withtimeout)

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
