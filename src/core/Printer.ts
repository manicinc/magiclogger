// File: src/core/Printer.ts

import { isBrowserEnvironment } from '../utils/environment';
import { Formatter } from './Formatter';
import { Colorizer } from './Colorizer';
import { ColorName } from '../types';

/**
 * Configuration options for Printer.
 * 
 * @interface PrinterOptions
 */
export interface PrinterOptions {
  /**
   * Whether to use colors in output.
   * @default true
   */
  useColors?: boolean;

  /**
   * Output stream (Node.js only).
   */
  stream?: NodeJS.WriteStream;

  /**
   * Whether to add timestamps.
   * @default false
   */
  timestamps?: boolean;

  /**
   * Timestamp format.
   * @default 'HH:mm:ss.SSS'
   */
  timestampFormat?: string;

  /**
   * Custom console object (for testing).
   */
  console?: Console;
}

/**
 * Printer module abstracts output logic for both terminal and browser environments.
 * 
 * Features:
 * - Cross-platform output handling
 * - Table formatting for both environments
 * - Progress bar support
 * - Stream redirection
 * - Performance optimizations
 * - Memory-safe output
 * 
 * @class Printer
 * 
 * @example
 * ```typescript
 * // Configure printer
 * Printer.configure({
 *   useColors: true,
 *   timestamps: true
 * });
 * 
 * // Print formatted output
 * Printer.print('Hello World');
 * 
 * // Print table
 * Printer.printTable([
 *   { name: 'John', age: 30 },
 *   { name: 'Jane', age: 25 }
 * ]);
 * ```
 */
export class Printer {
  /**
   * Formatter instance.
   * @private
   * @static
   */
  private static formatter: Formatter = new Formatter();

  /**
   * Store original console methods to prevent infinite recursion.
   * @private
   * @static
   */
  private static originalConsole = {
    log: console.log.bind(console),
    table: console.table.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
  };

  /**
   * Current configuration.
   * @private
   * @static
   */
  private static config: Required<PrinterOptions> = {
    useColors: true,
    stream: process.stdout,
    timestamps: false,
    timestampFormat: 'HH:mm:ss.SSS',
    console: console,
  };

  /**
   * Output buffer for batching.
   * @private
   * @static
   */
  private static buffer: string[] = [];

  /**
   * Whether buffering is enabled.
   * @private
   * @static
   */
  private static buffering = false;

  /**
   * Maximum buffer size.
   * @private
   * @static
   */
  private static readonly MAX_BUFFER_SIZE = 1000;

  /**
   * Progress bar state.
   * @private
   * @static
   */
  private static progressState: {
    active: boolean;
    lastLine: string;
    startTime: number;
  } = {
    active: false,
    lastLine: '',
    startTime: 0,
  };

  /**
   * Configure printer options.
   * 
   * @param {PrinterOptions} options - Configuration options
   * @static
   */
  public static configure(options: PrinterOptions): void {
    this.config = { ...this.config, ...options };
    this.formatter = new Formatter(this.config.useColors);
  }

  /**
   * Set whether to use colors in the output.
   * 
   * @param {boolean} useColors - Whether to enable colors
   * @static
   */
  public static setUseColors(useColors: boolean): void {
    this.config.useColors = useColors;
    this.formatter = new Formatter(useColors);
  }

  /**
   * Enable output buffering.
   * @static
   */
  public static startBuffering(): void {
    this.buffering = true;
  }

  /**
   * Disable buffering and flush buffer.
   * @static
   */
  public static stopBuffering(): void {
    this.buffering = false;
    this.flush();
  }

  /**
   * Flush the output buffer.
   * @static
   */
  public static flush(): void {
    if (this.buffer.length === 0) return;

    const output = this.buffer.join('\n');
    this.buffer = [];

    if (isBrowserEnvironment()) {
      this.originalConsole.log(output);
    } else {
      this.config.stream.write(output + '\n');
    }
  }

