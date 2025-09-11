# Interface: LiteralSchema

Defined in: [src/validation/SchemaValidator.ts:178](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L178)

Literal schema - exact value match.

 LiteralSchema

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

> **type**: `"literal"`

Defined in: [src/validation/SchemaValidator.ts:179](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L179)

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

### value

> **value**: `unknown`

Defined in: [src/validation/SchemaValidator.ts:181](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/validation/SchemaValidator.ts#L181)

The exact value to match
