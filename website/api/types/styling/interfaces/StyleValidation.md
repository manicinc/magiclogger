# Interface: StyleValidation

Defined in: [src/types/styling.ts:233](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L233)

Style validation result.
Contains validation status and any errors.

 StyleValidation

## Properties

### errors

> **errors**: `string`[]

Defined in: [src/types/styling.ts:242](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L242)

List of validation errors if any.

***

### suggestions?

> `optional` **suggestions**: `string`[]

Defined in: [src/types/styling.ts:252](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L252)

Suggested fixes for errors.

***

### valid

> **valid**: `boolean`

Defined in: [src/types/styling.ts:237](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L237)

Whether the style/template is valid.

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [src/types/styling.ts:247](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/styling.ts#L247)

List of warnings if any.
