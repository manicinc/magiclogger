# transports/HTTPTransport

## Fileoverview

HTTP Transport with Worker Threads

Production-ready HTTP transport that uses a dedicated worker thread
for all network operations, ensuring zero blocking of the main thread.

Key features:
- Batching in worker thread
- Automatic retries with exponential backoff
- Compression support
- Circuit breaker pattern
- Zero main thread blocking

## Classes

- [HTTPTransport](classes/HTTPTransport.md)

## Interfaces

- [HTTPTransportOptions](interfaces/HTTPTransportOptions.md)
