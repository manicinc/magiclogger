# Interface: MetricsCollector

Defined in: [src/middleware/ObservabilityMiddleware.ts:10](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L10)

Metrics collector interface for observability.

## Methods

### gauge()

> **gauge**(`name`, `value`, `tags?`): `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L19)

Record a gauge metric.

#### Parameters

##### name

`string`

##### value

`number`

##### tags?

`Record`\<`string`, `string`\>

#### Returns

`void`

***

### histogram()

> **histogram**(`name`, `value`, `tags?`): `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:24](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L24)

Record a histogram metric.

#### Parameters

##### name

`string`

##### value

`number`

##### tags?

`Record`\<`string`, `string`\>

#### Returns

`void`

***

### increment()

> **increment**(`name`, `value?`, `tags?`): `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:14](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L14)

Increment a counter metric.

#### Parameters

##### name

`string`

##### value?

`number`

##### tags?

`Record`\<`string`, `string`\>

#### Returns

`void`

***

### timing()

> **timing**(`name`, `duration`, `tags?`): `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:29](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L29)

Record timing metric.

#### Parameters

##### name

`string`

##### duration

`number`

##### tags?

`Record`\<`string`, `string`\>

#### Returns

`void`
