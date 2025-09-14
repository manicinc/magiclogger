# MagicLogger

<p align="center">
  <img src="website/static/img/magiclog-primary-no-subtitle-transparent-4x.png" alt="MagicLog" width="520"/>
</p>

<p align="center">
  <a href="https://magiclog.io"><strong>🌐 Documentation & Website</strong></a> • 
  <a href="https://magiclog.io/api/"><strong>📚 API Reference</strong></a>
</p>

<p align="center">
  <!-- Bundle Sizes -->
  <img src="https://img.shields.io/badge/core_gzip-36kb-brightgreen.svg" alt="core_gzip">
  <img src="https://img.shields.io/badge/core_console_gzip-36kb-brightgreen.svg" alt="core_console_gzip">
  <img src="https://img.shields.io/badge/core_transports_gzip-41kb-brightgreen.svg" alt="core_transports_gzip">
</p>

<p align="center">
  <!-- CI/CD Status -->
  <a href="https://github.com/manicinc/magiclogger/actions/workflows/ci.yml"><img src="https://github.com/manicinc/magiclogger/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI"></a>
  <a href="https://github.com/manicinc/magiclogger/actions/workflows/releases.yml"><img src="https://github.com/manicinc/magiclogger/actions/workflows/releases.yml/badge.svg?branch=master" alt="Release"></a>
  <a href="https://github.com/manicinc/magiclogger/actions/workflows/deploy-docs.yml"><img src="https://github.com/manicinc/magiclogger/actions/workflows/deploy-docs.yml/badge.svg?branch=master" alt="Docs"></a>
  <br />
  <!-- Project Stats -->
  <a href="https://github.com/manicinc/magiclogger"><img src="https://img.shields.io/github/stars/manicinc/magiclogger?style=social" alt="GitHub Stars"></a>
  <img src="https://img.shields.io/npm/v/magiclogger" alt="npm version">
  <a href="https://codecov.io/gh/manicinc/magiclogger"><img src="https://codecov.io/gh/manicinc/magiclogger/branch/master/graph/badge.svg" alt="codecov"/></a>
  <br />
  <!-- Tech Stack -->
  <img src="https://img.shields.io/badge/typescript-100%25-blue" alt="TypeScript"> 
  <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js"> 
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

## 🎬 See MagicLogger in Action

<p align="center">
  <img src="https://raw.githubusercontent.com/manicinc/magiclogger/master/website/static/img/magiclogger-terminal-demo.gif" alt="MagicLogger Terminal Demo" width="100%" style="max-width: 800px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
</p>

## 🚀 Universal Color Logging Standard

