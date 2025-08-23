---
id: api_usage
title: Api_usage
---

# MagicLogger API Documentation

A comprehensive guide to using the MagicLogger API with transports, context, and rich formatting.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Logger Configuration](#logger-configuration)
- [Basic Logging](#basic-logging)
- [Context & Metadata](#context--metadata)
  - [Console-like Arguments and Meta Wrappers](#console-like-arguments-and-meta-wrappers)
- [Transports](#transports)
- [Advanced Logging](#advanced-logging)
- [Styling and Formatting](#styling-and-formatting)
  - [Built-in Formatters](#built-in-formatters)
- [File Operations](#file-operations)
- [Browser Operations](#browser-operations)
- [Progress Tracking](#progress-tracking)
- [Configuration Methods](#configuration-methods)
- [Available Colors and Styles](#available-colors-and-styles)
- [API Reference](#api-reference)

## Installation

```bash
npm install magiclogger
```

### Optional Dependencies

For specific transports, install the required dependencies:

```bash
# For S3 transport
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage

# For MongoDB transport
npm install mongodb

# For WebSocket transport (Node.js)
npm install ws

# For HTTP transport (Node.js)
npm install axios form-data
```

## Getting Started

### Synchronous Logger (Development/Simple Use Cases)

```typescript
import { Logger } from 'magiclogger';

// Create a logger with zero config (uses default console transport)
const logger = new Logger();

// Or with configuration
const logger = new Logger({
  id: 'my-service',
  tags: ['production', 'api'],
  context: {
    service: 'user-api',
    version: '1.2.3'
  }
});

// Basic logging
logger.info('Application started');
```

### High-Performance Async Logger (Production)

```typescript
import { createAsyncLogger } from 'magiclogger';

// Simple async logger with sensible defaults (like Pino)
const logger = createAsyncLogger({
  onFlush: async (entries) => {
    // Send batched entries to your destination
    await sendToElasticsearch(entries);
  }
});

// Use it just like sync logger
logger.info('Request received', { userId: 123 });
logger.error('Database error', { error: err });

// Default configuration includes:
// - 8KB ring buffer (8192 entries)
// - Auto-flush every 100ms or 1000 entries
// - Graceful backpressure handling
// - Returns AddResult for monitoring (never silently drops logs)

// Production with utilities
const prodLogger = createAsyncLogger({
  buffer: { size: 16384, flushInterval: 50 },
  redactor: { preset: 'strict' },           // Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 }, // Prevent flooding
  sampler: { rate: 0.1 },                    // Sample 10% in production
  onFlush: async (entries) => {
    await transport.sendBatch(entries);
  }
});

// Graceful shutdown (important!)
process.on('SIGTERM', async () => {
  await logger.flushAndWait();
  await logger.close();
  process.exit(0);
});
```

## Tree-Shakeable Transport Imports

MagicLogger is designed for optimal bundle sizes with tree-shakeable imports:

### Import Patterns

```typescript
// ✅ Main logger (always needed)
import { Logger } from 'magiclogger';

// ✅ Tree-shakeable transports (import only what you need)
import { 
  ConsoleTransport, 
  FileTransport, 
  HTTPTransport,
  S3Transport, 
  MongoDBTransport 
} from 'magiclogger/transports';

// ✅ Convenience factories (recommended)
import { 
  createConsole, 
  createFile, 
  createHTTP 
} from 'magiclogger/transports';
```

### Transport Categories

**Core Transports** (no external dependencies):
- `ConsoleTransport` - Terminal output with colors (~2KB)
- `FileTransport` - File logging with rotation (~3KB)  
- `StreamTransport` - Write to any Node.js stream (~1KB)
- `HTTPTransport` - REST API endpoints (~4KB)

**Optional Transports** (require external dependencies):
- `S3Transport` - AWS S3 logging (+~500KB aws-sdk)
- `MongoDBTransport` - MongoDB logging (+~2MB mongodb)
- `WebSocketTransport` - Real-time logging (+~50KB ws)

### Factory Functions

Convenience factories provide smart defaults and async initialization:

```typescript
import { createConsole, createFile, createHTTP } from 'magiclogger/transports';

const logger = new Logger();

// Auto-generated names, optimized configurations
logger.addTransport(await createConsole());                    // name: 'console'
logger.addTransport(await createFile('./logs/app.log'));       // name: 'file-app-log'
logger.addTransport(await createHTTP('https://api.logs.com')); // name: 'http-api.logs.com'
```

## Logger Configuration

### ExtendedLoggerOptions

```typescript
interface ExtendedLoggerOptions extends LoggerOptions {
  // Identity & Context
  id?: string;                      // Logger instance ID
  tags?: string[];                  // Global tags for all logs
  context?: Record<string, any>;    // Global context for all logs
  
  // Transports
  transports?: Transport[];         // Array of transports
  
  // Behavior
  verbose?: boolean;                // Show debug logs
  useColors?: boolean;              // Enable colors (console)
  theme?: string | ThemeDefinition; // Color theme
  
  // Advanced
  idGenerator?: () => string;       // Custom ID generator
  useLegacyOutput?: boolean;        // Use legacy console/file output
  
  // Legacy options (backward compatibility)
  writeToDisk?: boolean;            // Enable file logging
  logDir?: string;                  // Log directory
  logRetentionDays?: number;        // Days to retain logs
  storeInBrowser?: boolean;         // Enable browser storage
  maxStoredLogs?: number;           // Max logs in browser storage
  storageName?: string;             // Browser storage key name
}
```

### Quick Setup with createLogger

```typescript
import { createLogger } from 'magiclogger';

const logger = createLogger('my-service', {
  console: true,                    // or ConsoleTransportOptions
  file: './logs/app.log',          // or FileTransportOptions
  http: 'https://logs.example.com', // or HTTPTransportOptions
  s3: { bucket: 'my-logs' },       // S3TransportOptions
  mongodb: { url: 'mongodb://...' }, // MongoDBTransportOptions
  level: 'debug',
  tags: ['api', 'v2'],
  context: { region: 'us-east-1' }
});
```

## Basic Logging

All logging methods now accept an optional metadata parameter:

```typescript
// Simple messages
logger.info('User logged in');
logger.warn('High memory usage');
logger.error('Connection failed');
logger.debug('Cache hit ratio: 0.85');
logger.success('Deployment completed');

// With metadata/context
logger.info('User logged in', { userId: '123', ip: '10.0.0.1' });
logger.warn('High memory usage', { usage: '85%', threshold: '80%' });
logger.error('Connection failed', new Error('Timeout'));
logger.debug('Cache stats', { hits: 850, misses: 150, ratio: 0.85 });
logger.success('Order processed', { orderId: 'ORD-123', amount: 99.99 });

// Universal log method
logger.log('Custom message', 'info'); // level as second parameter
logger.log('Debug info', 'debug', { details: 'here' }); // with metadata
```

## Context & Metadata
### Console-like Arguments and Meta Wrappers

MagicLogger supports console-like variadic arguments while preserving structured metadata for transports.

```typescript
import { Logger, meta, err } from 'magiclogger';
const logger = new Logger();

// Print like console.log
logger.info('Data:', { a: 1, b: 2 }, [3, 4]);

// Attach metadata without printing it
logger.info('Saved user', user, meta({ requestId: 'r1', userId: 'u1' }));

// Attach an Error as meta (not printed)
logger.error('Failed', err(new Error('boom')));

// Back-compat: (string, object) keeps the object as meta only
logger.info('Started', { requestId: 'r2' });
```

Behavior rules:

- Exactly two args `(string, object)` keeps the original behavior: the object is metadata only (not printed).
- In variadic form, all args are printed except a final `meta(...)`/`err(...)` (or a trailing `Error`, which becomes `meta.error`).
- Non-strings are pretty-printed via Node `util.inspect` (with colors when enabled) by default; set `prettyPrint: 'json'` to use JSON.
- Circular references are handled and errors are converted to `{ name, message, stack }` in metadata.

Options:

- `prettyPrint`: `'inspect' | 'json'` (default `'inspect'`).
- `printMetaInDebug`: when true and `verbose` is enabled, appends a compact `[meta]` summary after the message.


### Global Context

Set default context that applies to all logs:

```typescript
const logger = new Logger({
  id: 'payment-service',
  tags: ['payments', 'critical'],
  context: {
    service: 'payment-api',
    version: '2.1.0',
    environment: 'production',
    hostname: process.env.HOSTNAME
  }
});

// All logs include global context
logger.info('Service started');
```

### Per-Log Context

Add specific context to individual logs:

```typescript
// Metadata is merged with global context
logger.info('Payment processed', {
  orderId: 'ORD-123',
  customerId: 'CUST-456',
  amount: 99.99,
  currency: 'USD',
  processingTime: 234
});
```

### Error Handling

Errors are automatically extracted and structured:

```typescript
// Pass error directly
logger.error('Operation failed', new Error('Invalid input'));

// Or include in metadata
logger.error('Payment failed', {
  error: new Error('Card declined'),
  orderId: 'ORD-123',
  customerId: 'CUST-456'
});

// Multiple errors
logger.error('Multiple failures', {
  errors: [error1, error2],
  context: 'batch-processing'
});
```

### Custom ID Generation

```typescript
import { v4 as uuidv4 } from 'uuid';

// UUID-based IDs
const logger = new Logger({
  idGenerator: () => uuidv4()
});

// Sequential IDs
const logger = new Logger({
  idGenerator: (() => {
    let counter = 0;
    return () => `log-${++counter}-${Date.now()}`;
  })()
});
```

### Correlation IDs

```typescript
// Request middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  req.logger = new Logger({
    context: {
      correlationId,
      requestId: uuidv4(),
      method: req.method,
      path: req.path
    }
  });
  
  next();
});
```

## Transports

## Transports

### Adding Transports

```typescript
import { Logger } from 'magiclogger';
import { 
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  S3Transport 
} from 'magiclogger/transports';

// At initialization
const logger = new Logger({
  transports: [
    new ConsoleTransport({ level: 'debug' }),
    new FileTransport({ filepath: './logs' })
  ]
});

// Dynamically
await logger.addTransport(new HTTPTransport({
  url: 'https://logs.example.com',
  auth: { type: 'bearer', token: 'secret' }
}), 10); // priority: 10

// Using convenience factories (recommended)
import { createConsole, createFile, createHTTP } from 'magiclogger/transports';

const logger = new Logger({
  transports: [
    await createConsole({ level: 'debug' }),
    await createFile('./logs/app.log')
  ]
});
```
```

### OTLP (OpenTelemetry) Transport

```typescript
import { Logger } from 'magiclogger';
import { OTLPTransport, createOTLPTransport } from 'magiclogger/transports/otlp';

// Direct
const loggerA = new Logger({
  transports: [
    new OTLPTransport({
      name: 'otlp',
      serviceName: 'orders',
      endpoint: 'http://localhost:4318',
      protocol: 'http/protobuf',
      includeTraceContext: true,
      resource: {
        'service.version': '1.0.0',
        'deployment.environment': 'dev'
      }
    })
  ]
});

// Helper
const loggerB = new Logger({
  transports: [createOTLPTransport('billing', { endpoint: 'http://localhost:4318' })]
});
```

### Transport Management

```typescript
// List all transports
const transportNames = logger.listTransports();
// ['console', 'file', 'http']

// Get specific transport
const httpTransport = logger.getTransport('http');

// Remove transport
await logger.removeTransport('file');

// Get statistics
const stats = logger.getTransportStats();
// { console: { logged: 1234, errors: 0 }, ... }
```

### Common Transport Configurations

```typescript
// Console with colors
new ConsoleTransport({
  name: 'console',
  level: 'debug',
  useColors: true,
  formatter: 'pretty' // or 'json', 'simple'
});

// File with rotation
new FileTransport({
  name: 'file',
  filepath: './logs',
  rotation: 'daily', // or 'size', 'hourly'
  maxFiles: 7,
  maxSize: '10MB',
  compress: true
});

// HTTP with batching
new HTTPTransport({
  name: 'http',
  url: 'https://logs.example.com',
  method: 'POST',
  auth: {
    type: 'bearer',
    token: process.env.LOG_TOKEN
  },
  maxBatchSize: 100,
  maxBatchTime: 5000,
  retry: {
    maxRetries: 3,
    initialDelay: 1000
  }
});

// S3 with compression
new S3Transport({
  name: 's3',
  bucket: 'my-logs',
  region: 'us-east-1',
  prefix: 'app-logs/',
  compress: true,
  encryption: {
    type: 'AES256'
  }
});
```

## Advanced Logging

### Custom Styling (Legacy)

These methods still work for backward compatibility:

```typescript
// Custom colors with prefix
logger.custom('Build complete', ['green', 'bold'], 'BUILD');
logger.custom('Network error', ['red'], 'NET');

// Preset styles
logger.styled('Important notice', 'important');
logger.styled('Debug info', 'muted');
```

## Styling and Formatting

### Built-in Formatters

MagicLogger provides multiple output formatters selectable per transport:

- PlainTextFormatter (human readable; presets: simple, detailed, syslog, apache, minimal)
- JSONFormatter (structured / NDJSON; presets: compact, pretty, flat, minimal, extended)
- XMLFormatter (XML elements or full document via formatBatch)
- CSVFormatter (tabular CSV; header + rows; good for spreadsheets / BI)
- CustomFormatter base (extend to build YAML, HTML, etc.)

For deep usage examples, options, escaping rules, and conversion guidance see `docs/formatters.md`.

### Color Factory - Create Reusable Styles

The `color()` method creates a reusable function for styling text:

```typescript
// Create style functions
const highlight = logger.color('yellow', 'bold');
const error = logger.color('red', 'underline');
const code = logger.color('cyan');
const success = logger.color('green', 'bold');

// Use them in your logs
logger.info(`Run ${code('npm install')} to install dependencies`);
logger.info(`The ${highlight('important')} part is here`);
logger.error(`${error('Failed')} to connect to database`);
logger.success(`Deployment ${success('completed successfully')}`);

// Combine multiple styled parts
const userId = logger.color('cyan', 'bold');
const timestamp = logger.color('gray');
const status = logger.color('green');

logger.info(
  `User ${userId('user-123')} logged in at ${timestamp('10:30:45')} - Status: ${status('active')}`
);
```

### Color Parts - Style Specific Words

The `colorParts()` method styles specific parts of a message:

```typescript
// Basic usage
logger.info(
  logger.colorParts('Processing file: data.json (1.2MB) - Status: OK', {
    'data.json': ['yellow', 'underline'],
    '1.2MB': ['cyan'],
    'OK': ['green', 'bold']
  })
);

// Complex example
const message = 'User john_doe performed action: DELETE on resource: /api/users/123 at 2024-01-15 10:30:45';
logger.warn(
  logger.colorParts(message, {
    'john_doe': ['cyan', 'bold'],
    'DELETE': ['red', 'bold'],
    '/api/users/123': ['yellow'],
    '2024-01-15 10:30:45': ['gray']
  })
);

// Error highlighting
logger.error(
  logger.colorParts('Failed to connect to database postgres://localhost:5432 after 3 retries', {
    'Failed': ['red', 'bold'],
    'postgres://localhost:5432': ['yellow', 'underline'],
    '3 retries': ['brightRed']
  })
);
```

### Combining Styling Methods

You can combine different styling approaches:

```typescript
// Create reusable styles
const highlight = logger.color('yellow', 'bold');
const code = logger.color('cyan');
const error = logger.color('red', 'bold');

// Use with colorParts for complex styling
const message = `Run ${code('npm start')} to start the server on port 3000`;
logger.info(
  logger.colorParts(message, {
    '3000': ['brightGreen', 'bold']
  })
);

// Or build complex messages
logger.info([
  'Deployment',
  highlight('completed'),
  'in',
  code('2.5s'),
  'with',
  logger.color('green')('0 errors')
].join(' '));
```

### Section Headers

Create visually distinct section headers:

```typescript
logger.header('DEPLOYMENT PROCESS');
logger.header('Test Results', ['white', 'bgGreen', 'bold']);
logger.header('⚠️  WARNING ⚠️', ['yellow', 'bgRed', 'bold']);
```

### Data Tables

Format tabular data for better readability:

```typescript
logger.table([
  { name: 'Service A', status: 'healthy', uptime: '99.9%', requests: 15234 },
  { name: 'Service B', status: 'degraded', uptime: '95.2%', requests: 8921 },
  { name: 'Service C', status: 'healthy', uptime: '99.8%', requests: 22847 }
]);

// With custom header colors
logger.table(
  [
    { id: 1, product: 'Widget', price: 19.99, stock: 150 },
    { id: 2, product: 'Gadget', price: 39.99, stock: 75 },
    { id: 3, product: 'Doohickey', price: 9.99, stock: 0 }
  ],
  ['brightCyan', 'bold', 'underline'] // Header styling
);
```

### Links

Make URLs and file paths clickable in supported terminals:

```typescript
logger.link('https://docs.example.com', 'View documentation');
logger.link('/var/log/app.log', 'Log file location');
logger.link('file:///C:/logs/error.log', 'Windows log file');

// In messages
const docsUrl = 'https://docs.example.com/api';
logger.info(`For more information, visit: ${docsUrl}`);
logger.link(docsUrl);
```

## Progress Tracking

MagicLogger supports in-terminal progress rendering in Node environments and provides a browser-safe no-op wrapper in the website demo. Use the progress helpers to show task advancement and finalize cleanly at 100%.

### Progress Bars

```typescript
// Simple progress bar
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i);
  await delay(100);
}

// Custom progress bar
logger.progressBar(
  75,    // percentage
  30,    // bar length
  '▓',   // complete character
  '░'    // incomplete character
);

// Different styles
logger.progressBar(50, 40, '=', '-');
logger.progressBar(80, 25, '■', '□');
logger.progressBar(33, 20, '●', '○');
```

## File Operations

Node.js only - manage log files:

```typescript
// Get current log file path
const logPath = logger.getPath();
console.log(`Logs are being written to: ${logPath}`);

// Get/set log directory
const currentDir = logger.getLogDir();
logger.setLogDir('./logs/production', true); // true = reinitialize

// Get/set retention period
const retentionDays = logger.getLogRetentionDays();
logger.setLogRetentionDays(30, true); // true = clean old logs now

// Enable/disable file logging
logger.setFileLogging(true);
```

## Browser Operations

Browser only - manage localStorage:

```typescript
// Get all stored logs
const logs = logger.getLogs();
if (logs) {
  console.log(`Found ${logs.length} stored logs`);
}

// Clear logs
logger.clearLogs();

// Download logs as file
logger.downloadLogs('debug-logs.txt');

// Enable/disable storage
logger.setStorageEnabled(true);
```

## Configuration Methods

### Runtime Configuration

```typescript
// Verbose mode (show debug logs)
logger.setVerbose(true);

// Colors
logger.setColorsEnabled(false); // Disable colors

// Themes
logger.setTheme({
  info: ['cyan', 'bold'],
  error: ['red', 'bold', 'underline'],
  success: ['green', 'bold'],
  warn: ['yellow', 'bold'],
  debug: ['gray', 'italic'],
  header: ['white', 'bgBlue', 'bold']
});

// Get current theme
const theme = logger.theme;
```

### Environment Variables

```typescript
// Common patterns
const logger = new Logger({
  verbose: process.env.LOG_LEVEL === 'debug',
  id: process.env.SERVICE_NAME,
  tags: [process.env.NODE_ENV],
  context: {
    version: process.env.APP_VERSION,
    region: process.env.AWS_REGION
  },
  transports: [
    ...(process.env.LOG_TO_CONSOLE ? [
      new ConsoleTransport({
        level: process.env.LOG_LEVEL || 'info'
      })
    ] : []),
    ...(process.env.LOG_TO_FILE ? [
      new FileTransport({ 
        filepath: process.env.LOG_DIR || './logs'
      })
    ] : [])
  ]
});
```

## Available Colors and Styles

### Foreground Colors
- Basic: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `brightBlack`
- Bright: `brightRed`, `brightGreen`, `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`

### Background Colors
- Basic: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`, `bgGray`
- Bright: `bgBrightBlack`, `bgBrightRed`, `bgBrightGreen`, `bgBrightYellow`, `bgBrightBlue`, `bgBrightMagenta`, `bgBrightCyan`, `bgBrightWhite`

### Extra Colors (aliases or 256-color picks)
- Foreground: `orange`, `brightOrange`, `purple`, `brightPurple`, `teal`, `brightTeal`, `pink`, `brightPink`, `brown`, `brightBrown`, `indigo`, `brightIndigo`, `lime`, `brightLime`
- Background: `bgOrange`, `bgBrightOrange`, `bgPurple`, `bgBrightPurple`, `bgTeal`, `bgBrightTeal`, `bgPink`, `bgBrightPink`, `bgBrown`, `bgBrightBrown`, `bgIndigo`, `bgBrightIndigo`, `bgLime`, `bgBrightLime`

### Text Styles
- `bold`, `dim`, `italic`, `underline`, `blink`, `reverse`, `hidden`, `strikethrough`

### Style Presets
- `info` - Cyan, bold text for standard information
- `success` - Green, bold text for success messages
- `warning` - Yellow, bold text for warnings
- `error` - Bright red, bold text for errors
- `debug` - Gray, italic text for debug messages
- `important` - Magenta, bold, underlined text for critical information
- `highlight` - Bright yellow, bold text to highlight information
- `muted` - Dimmed text for less important information
- `special` - Bright cyan, bold text for special announcements
- `code` - Bright green text for code snippets
- `header` - White text on blue background for section headers

## API Reference

### Logger Class

```typescript
class Logger {
  // Constructor
  constructor(options?: ExtendedLoggerOptions)
  
  // Logging methods
  log(msg: string, level?: LogLevel, meta?: any): void
  info(msg: string, meta?: any): void
  warn(msg: string, meta?: any): void
  error(msg: string, meta?: any): void
  debug(msg: string, meta?: any): void
  success(msg: string, meta?: any): void
  
  // Transport management
  addTransport(transport: Transport, priority?: number): Promise<void>
  removeTransport(name: string): Promise<void>
  getTransport(name: string): Transport | undefined
  listTransports(): string[]
  getTransportStats(): Record<string, any>
  
  // Configuration
  setVerbose(enabled: boolean): void
  setColorsEnabled(enabled: boolean): void
  setTheme(theme: Record<string, ColorName[]>): void
  get theme(): Record<string, ColorName[]>
  
  // Styling methods
  custom(msg: string, colors?: ColorName[], prefix?: string): void
  styled(msg: string, preset: StylePreset): void
  header(title: string, colors?: ColorName[]): void
  table(data: Record<string, any>[], headerColor?: ColorName[]): void
  progressBar(progress: number, length?: number, completeChar?: string, incompleteChar?: string): void
  link(url: string, description?: string): void
  color(...colors: ColorName[]): (text: string) => string
  colorParts(message: string, colorMap: Record<string, ColorName[]>): string
  
  // File operations (Node.js)
  getPath(): string | null
  getLogDir(): string
  setLogDir(dir: string, reinitialize?: boolean): void
  getLogRetentionDays(): number
  setLogRetentionDays(days: number, cleanNow?: boolean): void
  setFileLogging(enabled: boolean): void
  
  // Browser operations
  getLogs(): string[] | null
  clearLogs(): void
  downloadLogs(filename?: string): void
  setStorageEnabled(enabled: boolean): void
  
  // Static utilities
  static normalizePath(path: string): string
  static normalizeLineEndings(text: string): string
  static isLinkLike(text: string): boolean
  static cleanupDirectory(dir: string): void
  
  // Lifecycle
  close(): Promise<void>
}
```

### Transport Interface

```typescript
interface Transport {
  name: string
  log(entry: LogEntry): Promise<void>
  close?(): Promise<void>
}

interface LogEntry {
  id: string                    // Unique entry ID
  timestamp: string             // ISO 8601 timestamp
  timestampMs: number           // Unix timestamp (ms)
  level: LogLevel               // Log level
  message: string               // Formatted message
  plainMessage: string          // Message without ANSI
  loggerId?: string            // Logger instance ID
  tags?: string[]              // Associated tags
  context?: Record<string, any> // Additional context
  error?: ErrorInfo            // Error details
  metadata?: Record<string, any> // Environment metadata
}
```

### Types

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success'

type ColorName = 'black' | 'red' | 'green' | /* ... */ | 'strikethrough'

type StylePreset = 'info' | 'success' | 'warning' | /* ... */ | 'header'

type IdGenerator = () => string
```

### createLogger Helper

```typescript
function createLogger(
  id: string,
  options?: {
    console?: boolean | ConsoleTransportOptions
    file?: string | FileTransportOptions
    http?: string | HTTPTransportOptions
    s3?: S3TransportOptions
    mongodb?: MongoDBTransportOptions
    level?: LogLevel
    tags?: string[]
    context?: Record<string, any>
    verbose?: boolean
  }
): Logger
```

## Examples

### Production Setup

```typescript
import { Logger } from 'magiclogger';
import { ConsoleTransport, FileTransport, S3Transport } from 'magiclogger/transports';

const logger = new Logger({
  id: process.env.SERVICE_NAME || 'api',
  tags: [process.env.NODE_ENV || 'development'],
  context: {
    version: process.env.APP_VERSION,
    region: process.env.AWS_REGION,
    instance: process.env.INSTANCE_ID
  },
  idGenerator: () => `${Date.now()}-${process.pid}-${Math.random().toString(36).substr(2, 9)}`,
  transports: [
    // Console for development
    ...(process.env.NODE_ENV !== 'production' ? [
      new ConsoleTransport({ level: 'debug' })
    ] : []),
    
    // File for all environments
    new FileTransport({
      filepath: process.env.LOG_DIR || './logs',
      rotation: 'daily',
      maxFiles: 7
    }),
    
    // S3 for production
    ...(process.env.NODE_ENV === 'production' ? [
      new S3Transport({
        bucket: process.env.LOG_BUCKET,
        compress: true
      })
    ] : [])
  ]
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down');
  await logger.close();
  process.exit(0);
});
```

### Request Logging Middleware

```typescript
import { Logger } from 'magiclogger';
import { v4 as uuidv4 } from 'uuid';

function requestLogger(baseLogger: Logger) {
  return (req, res, next) => {
    const start = Date.now();
    const requestId = uuidv4();
    
    // Create request-scoped logger
    req.logger = new Logger({
      ...baseLogger.options,
      context: {
        ...baseLogger.options.context,
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip
      }
    });
    
    // Log request
    req.logger.info('Request received');
    
    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      req.logger.info('Request completed', {
        statusCode: res.statusCode,
        duration
      });
    });
    
    next();
  };
}
```

### Multi-Service Logging

```typescript
// Shared configuration
const baseConfig = {
  tags: ['production'],
  context: { environment: 'production' }
};

// Service-specific loggers
const apiLogger = new Logger({
  ...baseConfig,
  id: 'api',
  transports: [/* API transports */]
});

const dbLogger = new Logger({
  ...baseConfig,
  id: 'database',
  transports: [/* DB transports */]
});

const cacheLogger = new Logger({
  ...baseConfig,
  id: 'cache',
  transports: [/* Cache transports */]
});
```

### Complex Styling Example

```typescript
// Create style functions
const method = logger.color('cyan', 'bold');
const path = logger.color('yellow');
const status = logger.color('green');
const time = logger.color('gray');
const error = logger.color('red', 'bold');

// Use in logs
logger.info(
  `${method('GET')} ${path('/api/users')} - ${status('200 OK')} in ${time('45ms')}`
);

logger.error(
  `${method('POST')} ${path('/api/payment')} - ${error('500 Internal Error')} in ${time('523ms')}`
);

// Or use colorParts for the same effect
logger.info(
  logger.colorParts('GET /api/users - 200 OK in 45ms', {
    'GET': ['cyan', 'bold'],
    '/api/users': ['yellow'],
    '200 OK': ['green'],
    '45ms': ['gray']
  })
);
```

For more details on transports, see the [Transport Documentation](./intro.md#-multiple-transports).