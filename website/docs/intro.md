---
sidebar_position: 1
slug: /
---

# Welcome to MagicLogger 🌈

**The most powerful TypeScript/JavaScript logging library with automatic structured data, multiple transports, and beautiful formatting**

MagicLogger transforms your logging experience with zero configuration. Write simple logs, get powerful structured data automatically, and enjoy beautiful console output with colors, tables, and progress bars.

## ✨ Key Features

- 🎯 **Simple API → Structured Data**: Every simple log becomes rich structured data automatically
- 🚀 **Multiple Transports**: Send logs to Console, Files, HTTP, S3, MongoDB, WebSocket, and more
- 🎨 **Beautiful Formatting**: Colors, tables, progress bars, and styled output
- 🏷️ **Rich Context**: Global and per-log metadata, tags, and correlation IDs
- 🔧 **Zero Dependencies**: Lightweight and fast
- 🌐 **Universal**: Works in Node.js and browsers automatically
- 📁 **Smart File Logging**: Rotation, compression, and automatic cleanup
- 🔄 **Drop-in Compatible**: Replace Winston, Bunyan, or Pino without changing code
- 💪 **Enterprise Ready**: Batching, retry logic, fallbacks, and dead letter queues

## 🚀 Quick Start

### Installation

```bash
npm install magiclogger
# or
yarn add magiclogger
# or
pnpm add magiclogger
```

### Basic Usage - Zero Config

```javascript
import { Logger } from 'magiclogger';

// Just works out of the box
const logger = new Logger();

// Beautiful console output with colors
logger.info('🚀 Application started');
logger.success('✅ Database connected');
logger.warn('⚠️  Cache miss for user:1234');
logger.error('❌ Failed to process payment', new Error('Card declined'));
logger.debug('🔍 Cache stats', { hits: 142, misses: 31, ratio: 0.82 });
```

## 🎨 Beautiful Console Output

### Colored Logging

```javascript
// Create reusable color functions
const highlight = logger.color('yellow', 'bold');
const error = logger.color('red', 'underline');
const success = logger.color('green', 'bold');
const code = logger.color('cyan');

// Use them in your logs
logger.info(`Server running on ${highlight('port 3000')}`);
logger.info(`Run ${code('npm install')} to install dependencies`);
logger.error(`${error('Failed')} to connect to database`);
logger.success(`Deployment ${success('completed successfully')} 🎉`);

// Color specific parts of a message
logger.info(
  logger.colorParts('Processing file: data.json (1.2MB) - Status: OK', {
    'data.json': ['yellow', 'underline'],
    '1.2MB': ['cyan'],
    'OK': ['green', 'bold']
  })
);
```

### Section Headers

```javascript
// Beautiful section headers
logger.header('🚀 DEPLOYMENT PROCESS');
logger.info('Building application...');
logger.info('Running tests...');
logger.success('All tests passed!');

// Custom styled headers
logger.header('⚠️  WARNINGS', ['yellow', 'bgRed', 'bold']);
logger.warn('Deprecated API usage detected');
logger.warn('Memory usage above 80%');

logger.header('✅ SYSTEM STATUS', ['white', 'bgGreen', 'bold']);
logger.info('All services operational');
```

### Data Tables

```javascript
// Display beautiful tables
logger.table([
  { service: 'API Gateway', status: '🟢 Healthy', latency: '12ms', uptime: '99.9%' },
  { service: 'Auth Service', status: '🟢 Healthy', latency: '8ms', uptime: '99.99%' },
  { service: 'Database', status: '🟡 Degraded', latency: '145ms', uptime: '95.2%' },
  { service: 'Cache', status: '🔴 Down', latency: '-', uptime: '0%' }
]);

// Custom header colors
logger.table(
  [
    { id: 1, product: 'MacBook Pro', price: '$2,399', stock: 15 },
    { id: 2, product: 'iPhone 15', price: '$999', stock: 143 },
    { id: 3, product: 'AirPods Pro', price: '$249', stock: 0 }
  ],
  ['brightCyan', 'bold', 'underline'] // Header styling
);
```

### Progress Bars

```javascript
// Animated progress bars
async function processFiles() {
  logger.header('📦 PROCESSING FILES');
  
  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 40, '█', '░');
    await new Promise(r => setTimeout(r, 100));
  }
  
  logger.success('✅ All files processed!');
}

// Different progress styles
logger.progressBar(75, 30, '▓', '░');  // Heavy blocks
logger.progressBar(50, 25, '●', '○');  // Circles
logger.progressBar(33, 20, '=', '-');  // Classic style
```

