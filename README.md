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
  - [Quick Start - Choose Your Style](#quick-start---choose-your-style)
  - [Basic Usage](#basic-usage)
  - [Smart Logger - Auto-Detection Mode](#smart-logger---auto-detection-mode)
  - [High-Performance Async Logging](#high-performance-async-logging-like-pino)
  - [Graceful Shutdown](#graceful-shutdown-asynclogger)
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

## Enterprise-Ready Structured JSON Logging with Style

**MagicLogger** outputs structured JSON following the **[MagicLog Schema](#-magiclog-schema---structured-json-logging-format)** - a standardized format that's instantly queryable in any log aggregator while maintaining beautiful console output. Every log is both human-readable AND machine-parseable.

```typescript
import { Logger, createAsyncLogger, createSmartLogger } from 'magiclogger';

// Standard Logger - includes console output by default!
const logger = new Logger();  // That's it! Logs to console automatically

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

// Smart logger - auto-detects best mode (default is 'auto')
const smartLogger = createSmartLogger();  // Sync in dev, async in production!

// AsyncLogger - fast by default, console output included!
const asyncLogger = createAsyncLogger();  // Zero config, maximum performance!

// Production: AsyncLogger has built-in ring buffer for backpressure
const prodLogger = createAsyncLogger({
  buffer: { size: 32768 },  // Built-in ring buffer handles backpressure
  onFlush: async (entries) => {
    await sendToElasticsearch(entries);
  }
});

// Optional extensions - only use when needed
const advancedLogger = createAsyncLogger({
  redactor: { preset: 'strict' },            // Extension: Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 }, // Extension: Rate limiting  
  sampler: { rate: 0.1 },                    // Extension: Sample 10% of logs
  queueManager: { maxSize: 100000 },         // Extension: Advanced queue management
  onFlush: async (entries) => {
    await sendToElasticsearch(entries);
  }
});

// Backpressure handling with built-in ring buffer
const result = prodLogger.info('High volume log');
if (!result.success) {
  // Ring buffer is full - handle explicitly
  console.warn(`Log dropped: ${result.reason}`);
}
```

Note: MagicLogger's sync performance is competitive (~39k ops/sec) and perfect for secure failsafe logging, while its async mode excels for high-throughput scenarios (65k ops/sec plain, 54k ops/sec styled). See [transports](./docs/transports.md) docs and [performance results](./scripts/performance/benchmark-results.md).
---

## Features

### 📊 **MagicLog Schema - Structured JSON Output**
- **Every log is queryable JSON** - works instantly with Elasticsearch, Datadog, Splunk
- **OpenTelemetry native** - 1:1 mapping to OTLP format, zero friction
- **Built-in trace correlation** - automatic distributed tracing support
- **Full context preservation** - never lose metadata or stack traces

### 🎨 **Beautiful Styling & Visualization**
- **Three styling APIs** - chainable, template literals, and inline syntax
- **Rich colors & themes** with automatic terminal detection
- **Visual elements** - tables, progress bars, headers, diffs
- **Dual output** - styled for console, clean JSON for aggregators

### ⚡ **High Performance & Efficiency**
- **Perfect tree-shaking** - only pay for what you use
- **Zero config, instant start** - all loggers work out of the box
- **Fast async by default** - optimized buffer sizes, opt-in utilities
- **Smart mode** - auto-detects best performance mode for your environment

### 🛡️ **Production-Ready Architecture**
- **Everything is production-ready** - all features battle-tested
- **Built-in ring buffer** - AsyncLogger handles backpressure automatically
- **Optional extensions** - PII redaction, sampling, rate limiting (opt-in when needed)
- **Graceful shutdown** - ensure all logs are flushed

### 🔌 **Enterprise Integration**
- **Enterprise transports** - Kafka, PostgreSQL, OTLP, S3, and more
- **Monitoring integration** - OpenTelemetry, metrics, health checks
- **W3C Trace Context** - automatic correlation across microservices
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

### Quick Start - Choose Your Style

#### Simple Synchronous (Best for Development)
```typescript
import { Logger } from 'magiclogger';

const logger = new Logger();  // Console output by default!
logger.info('Application started');
logger.error('Database connection failed');

// Disable console if needed
const quietLogger = new Logger({ useConsole: false });
```

#### High-Performance Async (Best for Production)
```typescript
import { createAsyncLogger } from 'magiclogger';

// Works immediately - logs to console by default!
const logger = createAsyncLogger();

logger.info('Request processed', { duration: 45 });
logger.error('Payment failed', { orderId: 123 });

// Add custom transport (console still works)
const prodLogger = createAsyncLogger({
  onFlush: async (entries) => {
    await writeToFile(entries);  // Additional destination
  }
});
```

### Basic Usage

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({ useColors: true });

// Standard logging levels
logger.info('Application started successfully');
logger.success('User registration completed');  
logger.warn('Disk space running low (15% remaining)');
logger.error('Failed to connect to database');
logger.debug('Auth token: eyJhbGciOiJIUzI1NiIs...');

// Universal log method
logger.log('Message with default info level');
logger.log('Warning message', 'warn');
logger.log('Error message', 'error');
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

### High-Performance Async Logging (Like Pino)

For production workloads requiring maximum throughput with sensible defaults:

```typescript
import { createAsyncLogger } from 'magiclogger';

// Zero config - fast and works immediately!
const logger = createAsyncLogger();

logger.info('Server started', { port: 3000 });      // Goes to console
logger.error('Database connection failed', { error: err });

// Default configuration (optimized for performance):
// - Console output (always!)
// - 16KB ring buffer (16384 entries) - larger for better throughput
// - Auto-flush every 50ms or 2000 entries - faster batching
// - No utilities by default - maximum speed
// - Graceful backpressure handling

// Tune buffer for your workload
const tunedLogger = createAsyncLogger({
  buffer: { size: 32768, flushInterval: 25 }  // Even faster!
});

// Add transport when needed
const customLogger = createAsyncLogger({
  onFlush: async (entries) => {
    await sendToS3(entries);  // Replace or extend console output
  }
});
```

For production with operational utilities:

```typescript
import { createAsyncLogger } from 'magiclogger';

// Production with opt-in utilities (only add what you need)
const logger = createAsyncLogger({
  // Only add utilities you actually need:
  redactor: { preset: 'strict' },            // IF you need PII redaction
  rateLimiter: { max: 1000, window: 60000 }, // IF you need rate limiting
  sampler: { rate: 0.1 },                    // IF you need sampling
  
  // Custom transport
  onFlush: async (entries) => {
    await sendToDatadog(entries);
  }
});

// Most apps just need this:
const simpleLogger = createAsyncLogger({
  onFlush: async (entries) => {
    await writeToFile(entries);  // That's it!
  }
});
```

### Graceful Shutdown (AsyncLogger)

AsyncLogger requires proper shutdown to prevent log loss:

```javascript
// REQUIRED: Setup shutdown handlers
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await asyncLogger.flushAndWait(); // Ensure all logs are sent
  await asyncLogger.close();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  await asyncLogger.logCritical('error', 'Uncaught exception', { error });
  await asyncLogger.flushAndWait();
  process.exit(1);
});

// Express.js example
app.get('/shutdown', async (req, res) => {
  res.send('Shutting down...');
  await asyncLogger.flushAndWait();
  server.close();
});

// Kubernetes graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown');
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Flush all pending logs
  await asyncLogger.flushAndWait();
  console.log('All logs flushed');
  
  process.exit(0);
});
```

### Easy API with Sensible Defaults

```typescript
import { Logger, createAsyncLogger, createSyncLogger, createSmartLogger } from 'magiclogger';

// All of these work immediately with zero config:
const asyncLogger = createAsyncLogger();        // Async logger → console (DEFAULT)
const syncLogger = new Logger();                // Sync logger → console
const syncLogger2 = createSyncLogger();         // Sync logger → console
const smartLogger = createSmartLogger();        // Auto mode → console

// They all just work!
asyncLogger.info('Hello from async logger (default)');
syncLogger.info('Hello from sync logger');
syncLogger2.info('Hello from explicit sync logger');
smartLogger.info('Hello from smart logger');

// Add utilities when needed (works with all logger types)
const prodLogger = new Logger({
  redactor: { preset: 'strict' },           // PII redaction
  rateLimiter: { max: 100, window: 30000 }, // Rate limiting
  // Console transport is still included automatically!
});

// Disable console only if you really need to
const silentLogger = new Logger({ 
  useConsole: false,  // No console output
  transports: [customTransport]  // Use only custom transports
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

### Why MagicLog Schema Matters

✅ **Instantly searchable** in Elasticsearch, Datadog, Splunk  
✅ **Automatic correlation** via trace IDs across microservices  
✅ **Never lose context** - all metadata preserved  
✅ **OpenTelemetry ready** - direct OTLP compatibility  
✅ **Performance tracking** - built-in resource metrics  

**Key Fields:**
- `message`: Styled string for console (with ANSI colors)
- `plainMessage`: Clean text for log aggregators
- `context`: Your custom metadata
- `metadata`: Automatic system info (hostname, PID, platform)
- `trace`: Distributed tracing context (W3C Trace Context)
- `error`: Structured error with stack trace

---

### Console-like arguments and structured meta

MagicLogger also supports console-like variadic arguments while preserving structured metadata.

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

## 📐 MagicLog Schema - Structured JSON Logging Format

MagicLogger uses the **MagicLog Schema** - an open-source, standardized JSON logging format that's both human-readable and machine-parseable. Every log is a structured JSON object that works seamlessly with log aggregators, observability platforms, and OpenTelemetry.

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

### Real-World Example: Distributed Tracing

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

## 🎯 Core Features

All core features are production-ready and battle-tested. They come built into the loggers without any additional setup.

### Sync & Async Loggers

```typescript
// Synchronous Logger - Perfect for development, debugging, and critical paths
const syncLogger = new Logger();
syncLogger.info('Immediate output, no buffering');

// AsyncLogger - High-performance with built-in ring buffer
const asyncLogger = createAsyncLogger();
asyncLogger.info('Buffered for performance');

// Smart Logger - Auto-detects best mode
const smartLogger = createSmartLogger();
// Uses sync in dev/TTY, async in production
```

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
import { createAsyncLogger } from 'magiclogger';
import { Redactor } from 'magiclogger/extensions';

// Use the redactor extension
const logger = createAsyncLogger({
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

### Logger Types

**Asynchronous Logger (DEFAULT - `createLogger()` or `createAsyncLogger()`):**
- ✅ Non-blocking - 1.7x faster (~65,000 ops/sec)
- ✅ Ring buffer for efficient log collection
- ✅ Explicit backpressure handling
- ⚠️ Requires proper shutdown handling
- **Best for**: Production services, high-throughput applications

**Synchronous Logger (`new Logger()` or `createSyncLogger()` or `createLogger({ async: false })`):**
- ✅ Immediate output - see logs instantly
- ✅ No log loss on crash - guaranteed delivery
- ✅ Simple debugging - what you log is what you see
- ✅ Good performance (~39,000 ops/sec)
- **Best for**: Development, debugging, CLIs, security audits

### When to Use Each

**Async is the default and recommended for production:**
```javascript
// createAsyncLogger - has default console handler, works immediately
const logger = createAsyncLogger(); // Works with zero config!

// createLogger - async by default but requires onFlush
const logger = createLogger({ 
  onFlush: async (entries) => await transport.sendBatch(entries)
});

// Both are async, high-performance loggers
```

**Use Synchronous for development/debugging:**
```javascript
// When you need immediate output for debugging
const logger = new Logger(); // Direct instantiation is sync
// OR
const logger = createSyncLogger();
// OR 
const logger = createLogger({ async: false });
```

**Let MagicLogger decide:**
```javascript
// Smart mode - picks based on environment
const logger = createSmartLogger(); // Auto-detects best mode
```

### Performance Summary

- **Async Logger (default)**: ~65k ops/sec - Optimized for production throughput
- **Sync Logger**: ~39k ops/sec - Still very fast, better for debugging
- Both are production-ready and battle-tested

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

## 🎯 Practrical Examples

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