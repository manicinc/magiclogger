import type { LoggerOptions, ColorName, StylePreset, LogLevel } from '../types';

/**
 * Shared abstract base for NodeLogger and BrowserLogger.
 * Provides common config, metadata, and theme support.
 */
export abstract class LoggerBase {
  public readonly id?: string;
  public readonly tags?: string[];
  public readonly context?: Record<string, any>;

  protected verbose: boolean;
  protected useColors: boolean;
  protected strictLevels: boolean;

  protected theme: Record<string, ColorName[]> = {};

  constructor(options: LoggerOptions = {}) {
    this.verbose = options.verbose ?? false;
    this.useColors = options.useColors ?? true;
    this.strictLevels = options.strictLevels ?? false;

    this.id = options.id;
    this.tags = options.tags;
    this.context = options.context;

    if (options.theme) {
      if (typeof options.theme === 'object' && !Array.isArray(options.theme)) {
        this.theme = options.theme as Record<string, ColorName[]>;
      } else if (options.theme) {
        throw new Error(`[Logger] Invalid theme format: ${options.theme}`);
      }
    }
  }

  /** Toggle verbose mode */
  public setVerbose(enabled: boolean): void {
    this.verbose = enabled;
  }

  /** Toggle ANSI/color output */
  public setColorsEnabled(enabled: boolean): void {
    this.useColors = enabled;
  }

  /** Apply a new theme object */
  public setTheme(theme: Record<string, ColorName[]>): void {
    this.theme = theme;
  }

  /** Main entry point for logging */
  public log(msg: string, level: LogLevel = 'info'): void {
    switch (level) {
      case 'info':
        return this.info(msg);
      case 'warn':
        return this.warn(msg);
      case 'error':
        return this.error(msg);
      case 'debug':
        return this.debug(msg);
      case 'success':
        return this.success(msg);
      default:
        if (this.strictLevels) throw new Error(`[Logger] Unknown level: ${level}`);
        return this.custom(msg, ['white'], level.toUpperCase());
    }
  }

  public abstract info(msg: string): void;
  public abstract warn(msg: string): void;
  public abstract error(msg: string): void;
  public abstract debug(msg: string): void;
  public abstract success(msg: string): void;
  public abstract custom(msg: string, colors: ColorName[], prefix?: string): void;
  public abstract styled(msg: string, preset: StylePreset): void;
  public abstract header(title: string, colors?: ColorName[]): void;
  public abstract table(data: Record<string, any>[], headerColor?: ColorName[]): void;
  public abstract progressBar(
    progress: number,
    length?: number,
    completeChar?: string,
    incompleteChar?: string
  ): void;
  public abstract link(url: string, description?: string): void;
  public abstract color(...colors: ColorName[]): (text: string) => string;
  public abstract colorParts?(message: string, colorMap: Record<string, ColorName[]>): string;
}
