import * as fs from 'fs';
import * as path from 'path';

import { ColorName, StylePreset, COLORS, PRESETS, LoggerOptions } from './types';
import { isStyleSupported, getFallbackStyle } from './utils/terminal';

/**
 * Advanced logger with color support and cross-platform capabilities
 */
export class Logger {
  private logFile: string | null;
  private verbose: boolean;
  private writeToDisk: boolean;
  private useColors: boolean;
  private logDir: string;
  private logRetentionDays: number;

  /**
   * Create a new logger instance
   * 
   * @param options Logger configuration options
   * @param options.verbose Enable verbose logging (default: false or LOG_VERBOSE env var)
   * @param options.writeToDisk Write logs to disk (default: false or LOG_TO_FILE env var)
   * @param options.useColors Enable terminal colors (default: true)
   * @param options.logDir Directory to store log files (default: './logs')
   * @param options.logRetentionDays Number of days to keep logs (default: 30)
   */
  constructor(
    optionsOrVerbose?: LoggerOptions | boolean,
    writeToDisk?: boolean,
    useColors?: boolean
  ) {
    // Handle both constructor overloads
    let options: LoggerOptions = {};
    
    if (typeof optionsOrVerbose === 'boolean') {
      // Old constructor style
      options = {
        verbose: optionsOrVerbose,
        writeToDisk,
        useColors
      };
    } else if (optionsOrVerbose) {
      // New object-based constructor
      options = optionsOrVerbose;
    }
    
    // Apply defaults and environment variables
    this.verbose = options.verbose ?? (process.env.LOG_VERBOSE === 'true') ?? false;
    this.writeToDisk = options.writeToDisk ?? (process.env.LOG_TO_FILE === 'true') ?? false;
    this.useColors = options.useColors ?? true;
    this.logRetentionDays = options.logRetentionDays ?? 30;
    
    // Resolve log directory path
    this.logDir = this.resolveLogDir(options.logDir ?? 'logs');
    this.logFile = null;

    if (this.writeToDisk) {
      this.initLogFile();
    }
  }


  /**
   * Normalize path separators to forward slashes
   * 
   * @param pathStr Path string to normalize
   * @returns Normalized path with forward slashes
   */
  private normalizePath(pathStr: string): string {
    return pathStr.replace(/\\/g, '/');
  }

  /**
   * Resolve log directory path (handling both relative and absolute paths)
   * 
   * @param dirPath Path to log directory (relative or absolute)
   * @returns Absolute path to log directory
   */
  private resolveLogDir(dirPath: string): string {
    // If it's an absolute path, use it directly
    if (path.isAbsolute(dirPath)) {
      return dirPath;
    }
    
    // Otherwise resolve relative to current working directory
    return path.resolve(process.cwd(), dirPath);
  }
  
  /**
   * Initialize log file and directory
   */
  protected initLogFile(): void {
    try {
      // Create log directory if it doesn't exist
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      
      // Clean up old logs
      this.cleanupOldLogs();

      // Create new log file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.logFile = path.join(this.logDir, `run-${timestamp}.log`);
      fs.writeFileSync(this.logFile, `[LOG START] ${new Date().toLocaleString()}\n`);
    } catch (err) {
      console.error(`Failed to initialize log file: ${err}`);
      this.logFile = null;
      this.writeToDisk = false; // Disable writing to disk on failure
    }
  }

