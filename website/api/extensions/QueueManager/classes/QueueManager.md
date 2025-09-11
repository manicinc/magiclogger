# Class: QueueManager

Defined in: [src/extensions/QueueManager.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L49)

Queue manager for handling log backpressure.

## Constructors

### Constructor

> **new QueueManager**(`options?`): `QueueManager`

Defined in: [src/extensions/QueueManager.ts:77](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L77)

Construct a QueueManager.

#### Parameters

##### options?

[`QueueManagerOptions`](../interfaces/QueueManagerOptions.md) = `{}`

Configuration options.

#### Returns

`QueueManager`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/extensions/QueueManager.ts:370](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L370)

Clear the queue and record dropped entries.

#### Returns

`void`

***

### dequeue()

> **dequeue**(`count?`): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Defined in: [src/extensions/QueueManager.ts:162](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L162)

Dequeue entries for processing.

#### Parameters

##### count?

`number`

Maximum number of entries to dequeue (defaults to batchSize).

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Dequeued entries in FIFO order.

***

### enqueue()

> **enqueue**(`entry`): `boolean`

Defined in: [src/extensions/QueueManager.ts:107](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L107)

Add a log entry to the queue.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to enqueue.

#### Returns

`boolean`

True if enqueued; false if dropped due to policy.

***

### enqueueBatch()

> **enqueueBatch**(`entries`): `number`

Defined in: [src/extensions/QueueManager.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L131)

Add multiple log entries to the queue.

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Entries to enqueue.

#### Returns

`number`

Number of entries successfully enqueued.

***

### flush()

> **flush**(): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Defined in: [src/extensions/QueueManager.ts:359](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L359)

Flush and return all queued entries without processing.

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

All entries currently in the queue.

***

### getStats()

> **getStats**(): [`QueueStats`](../interfaces/QueueStats.md)

Defined in: [src/extensions/QueueManager.ts:381](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L381)

Get current queue statistics.

#### Returns

[`QueueStats`](../interfaces/QueueStats.md)

Aggregate metrics about the queue.

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [src/extensions/QueueManager.ts:420](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L420)

Whether the queue has no items.

#### Returns

`boolean`

***

### isFull()

> **isFull**(): `boolean`

Defined in: [src/extensions/QueueManager.ts:428](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L428)

Whether the queue has reached its maximum capacity.

#### Returns

`boolean`

***

### isPausedState()

> **isPausedState**(): `boolean`

Defined in: [src/extensions/QueueManager.ts:404](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L404)

Whether the queue is currently paused.

#### Returns

`boolean`

***

### pause()

> **pause**(): `void`

Defined in: [src/extensions/QueueManager.ts:290](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L290)

Pause queue processing (does not clear queued items).

#### Returns

`void`

***

### peek()

> **peek**(`count?`): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Defined in: [src/extensions/QueueManager.ts:189](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L189)

Peek at the next entries without removing them.

#### Parameters

##### count?

`number` = `10`

Number of entries to preview.

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

The next entries up to the specified count.

***

### resume()

> **resume**(): `void`

Defined in: [src/extensions/QueueManager.ts:299](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L299)

Resume processing if paused.

#### Returns

`void`

***

### setProcessor()

> **setProcessor**(`processor`): `void`

Defined in: [src/extensions/QueueManager.ts:310](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L310)

Set the async processor that will receive dequeued batches.

#### Parameters

##### processor

(`entries`) => `Promise`\<`void`\>

Async handler for a batch of entries.

#### Returns

`void`

***

### size()

> **size**(): `number`

Defined in: [src/extensions/QueueManager.ts:412](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L412)

Current number of items in the queue.

#### Returns

`number`
