# Class: SchemaValidator

Defined in: [src/validation/SchemaValidator.ts:239](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L239)

Main schema validator class.

 SchemaValidator

## Example

```typescript
const validator = new SchemaValidator();

const userSchema: ObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', min: 0, max: 150 },
    roles: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['id', 'email']
};

const result = validator.validate(data, userSchema);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Constructors

### Constructor

> **new SchemaValidator**(): `SchemaValidator`

#### Returns

`SchemaValidator`

## Methods

### validate()

> **validate**(`data`, `schema`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [src/validation/SchemaValidator.ts:251](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L251)

Validates data against a schema.

#### Parameters

##### data

`unknown`

The data to validate

##### schema

[`AnySchema`](../type-aliases/AnySchema.md)

The schema to validate against

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

The validation result
