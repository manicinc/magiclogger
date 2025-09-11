# Interface: TransportManagerOptions

Defined in: [src/types/transport.ts:1304](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1304)

Transport manager configuration.

## Properties

### aggregation?

> `optional` **aggregation**: `object`

Defined in: [src/types/transport.ts:1331](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1331)

Aggregation configuration.

#### fields?

> `optional` **fields**: (`"level"` \| `"custom"` \| `"tags"` \| `"loggerId"`)[]

Fields to aggregate.

#### interval?

> `optional` **interval**: `number`

Interval for aggregation reports in milliseconds.

##### Default

```ts
60000 (1 minute)
```

#### targets?

> `optional` **targets**: `string`[]

Transports to send aggregated data to.

***

### defaultTimeout?

> `optional` **defaultTimeout**: `number`

Defined in: [src/types/transport.ts:1309](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1309)

Default timeout for all transports.

#### Default

```ts
30000
```

***

### enableAggregation?

> `optional` **enableAggregation**: `boolean`

Defined in: [src/types/transport.ts:1326](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1326)

Whether to aggregate logs from multiple sources.

#### Default

```ts
false
```

***

### errorHandler()?

> `optional` **errorHandler**: (`error`, `transport`, `entry?`) => `void`

Defined in: [src/types/transport.ts:1320](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1320)

Global error handler for all transports.

#### Parameters

##### error

`Error`

##### transport

[`Transport`](Transport.md)

##### entry?

[`LogEntry`](LogEntry.md)

#### Returns

`void`

***

### stopOnSuccess?

> `optional` **stopOnSuccess**: `boolean`

Defined in: [src/types/transport.ts:1315](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L1315)

Whether to stop on first transport success (fail-fast).

#### Default

```ts
false
```
