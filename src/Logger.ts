import { NodeLogger } from './core/NodeLogger'; // Import the NodeLogger class
import { BrowserLogger } from './core/BrowserLogger'; // Import the BrowserLogger class
import { LoggerOptions, LogLevel, StylePreset, ColorName } from './types'; // Import Logger options type

/**
 * This class automatically detects whether it's running in a Node.js or Browser environment.
 * It instantiates the appropriate logger (NodeLogger or BrowserLogger) accordingly.
 */
export class Logger {
  private loggerInstance: NodeLogger | BrowserLogger;

  /**
   * Create a new logger instance based on environment detection.
   *
   * @param options Logger configuration options
   */
  constructor(options: LoggerOptions = {}) {
    if (typeof window !== 'undefined') {
      // If running in the browser, use BrowserLogger
      this.loggerInstance = new BrowserLogger(options);
    } else {
      // Otherwise, use NodeLogger for Node.js
      this.loggerInstance = new NodeLogger(options);
    }
  }

  /**
   * Log a message at a specified level (default: 'info')
   *
   * @param msg The message to log
   * @param level Optional log level (can be any string)
   */
  log(msg: string, level: LogLevel = 'info'): void {
    this.loggerInstance.log(msg, level);
  }

  /**
   * Alias for info-level logging
   * @param msg Info message
   */
  info(msg: string): void {
    this.loggerInstance.info(msg);
  }

  /**
   * Log a success message
   *
   * @param msg The message to log
   */
  success(msg: string): void {
    this.loggerInstance.success(msg);
  }

  /**
   * Log a warning message
   *
   * @param msg The message to log
   */
  warn(msg: string): void {
    this.loggerInstance.warn(msg);
  }

  /**
   * Log an error message
   *
   * @param msg The message to log
   */
  error(msg: string): void {
    this.loggerInstance.error(msg);
  }

  /**
   * Log a debug message (only shown when verbose is true)
   *
   * @param msg The message to log
   */
  debug(msg: string): void {
    this.loggerInstance.debug(msg);
  }

  /**
   * Log a custom message with custom colors
   *
   * @param msg The message to log
   * @param colors Array of color/style names to apply to the prefix
   * @param prefix The prefix to use (default: 'LOG')
   */
  custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    this.loggerInstance.custom(msg, colors, prefix);
  }

  /**
   * Log a message with a preset style
   *
   * @param msg The message to log
   * @param preset The preset style to apply
   */
  styled(msg: string, preset: StylePreset): void {
    this.loggerInstance.styled(msg, preset);
  }

  /**
   * Print a section header
   *
   * @param title The header title
   * @param colors Optional custom colors
   */
  header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    this.loggerInstance.header(title, colors);
  }

  /**
   * Print a table from an array of objects
   *
   * @param data Array of objects to display
   * @param headerColor Optional color for the header row
   */
  table(data: Record<string, any>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void {
    this.loggerInstance.table(data, headerColor);
  }

  /**
   * Print a progress bar
   *
   * @param progress Current progress (0-100)
   * @param length Length of the progress bar
   * @param completeChar Character for completed portion
   * @param incompleteChar Character for incomplete portion
   */
  progressBar(progress: number, length = 20, completeChar = '█', incompleteChar = '░'): void {
    this.loggerInstance.progressBar(progress, length, completeChar, incompleteChar);
  }

  /**
   * Log a clickable link that preserves its integrity in the terminal
   *
   * @param url The URL or file path to link
   * @param description Optional description text
   */
  link(url: string, description?: string): void {
    this.loggerInstance.link(url, description);
  }

  /**
   * Create a reusable color function that applies the specified colors to text
   *
   * @param colors Array of color/style names to apply
   * @returns A function that accepts a string and returns it with the colors applied
   */
  color(...colors: ColorName[]): (text: string) => string {
    return this.loggerInstance.color(...colors);
  }

  /**
   * Apply different colors to specific parts of a message
   *
   * @param message The full message
   * @param colorMap Object mapping text parts to color arrays
   * @returns The message with colors applied to specific parts
   */
  colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    return this.loggerInstance.colorParts(message, colorMap);
  }

  /**
   * Set verbose mode (whether debug messages are shown)
   *
   * @param enabled Whether to enable verbose mode
   */
  setVerbose(enabled: boolean): void {
    this.loggerInstance.setVerbose(enabled);
  }

  /**
   * Enable or disable color output
   *
   * @param enabled Whether to enable colors
   */
  setColorsEnabled(enabled: boolean): void {
    this.loggerInstance.setColorsEnabled(enabled);
  }
}

// Re-export types from './types' for easier access by other modules
export type { LoggerOptions, LogLevel, StylePreset, ColorName } from './types';
