# Interface: AsyncLoggerOptions

Defined in: [src/async/AsyncLogger.ts:71](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L71)

Configuration options for the AsyncLogger.

 AsyncLoggerOptions

## Since

1.0.0

## Properties

### buffer?

> `optional` **buffer**: `object`

Defined in: [src/async/AsyncLogger.ts:85](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L85)

Buffer configuration (for backward compatibility with tests)

#### flushInterval?

> `optional` **flushInterval**: `number`

Flush interval in ms

#### size?

> `optional` **size**: `number`

Buffer size/capacity

***

### enableMetrics?

> `optional` **enableMetrics**: `boolean`

Defined in: [src/async/AsyncLogger.ts:77](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L77)

Enable performance metrics collection

***

### id?

> `optional` **id**: `string`

Defined in: [src/async/AsyncLogger.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L75)

Unique identifier for this logger instance

***

### onFlush()?

> `optional` **onFlush**: (`entries`) => `void` \| `Promise`\<`void`\>

Defined in: [src/async/AsyncLogger.ts:79](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L79)

Callback when logs are flushed

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### transports?

> `optional` **transports**: [`Transport`](../../../types/transport/interfaces/Transport.md)[]

Defined in: [src/async/AsyncLogger.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L73)

Array of transports to use for output

***

### useColors?

> `optional` **useColors**: `boolean`

Defined in: [src/async/AsyncLogger.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L83)

Whether to enable color/style support (default: true)

***

### useConsole?

> `optional` **useConsole**: `boolean`

Defined in: [src/async/AsyncLogger.ts:81](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L81)

Whether to use console transport by default (default: true)

***

### worker?

> `optional` **worker**: `object`

Defined in: [src/async/AsyncLogger.ts:92](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/async/AsyncLogger.ts#L92)

Worker thread configuration

#### batchSize?

> `optional` **batchSize**: `number`

Batch size before auto-flush (default: 100)

#### batchTimeout?

> `optional` **batchTimeout**: `number`

Timeout before auto-flush in ms (default: 10)

#### enabled?

> `optional` **enabled**: `boolean`

Enable worker threads (default: true if available)

#### flushInterval?

> `optional` **flushInterval**: `number`

Periodic flush interval in ms (default: 50)

#### poolSize?

> `optional` **poolSize**: `number`

Number of worker threads (default: 1)
