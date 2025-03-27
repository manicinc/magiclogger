# Magiclogger Styling Guide

This guide demonstrates the advanced styling capabilities of Magiclogger to create rich, informative console output for your applications.

## Style Factories

Create reusable style functions with the `color` method:

```typescript
// Create reusable styling functions
const highlight = logger.color('yellow', 'bold');
const code = logger.color('brightGreen');
const path = logger.color('brightCyan', 'underline');
const metric = logger.color('magenta', 'bold');
const error = logger.color('brightRed', 'bold');
const success = logger.color('green', 'bold');

// Use the style functions in messages
console.log(`Use ${highlight('magiclogger')} to enhance your terminal output`);
console.log(`Import with ${code('import { Logger } from "magiclogger";')}`);
console.log(`Config file located at ${path('./config/logger.json')}`);
console.log(`Response time: ${metric('45ms')}, Status: ${success('OK')}`);
console.log(`${error('Error:')} Failed to connect to ${path('api.example.com')}`);
```

This approach makes styling consistent throughout your application and improves code readability.

## Terminal Compatibility

Magiclogger includes intelligent terminal detection to ensure your styles work consistently across different environments:

```typescript
import { getTerminalSupport, isStyleSupported } from 'magiclogger';

// Check if specific styles are supported
const support = getTerminalSupport();
console.log('Terminal style support:', support.styles);

// Use conditionally supported styles
if (support.styles.italic) {
  console.log('This terminal supports italic text');
}

// Magiclogger handles fallbacks automatically
// Even unsupported styles will gracefully degrade
logger.custom('This will adapt to terminal capabilities', ['italic', 'strikethrough'], 'ADAPTIVE');
```

## Best Practices

### Semantic Styling

Use consistent styling for similar message types to create a visual language in your logs:

```typescript
// Define semantic styles for your application
logger.custom('Starting server initialization...', ['brightCyan', 'bold'], 'SERVER');
logger.custom('Loading configuration...', ['cyan'], 'CONFIG');
logger.custom('Connecting to database...', ['cyan'], 'DATABASE');
logger.custom('Database connected successfully', ['green'], 'DATABASE');
logger.custom('Server started on http://localhost:3000', ['brightGreen', 'bold'], 'SERVER');
```

### Visual Hierarchy

Use styling to create a clear visual hierarchy in your logs:

```typescript
// Headers for main sections
logger.header('APPLICATION STARTUP');

// Subsection indicators
logger.custom('DATABASE INITIALIZATION', ['brightWhite', 'bold'], '>>>');

// Standard informational logs
logger.log('Establishing connection pool');

// Success/completion messages
logger.success('Connection pool established');

// Important metrics or values
logger.log(`Connection pool size: ${logger.color('magenta', 'bold')('25')}`);
```

### Color Intensity

Reserve bright colors and bold styles for important information:

```typescript
// Standard logs use normal intensity colors
logger.log('Processing request');

// Important information uses bright colors
logger.custom('User login', ['brightCyan'], 'AUTH');

// Warnings and errors use attention-grabbing styles
logger.warn('Rate limit approaching');
logger.error('Authentication failed');

// Critical alerts use maximum emphasis
logger.custom('SECURITY BREACH DETECTED', ['brightWhite', 'bgRed', 'bold'], '!!!');
```

### Font Requirements

Some styles like italic and strikethrough depend on terminal font support:

```typescript
// Magiclogger handles this automatically, but you can also check:
if (isStyleSupported('italic')) {
  // Use italic
} else {
  // Use alternative style
}
```

## Advanced Styling Examples

### System Status Dashboard

