# MagicLogger

<p align="center">
    <img src="website/static/img/magiclogger-primary-no-subtitle-transparent-4x.png" alt="Magiclogger" width="520"/>
    <img src="https://img.shields.io/badge/core_gzip-36kb-brightgreen.svg" alt="core_gzip"> <img src="https://img.shields.io/badge/core_console_gzip-32kb-brightgreen.svg" alt="core_console_gzip"> <img src="https://img.shields.io/badge/core_transports_gzip-48kb-brightgreen.svg" alt="core_transports_gzip">
</p>
<p align="center">
  <!-- Top row: static + coverage badges -->
  <img src="https://img.shields.io/badge/zero_dependencies-✓-blue" alt="Zero Dependencies"> <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript"> <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js"> <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"> <img src="https://img.shields.io/badge/coverage-0%25-lightgrey.svg" alt="Test Coverage"> <a href="https://codecov.io/gh/manicinc/magiclogger"><img src="https://codecov.io/gh/manicinc/magiclogger/branch/master/graph/badge.svg" alt="codecov"/></a>
</p>

## 🚀 Production-Grade TypeScript Logger

**MagicLogger** is a zero-dependency, high-performance logger that combines beautiful console styling with structured JSON logging for production. Built on a **ring buffer architecture** for predictable memory usage and featuring **three flexible styling APIs**, **runtime schema validation**, and **enterprise-grade transports**.

## Table of Contents

