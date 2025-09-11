# Class: Sampler

Defined in: [src/extensions/Sampler.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L74)

Sampler class for statistical log sampling.

 Sampler

## Constructors

### Constructor

> **new Sampler**(): `Sampler`

Defined in: [src/extensions/Sampler.ts:89](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L89)

Creates a new Sampler instance.

#### Returns

`Sampler`

### Constructor

> **new Sampler**(`options`): `Sampler`

Defined in: [src/extensions/Sampler.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L90)

#### Parameters

##### options

[`SamplerOptions`](../interfaces/SamplerOptions.md)

#### Returns

`Sampler`

## Methods

### getReservoir()

> **getReservoir**(): [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

Defined in: [src/extensions/Sampler.ts:257](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L257)

Get reservoir samples (for reservoir sampling).

#### Returns

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)[]

***

### getStats()

> **getStats**(): `object`

Defined in: [src/extensions/Sampler.ts:209](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L209)

Get current sampling statistics.

#### Returns

`object`

##### currentRate

> **currentRate**: `number`

##### effectiveRate

> **effectiveRate**: `number`

##### sampleCount

> **sampleCount**: `number`

##### strategy

> **strategy**: [`SamplingStrategy`](../type-aliases/SamplingStrategy.md)

##### totalCount

> **totalCount**: `number`

***

### reset()

> **reset**(): `void`

Defined in: [src/extensions/Sampler.ts:241](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L241)

Reset sampling statistics.

#### Returns

`void`

***

### setRate()

> **setRate**(`rate`): `void`

Defined in: [src/extensions/Sampler.ts:251](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L251)

Update sampling rate.

#### Parameters

##### rate

`number`

#### Returns

`void`

***

### shouldSample()

> **shouldSample**(`entry`): `boolean`

Defined in: [src/extensions/Sampler.ts:115](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Sampler.ts#L115)

Determine if a log entry should be sampled.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

#### Returns

`boolean`
