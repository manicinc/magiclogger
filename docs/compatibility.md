# Drop-in Compatibility Guide

MagicLogger provides seamless compatibility with existing logging libraries and patterns, allowing you to enhance your logging experience without changing your codebase. All compatibility layers automatically convert simple string logs to structured data for powerful analysis.

## Table of Contents

- [The Magic: Simple to Structured](#the-magic-simple-to-structured)
- [Console Enhancement](#console-enhancement)
- [Base Compatibility Layer](#base-compatibility-layer)
- [Winston Compatibility](#winston-compatibility)
- [Bunyan Compatibility](#bunyan-compatibility)
- [Pino Compatibility](#pino-compatibility)
- [Creating Your Own Adapter](#creating-your-own-adapter)
- [Terminal Compatibility](#terminal-compatibility)
- [Transport Integration](#transport-integration)

## The Magic: Simple to Structured

One of MagicLogger's most powerful features is **automatic conversion of simple logs to structured data**. This happens transparently across all compatibility layers:

```javascript
// You write simple logs...
logger.info('User logged in');

// But transports receive rich structured data:
{
  id: 'log-1642329600000-abc123',
  timestamp: '2024-01-15T10:30:45.123Z',
  timestampMs: 1642329600000,
  level: 'info',
  message: 'User logged in',
  plainMessage: 'User logged in',
  loggerId: 'my-app',
  tags: ['production', 'api'],
  context: { version: '1.0.0', region: 'us-east-1' },
  metadata: { hostname: 'server-01', pid: 1234 }
}
```

This means you can:
- Keep your existing simple logging code
- Get powerful structured logging for free
- Query and analyze logs in your aggregation system
- Add context and metadata when needed

### Examples with Color and Style

```javascript
import { enhanceConsole } from 'magiclogger';

// Enhance console with colors and structured logging
const { logger } = enhanceConsole({ useColors: true });

// Simple colored logs
console.log('Application started'); // Default style
console.success('Database connected'); // Green
console.warn('Cache miss'); // Yellow
console.error('Connection failed'); // Red

// Styled logs with automatic structure
const highlight = console.colorize('yellow', 'bold');
const code = console.colorize('cyan');

console.log(`Run ${code('npm start')} to begin`);
console.log(`Found ${highlight('3 critical')} issues`);

// Even styled logs become structured data:
// {
//   message: 'Run npm start to begin',
//   plainMessage: 'Run npm start to begin', // Without ANSI codes
//   level: 'info',
//   ...
// }
```

## Console Enhancement

Enhance the global `console` object with colors, styling, and automatic structured logging:

### Basic Usage

```javascript
import { enhanceConsole } from 'magiclogger';

// Enhance console with full MagicLogger features
const { logger, restoreConsole } = enhanceConsole({
  verbose: true,
  id: 'web-app',
  tags: ['frontend'],
  context: { version: '2.0.0' }
});

// Your existing console calls now have superpowers
console.log('Starting application...'); // Styled + structured
console.error('Failed to load config'); // Red + structured
console.warn('Using default settings'); // Yellow + structured

// New colorful methods
console.success('✓ All systems operational'); // Green
console.header('SYSTEM STATUS'); // Bold header
console.progress(75); // Progress bar
```

### Enhanced Console Methods

| Method | Description | Example |
|--------|-------------|---------|
| `console.header(title, colors?)` | Styled section headers | `console.header('API STATUS', ['white', 'bgBlue'])` |
| `console.success(message)` | Green success messages | `console.success('✓ Tests passed')` |
| `console.progress(value)` | Visual progress bars | `console.progress(80)` |
| `console.colorize(...colors)` | Create color functions | `const red = console.colorize('red', 'bold')` |
| `console.colorParts(msg, parts)` | Color specific words | See examples below |

### Colorful Examples

```javascript
// Color specific parts of messages
console.log(
  console.colorParts('Processing file: data.json (1.2MB) - Status: OK', {
    'data.json': ['yellow', 'underline'],
    '1.2MB': ['cyan'],
    'OK': ['green', 'bold']
  })
);

// Create reusable styles
const user = console.colorize('cyan', 'bold');
const action = console.colorize('magenta');
const time = console.colorize('gray');

console.log(`${user('admin')} ${action('deleted')} file at ${time('10:30:45')}`);

// Tables with colors
console.table([
  { service: 'API', status: '🟢 healthy', uptime: '99.9%' },
  { service: 'Database', status: '🟡 degraded', uptime: '95.2%' },
  { service: 'Cache', status: '🟢 healthy', uptime: '99.8%' }
]);
```

### With Transports

```javascript
import { enhanceConsole, HTTPTransport, FileTransport } from 'magiclogger';

// Enhanced console with transports
const { logger } = enhanceConsole({
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filepath: './app.log' }),
    new HTTPTransport({ url: 'https://logs.example.com' })
  ]
});

// All console methods send to all transports
console.log('User action'); // Goes to console, file, and HTTP
console.error('Critical error', new Error('Database down')); // Structured error data
```

## Base Compatibility Layer

The foundation for all compatibility adapters, providing consistent behavior and automatic structured logging:

### BaseCompatibleLogger

```javascript
import { BaseCompatibleLogger, Logger } from 'magiclogger';

class CustomLogger extends BaseCompatibleLogger {
  constructor(options) {
    super(options);
  }
  
  // Your simple API
  notice(message) {
    // Automatically becomes structured data
    this.logger.custom(message, ['blue', 'bold'], 'NOTICE');
  }
  
  // Support for metadata
  audit(action, details) {
    // Simple call...
    this.logger.info(`Audit: ${action}`, details);
    // Becomes rich structured log with context
  }
}

// Usage
const logger = new CustomLogger({
  id: 'audit-service',
  tags: ['audit', 'compliance'],
  context: { service: 'user-management' }
});

logger.audit('USER_DELETED', { userId: '123', deletedBy: 'admin' });
```

## Winston Compatibility

Drop-in Winston replacement with colors and automatic structured logging:

### Setup

```javascript
import { createWinstonCompatible } from 'magiclogger';

const logger = createWinstonCompatible({
  level: 'debug',
  transports: [
    new ConsoleTransport({ useColors: true }),
    new FileTransport({ filepath: './app.log' })
  ]
});

// Use exactly like Winston
logger.info('Server started on port 3000');
logger.warn('Deprecation warning: Use v2 API');
logger.error('Database connection failed', { error: 'ECONNREFUSED' });
```

### Colorful Winston Features

```javascript
// Winston API with MagicLogger enhancements
logger.info('🚀 Application started');
logger.warn('⚠️  High memory usage detected');
logger.error('❌ Critical error occurred');

// Access MagicLogger's color features
logger.header('DEPLOYMENT STATUS');
logger.success('✓ All services healthy');

// Use color functions
const highlight = logger.colorize('yellow', 'bold');
logger.info(`Found ${highlight('5 warnings')} during startup`);

// Structured data with colors
logger.info(
  logger.colorParts('User john_doe performed action: DELETE', {
    'john_doe': ['cyan', 'bold'],
    'DELETE': ['red', 'bold']
  }),
  { userId: '123', timestamp: Date.now() }
);
```

### Winston Methods Support

| Winston Method | MagicLogger Enhancement |
|----------------|------------------------|
| `logger.log(level, msg, meta?)` | ✅ Full support + colors + structured data |
| `logger.info/warn/error/debug()` | ✅ Enhanced with styling |
| `logger.verbose()` | ✅ Maps to debug with styling |
| Transport system | ✅ Use MagicLogger transports |

## Bunyan Compatibility

Bunyan-compatible interface with automatic object serialization and colors:

### Setup

```javascript
import { createBunyanCompatible } from 'magiclogger';

const logger = createBunyanCompatible({
  name: 'my-app',
  streams: [
    { type: 'console', level: 'debug' },
    { type: 'file', path: './app.log' }
  ]
});

// Bunyan-style logging
logger.info('Application started');
logger.info({ user: 'john' }, 'User logged in');
logger.error({ err: new Error('Oops') }, 'Operation failed');
```

### Bunyan with Colors

```javascript
// Object-first logging with colors
logger.info({ 
  action: 'deployment',
  version: '2.0.0',
  environment: 'production'
}, logger.colorParts('Deploying to production', {
  'production': ['red', 'bold']
}));

// Error logging with structure
try {
  await riskyOperation();
} catch (err) {
  logger.error({ 
    err,
    operation: 'riskyOperation',
    attemptNumber: 3
  }, '❌ Operation failed after 3 attempts');
}

// Styled sections
logger.header('SERVICE HEALTH CHECK');
logger.info({ service: 'api', status: 'healthy' }, '✅ API healthy');
logger.warn({ service: 'db', latency: 250 }, '⚠️  Database slow');
```

## Pino Compatibility

Pino-compatible logger with high-performance structured logging:

### Setup

```javascript
import { createPinoCompatible } from 'magiclogger';

const logger = createPinoCompatible({
  level: 'debug',
  transport: {
    targets: [
      { target: 'console', options: { useColors: true } },
      { target: 'file', options: { destination: './app.log' } }
    ]
  }
});

// Pino-style usage
logger.info('Server listening on port 3000');
logger.error({ err: error }, 'Request failed');
```

### Pino with Style

```javascript
// Pino API with colors
logger.info('🚀 Starting microservice');
logger.debug({ cache: 'hit', key: 'user:123' }, '✓ Cache hit');

// Child loggers with context
const reqLogger = logger.child({ requestId: '123' });
reqLogger.info('Processing request');
reqLogger.error('Request failed');

// Performance logging with style
const start = Date.now();
// ... operation ...
logger.info({ 
  duration: Date.now() - start,
  operation: 'dbQuery'
}, logger.colorParts('Database query completed in 45ms', {
  '45ms': ['green', 'bold']
}));
```

## Creating Your Own Adapter

Build custom adapters that automatically provide structured logging:

### Simple Adapter Example

```javascript
import { BaseCompatibleLogger } from 'magiclogger';

export class GameLogger extends BaseCompatibleLogger {
  constructor(options) {
    super({
      ...options,
      tags: ['game', ...(options.tags || [])]
    });
  }
  
  // Game-specific methods
  achievement(player, achievement) {
    const icon = logger.color('yellow')('🏆');
    this.logger.success(`${icon} ${player} unlocked: ${achievement}`, {
      player,
      achievement,
      timestamp: Date.now()
    });
  }
  
  damage(attacker, target, amount) {
    const dmg = this.logger.color('red', 'bold')(amount);
    this.logger.info(
      `${attacker} dealt ${dmg} damage to ${target}`,
      { attacker, target, amount, type: 'combat' }
    );
  }
  
  levelUp(player, newLevel) {
    this.logger.header(`LEVEL UP!`, ['yellow', 'bgBlue', 'bold']);
    this.logger.success(`${player} reached level ${newLevel}!`, {
      player,
      level: newLevel,
      event: 'level_up'
    });
  }
}

// Usage
const gameLog = new GameLogger({ 
  id: 'game-server',
  context: { server: 'us-west-1' }
});

gameLog.achievement('Player1', 'Dragon Slayer');
gameLog.damage('Wizard', 'Goblin', 45);
gameLog.levelUp('Player1', 10);
```

### Advanced Custom Adapter

```javascript
import { Logger, ConsoleTransport, S3Transport } from 'magiclogger';

export class MetricsLogger {
  constructor(options = {}) {
    this.logger = new Logger({
      id: options.service || 'metrics',
      tags: ['metrics', options.environment],
      context: {
        service: options.service,
        version: options.version,
        hostname: os.hostname()
      },
      transports: [
        new ConsoleTransport({ 
          useColors: true,
          formatter: this.createFormatter()
        }),
        new S3Transport({
          bucket: 'metrics-logs',
          compress: true
        })
      ]
    });
  }
  
  createFormatter() {
    return (entry) => {
      const metric = entry.context?.metric;
      if (metric) {
        const value = this.logger.color('cyan', 'bold')(metric.value);
        const unit = this.logger.color('gray')(metric.unit);
        return `[METRIC] ${metric.name}: ${value}${unit}`;
      }
      return entry.message;
    };
  }
  
  metric(name, value, unit = '', tags = {}) {
    this.logger.info(`Metric: ${name}`, {
      metric: { name, value, unit },
      tags,
      timestamp: Date.now()
    });
  }
  
  gauge(name, value, unit) {
    const arrow = value > 0 ? '↑' : '↓';
    const color = value > 0 ? 'green' : 'red';
    const styled = this.logger.color(color)(arrow);
    
    this.metric(name, `${value} ${styled}`, unit);
  }
}
```

## Terminal Compatibility

MagicLogger automatically detects terminal capabilities and adjusts colors:

```javascript
import { getTerminalSupport, Logger } from 'magiclogger';

const support = getTerminalSupport();
console.log('Terminal capabilities:', support);

// Logger automatically adapts
const logger = new Logger();

if (support.rgb) {
  // Use RGB colors
  logger.info(logger.color(255, 128, 0)('Orange text with RGB'));
} else if (support.colors) {
  // Fall back to basic colors
  logger.info(logger.color('yellow')('Yellow text'));
} else {
  // No colors
  logger.info('Plain text');
}
```

## Transport Integration

All compatibility layers work seamlessly with MagicLogger's transport system:

```javascript
import { 
  createWinstonCompatible,
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  MongoDBTransport
} from 'magiclogger';

// Any compatibility layer can use any transport
const logger = createWinstonCompatible({
  transports: [
    // Colorful console output
    new ConsoleTransport({ 
      useColors: true,
      level: 'debug'
    }),
    
    // Structured JSON to file
    new FileTransport({
      filepath: './logs/app.log',
      formatter: 'json'
    }),
    
    // Send to HTTP endpoint
    new HTTPTransport({
      url: 'https://logs.example.com',
      batch: true
    }),
    
    // Store in MongoDB
    new MongoDBTransport({
      url: 'mongodb://localhost:27017',
      database: 'logs',
      collection: 'app_logs'
    })
  ]
});

// Simple Winston-style logging...
logger.info('User logged in');

// ...automatically becomes structured data in all transports!