// File: src/utils/EnhancedConsole.ts

import { Logger } from '../Logger';
import type { ColorName } from '../types/colors';
import type { StylePreset } from '../types/preset';
import { Colorizer } from '../core/Colorizer';
import type { LoggerOptions } from '../types/logger';

/**
 * Options for enhancing the console
 */
export interface EnhanceConsoleOptions extends LoggerOptions {
  restoreOnExit?: boolean;
}

/**
 * Type guard to check if a string is a valid StylePreset
 */
function isStylePreset(value: string): value is StylePreset {
  const validPresets: StylePreset[] = [
    'info',
    'success',
    'warning',
    'error',
    'debug',
    'important',
    'highlight',
    'muted',
    'special',
    'code',
    'header',
  ];
  return validPresets.includes(value as StylePreset);
}

/**
 * Enhanced console that extends the standard console with additional formatting and logging capabilities.
 */
export class EnhancedConsole {
  public logger: Logger;
  private useColors = true;
  private originalConsole: Console;
  private exitHandler?: () => void;

  constructor(options: EnhanceConsoleOptions = {}) {
    this.logger = new Logger(options);
    this.useColors = options.useColors !== undefined ? options.useColors : true;
    this.originalConsole = { ...console };

    if (options.restoreOnExit && typeof process !== 'undefined') {
      this.exitHandler = () => this.restoreOriginalConsole();
      process.on('exit', this.exitHandler);
    }
  }

  private safeStringify(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'symbol') {
      return value.toString();
    } else if (typeof value === 'bigint') {
      return value.toString();
    } else if (value === null) {
      return 'null';
    } else if (value === undefined) {
      return 'undefined';
    } else {
      try {
        return String(value);
      } catch {
        return '[Object]';
      }
    }
  }

  log(message: unknown, ...args: unknown[]): void {
    // Check for recursion guard
    const recursionGuard = Symbol.for('recursionGuard');
    const consoleWithGuard = console as Console & Record<symbol, boolean>;
    if (consoleWithGuard[recursionGuard]) {
      // We're in a recursive call, use original console
      this.originalConsole.log(message, ...args);
      return;
    }

    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.log(message, ...args);
    } else {
      // Set recursion guard
      consoleWithGuard[recursionGuard] = true;
      try {
        // Convert message to string safely for logger
        const messageStr = this.safeStringify(message);
        this.logger.info(messageStr);
      } finally {
        // Clear recursion guard
        consoleWithGuard[recursionGuard] = false;
      }
    }
  }

  info(message: unknown, ...args: unknown[]): void {
    // Check for recursion guard
    const recursionGuard = Symbol.for('recursionGuard');
    const consoleWithGuard = console as Console & Record<symbol, boolean>;
    if (consoleWithGuard[recursionGuard]) {
      // We're in a recursive call, use original console
      this.originalConsole.info(message, ...args);
      return;
    }

    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.info(message, ...args);
    } else {
      // Set recursion guard
      consoleWithGuard[recursionGuard] = true;
      try {
        // Convert message to string safely for logger
        const messageStr = this.safeStringify(message);
        this.logger.info(messageStr);
      } finally {
        // Clear recursion guard
        consoleWithGuard[recursionGuard] = false;
      }
    }
  }

  warn(message: unknown, ...args: unknown[]): void {
    // Check for recursion guard
    const recursionGuard = Symbol.for('recursionGuard');
    const consoleWithGuard = console as Console & Record<symbol, boolean>;
    if (consoleWithGuard[recursionGuard]) {
      // We're in a recursive call, use original console
      this.originalConsole.warn(message, ...args);
      return;
    }

    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.warn(message, ...args);
    } else {
      // Set recursion guard
      consoleWithGuard[recursionGuard] = true;
      try {
        // Convert message to string safely for logger
        const messageStr = this.safeStringify(message);
        this.logger.warn(messageStr);
      } finally {
        // Clear recursion guard
        consoleWithGuard[recursionGuard] = false;
      }
    }
  }

  error(message: unknown, ...args: unknown[]): void {
    // Check for recursion guard
    const recursionGuard = Symbol.for('recursionGuard');
    const consoleWithGuard = console as Console & Record<symbol, boolean>;
    if (consoleWithGuard[recursionGuard]) {
      // We're in a recursive call, use original console
      this.originalConsole.error(message, ...args);
      return;
    }

    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.error(message, ...args);
    } else {
      // Set recursion guard
      consoleWithGuard[recursionGuard] = true;
      try {
        // Convert message to string safely for logger
        const messageStr = this.safeStringify(message);
        this.logger.error(messageStr);
      } finally {
        // Clear recursion guard
        consoleWithGuard[recursionGuard] = false;
      }
    }
  }

  debug(message: unknown, ...args: unknown[]): void {
    // Check for recursion guard
    const recursionGuard = Symbol.for('recursionGuard');
    const consoleWithGuard = console as Console & Record<symbol, boolean>;
    if (consoleWithGuard[recursionGuard]) {
      // We're in a recursive call, use original console
      this.originalConsole.debug(message, ...args);
      return;
    }

    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.debug(message, ...args);
    } else {
      // Set recursion guard
      consoleWithGuard[recursionGuard] = true;
      try {
        // Convert message to string safely for logger
        const messageStr = this.safeStringify(message);
        this.logger.debug(messageStr);
      } finally {
        // Clear recursion guard
        consoleWithGuard[recursionGuard] = false;
      }
    }
  }

  success(message: string, ..._args: unknown[]): void {
    this.logger.success(message);
  }

  header(title: string, colors?: ColorName[]): void {
    this.logger.header(title, colors || ['brightWhite', 'bgBlue', 'bold']);
  }

  progress(value: number, length?: number, completeChar?: string, incompleteChar?: string): void {
    this.logger.progressBar(value, length, completeChar, incompleteChar);
  }

  table(data: Record<string, unknown>[]): void {
    this.logger.table(data, ['brightWhite', 'bold']);
  }

  custom(msg: string, colors?: ColorName[], prefix?: string): void {
    this.logger.custom(msg, colors, prefix || 'LOG');
  }

  styled(msg: string, preset: string): void {
    // Validate and convert preset string to StylePreset
    if (isStylePreset(preset)) {
      this.logger.styled(msg, preset);
    } else {
      // Fallback to default style if invalid preset
      this.logger.styled(msg, 'info');
    }
  }

  customFormat(message: string, options: { color?: ColorName; prefix?: string } = {}): string {
    const formatted = options.color
      ? Colorizer.color(message, options.color, this.useColors)
      : message;

    if (options.prefix) {
      return Colorizer.colorParts(
        [
          { text: `[${options.prefix}] `, color: 'blue' },
          { text: formatted, color: 'white' },
        ],
        this.useColors
      );
    }

    return formatted;
  }

  color(...colors: ColorName[]): (text: string) => string {
    return (text: string) => Colorizer.applyColors(text, colors, this.useColors);
  }

  colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    return this.logger.colorParts(message, colorMap);
  }

  restoreOriginalConsole(): void {
    const original = this.originalConsole as unknown as Record<string, unknown>;
    const target = console as unknown as Record<string, unknown>;
    for (const key in original) {
      target[key] = original[key];
    }

    // Remove the exit event listener if it exists
    if (this.exitHandler && typeof process !== 'undefined') {
      process.off('exit', this.exitHandler);
      this.exitHandler = undefined;
    }
  }
}

