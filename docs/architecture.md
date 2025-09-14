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
- **Purpose**: High-performance asynchronous logging with minimal latency
- **Implementation**:
  - **Ring Buffer Architecture**: Lock-free, zero-allocation log storage with 8192 entry capacity (configurable)
  - **Intelligent Batching**: Immediate dispatch for small batches (size=1), buffering for high volume (up to 100 entries)
  - **Worker threads OFF by default** for lowest latency (enable with `worker.enabled: true`)
  - **Fast path optimization**: Plain text logs bypass style processing entirely
  - **Counter-based ID generation**: 5x faster than Math.random()
  - **Counter-based ID generation**: 5x faster than Math.random()
  - **Lazy TextStyler loading**: Only loaded when styles are actually used
- **Use Cases**: High-throughput applications, web servers, microservices
- **Trade-offs**:
  - Without workers (default): Lowest latency (~0.010ms), best for most use cases
  - With workers: Better for CPU-intensive workloads, adds ~0.1ms IPC overhead
  - Ring buffer adds 18% overhead but ensures non-blocking under pressure
- **Performance Reality**: Sync logger is 1.3x faster for plain text, but async is 4x faster for styled output

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

### 3. Ring Buffer & Batching Architecture

#### Ring Buffer (AsyncLogger)
- **Purpose**: Lock-free, zero-allocation log storage
- **Capacity**: 8192 entries by default (configurable)
- **Performance**: O(1) push/pop operations
- **Behavior**: Overwrites oldest logs when full (lossy but non-blocking)

#### Batching System

#### Intelligent Batching Strategy
MagicLogger uses an **optimized batching strategy** with deferred processing:

1. **Logger Level (AsyncLogger)**:
   - **Deferred Processing**: Minimal object creation in hot path
   - **Default**: 100 entries or 10ms timeout for optimal throughput
   - **Fast Path**: When batching, only stores `{ m, l, t, x }` minimal entries
   - **Flush Time**: Converts to full LogEntry objects during batch flush
   - **Performance**: 784k ops/sec capability with batching enabled

2. **Transport Level**:
   - Each transport implements optimal batching for its I/O pattern
   - FileTransport: sonic-boom's internal 4KB buffer for async writes
   - HTTPTransport: 100 entries or 5s timeout for network efficiency
   - ConsoleTransport: No batching (immediate output for debugging)

**Performance**: Achieves 147K ops/sec for sync plain text, 142K ops/sec for async styled output.

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
- **Throughput**: 147K ops/sec plain text, 29K ops/sec with styles
- **Latency**: 0.006ms average blocking time
- **Memory**: Minimal buffering
- **Reliability**: Guaranteed delivery (blocks until written)

### Asynchronous Logging
- **Throughput**: 118K ops/sec plain text, 142K ops/sec with styles
- **Latency**: 0.008ms average (non-blocking)
- **Memory**: Minimal with sonic-boom buffering
- **Reliability**: Best-effort, requires graceful shutdown for guarantee
- **Note**: Async with styles (142K) outperforms sync with styles (29K) by 4.8x

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
| Pino (Plain) | Async I/O | 238,365 | 0.004ms | High-throughput, minimal overhead |
| Pino (ANSI Async) | Async Worker | 216,022 | 0.004ms | Async styled output |
| Pino (Pretty) | Async Worker | 189,861 | 0.005ms | Pretty printing with worker |
| Winston (Plain) | Multi-stream | 153,741 | 0.006ms | Feature-rich ecosystem |
| MagicLogger (Sync) | Direct I/O | 147,906 | 0.006ms | Guaranteed delivery |
| MagicLogger (Async+Styled) | Async I/O | 142,323 | 0.007ms | Styled production logging |
| Winston (Styled) | Multi-stream | 136,527 | 0.007ms | Styled enterprise logging |
| MagicLogger (Async) | Async I/O | 118,849 | 0.008ms | Non-blocking production |
| MagicLogger (Sync+Styled) | Direct I/O + Styles | 29,741 | 0.033ms | Interactive CLI tools |

**Key insights**:
- Async styled (142K) outperforms sync styled (29K) by 4.8x
- SyncLogger excels at plain text (147K) while AsyncLogger shines with styles (142K)
- All metrics from real file I/O with production-like payloads

## Design Decisions

### 1. Async I/O Strategy
- **Default**: sonic-boom for efficient async file I/O
- **Rationale**: Proven performance, minimal overhead, no IPC costs
- **Optional**: WorkerTransport for CPU-intensive workloads requiring parallelism

### 2. Batching Strategy
- **Default**: 100 entries or 10ms timeout
- **Rationale**: Balance between syscall reduction and latency
- **Optimization**: Deferred processing - minimal objects in hot path
- **Tunable**: Via `worker.batchSize` and `worker.batchTimeout` options
- **Performance Journey**: 7k → 64k → 165k ops/sec through optimizations

