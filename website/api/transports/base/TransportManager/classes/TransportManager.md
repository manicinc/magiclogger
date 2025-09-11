# Class: TransportManager

Defined in: [src/transports/base/TransportManager.ts:49](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L49)

TransportManager handles all transport operations for the logger.

This version uses a registry pattern to avoid importing all transports,
enabling proper tree-shaking. Transports must be registered before use.

 TransportManager

## Example

```typescript
// Register transports you need
import { TransportManager, TransportRegistry } from 'magiclogger/transports/base';
import { ConsoleTransport } from 'magiclogger/console';
import { FileTransport } from 'magiclogger/file';

// Register factories
TransportRegistry.register('console', (config) => new ConsoleTransport(config));
TransportRegistry.register('file', (config) => new FileTransport(config));

// Or use the helper to register core transports
import { registerCoreTransports } from 'magiclogger/transports/base';
await registerCoreTransports();

// Now create manager and add transports
const manager = new TransportManager();
await manager.addTransport({ type: 'console', level: 'info' });
```

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new TransportManager**(`options`): `TransportManager`

Defined in: [src/transports/base/TransportManager.ts:191](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L191)

Creates a new TransportManager instance.

#### Parameters

##### options

Configuration options

###### aggregation?

\{ `fields?`: (`"level"` \| `"custom"` \| `"tags"` \| `"loggerId"`)[]; `interval?`: `number`; `targets?`: `string`[]; \}

###### aggregation.fields?

(`"level"` \| `"custom"` \| `"tags"` \| `"loggerId"`)[]

###### aggregation.interval?

`number`

###### aggregation.targets?

`string`[]

###### defaultTimeout?

`number`

###### enableAggregation?

`boolean`

###### errorHandler?

(`error`, `transport`, `entry?`) => `void`

###### healthCheckIntervalMs?

`number`

###### maxPauseQueueSize?

`number`

###### stopOnSuccess?

`boolean`

###### useExternalRegistry?

`boolean`

#### Returns

`TransportManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### add()

> **add**(`transport`, `priority?`): `Promise`\<[`Transport`](../../../../types/transport/interfaces/Transport.md)\>

Defined in: [src/transports/base/TransportManager.ts:474](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L474)

Add a transport instance directly to the manager.
This is an alias for registerTransport for backward compatibility.

#### Parameters

##### transport

[`Transport`](../../../../types/transport/interfaces/Transport.md)

Transport instance to add

##### priority?

`number`

Optional priority for the transport

#### Returns

`Promise`\<[`Transport`](../../../../types/transport/interfaces/Transport.md)\>

The added transport

***

### addGlobalFilter()

> **addGlobalFilter**(`filter`): `void`

Defined in: [src/transports/base/TransportManager.ts:1210](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1210)

Add a global filter.

#### Parameters

##### filter

(`entry`) => `boolean`

Filter function

#### Returns

`void`

***

### addGlobalTransformer()

> **addGlobalTransformer**(`transformer`): `void`

Defined in: [src/transports/base/TransportManager.ts:1231](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1231)

Add a global transformer.

#### Parameters

##### transformer

(`entry`) => [`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

Transformer function

#### Returns

`void`

***

### addTransport()

> **addTransport**(`config`): `Promise`\<[`Transport`](../../../../types/transport/interfaces/Transport.md)\>

Defined in: [src/transports/base/TransportManager.ts:420](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L420)

Add a transport to the manager.

#### Parameters

##### config

[`TransportConfig`](../../../../types/transport/interfaces/TransportConfig.md)

Transport configuration

#### Returns

`Promise`\<[`Transport`](../../../../types/transport/interfaces/Transport.md)\>

The added transport

***

### checkHealth()

> **checkHealth**(): `Promise`\<`Record`\<`string`, `boolean`\>\>

Defined in: [src/transports/base/TransportManager.ts:1461](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1461)

Check health of all transports.

#### Returns

`Promise`\<`Record`\<`string`, `boolean`\>\>

Health status

***

### child()

> **child**(`options`): `TransportManager`

