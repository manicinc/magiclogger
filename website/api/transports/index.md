# transports

MagicLogger Transport System

This module exports base transport functionality and types only.
Individual transport implementations should be imported directly from their
specific entry points to enable tree-shaking.

## Example

```typescript
// ✅ Good - Tree-shakable imports
import { Transport } from 'magiclogger/transports/base';
import { ConsoleTransport } from 'magiclogger/console';
import { FileTransport } from 'magiclogger/file';

// ❌ Bad - Imports everything
import { ConsoleTransport, FileTransport } from 'magiclogger/transports';
```

## Classes

- [TransportRegistry](classes/TransportRegistry.md)

## Type Aliases

- [TransportFactory](type-aliases/TransportFactory.md)

## Functions

- [createDefaultTransportManager](functions/createDefaultTransportManager.md)

## References

### BatchingOptions

Re-exports [BatchingOptions](../types/transport/interfaces/BatchingOptions.md)

***

### BatchingTransportOptions

Re-exports [BatchingTransportOptions](../types/transport/interfaces/BatchingTransportOptions.md)

***

### ConsoleTransportOptions

Re-exports [ConsoleTransportOptions](../types/transport/interfaces/ConsoleTransportOptions.md)

***

### FileTransportOptions

Re-exports [FileTransportOptions](../types/transport/interfaces/FileTransportOptions.md)

***

### HTTPTransportOptions

Re-exports [HTTPTransportOptions](../types/transport/interfaces/HTTPTransportOptions.md)

***

### ITransport

Renames and re-exports [Transport](base/classes/Transport.md)

***

### LogEntry

Re-exports [LogEntry](../types/transport/interfaces/LogEntry.md)

***

### MongoDBTransportOptions

Re-exports [MongoDBTransportOptions](../types/transport/interfaces/MongoDBTransportOptions.md)

***

### NetworkTransportOptions

Re-exports [NetworkTransportOptions](../types/transport/interfaces/NetworkTransportOptions.md)

***

### OTLPTransportOptions

Re-exports [OTLPTransportOptions](base/implementations/OTLPTransport/interfaces/OTLPTransportOptions.md)

***

### PostgreSQLTransportOptions

Re-exports [PostgreSQLTransportOptions](../types/transport/interfaces/PostgreSQLTransportOptions.md)

***

### RetryOptions

Re-exports [RetryOptions](../types/transport/interfaces/RetryOptions.md)

***

### S3TransportOptions

Re-exports [S3TransportOptions](../types/transport/interfaces/S3TransportOptions.md)

***

### StreamTransportOptions

Re-exports [StreamTransportOptions](../types/transport/interfaces/StreamTransportOptions.md)

***

### Transport

Re-exports [Transport](base/classes/Transport.md)

***

### TransportConfig

Re-exports [TransportConfig](../types/transport/interfaces/TransportConfig.md)

***

### TransportManager

Re-exports [TransportManager](base/TransportManager/classes/TransportManager.md)

***

### TransportManagerOptions

Re-exports [TransportManagerOptions](../types/transport/interfaces/TransportManagerOptions.md)

***

### TransportOptions

Re-exports [TransportOptions](../types/transport/interfaces/TransportOptions.md)

***

### TransportStats

Re-exports [TransportStats](../types/transport/interfaces/TransportStats.md)

***

### TransportType

Re-exports [TransportType](../types/transport/type-aliases/TransportType.md)

***

### WebSocketTransportOptions

Re-exports [WebSocketTransportOptions](../types/transport/interfaces/WebSocketTransportOptions.md)
