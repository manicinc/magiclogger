# transports/FileTransport

## Fileoverview

File Transport with Worker Threads

Production-ready file transport that uses a dedicated worker thread
for all I/O operations, ensuring zero blocking of the main thread.

Key features:
- All I/O in worker thread
- Automatic file rotation
- Compression support
- Buffering in worker
- Structured cloning for efficient data transfer

## Classes

- [FileTransport](classes/FileTransport.md)

## Interfaces

- [FileTransportOptions](interfaces/FileTransportOptions.md)