Defined in: [src/transports/base/TransportManager.ts:1532](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1532)

Create a child manager with shared transports.

#### Parameters

##### options

Child options

###### filters?

(`entry`) => `boolean`[]

###### transformers?

(`entry`) => [`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

#### Returns

`TransportManager`

Child manager

***

### clearGlobalProcessors()

> **clearGlobalProcessors**(): `void`

Defined in: [src/transports/base/TransportManager.ts:1250](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1250)

Clear all global filters and transformers.

#### Returns

`void`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:1274](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1274)

Close all transports and clean up.
Ensures graceful shutdown with proper state transitions.

#### Returns

`Promise`\<`void`\>

Resolves when closed

***

### disableTransport()

> **disableTransport**(`name`): `void`

Defined in: [src/transports/base/TransportManager.ts:1448](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1448)

Disable a transport.

#### Parameters

##### name

`string`

Transport name

#### Returns

`void`

***

### enableTransport()

> **enableTransport**(`name`): `void`

Defined in: [src/transports/base/TransportManager.ts:1435](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1435)

Enable a transport.

#### Parameters

##### name

`string`

Transport name

#### Returns

`void`

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:1260](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1260)

Flush all transports.

#### Returns

`Promise`\<`void`\>

Resolves when all flushed

***

### get()

> **get**(`name`): `undefined` \| [`Transport`](../../../../types/transport/interfaces/Transport.md)

Defined in: [src/transports/base/TransportManager.ts:643](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L643)

Get a transport by name.

#### Parameters

##### name

`string`

Transport name

#### Returns

`undefined` \| [`Transport`](../../../../types/transport/interfaces/Transport.md)

Transport instance or undefined

***

### getAggregationBufferSize()

> **getAggregationBufferSize**(): `number`

Defined in: [src/transports/base/TransportManager.ts:1492](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1492)

Get the current aggregation buffer size (for testing).

#### Returns

`number`

Buffer size

***

### getStats()

> **getStats**(): `Record`\<`string`, [`TransportStats`](../../../../types/transport/interfaces/TransportStats.md) & `object`\> & `object`

Defined in: [src/transports/base/TransportManager.ts:1337](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1337)

Get statistics for all transports.

#### Returns

`Record`\<`string`, [`TransportStats`](../../../../types/transport/interfaces/TransportStats.md) & `object`\> & `object`

Transport statistics

***

### getTransport()

> **getTransport**(`name`): `undefined` \| [`Transport`](../../../../types/transport/interfaces/Transport.md)

Defined in: [src/transports/base/TransportManager.ts:580](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L580)

Get a transport by name.

#### Parameters

##### name

`string`

Transport name

#### Returns

`undefined` \| [`Transport`](../../../../types/transport/interfaces/Transport.md)

Transport instance

***

### getTransportNames()

> **getTransportNames**(): `string`[]

Defined in: [src/transports/base/TransportManager.ts:598](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L598)

Get transport names.

#### Returns

`string`[]

Transport names

***

### getTransports()

> **getTransports**(): [`Transport`](../../../../types/transport/interfaces/Transport.md)[]

Defined in: [src/transports/base/TransportManager.ts:589](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L589)

Get all transports.

#### Returns

[`Transport`](../../../../types/transport/interfaces/Transport.md)[]

Array of transports

***

### hasTransport()

> **hasTransport**(`name`): `boolean`

Defined in: [src/transports/base/TransportManager.ts:614](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L614)

Check if a transport exists.

#### Parameters

##### name

`string`

Transport name

#### Returns

`boolean`

Whether transport exists

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:377](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L377)

Initialize the transport manager.

#### Returns

`Promise`\<`void`\>

Resolves when initialized

***

### list()

> **list**(): `string`[]

Defined in: [src/transports/base/TransportManager.ts:623](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L623)

List all transport names.

#### Returns

`string`[]

Array of transport names

***

### log()

> **log**(`entry`): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:832](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L832)

Asynchronous log method for backward compatibility.
Modern transports use worker threads internally for async operations.

#### Parameters

##### entry

Log entry

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md) | [`MinimalLogEntry`](../../../../types/transport/interfaces/MinimalLogEntry.md)

#### Returns

`Promise`\<`void`\>

Resolves when logged

***

### logBatch()

> **logBatch**(`entries`): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:1067](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1067)

Log multiple entries efficiently.

#### Parameters

##### entries

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)[]

Log entries

#### Returns

`Promise`\<`void`\>

Resolves when all logged

***

### logSync()

> **logSync**(`entry`): `void`

Defined in: [src/transports/base/TransportManager.ts:716](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L716)

High-performance synchronous log dispatch optimized for minimal overhead.

Performance optimizations:
- Early exit conditions to avoid unnecessary processing
- Cached transport list to reduce iteration overhead
- Minimal object allocation in hot path
- Direct dispatch without promise overhead

#### Parameters

##### entry

Log entry to dispatch

[`LogEntry`](../../../../types/transport/interfaces/LogEntry.md) | [`MinimalLogEntry`](../../../../types/transport/interfaces/MinimalLogEntry.md)

#### Returns

`void`

***

### pause()

> **pause**(): `void`

Defined in: [src/transports/base/TransportManager.ts:1165](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1165)

Pause all logging.

#### Returns

`void`

***

### registerFactory()

> **registerFactory**(`type`, `factory`): `void`

Defined in: [src/transports/base/TransportManager.ts:393](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L393)

Register a transport factory.

#### Parameters

##### type

`string`

Transport type

##### factory

`TransportFactory`

Factory function

#### Returns

`void`

***

### registerTransport()

> **registerTransport**(`transport`): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:518](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L518)

Register an already instantiated transport with the manager.

#### Parameters

##### transport

[`Transport`](../../../../types/transport/interfaces/Transport.md)

Transport instance to register

#### Returns

`Promise`\<`void`\>

Resolves when transport is registered

***

### registerTransportSync()

> **registerTransportSync**(`transport`): `void`

Defined in: [src/transports/base/TransportManager.ts:492](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L492)

Registers a transport synchronously (without init).
Use for transports that don't require async initialization.

#### Parameters

##### transport

[`Transport`](../../../../types/transport/interfaces/Transport.md)

Transport to register

#### Returns

`void`

***

### remove()

> **remove**(`name`): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:633](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L633)

Remove a transport by name.

#### Parameters

##### name

`string`

Transport name

#### Returns

`Promise`\<`void`\>

Resolves when removed

***

### removeGlobalFilter()

> **removeGlobalFilter**(`filter`): `void`

Defined in: [src/transports/base/TransportManager.ts:1219](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1219)

Remove a global filter.

#### Parameters

##### filter

(`entry`) => `boolean`

Filter function

#### Returns

`void`

***

### removeGlobalTransformer()

> **removeGlobalTransformer**(`transformer`): `void`

Defined in: [src/transports/base/TransportManager.ts:1240](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1240)

Remove a global transformer.

#### Parameters

##### transformer

(`entry`) => [`LogEntry`](../../../../types/transport/interfaces/LogEntry.md)

Transformer function

#### Returns

`void`

***

### removeTransport()

> **removeTransport**(`name`): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:557](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L557)

Remove a transport from the manager.

#### Parameters

##### name

`string`

Transport name

#### Returns

`Promise`\<`void`\>

Resolves when removed

***

### resetStats()

> **resetStats**(): `void`

Defined in: [src/transports/base/TransportManager.ts:1413](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1413)

Reset statistics for all transports.

#### Returns

`void`

***

### resume()

> **resume**(): `Promise`\<`void`\>

Defined in: [src/transports/base/TransportManager.ts:1175](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L1175)

Resume logging and flush queue.

#### Returns

`Promise`\<`void`\>

Resolves when queue is flushed

***

### setEnabled()

> **setEnabled**(`name`, `enabled`): `void`

Defined in: [src/transports/base/TransportManager.ts:653](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/transports/base/TransportManager.ts#L653)

Enable or disable a transport.

#### Parameters

##### name

`string`

Transport name

##### enabled

`boolean`

Whether to enable the transport

#### Returns

`void`
