# Interface: BatchingOptions

Defined in: [src/types/transport.ts:270](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L270)

Configuration for transports that batch logs before sending.

## Extended by

- [`BatchingTransportOptions`](BatchingTransportOptions.md)

## Properties

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/types/transport.ts:300](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L300)

Compress batches before sending (gzip).

#### Default

```ts
false
```

***

### immediate?

> `optional` **immediate**: `boolean`

Defined in: [src/types/transport.ts:294](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L294)

Whether to send logs immediately without batching.
Overrides other batch settings when true.

#### Default

```ts
false
```

***

### maxBatchBytes?

> `optional` **maxBatchBytes**: `number`

Defined in: [src/types/transport.ts:287](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L287)

Maximum size in bytes before sending a batch.

#### Default

```ts
1048576 (1MB)
```

***

### maxBatchSize?

> `optional` **maxBatchSize**: `number`

Defined in: [src/types/transport.ts:275](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L275)

Maximum number of logs to batch before sending.

#### Default

```ts
100
```

***

### maxBatchTime?

> `optional` **maxBatchTime**: `number`

Defined in: [src/types/transport.ts:281](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/transport.ts#L281)

Maximum time to wait before sending a batch (milliseconds).

#### Default

```ts
5000 (5 seconds)
```
