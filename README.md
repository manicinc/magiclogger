# MagicLogger 🪄
<p align="center">
  <img src="./website/static/img/magiclogger-primary-no-subtitle.svg" alt="MagicLogger" width="400">
</p>
<p align="center">
  <strong>Zero-overhead, structured logging for modern JavaScript</strong><br>
  <em>Beautiful Colors • Rich Styling • Simple API • Tree-Shakeable • Type-Safe</em>
</p>
<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#styling-showcase">Styling</a> •
  <a href="#api-reference">API</a> •
  <a href="#examples">Examples</a> •
  <a href="#performance">Performance</a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/zero_dependencies-✓-blue" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/core_gzip-31kb-brightgreen" alt="core_gzip">  <img src="https://img.shields.io/badge/core_console_gzip-31kb-brightgreen" alt="core_console_gzip">  <img src="https://img.shields.io/badge/core_transports_gzip-40kb-brightgreen" alt="core_transports_gzip">  <img src="https://img.shields.io/badge/compat_gzip-38kb-brightgreen" alt="compat_gzip"></p>
## Why MagicLogger?
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
logger.s`@red.bold{CRITICAL:} Server is @yellow{shutting down} at @cyan{${new Date().toISOString()}}`;
logger.header('🚀 DEPLOYMENT STARTED');
logger.progressBar(75);
logger.table([
  { service: 'API', status: 'healthy', uptime: '99.9%' },
  { service: 'DB', status: 'degraded', uptime: '95.2%' }
]);
```
### The Problem with Other Loggers
- **Winston**: Complex configuration, heavy dependencies
- **Bunyan**: Outdated API, poor tree-shaking  
- **Pino**: Limited styling, no visual elements
- **Console**: No structure, no colors, no organization
### The MagicLogger Solution
- 🎯 **Zero-overhead** sync logging by default
- 🌈 **Rich colors & styling** with automatic terminal detection
- 📊 **Visual elements** - tables, progress bars, headers
- 🌲 **Perfect tree-shaking** - only pay for what you use
- 🔄 **Drop-in compatibility** with Winston/Bunyan/Pino
- ⚡ **Optional async logging** with ring buffers
- 🚀 **Transport system** for any destination
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
---
## Styling Showcase
### 🎨 Modern Styling APIs (No String Matching!)
#### Tagged Template Literals (Recommended)
```typescript
// Clean, inline styling with template literals
logger.s`@red.bold{Error:} Failed to connect to database @yellow.underline{users_db} on @cyan{localhost:5432}`;
// With variables
const errorType = 'Connection Error';
const database = 'production_db';
const timestamp = new Date().toISOString();
logger.s`@red.bold{${errorType}} Database @yellow{${database}} failed at @dim{${timestamp}}`;
// Multiple styles
logger.s`
  @white.bgRed.bold{ CRITICAL } 
  @yellow{Warning:} System memory at @red.bold{92%} 
  @dim{(threshold: 90%)}
`;
// Nested styling
logger.s`
  @green{✓ Success:} Deployed @cyan.bold{v2.4.1} to @blue.underline{production}
  @dim{Took @yellow{45.2s} with @green{0 errors}}
`;
```
#### Array Parts API (Explicit & Type-Safe)
```typescript
// Each part is a tuple of [text, ...styles]
logger.parts([
  ['CRITICAL:', 'red', 'bold'],
  [' Database connection lost at '],
  [new Date().toISOString(), 'yellow'],
  [' - attempting reconnect...', 'dim']
]);
// Building complex messages
logger.parts([
  ['[', 'dim'],
  ['ERROR', 'red', 'bold'],
  [']', 'dim'],
  [' ', ''],
  ['Request failed:', 'white'],
  [' GET ', 'blue', 'bold'],
  ['/api/users', 'cyan', 'underline'],
  [' - ', 'dim'],
  ['401', 'yellow', 'bold'],
  [' Unauthorized', 'yellow']
]);
// With metadata
const logParts = [
  ['User', 'green'],
  [' alice@example.com ', 'green', 'bold'],
  ['performed', ''],
  [' DELETE ', 'red', 'bold'],
  ['on', ''],
  [' 150 records', 'yellow', 'underline']
];
logger.parts(logParts);
```
#### Index-Based Styling (By Word Position)
```typescript
// Style by word index (0-based)
logger.styleByIndex(
  'ERROR: Failed to connect to database users_db on localhost:5432',
  {
    0: ['red', 'bold'],        // "ERROR:"
    6: ['yellow', 'underline'], // "users_db"
    8: ['cyan']                 // "localhost:5432"
  }
);
// Complex log styling
logger.styleByIndex(
  'GET /api/v2/users?page=1&limit=50 200 OK 45ms',
  {
    0: ['blue', 'bold'],    // "GET"
    1: ['cyan', 'underline'], // "/api/v2/users?page=1&limit=50"
    2: ['green', 'bold'],   // "200"
    3: ['green'],           // "OK"
    4: ['magenta']          // "45ms"
  }
);
// Error messages
logger.styleByIndex(
  'CRITICAL: Memory usage 95% exceeds threshold 90% on server prod-01',
  {
    0: ['red', 'bold', 'bgWhite'],  // "CRITICAL:"
    3: ['red', 'bold'],              // "95%"
    6: ['yellow'],                   // "90%"
    9: ['cyan', 'underline']         // "prod-01"
  }
);
```
### 🌈 Rich Colors & Styling
```typescript
// Create reusable color functions
const highlight = logger.color('yellow', 'bold');
const code = logger.color('brightGreen');
const error = logger.color('brightRed', 'bold');
const path = logger.color('brightCyan', 'underline');
console.log(`${highlight('Important:')} Check logs at ${path('./logs/app.log')}`);
console.log(`Use ${code('logger.color()')} for consistent styling`);
console.log(`${error('Warning:')} System requires attention`);
```
### 🎨 Style Presets
```typescript
// Predefined style combinations
logger.styled('Critical system notification', 'important');
logger.styled('Operation completed successfully', 'success'); 
logger.styled('Warning about potential issues', 'warning');
logger.styled('Error message for failures', 'error');
logger.styled('Code sample or command', 'code');
logger.styled('Subtle information', 'muted');
```
### 📊 Visual Elements
```typescript
// Headers with custom styling
logger.header('🚀 DEPLOYMENT PIPELINE', ['brightWhite', 'bgBlue', 'bold']);
// Progress bars
logger.progressBar(75);                           // 75% with defaults
logger.progressBar(50, 40, '█', '░');            // Custom style
// Animated progress
for (let i = 0; i <= 100; i += 5) {
  logger.progressBar(i, 40, '█', '░');
  await sleep(50);
}
// Data tables
logger.table([
  { id: 1, name: 'Alice', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob', role: 'User', status: 'Inactive' },
  { id: 3, name: 'Charlie', role: 'Editor', status: 'Active' }
], ['brightGreen', 'bold']); // Custom header colors
```
### 🏷️ Custom Prefixes
```typescript
// Domain-specific prefixes with custom styling
logger.custom('Database connected successfully', ['green', 'bold'], 'DB');
logger.custom('Authentication token expired', ['red', 'bold'], 'AUTH');
logger.custom('GET /api/users (200 OK, 45ms)', ['blue'], 'API');
logger.custom('Memory usage: 128MB (24% increase)', ['magenta'], 'SYSTEM');
```
---
## Real-World Examples
### 🖥️ Server Monitoring with Modern Styling
```typescript
const logger = new Logger({ useColors: true });
// Using tagged templates for monitoring
const metrics = { cpu: 85, memory: 67, responseTime: 120 };
logger.s`
  @white.bgBlue.bold{ SYSTEM METRICS }
  CPU: @${metrics.cpu > 80 ? 'red.bold' : metrics.cpu > 60 ? 'yellow' : 'green'}{${metrics.cpu}%}
  Memory: @${metrics.memory > 70 ? 'red' : 'yellow'}{${metrics.memory}%}
  Response: @cyan{${metrics.responseTime}ms}
`;
// Automatic alerts with styled output
if (metrics.cpu > 80) {
  logger.s`@red.bold{⚠ ALERT:} CPU usage critical at @red.underline{${metrics.cpu}%}`;
}
```
### 🔍 Log Analysis with Multiple Styling Methods
```typescript
// Using tagged templates for security events
logger.s`
  @dim{[2024-01-20 14:32:01]} @red.bold{ERROR:} @red{Failed login} for 
  @yellow.bold.underline{admin} from @cyan.bold{192.168.1.100}
`;
// Using array parts for structured logs
logger.parts([
  ['[SECURITY]', 'red', 'bgWhite', 'bold'],
  [' Potential brute force detected: ', 'red'],
  ['5 failed attempts', 'yellow', 'bold'],
  [' in ', ''],
  ['30 seconds', 'yellow'],
  [' from IP ', ''],
  ['192.168.1.100', 'cyan', 'underline']
]);
// Using index-based styling for parsed logs
const logLine = 'CRITICAL Security Auth 3 attempts 192.168.1.100 BLOCKED';
logger.styleByIndex(logLine, {
  0: ['red', 'bold', 'bgWhite'],  // CRITICAL
  1: ['red'],                      // Security
  2: ['yellow'],                   // Auth
  3: ['yellow', 'bold'],           // 3
  5: ['cyan', 'underline'],        // IP
  6: ['green', 'bold']             // BLOCKED
});
```
### 🚀 Deployment Pipeline with Rich Visuals
```typescript
logger.header('🚀 DEPLOYMENT PIPELINE', ['brightWhite', 'bgBlue', 'bold']);
// Stage 1: Build with styled output
logger.s`@blue{STAGE 1/4:} @white{Building application...}`;
for (let i = 0; i <= 100; i += 5) {
  logger.progressBar(i, 40, '█', '░');
  await sleep(50);
}
logger.s`@green.bold{✓ Build completed} @dim{(450 files, 2.3MB)}`;
// Stage 2: Testing with parts API
logger.parts([
  ['STAGE 2/4:', 'blue'],
  [' Running tests...', 'white']
]);
logger.parts([
  ['PASS', 'green', 'bold'],
  [' Unit Tests ', ''],
  ['(342 tests)', 'cyan']
]);
// Stage 3: Deployment status updates
logger.s`
  @blue{STAGE 3/4:} Deploying to @cyan.underline{production}
  @dim{Region: us-east-1 | Instances: 4}
`;
// Final status with rich formatting
logger.header('✅ DEPLOYMENT SUCCESSFUL', ['brightWhite', 'bgGreen', 'bold']);
logger.s`
  @green.bold{Version ${version}} deployed to @cyan{production}
  @dim{Completed in @yellow{4m 32s} with @green{0 errors}}
`;
```
### ⚕️ Health Checks with Dynamic Styling
```typescript
const services = [
  { name: 'API Gateway', status: 'ONLINE', latency: 45 },
  { name: 'Database', status: 'DEGRADED', latency: 320 },
  { name: 'Cache', status: 'OFFLINE', latency: null }
];
logger.header('🔍 SYSTEM HEALTH CHECK', ['brightWhite', 'bgBlue', 'bold']);
services.forEach(service => {
  // Using tagged templates with conditional styling
  const statusStyle = service.status === 'ONLINE' ? 'green.bold' : 
                     service.status === 'DEGRADED' ? 'yellow.bold' : 'red.bold';
  const icon = service.status === 'ONLINE' ? '✓' : 
               service.status === 'DEGRADED' ? '⚠' : '✗';
  logger.s`
    ${icon} @white{${service.name}:} @${statusStyle}{${service.status}} 
    ${service.latency ? `@dim{(${service.latency}ms)}` : '@dim{(no response)}'}
  `;
});
// Summary using parts API
const onlineCount = services.filter(s => s.status === 'ONLINE').length;
logger.parts([
  ['Summary:', 'white', 'bold'],
  [` ${onlineCount}/${services.length} `, 'green'],
  ['services operational', '']
]);
```
### 📈 Performance Monitoring
```typescript
// Request logging with index-based styling
const requests = [
  'GET /api/users 200 OK 45ms',
  'POST /api/auth/login 401 Unauthorized 23ms',
  'DELETE /api/posts/123 204 No_Content 67ms',
  'GET /api/dashboard 500 Internal_Error 1230ms'
];
requests.forEach(req => {
  const parts = req.split(' ');
  const statusCode = parseInt(parts[2]);
  // Dynamic styling based on status code
  const styles: Record<number, string[]> = {};
  styles[0] = ['blue', 'bold'];  // Method
  styles[1] = ['cyan', 'underline'];  // Path
  styles[2] = statusCode >= 500 ? ['red', 'bold'] :
              statusCode >= 400 ? ['yellow', 'bold'] :
              ['green', 'bold'];  // Status code
  styles[3] = statusCode >= 500 ? ['red'] :
              statusCode >= 400 ? ['yellow'] :
              ['green'];  // Status text
  styles[4] = ['magenta'];  // Response time
  logger.styleByIndex(req, styles);
});
```
---
## Advanced Features
### 🌲 Tree-Shakeable Imports
```typescript
// Import only what you need for minimal bundle size
import { Logger } from 'magiclogger';
import { ConsoleTransport } from 'magiclogger/transports/console';
import { FileTransport } from 'magiclogger/transports/file';
// Core transports (zero external dependencies)
const logger = new Logger({
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filepath: './logs/app.log' })
  ]
});
// Optional transports (loaded dynamically)
if (process.env.NODE_ENV === 'production') {
  const { S3Transport } = await import('magiclogger/transports/s3');
  logger.addTransport(new S3Transport({
    bucket: 'my-logs',
    region: 'us-east-1'
  }));
}
```
### ⚡ High-Performance Async Logging
```typescript
const logger = new Logger({
  async: {
    enabled: true,
    buffer: { 
      size: 100000,        // 100k entries
      flushInterval: 1000, // Flush every second
      flushSize: 1000      // Or every 1000 logs
    },
    useWorkers: true,      // Offload to worker threads
    workerCount: 2
  }
});
// Handles millions of logs per second
for (let i = 0; i < 1000000; i++) {
  logger.info('High frequency log', { index: i });
}
// Critical logs bypass buffer
logger.error('Critical error', { 
  async: false,  // Force sync
  error: new Error('System failure')
});
```
### 🔄 Drop-in Compatibility
```typescript
// Winston compatibility
import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
const winston = createWinstonCompatible();
// Your existing Winston code works unchanged
winston.info('Hello world');
winston.error('Error message', new Error('Something failed'));
// But you get MagicLogger features!
winston.s`@green{Success:} Migration complete!`;
winston.table([
  { service: 'API', status: 'healthy' },
  { service: 'DB', status: 'degraded' }
]);
```
### 🏷️ Context & Tags
```typescript
// Global context
const logger = new Logger({
  context: { 
    service: 'payment-api',
    environment: 'production' 
  },
  tags: ['payments', 'critical']
});
// Request-scoped logger
const requestLogger = logger.child({
  context: {
    requestId: 'req_123',
    userId: 'user_456'
  },
  tags: ['http', 'api']
});
// All logs automatically include context
requestLogger.info('Payment processed', {
  amount: 99.99,
  currency: 'USD'
});
```
---
## Transport System
### Core Transports (Zero Dependencies)
```typescript
import { 
  ConsoleTransport,
  FileTransport, 
  StreamTransport,
  HTTPTransport 
} from 'magiclogger/transports';
const logger = new Logger({
  transports: [
    // Beautiful console output
    new ConsoleTransport({ 
      useColors: true,
      level: 'debug' 
    }),
    // Rotating file logs
    new FileTransport({
      filepath: './logs/app.log',
      maxFileSize: 10485760, // 10MB
      maxFiles: 5,
      compress: true
    }),
    // HTTP endpoint
    new HTTPTransport({
      url: 'https://logs.example.com',
      batch: { maxSize: 100, maxTime: 5000 },
      retry: { maxRetries: 3 }
    })
  ]
});
```
### Optional Transports (Tree-Shakeable)
```typescript
// Only loaded when explicitly imported
import { S3Transport } from 'magiclogger/transports/s3';
import { MongoDBTransport } from 'magiclogger/transports/mongodb';
// Cloud storage
logger.addTransport(new S3Transport({
  bucket: 'my-logs',
  region: 'us-east-1',
  prefix: 'logs/',
  maxBatchSize: 1000
}));
// Database logging
logger.addTransport(new MongoDBTransport({
  uri: 'mongodb://localhost:27017',
  database: 'logs',
  collection: 'application'
}));
```
---
## API Reference
### Logger Options
```typescript
interface LoggerOptions {
  // Appearance
  useColors?: boolean;                  // Enable colors (default: auto-detect)
  verbose?: boolean;                    // Show debug logs
  theme?: string | ThemeDefinition;     // Color theme
  // Behavior  
  id?: string;                          // Logger identifier
  tags?: string[];                      // Global tags
  context?: Record<string, any>;        // Global context
  // Performance
  async?: {
    enabled?: boolean;                  // Enable async logging
    buffer?: {
      size?: number;                    // Buffer size (default: 10000)
      flushInterval?: number;           // Flush interval ms
      flushSize?: number;               // Flush at size
    };
    useWorkers?: boolean;               // Use worker threads
    workerCount?: number;               // Number of workers
  };
  // Transports
  transports?: Transport[];             // Log destinations
}
```
### Logging Methods
```typescript
// Standard levels
logger.info(message: string, meta?: any): void
logger.success(message: string, meta?: any): void
logger.warn(message: string, meta?: any): void
logger.error(message: string, meta?: any): void
logger.debug(message: string, meta?: any): void
// Universal method
logger.log(message: string, level?: LogLevel): void
// Async logging  
await logger.async.info(message: string, options?: AsyncOptions)
// Modern styling methods (NEW!)
logger.s`@red.bold{text} with @yellow{colors}`: void  // Tagged template
logger.parts([['text', 'red', 'bold']]): void        // Array parts
logger.styleByIndex(text: string, styles: Record<number, ColorName[]>): void
// Legacy styling (deprecated)
logger.custom(message: string, styles: ColorName[], prefix?: string): void
logger.styled(message: string, preset: StylePreset): void
logger.header(text: string, styles?: ColorName[]): void
// Visual elements
logger.table(data: Record<string, any>[], headerStyles?: ColorName[]): void
logger.progressBar(percent: number, length?: number, filled?: string, empty?: string): void
// Utility methods
logger.color(...styles: ColorName[]): (text: string) => string
```
### Color Names & Styles
```typescript
// Colors
type ColorName = 
  | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'
  | 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow' 
  | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'
  | 'bgBlack' | 'bgRed' | 'bgGreen' | 'bgYellow' | 'bgBlue' | 'bgMagenta' | 'bgCyan' | 'bgWhite'
  | 'bold' | 'dim' | 'italic' | 'underline' | 'blink' | 'reverse' | 'strikethrough';
