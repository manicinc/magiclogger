# Magiclogger API Documentation

A comprehensive guide to using the Magiclogger API.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Basic Logging](#basic-logging)
- [Advanced Logging](#advanced-logging)
- [Styling and Formatting](#styling-and-formatting)
- [File Logging](#file-logging)
- [Progress Tracking](#progress-tracking)
- [Available Colors and Styles](#available-colors-and-styles)
- [Configuration Options](#configuration-options)
- [API Reference](#api-reference)

## Installation

```bash
npm install magiclogger
```

## Getting Started

```typescript
import { Logger } from 'magiclogger';

// Create a logger instance with zero config
const logger = new Logger();

// Basic logging
logger.log('Hello, world!');
```

## Basic Logging

Magiclogger provides standard logging levels with color-coded output:

```typescript
// Using the universal log method with different levels
logger.log('Application started');                    // Default: info level
logger.log('Cache is almost full', 'warn');          // Warning level (yellow)
logger.log('Failed to connect to database', 'error'); // Error level (red)
logger.log('Query execution took 230ms', 'debug');    // Debug level (only in verbose mode)
logger.log('Operation completed successfully', 'success'); // Success level (green)

// Or use dedicated methods for each level
logger.info('Application started');
logger.warn('Cache is almost full');
logger.error('Failed to connect to database');
logger.debug('Query execution took 230ms');
logger.success('Operation completed successfully');
```

## Advanced Logging

### Constructor Options

```typescript
// Create a logger with specific options
const logger = new Logger({
  // Enable verbose mode to show debug messages
  verbose: true,
  // Write logs to disk
  writeToDisk: true,
  // Enable or disable terminal colors
  useColors: true,
  // Set custom log directory
  logDir: './custom-logs',
  // Set log retention period (days)
  logRetentionDays: 14
});

// Legacy constructor style (still supported)
const legacyLogger = new Logger(
  true,  // verbose
  true,  // writeToDisk
  true   // useColors
);
```

### Custom Styling

```typescript
// Custom colors with custom prefix
logger.custom('Theme applied successfully', ['blue', 'bold'], 'THEME');
logger.custom('Network request completed', ['cyan'], 'NET');

// Predefined style presets
logger.styled('This is important information', 'important');
logger.styled('Feature highlighted', 'highlight');
logger.styled('Special announcement', 'special');
```

## Styling and Formatting

### Color Parts of a Message

Selectively colorize parts of a log message:

```typescript
console.log(
  logger.colorParts('File processed: data.json (Size: 1.2MB, Status: OK)', {
    'data.json': ['brightYellow', 'underline'],
    '1.2MB': ['brightCyan'],
    'OK': ['green', 'bold'],
  })
);
```

### Section Headers

Create visually distinct section headers:

```typescript
logger.header('DEPENDENCY VISUALIZATION');
logger.header('PROCESSING RESULTS', ['white', 'bgGreen', 'bold']);
```

### Data Tables

Format tabular data for better readability:

```typescript
logger.table([
  { name: 'index.ts', dependencies: 12, circular: 0 },
  { name: 'visualizer.ts', dependencies: 8, circular: 2 },
  { name: 'renderer.ts', dependencies: 5, circular: 1 },
]);
```

### Color Factory

Create reusable color functions:

```typescript
const highlight = logger.color('yellow', 'bold');
const code = logger.color('brightGreen');
const error = logger.color('brightRed', 'bold');

console.log(
  `Use ${highlight('magiclogger')} with ${code('--verbose')} flag. ${error('Errors')} will be shown in red.`
);
```

## Progress Tracking

Display progress for long-running operations:

```typescript
// Start a long operation
for (let i = 0; i <= 100; i += 10) {
  // Do some work...
  logger.progressBar(i);
}

// Customize the progress bar
logger.progressBar(
  75,                // Progress percentage
  30,                // Length of the bar
  '■',               // Character for completed portion
  '□'                // Character for incomplete portion
);
```

## File Logging

Enable file logging to automatically save logs to disk:

```typescript
// Enable file logging
const logger = new Logger({ writeToDisk: true });

// Change log directory
logger.setLogDir('./logs/app-logs');

// Change log retention period
logger.setLogRetentionDays(7, true); // true to clean up old logs immediately

// Get log file path
const logPath = logger.getPath();
console.log(`Log file: ${logPath}`);
```

## Available Colors and Styles

### Foreground Colors

- `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`
- `brightRed`, `brightGreen`, `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`

### Background Colors

- `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`, `bgGray`

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

## Configuration Options

### Environment Variables

- `LOG_TO_FILE=true` - Enable file logging by default
- `LOG_VERBOSE=true` - Enable verbose mode by default

### Runtime Configuration

```typescript
// Enable/disable verbose mode
logger.setVerbose(true);

// Enable/disable colors
logger.setColorsEnabled(false);

// Enable/disable file logging
logger.setFileLogging(true);
```

## API Reference

### Logger Class

#### Constructor

```typescript
constructor(options?: LoggerOptions | boolean)
```

```typescript
interface LoggerOptions {
  verbose?: boolean;
  writeToDisk?: boolean;
  useColors?: boolean;
  logDir?: string;
  logRetentionDays?: number;
}
```

#### Universal Log Method

```typescript
log(msg: string, level: 'info' | 'warn' | 'error' | 'debug' | 'success' = 'info'): void
```

#### Basic Logging Methods

| Method | Description |
|--------|-------------|
| `info(msg: string): void` | Log a standard info message |
| `success(msg: string): void` | Log a success message |
| `warn(msg: string): void` | Log a warning message |
| `error(msg: string): void` | Log an error message |
| `debug(msg: string): void` | Log a debug message (only shown in verbose mode) |

#### Advanced Logging Methods

| Method | Description |
|--------|-------------|
| `custom(msg: string, colors: ColorName[] = ['white'], prefix: string = 'LOG'): void` | Log with custom colors and prefix |
| `styled(msg: string, preset: StylePreset): void` | Log with preset styles |
| `colorParts(message: string, colorParts: Record<string, ColorName[]>): string` | Colorize parts of a message |
| `header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void` | Print a section header |
| `table(data: Record<string, any>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void` | Print tabular data |
| `progressBar(progress: number, length: number = 20, completeChar: string = '█', incompleteChar: string = '░'): void` | Display a progress bar |
| `link(url: string, description?: string): void` | Log a clickable link |
| `color(...colors: ColorName[]): (text: string) => string` | Create a color function |

#### Configuration Methods

| Method | Description |
|--------|-------------|
| `getPath(): string \| null` | Get log file path |
| `getLogDir(): string` | Get log directory |
| `getLogRetentionDays(): number` | Get log retention period |
| `setColorsEnabled(enabled: boolean): void` | Enable/disable colors |
| `setLogDir(dirPath: string, reinitialize: boolean = false): void` | Set log directory |
| `setLogRetentionDays(days: number, cleanNow: boolean = false): void` | Set log retention period |
| `setFileLogging(enabled: boolean): void` | Enable/disable file logging |
| `setVerbose(enabled: boolean): void` | Enable/disable verbose mode |

#### Static Methods

| Method | Description |
|--------|-------------|
| `cleanupDirectory(dir: string): void` | Recursively delete a directory |
| `normalizeLineEndings(str: string): string` | Normalize line endings (CRLF to LF) |
| `isLinkLike(text: string): boolean` | Check if text looks like a URL or file path |

### Constants and Types

#### ColorName Type

```typescript
type ColorName = 'black' | 'red' | 'green' | /* ... */ | 'strikethrough' | 'reset';
```

#### StylePreset Type

```typescript
type StylePreset = 'info' | 'success' | 'warning' | /* ... */ | 'header';
```

#### COLORS

```typescript
import { COLORS } from 'magiclogger';

console.log(`${COLORS.blue}${COLORS.bold}Blue Bold${COLORS.reset} text`);
```

#### PRESETS

```typescript
import { PRESETS } from 'magiclogger';

console.log(`${PRESETS.important.join('')}Important${COLORS.reset} text`);
```

## Compatibility Layer

Magiclogger provides drop-in replacements for popular logging libraries.

### Console Replacement

```typescript
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

```typescript
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

```typescript
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

```typescript
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

## Examples

### Universal Log Method

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({ verbose: true });

// Basic usage with different levels
logger.log('Application started');                     // info level
logger.log('Warning: configuration not found', 'warn'); // warning level
logger.log('Error: failed to connect to DB', 'error');  // error level
logger.log('Debug details: {connection}', 'debug');     // debug level
logger.log('Success: user registered', 'success');      // success level

// Combining with styling
const highlight = logger.color('cyan', 'bold');
logger.log(`Process completed in ${highlight('145ms')}`, 'success');

// Dynamic levels based on conditions
function logMessage(message: string, isError: boolean) {
  logger.log(message, isError ? 'error' : 'info');
}
```

### Advanced Configuration

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger({
  verbose: process.env.NODE_ENV === 'development',
  writeToDisk: true,
  logDir: './logs/app',
  logRetentionDays: 7,
});

// Later change configuration
if (process.env.CI) {
  logger.setColorsEnabled(false);
}
```

### Customized Progress Tracking

```typescript
import { Logger } from 'magiclogger';

const logger = new Logger();
const total = 1000;

logger.header('PROCESSING FILES');

for (let i = 0; i < total; i++) {
  // Process file...
  
  // Update progress every 10 items
  if (i % 10 === 0 || i === total - 1) {
    const percent = Math.round((i + 1) / total * 100);
    logger.progressBar(percent, 30, '▓', '░');
  }
}

logger.success('All files processed');
```

### Terminal Compatibility

```typescript
import { Logger, getTerminalSupport, isStyleSupported } from 'magiclogger';

const logger = new Logger();
const support = getTerminalSupport();

// Log terminal capabilities
logger.header('TERMINAL CAPABILITIES');
logger.log(`Colors supported: ${support.colors}`);
logger.log(`RGB colors supported: ${support.rgb}`);
logger.log(`Italic text supported: ${support.styles.italic}`);

// Adapt styling based on capabilities
if (support.styles.italic) {
  logger.custom('This terminal supports italic text', ['italic'], 'STYLE');
} else {
  logger.custom('This terminal does not support italic text', ['dim'], 'STYLE');
}
```

### Themes

MagicLogger supports dynamic theming using named presets or custom-defined themes. Themes control how log levels like `info`, `error`, `success`, and `header` are styled using color/style arrays.

---

#### 🎨 Use a Theme by Name

If your project includes a `themes.json` file and you'd like to use a predefined theme (like `dark`):

```ts
const logger = new Logger({
  theme: 'dark' // Automatically loads the 'dark' theme from ThemeManager
});
```

Make sure your theme/themes.json file looks something like this:
```
{
  "dark": {
    "info": ["cyan", "bold"],
    "error": ["brightRed", "bold"],
    "success": ["green", "bold"],
    "header": ["brightWhite", "bgBlue", "bold"]
  }
}
```

Switching themes:

```
const customTheme = {
  info: ['cyan', 'bold'],
  error: ['brightRed', 'bold'],
  success: ['green', 'bold'],
  header: ['brightWhite', 'bgBlue', 'bold']
};

const logger = new Logger();
logger.setTheme(customTheme);
logger.info('This log uses a manually applied theme!');
```

```
logger.setTheme({ info: ['magenta', 'bold'] });
logger.info('Theme updated at runtime');

logger.setTheme({ info: ['yellow', 'italic'] });
logger.info('Theme changed again');
```

### BaseCompatibleLogger 

```
import { BaseCompatibleLogger } from 'magiclogger';

class MyNewLogger extends BaseCompatibleLogger {
  log(level: string, message: string): void {
    switch (level) {
      case 'info':
      case 'warn':
      case 'error':
      case 'debug':
      case 'success':
        this.logger.log(message, level as LogLevel);
        break;
      case 'trace':
        this.logger.debug(`TRACE: ${message}`);
        break;
      case 'fatal':
        this.logger.error(`FATAL: ${message}`);
        break;
      default:
        if (this.strictLevels) {
          throw new Error(`Unknown level: ${level}`);
        }
        this.logger.custom(message, ['white'], level.toUpperCase());
    }
  }
}
```