import { LoggerBase } from './LoggerBase';
import { Formatter } from './Formatter';
import { Printer } from './Printer';

import type { LoggerOptions, ColorName, StylePreset } from '../types';

/**
 * Logger implementation for browser environments.
 * Uses CSS-style output with shared Formatter and Printer modules.
 */
export class BrowserLogger extends LoggerBase {
  private formatter: Formatter;

  /**
   * Creates a new browser logger instance.
   * @param options Configuration for the logger
   */
  constructor(options: LoggerOptions = {}) {
    super(options);
    this.formatter = new Formatter(this.useColors);
  }

  /** Log an info-level message */
  public info(msg: string): void {
    const prefix = this.formatter.colorize('[INFO]', ['cyan', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
  }

  /** Log a warning-level message */
  public warn(msg: string): void {
    const prefix = this.formatter.colorize('[WARN]', ['yellow', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
  }

  /** Log an error-level message */
  public error(msg: string): void {
    const prefix = this.formatter.colorize('[ERROR]', ['brightRed', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
  }

  /** Log a debug-level message (only if verbose is true) */
  public debug(msg: string): void {
    if (!this.verbose) return;
    const prefix = this.formatter.colorize('[DEBUG]', ['gray', 'italic']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
  }

  /** Log a success message */
  public success(msg: string): void {
    const prefix = this.formatter.colorize('[SUCCESS]', ['green', 'bold']);
    Printer.print(`${prefix} ${this.formatter.preserveLinks(msg)}`);
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
  }

  /**
   * Log a message using a preset style.
   * @param msg The message to log
   * @param preset The style preset to apply
   */
  public styled(msg: string, preset: StylePreset): void {
    const formattedPrefix = this.formatter.applyPreset(`[${preset.toUpperCase()}]`, preset);
    Printer.print(`${formattedPrefix} ${this.formatter.preserveLinks(msg)}`);
  }

  /**
   * Print a styled header
   * @param title Header title
   * @param colors Optional color array
   */
  public header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    const padded = ` ${title} ${' '.repeat(Math.max(0, 60 - title.length))}`;
    Printer.print(this.formatter.colorize(padded, colors));
  }

  /**
   * Print a table of structured data.
   * @param data Array of key-value objects
   * @param headerColor Optional colors for header styling
   */
  public table(
    data: Record<string, any>[],
    headerColor: ColorName[] = ['brightWhite', 'bold']
  ): void {
    // Use the improved table printing function
    Printer.printTable(data, headerColor);
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
  }
}
