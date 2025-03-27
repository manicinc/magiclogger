# Drop-in Compatibility Guide

Magiclogger provides seamless compatibility with existing logging libraries and patterns, allowing you to enhance your logging experience without changing your codebase.

## Table of Contents

- [Console Enhancement](#console-enhancement)
- [Winston Compatibility](#winston-compatibility)
- [Bunyan Compatibility](#bunyan-compatibility)
- [Pino Compatibility](#pino-compatibility)
- [Custom Loggers](#custom-loggers)
- [Terminal Compatibility](#terminal-compatibility)

## Console Enhancement

Magiclogger can enhance the global `console` object with all its advanced features while maintaining backward compatibility with existing code.

### Basic Usage

```typescript
import { enhanceConsole } from 'magiclogger';

// Enhance the console object
const { logger, restoreConsole } = enhanceConsole({
  verbose: true,
  writeToDisk: true
});

// Your existing console.log calls now have enhanced formatting
console.log('This message has enhanced styling');
console.error('Error messages are more prominent');

// New methods are available on the console object
console.header('APPLICATION STATUS');
console.success('Database connected successfully');
console.progress(75); // Show a progress bar

// You can access the logger instance directly for advanced features
logger.table([
  { service: 'API', status: 'online', uptime: '24h' },
  { service: 'Database', status: 'degraded', latency: '250ms' }
]);

// Restore the original console if needed
restoreConsole();
```

### Enhanced Console Methods

When you enhance the console object, it gains the following new methods:

| Method | Description |
|--------|-------------|
| `console.header(title, colors?)` | Prints a formatted header |
| `console.success(message)` | Logs a success message |
| `console.progress(value, length?, chars?)` | Displays a progress bar |
| `console.colorize(...colors)` | Returns a function to colorize text |
| `console.colorParts(message, parts)` | Colorizes specific parts of text |
| `console.custom(message, colors?, prefix?)` | Logs with custom styling |
| `console.styled(message, preset)` | Logs with a preset style |

### Notes on Compatibility

- All existing console methods remain backward compatible
- The enhancement is non-destructive and can be reversed
- The enhanced console maintains all existing behavior of console.log, console.error, etc.
- Works with existing code without modifications

## Winston Compatibility

Magiclogger provides a Winston-compatible interface that enhances the visual output while maintaining API compatibility.

### Setup

```typescript
import { createWinstonCompatible } from 'magiclogger';

// Create a Winston-compatible logger
const logger = createWinstonCompatible({
  verbose: true,
  writeToDisk: true
});

// Use like a Winston logger
logger.info('Server starting up');
logger.warn('Connection pool is nearing capacity');
logger.error('Failed to connect to database', { attempt: 3 });

// Access Magiclogger features
logger.header('SERVER STATUS');
logger.table([
  /* ... */
]);
```

### Supported Winston Methods

| Winston Method | Magiclogger Implementation |
|----------------|----------------------------|
| `logger.log(level, msg)` | Supports all standard log levels |
| `logger.info(msg)` | Enhanced with Magiclogger styling |
| `logger.warn(msg)` | Enhanced with Magiclogger styling |
| `logger.error(msg)` | Enhanced with Magiclogger styling |
| `logger.debug(msg)` | Enhanced with Magiclogger styling |
| `logger.verbose(msg)` | Maps to `logger.debug()` |

### Additional Features

The Winston-compatible logger also includes all Magiclogger advanced features:

- `logger.header()` - Print section headers
- `logger.table()` - Format tabular data
- `logger.progress()` - Display progress bars
- `logger.colorize()` - Create color functions
- `logger.colorParts()` - Colorize parts of messages
- `logger.styled()` - Use preset styles
- `logger.custom()` - Create custom-styled messages
- `logger.magicLogger` - Access the underlying Magiclogger instance

## Bunyan Compatibility

Magiclogger provides a Bunyan-compatible interface for easy migration from Bunyan.

### Setup

```typescript
import { createBunyanCompatible } from 'magiclogger';

// Create a Bunyan-compatible logger
const logger = createBunyanCompatible({
  name: 'my-app',
  verbose: true,
  writeToDisk: true
});

// Use like a Bunyan logger
logger.info('Application started');
logger.warn('Resource limit approaching');
logger.error({ err: new Error('Connection refused') }, 'Database error');

// Access Magiclogger features
logger.header('APPLICATION METRICS');
```

### Supported Bunyan Methods

| Bunyan Method | Magiclogger Implementation |
|---------------|----------------------------|
| `logger.info(obj, msg?)` | Supports both object and string formats |
| `logger.warn(obj, msg?)` | Enhanced with Magiclogger styling |
| `logger.error(obj, msg?)` | Enhanced with Magiclogger styling |
| `logger.debug(obj, msg?)` | Enhanced with Magiclogger styling |
| `logger.trace(obj, msg?)` | Maps to `logger.debug()` with 'TRACE:' prefix |
| `logger.fatal(obj, msg?)` | Maps to `logger.error()` with 'FATAL:' prefix |

### Object Serialization

Like Bunyan, the compatible logger properly handles both strings and objects:

```typescript
// Log an object
logger.info({ user: 'john', action: 'login' });

// Log an object with a message
logger.error({ code: 500, path: '/api/users' }, 'Server error');
```

## Pino Compatibility

Magiclogger provides a Pino-compatible interface to enhance the visual output while maintaining API compatibility with Pino.

### Setup

```typescript
import { createPinoCompatible } from 'magiclogger';

// Create a Pino-compatible logger
const logger = createPinoCompatible({
  verbose: true,
  writeToDisk: true
});

// Use like a Pino logger
logger.info('Server listening on port 3000');
logger.warn('High memory usage detected');
logger.error('Request failed with status code %d', 500);

// Access Magiclogger features
logger.header('REQUEST METRICS');
```

### Supported Pino Methods

| Pino Method | Magiclogger Implementation |
|-------------|----------------------------|
| `logger.info(msgOrObj, msgStr?)` | Supports both formats |
| `logger.warn(msgOrObj, msgStr?)` | Enhanced with Magiclogger styling |
| `logger.error(msgOrObj, msgStr?)` | Enhanced with Magiclogger styling |
| `logger.debug(msgOrObj, msgStr?)` | Enhanced with Magiclogger styling |
| `logger.trace(msgOrObj, msgStr?)` | Maps to `logger.debug()` with 'TRACE:' prefix |
| `logger.fatal(msgOrObj, msgStr?)` | Maps to `logger.error()` with 'FATAL:' prefix |

## Custom Loggers

You can extend Magiclogger to build your own custom compatibility layers for other logging libraries.

```typescript
import { Logger } from 'magiclogger';

// Create a custom compatibility layer
function createCustomLoggerCompatible(options) {
  const logger = new Logger(options);
  
  // Add your custom API methods
  return {
    // Your custom API
    logMessage: (level, message) => {
      switch(level) {
        case 'info': return logger.log(message);
        case 'warn': return logger.warn(message);
        case 'error': return logger.error(message);
        default: return logger.custom(message, ['white'], level.toUpperCase());
      }
    },
    
    // Expose Magiclogger features
    ...logger
  };
}
```

## Terminal Compatibility

Magiclogger includes intelligent terminal detection to ensure compatibility across different terminal environments.

### Terminal Feature Detection

The logger automatically detects terminal capabilities and adjusts its styling accordingly:

```typescript
import { getTerminalSupport } from 'magiclogger';

// Check terminal capabilities
const support = getTerminalSupport();
console.log('Terminal support:', support);

// Example output:
// {
//   basic: true,
//   colors: true,
//   brightColors: true,
//   rgb: true,
//   styles: {
//     bold: true,
//     italic: false,
//     underline: true,
//     ...
//   },
//   features: {
//     hyperlinks: true,
//     ...
//   }
// }
```

### Supported Terminals

Magiclogger has been tested and optimized for:

- VS Code integrated terminal
- iTerm2
- Windows Terminal
- cmd.exe
- PowerShell
- Hyper
- GNOME Terminal
- Konsole
- xterm
- Terminal.app (macOS)
- ConEmu
- Git Bash
- WSL terminals

### Style Fallbacks

When a terminal doesn't support specific styles, Magiclogger automatically applies appropriate fallbacks:

| Unsupported Style | Fallback |
|-------------------|----------|
| italic | dim or normal text |
| strikethrough | dim or normal text |
| blink | bold |
| dim | gray color |
| hidden | dim or normal text |
| doubleUnderline | regular underline |

This ensures consistent, attractive output across all terminal environments without manual configuration.