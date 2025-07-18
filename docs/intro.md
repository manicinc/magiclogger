---
sidebar_position: 1
slug: /
---

# Welcome to MagicLogger 🌈

**The most colorful TypeScript/JavaScript logging library**

MagicLogger is a powerful, no-config cross-platform logging library for both Node.js and browsers with rich styling, colors, and multiple output formats. It provides drop-in compatibility with popular logging libraries like Winston, Bunyan, and Pino.

## ✨ Key Features

- 🎨 **Rich Styling**: 256 colors, gradients, and advanced terminal styling
- 🔧 **Zero Configuration**: Works out of the box with sensible defaults
- 🌐 **Cross-Platform**: Node.js and browser support with automatic environment detection
- 📁 **File Logging**: Automatic log rotation and cleanup
- 🔄 **Drop-in Compatibility**: Replace Winston, Bunyan, or Pino without changing your code
- 🚀 **Performance**: Optimized for high-performance applications
- 📱 **Browser Storage**: Built-in localStorage support for client-side logging
- 🎯 **Progress Tracking**: Built-in progress bars and status indicators

## 🚀 Quick Start

### Installation

```bash
npm install magiclogger
```

### Basic Usage

```javascript
import { Logger } from 'magiclogger';

const logger = new Logger();

logger.info('Hello, colorful world! 🌈');
logger.success('Operation completed successfully');
logger.warn('This is a warning message');
logger.error('Something went wrong');
```

### With Styling

```javascript
import { Logger, COLORS, PRESETS } from 'magiclogger';

const logger = new Logger({ useColors: true });

// Using color arrays
logger.log('Custom styled message', ['brightBlue', 'bold', 'underline']);

// Using presets
logger.styled('Important message', PRESETS.highlight);

// Rainbow effect
logger.rainbow('🌈 Rainbow text! 🌈');
```

## 📚 Documentation Sections

- **[API Reference](./api_usage.md)** - Complete API documentation
- **[Compatibility Guide](./compatibility.md)** - Drop-in replacements for other loggers
- **[Browser Storage](./browser_storage.md)** - Client-side logging and storage
- **[Terminal Support](./terminal_support.md)** - Advanced terminal capabilities
- **[Contributing](./contributing.md)** - Help improve MagicLogger
- **[Development](./development.md)** - Developer setup and workflow

## 🏢 About Manic.agency

MagicLogger is built with ❤️ by the team at [Manic.agency](https://manic.agency) - where mania-driven development meets beautiful code.

**Contact us:**
- 🌐 Website: [manic.agency](https://manic.agency)
- 📧 Email: [team@manic.agency](mailto:team@manic.agency)
- 🐙 GitHub: [@manicinc](https://github.com/manicinc)

---

Ready to add some color to your logs? Let's get started! 🎨
