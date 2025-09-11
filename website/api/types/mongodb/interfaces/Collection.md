# Interface: Collection\<T\>

Defined in: [src/types/mongodb.d.ts:16](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L16)

## Type Parameters

### T

`T` = `any`

## Methods

### deleteMany()

> **deleteMany**(`filter`): `Promise`\<`any`\>

Defined in: [src/types/mongodb.d.ts:23](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L23)

#### Parameters

##### filter

`any`

#### Returns

`Promise`\<`any`\>

***

### deleteOne()

> **deleteOne**(`filter`): `Promise`\<`any`\>

Defined in: [src/types/mongodb.d.ts:22](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L22)

#### Parameters

##### filter

`any`

#### Returns

`Promise`\<`any`\>

***

### find()

> **find**(`filter?`): `any`

Defined in: [src/types/mongodb.d.ts:19](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L19)

#### Parameters

##### filter?

`any`

#### Returns

`any`

***

### findOne()

> **findOne**(`filter?`): `Promise`\<`null` \| `T`\>

Defined in: [src/types/mongodb.d.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L20)

#### Parameters

##### filter?

`any`

#### Returns

`Promise`\<`null` \| `T`\>

***

### insertMany()

> **insertMany**(`docs`): `Promise`\<`any`\>

Defined in: [src/types/mongodb.d.ts:18](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L18)

#### Parameters

##### docs

`T`[]

#### Returns

`Promise`\<`any`\>

***

### insertOne()

> **insertOne**(`doc`): `Promise`\<`any`\>

Defined in: [src/types/mongodb.d.ts:17](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L17)

#### Parameters

##### doc

`T`

#### Returns

`Promise`\<`any`\>

***

### updateOne()

> **updateOne**(`filter`, `update`, `options?`): `Promise`\<`any`\>

Defined in: [src/types/mongodb.d.ts:21](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L21)

#### Parameters

##### filter

`any`

##### update

`any`

##### options?

`any`

#### Returns

`Promise`\<`any`\>
