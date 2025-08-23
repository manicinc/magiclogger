# MagicLogger Transport System Documentation

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Async-First Design](#async-first-design)
  - [Transport Pipeline](#transport-pipeline)
  - [MagicLog Schema](#magiclog-schema)
- [Core Concepts](#core-concepts)
  - [Async vs Sync Transports](#async-vs-sync-transports)
  - [Buffering and Batching](#buffering-and-batching)
  - [Backpressure Handling](#backpressure-handling)
- [Available Transports](#available-transports)
  - [Core Transports](#core-transports)
  - [Network Transports](#network-transports)
  - [Database Transports](#database-transports)
  - [Cloud Storage](#cloud-storage)
  - [Observability Platforms](#observability-platforms)
- [Using Transports](#using-transports)
  - [Basic Usage](#basic-usage)
  - [AsyncLogger with Transports](#asynclogger-with-transports)
  - [SyncLogger with Transports](#synclogger-with-transports)
  - [Tree-Shaking and Bundle Size](#tree-shaking-and-bundle-size)
- [Transport Comparison](#transport-comparison)
- [Creating Custom Transports](#creating-custom-transports)
- [Performance Considerations](#performance-considerations)
- [Migration from Pino](#migration-from-pino)
- [API Reference](#api-reference)

## Overview

MagicLogger's transport system is designed from the ground up to be **asynchronous by default**, providing high-performance logging with minimal impact on your application. Unlike Pino's worker thread approach, MagicLogger uses an efficient **ring buffer with microtask-based flushing**, achieving comparable performance with simpler architecture.

### Key Features

- 🚀 **Async-First**: All transports operate asynchronously by default for maximum throughput
- 🎯 **Zero Overhead**: Tree-shakeable design - only pay for what you use  
- 💪 **High Performance**: Ring buffer with batch processing matches Pino's performance
- 🔄 **Backpressure Handling**: Explicit feedback when buffers are full
- 📦 **Modular**: Each transport is independently importable for optimal bundle size
- 🔌 **Extensible**: Simple interface for creating custom transports

## Architecture

### Async-First Design

MagicLogger's architecture is fundamentally different from traditional loggers. **All transports are asynchronous by default** because modern applications demand non-blocking I/O:

```javascript
// MagicLogger - Async by default
import { createLogger } from 'magiclogger';

const logger = createLogger(); // Already async with console output
logger.info('Non-blocking by default'); // Returns immediately
```

### Transport Pipeline

```
Application Code
      ↓
   Logger API (info, error, etc.)
      ↓
   [Operational Utilities]
   • Sampling (reduce volume)
   • Rate Limiting (prevent flooding)  
   • Redaction (remove PII)
      ↓
   AsyncBuffer (Ring Buffer)
   • Zero-allocation design
   • Microtask-based flushing
   • Explicit backpressure
      ↓
   Transport Manager
   • Batch dispatch
   • Error handling
   • Lifecycle management
      ↓
   Individual Transports
   • Console, File, HTTP, etc.
   • Each processes batches independently
```

### MagicLog Schema

All transports work with the standardized **MagicLog Schema** - an open JSON format that preserves styling information across your entire stack:

```json
{
  "id": "1733938475123-abc123",
  "timestamp": "2024-12-11T12:34:35.123Z",
  "timestampMs": 1733938475123,
  "level": "info",
  "message": "\u001b[32mSuccess:\u001b[39m User logged in",  // Preserved ANSI
  "plainMessage": "Success: User logged in",                  // Searchable text
  "context": { "userId": 123, "ip": "192.168.1.1" },
  "tags": ["auth", "api"],
  "metadata": { "hostname": "api-01", "pid": 1234 }
}
```

## Core Concepts

### Async vs Sync: Architecture Trade-offs

MagicLogger provides two logger implementations with different trade-offs:

#### AsyncLogger (Default - Recommended)

The `AsyncLogger` uses a high-performance ring buffer with batching:

```javascript
import { createLogger } from 'magiclogger';

// Default async logger with console output
const logger = createLogger({
  buffer: {
    size: 8192,         // Ring buffer size
    flushInterval: 100, // Flush every 100ms
    flushSize: 1000     // Or when 1000 entries accumulate
  }
});

// All logging is non-blocking
logger.info('User logged in', { userId: 123 }); // Returns AddResult immediately
```

**✅ PROS:**
- **High Throughput**: ~130,000 ops/sec - 13x faster than sync with promises
- **Non-blocking**: Never blocks main thread, perfect for production services
- **Natural Batching**: Logs accumulate for efficient I/O operations
- **Zero Promise Overhead**: Uses microtasks/timers, not promises in hot path
- **Explicit Backpressure**: Returns `AddResult` so you know if logs dropped
- **Memory Efficient**: Pre-allocated ring buffer, minimal GC pressure

**⚠️ CONS:**
- **Potential Log Loss**: Unflushed logs lost on crash (mitigated by auto-shutdown)
- **Delayed Output**: Logs appear in batches (50-100ms delay)
- **Memory Usage**: Holds logs in memory until flush
- **Order**: High-concurrency logs may arrive slightly out of order
- **Not for Audit Logs**: Can't guarantee immediate persistence

#### SyncLogger (Special Cases)

The `SyncLogger` provides zero-overhead synchronous logging for specific needs:

```javascript
import { SyncLogger, SyncConsoleTransport } from 'magiclogger/sync';

const logger = new SyncLogger({
  transports: [new SyncConsoleTransport()]
});

// Direct, immediate output - no promises
logger.info('Immediate output'); // ~220,000 ops/sec
```

**✅ PROS:**
- **Maximum Performance**: ~220,000 ops/sec - matches Pino sync
- **Zero Overhead**: No promises, buffers, or allocations
- **Immediate Output**: Critical for CLIs and debugging
- **Guaranteed Delivery**: No log loss on crash
- **Predictable Order**: Logs always in exact call order

**⚠️ CONS:**
- **Blocking I/O**: Can freeze app during writes
- **No Batching**: Every log is a syscall (inefficient)
- **Limited Transports**: Only Console, Stream, Null
- **No Backpressure**: Can overwhelm destinations
- **Poor for Production**: Not suitable for high-throughput services

#### When to Use Each

| Scenario | Use AsyncLogger | Use SyncLogger |
|----------|----------------|----------------|
| Production Services | ✅ Best choice | ❌ Blocks event loop |
| High Throughput | ✅ Batching benefits | ❌ Too many syscalls |
| Microservices | ✅ Non-blocking | ❌ Poor performance |
| CLI Tools | ⚠️ Delayed output | ✅ Immediate feedback |
| Debugging | ⚠️ Async complexity | ✅ Simple stack traces |
| Audit Logs | ❌ Can lose logs | ✅ Guaranteed delivery |
| Benchmarks | ⚠️ Includes buffer overhead | ✅ Raw performance |

### Buffering and Batching

The AsyncLogger's ring buffer provides several advantages:

1. **Zero Allocations**: Pre-allocated buffer avoids GC pressure
2. **Natural Batching**: Logs accumulate between event loop ticks
3. **Configurable Triggers**: Flush on size, time, or manually

```javascript
const logger = createLogger({
  buffer: {
    size: 16384,        // Larger buffer for high-volume
    flushInterval: 50,  // More frequent flushes for lower latency
    flushSize: 5000     // Bigger batches for efficiency
  },
  onFlush: async (entries) => {
    // Entries are batched for efficient processing
    await sendToElasticsearch(entries);
  }
});
```

### Backpressure Handling

Unlike Pino, MagicLogger provides **explicit backpressure feedback**:

```javascript
const result = logger.info('High volume log');

if (!result.success) {
  switch (result.reason) {
    case 'buffer_full':
      // Implement application-level throttling
      console.warn('Logger buffer full, throttling...');
      break;
    case 'rate_limited':
      // Exceeded rate limits
      metrics.increment('logs.rate_limited');
      break;
  }
}

// For critical logs, use guaranteed delivery
await logger.logCritical('error', 'Database connection lost', {
  severity: 'critical'
});
```

## Available Transports

### Core Transports

#### Console Transport

Output to stdout/stderr with full color support:

```javascript
import { ConsoleTransport } from 'magiclogger/transports/console';

const transport = new ConsoleTransport({
  level: 'debug',
  useColors: true,
  format: 'pretty' // 'json' | 'pretty' | 'compact'
});
```

#### File Transport

Write to files with rotation support:

```javascript
import { FileTransport } from 'magiclogger/transports/file';

const transport = new FileTransport({
  filepath: './logs/app.log',
  maxSize: '10MB',
  maxFiles: 7,
  compress: true,
  format: 'json'
});
```

#### Stream Transport

Write to any Node.js stream:

```javascript
import { StreamTransport } from 'magiclogger/transports/stream';

const transport = new StreamTransport({
  stream: process.stdout,
  format: 'json'
});
```

#### Null Transport

Discard all logs (useful for testing):

```javascript
import { NullTransport } from 'magiclogger/transports/null';

const transport = new NullTransport();
```

### Network Transports

#### HTTP Transport

Send logs to HTTP endpoints with batching and retry:

```javascript
import { HTTPTransport } from 'magiclogger/transports/http';

const transport = new HTTPTransport({
  url: 'https://logs.example.com/ingest',
  method: 'POST',
  headers: { 'X-API-Key': process.env.LOG_API_KEY },
  batch: {
    size: 100,
    timeout: 5000
  },
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  },
  compress: true
});
```

#### WebSocket Transport

Real-time log streaming:

```javascript
import { WebSocketTransport } from 'magiclogger/transports/websocket';

const transport = new WebSocketTransport({
  url: 'wss://logs.example.com/stream',
  reconnect: true,
  reconnectDelay: 1000,
  heartbeat: 30000
});
```

### Database Transports

#### MongoDB Transport

Direct database writes with TTL support:

```javascript
import { MongoDBTransport } from 'magiclogger/transports/mongodb';

const transport = new MongoDBTransport({
  uri: 'mongodb://localhost:27017',
  database: 'logs',
  collection: 'events',
  ttl: 2592000, // 30 days
  createIndex: true,
  batchSize: 100,
  transformDocument: (entry) => ({
    // Custom document structure
    timestamp: new Date(entry.timestampMs),
    severity: entry.level.toUpperCase(),
    data: entry
  })
});
```

#### PostgreSQL Transport

Write to PostgreSQL with automatic table creation:

```javascript
import { PostgreSQLTransport } from 'magiclogger/transports/postgresql';

const transport = new PostgreSQLTransport({
  connectionString: process.env.DATABASE_URL,
  table: 'application_logs',
  createTable: true,
  poolSize: 10,
  batchSize: 100,
  flushInterval: 5000
});
```

### Cloud Storage

#### S3 Transport

Upload logs to AWS S3 with partitioning:

```javascript
import { S3Transport } from 'magiclogger/transports/s3';

const transport = new S3Transport({
  bucket: 'my-app-logs',
  prefix: 'production/',
  region: 'us-east-1',
  compression: 'gzip',
  partitioning: {
    strategy: 'daily', // 'hourly' | 'daily' | 'monthly'
    format: 'year=%Y/month=%m/day=%d/'
  },
  batchSize: 1000,
  flushInterval: 60000,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
```

### Observability Platforms

#### OTLP Transport

OpenTelemetry Protocol for modern observability:

```javascript
import { OTLPTransport } from 'magiclogger/transports/otlp';

const transport = new OTLPTransport({
  endpoint: 'https://otlp.example.com/v1/logs',
  protocol: 'http/protobuf', // or 'grpc'
  headers: { 'x-api-key': process.env.OTLP_KEY },
  serviceName: 'my-service',
  resource: {
    'service.version': '1.0.0',
    'deployment.environment': 'production'
  },
  includeTraceContext: true // Auto-attach trace/span IDs
});
```

## Using Transports

### Basic Usage

#### With createLogger (Recommended)

The `createLogger` factory provides the easiest setup:

```javascript
import { createLogger } from 'magiclogger';
import { FileTransport } from 'magiclogger/transports/file';
import { HTTPTransport } from 'magiclogger/transports/http';

const logger = createLogger({
  // Console is included by default
  transports: [
    new FileTransport({ filepath: './app.log' }),
    new HTTPTransport({ url: 'https://logs.example.com' })
  ]
});

logger.info('Logs go to console, file, and HTTP');
```

#### Custom onFlush Handler

For maximum flexibility, use a custom flush handler:

```javascript
const logger = createLogger({
  onFlush: async (entries) => {
    // Custom processing logic
    await Promise.all([
      writeToCustomDatabase(entries),
      sendToAnalytics(entries),
      archiveToS3(entries)
    ]);
  }
});
```

### AsyncLogger with Transports

The AsyncLogger provides high-throughput logging with batching:

```javascript
import { AsyncLogger } from 'magiclogger';
import { ConsoleTransport, S3Transport } from 'magiclogger/transports';

const logger = new AsyncLogger({
  buffer: {
    size: 16384,
    flushInterval: 100
  },
  transports: [
    new ConsoleTransport({ format: 'pretty' }),
    new S3Transport({ bucket: 'logs' })
  ],
  // Operational utilities
  redactor: { preset: 'strict' },
  rateLimiter: { max: 1000, window: 60000 },
  sampler: { rate: 0.1 }
});

// Check for backpressure
const result = logger.info('High volume log');
if (!result.success) {
  console.warn('Log dropped:', result.reason);
}
```

### SyncLogger with Transports

For scenarios requiring immediate, synchronous output:

```javascript
import { SyncLogger } from 'magiclogger/sync';
import { SyncConsoleTransport, SyncStreamTransport } from 'magiclogger/sync/transports';

const logger = new SyncLogger({
  transports: [
    new SyncConsoleTransport({ useColors: true }),
    new SyncStreamTransport({ 
      stream: process.stdout,
      format: 'json'
    })
  ]
});

// Direct, synchronous writes - no promises
logger.info('Immediate output');
logger.error('Instant error logging');
```

**Note:** Only Console, Stream, and Null transports have synchronous implementations. Network and database transports are inherently asynchronous.

### Tree-Shaking and Bundle Size

MagicLogger's modular design ensures you only include what you use:

```javascript
// ✅ GOOD - Tree-shakeable, minimal bundle
import { Logger } from 'magiclogger';
import { ConsoleTransport } from 'magiclogger/transports/console';

const logger = new Logger({
  transports: [new ConsoleTransport()]
});
// Bundle: ~41KB (33KB core + 8KB console)

// ❌ BAD - Imports all transports
import * as transports from 'magiclogger/transports';
// Bundle: ~55KB+ (includes everything)
```

## Transport Comparison

| Transport | Type | Performance | Use Case | Bundle Size |
|-----------|------|-------------|----------|-------------|
| Console | Sync/Async | Very High | Development, debugging | 8KB |
| Stream | Sync/Async | Very High | Pipes, stdout/stderr | 6KB |
| File | Async | High | Local logging, rotation | 14KB |
| HTTP | Async | Medium | Remote endpoints, APIs | 22KB |
| WebSocket | Async | High | Real-time streaming | 14KB |
| MongoDB | Async | Medium | Direct DB writes | 13KB |
| PostgreSQL | Async | Medium | Structured storage | 8KB |
| S3 | Async | Low | Long-term archival | 14KB |
| OTLP | Async | Medium | Observability platforms | 16KB |
| Null | Sync | Maximum | Testing, benchmarking | 1KB |

## Creating Custom Transports

### Basic Transport

Create a simple custom transport:

```javascript
import { Transport } from 'magiclogger/transports/base';

class CustomTransport extends Transport {
  constructor(options = {}) {
    super('custom', options);
  }

  async log(entry) {
    // Process single log entry
    await this.send(entry);
  }

  async logBatch(entries) {
    // Process multiple entries efficiently
    await this.sendBatch(entries);
  }

  async close() {
    // Cleanup resources
    await this.cleanup();
  }
}
```

### Batching Transport

For efficient batch processing:

```javascript
import { BatchingTransport } from 'magiclogger/transports/base';

class CustomBatchingTransport extends BatchingTransport {
  constructor(options = {}) {
    super('custom-batch', {
      batchSize: 100,
      flushInterval: 5000,
      ...options
    });
  }

  async sendBatch(entries) {
    // Send batch to destination
    const response = await fetch(this.options.url, {
      method: 'POST',
      body: JSON.stringify(entries),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send batch: ${response.status}`);
    }
  }
}
```

### Network Transport with Retry

Handle network failures gracefully:

```javascript
import { NetworkTransport } from 'magiclogger/transports/base';

class ResilientTransport extends NetworkTransport {
  constructor(options = {}) {
    super('resilient', {
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 2
      },
      ...options
    });
  }

  async send(data) {
    return this.retryable(async () => {
      const response = await fetch(this.options.endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    });
  }
}
```

## Performance Considerations

### AsyncLogger Performance

The AsyncLogger achieves high performance through:

1. **Zero-allocation ring buffer** - No object pooling overhead
2. **Microtask batching** - Natural aggregation without promises
3. **Efficient flushing** - Timer-based with size triggers

```javascript
// Optimized for throughput
const logger = createLogger({
  buffer: {
    size: 32768,       // Large buffer for bursts
    flushInterval: 10, // Frequent flushes
    flushSize: 5000    // Large batches
  }
});
// ~130,000 ops/sec with batching benefits
```

### Why We Chose Ring Buffers Over Worker Threads

Pino v7+ moved from separate processes to Worker Threads for transport isolation. MagicLogger deliberately chose a different approach after careful analysis:

#### Pino's Worker Thread Approach

**How it works:** Pino serializes logs and sends them to a Worker Thread where transports run in isolation.

**✅ PROS:**
- **Complete Isolation**: Transport crashes can't affect main thread
- **Parallel Processing**: True CPU parallelism for heavy processing
- **Framework Compatibility**: Works well with frameworks that manage workers

**⚠️ CONS:**
- **Serialization Overhead**: Every log must be serialized/deserialized between threads
- **Complex Debugging**: Cross-thread issues are harder to diagnose
- **Higher Memory**: Each Worker Thread has its own V8 instance (~10MB baseline)
- **Startup Cost**: Workers take time to spawn and warm up
- **Limited Shared State**: Can't share objects between threads

#### MagicLogger's Ring Buffer Approach

**How it works:** MagicLogger uses a pre-allocated ring buffer in the main thread with microtask-based flushing.

**✅ PROS:**
- **No Serialization**: Direct object references, no copying needed
- **Simple Debugging**: Single thread, straightforward stack traces
- **Fast Startup**: No worker spawn time
- **Explicit Backpressure**: Know immediately when buffers are full
- **Simpler Architecture**: Easier to understand and maintain

**⚠️ CONS:**
- **No Isolation**: Transport errors need careful handling
- **Single Thread**: Heavy processing can block (mitigated by async I/O)
- **Manual Shutdown**: Need to flush on exit (handled automatically)

#### Performance Comparison

```javascript
// Pino with Worker Thread
const pino = require('pino');
const transport = pino.transport({
  target: 'pino-pretty'
});
const logger = pino(transport);
logger.info('test'); // High performance with isolation

// MagicLogger with Ring Buffer  
import { createLogger } from 'magiclogger';
const logger = createLogger();
logger.info('test'); // Comparable performance, simpler architecture
```

**The Result:** Both achieve excellent performance. The choice comes down to whether you prioritize isolation (Pino) or simplicity (MagicLogger).

#### When Worker Threads Actually Make Sense

Despite choosing ring buffers by default, Worker Threads are valuable for:

1. **CPU-Intensive Processing**: Log encryption, complex transformations
2. **Untrusted Code**: Running third-party transports safely
3. **Framework Requirements**: When your framework manages workers

You can still use Worker Threads with MagicLogger when needed:

```javascript
import { createLogger } from 'magiclogger';
import { Worker } from 'worker_threads';

const worker = new Worker('./log-processor.js');

const logger = createLogger({
  onFlush: async (entries) => {
    // Send to worker for CPU-intensive processing
    worker.postMessage({ type: 'logs', data: entries });
  }
});
```


## Migration from Pino

### Pino v7 Transport

```javascript
// Pino v7
const transport = pino.transport({
  target: 'pino-pretty',
  options: { destination: 1 }
});
const logger = pino(transport);
```

### MagicLogger Equivalent

```javascript
// MagicLogger
import { createLogger } from 'magiclogger';

const logger = createLogger(); // Pretty console output by default
// OR with explicit transport
import { ConsoleTransport } from 'magiclogger/transports/console';
const logger = createLogger({
  transports: [new ConsoleTransport({ format: 'pretty' })]
});
```

### Key Differences

1. **Default Behavior**: MagicLogger is async by default, Pino is sync by default
2. **Transport Architecture**: MagicLogger uses async buffers, Pino uses Worker Threads
3. **Backpressure**: MagicLogger provides explicit AddResult, Pino may silently drop
4. **Bundle Size**: MagicLogger is more modular with better tree-shaking
5. **Schema**: MagicLogger uses the open MagicLog Schema format

### Migration Strategy

```javascript
// Step 1: Install MagicLogger
npm install magiclogger

// Step 2: Create compatibility wrapper
import { createLogger } from 'magiclogger';
import { HTTPTransport } from 'magiclogger/transports/http';

function createPinoCompatible(options = {}) {
  const transports = [];
  
  // Map Pino transports to MagicLogger
  if (options.transport) {
    if (options.transport.target === 'pino-pretty') {
      // Already included by default
    } else if (options.transport.target === 'pino-http-send') {
      transports.push(new HTTPTransport({
        url: options.transport.options.url
      }));
    }
  }
  
  return createLogger({ transports });
}

// Step 3: Replace gradually
const logger = createPinoCompatible(pinoOptions);
```

## API Reference

### Logger Creation

```typescript
import { createLogger } from 'magiclogger';

interface CreateLoggerOptions {
  // Buffer configuration
  buffer?: {
    size?: number;         // Default: 8192
    flushInterval?: number; // Default: 100ms
    flushSize?: number;     // Default: 1000
  };
  
  // Transports
  transports?: Transport[];
  
  // Custom flush handler (alternative to transports)
  onFlush?: (entries: LogEntry[]) => void | Promise<void>;
  
  // Operational utilities
  redactor?: RedactorOptions;
  rateLimiter?: RateLimiterOptions;
  sampler?: SamplerOptions;
  queueManager?: QueueManagerOptions;
  
  // Behavior
  autoShutdown?: boolean; // Default: true
  sync?: boolean;         // Force sync mode
}

const logger = createLogger(options);
```

### Transport Interface

```typescript
interface Transport {
  readonly name: string;
  
  // Core methods
  log(entry: LogEntry): void | Promise<void>;
  logBatch?(entries: LogEntry[]): void | Promise<void>;
  
  // Lifecycle
  init?(): void | Promise<void>;
  close?(): void | Promise<void>;
  flush?(): void | Promise<void>;
  
  // Control
  shouldLog?(entry: LogEntry): boolean;
  pause?(): void;
  resume?(): void;
}
```

### LogEntry Schema

```typescript
interface LogEntry {
  id: string;
  timestamp: string;      // ISO 8601
  timestampMs: number;    // Unix ms
  level: LogLevel;
  message: string;        // With ANSI codes
  plainMessage: string;   // Without ANSI
  
  // Optional
  context?: Record<string, unknown>;
  tags?: string[];
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    hostname?: string;
    pid?: number;
  };
}
```

### AddResult (Backpressure)

```typescript
interface AddResult {
  success: boolean;
  reason?: 'buffer_full' | 'closing' | 'rate_limited';
  dropped?: LogEntry;
  bufferStats?: {
    size: number;
    capacity: number;
    utilization: number;
  };
}
```

## Summary

MagicLogger's transport system represents a fundamental rethinking of how JavaScript applications handle logging:

- **Async-First Architecture**: Built for modern async applications
- **High Performance**: Ring buffer approach matches Pino's throughput
- **Explicit Backpressure**: Never silently drop logs
- **Modular Design**: Pay only for what you use
- **Open Schema**: MagicLog format works across languages and platforms

Whether you're building a high-throughput microservice or a simple CLI tool, MagicLogger's transport system provides the performance and flexibility you need.