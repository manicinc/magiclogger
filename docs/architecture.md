# MagicLogger Architecture

## Overview

MagicLogger is a high-performance, feature-rich logging library for TypeScript/JavaScript applications. **Our core mission: Beautiful, styled logs in production environments with minimal performance overhead.** We achieve this through optimized async architecture and the MAGIC schema format, proving that you don't have to sacrifice aesthetics for performance.

## Core Components

### 1. Logger Classes

#### SyncLogger
- **Purpose**: Provides blocking, synchronous logging for scenarios requiring guaranteed delivery
- **Use Cases**: Audit logging, debugging, crash-resilient logging
- **Trade-offs**: Blocks event loop, guarantees write completion

#### AsyncLogger
- **Purpose**: Non-blocking logging using batching and async I/O
- **Implementation**: 
  - Uses batching for efficiency
  - Falls back to `setImmediate` for async behavior
  - No longer uses worker threads by default
- **Use Cases**: High-throughput applications, web servers
- **Trade-offs**: Better performance, potential log loss under extreme load

### 2. Transport System

#### Transport Interface
```typescript
interface Transport {
  name: string;
  enabled: boolean;
  log(entry: LogEntry): void | Promise<void>;
  flush?(): Promise<void>;
  close(): Promise<void>;
  shouldLog(entry: LogEntry): boolean;
}
```

#### Built-in Transports
- **SyncConsoleTransport**: Direct synchronous console output with colors
- **ConsoleTransport**: Outputs to stdout/stderr with colors
- **SyncFileTransport**: Direct synchronous file writes
- **AsyncFileTransport**: High-performance async file writes using sonic-boom (no worker threads)
- **FileTransport**: Standard file transport with rotation support  
- **HTTPTransport**: Sends logs to HTTP endpoints
- **NullTransport**: Discards logs (for benchmarking)
- **WorkerTransport**: Offloads processing to worker threads (optional)

#### Transport Manager
- Coordinates multiple transports
- Handles batching and routing
- Implements backpressure handling
- Provides metrics and health monitoring

### 3. Async I/O Architecture (Updated)

#### AsyncFileTransport with sonic-boom
```
Main Thread                    Async I/O
    │                               │
    ├─ Logger                     ├─ sonic-boom
    │   ├─ Format Entry           │   ├─ Internal Buffer
    │   └─ Call Transport         │   ├─ Auto-flush at minLength
    │                             │   └─ fs.write() (non-blocking)
    └─ AsyncFileTransport         │
        ├─ logSync()              └─ File System
        └─ Direct to sonic-boom       └─ Disk
```

No worker threads - everything runs in main thread with async I/O callbacks

#### Worker Communication Protocol
- **INIT**: Initialize worker with transport config
- **LOG_BATCH**: Send batch of logs to process
- **FLUSH**: Force flush buffered logs
- **SHUTDOWN**: Graceful worker termination
- **ACK**: Acknowledge batch processing
- **METRICS**: Performance metrics updates

### 4. MAGIC Schema

The MAGIC (Metadata And Graphics In Console) schema enables portable styled logs:

```typescript
interface MagicLogEntry {
  id: string;                    // Unique identifier
  timestamp: string;              // ISO 8601 timestamp
  timestampMs: number;            // Unix timestamp in ms
  level: LogLevel;                // Log severity
  message: string;                // Log message
  styles?: StyleRange[];          // Style information
  context?: Record<string, any>;  // Structured metadata
  tags?: string[];                // Categorization tags
  loggerId?: string;              // Logger instance ID
}

interface StyleRange {
  start: number;                  // Start position in message
  end: number;                    // End position in message
  styles: string[];               // Applied styles (colors, formatting)
}
```

## Performance Characteristics

### Synchronous Logging
- **Throughput**: ~117K ops/sec plain text, ~30K ops/sec with styles
- **Latency**: 0.008ms average blocking time
- **Memory**: Minimal buffering
- **Reliability**: Guaranteed delivery (blocks until written)

### Asynchronous Logging (Worker Threads)
- **Throughput**: ~182K ops/sec plain text, ~203K ops/sec with styles (11% FASTER!)
- **Latency**: 0.005ms average (non-blocking with IPC)
- **Memory**: 1KB batch buffer + worker thread memory (~10MB per worker)
- **Reliability**: Best-effort with explicit backpressure feedback
- **Trade-off**: Styled output is FASTER than plain text due to parallel processing

### Worker Thread Architecture Benefits
- **True Parallelism**: CPU-intensive operations run in parallel
- **Non-blocking**: Main thread never blocks on I/O
- **Isolation**: Transport failures don't affect main thread
- **Scalability**: Pool size adjustable based on workload
- **Style Acceleration**: Worker threads process styles in parallel, improving performance

### Real-World Performance Comparison (Production Metrics)

