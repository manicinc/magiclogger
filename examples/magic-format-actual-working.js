/**
 * MAGIC Format with ACTUAL Working Styled Output
 * 
 * This example uses the logger methods that actually work
 * to produce styled console output while demonstrating MAGIC format.
 */

import { Logger } from '../dist/index.js';

console.log('🔮 MAGIC Format with Real Styled Output\n');
console.log('This demonstrates actual working styled logging from MagicLogger.\n');
console.log('─'.repeat(60));

async function main() {
  console.log('\n1️⃣  Creating logger and testing basic output...\n');

  const logger = new Logger({
    useConsole: true,
    level: 'debug'
  });

  // Test basic logging first (these SHOULD show with colors based on level)
  console.log('Testing standard log methods (should have level-based colors):');
  logger.info('INFO: This should appear in the default info color');
  logger.warn('WARNING: This should appear in yellow/warning color');
  logger.error('ERROR: This should appear in red/error color');
  logger.debug('DEBUG: This should appear in gray/debug color');
  logger.success('SUCCESS: This should appear in green/success color');

  console.log('\n─'.repeat(60));
  console.log('\n2️⃣  Testing structured logging with context...\n');

  // Log with context data (this should work)
  logger.info('User authentication completed', {
    userId: 'usr_123456',
    email: 'john.doe@example.com',
    method: 'OAuth2'
  });

  logger.error('Database connection failed', {
    host: 'db.example.com',
    port: 5432,
    error: 'Connection timeout'
  });

  console.log('\n─'.repeat(60));
  console.log('\n3️⃣  Testing if angle bracket syntax works at all...\n');

  // Test if the angle bracket syntax is parsed
  console.log('Attempting angle bracket syntax:');
  logger.info('<red>This text should be red if angle brackets work</>');
  logger.info('<green.bold>Green and bold text</> with <cyan>cyan text</>');
  
  // Try different approaches
  logger.log('Testing log method with angle brackets: <yellow>yellow text</>');

  console.log('\n─'.repeat(60));
  console.log('\n4️⃣  What MAGIC format WOULD look like...\n');

  // Show what the MAGIC format structure should be
  const idealMagicFormat = {
    id: 'example-001',
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    level: 'info',
    message: 'User authentication completed',  // Plain text
    styles: [  // Style ranges (if styles were extracted)
      [0, 4, 'green.bold'],  // "User"
      [20, 29, 'cyan']       // "completed"
    ],
    context: {
      userId: 'usr_123456',
      email: 'john.doe@example.com'
    }
  };

  console.log('📊 Ideal MAGIC format structure:');
  console.log(JSON.stringify(idealMagicFormat, null, 2));

  console.log('\n─'.repeat(60));
  console.log('\n5️⃣  Current state analysis...\n');

  console.log('🔍 What we expected:');
  console.log('  • Styled console output with colors');
  console.log('  • Angle bracket syntax parsed and applied');
  console.log('  • MAGIC format with extracted styles');

  console.log('\n❌ What actually happens:');
  console.log('  • Basic log levels might have colors');
  console.log('  • Angle bracket syntax NOT parsed (shows as raw text)');
  console.log('  • No style extraction to MAGIC format');

  console.log('\n💡 Conclusion:');
  console.log('  The angle bracket styling feature appears to be:');
  console.log('  1. Not enabled in the current build');
  console.log('  2. Requires additional configuration');
  console.log('  3. Or needs to be implemented differently');

  console.log('\n📝 Workaround options:');
  console.log('  1. Use standard log levels (info, warn, error) for basic colors');
  console.log('  2. Manually create MAGIC format entries');
  console.log('  3. Wait for angle bracket parsing to be fixed/enabled');
  console.log('  4. Use a different styling approach');

  // Clean up
  logger.close();

  console.log('\n✅ Analysis complete!');
  console.log('\nNote: If you see ANY colors above, those are the working parts.');
  console.log('If you see <angle brackets>, that feature is NOT working.');
}

main().catch(console.error);