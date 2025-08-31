/**
 * Simple MAGIC Format Example
 * 
 * This example shows how MagicLogger creates structured logs
 * in the MAGIC format, preserving styles as metadata.
 */

import { Logger } from '../dist/index.js';
import { FileTransport } from '../dist/transports.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('📝 Simple MAGIC Format Example\n');
  console.log('This demonstrates how styled logs are saved in structured JSON format.\n');
  console.log('─'.repeat(60));

  // Create a temporary log file
  const logFile = path.join(__dirname, 'simple-magic-demo.json');
  
  // Clean up any existing file
  try {
    await fs.unlink(logFile);
  } catch (e) {
    // File doesn't exist, that's fine
  }

  // Create logger that outputs to both console and file
  const logger = new Logger({
    useConsole: true,  // Show in console with colors
  });

  // Add file transport for JSON output
  await logger.addTransport(new FileTransport({
    name: 'file-json',
    filepath: logFile,
    format: 'json',  // MAGIC format
    append: true,
  }));

  console.log('\n1️⃣  Logging some styled messages...\n');

  // Log messages with different styles
  logger.info('<green.bold>✅ Success:</> Server started on port <cyan>3000</>');
  logger.warn('<yellow>⚠️  Warning:</> CPU usage is <red.bold>high</> (85%)');
  logger.error('<red.bold>❌ Error:</> Connection to <yellow>api.example.com</> failed');
  
  // Log with context data
  logger.info('User logged in', {
    userId: 'usr_123',
    email: 'john@example.com',
    ip: '192.168.1.1'
  });

  // Wait for file write to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\n─'.repeat(60));
  console.log('\n2️⃣  Reading the saved MAGIC format logs...\n');

  // Read the JSON file
  const content = await fs.readFile(logFile, 'utf-8');
  const logs = content.trim().split('\n').map(line => JSON.parse(line));

  // Show the first log entry in full
  console.log('📄 First log entry (raw MAGIC format):');
  console.log(JSON.stringify(logs[0], null, 2));

  console.log('\n─'.repeat(60));
  console.log('\n3️⃣  Understanding the MAGIC format structure:\n');

  // Explain the structure
  const example = logs[0];
  console.log('🔍 Key fields in MAGIC format:\n');
  
  console.log(`• id:        "${example.id}" (unique identifier)`);
  console.log(`• timestamp: "${example.timestamp}" (ISO 8601 format)`);
  console.log(`• level:     "${example.level}" (log severity)`);
  console.log(`• message:   "${example.message}" (plain text, no styling)`);
  
  if (example.styles) {
    console.log(`\n• styles:    ${JSON.stringify(example.styles)}`);
    console.log('  Format: [startIndex, endIndex, "style.names"]');
    console.log('  This preserves styling information separately from content!');
    
    // Explain each style range
    example.styles.forEach(([start, end, style]) => {
      const text = example.message.substring(start, end);
      console.log(`    - "${text}" has style "${style}" (chars ${start}-${end})`);
    });
  }

  if (example.context) {
    console.log(`\n• context:   ${JSON.stringify(example.context)}`);
    console.log('  Structured data attached to the log entry');
  }

  console.log('\n─'.repeat(60));
  console.log('\n4️⃣  Why MAGIC format matters:\n');

  console.log('✨ Benefits:');
  console.log('  • Styles preserved as data, not ANSI codes');
  console.log('  • Can be ingested by any system (Elasticsearch, Datadog, etc.)');
  console.log('  • Searchable and queryable JSON structure');
  console.log('  • Can reconstruct styled output on any platform');
  console.log('  • Language agnostic - any language can produce/consume it');

  console.log('\n📊 Example queries you could run:');
  console.log('  • Find all errors: logs.filter(l => l.level === "error")');
  console.log('  • Find by user: logs.filter(l => l.context?.userId === "usr_123")');
  console.log('  • Count by level: group by level and count');
  console.log('  • Time range: filter by timestamp field');

  // Clean up
  logger.close();

  console.log('\n✅ Example complete!');
  console.log(`📁 Check ${logFile} to see the raw MAGIC format logs.`);
}

main().catch(console.error);