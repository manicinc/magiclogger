# Interface: QueueManagerOptions

Defined in: [src/extensions/QueueManager.ts:27](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L27)

Queue manager configuration.

## Properties

### batchSize?

> `optional` **batchSize**: `number`

Defined in: [src/extensions/QueueManager.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L35)

***

### dropPolicy?

> `optional` **dropPolicy**: [`DropPolicy`](../type-aliases/DropPolicy.md)

Defined in: [src/extensions/QueueManager.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L29)

***

### highWaterMark?

> `optional` **highWaterMark**: `number`

Defined in: [src/extensions/QueueManager.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L33)

***

### lowWaterMark?

> `optional` **lowWaterMark**: `number`

Defined in: [src/extensions/QueueManager.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L34)

***

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [src/extensions/QueueManager.ts:28](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L28)

***

### metricsEnabled?

> `optional` **metricsEnabled**: `boolean`

Defined in: [src/extensions/QueueManager.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L32)

***

### onDrop()?

> `optional` **onDrop**: (`entries`, `reason`) => `void`

Defined in: [src/extensions/QueueManager.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L31)

#### Parameters

##### entries

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

##### reason

`string`

#### Returns

`void`

***

### priorityFn()?

> `optional` **priorityFn**: (`entry`) => `number`

Defined in: [src/extensions/QueueManager.ts:30](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/QueueManager.ts#L30)

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`number`
