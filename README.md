# Magiclogger

A powerful, no-config cross-platform logging library for Node.js with rich terminal styling, colors, and multiple output formats.

## Features

- 🎨 **Rich Terminal Styling** - Colors, bold, italic, underline and more with terminal capability detection
- 🔄 **Universal Log Method** - Single method with flexible level support
- 📊 **Progress Bars & Tables** - Visualize data and progress directly in your terminal
- 📝 **File Logging** - Automatic log file rotation and retention
- 🔌 **Drop-in Compatibility** - Works as a replacement for console, Winston, Bunyan, and Pino
- 🔗 **Link Preservation** - Automatically detects and preserves formatting of URLs and file paths
- 🧩 **Custom Styling** - Apply colors and styles to specific parts of messages
- ⚡ **Zero Config** - Works out of the box with sensible defaults
- 📦 **Zero Dependencies** - No external packages required

## Installation

```bash
npm install magiclogger
# or
yarn add magiclogger
```

## Quick Start

```javascript
import { Logger } from 'magiclogger';

// Create a new logger instance
const logger = new Logger({
  verbose: true,     // Show debug messages (default: false)
  writeToDisk: true, // Write logs to file (default: false)
  logDir: './logs',  // Directory for log files (default: './logs')
});

// Use the universal log method with different levels
logger.log('This is a standard info message');
logger.log('Warning: something might be wrong', 'warn');
logger.log('Critical error encountered', 'error');
logger.log('Detailed debug information', 'debug');
logger.log('Operation completed successfully', 'success');
```

## Usage

### Universal Log Method

The new universal `log()` method accepts an optional level parameter for flexible logging:

```javascript
// Signature: log(message, level?)
// Where level can be: 'info', 'warn', 'error', 'debug', 'success'

logger.log('Processing user data');                    // Default: info level
logger.log('High CPU usage detected', 'warn');         // Warning level
logger.log('Database connection failed', 'error');     // Error level
logger.log('Request payload: {...}', 'debug');         // Debug level (only shown in verbose mode)
logger.log('Data migration completed', 'success');     // Success level
```

### Direct Level Methods

For convenience, you can also use direct level-specific methods:

```javascript
logger.info('Application started');
logger.warn('Cache expiring soon');
logger.error('Failed to authenticate user');
logger.debug('Auth token: ey...');
logger.success('Email sent successfully');
```

### Headers & Sections

Create visual sections in your logs:

```javascript
logger.header('Application Initialization');
// => [BLUE BACKGROUND] Application Initialization 

// Custom colors for headers
logger.header('Important Section', ['brightRed', 'bold']);
```

### Progress Bars

Show progress for long-running operations:

```javascript
// Basic usage
logger.progressBar(50);  // 50% complete

// With custom appearance
logger.progressBar(75, 30, '▓', '░');  // 75% complete with 30-char length
```

### Tables

Display tabular data:

```javascript
const users = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
];

logger.table(users);
```

### Custom Colors & Styling

Apply colors to entire messages:

```javascript
logger.custom('Database migration starting...', ['blue', 'bold'], 'DB');
// => [DB] Database migration starting...

// Using presets
logger.styled('Critical system notification', 'important');
```

Colorize only specific parts of a message:

```javascript
logger.colorParts('File uploaded: user.json (2.4MB)', {
  'user.json': ['cyan', 'underline'],
  '2.4MB': ['green', 'bold']
});
```

### Logging to Files

Enable file logging:

```javascript
const logger = new Logger({
  writeToDisk: true,
  logDir: './app-logs',
  logRetentionDays: 14  // Keep logs for 14 days (default: 30)
});

// Get the path to the current log file
const logPath = logger.getPath();
```

## Advanced Configuration

### Object-based Constructor

Create a logger with multiple options:

```javascript
const logger = new Logger({
  verbose: process.env.NODE_ENV === 'development',
  writeToDisk: true,
  useColors: !process.env.NO_COLOR,
  logDir: './logs',
  logRetentionDays: 7
});
```

### Dynamic Configuration

Change logger settings at runtime:

```javascript
// Change log directory
logger.setLogDir('./new-logs', true);  // true to reinitialize log file

// Enable/disable verbose mode
logger.setVerbose(true);

// Enable/disable file logging
logger.setFileLogging(true);

// Enable/disable colors
logger.setColorsEnabled(true);

// Change log retention period
logger.setLogRetentionDays(14, true);  // true to clean old logs immediately
```

## Integration with Existing Loggers

### Console Replacement

```javascript
import { enhanceConsole } from 'magiclogger';

// Enhance the console object with Magiclogger capabilities
const { logger, restoreConsole } = enhanceConsole({ 
  verbose: true,
  writeToDisk: true
});

// Now you can use standard console methods with enhanced abilities
console.log('Standard log message');
console.warn('Warning message');
console.error('Error message');

// Plus new methods
console.success('Operation completed');
console.header('Processing Started');
console.progress(50);  // 50% progress

// Use the colorize function
const highlightText = console.colorize('yellow', 'bold');
console.log(`This is ${highlightText('important')} to note`);

// Restore original console if needed
restoreConsole();
```

### Winston-compatible Interface

```javascript
import { createWinstonCompatible } from 'magiclogger';

const logger = createWinstonCompatible({
  verbose: true,
  writeToDisk: true
});

// Use like Winston
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// With enhanced features
logger.header('New Section');
logger.progress(75);
```

### Bunyan-compatible Interface

```javascript
import { createBunyanCompatible } from 'magiclogger';

const logger = createBunyanCompatible({
  name: 'my-app',
  verbose: true
});

// Use like Bunyan
logger.info('Info message');
logger.warn({ id: 123 }, 'Warning for resource');
logger.error(new Error('Something failed'), 'Operation failed');

// With enhanced features
logger.header('Started processing');
```

### Pino-compatible Interface

```javascript
import { createPinoCompatible } from 'magiclogger';

const logger = createPinoCompatible({
  verbose: true
});

// Use like Pino
logger.info('Info message');
logger.warn({ resourceId: 123 }, 'Warning for resource');
logger.error('Operation failed');

// With enhanced features
logger.header('Processing');
logger.progress(25);
```

## Available Colors and Styles

```javascript
// Foreground colors
'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'grey',

// Bright foreground colors
'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 
'brightMagenta', 'brightCyan', 'brightWhite',

// Background colors
'bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 
'bgMagenta', 'bgCyan', 'bgWhite', 'bgGray', 'bgGrey',

// Text styles (will fallback gracefully if not supported by terminal)
'bold', 'dim', 'italic', 'underline', 'blink', 'reverse', 'hidden', 'strikethrough'
```

## Style Presets

```javascript
'info'      - Cyan, bold
'success'   - Green, bold
'warning'   - Yellow, bold
'error'     - Bright red, bold
'debug'     - Gray, italic
'important' - Magenta, bold, underline
'highlight' - Bright yellow, bold
'muted'     - Dim or gray
'special'   - Bright cyan, bold
'code'      - Bright green
'header'    - Bright white, blue background, bold
```

## License

MIT