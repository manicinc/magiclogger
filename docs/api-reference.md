# API Reference

## Core Logger Classes

### Logger (Default Export)

The main logger class that provides both synchronous and asynchronous logging capabilities with automatic console transport.

```typescript
import Logger from 'magiclogger';

const logger = new Logger(options?: LoggerOptions);
```

#### Constructor Options

```typescript
interface LoggerOptions {
  // Basic configuration
  id?: string;                    // Logger instance ID
  tags?: string[];                 // Global tags for all logs
  context?: Record<string, any>;  // Global context for all logs
  verbose?: boolean;               // Enable verbose output
  useColors?: boolean;             // Enable colored output (default: true)
  useConsole?: boolean;            // Add console transport (default: true)
  
  // Styling & themes
  theme?: string | ThemeDefinition;
  
  // Performance features
  buffer?: BufferOptions;
  sampling?: SamplingOptions;
  rateLimit?: RateLimitOptions;
  
  // Security
  redaction?: RedactionOptions;
  
  // Transports
  transports?: Transport[];
}
```

#### Methods

##### Logging Methods

```typescript
// Standard log levels
logger.debug(message: string, meta?: any): void;
logger.info(message: string, meta?: any): void;
logger.warn(message: string, meta?: any): void;
logger.error(message: string, meta?: any): void;
logger.success(message: string, meta?: any): void;
logger.fatal(message: string, meta?: any): void;

// Visual elements
logger.header(text: string, styles?: string[]): void;
logger.separator(char?: string, length?: number): void;
logger.progressBar(percent: number, width?: number): void;
logger.table(data: any[]): void;
logger.diff(label: string, oldObj: any, newObj: any): void;
```

##### Styling Methods

```typescript
// Template literal styling
logger.fmt`@red.bold{ERROR:} Failed to connect to @yellow{${database}}`;

// Chainable style API
logger.s.blue.bold('INFO:');

// Direct color method
logger.color('red', 'bold')('Error message');
```

##### Management Methods

```typescript
// Lifecycle
logger.flush(): Promise<void>;          // Force flush buffers
logger.close(): Promise<void>;          // Graceful shutdown
logger.getStats(): LoggerStats;         // Performance metrics

// Transport management
logger.addTransport(transport: Transport): void;
logger.removeTransport(name: string): void;
logger.getTransports(): Transport[];

// Context & tags management
logger.setContext(context: Record<string, any>): void;    // Replace context
logger.addContext(context: Record<string, any>): void;    // Merge with existing
logger.getContext(): Record<string, any> | undefined;      // Get current context

logger.setTags(tags: string[]): void;                      // Replace tags
logger.addTags(tags: string[]): void;                      // Add to existing
logger.getTags(): string[] | undefined;                    // Get current tags

// Log level management  
logger.setLevel(level: LogLevel): void;                    // Set minimum level
logger.getLevel(): string | undefined;                     // Get current level
logger.isLevelEnabled(level: LogLevel): boolean;           // Check if level is enabled

// Logger identity
logger.getId(): string | undefined;                        // Get logger ID
logger.getBindings(): Record<string, any>;                 // Get all bindings (Pino-style)

// Child loggers
logger.child(options: Partial<LoggerOptions>): Logger;     // Create child with merged config
```

---

### AsyncLogger

High-performance asynchronous logger with ring buffer for maximum throughput.

```typescript
import { AsyncLogger, createAsyncLogger } from 'magiclogger';

const logger = new AsyncLogger(options?: AsyncLoggerOptions);
// or
const logger = createAsyncLogger(options?: AsyncLoggerOptions);
```

#### AsyncLogger Options

```typescript
interface AsyncLoggerOptions extends LoggerOptions {
  buffer?: {
    size?: number;         // Ring buffer size (default: 16384)
    flushInterval?: number; // Auto-flush interval in ms (default: 50)
    flushSize?: number;     // Batch size threshold (default: 2000)
    dropPolicy?: 'tail' | 'head'; // What to drop when full
  };
  
  onFlush?: (entries: LogEntry[]) => void | Promise<void>;
  onDrop?: (entry: LogEntry) => void;
  onError?: (error: Error) => void;
}
```

#### Ring Buffer Behavior

The AsyncLogger uses a pre-allocated ring buffer for zero-allocation logging:

- **Fixed size**: No memory allocation during operation
- **Automatic flushing**: Based on time or size triggers
- **Overflow handling**: Drops oldest entries when full
- **Backpressure**: Returns `{ success: boolean, reason?: string }`

```typescript
const result = logger.info('High volume log');
if (!result.success) {
  console.warn(`Log dropped: ${result.reason}`);
}
```

---

### SyncLogger

Synchronous logger for guaranteed delivery and immediate output.

