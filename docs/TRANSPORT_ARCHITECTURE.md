# Transport Architecture

## Overview

MagicLogger uses a **transport-based architecture** where the logger is just a router that passes log entries to transports. Each transport independently decides how to handle logs based on its specific requirements.

## Core Principles

1. **Logger is just a router** - It only passes log entries to transports
2. **Each transport owns its strategy** - Sync, async, buffered, or worker-based
3. **No buffering at logger level** - The logger never buffers or queues
4. **Transport independence** - Each transport works independently

## Transport Types

### 1. Synchronous Transports
For immediate output with no buffering or async operations.

```typescript
class SyncConsoleTransport {
  log(entry: LogEntry): void {
    // Direct, blocking output
    console.log(format(entry));
  }
}
```

**Use cases:**
- Console output in development
- Critical error logging
- Debugging

### 2. Async Transports
For non-blocking I/O with promises.

```typescript
class AsyncDatabaseTransport {
  async log(entry: LogEntry): Promise<void> {
    await database.insert(entry);
  }
}
```

**Use cases:**
- Database writes
- API calls
- Cloud services

### 3. Worker Thread Transports
For CPU-intensive or high-volume I/O operations.

```typescript
class FileWorkerTransport {
  private worker: Worker;
  
  log(entry: LogEntry): void {
    // Pass raw object to worker (structured clone)
    this.worker.postMessage({ type: 'log', entry });
  }
}
```

**Use cases:**
- File I/O with rotation
- Compression
- High-volume logging
- Network transports with batching

### 4. Buffered Transports
Transports that internally buffer before processing.

```typescript
class BatchingTransport {
  private buffer: LogEntry[] = [];
  
  log(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }
}
```

**Use cases:**
- HTTP batching
- Bulk database inserts
- Rate-limited APIs

## Implementation Guidelines

### 1. Worker Thread Transports

Worker transports should follow this pattern:

```typescript
/**
 * Transport that uses a worker thread for heavy operations.
 * 
 * @class WorkerTransport
 * @extends {Transport}
 */
export class WorkerTransport extends Transport {
  private worker: Worker;
  
  constructor(options: WorkerTransportOptions) {
    super(options);
    this.initializeWorker();
  }
  
  /**
   * Pass log entry to worker without serialization.
   * Uses structured cloning for efficient transfer.
   */
  protected doLog(entry: LogEntry): void {
    this.worker.postMessage({ type: 'log', entry });
  }
  
  private initializeWorker(): void {
    // Worker code handles ALL heavy operations
    const workerCode = `
      const { parentPort } = require('worker_threads');
      
      const buffer = [];
      
      parentPort.on('message', (msg) => {
        if (msg.type === 'log') {
          // Buffer, serialize, write - all in worker
          buffer.push(msg.entry);
          processBuffer();
        }
      });
    `;
    
    this.worker = new Worker(workerCode, { eval: true });
  }
}
```

### 2. Key Architectural Rules

#### ✅ DO:
- Keep main thread operations minimal
- Use structured cloning for worker communication
- Handle all serialization in workers
- Buffer in the transport, not the logger
- Use proper async/await patterns

#### ❌ DON'T:
- Use `queueMicrotask` (fake async)
- Buffer at the logger level
- Serialize on the main thread
- Block the event loop
- Mix sync and async inappropriately

### 3. Transport Lifecycle

```typescript
interface Transport {
  // Core logging method
  log(entry: LogEntry): void | Promise<void>;
  
  // Lifecycle methods
  flush(): Promise<void>;
  close(): Promise<void>;
  
  // Optional hooks
  init?(): Promise<void>;
  pause?(): void;
  resume?(): void;
}
```

## Transport Selection Guide

| Transport Type | Use When | Example |
|---------------|----------|---------|
| **Sync** | Need immediate feedback | Console in dev |
| **Async** | Network/DB operations | HTTP API |
| **Worker** | Heavy I/O or CPU work | File with rotation |
| **Buffered** | Batching is beneficial | Bulk inserts |

## Performance Considerations

### Main Thread Impact

```typescript
// ✅ GOOD - Minimal main thread work
class GoodTransport {
  log(entry: LogEntry): void {
    this.worker.postMessage({ type: 'log', entry });
  }
}

// ❌ BAD - Heavy work on main thread
class BadTransport {
  log(entry: LogEntry): void {
    const json = JSON.stringify(entry);  // Main thread serialization
    const compressed = zlib.gzipSync(json);  // Main thread compression
    fs.writeFileSync('log.gz', compressed);  // Main thread I/O
  }
}
```

