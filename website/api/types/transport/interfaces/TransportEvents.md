# Interface: TransportEvents

Defined in: [src/types/transport.ts:958](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L958)

Transport lifecycle events.

## Properties

### acknowledged()?

> `optional` **acknowledged**: (`message`) => `void`

Defined in: [src/types/transport.ts:1095](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1095)

Emitted when a WebSocket message is acknowledged.

#### Parameters

##### message

`unknown`

#### Returns

`void`

***

### backpressure()?

> `optional` **backpressure**: (`info`) => `void`

Defined in: [src/types/transport.ts:1130](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1130)

Emitted when backpressure occurs.

#### Parameters

##### info

`unknown`

#### Returns

`void`

***

### batch()

> **batch**: (`entries`, `size`) => `void`

Defined in: [src/types/transport.ts:972](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L972)

Emitted when a batch is sent (for batching transports).

#### Parameters

##### entries

[`LogEntry`](LogEntry.md)[]

##### size

`number`

#### Returns

`void`

***

### circuitBreakerOpen()?

> `optional` **circuitBreakerOpen**: (`info`) => `void`

Defined in: [src/types/transport.ts:1059](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1059)

Emitted when circuit breaker opens.

#### Parameters

##### info

###### failures

`number`

###### transport

`string`

###### until

`Date`

#### Returns

`void`

***

### closed()

> **closed**: () => `void`

Defined in: [src/types/transport.ts:987](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L987)

Emitted when transport is closed.

#### Returns

`void`

***

### closing()

> **closing**: () => `void`

Defined in: [src/types/transport.ts:982](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L982)

Emitted when transport is closing.

#### Returns

`void`

***

### config()?

> `optional` **config**: (`config`) => `void`

Defined in: [src/types/transport.ts:1100](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1100)

Emitted when configuration is received.

#### Parameters

##### config

`unknown`

#### Returns

`void`

***

### connected()?

> `optional` **connected**: (`info?`) => `void`

Defined in: [src/types/transport.ts:1003](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1003)

Emitted when connected.

#### Parameters

##### info?

`unknown`

#### Returns

`void`

***

### connectionError()?

> `optional` **connectionError**: (`error`) => `void`

Defined in: [src/types/transport.ts:1008](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1008)

Emitted on connection error.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### connectionFailed()?

> `optional` **connectionFailed**: (`info`) => `void`

Defined in: [src/types/transport.ts:1013](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1013)

Emitted when connection fails after all retries.

#### Parameters

##### info

###### attempts

`number`

###### error

`Error`

#### Returns

`void`

***

### disabled()

> **disabled**: () => `void`

Defined in: [src/types/transport.ts:997](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L997)

Emitted when transport is disabled.

#### Returns

`void`

***

### disconnected()?

> `optional` **disconnected**: (`info`) => `void`

Defined in: [src/types/transport.ts:1085](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1085)

Emitted when disconnected.

#### Parameters

##### info

`unknown`

#### Returns

`void`

***

### enabled()

> **enabled**: () => `void`

Defined in: [src/types/transport.ts:992](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L992)

Emitted when transport is enabled.

#### Returns

`void`

***

### error()

> **error**: (`error`, `entry?`) => `void`

Defined in: [src/types/transport.ts:977](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L977)

Emitted on transport errors.

#### Parameters

##### error

`Error`

##### entry?

[`LogEntry`](LogEntry.md)

#### Returns

`void`

***

### fallback()?

> `optional` **fallback**: (`info`) => `void`

Defined in: [src/types/transport.ts:1064](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1064)

Emitted when using fallback transport.

#### Parameters

##### info

###### count

`number`

###### fallback

`string`

###### transport

`string`

#### Returns

`void`

***

### healthCheckFailed()?

> `optional` **healthCheckFailed**: (`error`) => `void`

Defined in: [src/types/transport.ts:1038](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1038)

Emitted when health check fails.

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### healthCheckPassed()?

> `optional` **healthCheckPassed**: () => `void`

Defined in: [src/types/transport.ts:1033](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1033)

Emitted when health check passes.

#### Returns

`void`

***

### indexesCreated()?

> `optional` **indexesCreated**: (`info`) => `void`

Defined in: [src/types/transport.ts:1135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1135)

Emitted when MongoDB indexes are created.

#### Parameters

##### info

`unknown`

#### Returns

`void`

***

