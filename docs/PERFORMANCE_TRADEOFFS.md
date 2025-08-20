# Sync vs Async: Choosing the Right Mode

## Default (Synchronous) Logger
- ✅ Immediate output - see logs instantly
- ✅ No log loss on crash
- ✅ Simple debugging
- ⚠️ Blocks on I/O (7,586 ops/sec)
- Best for: Development, debugging, CLIs, moderate traffic

## AsyncLogger
- ✅ Non-blocking (103,327 ops/sec - 13x faster)
- ✅ Automatic batching
- ✅ Explicit backpressure handling
- ⚠️ Requires shutdown handling
- ⚠️ Potential log loss on ungraceful exit
- Best for: Production services, high-throughput applications

## Quick Decision Guide
```javascript
// Development or need immediate feedback?
const logger = new Logger();

// Production service with high volume?
const logger = createAsyncLogger({ ... });

// Need both? Use hybrid approach:
const logger = new Logger({
  transports: [
    new ConsoleTransport(), // Sync for errors
    new HTTPTransport({ batch: true }) // Async for bulk
  ]
});
```

## When to Choose Each Mode

### Use Synchronous (default Logger):
- Development and debugging
- CLI tools and scripts
- Test environments
- When log order must match execution order
- Applications with < 1000 logs/second

### Use Asynchronous (AsyncLogger):
- Production microservices
- High-throughput applications (> 1000 logs/second)
- When blocking I/O is unacceptable
- Batch processing systems
- When you can handle graceful shutdown

### Hybrid Approach:
```javascript
// Critical logs sync, bulk logs async
logger.error('CRITICAL: Database down'); // Goes to ConsoleTransport (sync)
logger.info('Request processed'); // Goes to HTTPTransport (batched)
```

## Graceful Shutdown (AsyncLogger)

AsyncLogger requires proper shutdown to prevent log loss:

```javascript
// REQUIRED: Setup shutdown handlers
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await asyncLogger.flushAndWait(); // Ensure all logs are sent
  await asyncLogger.close();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  await asyncLogger.logCritical('error', 'Uncaught exception', { error });
  await asyncLogger.flushAndWait();
  process.exit(1);
});
```
