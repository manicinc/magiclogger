# Interface: ContextMinificationOptions

Defined in: [src/types/index.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L59)

## Properties

### compress?

> `optional` **compress**: `boolean`

Defined in: [src/types/index.ts:75](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L75)

Compress context data.

#### Default

```ts
false
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/types/index.ts:64](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L64)

Enable context minification.

#### Default

```ts
false
```

***

### rules?

> `optional` **rules**: `Record`\<`string`, `string`\>

Defined in: [src/types/index.ts:69](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/index.ts#L69)

Minification rules mapping long keys to short keys.
