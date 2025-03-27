/**
 * Simple Console Enhancement Demo
 * 
 * This demo shows the basic usage of Magiclogger's console enhancement
 * without the complex compatibility examples.
 */

import { enhanceConsole } from 'magiclogger';

// Before enhancement
console.log('BEFORE ENHANCEMENT:');
console.log('Standard log message');
console.error('Standard error message');
console.log('');

// Enhance console
const { restoreConsole } = enhanceConsole();

// After enhancement
console.log('AFTER ENHANCEMENT:');
console.log('Enhanced log message');
console.error('Enhanced error message');

// New capabilities
console.log('\nNEW CAPABILITIES:');
console.success('Success message (new method)');

// Try a header
console.header('THIS IS A HEADER');

// Restore original console
console.log('\nRESTORING ORIGINAL CONSOLE...');
restoreConsole();
console.log('Back to standard console');

// Verify restoration
try {
  // @ts-ignore
  console.success('This should fail');
} catch (error) {
  console.log('✓ Successfully restored (success method no longer available)');
}