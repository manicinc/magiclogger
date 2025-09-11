/**
 * MAGIC Format Demo with Proper Styled Output
 * 
 * This example shows both the styled console output AND
 * the underlying MAGIC format structure.
 */

import { Logger } from '../dist/index.js';

console.log('🔮 MAGIC Format Demo - Styled Output + Structure\n');
console.log('This shows both the styled console output and MAGIC format data.\n');
console.log('─'.repeat(60));

// Create a custom transport that captures MAGIC format data
class MagicAnalysisTransport {
  constructor() {
    this.name = 'magic-analysis';
    this.entries = [];
    this.enabled = true;
    this.level = 'debug';
  }

  async init() {}

  async log(entry) {
    // Store the entry for analysis later
    this.entries.push({
      id: entry.id,
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      styles: entry.styles,
      context: entry.context
    });
  }

  async close() {}

  getEntries() {
    return this.entries;
  }
}

async function main() {
  console.log('\n1️⃣  Creating logger with styled console output...\n');

  // Create logger with default console transport (this should show styled output)
  const logger = new Logger({
    useConsole: true,
    level: 'debug'
  });

  // Add our analysis transport to capture MAGIC format data
  const analysisTransport = new MagicAnalysisTransport();
  await logger.addTransport(analysisTransport);

  console.log('2️⃣  Logging styled messages (you should see colors below)...\n');

  // Test basic styling first
  logger.info('Basic test without styles - this should work');
  
  // Simple styled message
  logger.info('<green.bold>✅ Success:</> Server started on port <cyan>3000</>');
  
  // Warning with multiple styles
  logger.warn('<yellow>⚠️ Warning:</> Memory usage at <red.bold>85%</> capacity');
  
  // Error message
  logger.error('<red.bold>❌ Error:</> Connection to <yellow>api.example.com</> failed');
  
  // Info with context
  logger.info('User logged in successfully', {
    userId: 'usr_123',
    email: 'user@example.com',
    timestamp: new Date().toISOString()
  });
  
  // Complex nested styles
  logger.info('<bg.blue><white.bold>DEPLOY</></> Starting deployment to <green>production</>');

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\n─'.repeat(60));
  console.log('\n3️⃣  Analyzing what was captured in MAGIC format...\n');

  const entries = analysisTransport.getEntries();
  console.log(`📊 Captured ${entries.length} entries\n`);

  // Show first few entries and their structure
  entries.slice(0, 3).forEach((entry, index) => {
    console.log(`📄 Entry ${index + 1}:`);
    console.log(`   Level: ${entry.level}`);
    console.log(`   Message: "${entry.message}"`);
    
    if (entry.styles && entry.styles.length > 0) {
      console.log(`   Styles (${entry.styles.length}):`);
      entry.styles.forEach(([start, end, style]) => {
        const text = entry.message.substring(start, end);
        console.log(`     • "${text}" → ${style} (chars ${start}-${end})`);
      });
    } else {
      console.log(`   Styles: none`);
    }
    
    if (entry.context) {
      console.log(`   Context: ${Object.keys(entry.context).join(', ')}`);
    }
    console.log('');
  });

  console.log('─'.repeat(60));
  console.log('\n4️⃣  Raw MAGIC format example:\n');
  
  if (entries.length > 0) {
    console.log(JSON.stringify(entries[1], null, 2));
  }

  console.log('\n─'.repeat(60));
  console.log('\n💡 Expected vs Actual:\n');
  
  console.log('🔍 What should happen:');
  console.log('  • Console shows: ✅ Success: Server started on port 3000 (with colors)');
  console.log('  • MAGIC format stores: plain text + style ranges');
  console.log('  • Best of both worlds: human-readable + machine-processable');
  
  console.log('\n🎯 Current status:');
  if (entries.some(e => e.styles && e.styles.length > 0)) {
    console.log('  ✅ MAGIC format extraction: WORKING');
  } else {
    console.log('  ❌ MAGIC format extraction: NOT WORKING');
  }
  
  console.log('\n📝 Note: If you see raw angle brackets above instead of colors,');
  console.log('  it means the console transport needs debugging.');

  logger.close();
  
  console.log('\n✅ Demo complete!');
}

main().catch(console.error);