/**
 * Magic Logger Compatibility Layer
 * 
 * This module provides drop-in replacements for popular logging libraries,
 * allowing developers to seamlessly integrate Magic Logger into projects
 * that may be using other logging systems. It creates adapter interfaces
 * that match the API of common loggers while leveraging Magic Logger's
 * enhanced capabilities under the hood.
 * 
 * Supported compatibility modes:
 * - Console - Enhances the global console object with additional features
 * - Winston - Creates a Winston-compatible interface
 * - Bunyan - Creates a Bunyan-compatible interface
 * - Pino - Creates a Pino-compatible interface
 * 
 * This approach allows for gradual migration to Magic Logger or using
 * Magic Logger alongside existing logging solutions.
 */

import { Logger } from '../Logger';

/**
 * Console Compatibility - Enhances the native console
 * 
 * Extends the global console object with Magic Logger's advanced capabilities
 * while maintaining backward compatibility with standard console methods.
 * This allows using enhanced features without changing existing code.
 * 
 * Key features:
 * - Adds styling, formatting, and visualization methods to console
 * - Preserves all standard console behavior
 * - Handles complex objects and multiple arguments properly
 * - Includes recursion protection to prevent infinite loops
 * - Provides a method to restore the original console
 * 
 * @param options Configuration options for the underlying Logger
 * @param options.verbose Enable verbose logging (default: false)
 * @param options.writeToDisk Enable writing logs to disk (default: false)
 * @returns Object containing the logger instance and a restore function
 * 
 * @example
 * // Enhance the console
 * const { restoreConsole } = enhanceConsole({ verbose: true });
 * 
 * // Use enhanced methods
 * console.header('Application Started');
 * console.success('Configuration loaded successfully');
 * 
 * // Still works with standard methods
 * console.log('Regular log message');
 * console.log({ complex: 'object' }, 'with description');
 * 
 * // Later, restore original console if needed
 * restoreConsole();
 */
