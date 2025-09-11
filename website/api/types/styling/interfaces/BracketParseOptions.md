# Interface: BracketParseOptions

Defined in: [src/types/styling.ts:298](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L298)

Configuration for bracket syntax parsing.

 BracketParseOptions

## Properties

### allowNested?

> `optional` **allowNested**: `boolean`

Defined in: [src/types/styling.ts:327](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L327)

Whether to allow nested brackets.

#### Default

```ts
true
```

***

### closeBracket?

> `optional` **closeBracket**: `string`

Defined in: [src/types/styling.ts:309](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L309)

Closing bracket sequence.

#### Default

```ts
']]'
```

***

### endTag?

> `optional` **endTag**: `string`

Defined in: [src/types/styling.ts:321](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L321)

End tag for styled section.

#### Default

```ts
'[[/]]'
```

***

### maxNestingDepth?

> `optional` **maxNestingDepth**: `number`

Defined in: [src/types/styling.ts:333](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L333)

Maximum nesting depth.

#### Default

```ts
10
```

***

### openBracket?

> `optional` **openBracket**: `string`

Defined in: [src/types/styling.ts:303](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L303)

Opening bracket sequence.

#### Default

```ts
'[['
```

***

### styleSeparator?

> `optional` **styleSeparator**: `string`

Defined in: [src/types/styling.ts:315](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L315)

Style separator within brackets.

#### Default

```ts
'.'
```
