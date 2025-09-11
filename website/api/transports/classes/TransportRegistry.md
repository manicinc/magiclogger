# Class: TransportRegistry

Defined in: [src/transports/index.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/index.ts#L82)

Registry for transport factories to enable tree-shaking
Transports are registered only when explicitly imported

## Constructors

### Constructor

> **new TransportRegistry**(): `TransportRegistry`

#### Returns

`TransportRegistry`

## Methods

### clear()

> `static` **clear**(): `void`

Defined in: [src/transports/index.ts:123](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/index.ts#L123)

Clear all registered factories

#### Returns

`void`

***

### get()

> `static` **get**(`type`): `undefined` \| [`TransportFactory`](../type-aliases/TransportFactory.md)

Defined in: [src/transports/index.ts:99](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/index.ts#L99)

Get a transport factory

#### Parameters

##### type

`string`

Transport type identifier

#### Returns

`undefined` \| [`TransportFactory`](../type-aliases/TransportFactory.md)

Factory function if found

***

### getTypes()

> `static` **getTypes**(): `string`[]

Defined in: [src/transports/index.ts:116](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/index.ts#L116)

Get all registered transport types

#### Returns

`string`[]

Array of registered types

***

### has()

> `static` **has**(`type`): `boolean`

Defined in: [src/transports/index.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/index.ts#L108)

Check if a transport type is registered

#### Parameters

##### type

`string`

Transport type identifier

#### Returns

`boolean`

True if registered

***

### register()

> `static` **register**(`type`, `factory`): `void`

Defined in: [src/transports/index.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/index.ts#L90)

Register a transport factory

#### Parameters

##### type

`string`

Transport type identifier

##### factory

[`TransportFactory`](../type-aliases/TransportFactory.md)

Factory function

#### Returns

`void`
