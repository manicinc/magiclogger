import { LoggerBase } from './LoggerBase';
import { Formatter } from './Formatter';
import { Printer } from './Printer';
import { BrowserStorageManager } from './BrowserStorageManager';

import type { LoggerOptions, ColorName, StylePreset } from '../types';

/**
 * Logger implementation for browser environments.
 * Uses CSS-style output with shared Formatter and Printer modules.
 * Optionally supports storing logs in browser storage.
 */
export class BrowserLogger extends LoggerBase {
  private formatter: Formatter;
  private storageManager: BrowserStorageManager | null = null;
  private storeInBrowser: boolean;

  /**
   * Creates a new browser logger instance.
   * @param options Configuration for the logger
   */
  constructor(options: LoggerOptions = {}) {
    super(options);
    this.formatter = new Formatter(this.useColors);
    this.storeInBrowser = options.storeInBrowser || false;

    // Initialize storage manager if enabled
    if (this.storeInBrowser) {
      this.storageManager = new BrowserStorageManager({
        storageName: options.storageName,
        maxEntries: options.maxStoredLogs,
        useLocalStorage: options.useLocalStorage,
      });
    }
  }

  /**
   * Store a log entry in browser storage if enabled
   * @param level Log level
   * @param msg Log message
   */
  private storeLog(level: string, msg: string): void {
    if (this.storeInBrowser && this.storageManager) {
      this.storageManager.addLog(`[${level}] ${msg}`);
    }
  }

