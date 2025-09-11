# Interface: NumberSchema

Defined in: [src/validation/SchemaValidator.ts:94](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L94)

Number schema with numeric validations.

 NumberSchema

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

### integer?

> `optional` **integer**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:101](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L101)

Must be an integer

***

### max?

> `optional` **max**: `number`

Defined in: [src/validation/SchemaValidator.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L99)

Maximum value (inclusive)

***

### min?

> `optional` **min**: `number`

Defined in: [src/validation/SchemaValidator.ts:97](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L97)

Minimum value (inclusive)

***

### multipleOf?

> `optional` **multipleOf**: `number`

Defined in: [src/validation/SchemaValidator.ts:107](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L107)

Must be a multiple of this value

***

### negative?

> `optional` **negative**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:105](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L105)

Must be negative

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

### positive?

> `optional` **positive**: `boolean`

Defined in: [src/validation/SchemaValidator.ts:103](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L103)

Must be positive

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

> **type**: `"number"`

Defined in: [src/validation/SchemaValidator.ts:95](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L95)

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
