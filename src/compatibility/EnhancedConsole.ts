import { Logger } from '../Logger';
import { ColorName } from '../types';
import { Colorizer } from '../core/Colorizer';
import type { LoggerOptions } from '../types';

/**
 * Options for enhancing the console
 */
export interface EnhanceConsoleOptions extends LoggerOptions {
  restoreOnExit?: boolean;
}

/**
 * Interface defining the extended methods added to the console
 */
export interface EnhancedConsoleMethods {
  header(title: string, colors?: ColorName[]): void;
  success(message: string, ...args: unknown[]): void;
  progress(progress: number, length?: number, completeChar?: string, incompleteChar?: string): void;
  custom(msg: string, colors?: ColorName[], prefix?: string): void;
  styled(msg: string, preset: string): void;
  color(...colors: ColorName[]): (text: string) => string;
  colorParts(parts: Array<{ text: string; color: ColorName }>): string;
  restoreOriginalConsole(): void;
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

  log(message: string, ..._args: unknown[]): void {
    this.logger.info(message);
  }

  info(message: string, ..._args: unknown[]): void {
    this.logger.info(message);
  }

  warn(message: string, ..._args: unknown[]): void {
    this.logger.warn(message);
  }

  error(message: string, ..._args: unknown[]): void {
    this.logger.error(message);
  }

  success(message: string, ..._args: unknown[]): void {
    this.logger.success(message);
  }

  debug(message: string, ..._args: unknown[]): void {
    this.logger.debug(message);
  }

  header(title: string): void {
    this.logger.header(title);
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
    this.logger.styled(msg, preset as unknown as keyof typeof Colorizer); // TODO: tighten typing if needed
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

  colorParts(parts: Array<{ text: string; color: ColorName }>): string {
    return Colorizer.colorParts(parts, this.useColors);
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

  // Explicitly add enhanced methods to console
  (console as any).success = enhanced.success.bind(enhanced);
  (console as any).header = enhanced.header.bind(enhanced);
  (console as any).progress = enhanced.progress.bind(enhanced);
  (console as any).custom = enhanced.custom.bind(enhanced);
  (console as any).styled = enhanced.styled.bind(enhanced);
  (console as any).color = enhanced.color.bind(enhanced);
  (console as any).colorParts = enhanced.colorParts.bind(enhanced);

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
      delete (console as any).success;
      delete (console as any).header;
      delete (console as any).progress;
      delete (console as any).custom;
      delete (console as any).styled;
      delete (console as any).color;
      delete (console as any).colorParts;
    },
  };
}
