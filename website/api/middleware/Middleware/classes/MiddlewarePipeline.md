# Class: MiddlewarePipeline

Defined in: [src/middleware/Middleware.ts:202](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L202)

Middleware pipeline manager.
Handles execution order, error handling, and state management.

 MiddlewarePipeline

## Example

```typescript
const pipeline = new MiddlewarePipeline('my-logger');
pipeline.add(new TimestampMiddleware());
pipeline.add(new FilterMiddleware());

const result = pipeline.process(logEntry);
if (result.continue) {
  // Send to transports
  transport.log(result.entry);
}
```

## Constructors

### Constructor

> **new MiddlewarePipeline**(`loggerId`): `MiddlewarePipeline`

Defined in: [src/middleware/Middleware.ts:221](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L221)

#### Parameters

##### loggerId

`string`

#### Returns

`MiddlewarePipeline`

## Methods

### add()

> **add**(`middleware`): `void`

Defined in: [src/middleware/Middleware.ts:230](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L230)

Add middleware to the pipeline.

#### Parameters

##### middleware

[`Middleware`](Middleware.md)

The middleware to add

#### Returns

`void`

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:365](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L365)

Clear all middleware from the pipeline.

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`name`): `undefined` \| [`Middleware`](Middleware.md)

Defined in: [src/middleware/Middleware.ts:379](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L379)

Get middleware by name.

#### Parameters

##### name

`string`

Name of the middleware

#### Returns

`undefined` \| [`Middleware`](Middleware.md)

The middleware or undefined

***

### isAsync()

> **isAsync**(): `boolean`

Defined in: [src/middleware/Middleware.ts:397](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L397)

Check if pipeline has async middleware.

#### Returns

`boolean`

True if has async middleware

***

### list()

> **list**(): `string`[]

Defined in: [src/middleware/Middleware.ts:388](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L388)

Get all middleware names.

#### Returns

`string`[]

Array of middleware names

***

### process()

> **process**(`entry`): [`MiddlewareResult`](../interfaces/MiddlewareResult.md)

Defined in: [src/middleware/Middleware.ts:268](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L268)

Process a log entry through the pipeline (sync).
Throws if pipeline contains async middleware.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

[`MiddlewareResult`](../interfaces/MiddlewareResult.md)

The final result

***

### processAsync()

> **processAsync**(`entry`): `Promise`\<[`MiddlewareResult`](../interfaces/MiddlewareResult.md)\>

Defined in: [src/middleware/Middleware.ts:317](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L317)

Process a log entry through the pipeline (async).

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

#### Returns

`Promise`\<[`MiddlewareResult`](../interfaces/MiddlewareResult.md)\>

The final result

***

### remove()

> **remove**(`name`): `boolean`

Defined in: [src/middleware/Middleware.ts:248](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L248)

Remove middleware from the pipeline.

#### Parameters

##### name

`string`

Name of the middleware to remove

#### Returns

`boolean`

True if removed
