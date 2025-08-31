/**
 * Simple MAGIC Format Demonstration
 * 
 * This example shows how MagicLogger creates MAGIC format logs internally
 * and demonstrates the structure without file I/O complications.
 */

import { Logger } from '../dist/index.js';

console.log('🔮 MAGIC Format Demonstration\n');
console.log('This shows how MagicLogger preserves styles in structured format.\n');
console.log('─'.repeat(60));

// Create a custom transport that captures the MAGIC format entries
class DemoTransport {
  constructor() {
    this.name = 'demo';
    this.entries = [];
    this.enabled = true;
    this.level = 'debug';
  }

  async init() {
    // No initialization needed
  }

  async log(entry) {
    // Capture the MAGIC format entry
    this.entries.push({...entry});
  }

  async close() {
    // No cleanup needed
  }

  getEntries() {
    return this.entries;
  }

  clear() {
    this.entries = [];
  }
}

async function main() {
  // Create logger with our demo transport
  const logger = new Logger({
    useConsole: true,  // Show styled output in console
  });

  const demoTransport = new DemoTransport();
  await logger.addTransport(demoTransport);

  console.log('\n1️⃣  Logging styled messages...\n');

  // Log various styled messages
  logger.info('<green.bold>✅ Success:</> Server started on port <cyan>3000</>');
  logger.warn('<yellow>⚠️  Warning:</> Memory usage at <red.bold>85%</> capacity');
  logger.error('<red.bold>❌ Error:</> Failed to connect to <yellow>database.prod.com</>');
  
  // Log with context data
  logger.info('User authentication completed', {
    userId: 'usr_12345',
    method: 'OAuth2',
    provider: 'google'
  });

  // Complex nested styles
  logger.info('<bg.blue><white.bold>DEPLOYMENT</></> to <green>production</> environment');

  // Wait a moment for async processing
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\n─'.repeat(60));
  console.log('\n2️⃣  Examining the captured MAGIC format entries...\n');

  const entries = demoTransport.getEntries();
  console.log(`📊 Captured ${entries.length} log entries in MAGIC format\n`);

  // Show the first entry in detail
  if (entries.length > 0) {
    const firstEntry = entries[0];
    
    console.log('📄 First entry structure:');
    console.log(JSON.stringify({
      id: firstEntry.id,
      timestamp: firstEntry.timestamp,
      level: firstEntry.level,
      message: firstEntry.message,
      styles: firstEntry.styles,
      // Show other fields that might exist
      '...other': Object.keys(firstEntry).filter(k => 
        !['id', 'timestamp', 'level', 'message', 'styles'].includes(k)
      ).slice(0, 3)
    }, null, 2));

    console.log('\n🎨 Style analysis:');
    if (firstEntry.styles && firstEntry.styles.length > 0) {
      console.log('Styles preserved in entry:');
      firstEntry.styles.forEach(([start, end, style], index) => {
        const text = firstEntry.message.substring(start, end);
        console.log(`  ${index + 1}. Characters ${start}-${end}: "${text}" → style: "${style}"`);
      });
    } else {
      console.log('  No styles in this entry');
    }
  }

  console.log('\n─'.repeat(60));
  console.log('\n3️⃣  Complete MAGIC format examples:\n');

  // Show all entries in a compact format
  entries.forEach((entry, index) => {
    console.log(`Entry ${index + 1}:`);
    console.log(`  Message: "${entry.message}"`);
    console.log(`  Level: ${entry.level}`);
    if (entry.styles && entry.styles.length > 0) {
      console.log(`  Styles: ${entry.styles.length} style range(s)`);
      entry.styles.forEach(([start, end, style]) => {
        const text = entry.message.substring(start, end);
        console.log(`    → "${text}" (${style})`);
      });
    } else {
      console.log(`  Styles: none`);
    }
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log(`  Context: ${Object.keys(entry.context).join(', ')}`);
    }
    console.log('');
  });

  console.log('─'.repeat(60));
  console.log('\n4️⃣  Key MAGIC format benefits:\n');

  console.log('✨ Universal Format:');
  console.log('  • JSON structure can be consumed by any language/platform');
  console.log('  • Styles preserved as data, not terminal-specific codes');
  console.log('  • Searchable and indexable by log aggregation systems');
  
  console.log('\n🔍 Practical Applications:');
  console.log('  • Send to Elasticsearch with full-text search on messages');
  console.log('  • Store in databases with queryable JSON fields');
  console.log('  • Stream to log aggregators (Datadog, Splunk, etc.)');
  console.log('  • Cross-service correlation by timestamp and context');
  console.log('  • Reconstruct styled output in any terminal/UI');

  console.log('\n📊 Structure Advantages:');
  console.log('  • Plain text separate from styling information');
  console.log('  • Timestamps in standard ISO format');
  console.log('  • Structured context data for rich querying');
  console.log('  • Consistent schema across all log sources');

  // Clean up
  logger.close();

  console.log('\n✅ MAGIC format demonstration complete!');
}

main().catch(console.error);