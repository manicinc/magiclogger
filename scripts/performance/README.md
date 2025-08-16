# MagicLogger Performance Benchmarks

**Beautiful, structured logging that just works.** MagicLogger transforms boring console logs into vibrant, organized output while maintaining perfect performance and tree-shaking.

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({ useColors: true });

// Simple, beautiful logging
logger.info('Server started', { port: 3000 });
logger.success('User authenticated', { userId: 'user_123' });
logger.warn('Rate limit exceeded', { ip: '192.168.1.1' });
logger.error('Database connection failed', new Error('Timeout'));

// Rich styling with multiple APIs - pick your favorite!
logger.info(logger.s.red.bold('CRITICAL:') + ' Server is ' + logger.s.yellow('shutting down'));
logger.info(logger.fmt`@red.bold{CRITICAL:} Server is @yellow{shutting down} at @cyan{${new Date().toISOString()}}`);
logger.info('<red.bold>CRITICAL:</> Server is <yellow>shutting down</> at <cyan>' + new Date().toISOString() + '</>');

logger.header('🚀 DEPLOYMENT STARTED');
logger.progressBar(75);
logger.table([
  { service: 'API', status: 'healthy', uptime: '99.9%' },
  { service: 'DB', status: 'degraded', uptime: '95.2%' }
]);
```

## Performance Benchmarks

MagicLogger is designed to be fast, even with rich styling features. The benchmarks compare MagicLogger against popular logging libraries in various scenarios.

### Running Benchmarks

```bash
# Install dependencies (optional loggers for comparison)
npm install
npm run install-deps

# Run benchmarks
npm run bench        # JavaScript version
npm run bench:ts     # TypeScript version

# Update README with latest results
npm run perf:update
```

### Benchmark Scenarios

The benchmarks test the following scenarios:

1. **MagicLogger (sync)** - Standard synchronous logging without styling
2. **MagicLogger (sync + styled)** - Synchronous logging with rich styling
3. **MagicLogger (async)** - Asynchronous buffered logging without styling  
4. **MagicLogger (async + styled)** - Asynchronous buffered logging with styling
5. **Pino** - Popular high-performance logger
6. **Winston** - Most popular Node.js logger
7. **Bunyan** - Structured JSON logger

### Latest Performance Results

<!-- PERF_TABLE_START -->
Run `npm run perf:update` to generate the latest results.
<!-- PERF_TABLE_END -->

### Benchmark Details

- **Test Environment**: Node.js 18+ with V8 optimizations
- **Iterations**: 100,000 operations per test
- **Warmup**: 5,000 operations before measurement
- **Output Suppression**: All I/O redirected to null streams to measure pure logging performance
- **Test Data**: Realistic log messages with metadata objects
- **Garbage Collection**: Forced between tests when available

### Why These Results Matter

MagicLogger delivers competitive performance while providing features other loggers don't:

- **Rich Styling**: Colors, formatting, and visual elements with minimal overhead
- **Multiple APIs**: Chain syntax, template literals, and inline markup
- **Structured Output**: Consistent JSON format for all transports
- **Tree Shaking**: Only pay for features you use
- **Zero Dependencies**: No external dependencies in core

---

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

## 🧱 Structured Logging (JSON)

MagicLogger emits a consistent JSON structure to transports. Below are real inputs and the resulting JSON objects your transports receive.

### Input → Output (with sensible defaults)

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({ id: 'api', tags: ['service', 'api'] });

// 1) Plain metadata object
logger.info('User login', { userId: 'u_123', ip: '203.0.113.10' });

// 2) Direct Error instance
logger.error('Payment failed', new Error('Card declined'));

// 3) Metadata object containing an error
logger.error('DB query failed', {
  error: new Error('timeout'),
  query: 'SELECT * FROM users WHERE id = ?'
});
```

Example JSON produced:

```json
{
  "id": "1733938475123-abc123xyz",              
  "timestamp": "2025-08-14T12:34:35.123Z",       
  "timestampMs": 1765769675123,                   
  "level": "info",                               
  "message": "User login",                       
  "plainMessage": "User login",                  
  "loggerId": "api",                             
  "tags": ["service", "api"],                  
  "context": { "userId": "u_123", "ip": "203.0.113.10" },
  "metadata": {
    "hostname": "my-host",                       
    "pid": 1234,                                  
    "platform": "linux",                         
    "nodeVersion": "v18.20.8"                    
  }
}
```

