/**
 * MagicLogger Comprehensive API Example
 * 
 * This file demonstrates ALL MagicLogger features and APIs in one place.
 * Use this as a reference for every available method and configuration option.
 * 
 * Run with: npx ts-node examples/comprehensive-example.ts
 */

import {
  // Core Loggers
  Logger,
  SyncLogger,
  
  // Factory functions
  createAsyncLogger,
  createSmartLogger,
  
  // Utilities
  meta,
  err,
  isAsyncLogger,
  isSyncLogger,
  getDefaultLogger,
  setDefaultLogger,
  
  // Context & Tags
  ContextManager,
  TagManager,
  
  // Extensions
  RateLimiter,
  Redactor,
  Sampler,
  enhanceConsole,
  
  // Types
  type LogEntry,
} from '../src/index';

// Import transports separately (with safe fallbacks for optional ones)
import {
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  StreamTransport,
  WebSocketTransport,
  
  // Factory functions
  createConsole,
  createFile,
  createHTTP,
} from '../src/transports';

// Optional transports - may not be available
let S3Transport: typeof import('../src/transports').S3Transport | undefined;
let MongoDBTransport: typeof import('../src/transports').MongoDBTransport | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  S3Transport = require('../src/transports').S3Transport;
} catch {
  console.log('Note: S3Transport not available (AWS SDK not installed)');
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MongoDBTransport = require('../src/transports').MongoDBTransport;
} catch {
  console.log('Note: MongoDBTransport not available (MongoDB driver not installed)');
}

// ============================================================================
// SECTION 1: CORE LOGGERS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 1: CORE LOGGERS');
console.log('='.repeat(80) + '\n');

// 1.1 Standard Logger (Full-featured with styling)
console.log('1.1 Standard Logger (Full-featured):');
const logger = new Logger({
  id: 'main-logger',
  useColors: true,
  verbose: false,
  useConsole: true,  // Auto-adds console transport (default)
});

// Basic logging methods
logger.info('INFO: Application started');
logger.warn('WARNING: Memory usage at 75%');
logger.error('ERROR: Failed to connect to database');
logger.debug('DEBUG: Processing user request');
logger.success('SUCCESS: Task completed');
logger.trace('TRACE: Entering function processData()');
logger.fatal('FATAL: System crash imminent');

// Custom log levels
logger.custom('Custom message', ['magenta', 'bold'], 'CUSTOM');
logger.log('info', 'Using log() method directly');

// 1.2 Sync Logger (Blocking I/O)
console.log('\n1.2 Sync Logger (Blocking I/O):');
const syncLogger = new SyncLogger({
  id: 'sync-logger',
  file: './logs/sync.log',
  forceFlush: true,
});
syncLogger.info('Sync logger writes immediately');
syncLogger.error('Guaranteed delivery for audit logs');

// 1.3 Async Logger (High performance)
console.log('\n1.3 Async Logger (High performance):');
const asyncLogger = createAsyncLogger({
  buffer: { size: 16384, flushInterval: 50 },
  onFlush: (entries) => {
    console.log(`  Flushed ${entries.length} log entries`);
  },
});
asyncLogger.info('Async logger uses ring buffer');
asyncLogger.warn('Great for high-volume logging');

// 1.4 Smart Logger (Auto-detects environment)
console.log('\n1.4 Smart Logger (Auto-detects):');
const smartLogger = createSmartLogger();
smartLogger.info('Smart logger picks best mode automatically');

// Type guards
console.log('\nType guards:');
console.log(`  Is async logger? ${isAsyncLogger(asyncLogger)}`);
console.log(`  Is sync logger? ${isSyncLogger(syncLogger)}`);

// Default logger
console.log('\nDefault logger:');
const defaultLogger = getDefaultLogger();
defaultLogger.info('Using default logger instance');
setDefaultLogger(logger);

// ============================================================================
// SECTION 2: STYLING APIS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 2: STYLING APIS');
console.log('='.repeat(80) + '\n');

// 2.1 Inline angle bracket syntax
console.log('2.1 Inline angle bracket syntax:');
logger.info('<green.bold>Success:</> File <cyan.underline>data.json</> uploaded');
logger.error('<red>Error:</> <yellow>Connection</> to <magenta>database</> failed');
logger.info('<bgBlue.white> STATUS </> <gray>|</> <green>Active</> <gray>|</> <yellow>3 warnings</>');

// 2.2 Chainable style API
console.log('\n2.2 Chainable style API (.s):');
logger.info(
  logger.s.red.bold('ERROR: ') +
  logger.s.yellow('File not found: ') +
  logger.s.cyan.underline('/path/to/file.js')
);

// Complex chaining
logger.info(
  logger.s.bgGreen.black.bold(' DEPLOY ') + ' ' +
  logger.s.green('✓') + ' Version ' +
  logger.s.cyan.bold('v2.4.1') + ' to ' +
  logger.s.magenta.underline('production')
);

