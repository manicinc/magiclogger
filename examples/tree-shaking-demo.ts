// File: examples/tree-shaking-demo.ts

/**
 * MagicLogger Tree-Shaking Demo
 *
 * This example demonstrates how to use MagicLogger with optimal tree-shaking.
 * Each import is separate to ensure only needed code is bundled.
 */

// ============================================
// EXAMPLE 1: Minimal Logger (Smallest Bundle)
// ============================================

import { Logger } from 'magiclogger';

// Without any transports, logs go nowhere (but the API still works)
const minimalLogger = new Logger();
minimalLogger.info('This log goes nowhere without transports');

// ============================================
// EXAMPLE 2: Console-Only Logger
// ============================================

import { ConsoleTransport } from 'magiclogger/transports/console';

const consoleLogger = new Logger({
  transports: [
    new ConsoleTransport({
      name: 'console',
      level: 'debug',
      useColors: true,
    }),
  ],
});

consoleLogger.info('This appears in the console with colors');
consoleLogger.debug('Debug messages are visible');
consoleLogger.error('Errors stand out', new Error('Example error'));

// ============================================
// EXAMPLE 3: File Logging
// ============================================

import { FileTransport } from 'magiclogger/transports/file';

const fileLogger = new Logger({
  id: 'app-logger',
  tags: ['production'],
  transports: [
    new ConsoleTransport({ name: 'console' }),
    new FileTransport({
      name: 'file',
      filepath: './logs/app.log',
      level: 'info',
      maxFileSize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

fileLogger.info('This goes to both console and file');
fileLogger.debug('This only goes to console (file level is info)');

// ============================================
// EXAMPLE 4: Winston Compatibility
// ============================================

import { createWinstonCompatible } from 'magiclogger/compatibility/winston';

const winstonLogger = createWinstonCompatible({
  level: 'info',
  defaultMeta: { service: 'user-service' },
  timestamp: true,
});

// Winston-style API
winstonLogger.info('User logged in', { userId: 12345 });
winstonLogger.error('Database error', new Error('Connection failed'));

// Winston child loggers
const requestLogger = winstonLogger.child({ requestId: 'abc-123' });
requestLogger.info('Processing request');

// ============================================
// EXAMPLE 5: Dynamic Transport Loading
// ============================================

async function setupProductionLogging() {
  const logger = new Logger({
    id: 'production-app',
    context: { environment: 'production' },
  });

  // Always use console in development
  if (process.env.NODE_ENV !== 'production') {
    logger.addTransport(new ConsoleTransport({ name: 'console' }));
  }

  // Conditionally load heavy transports
  if (process.env.USE_S3_LOGS === 'true') {
    // This import only happens if needed (tree-shaking!)
    const { S3Transport } = await import('magiclogger/transports/s3');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bucket = process.env.LOG_BUCKET!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const region = process.env.AWS_REGION!;

    logger.addTransport(
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
    const { MongoDBTransport } = await import('magiclogger/transports/mongodb');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const uri = process.env.MONGODB_URI!;

    logger.addTransport(
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

// Each import is separate for tree-shaking
import { createBunyanCompatible } from 'magiclogger/compatibility/bunyan';
import { createPinoCompatible } from 'magiclogger/compatibility/pino';
import { enhanceConsole } from 'magiclogger/compatibility/console';

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

// Enhanced console
const { restoreConsole } = enhanceConsole();
console.success('✨ Console is now enhanced!');
console.header('Section Title');

// Restore original console when done
// restoreConsole();

// ============================================
// EXAMPLE 7: Custom Transports
// ============================================

import { Transport } from 'magiclogger/transports/base';
import type { LogEntry } from 'magiclogger';

class CustomTransport extends Transport {
  protected async doInit(): Promise<void> {
    // Initialize the transport
  }

  protected async doLog(entry: LogEntry): Promise<void> {
    // Your custom logging logic here
    console.log(`[CUSTOM] ${entry.level}: ${entry.message}`);
  }

  protected async doClose(): Promise<void> {
    // Clean up resources
  }
}

const customLogger = new Logger({
  transports: [new CustomTransport({ name: 'custom' })],
});

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
 */

// ============================================
// EXAMPLE 9: TypeScript Types
// ============================================

import type { LoggerOptions } from 'magiclogger';
import type { ConsoleTransportOptions } from 'magiclogger/transports/console';

// Type-safe configuration
const config: LoggerOptions = {
  id: 'typed-logger',
  tags: ['typescript'],
  verbose: true,
};

const transportConfig: ConsoleTransportOptions = {
  name: 'typed-console',
  level: 'debug',
  useColors: true,
};

const typedLogger = new Logger({
  ...config,
  transports: [new ConsoleTransport(transportConfig)],
});

// ============================================
// EXAMPLE 10: Dynamic Loading Demo
// ============================================

// Use the dynamic loading function
async function runDynamicDemo() {
  const productionLogger = await setupProductionLogging();
  productionLogger.info('Production logging configured');
}

// Use the typed logger
typedLogger.info('Type-safe logging example');

// ============================================
// EXAMPLE 11: Cleanup
// ============================================

// Always close loggers in production for graceful shutdown
process.on('SIGTERM', async () => {
  await fileLogger.close();
  await customLogger.close();
  restoreConsole(); // Restore original console
  process.exit(0);
});

// Run the dynamic demo
runDynamicDemo().catch(console.error);

// Export for use in other modules
export { consoleLogger, fileLogger, winstonLogger };
