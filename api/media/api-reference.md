# API Reference

> **📚 Full API Documentation**: For complete, auto-generated API documentation with all classes, interfaces, and types, <a href="/api/" target="_blank">view the full API docs</a> or visit [magiclog.io/api/](https://magiclog.io/api/)

This page provides a quick reference for the most commonly used APIs. For detailed documentation of all exports, please refer to the full API documentation linked above.

## Core Logger Classes

### Logger (Main Class)

The main logger class that provides a unified logging interface with rich styling and transport management.

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger(options?: LoggerOptions);
```

#### Constructor Options

```typescript
interface LoggerOptions {
  // Basic configuration
  id?: string;                    // Logger instance ID
  tags?: string[];                 // Global tags for all logs
  context?: Record<string, any>;  // Global context for all logs
  verbose?: boolean;               // Enable verbose output (show debug logs)
  useColors?: boolean;             // Enable colored output (default: true)
  useConsole?: boolean;            // Add console transport (default: true)

  // File logging
  writeToDisk?: boolean;           // Enable file logging
  file?: string;                   // Log file path
  logDir?: string;                 // Log directory (default: 'logs')
  logRetentionDays?: number;       // Days to retain logs (default: 30)

  // Styling & themes
  theme?: string | ThemeDefinition;  // Built-in theme name or custom theme
  performanceMode?: boolean;         // Disable styling for max performance

  // Transports
  transports?: Transport[];        // Custom transports
}
```

#### Core Logging Methods

```typescript
// Standard log levels
logger.info(message: string, meta?: any): void;
logger.error(message: string, error?: Error | meta?: any): void;
logger.warn(message: string, meta?: any): void;
logger.debug(message: string, meta?: any): void;
logger.success(message: string, meta?: any): void;

// Also supports variadic arguments
logger.info('User', 'logged in', { userId: 123 });
logger.error('Failed to connect', new Error('timeout'));
```

#### Styling Methods

```typescript
// Template literal styling - clean interpolation
logger.fmt`@red.bold{ERROR:} Failed to connect to @yellow{${database}}`;

// Chainable style API - programmatic styling
logger.s.blue.bold('INFO:');
logger.style.green('Success');

// Direct color method
logger.color('red', 'bold')('Error message');

// Parse angle bracket syntax (auto-applied to all logs)
logger.parseBrackets('<green.bold>SUCCESS:</> Operation complete');

// Style specific parts of text
logger.parts([
  ['SUCCESS:', 'green', 'bold'],
  [' All tests passed'],
  [' (100%)', 'dim']
]);

// Style by word index
logger.styleByIndex('GET /api/users 200 OK', {
  0: ['blue', 'bold'],    // "GET"
  1: ['cyan'],            // "/api/users"
  2: ['green', 'bold']    // "200"
});
```

#### Visual Elements

```typescript
// Section headers
logger.header('🚀 DEPLOYMENT PROCESS');
logger.header('⚠️ WARNINGS', ['yellow', 'bgRed', 'bold']);

// Tables with formatting
logger.table([
  { name: 'API', status: 'healthy', cpu: '12%' },
  { name: 'Database', status: 'healthy', cpu: '45%' }
], {
  border: 'double',          // 'single' | 'double' | 'rounded' | 'heavy' | 'none'
  headerColor: ['cyan', 'bold'],
  borderColor: ['blue']
});

// Progress bars
logger.progressBar(0.75, 20, '█', '░');  // 75% progress

// Separators
logger.separator('═', 60, ['cyan']);

// Boxes
logger.box('Success!', {
  border: 'double',
  borderColor: ['green'],
  color: ['green', 'bold']
});

// Lists
logger.list(['Item 1', 'Item 2', 'Item 3'], {
  bullet: '•',
  bulletColor: ['cyan']
});

// Links
logger.link('https://example.com', 'Example Site');
```

#### Timer and Counter Methods

```typescript
// Timers
logger.time('database-query');
// ... perform operation
logger.timeEnd('database-query'); // Logs: "database-query: 145ms"

// Counters
logger.count('api-calls'); // "api-calls: 1"
logger.count('api-calls'); // "api-calls: 2"
logger.countReset('api-calls');
logger.count('api-calls'); // "api-calls: 1"

// Groups
logger.group('Processing batch');
logger.info('Item 1 processed');
logger.info('Item 2 processed');
logger.groupEnd();
```

#### Transport Management

```typescript
// Add/remove transports
await logger.addTransport(transport: Transport);
await logger.removeTransport(name: string);

// Get transport info
logger.getTransport(name: string): Transport | undefined;
logger.listTransports(): string[];
logger.getTransports(): Transport[];
logger.getTransportStats(): Record<string, unknown>;

// Lifecycle
await logger.close();  // Graceful shutdown
```

#### Context and Configuration

```typescript
// Context management
logger.setContext(context: Record<string, any>);    // Replace context
logger.addContext(context: Record<string, any>);    // Merge with existing
logger.getContext(): Record<string, any> | undefined;

// Tags management
logger.setTags(tags: string[]);                      // Replace tags
logger.addTags(tags: string[]);                      // Add to existing
logger.getTags(): string[] | undefined;

// Configuration
logger.setVerbose(enabled: boolean);                 // Toggle debug output
logger.setColorsEnabled(enabled: boolean);           // Toggle colors
logger.setLevel(level: LogLevel);                    // Set minimum log level
logger.isLevelEnabled(level: LogLevel): boolean;     // Check if level enabled

// Theme management
logger.setTheme(theme: Record<string, ColorName[]>);
logger.getTheme(): Record<string, ColorName[]>;

// Child loggers with inherited config
const childLogger = logger.child({
  id: 'child-1',
  tags: ['service'],
  context: { service: 'api' }
});
```

### AsyncLogger

High-performance asynchronous logger with non-blocking I/O. Used internally by Logger when in async mode.

```typescript
import { AsyncLogger } from 'magiclogger';

const logger = new AsyncLogger(options?: AsyncLoggerOptions);
```

#### AsyncLogger Options

```typescript
interface AsyncLoggerOptions {
  transports?: Transport[];
  id?: string;
  enableMetrics?: boolean;
  useConsole?: boolean;       // Add console transport (default: true)
  useColors?: boolean;         // Enable colors (default: true)

  // Worker configuration (optional - disabled by default for better performance)
  worker?: {
    enabled?: boolean;         // Enable worker threads (default: false)
    poolSize?: number;         // Number of workers (default: 2)
    batchSize?: number;        // Batch size (default: 100)
    flushInterval?: number;    // Flush interval ms (default: 10)
  };
}
```

#### AsyncLogger Methods

```typescript
// Logging methods (return { success: boolean })
logger.info(message: string, meta?: Record<string, unknown>): { success: boolean };
logger.error(message: string, error?: Error | meta?: Record<string, unknown>): { success: boolean };
logger.warn(message: string, meta?: Record<string, unknown>): { success: boolean };
logger.debug(message: string, meta?: Record<string, unknown>): { success: boolean };

// Critical logging with immediate flush
await logger.logCritical(level: LogLevel, message: string, meta?: Record<string, unknown>);

// Styling (same as Logger)
logger.s.red.bold('Error');
logger.fmt`@green{Success}`;

// Performance monitoring
logger.getStats(): {
  buffer: { size, capacity, utilization, dropped },
  metrics: AsyncLoggerMetrics
};
logger.getMetrics(): AsyncLoggerMetrics;
logger.getUtilization(): number;  // Buffer utilization %
logger.isBackpressured(): boolean;

// Transport management
logger.addTransport(transport: Transport): void;
logger.removeTransport(name: string): void;
logger.listTransports(): string[];

// Lifecycle
await logger.flush();         // Flush pending logs
await logger.flushAndWait();  // Flush and wait for completion
await logger.close();         // Graceful shutdown
```

### SyncLogger

Synchronous logger with blocking I/O for guaranteed delivery. Use only when you need absolute guarantee of delivery.

```typescript
import { SyncLogger } from 'magiclogger';

const logger = new SyncLogger(options?: SyncLoggerOptions);
```

#### SyncLogger Options

```typescript
interface SyncLoggerOptions {
  transports?: Transport[];
  file?: string;              // Log file path for file transport
  useColors?: boolean;        // Enable colors (default: true)
  verbose?: boolean;          // Enable debug output
  forceFlush?: boolean;       // Force immediate flush (for audit logs)
}
```

## Transports

### Built-in Transports

```typescript
import {
  ConsoleTransport,      // Alias for SyncConsoleTransport
  SyncConsoleTransport,  // Synchronous console output
  FileTransport,         // Alias for AsyncFileTransport (sonic-boom)
  AsyncFileTransport,    // High-performance async file I/O
  SyncFileTransport,     // Synchronous file writes
  WorkerFileTransport,   // Worker thread-based file transport
  HTTPTransport          // HTTP endpoint transport with batching
} from 'magiclogger/transports';
```

#### Console Transport

```typescript
const consoleTransport = new SyncConsoleTransport({
  name?: string;           // Transport name (default: 'console')
  enabled?: boolean;       // Enable/disable (default: true)
  level?: LogLevel;        // Minimum log level
  useColors?: boolean;     // Enable colors (default: true)
  format?: 'plain' | 'json';  // Output format
  showTimestamp?: boolean;
  showLevel?: boolean;
  showMetadata?: boolean;
});
```

#### File Transport (Async - Recommended)

```typescript
const fileTransport = new AsyncFileTransport({
  filepath: './logs/app.log',
  name?: string;
  enabled?: boolean;
  level?: LogLevel;
  format?: 'json' | 'plain';
  minLength?: number;      // Buffer size before auto-flush (default: 4096)
  maxWrite?: number;       // Max bytes per write (default: 16384)
  sync?: boolean;          // Force sync writes (default: false)
  mkdir?: boolean;         // Create directory if missing (default: false)
  append?: boolean;        // Append to file (default: true)
  mode?: number;           // File permissions (default: 0o666)
});
```

#### HTTP Transport

```typescript
const httpTransport = new HTTPTransport({
  endpoint: 'https://logs.example.com',
  name?: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  batch?: {
    size?: number;         // Batch size (default: 100)
    timeout?: number;      // Flush timeout ms (default: 5000)
  };
  retry?: {
    attempts?: number;     // Max retry attempts (default: 3)
    delay?: number;        // Initial retry delay ms (default: 1000)
    maxDelay?: number;     // Max retry delay ms (default: 30000)
  };
});
```

## Types

### LogLevel

```typescript
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'success';
```

### LogEntry

```typescript
interface LogEntry {
  id: string;                        // Unique log ID
  timestamp: string | number;        // ISO string or Unix timestamp
  level: LogLevel;                   // Log level
  message: string;                   // Log message
  context?: Record<string, any>;     // Structured metadata
  tags?: string[];                   // Log tags
  loggerId?: string;                 // Logger instance ID
  error?: {                          // Error information
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
}
```

### Transport Interface

```typescript
interface Transport {
  name: string;
  enabled?: boolean;
  log(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
  close?(): void | Promise<void>;
  shouldLog?(entry: LogEntry): boolean;
  logBatch?(entries: LogEntry[]): void | Promise<void>;
  init?(): void | Promise<void>;
}
```

## Factory Functions

```typescript
import { createLogger, createAsyncLogger, createSyncLogger } from 'magiclogger';

// Create logger with auto-detection based on environment
const logger = createLogger({
  mode?: 'async' | 'sync' | 'auto' | 'balanced',
  ...options
});

// Create specific logger types
const asyncLogger = createAsyncLogger(options);
const syncLogger = createSyncLogger(options);
```

## Examples

### Basic Setup

```typescript
import { Logger } from 'magiclogger';

// Simple console logger
const logger = new Logger();
logger.info('Application started');

// With file logging
const logger = new Logger({
  writeToDisk: true,
  file: './logs/app.log'
});

// With custom transports
const logger = new Logger({
  transports: [
    new ConsoleTransport({ level: 'debug' }),
    new FileTransport({ filepath: './logs/app.log' }),
    new HTTPTransport({ endpoint: 'https://logs.example.com' })
  ]
});
```

### Styled Logging

```typescript
// Using angle brackets (auto-parsed in all log methods)
logger.info('<green.bold>✅ Success:</> User <cyan>john@example.com</> authenticated');
logger.error('<red>Error:</> Connection to <yellow>database</> failed');

// Using template literals
const database = 'users_db';
logger.error(logger.fmt`@red.bold{ERROR:} Failed to connect to @yellow{${database}}`);

// Using chainable API
logger.info(logger.s.blue.bold('INFO:') + ' Processing ' + logger.s.cyan('data.json'));

// Creating reusable styles
const error = logger.s.red.bold;
const success = logger.s.green.bold;
const warning = logger.s.yellow;

logger.info(success('✓ All tests passed'));
logger.error(error('✗ Build failed'));
logger.warn(warning('⚠ Deprecated API usage'));
```

### Structured Logging

```typescript
// With metadata
logger.info('User action', {
  userId: 'u_123',
  action: 'login',
  ip: '192.168.1.1',
  timestamp: Date.now()
});

// With error objects
try {
  await database.connect();
} catch (error) {
  logger.error('Database connection failed', error);
  // Or with additional context
  logger.error('Database connection failed', {
    error,
    database: 'production',
    retryCount: 3
  });
}

// With tags for categorization
logger.info('API request', { tags: ['api', 'v2', 'users'] });
```

### Performance Monitoring

```typescript
const logger = new AsyncLogger({
  enableMetrics: true
});

// Monitor logger performance
setInterval(() => {
  const stats = logger.getStats();
  console.log('Buffer utilization:', stats.buffer.utilization + '%');
  console.log('Dropped logs:', stats.buffer.dropped);
  console.log('Total processed:', stats.metrics.totalLogs);
}, 5000);

// Check for backpressure
if (logger.isBackpressured()) {
  console.warn('Logger experiencing backpressure');
  await logger.flush();
}
```

### Graceful Shutdown

```typescript
// Ensure all logs are written before exit
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await logger.close();  // Flushes all pending logs
  process.exit(0);
});

// For critical logs that must not be lost
process.on('uncaughtException', async (error) => {
  await logger.logCritical('fatal', 'Uncaught exception', { error });
  await logger.close();
  process.exit(1);
});
```

## Best Practices

1. **Use Logger (default) for most cases** - It provides the best balance of performance and features
2. **Use AsyncLogger explicitly for high-throughput** - When you need maximum performance
3. **Use SyncLogger only for audit logs** - When you absolutely cannot lose any logs
4. **Enable graceful shutdown** - Always call `logger.close()` before process exit
5. **Use structured metadata** - Pass objects as second parameter instead of string concatenation
6. **Use semantic log levels** - Choose appropriate levels for filtering in production
7. **Configure transports appropriately** - Use async file transport for performance, sync for auditing
8. **Monitor for backpressure** - Check buffer utilization in high-throughput scenarios
9. **Use child loggers** - Create scoped loggers with inherited configuration
10. **Batch network transports** - Configure batching for HTTP/cloud transports to reduce overhead

## Migration Guide

### From Winston

```typescript
// Winston
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// MagicLogger
import { Logger } from 'magiclogger';
const logger = new Logger({
  verbose: false,  // 'info' level and above
  transports: [
    new ConsoleTransport(),
    new FileTransport({ filepath: 'app.log' })
  ]
});
```

### From Pino

```typescript
// Pino
const pino = require('pino');
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// MagicLogger
import { Logger } from 'magiclogger';
const logger = new Logger({
  verbose: false,  // 'info' level and above
  useColors: true  // Pretty output by default
});
```

### From Bunyan

```typescript
// Bunyan
const bunyan = require('bunyan');
const logger = bunyan.createLogger({
  name: 'myapp',
  level: 'info',
  streams: [
    { stream: process.stdout },
    { path: 'app.log' }
  ]
});

// MagicLogger
import { Logger } from 'magiclogger';
const logger = new Logger({
  id: 'myapp',
  verbose: false,
  transports: [
    new ConsoleTransport(),
    new FileTransport({ filepath: 'app.log' })
  ]
});
```

For more detailed API documentation, visit the <a href="/api/" target="_blank">Full API Documentation</a>.