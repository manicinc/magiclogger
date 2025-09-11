# Interface: TraceContextMiddlewareOptions

Defined in: [src/middleware/TraceContextMiddleware.ts:43](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L43)

Options for configuring trace context middleware.

 TraceContextMiddlewareOptions

## Properties

### asyncLocalStorage?

> `optional` **asyncLocalStorage**: `AsyncLocalStorageLike`\<`TraceContextStore`\>

Defined in: [src/middleware/TraceContextMiddleware.ts:90](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L90)

AsyncLocalStorage instance for Node.js async context propagation.
If provided, trace context will be automatically retrieved from it.

***

### autoExtract?

> `optional` **autoExtract**: `boolean`

Defined in: [src/middleware/TraceContextMiddleware.ts:48](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L48)

Whether to automatically extract trace context.

#### Default

```ts
true
```

***

### extractContext()?

> `optional` **extractContext**: (`entry`) => `undefined` \| [`W3CTraceContext`](../../../utils/trace-context/interfaces/W3CTraceContext.md)

Defined in: [src/middleware/TraceContextMiddleware.ts:57](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L57)

Custom function to extract trace context.
If provided, this overrides the default extraction logic.

#### Parameters

##### entry

[`LogEntry`](../../../types/transport/interfaces/LogEntry.md)

The log entry being processed

#### Returns

`undefined` \| [`W3CTraceContext`](../../../utils/trace-context/interfaces/W3CTraceContext.md)

The extracted trace context or undefined

***

### generateIfMissing?

> `optional` **generateIfMissing**: `boolean`

Defined in: [src/middleware/TraceContextMiddleware.ts:72](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L72)

Whether to generate trace IDs for entries without trace context.
Useful for creating root spans.

#### Default

```ts
false
```

***

### getHeaders()?

> `optional` **getHeaders**: () => `undefined` \| `Record`\<`string`, `undefined` \| `string` \| `string`[]\>

Defined in: [src/middleware/TraceContextMiddleware.ts:65](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L65)

Function to get HTTP headers for trace extraction.
Used when autoExtract is true and no custom extractContext is provided.

#### Returns

`undefined` \| `Record`\<`string`, `undefined` \| `string` \| `string`[]\>

HTTP headers object or undefined

***

### includeInMetadata?

> `optional` **includeInMetadata**: `boolean`

Defined in: [src/middleware/TraceContextMiddleware.ts:84](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L84)

Whether to include trace context in metadata.

#### Default

```ts
true
```

***

### traceField?

> `optional` **traceField**: `string`

Defined in: [src/middleware/TraceContextMiddleware.ts:78](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L78)

Field name to store trace context in log entry.

#### Default

```ts
'trace'
```
