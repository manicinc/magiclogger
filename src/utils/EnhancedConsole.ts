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
  private static instance: EnhancedConsole | null = null;
  public logger: Logger;
  private useColors = true;
  private originalConsole: Console;
  private exitHandler?: () => void;

  /**
   * Get singleton instance of EnhancedConsole
   */
  public static getInstance(options?: EnhanceConsoleOptions): EnhancedConsole {
    if (!EnhancedConsole.instance) {
      EnhancedConsole.instance = new EnhancedConsole(options);
    }
    return EnhancedConsole.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    EnhancedConsole.instance = null;
  }

  constructor(options: EnhanceConsoleOptions = {}) {
    this.logger = new Logger(options);
    this.useColors = options.useColors !== undefined ? options.useColors : true;
    this.originalConsole = { ...console };

    if (options.restoreOnExit && typeof process !== 'undefined') {
      this.exitHandler = () => this.restoreOriginalConsole();
      process.on('exit', this.exitHandler);
    }
  }

  log(message?: unknown, ...args: unknown[]): void {
    // Always delegate to original console.log
    try {
      if (arguments.length === 0) {
        this.originalConsole.log();
      } else {
        this.originalConsole.log(message, ...args);
      }
    } catch (error) {
      // Silently ignore errors
    }
  }

  info(message: unknown, ...args: unknown[]): void {
    // Always delegate to original console.info
    this.originalConsole.info(message, ...args);
  }

  warn(message: unknown, ...args: unknown[]): void {
    // Always delegate to original console.warn
    this.originalConsole.warn(message, ...args);
  }

  error(message: unknown, ...args: unknown[]): void {
    // Always delegate to original console.error
    this.originalConsole.error(message, ...args);
  }

  debug(message: unknown, ...args: unknown[]): void {
    // Always delegate to original console.debug
    this.originalConsole.debug(message, ...args);
  }

  trace(message?: unknown, ...args: unknown[]): void {
    this.originalConsole.trace(message, ...args);
  }

  group(label?: string): void {
    this.originalConsole.group(label);
  }

  groupEnd(): void {
    this.originalConsole.groupEnd();
  }

  time(label?: string): void {
    this.originalConsole.time(label);
  }

  timeEnd(label?: string): void {
    this.originalConsole.timeEnd(label);
  }

  timeLog(label?: string, ...data: unknown[]): void {
    if (typeof this.originalConsole.timeLog === 'function') {
      this.originalConsole.timeLog(label, ...data);
    }
  }

  clear(): void {
    this.originalConsole.clear();
  }

  dir(obj: unknown, options?: NodeJS.InspectOptions): void {
    this.originalConsole.dir(obj, options);
  }

  dirxml(...data: unknown[]): void {
    if (typeof this.originalConsole.dirxml === 'function') {
      this.originalConsole.dirxml(...data);
    }
  }

  count(label?: string): void {
    this.originalConsole.count(label);
  }

  countReset(label?: string): void {
    this.originalConsole.countReset(label);
  }

  assert(condition?: boolean, ...data: unknown[]): void {
    this.originalConsole.assert(condition, ...data);
  }

  profile(label?: string): void {
    if (
      typeof (this.originalConsole as { profile?: (label?: string) => void }).profile === 'function'
    ) {
      (this.originalConsole as { profile: (label?: string) => void }).profile(label);
    }
  }

  profileEnd(label?: string): void {
    if (
      typeof (this.originalConsole as { profileEnd?: (label?: string) => void }).profileEnd ===
      'function'
    ) {
      (this.originalConsole as { profileEnd: (label?: string) => void }).profileEnd(label);
    }
  }

  success(message: string, ..._args: unknown[]): void {
    this.logger.success(message);
  }

  failure(message: string, ..._args: unknown[]): void {
    this.logger.error(message);
  }

  highlight(message: string, ..._args: unknown[]): void {
    // For now, just log the message without styling
    this.originalConsole.log(message);
  }

  box(message: string, ..._args: unknown[]): void {
    // For now, just log the message without box formatting to avoid import issues
    this.originalConsole.log(message);
  }

  header(title: string, colors?: ColorName[]): void {
    this.logger.header(title, colors || ['brightWhite', 'bgBlue', 'bold']);
  }

  progress(value: number, length?: number, completeChar?: string, incompleteChar?: string): void {
    this.logger.progressBar(value, length, completeChar, incompleteChar);
  }

  table(data: unknown, columns?: string[]): void {
    if (columns !== undefined) {
      this.originalConsole.table(data, columns);
    } else {
      this.originalConsole.table(data);
    }
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