### 3. Serialization Format
- **Choice**: JSON with MAGIC extensions
- **Rationale**: Universal compatibility, structured data
- **Trade-off**: Larger payload vs. binary formats


### 5. Style Processing Architecture

#### Style Caching Strategy
- **10,000 entry LRU cache** for frequently used style patterns
- **Pre-parsed common styles** for ultra-fast lookup (red, green, bold, etc.)
- **Cache hit rate**: 30-50% improvement for repeated patterns
- **Optimized regex**: Pre-compiled patterns with fast paths
- **Fast path detection**: Using indexOf for bracket checks instead of regex

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
- **Main thread styling**: ~0.018ms per styled log (125% overhead vs plain)
- **Simple logs**: 96K ops/sec without workers, lower with workers due to IPC
- **Styled logs**: 56K ops/sec without workers (4x faster than sync)
- **Optimization**: Fast-path detection using indexOf for bracket checks
- **Style parsing overhead**: 55-74% performance penalty
- **Recommendation**: Use workers only for CPU-intensive operations, not simple styling

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

## Performance Optimizations

### Current Optimizations
1. **Counter-Based ID Generation**: 5x faster than Math.random()
   ```javascript
   id: (this.counter++).toString(36)  // vs Math.random().toString(36)
   ```

2. **MAGIC Schema Optimization**: 47% reduction in memory usage
   - Only include non-null fields
   - Reduced from 215 bytes to 115 bytes per log

3. **Direct Mode**: Bypass batching for single operations
   ```javascript
   if (this.batchSize === 1 && !this.useRingBuffer) {
     transport.logSync(entry);  // Direct write
   }
   ```


5. **Style Caching**: 30-50% improvement for repeated patterns
   - 10,000 entry LRU cache
   - Pre-parsed common styles

### Configuration Examples

#### High-Throughput Configuration
```javascript
const logger = new AsyncLogger({
  ringBuffer: {
    enabled: true,
    capacity: 65536,  // Large buffer for bursts
  },
  worker: {
    enabled: true,
    poolSize: 4,
    batchSize: 1000,  // Large batches
  }
});
```

#### Low-Latency Configuration
```javascript
const logger = new AsyncLogger({
  ringBuffer: {
    enabled: false,  // Disable for low latency
  },
  worker: {
    enabled: false,
    batchSize: 1,    // Direct mode
  }
});
```

#### Maximum Performance (No Styles)
```javascript
const logger = new AsyncLogger({
  useColors: false,
  transports: [new AsyncFileTransport({
    filepath: './app.log',
    minLength: 4096  // Sonic-boom buffer
  })]
});
```

#### Styled Output Performance
```javascript
// Async logger excels with styles (263K ops/sec)
const logger = new AsyncLogger({
  useColors: true,
  transports: [new AsyncFileTransport()]
  // Deferred processing optimizes performance
});
```

## Future Enhancements

### Planned Features
1. **Compression**: zstd/gzip for large batches
2. **Streaming**: Server-sent events for real-time logs
3. **Clustering**: Multi-process coordination
4. **Tracing**: OpenTelemetry integration

### Future Performance Optimizations
1. **Fast Path Detection**: Plain text bypasses style processing (~2x speedup)
2. **Date.now() Timestamps**: 10x faster than performance.now()
3. **Lazy Loading**: TextStyler only loaded when styles are used
4. **Minimal Object Allocation**: Only required MAGIC schema fields
5. **Instance-level Caching**: TextStyler cached per logger instance
6. **Direct Dispatch**: Immediate transport calls when batch size = 1

1. **SIMD Serialization**: Faster JSON encoding with native bindings
2. **Memory Pools**: Pre-allocated buffers to reduce GC pressure
3. **Zero-Copy Buffers**: Direct I/O operations with SharedArrayBuffer
4. **WASM Style Engine**: Near-native performance for style processing
5. **io_uring Support**: Linux kernel-level async I/O
6. **Custom V8 Snapshot**: Pre-initialized logger state

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
// Achieves 0.010ms average latency with 56K ops/sec for styled output
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

## Benchmark Methodology

Our benchmarks:
- Run 20,000 iterations per test
- Warm up with 100 iterations
- Measure with `performance.now()`
- Calculate P50, P95, P99 percentiles
- Test both burst and sustained load
- Include style parsing overhead
- Real file I/O, not mocked

### Running Benchmarks
```bash
npm run perf:update  # Run full benchmark suite and update results
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

## Conclusion

MagicLogger's architecture balances performance, reliability, and developer experience. The worker thread implementation provides true async logging without blocking the event loop, while the MAGIC schema enables rich, portable logging across platforms.