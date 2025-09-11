# Interface: ArraySchema

Defined in: [src/validation/SchemaValidator.ts:148](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L148)

Array schema with item validation.

 ArraySchema

## Extends

- [`Schema`](Schema.md)

## Properties

### default?

> `optional` **default**: `unknown`

Defined in: [src/validation/SchemaValidator.ts:57](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L57)

Default value if field is missing

#### Inherited from

[`Schema`](Schema.md).[`default`](Schema.md#default)

***

### description?

> `optional` **description**: `string`

Defined in: [src/validation/SchemaValidator.ts:59](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L59)

Description for documentation

#### Inherited from

[`Schema`](Schema.md).[`description`](Schema.md#description)

***

### items?

> `optional` **items**: [`AnySchema`](../type-aliases/AnySchema.md)

Defined in: [src/validation/SchemaValidator.ts:151](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L151)

Schema for array items

***

### maxItems?

> `optional` **maxItems**: `number`

Defined in: [src/validation/SchemaValidator.ts:155](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L155)

Maximum array length

***

### minItems?

> `optional` **minItems**: `number`

Defined in: [src/validation/SchemaValidator.ts:153](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L153)

Minimum array length

***

### nullable?

> `optional` **nullable**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:51](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L51)

Whether to allow null values

#### Inherited from

[`Schema`](Schema.md).[`nullable`](Schema.md#nullable)

***

### optional?

> `optional` **optional**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L49)

Whether this field is optional

#### Inherited from

[`Schema`](Schema.md).[`optional`](Schema.md#optional)

***

### transform()?

> `optional` **transform**: (`value`) => `unknown`

Defined in: [src/validation/SchemaValidator.ts:55](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L55)

Transform function to modify the value after validation

#### Parameters

##### value

`unknown`

#### Returns

`unknown`

#### Inherited from

[`Schema`](Schema.md).[`transform`](Schema.md#transform)

***

### type

> **type**: `"array"`

Defined in: [src/validation/SchemaValidator.ts:149](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L149)

The type of validation to perform

#### Overrides

[`Schema`](Schema.md).[`type`](Schema.md#type)

***

### uniqueItems?

> `optional` **uniqueItems**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:157](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L157)

All items must be unique

***

### validate()?

> `optional` **validate**: (`value`) => `string` \| `boolean`

Defined in: [src/validation/SchemaValidator.ts:53](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L53)

Custom validation function

#### Parameters

##### value

`unknown`

#### Returns

`string` \| `boolean`

#### Inherited from

[`Schema`](Schema.md).[`validate`](Schema.md#validate)
