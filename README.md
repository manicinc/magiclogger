# MagicLogger

<p align="center">
    <img src="website/static/img/magiclogger-primary-no-subtitle-transparent-4x.png" alt="Magiclogger" width="520"/>
    <img src="https://img.shields.io/badge/core_gzip-36kb-brightgreen.svg" alt="core_gzip"> <img src="https://img.shields.io/badge/core_console_gzip-32kb-brightgreen.svg" alt="core_console_gzip"> <img src="https://img.shields.io/badge/core_transports_gzip-48kb-brightgreen.svg" alt="core_transports_gzip">
</p>
<p align="center">
  <!-- Top row: static + coverage badges -->
  <img src="https://img.shields.io/badge/zero_dependencies-✓-blue" alt="Zero Dependencies"> <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript"> <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js"> <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"> <img src="https://img.shields.io/badge/coverage-0%25-lightgrey.svg" alt="Test Coverage"> <a href="https://codecov.io/gh/manicinc/magiclogger"><img src="https://codecov.io/gh/manicinc/magiclogger/branch/master/graph/badge.svg" alt="codecov"/></a>
  <!-- Bottom row: build size badges (auto-updated by scripts/analyze-build.js) -->
</p>

## Table of Contents

- [Key Features](#-key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Three Powerful Styling APIs](#three-powerful-styling-apis)
  - [1. Chainable Style API](#1-chainable-style-api-loggers)
  - [2. Template Literal API](#2-template-literal-api-loggerfmt)
  - [3. Inline Angle Bracket Syntax](#3-inline-angle-bracket-syntax)
- [MagicLog Schema & Validation](#magiclog-schema--validation)
  - [Structured JSON Output](#structured-json-output)
  - [Runtime Schema Validation](#runtime-schema-validation-optional)
- [Tagging & Theming](#tagging--theming)
  - [Built-in Themes](#built-in-themes)
  - [Tag-Based Styling](#tag-based-styling)
- [Ring Buffer Architecture](#ring-buffer-architecture)
- [Core Features](#core-features)
  - [Sync & Async Loggers](#sync--async-loggers)
  - [Visual Elements](#visual-elements)
- [Enterprise Features](#enterprise-features)
  - [Enterprise Transports](#enterprise-transports)
  - [Optional Extensions](#optional-extensions)
  - [Monitoring & Observability](#monitoring--observability)
- [Performance](#performance)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Build Output Sizes](#-build-output-sizes)

## 🚀 Production-Grade TypeScript Logger

**MagicLogger** is a zero-dependency, high-performance logger that combines beautiful console styling with structured JSON logging for production. Built on a **ring buffer architecture** for predictable memory usage and featuring **three flexible styling APIs**, **runtime schema validation**, and **enterprise-grade transports**.

### ✨ Key Features

#### **🎨 Three Flexible Styling APIs**
Choose the styling approach that fits your code style - all work seamlessly together:

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

#### **📐 MagicLog Schema with Runtime Validation**
Structured JSON output with **optional, lazy-loaded** schema validation:

```typescript
// Define schemas for different contexts (validation module only loads if used)
const logger = new Logger({
  schemas: {
    user: z.object({
      userId: z.string().uuid(),
      email: z.string().email(),
      role: z.enum(['admin', 'user'])
    }),
    payment: z.object({
      orderId: z.string(),
      amount: z.number().positive(),
      status: z.enum(['pending', 'completed', 'failed'])
    })
  },
  onSchemaViolation: 'warn'  // 'warn' | 'error' | 'throw'
});

// ✅ Type-safe, validated logging
logger.info('User login', { tag: 'user', userId: '550e8400...', email: 'john@example.com' });

// ⚠️ Schema violations caught at log time, not in production!
logger.info('Payment', { tag: 'payment', amount: -100 }); // Warning: amount must be positive
```

#### **🎯 Tagging & Theming System**
Auto-style logs based on semantic tags:

```typescript
const logger = new Logger({
  theme: {
    tags: {
      api: ['cyan', 'bold'],
      database: ['yellow'],
      critical: ['white', 'bgRed', 'bold'],
      performance: ['magenta']
    }
  }
});

logger.info('Request received', { tags: ['api'] });           // Auto-styled cyan.bold
logger.error('Connection failed', { tags: ['database', 'critical'] }); // Combined styles
```

#### **🔄 Ring Buffer Architecture**
**Predictable memory usage** even under extreme load - no OOM crashes:

```typescript
// Fixed-size ring buffer prevents unbounded memory growth
const logger = new Logger({
  buffer: {
    size: 16384,       // Fixed 16K entries (~3.2MB max memory)
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

**Benefits:**
- ✅ **No memory leaks** - Fixed size, circular reuse
- ✅ **Predictable behavior** - Know exactly when/why logs drop
- ✅ **250,000+ ops/sec** - Optimized for production throughput
- ✅ **Explicit backpressure** - Applications can adapt to load

**Trade-offs:**
- ⚠️ Oldest logs dropped when buffer full (use SyncLogger for audit logs)
- ⚠️ Requires tuning for your throughput needs

See [Ring Buffer Architecture](./docs/RING_BUFFER.md) for detailed design decisions.

## Quick Start

## Installation

```bash
npm install magiclogger
# or yarn add magiclogger / pnpm add magiclogger
```

Supports both ESM and CJS:

```typescript
import { Logger } from 'magiclogger';  // ESM/TypeScript
const { Logger } = require('magiclogger');  // CommonJS
```

## Quick Start

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

## Three Powerful Styling APIs

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

## MagicLog Schema & Validation

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

## Tagging & Theming

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

### Visual Elements

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

## Ring Buffer Architecture

### Why Ring Buffer?

**The Problem:** Traditional loggers use unbounded queues that grow forever during traffic spikes, causing OOM crashes.

**Our Solution:** Fixed-size ring buffer with explicit backpressure:

```typescript
const logger = new Logger({
  buffer: {
    size: 16384,       // Fixed 16K entries (~3.2MB max)
    flushInterval: 50, // Batch flush every 50ms
    flushSize: 2000    // Or when 2000 logs accumulate
  }
});

// Know when buffer is full
const result = logger.info('High volume');
if (!result.success) {
  metrics.increment('logs.dropped');
}
```

**Benefits:**
- 🟢 **Predictable memory** - Exact max usage: 16K * 200 bytes = ~3.2MB
- 🟢 **No OOM crashes** - Can't grow unbounded
- 🟢 **250,000+ ops/sec** - Lock-free, cache-optimized
- 🟢 **Zero GC pressure** - Reuses same memory slots

**Trade-offs:**
- 🔴 Drops oldest logs when full (use SyncLogger for audit trails)
- 🔴 Requires tuning for your throughput

See [Ring Buffer Design](./docs/RING_BUFFER.md) for implementation details.

## Advanced Schema Features

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

### Schema Validation (Optional, Lazy-Loaded)

MagicLogger supports **runtime schema validation** to catch data inconsistencies before they pollute your logs. The validation module is **completely optional** and **lazy-loaded** - it's only imported when you explicitly set a schema, keeping your bundle size minimal:

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

### Schema Validation for Type-Safe Logging

MagicLogger includes a lightweight, tree-shakeable schema validation system that ensures your log contexts and tags conform to expected structures. **The validation module is only loaded when you actually set a schema** - if you never call `setSchema()`, the validation code is never imported, keeping your bundle lean. This is especially useful for:

- **Enforcing consistent log structures** across teams
- **Catching context errors** at development time
- **Ensuring compliance** with log aggregation requirements
- **Type-safe logging** without runtime overhead when disabled

#### Basic Context Schema Validation

```typescript
import { Logger } from 'magiclogger';
import { object, string, number, optional } from 'magiclogger/validation';

const logger = new Logger();

// Define a schema for your context
const contextSchema = object({
  userId: string({ format: 'uuid' }),
  sessionId: string(),
  requestId: optional(string()),
  environment: string({ enum: ['dev', 'staging', 'prod'] }),
  requestCount: number({ min: 0, integer: true })
});

// Set the schema on the context manager
logger.contextManager.setSchema(contextSchema, 'throw'); // Strict mode

// This will validate successfully
logger.info('User action', {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  sessionId: 'session-123',
  environment: 'prod',
  requestCount: 42
});

// This will throw an error (invalid UUID)
logger.info('Invalid user', {
  userId: 'not-a-uuid',
  sessionId: 'session-123',
  environment: 'prod',
  requestCount: 42
});
// Error: Context validation failed:
//   - userId: Invalid uuid format
```

#### Schema Validation Modes

```typescript
// Three validation modes available:

// 1. Throw mode - Strict validation, throws on error
logger.contextManager.setSchema(schema, 'throw');

// 2. Warn mode - Logs warnings but continues (default)
logger.contextManager.setSchema(schema, 'warn');

// 3. Silent mode - Validates but doesn't report errors
logger.contextManager.setSchema(schema, 'silent');
```

#### Complex Schema Examples

```typescript
import { 
  object, string, number, array, boolean, 
  union, literal, optional, nullable 
} from 'magiclogger/validation';

// User activity schema
const activitySchema = object({
  user: object({
    id: string({ format: 'uuid' }),
    email: string({ format: 'email' }),
    roles: array(string()),
    metadata: optional(object({}, { additionalProperties: true }))
  }),
  action: union(
    literal('login'),
    literal('logout'),
    literal('purchase'),
    literal('view')
  ),
  timestamp: number({ min: 0 }),
  success: boolean(),
  error: nullable(object({
    code: string(),
    message: string(),
    stack: optional(string())
  }))
});

// Request/Response schema
const apiSchema = object({
  request: object({
    method: string({ enum: ['GET', 'POST', 'PUT', 'DELETE'] }),
    path: string({ pattern: /^\/api\// }),
    headers: object({}, { additionalProperties: true }),
    body: optional(string())
  }),
  response: object({
    status: number({ min: 100, max: 599 }),
    duration: number({ positive: true }),
    size: number({ min: 0 })
  }),
  trace: object({
    traceId: string({ pattern: /^[a-f0-9]{32}$/ }),
    spanId: string({ pattern: /^[a-f0-9]{16}$/ }),
    parentSpanId: optional(string({ pattern: /^[a-f0-9]{16}$/ }))
  })
});
```

#### Custom Validation Functions

```typescript
const customSchema = object({
  email: string({
    validate: (value) => {
      // Custom validation logic
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value as string) || 'Invalid email format';
    }
  }),
  age: number({
    validate: (value) => {
      const age = value as number;
      if (age < 13) return 'Must be 13 or older';
      if (age > 120) return 'Invalid age';
      return true;
    }
  }),
  username: string({
    transform: (value) => {
      // Normalize username
      return (value as string).toLowerCase().trim();
    }
  })
});
```

#### Performance Considerations

The schema validator is designed to be lightweight and tree-shakeable:

```typescript
// Only import what you need - unused validators are tree-shaken
import { string, number } from 'magiclogger/validation';

// Validation is only performed when schemas are set
// No performance overhead when not using schemas

// Lazy loading - validator is only loaded when first schema is set
logger.contextManager.setSchema(schema); // Validator loaded here

// Schemas can be disabled at runtime
logger.contextManager.options.enableValidation = false; // Bypass all validation
```

#### Integration with TypeScript

```typescript
import { object, string, number } from 'magiclogger/validation';

// Define your schema
const userContextSchema = object({
  userId: string(),
  accountType: string({ enum: ['free', 'pro', 'enterprise'] }),
  credits: number({ min: 0 })
});

// Derive TypeScript type from schema (for type safety)
type UserContext = {
  userId: string;
  accountType: 'free' | 'pro' | 'enterprise';
  credits: number;
};

// Use with type safety
function logUserAction(action: string, context: UserContext) {
  logger.info(action, context); // Type-safe and schema-validated
}
```

---

## Core Features

### Sync & Async Loggers

```typescript
import { Logger, SyncLogger } from 'magiclogger';

// ASYNC (Default) - Non-blocking, high throughput
const logger = new Logger({
  buffer: { 
    size: 16384,         // Ring buffer size
    flushInterval: 50,   // Batch every 50ms
    flushSize: 2000      // Or 2000 logs
  }
});
// ✅ 250,000+ ops/sec
// ✅ Non-blocking I/O
// ✅ Batch efficiency
// ⚠️ May drop logs under extreme load

// SYNC - Blocking I/O, guaranteed delivery
const auditLogger = new SyncLogger({
  file: './audit.log',
  forceFlush: true  // fsync after each write
});
// ✅ ~70,000 ops/sec
// ✅ Every log guaranteed on disk
// ✅ Perfect for audit trails
// ⚠️ Blocks on each write
```

**When to use each:**
- **Async**: Web services, APIs, high-throughput apps
- **Sync**: Audit logs, debugging, CLI tools, crash recovery

## Enterprise Features

### Enterprise Transports

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


### Optional Extensions

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

### Monitoring & Observability

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

## Performance

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
*Table generated by `scripts/performance/perf-bench.ts`. External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.*

---

## Examples

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

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Manic.agency

---

<p align="center">
  Developed and sponsored by <a href="https://manic.agency">Manic.agency</a>.
</p>

## 📦 Build Output Sizes

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 7.09 kB | 1.65 kB |
| `index.js` | ESM | 4.06 kB | 1.34 kB |
| `index.d.ts` | Types | 94.3 kB | 19.7 kB |

### Core Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core (bare minimum) | 36.7 kB |
| Core + Console Transport | 36.7 kB |
| Core + File Transport | 38.8 kB |
| Core + HTTP Transport | 47.3 kB |
| Core + All Basic Transports | 48.7 kB |

### Individual Transport Sizes (gzipped)

| Transport | Size |
|-----------|------|
| Console Transport Only | 7.78 kB |
| File Transport Only | 4.12 kB |
| HTTP Transport Only | 21.9 kB |

### Schema Validation (Optional, Lazy-loaded)

| Scenario | Size |
|----------|------|
| Core + Schema Validation | 38.9 kB |
| Validation Module Only | 2.52 kB |

*Note: Validation is only loaded when schemas are explicitly set on ContextManager or TagManager.*

### Extension Sizes (gzipped)

| Extension | Size |
|-----------|------|
| Sampler | 1.21 kB |
| RateLimiter | 1.09 kB |
| Redactor | 3.79 kB |

*Generated via `scripts/analyze-build.js`.*