  /**
   * Clear the output buffer without flushing.
   * @static
   */
  public static clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Prints a log message to console.
   * Handles browser or terminal output.
   * 
   * @param {string} message - The formatted message
   * @static
   */
  public static print(message: string): void {
    // Add timestamp if configured
    if (this.config.timestamps) {
      const timestamp = this.formatter.formatTimestamp(new Date(), this.config.timestampFormat);
      message = `${timestamp} ${message}`;
    }

    // Handle buffering
    if (this.buffering) {
      this.buffer.push(message);
      if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
        this.flush();
      }
      return;
    }

    // Clear progress bar if active
    if (this.progressState.active && !isBrowserEnvironment()) {
      this.clearProgress();
    }

    if (isBrowserEnvironment()) {
      // Browser: Apply styles using CSS
      this.originalConsole.log('%c' + message, 'font-family: monospace;');
    } else {
      // Node (Terminal): Output without CSS (ANSI escape codes used internally)
      this.config.stream.write(message + '\n');
    }
  }

  /**
   * Print multiple lines efficiently.
   * 
   * @param {string[]} lines - Array of lines to print
   * @static
   */
  public static printLines(lines: string[]): void {
    if (lines.length === 0) return;

    if (this.buffering) {
      this.buffer.push(...lines);
      return;
    }

    const output = lines.join('\n');
    
    if (isBrowserEnvironment()) {
      this.originalConsole.log(output);
    } else {
      this.config.stream.write(output + '\n');
    }
  }

  /**
   * Print to error stream.
   * 
   * @param {string} message - Error message
   * @static
   */
  public static printError(message: string): void {
    if (isBrowserEnvironment()) {
      this.originalConsole.error(message);
    } else {
      process.stderr.write(message + '\n');
    }
  }

  /**
   * Print progress bar visually.
   * 
   * @param {string} bar - The filled bar string
   * @param {string} percent - The percentage string
   * @param {object} options - Additional options
   * @static
   */
  public static printProgress(
    bar: string, 
    percent: string,
    options: {
      label?: string;
      showTime?: boolean;
      showSpeed?: boolean;
      current?: number;
      total?: number;
    } = {}
  ): void {
    if (isBrowserEnvironment()) {
      // Browser: Print directly
      const parts = [];
      if (options.label) parts.push(options.label);
      parts.push(bar);
      parts.push(percent);
      if (options.showTime && this.progressState.startTime) {
        const elapsed = Date.now() - this.progressState.startTime;
        parts.push(this.formatter.formatDuration(elapsed));
      }
      this.originalConsole.log(parts.join(' '));
    } else {
      // Node (Terminal): Use stdout for inline updates
      const parts = [];
      if (options.label) parts.push(options.label);
      parts.push(bar);
      parts.push(percent);
      
      if (options.showTime && this.progressState.startTime) {
        const elapsed = Date.now() - this.progressState.startTime;
        parts.push(`[${this.formatter.formatDuration(elapsed)}]`);
      }

      if (options.showSpeed && options.current && this.progressState.startTime) {
        const elapsed = (Date.now() - this.progressState.startTime) / 1000;
        const speed = options.current / elapsed;
        parts.push(`(${speed.toFixed(1)}/s)`);
      }

      if (options.current && options.total) {
        parts.push(`${options.current}/${options.total}`);
      }

      const line = parts.join(' ');
      
      // Track progress state
      if (!this.progressState.active) {
        this.progressState.active = true;
        this.progressState.startTime = Date.now();
      }
      this.progressState.lastLine = line;

      // Clear line and write new progress
      process.stdout.write(`\r${' '.repeat(process.stdout.columns || 80)}`);
      process.stdout.write(`\r${line}`);
      
      if (parseFloat(percent) >= 100) {
        process.stdout.write('\n');
        this.progressState.active = false;
      }
    }
  }

  /**
   * Clear the current progress line.
   * @private
   * @static
   */
  private static clearProgress(): void {
    if (!isBrowserEnvironment() && this.progressState.active) {
      process.stdout.write(`\r${' '.repeat(process.stdout.columns || 80)}\r`);
      this.progressState.active = false;
    }
  }

  /**
   * Print tabular data with proper formatting for both environments.
   * 
   * @param {Record<string, any>[]} data - Array of objects
   * @param {object} options - Table options
   * @static
   */
  public static printTable(
    data: Record<string, any>[],
    headerColors: ColorName[] = ['brightWhite', 'bold'],
    options: {
      maxColumnWidth?: number;
      truncate?: boolean;
      showIndex?: boolean;
      borderStyle?: 'single' | 'double' | 'none';
      compact?: boolean;
    } = {}
  ): void {
    if (isBrowserEnvironment()) {
      // Browser: Use console.table for better formatting
      this.originalConsole.table(data);
    } else {
      // Node (Terminal): Format as ASCII table
      if (data.length === 0) {
        this.originalConsole.log('Empty table (no data)');
        return;
      }

      const {
        maxColumnWidth = 50,
        truncate = true,
        showIndex = false,
        borderStyle = 'single',
        compact = false,
      } = options;

      // Get all column names
      const columns = this.getAllColumns(data);
      if (showIndex) {
        columns.unshift('#');
      }

      // Calculate column widths
      const columnWidths = this.calculateColumnWidths(data, columns, maxColumnWidth, showIndex);

      // Get border characters
      const borders = this.getBorderChars(borderStyle);

      // Print table
      const lines: string[] = [];

      // Top border
      if (borderStyle !== 'none') {
        lines.push(this.buildBorderLine(columnWidths, borders.top));
      }

      // Header row
      lines.push(this.buildDataRow(
        columns.reduce((obj, col) => ({ ...obj, [col]: col }), {}),
        columns,
        columnWidths,
        borders.vertical,
        headerColors,
        truncate
      ));

      // Separator after header
      if (borderStyle !== 'none' && !compact) {
        lines.push(this.buildBorderLine(columnWidths, borders.middle));
      }

      // Data rows
      data.forEach((row, index) => {
        if (showIndex) {
          row = { '#': index + 1, ...row };
        }
        lines.push(this.buildDataRow(row, columns, columnWidths, borders.vertical, [], truncate));
      });

      // Bottom border
      if (borderStyle !== 'none') {
        lines.push(this.buildBorderLine(columnWidths, borders.bottom));
      }

      // Print all lines
      this.printLines(lines);
    }
  }

  /**
   * Get all unique columns from data.
   * 
   * @param {Record<string, any>[]} data - Table data
   * @returns {string[]} Column names
   * @private
   * @static
   */
  private static getAllColumns(data: Record<string, any>[]): string[] {
    const columnSet = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => columnSet.add(key));
    });
    return Array.from(columnSet);
  }

  /**
   * Calculate optimal column widths.
   * 
   * @param {Record<string, any>[]} data - Table data
   * @param {string[]} columns - Column names
   * @param {number} maxWidth - Maximum column width
   * @param {boolean} hasIndex - Whether index column exists
   * @returns {Record<string, number>} Column widths
   * @private
   * @static
   */
  private static calculateColumnWidths(
    data: Record<string, any>[],
    columns: string[],
    maxWidth: number,
    hasIndex: boolean
  ): Record<string, number> {
    const widths: Record<string, number> = {};

    columns.forEach(col => {
      // Start with header width
      widths[col] = col.length;

      // Special handling for index column
      if (col === '#' && hasIndex) {
        widths[col] = Math.max(widths[col], String(data.length).length);
        return;
      }

      // Check all data values
      data.forEach((row, index) => {
        const value = col === '#' ? index + 1 : row[col];
        const strValue = this.formatCellValue(value);
        widths[col] = Math.max(widths[col], strValue.length);
      });

      // Apply maximum width constraint
      widths[col] = Math.min(widths[col], maxWidth);
    });

    return widths;
  }

  /**
   * Format a cell value for display.
   * 
   * @param {any} value - Cell value
   * @returns {string} Formatted value
   * @private
   * @static
   */
  private static formatCellValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return '[Object]';
    return String(value);
  }

  /**
   * Get border characters for table style.
   * 
   * @param {string} style - Border style
   * @returns {object} Border characters
   * @private
   * @static
   */
  private static getBorderChars(style: 'single' | 'double' | 'none'): any {
    const styles = {
      single: {
        top: { left: '┌', middle: '┬', right: '┐', line: '─' },
        middle: { left: '├', middle: '┼', right: '┤', line: '─' },
        bottom: { left: '└', middle: '┴', right: '┘', line: '─' },
        vertical: '│',
      },
      double: {
        top: { left: '╔', middle: '╦', right: '╗', line: '═' },
        middle: { left: '╠', middle: '╬', right: '╣', line: '═' },
        bottom: { left: '╚', middle: '╩', right: '╝', line: '═' },
        vertical: '║',
      },
      none: {
        top: { left: '', middle: '', right: '', line: '' },
        middle: { left: '', middle: '', right: '', line: '' },
        bottom: { left: '', middle: '', right: '', line: '' },
        vertical: ' ',
      },
    };

    return styles[style];
  }

  /**
   * Build a border line for the table.
   * 
   * @param {Record<string, number>} widths - Column widths
   * @param {object} chars - Border characters
   * @returns {string} Border line
   * @private
   * @static
   */
  private static buildBorderLine(
    widths: Record<string, number>,
    chars: any
  ): string {
    const segments = Object.values(widths).map(width => chars.line.repeat(width + 2));
    return chars.left + segments.join(chars.middle) + chars.right;
  }

  /**
   * Build a data row for the table.
   * 
   * @param {Record<string, any>} row - Row data
   * @param {string[]} columns - Column names
   * @param {Record<string, number>} widths - Column widths
   * @param {string} vertical - Vertical border character
   * @param {ColorName[]} colors - Colors to apply
   * @param {boolean} truncate - Whether to truncate long values
   * @returns {string} Formatted row
   * @private
   * @static
   */
  private static buildDataRow(
    row: Record<string, any>,
    columns: string[],
    widths: Record<string, number>,
    vertical: string,
    colors: ColorName[] = [],
    truncate: boolean = true
  ): string {
    const cells = columns.map(col => {
      let value = this.formatCellValue(row[col]);
      const width = widths[col];

      // Truncate if needed
      if (truncate && value.length > width) {
        value = value.substring(0, width - 3) + '...';
      }

      // Pad value
      const padded = ` ${value.padEnd(width)} `;

      // Apply colors
      return colors.length > 0 ? Colorizer.applyColors(padded, colors) : padded;
    });

    return vertical + cells.join(vertical) + vertical;
  }

  /**
   * Print a tree structure.
   * 
   * @param {object} data - Tree data
   * @param {object} options - Tree options
   * @static
   */
  public static printTree(
    data: any,
    options: {
      label?: string;
      showValues?: boolean;
      maxDepth?: number;
      colors?: boolean;
    } = {}
  ): void {
    const {
      label = 'Tree',
      showValues = true,
      maxDepth = 10,
      colors = this.config.useColors,
    } = options;

    const lines: string[] = [];
    
    // Add label
    if (label) {
      lines.push(colors ? Colorizer.bold(label) : label);
    }

    // Build tree
    this.buildTree(data, lines, '', true, 0, maxDepth, showValues, colors);

    // Print all lines
    this.printLines(lines);
  }

  /**
   * Build tree structure recursively.
   * 
   * @param {any} node - Current node
   * @param {string[]} lines - Output lines
   * @param {string} prefix - Line prefix
   * @param {boolean} isLast - Whether this is the last sibling
   * @param {number} depth - Current depth
   * @param {number} maxDepth - Maximum depth
   * @param {boolean} showValues - Whether to show values
   * @param {boolean} colors - Whether to use colors
   * @private
   * @static
   */
  private static buildTree(
    node: any,
    lines: string[],
    prefix: string,
    isLast: boolean,
    depth: number,
    maxDepth: number,
    showValues: boolean,
    colors: boolean
  ): void {
    if (depth > maxDepth) {
      lines.push(prefix + '└─ ...');
      return;
    }

    const entries = Object.entries(node);
    entries.forEach(([key, value], index) => {
      const isLastEntry = index === entries.length - 1;
      const connector = isLastEntry ? '└─' : '├─';
      const extension = isLastEntry ? '  ' : '│ ';

      let line = prefix + connector + ' ';
      
      if (colors) {
        line += Colorizer.cyan(key);
      } else {
        line += key;
      }

      if (showValues && (typeof value !== 'object' || value === null)) {
        line += ': ';
        if (colors) {
          line += Colorizer.yellow(this.formatCellValue(value));
        } else {
          line += this.formatCellValue(value);
        }
      }

      lines.push(line);

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.buildTree(
          value,
          lines,
          prefix + extension + ' ',
          isLastEntry,
          depth + 1,
          maxDepth,
          showValues,
          colors
        );
      }
    });
  }

  /**
   * Clear the console/terminal.
   * @static
   */
  public static clear(): void {
    if (isBrowserEnvironment()) {
      console.clear();
    } else {
      process.stdout.write('\x1bc');
    }
  }

  /**
   * Move cursor to specific position (terminal only).
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @static
   */
  public static moveCursor(x: number, y: number): void {
    if (!isBrowserEnvironment()) {
      process.stdout.write(`\x1b[${y};${x}H`);
    }
  }

  /**
   * Save cursor position (terminal only).
   * @static
   */
  public static saveCursor(): void {
    if (!isBrowserEnvironment()) {
      process.stdout.write('\x1b[s');
    }
  }

  /**
   * Restore cursor position (terminal only).
   * @static
   */
  public static restoreCursor(): void {
    if (!isBrowserEnvironment()) {
      process.stdout.write('\x1b[u');
    }
  }

  /**
   * Hide cursor (terminal only).
   * @static
   */
  public static hideCursor(): void {
    if (!isBrowserEnvironment()) {
      process.stdout.write('\x1b[?25l');
    }
  }

  /**
   * Show cursor (terminal only).
   * @static
   */
  public static showCursor(): void {
    if (!isBrowserEnvironment()) {
      process.stdout.write('\x1b[?25h');
    }
  }

  /**
   * Get terminal size.
   * 
   * @returns {object} Terminal dimensions
   * @static
   */
  public static getTerminalSize(): { columns: number; rows: number } {
    if (isBrowserEnvironment()) {
      return { columns: 80, rows: 24 };
    }

    return {
      columns: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
    };
  }

  /**
   * Check if output is a TTY.
   * 
   * @returns {boolean} True if TTY
   * @static
   */
  public static isTTY(): boolean {
    if (isBrowserEnvironment()) {
      return false;
    }

    return process.stdout.isTTY || false;
  }

  /**
   * Get output stream.
   * 
   * @returns {NodeJS.WriteStream | Console} Output stream
   * @static
   */
  public static getStream(): NodeJS.WriteStream | Console {
    return isBrowserEnvironment() ? console : this.config.stream;
  }

  /**
   * Redirect output to a different stream.
   * 
   * @param {NodeJS.WriteStream} stream - New output stream
   * @static
   */
  public static redirect(stream: NodeJS.WriteStream): void {
    if (!isBrowserEnvironment()) {
      this.config.stream = stream;
    }
  }

  /**
   * Reset output to default stream.
   * @static
   */
  public static reset(): void {
    if (!isBrowserEnvironment()) {
      this.config.stream = process.stdout;
    }
  }
}