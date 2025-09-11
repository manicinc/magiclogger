# Class: SecurityMiddleware

Defined in: [src/middleware/SecurityMiddleware.ts:82](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L82)

Security middleware for log sanitization and injection prevention.

This middleware provides comprehensive security features:
- Prevents log injection attacks
- Sanitizes control characters
- Limits message and context size
- Validates URLs
- Strips potentially dangerous content

 SecurityMiddleware

## Example

```typescript
const security = new SecurityMiddleware({
  sanitizeNewlines: true,
  maxMessageLength: 5000,
  preventInjection: true
});

logger.addMiddleware(security);
```

## Extends

- [`Middleware`](../../Middleware/classes/Middleware.md)

## Constructors

### Constructor

> **new SecurityMiddleware**(`options`): `SecurityMiddleware`

Defined in: [src/middleware/SecurityMiddleware.ts:119](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L119)

#### Parameters

##### options

[`SecurityMiddlewareOptions`](../interfaces/SecurityMiddlewareOptions.md) = `{}`

#### Returns

`SecurityMiddleware`

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`constructor`](../../Middleware/classes/Middleware.md#constructor)

## Properties

### enabled

> **enabled**: `boolean` = `true`

Defined in: [src/middleware/Middleware.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L108)

Whether this middleware is enabled.
Can be toggled at runtime.

#### Inherited from

[`Middleware`](../../Middleware/classes/Middleware.md).[`enabled`](../../Middleware/classes/Middleware.md#enabled)

***

### name

> `readonly` **name**: `"security"` = `'security'`

Defined in: [src/middleware/SecurityMiddleware.ts:83](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L83)

Unique name for this middleware.
Used for debugging and metrics.

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`name`](../../Middleware/classes/Middleware.md#name)

***

### priority

> `readonly` **priority**: `10` = `10`

Defined in: [src/middleware/SecurityMiddleware.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L84)

Priority for middleware execution order.
Lower values execute first.

#### Default

```ts
100
```

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`priority`](../../Middleware/classes/Middleware.md#priority)

## Methods

### close()?

> `optional` **close**(): `void` \| `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L133)

Clean up middleware resources.
Called when middleware is removed or logger is closed.

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`Middleware`](../../Middleware/classes/Middleware.md).[`close`](../../Middleware/classes/Middleware.md#close)

***

### handleError()

> **handleError**(`error`, `entry`, `_context`): [`MiddlewareResult`](../../Middleware/interfaces/MiddlewareResult.md)

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

[`MiddlewareContext`](../../Middleware/interfaces/MiddlewareContext.md)

#### Returns

[`MiddlewareResult`](../../Middleware/interfaces/MiddlewareResult.md)

How to handle the error

#### Inherited from

[`Middleware`](../../Middleware/classes/Middleware.md).[`handleError`](../../Middleware/classes/Middleware.md#handleerror)

***

### init()?

> `optional` **init**(): `void` \| `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L125)

Initialize the middleware.
Called once when middleware is added to the pipeline.

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`Middleware`](../../Middleware/classes/Middleware.md).[`init`](../../Middleware/classes/Middleware.md#init)

***

### process()

> **process**(`entry`, `context`): [`MiddlewareResult`](../../Middleware/interfaces/MiddlewareResult.md)

Defined in: [src/middleware/SecurityMiddleware.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/SecurityMiddleware.ts#L133)

Process a log entry.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

##### context

[`MiddlewareContext`](../../Middleware/interfaces/MiddlewareContext.md)

Execution context

#### Returns

[`MiddlewareResult`](../../Middleware/interfaces/MiddlewareResult.md)

The processing result

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`process`](../../Middleware/classes/Middleware.md#process)
