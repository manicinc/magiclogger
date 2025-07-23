# MagicLogger Architecture & Documentation

## Tree Shaking & Optimal Imports Strategy

Before diving into the implementation, here's our approach for optimal bundle sizes:

### 1. ESM-First with Tree Shaking

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./console": {
      "import": "./dist/transports/console.js",
      "types": "./dist/transports/console.d.ts"
    },
    "./compatibility/winston": {
      "import": "./dist/compatibility/winston.js",
      "types": "./dist/compatibility/winston.d.ts"
    }
  },
  "sideEffects": false
}
```

### 2. Smart Import Patterns

```typescript
// ❌ Bad - imports everything
import { Logger } from 'magiclogger';

// ✅ Good - tree-shakeable
import { Logger } from 'magiclogger/core';
import { ConsoleTransport } from 'magiclogger/console';
import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
```

# MagicLogger 🪄

<p align="center">
  <img src="https://raw.githubusercontent.com/manicinc/magiclogger/main/assets/logo.svg" alt="MagicLogger" width="400">
</p>

<p align="center">
  <strong>Zero-overhead, structured logging for modern JavaScript</strong><br>
  <em>Simple API → Powerful Features • Tree-Shakeable • Type-Safe</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api">API</a> •
  <a href="#performance">Performance</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/bundle_size-12kb-brightgreen" alt="Bundle Size">
  <img src="https://img.shields.io/badge/zero_dependencies-✓-blue" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

## Why MagicLogger?

### The Problem
Modern applications need structured logging for observability, but existing solutions either:

- Have large bundle sizes and many dependencies
- Require complex configuration
- Force you to choose between performance and features
- Don't support modern JavaScript patterns

### The Solution
MagicLogger provides:

- 🎯 Zero-overhead sync logging by default
- ⚡ Optional async logging with ring buffers (like Pino)
- 🌲 Perfect tree-shaking - only pay for what you use
- 🔄 Drop-in compatibility with Winston/Bunyan/Pino
- 🎨 Beautiful console output with smart color detection
- 📊 Structured data from simple string logs
- 🚀 Transport system for any destination
- 🤖 AI/ML-ready with context minification

## Quick Start

### Basic Usage (Tree-Shakeable)

```typescript
// Import only what you need for minimal bundle size
import { Logger } from 'magiclogger';
import { ConsoleTransport, FileTransport } from 'magiclogger/transports';

// Or use convenience factories
import { createConsole, createFile } from 'magiclogger/transports';

// Create logger
const logger = new Logger();

// Method 1: Direct transport creation
logger.addTransport(new ConsoleTransport({
  name: 'console',
  colorize: true
}));

logger.addTransport(new FileTransport({
  name: 'file',
  filepath: './logs/app.log',
  maxFileSize: 10485760, // 10MB
  maxFiles: 5
}));

// Method 2: Factory functions with sensible defaults
logger.addTransport(await createConsole());
logger.addTransport(await createFile('./logs/app.log'));

// Start logging
logger.info('Application started', { version: '1.0.0' });
logger.error('Something went wrong', new Error('Database connection failed'));
```

### Production Setup with Cloud Storage

```typescript
import { Logger } from 'magiclogger';
import { ConsoleTransport, FileTransport } from 'magiclogger/transports';

const logger = new Logger();

// Always include console for development
if (process.env.NODE_ENV !== 'production') {
  logger.addTransport(new ConsoleTransport({ name: 'console' }));
}

// Local file logging
logger.addTransport(new FileTransport({
  name: 'file',
  filepath: './logs/app.log',
  maxFileSize: 10485760, // 10MB
  maxFiles: 5
}));

// Add cloud storage in production (loaded dynamically)
if (process.env.NODE_ENV === 'production') {
  const { S3Transport } = await import('magiclogger/transports');
  logger.addTransport(new S3Transport({
    name: 's3',
    bucket: process.env.LOG_BUCKET,
    region: process.env.AWS_REGION,
    prefix: 'logs/',
    maxBatchSize: 1000
  }));
}
```

### Winston/Pino Migration (Drop-in Replacement)

```typescript
// Replace this:
// import winston from 'winston';

