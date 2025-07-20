# MagicLogger 🌈

<!-- VERSION_BADGE_PLACEHOLDER -->
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
<!-- /VERSION_BADGE_PLACEHOLDER -->

<p align="center">
  <a href="https://manicinc.github.io/magiclogger/">
    <img src="https://raw.githubusercontent.com/manicinc/magiclogger/main/website/static/img/magiclogger-primary-no-subtitle.svg" alt="MagicLogger" width="400">
  </a>
</p>

<p align="center">
  <strong>The most powerful TypeScript/JavaScript logging library</strong><br>
  <em>Simple API → Structured Data • Beautiful Output • Zero Dependencies</em>
</p>

<p align="center">
  <a href="https://manic.agency" target="_blank">
    <img src="https://img.shields.io/badge/Made%20by-Manic.agency-blueviolet" alt="Made by Manic.agency">
  </a>
  <a href="#license">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue.svg" alt="TypeScript">
  </a>
  <a href="#installation">
    <img src="https://img.shields.io/badge/npm-magiclogger-red.svg" alt="npm">
  </a>
</p>

<p align="center">
  <a href="https://manicinc.github.io/magiclogger/">
    <img src="https://via.placeholder.com/800x400/1a1a1a/ffffff?text=MagicLogger+Demo" alt="MagicLogger Demo">
  </a>
</p>

## ✨ Why MagicLogger?

Write simple logs, get powerful features:

```javascript
// You write this...
logger.info('User logged in');

// MagicLogger automatically creates this:
{
  id: 'log-1642329600000-abc123',
  timestamp: '2024-01-15T10:30:45.123Z',
  level: 'info',
  message: 'User logged in',
  loggerId: 'my-app',
  tags: ['production', 'api'],
  context: { version: '1.0.0', region: 'us-east-1' },
  metadata: { hostname: 'server-01', pid: 1234 }
}
```

## 🎯 Key Features

<table>
<tr>
<td width="50%">

### 🚀 Powerful Features
- **Multiple Transports** - Console, File, HTTP, S3, MongoDB, WebSocket
- **Automatic Structure** - Simple logs become rich data
- **Smart Batching** - Efficient network usage
- **Retry & Fallback** - Never lose a log
- **Request Correlation** - Track across services
- **Type-Safe** - Full TypeScript support

</td>
<td width="50%">

### 🎨 Beautiful Output
- **Rich Colors** - 256 colors + RGB support
- **Styled Headers** - Section separators
- **Data Tables** - Formatted tabular data
- **Progress Bars** - Visual progress tracking
- **Custom Themes** - Your brand colors
- **Smart Detection** - Adapts to any terminal

</td>
</tr>
</table>

## 📦 Installation

```bash
npm install magiclogger
# or
yarn add magiclogger
# or
pnpm add magiclogger
```

### Optional Dependencies

```bash
# For specific transports
npm install @aws-sdk/client-s3      # S3 transport
npm install mongodb                 # MongoDB transport
npm install ws                      # WebSocket transport
```

## 🚀 Quick Start

### Zero Configuration

```javascript
import { Logger } from 'magiclogger';

const logger = new Logger();

// Beautiful colored output out of the box
logger.info('🚀 Application started');
logger.success('✅ Database connected');
logger.warn('⚠️  Cache miss for key: user_123');
logger.error('❌ Payment failed', new Error('Card declined'));
```

### With Style

```javascript
// Create color functions
const highlight = logger.color('yellow', 'bold');
const error = logger.color('red', 'underline');
const success = logger.color('green', 'bold');

// Use in your logs
logger.info(`Server running on ${highlight('port 3000')}`);
logger.error(`${error('Critical')} - System resources low`);
logger.success(`Deployment ${success('completed')} in 2.5s`);

// Color specific parts
logger.info(
  logger.colorParts('Processing user:john (ID: 12345) - Status: Active', {
    'user:john': ['cyan', 'bold'],
    '12345': ['yellow'],
    'Active': ['green', 'bold']
  })
);
```

## 🎨 Visual Features

### Beautiful Headers

```javascript
logger.header('🚀 DEPLOYMENT STATUS');
logger.info('Building application...');
logger.success('Build completed');

logger.header('⚠️  WARNINGS', ['yellow', 'bgRed', 'bold']);
logger.warn('Deprecated API usage');
logger.warn('Memory usage: 85%');
```

### Data Tables

```javascript
logger.table([
  { service: 'API Gateway', status: '🟢 Healthy', uptime: '99.9%', requests: '1.2M/day' },
  { service: 'Database', status: '🟡 Degraded', uptime: '95.2%', requests: '800K/day' },
  { service: 'Cache', status: '🔴 Down', uptime: '0%', requests: '0/day' }
]);
```

