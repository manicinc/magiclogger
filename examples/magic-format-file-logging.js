/**
 * MAGIC Format File Logging Example
 * 
 * This example demonstrates:
 * 1. Creating structured logs in MAGIC format
 * 2. Writing logs to a JSON file
 * 3. Including styled text that preserves formatting
 * 4. Reading and displaying the logs with styles reconstructed
 */

import { Logger } from '../dist/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFilePath = path.join(__dirname, 'magic-logs.json');

console.log('🔮 MAGIC Format Structured Logging Example\n');
console.log('📁 Logs will be saved to:', logFilePath);
console.log('─'.repeat(60));

// Create a custom transport that captures logs in MAGIC format and saves to file
class MagicFileTransport {
  constructor(filepath) {
    this.name = 'magic-file';
    this.filepath = filepath;
    this.entries = [];
    this.enabled = true;
    this.level = 'debug';
  }

  async init() {
    // Clean up any existing file
    try {
      await fs.unlink(this.filepath);
    } catch (e) {
      // File doesn't exist, that's fine
    }
  }

  async log(entry) {
    // Extract styles from angle bracket syntax (simplified simulation)
    const styles = [];
    let plainMessage = entry.message || '';
    
    // Simple regex to find <style>text</> patterns
    const stylePattern = /<([^>]+)>(.*?)<\/>/g;
    let match;
    let offset = 0;
    
    while ((match = stylePattern.exec(entry.message || '')) !== null) {
      const [fullMatch, styleStr, text] = match;
      const start = match.index - offset;
      const end = start + text.length;
      
      styles.push([start, end, styleStr]);
      
      // Replace styled text with plain text
      plainMessage = plainMessage.replace(fullMatch, text);
      offset += fullMatch.length - text.length;
    }

    // Create MAGIC format entry
    const magicEntry = {
      id: entry.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      timestampMs: entry.timestampMs || Date.now(),
      level: entry.level || 'info',
      message: plainMessage,
      ...(styles.length > 0 && { styles }),
      ...(entry.context && { context: entry.context })
    };

    // Save to file (append as JSON lines)
    const jsonLine = JSON.stringify(magicEntry) + '\n';
    await fs.appendFile(this.filepath, jsonLine, 'utf-8');
  }

  async close() {
    // No cleanup needed
  }
}

async function main() {
  // Create a logger with console output
  const logger = new Logger({
    useConsole: true,  // Also show in console
  });

  // Add our custom MAGIC format file transport
  const fileTransport = new MagicFileTransport(logFilePath);
  await fileTransport.init();
  await logger.addTransport(fileTransport);

  // Log various styled messages that will be captured in MAGIC format
  console.log('\n📝 Creating styled log entries...\n');

  // Simple info log with styles
  logger.info('<green.bold>✅ Success:</> Application <cyan>started</> successfully');

  // Warning with highlighted values
  logger.warn('<yellow>⚠ Warning:</> Memory usage at <red.bold>85%</> of capacity');

  // Error with multiple styled segments
  logger.error('<red.bold>❌ Error:</> Failed to connect to <yellow>database.prod.example.com</> on port <cyan>5432</>');

  // Complex nested styles
  logger.info('<bg.blue><white.bold>DEPLOYMENT</></> Starting deployment to <green>production</> environment');

  // Log with structured context data
  logger.info('User authentication completed', {
    userId: 'usr_123456',
    email: 'john.doe@example.com',
    method: 'OAuth2',
    provider: 'google',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0'
  });

  // Debug log with technical details
  logger.debug('Database query executed', {
    query: 'SELECT * FROM users WHERE active = true',
    duration: 145,
    rowCount: 42,
    cache: 'miss'
  });

  // Success message with metrics
  logger.success('<green.bold>✨ Deployment complete!</> Processed <cyan.bold>1,234</> files in <magenta.bold>45.6s</>');

  // Wait a moment for file writes to complete
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log('\n─'.repeat(60));
  console.log('\n📖 Reading back the MAGIC format logs...\n');

  // Read the log file
  const logContent = await fs.readFile(logFilePath, 'utf-8');
  const logLines = logContent.trim().split('\n');
  const logs = logLines.map(line => JSON.parse(line));

  console.log(`Found ${logs.length} log entries in the file.\n`);

  // Display the structure of the first log entry
  console.log('📊 Structure of a MAGIC format log entry:');
  console.log('─'.repeat(40));
  const firstLog = logs[0];
  console.log(JSON.stringify({
    id: firstLog.id,
    timestamp: firstLog.timestamp,
    level: firstLog.level,
    message: firstLog.message,
    styles: firstLog.styles,
    // Show just the keys of other fields
    '...otherFields': Object.keys(firstLog).filter(k => 
      !['id', 'timestamp', 'level', 'message', 'styles'].includes(k)
    )
  }, null, 2));

  console.log('\n🎨 Style preservation in MAGIC format:');
  console.log('─'.repeat(40));

  // Show how styles are preserved
  logs.forEach((log, index) => {
    if (log.styles && log.styles.length > 0) {
      console.log(`\nEntry ${index + 1}: "${log.message}"`);
      console.log('Styles:');
      log.styles.forEach(([start, end, style]) => {
        const text = log.message.substring(start, end);
        console.log(`  - Characters ${start}-${end}: "${text}" → style: ${style}`);
      });
    }
  });

  console.log('\n💾 Raw MAGIC format example:');
  console.log('─'.repeat(40));
  console.log('Here\'s what the actual JSON looks like:\n');
  console.log(JSON.stringify(logs[0], null, 2));

  console.log('\n✨ Benefits of MAGIC format:');
  console.log('─'.repeat(40));
  console.log('1. Structured data preserves all log information');
  console.log('2. Styles are stored separately from content');
  console.log('3. Can be ingested by any MAGIC-compatible system');
  console.log('4. Searchable and queryable (e.g., in Elasticsearch)');
  console.log('5. Can reconstruct styled output on any platform');

  // Clean up
  logger.close();

  console.log('\n✅ Example complete! Check', logFilePath, 'to see the raw MAGIC format logs.');
}

main().catch(console.error);