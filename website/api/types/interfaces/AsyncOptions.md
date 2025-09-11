# Interface: AsyncOptions

Defined in: [src/types/index.ts:27](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L27)

## Properties

### buffer?

> `optional` **buffer**: `object`

Defined in: [src/types/index.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L37)

Buffer configuration.

#### flushInterval?

> `optional` **flushInterval**: `number`

Flush interval in milliseconds.

##### Default

```ts
100
```

#### flushSize?

> `optional` **flushSize**: `number`

Number of entries to trigger flush.

##### Default

```ts
1000
```

#### size?

> `optional` **size**: `number`

Size of the ring buffer.

##### Default

```ts
10000
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/index.ts:32](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L32)

Enable async logging.

#### Default

```ts
false
```
