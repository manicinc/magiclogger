<p align="center">
  <img src="https://img.shields.io/badge/zero_dependencies-✓-blue" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/typescript-5.0+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/node-14+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/core_gzip-37kb-brightgreen.svg" alt="core_gzip">
  <img src="https://img.shields.io/badge/core_console_gzip-37kb-brightgreen.svg" alt="core_console_gzip">
  <img src="https://img.shields.io/badge/core_transports_gzip-45kb-brightgreen.svg" alt="core_transports_gzip">
  <img src="https://img.shields.io/badge/compat_gzip-43kb-brightgreen.svg" alt="compat_gzip">
</p>

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
- 🎨 **Theme system** with tag-based styling

---

## Quick Start

### Module formats and types

MagicLogger publishes ESM and CJS builds with first-class TypeScript types. Use import in ESM/TypeScript and require in CJS:

- ESM/TS: `import { Logger } from 'magiclogger'`
- CJS: `const { Logger } = require('magiclogger')`

All subpath exports work in both ESM and CJS (for example, `magiclogger/transports/http`).

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

Example JSON produced (Node.js environment shown):

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

Error examples:

```json
{
  "level": "error",
  "message": "Payment failed",
  "error": {
    "name": "Error",
    "message": "Card declined",
    "stack": "..."
  },
  "timestamp": "2025-08-14T12:34:36.234Z",
  "timestampMs": 1765769676234
}
```

```json
{
  "level": "error",
  "message": "DB query failed",
  "context": {
    "query": "SELECT * FROM users WHERE id = ?"
  },
  "error": {
    "name": "Error",
    "message": "timeout",
    "stack": "..."
  },
  "timestamp": "2025-08-14T12:34:37.345Z",
  "timestampMs": 1765769677345
}
```

Notes
- id is auto-generated per entry; timestamp/timestampMs are always present.
- message is the final (styled) string; plainMessage is ANSI-free for non-TTY transports.
- loggerId and tags come from Logger options if provided.
- context is either the metadata object you passed, or falls back to options.context.
- metadata includes platform info (Node: hostname, pid, platform, nodeVersion; Browser: userAgent, platform).

---

## 🎨 Styling Showcase

### Three Powerful Styling APIs

MagicLogger provides three complementary styling APIs. Use one or combine them - they all work together seamlessly!

#### 1. Chainable Style API (`logger.s`)

Like Chalk, but built-in. Chain styles intuitively:

```typescript
// Create styled strings
const error = logger.s.red.bold('ERROR:');
const warning = logger.s.yellow.underline('Warning:');
const success = logger.s.green.bold('✓ Success');

// Use in your logs
logger.info(error + ' Connection failed');
logger.info(warning + ' High memory usage');
logger.info(success + ' Deployment complete');

// Chain multiple styles
logger.info(
  logger.s.white.bgRed.bold(' CRITICAL ') + ' ' +
  logger.s.yellow('System memory at ') + 
  logger.s.red.bold('92%')
);

// Create reusable style functions
const highlight = logger.s.yellow.bold;
const code = logger.s.cyan;
const error = logger.s.red.bold.underline;

logger.info('Run ' + code('npm install') + ' to continue');
logger.error(error('Failed') + ' to process request');
```

#### 2. Template Literal API (`logger.fmt`)

Inline styling with template literals:

```typescript
// Clean, readable inline styling
logger.info(logger.fmt`@red.bold{Error:} Failed to connect to @yellow.underline{users_db} on @cyan{localhost:5432}`);

// With variables
const errorType = 'Connection Error';
const database = 'production_db';
const timestamp = new Date().toISOString();

logger.error(logger.fmt`
  @red.bold{${errorType}} 
  Database @yellow{${database}} failed at @dim{${timestamp}}
`);

// Multiple styles in one message
logger.info(logger.fmt`
  @white.bgRed.bold{ CRITICAL } 
  @yellow{Warning:} System memory at @red.bold{92%} 
  @dim{(threshold: 90%)}
