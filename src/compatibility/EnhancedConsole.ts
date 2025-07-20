// File: src/compatibility/EnhancedConsole.ts

import { Logger } from '../Logger';
import { ColorName, StylePreset } from '../types';
import { Colorizer } from '../core/Colorizer';
import type { LoggerOptions } from '../types';

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
    'info', 'success', 'warning', 'error', 'debug',
    'important', 'highlight', 'muted', 'special', 'code', 'header'
  ];
  return validPresets.includes(value as StylePreset);
}

/**
 * Enhanced console that extends the standard console with additional formatting and logging capabilities.
 */
export class EnhancedConsole {
  private logger: Logger;
  private useColors = true;
  private originalConsole: Console;

  constructor(options: EnhanceConsoleOptions = {}) {
    this.logger = new Logger(options);
    this.useColors = options.useColors !== undefined ? options.useColors : true;
    this.originalConsole = { ...console };

    if (options.restoreOnExit && typeof process !== 'undefined') {
      process.on('exit', () => this.restoreOriginalConsole());
    }
  }

  log(message: string, ...args: unknown[]): void {
    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.log(message, ...args);
    } else {
      this.logger.info(message);
    }
  }

  info(message: string, ...args: unknown[]): void {
    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.info(message, ...args);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.warn(message, ...args);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, ...args: unknown[]): void {
    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.error(message, ...args);
    } else {
      this.logger.error(message);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    // If there are additional arguments, delegate to original console
    if (args.length > 0) {
      this.originalConsole.debug(message, ...args);
    } else {
      this.logger.debug(message);
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
    this.logger.table(data);
  }

  custom(msg: string, colors?: ColorName[], prefix?: string): void {
    this.logger.custom(msg, colors, prefix);
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
  }
}

/**
 * Enhanced methods to add to console
 */
interface EnhancedMethods {
  success?: (message: string, ...args: unknown[]) => void;
  header?: (title: string, colors?: ColorName[]) => void;
  progress?: (value: number, length?: number, completeChar?: string, incompleteChar?: string) => void;
  custom?: (msg: string, colors?: ColorName[], prefix?: string) => void;
  styled?: (msg: string, preset: string) => void;
  color?: (...colors: ColorName[]) => (text: string) => string;
  colorParts?: (message: string, colorMap: Record<string, ColorName[]>) => string;
}

/**
 * Type for the enhanced console - Console with our additional methods
 */
type ExtendedConsole = Console & EnhancedMethods & {
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
  const logger = new Logger(options);

  // Store original console methods
  const originalConsole = { ...console };

  // Add recursion guard symbol
  const recursionGuard = Symbol('recursionGuard');
  const extendedConsole = console as ExtendedConsole;
  extendedConsole[recursionGuard as unknown as string] = false;

  // Store references to our enhanced methods for cleanup
  const enhancedMethods: (keyof EnhancedMethods)[] = [
    'success', 'header', 'progress', 'custom', 'styled', 'color', 'colorParts'
  ];

  // Explicitly add enhanced methods to console
  extendedConsole.success = enhanced.success.bind(enhanced);
  extendedConsole.header = enhanced.header.bind(enhanced);
  extendedConsole.progress = enhanced.progress.bind(enhanced);
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
        delete (console as any)[method];
      });
      
      delete extendedConsole[recursionGuard as unknown as string];
    },
  };
}