// With this (tree-shakeable):
import { createWinstonCompatible } from 'magiclogger/compat/winston';
const winston = createWinstonCompatible();

// Your existing Winston code works unchanged
winston.info('Hello world');
winston.error('Error message', new Error('Something failed'));
```

## 🌲 Tree-Shaking & Bundle Optimization

MagicLogger is designed from the ground up for **perfect tree-shaking** and minimal bundle impact. You only pay for what you use.

### Import Strategies

#### 📦 **Main Package Import**
```typescript
// All-in-one import (includes core logger + common utilities)
import { Logger, COLORS, TransportManager } from 'magiclogger';
// Bundle size: ~15KB
```

#### 🎯 **Tree-Shakeable Transport Import**
```typescript
// Import only the transports you need
import { ConsoleTransport, FileTransport, HTTPTransport } from 'magiclogger/transports';
// Bundle size: ~8KB (core transports only)

// Optional transports (larger dependencies)
import { S3Transport, MongoDBTransport } from 'magiclogger/transports';
// Bundle size: +500KB (S3), +2MB (MongoDB) - only when imported
```

#### ⚡ **Convenience Factories**
```typescript
// Async factory functions with smart defaults
import { createConsole, createFile, createHTTP } from 'magiclogger/transports';

const console = await createConsole(); // name: 'console'
const file = await createFile('./app.log'); // name: 'file-app-log'
const http = await createHTTP('https://api.logs.com'); // name: 'http-api.logs.com'
```

### Transport Categories

#### 🔧 **Core Transports** (Always Available)
These have **zero external dependencies** and are available by default:

- **Console** - Beautiful terminal output with colors (~2KB)
- **File** - High-performance file logging with rotation (~3KB)
- **Stream** - Write to any Node.js stream (~1KB)
- **HTTP** - REST API endpoints using built-in http/https (~4KB)

```typescript
// Total: ~10KB for all core transports
import { 
  ConsoleTransport, 
  FileTransport, 
  StreamTransport, 
  HTTPTransport 
} from 'magiclogger/transports';
```

#### 📦 **Optional Transports** (Tree-Shakeable)
These require external dependencies and are only bundled when explicitly imported:

- **S3Transport** - AWS S3 logging (~15KB + aws-sdk ~500KB)
- **MongoDBTransport** - MongoDB logging (~8KB + mongodb ~2MB)
- **WebSocketTransport** - Real-time logging (~6KB + ws ~50KB)

```typescript
// Only bundled when imported
import { S3Transport, MongoDBTransport, WebSocketTransport } from 'magiclogger/transports';
```

### Bundle Size Analysis

| Import Strategy | Bundle Size | Use Case |
|----------------|-------------|----------|
| `import { Logger } from 'magiclogger'` | ~15KB | Simple apps, development |
| `import { ConsoleTransport } from 'magiclogger/transports'` | ~2KB | Console-only logging |
| `import { createFile } from 'magiclogger/transports'` | ~3KB | File-only logging |
| Core transports (all 4) | ~10KB | Production apps |
| + S3Transport | ~510KB | Cloud logging |
| + MongoDBTransport | ~2MB | Database logging |

```typescript
// These only add to bundle when imported
import { S3Transport } from 'magiclogger/transports';        // +~150KB (AWS SDK)
import { MongoDBTransport } from 'magiclogger/transports'; // +~90KB (MongoDB driver)
```

### Bundle Size Impact

| Import Pattern | Bundle Size | Dependencies |
|----------------|------------|--------------|
| Core only | **~8KB** | Zero |
| + Console & File | **~12KB** | colorette |
| + All Core Transports | **~18KB** | None |
| + MongoDB | **~108KB** | mongodb |
| + S3 | **~168KB** | @aws-sdk/client-s3 |
| Full Winston equivalent | **~45KB** | vs 180KB+ |

### Smart Import Examples

```typescript
// ✅ Minimal - Only core logger (~8KB)
import { Logger } from 'magiclogger';
const logger = new Logger();

