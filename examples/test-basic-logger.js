/**
 * Test Basic Logger Functionality
 * 
 * Simple test to see if the logger is working at all
 */

import { Logger } from '../dist/index.js';

console.log('Testing basic logger...\n');

const logger = new Logger();

// Most basic test
console.log('1. Basic console.log (should work):');
console.log('This is a regular console.log message');

console.log('\n2. Logger methods:');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
logger.success('Success message');

console.log('\n3. Checking logger configuration:');
console.log('Logger instance:', logger);
console.log('Logger properties:', Object.keys(logger));
console.log('Use console?:', logger.useConsole);
console.log('Use colors?:', logger.useColors);

console.log('\n4. Direct console with ANSI codes:');
console.log('\x1b[31mThis text should be RED\x1b[0m');
console.log('\x1b[32mThis text should be GREEN\x1b[0m');
console.log('\x1b[33mThis text should be YELLOW\x1b[0m');

console.log('\nDone.');