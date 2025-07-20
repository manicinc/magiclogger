import type { LoggerOptions, ColorName, StylePreset, LogLevel } from '../types';
import { ThemeManager } from '../theme/ThemeManager';

/**
 * Base abstract class for all logger implementations.
 *
 * This class provides common configuration, state management, and theme support
 * that is shared across both Node.js and browser logger implementations.
 * LoggerBase handles the core configuration and implements the main logging
 * interface, while leaving environment-specific implementations to subclasses.
 *
 * @abstract
 * @class
 */
export abstract class LoggerBase {
  /**
   * Optional unique identifier for this logger instance.
   * Can be used for filtering or identifying logs from specific components.
   */
  public readonly id?: string;

  /**
   * Optional array of tags associated with this logger instance.
   * Useful for categorizing or filtering logs.
   */
  public readonly tags?: string[];

  /**
   * Optional context object with additional metadata for this logger.
   * This data can be included with each log message.
   */
  public readonly context?: Record<string, any>;

  /**
   * Controls whether debug-level messages are displayed.
   * @protected
   */
  protected verbose: boolean;

  /**
   * Controls whether ANSI color codes or styling should be applied to log messages.
   * @protected
   */
  protected useColors: boolean;

  /**
   * If true, the logger will throw errors for unknown log levels.
   * If false, unknown levels will be treated as custom prefixes.
   * @protected
   */
  protected strictLevels: boolean;

  /**
   * Instance of ThemeManager used to load and apply themes.
   * @protected
   */
  protected themeManager: ThemeManager;

  /**
   * The current theme configuration mapping log levels to color/style arrays.
   * @protected
   */
  protected theme: Record<string, ColorName[]> = {};

  /**
   * Creates a new LoggerBase instance with the specified options.
   *
   * @param {LoggerOptions} options - Configuration options for the logger
   */
  constructor(options: LoggerOptions = {}) {
    // Initialize basic configuration
    this.verbose = options.verbose ?? false;
    this.useColors = options.useColors ?? true;
    this.strictLevels = options.strictLevels ?? false;

    // Set metadata
    this.id = options.id;
    this.tags = options.tags;
    this.context = options.context;

    // Initialize the theme manager
    this.themeManager = new ThemeManager();

    // Process theme option
    if (options.theme) {
      if (typeof options.theme === 'string') {
        // Handle string theme name by loading from ThemeManager
        const loadedTheme = this.themeManager.getTheme(options.theme);
        if (Object.keys(loadedTheme).length === 0) {
          console.warn(`[Logger] Theme '${options.theme}' not found, using default theme`);
        }
        this.theme = loadedTheme;
      } else if (typeof options.theme === 'object' && !Array.isArray(options.theme)) {
        // Handle direct theme object
        this.theme = options.theme as Record<string, ColorName[]>;
      } else {
        throw new Error(`[Logger] Invalid theme format: ${options.theme}`);
      }
    }
  }

  /**
   * Enables or disables verbose mode, which controls whether debug-level messages are displayed.
   *
   * @param {boolean} enabled - Set to true to enable verbose mode (show debug messages)
   */
  public setVerbose(enabled: boolean): void {
    this.verbose = enabled;
  }

  /**
   * Enables or disables colored output.
   * When disabled, all log messages will be output without ANSI color codes or styling.
   *
   * @param {boolean} enabled - Set to true to enable colored output
   */
  public setColorsEnabled(enabled: boolean): void {
    this.useColors = enabled;
  }

  /**
   * Applies a new theme to the logger.
   *
   * @param {Record<string, ColorName[]> | string} theme - Either a theme name (string) that will be loaded from
   *                                                       the ThemeManager, or a direct theme configuration object
   */
  public setTheme(theme: Record<string, ColorName[]> | string): void {
    if (typeof theme === 'string') {
      // Load theme by name from the ThemeManager
      const loadedTheme = this.themeManager.getTheme(theme);
      if (Object.keys(loadedTheme).length === 0) {
        console.warn(`[Logger] Theme '${theme}' not found, using default theme`);
      }
      this.theme = loadedTheme;
    } else {
      // Use direct theme object
      this.theme = theme;
    }
  }

