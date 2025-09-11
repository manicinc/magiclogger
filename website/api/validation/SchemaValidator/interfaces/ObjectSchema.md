# Interface: ObjectSchema

Defined in: [src/validation/SchemaValidator.ts:128](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L128)

Object schema with nested field definitions.

 ObjectSchema

## Extends

- [`Schema`](Schema.md)

## Properties

### additionalProperties?

> `optional` **additionalProperties**: `boolean` \| [`AnySchema`](../type-aliases/AnySchema.md)

Defined in: [src/validation/SchemaValidator.ts:135](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L135)

Allow additional properties not defined in schema

***

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

### maxProperties?

> `optional` **maxProperties**: `number`

Defined in: [src/validation/SchemaValidator.ts:139](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L139)

Maximum number of properties

***

### minProperties?

> `optional` **minProperties**: `number`

Defined in: [src/validation/SchemaValidator.ts:137](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L137)

Minimum number of properties

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

### properties?

> `optional` **properties**: `Record`\<`string`, [`AnySchema`](../type-aliases/AnySchema.md)\>

Defined in: [src/validation/SchemaValidator.ts:131](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L131)

Schema for each property

***

### required?

> `optional` **required**: `string`[]

Defined in: [src/validation/SchemaValidator.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L133)

Required property names

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

> **type**: `"object"`

Defined in: [src/validation/SchemaValidator.ts:129](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L129)

The type of validation to perform

#### Overrides

[`Schema`](Schema.md).[`type`](Schema.md#type)

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