### Progress Bars

```javascript
// Download progress
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i, 40, '█', '░');
  await sleep(100);
}
logger.success('✅ Download complete!');
```

## 🔌 Multiple Transports

Send logs to multiple destinations simultaneously:

```javascript
import { Logger, ConsoleTransport, FileTransport, HTTPTransport } from 'magiclogger';

const logger = new Logger({
  id: 'my-app',
  tags: ['production', 'api'],
  context: {
    version: '2.1.0',
    region: 'us-east-1'
  },
  transports: [
    // Beautiful console output
    new ConsoleTransport({
      level: 'debug',
      useColors: true
    }),
    
    // Rotating file logs
    new FileTransport({
      filepath: './logs',
      rotation: 'daily',
      maxFiles: 7,
      compress: true
    }),
    
    // Central log aggregation
    new HTTPTransport({
      url: 'https://logs.example.com',
      auth: { type: 'bearer', token: process.env.LOG_TOKEN },
      batch: true,
      retry: { maxRetries: 3 }
    })
  ]
});
```

### Quick Setup

```javascript
import { createLogger } from 'magiclogger';

// One-liner with common transports
const logger = createLogger('my-service', {
  console: true,
  file: './logs/app.log',
  http: 'https://logs.example.com',
  level: 'debug'
});
```

## 📊 Structured Logging

### Context & Metadata

```javascript
// Global context
const logger = new Logger({
  id: 'payment-service',
  tags: ['payments', 'critical'],
  context: {
    service: 'payment-api',
    version: '2.1.0',
    environment: 'production'
  }
});

// Per-log context
logger.info('Payment processed', {
  orderId: 'ORD-123',
  amount: 99.99,
  currency: 'USD',
  processingTime: 145
});
```

### Error Handling

```javascript
try {
  await processPayment();
} catch (error) {
  logger.error('Payment failed', {
    error,
    orderId: order.id,
    customerId: customer.id,
    attemptNumber: 3
  });
}
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
      path: req.path
    }
  });
  next();
});
```

## 🎯 Advanced Features

### Transport Filtering

```javascript
// Send only errors to Slack
new SlackTransport({
  webhook: process.env.SLACK_WEBHOOK,
  levels: ['error'],
  tags: ['critical']
});

// Audit logs to S3
new S3Transport({
  bucket: 'audit-logs',
  tags: ['audit', 'compliance'],
  compress: true,
  encryption: true
});
```

### Retry & Fallback

```javascript
new HTTPTransport({
  url: 'https://primary.example.com',
  retry: {
    maxRetries: 3,
    backoff: 'exponential'
  },
  fallback: new FileTransport({
    filepath: './fallback.log'
  }),
  dlq: {
    enabled: true,
    filepath: './failed-logs'
  }
});
```

### Custom Formatters

```javascript
new FileTransport({
  filepath: './app.log',
  formatter: (entry) => {
    // Custom format
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}\n`;
  }
});
```

## 🏆 Performance

<table>
<tr>
<th>Metric</th>
<th>MagicLogger</th>
<th>Winston</th>
<th>Bunyan</th>
<th>Pino</th>
</tr>
<tr>
<td>Logs/second</td>
<td><strong>[placeholder]</strong></td>
<td>[placeholder]</td>
<td>[placeholder]</td>
<td>[placeholder]</td>
</tr>
<tr>
<td>Memory usage</td>
<td><strong>[placeholder]</strong></td>
<td>[placeholder]</td>
<td>[placeholder]</td>
<td>[placeholder]</td>
</tr>
<tr>
<td>Startup time</td>
<td><strong>[placeholder]</strong></td>
<td>[placeholder]</td>
<td>[placeholder]</td>
<td>[placeholder]</td>
</tr>
<tr>
<td>Bundle size</td>
<td><strong>0 KB</strong> (zero deps)</td>
<td>240 KB</td>
<td>180 KB</td>
<td>45 KB</td>
</tr>
</table>

## 🔄 Drop-in Compatibility

Replace your existing logger without changing code:

```javascript
// Winston compatible
import { createWinstonCompatible } from 'magiclogger';
const logger = createWinstonCompatible({ level: 'info' });

// Bunyan compatible
import { createBunyanCompatible } from 'magiclogger';
const logger = createBunyanCompatible({ name: 'myapp' });

// Pino compatible
import { createPinoCompatible } from 'magiclogger';
const logger = createPinoCompatible({ prettyPrint: true });

// Enhanced console
import { enhanceConsole } from 'magiclogger';
enhanceConsole(); // Now console.log has superpowers!
```

## 📚 Complete Example

```javascript
import { Logger, ConsoleTransport, FileTransport, S3Transport } from 'magiclogger';

