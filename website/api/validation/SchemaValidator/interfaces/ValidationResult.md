# Interface: ValidationResult

Defined in: [src/validation/SchemaValidator.ts:31](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L31)

Result of a schema validation operation.

 ValidationResult

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [src/validation/SchemaValidator.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L37)

The validated and potentially transformed data

***

### errors?

> `optional` **errors**: [`ValidationError`](ValidationError.md)[]

Defined in: [src/validation/SchemaValidator.ts:35](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L35)

Array of validation errors if validation failed

***

### valid

> **valid**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L33)

Whether the validation passed
