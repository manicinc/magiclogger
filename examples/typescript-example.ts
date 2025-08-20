// TypeScript Example
// Usage: npx tsx scripts/typescript-example.ts
// Or compile with tsc and then run with node

import {
  createSyncLogger,
  type ColorName,
  type LogLevel,
  type StylePreset,
  type LoggerOptions,
  createWinstonCompatible,
} from '../dist/index.js';

// Type-safe logger options
const options: LoggerOptions = {
  verbose: true, // Show debug messages
  writeToDisk: true,
  logDir: './typed-logs', // Custom log directory
  logRetentionDays: 7, // Keep logs for 7 days
  theme: 'dark', // Use a predefined theme
};

// Create a type-safe logger instance (sync for interactive demo)
const logger = createSyncLogger(options);

// Winston-compatible logger
const winstonLogger = createWinstonCompatible({ verbose: true });

// Type-safe variable declarations
const logLevel: LogLevel = 'info';
const customColors: ColorName[] = ['blue', 'bold'];
const stylePreset: StylePreset = 'important';

// Basic usage examples
logger.header('TYPESCRIPT LOGGER EXAMPLE');

// Universal log method with type-safe levels
logger.log('Standard info message', logLevel);
logger.log('Warning message example', 'warn');
logger.log('Error message example', 'error');
logger.log('Debug information', 'debug');
logger.log('Success message example', 'success');

// Level-specific methods
logger.info('Application starting with TypeScript import...');
logger.warn('Resource usage at 90%');
logger.error('Connection failed to database');
logger.debug('Authentication token details');
logger.success('Operation completed successfully');

// Custom styling with type safety
logger.header('TYPE-SAFE STYLING');
logger.custom('Database migration starting...', customColors, 'DB');
logger.styled('Critical system notification', stylePreset);

// Creating a type-safe custom theme
interface ThemeConfig {
  [key: string]: ColorName[];
}

const customTheme: ThemeConfig = {
  info: ['cyan', 'bold'],
  error: ['brightRed', 'bold'],
  success: ['green', 'bold'],
  header: ['brightWhite', 'bgBlue', 'bold'],
};

// Apply custom theme
logger.setTheme(customTheme);
logger.info('Using a custom theme with TypeScript type safety!');

// Winston-compatible interface example
logger.header('WINSTON-COMPATIBLE EXAMPLE');
winstonLogger.info('Server started');
winstonLogger.warn('Connection pool nearing capacity');
winstonLogger.error('Database connection failed: ' + new Error('Connection timeout').message);

// Demonstrate runtime type checking
function logWithLevel(message: string, level: LogLevel): void {
  logger.log(message, level);
}

// Valid log level
logWithLevel('This uses a valid log level', 'info');

// This would cause a TypeScript error if uncommented:
// logWithLevel('This would cause a type error', 'invalid-level');

// Visual elements
logger.header('PROGRESS EXAMPLE');
logger.progressBar(50); // 50% complete

// Table example with typed data
interface User {
  id: number;
  name: string;
  role: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
  { id: 3, name: 'Charlie', role: 'Moderator' },
];

logger.table(users as unknown as Record<string, unknown>[]);

console.log('\nTypeScript example complete!');
