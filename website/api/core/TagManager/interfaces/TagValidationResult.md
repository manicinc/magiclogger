# Interface: TagValidationResult

Defined in: [src/core/TagManager.ts:216](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L216)

Tag validation result.

 TagValidationResult

## Properties

### errors?

> `optional` **errors**: `Record`\<`string`, `string`[]\>

Defined in: [src/core/TagManager.ts:230](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L230)

Validation errors.

***

### invalid?

> `optional` **invalid**: `string`[]

Defined in: [src/core/TagManager.ts:225](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L225)

Invalid tags.

***

### valid

> **valid**: `boolean`

Defined in: [src/core/TagManager.ts:220](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/core/TagManager.ts#L220)

Whether validation passed.