export function enhanceConsole(options?: { verbose?: boolean, writeToDisk?: boolean }) {
  // Create a new logger instance with the provided options
  const logger = new Logger({
    verbose: options?.verbose ?? false,
    writeToDisk: options?.writeToDisk ?? false
  });
  
  // Store references to the original console methods
  // This allows restoring them later or falling back when needed
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  const originalDebug = console.debug;
  
  // Flag to prevent recursion when logger methods call console methods
  // This is crucial to avoid infinite loops when logger uses console internally
  let isEnhancedConsoleActive = false;
  
  /**
   * Enhanced console.log implementation
   * 
   * For simple string messages, uses Magic Logger's styled output.
   * For complex arguments, falls back to the original console.log behavior.
   * Includes recursion protection to prevent infinite loops.
   */
  console.log = function(...args: any[]) {
    // If already in an enhanced console call, use original method
    // This prevents infinite recursion if logger calls console.log internally
    if (isEnhancedConsoleActive) {
      originalLog.apply(console, args);
      return;
    }
    
    // Set recursion flag and ensure it gets reset even if an error occurs
    isEnhancedConsoleActive = true;
    try {
      // For simple string messages, use the enhanced logger
      if (args.length === 1 && typeof args[0] === 'string') {
        logger.log(args[0]);
      } else {
        // For complex arguments, use original console.log
        originalLog.apply(console, args);
      }
    } finally {
      // Always reset the recursion flag when done
      isEnhancedConsoleActive = false;
    }
  };
  
  /**
   * Enhanced console.warn implementation
   * 
   * For simple string messages, uses Magic Logger's styled warning output.
   * For complex arguments, falls back to the original console.warn behavior.
   * Includes recursion protection to prevent infinite loops.
   */
  console.warn = function(...args: any[]) {
    if (isEnhancedConsoleActive) {
      originalWarn.apply(console, args);
      return;
    }
    
    isEnhancedConsoleActive = true;
    try {
      if (args.length === 1 && typeof args[0] === 'string') {
        logger.warn(args[0]);
      } else {
        originalWarn.apply(console, args);
      }
    } finally {
      isEnhancedConsoleActive = false;
    }
  };
  
  /**
   * Enhanced console.error implementation
   * 
   * For simple string messages, uses Magic Logger's styled error output.
   * For complex arguments, falls back to the original console.error behavior.
   * Includes recursion protection to prevent infinite loops.
   */
  console.error = function(...args: any[]) {
    if (isEnhancedConsoleActive) {
      originalError.apply(console, args);
      return;
    }
    
    isEnhancedConsoleActive = true;
    try {
      if (args.length === 1 && typeof args[0] === 'string') {
        logger.error(args[0]);
      } else {
        originalError.apply(console, args);
      }
    } finally {
      isEnhancedConsoleActive = false;
    }
  };
  
  /**
   * Enhanced console.info implementation
   * 
   * Maps to logger.success for simple string messages to provide better visibility.
   * For complex arguments, falls back to the original console.info behavior.
   * Includes recursion protection to prevent infinite loops.
   */
  console.info = function(...args: any[]) {
    if (isEnhancedConsoleActive) {
      originalInfo.apply(console, args);
      return;
    }
    
    isEnhancedConsoleActive = true;
    try {
      if (args.length === 1 && typeof args[0] === 'string') {
        logger.success(args[0]);
      } else {
        originalInfo.apply(console, args);
      }
    } finally {
      isEnhancedConsoleActive = false;
    }
  };
  
  /**
   * Enhanced console.debug implementation
   * 
   * For simple string messages, uses Magic Logger's styled debug output.
   * For complex arguments, falls back to the original console.debug behavior.
   * Includes recursion protection to prevent infinite loops.
   */
  console.debug = function(...args: any[]) {
    if (isEnhancedConsoleActive) {
      originalDebug.apply(console, args);
      return;
    }
    
    isEnhancedConsoleActive = true;
    try {
      if (args.length === 1 && typeof args[0] === 'string') {
        logger.debug(args[0]);
      } else {
        originalDebug.apply(console, args);
      }
    } finally {
      isEnhancedConsoleActive = false;
    }
  };
  
  // Add extended capabilities to console by attaching the logger's methods
  // TypeScript requires casting to 'any' to allow adding properties
  const extendedConsole = console as any;
  
  // Bind logger methods to ensure they maintain the correct 'this' context
  extendedConsole.header = logger.header.bind(logger);
  extendedConsole.progress = logger.progressBar.bind(logger);
  extendedConsole.success = logger.success.bind(logger);
  extendedConsole.custom = logger.custom.bind(logger);
  extendedConsole.styled = logger.styled.bind(logger);
  extendedConsole.colorize = logger.color.bind(logger);
  extendedConsole.colorParts = logger.colorParts.bind(logger);
  
  /**
   * Restore original console implementation
   * 
   * Removes all Magic Logger enhancements and returns the
   * console to its original state.
   */
  extendedConsole.restoreOriginalConsole = function() {
    // Restore original methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.info = originalInfo;
    console.debug = originalDebug;
    
    // Remove extended methods
    delete extendedConsole.header;
    delete extendedConsole.progress;
    delete extendedConsole.success;
    delete extendedConsole.custom;
    delete extendedConsole.styled;
    delete extendedConsole.colorize;
    delete extendedConsole.colorParts;
    delete extendedConsole.restoreOriginalConsole;
  };
  
  // Return both the underlying logger instance and a function to restore the console
  return {
    logger,
    restoreConsole: extendedConsole.restoreOriginalConsole
  };
}

/**
 * Winston Compatibility - Creates a Winston-like logger
 * 
 * Provides a drop-in replacement for Winston logger with a compatible API
 * that maps to Magic Logger under the hood. This allows using Magic Logger
 * in projects that expect a Winston-compatible interface.
 * 
 * Features:
 * - Compatible with Winston's level-based logging methods
 * - Supports the same core API (info, warn, error, etc.)
 * - Adds Magic Logger's extended capabilities
 * - Provides access to the underlying Logger instance
 * 
 * @param options Configuration options for the underlying Logger
 * @param options.verbose Enable verbose logging (default: false)
 * @param options.writeToDisk Enable writing logs to disk (default: false)
 * @returns A Winston-compatible logger interface
 * 
 * @example
 * // Create a Winston-compatible logger
 * const logger = createWinstonCompatible();
 * 
 * // Use Winston-style methods
 * logger.info('Server started');
 * logger.warn('Resource usage high');
 * logger.log('custom', 'Custom level message');
 * 
 * // Use Magic Logger extended capabilities
 * logger.header('New Transaction');
 * logger.success('Payment processed');
 */
