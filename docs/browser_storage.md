# Browser Storage in MagicLogger

MagicLogger provides built-in support for storing logs in browser environments through localStorage. This guide explains how to use this feature to persist, retrieve, download, and manage logs in web applications.

## Basic Usage

```javascript
// Create a logger with browser storage enabled
const logger = new Logger({
  storeInBrowser: true,            // Enable browser storage
  maxStoredLogs: 1000,             // Store up to 1000 log entries (default)
  storageName: 'my-app-logs',      // Custom storage key name (default: 'magiclogger-logs')
  useLocalStorage: true,           // Use localStorage (default) vs IndexedDB (future)
  verbose: true                    // Enable debug logging
});

// Log messages as usual - they'll be stored in browser storage
logger.info('Application started');
logger.warn('Configuration issue detected');
logger.error('Failed to load resource');
logger.debug('Auth token: xyz123'); // Only logged if verbose is true
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storeInBrowser` | boolean | `false` | Enable browser storage |
| `maxStoredLogs` | number | `1000` | Maximum number of logs to store |
| `storageName` | string | `'magiclogger-logs'` | Key name for localStorage |
| `useLocalStorage` | boolean | `true` | Use localStorage instead of sessionStorage |

## Retrieving Logs

Retrieve all stored logs as an array:

```javascript
// Get all stored logs as an array
const logs = logger.getLogs();

if (logs && logs.length > 0) {
  // Display logs in the application
  const logContainer = document.getElementById('log-display');
  logContainer.innerHTML = logs.map(log => `<div>${log}</div>`).join('');
  
  // Or just log them to console
  console.table(logs);
}
```

## Downloading Logs

MagicLogger makes it easy to download stored logs as a text file:

```javascript
// Set up download button
document.getElementById('download-logs').addEventListener('click', () => {
  // Download logs as a text file
  logger.downloadLogs('application-logs.txt');
});
```

## Clearing Logs

Clear all stored logs when needed:

```javascript
// Clear all stored logs
logger.clearLogs();
```

## Enabling/Disabling Storage

Toggle storage at runtime:

```javascript
// Disable log storage
logger.setStorageEnabled(false);

// Re-enable log storage
logger.setStorageEnabled(true);
```

## Storage Details

- **localStorage**: Logs are stored in browser's localStorage (limited to ~5MB)
- **Automatic Rotation**: When logs exceed maxStoredLogs, oldest entries are automatically removed
- **Persistence**: Logs persist across page refreshes and browser sessions
- **Timestamp**: Each log entry is automatically timestamped
- **Format**: Logs are stored with level prefixes: `[2023-01-01T12:00:00.000Z] [INFO] Message`

## Browser Compatibility

The browser storage feature is compatible with all modern browsers that support localStorage:

- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge 12+
- Opera 11.5+
- Mobile browsers (iOS Safari, Android Browser, Chrome for Android)

## Cross-Environment Compatibility

MagicLogger is designed to work seamlessly in both Node.js and browser environments:

```javascript
// Same configuration works everywhere
const logger = new Logger({
  writeToDisk: true,     // Used in Node.js
  storeInBrowser: true,  // Used in browser
  verbose: true
});

// Log methods work the same in both environments
logger.info('Application starting');
logger.warn('Resource not found');
logger.error('Operation failed');

// Environment-specific features are available when needed
if (typeof window !== 'undefined') {
  // Browser-specific operations
  const logs = logger.getLogs();
  logger.downloadLogs('app-logs.txt');
} else {
  // Node.js-specific operations
  const logPath = logger.getPath();
  console.log(`Logs are stored at: ${logPath}`);
}
```

## Interactive Demo

Try our interactive [Browser Storage Demo](../demos/browser-storage-demo.html) to see these features in action. The demo allows you to:

- Create logs with different levels
- Store logs in browser's localStorage
- View stored logs
- Download logs as a text file
- Clear stored logs
- Configure storage settings

## API Reference

### Logger Options

These options can be passed when creating a new Logger instance:

```javascript
const logger = new Logger({
  storeInBrowser: true,
  maxStoredLogs: 500,
  storageName: 'custom-log-key',
  useLocalStorage: true
});
```

### Browser Storage Methods

| Method | Description |
|--------|-------------|
| `getLogs()` | Returns an array of all stored log entries |
| `clearLogs()` | Removes all logs from storage |
| `downloadLogs(filename)` | Downloads logs as a text file |
| `setStorageEnabled(enabled)` | Enables or disables browser storage |

## Complete Example

Here's a complete example of a web application that uses MagicLogger's browser storage:

```html
<!DOCTYPE html>
<html>
<head>
  <title>MagicLogger Demo</title>
  <style>
    .log-container {
      height: 300px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
      font-family: monospace;
    }
    .log-actions {
      margin-top: 10px;
    }
    button {
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <h1>MagicLogger Browser Storage Demo</h1>
  
  <div class="log-container" id="log-display"></div>
  
  <div class="log-actions">
    <button id="log-info">Log Info</button>
    <button id="log-warn">Log Warning</button>
    <button id="log-error">Log Error</button>
    <button id="view-logs">View Logs</button>
    <button id="download-logs">Download Logs</button>
    <button id="clear-logs">Clear Logs</button>
  </div>
  
  <script type="module">
    import { Logger } from './magiclogger.js';
    
    // Initialize logger with browser storage
    const logger = new Logger({ 
      storeInBrowser: true,
      storageName: 'demo-logs'
    });
    
    // Log action handlers
    document.getElementById('log-info').addEventListener('click', () => {
      logger.info('Info message at ' + new Date().toLocaleTimeString());
      updateDisplay();
    });
    
    document.getElementById('log-warn').addEventListener('click', () => {
      logger.warn('Warning message at ' + new Date().toLocaleTimeString());
      updateDisplay();
    });
    
    document.getElementById('log-error').addEventListener('click', () => {
      logger.error('Error message at ' + new Date().toLocaleTimeString());
      updateDisplay();
    });
    
    document.getElementById('view-logs').addEventListener('click', updateDisplay);
    
    document.getElementById('download-logs').addEventListener('click', () => {
      logger.downloadLogs('demo-logs.txt');
    });
    
    document.getElementById('clear-logs').addEventListener('click', () => {
      logger.clearLogs();
      updateDisplay();
    });
    
    // Display logs in the container
    function updateDisplay() {
      const logs = logger.getLogs() || [];
      const display = document.getElementById('log-display');
      
      if (logs.length === 0) {
        display.innerHTML = '<i>No logs yet.</i>';
      } else {
        display.innerHTML = logs
          .map(log => {
            // Apply simple formatting based on log level
            if (log.includes('[ERROR]')) {
              return `<div style="color: red">${log}</div>`;
            } else if (log.includes('[WARN]')) {
              return `<div style="color: orange">${log}</div>`;
            } else {
              return `<div>${log}</div>`;
            }
          })
          .join('');
          
        // Scroll to bottom
        display.scrollTop = display.scrollHeight;
      }
    }
    
    // Initial display
    updateDisplay();
  </script>
</body>
</html>
```

## Future Enhancements

The browser storage feature will be expanded in future releases with:

- IndexedDB support for storing larger amounts of logs
- Log filtering and search capabilities
- Log level filtering
- Remote logging transport
- Log compression
- Log analytics and visualization

For more information on other MagicLogger features, refer to the [API Reference](./api_usage.md) and [main documentation](../README.md).