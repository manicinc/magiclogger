import type { LoggerOptions, ColorName, StylePreset, LogLevel } from '../types';

/**
 * Shared base class for all MagicLogger implementations.
 * Defines the core structure, metadata, and API contract.
 */
export abstract class LoggerBase {
  /** Optional logger ID used for tracking in dashboards */
  public readonly id?: string;

  /** Optional tags for filtering logs */
  public readonly tags?: string[];

  /** Optional static metadata context for each log entry */
  public readonly context?: Record<string, any>;

  /** Whether verbose logging is enabled */
  protected verbose: boolean;

  /** Whether colors and styling are enabled */
  protected useColors: boolean;

  /** Whether to enforce strict log level validation */
  protected strictLevels: boolean;

  /**
   * Create a base logger instance.
   * Subclasses should implement actual rendering and transport logic.
   *
   * @param options Logger configuration and metadata
   */
  constructor(options: LoggerOptions = {}) {
    this.verbose = options.verbose ?? false;
    this.useColors = options.useColors ?? true;
    this.strictLevels = options.strictLevels ?? false;

    this.id = options.id;
    this.tags = options.tags;
    this.context = options.context;
  }

  /** Set verbose logging mode */
  public setVerbose(enabled: boolean): void {
    this.verbose = enabled;
  }

  /** Enable or disable color/styled output */
  public setColorsEnabled(enabled: boolean): void {
    this.useColors = enabled;
  }

  /** Main log entry point for any log level */
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
        if (this.strictLevels) {
          throw new Error(`[Logger] Unknown log level: ${level}`);
        }
        return this.custom(msg, ['white'], level.toUpperCase());
    }
  }

  /** Log an informational message */
  public abstract info(msg: string): void;

  /** Log a warning */
  public abstract warn(msg: string): void;

  /** Log an error */
  public abstract error(msg: string): void;

  /** Log a debug message (only if verbose is enabled) */
  public abstract debug(msg: string): void;

  /** Log a success message */
  public abstract success(msg: string): void;

  /** Log a message with a custom label and styles */
  public abstract custom(msg: string, colors: ColorName[], prefix?: string): void;

  /** Log a styled message using a predefined theme preset */
  public abstract styled(msg: string, preset: StylePreset): void;

  /** Print a full-width styled header */
  public abstract header(title: string, colors?: ColorName[]): void;

  /** Print a formatted object table to the output */
  public abstract table(data: Record<string, any>[], headerColor?: ColorName[]): void;

  /** Log a progress bar (if supported by environment) */
  public abstract progressBar(
    progress: number,
    length?: number,
    completeChar?: string,
    incompleteChar?: string
  ): void;

  /** Log a styled clickable or emphasized link */
  public abstract link(url: string, description?: string): void;

  /** Create a reusable color formatting function */
  public abstract color(...colors: ColorName[]): (text: string) => string;
}
