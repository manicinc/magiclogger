/**
 * @fileoverview TypeScript example demonstrating MagicLogger's async-first API.
 *
 * Usage: npx tsx examples/typescript-example.ts
 * Or compile with: tsc examples/typescript-example.ts
 */

import {
  Logger,
  SyncLogger,
  createLogger,
  type LoggerOptions,
  type LogLevel,
  type ColorName,
} from '../dist/index.js';

// ==========================================
// Async Logger (Default) - High Performance
// ==========================================

console.log('\n=== ASYNC LOGGER (Default) ===\n');

// Create async logger with default settings
const asyncLogger = new Logger();

// Log some messages (console output is immediate)
asyncLogger.info('Async logger initialized');
asyncLogger.success('Console output is immediate');
asyncLogger.warn('File/network writes are batched');

// With custom configuration
const customAsyncLogger = createLogger({
  buffer: {
    size: 32768, // Larger buffer for high throughput
    flushInterval: 100, // Flush every 100ms
    flushSize: 1000, // Or when 1000 logs accumulate
  },
  onFlush: async entries => {
    console.log(`[FLUSH] Batching ${entries.length} log entries`);
    // In production: await writeToFile(entries);
    // In production: await sendToElasticsearch(entries);
  },
});

customAsyncLogger.info('Custom async logger with batch processing');
customAsyncLogger.debug('High throughput logging');

// ==========================================
// Sync Logger - Guaranteed Delivery
// ==========================================

console.log('\n=== SYNC LOGGER - Blocking I/O ===\n');

// Create sync logger for audit trail
const auditLogger = new SyncLogger({
  file: './audit.log',
  forceFlush: true, // fsync after each write
  useConsole: true, // Also log to console
});

auditLogger.info('Sync logger initialized - blocking I/O');
auditLogger.warn('Each log blocks until written to disk');
auditLogger.error('Perfect for audit logs and debugging');

// ==========================================
// Type-Safe Styling
// ==========================================

console.log('\n=== STYLING APIS ===\n');

const logger = new Logger();

// Angle bracket syntax
logger.info('<green.bold>SUCCESS:</> Server started on <cyan>port 3000</>');
logger.error('<red>ERROR:</> Connection to <yellow>database</> failed');

// Template literal API
logger.info(logger.fmt`@blue{Processing} @cyan.underline{data.json} @dim{(2.3MB)}`);

// Chainable style API
const styled =
  logger.s.red.bold('CRITICAL:') +
  ' ' +
  logger.s.yellow('System memory at ') +
  logger.s.red.bold('92%');
logger.info(styled);

// ==========================================
// Structured Logging with MagicLog Schema
// ==========================================

console.log('\n=== STRUCTURED LOGGING ===\n');

// Logs are automatically structured JSON
logger.info('User authenticated', {
  userId: 'user-123',
  method: '2FA',
  duration: 245,
  tags: ['security', 'auth'],
});

logger.error('Payment failed', new Error('Card declined'), {
  orderId: 'ord-456',
  amount: 99.99,
  currency: 'USD',
});

// ==========================================
// Visual Elements
// ==========================================

console.log('\n=== VISUAL ELEMENTS ===\n');

logger.header('DEPLOYMENT STATUS');
logger.separator('=', 50);

// Progress bar
for (let i = 0; i <= 100; i += 25) {
  logger.progressBar(i, 40, '█', '░');
}

// Table
logger.table([
  { service: 'API', status: 'healthy', cpu: '12%', memory: '234MB' },
  { service: 'Database', status: 'healthy', cpu: '45%', memory: '1.2GB' },
  { service: 'Cache', status: 'degraded', cpu: '78%', memory: '512MB' },
]);

// ==========================================
// Production Configuration
// ==========================================

console.log('\n=== PRODUCTION CONFIGURATION ===\n');

// High-performance production logger
const prodLogger = new Logger({
  // Optional extensions
  redactor: { preset: 'strict' }, // Auto-redact PII
  rateLimiter: { max: 1000, window: 60000 }, // 1000 logs/minute
  sampler: { rate: 0.1 }, // Sample 10% in high volume

  // Buffer configuration
  buffer: {
    size: 100000, // Large buffer for traffic spikes
    flushInterval: 100, // Batch every 100ms
    flushSize: 5000, // Or at 5000 entries
  },

  // Batch processing handler
  onFlush: async entries => {
    // Simulate batch writes
    console.log(`[PRODUCTION] Would batch write ${entries.length} entries`);
  },
});

prodLogger.info('Production logger configured');
prodLogger.debug('This might be sampled out');
prodLogger.info('user@example.com logged in', { email: 'user@example.com' }); // PII will be redacted

// ==========================================
// Type Safety Examples
// ==========================================

console.log('\n=== TYPE SAFETY ===\n');

// Type-safe log levels
const level: LogLevel = 'info';
logger.log('Type-safe log level', level);

// Type-safe colors
const colors: ColorName[] = ['blue', 'bold'];
logger.header('TYPE SAFETY DEMO', colors);

// Type-safe configuration
const config: LoggerOptions = {
  verbose: true,
  useColors: true,
  theme: 'ocean',
};

const typedLogger = createLogger(config);
typedLogger.success('Fully type-safe logger created');

// Cleanup
auditLogger.close();

console.log('\n=== DEMO COMPLETE ===\n');