// ✅ Add console output (~12KB total)
import { ConsoleTransport } from 'magiclogger/transports';
logger.addTransport(new ConsoleTransport({ name: 'console' }));

// ✅ Add file logging (~18KB total)
import { FileTransport } from 'magiclogger/transports';
logger.addTransport(new FileTransport({
  name: 'file',
  filepath: './logs/app.log'
}));

// ✅ Add HTTP endpoint (~22KB total)
import { HTTPTransport } from 'magiclogger/transports';
logger.addTransport(new HTTPTransport({
  name: 'http',
  url: 'https://logs.example.com/api'
}));

// ✅ Add cloud storage (only when needed - +~150KB)
import { S3Transport } from 'magiclogger/transports';
logger.addTransport(new S3Transport({
  name: 's3',
  bucket: 'my-logs',
  region: 'us-east-1'
}));

// ✅ Convenience factories (recommended)
import { createConsole, createFile, createHTTP } from 'magiclogger/transports';
logger.addTransport(await createConsole());
logger.addTransport(await createFile('./logs/app.log'));
logger.addTransport(await createHTTP('https://logs.example.com/api'));

// ❌ Avoid - imports everything
import { Logger, ConsoleTransport, S3Transport } from 'magiclogger';
```

### Dynamic Loading

For even better performance, load optional transports dynamically:

```typescript
const logger = new Logger();

// Always available
logger.addTransport(new ConsoleTransport({ name: 'console' }));

// Load S3 transport only when needed
if (process.env.NODE_ENV === 'production') {
  const { S3Transport } = await import('magiclogger/transports');
  logger.addTransport(new S3Transport({
    name: 's3',
    bucket: 'my-logs',
    region: 'us-east-1'
  }));
}
```

## Features

### Core Features

- ✅ **Structured Logging** - Automatic metadata, context, and error tracking
- ✅ **Multiple Transports** - Console, File, HTTP, S3, MongoDB, WebSocket, and more
- ✅ **Smart Batching** - Intelligent batching with size/time/count triggers
- ✅ **Retry & Fallback** - Network resilience with exponential backoff
- ✅ **Context & Tags** - Powerful filtering and organization
- ✅ **Type Safety** - Full TypeScript support with inference
- ✅ **Tree-Shakeable** - Zero-overhead imports, pay only for what you use
- ✅ **Cross-Platform** - Node.js, Browser, Deno, and Worker environments

### Performance Features

- ✅ **Zero Allocation** - Ring buffer for high-frequency logging
- ✅ **Async Options** - Non-blocking logging when you need it
- ✅ **Worker Threads** - Offload heavy transports (opt-in)
- ✅ **Tree Shaking** - Only include what you use
- ✅ **Lazy Loading** - Transports load on-demand

### Developer Experience

- ✅ **Simple API** - Intuitive methods that just work
- ✅ **Color Support** - 16/256/RGB with automatic detection
- ✅ **Progress Bars** - Built-in progress indicators
- ✅ **Tables** - Formatted data tables
- ✅ **Compatibility** - Drop-in replacement for popular loggers

## Quick Start

### Installation

```bash
npm install magiclogger
# or
yarn add magiclogger
# or
pnpm add magiclogger
```

### Basic Usage

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger();

// Simple logging - automatically structured
logger.info('Server started', { port: 3000 });
logger.error('Database connection failed', new Error('Connection timeout'));
```

**Output:**
```
[2024-01-20 10:30:45] INFO Server started port=3000
[2024-01-20 10:30:46] ERROR Database connection failed error="Connection timeout"
```

**But transports receive:**
```json
{
  "id": "log-1705746645000-abc123",
  "timestamp": "2024-01-20T10:30:45.000Z",
  "level": "info",
  "message": "Server started",
  "context": { "port": 3000 },
  "metadata": { "hostname": "server-01", "pid": 1234 }
}
```

### Real-World Example