`);
```

#### 3. Inline Angle Bracket Syntax

The simplest API - just write styled text naturally:

```typescript
// Automatic parsing in ALL log methods
logger.info('<green.bold>SUCCESS:</> All tests passed');
logger.error('<red>Error:</> Connection to <yellow>database</> failed');
logger.warn('<yellow.bold>⚠ Warning:</> <cyan>CPU usage</> is high');

// Works with variables
const user = 'john_doe';
const action = 'DELETE';
logger.warn(`User <cyan.bold>${user}</> performed <red.bold>${action}</> operation`);

// Combine with regular text
logger.info('Starting <green>health check</> for service <cyan.underline>api-gateway</>...');

// No need for special methods - it just works!
logger.debug('<dim>Debug:</> Cache hit ratio: <green>85%</>');
logger.success('<green.bold>✓</> Deployment to <blue>production</> complete');
```

### Style Reference

#### Colors
- Foreground: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `orange`, `purple`, `teal`, `pink`, `brown`, `indigo`, `lime`
- Bright (foreground): `brightRed`, `brightGreen`, `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`, `brightOrange`, `brightPurple`, `brightTeal`, `brightPink`, `brightBrown`, `brightIndigo`, `brightLime`, `brightBlack`
- Background: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`, `bgGray`, `bgOrange`, `bgPurple`, `bgTeal`, `bgPink`, `bgBrown`, `bgIndigo`, `bgLime`
- Bright backgrounds: `bgBrightBlack`, `bgBrightRed`, `bgBrightGreen`, `bgBrightYellow`, `bgBrightBlue`, `bgBrightMagenta`, `bgBrightCyan`, `bgBrightWhite`, `bgBrightOrange`, `bgBrightPurple`, `bgBrightTeal`, `bgBrightPink`, `bgBrightBrown`, `bgBrightIndigo`, `bgBrightLime`

#### Modifiers
- Styles: `bold`, `dim`, `italic`, `underline`, `blink`, `reverse`, `hidden`, `strikethrough`

---

## 🎨 Theme System

### Built-in Themes

```typescript
// Use a built-in theme
const logger = new Logger({ 
  theme: 'ocean' // or 'forest', 'sunset', 'minimal', 'cyberpunk'
});

// Or customize an existing theme
const logger = new Logger({
  theme: {
    base: 'ocean', // Start with a built-in theme
    overrides: {
      error: ['brightRed', 'bold', 'underline'],
      success: ['brightGreen', 'bold']
    }
  }
});
```

### Tag-Based Theme Styling

Automatically apply styles based on tags:

```typescript
// Define tag styles in your theme
const logger = new Logger({
  theme: {
    tags: {
      api: ['cyan', 'bold'],
      database: ['yellow'],
      error: ['red', 'bold'],
      critical: ['white', 'bgRed', 'bold'],
      performance: ['magenta']
    }
  },
  tags: ['api'] // Global tags for this logger
});

// Tags automatically apply their theme styles
logger.info('Request received', { tags: ['api'] }); // Styled with cyan.bold
logger.error('Connection failed', { tags: ['database', 'error'] }); // Combined styles
logger.warn('High latency detected', { tags: ['api', 'performance'] });
```

### Tag-Driven Theme Selection (Auto)

Make your logs brand-aware by auto-selecting a theme from tags:

```typescript
// 1) Explicit mapping: map a tag to a theme name
const logger1 = new Logger({
  tags: ['acme'],
  themeByTag: { acme: 'cyberpunk', contoso: 'dark' }
  // When a logger has tag 'acme', load theme 'cyberpunk'
});

// 2) Implicit matching: if a tag matches a named theme, it's used automatically
// Assuming a theme named 'neon' exists in themes.json
const logger2 = new Logger({ tags: ['neon'] }); // auto-loads the 'neon' theme

