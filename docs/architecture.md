# MagicLogger Architecture

## Overview

MagicLogger is a high-performance, feature-rich logging library for TypeScript/JavaScript applications. Our goal is to provide styled logs in production environments with minimal performance overhead through efficient I/O patterns and smart caching.

## Core Components

### 1. Logger Classes

#### Logger (Default)
- **Purpose**: Synchronous logging with optional buffering for balanced performance
- **Use Cases**: General-purpose logging, development
- **Implementation**: Direct transport calls with optional buffering

#### SyncLogger
- **Purpose**: Explicit blocking I/O for guaranteed delivery
- **Use Cases**: Audit logging, debugging, crash-resilient logging
- **Trade-offs**: Blocks event loop, guarantees write completion

#### AsyncLogger
- **Purpose**: Non-blocking logging with optional worker threads
- **Implementation**: 
  - Batching at logger level for IPC efficiency (default: 100 entries or 10ms)
  - Worker threads OFF by default (enable with `worker.enabled: true`)
  - Style processing in main thread by default (fast: ~0.012ms overhead)
  - Falls back to main thread processing when workers disabled
- **Use Cases**: High-throughput applications, web servers
- **Trade-offs**: 
  - Main thread: Lower latency, simpler architecture
  - With workers: Better for CPU-intensive styling, adds IPC overhead

### 2. Transport System

#### Transport Interface
```typescript
interface Transport {
  name: string;
  enabled: boolean;
  log(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
  close(): void | Promise<void>;
  shouldLog(entry: LogEntry): boolean;
  logBatch?(entries: LogEntry[]): void | Promise<void>;
  init?(): void | Promise<void>;
}
```

#### Built-in Transports
- **ConsoleTransport**: Outputs to stdout/stderr with colors
- **FileTransport**: High-performance async file writes using sonic-boom (default, alias for AsyncFileTransport)
- **AsyncFileTransport**: Explicit async file writes using sonic-boom
- **SyncFileTransport**: Synchronous file writes with intelligent batching
- **WorkerFileTransport**: Worker thread-based file transport for CPU-intensive processing
- **HTTPTransport**: Sends logs to HTTP endpoints with batching
- **NullTransport**: Discards logs (for benchmarking)

#### Transport Manager
- Coordinates multiple transports
- Handles batching and routing
- Implements backpressure handling
- Provides metrics and health monitoring

### 3. Batching Architecture

#### Batching Strategy (Optimized)
MagicLogger uses a **two-level batching strategy** to optimize performance:

1. **Logger Level (AsyncLogger)**: 
   - Batches logs for IPC efficiency when using workers
   - Default: 100 entries or 10ms timeout
   - Reduces context switches and IPC overhead

2. **Transport Level**: 
   - Each transport implements its own batching based on I/O needs
   - FileTransport: Uses sonic-boom's internal 4KB buffer
   - HTTPTransport: Batches 100 entries or 5s timeout for network efficiency
   - ConsoleTransport: No batching (immediate output)

**Note**: Worker-level batching has been removed to eliminate redundancy and reduce latency.

### 3. Async I/O Architecture

#### Default: FileTransport with sonic-boom
```
Main Thread                    Async I/O
    │                               │
    ├─ Logger                     ├─ sonic-boom
    │   ├─ Format Entry           │   ├─ Internal Buffer
    │   └─ Call Transport         │   ├─ Auto-flush at minLength
    │                             │   └─ fs.write() (non-blocking)
    └─ FileTransport              │
        ├─ logSync()              └─ File System
        └─ Direct to sonic-boom       └─ Disk
```

**Default behavior**: Logger uses FileTransport (AsyncFileTransport) with sonic-boom for async I/O - provides the best performance for production applications

#### Optional: WorkerFileTransport for CPU-intensive workloads
```
Main Thread                    Worker Thread Pool
    │                               │
    ├─ Logger                     ├─ Worker 1
    │   ├─ Format Entry           │   ├─ Process batch
    │   └─ Send to Worker         │   └─ Write to file
    │                             │
    └─ WorkerTransport            ├─ Worker 2 (if poolSize > 1)
        ├─ Batch logs                 ├─ Process batch
        └─ IPC transfer               └─ Write to file
```

**Worker threads are optional**: Only use `WorkerTransport` when you need true parallelism for CPU-intensive processing

#### Worker Communication Protocol (When using WorkerTransport)
- **INIT**: Initialize worker with transport config
- **LOG_BATCH**: Send batch of logs to process
- **FLUSH**: Force flush buffered logs
- **SHUTDOWN**: Graceful worker termination
- **ACK**: Acknowledge batch processing
- **METRICS**: Performance metrics updates

**Note**: This protocol only applies when explicitly using `WorkerTransport`, not the default `AsyncFileTransport`

### 4. MAGIC Schema

The MAGIC (Metadata And Graphics In Console) schema enables portable styled logs:

```typescript
interface LogEntry {
  id: string;                    // Unique identifier
  timestamp: string;              // ISO 8601 timestamp
  timestampMs: number;            // Unix timestamp in ms
  level: LogLevel;                // Log severity
  message: string;                // Plain text message
  styles?: Array<[number, number, string]>; // Style ranges [start, end, style]
  context?: Record<string, any>;  // Structured metadata
  tags?: string[];                // Categorization tags
  loggerId?: string;              // Logger instance ID
  error?: {                       // Error information
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
}
```

## Performance Characteristics