  /**
   * Clean up log files older than the retention period
   */
  private cleanupOldLogs(): void {
    try {
      if (!fs.existsSync(this.logDir)) return;
      
      const now = Date.now();
      const cutoff = now - this.logRetentionDays * 24 * 60 * 60 * 1000;

      fs.readdirSync(this.logDir).forEach(file => {
        try {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < cutoff) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          // Skip files we can't process but don't halt the entire cleanup
        }
      });
    } catch (err) {
      console.error(`Failed to clean up old logs: ${err}`);
    }
  }

  /**
   * Clean up a directory recursively
   * 
   * @param dir Directory to clean
   */
  public static cleanupDirectory(dir: string): void {
    if (fs.existsSync(dir)) {
      try {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          try {
            const stat = fs.lstatSync(filePath);
            if (stat && typeof stat.isDirectory === 'function' && stat.isDirectory()) {
              Logger.cleanupDirectory(filePath);
            } else {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            // Skip files we can't process
          }
        });
        
        // Remove the directory itself
        try {
          fs.rmdirSync(dir);
        } catch (err) {
          // Ignore errors when removing directories
        }
      } catch (err) {
        // Handle overall directory reading failures
        console.error(`Failed to clean up directory ${dir}: ${err}`);
      }
    }
  }

  /**
   * Normalize line endings in a string (CRLF to LF)
   * Useful for consistent string comparison in tests
   * 
   * @param str String to normalize
   * @returns String with normalized line endings
   */
  public static normalizeLineEndings(str: string): string {
    return str.replace(/\r\n/g, '\n');
  }

  /**
   * Check if a string looks like a URL or file path
   * Works with both Windows and Unix paths
   * 
   * @param text Text to check
   * @returns True if the text looks like a URL or file path
   */
  public static isLinkLike(text: string): boolean {
    // Handle absolute paths (Windows and Unix) and relative paths
    const platformIndependentPathRegex = /^(https?:\/\/|file:\/\/|www\.|\.\/|\.\.\/|\/|\w:\\).+$/i;
    
    // File extensions that usually indicate a file path
    const fileRegex = /\.(js|ts|jsx|tsx|html|css|json|md|txt|log|svg|png|jpg|jpeg)$/i;
    
    return platformIndependentPathRegex.test(text) || fileRegex.test(text);
  }

  /**
   * Apply color/style to a message with terminal capability awareness
   * 
   * @param message The message to colorize
   * @param colors Array of color/style names to apply
   * @returns Colorized message string
   */
  private colorize(message: string, colors: ColorName[]): string {
    if (!this.useColors) return message;
    
    // Special handling for links - don't break them up with color codes
    if (Logger.isLinkLike(message)) {
      // Filter out unsupported styles and get fallbacks for others
      const supportedColors = colors.map(color => {
        // Check if it's a style that might not be supported
        if (['bold', 'dim', 'italic', 'underline', 'blink', 'reverse', 'hidden', 'strikethrough'].includes(color)) {
          return isStyleSupported(color) ? color : getFallbackStyle(color) as ColorName;
        }
        return color; // Colors are always supported
      });
      
      const colorCodes = supportedColors.map(color => COLORS[color]).join('');
      return `${colorCodes}${message}${COLORS.reset}`;
    }
    
    // Regular color application with terminal support awareness
    // Replace unsupported styles with fallbacks
    const supportedColors = colors.map(color => {
      // Check if it's a style that might not be supported
      if (['bold', 'dim', 'italic', 'underline', 'blink', 'reverse', 'hidden', 'strikethrough'].includes(color)) {
        return isStyleSupported(color) ? color : getFallbackStyle(color) as ColorName;
      }
      return color; // Colors are always supported
    });
    
    const colorCodes = supportedColors.map(color => COLORS[color]).join('');
    return `${colorCodes}${message}${COLORS.reset}`;
  }

  /**
   * Apply a preset style to a message with terminal capability awareness
   * 
   * @param message The message to style
   * @param preset The preset style to apply
   * @returns Styled message string
   */
  private applyPreset(message: string, preset: StylePreset): string {
    if (!this.useColors) return message;
    
    // Get preset colors and filter out empty codes
    const presetColors = PRESETS[preset];
    const supportedColors = presetColors.filter(code => code !== ''); // Filter empty codes
    
    return `${supportedColors.join('')}${message}${COLORS.reset}`;
  }

 /**
   * Log a message at a specified level (default: 'info')
   *
   * @param msg The message to log
   * @param level Optional log level ('info', 'warn', 'error', 'debug', 'success')
   */
  log(msg: string, level: 'info' | 'warn' | 'error' | 'debug' | 'success' = 'info'): void {
    switch (level) {
      case 'info':
        this.info(msg);
        break;
      case 'warn':
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
        this.info(msg);
        break;
    }
  }

  /**
   * Alias for info-level logging
   * @param msg Info message
   */
  info(msg: string): void {
    console.log(`${this.colorize('[INFO]', ['cyan', 'bold'])} ${this.preserveLinks(msg)}`);
    if (this.logFile) this.appendToFile(`[INFO] ${msg}`);
  }

  /**
   * Log a success message
   * 
   * @param msg The message to log
   */
  success(msg: string): void {
    console.log(`${this.colorize('[SUCCESS]', ['green', 'bold'])} ${this.preserveLinks(msg)}`);
    if (this.logFile) this.appendToFile(`[SUCCESS] ${msg}`);
  }

  /**
   * Log a warning message
   * 
   * @param msg The message to log
   */
  warn(msg: string): void {
    console.warn(`${this.colorize('[WARN]', ['yellow', 'bold'])} ${this.preserveLinks(msg)}`);
    if (this.logFile) this.appendToFile(`[WARN] ${msg}`);
  }

  /**
   * Log an error message
   * 
   * @param msg The message to log
   */
  error(msg: string): void {
    console.error(`${this.colorize('[ERROR]', ['brightRed', 'bold'])} ${this.preserveLinks(msg)}`);
    if (this.logFile) this.appendToFile(`[ERROR] ${msg}`);
  }

  /**
   * Log a debug message (only shown when verbose is true)
   * 
   * @param msg The message to log
   */
  debug(msg: string): void {
    if (this.verbose) {
      console.log(`${this.colorize('[DEBUG]', ['gray', 'italic'])} ${this.preserveLinks(msg)}`);
    }
    if (this.logFile) this.appendToFile(`[DEBUG] ${msg}`);
  }

  /**
   * Log a message with custom colors
   * 
   * @param msg The message to log
   * @param colors Array of color/style names to apply to the prefix
   * @param prefix The prefix to use (default: 'LOG')
   */
  custom(msg: string, colors: ColorName[] = ['white'], prefix: string = 'LOG'): void {
    console.log(`${this.colorize(`[${prefix}]`, colors)} ${this.preserveLinks(msg)}`);
    if (this.logFile) this.appendToFile(`[${prefix}] ${msg}`);
  }

  /**
   * Log a message with a preset style
   * 
   * @param msg The message to log
   * @param preset The preset style to apply
   */
  styled(msg: string, preset: StylePreset): void {
    const prefixText = `[${preset.toUpperCase()}]`;
    const styledPrefix = this.applyPreset(prefixText, preset);
    console.log(`${styledPrefix} ${this.preserveLinks(msg)}`);
    if (this.logFile) this.appendToFile(`${prefixText} ${msg}`);
  }

    /**
   * Preserve links when colorizing text by detecting and handling URL/file paths specially
   * Also extracts URLs from markdown links [title](url) format
   * 
   * @param message The message that might contain links
   * @returns Processed message with preserved links
   */
    private preserveLinks(message: string): string {
      // Special case: if colors are disabled, just handle markdown extraction
      if (!this.useColors) {
        // Extract URLs from markdown links
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        return message.replace(markdownLinkRegex, (match, text, url) => {
          return url;
        });
      }
      
      // First, extract URLs from markdown links
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      message = message.replace(markdownLinkRegex, (match, text, url) => {
        return url;
      });
      
      // Cross-platform path regex covering Unix, Windows, and relative paths
      const linkRegex = /(https?:\/\/[^\s]+|file:\/\/[^\s]+|\/[\w\/\.]+\.(js|ts|jsx|tsx|html|css|json|md|txt|log)|\.\/[\w\/\.]+\.(js|ts|jsx|tsx|html|css|json|md|txt|log)|\w:\\[\w\\\.]+\.(js|ts|jsx|tsx|html|css|json|md|txt|log))/gi;
      
      // Replace links with colorized versions
      return message.replace(linkRegex, (match) => {
        return this.colorize(match, ['brightCyan', 'underline']);
      });
  }

  /**
   * Colorize part of a message with specified colors, preserving link integrity
   * 
   * @param message The full message
   * @param colorParts Object with text parts as keys and color arrays as values
   * @returns The colorized message
   */
  colorParts(message: string, colorParts: Record<string, ColorName[]>): string {
    if (!this.useColors) return message;
    
    let result = message;
    
    // Sort parts by length (longest first) to avoid partial replacements
    const parts = Object.keys(colorParts).sort((a, b) => b.length - a.length);
    
    for (const part of parts) {
      const colors = colorParts[part];
      // Preserve link integrity for URLs and file paths
      if (Logger.isLinkLike(part)) {
        result = result.replace(part, this.colorize(part, colors));
      } else {
        // For non-links, do a simple replacement
        result = result.replace(part, this.colorize(part, colors));
      }
    }
    
    return result;
  }

  /**
   * Print a section header
   * 
   * @param title The header title
   * @param colors Optional custom colors
   */
  header(title: string, colors: ColorName[] = ['brightWhite', 'bgBlue', 'bold']): void {
    const padding = Math.max(0, 80 - title.length - 4);
    const paddedTitle = ` ${title} ${' '.repeat(padding)}`;
    console.log(this.colorize(paddedTitle, colors));
    if (this.logFile) this.appendToFile(`=== ${title} ${'='.repeat(padding)} ===`);
  }

  /**
   * Print a table from an array of objects
   * 
   * @param data Array of objects to display
   * @param headerColor Optional color for the header row
   */
  table(data: Record<string, any>[], headerColor: ColorName[] = ['brightWhite', 'bold']): void {
    if (data.length === 0) return;
    
    // Get all keys from the data
    const keys = Object.keys(data[0]);
    
    // Calculate column widths
    const columnWidths: Record<string, number> = {};
    keys.forEach(key => {
      columnWidths[key] = key.length;
      data.forEach(row => {
        const cellContent = String(row[key] ?? '');
        columnWidths[key] = Math.max(columnWidths[key], cellContent.length);
      });
    });
    
    // Create header row
    const headerRow = keys.map(key => key.padEnd(columnWidths[key])).join(' | ');
    const separator = keys.map(key => '-'.repeat(columnWidths[key])).join('-+-');
    
    // Print header
    console.log(this.colorize(headerRow, headerColor));
    console.log(separator);
    
    // Print data rows
    data.forEach(row => {
      const rowStr = keys.map(key => {
        const cell = String(row[key] ?? '').padEnd(columnWidths[key]);
        // Check if cell contains a link-like structure
        if (Logger.isLinkLike(String(row[key] ?? ''))) {
          return this.colorize(cell, ['brightCyan', 'underline']);
        }
        return cell;
      }).join(' | ');
      
      console.log(rowStr);
    });
    
    // Also log to file if enabled
    if (this.logFile) {
      this.appendToFile(headerRow);
      this.appendToFile(separator);
      data.forEach(row => {
        const rowStr = keys.map(key => 
          String(row[key] ?? '').padEnd(columnWidths[key])
        ).join(' | ');
        this.appendToFile(rowStr);
      });
    }
  }

  /**
   * Print a progress bar
   * 
   * @param progress Current progress (0-100)
   * @param length Length of the progress bar
   * @param completeChar Character for completed portion
   * @param incompleteChar Character for incomplete portion
   */
  progressBar(
    progress: number, 
    length: number = 20, 
    completeChar: string = '█', 
    incompleteChar: string = '░'
  ): void {
    const percent = Math.min(100, Math.max(0, progress));
    const filledLength = Math.round(length * percent / 100);
    const completed = completeChar.repeat(filledLength);
    const incomplete = incompleteChar.repeat(length - filledLength);
    
    const bar = this.colorize(completed, ['green']) + 
                this.colorize(incomplete, ['gray']);
    
    const percentText = this.colorize(`${percent.toFixed(1)}%`, ['bold']);
    process.stdout.write(`\r${bar} ${percentText}`);
    
    if (percent >= 100) {
      process.stdout.write('\n');
      if (this.logFile) {
        this.appendToFile(`[PROGRESS] 100% complete`);
      }
    }
  }

  /**
   * Log a clickable link that preserves its integrity in the terminal
   * 
   * @param url The URL or file path to link
   * @param description Optional description text
   */
  link(url: string, description?: string): void {
    // Handle both Unix and Windows style paths
    const normalizedUrl = this.normalizePath(url);
    const displayText = description || normalizedUrl;
    
    console.log(`${this.colorize(displayText, ['brightCyan', 'underline'])}: ${this.colorize(normalizedUrl, ['brightCyan', 'underline'])}`);
    if (this.logFile) {
      this.appendToFile(`${displayText}: ${normalizedUrl}`);
    }
  }

  /**
   * Append to the log file
   * 
   * @param content Content to append
   */
  private appendToFile(content: string): void {
    try {
      if (!this.logFile) return;
      fs.appendFileSync(this.logFile, `${content}\n`);
    } catch (err) {
      // Use console.error directly to avoid recursion
      console.error(`${this.colorize('[logger]', ['red'])} Failed to write to log file:`, err);
      
      // In case of persistent errors, disable file logging to prevent further issues
      if (this.logFile && !fs.existsSync(path.dirname(this.logFile))) {
        this.writeToDisk = false;
        this.logFile = null;
      }
    }
  }

  /**
   * Get the path to the current log file
   * 
   * @returns Path to the log file or null
   */
  getPath(): string | null {
    return this.logFile;
  }
  
  /**
   * Get the logger's configured log directory
   * 
   * @returns Path to the log directory
   */
  getLogDir(): string {
    return this.logDir;
  }
  
  /**
   * Get the configured log retention period in days
   * 
   * @returns Number of days logs are kept
   */
  getLogRetentionDays(): number {
    return this.logRetentionDays;
  }
  
  /**
   * Enable or disable colors
   * 
   * @param enabled Whether colors should be enabled
   */
  setColorsEnabled(enabled: boolean): void {
    this.useColors = enabled;
  }
  
  /**
   * Create a color function that can be used directly
   * 
   * @param colors Array of colors to apply
   * @returns A function that colorizes text
   */
  color(...colors: ColorName[]): (text: string) => string {
    return (text: string) => this.colorize(text, colors);
  }
  
  /**
   * Set a new log directory and optionally reinitialize the log file
   * 
   * @param dirPath New log directory path (relative or absolute)
   * @param reinitialize Whether to reinitialize the log file
   */
  setLogDir(dirPath: string, reinitialize: boolean = false): void {
    this.logDir = this.resolveLogDir(dirPath);
    
    if (reinitialize && this.writeToDisk) {
      this.initLogFile();
    }
  }
  
  /**
   * Set the log retention period
   * 
   * @param days Number of days to keep logs
   * @param cleanNow Whether to clean old logs immediately
   */
  setLogRetentionDays(days: number, cleanNow: boolean = false): void {
    this.logRetentionDays = Math.max(1, days); // Minimum 1 day
    
    if (cleanNow) {
      this.cleanupOldLogs();
    }
  }
  
  /**
   * Enable or disable file logging
   * 
   * @param enabled Whether to write logs to file
   */
  setFileLogging(enabled: boolean): void {
    this.writeToDisk = enabled;
    
    if (enabled && !this.logFile) {
      this.initLogFile();
    }
  }
  
  /**
   * Enable or disable verbose mode
   * 
   * @param enabled Whether to enable verbose mode
   */
  setVerbose(enabled: boolean): void {
    this.verbose = enabled;
  }
}