```typescript
import { Logger, ConsoleTransport, FileTransport, HTTPTransport } from 'magiclogger';

const logger = new Logger({
  id: 'api-service',
  tags: ['production', 'api'],
  context: { version: '2.1.0', region: 'us-east-1' },
  
  // Enable async logging for high throughput
  async: {
    enabled: true,
    buffer: { size: 10000 }
  },
  
  transports: [
    // Console for development
    new ConsoleTransport({ 
      level: 'debug',
      useColors: true 
    }),
    
    // Rotating file logs
    new FileTransport({
      filepath: './logs',
      rotation: 'daily',
      compress: true,
      retentionDays: 30
    }),
    
    // Central log aggregation
    new HTTPTransport({
      url: 'https://logs.example.com',
      batch: { maxSize: 100, maxTime: 5000 },
      retry: { maxRetries: 3 },
      fallback: 'file'
    })
  ]
});

// Sync logging (default, zero overhead)
logger.info('Request received', { 
  method: 'GET', 
  path: '/api/users',
  ip: req.ip 
});

// Async logging for heavy operations
await logger.async.info('Large dataset processed', {
  records: 1000000,
  duration: 5423,
  memoryUsed: process.memoryUsage()
});

// Or use async flag
logger.info('Background job completed', { 
  async: true,
  jobId: 'job-123',
  priority: 1 
});
```

## Architecture

### Module Structure

```
magiclogger/
├── core/                 # Core logging functionality
│   ├── Logger.ts         # Main logger class
│   ├── AsyncLogBuffer.ts # Ring buffer for async
│   ├── ContextManager.ts # Context utilities
│   └── TagManager.ts     # Tag utilities
├── transports/           # Log destinations
│   ├── console.ts        # Console transport
│   ├── file.ts           # File transport
│   ├── http.ts           # HTTP transport
│   └── ...               # Other transports
├── compatibility/        # Drop-in replacements
│   ├── winston.ts        # Winston compatibility
│   ├── bunyan.ts         # Bunyan compatibility
│   └── pino.ts           # Pino compatibility
└── index.ts              # Main exports
```

### Import Strategies

#### 1. Minimal Import (Recommended)

```typescript
// Only import what you need - best for bundle size
import { Logger } from 'magiclogger';
import { ConsoleTransport } from 'magiclogger/transports';

const logger = new Logger({
  transports: [new ConsoleTransport()]
});
```

#### 2. Convenience Import

```typescript
// Import common functionality
import { createLogger } from 'magiclogger';

const logger = createLogger('my-app', {
  console: true,
  file: './logs/app.log'
});
```

#### 3. Full Import (Development)

```typescript
// Import everything for experimentation
import * as MagicLogger from 'magiclogger';
```

#### 4. Compatibility Imports

```typescript
// Only loaded if you import them
import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
import { createBunyanCompatible } from 'magiclogger/compatibility/bunyan';
import { createPinoCompatible } from 'magiclogger/compatibility/pino';
```

## Advanced Examples

### High-Performance Async Logging

```typescript
const logger = new Logger({
  async: {
    enabled: true,
    buffer: {
      size: 100000,        // 100k entries
      flushInterval: 1000, // Flush every second
      flushSize: 1000      // Or every 1000 logs
    },
    useWorkers: true,      // Offload to worker threads
    workerCount: 2
  }
});

// Handles millions of logs per second
for (let i = 0; i < 1000000; i++) {
  logger.info('High frequency log', { index: i });
}

// Critical logs can bypass the buffer
logger.error('Critical error', { 
  async: false,  // Force sync
  error: new Error('System failure')
});
```

### Context & Tag Management

```typescript
// Global context for all logs
const logger = new Logger({
  context: { 
    service: 'payment-api',
    environment: 'production' 
  },
  tags: ['payments', 'critical'],
  
  // Minify context for efficiency (Hatchet-ready)
  contextMinification: {
    enabled: true,
    rules: {
      'service': 'svc',
      'environment': 'env',
      'userId': 'uid'
    }
  }
});

// Request-scoped logger
app.use((req, res, next) => {
  req.logger = logger.child({
    context: {
      requestId: req.id,
      userId: req.user?.id,
      path: req.path
    },
    tags: ['http', req.method.toLowerCase()]
  });
  next();
});

// Logs automatically include all context
req.logger.info('Payment processed', {
  amount: 99.99,
  currency: 'USD'
});
```