## 🎯 Simple API → Structured Data

### The Magic: Automatic Structure

```javascript
// You write simple logs...
logger.info('User logged in');
logger.error('Payment failed', new Error('Insufficient funds'));

// But transports receive rich structured data:
{
  id: 'log-1642329600000-abc123',
  timestamp: '2024-01-15T10:30:45.123Z',
  timestampMs: 1642329600000,
  level: 'info',
  message: 'User logged in',
  plainMessage: 'User logged in',  // Without ANSI codes
  loggerId: 'my-app',
  tags: ['production', 'api'],
  context: { version: '1.0.0', region: 'us-east-1' },
  metadata: { hostname: 'server-01', pid: 1234 },
  error: null  // Error object when present
}
```

### Context and Metadata

```javascript
// Global context for all logs
const logger = new Logger({
  id: 'payment-service',
  tags: ['payments', 'critical', 'v2'],
  context: {
    service: 'payment-api',
    version: '2.1.0',
    environment: 'production',
    region: 'us-east-1',
    instance: process.env.INSTANCE_ID
  }
});

// Per-log context merges with global
logger.info('Payment processed', {
  orderId: 'ORD-123',
  customerId: 'CUST-456',
  amount: 99.99,
  currency: 'USD',
  processingTime: 234,
  paymentMethod: 'credit_card'
});
```

## 🚀 Multiple Transports

### Built-in Transports

```javascript
import { 
  Logger, 
  ConsoleTransport, 
  FileTransport, 
  HTTPTransport,
  S3Transport,
  MongoDBTransport 
} from 'magiclogger';

const logger = new Logger({
  id: 'my-app',
  transports: [
    // Colorful console output
    new ConsoleTransport({
      level: 'debug',
      useColors: true,
      formatter: 'pretty'
    }),
    
    // Rotating file logs
    new FileTransport({
      filepath: './logs',
      rotation: 'daily',
      maxFiles: 7,
      compress: true,
      formatter: 'json'
    }),
    
    // HTTP with batching
    new HTTPTransport({
      url: 'https://logs.example.com',
      auth: { type: 'bearer', token: 'secret' },
      batch: true,
      maxBatchSize: 100,
      maxBatchTime: 5000,
      retry: { maxRetries: 3 }
    }),
    
    // S3 for archival
    new S3Transport({
      bucket: 'my-logs',
      region: 'us-east-1',
      compress: true,
      encryption: { type: 'AES256' }
    }),
    
    // MongoDB for queries
    new MongoDBTransport({
      url: 'mongodb://localhost:27017',
      database: 'logs',
      collection: 'app_logs'
    })
  ]
});
```

### Quick Setup Helper

```javascript
import { createLogger } from 'magiclogger';

// One-line setup
const logger = createLogger('my-service', {
  console: true,
  file: './logs/app.log',
  http: 'https://logs.example.com',
  s3: { bucket: 'my-logs' },
  level: 'debug',
  tags: ['api', 'v2']
});
```

## 🔄 Drop-in Compatibility

### Enhanced Console

```javascript
import { enhanceConsole } from 'magiclogger';

// Enhance global console
const { logger, restoreConsole } = enhanceConsole();

// Your existing console calls now have superpowers
console.log('Standard log');           // ✅ Works
console.error('Error message');         // ✅ Works
console.success('Operation complete');  // 🎉 New!
console.header('SECTION TITLE');        // 🎉 New!
console.progress(75);                   // 🎉 New!

// Plus color functions
const highlight = console.colorize('yellow', 'bold');
console.log(`Important: ${highlight('Read this!')}`);
```

### Winston Compatibility

```javascript
import { createWinstonCompatible } from 'magiclogger';

const logger = createWinstonCompatible({ level: 'info' });

// Use exactly like Winston
logger.info('Server started');
logger.error('Database error', { code: 'ECONNREFUSED' });

// Plus MagicLogger features
logger.header('DEPLOYMENT STATUS');
logger.table([...]);
logger.progress(50);
```

## 💪 Enterprise Features

### Retry and Fallbacks