export function createWinstonCompatible(options?: { verbose?: boolean, writeToDisk?: boolean }) {
  // Create a new logger instance with the provided options
  const logger = new Logger({
    verbose: options?.verbose ?? false,
    writeToDisk: options?.writeToDisk ?? false
  });
  
  /**
   * Winston-compatible logger interface
   * Maps Winston methods to Magic Logger functionality
   */
  const winstonCompat = {
    /**
     * Log a message with a specific level
     * 
     * @param level The log level ('info', 'warn', 'error', etc.)
     * @param message The message to log
     */
    log: (level: string, message: string) => {
      // Map Winston's levels to Magic Logger methods
      switch(level) {
        case 'info':
          logger.log(message);
          break;
        case 'warn':
          logger.warn(message);
          break;
        case 'error':
          logger.error(message);
          break;
        case 'debug':
          logger.debug(message);
          break;
        case 'verbose':
          logger.debug(message);
          break;
        default:
          // For custom levels, use the custom method with the level as prefix
          logger.custom(message, ['white'], level.toUpperCase());
      }
    },
    
    // Standard Winston shorthand methods
    
    /** Log an info message */
    info: (message: string) => logger.log(message),
    
    /** Log a warning message */
    warn: (message: string) => logger.warn(message),
    
    /** Log an error message */
    error: (message: string) => logger.error(message),
    
    /** Log a debug message */
    debug: (message: string) => logger.debug(message),
    
    /** Log a verbose message (maps to debug in Magic Logger) */
    verbose: (message: string) => logger.debug(message),
    
    // Magic Logger extended capabilities
    
    /** Display a styled header */
    header: logger.header.bind(logger),
    
    /** Display tabular data */
    table: logger.table.bind(logger),
    
    /** Display a progress bar */
    progress: logger.progressBar.bind(logger),
    
    /** Log a success message */
    success: logger.success.bind(logger),
    
    /** Log a message with custom styling */
    custom: logger.custom.bind(logger),
    
    /** Log a message with a predefined style */
    styled: logger.styled.bind(logger),
    
    /** Create a function to colorize text */
    colorize: logger.color.bind(logger),
    
    /** Colorize parts of a message */
    colorParts: logger.colorParts.bind(logger),
    
    /** Access to the underlying Logger instance for advanced usage */
    magicLogger: logger
  };
  
  return winstonCompat;
}

/**
 * Bunyan Compatibility - Creates a Bunyan-like logger
 * 
 * Provides a drop-in replacement for Bunyan logger with a compatible API
 * that maps to Magic Logger under the hood. This allows using Magic Logger
 * in projects that expect a Bunyan-compatible interface.
 * 
 * Features:
 * - Compatible with Bunyan's core logging methods
 * - Supports Bunyan's object and string parameter styles
 * - Adds Magic Logger's extended capabilities
 * - Provides access to the underlying Logger instance
 * 
 * @param options Configuration options
 * @param options.name Optional logger name (for Bunyan compatibility)
 * @param options.verbose Enable verbose logging (default: false)
 * @param options.writeToDisk Enable writing logs to disk (default: false)
 * @returns A Bunyan-compatible logger interface
 * 
 * @example
 * // Create a Bunyan-compatible logger
 * const logger = createBunyanCompatible({ name: 'myapp' });
 * 
 * // Use Bunyan-style methods with string messages
 * logger.info('Server listening');
 * 
 * // Use Bunyan-style methods with objects
 * logger.info({ port: 3000 }, 'Server listening');
 * 
 * // Use Magic Logger extended capabilities
 * logger.header('New Request');
 * logger.success('Request completed');
 */
