/**
 * Test the Logger with Console Transport
 * 
 * Demonstrates that the Logger class automatically adds
 * a console transport when useConsole is true (default behavior).
 */

import { Logger } from '../dist/index.js';

console.log('🔮 Testing Logger (the complete logger with transports)...\n');
console.log('─'.repeat(60));

async function main() {
  console.log('\n1️⃣  Creating Logger with useConsole: true...\n');

  const logger = new Logger({
    useConsole: true,  // This should add console transport
    useColors: true,   // This should enable colors
    verbose: true      // Show debug messages
  });

  // Give it a moment for async transport setup
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('2️⃣  Testing basic log methods (should show colors):\n');

  logger.info('INFO: This should be in info color');
  logger.warn('WARNING: This should be in yellow/warning color');
  logger.error('ERROR: This should be in red/error color');
  logger.debug('DEBUG: This should be in gray/debug color');
  logger.success('SUCCESS: This should be in green/success color');

  console.log('\n3️⃣  Testing with context data:\n');

  logger.info('User login successful', {
    userId: 'usr_123',
    email: 'user@example.com',
    timestamp: new Date().toISOString()
  });

  console.log('\n4️⃣  Testing angle bracket syntax (styled output):\n');

  logger.info('<green>✅ This text should be green</>');
  logger.info('<red.bold>⚠️ Red and bold</> with <cyan>cyan text</>');
  logger.info('<yellow>Warning:</> <magenta>Process</> running at <red.bold>high CPU</>');

  console.log('\n5️⃣  Checking transport configuration:\n');

  console.log('Logger type:', logger.constructor.name);
  console.log('Has transportManager?', !!logger.transportManager);
  if (logger.transportManager) {
    console.log('Transports:', logger.listTransports());
  }

  // Wait for any async operations
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log('\n─'.repeat(60));
  console.log('\n✅ Logger test complete!');
  
  console.log('\n📝 Summary:');
  console.log('  • Colors should be visible in the log output above');
  console.log('  • Angle bracket syntax should be converted to styled text');
  console.log('  • Console transport should be listed in the transports');
  console.log('  • Output should be formatted text, not JSON');

  logger.close();
}

main().catch(console.error);