// 2.3 Template literal styling
console.log('\n2.3 Template literal styling (.fmt):');
const errorCount = 3;
const warningCount = 12;
const duration = 145;

logger.info(logger.fmt`
  @red.bold{Errors: ${errorCount}} | 
  @yellow{Warnings: ${warningCount}} | 
  @green{Duration: ${duration}ms}
`);

// 2.4 Color helper
console.log('\n2.4 Color helper:');
const redBold = logger.color('red', 'bold');
logger.info('Status: ' + redBold('CRITICAL'));

// 2.5 Rainbow and gradient effects
console.log('\n2.5 Rainbow text:');
logger.info('<red>R</><yellow>A</><green>I</><cyan>N</><blue>B</><magenta>O</><red>W</>');

// ============================================================================
// SECTION 3: VISUAL ELEMENTS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 3: VISUAL ELEMENTS');
console.log('='.repeat(80) + '\n');

// 3.1 Headers and footers
logger.header('🚀 DEPLOYMENT PROCESS', ['brightWhite', 'bgBlue', 'bold']);
logger.footer('Process completed', ['gray', 'dim']);

// 3.2 Separators
logger.separator('=', 50);
logger.separator('-');

// 3.3 Progress bars
console.log('\nProgress bar:');
for (let i = 0; i <= 100; i += 25) {
  logger.progressBar(i, 100, 30);
}

// 3.4 Tables
console.log('\nTable:');
logger.table([
  { Service: 'API', Status: logger.s.green('✓ Healthy'), CPU: '12%', Memory: '256MB' },
  { Service: 'Database', Status: logger.s.green('✓ Healthy'), CPU: '45%', Memory: '2.1GB' },
  { Service: 'Cache', Status: logger.s.yellow('⚠ Warning'), CPU: '78%', Memory: '512MB' },
  { Service: 'Queue', Status: logger.s.red('✗ Down'), CPU: '0%', Memory: '0MB' },
], ['cyan', 'bold']);

// 3.5 Links
logger.link('https://github.com/your-repo', 'View on GitHub');

// 3.6 Object diff
const oldState = { users: 100, status: 'active', plan: 'free' };
const newState = { users: 150, status: 'active', plan: 'pro', features: ['api', 'support'] };
logger.diff('State change', oldState, newState);

// 3.7 Box drawing
logger.box('Important Message', ['yellow', 'bold']);

// ============================================================================
// SECTION 4: CONTEXT & TAGS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 4: CONTEXT & TAGS');
console.log('='.repeat(80) + '\n');

// 4.1 Global context
const contextLogger = new Logger({
  context: {
    service: 'api-gateway',
    version: '2.1.0',
    environment: 'production',
  },
});

// 4.2 Per-log context
contextLogger.info('User authenticated', {
  userId: 'usr_123',
  email: 'user@example.com',
  method: 'OAuth2',
});

// 4.3 Using meta() helper
contextLogger.info('Processing payment', meta({
  orderId: 'ORD-456',
  amount: 99.99,
  currency: 'USD',
}));

// 4.4 Using err() helper
try {
  throw new Error('Database connection failed');
} catch (error) {
  contextLogger.error('Operation failed', err(error));
}

// 4.5 Tags
const taggedLogger = new Logger({
  tags: ['api', 'v2', 'production'],
});

taggedLogger.info('Request received', {
  tags: ['http', 'GET', 'users'],
});

// 4.6 Hierarchical tags
taggedLogger.info('Database query', {
  tags: ['database.query.select', 'performance.slow'],
});

// 4.7 ContextManager
const contextManager = new ContextManager({
  maxDepth: 5,
  maxKeys: 50,
  sanitizeMode: 'strict',
});

contextManager.set({
  requestId: 'req_789',
  timestamp: Date.now(),
});

// 4.8 TagManager
const tagManager = new TagManager({
  maxTags: 10,
  maxTagLength: 50,
});

// Generate tags from path
const pathTags = tagManager.fromPath('src/services/payment/stripe.ts');
console.log('Tags from path:', pathTags);

// Normalize tags
const normalized = tagManager.normalize(['API', 'User-Auth', 'OAuth/2.0']);
console.log('Normalized tags:', normalized);

// ============================================================================
// SECTION 5: TRANSPORTS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 5: TRANSPORTS');
console.log('='.repeat(80) + '\n');

// 5.1 Console Transport (auto-added by default)
const consoleTransport = new ConsoleTransport({
  name: 'console',
  level: 'debug',
  useColors: true,
  prettyPrint: true,
});

// 5.2 File Transport
const fileTransport = new FileTransport({
  name: 'file',
  filepath: './logs/app.log',
  maxSize: '10MB',
  maxFiles: 7,
  compress: true,
});