export function createBunyanCompatible(options?: { 
  name?: string,
  verbose?: boolean, 
  writeToDisk?: boolean 
}) {
  // Create a new logger instance with the provided options
  const logger = new Logger({
    verbose: options?.verbose ?? false,
    writeToDisk: options?.writeToDisk ?? false
  });
  
  /**
   * Bunyan-compatible logger interface
   * Maps Bunyan methods to Magic Logger functionality
   */
  const bunyanCompat = {
    /**
     * Log an info-level message
     * 
     * @param obj Message string or object to log
     * @param msg Optional message when obj is an object
     */
    info: (obj: any, msg?: string) => {
      if (typeof obj === 'string') {
        // Simple string message
        logger.log(obj);
      } else if (msg) {
        // Object with accompanying message
        logger.log(`${msg} ${JSON.stringify(obj)}`);
      } else {
        // Just an object
        logger.log(JSON.stringify(obj));
      }
    },
    
    /**
     * Log a warning-level message
     * 
     * @param obj Message string or object to log
     * @param msg Optional message when obj is an object
     */
    warn: (obj: any, msg?: string) => {
      if (typeof obj === 'string') {
        logger.warn(obj);
      } else if (msg) {
        logger.warn(`${msg} ${JSON.stringify(obj)}`);
      } else {
        logger.warn(JSON.stringify(obj));
      }
    },
    
    /**
     * Log an error-level message
     * 
     * @param obj Message string or object to log
     * @param msg Optional message when obj is an object
     */
    error: (obj: any, msg?: string) => {
      if (typeof obj === 'string') {
        logger.error(obj);
      } else if (msg) {
        logger.error(`${msg} ${JSON.stringify(obj)}`);
      } else {
        logger.error(JSON.stringify(obj));
      }
    },
    
    /**
     * Log a debug-level message
     * 
     * @param obj Message string or object to log
     * @param msg Optional message when obj is an object
     */
    debug: (obj: any, msg?: string) => {
      if (typeof obj === 'string') {
        logger.debug(obj);
      } else if (msg) {
        logger.debug(`${msg} ${JSON.stringify(obj)}`);
      } else {
        logger.debug(JSON.stringify(obj));
      }
    },
    
    /**
     * Log a trace-level message (maps to debug with prefix)
     * 
     * @param obj Message string or object to log
     * @param msg Optional message when obj is an object
     */
    trace: (obj: any, msg?: string) => {
      if (typeof obj === 'string') {
        logger.debug(`TRACE: ${obj}`);
      } else if (msg) {
        logger.debug(`TRACE: ${msg} ${JSON.stringify(obj)}`);
      } else {
        logger.debug(`TRACE: ${JSON.stringify(obj)}`);
      }
    },
    
    /**
     * Log a fatal-level message (maps to error with prefix)
     * 
     * @param obj Message string or object to log
     * @param msg Optional message when obj is an object
     */
    fatal: (obj: any, msg?: string) => {
      if (typeof obj === 'string') {
        logger.error(`FATAL: ${obj}`);
      } else if (msg) {
        logger.error(`FATAL: ${msg} ${JSON.stringify(obj)}`);
      } else {
        logger.error(`FATAL: ${JSON.stringify(obj)}`);
      }
    },
    
    // Magic Logger extended capabilities
    
    /** Display a styled header */
    header: logger.header.bind(logger),
    
    /** Display tabular data */
    table: logger.table.bind(logger),
    
    /** Display a progress bar */
    progress: logger.progressBar.bind(logger),
    
    /** Log a success message */
    success: logger.success.bind(logger),
    
    /** Log a message with custom styling */
    custom: logger.custom.bind(logger),
    
    /** Log a message with a predefined style */
    styled: logger.styled.bind(logger),
    
    /** Create a function to colorize text */
    colorize: logger.color.bind(logger),
    
    /** Colorize parts of a message */
    colorParts: logger.colorParts.bind(logger),
    
    /** Access to the underlying Logger instance for advanced usage */
    magicLogger: logger
  };
  
  return bunyanCompat;
}

/**
 * Pino Compatibility - Creates a Pino-like logger
 * 
 * Provides a drop-in replacement for Pino logger with a compatible API
 * that maps to Magic Logger under the hood. This allows using Magic Logger
 * in projects that expect a Pino-compatible interface.
 * 
 * Features:
 * - Compatible with Pino's logging methods
 * - Supports Pino's object and string parameter styles
 * - Adds Magic Logger's extended capabilities
 * - Provides access to the underlying Logger instance
 * 
 * @param options Configuration options for the underlying Logger
 * @param options.verbose Enable verbose logging (default: false)
 * @param options.writeToDisk Enable writing logs to disk (default: false)
 * @returns A Pino-compatible logger interface
 * 
 * @example
 * // Create a Pino-compatible logger
 * const logger = createPinoCompatible();
 * 
 * // Use Pino-style methods with string messages
 * logger.info('Processing request');
 * 
 * // Use Pino-style methods with objects
 * logger.info({ method: 'GET', path: '/users' }, 'Received request');
 * 
 * // Use Magic Logger extended capabilities
 * logger.header('API Services');
 * logger.progress(75);
 */