- [Key Features](#key-features)
- [MAGIC Schema](#magic-schema)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styling APIs](#styling-apis)
- [Structured Logging](#structured-logging)
- [Advanced Features](#advanced-features)
- [Transports](#transports)
- [Performance](#performance)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Key Features

### 🎨 Three Flexible Styling APIs
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

### 📐 Structured JSON with Optional Validation
Every log outputs structured JSON following the MagicLog Schema:

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

### 🔄 Ring Buffer Architecture
Predictable memory usage even under extreme load:

```typescript
const logger = new Logger({
  buffer: {
    size: 16384,       // Fixed 16K entries
    flushInterval: 50, // Batch flush every 50ms
    flushSize: 2000    // Or when 2000 logs accumulate
  }
});

// Explicit backpressure handling
const result = logger.info('High volume logging');
if (!result.success) {
  console.warn(`Buffer full: ${result.reason}`);
}
```

## MAGIC Schema

MagicLogger uses the **MAGIC Schema** - a standardized JSON format designed for modern observability and distributed systems. Every log entry follows this consistent structure, enabling seamless integration with log aggregators, APM tools, and observability platforms.

### What is MAGIC Schema?

The MAGIC Schema provides:
- **Consistent Structure**: Same JSON format across all environments and transports
- **OpenTelemetry Ready**: Direct compatibility with OTLP (OpenTelemetry Protocol)
- **Distributed Tracing**: Built-in W3C Trace Context support
- **Rich Metadata**: Automatic capture of system, process, and environment info
- **Type Safety**: Full TypeScript definitions with optional runtime validation

### Schema Structure

Every log entry outputs this JSON structure:

```typescript
logger.info('User authenticated', { 
  userId: 'u_123', 
  method: 'OAuth',
  provider: 'google'
});
```

Produces:
```json
{
  "id": "1733938475123-abc123xyz",
  "timestamp": "2025-08-14T12:34:35.123Z",
  "timestampMs": 1765769675123,
  "level": "info",
  "message": "User authenticated",      // Styled for console
  "plainMessage": "User authenticated",  // Clean for aggregators
  "service": "auth-api",
  "environment": "production",
  "loggerId": "api-service",
  "context": { 
    "userId": "u_123",
    "method": "OAuth",
    "provider": "google"
  },
  "metadata": {
    "hostname": "api-server-01",
    "pid": 12345,
    "platform": "linux",
    "nodeVersion": "v20.10.0"
  },
  "trace": {
    "traceId": "0af7651916cd43dd8448eb211c80319c",
    "spanId": "b7ad6b7169203331"
  }
}
```

### Key Benefits

- **🔍 Instant Searchability**: Query logs in Elasticsearch/Datadog/Splunk using structured fields
- **🔗 Automatic Correlation**: Trace IDs link logs across microservices automatically  
- **📊 Built-in Metrics**: Resource usage and performance data included
- **🛡️ Type Safety**: Optional schema validation catches issues at development time
- **🚀 Zero Configuration**: Works out-of-the-box with sensible defaults

### OpenTelemetry Compatibility

The MAGIC Schema maps directly to OpenTelemetry's log data model:

```typescript
// MAGIC fields → OTLP mapping
{
  "id"           → attributes["log.id"]
  "timestamp"    → timeUnixNano  
  "level"        → severityNumber
  "message"      → body
  "trace.traceId" → traceId (root level)
  "trace.spanId"  → spanId (root level)
  "service"      → resource.attributes["service.name"]
}
```

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

// Async logger (default) - high performance with batching
const logger = new Logger();
logger.info('Application started');

// Sync logger - blocking I/O for guaranteed delivery
const auditLogger = new SyncLogger({ 
  file: './audit.log',
  forceFlush: true  // fsync after each write
});

// Smart logger - auto-detects best mode
import { createSmartLogger } from 'magiclogger';
const smartLogger = createSmartLogger();
// Dev/TTY: Sync for immediate feedback
// Production: Async for performance
```

## Styling APIs

### 1. Inline Angle Brackets
The simplest API - works in all log methods automatically:

```typescript
logger.info('<green.bold>SUCCESS:</> All tests passed');
logger.error('<red>Error:</> Connection to <yellow>database</> failed');
logger.warn('<yellow.bold>⚠ Warning:</> <cyan>CPU usage</> is high');
```

### 2. Template Literals (`logger.fmt`)
Clean inline styling with template literals:

```typescript
const database = 'production_db';
logger.error(logger.fmt`
  @red.bold{Connection Error} 
  Database @yellow{${database}} failed at @dim{${new Date().toISOString()}}
`);
```

### 3. Chainable API (`logger.s`)
Like Chalk, but built-in:

```typescript
logger.info(
  logger.s.white.bgRed.bold(' CRITICAL ') + ' ' +
  logger.s.yellow('System memory at ') + 
  logger.s.red.bold('92%')
);
```

## Structured Logging

### Console-like Arguments
MagicLogger supports console-like variadic arguments while maintaining structured output:

```typescript
import { Logger, meta, err } from 'magiclogger';
const logger = new Logger();

// Print like console.log
logger.info('Data:', { a: 1, b: 2 });

// Attach metadata for transports (not printed)
logger.info('Saved user', user, meta({ requestId, userId }));

// Structured error handling
logger.error('Failed to save', err(new Error('boom')), meta({ requestId }));
```

### MagicLog Schema
Every log outputs structured JSON:

```typescript
logger.info('User authenticated', { 
  userId: 'u_123', 
  method: 'OAuth'
});
```

Outputs:
```json
{
  "id": "1733938475123-abc123xyz",
  "timestamp": "2025-08-14T12:34:35.123Z",
  "level": "info",
  "message": "User authenticated",
  "context": { 
    "userId": "u_123",
    "method": "OAuth"
  },
  "metadata": {
    "hostname": "api-server-01",
    "pid": 12345
  }
}
```

## Advanced Features

### Visual Elements

```typescript
// Headers and separators
logger.header('🚀 DEPLOYMENT PROCESS');
logger.separator('=', 50);

// Progress bars
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i);
  await delay(100);
}

// Tables
logger.table([
  { name: 'API', status: 'healthy', cpu: '12%' },
  { name: 'Database', status: 'healthy', cpu: '45%' }
]);

// Object diffs
logger.diff('State change', oldState, newState);
```

### Themes
Use predefined or custom themes:

```typescript
// Built-in themes
const logger = new Logger({ theme: 'ocean' });
// Available: ocean, forest, sunset, minimal, cyberpunk, dark

// Custom theme
const logger = new Logger({
  theme: {
    info: ['brightCyan'],
    error: ['brightRed', 'bold'],
    success: ['brightGreen', 'bold']
  }
});
```

### Extensions (Optional)
Extensions are opt-in for specialized needs:

```typescript
import { Redactor, Sampler, RateLimiter } from 'magiclogger/extensions';

const logger = new Logger({
  // PII Redaction
  redactor: new Redactor({ preset: 'strict' }),
  
  // Statistical sampling (10% of logs)
  sampler: new Sampler({ rate: 0.1 }),
  
  // Rate limiting (1000/minute)
  rateLimiter: new RateLimiter({ max: 1000, window: 60000 })
});
```

## Transports

### Core Transports

```typescript
import { 
  ConsoleTransport,
  FileTransport, 
  HTTPTransport,
  WebSocketTransport
} from 'magiclogger/transports';

const logger = new Logger({
  transports: [
    // Console with colors
    new ConsoleTransport({ useColors: true }),
    
    // File with rotation
    new FileTransport({ 
      filepath: './logs/app.log',
      maxFiles: 7,
      maxSize: '10MB'
    }),
    
    // HTTP with batching
    new HTTPTransport({ 
      url: 'https://logs.example.com',
      batch: { size: 100, timeout: 5000 }
    })
  ]
});
```

### Enterprise Transports

```typescript
// Database transports
import { PostgreSQLTransport, MongoDBTransport } from 'magiclogger/transports';

// Cloud storage
import { S3Transport } from 'magiclogger/transports';

// Messaging systems
import { KafkaTransport, SyslogTransport } from 'magiclogger/transports';

// Observability platforms
import { OTLPTransport } from 'magiclogger/transports/otlp';

const otlpTransport = new OTLPTransport({
  endpoint: 'http://localhost:4318',
  serviceName: 'my-service',
  includeTraceContext: true  // W3C Trace Context support
});
```

### Transport Batching
Network transports batch automatically, local transports don't:

| Transport | Batching | Default Config |
|-----------|----------|----------------|
| Console | ❌ No | Immediate write |
| File | ❌ No | Immediate write |
| HTTP | ✅ **Yes** | 100 logs or 5s |
| WebSocket | ✅ **Yes** | 100 logs or 5s |
| S3 | ✅ **Yes** | 1000 logs or 30s |
| MongoDB | ✅ **Yes** | 100 logs or 5s |

## Performance

### Logger Performance

**AsyncLogger (Default):**
- ✅ **250,000+ ops/sec** with ring buffer
- ✅ Non-blocking, batched writes
- ✅ Fixed memory footprint
- **Best for**: Production services, APIs, high-throughput

**SyncLogger:**
- ✅ **~70,000 ops/sec**
- ✅ Guaranteed delivery with fsync
- ✅ No buffer = no log loss on crash
- **Best for**: Audit logs, debugging, CLI tools

### Benchmark Results

<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 2547.3 | 39,257 |
| Winston (Sync, Plain) | 100,000 | 2552.4 | 39,180 |
| Bunyan (Sync, Plain) | 100,000 | 2870.4 | 34,838 |
| Pino (Sync, Plain) | 100,000 | 3565.5 | 28,047 |
| MagicLogger (Sync, Plain) | 100,000 | 3583.1 | 27,909 |
| Pino (Sync, Styled) | 100,000 | 3708.7 | 26,964 |
| Bunyan (Sync, Styled) | 100,000 | 3807.0 | 26,268 |
| MagicLogger (Sync, Styled) | 100,000 | 6364.5 | 15,712 |
| Pino (Async, Styled) | 100,000 | 1231.6 | 81,192 |
| MagicLogger (Async, Plain) | 100,000 | 1637.9 | 61,055 |
| MagicLogger (Async, Styled) | 100,000 | 1837.7 | 54,415 |
| Pino (Async, Plain) | 100,000 | 2781.6 | 35,951 |
| Winston (Async, Plain) | 100,000 | 2859.5 | 34,971 |
| Winston (Async, Styled) | 100,000 | 2958.1 | 33,805 |

### Winners
- Sync Plain: Winston (Sync, Plain) (39,180 ops/sec) — MagicLogger: 27,909 ops/sec
- Sync Styled: Winston (Sync, Styled) (39,257 ops/sec) — MagicLogger: 15,712 ops/sec
- Async Plain: MagicLogger (Async, Plain) (61,055 ops/sec)
- Async Styled: Pino (Async, Styled) (81,192 ops/sec) — MagicLogger: 54,415 ops/sec

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 15,712 ops/sec
  Winston (Sync, Styled): 39,257 ops/sec
  → MagicLogger is 2.50x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 54,415 ops/sec
  Pino (Async, Styled): 81,192 ops/sec
  → MagicLogger is 1.49x slower

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->

See detailed [benchmark results](./scripts/performance/benchmark-results.md) and [architecture docs](./docs/architecture.md).

## Examples

### Express Middleware

```typescript
const logger = new Logger({ theme: { tags: { http: ['cyan'] } } });

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusStyle = res.statusCode >= 400 ? 'red' : 'green';
    
    logger.info(
      `<cyan.bold>${req.method}</> ${req.path} ` +
      `<${statusStyle}>${res.statusCode}</> <dim>${duration}ms</>`
    );
  });
  
  next();
});
```

### Distributed Tracing

```typescript
import { extractTraceContext } from 'magiclogger/utils/trace-context';

