# transports/http

## Fileoverview

HTTP Transport Module

Production-ready HTTP transport using worker threads for all network operations.
Features batching, compression, retries, and circuit breaker pattern.

## Example

```typescript
import { HTTPTransport } from 'magiclogger/transports/http';

const httpTransport = new HTTPTransport({
  endpoint: 'https://logs.example.com/api/logs',
  batchSize: 100,
  compress: true,
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// Non-blocking - handled in worker thread
httpTransport.log(entry);
```

## Variables

- [createHTTP](variables/createHTTP.md)

## Functions

- [createHTTPTransport](functions/createHTTPTransport.md)

## References

### HTTPTransport

Re-exports [HTTPTransport](../HTTPTransport/classes/HTTPTransport.md)

***

### HTTPTransportOptions

Re-exports [HTTPTransportOptions](../HTTPTransport/interfaces/HTTPTransportOptions.md)