// Updating tags later also re-evaluates the theme if none was explicitly set
logger2.updateConfig({ tags: ['dark'] }); // switches to 'dark' theme if available
```

Notes
- Explicit object themes still take precedence over auto-selection.
- Auto-selection only applies when a theme isn't explicitly provided.

### Creating Custom Themes

```typescript
import type { ThemeDefinition } from 'magiclogger';

// Define a theme object (keys map to your semantic roles)
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

### Theme Variants and JSON

```typescript
// Use bundled themes by name if available (see src/theme/themes.json)
const logger1 = new Logger({ theme: 'dark' });

// Or load your own JSON file (Node.js)
import fs from 'node:fs';
const myThemeJson = JSON.parse(fs.readFileSync('./my-theme.json', 'utf8')) as ThemeDefinition;
const logger2 = new Logger({ theme: myThemeJson });

// Programmatic overrides
const logger3 = new Logger({
  theme: {
    ...myTheme,
    error: ['brightRed', 'bold', 'underline']
  }
});
```

---

## 🔌 Transports

### Built-in Transports

Available out of the box:
- Console (`ConsoleTransport`)
- File (`FileTransport`)
- HTTP (`HTTPTransport`)
- WebSocket (`WebSocketTransport`)
- Stream (`StreamTransport`)
- S3 (`S3Transport`)
- MongoDB (`MongoDBTransport`)
- OpenTelemetry OTLP (`OTLPTransport`)

Notes
- Core behavior: If you do not configure any transports, MagicLogger still writes to the console via its legacy output; this ensures you see logs during development. To automatically add console (and optional file) as managed transports, pass `{ useDefaultTransports: true }`.
- Tree‑shaking: Importing from `magiclogger/transports` re‑exports all transport classes; for optimal tree‑shaking, prefer per‑transport imports like `magiclogger/transports/http`.
- Core vs. extras: The Console transport is commonly used and can be auto‑enabled via `useDefaultTransports`. Other transports are opt‑in and only included in your bundle when you import/use them.

Usage example:

```typescript
import { Logger } from 'magiclogger';
import {
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  WebSocketTransport,
  StreamTransport,
  S3Transport,
  MongoDBTransport,
} from 'magiclogger/transports';

const logger = new Logger({
  transports: [
    new ConsoleTransport({ level: 'debug', useColors: true }),
    new FileTransport({ filepath: './logs/app.log', maxFiles: 7, maxSize: '10MB' }),
    new HTTPTransport({ url: 'https://logs.example.com', batch: true, compress: true }),
    new WebSocketTransport({ url: 'wss://logs.example.com/socket' }),
    new StreamTransport({ stream: process.stdout }),
    new S3Transport({ bucket: 'my-logs', prefix: 'prod/', region: 'us-east-1' }),
    new MongoDBTransport({ uri: 'mongodb://localhost:27017', db: 'logs', collection: 'entries' }),
  ]
});
```

### OpenTelemetry Integration

```typescript
// Full OpenTelemetry integration with tracing
import { Logger } from 'magiclogger';
import { OTLPTransport } from 'magiclogger/transports/otlp';
import { trace } from '@opentelemetry/api';

const logger = new Logger({
  transports: [
    new OTLPTransport({
      endpoint: process.env.OTLP_ENDPOINT || 'http://localhost:4318',
      protocol: 'http/protobuf', // or 'grpc'
      headers: {
        'x-api-key': process.env.OTLP_API_KEY
      },
      serviceName: 'my-service',
      resource: {
        'service.version': process.env.APP_VERSION,
        'deployment.environment': process.env.NODE_ENV
      },
      // Automatically attach trace context
      includeTraceContext: true
    })
  ]
});

// Logs automatically include trace and span IDs
const span = trace.getActiveSpan();
logger.info('Processing request', {
  userId: '123',
  // Trace context automatically attached!
});
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

---

## 🎯 Real-World Examples

### Express.js Middleware with Styled Output

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({
  theme: {
    tags: {
      http: ['cyan'],
      error: ['red', 'bold'],
      slow: ['yellow', 'bold']
    }
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request with inline styling
  logger.info(`<cyan.bold>${req.method}</> <dim>${req.path}</>`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Style based on status code
    const statusStyle = status >= 500 ? 'red.bold' : 
                       status >= 400 ? 'yellow' : 
                       'green';
    
    logger.info(
      `<cyan.bold>${req.method}</> ${req.path} ` +
      `<${statusStyle}>${status}</> ` +
      `<dim>${duration}ms</>`
    );
    
    // Tag-based styling for slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', { 
        tags: ['slow', 'http'],
        duration,
        path: req.path
      });
    }
  });
  
  next();
});
```

