# MagicLogger Transport System

Comprehensive documentation for the MagicLogger transport system, including architecture, implementation details, and usage examples.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Design Principles](#design-principles)
- [Core Components](#core-components)
- [Transport Guide](#transport-guide)
  - [Console Transport](#console-transport)
  - [File Transport](#file-transport)
  - [HTTP Transport](#http-transport)
  - [S3 Transport](#s3-transport)
  - [MongoDB Transport](#mongodb-transport)
  - [WebSocket Transport](#websocket-transport)
  - [Stream Transport](#stream-transport)
- [Formatters](#formatters)
- [Advanced Features](#advanced-features)
  - [Transport Filtering](#transport-filtering)
  - [Batching & Retry](#batching--retry)
  - [Error Handling & Fallbacks](#error-handling--fallbacks)
  - [Aggregation & Monitoring](#aggregation--monitoring)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Custom Transports](#custom-transports)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The MagicLogger transport system provides a flexible, extensible architecture for delivering log entries to various destinations. Transports determine where your logs are sent - whether to the console, files, HTTP endpoints, cloud storage, databases, or custom destinations.

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Code                         │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                              Logger                              │
│  - Creates LogEntry objects                                      │
│  - Manages metadata (ID, tags, context)                         │
│  - Routes to TransportManager                                   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TransportManager                         │
│  - Manages transport lifecycle                                   │
│  - Distributes logs to transports                              │
│  - Aggregates statistics                                        │
│  - Handles global error policies                               │
└─────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│          Transport            │ │       NetworkTransport        │
│  - Base filtering logic       │ │  - Retry logic                │
│  - Statistics tracking        │ │  - Circuit breaker            │
│  - Event emission            │ │  - DLQ management             │
└───────────────────────────────┘ └───────────────────────────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐           ┌─────────────────────────────┐
│ConsoleTransport │           │     BatchingTransport       │
│ FileTransport   │           │  - Queue management         │
│ StreamTransport │           │  - Batch triggers           │
└─────────────────┘           │  - Compression              │
                              └─────────────────────────────┘
                                          │
                                          ▼
                              ┌─────────────────────────┐
                              │   HTTP/S3/MongoDB/WS   │
                              │  - Protocol specific   │
                              │  - Auth handling       │
                              └─────────────────────────┘
```

## Design Principles

### 1. **Separation of Concerns**
- **Logger**: Manages log entry creation and metadata
- **Transports**: Handle log delivery to specific destinations
- **Formatters**: Convert log entries to appropriate formats
- **Transport Manager**: Orchestrates multiple transports

### 2. **Extensibility**
- Abstract base classes for easy custom transport creation
- Plugin architecture for third-party transports
- Composable formatters for any output format

### 3. **Reliability**
- Automatic retry with exponential backoff
- Fallback transports for failure scenarios
- Dead Letter Queue (DLQ) for undeliverable logs
- Circuit breaker pattern for failing transports

### 4. **Performance**
- Intelligent batching to reduce network overhead
- Asynchronous operations to prevent blocking
- Backpressure handling for stream-based transports
- Memory-efficient queue management

### 5. **Cross-Platform Compatibility**
- Unified API for Node.js and browser environments
- Environment-specific optimizations
- Graceful degradation for unsupported features

## Core Components

### LogEntry

The core data structure that flows through the system:

```typescript
interface LogEntry {
  // Identity
  id: string                    // Unique identifier
  timestamp: string             // ISO 8601 timestamp
  timestampMs: number           // Unix timestamp in milliseconds
  
  // Content
  level: LogLevel               // Log level (info, warn, error, etc.)
  message: string               // Formatted message with ANSI codes
  plainMessage?: string         // Plain text message
  
  // Metadata
  loggerId?: string             // Logger instance identifier
  tags?: string[]               // Categorization tags
  context?: Record<string, any> // Structured context data
  error?: ErrorInfo             // Error details if applicable
  metadata?: Record<string, any>// Environment metadata
}
```

### Transport Base Class

The abstract `Transport` class provides:

1. **Lifecycle Management**
   - `init()`: Asynchronous initialization
   - `close()`: Cleanup and resource release
   - State tracking (initialized, closing)

2. **Filtering System**
   - Level-based filtering
   - Tag inclusion/exclusion
   - Custom filter functions
   - `shouldLog()` method for centralized logic

3. **Statistics Tracking**
   - Processed count
   - Success/failure counts
   - Queue size (if applicable)
   - Last success/error timestamps

4. **Event System**
   - Extends EventEmitter
   - Standard events: ready, logged, error, closing, closed
   - Transport-specific events

### BatchingTransport

Extends `Transport` with intelligent batching:

1. **Batch Triggers**
   - Size: Maximum number of entries
   - Time: Maximum wait duration
   - Bytes: Maximum batch size in bytes
   - Immediate: Bypass batching when needed

2. **Queue Management**
   - In-memory queue with size limits
   - Automatic overflow handling
   - Batch metadata tracking

3. **Compression Support**
   - Optional gzip compression
   - Configurable compression level
   - Size reduction metrics

### NetworkTransport

Extends `BatchingTransport` with network-specific features:

1. **Retry Mechanism**
   ```typescript
   interface RetryOptions {
     maxRetries: number         // Maximum retry attempts
     initialDelay: number       // First retry delay
     maxDelay: number          // Maximum retry delay
     backoffFactor: number     // Exponential multiplier
     jitter: boolean           // Add randomness
     retryCondition: Function  // Custom retry logic
   }
   ```

2. **Circuit Breaker**
   - Tracks consecutive failures
   - Opens circuit after threshold
   - Automatic recovery with cooldown
   - Prevents cascade failures

3. **Dead Letter Queue**
   - File-based storage for failed logs
   - Configurable size and retention
   - Automatic cleanup
   - Recovery mechanisms

4. **Fallback Support**
   - Primary → Fallback transport chain
   - Automatic failover
   - Configurable fallback strategies

## Transport Guide

### Console Transport

Outputs logs to the console with color support and formatting options.

```typescript
new ConsoleTransport({
  name: 'console',
  level: 'info',              // Minimum log level
  useColors: true,            // Enable colors
  showTimestamp: true,        // Include timestamp
  showLevel: true,            // Include log level
  showTags: true,             // Include tags
  showMetadata: true,         // Include metadata
  prefix: 'APP',              // Custom prefix
  
  // Custom console methods for different levels
  consoleMethods: {
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
  }
})
```

**Use Cases:**
- Development debugging
- Container logs (stdout/stderr)
- Quick visual feedback
- CI/CD pipeline output

### File Transport

Writes logs to files with rotation, compression, and retention policies.

```typescript
new FileTransport({
  name: 'file',
  filepath: './logs',         // Directory or file path
  isDirectory: true,          // Treat filepath as directory
  rotation: 'daily',          // 'size' | 'daily' | 'hourly' | 'none'
  maxFileSize: 10485760,      // 10MB
  maxFiles: 5,                // Keep 5 backup files
  compress: true,             // Gzip rotated files
  retentionDays: 30,          // Delete logs older than 30 days
  
  format: 'json',             // 'json' | 'plain' | 'custom'
  includeTimestamp: true,
  createDir: true,            // Create directory if missing
  encoding: 'utf8'
})
```

**Features:**
- **Rotation Strategies:**
  - `size`: Rotate when file exceeds maxFileSize
  - `daily`: Rotate at midnight
  - `hourly`: Rotate at the top of each hour
  - `none`: No rotation

- **File Naming:**
  - Current: `app.log`
  - Rotated: `app.log.1`, `app.log.2.gz` (compressed)
  - Date-based: `app-2024-01-15.log`

**Use Cases:**
- Local development logging
- Server application logs
- Audit trails
- Backup logging

### HTTP Transport

Sends logs to HTTP/HTTPS endpoints with authentication and batching.

```typescript
new HTTPTransport({
  name: 'http',
  url: 'https://logs.example.com/v1/logs',
  method: 'POST',             // 'POST' | 'PUT' | 'PATCH'
  
  // Authentication options
  auth: {
    type: 'bearer',           // 'basic' | 'bearer' | 'apikey' | 'custom'
    token: 'your-token',
    // or
    username: 'user',
    password: 'pass',
    // or
    apiKey: 'key',
    apiKeyHeader: 'X-API-Key',
    // or
    customAuth: async () => ({ 'X-Custom': 'value' })
  },
  
  // Request configuration
  bodyFormat: 'json',         // 'json' | 'ndjson' | 'form' | 'custom'
  headers: {
    'X-Service': 'my-app'
  },
  compress: true,             // Gzip request body
  
  // Batching configuration
  maxBatchSize: 100,          // Max logs per batch
  maxBatchTime: 5000,         // Max wait time (ms)
  maxBatchBytes: 1048576,     // Max batch size (1MB)
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true
  },
  
  // Error handling
  fallback: 'file',           // Fallback transport
  dlq: {                      // Dead letter queue
    enabled: true,
    filepath: './logs/dlq.log'
  }
})
```

**Authentication Types:**
- **Basic**: HTTP Basic Authentication
- **Bearer**: Bearer token (JWT, OAuth)
- **API Key**: Custom header with API key
- **Custom**: Function returning headers

**Body Formats:**
- **json**: Single JSON object with logs array
- **ndjson**: Newline-delimited JSON
- **form**: Form data (multipart)
- **custom**: Custom transformation function

**Use Cases:**
- Centralized logging services
- Log aggregation platforms
- Custom API endpoints
- Webhook integrations

### S3 Transport

Archives logs to Amazon S3 with intelligent batching and organization.

```typescript
new S3Transport({
  name: 's3',
  bucket: 'my-logs-bucket',
  region: 'us-east-1',
  prefix: 'app-logs/',        // S3 key prefix
  
  // AWS credentials (uses default chain if not provided)
  credentials: {
    accessKeyId: 'your-key',
    secretAccessKey: 'your-secret',
    sessionToken: 'optional-token'
  },
  
  // Storage configuration
  storageClass: 'STANDARD',   // S3 storage class
  encryption: {
    type: 'AES256',           // 'AES256' | 'KMS'
    kmsKeyId: 'optional-kms-key'
  },
  
  // Key naming strategy
  keyStrategy: 'date-hierarchy', // 'timestamp' | 'date-hierarchy' | 'hourly' | 'custom'
  keyGenerator: (logs) => `custom-${Date.now()}.log`,
  
  // File format
  fileFormat: 'jsonl',        // 'json' | 'jsonl' | 'csv' | 'parquet'
  compress: true,
  
  // Object tagging
  objectTags: {
    Environment: 'production',
    Service: 'api'
  },
  
  // Batching (larger batches for S3)
  maxBatchSize: 1000,
  maxBatchTime: 60000,        // 1 minute
  maxBatchBytes: 5242880      // 5MB
})
```

**Key Strategies:**
- **timestamp**: `logs/1642350000000.json`
- **date-hierarchy**: `logs/2024/01/15/12-30-00.json`
- **hourly**: `logs/2024-01-15-12.json`
- **custom**: User-defined function

**Storage Classes:**
- STANDARD
- STANDARD_IA
- GLACIER
- DEEP_ARCHIVE

**Use Cases:**
- Long-term log archival
- Compliance requirements
- Cost-effective storage
- Data lake integration

### MongoDB Transport

Stores logs in MongoDB with indexing and TTL support.

```typescript
new MongoDBTransport({
  name: 'mongodb',
  uri: 'mongodb://localhost:27017',
  database: 'logs',
  collection: 'entries',
  
  // MongoDB client options
  clientOptions: {
    maxPoolSize: 10,
    retryWrites: true
  },
  
  // Index configuration
  createIndexes: true,        // Auto-create indexes
  ttl: 2592000,              // 30 days TTL
  
  // Document transformation
  transformDocument: (entry) => ({
    ...entry,
    app_version: '1.0.0',
    environment: process.env.NODE_ENV
  }),
  
  // Batching
  maxBatchSize: 100,
  maxBatchTime: 5000
})
```

**Automatic Indexes:**
- timestamp (descending)
- level
- tags (multikey)
- loggerId
- TTL index if configured

**Query Support:**
```typescript
const transport = logger.getTransport('mongodb') as MongoDBTransport;
const recentErrors = await transport.query(
  { level: 'error' },
  { limit: 10, sort: { timestamp: -1 } }
);
```

**Use Cases:**
- Structured log storage
- Complex log queries
- Analytics and reporting
- Integration with MongoDB ecosystem

### WebSocket Transport

Streams logs in real-time over WebSocket connections.

```typescript
new WebSocketTransport({
  name: 'websocket',
  url: 'wss://logs.example.com/stream',
  
  // Authentication
  auth: {
    token: 'auth-token',
    headers: {
      'X-Service-Key': 'key'
    }
  },
  
  // Reconnection
  reconnect: {
    enabled: true,
    maxAttempts: 10,
    delay: 1000
  },
  
  // Protocol
  protocol: 'logs-v1',        // WebSocket subprotocol
  encoding: 'json'            // 'json' | 'msgpack' | 'protobuf'
})
```

**Events:**
```typescript
const wsTransport = logger.getTransport('websocket');
wsTransport.on('connected', () => console.log('Connected'));
wsTransport.on('disconnected', ({ reason }) => console.log('Disconnected:', reason));
wsTransport.on('reconnecting', ({ attempt }) => console.log('Reconnecting:', attempt));
```

**Use Cases:**
- Real-time log monitoring
- Live dashboards
- Development tools
- Streaming analytics

### Stream Transport

Writes logs to any Node.js writable stream.

```typescript
import { createWriteStream } from 'fs';
import { createGzip } from 'zlib';

// Simple file stream
new StreamTransport({
  name: 'file-stream',
  stream: createWriteStream('./app.log'),
  encoding: 'utf8',
  autoClose: true
})

// Compressed stream
const gzip = createGzip();
gzip.pipe(createWriteStream('./app.log.gz'));

new StreamTransport({
  name: 'gzip-stream',
  stream: gzip,
  format: 'json'
})

// Process stdout
new StreamTransport({
  name: 'stdout',
  stream: process.stdout,
  format: 'plain'
})
```

**Use Cases:**
- Custom stream processing
- Pipe to external processes
- Network streams
- Compression pipelines

## Formatters

Formatters control how log entries are serialized. Each transport can use a different formatter.

### Built-in Formatters

```typescript
import { Formatters } from 'magiclogger';

// JSON formatters
formatter: Formatters.json.compact    // Single-line JSON
formatter: Formatters.json.pretty     // Pretty-printed JSON
formatter: Formatters.json.flat       // Flattened JSON
formatter: Formatters.json.minimal    // Only essential fields

// Plain text formatters
formatter: Formatters.plain.simple    // Basic text format
formatter: Formatters.plain.detailed  // Include all details
formatter: Formatters.plain.syslog    // Syslog format
formatter: Formatters.plain.apache    // Apache log format

// Other formats
formatter: Formatters.xml             // XML format
formatter: Formatters.csv             // CSV format
```

### Custom Formatters

```typescript
import { CustomFormatter, LogEntry } from 'magiclogger';

// Using formatter function
new FileTransport({
  name: 'custom',
  filepath: './custom.log',
  formatter: (entry: LogEntry) => {
    return `${entry.timestamp} [${entry.level}] ${entry.message}\n`;
  }
})

// Extending CustomFormatter class
class MyFormatter extends CustomFormatter {
  format(entry: LogEntry): string {
    return `<log level="${entry.level}">${entry.message}</log>`;
  }
  
  getContentType(): string {
    return 'application/xml';
  }
}

new HTTPTransport({
  name: 'xml-logs',
  url: 'https://logs.example.com',
  formatter: (entry) => new MyFormatter().format(entry)
})
```

### Formatter Templates

The PlainTextFormatter supports templates:

```typescript
new PlainTextFormatter({
  template: '[{timestamp}] {level} | {message} | User: {context.userId}',
  timestampFormat: 'locale', // 'iso' | 'locale' | 'unix' | custom function
  levelFormat: 'uppercase',  // 'uppercase' | 'lowercase' | 'capitalize'
  colorize: true
})
```

## Advanced Features

### Transport Filtering

Control which logs go to which transports using filters.

```typescript
// Level-based filtering
new FileTransport({
  name: 'errors-only',
  filepath: './errors.log',
  levels: ['error', 'fatal']  // Only these levels
})

// Tag-based filtering
new S3Transport({
  name: 'audit-logs',
  bucket: 'audit-bucket',
  tags: ['audit', 'security'], // Must have one of these tags
  excludeTags: ['debug']       // Must not have these tags
})

// Custom filter function
new HTTPTransport({
  name: 'metrics',
  url: 'https://metrics.example.com',
  filter: (entry) => {
    return entry.context?.metric !== undefined &&
           entry.context?.value > 100;
  }
})

// Combining filters
new MongoDBTransport({
  name: 'filtered',
  uri: 'mongodb://localhost',
  database: 'logs',
  collection: 'important',
  levels: ['warn', 'error'],
  tags: ['api'],
  filter: (entry) => {
    // Additional custom logic
    return entry.context?.userId !== 'test-user';
  }
})
```

### Batching & Retry

Network transports automatically batch logs and retry failed requests.

```typescript
new HTTPTransport({
  name: 'batched',
  url: 'https://logs.example.com',
  
  // Batching triggers
  maxBatchSize: 100,          // Send when 100 logs accumulated
  maxBatchTime: 5000,         // Send every 5 seconds
  maxBatchBytes: 1048576,     // Send when batch reaches 1MB
  immediate: false,           // Set true to disable batching
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,       // Start with 1 second
    maxDelay: 30000,          // Cap at 30 seconds
    backoffFactor: 2,         // Double delay each retry
    jitter: true,             // Add randomness to prevent thundering herd
    
    // Custom retry condition
    retryCondition: (error) => {
      // Retry on network errors and 5xx status codes
      return error.code === 'ECONNREFUSED' ||
             error.status >= 500;
    }
  }
})
```

#### Retry Flow

```
Initial Attempt
    │
    ├─ Success → Done
    │
    └─ Failure → Retry?
                    │
                    ├─ Yes → Wait (with backoff) → Retry
                    │
                    └─ No → Fallback/DLQ
```

### Error Handling & Fallbacks

Handle transport failures gracefully with fallbacks and dead letter queues.

```typescript
const logger = new Logger({
  transports: [
    new HTTPTransport({
      name: 'primary',
      url: 'https://primary.example.com',
      
      // Fallback to file when HTTP fails
      fallback: new FileTransport({
        name: 'fallback',
        filepath: './fallback.log'
      }),
      
      // Dead Letter Queue for failed logs
      dlq: {
        enabled: true,
        filepath: './dlq.log',
        maxSize: 10485760,    // 10MB
        maxAge: 604800000     // 7 days
      }
    })
  ]
});

// Listen for transport events
const transport = logger.getTransport('primary');
transport.on('error', (error, entry) => {
  console.error('Transport error:', error);
});

transport.on('fallback', ({ fallback, count }) => {
  console.log(`Failed over to ${fallback} for ${count} logs`);
});

transport.on('dlq', ({ count, reason }) => {
  console.log(`${count} logs sent to DLQ: ${reason}`);
});
```

#### Fallback Chain

```
Primary Transport
    │
    └─ Failure → Fallback Transport
                    │
                    └─ Failure → DLQ
                                   │
                                   └─ Failure → Console Warning
```

### Aggregation & Monitoring

Collect statistics across all transports for monitoring.

```typescript
import { TransportManager } from 'magiclogger';

const manager = new TransportManager({
  enableAggregation: true,
  aggregation: {
    interval: 60000,          // Aggregate every minute
    targets: ['monitoring'],  // Send stats to these transports
    fields: ['level', 'tags', 'loggerId']
  }
});

// Add transports to manager
await manager.add(new ConsoleTransport({ name: 'console' }));
await manager.add(new FileTransport({ name: 'file', filepath: './app.log' }));
await manager.add(new HTTPTransport({ 
  name: 'monitoring',
  url: 'https://monitoring.example.com/stats'
}));

// Listen for aggregation events
manager.on('aggregation', (stats) => {
  console.log('Log statistics:', {
    total: stats.total,
    byLevel: stats.byLevel,
    errorRate: stats.errorRate,
    avgSize: stats.avgSize
  });
});

// Get current stats
const stats = logger.getTransportStats();
// Returns:
// {
//   console: { processed: 1000, succeeded: 1000, failed: 0 },
//   file: { processed: 1000, succeeded: 998, failed: 2 },
//   http: { processed: 1000, succeeded: 950, failed: 50, queueSize: 25 }
// }
```

## Examples

### Basic Multi-Transport Setup

```typescript
import { 
  Logger,
  createLogger,
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  S3Transport,
  MongoDBTransport,
  WebSocketTransport,
  StreamTransport,
  TransportManager,
  JSONFormatters,
  PlainTextFormatters,
  Formatters
} from 'magiclogger';

const logger = new Logger({
  id: 'my-app',
  tags: ['production'],
  transports: [
    // Console with colors
    new ConsoleTransport({
      name: 'console',
      level: 'debug',
      useColors: true,
      showTimestamp: true,
    }),
    
    // File with daily rotation
    new FileTransport({
      name: 'file',
      filepath: './logs',
      rotation: 'daily',
      maxFiles: 7,
      format: 'plain',
    }),
  ],
});

// Log some messages
logger.info('Application started');
logger.debug('Debug information', { config: 'loaded' });
logger.warn('Low memory warning', { available: '100MB' });
logger.error('Database connection failed', new Error('Connection timeout'));
logger.success('Task completed successfully');

await logger.close();
```

### Network Transports (HTTP and S3)

```typescript
const logger = new Logger({
  transports: [
    // HTTP transport with authentication
    new HTTPTransport({
      name: 'http-logs',
      url: 'https://logs.example.com/ingest',
      method: 'POST',
      auth: {
        type: 'bearer',
        token: process.env.LOG_API_TOKEN || 'demo-token',
      },
      maxBatchSize: 100,
      maxBatchTime: 5000,
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
      },
      fallback: 'file', // Fall back to file on failure
    }),

    // S3 transport for archival
    new S3Transport({
      name: 's3-archive',
      bucket: process.env.S3_BUCKET || 'my-logs-bucket',
      region: 'us-east-1',
      prefix: 'app-logs/',
      keyStrategy: 'date-hierarchy',
      fileFormat: 'jsonl',
      compress: true,
      maxBatchSize: 1000,
      maxBatchTime: 60000, // 1 minute
      encryption: {
        type: 'AES256',
      },
    }),
  ],
});

// Simulate application logs
for (let i = 0; i < 10; i++) {
  logger.info(`Processing request ${i}`, {
    requestId: `req-${i}`,
    duration: Math.random() * 1000,
  });
}

// Wait for batches to be sent
await new Promise(resolve => setTimeout(resolve, 2000));
await logger.close();
```

### MongoDB with Querying

```typescript
const mongoTransport = new MongoDBTransport({
  name: 'mongodb',
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  database: 'logs',
  collection: 'app_logs',
  createIndexes: true,
  ttl: 30 * 24 * 60 * 60, // 30 days
  maxBatchSize: 50,
});

const logger = new Logger({
  transports: [mongoTransport],
});

// Log various events
logger.info('User login', { userId: 'user123', ip: '192.168.1.1' });
logger.warn('Failed login attempt', { userId: 'user456', ip: '10.0.0.1' });
logger.error('Payment processing failed', {
  orderId: 'order789',
  amount: 99.99,
  error: 'Card declined',
});

// Query logs from MongoDB
if (mongoTransport.query) {
  const recentErrors = await mongoTransport.query(
    { level: 'error' },
    { limit: 10, sort: { timestamp: -1 } }
  );
  console.log('Recent errors:', recentErrors);
}

await logger.close();
```

### Real-time WebSocket Streaming

```typescript
const logger = new Logger({
  transports: [
    new WebSocketTransport({
      name: 'websocket',
      url: process.env.WS_URL || 'ws://localhost:3000/logs',
      reconnect: {
        enabled: true,
        maxAttempts: 5,
        delay: 1000,
      },
      auth: {
        token: 'auth-token',
      },
    }),
  ],
});

// Listen for transport events
const wsTransport = logger.getTransport('websocket');
if (wsTransport) {
  wsTransport.on('connected', () => {
    console.log('WebSocket connected');
  });

  wsTransport.on('disconnected', ({ reason }) => {
    console.log('WebSocket disconnected:', reason);
  });
}

// Stream logs in real-time
const interval = setInterval(() => {
  logger.info('Real-time metric', {
    cpu: Math.random() * 100,
    memory: Math.random() * 8192,
    timestamp: Date.now(),
  });
}, 1000);

// Stop after 10 seconds
setTimeout(async () => {
  clearInterval(interval);
  await logger.close();
}, 10000);
```

### Stream Transport with Compression

```typescript
import { createWriteStream } from 'fs';
import { createGzip } from 'zlib';

// Create a gzip stream
const gzipStream = createGzip();
const fileStream = createWriteStream('./logs/compressed.log.gz');
gzipStream.pipe(fileStream);

const logger = new Logger({
  transports: [
    new StreamTransport({
      name: 'compressed-stream',
      stream: gzipStream,
      format: 'json',
      autoClose: true,
    }),
  ],
});

// Log some data
for (let i = 0; i < 100; i++) {
  logger.info(`Log entry ${i}`, {
    index: i,
    data: 'x'.repeat(100), // Some data to compress
  });
}

await logger.close();
console.log('Compressed logs written to ./logs/compressed.log.gz');
```

### Custom Formatters

```typescript
const logger = new Logger({
  transports: [
    // JSON formatter with pretty print
    new FileTransport({
      name: 'json-pretty',
      filepath: './logs/pretty.json',
      formatter: JSONFormatters.pretty().format,
    }),

    // Plain text with custom template
    new FileTransport({
      name: 'custom-plain',
      filepath: './logs/custom.log',
      formatter: (entry) => {
        const formatter = new PlainTextFormatter({
          template: '[{timestamp}] {level} | {message} | User: {context.userId}',
          timestampFormat: 'locale',
        });
        return formatter.format(entry);
      },
    }),

    // CSV format
    new FileTransport({
      name: 'csv',
      filepath: './logs/events.csv',
      formatter: Formatters.csv,
    }),
  ],
});

// Log with context for template
logger.info('User performed action', { userId: 'john.doe', action: 'login' });
logger.warn('Unusual activity detected', { userId: 'jane.doe', activity: 'multiple-logins' });
logger.error('Action failed', { userId: 'admin', reason: 'insufficient-permissions' });

await logger.close();
```

### Transport Filtering and Routing

```typescript
const logger = new Logger({
  tags: ['api', 'v2'],
  transports: [
    // Console for all levels
    new ConsoleTransport({
      name: 'console-all',
      level: 'debug',
    }),

    // File for errors only
    new FileTransport({
      name: 'error-file',
      filepath: './logs/errors.log',
      levels: ['error'], // Only error level
    }),

    // HTTP for specific tags
    new HTTPTransport({
      name: 'http-metrics',
      url: 'https://metrics.example.com',
      tags: ['metrics'], // Only logs with 'metrics' tag
      filter: (entry) => entry.context?.metric !== undefined,
    }),

    // S3 for audit logs
    new S3Transport({
      name: 's3-audit',
      bucket: 'audit-logs',
      tags: ['audit'], // Only audit-tagged logs
      excludeTags: ['debug'], // Exclude debug audit logs
    }),
  ],
});

// Various log scenarios
logger.info('API request', { endpoint: '/users' });
logger.error('API error', new Error('Not found'));
logger.info('Metric recorded', { metric: 'response_time', value: 123 });
logger.info('User action', { action: 'delete', resource: 'post:123' });

// Tagged logs
const auditLogger = new Logger({
  tags: ['audit'],
  transports: logger.listTransports().map(name => logger.getTransport(name)!),
});

auditLogger.info('User deleted post', { userId: 'admin', postId: '123' });

await logger.close();
```

### Transport Manager with Aggregation

```typescript
// Create transport manager with aggregation
const manager = new TransportManager({
  enableAggregation: true,
  aggregation: {
    interval: 5000, // 5 seconds
    targets: ['monitoring'], // Send aggregated stats to monitoring transport
    fields: ['level', 'tags', 'loggerId'],
  },
});

// Add transports
await manager.add(new ConsoleTransport({ name: 'console' }));
await manager.add(new FileTransport({ 
  name: 'file',
  filepath: './logs/app.log',
}));
await manager.add(new HTTPTransport({
  name: 'monitoring',
  url: 'https://monitoring.example.com/stats',
}));

// Listen for aggregation events
manager.on('aggregation', (stats) => {
  console.log('Aggregation stats:', stats);
});

// Create logger using the manager
const logger = new Logger({
  transports: manager.list().map(name => manager.get(name)!),
});

// Generate some logs
for (let i = 0; i < 20; i++) {
  const level = ['info', 'warn', 'error'][Math.floor(Math.random() * 3)] as any;
  logger.log(`Message ${i}`, level);
}

// Wait for aggregation
await new Promise(resolve => setTimeout(resolve, 6000));

await manager.close();
```

### Error Handling and Fallbacks

```typescript
const logger = new Logger({
  transports: [
    // Primary transport (might fail)
    new HTTPTransport({
      name: 'primary',
      url: 'https://unavailable.example.com',
      timeout: 2000,
      retry: {
        maxRetries: 2,
        initialDelay: 500,
      },
      fallback: new FileTransport({
        name: 'fallback',
        filepath: './logs/fallback.log',
      }),
      dlq: {
        enabled: true,
        filepath: './logs/dlq.log',
      },
    }),

    // Always-on console
    new ConsoleTransport({
      name: 'console',
      silent: false, // Show transport errors
    }),
  ],
});

// Listen for transport errors
const httpTransport = logger.getTransport('primary');
if (httpTransport) {
  httpTransport.on('error', (error, entry) => {
    console.error('Transport error:', error.message);
  });

  httpTransport.on('fallback', ({ fallback, count }) => {
    console.log(`Fell back to ${fallback} for ${count} logs`);
  });
}

// Log some messages
for (let i = 0; i < 5; i++) {
  logger.info(`Message ${i} - might fail and fallback`);
  await new Promise(resolve => setTimeout(resolve, 100));
}

await logger.close();
```

### Using Convenience Function

```typescript
import { createLogger } from 'magiclogger';

// Quick logger setup
const logger = createLogger('my-service', {
  console: true,
  file: {
    filepath: './logs/service.log',
    rotation: 'hourly',
  },
  http: {
    url: 'https://logs.example.com',
    auth: { type: 'apikey', apiKey: 'secret' },
  },
  level: 'debug',
  tags: ['service', 'production'],
});

logger.info('Service started');
logger.debug('Configuration loaded', { env: 'production' });
logger.error('Connection failed', new Error('Timeout'));

// Get transport stats
const stats = logger.getTransportStats();
console.log('Transport statistics:', JSON.stringify(stats, null, 2));

await logger.close();
```

## API Reference

### Transport Interface

```typescript
interface Transport {
  readonly name: string
  enabled: boolean
  
  // Core methods
  log(entry: LogEntry): void | Promise<void>
  logBatch?(entries: LogEntry[]): void | Promise<void>
  init?(): void | Promise<void>
  close(): void | Promise<void>
  flush?(): void | Promise<void>
  
  // Filtering
  shouldLog(entry: LogEntry): boolean
  
  // Statistics
  getStats?(): TransportStats
  
  // Events
  on?(event: string, listener: Function): void
  off?(event: string, listener: Function): void
}
```

### Transport Options

#### BaseTransportOptions

```typescript
interface BaseTransportOptions {
  name: string                  // Unique transport name
  enabled?: boolean             // Enable/disable transport
  level?: LogLevel              // Minimum log level
  levels?: LogLevel[]           // Specific levels only
  tags?: string[]               // Required tags
  excludeTags?: string[]        // Excluded tags
  filter?: (entry: LogEntry) => boolean  // Custom filter
}
```

#### ConsoleTransportOptions

```typescript
interface ConsoleTransportOptions extends BaseTransportOptions {
  useColors?: boolean           // Enable ANSI colors
  showTimestamp?: boolean       // Include timestamp
  showLevel?: boolean           // Include log level
  showTags?: boolean            // Include tags
  showMetadata?: boolean        // Include metadata
  prefix?: string               // Custom prefix
  silent?: boolean              // Suppress all output
  consoleMethods?: {            // Console method mapping
    [level: string]: string
  }
}
```

#### FileTransportOptions

```typescript
interface FileTransportOptions extends BaseTransportOptions {
  filepath: string              // File or directory path
  isDirectory?: boolean         // Treat as directory
  rotation?: 'size' | 'daily' | 'hourly' | 'none'
  maxFileSize?: number          // Max file size (bytes)
  maxFiles?: number             // Max rotated files
  compress?: boolean            // Compress rotated files
  retentionDays?: number        // Delete old files
  format?: 'json' | 'plain'     // Output format
  formatter?: Function          // Custom formatter
  includeTimestamp?: boolean    // Add timestamp to filename
  createDir?: boolean           // Create missing directories
  encoding?: string             // File encoding
}
```

#### HTTPTransportOptions

```typescript
interface HTTPTransportOptions extends BatchingTransportOptions {
  url: string                   // Endpoint URL
  method?: 'POST' | 'PUT' | 'PATCH'
  auth?: AuthOptions            // Authentication config
  headers?: Record<string, string>
  bodyFormat?: 'json' | 'ndjson' | 'form' | 'custom'
  compress?: boolean            // Gzip request body
  timeout?: number              // Request timeout
  retry?: RetryOptions          // Retry configuration
  fallback?: string | Transport // Fallback transport
  dlq?: DLQOptions              // Dead letter queue
}
```

#### S3TransportOptions

```typescript
interface S3TransportOptions extends BatchingTransportOptions {
  bucket: string                // S3 bucket name
  region?: string               // AWS region
  prefix?: string               // Key prefix
  credentials?: AWSCredentials  // AWS credentials
  storageClass?: string         // S3 storage class
  encryption?: {                // Server-side encryption
    type: 'AES256' | 'KMS'
    kmsKeyId?: string
  }
  keyStrategy?: 'timestamp' | 'date-hierarchy' | 'hourly' | 'custom'
  keyGenerator?: Function       // Custom key generator
  fileFormat?: 'json' | 'jsonl' | 'csv' | 'parquet'
  compress?: boolean            // Gzip files
  objectTags?: Record<string, string>
}
```

### Transport Events

All transports emit these standard events:

```typescript
transport.on('ready', () => {})           // Transport initialized
transport.on('logged', (entry) => {})     // Log processed
transport.on('error', (error, entry) => {})  // Error occurred
transport.on('closing', () => {})         // Transport closing
transport.on('closed', () => {})          // Transport closed
```

Network transports emit additional events:

```typescript
transport.on('batch', ({ size, bytes }) => {})      // Batch sent
transport.on('retry', ({ attempt, error }) => {})   // Retry attempted
transport.on('fallback', ({ fallback, count }) => {})  // Fallback used
transport.on('dlq', ({ count, reason }) => {})      // Sent to DLQ
transport.on('circuit-open', () => {})               // Circuit breaker opened
transport.on('circuit-close', () => {})              // Circuit breaker closed
```

## Custom Transports

### Creating a Custom Transport

```typescript
import { Transport, LogEntry, TransportStats } from 'magiclogger';

class MyCustomTransport extends Transport {
  private myConnection: any;

  constructor(options: MyCustomTransportOptions) {
    super(options);
    // Initialize your transport
  }

  protected async doInit(): Promise<void> {
    // Connect to your service
    this.myConnection = await connectToService();
    this.emit('ready');
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    // Send the log entry
    try {
      await this.myConnection.send(entry);
      this.stats.succeeded++;
      this.emit('logged', entry);
    } catch (error) {
      this.stats.failed++;
      this.emit('error', error, entry);
      throw error;
    }
  }

  protected async doClose(): Promise<void> {
    // Clean up resources
    if (this.myConnection) {
      await this.myConnection.close();
    }
  }

  // Optional: Implement batch support
  async logBatch(entries: LogEntry[]): Promise<void> {
    try {
      await this.myConnection.sendBatch(entries);
      this.stats.succeeded += entries.length;
    } catch (error) {
      this.stats.failed += entries.length;
      throw error;
    }
  }

  // Optional: Custom statistics
  getStats(): TransportStats {
    return {
      ...super.getStats(),
      customMetric: this.myConnection.getMetrics()
    };
  }
}
```

### Extending Existing Transports

```typescript
import { HTTPTransport, LogEntry } from 'magiclogger';

class MetricsTransport extends HTTPTransport {
  constructor(options: MetricsTransportOptions) {
    super({
      ...options,
      url: options.metricsEndpoint,
      bodyFormat: 'json',
    });
  }

  // Override log transformation
  protected transformEntry(entry: LogEntry): any {
    return {
      metric: entry.context?.metric,
      value: entry.context?.value,
      timestamp: entry.timestampMs,
      tags: entry.tags,
    };
  }

  // Add custom validation
  shouldLog(entry: LogEntry): boolean {
    return super.shouldLog(entry) && 
           entry.context?.metric !== undefined &&
           entry.context?.value !== undefined;
  }
}
```

### Transport Middleware Pattern

```typescript
class MiddlewareTransport extends Transport {
  private middleware: TransportMiddleware[] = [];
  private innerTransport: Transport;

  use(middleware: TransportMiddleware): void {
    this.middleware.push(middleware);
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    let processedEntry = entry;
    
    // Run middleware chain
    for (const mw of this.middleware) {
      processedEntry = await mw(processedEntry, this);
    }
    
    // Pass to inner transport
    await this.innerTransport.log(processedEntry);
  }
}

// Usage
const transport = new MiddlewareTransport({
  name: 'middleware',
  innerTransport: new FileTransport({ filepath: './logs' })
});

// Add middleware
transport.use(async (entry, transport) => {
  // Add request ID
  entry.context = {
    ...entry.context,
    requestId: generateRequestId()
  };
  return entry;
});

transport.use(async (entry, transport) => {
  // Mask sensitive data
  if (entry.context?.password) {
    entry.context.password = '***';
  }
  return entry;
});
```

## Best Practices

### 1. Choose Appropriate Transports

```typescript
const transports = [];

// Always use console in development
if (process.env.NODE_ENV === 'development') {
  transports.push(new ConsoleTransport({ level: 'debug' }));
}

// File logging for production
if (process.env.NODE_ENV === 'production') {
  transports.push(new FileTransport({ 
    filepath: '/var/log/app',
    rotation: 'daily'
  }));
}

// S3 for long-term archival
if (process.env.S3_BUCKET) {
  transports.push(new S3Transport({ 
    bucket: process.env.S3_BUCKET,
    compress: true
  }));
}
```

### 2. Set Appropriate Batch Sizes

- **Console/File**: No batching needed
- **HTTP**: 100-500 logs per batch
- **S3**: 1000-5000 logs per batch
- **MongoDB**: 50-200 logs per batch

### 3. Use Structured Logging

```typescript
// Good - structured data
logger.info('User action', {
  userId: user.id,
  action: 'login',
  ip: request.ip,
  duration: Date.now() - start
});

// Avoid - unstructured string concatenation
logger.info(`User ${user.id} logged in from ${request.ip}`);
```

### 4. Handle Sensitive Data

```typescript
// Use custom formatter to mask sensitive fields
formatter: (entry) => {
  const sanitized = { ...entry };
  
  // Mask sensitive fields
  const sensitive = ['password', 'ssn', 'creditCard'];
  if (sanitized.context) {
    sensitive.forEach(field => {
      if (sanitized.context[field]) {
        sanitized.context[field] = '***';
      }
    });
  }
  
  return JSON.stringify(sanitized);
}
```

### 5. Monitor Transport Health

```typescript
// Periodically check transport statistics
setInterval(() => {
  const stats = logger.getTransportStats();
  
  for (const [name, stat] of Object.entries(stats)) {
    if (stat.failed > stat.succeeded * 0.1) {
      console.error(`Transport ${name} has high failure rate`);
    }
    
    if (stat.queueSize > 1000) {
      console.warn(`Transport ${name} queue is backing up`);
    }
  }
}, 60000);
```

### 6. Implement Graceful Shutdown

```typescript
// Handle process termination
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  
  // Stop accepting new logs
  logger.setVerbose(false);
  
  // Wait for transports to flush
  await logger.close();
  
  process.exit(0);
});
```

### 7. Use Transport-Specific Features

```typescript
// S3: Use appropriate storage classes
new S3Transport({
  bucket: 'logs',
  storageClass: 'GLACIER', // For archival
  lifecycle: {
    transitions: [
      { days: 30, storageClass: 'STANDARD_IA' },
      { days: 90, storageClass: 'GLACIER' }
    ]
  }
});

// MongoDB: Create appropriate indexes
new MongoDBTransport({
  uri: 'mongodb://localhost',
  createIndexes: true,
  indexes: [
    { key: { timestamp: -1, level: 1 } },
    { key: { 'context.userId': 1 } },
    { key: { tags: 1 } }
  ]
});
```

## Troubleshooting

### Logs Not Appearing

1. **Check transport is enabled**: 
   ```typescript
   console.log(transport.enabled); // Should be true
   ```

2. **Verify log level**: 
   ```typescript
   // Transport level must be <= log entry level
   console.log(transport.options.level);
   ```

3. **Check filters**: 
   ```typescript
   // Test if entry passes filters
   console.log(transport.shouldLog(entry));
   ```

4. **Listen for errors**: 
   ```typescript
   transport.on('error', (error) => {
     console.error('Transport error:', error);
   });
   ```

### High Memory Usage

1. **Reduce batch sizes**:
   ```typescript
   maxBatchSize: 100,  // Lower from default
   maxBatchBytes: 524288  // 512KB instead of 1MB
   ```

2. **Enable compression**:
   ```typescript
   compress: true,
   compressionLevel: 6  // 1-9, higher = more compression
   ```

3. **Implement log rotation**:
   ```typescript
   rotation: 'size',
   maxFileSize: 10485760,  // 10MB
   maxFiles: 5
   ```

4. **Use streaming**:
   ```typescript
   // For large volumes, use StreamTransport
   new StreamTransport({
     stream: createWriteStream('./logs/app.log'),
     highWaterMark: 16384  // 16KB buffer
   })
   ```

### Network Transport Failures

1. **Check connectivity**:
   ```typescript
   // Test endpoint is reachable
   curl -X POST https://logs.example.com/health
   ```

2. **Verify authentication**:
   ```typescript
   // Log auth headers (be careful with secrets!)
   transport.on('request', ({ headers }) => {
     console.log('Auth headers:', Object.keys(headers));
   });
   ```

3. **Enable detailed retry logging**:
   ```typescript
   retry: {
     maxRetries: 3,
     onRetry: (error, attempt) => {
       console.log(`Retry ${attempt}:`, error.message);
     }
   }
   ```

4. **Configure fallbacks**:
   ```typescript
   fallback: new FileTransport({
     filepath: './logs/fallback.log'
   })
   ```

5. **Monitor DLQ**:
   ```typescript
   // Check dead letter queue size
   const dlqStats = await transport.getDLQStats();
   console.log('DLQ entries:', dlqStats.count);
   ```

### Performance Issues

1. **Profile transport performance**:
   ```typescript
   transport.on('batch', ({ size, duration }) => {
     console.log(`Batch of ${size} took ${duration}ms`);
   });
   ```

2. **Adjust batching parameters**:
   ```typescript
   // Find optimal batch size
   maxBatchSize: 200,
   maxBatchTime: 10000,  // 10 seconds
   ```

3. **Use appropriate formatters**:
   ```typescript
   // JSON is faster than pretty-printing
   formatter: Formatters.json.compact
   ```

4. **Enable circuit breaker**:
   ```typescript
   circuitBreaker: {
     enabled: true,
     threshold: 5,  // Open after 5 failures
     timeout: 30000  // Try again after 30s
   }
   ```

## Performance Considerations

### Memory Management

1. **Queue Limits**: Set maximum queue sizes to prevent memory exhaustion
2. **Batch Optimization**: Balance between memory usage and network efficiency
3. **Stream Processing**: Use streams for large log volumes

### Network Efficiency

1. **Connection Pooling**: Reuse connections for HTTP transports
2. **Compression**: Enable gzip for network transports
3. **Batch Sizing**: Larger batches for high-latency destinations

### CPU Usage

1. **Asynchronous Operations**: All I/O operations are non-blocking
2. **Lazy Formatting**: Format only when needed
3. **Efficient Serialization**: Use appropriate formatters for your use case

## Security Considerations

### Authentication

1. **Environment Variables**: Store credentials in environment variables
2. **Token Refresh**: Implement token refresh for long-running applications
3. **Secure Storage**: Use appropriate secret management solutions

### Data Privacy

1. **Sanitization**: Remove sensitive data before logging
2. **Encryption**: Use TLS for network transports, encryption for S3
3. **Retention**: Implement appropriate retention policies

### Compliance

1. **Geographic Restrictions**: Ensure logs stay in required regions
2. **Audit Trails**: Use appropriate transports for audit logging
3. **Access Control**: Implement proper access controls on log storage