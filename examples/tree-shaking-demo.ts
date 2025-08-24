// File: examples/tree-shaking-demo.ts

/**
 * MagicLogger Tree-Shaking Demo
 *
 * This example demonstrates how to use MagicLogger with optimal tree-shaking.
 * Each import is separate to ensure only needed code is bundled.
 */

// Core imports - import from main index
import { Logger } from '../dist/index.js';
import type { LogEntry, LoggerOptions } from '../dist/index.js';

// Import transports from the single compiled transports entry to share the same base class instance
import { Transport } from '../dist/transports.js';
import { ConsoleTransport } from '../dist/transports.js';
import { FileTransport } from '../dist/transports.js';

// Compatibility layer imports (commented out - not implemented yet)
// import { createWinstonCompatible } from '../dist/compatibility/winston.js';
// import { createBunyanCompatible } from '../dist/compatibility/bunyan.js';
// import { createPinoCompatible } from '../dist/compatibility/pino.js';
// import { enhanceConsole } from '../dist/compatibility/console.js';

// ============================================
// EXAMPLE 1: Minimal Logger (Smallest Bundle)
// ============================================

const minimalLogger = new Logger();
minimalLogger.info('This log goes nowhere without transports');

// ============================================
// EXAMPLE 2: Console-Only Logger
// ============================================

const consoleLogger = new Logger();
consoleLogger.addTransport(
  new ConsoleTransport({
    name: 'console',
    level: 'debug',
    useColors: true,
  })
);

consoleLogger.info('This appears in the console with colors');
consoleLogger.debug('Debug messages are visible');
consoleLogger.error('Errors stand out', new Error('Example error'));

// ============================================
// EXAMPLE 3: File Logging
// ============================================

const fileLogger = new Logger({
  id: 'app-logger',
  tags: ['production'],
});

fileLogger.addTransport(new ConsoleTransport({ name: 'console' }));
fileLogger.addTransport(
  new FileTransport({
    name: 'file',
    filepath: './logs/app.log',
    level: 'info',
    maxFileSize: 10485760, // 10MB
    maxFiles: 5,
  })
);

fileLogger.info('This goes to both console and file');
fileLogger.debug('This only goes to console (file level is info)');

// ============================================
// EXAMPLE 4: Winston Compatibility
// ============================================

const winstonLogger = createWinstonCompatible({
  level: 'info',
  defaultMeta: { service: 'user-service' },
  timestamp: true,
});

// Winston-style API
// Note: winston compatibility layer accepts variadic args
winstonLogger.info('User logged in');
winstonLogger.error('Database error');

// Winston child loggers
const requestLogger = winstonLogger.child({ requestId: 'abc-123' });
requestLogger.info('Processing request');

// ============================================
// EXAMPLE 5: Dynamic Transport Loading
// ============================================

async function setupProductionLogging(): Promise<Logger> {
  const logger = new Logger({
    id: 'production-app',
    context: { environment: 'production' },
  });

  // Always use console in development
  if (process.env.NODE_ENV !== 'production') {
    await logger.addTransport(new ConsoleTransport({ name: 'console' }));
  }

  // Conditionally load heavy transports
  if (process.env.USE_S3_LOGS === 'true') {
    // This import only happens if needed (tree-shaking!)
    const { S3Transport } = await import('../dist/transports.js');

    const bucket = process.env.LOG_BUCKET;
    const region = process.env.AWS_REGION;

    if (!bucket || !region) {
      throw new Error('S3 logging enabled but LOG_BUCKET or AWS_REGION not set');
    }

    await logger.addTransport(
      new S3Transport({
        name: 's3',
        bucket,
        region,
        prefix: 'logs/',
        level: 'warn', // Only log warnings/errors to S3
      })
    );
  }

  if (process.env.USE_MONGODB_LOGS === 'true') {
    // MongoDB transport only loaded when needed
    const { MongoDBTransport } = await import('../dist/transports.js');

    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MongoDB logging enabled but MONGODB_URI not set');
    }

    await logger.addTransport(
      new MongoDBTransport({
        name: 'mongodb',
        uri,
        collection: 'logs',
        database: 'myapp',
      })
    );
  }

  return logger;
}

// ============================================
// EXAMPLE 6: Multiple Compatibility Layers
// ============================================

// Bunyan-style logger
const bunyanLogger = createBunyanCompatible({
  name: 'myapp',
  level: 'debug',
});

bunyanLogger.info({ user: 'john' }, 'User action');

// Pino-style logger
const pinoLogger = createPinoCompatible({
  level: 'info',
  prettyPrint: true,
});

pinoLogger.info('Fast logging with Pino API');

// Enhanced console (can be toggled)
let restoreConsole: (() => void) | null = null;

if (process.env.ENHANCE_CONSOLE === 'true') {
  const result = enhanceConsole();
  restoreConsole = result.restoreConsole;

  console.success('✨ Console is now enhanced!');
  console.header('Section Title');
}

