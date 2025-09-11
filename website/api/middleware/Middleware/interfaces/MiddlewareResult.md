# Interface: MiddlewareResult

Defined in: [src/middleware/Middleware.ts:9](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L9)

Middleware execution result.
Allows middleware to modify, skip, or pass through log entries.

## Properties

### continue

> **continue**: `boolean`

Defined in: [src/middleware/Middleware.ts:14](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L14)

Whether to continue processing this log entry.
If false, the entry is dropped and subsequent middleware/transports are not called.

***

### entry?

> `optional` **entry**: [`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

Defined in: [src/middleware/Middleware.ts:20](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L20)

The potentially modified log entry.
Only used if continue is true.

***

### reason?

> `optional` **reason**: `string`

Defined in: [src/middleware/Middleware.ts:26](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/Middleware.ts#L26)

Optional reason for dropping the entry.
Used for debugging and metrics.