### inserted()?

> `optional` **inserted**: (`info`) => `void`

Defined in: [src/types/transport.ts:1145](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1145)

Emitted when data is inserted.

#### Parameters

##### info

`unknown`

#### Returns

`void`

***

### keepAliveFailed()?

> `optional` **keepAliveFailed**: (`error`) => `void`

Defined in: [src/types/transport.ts:1043](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1043)

Emitted when keep-alive fails.

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### logged()

> **logged**: (`entry`) => `void`

Defined in: [src/types/transport.ts:967](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L967)

Emitted when a log is successfully sent.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`void`

***

### message()?

> `optional` **message**: (`message`) => `void`

Defined in: [src/types/transport.ts:1105](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1105)

Emitted when a message is received.

#### Parameters

##### message

`unknown`

#### Returns

`void`

***

### mongoInsert()?

> `optional` **mongoInsert**: (`info`) => `void`

Defined in: [src/types/transport.ts:1140](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1140)

Emitted when MongoDB insert occurs.

#### Parameters

##### info

`unknown`

#### Returns

`void`

***

### offlineQueueFull()?

> `optional` **offlineQueueFull**: (`info`) => `void`

Defined in: [src/types/transport.ts:1069](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1069)

Emitted when offline queue is full.

#### Parameters

##### info

###### dropped

`number`

#### Returns

`void`

***

### offlineQueueOverflow()?

> `optional` **offlineQueueOverflow**: (`info`) => `void`

Defined in: [src/types/transport.ts:1074](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1074)

Emitted when offline queue overflows.

#### Parameters

##### info

###### dropped

`number`

###### queued

`number`

#### Returns

`void`

***

### offlineQueueProcessed()?

> `optional` **offlineQueueProcessed**: (`info`) => `void`

Defined in: [src/types/transport.ts:1028](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1028)

Emitted when offline queue is processed.

#### Parameters

##### info

###### count

`number`

#### Returns

`void`

***

### piped()?

> `optional` **piped**: (`info`) => `void`

Defined in: [src/types/transport.ts:1120](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1120)

Emitted when a stream is piped.

#### Parameters

##### info

###### source

`unknown`

#### Returns

`void`

***

### processingOfflineQueue()?

> `optional` **processingOfflineQueue**: (`info`) => `void`

Defined in: [src/types/transport.ts:1023](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1023)

Emitted when processing offline queue.

#### Parameters

##### info

###### count

`number`

#### Returns

`void`

***

### ready()

> **ready**: () => `void`

Defined in: [src/types/transport.ts:962](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L962)

Emitted when transport is ready to accept logs.

#### Returns

`void`

***

### reconnecting()?

> `optional` **reconnecting**: (`info`) => `void`

Defined in: [src/types/transport.ts:1018](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1018)

Emitted when reconnecting.

#### Parameters

##### info

###### attempt

`number`

###### delay

`number`

#### Returns

`void`

***

### retry()?

> `optional` **retry**: (`info`) => `void`

Defined in: [src/types/transport.ts:1048](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1048)

Emitted on retry attempt.

#### Parameters

##### info

###### attempt

`number`

###### batch

`string`

###### delay

`number`

###### error

`string`

###### transport

`string`

#### Returns

`void`

***

### sent()?

> `optional` **sent**: (`info`) => `void`

Defined in: [src/types/transport.ts:1080](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1080)

Emitted when a message/data is successfully sent.

#### Parameters

##### info

`unknown`

#### Returns

`void`

***

### streamClosed()?

> `optional` **streamClosed**: () => `void`

Defined in: [src/types/transport.ts:1110](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1110)

Emitted when a stream is closed.

#### Returns

`void`

***

### streamFinished()?

> `optional` **streamFinished**: () => `void`

Defined in: [src/types/transport.ts:1115](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1115)

Emitted when a stream is finished.

#### Returns

`void`

***

### unpipe()?

> `optional` **unpipe**: (`info`) => `void`

Defined in: [src/types/transport.ts:1125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1125)

Emitted when a stream is unpiped.

#### Parameters

##### info

###### source

`unknown`

#### Returns

`void`

***

### uploaded()?

> `optional` **uploaded**: (`info`) => `void`

Defined in: [src/types/transport.ts:1090](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1090)

Emitted when upload/data transfer is complete.

#### Parameters

##### info

`unknown`

#### Returns

`void`