**MagicLogger** is a TypeScript logger built on a [universal color logging standard](https://github.com/manicinc/magiclogger/blob/master/docs/magic-schema.md) that preserves styled text across any language, transport, or platform.

Traditional prod environments suppress / strip styling / pretty print in logs, dropping presumed unnecessary bundling and load.

Using this library generally means you're okay with these assumptions:

  - Storage is cheap, some extra kb in many web apps makes little difference (if you don't care about an image being 1.1 vs 1.0 mb this likely applies)
  - Some logs sent in production will require human review consistently
  - When you analyze logs at a high-level you want to have a visually appealing experience

Those most interested in using this might be small teams without enterprise logging, managing many services where a dashboard that shows aggregated streams beautifully will probably be rewarding.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styling APIs](#styling-apis)
- [Key Features](#key-features)
- [MAGIC Schema](#magic-schema)
- [Transports](#transports)
- [Advanced Features](#advanced-features)
- [Theming & Custom Colors](#-theming--custom-colors)
- [Context & Tags](#-context--tags)
- [Validation & Schema Enforcement](#️-validation--schema-enforcement)
- [Performance](#performance)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)


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

// Logger with automatic console transport (enabled by default)
const logger = new Logger({
  useConsole: true,   // Console transport is enabled by default (can be disabled with false)
  useColors: true,    // Enable colored output (default: true)
  verbose: false      // Show debug messages (default: false)
});

// Or simply use with defaults - console is automatically enabled
const logger = new Logger();  // Console transport created automatically

// Sync logger - blocking I/O for guaranteed delivery
// Uses SyncFileTransport with intelligent batching for performance
// Only use for audit logs or when absolute write guarantees are required
const auditLogger = new SyncLogger({ 
  file: './audit.log',     // Uses SyncFileTransport automatically
  forceFlush: true         // Immediate flush for critical logs
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

#### Batching Architecture
MagicLogger uses an intelligent adaptive batching strategy:

**Adaptive Batching**
- **Low volume**: Immediate dispatch (no buffering delay)
- **High volume**: Batch up to 100 entries or 10ms timeout
- **Fast path**: Direct transport calls when workers are disabled

**Performance Tuning for AsyncLogger**

```typescript
// Optimize for high-throughput plain text logging
const logger = new AsyncLogger({
  batchSize: 50,      // Smaller batches for fast-processing logs
  batchTimeout: 5,    // Shorter timeout (5ms) for quicker flushing
  transports: [...]
});

// Optimize for styled/complex logging
const logger = new AsyncLogger({
  batchSize: 100,     // Larger batches work well with slower processing
  batchTimeout: 10,   // Default 10ms timeout for styled output
  transports: [...]
});

// Optimize for lowest latency (real-time)
const logger = new AsyncLogger({
  batchSize: 1,       // No batching
  batchTimeout: 0,    // Immediate flush
  transports: [...]
});
```

**Transport-Level Optimization**

```typescript
// Transport batching happens automatically for network transports
const httpTransport = new HTTPTransport({
  batch: { size: 100, timeout: 5000 }  // Batch 100 logs or flush every 5s
});
```

**Other Performance Architectural Decisions**:
- **Ring buffer**: Lock-free circular buffer prevents memory allocation in hot path
- **Timestamp caching**: 10ms cache window with microsecond increments (avoids Date.now() syscalls)
- **Style fast-path**: Plain text skips regex parsing entirely

## MAGIC Schema - Universal Styled Logging Standard

The **[MAGIC Schema](./docs/magic-schema.md)** is a universal JSON format that preserves text styling across any language, transport, or platform. Any language can produce MAGIC-compliant logs that MagicLogger (or any MAGIC-compatible system) can ingest and display with full color preservation.

### The MAGIC Schema provides:

- **Style Preservation**: Colors and formatting survive serialization as structured data
- **Language Agnostic**: Any language can implement the MAGIC producer specification
- **Ingestion Ready**: MagicLogger can consume logs from any MAGIC-compliant source
- **Consistent Structure**: Same JSON format across all languages and transports
- **OpenTelemetry Ready**: Direct compatibility with OTLP (OpenTelemetry Protocol)
- **Distributed Tracing**: Built-in W3C Trace Context support
- **Rich Metadata**: Automatic capture of system, process, and environment info

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
  "message": "User authenticated",      // Plain text message
  "styles": [[0, 4, "green.bold"]],     // Preserved styling info
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

**Full Documentation**: See the [MAGIC Schema Specification](./docs/magic-schema.md) for complete field definitions, examples, and integration guides.

## 🌍 Cross-Language SDK Compatibility

### The MAGIC Format Specification

The MAGIC Schema is an open specification that any language can implement:

```json
{
  "id": "unique-identifier",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "timestampMs": 1705316400000,
  "level": "info|warn|error|debug|trace|fatal",
  "message": "Plain text without formatting",
  "styles": [
    [0, 6, "red.bold"],      // Apply red.bold to characters 0-6
    [12, 28, "cyan"]         // Apply cyan to characters 12-28
  ]
}
```

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger();

// Input with styles
logger.error('<red.bold>Error:</> Database <yellow>timeout</>');

// Outputs MAGIC JSON
{
  "message": "Error: Database timeout",
  "styles": [[0, 6, "red.bold"], [16, 23, "yellow"]],
  // ... other fields
}

// Can reconstruct styled output
import { applyStyles } from 'magiclogger';
const styled = applyStyles(entry.message, entry.styles);
console.log(styled); // Shows with colors!
```

### MAGIC Compliance Requirements

For a logger to be MAGIC-compliant, it must:

1. **Output Valid MAGIC Schema JSON**
   ```json
   {
     "message": "Error: Database connection failed",
     "styles": [[0, 6, "red.bold"], [7, 35, "yellow"]],
     "level": "error",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

2. **Preserve Style Information**
   - Extract styles from markup (e.g., `<red>text</>`)
   - Store as `[startIndex, endIndex, style]` tuples
   - Keep plain text in `message` field

3. **Include Required Fields**
   - `id`, `timestamp`, `level`, `message`
   - Optional but recommended: `service`, `environment`, `trace`

## Transports

### Core Transports

```typescript
import { 
  ConsoleTransport,
  FileTransport,       // High-performance sonic-boom (default)
  WorkerFileTransport, // Worker thread isolation
  SyncFileTransport,   // Synchronous with buffering
  HTTPTransport,
  WebSocketTransport
} from 'magiclogger/transports';

// Logger automatically uses high-performance file transport
const logger = new Logger({
  file: './logs/app.log'  // Uses FileTransport (sonic-boom) automatically
});

// Or explicitly configure transports
const logger = new Logger({
  transports: [
    // Console with colors (optional - added by default if no transports specified)
    new ConsoleTransport({ useColors: true }),
    
    // FileTransport - recommended default (sonic-boom)
    new FileTransport({ 
      filepath: './logs/app.log',
      minLength: 4096,  // Buffer size before auto-flush
      maxWrite: 16384   // Max bytes per write
    }),
    
    // HTTP with batching
    new HTTPTransport({ 
      url: 'https://logs.example.com',
      batch: { size: 100, timeout: 5000 }
    })
  ]
});
```

### Advanced Transports

These are optional dependencies.

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

### Console Transport Behavior

By default, MagicLogger automatically creates a console transport unless explicitly disabled:

```typescript
// Default behavior - console transport is automatically created
const logger = new Logger();  // Console output enabled

// Explicitly disable console for file-only logging (better performance)
const fileOnlyLogger = new Logger({
  useConsole: false,  // Disable automatic console transport
  transports: [
    new FileTransport({ 
      filepath: './app.log',
      buffer: { size: 1000 }  // Buffer for better write performance
    })
  ]
});

// Production setup - disable console
const prodLogger = new Logger({
  useConsole: false,  // No console overhead in production
  transports: [
    new HTTPTransport({ 
      url: process.env.LOG_ENDPOINT,
      batch: { size: 1000, timeout: 10000 }
    }),
    new S3Transport({ 
      bucket: 'logs',
      compress: true
    })
  ]
});
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

## 🎨 Theming & Custom Colors

### Theme System

MagicLogger's theme system provides consistent, semantic styling across your application. 

#### Built-in Themes

```typescript
const logger = new Logger({ theme: 'ocean' });
// Available themes: ocean, forest, sunset, minimal, cyberpunk, dark, default

// Each theme provides consistent colors for semantic log types
logger.info('Information');     // Themed as info style
logger.success('Completed');    // Themed as success style
logger.warning('Caution');      // Themed as warning style
logger.error('Failed');         // Themed as error style
```

#### Custom Theme Definition

```typescript
const logger = new Logger({
  theme: {
    // Log level styles
    info: ['cyan'],
    success: ['green', 'bold'],
    warning: ['yellow'],
    error: ['red', 'bold'],
    debug: ['gray', 'dim'],
    
    // UI element styles
    header: ['brightWhite', 'bold', 'underline'],
    footer: ['gray', 'dim'],
    separator: ['blue'],
    highlight: ['brightYellow', 'bold'],
    muted: ['gray', 'dim'],
    
    // Custom semantic styles
    api: ['cyan', 'bold'],
    database: ['yellow'],
    cache: ['magenta'],
    network: ['blue'],
    security: ['red', 'bold', 'underline']
  }
});
```

#### Tag-Based Theming

Combine themes with tags for automatic styling based on log categories:

```typescript
const logger = new Logger({
  theme: {
    tags: {
      'api': ['cyan', 'bold'],
      'api.request': ['cyan'],
      'api.response': ['brightCyan'],
      'database': ['yellow'],
      'database.query': ['yellow', 'dim'],
      'database.error': ['red', 'bold'],
      'security': ['red', 'bold', 'bgYellow'],
      'performance': ['magenta', 'bold']
    }
  }
});

// Tags automatically apply themed styles
logger.info('Request received', { tags: ['api', 'api.request'] });
logger.error('Query timeout', { tags: ['database', 'database.error'] });
logger.warn('Unauthorized access attempt', { tags: ['security'] });
```

### Custom Colors (Advanced)

MagicLogger supports custom color registration for brand-specific palettes and advanced terminal features.

#### Registering Custom Colors

```typescript
// Register individual custom color
logger.registerCustomColor('brandPrimary', {
  hex: '#FF5733',        // 24-bit RGB color (for modern terminals)
  fallback: 'orange'     // Required fallback for limited terminals
});

// Register multiple custom colors
logger.registerCustomColors({
  // Using RGB values
  brandBlue: { 
    rgb: [51, 102, 255],
    fallback: 'blue',
    description: 'Primary brand blue'
  },
  
  // Using 256-color palette
  darkOlive: { 
    code256: 58,        // 256-color palette code
    fallback: 'green',
    description: 'Secondary accent color'
  },
  
  // Direct ANSI sequence (advanced)
  brandGradient: {
    ansi: '\x1b[38;2;255;87;51m', // Direct ANSI escape
    fallback: 'red'
  }
});
```

#### Using Custom Colors

```typescript
// In themes
logger.setTheme({
  header: ['brandPrimary', 'bold'],
  success: ['brandBlue'],
  accent: ['darkOlive', 'italic']
});

// With style factories
const brand = logger.color('brandPrimary', 'bold');
const accent = logger.color('darkOlive');

logger.info(`Welcome to ${brand('Our Product')} - ${accent('v2.0')}`);

// In styled messages
logger.info('<brandPrimary.bold>Important:</> Check the <brandBlue>dashboard</>');
```

## 📊 Context & Tags

MagicLogger provides powerful context and tagging features for structured logging, enabling better log organization, filtering, and analysis.

### Context - Structured Metadata

Context allows you to attach structured data to log entries, providing rich metadata for debugging and monitoring.

#### Global vs Per-Log Context

```typescript
// Global context - applied to all logs from this logger
const logger = new Logger({
  id: 'payment-service',
  context: {
    service: 'payment-api',
    version: '2.1.0',
    environment: process.env.NODE_ENV,
    region: 'us-east-1',
    instanceId: process.env.INSTANCE_ID
  }
});

// Per-log context - specific to individual log entries
logger.info('Payment processed', {
  orderId: 'ORD-12345',
  customerId: 'CUST-67890',
  amount: 99.99,
  currency: 'USD',
  processingTime: 145,
  paymentMethod: 'credit_card'
});

// Context merging - per-log overrides global
logger.info('Special payment', {
  amount: 199.99,
  version: '2.2.0',  // Overrides global version
  promotional: true   // Adds new field
});
```

#### Using the meta() Helper

When using console-like variadic arguments, wrap context to prevent it from being printed:

```typescript
import { meta } from 'magiclogger';

// Without meta() - context gets printed to console
logger.info('User logged in', { userId: '123' });
// Output: User logged in { userId: '123' }

// With meta() - context is attached but not printed
logger.info('User logged in', meta({ userId: '123' }));
// Output: User logged in
// Context still available in structured output/transports
```

#### Advanced Context Management

```typescript
import { ContextManager } from 'magiclogger';

const contextManager = new ContextManager({
  // Auto-redact sensitive fields
  sensitiveKeys: ['password', 'token', 'ssn', 'creditCard'],
  
  // Transform nested keys to flat structure
  transformRules: {
    'user.id': 'userId',
    'request.id': 'requestId',
    'response.time': 'responseTime'
  },
  
  // Validation rules
  maxDepth: 3,
  maxSize: 1000, // bytes
  forbidden: ['__proto__', 'constructor']
});

// Sanitize sensitive data automatically
const userContext = {
  userId: '123',
  email: 'user@example.com',
  password: 'secret123',  // Will be redacted
  creditCard: '4111111111111111'  // Will be redacted
};

const sanitized = contextManager.sanitize(userContext);
// Result: { 
//   userId: '123', 
//   email: 'user@example.com', 
//   password: '***', 
//   creditCard: '***' 
// }
```

#### Audit-ready Logging

MagicLogger's default logging is high-performance (~100k+ ops/second styled with full structured logs) due to a ring buffer architecture that drops older logs under excessive load, as well as a internal datetime mechanism that caches timestamps every 10ms and uses a queue to keep the logs in the correct order and with unique times.

**For critical logs that must never be lost, or logs that must have completely accurate timestamps, use `SyncLogger`**:

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

### Tags - Categorical Labels

Tags are simple string labels for categorizing and filtering logs, enabling powerful log organization and styling.

#### Basic Tag Usage

```typescript
// Global tags - applied to all logs
const logger = new Logger({
  tags: ['api', 'production', 'v2']
});

// All logs include these tags
logger.info('Server started');  // Tags: ['api', 'production', 'v2']
logger.error('Database error'); // Tags: ['api', 'production', 'v2']

// Per-log tags - additional categorization
logger.info('User authenticated', { 
  tags: ['auth', 'oauth', 'google'] 
});
// Combined tags: ['api', 'production', 'v2', 'auth', 'oauth', 'google']
```

#### Hierarchical Tags

MagicLogger supports hierarchical tag organization using both dot notation and explicit parent-child relationships:

```typescript
const logger = new Logger({
  tags: ['api.v2']
});

// Dot notation - automatic hierarchy
logger.info('Database query', {
  tags: ['database.query.select', 'performance.slow']
});

// Results in tags that can be filtered at any level:
// - 'api.v2' (matches: api, api.v2)
// - 'database.query.select' (matches: database, database.query, database.query.select)
// - 'performance.slow' (matches: performance, performance.slow)

// Explicit parent-child relationships
logger.info('User action', {
  tags: [
    { name: 'user', children: ['auth', 'profile'] },
    { name: 'api', children: ['request', 'response'] }
  ]
});
// Generates: ['user', 'user.auth', 'user.profile', 'api', 'api.request', 'api.response']

// Path-based tag generation
import { TagManager } from 'magiclogger';
const tagManager = new TagManager();

// Generate from file paths
const tags = tagManager.fromPath('src/services/payment/stripe.ts');
// Result: ['src', 'src.services', 'src.services.payment', 'src.services.payment.stripe']

// Generate from class/method names
const methodTags = tagManager.fromMethod('PaymentService', 'processRefund');
// Result: ['PaymentService', 'PaymentService.processRefund']
```

##### Hierarchical Transport Filtering

Filter logs at transport level based on tag hierarchy:

```typescript
const logger = new Logger({
  transports: [
    {
      type: 'file',
      path: './app.log',
      filter: (entry) => {
        // Include all API-related logs
        return entry.tags?.some(tag => 
          tag.startsWith('api.') || tag === 'api'
        );
      }
    },
    {
      type: 'file', 
      path: './errors.log',
      filter: (entry) => {
        // Only error and security tags
        return entry.tags?.some(tag =>
          tag.includes('error') || tag.startsWith('security.')
        );
      }
    }
  ]
});
```

##### Hierarchical Theme Selection

Apply styles based on tag hierarchy with cascading rules:

```typescript
const logger = new Logger({
  theme: {
    tags: {
      // Base styles
      'api': ['cyan'],
      'database': ['yellow'],
      'security': ['red', 'bold'],
      
      // More specific styles override base
      'api.error': ['red', 'bold'],
      'api.success': ['green'],
      'database.slow': ['yellow', 'bold', 'bgRed'],
      'security.breach': ['red', 'bold', 'underline', 'bgYellow'],
      
      // Wildcards for pattern matching
      '*.error': ['red'],
      'performance.*': ['magenta'],
      '*.slow': ['bold', 'bgYellow']
    }
  }
});

// Theme selection follows specificity
logger.error('Auth failed', { tags: ['api.error'] });        // Uses 'api.error' style
logger.warn('Slow query', { tags: ['database.slow'] });      // Uses 'database.slow' style
logger.info('Request', { tags: ['api.request'] });           // Falls back to 'api' style
```

#### Tag-Based Styling

Combine tags with themes for automatic visual categorization:

```typescript
const logger = new Logger({
  theme: {
    tags: {
      // Exact match
      'error': ['red', 'bold'],
      'warning': ['yellow'],
      'success': ['green', 'bold'],
      
      // Hierarchical matching
      'api': ['cyan', 'bold'],
      'api.request': ['cyan'],
      'api.response': ['brightCyan'],
      'api.error': ['red', 'bold'],
      
      // Category styling
      'database': ['yellow'],
      'database.slow': ['yellow', 'bold', 'bgRed'],
      'cache': ['magenta'],
      'security': ['red', 'bold', 'underline']
    }
  }
});

// Automatic styling based on tags
logger.info('Request received', { tags: ['api.request'] });    // Cyan
logger.warn('Slow query', { tags: ['database.slow'] });        // Yellow on red
logger.error('Auth failed', { tags: ['security', 'api.error'] }); // Red, bold, underline
```

#### Using TagManager

```typescript
import { TagManager } from 'magiclogger';

const tagManager = new TagManager();

// Generate tags from file paths
const tags = tagManager.fromPath('src/api/v2/users/create.ts');
// Result: ['src', 'api', 'v2', 'users', 'create']

// Normalize and validate tags
const normalized = tagManager.normalize(['API', 'User-Auth', 'OAuth/2.0']);
// Result: ['api', 'user-auth', 'oauth-2-0']

// Filter logs by tags
const logs = [/* array of log entries */];
const apiLogs = logs.filter(log => 
  tagManager.matches(log.tags, 'api.*')
);
```

Define context types for consistency.

```typescript
interface RequestContext {
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  duration?: number;
}

const logger = new Logger<RequestContext>();
logger.info('Request completed', {
  requestId: 'req-123',
  method: 'GET',
  path: '/api/users',
  duration: 45
});
```

### Pretty Printing Objects

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

## 🛡️ Validation & Schema Enforcement

MagicLogger provides comprehensive validation for both context and tags, ensuring data quality and preventing malformed logs from polluting your logging infrastructure.

### Schema Validation

Define schemas to enforce structure and types for your log data:

```typescript
import { Logger, ContextManager, TagManager } from 'magiclogger';
import type { ObjectSchema } from 'magiclogger/validation';

// Define a schema for context validation
const contextSchema: ObjectSchema = {
  type: 'object',
  properties: {
    userId: { 
      type: 'string', 
      format: 'uuid',
      optional: false 
    },
    email: { 
      type: 'string', 
      format: 'email',
      transform: (v) => v.toLowerCase() 
    },
    age: { 
      type: 'number', 
      min: 0, 
      max: 150 
    },
    roles: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    },
    metadata: {
      type: 'object',
      additionalProperties: true
    }
  },
  required: ['userId', 'email']
};

// Configure validation behavior
const contextManager = new ContextManager({
  schema: contextSchema,
  schemaValidationMode: 'warn',  // 'throw' | 'warn' | 'silent'
  enableValidation: true
});
```

### Validation Modes

Control how validation failures are handled:

```typescript
// Strict mode - throws errors on validation failure
const strictLogger = new Logger({
  contextManager: new ContextManager({
    schema: userSchema,
    schemaValidationMode: 'throw'  // Fails fast
  })
});

// Warning mode - logs warnings but continues
const warnLogger = new Logger({
  contextManager: new ContextManager({
    schema: userSchema,
    schemaValidationMode: 'warn'   // Logs warnings to console
  })
});

// Silent mode - silently drops invalid data
const silentLogger = new Logger({
  contextManager: new ContextManager({
    schema: userSchema,
    schemaValidationMode: 'silent'  // No errors or warnings
  })
});
```

### Validation Events

Listen to validation events for custom handling:

```typescript
const contextManager = new ContextManager({
  schema: contextSchema,
  schemaValidationMode: 'silent'
});

// Listen for validation failures
contextManager.on('schemaValidationFailed', ({ result, context }) => {
  // Custom handling - send to error tracking
  errorTracker.report('Invalid log context', {
    errors: result.errors,
    context: context
  });
  
  // Or increment metrics
  metrics.increment('logs.validation.failed', {
    errorCount: result.errors.length
  });
});

// Listen for successful validations
contextManager.on('validated', (context) => {
  metrics.increment('logs.validation.success');
});
```

### Built-in Validation Rules

#### Context Validation

```typescript
const contextManager = new ContextManager({
  // Structure limits
  maxDepth: 5,           // Maximum nesting depth
  maxProperties: 50,     // Maximum properties per object
  
  // Security
  sanitizeMode: 'strict', // Remove sensitive data
  freezeContext: true,    // Prevent mutations
  
  // Custom validation rules
  enableValidation: true
});

// Set validation rules programmatically
contextManager.setValidationRules({
  required: ['requestId', 'userId'],
  types: {
    requestId: 'string',
    userId: 'string',
    timestamp: 'number',
    success: 'boolean'
  },
  custom: (context) => {
    // Custom validation logic
    if (context.userId && context.userId === 'admin') {
      return context.adminToken !== undefined;
    }
    return true;
  }
});
```

#### Tag Validation

```typescript
const tagManager = new TagManager({
  maxTags: 10,           // Maximum number of tags
  maxTagLength: 50,      // Maximum length per tag
  allowedPattern: /^[a-z0-9.-]+$/,  // Regex pattern
  
  // Schema for structured tags
  schema: {
    type: 'array',
    items: {
      type: 'string',
      pattern: /^[a-z]+(\.[a-z]+)*$/,  // Hierarchical pattern
      maxLength: 50
    },
    maxItems: 10,
    uniqueItems: true
  },
  schemaValidationMode: 'warn'
});
```

### Schema Types

MagicLogger supports comprehensive schema types:

```typescript
// String validation
const stringSchema = {
  type: 'string',
  minLength: 3,
  maxLength: 100,
  pattern: /^[A-Z]/,        // Must start with capital
  format: 'email',          // Predefined formats
  enum: ['admin', 'user'],  // Allowed values
  trim: true,               // Auto-trim whitespace
  toLowerCase: true         // Auto-lowercase
};

// Number validation
const numberSchema = {
  type: 'number',
  min: 0,
  max: 100,
  integer: true,           // Must be integer
  positive: true,          // Must be positive
  multipleOf: 5            // Must be multiple of 5
};

// Array validation
const arraySchema = {
  type: 'array',
  items: { type: 'string' },
  minItems: 1,
  maxItems: 10,
  uniqueItems: true        // No duplicates
};

// Object validation
const objectSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name'],
  additionalProperties: false,  // No extra props
  minProperties: 1,
  maxProperties: 10
};

// Union types
const unionSchema = {
  type: 'union',
  schemas: [
    { type: 'string' },
    { type: 'number' }
  ]
};
```

### Sanitization

Automatic sanitization of sensitive data:

```typescript
const contextManager = new ContextManager({
  sanitizeMode: 'strict',  // 'none' | 'basic' | 'strict' | 'custom'
  
  // Custom sanitization function
  sanitize: (value) => {
    if (typeof value === 'string') {
      // Redact credit card numbers
      return value.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
    }
    return value;
  }
});

// Automatic sensitive key detection
const context = {
  userId: '123',
  password: 'secret123',      // Automatically redacted
  creditCard: '4111-1111-1111-1111',  // Automatically redacted
  apiToken: 'xyz789',          // Automatically redacted
  data: 'safe-data'
};

// Result after sanitization:
// {
//   userId: '123',
//   password: '***',
//   creditCard: '***',
//   apiToken: '***',
//   data: 'safe-data'
// }
```
Validation is designed to be efficient and tree-shakeable, its components loaded only when schemas are defined.

### Best Practices

1. **Use appropriate validation modes**:
   - `throw` for development and testing
   - `warn` for staging environments  
   - `silent` for production (with event listeners)

2. **Define schemas at initialization**:
   ```typescript
   // Good - schema defined once
   const schema = { /* ... */ };
   const logger = new Logger({ contextManager: new ContextManager({ schema }) });
   
   // Avoid - schema defined per log
   logger.info('message', validateSchema({ /* ... */ }));
   ```

3. **Monitor validation failures**:
   ```typescript
   contextManager.on('schemaValidationFailed', ({ result }) => {
     monitoring.recordValidationFailure(result.errors);
   });
   ```

4. **Use transforms for data normalization**:
   ```typescript
   const schema = {
     type: 'object',
     properties: {
       email: {
         type: 'string',
         transform: (v) => v.toLowerCase().trim()
       },
       timestamp: {
         type: 'number',
         transform: (v) => Math.floor(v)  // Remove decimals
       }
     }
   };
   ```

5. **Combine with TypeScript for compile-time safety**:
   ```typescript
   interface UserContext {
     userId: string;
     email: string;
     roles: string[];
   }
   
   const logger = new Logger<UserContext>();
   // TypeScript ensures compile-time type safety
   // Schema ensures runtime validation
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

## ⚡ Performance

### Real-World Benchmarks

MagicLogger delivers **competitive performance** with flexible architecture:
- **125K ops/sec plain text (sync)** - Excellent for guaranteed delivery
- **56K ops/sec styled (async)** - 4x faster than sync for styled output
- **0.010ms latency (async)** - Non-blocking with minimal overhead
- **Sonic-boom powered** - Same I/O engine as Pino

#### Performance Comparison (20K iterations, real file I/O)

##### 📝 Plain Text Performance
| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino | 333,417 | 0.003 | 0.001 | 0.006 | 0.012 | 2.559 |
| Winston | 228,578 | 0.004 | 0.001 | 0.007 | 0.037 | 6.131 |
| **MagicLogger (Sync)** | **169,258** | **0.006** | 0.001 | 0.004 | 0.007 | 7.326 |
| **MagicLogger (Async)** | **165,327** | **0.006** | 0.000 | 0.001 | 0.313 | 3.093 |

> **Note**: AsyncLogger now matches SyncLogger performance through optimized batching with deferred processing.

##### 🎨 Styled Output Performance
| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino (Pretty) | 340,501 | 0.003 | 0.002 | 0.003 | 0.008 | 0.121 |
| Pino (ANSI Async) | 276,912 | 0.003 | 0.003 | 0.004 | 0.008 | 5.122 |
| **MagicLogger (Async + Styles)** | **263,268** | **0.004** | 0.000 | 0.001 | 0.185 | 2.160 |
| Winston (Styled) | 241,623 | 0.004 | 0.001 | 0.010 | 0.039 | 6.222 |
| MagicLogger (Sync + Styles)* | 31,243 | 0.032 | 0.010 | 0.027 | 0.082 | 48.944 |

> **Async Excellence**: AsyncLogger with styles (263K ops/sec) outperforms Winston and nearly matches Pino!
>
> *Sync styled logging is an unoptimized path (pre v1.0) for a niche use case.

*Generated via `npm run bench:perf` - see [scripts/performance/](./scripts/performance/) and [Performance Guide](./docs/performance-guide.md)*

#### Performance Insights

**When to Use Each Logger:**
- **AsyncLogger**: Best for production, non-blocking I/O
- **SyncLogger**: Best for audit logs requiring guaranteed delivery
- **Workers**: Almost never needed (only for extreme edge cases with CPU-bound operations)

**Our Optimizations:**
- **Deferred Processing**: Minimal object creation in hot path (784k ops/sec capability)
- **Smart Batching**: Default 100-log batches with 10ms timeout
- **Sonic-boom Integration**: Same async I/O engine as Pino

**Performance Tuning Notes:**
- **Styled logs may benchmark faster than plain text** due to batching efficiency - styled logs take longer to process, allowing better batch accumulation before flush
- **Plain text logs benefit from smaller batches** (50 logs, 5ms timeout) for optimal throughput
- **For lowest latency**, disable batching entirely (batchSize: 1, batchTimeout: 0)
- **Counter-based IDs**: 5x faster than Math.random()
- **Optimized MAGIC Schema**: 47% memory reduction
- **Timestamp Caching**: 10ms windows with microsecond increments

See [Performance Guide](./docs/performance-guide.md) for detailed analysis and configuration tips.

#### How Styling Works

**Default Mode (Logger/SyncLogger):**
- Style extraction happens in the **main thread** before sending to transports
- Uses optimized regex-based parsing to extract `<style>text</>` markup
- Produces plain text + style ranges array for the MAGIC schema
- LRU cache reduces repeated style generation overhead by 30-50%
- [Deep dive into our style optimization techniques →](./docs/performance-guide.md#our-optimizations)

**Worker Threads (rarely needed):**
- Workers are OFF by default - sonic-boom already provides async I/O
- IPC overhead usually exceeds any benefit for logging
- Only consider for extreme edge cases (e.g., ML-based log analysis)

**Architecture Choices:**
- **sonic-boom**: High-performance async file I/O with internal buffering
- **Fast Path Detection**: Unstyled text bypasses style processing entirely
- **Worker Pool Pattern**: Reusable worker threads when needed (avoids spawn overhead)

**Trade-offs:**
- **Sync Mode**: Guaranteed delivery but blocks event loop (162K ops/sec plain, 25K styled)
- **Async Mode**: Non-blocking with excellent styled performance (142K ops/sec)
- **Styling Benefit**: Async + styles is 5.5x faster than sync + styles

See [benchmark methodology](./scripts/performance/benchmark-results.md) and [architecture docs](./docs/architecture.md).

## API Reference

### Logger Options

```typescript
interface LoggerOptions {
  // Basic configuration
  id?: string;
  tags?: string[];
  context?: Record<string, unknown>;
  verbose?: boolean;
  useColors?: boolean;     // Enable colored output (default: true)
  useConsole?: boolean;     // Add console transport automatically (default: true, set to false to disable)
  
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

## Documentation

📚 **[View Documentation](https://manicinc.github.io/magiclogger)** | **[Getting Started](./docs/intro.md)** | **[API Reference](./docs/api-reference.md)**

```bash
npm run docs        # Start docs dev server with live reload
npm run docs:build  # Build production docs
```

For development setup and build instructions, see [Development Guide](./docs/development.md) and [Build Instructions](./docs/build_instructions.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/contributing.md) for guidelines.

## License

MIT © [Manic.agency](https://manic.agency)

---

<p align="center">
  Developed and sponsored by <a href="https://manic.agency">Manic.agency</a>
</p>

## 📦 Build Output Sizes

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 10.7 kB | 2.34 kB |
| `index.js` | ESM | 6.46 kB | 1.93 kB |
| `index.d.ts` | Types | 178 kB | 37.8 kB |

### Core Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core (bare minimum) | 43.3 kB |
| Core + Console Transport | 43.3 kB |
| Core + File Transport | 43.3 kB |
| Core + HTTP Transport | 45.9 kB |
| Core + All Basic Transports | 47.4 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 9.87 kB | 2.24 kB |
| `index.js` | ESM | 6.23 kB | 1.87 kB |
| `index.d.ts` | Types | 132 kB | 28.1 kB |

### Core Bundle Sizes (gzipped)

| Scenario | Size |
|----------|------|
| Core (bare minimum) | 37.1 kB |
| Core + Console Transport | 37.1 kB |
| Core + File Transport | 38.6 kB |
| Core + HTTP Transport | 39.7 kB |
| Core + All Basic Transports | 42.1 kB |

*Generated via `scripts/analyze-build.js`.*

