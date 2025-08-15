// ESM Example - Modern JavaScript
// Usage: node --experimental-modules scripts/esm-example.js
// Or with Node.js 14+: node scripts/esm-example.js

import { Logger } from '../dist/index.js';

// Create a new logger instance with configuration
const logger = new Logger({
  verbose: true,       // Show debug messages
  storeInBrowser: true // This would be ignored in Node.js environment
});

// Basic usage examples
logger.header('ESM LOGGER EXAMPLE');

// Universal log method with different levels
logger.log('Standard info message');
logger.log('Warning message example', 'warn');
logger.log('Error message example', 'error');
logger.log('Debug information (visible because verbose is true)', 'debug');
logger.log('Success message example', 'success');

// Level-specific methods
logger.info('Application starting with ESM import...');
logger.warn('Resource usage at 75%');
logger.error('Connection failed to database');
logger.debug('Authentication token details');
logger.success('Operation completed successfully');

// Visual elements
logger.header('PROGRESS EXAMPLE');
logger.progressBar(50);  // 50% complete
logger.progressBar(75, 30, '▓', '░');  // Custom appearance

// Table example
logger.header('TABLE EXAMPLE');
logger.table([
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
  { id: 3, name: 'Charlie', role: 'Moderator' }
]);

// Custom styling
logger.header('CUSTOM STYLING');
logger.custom('Database migration starting...', ['blue', 'bold'], 'DB');
logger.styled('Critical system notification', 'important');
logger.colorParts('File uploaded: user.json (2.4MB)', {
  'user.json': ['cyan', 'underline'],
  '2.4MB': ['green', 'bold']
});

console.log('\nESM example complete!');