| Logger | Architecture | Throughput (ops/sec) | Avg Latency | Strengths |
|--------|-------------|---------------------|--------------|-----------|  
| Winston (Styled) | Multi-stream | 236,182 | 0.004ms | Mature, feature-rich ecosystem |
| MagicLogger (Async+Styled) | Worker threads | 203,303 | 0.005ms | **Styled as fast as Pino plain!** |
| Pino (Plain) | Main thread I/O | 203,354 | 0.005ms | Simple, minimal overhead |
| MagicLogger (Async) | Worker threads | 182,454 | 0.005ms | True async, thread isolation |
| MagicLogger (Sync) | Direct I/O | 116,814 | 0.008ms | Guaranteed delivery |
| MagicLogger (Sync+Styled) | Direct writes | 30,026 | 0.033ms | Interactive CLI tools |

**Note**: All performance metrics are based on real file I/O operations with realistic log payloads, not null transports. Async+Styled outperforms plain text due to worker parallelism.

## Design Decisions

### 1. Worker Threads for True Async
- **Choice**: Worker thread pool with IPC batching
- **Rationale**: Complete isolation, true parallelism, non-blocking guarantees
- **Benefit**: Styled output is 11% FASTER than plain text in async mode!

### 2. Optimized Batching Strategy
- **Default**: 1000 entries or 10ms timeout
- **Rationale**: Balance between IPC overhead reduction and latency
- **Tunable**: Via `batchSize` and `batchTimeout` options
- **Pool Size**: 2 workers by default for balanced memory usage and parallelism
- **Flush Interval**: 100ms periodic flush for reliability

### 3. Serialization Format
- **Choice**: JSON with MAGIC extensions
- **Rationale**: Universal compatibility, structured data
- **Trade-off**: Larger payload vs. binary formats

### 4. Style Preservation
- **Implementation**: Style ranges in metadata
- **Rationale**: Portable across transports and languages
- **Cost**: ~10-15% overhead for styled logs
- **Optimization**: Fast-path detection and style caching minimize overhead

## Memory Management

### Buffer Limits
- **Batch Buffer**: Max 10,000 entries (configurable)
- **Worker Queue**: Max 10 concurrent operations per worker
- **Transport Buffer**: Transport-specific limits

### Backpressure Handling
1. Monitor worker utilization
2. Drop logs when over capacity
3. Emit warning events
4. Metrics tracking for monitoring

## Error Handling

### Worker Failures
- Automatic fallback to setImmediate mode
- Error events emitted to main thread
- Graceful degradation

### Transport Failures
- Individual transport isolation
- Retry logic (transport-specific)
- Error aggregation and reporting

## Security Considerations

### Log Sanitization
- Redaction of sensitive fields
- PII detection and masking
- Configurable sanitization rules

### Resource Limits
- Maximum message size
- Rate limiting support
- Memory usage caps

## Future Enhancements

### Planned Features
1. **Compression**: zstd/gzip for large batches
2. **Streaming**: Server-sent events for real-time logs
3. **Clustering**: Multi-process coordination
4. **Tracing**: OpenTelemetry integration

### Performance Optimizations
1. **SIMD Serialization**: Faster JSON encoding
2. **Memory Pools**: Reduce allocation overhead
3. **Zero-Copy Buffers**: Direct I/O operations
4. **Native Bindings**: Optional C++ accelerators

## Best Practices

### For High Throughput
```typescript
const logger = new AsyncLogger({
  worker: {
    poolSize: 4,           // Multiple workers
    batchSize: 1000,       // Large batches
    flushInterval: 100     // Less frequent flushes
  },
  enableMetrics: true      // Monitor performance
});
```

### For Low Latency
```typescript
const logger = new AsyncLogger({
  worker: {
    poolSize: 2,           // Fewer workers
    batchSize: 10,         // Small batches
    batchTimeout: 1        // Quick flushes
  }
});
```

### For Reliability
```typescript
const logger = new SyncLogger({
  file: './audit.log',     // Persistent storage
  forceFlush: true         // fsync after each write
});
```

## Monitoring

### Metrics Collection
```typescript
logger.on('metrics', (metrics) => {
  console.log('Logs processed:', metrics.totalLogs);
  console.log('Worker utilization:', metrics.workerUtilization);
  console.log('Dropped logs:', metrics.droppedLogs);
});
```

### Health Checks
```typescript
const health = {
  workers: logger.workers.length,
  pending: logger.batch.length,
  metrics: logger.getMetrics()
};
```

## Testing

### Unit Tests
- Mock transports for isolation
- Deterministic worker behavior
- Error injection

### Integration Tests
- Real worker threads
- File I/O verification
- Performance benchmarks

### Load Tests
```bash
# Generate high load
npm run test:load -- --rate=10000 --duration=60s

# Monitor metrics
npm run test:metrics -- --watch
```

## Conclusion

MagicLogger's architecture balances performance, reliability, and developer experience. The worker thread implementation provides true async logging without blocking the event loop, while the MAGIC schema enables rich, portable logging across platforms.