```typescript
logger.header('  SYSTEM STATUS DASHBOARD  ', ['brightWhite', 'bgBlue', 'bold']);

// Status indicators with custom styling
const services = [
  { name: 'API Server', status: 'online', uptime: '24h 15m', load: 'low' },
  { name: 'Database', status: 'degraded', uptime: '5d 7h', load: 'high' },
  { name: 'Cache', status: 'online', uptime: '5d 7h', load: 'medium' },
  { name: 'Authentication', status: 'online', uptime: '5d 7h', load: 'low' },
];

// Print status table
logger.table(services);

// Print status with custom styling
services.forEach(service => {
  // Determine status style
  let statusStyle: any[] = ['bold'];
  let statusPrefix = '●';
  
  if (service.status === 'online') {
    statusStyle.push('green');
  } else if (service.status === 'degraded') {
    statusStyle.push('yellow');
  } else {
    statusStyle.push('red');
  }
  
  // Determine load style
  let loadStyle: any[] = ['bold'];
  if (service.load === 'low') {
    loadStyle.push('green');
  } else if (service.load === 'medium') {
    loadStyle.push('yellow');
  } else {
    loadStyle.push('red');
  }
  
  // Print styled status
  logger.colorParts(
    `${statusPrefix} ${service.name}: ${service.status} (Uptime: ${service.uptime}, Load: ${service.load})`,
    {
      [statusPrefix]: statusStyle,
      [service.status]: statusStyle,
      [service.load]: loadStyle,
      [service.name]: ['brightWhite', 'bold']
    }
  );
});
```

### Log Parser Highlight

```typescript
// Create a function to highlight log entries
function highlightLogEntry(entry: string) {
  // Parse log parts (simplified example)
  const timestampMatch = entry.match(/\[(.*?)\]/);
  const timestamp = timestampMatch ? timestampMatch[0] : '';
  
  const levelMatch = entry.match(/\[(INFO|WARN|ERROR|DEBUG)\]/);
  const level = levelMatch ? levelMatch[0] : '';
  
  const ipMatch = entry.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  const ipAddress = ipMatch ? ipMatch[0] : '';
  
  const urlMatch = entry.match(/(\/[a-zA-Z0-9\/\._-]+)/);
  const url = urlMatch ? urlMatch[0] : '';
  
  // Create style mapping
  const styles: Record<string, any[]> = {};
  
  if (timestamp) styles[timestamp] = ['gray'];
  
  if (level) {
    if (level.includes('INFO')) styles[level] = ['green', 'bold'];
    if (level.includes('WARN')) styles[level] = ['yellow', 'bold'];
    if (level.includes('ERROR')) styles[level] = ['red', 'bold'];
    if (level.includes('DEBUG')) styles[level] = ['blue', 'bold'];
  }
  
  if (ipAddress) styles[ipAddress] = ['cyan'];
  if (url) styles[url] = ['brightCyan', 'underline'];
  
  // Apply styling
  return logger.colorParts(entry, styles);
}

// Example usage
const logEntries = [
  '[2023-05-15 14:30:22] [INFO] 192.168.1.5 - GET /api/users HTTP/1.1 200 (45ms)',
  '[2023-05-15 14:30:45] [WARN] 192.168.1.10 - POST /api/auth HTTP/1.1 429 (150ms)',
  '[2023-05-15 14:31:02] [ERROR] 192.168.1.15 - GET /api/products HTTP/1.1 500 (1250ms)'
];

logger.header('LOG ANALYZER');
logEntries.forEach(entry => {
  console.log(highlightLogEntry(entry));
});
```

### Build Process Output