```typescript
import { SyncLogger, createSyncLogger } from 'magiclogger';

const logger = new SyncLogger(options?: SyncLoggerOptions);
// or
const logger = createSyncLogger(options?: SyncLoggerOptions);
```

#### SyncLogger Options

```typescript
interface SyncLoggerOptions extends LoggerOptions {
  file?: string;           // Log file path
  forceFlush?: boolean;    // fsync after each write
  encoding?: BufferEncoding; // File encoding (default: 'utf8')
}
```

Use cases:
- Security audits requiring guaranteed delivery
- Development and debugging
- CLI tools needing immediate feedback
- Legacy applications

---

## Transports

### ConsoleTransport

Outputs logs to the console with color support.

```typescript
import { ConsoleTransport } from 'magiclogger/transports';

const transport = new ConsoleTransport({
  level?: LogLevel;        // Minimum level to log
  useColors?: boolean;     // Enable colors (default: true)
  format?: 'pretty' | 'json' | 'compact';
  timestamp?: boolean;     // Include timestamps
});
```

### FileTransport

Writes logs to files with rotation support.

```typescript
import { FileTransport } from 'magiclogger/transports';

const transport = new FileTransport({
  filepath: string;        // Required: log file path
  maxFiles?: number;       // Max rotated files to keep
  maxSize?: string;        // Max file size (e.g., '10MB')
  compress?: boolean;      // Compress rotated files
  encoding?: BufferEncoding;
  mode?: number;          // File permissions
});
```

### HTTPTransport

Sends logs to HTTP endpoints with batching and retry.

```typescript
import { HTTPTransport } from 'magiclogger/transports';

const transport = new HTTPTransport({
  url: string;            // Required: endpoint URL
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  
  // Batching
  batch?: {
    size?: number;        // Max batch size (default: 100)
    timeout?: number;     // Max wait time in ms (default: 5000)
    maxBytes?: number;    // Max batch size in bytes
  };
  
  // Retry
  retry?: {
    attempts?: number;    // Max retry attempts
    delay?: number;       // Initial delay in ms
    maxDelay?: number;    // Max delay between retries
    factor?: number;      // Exponential backoff factor
  };
  
  // Compression
  compress?: boolean | 'gzip' | 'deflate' | 'br';
});
```

### WebSocketTransport

Real-time log streaming via WebSocket.

```typescript
import { WebSocketTransport } from 'magiclogger/transports';

const transport = new WebSocketTransport({
  url: string;            // Required: WebSocket URL
  reconnect?: boolean;    // Auto-reconnect on disconnect
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  
  // Batching (same as HTTPTransport)
  batch?: BatchOptions;
});
```

### S3Transport

Direct upload to Amazon S3 with partitioning.

```typescript
import { S3Transport } from 'magiclogger/transports';

const transport = new S3Transport({
  bucket: string;         // Required: S3 bucket name
  region?: string;
  credentials?: AWS.Credentials;
  
  // Partitioning
  keyPrefix?: string;     // e.g., 'logs/'
  partition?: 'daily' | 'hourly' | 'none';
  
  // Batching
  batch?: {
    size?: number;        // Logs per batch (default: 1000)
    timeout?: number;     // Max wait time (default: 30000)
  };
  
  compress?: boolean;     // Compress before upload
});
```

### MongoDBTransport

Direct database writes with connection pooling.

```typescript
import { MongoDBTransport } from 'magiclogger/transports';

const transport = new MongoDBTransport({
  uri: string;            // Required: MongoDB connection URI
  database?: string;      // Database name
  collection?: string;    // Collection name (default: 'logs')
  
  // Batching
  batch?: BatchOptions;
  
  // Indexes
  createIndexes?: boolean; // Auto-create indexes
});
```

### Custom Transport

Create your own transport by extending the base Transport class:

```typescript
import { Transport } from 'magiclogger/transports/base';

class CustomTransport extends Transport {
  constructor(options: CustomTransportOptions) {
    super(options);
    // Initialize your transport
  }
  
  async log(entry: LogEntry): Promise<void> {
    // Handle single log entry
  }
  
  async logBatch(entries: LogEntry[]): Promise<void> {
    // Handle batch of entries (optional)
  }
  
  async flush(): Promise<void> {
    // Flush any pending data
  }
  
  async close(): Promise<void> {
    // Clean up resources
  }
}
```

---

## Helper Functions

### Meta Helper

Attach metadata without printing it to console:

```typescript
import { meta } from 'magiclogger';

logger.info('User logged in', meta({ userId: '123', sessionId: 'abc' }));
// Console: User logged in
// Structured output includes metadata
```

### Error Helper

Structure error objects for logging:

```typescript
import { err } from 'magiclogger';

try {
  // code that might throw
} catch (error) {
  logger.error('Operation failed', err(error), meta({ operation: 'save' }));
}
```

### Create Logger Functions

Factory functions with sensible defaults:

