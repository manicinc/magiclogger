# Interface: RetryOptions

Defined in: [src/types/transport.ts:395](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L395)

Retry configuration for network transports.

## Properties

### backoffFactor?

> `optional` **backoffFactor**: `number`

Defined in: [src/types/transport.ts:418](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L418)

Exponential backoff factor.

#### Default

```ts
2
```

***

### initialDelay?

> `optional` **initialDelay**: `number`

Defined in: [src/types/transport.ts:406](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L406)

Initial retry delay in milliseconds.

#### Default

```ts
1000 (1 second)
```

***

### jitter?

> `optional` **jitter**: `boolean`

Defined in: [src/types/transport.ts:424](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L424)

Add random jitter to retry delays to prevent thundering herd.

#### Default

```ts
true
```

***

### maxDelay?

> `optional` **maxDelay**: `number`

Defined in: [src/types/transport.ts:412](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L412)

Maximum retry delay in milliseconds.

#### Default

```ts
30000 (30 seconds)
```

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/transport.ts:400](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L400)

Maximum number of retry attempts.

#### Default

```ts
3
```

***

### retryCondition()?

> `optional` **retryCondition**: (`error`) => `boolean`

Defined in: [src/types/transport.ts:430](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L430)

Which errors should trigger a retry.
Return true to retry, false to fail immediately.

#### Parameters

##### error

`Error`

#### Returns

`boolean`
