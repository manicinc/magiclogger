# Interface: ValidationError

Defined in: [src/validation/SchemaValidator.ts:15](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L15)

Represents a validation error with details about what failed.

 ValidationError

## Properties

### expected?

> `optional` **expected**: `string`

Defined in: [src/validation/SchemaValidator.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L23)

The expected type or constraint

***

### message

> **message**: `string`

Defined in: [src/validation/SchemaValidator.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L19)

Human-readable error message

***

### path

> **path**: `string`

Defined in: [src/validation/SchemaValidator.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L17)

The field path that failed validation (e.g., "user.email")

***

### value?

> `optional` **value**: `unknown`

Defined in: [src/validation/SchemaValidator.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L21)

The actual value that failed validation
