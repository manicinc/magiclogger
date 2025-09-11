# Interface: EnumSchema

Defined in: [src/validation/SchemaValidator.ts:190](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L190)

Enum schema - value must be one of the allowed values.

 EnumSchema

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

> **type**: `"enum"`

Defined in: [src/validation/SchemaValidator.ts:191](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L191)

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

***

### values

> **values**: `unknown`[]

Defined in: [src/validation/SchemaValidator.ts:193](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L193)

Allowed values
