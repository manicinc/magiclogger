import { LoggerBase } from './LoggerBase';
import type { LoggerOptions, ColorName, StylePreset } from '../types';
import { FileManager } from './FileManager';
import { Formatter } from './Formatter';
import { Printer } from './Printer';
import { PRESETS } from '../constants';

/**
 * NodeLogger provides a MagicLogger implementation for Node.js environments.
 * Supports ANSI styling, file logging, and logger metadata (ID, tags, context).
 */
export class NodeLogger extends LoggerBase {
  private fileManager: FileManager | null = null;
  private formatter: Formatter;

  /**
   * Constructs a NodeLogger instance with optional file logging and styles.
   * @param options Logger configuration (verbosity, styling, file logging, etc.)
   */
  constructor(options: LoggerOptions = {}) {
    super(options);
    this.formatter = new Formatter(this.useColors);

    if (options.writeToDisk) {
      this.fileManager = new FileManager(options.logDir ?? 'logs', options.logRetentionDays);
      this.fileManager.initLogFile();
    }
  }

  /**
   * Logs a standard info-level message.
   * @param msg Message to log
   */
  public info(msg: string): void {
    this.print('INFO', msg, 'info');
  }

  /**
   * Logs a warning-level message.
   * @param msg Message to log
   */
  public warn(msg: string): void {
    this.print('WARN', msg, 'warning');
  }

  /**
   * Logs an error-level message.
   * @param msg Message to log
   */
  public error(msg: string): void {
    this.print('ERROR', msg, 'error');
  }

  /**
   * Logs a debug-level message only if verbose mode is enabled.
   * @param msg Message to log
   */
  public debug(msg: string): void {
    if (!this.verbose) return;
    this.print('DEBUG', msg, 'debug');
  }

  /**
   * Logs a success-style message (typically for positive completions).
   * @param msg Message to log
   */
  public success(msg: string): void {
    this.print('SUCCESS', msg, 'success');
  }

  /**
   * Logs a message with a custom prefix and colors.
   * @param msg Message to log
   * @param colors Array of color/style names to apply
   * @param prefix Label to prefix the message with (default: LOG)
   */
  public custom(msg: string, colors: ColorName[] = ['white'], prefix = 'LOG'): void {
    const coloredPrefix = this.formatter.colorize(`[${prefix}]`, colors);
    const formatted = `${coloredPrefix} ${this.formatter.preserveLinks(msg)}`;
    Printer.print(formatted);
    this.writeFile(`[${prefix}] ${msg}`);
  }

  /**
   * Logs a message using a predefined style preset (info, error, etc.).
   * @param msg Message to log
   * @param preset Preset name (e.g. 'info', 'error', 'success')
   */
  public styled(msg: string, preset: StylePreset): void {
    const presetColors = this.getPresetColors(preset);
    const prefix = `[${preset.toUpperCase()}]`;
    const coloredPrefix = this.formatter.colorize(prefix, presetColors);
    Printer.print(`${coloredPrefix} ${msg}`);
    this.writeFile(`${prefix} ${msg}`);
  }