  /** Log an info-level message */
  public info(msg: string): void {
    const prefix = this.formatter.colorize('[INFO]', ['cyan', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog('INFO', msg);
  }

  /** Log a warning-level message */
  public warn(msg: string): void {
    const prefix = this.formatter.colorize('[WARN]', ['yellow', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog('WARN', msg);
  }

  /** Log an error-level message */
  public error(msg: string): void {
    const prefix = this.formatter.colorize('[ERROR]', ['brightRed', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog('ERROR', msg);
  }

  /** Log a debug-level message (only if verbose is true) */
  public debug(msg: string): void {
    if (!this.verbose) return;
    const prefix = this.formatter.colorize('[DEBUG]', ['gray', 'italic']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog('DEBUG', msg);
  }

  /** Log a success message */
  public success(msg: string): void {
    const prefix = this.formatter.colorize('[SUCCESS]', ['green', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog('SUCCESS', msg);
  }

  /**
   * Log a custom-styled message.
   * @param msg The log message
   * @param colors Colors/styles to apply to the prefix
   * @param prefix Optional prefix (default: LOG)
   */
  public custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    const formattedPrefix = this.formatter.colorize(`[${prefix}]`, colors);
    Printer.print(`${formattedPrefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog(prefix, msg);
  }

  /**
   * Log a message using a preset style.
   * @param msg The message to log
   * @param preset The style preset to apply
   */
  public styled(msg: string, preset: StylePreset): void {
    const formattedPrefix = this.formatter.applyPreset(`[${preset.toUpperCase()}]`, preset);
    Printer.print(`${formattedPrefix} ${this.formatter.preserveLinks(msg)}`);
    this.storeLog(preset.toUpperCase(), msg);
  }

  /**
   * Print a styled header
   * @param title Header title
   * @param colors Optional color array
   */
  public header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    const padded = ` ${title} ${' '.repeat(Math.max(0, 60 - title.length))}`;
    Printer.print(this.formatter.colorize(padded, colors));
    this.storeLog('HEADER', title);
  }

  /**
   * Print a table of structured data.
   * @param data Array of key-value objects
   * @param headerColor Optional colors for header styling
   */
  public table(
    data: Record<string, unknown>[],
    headerColor: ColorName[] = ['brightWhite', 'bold']
  ): void {
    // Use the improved table printing function
    Printer.printTable(data, headerColor);

    // Store table summary in browser storage
    if (this.storeInBrowser && this.storageManager) {
      this.storageManager.addLog(`[TABLE] ${data.length} rows: ${JSON.stringify(data)}`);
    }
  }

  /**
   * Create a reusable colorizing function
   * @param colors The styles to apply
   */
  public color(...colors: ColorName[]): (text: string) => string {
    return (text: string) => this.formatter.colorize(text, colors);
  }

  /**
   * Apply different colors to specific parts of a message
   * @param message The message to colorize
   * @param colorMap Object mapping string parts to color arrays
   * @returns The colorized message
   */
  public colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    if (!this.useColors) return message;

    let result = message;
    for (const [part, colors] of Object.entries(colorMap)) {
      const colorFn = this.color(...colors);
      // Use a regex that escapes special characters in the part string
      const regex = new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, colorFn(part));
    }
    return result;
  }

  /**
   * Log a link with optional label
   * @param url The URL or path
   * @param description Optional display text
   */
  public link(url: string, description?: string): void {
    const text = description ?? url;
    Printer.print(
      `${this.formatter.colorize(text, ['brightCyan', 'underline'])}: ${this.formatter.colorize(
        url,
        ['brightCyan', 'underline']
      )}`
    );
    this.storeLog('LINK', `${text}: ${url}`);
  }

  /**
   * Print a progress bar in browser (simplified)
   * @param progress A value from 0 to 100
   * @param length Total characters in bar (unused in browser)
   * @param completeChar Symbol for completed
   * @param incompleteChar Symbol for remaining
   */
  public progressBar(
    progress: number,
    length = 20,
    completeChar = '█',
    incompleteChar = '░'
  ): void {
    const safeProgress = Math.max(0, Math.min(progress, 100));
    const filled = completeChar.repeat(Math.round((safeProgress / 100) * length));
    const empty = incompleteChar.repeat(length - filled.length);
    const bar =
      this.formatter.colorize(filled, ['green']) + this.formatter.colorize(empty, ['gray']);
    const percent = this.formatter.colorize(`${safeProgress.toFixed(1)}%`, ['bold']);
    Printer.print(`${bar} ${percent}`);

    if (safeProgress >= 100) {
      this.storeLog('PROGRESS', '100% complete');
    }
  }

  /**
   * Sets a new theme for dynamic styling.
   * @param theme Object mapping log levels and labels to color arrays
   */
  public setTheme(theme: Record<string, ColorName[]>): void {
    super.setTheme(theme);
    this.formatter.setTheme?.(theme); // if formatter supports theme
  }

  /**
   * Gets all stored logs (if browser storage is enabled)
   * @returns Array of log entries or null if storage is disabled
   */
  public getLogs(): string[] | null {
    return this.storageManager?.getLogs() || null;
  }

  /**
   * Clears all stored logs (if browser storage is enabled)
   */
  public clearLogs(): void {
    this.storageManager?.clearLogs();
  }

  /**
   * Downloads stored logs as a text file (browser only)
   * @param filename The filename to use for the download
   */
  public downloadLogs(filename = 'logs.txt'): void {
    this.storageManager?.downloadLogs(filename);
  }

  /**
   * Enable or disable browser storage
   * @param enabled Whether to enable browser storage
   */
  public setStorageEnabled(enabled: boolean): void {
    this.storeInBrowser = enabled;

    // Initialize storage manager if newly enabled
    if (enabled && !this.storageManager) {
      this.storageManager = new BrowserStorageManager();
    }
  }

  /**
   * Gets the current log file path - not applicable in browser environments.
   * Implemented for API compatibility with NodeLogger.
   * @returns Always returns null in browser environments
   */
  public getLogFilePath(): string | null {
    return null; // No file system in browser
  }

  /**
   * No-op method for API compatibility with NodeLogger.
   * Browser environments don't support direct file system access.
   * @param enabled Has no effect in browser environments
   */
  public setFileLogging(enabled: boolean): void {
    // If enabled is true, we'll use browser storage instead
    if (enabled && !this.storeInBrowser) {
      this.setStorageEnabled(true);
    }
  }

  /**
   * Gets the log directory path - not applicable in browser environments.
   * Implemented for API compatibility with NodeLogger.
   * @returns Returns 'browser' as a placeholder
   */
  public getLogDirectory(): string {
    return 'browser'; // No file system in browser
  }

  /**
   * No-op method for API compatibility with NodeLogger.
   * Browser environments don't support direct file system access.
   * @param dir Has no effect in browser environments
   * @param reinitialize Has no effect in browser environments
   */
  public setLogDirectory(dir: string, _reinitialize = false): void {
    // No-op in browser environment
  }

  /**
   * Gets the log retention period - not applicable in browser environments.
   * Implemented for API compatibility with NodeLogger.
   * @returns Returns 0 as this doesn't apply to browser environments
   */
  public getLogRetentionDays(): number {
    return 0; // Not applicable in browser
  }

  /**
   * No-op method for API compatibility with NodeLogger.
   * Browser environments don't support direct file system access.
   * @param days Has no effect in browser environments
   * @param cleanNow Has no effect in browser environments
   */
  public setLogRetentionDays(_days: number, _cleanNow = false): void {
    // No-op in browser environment
  }

  /**
   * Displays a visual separator line for organizing log output.
   * @param char Character to use for the separator (default: '-')
   * @param length Length of the separator line (default: 60)
   * @param colors Optional array of color/style names to apply
   */
  /**
   * Print a separator line
   * @param char Character to use for the separator
   * @param length Length of the separator line
   */
  public separator(char = '-', length = 50): void {
    const separatorLine = char.repeat(length);
    this.log(separatorLine, 'info');
  }
}
