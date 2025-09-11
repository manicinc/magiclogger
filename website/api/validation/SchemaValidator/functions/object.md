# Function: object()

> **object**(`properties`, `options?`): [`ObjectSchema`](../interfaces/ObjectSchema.md)

Defined in: [src/validation/SchemaValidator.ts:856](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L856)

Factory function to create an object schema.

## Parameters

### properties

`Record`\<`string`, [`AnySchema`](../type-aliases/AnySchema.md)\>

Object properties

### options?

`Partial`\<[`ObjectSchema`](../interfaces/ObjectSchema.md)\>

Additional options

## Returns

[`ObjectSchema`](../interfaces/ObjectSchema.md)

The object schema
