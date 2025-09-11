# Interface: ThemeConfig

Defined in: [src/types/theme.ts:67](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L67)

Theme configuration options for creating or extending themes.

## Properties

### base?

> `optional` **base**: `string` \| [`ThemeDefinition`](../type-aliases/ThemeDefinition.md)

Defined in: [src/types/theme.ts:71](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L71)

Base theme to extend from.

***

### merge?

> `optional` **merge**: `boolean`

Defined in: [src/types/theme.ts:87](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L87)

Whether to merge with base theme or replace.

#### Default

```ts
true
```

***

### overrides?

> `optional` **overrides**: `Partial`\<`Record`\<`string`, `string`[]\>\>

Defined in: [src/types/theme.ts:76](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L76)

Override specific styles.

***

### tagOverrides?

> `optional` **tagOverrides**: `Record`\<`string`, `string`[]\>

Defined in: [src/types/theme.ts:81](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/theme.ts#L81)

Tag-specific style overrides.