### Memory Management

Worker transports should manage their own memory:

```typescript
// In worker thread
class WorkerBuffer {
  private buffer: LogEntry[] = [];
  private readonly maxSize = 10000;
  
  add(entry: LogEntry): void {
    if (this.buffer.length >= this.maxSize) {
      this.flush();
    }
    this.buffer.push(entry);
  }
  
  flush(): void {
    // Process and clear buffer
    this.process(this.buffer);
    this.buffer = [];
  }
}
```

## Example Implementations

### 1. Production File Transport

```typescript
export class ProductionFileTransport extends Transport {
  private worker: Worker;
  
  constructor(options: FileOptions) {
    super(options);
    
    // All heavy work in worker
    this.worker = new Worker('./file-worker.js');
    this.worker.postMessage({
      type: 'init',
      config: {
        filepath: options.filepath,
        maxFileSize: options.maxFileSize || 100_000_000,  // 100MB
        compress: true,
        bufferSize: 10000,
        flushInterval: 1000
      }
    });
  }
  
  log(entry: LogEntry): void {
    // Just pass to worker
    this.worker.postMessage({ type: 'log', entry });
  }
}
```

### 2. Development Console Transport

```typescript
export class DevConsoleTransport extends Transport {
  log(entry: LogEntry): void {
    // Direct, synchronous output for immediate feedback
    const color = this.getColorForLevel(entry.level);
    console.log(color(this.format(entry)));
  }
  
  private format(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level}: ${entry.message}`;
  }
}
```

### 3. HTTP Batch Transport

```typescript
export class HTTPBatchTransport extends Transport {
  private worker: Worker;
  
  constructor(options: HTTPOptions) {
    super(options);
    
    // Worker handles batching and HTTP calls
    this.worker = new Worker('./http-worker.js');
    this.worker.postMessage({
      type: 'init',
      config: {
        endpoint: options.endpoint,
        batchSize: options.batchSize || 100,
        batchInterval: options.batchInterval || 5000,
        headers: options.headers
      }
    });
  }
  
  log(entry: LogEntry): void {
    this.worker.postMessage({ type: 'log', entry });
  }
}
```

## Testing Transports

```typescript
describe('Transport Architecture', () => {
  it('should not block main thread', () => {
    const transport = new FileWorkerTransport({ filepath: 'test.log' });
    
    const start = Date.now();
    for (let i = 0; i < 100000; i++) {
      transport.log({ level: 'info', message: `Message ${i}` });
    }
    const duration = Date.now() - start;
    
    // Should complete quickly since no main thread work
    expect(duration).toBeLessThan(100);
  });
  
  it('should use worker for heavy operations', () => {
    const transport = new FileWorkerTransport({ filepath: 'test.log' });
    
    // Verify worker is used
    expect(transport.worker).toBeDefined();
    
    // Verify no serialization on main thread
    const spy = jest.spyOn(JSON, 'stringify');
    transport.log({ level: 'info', message: 'test' });
    expect(spy).not.toHaveBeenCalled();
  });
});
```

## Migration Guide

### From Old Transport
```typescript
// OLD - Buffering in logger
class OldTransport {
  async log(entry: LogEntry): Promise<void> {
    await this.write(JSON.stringify(entry));
  }
}

// NEW - Transport owns its strategy
class NewTransport extends Transport {
  private worker: Worker;
  
  log(entry: LogEntry): void {
    this.worker.postMessage({ type: 'log', entry });
  }
}
```

## Best Practices

1. **Choose the right transport type** based on your needs
2. **Keep main thread work minimal** - just routing
3. **Use workers for heavy I/O** and CPU-intensive tasks
4. **Buffer in the transport**, not the logger
5. **Handle backpressure** at the transport level
6. **Test for non-blocking behavior** in production transports
7. **Document transport behavior** clearly in JSDoc

## Summary

The transport architecture ensures:
- **Performance**: Main thread stays responsive
- **Flexibility**: Each transport uses the best strategy
- **Scalability**: Worker threads for heavy operations
- **Simplicity**: Logger just routes, transports handle complexity