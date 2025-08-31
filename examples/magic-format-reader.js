/**
 * MAGIC Format Log Reader Example
 * 
 * This example demonstrates:
 * 1. Reading MAGIC format logs from a file
 * 2. Parsing and analyzing the structured data
 * 3. Reconstructing styled output from the preserved styles
 * 4. Filtering and querying logs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// We'll implement our own simple style reconstruction since we're using local dist

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Reconstructs styled text from MAGIC format style ranges
 * Uses the applyStyles utility from magiclogger
 */
function reconstructStyledText(plainText, styles, useColors = true) {
  if (!useColors) {
    return plainText;
  }
  
  // Simple implementation for demonstration
  if (!styles || styles.length === 0) {
    return plainText;
  }

  // Sort styles by start position
  const sortedStyles = [...styles].sort((a, b) => a[0] - b[0]);
  
  let result = '';
  let lastEnd = 0;
  
  for (const [start, end, styleString] of sortedStyles) {
    // Add unstyled text before this range
    if (start > lastEnd) {
      result += plainText.slice(lastEnd, start);
    }
    
    // Simple ANSI color mapping
    const styleMap = {
      'red': '\x1b[31m',
      'green': '\x1b[32m',
      'yellow': '\x1b[33m',
      'blue': '\x1b[34m',
      'magenta': '\x1b[35m',
      'cyan': '\x1b[36m',
      'white': '\x1b[37m',
      'gray': '\x1b[90m',
      'bold': '\x1b[1m',
      'dim': '\x1b[2m',
      'bgRed': '\x1b[41m',
      'bgGreen': '\x1b[42m',
      'bgYellow': '\x1b[43m',
      'bgBlue': '\x1b[44m',
    };
    
    const reset = '\x1b[0m';
    const styles = styleString.split('.');
    let codes = '';
    
    for (const s of styles) {
      if (styleMap[s]) codes += styleMap[s];
    }
    
    const text = plainText.slice(start, end);
    result += codes ? `${codes}${text}${reset}` : text;
    lastEnd = end;
  }
  
  // Add any remaining unstyled text
  if (lastEnd < plainText.length) {
    result += plainText.slice(lastEnd);
  }
  
  return result;
}

/**
 * Main reader function
 */
async function readMagicLogs() {
  console.log('🔍 MAGIC Format Log Reader\n');
  console.log('─'.repeat(60));
  
  const logFilePath = path.join(__dirname, 'magic-logs.json');
  
  try {
    // Check if log file exists
    await fs.access(logFilePath);
  } catch (error) {
    console.error('❌ Log file not found. Please run magic-format-file-logging.js first.');
    process.exit(1);
  }
  
  // Read and parse the log file
  const logContent = await fs.readFile(logFilePath, 'utf-8');
  const logLines = logContent.trim().split('\n');
  const logs = logLines.map(line => JSON.parse(line));
  
  console.log(`\n📊 Loaded ${logs.length} log entries from ${logFilePath}\n`);
  
  // Display logs with reconstructed styles
  console.log('🎨 Logs with reconstructed styles:');
  console.log('─'.repeat(60));
  
  logs.forEach((log, index) => {
    const levelColors = {
      'info': ['cyan'],
      'warn': ['yellow'],
      'error': ['red'],
      'debug': ['gray'],
      'success': ['green']
    };
    
    const levelStyle = levelColors[log.level] || ['white'];
    // Apply level styling manually
    const levelColorMap = {
      'cyan': '\x1b[36m',
      'yellow': '\x1b[33m',
      'red': '\x1b[31m',
      'gray': '\x1b[90m',
      'green': '\x1b[32m'
    };
    const levelColor = levelColorMap[levelStyle[0]] || '';
    const levelText = levelColor ? 
      `${levelColor}[${log.level.toUpperCase()}]\x1b[0m`.padEnd(20) :
      `[${log.level.toUpperCase()}]`.padEnd(9);
    
    // Reconstruct the styled message
    const styledMessage = reconstructStyledText(log.message, log.styles);
    
    console.log(`${levelText} ${styledMessage}`);
    
    // Show context if present
    if (log.context && Object.keys(log.context).length > 0) {
      const contextStr = JSON.stringify(log.context, null, 2)
        .split('\n')
        .map(line => '         ' + line)
        .join('\n');
      console.log(Colorizer.applyColors(contextStr, ['dim'], true));
    }
  });
  
  console.log('\n' + '─'.repeat(60));
  console.log('\n🔍 Filtering and Querying Examples:\n');
  
  // Example 1: Filter by level
  console.log('1. Error logs only:');
  const errorLogs = logs.filter(log => log.level === 'error');
  errorLogs.forEach(log => {
    console.log(`   • ${log.message}`);
  });
  
  // Example 2: Filter by content
  console.log('\n2. Logs mentioning "database":');
  const dbLogs = logs.filter(log => 
    log.message.toLowerCase().includes('database') ||
    JSON.stringify(log.context || {}).toLowerCase().includes('database')
  );
  dbLogs.forEach(log => {
    console.log(`   • [${log.level}] ${log.message}`);
  });
  
  // Example 3: Logs with context data
  console.log('\n3. Logs with context data:');
  const contextLogs = logs.filter(log => log.context && Object.keys(log.context).length > 0);
  contextLogs.forEach(log => {
    const contextKeys = Object.keys(log.context);
    console.log(`   • ${log.message} (context: ${contextKeys.join(', ')})`);
  });
  
  // Example 4: Statistics
  console.log('\n📈 Log Statistics:');
  console.log('─'.repeat(40));
  
  const levelCounts = {};
  logs.forEach(log => {
    levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
  });
  
  Object.entries(levelCounts).forEach(([level, count]) => {
    const bar = '█'.repeat(count * 5);
    console.log(`${level.padEnd(8)} ${bar} ${count}`);
  });
  
  // Example 5: Timeline analysis
  console.log('\n⏱️ Timeline Analysis:');
  console.log('─'.repeat(40));
  
  const timestamps = logs.map(log => new Date(log.timestamp));
  const earliest = new Date(Math.min(...timestamps));
  const latest = new Date(Math.max(...timestamps));
  const duration = latest - earliest;
  
  console.log(`First log: ${earliest.toISOString()}`);
  console.log(`Last log:  ${latest.toISOString()}`);
  console.log(`Duration:  ${duration}ms`);
  
  // Example 6: Style analysis
  console.log('\n🎨 Style Usage Analysis:');
  console.log('─'.repeat(40));
  
  const styleUsage = {};
  logs.forEach(log => {
    if (log.styles) {
      log.styles.forEach(([start, end, style]) => {
        const styles = style.split('.');
        styles.forEach(s => {
          styleUsage[s] = (styleUsage[s] || 0) + 1;
        });
      });
    }
  });
  
  const sortedStyles = Object.entries(styleUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('Top 5 most used styles:');
  sortedStyles.forEach(([style, count]) => {
    console.log(`  ${style.padEnd(15)} : ${count} usage${count > 1 ? 's' : ''}`);
  });
  
  console.log('\n✅ Reader example complete!');
}

// Run the reader
readMagicLogs().catch(console.error);