```typescript
import { 
  createLogger,       // Smart logger (auto-detects best mode)
  createAsyncLogger,  // Async logger with ring buffer
  createSyncLogger    // Synchronous logger
} from 'magiclogger';

// Smart detection
const logger = createLogger(); // Async in production, sync in dev

// Explicit async
const asyncLogger = createAsyncLogger({
  buffer: { size: 32768 }
});

// Explicit sync
const syncLogger = createSyncLogger({
  file: './audit.log'
});
```

---

## Types

### LogEntry

The structured format for all log entries:

```typescript
interface LogEntry {
  // Identity
  id: string;                    // Unique identifier
  timestamp: string;             // ISO 8601 timestamp
  timestampMs: number;           // Unix milliseconds
  
  // Content
  level: LogLevel;               // Log severity
  message: string;               // Plain text message
  styles?: Array<[number, number, string]>; // MAGIC style ranges
  
  // Metadata
  loggerId?: string;
  tags?: string[];
  context?: Record<string, any>;
  
  // Error details
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: any;
  };
  
  // Trace context (W3C)
  trace?: {
    traceId: string;
    spanId: string;
    traceFlags?: string;
    sampled?: boolean;
  };
  
  // System metadata
  metadata?: {
    hostname?: string;
    pid?: number;
    platform?: string;
    nodeVersion?: string;
  };
}
```

### LogLevel

Available log levels:

```typescript
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
```

### Transport Interface

```typescript
interface Transport {
  name: string;
  
  // Required
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

---

## Extensions

Optional extensions for specialized needs:

### Redactor

PII and sensitive data redaction:

```typescript
import { Redactor } from 'magiclogger/extensions';

const logger = new Logger({
  redactor: new Redactor({
    preset: 'strict',           // 'none' | 'basic' | 'strict'
    patterns: [                 // Custom patterns
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, // Credit cards
      /\b\d{3}-\d{2}-\d{4}\b/g,        // SSN
    ],
    keys: ['password', 'token', 'secret'], // Keys to redact
  })
});
```

### Sampler

Statistical sampling for high-volume logging:

```typescript
import { Sampler } from 'magiclogger/extensions';

const logger = new Logger({
  sampler: new Sampler({
    rate: 0.1,                  // Sample 10% of logs
    strategy: 'random',         // 'random' | 'reservoir' | 'adaptive'
    alwaysInclude: ['error', 'fatal'], // Always log these levels
  })
});
```

### RateLimiter

Prevent log flooding:

```typescript
import { RateLimiter } from 'magiclogger/extensions';

const logger = new Logger({
  rateLimiter: new RateLimiter({
    max: 1000,                  // Max logs per window
    window: 60000,              // Time window in ms
    strategy: 'sliding',        // 'fixed' | 'sliding' | 'token-bucket'
  })
});
```

### QueueManager

Advanced queue management for AsyncLogger:

```typescript
import { QueueManager } from 'magiclogger/extensions';

const logger = new AsyncLogger({
  queueManager: new QueueManager({
    maxSize: 100000,
    dropPolicy: 'priority',     // 'head' | 'tail' | 'priority' | 'random'
    priorityFn: (entry) => entry.level === 'error' ? 1 : 0,
  })
});
```

---

## MAGIC Schema

MagicLogger outputs logs in the MAGIC Schema format, preserving styling information:

```json
{
  "id": "1234567890-abc",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "timestampMs": 1705316400000,
  "level": "error",
  "message": "Error: Database connection failed",
  "styles": [
    [0, 6, "red.bold"],
    [7, 35, "yellow"]
  ],
  "context": {
    "database": "production",
    "attempts": 3
  }
}
```

The `styles` array contains `[startIndex, endIndex, styleString]` tuples that preserve text formatting across any transport or platform.

---

## Migration Guides

### From Winston

```typescript
// Winston
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// MagicLogger equivalent
import { Logger, ConsoleTransport, FileTransport } from 'magiclogger';
const logger = new Logger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({ filepath: 'app.log' })
  ]
});
```

### From Pino

```typescript
// Pino
const pino = require('pino');
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// MagicLogger equivalent
import { createAsyncLogger } from 'magiclogger';
const logger = createAsyncLogger({
  useColors: true,
  buffer: { size: 32768 } // High-performance like Pino
});
```

### From Bunyan

```typescript
// Bunyan
const bunyan = require('bunyan');
const logger = bunyan.createLogger({
  name: 'myapp',
  streams: [
    { stream: process.stdout },
    { path: '/var/log/myapp.log' }
  ]
});

// MagicLogger equivalent
import { Logger, ConsoleTransport, FileTransport } from 'magiclogger';
const logger = new Logger({
  id: 'myapp',
  transports: [
    new ConsoleTransport(),
    new FileTransport({ filepath: '/var/log/myapp.log' })
  ]
});
```