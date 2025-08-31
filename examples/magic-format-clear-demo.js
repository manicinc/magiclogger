/**
 * Clear MAGIC Format Demonstration
 * 
 * This example clearly shows the MAGIC format concept by:
 * 1. Creating sample styled log entries
 * 2. Showing what the MAGIC format structure looks like
 * 3. Demonstrating the benefits without getting caught up in styling issues
 */

import { Logger } from '../dist/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔮 MAGIC Format - Clear Demonstration\n');
console.log('This shows how styled logs become structured MAGIC format data.\n');
console.log('─'.repeat(60));

// Helper to create ANSI colored output for demonstration
function colorize(text, style) {
  const styles = {
    'green.bold': '\x1b[32m\x1b[1m',
    'red.bold': '\x1b[31m\x1b[1m',
    'yellow': '\x1b[33m',
    'cyan': '\x1b[36m',
    'blue': '\x1b[34m',
    'reset': '\x1b[0m'
  };
  
  return styles[style] ? `${styles[style]}${text}${styles.reset}` : text;
}

async function main() {
  console.log('\n1️⃣  What users see: Styled console output\n');
  
  // Show what colorized logs look like to humans
  console.log(`${colorize('✅ Success:', 'green.bold')} Server started on port ${colorize('3000', 'cyan')}`);
  console.log(`${colorize('⚠️ Warning:', 'yellow')} Memory usage at ${colorize('85%', 'red.bold')} capacity`);
  console.log(`${colorize('❌ Error:', 'red.bold')} Connection to ${colorize('api.example.com', 'yellow')} failed`);
  console.log(`User authentication completed`);

  console.log('\n─'.repeat(60));
  console.log('\n2️⃣  What machines get: MAGIC format structured data\n');

  // Create the corresponding MAGIC format entries
  const magicEntries = [
    {
      id: '1725000001-abc123',
      timestamp: '2024-08-30T12:00:01.000Z',
      timestampMs: 1725000001000,
      level: 'info',
      message: '✅ Success: Server started on port 3000',
      styles: [
        [0, 10, 'green.bold'],    // "✅ Success:"
        [36, 40, 'cyan']          // "3000"
      ]
    },
    {
      id: '1725000002-def456',
      timestamp: '2024-08-30T12:00:02.000Z', 
      timestampMs: 1725000002000,
      level: 'warn',
      message: '⚠️ Warning: Memory usage at 85% capacity',
      styles: [
        [0, 11, 'yellow'],        // "⚠️ Warning:"
        [27, 30, 'red.bold']      // "85%"
      ]
    },
    {
      id: '1725000003-ghi789',
      timestamp: '2024-08-30T12:00:03.000Z',
      timestampMs: 1725000003000, 
      level: 'error',
      message: '❌ Error: Connection to api.example.com failed',
      styles: [
        [0, 8, 'red.bold'],       // "❌ Error:"
        [23, 39, 'yellow']        // "api.example.com"
      ]
    },
    {
      id: '1725000004-jkl012',
      timestamp: '2024-08-30T12:00:04.000Z',
      timestampMs: 1725000004000,
      level: 'info', 
      message: 'User authentication completed',
      context: {
        userId: 'usr_123456',
        email: 'john.doe@example.com',
        method: 'OAuth2',
        duration: 145
      }
    }
  ];

  // Show the MAGIC format structure
  console.log('📊 MAGIC format entries:');
  console.log('');
  
  magicEntries.forEach((entry, index) => {
    console.log(`Entry ${index + 1}: ${entry.message}`);
    console.log(`  Level: ${entry.level}`);
    console.log(`  Timestamp: ${entry.timestamp}`);
    
    if (entry.styles) {
      console.log(`  Styles (${entry.styles.length}):`);
      entry.styles.forEach(([start, end, style]) => {
        const text = entry.message.substring(start, end);
        console.log(`    • "${text}" → ${style} (characters ${start}-${end})`);
      });
    }
    
    if (entry.context) {
      console.log(`  Context: ${Object.keys(entry.context).join(', ')}`);
    }
    
    console.log('');
  });

  console.log('─'.repeat(60));
  console.log('\n3️⃣  Raw JSON structure (as saved to files/databases)\n');

  // Show what the actual JSON looks like
  console.log('Example MAGIC format JSON:');
  console.log(JSON.stringify(magicEntries[0], null, 2));

  console.log('\n─'.repeat(60));
  console.log('\n4️⃣  Saving to file for demonstration\n');

  // Save to file
  const demoFile = path.join(__dirname, 'magic-format-demo.json');
  const jsonLines = magicEntries.map(entry => JSON.stringify(entry)).join('\n');
  await fs.writeFile(demoFile, jsonLines);
  
  console.log(`💾 Saved ${magicEntries.length} MAGIC format entries to: magic-format-demo.json`);

  console.log('\n─'.repeat(60));
  console.log('\n5️⃣  Practical querying examples\n');

  // Demonstrate how you could query this data
  console.log('🔍 Query examples using the structured data:\n');
  
  // Filter by level
  const errors = magicEntries.filter(e => e.level === 'error');
  console.log(`• Errors: ${errors.length} found`);
  errors.forEach(e => console.log(`  - ${e.message}`));
  
  // Find entries with specific text
  const serverLogs = magicEntries.filter(e => e.message.toLowerCase().includes('server'));
  console.log(`\n• Server-related logs: ${serverLogs.length} found`);
  serverLogs.forEach(e => console.log(`  - ${e.message}`));
  
  // Find entries with context data
  const contextLogs = magicEntries.filter(e => e.context);
  console.log(`\n• Logs with context: ${contextLogs.length} found`);
  contextLogs.forEach(e => console.log(`  - ${e.message} (${Object.keys(e.context).join(', ')})`));

  console.log('\n─'.repeat(60));
  console.log('\n✨ MAGIC Format Benefits Summary\n');

  console.log('🎨 For Humans:');
  console.log('  • Rich, colorized console output');
  console.log('  • Easy to read and understand');
  console.log('  • Visual hierarchy with colors and styles');

  console.log('\n📊 For Machines:');
  console.log('  • Structured JSON with plain text messages');
  console.log('  • Precise style ranges for reconstruction');
  console.log('  • Searchable and queryable fields');
  console.log('  • Universal format works anywhere');

  console.log('\n🌍 Universal Compatibility:');
  console.log('  • Any programming language can produce/consume');
  console.log('  • Works with Elasticsearch, Datadog, Splunk, etc.');
  console.log('  • Can be stored in SQL/NoSQL databases');
  console.log('  • Enables cross-service log correlation');

  console.log('\n🔄 Style Reconstruction:');
  console.log('  • Original styling can be recreated anywhere');
  console.log('  • Web UIs can show colored logs');
  console.log('  • CLI tools can apply terminal colors');
  console.log('  • Or just use plain text for searching');

  console.log('\n✅ MAGIC format demonstration complete!');
  console.log(`📁 Check ${demoFile} to see the raw JSON structure.`);
}

main().catch(console.error);