// Production-ready setup
const logger = new Logger({
  id: process.env.SERVICE_NAME || 'api',
  tags: [process.env.NODE_ENV, 'v2'],
  context: {
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
    region: process.env.AWS_REGION,
    instance: process.env.INSTANCE_ID
  },
  transports: [
    // Console for development
    ...(process.env.NODE_ENV === 'development' ? [
      new ConsoleTransport({ 
        level: 'debug',
        useColors: true,
        formatter: 'pretty'
      })
    ] : []),
    
    // Always log to file
    new FileTransport({
      filepath: process.env.LOG_DIR || './logs',
      rotation: 'daily',
      maxFiles: 7,
      compress: true
    }),
    
    // S3 for production
    ...(process.env.S3_BUCKET ? [
      new S3Transport({
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
        compress: true,
        batch: {
          size: 1000,
          timeout: 30000
        }
      })
    ] : [])
  ]
});

// Beautiful logging in action
logger.header('🚀 APPLICATION STARTUP');
logger.info('Loading configuration...');
logger.success('✅ Config loaded');
logger.info('Connecting to database...');
logger.success('✅ Database connected');
logger.info('Starting HTTP server...');
logger.success(`✅ Server listening on ${logger.color('cyan', 'bold')('port 3000')}`);

// Structured error handling
app.use((err, req, res, next) => {
  req.logger.error('Request failed', {
    error: err,
    statusCode: err.status || 500,
    stack: err.stack
  });
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.warn('⚠️  SIGTERM received, shutting down gracefully');
  await logger.close();
  process.exit(0);
});

export default logger;
```

## 📖 Documentation

- **[📚 Full Documentation](./docs/intro.md)** - Complete guide with examples
- **[🎨 API Reference](./docs/api_usage.md)** - Detailed API documentation
- **[🚀 Transport Guide](./docs/transport.md)** - All transport options
- **[🔄 Compatibility](./docs/compatibility.md)** - Drop-in replacements
- **[💻 Terminal Support](./docs/terminal_support.md)** - Color detection
- **[🌐 Browser Storage](./docs/browser_storage.md)** - Client-side logging

## 🛠️ API Reference

### Core Methods

```typescript
// Logging methods
logger.info(message: string, meta?: any): void
logger.warn(message: string, meta?: any): void
logger.error(message: string, meta?: any): void
logger.debug(message: string, meta?: any): void
logger.success(message: string, meta?: any): void

// Styling methods
logger.color(...styles: string[]): (text: string) => string
logger.colorParts(message: string, parts: Record<string, string[]>): string
logger.header(title: string, styles?: string[]): void
logger.table(data: any[], headerStyle?: string[]): void
logger.progressBar(percent: number, width?: number): void

// Transport management
logger.addTransport(transport: Transport): Promise<void>
logger.removeTransport(name: string): Promise<void>
logger.listTransports(): string[]
```

### Configuration

```typescript
interface LoggerOptions {
  id?: string                      // Logger identifier
  tags?: string[]                  // Global tags
  context?: Record<string, any>    // Global context
  transports?: Transport[]         // Output destinations
  verbose?: boolean                // Show debug logs
  useColors?: boolean              // Enable colors
  idGenerator?: () => string       // Custom ID generator
}
```

## 🏃 Getting Started

### 1. Basic Logging

```javascript
import { Logger } from 'magiclogger';

const logger = new Logger();
logger.info('Hello, MagicLogger!');
```

### 2. Add Context

```javascript
const logger = new Logger({
  id: 'my-app',
  tags: ['production'],
  context: { version: '1.0.0' }
});

logger.info('User action', { userId: 123 });
```

### 3. Multiple Outputs

```javascript
const logger = new Logger({
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filepath: './logs' })
  ]
});
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./docs/contributing.md).

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md) for details.

## 🏢 About Manic.agency

<p align="center">
  <a href="https://manic.agency" target="_blank">
    <img src="https://raw.githubusercontent.com/manicinc/magiclogger/main/website/static/img/magiclogger-icon.svg" alt="Manic Agency" width="32" height="32">
  </a><br>
  <strong>Made with ❤️ by <a href="https://manic.agency">Manic.agency</a></strong><br>
  <em>Building the future of developer tools</em>
</p>

<p align="center">
  <a href="https://manic.agency">Website</a> •
  <a href="mailto:team@manic.agency">Contact</a> •
  <a href="https://github.com/manicinc">GitHub</a>
</p>

---

<p align="center">
  <strong>Ready to add magic to your logs?</strong><br>
  <code>npm install magiclogger</code>
</p>