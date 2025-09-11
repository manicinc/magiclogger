# Interface: AggregationStats

Defined in: [src/types/transport.ts:1353](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1353)

Log aggregation statistics.

## Properties

### avgSize?

> `optional` **avgSize**: `number`

Defined in: [src/types/transport.ts:1390](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1390)

Average log size in bytes.

***

### byLevel

> **byLevel**: `Record`\<[`LogLevel`](../../logger/type-aliases/LogLevel.md), `number`\>

Defined in: [src/types/transport.ts:1370](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1370)

Breakdown by log level.

***

### byLogger?

> `optional` **byLogger**: `Record`\<`string`, `number`\>

Defined in: [src/types/transport.ts:1375](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1375)

Breakdown by logger ID.

***

### byTags?

> `optional` **byTags**: `Record`\<`string`, `number`\>

Defined in: [src/types/transport.ts:1380](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1380)

Breakdown by tags.

***

### custom?

> `optional` **custom**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/transport.ts:1395](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1395)

Custom aggregated metrics.

***

### errorRate

> **errorRate**: `number`

Defined in: [src/types/transport.ts:1385](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1385)

Error rate.

***

### period

> **period**: `object`

Defined in: [src/types/transport.ts:1357](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1357)

Time period for these stats.

#### end

> **end**: `Date`

#### start

> **start**: `Date`

***

### total

> **total**: `number`

Defined in: [src/types/transport.ts:1365](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1365)

Total log count.