// ============================================
// EXAMPLE 7: Custom Transports
// ============================================

class CustomTransport extends Transport {
  protected async doInit(): Promise<void> {
    // Initialize the transport
    console.log('[CUSTOM] Transport initialized');
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    // Your custom logging logic here
    const timestamp = new Date().toISOString();
    console.log(`[CUSTOM] ${timestamp} ${entry.level.toUpperCase()}: ${entry.message}`);

    if (entry.context) {
      console.log('[CUSTOM] Context:', JSON.stringify(entry.context, null, 2));
    }
  }

  protected async doClose(): Promise<void> {
    // Clean up resources
    console.log('[CUSTOM] Transport closed');
  }
}

const customLogger = new Logger();
customLogger.addTransport(new CustomTransport({ name: 'custom' }));

customLogger.info('This uses our custom transport');

// ============================================
// EXAMPLE 8: Bundle Size Comparison
// ============================================

/*
 * Bundle sizes with different configurations:
 *
 * 1. Just Logger:                    ~12KB
 * 2. Logger + ConsoleTransport:      ~15KB
 * 3. Logger + Console + File:        ~18KB
 * 4. Winston compatibility only:     ~25KB
 * 5. All compatibility (bad):        ~50KB
 *
 * Compare to traditional loggers:
 * - Winston full:                    ~180KB
 * - Bunyan full:                     ~45KB
 * - Pino full:                       ~35KB
 *
 * Tips for optimal bundle size:
 * - Only import what you need
 * - Use dynamic imports for heavy transports
 * - Avoid importing all compatibility layers
 * - Consider lazy-loading transports
 */

// ============================================
// EXAMPLE 9: TypeScript Types
// ============================================

const config: LoggerOptions = {
  id: 'typed-logger',
  tags: ['typescript', 'demo'],
  verbose: true,
  context: {
    app: 'tree-shaking-demo',
    version: '1.0.0',
  },
};

const typedLogger = new Logger(config);
typedLogger.addTransport(
  new ConsoleTransport({
    name: 'typed-console',
    level: 'debug',
    useColors: true,
  })
);

// Type-safe logging with metadata
interface UserAction {
  userId: number;
  action: string;
  timestamp: Date;
}

const userAction: UserAction = {
  userId: 123,
  action: 'login',
  timestamp: new Date(),
};

typedLogger.info('User action occurred', userAction);

// ============================================
// EXAMPLE 10: Error Handling
// ============================================

const errorLogger = new Logger({ id: 'error-handler' });
errorLogger.addTransport(
  new ConsoleTransport({
    name: 'error-console',
    level: 'error',
    useColors: true,
  })
);

// Structured error logging
try {
  throw new Error('Something went wrong');
} catch (error) {
  errorLogger.error('Operation failed', error, {
    context: 'example-10',
    severity: 'high',
  });
}

// ============================================
// EXAMPLE 11: Graceful Shutdown
// ============================================

// Track all loggers for cleanup
const activeLoggers = [consoleLogger, fileLogger, customLogger, typedLogger, errorLogger];

// Graceful shutdown handler
async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  // Close all loggers
  await Promise.all(activeLoggers.map(logger => logger.close()));

  // Restore original console if enhanced
  if (restoreConsole) {
    restoreConsole();
  }

  console.log('Shutdown complete');
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================================
// EXAMPLE 12: Production Setup
// ============================================

async function initializeLogging(): Promise<void> {
  try {
    // Setup production logging with dynamic transports
    const productionLogger = await setupProductionLogging();
    productionLogger.info('Production logging initialized', {
      transports: productionLogger.listTransports(),
      environment: process.env.NODE_ENV,
    });

    // Add to active loggers for cleanup
    activeLoggers.push(productionLogger);

    // Export for global use without non-top-level imports
    (globalThis as unknown as { logger?: typeof productionLogger }).logger = productionLogger;
  } catch (error) {
    console.error('Failed to initialize logging:', error);
    process.exit(1);
  }
}

// ============================================
// Module Exports
// ============================================

// Export commonly used loggers
export {
  consoleLogger,
  fileLogger,
  winstonLogger,
  bunyanLogger,
  pinoLogger,
  customLogger,
  typedLogger,
  errorLogger,
};

// Export utility functions
export { setupProductionLogging, initializeLogging, shutdown };

// Export custom transport for extension
export { CustomTransport };

// Export types for TypeScript users
export type { LogEntry, LoggerOptions };

// Initialize if running directly
if (require.main === module) {
  console.log('🚀 MagicLogger Tree-Shaking Demo');
  console.log('=====================================\n');

  // Run initialization
  initializeLogging().catch(console.error);

  // Demo logs
  setTimeout(() => {
    consoleLogger.info('Demo: Console logging works');
    fileLogger.warn('Demo: File logging active');
    winstonLogger.info('Demo: Winston compatibility');
    customLogger.debug('Demo: Custom transport example');
  }, 100);
}