### Synchronous Logging
- **Throughput**: ~117K ops/sec plain text, ~30K ops/sec with styles
- **Latency**: 0.008ms average blocking time
- **Memory**: Minimal buffering
- **Reliability**: Guaranteed delivery (blocks until written)

### Asynchronous Logging
- **Throughput**: ~127K ops/sec plain text, ~163K ops/sec with styles
- **Latency**: 0.007ms average (non-blocking)
- **Memory**: Minimal with sonic-boom buffering
- **Reliability**: Best-effort, requires graceful shutdown for guarantee
- **Note**: Styled async outperforms plain sync (163K vs 68K ops/sec)

### Architecture Benefits

#### Default Async (sonic-boom)
- **Non-blocking**: Main thread never blocks on I/O
- **Efficient buffering**: Automatic flush at configurable thresholds
- **Low overhead**: No IPC or thread management costs
- **Production-ready**: Battle-tested in Pino ecosystem

#### Optional Worker Threads (WorkerTransport)
- **True parallelism**: CPU-intensive operations run in parallel
- **Isolation**: Transport failures don't affect main thread
- **Scalability**: Pool size adjustable based on workload
- **Use cases**: Heavy transformations, encryption, compression

**Recommendation**: Start with default `AsyncFileTransport`. Only use `WorkerTransport` if you have specific CPU-intensive requirements that benefit from parallelism.

### Worker Thread Considerations

Based on Node.js best practices:

**When to use worker threads:**
- CPU-intensive transformations (encryption, compression)
- Complex log formatting requiring heavy computation
- Isolation requirements (untrusted log processing)

**When NOT to use worker threads:**
- Simple I/O operations (file writes, network requests)
- Basic log formatting and styling
- Low-volume logging scenarios

**Performance trade-offs:**
- Worker creation overhead: ~10-50ms per worker
- IPC overhead: ~0.1-0.5ms per message batch
- Memory overhead: ~10MB per worker thread
- Optimal worker count: Number of CPU cores (typically 2-4)

For most logging scenarios, the default async I/O without workers provides the best balance of performance and simplicity.

### Real-World Performance Comparison

| Logger | Architecture | Throughput (ops/sec) | Avg Latency | Use Case |
|--------|-------------|---------------------|--------------|----------|
| Pino (Plain) | Async I/O | 226,046 | 0.004ms | High-throughput, minimal overhead |
| MagicLogger (Async+Styled) | Async I/O + Cache | 163,350 | 0.006ms | Styled production logging |
| Winston (Styled) | Multi-stream | 153,448 | 0.006ms | Feature-rich ecosystem |
| MagicLogger (Async) | Async I/O | 127,402 | 0.007ms | Non-blocking production |
| MagicLogger (Sync) | Direct I/O | 67,803 | 0.014ms | Guaranteed delivery |
| MagicLogger (Sync+Styled) | Direct I/O + Styles | 24,856 | 0.040ms | Interactive CLI tools |

**Key insights**:
- Async styled (163K) outperforms sync plain (68K) by 2.4x
- Styling overhead: 63% in sync mode, -28% in async (faster due to better batching)
- All metrics from real file I/O with production-like payloads

## Design Decisions

### 1. Async I/O Strategy
- **Default**: sonic-boom for efficient async file I/O
- **Rationale**: Proven performance, minimal overhead, no IPC costs
- **Optional**: WorkerTransport for CPU-intensive workloads requiring parallelism

### 2. Batching Strategy
- **Default**: 1000 entries or 10ms timeout
- **Rationale**: Balance between syscall reduction and latency
- **Tunable**: Via `bufferSize` and `flushInterval` options
- **sonic-boom**: Internal buffering with automatic flush at minLength

### 3. Serialization Format
- **Choice**: JSON with MAGIC extensions
- **Rationale**: Universal compatibility, structured data
- **Trade-off**: Larger payload vs. binary formats

### 4. Style Processing Architecture

#### Where Styling Happens

**Default (Workers OFF - Recommended):**
- Style extraction occurs in the **MAIN THREAD**
- Uses `TextStyler.parseBracketsWithExtraction()` to parse `<style>text</>` markup
- Produces `{ plainText, styles: [[start, end, style], ...] }`
- Result stored in LogEntry for MAGIC schema compliance
- **Performance**: ~0.012ms overhead per styled log (acceptable)

**With Workers Enabled (Optional):**
- When `worker.enabled: true`, style extraction moves to **WORKER THREAD**
- `AsyncLoggerWorker` processes styles after receiving batch
- Beneficial for heavy styling workloads (4x faster for complex styles)
- Adds IPC overhead for simple logs (~137% slower)

#### Performance Characteristics (Measured)
- **Main thread styling**: ~0.012ms per styled log (679% overhead vs plain)
- **Simple logs**: 888K ops/sec without workers, 375K with workers
- **Styled logs**: 95K ops/sec without workers, 405K with workers (4x faster)
- **Optimization**: Fast-path detection for non-styled text
- **Recommendation**: Use workers only for heavy styling workloads

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
    enabled: true,         // Enable workers for CPU-intensive workloads
    poolSize: 4,           // Multiple workers
    batchSize: 100,        // Optimized batch size
    flushInterval: 10      // Quick flushes
  },
  enableMetrics: true      // Monitor performance
});
```

### For Low Latency (0.003ms avg)
```typescript
const logger = new AsyncLogger({
  worker: {
    enabled: false,        // No workers = lowest latency (default)
  },
  buffer: {
    size: 10,              // Small batches
    flushInterval: 1       // Immediate flushes
  }
});
// Achieves 0.003ms average latency with 301K ops/sec
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