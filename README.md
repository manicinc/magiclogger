# MagicLogger

<p align="center">
    <img src="website/static/img/magiclogger-primary-no-subtitle-transparent-4x.png" alt="Magiclogger" width="520"/> <img src="https://img.shields.io/badge/core_gzip-47kb-brightgreen.svg" alt="core_gzip"> <img src="https://img.shields.io/badge/core_console_gzip-47kb-brightgreen.svg" alt="core_console_gzip"><br/>
    <img src="https://img.shields.io/badge/core_transports_gzip-55kb-brightgreen.svg" alt="core_transports_gzip"> <img src="https://img.shields.io/badge/compat_gzip-45kb-brightgreen.svg" alt="compat_gzip">
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
  - [Basic Usage](#basic-usage)
  - [AsyncLogger with Operational Utilities](#asynclogger-with-operational-utilities)
  - [Unified API - Same Utilities Work in Both Loggers](#unified-api---same-utilities-work-in-both-loggers)
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
- [Enterprise Transports](#enterprise-transports)
  - [Core Transports](#core-transports)
  - [Database & Storage](#database--storage)
  - [Messaging & Streaming](#messaging--streaming)
  - [Observability Integration](#observability-integration)
- [Production Features](#production-features)
  - [Sampling & Rate Limiting](#sampling--rate-limiting)
  - [PII Redaction](#pii-redaction)
  - [Queue Management](#queue-management)
- [Monitoring & Health](#monitoring--health)
  - [Transport Health Monitoring](#transport-health-monitoring)
  - [Performance Monitoring](#performance-monitoring)
- [Performance](#performance)
  - [Benchmark Results](#benchmark-results)
  - [Performance Insights](#performance-insights)
  - [When to Choose Each Mode](#when-to-choose-each-mode)
  - [Bundle Sizes](#bundle-sizes-gzipped)
- [Real-World Examples](#real-world-examples)
  - [Express.js Middleware](#expressjs-middleware)
  - [Deployment Pipeline](#deployment-pipeline)
  - [Production Configuration](#production-configuration)
- [Configuration Reference](#configuration-reference)
  - [Logger Options](#logger-options)
- [Contributing](#contributing)
- [License](#license)
- [Build Output Sizes](#build-output-sizes)

## Enterprise-Ready Logging with Style

**MagicLogger** is a colorful logging library in TypeScript with multiple APIs and flexible logging options to balance both performance, style, stability.

```typescript
import { Logger, createAsyncLogger, createSmartLogger } from 'magiclogger';

// Standard Logger - synchronous by default for predictable behavior
const logger = new Logger({ useColors: true });

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

// Smart performance-aware logger (auto-detects environment)
const smartLogger = createSmartLogger({ target: 'auto' });

// Production AsyncLogger with integrated operational utilities
// Choose async when you need maximum throughput (13x faster)
const asyncLogger = createAsyncLogger({
  buffer: { size: 8192, flushInterval: 100 },
  redactor: { preset: 'strict' },                    // Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 },        // Rate limiting  
  sampler: { rate: 0.1, strategy: 'adaptive' },     // Adaptive sampling
  onFlush: async (entries) => await transport.sendBatch(entries)
});

// Explicit backpressure handling - never silently drop logs
const result = asyncLogger.info('User data:', { ssn: '123-45-6789', email: 'user@example.com' });
if (!result.success) {
  console.warn(`Log dropped: ${result.reason}`);
  // Handle backpressure explicitly
}
```

Note: In current performance tests, MagicLogger is ~2x slower than Winston's built-in styling which is synchronous, but with its async implementation (comparable to Pino) MagicLogger's throughput is ~5x higher.

---

## Features

### 🎨 **Beautiful Styling & Visualization**
- **Three styling APIs** - chainable, template literals, and inline syntax
- **Rich colors & themes** with automatic terminal detection
- **Visual elements** - tables, progress bars, headers, diffs

### ⚡ **High Performance & Efficiency**
- **Perfect tree-shaking** - only pay for what you use
- **Zero overhead** sync logging by default
- **AsyncLogger with explicit backpressure** - production-ready async logging
- **Unified import API** - seamless Logger and AsyncLogger experience

### 🛡️ **Production-Ready Security & Operations**
- **Integrated utilities** - rate limiting, PII redaction, sampling, queue management
- **Explicit backpressure handling** - never silently drop logs
- **PII protection** with comprehensive redaction patterns
- **Sampling & rate limiting** to control costs and volume

### 🔌 **Enterprise Integration**
- **Enterprise transports** - Kafka, PostgreSQL, OTLP, S3, and more
- **Monitoring integration** - OpenTelemetry, metrics, health checks
- **Drop-in compatibility** with Winston/Bunyan/Pino
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

### AsyncLogger with Operational Utilities

For high-performance async logging with built-in operational capabilities:

```typescript
import { 
  createAsyncLogger, 
  Redactor, 
  RateLimiter 
} from 'magiclogger';

// Simple configuration with integrated utilities
const asyncLogger = createAsyncLogger({
  buffer: { size: 8192, flushInterval: 100 },
  
  // Built-in operational utilities
  redactor: { preset: 'strict' },                    // Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 },        // Rate limiting
  sampler: { rate: 0.1, strategy: 'adaptive' },     // 10% adaptive sampling
  
  // Observability
  onMetrics: (metrics) => {
    console.log(`Metric: ${metrics.type}, Count: ${metrics.count}`);
  },
  
  onFlush: async (entries) => {
    await transport.sendBatch(entries); // Your transport logic
  }
});

// Explicit backpressure handling - never lose visibility into failures
const result = asyncLogger.info('User login', { email: 'user@example.com' });
if (!result.success) {
  console.warn(`Log dropped: ${result.reason}`);
}

// Critical logging with retry mechanism
try {
  await asyncLogger.logCritical('error', 'System failure detected!');
} catch (error) {
  // Critical log failed after retries
  alerting.sendAlert('Logger failure', error);
}

// Backpressure monitoring
if (asyncLogger.isBackpressured()) {
  console.warn('Logger under pressure, throttling application');
}
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

### Unified API - Same Utilities Work in Both Loggers

```typescript
// Regular Logger with integrated utilities
const logger = new Logger({
  redactor: { preset: 'standard' },
  rateLimiter: { max: 100, window: 30000 },
  sampler: { rate: 1.0 }, // No sampling for regular logger
  
  transports: [new ConsoleTransport()]
});

logger.info('This is automatically redacted and rate limited');
// Both sync and async loggers support the same operational utilities!
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

## 🧱 Structured Logging

MagicLogger emits consistent JSON to transports.

### Input → Output Examples

```typescript
const logger = new Logger({ id: 'api', tags: ['service'] });

// 1. Metadata object
logger.info('User login', { userId: 'u_123', ip: '203.0.113.10' });

// 2. Error instance  
logger.error('Payment failed', new Error('Card declined'));

// 3. Mixed metadata and error
logger.error('DB query failed', {
  error: new Error('timeout'),
  query: 'SELECT * FROM users WHERE id = ?'
});
```

**Resulting JSON structure:**

```json
{
  "id": "1733938475123-abc123xyz",              
  "timestamp": "2025-08-14T12:34:35.123Z",       
  "timestampMs": 1765769675123,                   
  "level": "info",                               
  "message": "User login",                       
  "plainMessage": "User login",                  
  "loggerId": "api",                             
  "tags": ["service"],                  
  "context": { "userId": "u_123", "ip": "203.0.113.10" },
  "metadata": {
    "hostname": "my-host",                       
    "pid": 1234,                                  
    "platform": "linux",                         
    "nodeVersion": "v18.20.8"                    
  }
}
```

**Key Fields:**
- `message`: Final styled string for console
- `plainMessage`: ANSI-free version for non-TTY transports
- `context`: Your metadata object
- `metadata`: Automatic platform info (hostname, PID, etc.)
- `error`: Structured error with name, message, and stack

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

## 🚀 Enterprise Transports

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

## 🛡️ Production Features

### Sampling & Rate Limiting

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

### PII Redaction

```typescript
const logger = new Logger({
  redaction: {
    enabled: true,
    preset: 'strict', // 'minimal', 'standard', 'strict'
    patterns: [
      { name: 'api-key', pattern: /sk-[a-zA-Z0-9]{48}/g, replacement: 'sk-***' },
      { name: 'employee-id', pattern: /EMP\d{6}/g, replacement: 'EMP******' }
    ],
    fields: ['password', 'token', 'secret', 'creditCard']
  }
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

### Queue Management

```typescript
const logger = new Logger({
  queue: {
    maxSize: 10000,
    dropPolicy: 'tail', // 'head', 'priority', 'random'
    priorityFn: (entry) => entry.level === 'error' ? 1 : 0,
    onDrop: (entries) => {
      console.warn(`Dropped ${entries.length} log entries`);
      metrics.increment('logs.dropped', entries.length);
    }
  }
});
```

---

## 📊 Monitoring & Health

### Transport Health Monitoring

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

### Sync vs Async: Choosing the Right Mode

**Default (Synchronous) Logger:**
- ✅ Immediate output - see logs instantly
- ✅ No log loss on crash
- ✅ Simple debugging
- ⚠️ Blocks on I/O (7,586 ops/sec)
- **Best for**: Development, debugging, CLIs, moderate traffic

**AsyncLogger:**
- ✅ Non-blocking (103,327 ops/sec - **13x faster**)
- ✅ Automatic batching
- ✅ Explicit backpressure handling
- ⚠️ Requires shutdown handling
- ⚠️ Potential log loss on ungraceful exit
- **Best for**: Production services, high-throughput applications

**Quick Decision Guide:**
```javascript
// Development or need immediate feedback?
const logger = new Logger();

// Production service with high volume?
const logger = createAsyncLogger({ 
  onFlush: async (entries) => await transport.sendBatch(entries)
});

// Want smart detection?
const logger = createSmartLogger({ target: 'auto' });

// Need both? Use hybrid approach:
const logger = new Logger({
  transports: [
    new ConsoleTransport(),           // Sync for errors
    new HTTPTransport({ batch: true }) // Async for remote logging
  ]
});
```

MagicLogger's performance varies by use case. For synchronous logging, other libraries excel, but MagicLogger's async implementation delivers superior throughput for high-volume scenarios.

### Benchmark Results

**Latest benchmark snapshot** (output suppressed, styled vs plain formatting):

<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 989.2 | 101,093 |
| Pino (Sync, Plain) | 100,000 | 1541.2 | 64,885 |
| Bunyan (Sync, Styled) | 100,000 | 1654.2 | 60,452 |
| Winston (Sync, Plain) | 100,000 | 1772.2 | 56,428 |
| Pino (Sync, Styled) | 100,000 | 2083.2 | 48,002 |
| Bunyan (Sync, Plain) | 100,000 | 2252.1 | 44,403 |
| MagicLogger (Sync, Styled) | 100,000 | 2462.7 | 40,606 |
| MagicLogger (Sync, Plain) | 100,000 | 3134.7 | 31,901 |
| Pino (Async, Plain) | 100,000 | 365.2 | 273,803 |
| Pino (Async, Styled) | 100,000 | 396.1 | 252,481 |
| MagicLogger (Async, Styled) | 100,000 | 506.5 | 197,436 |
| MagicLogger (Async, Plain) | 100,000 | 509.4 | 196,325 |
| Winston (Async, Styled) | 100,000 | 1388.7 | 72,009 |
| Winston (Async, Plain) | 100,000 | 1739.6 | 57,484 |

### Winners
- Sync Plain: Pino (Sync, Plain) (64,885 ops/sec) — MagicLogger: 31,901 ops/sec
- Sync Styled: Winston (Sync, Styled) (101,093 ops/sec) — MagicLogger: 40,606 ops/sec
- Async Plain: Pino (Async, Plain) (273,803 ops/sec) — MagicLogger: 196,325 ops/sec
- Async Styled: Pino (Async, Styled) (252,481 ops/sec) — MagicLogger: 197,436 ops/sec

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 40,606 ops/sec
  Winston (Sync, Styled): 101,093 ops/sec
  → MagicLogger is 2.49x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 197,436 ops/sec
  Pino (Async, Styled): 252,481 ops/sec
  → MagicLogger is 1.28x slower

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
*Table generated by `scripts/performance/perf-bench.ts`. External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.*


### Performance Insights

<!-- All performance insights and winners are now auto-generated below. See the Benchmark Results and Winners section for authoritative, up-to-date results. -->

### When to Choose Each Mode

**Use Synchronous (default Logger):**
- Development and debugging
- CLI tools and scripts
- Test environments
- When log order must match execution order
- Applications with < 1000 logs/second

**Use Asynchronous (AsyncLogger):**
- Production microservices
- High-throughput applications (> 1000 logs/second)
- When blocking I/O is unacceptable
- Batch processing systems
- When you can handle graceful shutdown

**Hybrid Approach:**
```javascript
// Critical logs sync, bulk logs async
logger.error('CRITICAL: Database down'); // Goes to ConsoleTransport (sync)
logger.info('Request processed'); // Goes to HTTPTransport (batched)
```

### Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core only | 37 kB |
| Core + Console | 37 kB |
| Core + All transports | 45.4 kB |
| Compatibility layers | 43.8 kB |

---

## 🎯 Real-World Examples

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
| `index.cjs` | CJS | 8.68 kB | 2.06 kB |
| `index.js` | ESM | 5.52 kB | 1.76 kB |
| `index.d.ts` | Types | 127 kB | 25.3 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 48.3 kB |
| core + console (esm, gzip) | 48.3 kB |
| core + all core transports (esm, gzip) | 56.6 kB |
| all compatibility layers (esm, gzip) | 45.8 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 8.56 kB | 2.06 kB |
| `index.js` | ESM | 5.44 kB | 1.75 kB |
| `index.d.ts` | Types | 127 kB | 25.3 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 48.3 kB |
| core + console (esm, gzip) | 48.3 kB |
| core + all core transports (esm, gzip) | 56.6 kB |
| all compatibility layers (esm, gzip) | 45.8 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 7.66 kB | 1.77 kB |
| `index.js` | ESM | 4.59 kB | 1.47 kB |
| `index.d.ts` | Types | 125 kB | 24.9 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 48.1 kB |
| core + console (esm, gzip) | 48.1 kB |
| core + all core transports (esm, gzip) | 56.5 kB |
| all compatibility layers (esm, gzip) | 45.8 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 7.66 kB | 1.77 kB |
| `index.js` | ESM | 4.59 kB | 1.47 kB |
| `index.d.ts` | Types | 125 kB | 24.9 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 48.1 kB |
| core + console (esm, gzip) | 48.1 kB |
| core + all core transports (esm, gzip) | 56.5 kB |
| all compatibility layers (esm, gzip) | 45.8 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 6.57 kB | 1.52 kB |
| `index.js` | ESM | 3.59 kB | 1.23 kB |
| `index.d.ts` | Types | 124 kB | 24.6 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 47.8 kB |
| core + console (esm, gzip) | 47.8 kB |
| core + all core transports (esm, gzip) | 56.2 kB |
| all compatibility layers (esm, gzip) | 45.8 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 3.03 kB | 723 B |
| `index.js` | ESM | 1.36 kB | 519 B |
| `index.d.ts` | Types | 113 kB | 21.9 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 38 kB |
| core + console (esm, gzip) | 38 kB |
| core + all core transports (esm, gzip) | 46.4 kB |
| all compatibility layers (esm, gzip) | 44.9 kB |

*Generated via `scripts/analyze-build.js`.*