  /**
   * Main entry point for logging messages with a specified log level.
   * This method routes messages to the appropriate level-specific method.
   *
   * @param {string} msg - The message to log
   * @param {LogLevel} level - The log level to use (defaults to 'info')
   */
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

  /**
   * Logs an informational message.
   * @abstract
   * @param {string} msg - The message to log
   */
  public abstract info(msg: string): void;

  /**
   * Logs a warning message.
   * @abstract
   * @param {string} msg - The message to log
   */
  public abstract warn(msg: string): void;

  /**
   * Logs an error message.
   * @abstract
   * @param {string} msg - The message to log
   */
  public abstract error(msg: string): void;

  /**
   * Logs a debug message. Only visible when verbose mode is enabled.
   * @abstract
   * @param {string} msg - The message to log
   */
  public abstract debug(msg: string): void;

  /**
   * Logs a success message.
   * @abstract
   * @param {string} msg - The message to log
   */
  public abstract success(msg: string): void;

  /**
   * Logs a message with custom styling and an optional prefix.
   * @abstract
   * @param {string} msg - The message to log
   * @param {ColorName[]} colors - Array of color/style names to apply
   * @param {string} [prefix] - Optional prefix to add before the message
   */
  public abstract custom(msg: string, colors: ColorName[], prefix?: string): void;

  /**
   * Logs a message using a predefined style preset.
   * @abstract
   * @param {string} msg - The message to log
   * @param {StylePreset} preset - The name of the style preset to use
   */
  public abstract styled(msg: string, preset: StylePreset): void;

  /**
   * Creates a styled header section with the specified title.
   * @abstract
   * @param {string} title - The title text for the header
   * @param {ColorName[]} [colors] - Optional array of color/style names to apply
   */
  public abstract header(title: string, colors?: ColorName[]): void;

  /**
   * Displays a table with the provided data.
   * @abstract
   * @param {Record<string, any>[]} data - Array of objects to display as a table
   * @param {ColorName[]} [headerColor] - Optional array of color/style names for the header row
   */
  public abstract table(data: Record<string, any>[], headerColor?: ColorName[]): void;

  /**
   * Displays a progress bar with the specified completion percentage.
   * @abstract
   * @param {number} progress - Percentage of completion (0-100)
   * @param {number} [length] - Optional length of the progress bar in characters
   * @param {string} [completeChar] - Optional character to use for completed portions
   * @param {string} [incompleteChar] - Optional character to use for incomplete portions
   */
  public abstract progressBar(
    progress: number,
    length?: number,
    completeChar?: string,
    incompleteChar?: string
  ): void;

  /**
   * Displays a link with optional description text.
   * In terminal environments, this may show the URL with special formatting.
   * In browser environments, this may create a clickable link.
   * @abstract
   * @param {string} url - The URL to link to
   * @param {string} [description] - Optional description text for the link
   */
  public abstract link(url: string, description?: string): void;

  /**
   * Returns a function that applies the specified colors to text.
   * @abstract
   * @param {...ColorName[]} colors - Color/style names to apply
   * @returns {Function} A function that takes a string and returns the styled string
   */
  public abstract color(...colors: ColorName[]): (text: string) => string;

  /**
   * Colorizes specific parts of a message according to a color mapping.
   * @abstract
   * @param {string} message - The message containing parts to colorize
   * @param {Record<string, ColorName[]>} colorMap - Map of substrings to color arrays
   * @returns {string} The message with colorized parts
   */
  public abstract colorParts?(message: string, colorMap: Record<string, ColorName[]>): string;

  /**
   * Displays a visual separator line for organizing log output.
   * @abstract
   * @param {string} [char] - Optional character to use for the separator (default: '-')
   * @param {number} [length] - Optional length of the separator line (default: 60)
   * @param {ColorName[]} [colors] - Optional array of color/style names to apply
   */
  /**
   * Print a separator line
   * @param char Character to use for the separator
   * @param length Length of the separator line
   */
  public abstract separator(char?: string, length?: number): void;
}
