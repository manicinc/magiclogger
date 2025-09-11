# Abstract Class: AsyncMiddleware

Defined in: [src/middleware/Middleware.ts:162](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L162)

Async middleware base class for async operations.
Use this when middleware needs to perform async operations.

NOTE: Async middleware can impact performance.
Consider batching or background processing for heavy operations.

 AsyncMiddleware

## Extends

- [`Middleware`](Middleware.md)

## Constructors

### Constructor

> **new AsyncMiddleware**(): `AsyncMiddleware`

#### Returns

`AsyncMiddleware`

#### Inherited from

[`Middleware`](Middleware.md).[`constructor`](Middleware.md#constructor)

## Properties

### enabled

> **enabled**: `boolean` = `true`

Defined in: [src/middleware/Middleware.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L108)

Whether this middleware is enabled.
Can be toggled at runtime.

#### Inherited from

[`Middleware`](Middleware.md).[`enabled`](Middleware.md#enabled)

***

### name

> `abstract` `readonly` **name**: `string`

Defined in: [src/middleware/Middleware.ts:95](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L95)

Unique name for this middleware.
Used for debugging and metrics.

#### Inherited from

[`Middleware`](Middleware.md).[`name`](Middleware.md#name)

***

### priority

> `readonly` **priority**: `number` = `100`

Defined in: [src/middleware/Middleware.ts:102](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L102)

Priority for middleware execution order.
Lower values execute first.

#### Default

```ts
100
```

#### Inherited from

[`Middleware`](Middleware.md).[`priority`](Middleware.md#priority)

## Methods

### close()?

> `optional` **close**(): `void` \| `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L133)

Clean up middleware resources.
Called when middleware is removed or logger is closed.

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`Middleware`](Middleware.md).[`close`](Middleware.md#close)

***

### handleError()

> **handleError**(`error`, `entry`, `_context`): [`MiddlewareResult`](../interfaces/MiddlewareResult.md)

Defined in: [src/middleware/Middleware.ts:144](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L144)

Handle errors that occur during processing.
Default implementation logs and continues.

#### Parameters

##### error

`Error`

The error that occurred

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry being processed

##### \_context

[`MiddlewareContext`](../interfaces/MiddlewareContext.md)

#### Returns

[`MiddlewareResult`](../interfaces/MiddlewareResult.md)

How to handle the error

#### Inherited from

[`Middleware`](Middleware.md).[`handleError`](Middleware.md#handleerror)

***

### init()?

> `optional` **init**(): `void` \| `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L125)

Initialize the middleware.
Called once when middleware is added to the pipeline.

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`Middleware`](Middleware.md).[`init`](Middleware.md#init)

***

### process()

> **process**(`_entry`, `_context`): [`MiddlewareResult`](../interfaces/MiddlewareResult.md)

Defined in: [src/middleware/Middleware.ts:176](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L176)

Sync wrapper that throws an error.
Forces use of processAsync for async middleware.

#### Parameters

##### \_entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

##### \_context

[`MiddlewareContext`](../interfaces/MiddlewareContext.md)

#### Returns

[`MiddlewareResult`](../interfaces/MiddlewareResult.md)

#### Overrides

[`Middleware`](Middleware.md).[`process`](Middleware.md#process)

***

### processAsync()

> `abstract` **processAsync**(`entry`, `context`): `Promise`\<[`MiddlewareResult`](../interfaces/MiddlewareResult.md)\>

Defined in: [src/middleware/Middleware.ts:170](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L170)

Process a log entry asynchronously.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

##### context

[`MiddlewareContext`](../interfaces/MiddlewareContext.md)

Execution context

#### Returns

`Promise`\<[`MiddlewareResult`](../interfaces/MiddlewareResult.md)\>

The processing result
