# Browser Storage in MagicLogger

MagicLogger automatically provides localStorage support when running in browser environments. This guide explains how to use the built-in storage features to persist, retrieve, download, and manage logs in web applications.

## Table of Contents

- [Overview](#overview)
- [Automatic Browser Detection](#automatic-browser-detection)
- [Basic Usage](#basic-usage)
- [Configuration Options](#configuration-options)
- [Retrieving Logs](#retrieving-logs)
- [Downloading Logs](#downloading-logs)
- [Clearing Logs](#clearing-logs)
- [Storage Management](#storage-management)
- [Storage Details](#storage-details)
- [Browser Compatibility](#browser-compatibility)
- [Cross-Environment Usage](#cross-environment-usage)
- [API Reference](#api-reference)
- [Complete Example](#complete-example)

## Overview

When MagicLogger runs in a browser environment, it automatically:
- Detects the browser context
- Uses the BrowserLogger implementation
- Stores logs in localStorage
- Provides methods to retrieve and manage stored logs
- Enables log downloads

## Automatic Browser Detection

```javascript
import { Logger } from 'magiclogger';

// Logger automatically detects the environment
const logger = new Logger({
  id: 'web-app',
  tags: ['frontend'],
  context: {
    version: '1.0.0',
    environment: 'production'
  }
});

// In browser: BrowserLogger with localStorage
// In Node.js: NodeLogger with file system
```

## Basic Usage

```javascript
// Create a logger - browser storage is automatic
const logger = new Logger();

// All log methods work the same, but logs are stored in localStorage
logger.info('Application started');
logger.warn('API rate limit approaching');
logger.error('Failed to fetch user data');
logger.debug('Cache miss for key: user-profile');
logger.success('Settings saved successfully');

// Logs are automatically stored with timestamps
```

## Configuration Options

While browser storage works automatically, you can configure storage behavior through logger options:

```javascript
const logger = new Logger({
  // Standard logger options
  id: 'my-app',
  verbose: true,
  useColors: true,
  
  // Note: Browser-specific storage options are handled internally
  // The BrowserLogger uses a fixed storage key: 'logger_logs'
});
```

## Retrieving Logs

Get all stored logs as an array:

```javascript
// Get all stored logs
const logs = logger.getLogs();

if (logs && logs.length > 0) {
  console.log(`Found ${logs.length} stored logs`);
  
  // Process logs
  logs.forEach(log => {
    console.log(log);
  });
  
  // Filter logs
  const errors = logs.filter(log => log.includes('[ERROR]'));
  const warnings = logs.filter(log => log.includes('[WARN]'));
  
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
}
```

### Log Format

Logs are stored in the format:
```
[TIMESTAMP] [LEVEL] Message
```

Example:
```
[2024-01-15T10:30:45.123Z] [INFO] Application started
[2024-01-15T10:30:46.456Z] [ERROR] Failed to fetch user data
```

## Downloading Logs

Download logs as a text file for debugging or analysis:

```javascript
// Download with default filename (logs.txt)
logger.downloadLogs();

// Download with custom filename
logger.downloadLogs('debug-logs.txt');

// Download with timestamp
const timestamp = new Date().toISOString().split('T')[0];
logger.downloadLogs(`app-logs-${timestamp}.txt`);
```

### Implementation Example

```javascript
// Add download button to your app
document.getElementById('download-logs-btn').addEventListener('click', () => {
  logger.downloadLogs('application-logs.txt');
});

// Download logs on error
window.addEventListener('error', (event) => {
  logger.error(`Uncaught error: ${event.message}`);
  
  // Optionally auto-download for debugging
  if (confirm('An error occurred. Download logs?')) {
    logger.downloadLogs('error-logs.txt');
  }
});
```

## Clearing Logs

Remove all stored logs:

```javascript
// Clear all logs from localStorage
logger.clearLogs();

// Clear with confirmation
function clearLogsWithConfirmation() {
  const logs = logger.getLogs();
  if (logs && logs.length > 0) {
    if (confirm(`Clear ${logs.length} logs?`)) {
      logger.clearLogs();
      console.log('Logs cleared');
    }
  }
}
```

## Storage Management

### Enable/Disable Storage

```javascript
// Disable storage at runtime
logger.setStorageEnabled(false);

// Re-enable storage
logger.setStorageEnabled(true);
```

### Storage Monitoring

```javascript
// Check storage usage
function checkStorageUsage() {
  const logs = logger.getLogs() || [];
  const storageKey = 'logger_logs';
  const storageContent = localStorage.getItem(storageKey) || '';
  const sizeInBytes = new Blob([storageContent]).size;
  
  return {
    logCount: logs.length,
    sizeInBytes: sizeInBytes,
    sizeInKB: (sizeInBytes / 1024).toFixed(2),
    sizeInMB: (sizeInBytes / 1024 / 1024).toFixed(2)
  };
}

// Monitor storage
const usage = checkStorageUsage();
console.log(`Storing ${usage.logCount} logs using ${usage.sizeInKB}KB`);
```

### Rotation Strategy

Since localStorage has a ~5MB limit, implement rotation:

```javascript
// Custom rotation based on log count
function rotateLogs(maxLogs = 1000) {
  const logs = logger.getLogs();
  if (logs && logs.length > maxLogs) {
    // Keep only the most recent logs
    const recentLogs = logs.slice(-maxLogs);
    localStorage.setItem('logger_logs', JSON.stringify(recentLogs));
  }
}

// Rotate on page load
window.addEventListener('load', () => {
  rotateLogs(500);
});
```

## Storage Details

- **Storage Key**: `logger_logs`
- **Storage Type**: localStorage (persistent across sessions)
- **Format**: JSON array of log strings
- **Size Limit**: ~5MB (browser dependent)
- **Automatic Timestamps**: Each log entry includes ISO timestamp
- **Persistence**: Logs persist until explicitly cleared

## Browser Compatibility

The browser storage feature works in all modern browsers:

- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge 12+
- Opera 11.5+
- iOS Safari 3.2+
- Android Browser 2.1+

Note: Private/Incognito mode may affect localStorage availability.

## Cross-Environment Usage

MagicLogger works seamlessly across environments:

```javascript
// Same code works in both Node.js and browsers
const logger = new Logger({
  id: 'universal-app',
  verbose: true
});

// Environment-specific features
if (typeof window !== 'undefined') {
  // Browser-specific
  const logs = logger.getLogs();
  logger.downloadLogs('browser-logs.txt');
  logger.clearLogs();
  logger.setStorageEnabled(true);
} else {
  // Node.js-specific
  const logPath = logger.getPath();
  logger.setLogDir('./logs');
  logger.setFileLogging(true);
}
```

## API Reference

### Browser-Specific Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getLogs()` | Get all stored logs | `string[] \| null` |
| `clearLogs()` | Clear all stored logs | `void` |
| `downloadLogs(filename?)` | Download logs as text file | `void` |
| `setStorageEnabled(enabled)` | Enable/disable storage | `void` |

### Usage Examples

```javascript
// Get logs
const allLogs = logger.getLogs();

// Clear logs
logger.clearLogs();

// Download logs
logger.downloadLogs(); // downloads as 'logs.txt'
logger.downloadLogs('my-app-logs.txt'); // custom filename

// Toggle storage
logger.setStorageEnabled(false); // disable
logger.setStorageEnabled(true);  // enable
```

## Complete Example

Here's a full example of a web application using MagicLogger's browser storage:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MagicLogger Browser Storage Demo</title>
  <style>
    .log-viewer {
      height: 300px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
      font-family: monospace;
      background: #f5f5f5;
    }
    .controls {
      margin: 10px 0;
    }
    button {
      margin-right: 10px;
      padding: 5px 15px;
    }
    .stats {
      margin: 10px 0;
      padding: 10px;
      background: #e0e0e0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>MagicLogger Browser Storage Demo</h1>
  
  <div class="controls">
    <button id="log-info">Log Info</button>
    <button id="log-warn">Log Warning</button>
    <button id="log-error">Log Error</button>
    <button id="refresh">Refresh View</button>
    <button id="download">Download Logs</button>
    <button id="clear">Clear Logs</button>
  </div>
  
  <div class="stats" id="stats"></div>
  <div class="log-viewer" id="log-viewer"></div>
  
  <script type="module">
    import { Logger } from './magiclogger.js';
    
    // Initialize logger
    const logger = new Logger({
      id: 'demo-app',
      verbose: true
    });
    
    // Update stats
    function updateStats() {
      const logs = logger.getLogs() || [];
      const stats = document.getElementById('stats');
      stats.innerHTML = `
        Total Logs: ${logs.length}<br>
        Errors: ${logs.filter(l => l.includes('[ERROR]')).length}<br>
        Warnings: ${logs.filter(l => l.includes('[WARN]')).length}
      `;
    }
    
    // Display logs
    function displayLogs() {
      const logs = logger.getLogs() || [];
      const viewer = document.getElementById('log-viewer');
      
      if (logs.length === 0) {
        viewer.innerHTML = '<i>No logs yet</i>';
      } else {
        viewer.innerHTML = logs
          .map(log => `<div>${log}</div>`)
          .join('');
        viewer.scrollTop = viewer.scrollHeight;
      }
      
      updateStats();
    }
    
    // Event handlers
    document.getElementById('log-info').addEventListener('click', () => {
      logger.info('Info message at ' + new Date().toLocaleTimeString());
      displayLogs();
    });
    
    document.getElementById('log-warn').addEventListener('click', () => {
      logger.warn('Warning at ' + new Date().toLocaleTimeString());
      displayLogs();
    });
    
    document.getElementById('log-error').addEventListener('click', () => {
      logger.error('Error at ' + new Date().toLocaleTimeString());
      displayLogs();
    });
    
    document.getElementById('refresh').addEventListener('click', displayLogs);
    
    document.getElementById('download').addEventListener('click', () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      logger.downloadLogs(`demo-logs-${timestamp}.txt`);
    });
    
    document.getElementById('clear').addEventListener('click', () => {
      if (confirm('Clear all logs?')) {
        logger.clearLogs();
        displayLogs();
      }
    });
    
    // Initial display
    displayLogs();
    
    // Log page load
    logger.info('Demo page loaded');
    displayLogs();
  </script>
</body>
</html>
```

This example demonstrates all browser storage features including viewing, downloading, and clearing logs.