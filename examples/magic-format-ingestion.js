/**
 * MAGIC Format Ingestion Example
 * 
 * This shows how MagicLogger can ingest and display MAGIC format logs
 * from any source - even logs created by other languages or systems.
 */

import { Logger } from '../dist/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('🌍 MAGIC Format Cross-Platform Ingestion Example\n');
  console.log('─'.repeat(60));

  // Create a logger for display
  const logger = new Logger();

  console.log('\n1️⃣  Simulating MAGIC logs from different sources...\n');

  // Simulate MAGIC format logs that could come from:
  // - A Python microservice
  // - A Go API server  
  // - A Rust worker
  // - Any MAGIC-compliant source
  
  const externalLogs = [
    {
      // From a Python service
      id: "py-1234567890-abc",
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: "info",
      message: "Request processed successfully in 45ms",
      styles: [[0, 7, "green"], [31, 35, "magenta.bold"]],
      service: "python-api",
      environment: "production",
      context: {
        endpoint: "/api/users",
        method: "GET",
        duration: 45
      }
    },
    {
      // From a Go service
      id: "go-2345678901-def",
      timestamp: new Date().toISOString(),
      timestampMs: Date.now() + 1000,
      level: "warn",
      message: "Database connection pool reaching capacity: 90% utilized",
      styles: [[0, 8, "yellow"], [44, 47, "red.bold"]],
      service: "go-worker",
      environment: "production",
      context: {
        poolSize: 100,
        activeConnections: 90,
        idleConnections: 10
      }
    },
    {
      // From a Rust service
      id: "rust-3456789012-ghi",
      timestamp: new Date().toISOString(),
      timestampMs: Date.now() + 2000,
      level: "error",
      message: "Failed to parse configuration file: invalid JSON at line 42",
      styles: [[0, 6, "red.bold"], [37, 49, "yellow"], [53, 60, "cyan"]],
      service: "rust-config-loader",
      environment: "staging",
      context: {
        file: "/etc/app/config.json",
        error: "unexpected token",
        line: 42,
        column: 15
      }
    }
  ];

  // Save these "external" logs to a file
  const ingestFile = path.join(__dirname, 'external-magic-logs.json');
  const content = externalLogs.map(log => JSON.stringify(log)).join('\n');
  await fs.writeFile(ingestFile, content);

  console.log('📥 Created simulated MAGIC logs from:');
  console.log('  • Python API service');
  console.log('  • Go worker service');
  console.log('  • Rust configuration loader');

  console.log('\n─'.repeat(60));
  console.log('\n2️⃣  Ingesting and displaying the MAGIC logs...\n');

  // Read the logs back
  const rawContent = await fs.readFile(ingestFile, 'utf-8');
  const ingestedLogs = rawContent.trim().split('\n').map(line => JSON.parse(line));

  // Display each log with reconstructed styles
  for (const log of ingestedLogs) {
    // Reconstruct the styled message
    let styledMessage = log.message;
    
    // Apply styles if present (in a real app, you'd use the applyStyles utility)
    if (log.styles && log.styles.length > 0) {
      // For this example, we'll show the styles as annotations
      const styleAnnotations = log.styles.map(([start, end, style]) => {
        const text = log.message.substring(start, end);
        return `<${style}>${text}</>`;
      });
      
      // Use logger's built-in style parsing
      let reconstructed = log.message;
      
      // Sort styles by position (reverse order to not mess up indices)
      const sortedStyles = [...log.styles].sort((a, b) => b[0] - a[0]);
      
      for (const [start, end, style] of sortedStyles) {
        const text = log.message.substring(start, end);
        reconstructed = 
          reconstructed.substring(0, start) + 
          `<${style}>${text}</>` + 
          reconstructed.substring(end);
      }
      
      styledMessage = reconstructed;
    }

    // Display using the logger with proper level
    const levelMap = {
      'info': (msg, ctx) => logger.info(msg, ctx),
      'warn': (msg, ctx) => logger.warn(msg, ctx),
      'error': (msg, ctx) => logger.error(msg, ctx),
      'debug': (msg, ctx) => logger.debug(msg, ctx),
    };

    const logFn = levelMap[log.level] || levelMap.info;
    
    // Log with service prefix and context
    logFn(`[${log.service}] ${styledMessage}`, log.context);
  }

  console.log('\n─'.repeat(60));
  console.log('\n3️⃣  Analyzing the ingested logs...\n');

  // Group by service
  const byService = {};
  ingestedLogs.forEach(log => {
    byService[log.service] = (byService[log.service] || []);
    byService[log.service].push(log);
  });

  console.log('📊 Logs by service:');
  Object.entries(byService).forEach(([service, logs]) => {
    console.log(`  • ${service}: ${logs.length} log(s)`);
  });

  // Group by level
  const byLevel = {};
  ingestedLogs.forEach(log => {
    byLevel[log.level] = (byLevel[log.level] || 0) + 1;
  });

  console.log('\n📈 Logs by level:');
  Object.entries(byLevel).forEach(([level, count]) => {
    const bar = '█'.repeat(count * 5);
    console.log(`  ${level.padEnd(8)} ${bar} (${count})`);
  });

  console.log('\n─'.repeat(60));
  console.log('\n4️⃣  Key Insights:\n');

  console.log('🔑 The MAGIC format enables:');
  console.log('  • Universal log ingestion from any language/platform');
  console.log('  • Preserved styling across system boundaries');
  console.log('  • Centralized logging with rich formatting intact');
  console.log('  • Cross-service tracing and correlation');
  console.log('  • Structured queries across heterogeneous sources');

  console.log('\n🌐 In production, you could:');
  console.log('  • Stream MAGIC logs to a central aggregator');
  console.log('  • Store in Elasticsearch with full-text search');
  console.log('  • Display in Datadog/Splunk with colors preserved');
  console.log('  • Correlate logs across microservices by timestamp');
  console.log('  • Build dashboards that show styled log output');

  // Clean up
  logger.close();

  console.log('\n✅ Ingestion example complete!');
  console.log(`📁 External logs were read from: ${ingestFile}`);
}

main().catch(console.error);