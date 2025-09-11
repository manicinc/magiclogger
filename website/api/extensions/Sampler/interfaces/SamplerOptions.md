# Interface: SamplerOptions

Defined in: [src/extensions/Sampler.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L21)

Sampling configuration options.

## Properties

### adjustInterval?

> `optional` **adjustInterval**: `number`

Defined in: [src/extensions/Sampler.ts:60](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L60)

Adjustment interval for adaptive sampling (ms).

#### Default

```ts
60000
```

***

### keyFn()?

> `optional` **keyFn**: (`entry`) => `string`

Defined in: [src/extensions/Sampler.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L37)

Function to generate sampling key for deterministic sampling.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`string`

***

### maxRate?

> `optional` **maxRate**: `number`

Defined in: [src/extensions/Sampler.ts:54](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L54)

Maximum sampling rate for adaptive strategy.

#### Default

```ts
1.0
```

***

### minRate?

> `optional` **minRate**: `number`

Defined in: [src/extensions/Sampler.ts:48](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L48)

Minimum sampling rate for adaptive strategy.

#### Default

```ts
0.001
```

***

### rate

> **rate**: `number`

Defined in: [src/extensions/Sampler.ts:26](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L26)

Sampling rate (0-1).
0 = no logs, 1 = all logs

***

### reservoirSize?

> `optional` **reservoirSize**: `number`

Defined in: [src/extensions/Sampler.ts:66](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L66)

Reservoir size for reservoir sampling.

#### Default

```ts
1000
```

***

### strategy?

> `optional` **strategy**: [`SamplingStrategy`](../type-aliases/SamplingStrategy.md)

Defined in: [src/extensions/Sampler.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L32)

Sampling strategy to use.

#### Default

```ts
'random'
```

***

### targetRate?

> `optional` **targetRate**: `number`

Defined in: [src/extensions/Sampler.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L42)

Target logs per second for adaptive sampling.
