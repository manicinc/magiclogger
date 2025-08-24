# MagicLogger

<p align="center">
    <img src="website/static/img/magiclogger-primary-no-subtitle-transparent-4x.png" alt="Magiclogger" width="520"/>
    <img src="https://img.shields.io/badge/core_gzip-32kb-brightgreen.svg" alt="core_gzip"> <img src="https://img.shields.io/badge/core_console_gzip-32kb-brightgreen.svg" alt="core_console_gzip"> <img src="https://img.shields.io/badge/core_transports_gzip-44kb-brightgreen.svg" alt="core_transports_gzip">
</p>
<p align="center">
  <!-- Top row: static + coverage badges -->
  <img src="https://img.shields.io/badge/zero_dependencies-✓-blue" alt="Zero Dependencies"> <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript"> <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js"> <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"> <img src="https://img.shields.io/badge/coverage-0%25-lightgrey.svg" alt="Test Coverage"> <a href="https://codecov.io/gh/manicinc/magiclogger"><img src="https://codecov.io/gh/manicinc/magiclogger/branch/master/graph/badge.svg" alt="codecov"/></a>
  <!-- Bottom row: build size badges (auto-updated by scripts/analyze-build.js) -->
</p>

## Table of Contents

- [Enterprise-Ready Logging with Style](#enterprise-ready-logging-with-style)
- [Features](#features)
- [Installation & Quick Start](#installation--quick-start)
  - [Module Formats](#module-formats)
  - [Quick Start - Choose Your Style](#quick-start)
  - [Easy API with Sensible Defaults](#easy-api-with-sensible-defaults)
- [Three Powerful Styling APIs](#three-powerful-styling-apis)
  - [1. Chainable Style API](#1-chainable-style-api-loggers)
  - [2. Template Literal API](#2-template-literal-api-loggerfmt)
  - [3. Inline Angle Bracket Syntax](#3-inline-angle-bracket-syntax)
  - [Style Reference](#style-reference)
- [Structured Logging](#structured-logging)
- [Theme System](#theme-system)
  - [Built-in Themes](#built-in-themes)
  - [Tag-Based Styling](#tag-based-styling)
  - [Auto Theme Selection](#auto-theme-selection)
  - [Custom Themes](#custom-themes)
- [Visual Elements](#visual-elements)
  - [Headers and Separators](#headers-and-separators)
  - [Progress Bars](#progress-bars)
  - [Tables](#tables)
  - [Object Diffs](#object-diffs)
- [MagicLog Schema & OpenTelemetry Compatibility](#-magiclog-schema--opentelemetry-compatibility)
  - [Why MagicLog Schema?](#why-magiclog-schema)
  - [Using MagicLog with OpenTelemetry](#using-magiclog-with-opentelemetry)
  - [Schema Documentation](#schema-documentation)
- [Core Features](#core-features)
  - [Sync & Async Loggers](#sync--async-loggers)
  - [Transport System](#transport-system)
  - [Built-in Ring Buffer](#built-in-ring-buffer)
- [Optional Extensions](#optional-extensions)
  - [PII Redaction](#pii-redaction)
  - [Sampling](#sampling)
  - [Rate Limiting](#rate-limiting)
  - [Advanced Queue Management](#advanced-queue-management)
- [Enterprise Transports](#enterprise-transports)
  - [Core Transports](#core-transports)
  - [Database & Storage](#database--storage)
  - [Messaging & Streaming](#messaging--streaming)
  - [Observability Integration](#observability-integration)
- [Monitoring & Observability](#monitoring--observability)
  - [Health Monitoring](#health-monitoring)
  - [Performance Metrics](#performance-metrics)
- [Performance](#performance)
  - [Benchmark Results](#benchmark-results)
  - [Performance Insights](#performance-insights)
  - [When to Choose Each Mode](#when-to-choose-each-mode)
  - [Bundle Sizes](#bundle-sizes-gzipped)
- [Practical Examples](#real-world-examples)
  - [Express.js Middleware](#expressjs-middleware)
  - [Deployment Pipeline](#deployment-pipeline)
  - [Production Configuration](#production-configuration)
  - [Distributed Tracing](#distributed-tracing)
- [Configuration Reference](#configuration-reference)
  - [Logger Options](#logger-options)
- [Contributing](#contributing)
- [License](#license)
- [Build Output Sizes](#build-output-sizes)

## Production-Grade Logging with Ring Buffer Architecture

**MagicLogger** is a high-performance, zero-dependency TypeScript logger built on a **ring buffer architecture** that prevents memory leaks and provides predictable memory usage under load. Unlike traditional loggers that can cause OOM crashes with unbounded queues, MagicLogger uses a fixed-size circular buffer with explicit backpressure handling.

### Why Ring Buffer Architecture?

Traditional async loggers face a critical problem: when log production exceeds I/O capacity (common during traffic spikes), their unbounded queues grow until the application crashes with out-of-memory errors. MagicLogger solves this with:

- **Fixed Memory Footprint**: Ring buffer has a configurable fixed size (default 10,000 entries)
- **Predictable Behavior**: When full, oldest logs are dropped with warnings - no OOM crashes
- **Backpressure Handling**: Applications can detect and respond to logging pressure
- **Zero Memory Leaks**: Circular buffer reuses memory, no unbounded growth
- **Production-Tested**: Handles sustained 250,000+ ops/sec without memory issues

### Structured Logging with Schema Validation

Every log outputs structured JSON following the **[MagicLog Schema](#-magiclog-schema--opentelemetry-compatibility)** with optional runtime validation, ensuring data consistency across your entire system. The schema is OpenTelemetry-compatible for seamless integration with modern observability stacks.

```typescript
import { Logger } from 'magiclogger';

// Default async logger with high performance
const logger = new Logger();  // Async by default!

// Beautiful styled output - three powerful APIs
logger.info('<green.bold>✅ Server started:</> <cyan>http://localhost:3000</>');
logger.info(logger.fmt`@red.bold{ERROR:} Failed to connect to @yellow{database}`);
logger.info(logger.s.blue.bold('INFO:') + ' User ' + logger.s.cyan('john@example.com') + ' authenticated');

// Rich visual elements
logger.header('🚀 DEPLOYMENT PROCESS');
logger.progressBar(75);
logger.table([
  { service: 'API', status: 'healthy', uptime: '99.9%' },
  { service: 'DB', status: 'degraded', uptime: '95.2%' }
]);

// Production logger with extensions
const prodLogger = new Logger({
  redactor: { preset: 'strict' },            // Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 }, // Rate limiting  
  sampler: { rate: 0.1 },                    // Sample 10% in high volume
  buffer: {
    size: 100000,                            // Large buffer for spikes
    flushInterval: 100,                      // Batch every 100ms
    flushSize: 5000                          // Or at 5000 entries
  },
  onFlush: async (entries) => {
    await batchWriteToElasticsearch(entries);
  }
});

// Guaranteed delivery with sync logger
const auditLogger = new SyncLogger({
  file: './audit.log',
  forceFlush: true  // fsync after every write
});
auditLogger.info('Critical event - blocks until on disk');
```
---

**Architecture:** MagicLogger uses a **lock-free ring buffer** with fixed memory allocation, preventing unbounded queue growth that can crash production systems. Achieves 250k+ ops/sec with predictable memory usage. See [Architecture Decisions](./docs/ARCHITECTURE.md), [Ring Buffer Design](./docs/RING_BUFFER.md), and [Performance Analysis](./docs/PERFORMANCE.md).

## Features

### 📊 **MagicLog Schema with Runtime Validation**
- **Schema-validated logging** - Define schemas per tag, catch violations at runtime
- **Type-safe context** - Enforce structure with Zod/JSON Schema validation
- **OpenTelemetry native** - Direct 1:1 mapping to OTLP format
- **Distributed tracing** - Built-in W3C Trace Context propagation
- **Zero data loss** - Full context, metadata, and stack traces preserved

### 🎨 **Beautiful Styling & Visualization**
- **Three styling APIs** - chainable, template literals, and inline syntax
- **Rich colors & themes** with automatic terminal detection
- **Visual elements** - tables, progress bars, headers, diffs
- **Dual output** - styled for console, clean JSON for aggregators

### 🚀 **Production Architecture**
- **Ring buffer design** - Fixed 16KB default size, no memory leaks
- **Explicit backpressure** - Know when buffers are full, adapt accordingly
- **Batch efficiency** - Flush 1000s of logs in single syscall/network request
- **Enterprise transports** - Kafka, PostgreSQL, OTLP, S3 with internal queuing
- **Built-in utilities** - PII redaction, sampling, rate limiting at logger level
- **Observable by design** - Metrics on drops, flushes, throughput
---

## 📦 Installation & Quick Start

```bash
npm install magiclogger
# or yarn add magiclogger / pnpm add magiclogger
```

### Module Formats
MagicLogger supports both ESM and CJS with first-class TypeScript types:

```typescript
// ESM/TypeScript
import { Logger } from 'magiclogger';

// CommonJS  
const { Logger } = require('magiclogger');
```


### Easy API with Sensible Defaults

```typescript
import { Logger, SyncLogger, createLogger, createSyncLogger } from 'magiclogger';

// Two distinct modes - async by default:
const logger = new Logger();          // Async logger (default) - high performance
const syncLogger = new SyncLogger();  // Sync logger - blocking I/O for guaranteed delivery

// Factory functions for additional configuration:
const customLogger = createLogger({
  buffer: { flushInterval: 100 },     // Customize async behavior
  onFlush: async (entries) => { ... } // Batch processing
});

const auditLogger = createSyncLogger({
  file: './audit.log',                // Synchronous file writes
  forceFlush: true                    // fsync after each write
});

// Production async logger with extensions
const prodLogger = new Logger({
  redactor: { preset: 'strict' },            // Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 }, // 1000 logs/minute
  sampler: { rate: 0.1 },                    // Sample 10% in high volume
  onFlush: async (entries) => {
    await batchWriteToFile(entries);         // Efficient batch writes
    await sendToElasticsearch(entries);      // Async network sends
  }
});

// Audit logger with guaranteed delivery
const auditLogger = new SyncLogger({
  file: './security-audit.log',              // Blocking file writes
  forceFlush: true,                          // fsync every write
  useConsole: true                           // Also log to console
});
```

---

## 🎨 Three Powerful Styling APIs

MagicLogger provides three complementary styling approaches. Use one or combine them seamlessly!

### 1. Chainable Style API (`logger.s`)

Like Chalk, but built-in and optimized:

```typescript
// Create styled strings
const error = logger.s.red.bold('ERROR:');
const success = logger.s.green.bold('✅ Success');
const highlight = logger.s.yellow.bold;

// Use in your logs
logger.info(error + ' Connection failed');
logger.info(success + ' Deployment complete');
logger.info('Run ' + logger.s.cyan('npm install') + ' to continue');

// Chain multiple styles
logger.info(
  logger.s.white.bgRed.bold(' CRITICAL ') + ' ' +
  logger.s.yellow('System memory at ') + 
  logger.s.red.bold('92%')
);

// Available styles
logger.s.red.bold.underline('Important text');
logger.s.blue.bgYellow.italic('Styled background');
logger.s.brightGreen.dim('Bright but dimmed');
```

### 2. Template Literal API (`logger.fmt`)

Clean inline styling with template literals:

```typescript
// Variables and expressions work naturally
const database = 'production_db';
const timestamp = new Date().toISOString();

logger.error(logger.fmt`
  @red.bold{Connection Error} 
  Database @yellow{${database}} failed at @dim{${timestamp}}
`);

// Multiple styles in one template
logger.info(logger.fmt`
  @white.bgRed.bold{ CRITICAL } 
  @yellow{Warning:} System memory at @red.bold{92%} 
  @dim{(threshold: 90%)}
`);

// Clean, readable formatting
logger.info(logger.fmt`@blue{Processing} @cyan.underline{${filename}} @dim{(${fileSize} bytes)}`);
```

### 3. Inline Angle Bracket Syntax

The simplest API - natural text with embedded styles:

```typescript
// Works in ALL log methods automatically
logger.info('<green.bold>SUCCESS:</> All tests passed');
logger.error('<red>Error:</> Connection to <yellow>database</> failed');
logger.warn('<yellow.bold>⚠ Warning:</> <cyan>CPU usage</> is high');

// Perfect with variables
const user = 'john_doe';
const action = 'DELETE';
logger.warn(`User <cyan.bold>${user}</> performed <red.bold>${action}</> operation`);

// Mix with regular text naturally
logger.info('Starting <green>health check</> for service <cyan.underline>api-gateway</>...');
logger.success('<green.bold>✓</> Deployment to <blue>production</> complete');
```

### Style Reference

**Colors:**
- Basic: `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `black`, `gray`
- Extended: `orange`, `purple`, `teal`, `pink`, `brown`, `indigo`, `lime`
- Bright: `brightRed`, `brightGreen`, `brightBlue`, etc.
- Backgrounds: `bgRed`, `bgGreen`, `bgBlue`, `bgBrightRed`, etc.

**Modifiers:**
- Text: `bold`, `dim`, `italic`, `underline`, `strikethrough`
- Display: `blink`, `reverse`, `hidden`

---

## 🧱 Structured Logging - MagicLog Schema JSON Output

Every MagicLogger call outputs structured JSON following the **[MagicLog Schema](#-magiclog-schema---structured-json-logging-format)** - a standardized format for modern observability.

### What You Write → What Gets Logged

```typescript
const logger = new Logger({ 
  id: 'api-service',
  service: 'auth-api',
  environment: 'production' 
});

// Simple log with metadata
logger.info('User authenticated', { 
  userId: 'u_123', 
  method: 'OAuth',
  provider: 'google' 
});
```

**Outputs this MagicLog Schema JSON:**

```json
{
  "id": "1733938475123-abc123xyz",
  "timestamp": "2025-08-14T12:34:35.123Z",
  "timestampMs": 1765769675123,
  "level": "info",
  "message": "User authenticated",
  "plainMessage": "User authenticated",
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

### Error Logging with Full Stack Traces

```typescript
// Structured error logging
logger.error('Payment failed', new Error('Card declined'));
```

**Outputs:**

```json
{
  "level": "error",
  "message": "Payment failed", 
  "error": {
    "name": "Error",
    "message": "Card declined",
    "stack": "Error: Card declined\n    at processPayment (payment.js:45:11)\n    at async handleRequest (api.js:123:5)"
  },
  "timestamp": "2025-08-14T12:34:35.123Z",
  // ... rest of MagicLog schema fields
}
```

### MagicLog Schema Benefits

 **Automatic correlation** via trace IDs across microservices  
 **Never lose context** - all metadata preserved  
 **OpenTelemetry ready** - direct OTLP compatibility  
 **Performance tracking** - built-in resource metrics  

**Key Fields:**
- `message`: Styled string for console (with ANSI colors)
- `plainMessage`: Clean text for log aggregators
- `context`: Your custom metadata
- `metadata`: Automatic system info (hostname, PID, platform)
- `trace`: Distributed tracing context (W3C Trace Context)
- `error`: Structured error with stack trace

---

### Console-like arguments and structured meta

MagicLogger also supports console-like variadic arguments.

```typescript
import { Logger, meta, err } from 'magiclogger';
const logger = new Logger();

// Print like console.log
logger.info('Data:', { a: 1, b: 2 });

// Print data, attach non-printed metadata for transports
logger.info('Saved user', user, meta({ requestId, userId }));

// Attach an Error as structured meta (not printed)
logger.error('Failed to save', err(new Error('boom')), meta({ requestId }));

// Back-compat still works (second arg treated as meta and not printed)
logger.info('Started', { requestId });
```

Rules:

- Exactly two args `(string, object)` keeps the original behavior: the object is metadata only (not printed).
- In variadic form, all args are printed except a final `meta(...)`/`err(...)` (or a trailing `Error`, which becomes `meta.error`).
- Non-strings are pretty-printed using Node `util.inspect` (with colors) or JSON in browsers; circular refs are handled.

Options:

- `prettyPrint`: `'inspect' | 'json'` (default `'inspect'`).
- `printMetaInDebug`: when true and `verbose` is enabled, appends a compact `[meta]` summary to console output.

---

## 🎨 Theme System

### Built-in Themes

```typescript
// Use predefined themes
const logger = new Logger({ 
  theme: 'ocean' // Available: 'ocean', 'forest', 'sunset', 'minimal', 'cyberpunk', 'dark'
});

// Customize existing themes
const logger = new Logger({
  theme: {
    base: 'ocean',
    overrides: {
      error: ['brightRed', 'bold', 'underline'],
      success: ['brightGreen', 'bold']
    }
  }
});
```

### Tag-Based Styling

Automatically style logs based on tags:

```typescript
const logger = new Logger({
  theme: {
    tags: {
      api: ['cyan', 'bold'],
      database: ['yellow'],
      error: ['red', 'bold'],
      critical: ['white', 'bgRed', 'bold'],
      performance: ['magenta']
    }
  }
});

// Tags automatically apply their styles
logger.info('Request received', { tags: ['api'] }); // cyan.bold
logger.error('Connection failed', { tags: ['database', 'error'] }); // combined styles
```

### Auto Theme Selection

```typescript
// Map tags to themes
const logger = new Logger({
  tags: ['acme'],
  themeByTag: { 
    acme: 'cyberpunk', 
    contoso: 'dark' 
  }
});

// Or implicit matching - if tag matches theme name
const logger2 = new Logger({ tags: ['neon'] }); // auto-loads 'neon' theme if it exists
```

### Custom Themes

```typescript
import type { ThemeDefinition } from 'magiclogger';

const myTheme: ThemeDefinition = {
  info: ['brightCyan'],
  success: ['brightGreen', 'bold'],
  warn: ['yellow', 'bold'],
  error: ['brightRed', 'bold'],
  debug: ['gray', 'italic'],
  header: ['white', 'bgBlue', 'bold']
};

const logger = new Logger({ theme: myTheme });
```

---

## 📊 Visual Elements

### Headers and Separators

```typescript
logger.header('🚀 DEPLOYMENT PROCESS');
logger.header('Test Results', ['white', 'bgGreen', 'bold']);
logger.separator('=', 50);
```

### Progress Bars

```typescript
// Simple progress
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i);
  await delay(100);
}

// Custom progress bars
logger.progressBar(75, 40, '█', '░');
logger.progressBar(50, 30, '=', '-');
```

### Tables

```typescript
logger.table([
  { name: 'API', status: 'healthy', cpu: '12%', memory: '234MB' },
  { name: 'Database', status: 'healthy', cpu: '45%', memory: '1.2GB' },
  { name: 'Cache', status: 'degraded', cpu: '78%', memory: '512MB' }
]);
```

### Object Diffs

```typescript
const oldState = { users: 100, revenue: 5000, plan: 'basic' };
const newState = { users: 150, revenue: 7500, plan: 'pro' };

logger.diff('State change', oldState, newState);
// Output:
//   users: 100 → 150 (+50)
//   revenue: 5000 → 7500 (+2500)
// + plan: "pro"
```

---

## 📐 MagicLog Schema & Runtime Validation

MagicLogger uses the **MagicLog Schema** - a structured JSON format with **optional runtime validation** to ensure data consistency across your entire logging pipeline. Define schemas for your log contexts and catch violations before they corrupt your observability data.

### What Does a MagicLog Entry Look Like?

Every log message becomes a rich JSON object:

```typescript
logger.info('User authenticated', { 
  userId: 'user-123', 
  method: '2FA',
  duration: 245 
});
```

**Outputs this structured JSON:**

```json
{
  "id": "1704067200000-abc123xyz",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "timestampMs": 1704067200000,
  "level": "info",
  "message": "User authenticated",
  "plainMessage": "User authenticated",
  "context": {
    "userId": "user-123",
    "method": "2FA",
    "duration": 245
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
  },
  "service": "auth-service",
  "environment": "production"
}
```

### Schema Validation (Optional)

MagicLogger supports **runtime schema validation** to catch data inconsistencies before they pollute your logs:

```typescript
import { Logger } from 'magiclogger';
import { z } from 'zod';

// Define schemas for different log contexts
const schemas = {
  user: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'guest'])
  }),
  
  payment: z.object({
    orderId: z.string(),
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP']),
    status: z.enum(['pending', 'completed', 'failed'])
  })
};

const logger = new Logger({
  schemas,  // Enable runtime validation
  onSchemaViolation: 'warn'  // 'warn' | 'error' | 'throw'
});

// ✅ Valid - passes schema validation
logger.info('User login', { 
  tag: 'user',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'john@example.com',
  role: 'admin'
});

// ⚠️ Schema violation - logged with warning
logger.info('Payment processed', {
  tag: 'payment',
  orderId: 'ORD-123',
  amount: -100,  // Invalid: negative amount!
  currency: 'BTC'  // Invalid: not in enum!
});
// Outputs warning: Schema violation for tag 'payment': amount must be positive, currency must be USD/EUR/GBP
```

#### Why Schema Validation?

**Production Benefits:**
- **Catch bugs early**: Invalid data caught at log time, not in production dashboards
- **Enforce contracts**: Teams must adhere to agreed logging standards
- **Prevent data corruption**: Bad data can't pollute your observability pipeline
- **Type safety at runtime**: TypeScript types + runtime validation = bulletproof logs

**Performance Impact:**
- Validation is **opt-in** and can be disabled in production
- Minimal overhead (~1μs per log with simple schemas)
- Schemas are compiled once and cached
- Can sample validation (e.g., validate 1% of logs in production)

#### 🎯 **Real-World Advantages**

1. **Instant Querying** - Search logs in Elasticsearch/Datadog/Splunk:
   ```sql
   SELECT * FROM logs 
   WHERE level = 'error' 
   AND context.userId = 'user-123'
   AND timestampMs > 1704067200000
   ```

2. **Distributed Tracing** - Automatic correlation across microservices:
   ```json
   {
     "trace": {
       "traceId": "0af7651916cd43dd8448eb211c80319c",
       "spanId": "b7ad6b7169203331"
     }
   }
   ```

3. **Performance Metrics** - Built-in resource tracking:
   ```json
   {
     "metadata": {
       "resources": {
         "memory": { "heapUsed": 60000000, "heapTotal": 80000000 },
         "cpu": { "user": 1234567, "system": 234567 }
       }
     }
   }
   ```

4. **Error Tracking** - Structured error objects:
   ```json
   {
     "level": "error",
     "error": {
       "name": "ValidationError",
       "message": "Invalid email format",
       "stack": "ValidationError: Invalid email format\n    at validateEmail..."
     }
   }
   ```

#### 🔄 **Native OpenTelemetry Compatibility**
The MagicLog schema maps 1:1 with OpenTelemetry's log data model:

```typescript
// MagicLog entry structure
interface LogEntry {
  // Core fields - directly map to OTLP
  id: string;                    // → OTLP: attributes["log.id"]
  timestamp: string;              // → OTLP: timeUnixNano
  level: LogLevel;                // → OTLP: severityNumber/severityText
  message: string;                // → OTLP: body (with ANSI)
  plainMessage?: string;          // → OTLP: body (clean text for backends)
  
  // Distributed tracing - native W3C Trace Context support
  trace?: {
    traceId: string;              // → OTLP: traceId (root level)
    spanId: string;               // → OTLP: spanId (root level)
    parentSpanId?: string;        // → OTLP: attributes["trace.parent_span_id"]
    traceFlags?: string;          // → OTLP: attributes["trace.flags"]
    traceState?: string;          // → OTLP: attributes["trace.state"]
  };
  
  // Service context
  service?: string;               // → OTLP: resource.attributes["service.name"]
  environment?: string;           // → OTLP: attributes["deployment.environment"]
  
  // Structured context & metadata
  context?: Record<string, any>;  // → OTLP: attributes (typed)
  metadata?: {
    hostname?: string;            // → OTLP: attributes["host.name"]
    pid?: number;                 // → OTLP: attributes["process.pid"]
    resources?: ResourceMetrics;  // → OTLP: process.runtime.* metrics
  };
}
```

#### 🎯 **Benefits of MagicLog Schema**

1. **Zero-Cost Abstraction**: The schema adds no overhead while providing rich structure
2. **Backward Compatible**: Works with existing logging infrastructure
3. **Forward Compatible**: Ready for OpenTelemetry adoption without code changes
4. **Type-Safe**: Full TypeScript definitions for compile-time safety
5. **Transport Agnostic**: Same schema works for files, databases, or OTLP endpoints

### Using MagicLog with OpenTelemetry

```typescript
import { createAsyncLogger } from 'magiclogger';
import { OTLPTransport } from 'magiclogger/transports';

// Direct OTLP export with automatic schema mapping
const logger = createAsyncLogger({
  onFlush: async (entries) => {
    // Entries are already in MagicLog schema format
    // OTLPTransport handles the mapping automatically
    await otlpTransport.sendBatch(entries);
  }
});

// Configure OTLP transport with native mapping
const otlpTransport = new OTLPTransport({
  endpoint: 'http://localhost:4318',
  serviceName: 'my-service',
  includeTraceContext: true  // Auto-propagate W3C trace context
});

// Log with automatic trace correlation
logger.info('Order processed', {
  orderId: '12345',
  userId: 'user-789',
  // Trace context automatically included if available
});
```

### Schema Documentation

For complete schema documentation and integration guides:
- 📖 [MagicLog Schema Specification](./docs/MAGICLOG_SCHEMA.md)
- 🏗️ [Transport Implementation Guide](./docs/transports.md)

#### W3C Trace Context Support

MagicLogger includes built-in utilities for W3C Trace Context extraction:

```typescript
import { 
  extractTraceContext, 
  createTraceparent,
  generateTraceId,
  generateSpanId 
} from 'magiclogger/utils/trace-context';

// Extract from incoming request headers
const trace = extractTraceContext(req.headers);
// Returns: { traceId, spanId, traceFlags, traceState, sampled }

// Create traceparent header for outgoing requests
const traceparent = createTraceparent(trace);
// Returns: "00-traceId-spanId-01"

// Generate new IDs for root spans
const newTraceId = generateTraceId();  // 32 hex chars
const newSpanId = generateSpanId();    // 16 hex chars
```

---

## 🚀 Enterprise Transports

### Transport Batching Behavior

**Important**: Network transports batch automatically, local transports don't:

| Transport | Batching | Default Config |
|-----------|----------|----------------|
| Console | ❌ No | Immediate write |
| File | ❌ No | Immediate write |
| HTTP | ✅ **Yes** | 100 logs or 5s |
| WebSocket | ✅ **Yes** | 100 logs or 5s |
| S3 | ✅ **Yes** | 1000 logs or 30s |
| MongoDB | ✅ **Yes** | 100 logs or 5s |

**With AsyncLogger**: Ring buffer collects logs, flushes periodically to transports
**With Sync Logger**: Each log sent immediately to transports (which may batch internally)

```javascript
// Disable batching for HTTP (not recommended)
new HTTPTransport({ 
  url: 'https://api.example.com',
  batch: false  // Send each log immediately
});

// Custom batch configuration
new HTTPTransport({ 
  url: 'https://api.example.com',
  batch: {
    enabled: true,    // Default for network transports
    maxSize: 200,     // Logs per batch
    maxTime: 10000,   // Max wait (ms)
    maxBytes: 2097152 // 2MB max
  }
});
```

**Note**: Sync logger does NOT wait for async transports to complete - use AsyncLogger if you need delivery guarantees with network transports.

### Core Transports

```typescript
import { Logger } from 'magiclogger';
import {
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  WebSocketTransport,
  StreamTransport
} from 'magiclogger/transports';

const logger = new Logger({
  transports: [
    // Console with styling
    new ConsoleTransport({ 
      level: 'debug', 
      useColors: true,
      format: 'pretty' 
    }),
    
    // File with rotation
    new FileTransport({ 
      filepath: './logs/app.log',
      maxFiles: 7,
      maxSize: '10MB',
      format: 'json'
    }),
    
    // HTTP with batching
    new HTTPTransport({ 
      url: 'https://logs.example.com',
      batch: { size: 100, timeout: 5000 },
      compress: true,
      headers: { 'x-api-key': process.env.LOG_API_KEY }
    }),
    
    // WebSocket real-time
    new WebSocketTransport({ 
      url: 'wss://logs.example.com/socket',
      reconnect: true 
    }),
    
    // Stream (stdout/stderr)
    new StreamTransport({ 
      stream: process.stdout,
      format: 'json'
    })
  ]
});
```

### Database & Storage

```typescript
import {
  PostgreSQLTransport,
  MongoDBTransport,
  S3Transport
} from 'magiclogger/transports';

// PostgreSQL with connection pooling
const pgTransport = new PostgreSQLTransport({
  connectionString: process.env.DATABASE_URL,
  table: 'application_logs',
  createTable: true,
  poolSize: 10,
  batchSize: 100,
  flushInterval: 5000
});

// MongoDB with TTL
const mongoTransport = new MongoDBTransport({
  uri: 'mongodb://localhost:27017',
  database: 'logs',
  collection: 'entries',
  ttl: 2592000, // 30 days
  createIndex: true
});

// S3 with compression and rotation
const s3Transport = new S3Transport({
  bucket: 'my-app-logs',
  prefix: 'production/',
  region: 'us-east-1',
  compression: 'gzip',
  rotation: 'daily',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
```

### Messaging & Streaming

```typescript
import {
  KafkaTransport,
  SyslogTransport,
  VectorTransport,
  FluentBitTransport
} from 'magiclogger/transports';

// Kafka with compression
const kafkaTransport = new KafkaTransport({
  brokers: ['localhost:9092'],
  topic: 'application-logs',
  clientId: 'my-app',
  compression: 'gzip',
  batch: { size: 100, lingerMs: 1000 }
});

// Syslog (RFC5424)
const syslogTransport = new SyslogTransport({
  host: 'localhost',
  port: 514,
  protocol: 'udp',
  facility: 'local0',
  appName: 'my-app',
  rfc: 'RFC5424'
});

// Vector for observability pipelines
const vectorTransport = new VectorTransport({
  endpoint: 'http://localhost:8686',
  source: 'my-app',
  encoding: 'json',
  compression: 'gzip'
});

// Fluent Bit with MessagePack
const fluentTransport = new FluentBitTransport({
  host: 'localhost',
  port: 24224,
  tag: 'app.logs',
  msgpack: true,
  shared_key: process.env.FLUENTD_SHARED_KEY
});
```

### Observability Integration

```typescript
import { OTLPTransport } from 'magiclogger/transports/otlp';

// OpenTelemetry with trace context
const otlpTransport = new OTLPTransport({
  endpoint: process.env.OTLP_ENDPOINT || 'http://localhost:4318',
  protocol: 'http/protobuf',
  headers: { 'x-api-key': process.env.OTLP_API_KEY },
  serviceName: 'my-service',
  resource: {
    'service.version': process.env.APP_VERSION,
    'deployment.environment': process.env.NODE_ENV
  },
  includeTraceContext: true // Auto-attach trace/span IDs
});

// Popular observability platforms
const signozTransport = new OTLPTransport({
  endpoint: process.env.SIGNOZ_ENDPOINT,
  headers: { 'signoz-access-token': process.env.SIGNOZ_TOKEN }
});

// Grafana Loki
const lokiTransport = new HTTPTransport({
  url: 'http://localhost:3100/loki/api/v1/push',
  transformRequest: (entries) => ({
    streams: [{
      stream: { app: 'my-app', env: 'production' },
      values: entries.map(e => [String(e.timestampMs * 1000000), e.message])
    }]
  })
});
```

---

## 🎯 Core Architecture & Design Decisions

### Design Philosophy

MagicLogger follows these core principles:

1. **Predictable Over Fast** - We chose a ring buffer over unbounded queues because predictable memory usage matters more than absolute throughput in production
2. **Explicit Over Implicit** - Backpressure is surfaced explicitly (AddResult) rather than hidden behind promises or callbacks
3. **Zero Dependencies** - No external dependencies means no supply chain attacks, version conflicts, or bloat
4. **Structured Over Pretty** - Every log is structured JSON (MagicLog Schema) for machine parsing, with optional pretty printing
5. **Safe Defaults** - Async by default for performance, explicit opt-in for sync when you need guarantees

### Two Distinct Logging Modes - Async vs Sync

```typescript
import { Logger, SyncLogger } from 'magiclogger';

// ASYNC LOGGER (Default) - Ring buffer architecture
const logger = new Logger({
  buffer: { 
    size: 16384,         // Fixed ring buffer size (no unbounded growth!)
    flushInterval: 50,   // Batch flush every 50ms
    flushSize: 2000      // Or when 2000 logs accumulate
  }
});

const result = logger.info('High-throughput logging');
if (!result.success) {
  // Explicit backpressure handling - buffer is full
  console.warn(`Dropped: ${result.reason}`);
}

// SYNC LOGGER - Blocking I/O with guaranteed delivery  
const syncLogger = new SyncLogger({ 
  file: './audit.log',
  forceFlush: true  // fsync after every write
});
syncLogger.info('Blocks until on disk');
// Perfect for security auditing, debugging, crash scenarios
```

### Why Ring Buffer Architecture?

**The Problem:** Traditional loggers use unbounded queues that can cause OOM crashes:
```typescript
// DANGEROUS: Unbounded queue growth
class NaiveLogger {
  private queue: LogEntry[] = [];  // Grows forever if disk is slow!
  
  log(msg: string) {
    this.queue.push(msg);  // Eventually OOM crash
  }
}
```

**Our Solution:** Fixed-size ring buffer with explicit backpressure:
```typescript
// SAFE: Fixed memory usage
class MagicLogger {
  private buffer = new RingBuffer(16384);  // Max 16K entries
  
  log(msg: string): AddResult {
    return this.buffer.add(msg);  // Know when full!
  }
}
```

**Benefits of Ring Buffer Architecture:**
- **Predictable memory** - Know exact max memory usage (16K * ~200 bytes = ~3.2MB)
- **No OOM crashes** - Buffer can't grow unbounded during traffic spikes
- **Explicit handling** - Applications know when logs are dropped and can react
- **Batch efficiency** - Flush thousands of logs in one I/O operation
- **Cache-friendly** - Circular access pattern optimizes CPU cache usage
- **Zero-allocation** - Reuses same memory slots, no GC pressure

**Trade-offs:**
- **Potential log loss** - Under extreme load, oldest logs are dropped
- **Tuning required** - Buffer size must match your throughput needs
- **Not for audit logs** - Use SyncLogger when every log must be preserved

### Transport System

Transports handle where your logs go. Network transports automatically batch for efficiency:

```typescript
// All network transports extend BatchingTransport and batch by default
import { HTTPTransport } from 'magiclogger/transports/http';

const transport = new HTTPTransport({
  url: 'https://logs.example.com',
  batch: true,  // Default for network transports
  batchSize: 100,
  batchInterval: 1000
});

// Disable batching if needed
const realtimeTransport = new HTTPTransport({
  url: 'https://logs.example.com',
  batch: false  // Send immediately
});
```

### Built-in Ring Buffer

AsyncLogger includes a built-in ring buffer for handling backpressure:

```typescript
const logger = createAsyncLogger({
  buffer: {
    size: 16384,       // 16K entries (default)
    flushInterval: 50, // Flush every 50ms
    flushSize: 2000    // Flush when 2000 entries accumulated
  },
  onFlush: async (entries) => {
    // Entries from ring buffer, ready for transport
    await transport.sendBatch(entries);
  }
});

// The ring buffer returns AddResult for explicit backpressure handling
const result = logger.info('High volume log');
if (!result.success) {
  // Buffer full - handle explicitly
  console.warn(`Log dropped: ${result.reason}`);
}
```

---

## 🔧 Optional Extensions

Extensions are opt-in utilities for specialized needs. Only import and use them when you need the extra functionality.

### PII Redaction

```typescript
const logger = new Logger({
  // Statistical sampling
  sampling: {
    enabled: true,
    rate: 0.1, // Sample 10%
    strategy: 'adaptive', // Adjusts based on volume
    keyFn: (entry) => entry.context?.requestId // Group by request
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60000, // 1 minute
    max: 1000, // Max 1000 logs per minute
    strategy: 'sliding'
  }
});

// Per-key rate limiting
const apiLogger = logger.withRateLimit('api-calls', {
  max: 100,
  window: 60000,
  onLimit: (key) => metrics.increment('logs.rate_limited', { key })
});

// Adaptive sampling
const adaptiveLogger = logger.withSampling({
  strategy: 'adaptive',
  targetRate: 1000, // Target 1000 logs/minute
  minRate: 0.001,   // Never below 0.1%
  maxRate: 1.0      // Never above 100%
});
```

Automatically redact sensitive information from logs:

```typescript
import { createLogger } from 'magiclogger';
import { Redactor } from 'magiclogger/extensions';

// Use the redactor extension
const logger = createLogger({
  redactor: new Redactor({
    preset: 'strict', // 'minimal', 'standard', 'strict'
    patterns: [
      { name: 'api-key', pattern: /sk-[a-zA-Z0-9]{48}/g, replacement: 'sk-***' },
      { name: 'employee-id', pattern: /EMP\d{6}/g, replacement: 'EMP******' }
    ],
    fields: ['password', 'token', 'secret', 'creditCard']
  })
});

// Auto-redaction in action
logger.info('User data', {
  email: 'user@example.com',     // → user@***
  password: 'secret123',         // → ********
  creditCard: '4111111111111111' // → ************1111
});

// Programmatic redaction
logger.redact().info('Sensitive operation', { 
  apiKey: 'sk-1234567890abcdef',
  userId: 'user_123' // Not redacted
});
```

### Sampling

Control log volume with statistical sampling:

```typescript
import { Sampler } from 'magiclogger/extensions';

const logger = createAsyncLogger({
  sampler: new Sampler({
    rate: 0.1, // Sample 10% of logs
    strategy: 'adaptive', // Adjusts based on volume
    keyFn: (entry) => entry.context?.requestId // Group by request
  })
});

// Adaptive sampling adjusts rate based on volume
const adaptiveSampler = new Sampler({
  strategy: 'adaptive',
  targetRate: 1000, // Target 1000 logs/minute
  minRate: 0.001,   // Never below 0.1%
  maxRate: 1.0      // Never above 100%
});
```

### Rate Limiting

Prevent log flooding with rate limiting:

```typescript
import { RateLimiter } from 'magiclogger/extensions';

const logger = createAsyncLogger({
  rateLimiter: new RateLimiter({
    window: 60000, // 1 minute
    max: 1000,     // Max 1000 logs per minute
    strategy: 'sliding'
  })
});

// Per-key rate limiting
const keyedLimiter = new RateLimiter({
  max: 100,
  window: 60000,
  keyFn: (entry) => entry.context?.userId,
  onLimit: (key) => metrics.increment('logs.rate_limited', { key })
});
```

### Advanced Queue Management

**Note:** AsyncLogger has a built-in ring buffer for basic backpressure handling. The QueueManager extension provides advanced features like priority queuing and custom drop policies:

```typescript
import { QueueManager } from 'magiclogger/extensions';

// Advanced queue with priority and custom policies
const logger = createAsyncLogger({
  queueManager: new QueueManager({
    maxSize: 10000,
    dropPolicy: 'priority', // 'head', 'tail', 'priority', 'random'
    priorityFn: (entry) => entry.level === 'error' ? 1 : 0,
    onDrop: (entries) => {
      console.warn(`Dropped ${entries.length} log entries`);
      metrics.increment('logs.dropped', entries.length);
    }
  })
});
```

---

## 📊 Monitoring & Observability

### Health Monitoring

```typescript
// Monitor transport health
setInterval(async () => {
  const health = await logger.getTransportHealth();
  
  Object.entries(health).forEach(([name, status]) => {
    if (!status.healthy) {
      alerting.notify(`Transport ${name} unhealthy: ${status.error}`);
    }
    
    // Emit metrics
    metrics.gauge('logger.transport.queue_size', status.queueSize, { transport: name });
    metrics.gauge('logger.transport.success_rate', status.successRate, { transport: name });
  });
}, 60000);

// Get detailed statistics
const stats = logger.getStats();
console.log('Logs processed:', stats.processed);
console.log('Logs dropped:', stats.dropped);
console.log('Current queue size:', stats.queued);
```

### Performance Monitoring

```typescript
// Track slow logs
logger.on('slow', ({ duration, entry }) => {
  if (duration > 100) {
    metrics.histogram('logger.slow_log', duration, {
      level: entry.level,
      transport: entry.transport
    });
  }
});

// Memory pressure handling
logger.on('memory_pressure', ({ usage }) => {
  if (usage > 100_000_000) { // 100MB
    logger.flush();
    logger.resetQueues();
  }
});
```

---

## ⚡ Performance

See detailed [benchmark results](./scripts/performance/benchmark-results.md), [architecture docs](./docs/architecture.md), and [transport options](./docs/transports.md).

### Logger Performance Characteristics

**Logger (Async - Default):**
- ✅ **250,000+ ops/sec** with ring buffer architecture
- ✅ Non-blocking - application code never waits for I/O
- ✅ Fixed memory footprint (ring buffer prevents OOM)
- ✅ Intelligent batching reduces syscall overhead
- ✅ Console: immediate output (not buffered)
- ✅ File/Network: batched writes (default: 50ms or 2000 entries)
- ✅ Explicit backpressure handling via AddResult
- **Best for**: Production services, APIs, microservices, high-throughput applications

**SyncLogger (Blocking I/O):**
- ✅ **~70,000 ops/sec** (limited by disk I/O speed)
- ✅ Guaranteed delivery - blocks until written to disk
- ✅ No buffer = no log loss even on immediate crash
- ✅ Immediate disk writes with fsync guarantee
- ✅ Perfect sequential ordering preserved
- ✅ Simplest mental model - what you log is what you get
- **Best for**: Security auditing, debugging race conditions, CLI tools, crash recovery

### When to Choose Each Mode

**Use AsyncLogger (default) when:**
- Building high-throughput web services or APIs
- Log volume varies significantly (handles spikes gracefully)
- Slight log reordering is acceptable
- You need maximum performance
- Using network transports (HTTP, S3, etc.)

**Use SyncLogger when:**
- Every log MUST be preserved (security, compliance)
- Debugging race conditions or crashes
- Building CLI tools where output order matters
- You need immediate visibility of logs
- The application might crash unexpectedly

### Benchmark Results

**Latest benchmark snapshot** (output suppressed, styled vs plain formatting):

<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Pino (Sync, Styled) | 100,000 | 2252.1 | 44,404 |
| Pino (Sync, Plain) | 100,000 | 2534.3 | 39,458 |
| MagicLogger (Sync, Plain) | 100,000 | 2561.4 | 39,041 |
| Bunyan (Sync, Styled) | 100,000 | 3183.6 | 31,411 |
| Winston (Sync, Styled) | 100,000 | 4075.0 | 24,540 |
| Winston (Sync, Plain) | 100,000 | 4288.4 | 23,319 |
| Bunyan (Sync, Plain) | 100,000 | 4503.6 | 22,204 |
| MagicLogger (Sync, Styled) | 100,000 | 4610.1 | 21,692 |
| MagicLogger (Async, Plain) | 100,000 | 1518.7 | 65,844 |
| MagicLogger (Async, Styled) | 100,000 | 1831.7 | 54,593 |
| Pino (Async, Styled) | 100,000 | 2316.8 | 43,163 |
| Pino (Async, Plain) | 100,000 | 2321.3 | 43,080 |
| Winston (Async, Styled) | 100,000 | 2328.2 | 42,952 |
| Winston (Async, Plain) | 100,000 | 3177.0 | 31,476 |

### Winners
- Sync Plain: Pino (Sync, Plain) (39,458 ops/sec) — MagicLogger: 39,041 ops/sec
- Sync Styled: Pino (Sync, Styled) (44,404 ops/sec) — MagicLogger: 21,692 ops/sec
- Async Plain: MagicLogger (Async, Plain) (65,844 ops/sec)
- Async Styled: MagicLogger (Async, Styled) (54,593 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 21,692 ops/sec
  Pino (Sync, Styled): 44,404 ops/sec
  → MagicLogger is 2.05x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 54,593 ops/sec
  Pino (Async, Styled): 43,163 ops/sec
  → MagicLogger is 1.26x faster

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
*Table generated by `scripts/performance/perf-bench.ts`. External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.*

---

## 🎯 Practical Examples

### Express.js Middleware

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({
  theme: { tags: { http: ['cyan'], slow: ['yellow', 'bold'] } }
});

app.use((req, res, next) => {
  const start = Date.now();
  
  logger.info(`<cyan.bold>${req.method}</> <dim>${req.path}</>`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusStyle = res.statusCode >= 500 ? 'red.bold' : 
                       res.statusCode >= 400 ? 'yellow' : 'green';
    
    logger.info(
      `<cyan.bold>${req.method}</> ${req.path} ` +
      `<${statusStyle}>${res.statusCode}</> <dim>${duration}ms</>`
    );
    
    if (duration > 1000) {
      logger.warn('Slow request', { 
        tags: ['slow', 'http'],
        duration, path: req.path 
      });
    }
  });
  
  next();
});
```

### Deployment Pipeline

```typescript
async function deploy() {
  const logger = new Logger({ theme: 'cyberpunk' });
  
  logger.header('🚀 DEPLOYMENT PIPELINE', ['white', 'bgBlue', 'bold']);
  
  // Build stage
  logger.info(logger.fmt`@blue{Stage 1/4:} Building application...`);
  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 40, '█', '░');
    await sleep(50);
  }
  logger.success('<green.bold>✓ Build completed</> <dim>(450 files, 2.3MB)</>');
  
  // Test results
  logger.info(logger.fmt`@blue{Stage 2/4:} Running tests...`);
  logger.table([
    { suite: 'Unit Tests', passed: 342, failed: 0, time: '2.3s' },
    { suite: 'Integration', passed: 89, failed: 0, time: '8.7s' },
    { suite: 'E2E Tests', passed: 23, failed: 0, time: '45.2s' }
  ]);
  
  logger.header('✅ DEPLOYMENT SUCCESSFUL', ['white', 'bgGreen', 'bold']);
}
```

### Production Configuration

```typescript
const prodLogger = new Logger({
  // Sampling and rate limiting
  sampling: { strategy: 'adaptive', targetRate: 10000 },
  rateLimit: { max: 1000, window: 60000 },
  redaction: { preset: 'strict' },
  
  // Multiple transports
  transports: [
    new KafkaTransport({ 
      brokers: process.env.KAFKA_BROKERS.split(','),
      compression: 'snappy'
    }),
    new PostgreSQLTransport({
      connectionString: process.env.DATABASE_URL,
      table: 'application_logs'
    }),
    new S3Transport({ // Archive
      bucket: 'logs-archive',
      rotation: 'daily'
    })
  ]
});
```

### Distributed Tracing

```typescript
import { Logger } from 'magiclogger';
import { OTLPTransport } from 'magiclogger/transports/otlp';
import { extractTraceContext } from 'magiclogger/utils/trace-context';

// MagicLog automatically captures and propagates trace context
const logger = new Logger({
  transports: [
    new OTLPTransport({ 
      endpoint: 'http://otel-collector:4318',
      serviceName: 'payment-service'
    })
  ]
});

// In your application
app.post('/payment', async (req, res) => {
  // Extract W3C trace context from headers using built-in helper
  const traceContext = extractTraceContext(req.headers);
  
  // Log with distributed trace correlation
  logger.info('Payment request received', {
    amount: req.body.amount,
    currency: req.body.currency,
    trace: traceContext  // Automatically propagated to OTLP
  });
  
  // Your logs now appear correlated in Jaeger, Grafana, DataDog, etc.
});
```

---

## 🔧 Configuration Reference

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
  themeByTag?: Record<string, string>;
  
  // Console-like args printing
  /** How non-string args are rendered in variadic calls. Default: 'inspect' */
  prettyPrint?: 'inspect' | 'json';
  /** When true and verbose, append compact [meta] summary after message. */
  printMetaInDebug?: boolean;
  
  // Performance features
  sampling?: {
    enabled: boolean;
    rate: number; // 0-1
    strategy: 'random' | 'deterministic' | 'adaptive';
    keyFn?: (entry: LogEntry) => string;
  };
  
  rateLimit?: {
    enabled: boolean;
    max: number;
    window: number;
    strategy: 'sliding' | 'fixed' | 'token-bucket';
  };
  
  // Security
  redaction?: {
    enabled: boolean;
    preset?: 'minimal' | 'standard' | 'strict';
    patterns?: RedactionPattern[];
    fields?: string[];
    deep?: boolean;
  };
  
  // Queue management
  queue?: {
    maxSize: number;
    dropPolicy: 'tail' | 'head' | 'priority' | 'random';
    priorityFn?: (entry: LogEntry) => number;
    onDrop?: (entries: LogEntry[]) => void;
  };
  
  // Transports
  transports?: Transport[];
  useDefaultTransports?: boolean;
}
```

### Smart Logger - Auto-Detection Mode

The `createSmartLogger` function automatically chooses the best logging mode based on your environment:

```typescript
import { createSmartLogger } from 'magiclogger';

// Zero config - automatically picks the best mode!
const logger = createSmartLogger();
// Development (TTY/interactive): Uses sync Logger for immediate feedback
// Production/CI: Uses AsyncLogger for maximum performance

// You can see what mode it chose
console.log(logger instanceof AsyncLogger ? 'Using async' : 'Using sync');

// Override auto-detection if needed
const prodLogger = createSmartLogger({ target: 'production' }); // Force async
const devLogger = createSmartLogger({ target: 'development' });  // Force sync
const customLogger = createSmartLogger({ mode: 'async' });       // Explicit mode

// Add custom transports (console always included)
const logger = createSmartLogger({
  onFlush: async (entries) => {
    await sendToCloudWatch(entries);
  }
});
```

**Auto-detection logic:**
- **Production** (`NODE_ENV=production`): Uses AsyncLogger
- **CI/Testing** (`CI=true` or `NODE_ENV=test`): Uses sync Logger
- **Interactive terminal** (TTY): Uses sync Logger for immediate output
- **Non-interactive/background**: Uses AsyncLogger for performance

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © Manic.agency

---

<p align="center">
  Developed and sponsored by <a href="https://manic.agency">Manic.agency</a>.
</p>

## 📦 Build Output Sizes

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 8.34 kB | 2.08 kB |
| `index.js` | ESM | 5.55 kB | 1.82 kB |
| `index.d.ts` | Types | 83.2 kB | 17.4 kB |

### Core Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core (bare minimum) | 33 kB |
| Core + Console Transport | 33 kB |
| Core + File Transport | 35.2 kB |
| Core + HTTP Transport | 43.5 kB |
| Core + All Basic Transports | 44.9 kB |

### Individual Transport Sizes (gzipped)

| Transport | Size |
|-----------|------|
| Console Transport Only | 7.78 kB |
| File Transport Only | 4.12 kB |
| HTTP Transport Only | 21.9 kB |

### Extension Sizes (gzipped)

| Extension | Size |
|-----------|------|
| Sampler | 1.21 kB |
| RateLimiter | 1.09 kB |
| Redactor | 3.79 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 8.34 kB | 2.08 kB |
| `index.js` | ESM | 5.55 kB | 1.82 kB |
| `index.d.ts` | Types | 83.2 kB | 17.4 kB |

### Core Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core (bare minimum) | 33 kB |
| Core + Console Transport | 33 kB |
| Core + File Transport | 35.2 kB |
| Core + HTTP Transport | 43.5 kB |
| Core + All Basic Transports | 44.9 kB |

### Individual Transport Sizes (gzipped)

| Transport | Size |
|-----------|------|
| Console Transport Only | 7.78 kB |
| File Transport Only | 4.12 kB |
| HTTP Transport Only | 21.9 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 8.68 kB | 2.06 kB |
| `index.js` | ESM | 5.52 kB | 1.76 kB |
| `index.d.ts` | Types | 127 kB | 25.3 kB |

### Core Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core (bare minimum) | 48.3 kB |
| Core + Console Transport | 48.3 kB |
| Core + File Transport | 48.3 kB |
| Core + HTTP Transport | 55.3 kB |
| Core + All Basic Transports | 56.6 kB |

### Individual Transport Sizes (gzipped)

| Transport | Size |
|-----------|------|
| Console Transport Only | 7.9 kB |
| File Transport Only | 4.12 kB |
| HTTP Transport Only | 21.7 kB |

### Utility Sizes (gzipped)

| Utility | Size |
|---------|------|
| Sampler | 1.21 kB |
| RateLimiter | 1.09 kB |
| Redactor | 3.79 kB |

*Generated via `scripts/analyze-build.js`.*