# Interface: IStylingAPI

Defined in: [src/types/styling.ts:189](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L189)

Styling API interface.
Defines all styling methods available on a logger.

 IStylingAPI

## Properties

### fmt

> **fmt**: [`TemplateFormatter`](../type-aliases/TemplateFormatter.md)

Defined in: [src/types/styling.ts:206](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L206)

Template literal formatter.

#### Example

```ts
logger.fmt`@red{Error}: ${message}`
```

***

### s

> `readonly` **s**: [`IStyleBuilder`](IStyleBuilder.md)

Defined in: [src/types/styling.ts:194](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L194)

Chainable style builder.

#### Example

```ts
logger.s.red.bold('Error')
```

***

### style

> `readonly` **style**: [`IStyleBuilder`](IStyleBuilder.md)

Defined in: [src/types/styling.ts:200](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L200)

Alias for style builder.

#### Example

```ts
logger.style.green('Success')
```

## Methods

### parseBrackets()

> **parseBrackets**(`text`): `string`

Defined in: [src/types/styling.ts:224](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L224)

Parse bracket syntax in text.

#### Parameters

##### text

`string`

#### Returns

`string`

#### Example

```ts
logger.parseBrackets('[[red]]Error:[[/]] Failed')
```

***

### parts()

> **parts**(`parts`): `string`

Defined in: [src/types/styling.ts:212](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L212)

Style parts of text explicitly.

#### Parameters

##### parts

[`StyledPart`](../type-aliases/StyledPart.md)[]

#### Returns

`string`

#### Example

```ts
logger.parts([['Error:', 'red', 'bold'], [' Failed']])
```

***

### styleByIndex()

> **styleByIndex**(`text`, `styleMap`): `string`

Defined in: [src/types/styling.ts:218](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L218)

Style by word index.

#### Parameters

##### text

`string`

##### styleMap

[`WordStyleMap`](../type-aliases/WordStyleMap.md)

#### Returns

`string`

#### Example

```ts
logger.styleByIndex('Error: Failed', { 0: ['red'] })
```