app.post('/payment', async (req, res) => {
  // Extract W3C trace context
  const traceContext = extractTraceContext(req.headers);
  
  logger.info('Payment request', {
    amount: req.body.amount,
    trace: traceContext  // Automatically propagated
  });
});
```

### Production Configuration

```typescript
const prodLogger = new Logger({
  // Performance features
  sampling: { strategy: 'adaptive', targetRate: 10000 },
  rateLimit: { max: 1000, window: 60000 },
  redaction: { preset: 'strict' },
  
  // Multiple transports
  transports: [
    new KafkaTransport({ 
      brokers: process.env.KAFKA_BROKERS.split(','),
      compression: 'snappy'
    }),
    new S3Transport({ 
      bucket: 'logs-archive',
      rotation: 'daily'
    })
  ]
});
```

## API Reference

### Logger Options

```typescript
interface LoggerOptions {
  // Basic configuration
  id?: string;
  tags?: string[];
  context?: Record<string, unknown>;
  verbose?: boolean;
  useColors?: boolean;
  
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

### Key Methods

```typescript
// Logging methods
logger.debug(message, meta?)
logger.info(message, meta?)
logger.warn(message, meta?)
logger.error(message, meta?)
logger.success(message, meta?)

// Styling
logger.s       // Chainable style API
logger.fmt     // Template literal API

// Visual elements
logger.header(text, styles?)
logger.separator(char, length)
logger.progressBar(percent, width?)
logger.table(data)
logger.diff(label, oldObj, newObj)

// Management
logger.flush()          // Force flush buffers
logger.close()          // Graceful shutdown
logger.getStats()       // Performance metrics
```

## Build Sizes

| Bundle | Gzipped |
|--------|---------|
| Core (minimum) | 36.7 kB |
| Core + Console | 36.7 kB |
| Core + File | 38.8 kB |
| Core + HTTP | 47.3 kB |
| Core + All Basic | 48.7 kB |

*Schema validation is lazy-loaded only when used (+2.5 kB)*

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © [Manic.agency](https://manic.agency)

---

<p align="center">
  Developed and sponsored by <a href="https://manic.agency">Manic.agency</a>
</p>