// Style presets
type StylePreset = 
  | 'info' | 'success' | 'warning' | 'error' | 'debug' 
  | 'important' | 'highlight' | 'muted' | 'special' | 'code' | 'header';
```
---
## Performance
### Benchmarks (ops/sec)
**Sync Logging:**
```
MagicLogger:     850,000  ████████████████████
Pino:            800,000  ███████████████████  
Bunyan:          120,000  ███
Winston:          40,000  █
Console.log:     200,000  █████
```
**Async Logging:**
```
MagicLogger:   2,500,000  ████████████████████
Pino (worker):   400,000  ███
Winston:          15,000  
Bunyan:           30,000  
```
### Bundle Sizes (gzipped)
| Scenario | Size |
|----------|------|
| Core logger only | 1.34 kB |
| Core + console transport | 32.2 kB |
| Core + all core transports | 40.6 kB |
| All compatibility layers | 39 kB |
---
## Migration Guides
### From Winston
```typescript
// Before
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
// After (Option 1: Full migration)
import { Logger, FileTransport } from 'magiclogger';
const logger = new Logger({
  transports: [
    new FileTransport({ filepath: 'error.log', levels: ['error'] }),
    new FileTransport({ filepath: 'combined.log' })
  ]
});
// After (Option 2: Compatibility mode)
import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
const logger = createWinstonCompatible({
  // Your existing Winston config works!
});
```
### From Pino
```typescript
// Before
const pino = require('pino');
const logger = pino({ level: 'info' });
// After
import { createPinoCompatible } from 'magiclogger/compatibility/pino';
const logger = createPinoCompatible({ level: 'info' });
```
---
## TypeScript Support
Full TypeScript support with intelligent type inference:
```typescript
import { Logger, LogLevel, ColorName, StylePreset } from 'magiclogger';
// Type-safe options
const options: LoggerOptions = {
  verbose: true,
  theme: 'dark',
  useColors: true
};
const logger = new Logger(options);
// Type-safe styling
const colors: ColorName[] = ['blue', 'bold'];
const preset: StylePreset = 'important';
// Modern APIs with full typing
logger.s`@red.bold{Error:} ${message}`;  // Template literal typing
logger.parts([
  ['text', 'red', 'bold'],  // Tuple typing
  ['more text']
]);
logger.styleByIndex('Error message', {
  0: ['red', 'bold']  // Index-based typing
});
// Compile-time level checking
function logWithLevel(message: string, level: LogLevel) {
  logger.log(message, level);
}
logWithLevel('Valid message', 'info');     // ✅ Valid
// logWithLevel('Invalid', 'invalid');     // ❌ TypeScript error
```
---
## Ecosystem
### Frameworks
```typescript
// Express.js middleware
app.use((req, res, next) => {
  req.logger = logger.child({
    context: { requestId: req.id, path: req.path },
    tags: ['http', req.method.toLowerCase()]
  });
  // Log with styled output
  req.logger.s`@blue.bold{${req.method}} @cyan{${req.path}} from @yellow{${req.ip}}`;
  next();
});
// Fastify plugin
fastify.register(async function (fastify) {
  fastify.addHook('onRequest', async (request) => {
    request.logger = logger.child({
      context: { requestId: request.id }
    });
    // Use modern styling
    request.logger.s`@dim{[${request.id}]} @blue{${request.method}} @cyan{${request.url}}`;
  });
});
```
### Cloud Integrations
```typescript
// AWS CloudWatch
import { CloudWatchTransport } from 'magiclogger/transports/cloudwatch';
logger.addTransport(new CloudWatchTransport({
  logGroupName: '/aws/lambda/my-function',
  region: 'us-east-1'
}));
// Google Cloud Logging
import { GoogleCloudTransport } from 'magiclogger/transports/gcloud';
logger.addTransport(new GoogleCloudTransport({
  projectId: 'my-project',
  logName: 'application'
}));
```
---
## Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
### Development Setup
```bash
# Clone the repository
git clone https://github.com/manicinc/magiclogger.git
cd magiclogger
# Install dependencies
npm install
# Run tests
npm test
# Build the project
npm run build
# Run demos
npm run demo:animated
npm run demo:styles
npm run demo:typescript
```
---
## License
MIT © [Manic.agency](https://manic.agency)
<p align="center">
  Made with ❤️ by <a href="https://manic.agency">Manic.agency</a>
</p>
---


## 📦 Build Output Sizes

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 2.89 kB | 703 B |
| `index.js` | ESM | 1.34 kB | 508 B |
| `index.d.ts` | Types | 147 kB | 30.2 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 32.2 kB |
| core + console (esm, gzip) | 32.2 kB |
| core + all core transports (esm, gzip) | 40.6 kB |
| all compatibility layers (esm, gzip) | 39 kB |

*Generated via `scripts/analyze-build.js`.*