```typescript
function runBuild() {
  logger.header('  BUILDING APPLICATION  ', ['brightWhite', 'bgBlue', 'bold']);
  
  // Step 1: Clean
  logger.custom('Cleaning output directory', ['blue'], 'STEP 1/5');
  for (let i = 0; i <= 100; i += 10) {
    logger.progressBar(i, 30, '■', '□');
    // Simulate work
  }
  logger.success('Clean complete');
  
  // Step 2: Compile TypeScript
  logger.custom('Compiling TypeScript', ['blue'], 'STEP 2/5');
  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 30, '■', '□');
    // Simulate work
  }
  
  // Show some fake compiler output with styling
  console.log(logger.colorParts(
    'Found 120 TypeScript files (15,400 lines of code)',
    { '120': ['brightCyan', 'bold'], '15,400': ['brightCyan', 'bold'] }
  ));
  
  logger.success('Compilation complete');
  
  // Step 3: Run tests
  logger.custom('Running tests', ['blue'], 'STEP 3/5');
  
  // Simulate test results with styling
  console.log(logger.colorParts(
    'PASS  src/utils.test.ts (15 tests, 1.2s)',
    { 'PASS': ['green', 'bold'], '15 tests': ['cyan'], '1.2s': ['magenta'] }
  ));
  
  console.log(logger.colorParts(
    'PASS  src/auth.test.ts (8 tests, 0.8s)',
    { 'PASS': ['green', 'bold'], '8 tests': ['cyan'], '0.8s': ['magenta'] }
  ));
  
  console.log(logger.colorParts(
    'FAIL  src/api.test.ts (12 tests, 1 failed, 1.5s)',
    { 'FAIL': ['red', 'bold'], '1 failed': ['red'], '12 tests': ['cyan'], '1.5s': ['magenta'] }
  ));
  
  // Show a test error with styling
  console.log(logger.colorParts(
    '  ● API Client › should handle authentication errors',
    { '●': ['red', 'bold'], 'should handle authentication errors': ['red'] }
  ));
  
  console.log(logger.colorParts(
    '    Expected: 401\n    Received: 500',
    { 'Expected:': ['green'], 'Received:': ['red'] }
  ));
  
  // Add a separator
  console.log();
  
  // Step 4: Bundle
  logger.custom('Creating production bundle', ['blue'], 'STEP 4/5');
  for (let i = 0; i <= 100; i += 2) {
    logger.progressBar(i, 30, '■', '□');
    // Simulate work
  }
  
  // Show bundle stats with styling
  console.log(logger.colorParts(
    'Bundle size: 1.45MB (578KB gzipped)',
    { '1.45MB': ['brightCyan', 'bold'], '578KB': ['green', 'bold'] }
  ));
  
  logger.success('Bundle complete');
  
  // Step 5: Deploy
  logger.custom('Deploying to production', ['blue'], 'STEP 5/5');
  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 30, '■', '□');
    // Simulate work
  }
  
  logger.success('Deployment complete');
  
  // Final summary
  logger.header('  BUILD SUMMARY  ', ['brightWhite', 'bgGreen', 'bold']);
  console.log(logger.colorParts(
    'Build completed in 45.8 seconds with 1 warning and 1 error',
    { '45.8 seconds': ['brightCyan', 'bold'], '1 warning': ['yellow', 'bold'], '1 error': ['red', 'bold'] }
  ));
}

runBuild();
```

## Universal Log Method Examples

The new universal `log()` method can be combined with styling techniques for powerful results:

```typescript
// Basic usage with different levels
logger.log('Processing user data');                    // Default: info level
logger.log('High CPU usage detected', 'warn');         // Warning level
logger.log('Database connection failed', 'error');     // Error level
logger.log('Request payload: {...}', 'debug');         // Debug level (only shown in verbose mode)
logger.log('Data migration completed', 'success');     // Success level

// Combining with style factories
const highlight = logger.color('cyan', 'bold');
const metric = logger.color('magenta', 'bold');

logger.log(`Processed ${highlight('10,000')} records in ${metric('3.5s')}`, 'success');
logger.log(`Request from ${highlight('192.168.1.1')} blocked by firewall`, 'warn');

// Create styled log entries
function createLogEntry(message: string, level: 'info' | 'warn' | 'error' | 'debug' | 'success' = 'info') {
  const timestamp = new Date().toISOString();
  logger.log(`[${timestamp}] ${message}`, level);
}

createLogEntry('User authenticated successfully', 'success');
createLogEntry('Invalid credentials provided', 'error');
```

## Conclusion

By leveraging Magiclogger's styling capabilities, you can create rich, informative console output that improves readability and helps users quickly identify important information. The intelligent terminal detection ensures that your logs look great in any environment, automatically adapting to terminal capabilities.

For more information on terminal compatibility and advanced usage, see the main [README](./README.md) and [API Documentation](./api.md) guides.