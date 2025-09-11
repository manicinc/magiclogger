# Interface: RedactionPattern

Defined in: [src/extensions/Redactor.ts:27](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L27)

Pattern definition for sensitive data detection.

## Properties

### confidence?

> `optional` **confidence**: `number`

Defined in: [src/extensions/Redactor.ts:52](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L52)

Confidence threshold (0-1) for fuzzy matching.

***

### contextKeywords?

> `optional` **contextKeywords**: `string`[]

Defined in: [src/extensions/Redactor.ts:57](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L57)

Context keywords that increase detection confidence.

***

### name

> **name**: `string`

Defined in: [src/extensions/Redactor.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L31)

Pattern name for identification.

***

### pattern

> **pattern**: `RegExp`

Defined in: [src/extensions/Redactor.ts:36](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L36)

Regular expression for detection.

***

### preserveFormat?

> `optional` **preserveFormat**: `boolean`

Defined in: [src/extensions/Redactor.ts:62](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L62)

Whether to preserve format (e.g., keep last 4 digits of credit card).

***

### replacement

> **replacement**: `string` \| (`match`) => `string`

Defined in: [src/extensions/Redactor.ts:41](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L41)

Replacement string or function.

***

### strategy?

> `optional` **strategy**: [`RedactionStrategy`](../type-aliases/RedactionStrategy.md)

Defined in: [src/extensions/Redactor.ts:47](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L47)

Redaction strategy.

#### Default

```ts
'mask'
```
