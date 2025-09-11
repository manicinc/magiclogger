# Interface: TagManagerOptions

Defined in: [src/core/TagManager.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L23)

Configuration options for TagManager.

 TagManagerOptions

## Properties

### allowMixedTypes?

> `optional` **allowMixedTypes**: `boolean`

Defined in: [src/core/TagManager.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L55)

Allow string tags alongside structured tags.

#### Default

```ts
true
```

***

### autoNormalize?

> `optional` **autoNormalize**: `boolean`

Defined in: [src/core/TagManager.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L31)

Automatically normalize tags on add

#### Default

```ts
true
```

***

### enableValidation?

> `optional` **enableValidation**: `boolean`

Defined in: [src/core/TagManager.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L37)

Enable tag validation

#### Default

```ts
true
```

***

### maxTagLength?

> `optional` **maxTagLength**: `number`

Defined in: [src/core/TagManager.ts:28](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L28)

Maximum length for individual tags

#### Default

```ts
50
```

***

### maxTags?

> `optional` **maxTags**: `number`

Defined in: [src/core/TagManager.ts:25](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L25)

Maximum number of tags allowed per log entry

#### Default

```ts
50
```

***

### schema?

> `optional` **schema**: [`AnySchema`](../../../validation/SchemaValidator/type-aliases/AnySchema.md)

Defined in: [src/core/TagManager.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L43)

Optional schema for structured tag validation.
When provided, tags can be validated as objects.

***

### schemaValidationMode?

> `optional` **schemaValidationMode**: `"warn"` \| `"silent"` \| `"throw"`

Defined in: [src/core/TagManager.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L49)

Validation mode when schema validation fails.

#### Default

```ts
'warn'
```

***

### separator?

> `optional` **separator**: `string`

Defined in: [src/core/TagManager.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L34)

Separator for parsing tag strings

#### Default

```ts
','
```
