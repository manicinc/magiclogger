---
sidebar_position: 1
slug: /
---

# MagicLogger

## 🚀 Universal Color Logging Standard

**MagicLogger** is a TypeScript logger built on a [universal color logging standard](https://github.com/manicinc/magiclogger/blob/master/docs/magic-schema.md) that preserves styled text across any language, transport, or platform.

Traditional prod environments suppress / strip styling / pretty print in logs, dropping presumed unnecessary bundling and load.

Using this library generally means you're okay with these assumptions:

  - Storage is cheap, some extra kb in many web apps makes little difference (if you don't care about an image being 1.1 vs 1.0 mb this likely applies)
  - Some logs sent in production will require human review consistently
  - When you analyze logs at a high-level you want to have a visually appealing experience

## Installation

```bash
npm install magiclogger
# or
yarn add magiclogger
# or
pnpm add magiclogger
```

Supports both ESM and CommonJS:

```typescript
import { Logger } from 'magiclogger';          // ESM/TypeScript
const { Logger } = require('magiclogger');     // CommonJS
```

## Quick Start

```typescript
import { Logger, SyncLogger, createLogger, createSyncLogger } from 'magiclogger';

// AsyncLogger (default) - non-blocking, faster for styled output
const logger = new Logger();  // Uses AsyncLogger by default
logger.info('Application started');

// Logger with automatic console transport (enabled by default)
const logger = new Logger({
  useConsole: true,   // Console transport is enabled by default (can be disabled with false)
  useColors: true,    // Enable colored output (default: true)
  verbose: false      // Show debug messages (default: false)
});

// Or simply use with defaults - console is automatically enabled
const logger = new Logger();  // Console transport created automatically

// SyncLogger - only for audit logs that MUST never be dropped
// Use ONLY when you need absolute guarantee of delivery under extreme load
// AsyncLogger is recommended for 99.9% of use cases
const auditLogger = new SyncLogger({
  file: './audit.log',     // Blocks until written to disk
  forceFlush: true         // For regulatory compliance
});
```

## Styling APIs
Choose the styling approach that fits your code style:

```typescript
import { Logger } from 'magiclogger';
const logger = new Logger();

// 1. Inline angle brackets - simplest, works everywhere
logger.info('<green.bold>✅ Success:</> User <cyan>john@example.com</> authenticated');

// 2. Template literals - clean interpolation
logger.info(logger.fmt`@red.bold{ERROR:} Failed to connect to @yellow{${database}}`);

// 3. Chainable API - programmatic styling
logger.info(logger.s.blue.bold('INFO:') + ' Processing ' + logger.s.cyan(filename));
```

## Key Features

### Structured Logging with NDJSON

MagicLogger supports **NDJSON (Newline Delimited JSON)** format: each log entry is a complete JSON object on its own line.

```typescript
// Configure NDJSON output
const logger = new Logger({
  transports: [
    new FileTransport({
      filepath: './logs/app.log',
      format: 'json'  // NDJSON format
    })
  ]
});

// Output (each line is a complete JSON object):
// {"id":"abc123","timestamp":"2024-01-20T10:30:00Z","level":"info","message":"Server started","context":{"port":3000}}
// {"id":"def456","timestamp":"2024-01-20T10:30:01Z","level":"error","message":"Database error","error":{"message":"Connection refused"}}
```

### Structured JSON with Optional Validation
Every log outputs structured JSON following the MAGIC Schema:

```typescript
// With optional schema validation (lazy-loaded)
const logger = new Logger({
  schemas: {
    user: z.object({
      userId: z.string().uuid(),
      email: z.string().email()
    })
  },
  onSchemaViolation: 'warn'  // 'warn' | 'error' | 'throw'
});

logger.info('User login', { tag: 'user', userId: '550e8400...', email: 'john@example.com' });
```

### 🎯 Tagging & Theming
Auto-style logs based on semantic tags:

```typescript
const logger = new Logger({
  theme: {
    tags: {
      api: ['cyan', 'bold'],
      database: ['yellow'],
      critical: ['white', 'bgRed', 'bold']
    }
  }
});

logger.info('Request received', { tags: ['api'] });  // Auto-styled
```

### Transport-Optimized Architecture
MagicLogger uses transport-specific optimization for maximum performance:

#### Each Transport Manages Its Own Strategy
Transports use the optimal I/O pattern for their use case:

```typescript
const logger = new Logger({
  transports: [
    // Console: synchronous for immediate feedback
    new ConsoleTransport(),

    // File: sonic-boom for non-blocking high-performance I/O
    new FileTransport({
      filepath: './app.log',
      minLength: 4096,        // Buffer before auto-flush
      maxWrite: 16384         // Max bytes per write
    }),

    // HTTP: batching with async requests
    new HTTPTransport({
      endpoint: 'https://logs.example.com',
      batch: { size: 100, timeout: 5000 }  // Batch 100 logs or flush every 5s
    })
  ]
});
```

#### Dispatch Architecture
MagicLogger uses an immediate dispatch architecture:

**Logger Level**: Immediate dispatch to transports
- AsyncLogger sends logs directly to transports without batching
- Minimal overhead with timestamp caching optimization
- Near-zero latency for log delivery

**Transport Level**: Optimized batching per transport type

```typescript
// Each transport handles its own batching strategy
const httpTransport = new HTTPTransport({
  batch: { size: 100, timeout: 5000 }  // Batch 100 logs or flush every 5s
});
```

**Note**: Worker threads are optional. Enable with `worker.enabled: true` for CPU-intensive workloads. Style processing in the main thread adds minimal overhead (~0.01ms per log).

### Log Delivery Guarantees

**Logger (AsyncLogger - default, recommended)**:
- **Non-blocking** - keeps your app responsive under load
- **Faster for styled output** - 120K ops/sec vs 50K for sync
- **With graceful shutdown** (`await logger.close()`): All transports are flushed
- **Without graceful shutdown** (crash/SIGKILL): Transport buffers may not flush
- Perfect for 99.9% of use cases including production applications
- The default choice for modern applications

**SyncLogger (rarely needed)**:
- Blocks until each log is written to disk (using `fs.appendFileSync`)
- **Always guarantees delivery** - logs are never lost unless OS crashes
- **Trade-off**: Blocks event loop, can make app unresponsive under load
- Use ONLY for critical audit logs with regulatory requirements

**For critical logs that must never be lost**:
```typescript
// Option 1: Use SyncLogger for audit/security logs
const auditLogger = new SyncLogger({ file: './audit.log' });

// Option 2: Ensure graceful shutdown for AsyncLogger
process.on('SIGTERM', async () => {
  await logger.close();  // Flushes all pending logs
  process.exit(0);
});

// Option 3: Use synchronous transports with AsyncLogger
const logger = new AsyncLogger({
  transports: [new SyncFileTransport({ filepath: './critical.log' })]
});
```

## ⚡ Performance

### Real-World Benchmarks

MagicLogger achieves **excellent performance** with AsyncLogger as default:
- **164K ops/sec** - Plain text (non-blocking)
- **120K ops/sec** - Styled output (**faster than sync's 50K**)
- **0.004ms P50 blocking** - Event loop stays responsive
- **Non-blocking architecture** - Your app stays fast under load
- **Smart batching** - Automatic optimization for network transports

See our [performance documentation](./performance-design) for detailed benchmarks and optimization strategies.

## MAGIC Schema - Universal Styled Logging Standard

The **[MAGIC Schema](./magic-schema)** is a universal JSON format that preserves text styling across any language, transport, or platform. Any language can produce MAGIC-compliant logs that MagicLogger (or any MAGIC-compatible system) can ingest and display with full color preservation.

### The MAGIC Schema provides:

- **Style Preservation**: Colors and formatting survive serialization as structured data
- **Language Agnostic**: Any language can implement the MAGIC producer specification
- **Ingestion Ready**: MagicLogger can consume logs from any MAGIC-compliant source
- **Consistent Structure**: Same JSON format across all languages and transports
- **OpenTelemetry Ready**: Direct compatibility with OTLP (OpenTelemetry Protocol)
- **Distributed Tracing**: Built-in W3C Trace Context support
- **Rich Metadata**: Automatic capture of system, process, and environment info

## Next Steps

- [Full API Documentation](/api/) - Complete TypeScript API reference
- [API Reference](./api-reference) - Core APIs and usage patterns
- [Advanced Usage](./advanced-usage) - Advanced patterns and techniques
- [Architecture Overview](./architecture) - How MagicLogger works internally
- [Transports](./TRANSPORTS) - All available transports and configuration
- [Styling Guide](./styling) - Complete styling and theming options