```javascript
new HTTPTransport({
  url: 'https://primary-logs.example.com',
  
  // Automatic retry with exponential backoff
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 30000
  },
  
  // Fallback transport
  fallback: new FileTransport({
    filepath: './fallback-logs'
  }),
  
  // Dead letter queue for failed logs
  dlq: {
    enabled: true,
    filepath: './failed-logs'
  }
});
```

### Transport Filtering

```javascript
// Level-based filtering
new FileTransport({
  filepath: './errors.log',
  levels: ['error', 'fatal']
});

// Tag-based filtering
new S3Transport({
  bucket: 'audit-logs',
  tags: ['audit', 'security'],
  excludeTags: ['debug']
});

// Custom filter function
new HTTPTransport({
  url: 'https://metrics.example.com',
  filter: (entry) => entry.context?.metric !== undefined
});
```

### Request Correlation

```javascript
// Express middleware
app.use((req, res, next) => {
  req.logger = new Logger({
    context: {
      requestId: generateId(),
      correlationId: req.headers['x-correlation-id'],
      method: req.method,
      path: req.path,
      ip: req.ip
    }
  });
  
  req.logger.info('Request received');
  
  res.on('finish', () => {
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime
    });
  });
  
  next();
});
```

## 📊 Performance

### Benchmarks

[Performance benchmarks placeholder - coming soon]

- Logging throughput: [placeholder]
- Memory usage: [placeholder]
- Startup time: [placeholder]
- Transport performance: [placeholder]

### Optimizations

- Zero dependencies for minimal overhead
- Lazy loading of transports
- Efficient batching and buffering
- Async transport processing
- Minimal allocations in hot paths

## 🌟 Real-World Examples

### Production Logger Setup

```javascript
import { Logger, ConsoleTransport, FileTransport, S3Transport } from 'magiclogger';

const logger = new Logger({
  id: process.env.SERVICE_NAME || 'api',
  tags: [
    process.env.NODE_ENV || 'development',
    process.env.REGION || 'local',
    'v2'
  ],
  context: {
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    region: process.env.AWS_REGION,
    instance: process.env.INSTANCE_ID,
    commit: process.env.GIT_COMMIT
  },
  transports: [
    // Console in dev
    ...(process.env.NODE_ENV === 'development' ? [
      new ConsoleTransport({ 
        level: 'debug',
        useColors: true 
      })
    ] : []),
    
    // Always log to file
    new FileTransport({
      filepath: process.env.LOG_DIR || './logs',
      rotation: 'daily',
      maxFiles: 7,
      compress: true,
      level: process.env.LOG_LEVEL || 'info'
    }),
    
    // S3 in production
    ...(process.env.S3_LOGS_BUCKET ? [
      new S3Transport({
        bucket: process.env.S3_LOGS_BUCKET,
        region: process.env.AWS_REGION,
        compress: true,
        batch: true
      })
    ] : [])
  ]
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully');
  await logger.close();
  process.exit(0);
});

export default logger;
```

### Custom Transport Example

```javascript
class SlackTransport {
  constructor(options) {
    this.name = options.name || 'slack';
    this.webhook = options.webhook;
    this.channel = options.channel;
    this.levels = options.levels || ['error', 'fatal'];
  }
  
  async log(entry) {
    if (!this.levels.includes(entry.level)) return;
    
    await fetch(this.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: this.channel,
        text: `🚨 ${entry.level.toUpperCase()}: ${entry.message}`,
        attachments: [{
          color: entry.level === 'error' ? 'danger' : 'warning',
          fields: [
            { title: 'Service', value: entry.loggerId, short: true },
            { title: 'Time', value: entry.timestamp, short: true },
            { title: 'Error', value: entry.error?.message || 'N/A' }
          ]
        }]
      })
    });
  }
}

// Use it
logger.addTransport(new SlackTransport({
  webhook: process.env.SLACK_WEBHOOK,
  channel: '#alerts'
}));
```

## 📚 Learn More

- **[API Reference](./api_usage.md)** - Complete API documentation
- **[Transport Guide](./intro.md#-multiple-transports)** - All transport options
- **[Styling Guide](./styling.md)** - Colors, tables, and formatting
- **[Browser Storage](./browser_storage.md)** - Client-side logging
- **[Terminal Support](./terminal_support.md)** - Terminal detection

## 🏢 About Manic.agency

MagicLogger is built with ❤️ by [Manic.agency](https://manic.agency) - where mania-driven development meets beautiful code.

---

Ready to add magic to your logs? Let's get started! 🎨