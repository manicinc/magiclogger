# Function: createFastifyTraceMiddleware()

> **createFastifyTraceMiddleware**(`asyncLocalStorage`): [`TraceContextMiddleware`](../classes/TraceContextMiddleware.md)

Defined in: [src/middleware/TraceContextMiddleware.ts:333](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L333)

Factory function to create trace context middleware for Fastify.

## Parameters

### asyncLocalStorage

`AsyncLocalStorageLike`\<`HeaderStoreFastify`\>

AsyncLocalStorage instance containing Fastify request

## Returns

[`TraceContextMiddleware`](../classes/TraceContextMiddleware.md)

Configured middleware for Fastify
