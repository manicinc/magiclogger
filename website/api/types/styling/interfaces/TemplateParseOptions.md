# Interface: TemplateParseOptions

Defined in: [src/types/styling.ts:341](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L341)

Configuration for template parsing.

 TemplateParseOptions

## Properties

### allowInterpolation?

> `optional` **allowInterpolation**: `boolean`

Defined in: [src/types/styling.ts:370](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L370)

Whether to allow variable interpolation.

#### Default

```ts
true
```

***

### cache?

> `optional` **cache**: `boolean`

Defined in: [src/types/styling.ts:376](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L376)

Whether to cache parsed templates.

#### Default

```ts
true
```

***

### closeBrace?

> `optional` **closeBrace**: `string`

Defined in: [src/types/styling.ts:364](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L364)

Closing brace for styled content.

#### Default

```ts
'}'
```

***

### openBrace?

> `optional` **openBrace**: `string`

Defined in: [src/types/styling.ts:358](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L358)

Opening brace for styled content.

#### Default

```ts
'{'
```

***

### stylePrefix?

> `optional` **stylePrefix**: `string`

Defined in: [src/types/styling.ts:346](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L346)

Style prefix character.

#### Default

```ts
'@'
```

***

### styleSeparator?

> `optional` **styleSeparator**: `string`

Defined in: [src/types/styling.ts:352](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L352)

Style separator.

#### Default

```ts
'.'
```
