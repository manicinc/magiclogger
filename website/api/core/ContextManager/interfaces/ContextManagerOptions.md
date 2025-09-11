# Interface: ContextManagerOptions

Defined in: [src/core/ContextManager.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L23)

Context manager configuration options.

 ContextManagerOptions

## Properties

### enableValidation?

> `optional` **enableValidation**: `boolean`

Defined in: [src/core/ContextManager.ts:57](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L57)

Whether to enable validation.

#### Default

```ts
true
```

***

### freezeContext?

> `optional` **freezeContext**: `boolean`

Defined in: [src/core/ContextManager.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L51)

Whether to freeze context objects.

#### Default

```ts
false
```

***

### maxDepth?

> `optional` **maxDepth**: `number`

Defined in: [src/core/ContextManager.ts:28](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L28)

Maximum depth for nested objects.

#### Default

```ts
10
```

***

### maxProperties?

> `optional` **maxProperties**: `number`

Defined in: [src/core/ContextManager.ts:34](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L34)

Maximum number of properties per object.

#### Default

```ts
100
```

***

### sanitize()?

> `optional` **sanitize**: (`value`) => `unknown`

Defined in: [src/core/ContextManager.ts:45](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L45)

Custom sanitization function.

#### Parameters

##### value

`unknown`

#### Returns

`unknown`

***

### sanitizeMode?

> `optional` **sanitizeMode**: [`SanitizeMode`](../type-aliases/SanitizeMode.md)

Defined in: [src/core/ContextManager.ts:40](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L40)

Sanitization mode for context values.

#### Default

```ts
'basic'
```

***

### schema?

> `optional` **schema**: [`AnySchema`](../../../validation/SchemaValidator/type-aliases/AnySchema.md)

Defined in: [src/core/ContextManager.ts:63](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L63)

Schema for context validation (lazily imported when used).
When provided, contexts will be validated against this schema.

***

### schemaValidationMode?

> `optional` **schemaValidationMode**: `"warn"` \| `"silent"` \| `"throw"`

Defined in: [src/core/ContextManager.ts:72](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L72)

What to do when schema validation fails.
- 'throw': Throw an error (strict mode)
- 'warn': Log a warning and continue
- 'silent': Silently continue

#### Default

```ts
'warn'
```
