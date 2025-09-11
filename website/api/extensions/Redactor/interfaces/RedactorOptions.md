# Interface: RedactorOptions

Defined in: [src/extensions/Redactor.ts:68](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L68)

Redactor configuration options.

## Properties

### auditTrail?

> `optional` **auditTrail**: `boolean`

Defined in: [src/extensions/Redactor.ts:117](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L117)

Enable audit trail for compliance.

#### Default

```ts
false
```

***

### cacheEnabled?

> `optional` **cacheEnabled**: `boolean`

Defined in: [src/extensions/Redactor.ts:128](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L128)

Cache redacted values for performance.

#### Default

```ts
true
```

***

### contextAware?

> `optional` **contextAware**: `boolean`

Defined in: [src/extensions/Redactor.ts:111](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L111)

Enable context-aware redaction.

#### Default

```ts
true
```

***

### deep?

> `optional` **deep**: `boolean`

Defined in: [src/extensions/Redactor.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L99)

Enable deep object traversal.

#### Default

```ts
true
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [src/extensions/Redactor.ts:73](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L73)

Enable redaction.

#### Default

```ts
true
```

***

### excludeFields?

> `optional` **excludeFields**: `string`[]

Defined in: [src/extensions/Redactor.ts:93](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L93)

Fields to never redact.

***

### fields?

> `optional` **fields**: `string`[]

Defined in: [src/extensions/Redactor.ts:88](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L88)

Fields to always redact.

***

### maxCacheSize?

> `optional` **maxCacheSize**: `number`

Defined in: [src/extensions/Redactor.ts:134](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L134)

Maximum cache size.

#### Default

```ts
1000
```

***

### maxDepth?

> `optional` **maxDepth**: `number`

Defined in: [src/extensions/Redactor.ts:105](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L105)

Maximum traversal depth.

#### Default

```ts
10
```

***

### patterns?

> `optional` **patterns**: [`RedactionPattern`](RedactionPattern.md)[]

Defined in: [src/extensions/Redactor.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L83)

Custom redaction patterns.

***

### preset?

> `optional` **preset**: [`RedactionPreset`](../type-aliases/RedactionPreset.md)

Defined in: [src/extensions/Redactor.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L78)

Redaction preset level.

***

### tokenSalt?

> `optional` **tokenSalt**: `string`

Defined in: [src/extensions/Redactor.ts:122](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/extensions/Redactor.ts#L122)

Tokenization salt for consistent tokens.
