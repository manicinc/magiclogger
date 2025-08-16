// File: src/core/LoggerBase.ts

import { Emitter as EventEmitter } from './events-compat';
import type { LoggerOptions, LogLevel } from '../types/logger';
import type { ColorName } from '../types/colors';
import type { StylePreset } from '../types/preset';
import { PRESETS } from '../constants/preset';
import { isBrowserEnvironment } from '../utils/environment';
import { DEFAULT_THEME } from '../constants/themes';
import { getTheme as getNamedTheme } from '../theme';

/**
 * Abstract base class for all logger implementations.
 *
 * This class provides core functionality shared between Node.js and Browser loggers:
 * - Theme management
 * - Color and style handling
 * - Preset management
 * - Event emission
 * - Base configuration
 *
 * @abstract
 * @class LoggerBase
 * @extends {EventEmitter}
 *
 * @example
 * ```typescript
 * class CustomLogger extends LoggerBase {
 *   public info(msg: string): void {
 *     this.print('INFO', msg, 'info');
 *   }
 *
 *   protected print(level: string, msg: string, preset: StylePreset): void {
 *     // Custom implementation
 *   }
 * }
 * ```
 */
export abstract class LoggerBase extends EventEmitter {
  /**
   * Logger instance ID.
   * @protected
   */
  protected id?: string;

  /**
   * Global tags for all logs.
   * @protected
   */
  protected tags?: string[];

  /**
   * Global context data.
   * @protected
   */
  protected context?: Record<string, unknown>;

  /**
   * Whether verbose (debug) mode is enabled.
   * @protected
   */
  protected verbose: boolean;

  /**
   * Whether to use colors in output.
   * @protected
   */
  protected useColors: boolean;

  /**
   * Optional mapping of tags to theme names for brand-based themes.
   * If set, when a logger has tags and no explicit object theme was provided,
   * the first matching tag in this map will select the theme.
   */
  protected themeByTag?: Record<string, string>;

  /**
   * Whether to enforce strict log levels.
   * @protected
   */
  protected strictLevels: boolean;

  /**
   * Current theme configuration.
   * @protected
   */
  protected theme: Record<string, ColorName[]>;

  /**
   * Custom presets added by user.
   * @protected
   */
  protected customPresets: Record<string, ColorName[]> = {};

  /**
   * Performance tracking data.
   * @protected
   */
  protected performanceData: Map<
    string,
    {
      count: number;
      totalTime: number;
      minTime: number;
      maxTime: number;
    }
  > = new Map();