### Deployment Pipeline with Rich Visuals

```typescript
const logger = new Logger({ 
  theme: 'cyberpunk',
  tags: ['deployment']
});

async function deploy() {
  logger.header('🚀 DEPLOYMENT PIPELINE', ['white', 'bgBlue', 'bold']);
  
  // Stage 1: Build
  logger.info(logger.fmt`@blue{Stage 1/4:} Building application...`);
  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 40, '█', '░');
    await sleep(50);
  }
  logger.success('<green.bold>✓ Build completed</> <dim>(450 files, 2.3MB)</>');
  
  // Stage 2: Tests
  logger.info(logger.fmt`@blue{Stage 2/4:} Running tests...`);
  const testResults = [
    { suite: 'Unit Tests', passed: 342, failed: 0, time: '2.3s' },
    { suite: 'Integration', passed: 89, failed: 0, time: '8.7s' },
    { suite: 'E2E Tests', passed: 23, failed: 0, time: '45.2s' }
  ];
  logger.table(testResults);
  
  // Stage 3: Deploy
  logger.info(logger.fmt`@blue{Stage 3/4:} Deploying to @cyan.underline{production}`);
  
  // Final status
  logger.header('✅ DEPLOYMENT SUCCESSFUL', ['white', 'bgGreen', 'bold']);
  logger.info(`
    <green.bold>Version 2.4.1</> deployed to <cyan>production</>
    <dim>Completed in <yellow>4m 32s</> with <green>0 errors</></>
  `);
}
```

## 📦 Build Output Sizes

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 3.03 kB | 717 B |
| `index.js` | ESM | 1.36 kB | 517 B |
| `index.d.ts` | Types | 146 kB | 29.2 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 37.5 kB |
| core + console (esm, gzip) | 37.5 kB |
| core + all core transports (esm, gzip) | 45.9 kB |
| all compatibility layers (esm, gzip) | 44.3 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 3.03 kB | 718 B |
| `index.js` | ESM | 1.36 kB | 521 B |
| `index.d.ts` | Types | 146 kB | 29.2 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 37.1 kB |
| core + console (esm, gzip) | 37.1 kB |
| core + all core transports (esm, gzip) | 45.5 kB |
| all compatibility layers (esm, gzip) | 43.9 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 3.03 kB | 718 B |
| `index.js` | ESM | 1.36 kB | 518 B |
| `index.d.ts` | Types | 145 kB | 29 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 37 kB |
| core + console (esm, gzip) | 37 kB |
| core + all core transports (esm, gzip) | 45.4 kB |
| all compatibility layers (esm, gzip) | 43.8 kB |

*Generated via `scripts/analyze-build.js`.*

| File | Format | Raw Size | Gzip |
|------|--------|----------|------|
| `index.cjs` | CJS | 3.03 kB | 718 B |
| `index.js` | ESM | 1.36 kB | 518 B |
| `index.d.ts` | Types | 145 kB | 29 kB |

### Reference bundle sizes (gzip)

| Scenario | Size |
|----------|------|
| core (esm, gzip) | 37 kB |
| core + console (esm, gzip) | 37 kB |
| core + all core transports (esm, gzip) | 45.4 kB |
| all compatibility layers (esm, gzip) | 43.8 kB |

*Generated via `scripts/analyze-build.js`.*