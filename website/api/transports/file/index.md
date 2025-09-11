# transports/file

## Fileoverview

File Transport Module

Production-ready file transport using worker threads for all I/O operations.
This ensures zero blocking of the main thread event loop.

## Example

```typescript
import { FileTransport } from 'magiclogger/transports/file';

const fileTransport = new FileTransport({
  filepath: './logs/app.log',
  maxFileSize: 100_000_000,  // 100MB rotation
  compress: true,             // Gzip rotated files
  bufferSize: 10000,          // Buffer in worker
  flushInterval: 100          // Flush every 100ms
});

// Main thread just passes entries - no blocking
fileTransport.log(entry);
```

## Variables

- [createFile](variables/createFile.md)

## Functions

- [createFileTransport](functions/createFileTransport.md)

## References

### FileTransport

Re-exports [FileTransport](../FileTransport/classes/FileTransport.md)

***

### FileTransportOptions

Re-exports [FileTransportOptions](../FileTransport/interfaces/FileTransportOptions.md)
