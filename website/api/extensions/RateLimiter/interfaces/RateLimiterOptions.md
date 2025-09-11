# Interface: RateLimiterOptions

Defined in: [src/extensions/RateLimiter.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L20)

Rate limiter configuration options.

## Properties

### capacity?

> `optional` **capacity**: `number`

Defined in: [src/extensions/RateLimiter.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L55)

Token bucket specific: bucket capacity.

***

### keyFn()?

> `optional` **keyFn**: (`entry`) => `string`

Defined in: [src/extensions/RateLimiter.ts:40](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L40)

Key function for per-key rate limiting.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string`

***

### max

> **max**: `number`

Defined in: [src/extensions/RateLimiter.ts:24](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L24)

Maximum number of logs allowed.

***

### onLimit()?

> `optional` **onLimit**: (`key`, `dropped`) => `void`

Defined in: [src/extensions/RateLimiter.ts:45](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L45)

Callback when rate limit is exceeded.

#### Parameters

##### key

`string`

##### dropped

`number`

#### Returns

`void`

***

### refillRate?

> `optional` **refillRate**: `number`

Defined in: [src/extensions/RateLimiter.ts:50](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L50)

Token bucket specific: refill rate (tokens per second).

***

### strategy?

> `optional` **strategy**: [`RateLimitStrategy`](../type-aliases/RateLimitStrategy.md)

Defined in: [src/extensions/RateLimiter.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L35)

Rate limiting strategy.

#### Default

```ts
'sliding'
```

***

### window

> **window**: `number`

Defined in: [src/extensions/RateLimiter.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/RateLimiter.ts#L29)

Time window in milliseconds.
