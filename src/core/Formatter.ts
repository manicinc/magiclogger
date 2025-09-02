// File: src/core/Formatter.ts

import { ANSI_CODES } from '../constants/colors';
import { getFallbackStyle, isStyleSupported } from '../utils/terminal';
import type { ColorName } from '../types/colors';

/**
 * Formatter class for handling text formatting and styling.
 *
 * This class provides:
 * - ANSI color code application
 * - Link detection and preservation
 * - Text sanitization
 * - Format stripping
 * - Template formatting
 *
 * @class Formatter
 *
 * @example
 * ```typescript
 * const formatter = new Formatter(true);
 *
 * // Apply colors
 * const colored = formatter.colorize('Hello', ['red', 'bold']);
 *
 * // Format template
 * const formatted = formatter.format('User {name} logged in', { name: 'John' });
 *
 * // Strip ANSI codes
 * const plain = formatter.stripAnsi(colored);
 * ```
 */
export class Formatter {
  /**
   * Whether to apply colors.
   * @private
   */
  private useColors: boolean;

  /**
   * Regex for detecting URLs.
   * @private
   */
  private readonly urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

  /**
   * Regex for detecting file paths.
   * @private
   */
  private readonly pathRegex =
    /(?:^|[\s(])((?:\/|\\|\.\/|\.\.\/)[^\s)]+|[A-Za-z]:\\[^\s)]+)(?=[\s).]|$)/g;

  /**
   * Regex for stripping ANSI codes.
   * @private
   */
  // eslint-disable-next-line no-control-regex
  private readonly ansiRegex = /\x1b\[[0-9;]*m/g;

  /**
   * Cache for formatted strings.
   * @private
   */
  private cache: Map<string, string> = new Map();

  /**
   * Maximum cache size.
   * @private
   */
  private readonly maxCacheSize = 1000;

  /**
   * Template variable regex.
   * @private
   */
  private readonly templateRegex = /\{([^}]+)\}/g;

  /**
   * Creates a new Formatter instance.
   *
   * @param {boolean} useColors - Whether to apply colors
   */
  constructor(useColors = true) {
    this.useColors = useColors;
  }

  /**
   * Apply colors to text using ANSI codes.
   *
   * @param {string} text - Text to colorize
   * @param {ColorName[]} colors - Colors to apply
   * @returns {string} Colorized text
   */
  public colorize(text: string, colors: ColorName[]): string {
    if (!this.useColors || colors.length === 0) {
      return text;
    }

    // Check cache
    const cacheKey = `${text}:${colors.join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Build ANSI codes
    const codes: string[] = [];

    for (const color of colors) {
      let ansiCode: string | undefined;

      // First check if the style is supported in the current terminal
      if (isStyleSupported(color)) {
        ansiCode = ANSI_CODES[color];
      } else {
        // Style not supported, try fallback
        const fallback = getFallbackStyle(color);
        if (fallback !== color && ANSI_CODES[fallback as ColorName]) {
          ansiCode = ANSI_CODES[fallback as ColorName];
        }
      }

      if (ansiCode) {
        codes.push(ansiCode);
      }
    }

    // Apply codes
    const prefix = codes.join('');
    const suffix = ANSI_CODES.reset;
    const result = `${prefix}${text}${suffix}`;

    // Cache result
    this.addToCache(cacheKey, result);

    return result;
  }

  /**
   * Preserve links in text by making them clickable in terminals.
   *
   * @param {string} text - Text possibly containing links
   * @returns {string} Text with preserved links
   */
  public preserveLinks(text: unknown): string | null | undefined {
    // Preserve null/undefined exactly as-is for callers/tests expecting pass-through
    if (text === null || text === undefined) {
      return text as null | undefined;
    }

    // Normalize non-string inputs to strings
    if (typeof text !== 'string') {
      text = String(text);
    }

    if (!this.useColors) {
      return text as string;
    }

    let result = text as string;

    // First, handle markdown links: [text](url) -> extract URL and colorize it
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    result = result.replace(markdownLinkRegex, (_match, _linkText, url) => {
      return this.formatLink(url);
    });

    // Then, detect and format standalone URLs (do this after markdown to avoid conflicts)
    result = result.replace(this.urlRegex, url => {
      // Only format if it's not already formatted (i.e., doesn't contain ANSI codes)
      if (url.includes('\x1b[')) {
        return url;
      }
      return this.formatLink(url);
    });

    // Finally, detect and format file paths, but skip if already part of a URL or already colored
    if (!result.includes('\x1b[')) {
      result = result.replace(this.pathRegex, path => {
        // Only format if it looks like a real path
        if (path.includes('/') || path.includes('\\')) {
          return this.formatPath(path);
        }
        return path;
      });
    }

    return result;
  }

  /**
   * Format a URL for terminal display.
   *
   * @param {string} url - URL to format
   * @returns {string} Formatted URL
   * @private
   */
  private formatLink(url: string): string {
    // For now, always use colored fallback to ensure test compatibility
    // TODO: Re-enable OSC 8 hyperlinks when terminal detection is more reliable
    return this.colorize(url, ['brightCyan', 'underline']);
  }

  /**
   * Format a file path for terminal display.
   *
   * @param {string} path - Path to format
   * @returns {string} Formatted path
   * @private
   */
  private formatPath(path: string): string {
    // Make paths clickable in supported terminals
    const fullPath = path.startsWith('/')
      ? path
      : `${typeof process !== 'undefined' && process.cwd ? process.cwd() : '/'}/${path}`;

    if (
      typeof process !== 'undefined' &&
      process.env &&
      (process.env.TERM_PROGRAM === 'iTerm.app' || process.env.TERM === 'xterm-256color')
    ) {
      return `\x1b]8;;file://${fullPath}\x1b\\${path}\x1b]8;;\x1b\\`;
    }

    // Fallback to underlined
    return this.colorize(path, ['underline']);
  }

  /**
   * Strip ANSI codes from text.
   *
   * @param {string} text - Text with ANSI codes
   * @returns {string} Plain text
   */
  public stripAnsi(text: string): string {
    return text.replace(this.ansiRegex, '');
  }

  /**
   * Format a template string with variables.
   *
   * @param {string} template - Template string with {variables}
   * @param {Record<string, unknown>} variables - Variable values
   * @returns {string} Formatted string
   */
  public format(template: string, variables: Record<string, unknown>): string {
    return template.replace(this.templateRegex, (match, key) => {
      const value = this.getNestedValue(variables, key.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get nested value from object using dot notation.
   *
   * @param {object} obj - Object to search
   * @param {string} path - Dot-separated path
   * @returns {unknown} Value at path
   * @private
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Pad text to a specific length.
   *
   * @param {string} text - Text to pad
   * @param {number} length - Desired length
   * @param {string} char - Padding character
   * @param {string} direction - Padding direction
   * @returns {string} Padded text
   */
  public pad(
    text: string,
    length: number,
    char = ' ',
    direction: 'left' | 'right' | 'center' = 'right'
  ): string {
    const textLength = this.stripAnsi(text).length;

    if (textLength >= length) {
      // If text is already at or over the desired length,
      // we still need to ensure consistent visible length
      if (textLength > length) {
        // Text is too long, truncate it
        return this.truncate(text, length, '');
      }
      return text;
    }

    const padLength = length - textLength;

    switch (direction) {
      case 'left':
        return char.repeat(padLength) + text;

      case 'center': {
        const leftPad = Math.floor(padLength / 2);
        const rightPad = padLength - leftPad;
        return char.repeat(leftPad) + text + char.repeat(rightPad);
      }

      case 'right':
      default:
        return text + char.repeat(padLength);
    }
  }

  /**
   * Truncate text to a specific length.
   *
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add
   * @returns {string} Truncated text
   */
  public truncate(text: string, length: number, suffix = '...'): string {
    const plainText = this.stripAnsi(text);

    if (plainText.length <= length) {
      return text;
    }

    // Calculate how much we need to remove
    const targetLength = length - suffix.length;

    // If text has ANSI codes, we need to be careful
    if (text !== plainText) {
      // Complex case - preserve ANSI codes
      let result = '';
      let plainLength = 0;
      let i = 0;

      while (i < text.length && plainLength < targetLength) {
        if (text[i] === '\x1b') {
          // Found ANSI code
          const endIndex = text.indexOf('m', i);
          if (endIndex !== -1) {
            result += text.substring(i, endIndex + 1);
            i = endIndex + 1;
            continue;
          }
        }

        result += text[i];
        plainLength++;
        i++;
      }

      return result + suffix;
    }

    // Simple case - no ANSI codes
    return text.substring(0, targetLength) + suffix;
  }

  /**
   * Wrap text to a specific width.
   *
   * @param {string} text - Text to wrap
   * @param {number} width - Maximum line width
   * @param {string} indent - Indentation for wrapped lines
   * @returns {string} Wrapped text
   */
  public wrap(text: string, width: number, indent = ''): string {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testLength = this.stripAnsi(testLine).length;

      if (testLength <= width) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    // Apply indentation to wrapped lines
    return lines
      .map((line, index) => {
        return index === 0 ? line : indent + line;
      })
      .join('\n');
  }

  /**
   * Create a box around text.
   *
   * @param {string} text - Text to box
   * @param {object} options - Box options
   * @returns {string} Boxed text
   */
  public box(
    text: string,
    options: {
      padding?: number;
      margin?: number;
      borderStyle?: 'single' | 'double' | 'rounded';
      borderColor?: ColorName[];
      align?: 'left' | 'center' | 'right';
    } = {}
  ): string {
    const {
      padding = 1,
      margin = 0,
      borderStyle = 'single',
      borderColor = ['white'],
      align = 'left',
    } = options;

    // Border characters
    const borders = {
      single: {
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
        horizontal: '─',
        vertical: '│',
      },
      double: {
        topLeft: '╔',
        topRight: '╗',
        bottomLeft: '╚',
        bottomRight: '╝',
        horizontal: '═',
        vertical: '║',
      },
      rounded: {
        topLeft: '╭',
        topRight: '╮',
        bottomLeft: '╰',
        bottomRight: '╯',
        horizontal: '─',
        vertical: '│',
      },
    };

    const border = borders[borderStyle];
    const lines = text.split('\n');
    const maxLength = Math.max(...lines.map(line => this.stripAnsi(line).length));
    const innerWidth = maxLength + padding * 2;

    // Apply colors to borders
    const colorBorder = (char: string) => this.colorize(char, borderColor);

    // Create margin
    const marginSpace = ' '.repeat(margin);

    // Build box
    const result: string[] = [];

    // Top border
    result.push(
      marginSpace +
        colorBorder(border.topLeft) +
        colorBorder(border.horizontal.repeat(innerWidth)) +
        colorBorder(border.topRight)
    );

    // Padding lines
    for (let i = 0; i < padding; i++) {
      result.push(
        marginSpace +
          colorBorder(border.vertical) +
          ' '.repeat(innerWidth) +
          colorBorder(border.vertical)
      );
    }

    // Content lines
    for (const line of lines) {
      // Get the visible length of the current line
      const visibleLength = this.stripAnsi(line).length;

      // Calculate how much padding we need to reach maxLength
      const padNeeded = maxLength - visibleLength;

      // Apply padding based on alignment
      let paddedLine: string;
      if (padNeeded > 0) {
        switch (align) {
          case 'left':
            paddedLine = ' '.repeat(padNeeded) + line;
            break;
          case 'center': {
            const leftPad = Math.floor(padNeeded / 2);
            const rightPad = padNeeded - leftPad;
            paddedLine = ' '.repeat(leftPad) + line + ' '.repeat(rightPad);
            break;
          }
          case 'right':
          default:
            paddedLine = line + ' '.repeat(padNeeded);
            break;
        }
      } else if (padNeeded < 0) {
        // Line is too long, truncate it
        paddedLine = this.truncate(line, maxLength, '');
        // After truncation, ensure it's exactly maxLength visible chars
        const truncVisibleLength = this.stripAnsi(paddedLine).length;
        if (truncVisibleLength < maxLength) {
          paddedLine = paddedLine + ' '.repeat(maxLength - truncVisibleLength);
        }
      } else {
        paddedLine = line;
      }

      // Now paddedLine has exactly maxLength visible characters
      // Add the box borders and padding
      result.push(
        marginSpace +
          colorBorder(border.vertical) +
          ' '.repeat(padding) +
          paddedLine +
          ' '.repeat(padding) +
          colorBorder(border.vertical)
      );
    }

    // Padding lines
    for (let i = 0; i < padding; i++) {
      result.push(
        marginSpace +
          colorBorder(border.vertical) +
          ' '.repeat(innerWidth) +
          colorBorder(border.vertical)
      );
    }

    // Bottom border
    result.push(
      marginSpace +
        colorBorder(border.bottomLeft) +
        colorBorder(border.horizontal.repeat(innerWidth)) +
        colorBorder(border.bottomRight)
    );

    return result.join('\n');
  }

  /**
   * Add to cache with size limit.
   *
   * @param {string} key - Cache key
   * @param {string} value - Cache value
   * @private
   */
  private addToCache(key: string, value: string): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  /**
   * Clear the format cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set whether to use colors.
   *
   * @param {boolean} useColors - Whether to use colors
   */
  public setUseColors(useColors: boolean): void {
    this.useColors = useColors;
    this.clearCache(); // Clear cache when setting changes
  }

  /**
   * Create a gradient effect (for terminals that support it).
   *
   * @param {string} text - Text to gradient
   * @param {ColorName[]} startColors - Starting colors
   * @param {ColorName[]} endColors - Ending colors
   * @returns {string} Gradient text
   */
  public gradient(text: string, startColors: ColorName[], endColors: ColorName[]): string {
    if (!this.useColors) {
      return text;
    }

    // Simple implementation - just transition at midpoint
    const midpoint = Math.floor(text.length / 2);
    const firstHalf = this.colorize(text.substring(0, midpoint), startColors);
    const secondHalf = this.colorize(text.substring(midpoint), endColors);

    return firstHalf + secondHalf;
  }

  /**
   * Apply rainbow colors to text.
   *
   * @param {string} text - Text to rainbow
   * @returns {string} Rainbow text
   */
  public rainbow(text: string): string {
    if (!this.useColors) {
      return text;
    }

    const colors: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
    const chars = text.split('');

    return chars
      .map((char, index) => {
        if (char === ' ') return char;
        const color = colors[index % colors.length];
        return this.colorize(char, [color]);
      })
      .join('');
  }

  /**
   * Format a timestamp.
   *
   * @param {Date} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted timestamp
   */
  // Simplified single signature; always returns formatted timestamp.
  public formatTimestamp(date: Date = new Date(), format?: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const fmt: string = format ?? 'YYYY-MM-DD HH:mm:ss.SSS';
    return fmt
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
      .replace('SSS', milliseconds);
  }

  /**
   * Format bytes to human readable.
   *
   * @param {number} bytes - Number of bytes
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted size
   */
  public formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format duration to human readable.
   *
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  public formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else if (seconds > 0) {
      return `${seconds}s`;
    } else {
      return `${ms}ms`;
    }
  }
}