## 🎨 Styling Showcase

### Three Powerful Styling APIs

MagicLogger provides three complementary styling APIs. Use one or combine them seamlessly!

#### 1. Chainable Style API (`logger.s`)

```typescript
const error = logger.s.red.bold('ERROR:');
const warning = logger.s.yellow.underline('Warning:');
const success = logger.s.green.bold('✓ Success');

logger.info(error + ' Connection failed');
logger.info(warning + ' High memory usage');
logger.info(success + ' Deployment complete');
```

#### 2. Template Literal API (`logger.fmt`)

```typescript
logger.info(logger.fmt`@red.bold{Error:} Failed to connect to @yellow.underline{users_db}`);

const errorType = 'Connection Error';
logger.error(logger.fmt`@red.bold{${errorType}} Database failed`);
```

#### 3. Inline Angle Bracket Syntax

```typescript
logger.info('<green.bold>SUCCESS:</> All tests passed');
logger.error('<red>Error:</> Connection to <yellow>database</> failed');
logger.warn('<yellow.bold>⚠ Warning:</> <cyan>CPU usage</> is high');
```

## 🎨 Theme System

### Built-in Themes

```typescript
const logger = new Logger({ 
  theme: 'ocean' // or 'forest', 'sunset', 'minimal', 'cyberpunk'
});
```

### Tag-Based Theme Styling

```typescript
const logger = new Logger({
  theme: {
    tags: {
      api: ['cyan', 'bold'],
      database: ['yellow'],
      error: ['red', 'bold']
    }
  },
  tags: ['api']
});

// Tags automatically apply their theme styles
logger.info('Request received', { tags: ['api'] });
```

## 🔌 Transports

### Built-in Transports

```typescript
import { Logger } from 'magiclogger';
import {
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  S3Transport,
  MongoDBTransport,
} from 'magiclogger/transports';

const logger = new Logger({
  transports: [
    new ConsoleTransport({ level: 'debug', useColors: true }),
    new FileTransport({ filepath: './logs/app.log', maxFiles: 7 }),
    new HTTPTransport({ url: 'https://logs.example.com', batch: true }),
    new S3Transport({ bucket: 'my-logs', region: 'us-east-1' }),
    new MongoDBTransport({ uri: 'mongodb://localhost:27017' }),
  ]
});
```

## 📊 Visual Elements

### Headers, Progress, and Tables

```typescript
logger.header('🚀 DEPLOYMENT PROCESS');
logger.progressBar(75);
logger.table([
  { name: 'API', status: 'healthy', cpu: '12%' },
  { name: 'Database', status: 'healthy', cpu: '45%' },
  { name: 'Cache', status: 'degraded', cpu: '78%' }
]);
```

## 📦 Build Output Sizes

| Scenario | Size (gzip) |
|----------|-------------|
| core (esm) | 37 kB |
| core + console | 37 kB |
| core + all transports | 45.4 kB |
| all compatibility layers | 43.8 kB |

---

## ⚡ Performance

MagicLogger's performance tests validate high-volume styled logging within strict thresholds. External logger comparisons are performed without styling and with output suppressed for fair comparison.

Latest benchmark snapshot:

<!-- PERF_TABLE_START -->
Run `npm run perf:update` to generate the latest results.
<!-- PERF_TABLE_END -->

### Performance Features

- **Zero-overhead** sync logging by default
- **Optional async logging** with ring buffers for high throughput
- **Efficient styling** that doesn't impact core performance
- **Smart output suppression** during benchmarks
- **Tree-shaking support** - only pay for what you use

### Benchmark Environment

All benchmarks are run with:
- Output completely suppressed (null streams/transports)
- Multiple warmup iterations
- Garbage collection between tests
- Realistic log data with metadata
- Multiple test scenarios (sync/async, styled/unstyled)

The results show MagicLogger delivers competitive performance while providing rich formatting features that other loggers lack.