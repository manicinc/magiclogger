# Interface: TagNormalizationRules

Defined in: [src/core/TagManager.ts:63](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L63)

Tag normalization rules.

 TagNormalizationRules

## Properties

### custom()?

> `optional` **custom**: (`tag`) => `string`

Defined in: [src/core/TagManager.ts:91](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L91)

Custom normalization function.

#### Parameters

##### tag

`string`

#### Returns

`string`

***

### removeSpecialChars?

> `optional` **removeSpecialChars**: `boolean`

Defined in: [src/core/TagManager.ts:86](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L86)

Remove special characters.

#### Default

```ts
true
```

***

### replaceSpaces?

> `optional` **replaceSpaces**: `boolean`

Defined in: [src/core/TagManager.ts:80](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L80)

Replace spaces with hyphens.

#### Default

```ts
true
```

***

### toLowerCase?

> `optional` **toLowerCase**: `boolean`

Defined in: [src/core/TagManager.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L68)

Convert to lowercase.

#### Default

```ts
true
```

***

### trim?

> `optional` **trim**: `boolean`

Defined in: [src/core/TagManager.ts:74](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L74)

Trim whitespace.

#### Default

```ts
true
```
