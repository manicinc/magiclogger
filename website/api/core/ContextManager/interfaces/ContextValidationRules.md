# Interface: ContextValidationRules

Defined in: [src/core/ContextManager.ts:80](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L80)

Context validation rules.

 ContextValidationRules

## Properties

### custom()?

> `optional` **custom**: (`context`) => `boolean`

Defined in: [src/core/ContextManager.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L94)

Custom validation function.

#### Parameters

##### context

`Record`\<`string`, `unknown`\>

#### Returns

`boolean`

***

### required?

> `optional` **required**: `string`[]

Defined in: [src/core/ContextManager.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L84)

Required fields.

***

### types?

> `optional` **types**: `Record`\<`string`, `string`\>

Defined in: [src/core/ContextManager.ts:89](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/ContextManager.ts#L89)

Field type definitions.
