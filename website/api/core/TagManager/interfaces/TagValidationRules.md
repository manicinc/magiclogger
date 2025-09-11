# Interface: TagValidationRules

Defined in: [src/core/TagManager.ts:181](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L181)

Tag validation rules.

 TagValidationRules

## Properties

### custom()?

> `optional` **custom**: (`tag`) => `boolean`

Defined in: [src/core/TagManager.ts:208](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L208)

Custom validation function.

#### Parameters

##### tag

`string`

#### Returns

`boolean`

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [src/core/TagManager.ts:192](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L192)

Maximum tag length.

#### Default

```ts
50
```

***

### minLength?

> `optional` **minLength**: `number`

Defined in: [src/core/TagManager.ts:186](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L186)

Minimum tag length.

#### Default

```ts
2
```

***

### pattern?

> `optional` **pattern**: `RegExp`

Defined in: [src/core/TagManager.ts:198](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L198)

Allowed characters pattern.

#### Default

```ts
/^[a-zA-Z0-9-_]+$/
```

***

### reserved?

> `optional` **reserved**: `string`[]

Defined in: [src/core/TagManager.ts:203](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L203)

Reserved tags that cannot be used.
