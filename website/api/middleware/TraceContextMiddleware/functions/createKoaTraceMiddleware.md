# Function: createKoaTraceMiddleware()

> **createKoaTraceMiddleware**(`asyncLocalStorage`): [`TraceContextMiddleware`](../classes/TraceContextMiddleware.md)

Defined in: [src/middleware/TraceContextMiddleware.ts:315](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L315)

Factory function to create trace context middleware for Koa.

## Parameters

### asyncLocalStorage

`AsyncLocalStorageLike`\<`HeaderStoreKoa`\>

AsyncLocalStorage instance containing Koa context

## Returns

[`TraceContextMiddleware`](../classes/TraceContextMiddleware.md)

Configured middleware for Koa
