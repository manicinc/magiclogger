# Class: Pool

Defined in: [src/types/external/pg.d.ts:4](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/external/pg.d.ts#L4)

## Constructors

### Constructor

> **new Pool**(`config`): `Pool`

Defined in: [src/types/external/pg.d.ts:5](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/external/pg.d.ts#L5)

#### Parameters

##### config

`Record`\<`string`, `unknown`\>

#### Returns

`Pool`

## Methods

### connect()

> **connect**(): `Promise`\<\{ `query`: (`text`, `params?`) => `Promise`\<\{ `rowCount`: `number`; `rows`: `Record`\<`string`, `unknown`\>[]; \}\>; `release`: () => `void`; \}\>

Defined in: [src/types/external/pg.d.ts:6](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/external/pg.d.ts#L6)

#### Returns

`Promise`\<\{ `query`: (`text`, `params?`) => `Promise`\<\{ `rowCount`: `number`; `rows`: `Record`\<`string`, `unknown`\>[]; \}\>; `release`: () => `void`; \}\>

***

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [src/types/external/pg.d.ts:13](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/types/external/pg.d.ts#L13)

#### Returns

`Promise`\<`void`\>
