# Function: createExpressTraceMiddleware()

> **createExpressTraceMiddleware**(`asyncLocalStorage`): [`TraceContextMiddleware`](../classes/TraceContextMiddleware.md)

Defined in: [src/middleware/TraceContextMiddleware.ts:297](https://github.com/manicinc/magiclogger/blob/ed8c08fedff86817c85e526f7d2db758b6e30dfa/src/middleware/TraceContextMiddleware.ts#L297)

Factory function to create trace context middleware for Express.

## Parameters

### asyncLocalStorage

`AsyncLocalStorageLike`\<`HeaderStoreExpress`\>

AsyncLocalStorage instance containing Express request

## Returns

[`TraceContextMiddleware`](../classes/TraceContextMiddleware.md)

Configured middleware for Express

## Example

```typescript
import { AsyncLocalStorage } from 'async_hooks';
import express from 'express';

const requestStorage = new AsyncLocalStorage<{ req: express.Request }>();

const app = express();

// Store request in AsyncLocalStorage
app.use((req, res, next) => {
  requestStorage.run({ req }, next);
});

// Create logger with automatic trace extraction
const logger = new Logger({
  middleware: [createExpressTraceMiddleware(requestStorage)]
});
```
