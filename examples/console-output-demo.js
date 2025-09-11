/**
 * Console Output Demo
 * 
 * Demonstrates the default console output behavior of MagicLogger.
 * By default, Logger includes a console transport that outputs
 * styled, human-readable text (not JSON).
 */

import { Logger, meta, err } from '../dist/index.js';

console.log('🎨 MagicLogger Console Output Demo\n');
console.log('='.repeat(60));
console.log('This demo shows the default console transport behavior.');
console.log('By default, useConsole is true and outputs styled text.\n');

async function main() {
  // Create logger with default settings
  console.log('1️⃣ Creating logger with default settings...\n');
  const logger = new Logger({
    // useConsole: true is the default - no need to specify
    // useColors: true is the default - no need to specify
  });

  // Wait for async transport initialization
  await new Promise(resolve => setTimeout(resolve, 100));

  // Basic colored output
  console.log('2️⃣ Basic log levels with automatic coloring:\n');
  
  logger.debug('Debug message - typically gray');
  logger.info('Info message - typically blue');
  logger.warn('Warning message - typically yellow');
  logger.error('Error message - typically red');
  logger.success('Success message - typically green');
  
  await new Promise(resolve => setTimeout(resolve, 50));

  // Styled messages with angle brackets
  console.log('\n3️⃣ Styled messages using angle bracket syntax:\n');
  
  logger.info('<green>✅ Success:</> User authenticated');
  logger.warn('<yellow.bold>⚠️ Warning:</> <cyan>Cache</> is nearly full');
  logger.error('<red.bold>❌ Error:</> Failed to connect to <yellow>database</>');
  logger.info('<magenta>🔄 Processing:</> <cyan.bold>1000</> items remaining');
  
  await new Promise(resolve => setTimeout(resolve, 50));

  // Messages with metadata
  console.log('\n4️⃣ Structured logging with metadata:\n');
  
  logger.info('User action', meta({
    userId: 'usr_123',
    action: 'login',
    ip: '192.168.1.1'
  }));
  
  logger.error('Database connection failed', err(new Error('Connection timeout')), meta({
    host: 'db.example.com',
    port: 5432,
    retries: 3
  }));
  
  await new Promise(resolve => setTimeout(resolve, 50));

  // Complex styled messages
  console.log('\n5️⃣ Complex styling combinations:\n');
  
  logger.info(
    '<cyan.bold>System Status:</> ' +
    'CPU: <green>45%</> | ' +
    'Memory: <yellow>72%</> | ' +
    'Disk: <red.bold>89%</>'
  );
  
  logger.success(
    '<green.bold>✨ Deployment Complete!</> ' +
    'Version <cyan>2.1.0</> deployed to <yellow>production</>'
  );
  
  await new Promise(resolve => setTimeout(resolve, 50));

  // Verify console transport
  console.log('\n6️⃣ Transport configuration:\n');
  
  const transports = logger.listTransports();
  console.log('Active transports:', transports);
  console.log('Console transport active:', transports.includes('console'));
  
  // Demonstrate disabling console
  console.log('\n7️⃣ Creating logger with console disabled:\n');
  
  const silentLogger = new Logger({
    useConsole: false  // Explicitly disable console output
  });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Silent logger transports:', silentLogger.listTransports());
  silentLogger.info('This message will not appear in console');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Demo complete!\n');
  console.log('Key takeaways:');
  console.log('  • useConsole: true is the default behavior');
  console.log('  • Console output is styled text, not JSON');
  console.log('  • Angle bracket syntax creates colored output');
  console.log('  • Each log level has its own color');
  console.log('  • Metadata is included but formatted nicely');
  
  // Cleanup
  logger.close();
  silentLogger.close();
}

main().catch(console.error);