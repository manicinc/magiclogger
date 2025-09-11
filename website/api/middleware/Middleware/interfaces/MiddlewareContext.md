# Interface: MiddlewareContext

Defined in: [src/middleware/Middleware.ts:33](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L33)

Middleware execution context.
Provides information about the middleware pipeline.

## Properties

### index

> **index**: `number`

Defined in: [src/middleware/Middleware.ts:42](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L42)

Current position in the middleware chain.

***

### loggerId

> **loggerId**: `string`

Defined in: [src/middleware/Middleware.ts:37](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L37)

Name of the logger instance.

***

### state

> **state**: `Map`\<`string`, `unknown`\>

Defined in: [src/middleware/Middleware.ts:52](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L52)

Shared state between middleware (per log entry).

***

### total

> **total**: `number`

Defined in: [src/middleware/Middleware.ts:47](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L47)

Total number of middleware in the chain.
