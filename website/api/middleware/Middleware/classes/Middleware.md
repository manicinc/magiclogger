# Abstract Class: Middleware

Defined in: [src/middleware/Middleware.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L90)

Abstract base class for log middleware.

Middleware can:
- Transform log entries (modify message, add context, etc.)
- Filter log entries (drop based on criteria)
- Enrich log entries (add timestamps, correlation IDs, etc.)
- Handle errors gracefully

IMPORTANT: Middleware MUST NOT throw exceptions.
Any errors should be handled internally and either:
- Return { continue: false } to drop the entry
- Log the error and pass the entry through unchanged

 Middleware

## Example

```typescript
class TimestampMiddleware extends Middleware {
  name = 'timestamp';

  process(entry: LogEntry, context: MiddlewareContext): MiddlewareResult {
    return {
      continue: true,
      entry: {
        ...entry,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now()
      }
    };
  }
}
```

## Extended by

- [`AsyncMiddleware`](AsyncMiddleware.md)
- [`ObservabilityMiddleware`](../../ObservabilityMiddleware/classes/ObservabilityMiddleware.md)
- [`SecurityMiddleware`](../../SecurityMiddleware/classes/SecurityMiddleware.md)
- [`TraceContextMiddleware`](../../TraceContextMiddleware/classes/TraceContextMiddleware.md)

## Constructors

### Constructor

> **new Middleware**(): `Middleware`

#### Returns

`Middleware`

## Properties

### enabled

> **enabled**: `boolean` = `true`

Defined in: [src/middleware/Middleware.ts:108](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L108)

Whether this middleware is enabled.
Can be toggled at runtime.

***

### name

> `abstract` `readonly` **name**: `string`

Defined in: [src/middleware/Middleware.ts:95](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L95)

Unique name for this middleware.
Used for debugging and metrics.

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

## Methods

### close()?

> `optional` **close**(): `void` \| `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:133](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L133)

Clean up middleware resources.
Called when middleware is removed or logger is closed.

#### Returns

`void` \| `Promise`\<`void`\>

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

***

### init()?

> `optional` **init**(): `void` \| `Promise`\<`void`\>

Defined in: [src/middleware/Middleware.ts:125](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L125)

Initialize the middleware.
Called once when middleware is added to the pipeline.

#### Returns

`void` \| `Promise`\<`void`\>

***

### process()

> `abstract` **process**(`entry`, `context`): [`MiddlewareResult`](../interfaces/MiddlewareResult.md)

Defined in: [src/middleware/Middleware.ts:117](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L117)

Process a log entry.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry to process

##### context

[`MiddlewareContext`](../interfaces/MiddlewareContext.md)

Execution context

#### Returns

[`MiddlewareResult`](../interfaces/MiddlewareResult.md)

The processing result