export function createPinoCompatible(options?: { 
  verbose?: boolean, 
  writeToDisk?: boolean 
}) {
  // Create a new logger instance with the provided options
  const logger = new Logger({
    verbose: options?.verbose ?? false,
    writeToDisk: options?.writeToDisk ?? false
  });
  
  /**
   * Pino-compatible logger interface
   * Maps Pino methods to Magic Logger functionality
   */
  const pinoCompat = {
    /**
     * Log an info-level message
     * 
     * @param msgOrObj Message string or object to log
     * @param msgStr Optional message when msgOrObj is an object
     */
    info: (msgOrObj: any, msgStr?: string) => {
      if (typeof msgOrObj === 'string') {
        // Simple string message
        logger.log(msgOrObj);
      } else if (msgStr) {
        // Object with accompanying message
        logger.log(`${msgStr} ${JSON.stringify(msgOrObj)}`);
      } else {
        // Just an object
        logger.log(JSON.stringify(msgOrObj));
      }
    },
    
    /**
     * Log a warning-level message
     * 
     * @param msgOrObj Message string or object to log
     * @param msgStr Optional message when msgOrObj is an object
     */
    warn: (msgOrObj: any, msgStr?: string) => {
      if (typeof msgOrObj === 'string') {
        logger.warn(msgOrObj);
      } else if (msgStr) {
        logger.warn(`${msgStr} ${JSON.stringify(msgOrObj)}`);
      } else {
        logger.warn(JSON.stringify(msgOrObj));
      }
    },
    
    /**
     * Log an error-level message
     * 
     * @param msgOrObj Message string or object to log
     * @param msgStr Optional message when msgOrObj is an object
     */
    error: (msgOrObj: any, msgStr?: string) => {
      if (typeof msgOrObj === 'string') {
        logger.error(msgOrObj);
      } else if (msgStr) {
        logger.error(`${msgStr} ${JSON.stringify(msgOrObj)}`);
      } else {
        logger.error(JSON.stringify(msgOrObj));
      }
    },
    
    /**
     * Log a debug-level message
     * 
     * @param msgOrObj Message string or object to log
     * @param msgStr Optional message when msgOrObj is an object
     */
    debug: (msgOrObj: any, msgStr?: string) => {
      if (typeof msgOrObj === 'string') {
        logger.debug(msgOrObj);
      } else if (msgStr) {
        logger.debug(`${msgStr} ${JSON.stringify(msgOrObj)}`);
      } else {
        logger.debug(JSON.stringify(msgOrObj));
      }
    },
    
    /**
     * Log a trace-level message (maps to debug with prefix)
     * 
     * @param msgOrObj Message string or object to log
     * @param msgStr Optional message when msgOrObj is an object
     */
    trace: (msgOrObj: any, msgStr?: string) => {
      if (typeof msgOrObj === 'string') {
        logger.debug(`TRACE: ${msgOrObj}`);
      } else if (msgStr) {
        logger.debug(`TRACE: ${msgStr} ${JSON.stringify(msgOrObj)}`);
      } else {
        logger.debug(`TRACE: ${JSON.stringify(msgOrObj)}`);
      }
    },
    
    /**
     * Log a fatal-level message (maps to error with prefix)
     * 
     * @param msgOrObj Message string or object to log
     * @param msgStr Optional message when msgOrObj is an object
     */
    fatal: (msgOrObj: any, msgStr?: string) => {
      if (typeof msgOrObj === 'string') {
        logger.error(`FATAL: ${msgOrObj}`);
      } else if (msgStr) {
        logger.error(`FATAL: ${msgStr} ${JSON.stringify(msgOrObj)}`);
      } else {
        logger.error(`FATAL: ${JSON.stringify(msgOrObj)}`);
      }
    },
    
    // Magic Logger extended capabilities
    
    /** Display a styled header */
    header: logger.header.bind(logger),
    
    /** Display tabular data */
    table: logger.table.bind(logger),
    
    /** Display a progress bar */
    progress: logger.progressBar.bind(logger),
    
    /** Log a success message */
    success: logger.success.bind(logger),
    
    /** Log a message with custom styling */
    custom: logger.custom.bind(logger),
    
    /** Log a message with a predefined style */
    styled: logger.styled.bind(logger),
    
    /** Create a function to colorize text */
    colorize: logger.color.bind(logger),
    
    /** Colorize parts of a message */
    colorParts: logger.colorParts.bind(logger),
    
    /** Access to the underlying Logger instance for advanced usage */
    magicLogger: logger
  };
  
  return pinoCompat;
}