// 5.3 HTTP Transport with batching
const httpTransport = new HTTPTransport({
  name: 'http',
  url: 'https://logs.example.com/ingest',
  method: 'POST',
  headers: { 'X-API-Key': 'secret' },
  batch: { size: 100, timeout: 5000 },
  retry: { attempts: 3, delay: 1000 },
});

// 5.4 WebSocket Transport
const wsTransport = new WebSocketTransport({
  name: 'websocket',
  url: 'wss://logs.example.com/stream',
  reconnect: true,
  batch: { size: 50, timeout: 2000 },
});

// 5.5 Stream Transport
const streamTransport = new StreamTransport({
  name: 'stream',
  stream: process.stdout,
});
console.log('Created stream transport:', streamTransport.name);

// 5.6 Optional Cloud Transports (only if dependencies installed)
if (S3Transport) {
  console.log('S3Transport available - example config:');
  // const s3Transport = new S3Transport({
  //   name: 's3',
  //   bucket: 'my-logs',
  //   region: 'us-east-1',
  //   compress: true,
  // });
} else {
  console.log('S3Transport not available - install @aws-sdk/client-s3 to use');
}

if (MongoDBTransport) {
  console.log('MongoDBTransport available - example config:');
  // const mongoTransport = new MongoDBTransport({
  //   name: 'mongodb',
  //   uri: 'mongodb://localhost:27017',
  //   database: 'logs',
  //   collection: 'app_logs',
  // });
} else {
  console.log('MongoDBTransport not available - install mongodb to use');
}

// 5.6 Logger with multiple transports
const multiTransportLogger = new Logger({
  useConsole: false,  // Disable default console
  transports: [
    consoleTransport,
    fileTransport,
    httpTransport,
  ],
});

// 5.7 Transport management
multiTransportLogger.addTransport(wsTransport);
multiTransportLogger.removeTransport('file');
const transportList = multiTransportLogger.listTransports();
console.log('Active transports:', transportList);

// 5.8 Transport factory functions
async function setupTransports() {
  const consoleT = await createConsole({ useColors: true });
  const fileT = await createFile('./logs/factory.log');
  const httpT = await createHTTP('https://api.example.com/logs');
  
  console.log('Created transports via factories:', consoleT.name, fileT.name, httpT.name);
}

// Call the setup function to demonstrate
setupTransports().catch(console.error);

// ============================================================================
// SECTION 6: THEMING & CUSTOM COLORS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 6: THEMING & CUSTOM COLORS');
console.log('='.repeat(80) + '\n');

// 6.1 Built-in themes
const themedLogger = new Logger({ theme: 'ocean' });
themedLogger.info('Ocean theme info');
themedLogger.error('Ocean theme error');

// 6.2 Custom theme
const customThemeLogger = new Logger({
  theme: {
    info: ['cyan'],
    success: ['green', 'bold'],
    warning: ['yellow'],
    error: ['red', 'bold'],
    debug: ['gray', 'dim'],
    
    header: ['brightWhite', 'bold', 'underline'],
    footer: ['gray', 'dim'],
    separator: ['blue'],
    
    tags: {
      'api': ['cyan', 'bold'],
      'database': ['yellow'],
      'security': ['red', 'bold', 'bgYellow'],
    },
  },
});

// 6.3 Tag-based theming
customThemeLogger.info('API request', { tags: ['api'] });
customThemeLogger.warn('Slow query', { tags: ['database'] });
customThemeLogger.error('Auth failed', { tags: ['security'] });

// 6.4 Custom colors
logger.registerCustomColor('brandBlue', {
  hex: '#3366FF',
  fallback: 'blue',
});

logger.registerCustomColors({
  brandRed: { rgb: [255, 87, 51], fallback: 'red' },
  brandGreen: { hex: '#00D084', fallback: 'green' },
});

// ============================================================================
// SECTION 7: VALIDATION & SCHEMAS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 7: VALIDATION & SCHEMAS');
console.log('='.repeat(80) + '\n');

// 7.1 Context validation
const validatedLogger = new Logger({
  contextManager: new ContextManager({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', required: true },
        email: { type: 'string', format: 'email' },
        age: { type: 'number', min: 0, max: 150 },
      },
    },
    schemaValidationMode: 'warn',
  }),
});

// Valid context
validatedLogger.info('Valid context', {
  userId: 'usr_123',
  email: 'user@example.com',
  age: 25,
});

// Invalid context (will warn)
validatedLogger.info('Invalid context', {
  email: 'not-an-email',
  age: 200,
});

// 7.2 Tag validation
const tagValidatedLogger = new Logger({
  tagManager: new TagManager({
    schema: {
      type: 'array',
      items: { type: 'string', pattern: '^[a-z0-9.-]+$' },
      maxItems: 5,
    },
  }),
});

