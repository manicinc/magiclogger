# Class: TraceContextMiddleware

Defined in: [src/middleware/TraceContextMiddleware.ts:167](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L167)

Middleware that automatically extracts and injects W3C trace context into log entries.

This middleware enables automatic distributed tracing correlation by:
1. Extracting trace context from HTTP headers (for incoming requests)
2. Reading from AsyncLocalStorage (for async context propagation)
3. Using custom extraction logic (if provided)
4. Generating new trace IDs (for root spans if configured)

 TraceContextMiddleware

## Examples

```typescript
// Automatic extraction from Express
import express from 'express';
import { Logger } from 'magiclogger';
import { TraceContextMiddleware } from 'magiclogger/middleware';

const app = express();

// Create middleware that extracts from current request
const traceMiddleware = new TraceContextMiddleware({
  getHeaders: () => {
    // Get headers from current Express request context
    const req = asyncLocalStorage.getStore()?.req;
    return req?.headers;
  }
});

const logger = new Logger({
  middleware: [traceMiddleware]
});

// Now all logs automatically include trace context
logger.info('Request processed'); // Trace context auto-injected
```

```typescript
// With AsyncLocalStorage for context propagation
import { AsyncLocalStorage } from 'async_hooks';

const traceStorage = new AsyncLocalStorage<W3CTraceContext>();

const traceMiddleware = new TraceContextMiddleware({
  asyncLocalStorage: traceStorage,
  generateIfMissing: true // Generate root spans
});

// Run with trace context
traceStorage.run(traceContext, () => {
  logger.info('Operation started'); // Auto-includes trace
});
```

```typescript
// Custom extraction logic
const traceMiddleware = new TraceContextMiddleware({
  extractContext: (entry) => {
    // Custom logic to extract from entry or ambient context
    if (entry.metadata?.requestId) {
      return {
        traceId: entry.metadata.requestId,
        spanId: generateSpanId(),
        sampled: true
      };
    }
    return undefined;
  }
});
```

## Extends

- [`Middleware`](../../Middleware/classes/Middleware.md)

## Constructors

### Constructor

> **new TraceContextMiddleware**(`options`): `TraceContextMiddleware`

Defined in: [src/middleware/TraceContextMiddleware.ts:176](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L176)

Creates a new trace context middleware instance.

#### Parameters

##### options

[`TraceContextMiddlewareOptions`](../interfaces/TraceContextMiddlewareOptions.md) = `{}`

Configuration options

#### Returns

`TraceContextMiddleware`

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

> **name**: `string` = `'TraceContext'`

Defined in: [src/middleware/TraceContextMiddleware.ts:168](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L168)

Unique name for this middleware.
Used for debugging and metrics.

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`name`](../../Middleware/classes/Middleware.md#name)

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

> **process**(`entry`, `_context`): [`MiddlewareResult`](../../Middleware/interfaces/MiddlewareResult.md)

Defined in: [src/middleware/TraceContextMiddleware.ts:198](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L198)

Process log entry to inject trace context.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

##### \_context

[`MiddlewareContext`](../../Middleware/interfaces/MiddlewareContext.md)

Execution context (unused)

#### Returns

[`MiddlewareResult`](../../Middleware/interfaces/MiddlewareResult.md)

The processed entry with trace context

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`process`](../../Middleware/classes/Middleware.md#process)