/**
 * Enhanced methods to add to console
 */
interface EnhancedMethods {
  success?: (message: string, ...args: unknown[]) => void;
  header?: (title: string, colors?: ColorName[]) => void;
  progress?: (
    value: number,
    length?: number,
    completeChar?: string,
    incompleteChar?: string
  ) => void;
  table?: (data: Record<string, unknown>[]) => void;
  custom?: (msg: string, colors?: ColorName[], prefix?: string) => void;
  styled?: (msg: string, preset: string) => void;
  color?: (...colors: ColorName[]) => (text: string) => string;
  colorParts?: (message: string, colorMap: Record<string, ColorName[]>) => string;
}

/**
 * Type for the enhanced console - Console with our additional methods
 */
type ExtendedConsole = Console &
  EnhancedMethods & {
    [key: string]: unknown;
  };

/**
 * Enhance the global console object with Magic Logger's functionality
 */
export function enhanceConsole(options: EnhanceConsoleOptions = {}): {
  logger: Logger;
  restoreConsole: () => void;
} {
  const enhanced = new EnhancedConsole(options);
  const logger = enhanced.logger; // Use the same logger instance

  // Store original console methods
  const originalConsole = { ...console };

  // Add recursion guard symbol
  const recursionGuard = Symbol.for('recursionGuard');
  const extendedConsole = console as ExtendedConsole;
  (extendedConsole as unknown as Record<symbol, boolean>)[recursionGuard] = false;

  // Store references to our enhanced methods for cleanup
  const enhancedMethods: (keyof EnhancedMethods)[] = [
    'success',
    'header',
    'progress',
    'table',
    'custom',
    'styled',
    'color',
    'colorParts',
  ];

  // Explicitly add enhanced methods to console
  extendedConsole.success = enhanced.success.bind(enhanced);
  extendedConsole.header = enhanced.header.bind(enhanced);
  extendedConsole.progress = enhanced.progress.bind(enhanced);
  extendedConsole.table = enhanced.table.bind(enhanced);
  extendedConsole.custom = enhanced.custom.bind(enhanced);
  extendedConsole.styled = enhanced.styled.bind(enhanced);
  extendedConsole.color = enhanced.color.bind(enhanced);
  extendedConsole.colorParts = enhanced.colorParts.bind(enhanced);

  // Override existing methods with enhanced versions
  console.log = enhanced.log.bind(enhanced);
  console.info = enhanced.info.bind(enhanced);
  console.warn = enhanced.warn.bind(enhanced);
  console.error = enhanced.error.bind(enhanced);
  console.debug = enhanced.debug.bind(enhanced);

  return {
    logger,
    restoreConsole: () => {
      // Restore original console
      Object.assign(console, originalConsole);

      // Remove enhanced methods
      enhancedMethods.forEach(method => {
        delete (console as unknown as Record<string, unknown>)[method];
      });

      // Remove the recursion guard symbol properly
      Reflect.deleteProperty(console, recursionGuard);

      // Clean up the enhanced instance (including process event listeners)
      enhanced.restoreOriginalConsole();
    },
  };
}