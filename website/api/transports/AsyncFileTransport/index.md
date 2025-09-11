# transports/AsyncFileTransport

## Fileoverview

High-performance asynchronous file transport using sonic-boom.

This transport provides true async I/O without blocking the main thread,
using the same battle-tested sonic-boom library that powers Pino.

Key Features:
- Non-blocking I/O with intelligent batching
- Automatic backpressure handling
- Graceful error recovery
- Log rotation support via reopen()
- Configurable buffer sizes for throughput optimization

Performance Characteristics:
- Throughput: 300,000+ ops/sec with sonic-boom
- Zero main thread blocking during writes
- No worker thread overhead (runs in main thread)
- Optimized with synchronous logSync() method to avoid Promise overhead
- Internal buffering with automatic flushing

Architecture:
Unlike the previous worker-thread based implementation, this transport
uses sonic-boom's approach of buffering in the main thread with async
fs.write() operations. This eliminates IPC overhead and provides
significantly better performance.

Usage Example:
```typescript
const transport = new AsyncFileTransport({
  filepath: './logs/app.log',
  minLength: 4096,  // Buffer size before auto-flush (default: 4KB)
  maxWrite: 16384    // Max bytes per write operation (default: 16KB)
});

await transport.init();
logger.addTransport(transport);

// Logs are written asynchronously without blocking
logger.info('Server started', { port: 3000 });

// Graceful shutdown
await transport.flush();  // Ensure all logs are written
await transport.close();  // Close file handle
```

## Author

MagicLogger Contributors

## Since

2.0.0 - Rewritten to use sonic-boom for better performance

## Classes

- [AsyncFileTransport](classes/AsyncFileTransport.md)

## Interfaces

- [AsyncFileTransportOptions](interfaces/AsyncFileTransportOptions.md)
