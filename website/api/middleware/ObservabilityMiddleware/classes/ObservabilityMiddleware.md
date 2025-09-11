# Class: ObservabilityMiddleware

Defined in: [src/middleware/ObservabilityMiddleware.ts:165](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L165)

Observability middleware for monitoring and OpenTelemetry integration.

This middleware provides:
- OpenTelemetry trace context injection
- Metrics collection and reporting
- Correlation ID generation
- Performance monitoring
- Resource usage tracking
- Health metadata injection

 ObservabilityMiddleware

## Example

```typescript
// With OpenTelemetry
import { trace } from '@opentelemetry/api';

const observability = new ObservabilityMiddleware({
  injectTraceContext: true,
  getTraceContext: () => {
    const span = trace.getActiveSpan();
    if (!span) return undefined;
    const context = span.spanContext();
    return {
      traceId: context.traceId,
      spanId: context.spanId,
      traceFlags: context.traceFlags.toString(),
    };
  },
  onMetrics: (metrics) => {
    // Send to your metrics backend
    metricsBackend.send(metrics);
  }
});

logger.addMiddleware(observability);
```

## Extends

- [`Middleware`](../../Middleware/classes/Middleware.md)

## Constructors

### Constructor

> **new ObservabilityMiddleware**(`options`): `ObservabilityMiddleware`

Defined in: [src/middleware/ObservabilityMiddleware.ts:197](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L197)

#### Parameters

##### options

[`ObservabilityMiddlewareOptions`](../interfaces/ObservabilityMiddlewareOptions.md) = `{}`

#### Returns

`ObservabilityMiddleware`

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

> `readonly` **name**: `"observability"` = `'observability'`

Defined in: [src/middleware/ObservabilityMiddleware.ts:166](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L166)

Unique name for this middleware.
Used for debugging and metrics.

#### Overrides

[`Middleware`](../../Middleware/classes/Middleware.md).[`name`](../../Middleware/classes/Middleware.md#name)

***

### priority

> `readonly` **priority**: `20` = `20`

Defined in: [src/middleware/ObservabilityMiddleware.ts:167](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L167)

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

### getMetrics()

> **getMetrics**(): `object`

Defined in: [src/middleware/ObservabilityMiddleware.ts:413](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L413)

Get current metrics snapshot.

#### Returns

`object`

##### byLevel

> **byLevel**: `Record`\<`string`, `number`\>

##### dropped

> **dropped**: `number`

##### errors

> **errors**: `number`

##### total

> **total**: `number`

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

Defined in: [src/middleware/ObservabilityMiddleware.ts:220](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L220)

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

***

### resetMetrics()

> **resetMetrics**(): `void`

Defined in: [src/middleware/ObservabilityMiddleware.ts:430](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/ObservabilityMiddleware.ts#L430)

Reset metrics counters.

#### Returns

`void`