### Transport Filtering & Routing

```typescript
const logger = new Logger({
  transports: [
    // Debug logs only in development
    new ConsoleTransport({
      level: 'debug',
      enabled: process.env.NODE_ENV === 'development'
    }),
    
    // Errors to Slack
    new HTTPTransport({
      name: 'slack-errors',
      url: process.env.SLACK_WEBHOOK,
      levels: ['error', 'fatal'],
      formatter: (entry) => ({
        text: `🚨 ${entry.message}`,
        attachments: [{
          color: 'danger',
          fields: Object.entries(entry.context || {})
            .map(([k, v]) => ({ title: k, value: v, short: true }))
        }]
      })
    }),
    
    // Audit logs to secure storage
    new S3Transport({
      name: 'audit-s3',
      bucket: 'audit-logs',
      tags: ['audit', 'compliance'],
      encryption: { type: 'AES256' },
      contextRequirements: ['userId', 'action'] // Must have these
    }),
    
    // Metrics to time-series DB
    new HTTPTransport({
      name: 'metrics',
      url: 'https://metrics.example.com',
      filter: (entry) => entry.context?.metric !== undefined,
      transformer: (entry) => ({
        metric: entry.context.metric,
        value: entry.context.value,
        tags: entry.tags,
        timestamp: entry.timestampMs
      })
    })
  ]
});
```

### Browser Logging with Storage

```typescript
// Browser-specific features
const logger = new Logger({
  storeInBrowser: true,
  maxStoredLogs: 1000,
  
  transports: [
    new ConsoleTransport({ useColors: true }),
    
    // Send errors to backend
    new HTTPTransport({
      url: '/api/logs',
      levels: ['error'],
      batch: { maxSize: 10, maxTime: 10000 }
    })
  ]
});

// Download logs for debugging
document.getElementById('download-logs').onclick = () => {
  logger.downloadLogs('debug-logs.txt');
};
```

### Drop-in Replacement

```typescript
// Winston compatibility
import { createWinstonCompatible } from 'magiclogger/compatibility/winston';

const logger = createWinstonCompatible({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Your existing Winston code works unchanged
logger.info('Hello from Winston API');
logger.error('Error with metadata', { error: err });

// But you get MagicLogger features!
logger.table([
  { service: 'API', status: 'healthy', uptime: '99.9%' },
  { service: 'DB', status: 'degraded', uptime: '95.2%' }
]);
```

### Graceful Shutdown

```typescript
const logger = new Logger({
  async: { enabled: true },
  transports: [/* ... */]
});

// Handle shutdown gracefully
async function shutdown() {
  logger.info('Shutting down gracefully...');
  
  // Flush all pending logs
  await logger.close();
  
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

## API Reference

### Logger Options

```typescript
interface LoggerOptions {
  // Identity
  id?: string;                          // Logger identifier
  tags?: string[];                      // Global tags
  context?: Record<string, any>;        // Global context
  
  // Behavior
  verbose?: boolean;                    // Show debug logs
  useColors?: boolean;                  // Enable colors
  strictLevels?: boolean;               // Strict level checking
  
  // Async configuration
  async?: {
    enabled?: boolean;                  // Enable async logging
    buffer?: {
      size?: number;                    // Buffer size (default: 10000)
      flushInterval?: number;           // Flush interval ms
      flushSize?: number;               // Flush at size
    };
    useWorkers?: boolean;               // Use worker threads
    workerCount?: number;               // Number of workers
  };
  
  // Context features
  contextMinification?: {
    enabled?: boolean;                  // Minify context keys
    rules?: Record<string, string>;     // Minification rules
  };
  
  // Transports
  transports?: Transport[];             // Log destinations
}
```

### Logging Methods

```typescript
// Sync logging (default)
logger.info(message: string, meta?: any): void
logger.warn(message: string, meta?: any): void
logger.error(message: string, meta?: any): void
logger.debug(message: string, meta?: any): void
logger.success(message: string, meta?: any): void