  /**
   * Logs a full-width visual header for highlighting sections.
   * @param title Header title text
   * @param colors Optional array of color styles (default: bright white on blue)
   */
  public header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    const padding = Math.max(0, 80 - title.length - 4);
    const padded = ` ${title} ${' '.repeat(padding)}`;
    Printer.print(this.formatter.colorize(padded, colors));
    this.writeFile(`=== ${title} ${'='.repeat(padding)} ===`);
  }

  /**
   * Logs a visual data table in console and writes metadata to file.
   * @param data Array of row objects
   * @param headerColor Optional color styles for the header row
   */
  public table(
    data: Record<string, any>[],
    headerColor: ColorName[] = ['brightWhite', 'bold']
  ): void {
    Printer.printTable(data, headerColor);

    if (this.fileManager) {
      this.writeFile(`[TABLE] ${data.length} rows`);
      data.forEach((row, index) => {
        this.writeFile(`  Row ${index + 1}: ${JSON.stringify(row)}`);
      });
    }
  }

  /**
   * Logs a clickable or highlighted URL link.
   * @param url The target URL or path
   * @param description Optional label for the link (defaults to URL)
   */
  public link(url: string, description?: string): void {
    const label = description ?? url;
    const formatted =
      this.formatter.colorize(`[${label}]`, ['brightCyan', 'underline']) + `: ${url}`;
    Printer.print(formatted);
    this.writeFile(`${label}: ${url}`);
  }

  /**
   * Displays a progress bar representing task completion percentage.
   * @param progress Percentage (0–100)
   * @param length Bar length in characters (default: 20)
   * @param completeChar Character used for completed blocks (default: █)
   * @param incompleteChar Character for remaining blocks (default: ░)
   */
  public progressBar(
    progress: number,
    length = 20,
    completeChar = '█',
    incompleteChar = '░'
  ): void {
    const safe = Math.max(0, Math.min(100, progress));
    const filled = Math.round((safe / 100) * length);
    const complete = completeChar.repeat(filled);
    const incomplete = incompleteChar.repeat(length - filled);
    const bar = this.useColors
      ? this.formatter.colorize(complete, ['green']) + this.formatter.colorize(incomplete, ['gray'])
      : complete + incomplete;
    const percent = `${safe.toFixed(1)}%`;
    Printer.printProgress(bar, percent);
    if (safe >= 100) {
      this.writeFile(`[PROGRESS] 100% complete`);
    }
  }

  /**
   * Returns a reusable colorizing function with the given styles applied.
   * @param colors List of color names to apply
   * @returns A function that takes a string and returns a colorized version
   */
  public color(...colors: ColorName[]): (text: string) => string {
    return (text: string) => this.formatter.colorize(text, colors);
  }

  /**
   * Applies different color styles to specific parts of a message string.
   * @param message The full message to format
   * @param colorMap A map of string substrings to an array of colors
   * @returns A colorized version of the message
   */
  public colorParts(message: string, colorMap: Record<string, ColorName[]>): string {
    if (!this.useColors) return message;

    let result = message;
    for (const [part, colors] of Object.entries(colorMap)) {
      const colorFn = this.color(...colors);
      const regex = new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, colorFn(part));
    }
    return result;
  }

  /**
   * Internal print method that applies styling, then prints and logs.
   * @param levelStr Display label (e.g. 'INFO')
   * @param msg The message text
   * @param preset The preset style to apply
   */
  private print(levelStr: string, msg: string, preset: StylePreset): void {
    const presetColors = this.getPresetColors(preset);
    const prefix = `[${levelStr}]`;
    const coloredPrefix = this.formatter.colorize(prefix, presetColors);
    const formattedMessage = `${coloredPrefix} ${this.formatter.preserveLinks(msg)}`;
    Printer.print(formattedMessage);
    this.writeFile(`[${levelStr}] ${msg}`);
  }

  /**
   * Writes a line to the log file if file output is enabled.
   * @param line The log string to append to the file
   */
  private writeFile(line: string): void {
    if (this.fileManager) {
      this.fileManager.appendToFile(line);
    }
  }

  /**
   * Sets a new theme to apply styles dynamically.
   * @param theme Object mapping log levels and labels to color styles
   */
  public setTheme(theme: Record<string, ColorName[]>): void {
    super.setTheme(theme);
    this.formatter.setTheme(theme); // Pass to formatter if needed
  }

  /**
   * Resolves a list of colors for the given preset style.
   * @param preset The preset name (e.g. 'info', 'error')
   * @returns Array of ColorName styles
   */
  private getPresetColors(preset: StylePreset): ColorName[] {
    return (PRESETS as Record<StylePreset, ColorName[]>)[preset] || ['white'];
  }
}