  /**
   * Log level hierarchy for filtering.
   * @protected
   */
  protected readonly levelHierarchy: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    success: 1, // Same as info
  };

  /**
   * Maximum listeners to prevent memory leaks.
   * @protected
   */
  protected readonly maxListeners = 100;

  /**
   * Creates a new LoggerBase instance.
   *
   * @param {LoggerOptions} options - Logger configuration
   */
  constructor(options: LoggerOptions = {}) {
    super();

    this.id = options.id;
    this.tags = options.tags;
    this.context = options.context;
    this.verbose = options.verbose || false;
    this.useColors = options.useColors !== false;
    this.strictLevels = options.strictLevels || false;

    // Stash themeByTag mapping
    this.themeByTag = options.themeByTag;

    // Initialize theme. Prefer explicit object theme; next explicit string; else try themeByTag first; fallback default.
    if (typeof options.theme === 'object' && options.theme) {
      this.theme = { ...DEFAULT_THEME, ...options.theme };
    } else {
      let initialTheme: Record<string, ColorName[]> | undefined;
      // Only attempt themeByTag if no explicit object theme provided
      if (!options.theme || typeof options.theme === 'string') {
        const tagMap = options.themeByTag;
        const tags = options.tags || [];
        if (tagMap && tags && tags.length > 0) {
          for (const t of tags) {
            const mapped = tagMap[t];
            if (mapped) {
              initialTheme = this.loadTheme(mapped);
              break;
            }
          }
        }
        // If no explicit mapping matched, try using a theme with the same name as any tag
        if (!initialTheme && tags && tags.length > 0) {
          for (const t of tags) {
            // Use loadTheme to allow registry lookup with built-in fallbacks
            const candidate = this.loadTheme(t);
            if (candidate) {
              initialTheme = candidate;
              break;
            }
          }
        }
      }

      if (initialTheme) {
        this.theme = { ...DEFAULT_THEME, ...initialTheme };
      } else if (typeof options.theme === 'string') {
        this.theme = this.loadTheme(options.theme);
      } else {
        this.theme = { ...DEFAULT_THEME };
      }
    }

    // Set max listeners
    this.setMaxListeners(this.maxListeners);

    // Emit ready event
    if (isBrowserEnvironment()) {
      // Use setTimeout in browser environments
      setTimeout(() => {
        this.emit('ready', { id: this.id });
      }, 0);
    } else if (typeof process !== 'undefined' && process.nextTick) {
      // Use process.nextTick in Node.js environments
      process.nextTick(() => {
        this.emit('ready', { id: this.id });
      });
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        this.emit('ready', { id: this.id });
      }, 0);
    }
  }

  /**
   * Abstract method for logging info messages.
   * @abstract
   */
  public abstract info(msg: string): void;

  /**
   * Abstract method for logging warning messages.
   * @abstract
   */
  public abstract warn(msg: string): void;

  /**
   * Abstract method for logging error messages.
   * @abstract
   */
  public abstract error(msg: string): void;

  /**
   * Abstract method for logging debug messages.
   * @abstract
   */
  public abstract debug(msg: string): void;

  /**
   * Abstract method for logging success messages.
   * @abstract
   */
  public abstract success(msg: string): void;

  /**
   * Abstract method for custom logging.
   * @abstract
   */
  public abstract custom(msg: string, colors: ColorName[], prefix: string): void;

  /**
   * Abstract method for styled logging.
   * @abstract
   */
  public abstract styled(msg: string, preset: StylePreset): void;

  /**
   * Abstract method for headers.
   * @abstract
   */
  public abstract header(title: string, colors: ColorName[]): void;

  /**
   * Abstract method for tables.
   * @abstract
   */
  public abstract table(data: Record<string, unknown>[], headerColor: ColorName[]): void;

  /**
   * Abstract method for progress bars.
   * @abstract
   */
  public abstract progressBar(
    progress: number,
    length: number,
    completeChar: string,
    incompleteChar: string,
    clear?: boolean
  ): void;

  /**
   * Abstract method for links.
   * @abstract
   */
  public abstract link(url: string, description?: string): void;

  /**
   * Abstract method for color functions.
   * @abstract
   */
  public abstract color(...colors: ColorName[]): (text: string) => string;

  /**
   * Abstract method for coloring parts.
   * @abstract
   */
  public abstract colorParts(message: string, colorMap: Record<string, ColorName[]>): string;

  /**
   * Abstract method for separators.
   * @abstract
   */
  public abstract separator(char: string, length: number): void;

  /**
   * Log a message at any level.
   *
   * @param {string} msg - Message to log
   * @param {LogLevel} level - Log level
   */
  public log(msg: string, level: LogLevel = 'info'): void {
    // Check if level is valid in strict mode
    if (this.strictLevels && !this.isValidLevel(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }

    // Track performance
    const startTime = isBrowserEnvironment()
      ? BigInt(Math.floor(performance.now() * 1000000)) // Convert ms to ns for consistency
      : typeof process !== 'undefined' && process.hrtime?.bigint
      ? process.hrtime.bigint()
      : BigInt(Date.now() * 1000000);

    // Call appropriate method based on level
    switch (level.toLowerCase()) {
      case 'info':
        this.info(msg);
        break;
      case 'warn':
      case 'warning':
        this.warn(msg);
        break;
      case 'error':
        this.error(msg);
        break;
      case 'debug':
        this.debug(msg);
        break;
      case 'success':
        this.success(msg);
        break;
      default:
        // Use custom for non-standard levels
        this.custom(msg, ['white'], level.toUpperCase());
    }

    // Track performance
    const endTime = isBrowserEnvironment()
      ? BigInt(Math.floor(performance.now() * 1000000)) // Convert ms to ns for consistency
      : typeof process !== 'undefined' && process.hrtime?.bigint
      ? process.hrtime.bigint()
      : BigInt(Date.now() * 1000000);
    this.trackPerformance(level, Number(endTime - startTime) / 1000000); // Convert to ms

    // Emit log event
    this.emit('log', {
      level,
      message: msg,
      timestamp: new Date(),
      id: this.id,
      tags: this.tags,
      context: this.context,
    });
  }

  /**
   * Set verbose mode.
   *
   * @param {boolean} enabled - Whether to enable verbose mode
   */
  public setVerbose(enabled: boolean): void {
    this.verbose = enabled;
    this.emit('verboseChanged', enabled);
  }

  /**
   * Get verbose mode status.
   *
   * @returns {boolean} Whether verbose mode is enabled
   */
  public isVerbose(): boolean {
    return this.verbose;
  }

  /**
   * Enable or disable colors.
   *
   * @param {boolean} enabled - Whether to enable colors
   */
  public setColorsEnabled(enabled: boolean): void {
    this.useColors = enabled;
    this.emit('colorsChanged', enabled);
  }

  /**
   * Check if colors are enabled.
   *
   * @returns {boolean} Whether colors are enabled
   */
  public areColorsEnabled(): boolean {
    return this.useColors;
  }

  /**
   * Set or update the theme.
   *
   * @param {Record<string, ColorName[]>} theme - Theme definition
   */
  public setTheme(theme: Record<string, ColorName[]>): void {
    this.theme = { ...this.theme, ...theme };
    this.emit('themeChanged', this.theme);
  }

  /**
   * Get the current theme.
   *
   * @returns {Record<string, ColorName[]>} Current theme
   */
  public getTheme(): Record<string, ColorName[]> {
    return { ...this.theme };
  }

  /**
   * Add a custom preset.
   *
   * @param {string} name - Preset name
   * @param {ColorName[]} colors - Colors for the preset
   */
  public addPreset(name: string, colors: ColorName[]): void {
    this.customPresets[name] = colors;
    this.emit('presetAdded', { name, colors });
  }

  /**
   * Remove a custom preset.
   *
   * @param {string} name - Preset name to remove
   */
  public removePreset(name: string): void {
    if (this.customPresets[name]) {
      delete this.customPresets[name];
      this.emit('presetRemoved', name);
    }
  }

  /**
   * Get colors for a preset.
   *
   * @param {StylePreset | string} preset - Preset name
   * @returns {ColorName[]} Colors for the preset
   * @protected
   */
  protected getPresetColors = (preset: StylePreset | string): ColorName[] => {
    // Check custom presets first
    if (this.customPresets[preset]) {
      return this.customPresets[preset];
    }

    // Check built-in presets
    if (PRESETS[preset as keyof typeof PRESETS]) {
      return PRESETS[preset as keyof typeof PRESETS];
    }

    // Check theme
    if (this.theme[preset]) {
      return this.theme[preset];
    }

    // Default fallback
    return ['white'];
  };

  /**
   * Load a named theme.
   *
   * @param {string} themeName - Name of the theme to load
   * @returns {Record<string, ColorName[]>} Theme definition
   * @protected
   */
  protected loadTheme(themeName: string): Record<string, ColorName[]> {
    // Try to resolve from theme registry first
    const named = getNamedTheme(themeName);
    if (named && typeof named === 'object') {
      return { ...DEFAULT_THEME, ...(named as Record<string, ColorName[]>) };
    }

    // Fallback to built-in variants
    switch (themeName.toLowerCase()) {
      case 'dark':
        return {
          ...DEFAULT_THEME,
          info: ['brightCyan'],
          warn: ['brightYellow'],
          error: ['brightRed'],
          debug: ['gray'],
          success: ['brightGreen'],
        };

      case 'light':
        return {
          ...DEFAULT_THEME,
          info: ['blue'],
          warn: ['yellow'],
          error: ['red'],
          debug: ['gray'],
          success: ['green'],
        };

      case 'minimal':
        return {
          ...DEFAULT_THEME,
          info: ['white'],
          warn: ['white'],
          error: ['white'],
          debug: ['white'],
          success: ['white'],
        };

      default:
        return { ...DEFAULT_THEME };
    }
  }

  /**
   * Check if a log level is valid.
   *
   * @param {string} level - Level to check
   * @returns {boolean} Whether level is valid
   * @protected
   */
  protected isValidLevel(level: string): boolean {
    const standardLevels = ['debug', 'info', 'warn', 'warning', 'error', 'success'];
    return standardLevels.includes(level.toLowerCase());
  }

  /**
   * Track performance metrics.
   *
   * @param {string} level - Log level
   * @param {number} time - Time in milliseconds
   * @protected
   */
  protected trackPerformance(level: string, time: number): void {
    let data = this.performanceData.get(level);

    if (!data) {
      data = {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: -Infinity,
      };
      this.performanceData.set(level, data);
    }

    data.count++;
    data.totalTime += time;
    data.minTime = Math.min(data.minTime, time);
    data.maxTime = Math.max(data.maxTime, time);
  }

  /**
   * Get performance statistics.
   *
   * @returns {object} Performance stats by level
   */
  public getPerformanceStats(): Record<
    string,
    {
      count: number;
      avgTime: number;
      minTime: number;
      maxTime: number;
    }
  > {
    const stats: Record<
      string,
      {
        count: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
      }
    > = {};

    for (const [level, data] of this.performanceData) {
      stats[level] = {
        count: data.count,
        avgTime: data.totalTime / data.count,
        minTime: data.minTime,
        maxTime: data.maxTime,
      };
    }

    return stats;
  }

  /**
   * Reset performance statistics.
   */
  public resetPerformanceStats(): void {
    this.performanceData.clear();
  }

  /**
   * Update logger configuration.
   *
   * @param {Partial<LoggerOptions>} options - Options to update
   */
  public updateConfig(options: Partial<LoggerOptions>): void {
    if (options.id !== undefined) this.id = options.id;
    if (options.tags !== undefined) this.tags = options.tags;
    if (options.context !== undefined) this.context = options.context;
    if (options.verbose !== undefined) this.verbose = options.verbose;
    if (options.useColors !== undefined) this.useColors = options.useColors;
    if (options.strictLevels !== undefined) this.strictLevels = options.strictLevels;
    if (options.themeByTag !== undefined) this.themeByTag = options.themeByTag;

    if (options.theme !== undefined) {
      if (typeof options.theme === 'string') {
        this.theme = this.loadTheme(options.theme);
      } else if (options.theme) {
        this.theme = { ...this.theme, ...options.theme };
      }
    } else if (options.tags && this.themeByTag) {
      // If tags updated without explicit theme and mapping exists, try auto-select
      for (const t of options.tags) {
        const mapped = this.themeByTag[t];
        if (mapped) {
          this.theme = this.loadTheme(mapped);
          break;
        }
      }
    }

    this.emit('configUpdated', options);
  }

  /**
   * Get logger configuration.
   *
   * @returns {object} Current configuration
   */
  public getConfig(): {
    id?: string;
    tags?: string[];
    context?: Record<string, unknown>;
    verbose: boolean;
    useColors: boolean;
    strictLevels: boolean;
    theme: Record<string, ColorName[]>;
    themeByTag?: Record<string, string>;
  } {
    return {
      id: this.id,
      tags: this.tags,
      context: this.context,
      verbose: this.verbose,
      useColors: this.useColors,
      strictLevels: this.strictLevels,
      theme: { ...this.theme },
      themeByTag: this.themeByTag,
    };
  }

  /**
   * Create a child logger with merged configuration.
   *
   * @param {Partial<LoggerOptions>} _options - Child logger options (unused in base implementation)
   * @returns {LoggerBase} Child logger instance
   * @throws {Error} Always throws as this method must be implemented by concrete classes
   */
  public child(_options: Partial<LoggerOptions>): LoggerBase {
    // This is an abstract class, so we can't instantiate it directly
    // Child classes should override this method
    throw new Error('child() method must be implemented by concrete logger class');
  }

  /**
   * Enable specific log levels.
   *
   * @param {LogLevel[]} levels - Levels to enable
   */
  public enableLevels(levels: LogLevel[]): void {
    // This would integrate with filtering logic
    this.emit('levelsEnabled', levels);
  }

  /**
   * Disable specific log levels.
   *
   * @param {LogLevel[]} levels - Levels to disable
   */
  public disableLevels(levels: LogLevel[]): void {
    // This would integrate with filtering logic
    this.emit('levelsDisabled', levels);
  }

  /**
   * Set minimum log level.
   *
   * @param {LogLevel} level - Minimum level to log
   */
  public setMinLevel(level: LogLevel): void {
    // This would integrate with filtering logic
    this.emit('minLevelSet', level);
  }

  /**
   * Get event names this logger can emit.
   *
   * @returns {string[]} Event names
   */
  public getEventNames(): string[] {
    return [
      'ready',
      'log',
      'verboseChanged',
      'colorsChanged',
      'themeChanged',
      'presetAdded',
      'presetRemoved',
      'configUpdated',
      'levelsEnabled',
      'levelsDisabled',
      'minLevelSet',
      'error',
    ];
  }

  /**
   * Clean up resources.
   */
  public destroy(): void {
    this.removeAllListeners();
    this.performanceData.clear();
    this.customPresets = {};
  }
}