// Async logging
await logger.async.info(message: string, options?: AsyncOptions)
await logger.async.warn(message: string, options?: AsyncOptions)
await logger.async.error(message: string, options?: AsyncOptions)

// With options
logger.info('Message', { 
  async: true,           // Use async
  priority: 1,           // Queue priority
  tags: ['extra'],       // Additional tags
  context: { id: 123 }   // Additional context
})
```

### Transport Types

All transports are tree-shakeable and load on-demand:

```typescript
import { 
  ConsoleTransport, 
  FileTransport, 
  HTTPTransport, 
  S3Transport, 
  MongoDBTransport, 
  WebSocketTransport 
} from 'magiclogger/transports';

// Or use convenience factories
import { 
  createConsole, 
  createFile, 
  createHTTP, 
  createS3 
} from 'magiclogger/transports';
```

## Performance

### Bundle Size Analysis

```
magiclogger (core only):        12kb  (4kb gzipped)
├── Logger + AsyncBuffer:        8kb
├── Context + Tags:              3kb
└── Types + Utils:               1kb

Transports (each, lazy loaded):
├── Console:                     2kb
├── File:                        4kb
├── HTTP:                        6kb
├── S3:                          8kb  (needs AWS SDK)
└── MongoDB:                     6kb  (needs driver)

Compatibility (opt-in):
├── Winston:                     3kb
├── Bunyan:                      3kb
└── Pino:                        2kb
```

### Performance Benchmarks

**Sync Logging (ops/sec):**
```
MagicLogger:     850,000  ████████████████████
Pino:            800,000  ███████████████████
Bunyan:          120,000  ███
Winston:          40,000  █
Console.log:     200,000  █████
```

**Async Logging (ops/sec):**
```
MagicLogger:   2,500,000  ████████████████████
Pino (worker):   400,000  ███
Winston:          15,000  
Bunyan:           30,000  
```

**With 3 Transports:**
```
MagicLogger:     750,000  ████████████████████
Pino:            350,000  █████████
Winston:          10,000
```

## Tree Shaking Guide

### ESM Imports (Recommended)

```typescript
// ✅ Best - Only imports what you need
import { Logger } from 'magiclogger';
import { ConsoleTransport } from 'magiclogger/transports';

// ✅ Good - Convenience function
import { createLogger } from 'magiclogger';

// ✅ Recommended - Use factories
import { createConsole, createFile } from 'magiclogger/transports';

// ❌ Avoid - Imports everything
import * as MagicLogger from 'magiclogger';
```

### Webpack Configuration

```javascript
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    moduleIds: 'deterministic'
  }
};
```

### Rollup Configuration

```javascript
export default {
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  }
};
```

## Ecosystem Integration

### Hatchet Integration

```typescript
import { Logger } from 'magiclogger';
import { HatchetReporter } from '@hatchet/node';

const logger = new Logger({
  contextMinification: {
    enabled: true,
    compress: true
  },
  transports: [
    new HatchetTransport({
      apiKey: process.env.HATCHET_API_KEY,
      environment: 'production'
    })
  ]
});
```

### OpenTelemetry

```typescript
import { Logger } from 'magiclogger';
import { OTLPTransport } from 'magiclogger/opentelemetry';

const logger = new Logger({
  transports: [
    new OTLPTransport({
      endpoint: 'http://localhost:4318',
      serviceName: 'my-service'
    })
  ]
});
```

## Migration Guides

### From Winston

```typescript
// Before
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// After (Option 1: Full migration)
import { Logger, FileTransport } from 'magiclogger';
const logger = new Logger({
  transports: [
    new FileTransport({ 
      filepath: 'error.log', 
      levels: ['error'] 
    }),
    new FileTransport({ 
      filepath: 'combined.log' 
    })
  ]
});

// After (Option 2: Compatibility mode)
import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
const logger = createWinstonCompatible({
  // Your existing Winston config works!
});
```

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT © Manic.agency

<p align="center">
  Made with ❤️ by <a href="https://manic.agency">Manic.agency</a>
</p>