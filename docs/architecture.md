# MagicLogger - Comprehensive Architecture Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Core Design Principles](#core-design-principles)
4. [Component Architecture](#component-architecture)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Performance Architecture](#performance-architecture)
7. [Module Specifications](#module-specifications)
8. [Transport System Architecture](#transport-system-architecture)
9. [Distributed Tracing Architecture](#distributed-tracing-architecture)
10. [Asynchronous Processing Architecture](#asynchronous-processing-architecture)
11. [Memory Management Strategy](#memory-management-strategy)
12. [API Design Philosophy](#api-design-philosophy)
13. [Extension and Plugin Architecture](#extension-and-plugin-architecture)
14. [Security Considerations](#security-considerations)
15. [Implementation Roadmap](#implementation-roadmap)
16. [Complete Implementation Guide](#complete-implementation-guide)

## Executive Summary

MagicLogger maintains a **universal color logging standard** (MAGIC), a specification that preserves text styling across any language, transport, or platform. Unlike traditional logging libraries that lose formatting when logs are serialized, MagicLogger's MAGIC Schema maintains color and style information as structured data that can be reconstructed anywhere. This enables developers to see beautifully styled logs in production dashboards, just as they appear in local development. MagicLogger is relatively high-performant in tests but it only aims to perform "good enough" rather than best in class, and allows users to sacrifice bytes of traffic to store styles with each log if they so choose.

MAGIC logs are for users who plan to spend a lot of time in dashboards perviewing logs, and want to enjoy a visually clear and stylized experience in development and in production.

**Revolutionary Innovations**:
1. **MAGIC Schema**: An open standard for preserving log styling across languages and platforms
2. **Style Extraction**: Separates content from presentation for universal portability
3. **Async-First Design**: Maximum performance for modern applications with synchronous fallback

The architecture is built on five foundational pillars:

1. **Universal Style Preservation**: The MAGIC Schema separates content from presentation, storing plain text with style ranges that survive serialization
2. **Language Agnostic Design**: Any language can implement MAGIC producers; TypeScript implementation serves as the reference
3. **Async-First Performance**: Default asynchronous logging provides maximum throughput with worker threads for I/O operations
4. **Synchronous Reliability**: Optional synchronous mode for security audits, development, and scenarios requiring immediate guarantees
5. **Cross-Platform Integration**: MAGIC schema enables seamless integration across programming languages and platforms with full style preservation

## System Architecture Overview

### Architectural Layers

The MagicLogger architecture consists of five distinct layers, each with clearly defined responsibilities and interfaces:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│         (User code, frameworks, microservices, CLIs)            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Layer                               │
│      (Logger class, method signatures, configuration)            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│      Processing Layer       │   │      Processing Layer       │
│    (Synchronous Pipeline)   │   │   (Asynchronous Pipeline)   │
│                             │   │                             │
│  • Direct execution         │   │  • Ring buffer              │
│  • No allocations          │   │  • Batch aggregation        │
│  • Immediate output        │   │  • Background flushing      │
└─────────────────────────────┘   └─────────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Transport Layer                           │
│   (Console, File, HTTP, S3, MongoDB, WebSocket, Custom, etc.)   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Model

The system employs a push-based event flow where log entries originate from the application layer and flow downward through the stack. Each layer can transform, filter, or route entries without knowledge of the layers above or below it.

```
[Application Code]
        │
        ├─► logger.info("User login", { userId: 123 })
        │
        ▼
[Logger Instance]
        │
        ├─► Create LogEntry {
        │     id: "1234567890-abc",
        │     timestamp: "2024-01-20T10:30:00Z",
        │     level: "info",
        │     message: "User login",
        │     context: { userId: 123 }
        │   }
        │
        ├─► Decision: Sync or Async?
        │
        ├─► [Sync Path]                    ├─► [Async Path]
        │      │                           │      │
        │      ▼                           │      ▼
        │   Direct dispatch               │   Buffer.add(entry)
        │      │                           │      │
        │      ▼                           │      ▼
        │   TransportManager               │   [Later: Batch Flush]
        │      │                           │      │
        │      ▼                           │      ▼
        │   Transport.log(entry)          │   TransportManager
        │                                  │      │
        │                                  │      ▼
        │                                  │   Transport.logBatch(entries)
        ▼                                  ▼
    [Output]                          [Output]
```

## Core Design Principles

### 1. Performance Through Simplicity

MagicLogger achieves high performance through pure JavaScript rather than native bindings:

- **Ring Buffer**: Pre-allocated circular buffer eliminates allocations
- **Worker Thread I/O**: File and network operations run in separate threads
- **Monomorphic Functions**: Consistent types for JIT optimization
- **Zero Dependencies**: No external library overhead

### 2. Performance First, Features Second

Every architectural decision prioritizes runtime performance, particularly for the synchronous logging path. This manifests in several ways:

- **No Promises in Sync Path**: Synchronous logging never creates Promise objects, avoiding heap allocations
- **Lazy Evaluation**: Expensive operations like serialization happen only when necessary
- **Static Dispatch**: Method calls are monomorphic where possible to enable JIT optimization
- **Object Pooling**: Frequently created objects are pooled and reused

### 3. Transport-Level Optimization

Batching occurs at two independent levels for maximum efficiency:

```typescript
// Stage 1: Logger-level batching (AsyncLogger)
const logger = new AsyncLogger({
  buffer: {
    size: 16384,        // Ring buffer capacity
    flushInterval: 100, // Flush every 100ms
    flushSize: 2000     // Or when 2000 entries accumulate
  }
});

// Stage 2: Transport-level batching (Network transports)
const httpTransport = new HTTPTransport({
  maxBatchSize: 100,     // Transport's own batching
  maxBatchTime: 5000     // Independent of logger batching
});
```

### 4. Tree-Shakeable Architecture

Each feature is in a separate module with dedicated entry points:

```typescript
// Minimal import - just core
import { Logger } from 'magiclogger';

// Specific transport - tree-shakeable
import { HTTPTransport } from 'magiclogger/transports/http';

// Extensions only when needed
import { Redactor } from 'magiclogger/extensions/redactor';
```

### 5. Pay-As-You-Go Architecture

Features have zero cost when not used:

```typescript
// Minimal bundle - only core logger and console transport
import { Logger } from 'magiclogger';
import { ConsoleTransport } from 'magiclogger/transports';

// vs full feature set
import { Logger, HTTPTransport, S3Transport, AsyncBuffer } from 'magiclogger';
```

The build system ensures unused code is eliminated through:

- ES modules with proper `sideEffects: false` declaration
- Granular entry points for each feature
- Static analysis friendly code structure

### 6. Composability Over Configuration

Rather than a monolithic configuration object, the system uses composition:

```typescript
// Composable approach
const logger = new Logger()
  .addTransport(new ConsoleTransport())
  .addTransport(new FileTransport({ path: './app.log' }))
  .addMiddleware(new ContextEnricher())
  .addMiddleware(new ErrorSerializer());

// vs configuration approach
const logger = new Logger({
  transports: ['console', 'file'],
  file: { path: './app.log' },
  middleware: ['context', 'errors']
});
```

### 7. Explicit Over Implicit

The architecture favors explicit behavior over magic:

- No automatic transport discovery
- No implicit async conversion
- No hidden global state
- Clear separation between sync and async APIs

### Variadic Arguments and Metadata Separation

The API layer accepts both classic `(message: string, meta?: object)` calls and console-like variadic arguments. A light normalization step:

- Identifies wrapped metadata (`meta(...)`/`err(...)`) via an internal marker symbol and excludes it from console output.
- Treats a trailing `Error` as structured metadata (`meta.error`) rather than printed data.
- Pretty-prints non-strings for console while preserving a structured `LogEntry` for transports.

This design keeps developer ergonomics (console-like printing) without compromising structured logging needed by transports and downstream systems.

## Component Architecture

### Core Logger Component

The Logger class serves as the primary orchestration point, responsible for:

- **Entry Creation**: Converting method calls into structured LogEntry objects
- **Pipeline Selection**: Routing to sync or async processing
- **Lifecycle Management**: Initializing and closing transports
- **API Surface**: Exposing logging methods to consumers

```typescript
class Logger {
  // Core state
  private readonly id: string;
  private readonly transports: Transport[];
  private readonly contextManager: ContextManager;
  private readonly tagManager: TagManager;
  private asyncBuffer?: AsyncBuffer;
  
  // Configuration
  private readonly options: LoggerOptions;
  
  // Statistics
  private stats = {
    sync: { total: 0, errors: 0 },
    async: { total: 0, errors: 0 }
  };
  
  constructor(options: LoggerOptions = {}) {
    this.id = options.id || this.generateId();
    this.options = this.normalizeOptions(options);
    
    // Initialize core components
    this.contextManager = new ContextManager(options.context);
    this.tagManager = new TagManager(options.tags);
    
    // Initialize transports
    this.transports = this.initializeTransports(options.transports);
    
    // Optional async buffer
    if (options.async?.enabled) {
      this.asyncBuffer = new AsyncBuffer({
        size: options.async.bufferSize || 10000,
        onFlush: entries => this.flushEntries(entries)
      });
    }
  }
  
  // Public API
  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }
  
  // Async namespace
  async = {
    info: (message: string, meta?: any) => {
      return this.logAsync('info', message, meta);
    }
  };
}
```

### LogEntry Structure

The LogEntry represents the canonical format for all log data:

```typescript
interface LogEntry {
  // Identity
  id: string;              // Unique identifier
  timestamp: string;       // ISO 8601 timestamp
  timestampMs: number;     // Unix milliseconds for sorting
  
  // Core content
  level: LogLevel;         // Severity level
  message: string;         // Formatted message
  plainMessage?: string;   // Message without ANSI codes
  
  // Metadata
  loggerId?: string;       // Logger instance ID
  tags?: string[];         // Categorization tags
  context?: Record<string, any>;  // Structured context
  
  // Error details
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: any;
  };
  
  // Environment
  metadata?: {
    hostname?: string;
    pid?: number;
    platform?: string;
    version?: string;
  };
}
```

### Transport Interface

Transports implement a minimal interface for maximum flexibility:

```typescript
interface Transport {
  // Required
  name: string;
  log(entry: LogEntry): void | Promise<void>;
  
  // Optional lifecycle
  init?(): void | Promise<void>;
  close?(): void | Promise<void>;
  flush?(): void | Promise<void>;
  
  // Optional batching
  logBatch?(entries: LogEntry[]): void | Promise<void>;
  
  // Optional filtering
  shouldLog?(entry: LogEntry): boolean;
}
```

### Context Management

The ContextManager handles hierarchical context merging:

```typescript
class ContextManager {
  private globalContext: Record<string, any>;
  
  constructor(initial?: Record<string, any>) {
    this.globalContext = initial || {};
  }
  
  merge(...contexts: Array<Record<string, any> | undefined>): Record<string, any> {
    // Efficient merging without intermediate objects
    const result = Object.create(null);
    
    // Global context first
    for (const key in this.globalContext) {
      result[key] = this.globalContext[key];
    }
    
    // Merge additional contexts
    for (const context of contexts) {
      if (!context) continue;
      for (const key in context) {
        result[key] = context[key];
      }
    }
    
    return result;
  }
}
```

## MAGIC Schema Ingestion Architecture

### Universal Log Ingestion

MagicLogger can consume and display MAGIC-compliant logs from any source, preserving their original styling:

```typescript
// Ingesting MAGIC logs from various sources
class MagicLogIngester {
  private styleReconstructor: StyleReconstructor;
  
  consume(magicEntry: any) {
    // Validate MAGIC compliance
    if (!this.isMAGICCompliant(magicEntry)) {
      throw new Error('Invalid MAGIC format');
    }
    
    // Reconstruct styled output
    const styled = this.reconstructStyles(
      magicEntry.message,
      magicEntry.styles
    );
    
    // Display with original formatting
    console.log(styled);
  }
  
  private reconstructStyles(text: string, styles?: Array<[number, number, string]>) {
    if (!styles) return text;
    
    let result = '';
    let lastEnd = 0;
    
    for (const [start, end, style] of styles) {
      result += text.slice(lastEnd, start);
      result += this.applyStyle(text.slice(start, end), style);
      lastEnd = end;
    }
    result += text.slice(lastEnd);
    
    return result;
  }
}
```

### Cross-Language Integration Points

1. **HTTP Endpoint**: Accept MAGIC logs via REST API
2. **Message Queue**: Consume from Kafka, RabbitMQ, etc.
3. **File Tail**: Read MAGIC logs from files
4. **Direct Integration**: Import logs from other processes

### MAGIC Compliance Validation

```typescript
interface MAGICValidator {
  validate(entry: unknown): boolean {
    // Required fields
    if (!entry.id || !entry.timestamp || !entry.level || !entry.message) {
      return false;
    }
    
    // Validate styles format if present
    if (entry.styles && !Array.isArray(entry.styles)) {
      return false;
    }
    
    // Validate style ranges
    if (entry.styles) {
      for (const range of entry.styles) {
        if (range.length !== 3) return false;
        const [start, end, style] = range;
        if (typeof start !== 'number' || typeof end !== 'number') return false;
        if (start < 0 || end <= start) return false;
      }
    }
    
    return true;
  }
}
```

## Data Flow Architecture

### Structured Logging Format (NDJSON)

MagicLogger supports **NDJSON (Newline Delimited JSON)** format, similar to Pino and other modern logging libraries. This enables:

- **Stream Processing**: Each log entry is a complete JSON object on its own line
- **Easy Parsing**: Line-by-line processing without JSON array parsing
- **Log Aggregation**: Compatible with ELK stack, Splunk, DataDog, and other log aggregators
- **Efficient Storage**: No need to parse entire files, can read line by line
- **Standard Format**: Industry-standard format for structured logging

When using `format: 'json'` with FileTransport, logs are written as NDJSON:

```json
{"id":"abc123","timestamp":"2024-01-20T10:30:00Z","level":"info","message":"User login","context":{"userId":123}}
{"id":"def456","timestamp":"2024-01-20T10:30:01Z","level":"error","message":"Database connection failed","context":{"error":"ECONNREFUSED"}}
{"id":"ghi789","timestamp":"2024-01-20T10:30:02Z","level":"warn","message":"High memory usage","context":{"memoryUsed":1073741824}}
```

Each line is a complete, valid JSON object that can be parsed independently. This format is ideal for:
- Log streaming and tailing
- Real-time log processing
- Log rotation without corrupting JSON structure
- Integration with log management systems

### Synchronous Data Flow

The synchronous path is optimized for minimal overhead:

1. **Method Call**: `logger.info("message", meta)`
2. **Entry Creation**: Build LogEntry object (potentially pooled)
3. **Transport Dispatch**: Direct call to each transport
4. **Output**: Immediate write to destination

```
logger.info("User logged in", { userId: 123 })
     │
     ▼
createEntry() {
  return {
    id: generateId(),           // Fast ID generation
    timestamp: new Date().toISOString(),
    level: "info",
    message: "User logged in",
    context: { userId: 123 }
  }
}
     │
     ▼
for (const transport of transports) {
  transport.log(entry)          // Direct call, no promises
}
     │
     ▼
ConsoleTransport.log(entry) {
  console.log(format(entry))    // Immediate output
}
```

### Asynchronous Data Flow

The async path uses a ring buffer for efficiency:

1. **Method Call**: `logger.async.info("message", meta)`
2. **Entry Creation**: Build LogEntry object
3. **Buffer Addition**: Add to ring buffer
4. **Batch Processing**: Flush on triggers
5. **Transport Dispatch**: Batch dispatch to transports

```
logger.async.info("High frequency log", { data: bigObject })
     │
     ▼
createEntry() // Same as sync
     │
     ▼
asyncBuffer.add(entry) {
  buffer[writeIndex] = entry
  writeIndex = (writeIndex + 1) % capacity
  checkFlushConditions()
}
     │
     ▼
[Flush Triggered by size/time/manual]
     │
     ▼
flushEntries(batch) {
  transportManager.logBatch(batch)
}
     │
     ▼
Transport.logBatch(entries) // Efficient batch processing
```

### Context Flow

Context flows through three levels with right-to-left precedence:

```
Global Context (Logger Level)
    │
    ├─► { service: "api", environment: "prod" }
    │
Request Context (Middleware/Thread)
    │
    ├─► { requestId: "abc-123", userId: 456 }
    │
Log Context (Per Entry)
    │
    ├─► { action: "login", duration: 230 }
    │
    ▼
Final Context (Merged)
    {
      service: "api",
      environment: "prod",
      requestId: "abc-123",
      userId: 456,
      action: "login",
      duration: 230
    }
```

## Performance Architecture

### Implementation Approaches

#### How Sonic-Boom Works (What Pino Uses)

Sonic-boom achieves extreme performance through:

1. **Memory-Mapped Files**: Maps file regions directly to memory addresses, bypassing traditional I/O
2. **Worker Threads**: Offloads all I/O operations to separate threads, preventing any blocking
3. **Large Buffers**: Accumulates writes in 16KB+ buffers before flushing to reduce syscalls
4. **Native Bindings**: Uses C++ for critical paths where JavaScript would be slower

```javascript
// Sonic-boom approach (simplified)
const SonicBoom = require('sonic-boom')
const sonic = new SonicBoom({ 
  fd: process.stdout.fd,
  minLength: 4096,  // Buffer threshold
  sync: false       // Async mode with threads
})
```

#### How MagicLogger Works (Zero Dependencies)

MagicLogger achieves high performance through pure JavaScript techniques:

1. **Ring Buffer Architecture**: Pre-allocated circular buffer that never allocates during operation
2. **Worker Thread Scheduling**: I/O operations run in worker threads for true parallelism
3. **Stream Buffering**: Leverages Node.js built-in stream buffering efficiently
4. **Batch Writing**: Accumulates multiple logs and writes them in single operations

```typescript
// MagicLogger's approach
class AsyncLogger {
  private ringBuffer: RingBuffer;
  private flushScheduled = false;
  
  log(entry: LogEntry) {
    // Add to ring buffer (zero allocation)
    this.ringBuffer.add(entry);
    
    // Schedule flush if not already scheduled
    if (!this.flushScheduled) {
      this.flushScheduled = true;
      this.worker.postMessage({ type: 'flush' });  // Flush in worker
    }
  }
  
  private flush() {
    const batch = this.ringBuffer.drain();
    this.transport.writeBatch(batch);
    this.flushScheduled = false;
  }
}
```

#### File Writing Strategy

**MagicLogger's file transport** uses Node.js streams with optimized settings:

```typescript
class FileTransport {
  constructor(filepath: string) {
    this.stream = fs.createWriteStream(filepath, {
      flags: 'a',              // Append mode
      highWaterMark: 64 * 1024, // 64KB internal buffer
      autoClose: false         // Keep stream open
    });
  }
  
  writeBatch(entries: LogEntry[]) {
    // Write entire batch as single operation
    const chunk = entries.map(JSON.stringify).join('\n') + '\n';
    
    // Non-blocking write with backpressure handling
    if (!this.stream.write(chunk)) {
      // Handle backpressure - wait for drain
      this.stream.once('drain', () => {
        // Continue when buffer space available
      });
    }
  }
}
```

#### Key Differences

**Sonic-Boom (Pino)**:
- Complexity: Uses worker threads and native code
- Dependencies: Requires multiple packages
- Best for: Absolute maximum throughput at any cost

**MagicLogger**:
- Simplicity: Pure JavaScript, single-threaded
- Dependencies: Zero
- Best for: High performance with simplicity and portability

### Asynchronous vs Synchronous Design Philosophy

MagicLogger defaults to asynchronous logging to align with modern application architectures and performance requirements. This design prioritizes:

1. **Performance First**: Near-Pino throughput with zero dependencies
2. **Production Ready**: Robust ring buffer with explicit backpressure handling
3. **Graceful Degradation**: Fallback to sync mode on critical errors
4. **Modern Applications**: Designed for microservices and high-volume systems

The synchronous option (`createSyncLogger`) exists for specific scenarios:
- Security audits and compliance requirements
- Development and debugging environments  
- Legacy applications that can't handle async complexity
- CLI tools and scripts requiring immediate feedback


### Memory Management

The system employs several strategies to minimize memory allocation:

#### Object Pooling

Frequently created objects are pooled:

```typescript
class LogEntryPool {
  private pool: LogEntry[] = [];
  private maxSize = 1000;
  
  acquire(): LogEntry {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createNew();
  }
  
  release(entry: LogEntry): void {
    if (this.pool.length < this.maxSize) {
      this.reset(entry);
      this.pool.push(entry);
    }
  }
  
  private reset(entry: LogEntry): void {
    entry.context = undefined;
    entry.error = undefined;
    entry.tags = undefined;
    // Reset to default state
  }
}
```

#### Ring Buffer

The async buffer pre-allocates memory:

```typescript
class RingBuffer<T> {
  private buffer: Array<T | undefined>;
  private capacity: number;
  private writePos = 0;
  private readPos = 0;
  private size = 0;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }
  
  push(item: T): boolean {
    if (this.size === this.capacity) {
      // Overwrite oldest
      this.readPos = (this.readPos + 1) % this.capacity;
    } else {
      this.size++;
    }
    
    this.buffer[this.writePos] = item;
    this.writePos = (this.writePos + 1) % this.capacity;
    return true;
  }
  
  drain(): T[] {
    const items: T[] = [];
    while (this.size > 0) {
      const item = this.buffer[this.readPos];
      if (item !== undefined) {
        items.push(item);
        this.buffer[this.readPos] = undefined;
      }
      this.readPos = (this.readPos + 1) % this.capacity;
      this.size--;
    }
    return items;
  }
}
```

## Batching Architecture

### Transport-Level Batching

MagicLogger implements batching at two independent levels for maximum efficiency:

#### Stage 1: Logger-Level Batching (AsyncLogger)

The AsyncLogger uses a ring buffer to batch entries before sending to transports:

```typescript
class AsyncLogger {
  private buffer: AsyncBuffer;
  
  constructor(options) {
    this.buffer = new AsyncBuffer({
      size: 16384,           // Fixed-size ring buffer
      flushInterval: 100,    // Time-based flush (ms)
      flushSize: 2000,       // Size-based flush
      onFlush: (entries) => {
        // Send batch to all transports
        this.transportManager.logBatch(entries);
      }
    });
  }
}
```

**Ring Buffer Characteristics:**
- Pre-allocated array (zero allocations during operation)
- Overwrite-oldest policy when full
- Automatic flush on size/time triggers
- ~80,000 ops/sec throughput

#### Stage 2: Transport-Level Batching

Network transports inherit from BatchingTransport for additional batching:

```typescript
class BatchingTransport extends Transport {
  protected maxBatchSize: number;      // e.g., 100 entries
  protected maxBatchTime: number;      // e.g., 5000ms
  protected maxBatchBytes: number;     // e.g., 1MB
  
  private currentBatch: LogEntry[] = [];
  private sendQueue: LogEntry[][] = [];
}
```

**Transport Batching Matrix:**

| Transport | Batching | Default Config |
|-----------|----------|----------------|
| Console | ❌ No | Immediate write |
| File | ❌ No | Immediate write (can add buffer) |
| HTTP | ✅ **Yes** | 100 logs or 5s |
| WebSocket | ✅ **Yes** | 100 logs or 5s |
| S3 | ✅ **Yes** | 1000 logs or 30s |
| MongoDB | ✅ **Yes** | 100 logs or 5s |

#### How Transport Batching Works

```typescript
// Stage 1: Logger-level batching (AsyncLogger)
const logger = new AsyncLogger({
  buffer: {
    size: 16384,        // Ring buffer capacity
    flushInterval: 100, // Flush every 100ms
    flushSize: 2000     // Or when 2000 entries accumulate
  }
});

// Stage 2: Transport-level batching (Network transports)
const httpTransport = new HTTPTransport({
  maxBatchSize: 100,     // Transport's own batching
  maxBatchTime: 5000     // Independent of logger batching
});
```

**Flow Example:**
1. Application logs 5000 entries rapidly
2. AsyncLogger's ring buffer accumulates them
3. After 100ms or 2000 entries, buffer flushes a batch
4. HTTPTransport receives the batch
5. HTTPTransport may further batch these with other flushes
6. After 5 seconds or 100 entries, HTTPTransport sends to server

This transport-level approach provides:
- **Efficiency**: Reduces system calls and network requests
- **Flexibility**: Each stage can be tuned independently
- **Resilience**: Buffers handle bursts at different scales
- **Performance**: Minimizes overhead at both local and network levels

#### String Building Optimization

Efficient string concatenation without intermediate allocations:

```typescript
class StringBuilder {
  private chunks: string[] = [];
  private size = 0;
  
  append(str: string): this {
    this.chunks[this.size++] = str;
    return this;
  }
  
  toString(): string {
    const result = this.chunks.slice(0, this.size).join('');
    this.size = 0; // Reset for reuse
    return result;
  }
}
```

#### Monomorphic Functions

Keep functions monomorphic for JIT optimization:

```typescript
// Bad - polymorphic
function formatEntry(entry: LogEntry | string | Error) {
  if (typeof entry === 'string') return entry;
  if (entry instanceof Error) return entry.message;
  return JSON.stringify(entry);
}

// Good - monomorphic
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function formatString(str: string): string {
  return str;
}

function formatError(error: Error): string {
  return error.message;
}
```

## Module Specifications

### Core Modules

#### Logger Module (`src/Logger.ts`)

Primary responsibilities:
- Public API surface
- Entry creation and routing
- Lifecycle management
- Statistics tracking

Key methods:
- `constructor(options: LoggerOptions)`
- `log(level: LogLevel, message: string, meta?: any): void`
- `info/warn/error/debug/success(message: string, meta?: any): void`
- `async.{level}(message: string, meta?: any): Promise<void>`
- `addTransport(transport: Transport): void`
- `removeTransport(name: string): void`
- `close(): Promise<void>`

#### AsyncBuffer Module (`src/core/AsyncBuffer.ts`)

Primary responsibilities:
- Ring buffer management
- Flush trigger detection
- Batch extraction
- Backpressure handling

Key methods:
- `add(entry: LogEntry): void`
- `flush(): void`
- `drain(): LogEntry[]`
- `setFlushHandler(handler: (entries: LogEntry[]) => void): void`

#### ContextManager Module (`src/core/ContextManager.ts`)

Primary responsibilities:
- Context merging
- Key minification
- Validation

Key methods:
- `merge(...contexts: Record<string, any>[]): Record<string, any>`
- `minify(context: Record<string, any>): Record<string, any>`
- `validate(context: Record<string, any>): ValidationResult`

#### TagManager Module (`src/core/TagManager.ts`)

Primary responsibilities:
- Tag normalization and validation
- Deduplication with order preservation
- Hierarchical tag expansion and management
- Path-based tag generation
- Pattern matching and filtering

**Hierarchical Tag System**:

MagicLogger implements a sophisticated hierarchical tag system that enables powerful log organization and filtering:

1. **Dot Notation Hierarchy**:
   - Tags like `api.v2.users` automatically create parent relationships
   - Enables filtering at any level: `api`, `api.v2`, or `api.v2.users`
   - Supports wildcard patterns: `api.*`, `*.error`, `database.*.slow`

2. **Explicit Parent-Child Relationships**:
   ```typescript
   { name: 'service', children: ['auth', 'payment', 'notification'] }
   // Generates: service, service.auth, service.payment, service.notification
   ```

3. **Path-Based Generation**:
   - File paths: `src/api/v2/users.ts` → `['src', 'src.api', 'src.api.v2', 'src.api.v2.users']`
   - Class/method: `UserService.authenticate` → `['UserService', 'UserService.authenticate']`
   - Module paths: `@app/auth/oauth` → `['app', 'app.auth', 'app.auth.oauth']`

4. **Hierarchical Filtering**:
   - Transport-level filtering based on tag patterns
   - Support for include/exclude rules with hierarchy awareness
   - Efficient pattern matching using optimized data structures

5. **Theme Selection by Hierarchy**:
   - Cascading style rules based on tag specificity
   - More specific tags override general ones
   - Wildcard patterns for cross-cutting concerns

Key methods:
- `normalize(tags: string[]): string[]` - Normalize and validate tags
- `merge(...tagArrays: string[][]): string[]` - Merge and deduplicate tag arrays
- `fromPath(path: string): string[]` - Generate hierarchical tags from file paths
- `fromMethod(className: string, methodName: string): string[]` - Generate from class/method
- `expandHierarchy(tags: TagInput[]): string[]` - Expand parent-child relationships
- `matches(tags: string[], pattern: string): boolean` - Pattern matching with wildcards
- `filter(logs: LogEntry[], pattern: string): LogEntry[]` - Filter logs by tag patterns

### Transport Modules

#### Base Transport (`src/transports/Transport.ts`)

Abstract base class providing:
- Common interface
- Lifecycle hooks
- Error handling
- Statistics

#### ConsoleTransport (`src/transports/ConsoleTransport.ts`)

Features:
- Color support with detection
- Format customization
- Level-based console methods
- Browser/Node compatibility

#### FileTransport (`src/transports/FileTransport.ts`)

Features:
- Rotating file support
- Compression
- Atomic writes
- Directory management

#### HTTPTransport (`src/transports/HTTPTransport.ts`)

Features:
- Batching with size/time triggers
- Retry with exponential backoff
- Request compression
- Custom headers/auth

#### Additional Transports

- **S3Transport**: Direct S3 uploads with partitioning
- **MongoDBTransport**: Direct database writes
- **WebSocketTransport**: Real-time streaming
- **SyslogTransport**: RFC5424 compliant
- **ElasticsearchTransport**: Bulk indexing

### Utility Modules

#### Color Utilities (`src/utils/colors.ts`)
- ANSI code management
- Color detection
- Theme support
- Strip ANSI functions

#### Custom Color Registry (`src/colors/CustomColorRegistry.ts`)
- Dynamic color registration (lazy-loaded)
- RGB, hex, and 256-color support
- Terminal capability detection
- Fallback color management
- Tree-shakeable module

#### Environment Detection (`src/utils/environment.ts`)
- Platform detection
- TTY detection
- Color support detection
- Performance timer selection

#### Formatting Utilities (`src/utils/format.ts`)
- JSON formatting
- Plain text formatting
- CSV formatting
- Custom format support

## Transport System Architecture

### Transport Lifecycle

Each transport follows a defined lifecycle:

```
Creation
   │
   ▼
Initialization (optional async)
   │
   ▼
Active (receiving logs)
   │
   ├─► Pause (temporary)
   │      │
   │      ▼
   │    Resume
   │
   ▼
Closing (flush pending)
   │
   ▼
Closed (resources released)
```

### Transport Manager

The TransportManager coordinates multiple transports:

```typescript
class TransportManager {
  private transports: Map<string, Transport> = new Map();
  private order: string[] = [];
  
  add(transport: Transport, priority?: number): void {
    this.transports.set(transport.name, transport);
    this.updateOrder();
  }
  
  async log(entry: LogEntry): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const name of this.order) {
      const transport = this.transports.get(name);
      if (transport?.shouldLog?.(entry) ?? true) {
        const result = transport.log(entry);
        if (result instanceof Promise) {
          promises.push(result);
        }
      }
    }
    
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }
}
```

### Batching Strategy

Transports can implement batching for efficiency:

```typescript
abstract class BatchingTransport extends Transport {
  private batch: LogEntry[] = [];
  private timer?: NodeJS.Timeout;
  
  protected abstract sendBatch(entries: LogEntry[]): Promise<void>;
  
  log(entry: LogEntry): void {
    this.batch.push(entry);
    
    if (this.batch.length >= this.options.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.options.flushInterval);
    }
  }
  
  async flush(): Promise<void> {
    if (this.batch.length === 0) return;
    
    const entries = this.batch;
    this.batch = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    
    await this.sendBatch(entries);
  }
}
```

### Transport Registry and entrypoints

MagicLogger exposes a central TransportRegistry to decouple discovery from usage. Transports register themselves by a stable key at load time. This enables both dynamic lookups (by name) and explicit, tree-shakeable imports.

Key points:
- Registration: a transport implementation calls `TransportRegistry.register('console', factory)` or similar during its entrypoint module init.
- Lookup: the core can construct transports from config via `TransportRegistry.create('console', opts)` when desired.
- Tree shaking: each transport has a dedicated ESM entrypoint under `magiclogger/transports/<name>`. Importing that file pulls in only the code you need.

Example (OTLP):
```ts
import { OTLPTransport, createOTLPTransport } from 'magiclogger/transports/otlp';
// Direct instantiation
const t = new OTLPTransport({ endpoint: 'https://otlp.example.com/v1/logs', serviceName: 'api' });
// Or factory helper with sane defaults
const t2 = createOTLPTransport({ endpoint: 'https://otlp.example.com/v1/logs', serviceName: 'api' });
```

Build and packaging:
- tsup bundles a separate "transports/otlp" artifact; package.json exports map includes "./transports/otlp".
- Consumers can import only what they use, keeping bundles small. The top-level `./transports` barrel still exists for convenience when size is less critical.

### Error Handling

Transports handle errors gracefully:

```typescript
class ResilientTransport extends Transport {
  private failures = 0;
  private backoffMs = 1000;
  
  async log(entry: LogEntry): Promise<void> {
    try {
      await this.send(entry);
      this.failures = 0;
      this.backoffMs = 1000;
    } catch (error) {
      this.failures++;
      this.handleError(error, entry);
      
      if (this.failures < this.options.maxRetries) {
        setTimeout(() => this.log(entry), this.backoffMs);
        this.backoffMs *= 2;
      } else {
        this.sendToDeadLetter(entry);
      }
    }
  }
}
```

## Distributed Tracing Architecture

### Overview

MagicLogger implements automatic W3C Trace Context extraction and propagation to enable distributed tracing across microservices. The architecture provides zero-configuration trace correlation while allowing custom implementations.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Incoming HTTP Request                        │
│                  (with traceparent/tracestate headers)          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TraceContextMiddleware                        │
│  • Extracts W3C headers (traceparent, tracestate)              │
│  • Validates trace ID and span ID format                       │
│  • Parses sampling flags                                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AsyncLocalStorage                           │
│  • Stores trace context for current execution                  │
│  • Propagates through async operations                         │
│  • Framework-agnostic context storage                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Logger Middleware                           │
│  • Automatically injects trace context into logs               │
│  • No manual passing required                                  │
│  • Works across nested function calls                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Log Entry                                │
│  {                                                              │
│    "message": "...",                                           │
│    "trace": {                                                  │
│      "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",           │
│      "spanId": "00f067aa0ba902b7",                            │
│      "traceFlags": "01",                                       │
│      "sampled": true                                           │
│    }                                                           │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Transport Layer (OTLP, HTTP, etc)            │
│  • Automatically forwards trace context                        │
│  • Maps to OpenTelemetry format                                │
│  • Preserves correlation across services                      │
└─────────────────────────────────────────────────────────────────┘
```

### Trace Context Extraction Strategy

The middleware follows a priority-based extraction strategy:

1. **Custom Extraction Function** (if provided)
   ```typescript
   extractContext: (entry) => customLogic(entry)
   ```

2. **AsyncLocalStorage** (automatic propagation)
   ```typescript
   asyncLocalStorage.getStore()?.traceContext
   ```

3. **HTTP Headers** (W3C standard)
   ```typescript
   extractTraceContext(headers)
   ```

4. **Generate New** (for root spans)
   ```typescript
   { traceId: generateTraceId(), spanId: generateSpanId() }
   ```

### W3C Trace Context Format

#### Traceparent Header
Format: `version-trace-id-parent-id-trace-flags`
Example: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`

- **version**: Always "00" for current spec
- **trace-id**: 32 hex characters (128 bits)
- **parent-id**: 16 hex characters (64 bits)  
- **trace-flags**: 2 hex characters (8 bits, 01 = sampled)

#### Tracestate Header
Vendor-specific key-value pairs for proprietary data
Example: `vendor1=value1,vendor2=value2`

### Framework Integration Architecture

```typescript
// Express Integration
class ExpressTraceMiddleware {
  constructor(private storage: AsyncLocalStorage) {}
  
  middleware = (req, res, next) => {
    const trace = extractTraceContext(req.headers);
    this.storage.run({ req, trace }, next);
  };
}

// Logger Integration
class TraceContextMiddleware extends Middleware {
  process(entry: LogEntry): LogEntry {
    const trace = this.storage.getStore()?.trace;
    return { ...entry, trace };
  }
}
```

### OpenTelemetry Compatibility

MagicLogger's trace context is fully compatible with OpenTelemetry:

```typescript
// Direct mapping to OTLP format
{
  "resourceLogs": [{
    "scopeLogs": [{
      "logRecords": [{
        "traceId": entry.trace.traceId,      // Direct pass-through
        "spanId": entry.trace.spanId,        // Direct pass-through
        "flags": entry.trace.traceFlags,     // Direct pass-through
        "body": { "stringValue": entry.message },
        "attributes": entry.metadata
      }]
    }]
  }]
}
```

### Performance Considerations

1. **Zero-Allocation Design**: Trace context is passed by reference
2. **Lazy Extraction**: Headers parsed only when needed
3. **Cache-Friendly**: Frequently accessed fields co-located
4. **Async-Safe**: Uses AsyncLocalStorage for context propagation

### Security Considerations

1. **Header Validation**: Strict format validation prevents injection
2. **Size Limits**: Headers limited to prevent DoS
3. **No PII**: Trace IDs are random, contain no user data
4. **Sampling Control**: Respect upstream sampling decisions

## Asynchronous Processing Architecture

### Ring Buffer Implementation

The ring buffer provides lock-free async logging:

```typescript
class AsyncBuffer {
  private buffer: Array<LogEntry | null>;
  private capacity: number;
  private writeIndex = 0;
  private readIndex = 0;
  private size = 0;
  private flushHandler: (entries: LogEntry[]) => void;
  private flushTimer?: NodeJS.Timeout;
  
  constructor(options: AsyncBufferOptions) {
    this.capacity = options.capacity || 10000;
    this.buffer = new Array(this.capacity).fill(null);
    this.flushHandler = options.onFlush;
    
    if (options.flushInterval) {
      this.startFlushTimer(options.flushInterval);
    }
  }
  
  add(entry: LogEntry): boolean {
    if (this.size === this.capacity) {
      // Buffer full - overwrite oldest
      this.readIndex = (this.readIndex + 1) % this.capacity;
    } else {
      this.size++;
    }
    
    this.buffer[this.writeIndex] = entry;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    
    // Check flush conditions
    if (this.size >= this.options.flushSize) {
      this.flush();
    }
    
    return true;
  }
  
  flush(): void {
    if (this.size === 0) return;
    
    const entries: LogEntry[] = [];
    
    while (this.size > 0) {
      const entry = this.buffer[this.readIndex];
      if (entry) {
        entries.push(entry);
        this.buffer[this.readIndex] = null;
      }
      this.readIndex = (this.readIndex + 1) % this.capacity;
      this.size--;
    }
    
    if (entries.length > 0) {
      this.flushHandler(entries);
    }
  }
}
```

### Worker Thread Architecture

For CPU-intensive processing:

```typescript
class WorkerTransport extends Transport {
  private worker: Worker;
  private queue: LogEntry[] = [];
  
  constructor(options: WorkerTransportOptions) {
    super(options);
    this.worker = new Worker(options.workerPath);
    this.setupWorker();
  }
  
  private setupWorker(): void {
    this.worker.on('message', ({ type, data }) => {
      if (type === 'ready') {
        this.processQueue();
      } else if (type === 'error') {
        this.handleError(new Error(data));
      }
    });
  }
  
  log(entry: LogEntry): void {
    this.queue.push(entry);
    this.processQueue();
  }
  
  private processQueue(): void {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, 100);
    this.worker.postMessage({ type: 'logs', data: batch });
  }
}
```

### Backpressure Handling

Managing flow control:

```typescript
class BackpressureBuffer extends AsyncBuffer {
  private pressure = 0;
  private highWaterMark: number;
  private lowWaterMark: number;
  
  add(entry: LogEntry): boolean {
    if (this.pressure > this.highWaterMark) {
      // Drop or block based on strategy
      if (this.options.strategy === 'drop') {
        return false;
      } else {
        // Block until pressure reduces
        while (this.pressure > this.lowWaterMark) {
          // Yield to event loop
        }
      }
    }
    
    return super.add(entry);
  }
  
  flush(): void {
    const sizeBefore = this.size;
    super.flush();
    this.pressure -= (sizeBefore - this.size);
  }
}
```

## Memory Management Strategy

### Allocation Patterns

The system follows strict allocation patterns:

- **Pre-allocation**: Buffers and pools allocated at startup
- **Object Reuse**: LogEntry objects recycled through pooling
- **String Interning**: Common strings cached and reused
- **Lazy Initialization**: Components created only when needed

### Garbage Collection Optimization

Minimize GC pressure through:

```typescript
// Bad - creates intermediate objects
function processLog(level: string, message: string, meta: any) {
  const entry = {
    ...baseEntry,
    level,
    message,
    ...meta
  };
  return JSON.stringify(entry);
}

// Good - no intermediate objects
function processLog(level: string, message: string, meta: any) {
  // Reuse string builder
  stringBuilder.reset();
  stringBuilder.append('{"level":"');
  stringBuilder.append(level);
  stringBuilder.append('","message":"');
  stringBuilder.append(message);
  // ... build rest of JSON
  return stringBuilder.toString();
}
```

### Memory Monitoring

Built-in memory monitoring:

```typescript
class MemoryMonitor {
  private baseline: NodeJS.MemoryUsage;
  private interval: NodeJS.Timeout;
  
  start(): void {
    this.baseline = process.memoryUsage();
    
    this.interval = setInterval(() => {
      const current = process.memoryUsage();
      const delta = {
        heapUsed: current.heapUsed - this.baseline.heapUsed,
        external: current.external - this.baseline.external
      };
      
      if (delta.heapUsed > this.options.threshold) {
        this.onThresholdExceeded(delta);
      }
    }, this.options.interval);
  }
}
```

## API Design Philosophy

### Principle of Least Surprise

The API follows familiar patterns:

```typescript
// Matches console.log pattern
logger.info("message");
logger.info("message", { extra: "data" });
logger.info("message", error);

// Familiar method names
logger.debug()
logger.info()
logger.warn()
logger.error()

// Expected behavior
logger.error("Failed", new Error("Network")); // Extracts stack trace
```

### Progressive Disclosure

Simple things are simple, complex things are possible:

```typescript
// Level 1: Simplest usage
const logger = new Logger();
logger.info("Hello");

// Level 2: With configuration
const logger = new Logger({
  id: "my-app",
  transports: [new ConsoleTransport()]
});

// Level 3: Advanced features
const logger = new Logger({
  async: { enabled: true },
  transports: [
    new ConsoleTransport({ level: "debug" }),
    new HTTPTransport({ 
      url: "https://logs.example.com",
      batch: { size: 100, interval: 5000 }
    })
  ]
});

// Level 4: Full control
const logger = new Logger({ minimal: true });
logger.addTransport(customTransport);
logger.addMiddleware(customMiddleware);
logger.on("error", customErrorHandler);
```

### Fluent Interface

Chainable methods for configuration:

```typescript
const logger = new Logger()
  .setId("api-service")
  .addTags(["production", "api"])
  .addContext({ version: "1.0.0" })
  .addTransport(new ConsoleTransport())
  .addTransport(new FileTransport({ path: "./app.log" }))
  .on("error", (err) => console.error("Logger error:", err));
```

## Extension and Plugin Architecture

### Core vs Extensions Philosophy

MagicLogger follows a lean core philosophy where the base logger is fast and minimal, with optional extensions for specialized needs:

**Core Features** (always available):
- Sync and Async loggers
- Built-in ring buffer (AsyncLogger)
- Transport system with automatic batching for network transports
- Styling and theming
- MAGIC schema output

**Optional Extensions** (opt-in when needed):
- PII Redaction (`/extensions/Redactor`)
- Statistical Sampling (`/extensions/Sampler`)
- Rate Limiting (`/extensions/RateLimiter`)
- Advanced Queue Management (`/extensions/QueueManager`)

### Extension Interface

Extensions integrate seamlessly with AsyncLogger:

```typescript
// Extensions are located in src/extensions/
export interface Extension {
  name: string;
  version: string;
  
  // Process log entries
  process?(entry: LogEntry): LogEntry | null;
  
  // Handle backpressure
  shouldDrop?(entry: LogEntry): boolean;
  
  // Metrics and monitoring
  getStats?(): Record<string, any>;
}
```

### AsyncLogger Ring Buffer vs QueueManager Extension

**Built-in Ring Buffer** (Core Feature):
- Fixed-size circular buffer
- Non-blocking writes
- Automatic overflow handling
- Simple drop-tail policy
- Zero additional dependencies

```typescript
const logger = createAsyncLogger({
  buffer: {
    size: 16384,       // Ring buffer size
    flushInterval: 50, // Auto-flush interval
    flushSize: 2000    // Batch size threshold
  }
});
```

**QueueManager Extension** (Optional):
- Advanced drop policies (head, tail, priority, random)
- Priority queuing
- Custom overflow handlers
- Detailed metrics and monitoring
- For specialized use cases

```typescript
import { QueueManager } from 'magiclogger/extensions';

const logger = createAsyncLogger({
  queueManager: new QueueManager({
    maxSize: 100000,
    dropPolicy: 'priority',
    priorityFn: (entry) => entry.level === 'error' ? 1 : 0
  })
});
```

### Using Extensions

Extensions can be composed together:

```typescript
import { createAsyncLogger } from 'magiclogger';
import { Redactor, Sampler, RateLimiter } from 'magiclogger/extensions';

const logger = createAsyncLogger({
  // Extensions are opt-in
  redactor: new Redactor({ preset: 'strict' }),
  sampler: new Sampler({ rate: 0.1 }),
  rateLimiter: new RateLimiter({ max: 1000, window: 60000 }),
  
  // Core configuration
  buffer: { size: 32768 },
  onFlush: async (entries) => {
    await transport.sendBatch(entries);
  }
});
```

### Extension Processing Pipeline

Extensions are applied in order:

```typescript
// Processing order in AsyncLogger:
// 1. Redactor (sanitize sensitive data)
// 2. Sampler (statistical sampling)
// 3. RateLimiter (prevent flooding)
// 4. QueueManager or Ring Buffer (backpressure)
// 5. Transport batching (if applicable)
```

### Event System

Comprehensive event emission:

```typescript
interface LoggerEvents {
  'log': (entry: LogEntry) => void;
  'error': (error: Error, entry?: LogEntry) => void;
  'transport:added': (name: string) => void;
  'transport:removed': (name: string) => void;
  'transport:error': (name: string, error: Error) => void;
  'flush:start': () => void;
  'flush:complete': (count: number) => void;
  'close': () => void;
}
```

## Security Considerations

### Input Sanitization

Prevent log injection attacks:

```typescript
class SecurityMiddleware extends LogMiddleware {
  process(entry: LogEntry, next: () => void): void {
    // Sanitize message
    entry.message = this.sanitize(entry.message);
    
    // Sanitize context values
    if (entry.context) {
      entry.context = this.sanitizeObject(entry.context);
    }
    
    next();
  }
  
  private sanitize(str: string): string {
    return str
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}
```

### Sensitive Data Handling

Automatic redaction of sensitive fields:

```typescript
class RedactionMiddleware extends LogMiddleware {
  private sensitiveKeys = new Set([
    'password', 'token', 'secret', 'key', 'auth',
    'credit_card', 'ssn', 'api_key'
  ]);
  
  process(entry: LogEntry, next: () => void): void {
    if (entry.context) {
      entry.context = this.redactObject(entry.context);
    }
    next();
  }
  
  private redactObject(obj: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (this.sensitiveKeys.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.redactObject(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}
```

### Rate Limiting

Prevent log flooding:

```typescript
class RateLimitMiddleware extends LogMiddleware {
  private counts = new Map<string, number>();
  private resetInterval: NodeJS.Timeout;
  
  constructor(private limit: number, private window: number) {
    super();
    this.resetInterval = setInterval(() => this.counts.clear(), window);
  }
  
  process(entry: LogEntry, next: () => void): void {
    const key = `${entry.level}:${entry.message}`;
    const count = this.counts.get(key) || 0;
    
    if (count < this.limit) {
      this.counts.set(key, count + 1);
      next();
    } else {
      // Drop or queue based on strategy
    }
  }
}
```

## Implementation Roadmap

### Phase 1: Core Foundation (Week 1)

- **Type Definitions** (`types/index.ts`)
  - Complete interface definitions
  - Exported type utilities
  - JSDoc documentation

- **Core Logger** (`Logger.ts`)
  - Constructor and configuration
  - Basic logging methods
  - Sync pipeline implementation

- **Base Transport** (`transports/Transport.ts`)
  - Abstract base class
  - Lifecycle methods
  - Error handling

- **Console Transport** (`transports/ConsoleTransport.ts`)
  - Basic console output
  - Color support
  - Format options

### Phase 2: Essential Features (Week 2)

- **Context Manager** (`core/ContextManager.ts`)
  - Merge functionality
  - Minification support
  - Validation

- **Tag Manager** (`core/TagManager.ts`)
  - Normalization
  - Deduplication
  - Hierarchy support

- **File Transport** (`transports/FileTransport.ts`)
  - Write streams
  - Rotation support
  - Compression

- **HTTP Transport** (`transports/HTTPTransport.ts`)
  - Batching logic
  - Retry mechanism
  - Compression

### Phase 3: Async Support (Week 3)

- **Async Buffer** (`core/AsyncBuffer.ts`)
  - Ring buffer implementation
  - Flush triggers
  - Backpressure handling

- **Logger Async API**
  - Async namespace
  - Promise handling
  - Graceful shutdown

- **Worker Support** (`core/WorkerPool.ts`)
  - Worker thread management
  - Load balancing
  - Error recovery

### Phase 4: Advanced Features (Week 4)

- **Additional Transports**
  - S3Transport
  - MongoDBTransport
  - WebSocketTransport

- **Middleware System**
  - Middleware base class
  - Built-in middleware
  - Plugin support

- **Performance Optimizations**
  - Object pooling
  - String interning
  - JIT optimizations

### Phase 5: Testing & Polish (Week 5)

- **Testing Suite**
  - Unit tests
  - Integration tests
  - Performance benchmarks

- **Documentation**
  - API documentation
  - Migration guides
  - Example applications

## Complete Implementation Guide

### Project Structure Overview

```
magiclogger/
├── package.json
├── tsconfig.json
├── rollup.config.js
├── .gitignore
├── README.md
├── LICENSE
├── CHANGELOG.md
├── src/
│   ├── index.ts
│   ├── Logger.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── logger.ts
│   │   ├── transport.ts
│   │   └── compatibility.ts
│   ├── core/                              # Core logging functionality
│   │   ├── BrowserLogger.ts               # EXISTING - Browser implementation
│   │   ├── BrowserStorageManager.ts       # EXISTING - Browser storage
│   │   ├── Colorizer.ts                   # EXISTING - Color handling
│   │   ├── ContextManager.ts              # EXISTING - Context merging
│   │   ├── FileManager.ts                 # EXISTING - File operations
│   │   ├── Formatter.ts                   # EXISTING - Log formatting
│   │   ├── LoggerBase.ts                  # EXISTING - Base logger class
│   │   ├── NodeLogger.ts                  # EXISTING - Node implementation
│   │   ├── Printer.ts                     # EXISTING - Output printing
│   │   ├── TagManager.ts                  # EXISTING - Tag handling
│   │   └── index.ts
│   ├── async/                             # NEW FOLDER - All async-specific stuff
│   │   ├── AsyncBuffer.ts                 # NEW - Ring buffer
│   │   ├── AsyncLogger.ts                 # NEW - Async logger implementation
│   │   ├── WorkerPool.ts                  # NEW - Worker thread management
│   │   └── index.ts                       # NEW
│   ├── transports/
│   │   ├── base/
│   │   │   ├── Transport.ts
│   │   │   ├── BatchingTransport.ts
│   │   │   └── NetworkTransport.ts
│   │   ├── ConsoleTransport.ts
│   │   ├── FileTransport.ts
│   │   ├── HTTPTransport.ts
│   │   ├── S3Transport.ts
│   │   ├── MongoDBTransport.ts
│   │   ├── WebSocketTransport.ts
│   │   ├── StreamTransport.ts
│   │   └── TransportManager.ts
│   ├── compatibility/
│   │   ├── winston.ts
│   │   ├── bunyan.ts
│   │   └── pino.ts
│   ├── utils/
│   │   ├── colors.ts
│   │   ├── environment.ts
│   │   ├── format.ts
│   │   ├── id-generator.ts               # NEW - ID generation
│   │   ├── log-entry-builder.ts          # NEW - Building log entries
│   │   ├── performance.ts                # NEW - Performance utilities
│   │   └── memory.ts                     # NEW - Memory management
│   ├── constants/
│   │   ├── ansi.ts
│   │   ├── levels.ts
│   │   └── defaults.ts
│   └── plugins/                          # Still separate - these are extensions
│       ├── Plugin.ts
│       ├── HatchetPlugin.ts
│       └── OpenTelemetryPlugin.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
├── examples/
│   ├── basic.js
│   ├── async.js
│   ├── custom-transport.js
│   └── migration-winston.js
└── docs/
    ├── API.md
    ├── TRANSPORTS.md
    ├── MIGRATION.md
    └── PERFORMANCE.md
```

### Better Organization

**Why this makes more sense:**

- **`core/`** = Core logging functionality (formatting, platform-specific loggers, etc.)
- **`async/`** = Everything related to async logging
- **`transports/`** = Where logs go (console, file, network, etc.)
- **`utils/`** = Shared utilities used across the system
- **`plugins/`** = Optional extensions

### NEW FOLDERS:
- `src/async/`

### NEW FILES:

**src/async/**
- `AsyncBuffer.ts`
- `AsyncLogger.ts`
- `WorkerPool.ts`
- `index.ts`

**src/utils/**
- `id-generator.ts`
- `log-entry-builder.ts`
- `performance.ts`
- `memory.ts`

**src/plugins/**
- `Plugin.ts`
- `HatchetPlugin.ts`
- `OpenTelemetryPlugin.ts`

### IMPLEMENTATION PRIORITY ORDER

#### Phase 1: Core Async Support (CRITICAL)

1. `src/async/AsyncBuffer.ts`
2. `src/utils/id-generator.ts`
3. `src/utils/log-entry-builder.ts`
4. Update `src/Logger.ts` with async namespace
5. Update `src/types/logger.ts` with AsyncLogger interface

#### Phase 2: Transport Enhancements

1. Update `src/transports/base/Transport.ts` with capabilities
2. Update `src/transports/base/TransportManager.ts` for batch handling
3. `src/transports/utils/RetryManager.ts`
4. `src/transports/utils/BatchManager.ts`

#### Phase 3: Performance & Monitoring

1. `src/utils/performance.ts`
2. `src/utils/memory.ts`
3. `src/utils/string-builder.ts`
4. `src/async/WorkerPool.ts`

#### Phase 4: Integrations

1. `src/plugins/Plugin.ts`
2. `src/plugins/HatchetPlugin.ts`
3. `src/transports/base/implementations/HatchetTransport.ts`

#### Phase 5: Testing

1. Unit tests for all new files
2. Integration tests for async functionality
3. Performance benchmarks

The main thing is you already have MOST of the architecture in place. You just need to add the async buffer system and performance optimizations we discussed.

## Best Practices

### For Library Users

#### Choose the Right API

```typescript
// For request handlers - use sync
app.get('/api/users', (req, res) => {
  logger.info('Request received', { path: req.path });
});

// For background jobs - use async
async function processJob(job) {
  await logger.async.info('Job started', { jobId: job.id });
}
```

#### Structure Context Properly

```typescript
// Good - flat structure
logger.info('User action', {
  userId: 123,
  action: 'login',
  timestamp: Date.now()
});

// Avoid - deeply nested
logger.info('User action', {
  user: {
    id: 123,
    details: {
      action: 'login'
    }
  }
});
```

#### Use Tags Effectively

MagicLogger's hierarchical tag system enables powerful log organization:

```typescript
// Good - dot notation hierarchy
logger.info('User created', { 
  tags: ['api.v2.users.create'] 
});
// Automatically matches: api, api.v2, api.v2.users, api.v2.users.create

// Good - explicit parent-child relationships
logger.info('Payment processed', {
  tags: [
    { name: 'payment', children: ['stripe', 'successful'] },
    { name: 'api', children: ['v2'] }
  ]
});
// Generates: payment, payment.stripe, payment.successful, api, api.v2

// Good - path-based tags for code organization
import { TagManager } from 'magiclogger';
const tagManager = new TagManager();

const tags = tagManager.fromPath(__filename);
// If file is src/services/payment/stripe.ts
// Generates: src, src.services, src.services.payment, src.services.payment.stripe

// Good - categorical tags with hierarchy
logger.addTags(['env.production', 'severity.critical', 'security.auth']);

// Pattern matching for transport filtering
const logger = new Logger({
  transports: [
    {
      type: 'file',
      path: './api.log',
      filter: (entry) => entry.tags?.some(tag => 
        tag.startsWith('api.') || tag === 'api'
      )
    },
    {
      type: 'file',
      path: './errors.log',
      filter: (entry) => entry.tags?.some(tag =>
        tag.includes('.error') || tag.startsWith('severity.critical')
      )
    }
  ]
});
```

**Tag Hierarchy Best Practices**:

1. **Use dot notation for natural hierarchies**: `service.module.action`
2. **Keep hierarchies shallow**: Maximum 3-4 levels for readability
3. **Be consistent**: Establish naming conventions across your application
4. **Use wildcards judiciously**: `*.error` for cross-cutting concerns
5. **Generate tags programmatically**: Use `TagManager` for consistency
6. **Document your taxonomy**: Maintain a tag reference for your team

### For Transport Developers

#### Handle Backpressure

```typescript
class CustomTransport extends Transport {
  async log(entry: LogEntry): Promise<void> {
    if (this.queue.length > this.maxQueueSize) {
      // Drop, throw, or wait
      throw new Error('Transport overwhelmed');
    }
    this.queue.push(entry);
  }
}
```

#### Implement Graceful Shutdown

```typescript
class CustomTransport extends Transport {
  async close(): Promise<void> {
    // Flush pending data
    await this.flush();
    
    // Close connections
    await this.connection.close();
    
    // Clean up resources
    this.buffer = null;
  }
}
```

#### Report Meaningful Errors

```typescript
class CustomTransport extends Transport {
  async log(entry: LogEntry): Promise<void> {
    try {
      await this.send(entry);
    } catch (error) {
      // Include context in error
      const enhancedError = new Error(
        `Failed to send log: ${error.message}`
      );
      enhancedError.cause = error;
      enhancedError.entry = entry;
      throw enhancedError;
    }
  }
}
```