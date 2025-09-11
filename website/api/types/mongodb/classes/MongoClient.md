# Class: MongoClient

Defined in: [src/types/mongodb.d.ts:5](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L5)

## Constructors

### Constructor

> **new MongoClient**(`uri`, `options?`): `MongoClient`

Defined in: [src/types/mongodb.d.ts:6](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L6)

#### Parameters

##### uri

`string`

##### options?

`any`

#### Returns

`MongoClient`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/types/mongodb.d.ts:8](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L8)

#### Returns

`Promise`\<`void`\>

***

### connect()

> **connect**(): `Promise`\<`MongoClient`\>

Defined in: [src/types/mongodb.d.ts:7](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L7)

#### Returns

`Promise`\<`MongoClient`\>

***

### db()

> **db**(`dbName?`): [`Db`](../interfaces/Db.md)

Defined in: [src/types/mongodb.d.ts:9](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/mongodb.d.ts#L9)

#### Parameters

##### dbName?

`string`

#### Returns

[`Db`](../interfaces/Db.md)
