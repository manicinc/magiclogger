# Class: RateLimiter

Defined in: [src/extensions/RateLimiter.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L82)

Rate limiter for controlling log throughput.

 RateLimiter

## Constructors

### Constructor

> **new RateLimiter**(`options`): `RateLimiter`

Defined in: [src/extensions/RateLimiter.ts:89](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L89)

#### Parameters

##### options

[`RateLimiterOptions`](../interfaces/RateLimiterOptions.md)

#### Returns

`RateLimiter`

## Methods

### allow()

> **allow**(`entry`): `boolean`

Defined in: [src/extensions/RateLimiter.ts:112](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L112)

Check if a log entry is allowed through rate limiter.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`

***

### getStats()

> **getStats**(): `object`

Defined in: [src/extensions/RateLimiter.ts:256](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L256)

Get rate limiting statistics.

#### Returns

`object`

##### dropped

> **dropped**: `Map`\<`string`, `number`\>

##### keys

> **keys**: `number`

##### strategy

> **strategy**: [`RateLimitStrategy`](../type-aliases/RateLimitStrategy.md)

***

### reset()

> **reset**(): `void`

Defined in: [src/extensions/RateLimiter.ts:269](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L269)

Reset rate limiter state.

#### Returns

`void`

***

### resetKey()

> **resetKey**(`key`): `void`

Defined in: [src/extensions/RateLimiter.ts:277](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L277)

Reset specific key.

#### Parameters

##### key

`string`

#### Returns

`void`
