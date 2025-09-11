# Interface: StyleOptions

Defined in: [src/types/styling.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L42)

Options for styling text.
Provides configuration for various styling operations.

 StyleOptions

## Properties

### cache?

> `optional` **cache**: `boolean`

Defined in: [src/types/styling.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L65)

Whether to cache styled results.

#### Default

```ts
true
```

***

### preserveWhitespace?

> `optional` **preserveWhitespace**: `boolean`

Defined in: [src/types/styling.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L59)

Whether to preserve whitespace in output.

#### Default

```ts
true
```

***

### stripExisting?

> `optional` **stripExisting**: `boolean`

Defined in: [src/types/styling.ts:53](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L53)

Whether to strip existing ANSI codes before styling.

#### Default

```ts
false
```

***

### useColors?

> `optional` **useColors**: `boolean`

Defined in: [src/types/styling.ts:47](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L47)

Whether to apply colors.

#### Default

```ts
true
```
