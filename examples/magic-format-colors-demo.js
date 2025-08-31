/**
 * MAGIC Format Demo with Proper Colors
 * 
 * This example uses the logger's built-in styling methods to ensure
 * we see actual colored output while demonstrating MAGIC format capture.
 */

import { Logger } from '../dist/index.js';

console.log('🔮 MAGIC Format Demo - With Actual Colors\n');
console.log('This demonstrates both colored console output and MAGIC format structure.\n');
console.log('─'.repeat(60));

async function main() {
  console.log('\n1️⃣  Setting up logger with built-in styling...\n');

  const logger = new Logger({
    useConsole: true,
    level: 'debug'
  });

  // Create color helpers using the logger's built-in methods
  const success = logger.color('green', 'bold');
  const warning = logger.color('yellow');
  const error = logger.color('red', 'bold');
  const highlight = logger.color('cyan');
  const info = logger.color('blue');
  
  console.log('2️⃣  Logging with proper colors (using logger.color() method)...\n');

  // Use the color methods to create styled output
  logger.info(`${success('✅ Success:')} Server started on port ${highlight('3000')}`);
  logger.warn(`${warning('⚠️ Warning:')} Memory usage at ${error('85%')} capacity`);
  logger.error(`${error('❌ Error:')} Connection to ${warning('api.example.com')} failed`);
  
  // Plain context log
  logger.info('User logged in successfully', {
    userId: 'usr_123',
    email: 'user@example.com'
  });

  // More complex styling
  const deployHeader = logger.color('white', 'bold', 'bgBlue');
  const envName = logger.color('green', 'bold');
  logger.info(`${deployHeader(' DEPLOY ')} Starting deployment to ${envName('production')}`);

  console.log('\n─'.repeat(60));
  console.log('\n3️⃣  Creating styled messages with angle bracket syntax...\n');
  
  // Test if angle brackets work at all
  logger.info('Testing angle bracket syntax:');
  logger.info('<red>This should be red text</>');
  logger.info('<green.bold>This should be green and bold</>');
  logger.info('<bg.blue><white>White text on blue background</></>')

  console.log('\n─'.repeat(60));
  console.log('\n4️⃣  Demonstrating MAGIC format concept...\n');

  // Show what MAGIC format would look like for these entries
  const sampleMagicEntries = [
    {
      id: 'demo-001',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '✅ Success: Server started on port 3000',
      styles: [
        [0, 10, 'green.bold'],    // "✅ Success:"
        [36, 40, 'cyan']          // "3000"
      ]
    },
    {
      id: 'demo-002', 
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: '⚠️ Warning: Memory usage at 85% capacity',
      styles: [
        [0, 11, 'yellow'],        // "⚠️ Warning:"
        [27, 30, 'red.bold']      // "85%"
      ]
    },
    {
      id: 'demo-003',
      timestamp: new Date().toISOString(), 
      level: 'info',
      message: 'User logged in successfully',
      context: {
        userId: 'usr_123',
        email: 'user@example.com'
      }
    }
  ];

  console.log('📊 Sample MAGIC format entries:\n');

  sampleMagicEntries.forEach((entry, index) => {
    console.log(`Entry ${index + 1}:`);
    console.log(`  Message: "${entry.message}"`);
    if (entry.styles) {
      console.log(`  Styles:`);
      entry.styles.forEach(([start, end, style]) => {
        const text = entry.message.substring(start, end);
        console.log(`    • "${text}" → ${style} (positions ${start}-${end})`);
      });
    }
    if (entry.context) {
      console.log(`  Context: ${Object.keys(entry.context).join(', ')}`);
    }
    console.log('');
  });

  console.log('─'.repeat(60));
  console.log('\n5️⃣  JSON representation:\n');

  console.log('Raw MAGIC format JSON:');
  console.log(JSON.stringify(sampleMagicEntries[0], null, 2));

  console.log('\n─'.repeat(60));
  console.log('\n✨ Key Benefits Demonstrated:\n');

  console.log('🎨 Visual Output:');
  console.log(`  • ${success('Colored console output')} for human readability`);
  console.log(`  • ${info('Rich styling')} enhances log visibility`);
  console.log(`  • ${highlight('Important values')} stand out clearly`);

  console.log('\n📊 MAGIC Format:');
  console.log('  • Plain text: "Success: Server started on port 3000"');
  console.log('  • Style ranges: [[0,10,"green.bold"],[36,40,"cyan"]]');
  console.log('  • Universal JSON structure for any platform');
  console.log('  • Searchable and queryable in databases/aggregators');

  console.log('\n🔄 Best of Both Worlds:');
  console.log('  • Humans see beautiful colored output');
  console.log('  • Machines get structured, searchable data');
  console.log('  • Styles preserved for reconstruction anywhere');

  logger.close();
  
  console.log('\n✅ Demo complete! This shows the MAGIC format concept with working colors.');
}

main().catch(console.error);