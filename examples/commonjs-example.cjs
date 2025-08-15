// CommonJS Example - Legacy JavaScript
// Usage: node scripts/commonjs-example.cjs

// CommonJS import
// For CommonJS (.cjs), this is correct:
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Logger } = require('../dist/index.cjs');

// If you are using ES modules (.mjs or "type": "module"), use:
// import { Logger } from '../dist/index.cjs';

// Create a new logger instance with minimal settings
// to avoid file system errors
const logger = new Logger({
  verbose: true,         // Show debug messages
  writeToDisk: false     // Disable file logging to avoid errors
});

console.log("=== MagicLogger CommonJS Example ===");

// Basic usage examples
console.log("\n--- DIRECT LOGGER METHODS ---");

// Universal log method with different levels
logger.log('Standard info message');
logger.log('Warning message example', 'warn');
logger.log('Error message example', 'error');
logger.log('Debug information (visible because verbose is true)', 'debug');
logger.log('Success message example', 'success');

// Level-specific methods
logger.info('Application starting with CommonJS require...');
logger.warn('Resource usage at 85%');
logger.error('Connection failed to database');
logger.debug('Authentication token details');
logger.success('Operation completed successfully');

// Visual elements
console.log("\n--- VISUAL ELEMENTS ---");

try {
  logger.header('HEADER EXAMPLE');
} catch (e) {
  console.log(`Header method error: ${e.message}`);
}

try {
  logger.progressBar(65);  // 65% progress bar
} catch (e) {
  console.log(`Progress bar error: ${e.message}`);
}

try {
  // Table example
  logger.table([
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob', role: 'User' }
  ]);
} catch (e) {
  console.log(`Table error: ${e.message}`);
}

// Custom styling
console.log("\n--- CUSTOM STYLING ---");

try {
  logger.custom('Database migration starting...', ['blue', 'bold'], 'DB');
} catch (e) {
  console.log(`Custom styling error: ${e.message}`);
}

try {
  logger.styled('Critical system notification', 'important');
} catch (e) {
  console.log(`Styled error: ${e.message}`);
}

// Advanced configuration at runtime
console.log("\n--- RUNTIME CONFIGURATION ---");

try {
  // Toggle verbose mode
  logger.setVerbose(false);
  logger.debug('This debug message should not be visible now');
  logger.setVerbose(true);
  logger.debug('This debug message should be visible again');
} catch (e) {
  console.log(`Verbose toggle error: ${e.message}`);
}

// Testing color settings
try {
  // Toggle colors on/off
  logger.setColorsEnabled(false);
  logger.info('This info message should have no colors');
  logger.setColorsEnabled(true);
  logger.info('This info message should have colors again');
} catch (e) {
  console.log(`Color toggle error: ${e.message}`);
}

console.log('\nCommonJS example complete!');