tagValidatedLogger.info('Validated tags', { tags: ['api', 'v2'] });

// ============================================================================
// SECTION 8: EXTENSIONS & UTILITIES
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 8: EXTENSIONS & UTILITIES');
console.log('='.repeat(80) + '\n');

// 8.1 Rate Limiter
const rateLimiter = new RateLimiter({
  max: 100,
  window: 1000,  // 100 logs per second
  strategy: 'sliding',
});

const rateLimitedLogger = new Logger({
  rateLimiter,
});

// Demonstrate rate limiting
for (let i = 0; i < 5; i++) {
  rateLimitedLogger.info(`Rate limited log ${i}`);
}

// 8.2 Redactor
const redactor = new Redactor({
  preset: 'strict',
  customPatterns: [
    { pattern: /user_\d+/g, replacement: 'user_[REDACTED]' },
  ],
});

const redactedLogger = new Logger({
  redactor,
});

redactedLogger.info('User user_12345 with SSN 123-45-6789');

// 8.3 Sampler
const sampler = new Sampler({
  rate: 0.1,  // Sample 10% of logs
  strategy: 'random',
});

const sampledLogger = new Logger({
  sampler,
});

// Sample 10% of logs
for (let i = 0; i < 10; i++) {
  sampledLogger.info(`Sampled log ${i} (only ~10% will appear)`);
}

// 8.4 Queue Manager (just showing the concept)
// const queueManager = new QueueManager({
//   maxSize: 10000,
//   flushInterval: 5000,
//   dropPolicy: 'oldest',
// });

// 8.5 Enhanced Console
enhanceConsole({
  logger,
  preserveOriginal: true,
  methodMap: {
    log: 'info',
    warn: 'warning',
    error: 'error',
  },
});

// Now console methods use MagicLogger
console.log('Enhanced console.log');
console.warn('Enhanced console.warn');
console.error('Enhanced console.error');

// ============================================================================
// SECTION 9: ADVANCED FEATURES
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 9: ADVANCED FEATURES');
console.log('='.repeat(80) + '\n');

// 9.1 Filtering logs
const filteredLogger = new Logger({
  filter: (entry: LogEntry) => {
    // Only log errors and warnings in production
    return entry.level === 'error' || entry.level === 'warning';
  },
});

filteredLogger.info('This will be filtered out');
filteredLogger.error('This error will pass through');

// 9.2 Transform logs
const transformLogger = new Logger({
  transform: (entry: LogEntry) => {
    // Add custom fields
    return {
      ...entry,
      hostname: 'server-01',
      region: 'us-east-1',
    };
  },
});

transformLogger.info('Transformed log with extra fields');

// 9.3 Child loggers
const parentLogger = new Logger({ id: 'parent' });
const childLogger = parentLogger.child({
  id: 'child',
  context: { component: 'auth' },
});

childLogger.info('Child logger inherits parent config');

// 9.4 Log groups
logger.group('Processing batch');
logger.info('Item 1 processed');
logger.info('Item 2 processed');
logger.info('Item 3 processed');
logger.groupEnd();

// 9.5 Timing
logger.time('operation');
// Simulate work
setTimeout(() => {
  logger.timeEnd('operation');
}, 100);

// 9.6 Counting
logger.count('api-calls');
logger.count('api-calls');
logger.count('api-calls');
logger.countReset('api-calls');

// ============================================================================
// SECTION 10: PERFORMANCE & OPTIMIZATION
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 10: PERFORMANCE & OPTIMIZATION');
console.log('='.repeat(80) + '\n');

// 10.1 Ring buffer configuration
const performantLogger = createAsyncLogger({
  buffer: {
    size: 32768,      // Larger buffer
    flushInterval: 100,  // Less frequent flushes
    flushSize: 5000,     // Bigger batches
  },
  dropPolicy: 'oldest',  // Drop old logs when full
});

// 10.2 Check buffer status
const result = performantLogger.info('High volume log');
if (!result.success) {
  console.warn(`Buffer full: ${result.reason}`);
}

// 10.3 Get statistics
const stats = performantLogger.getStats();
console.log('Logger stats:', stats);

// 10.4 Flush manually
await performantLogger.flushAndWait();

// ============================================================================
// SECTION 11: CLEANUP
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('SECTION 11: CLEANUP');
console.log('='.repeat(80) + '\n');

// Close all loggers and transports
async function cleanup() {
  console.log('Closing loggers...');
  
  await logger.close();
  await asyncLogger.close();
  syncLogger.close();
  await multiTransportLogger.close();
  
  console.log('All loggers closed successfully');
}

// Run cleanup after demos
setTimeout(async () => {
  await cleanup();
  process.exit(0);
}, 2000);

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================
export {
  logger,
  syncLogger,
  asyncLogger,
  contextLogger,
  taggedLogger,
  multiTransportLogger,
};