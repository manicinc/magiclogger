import { isBrowserEnvironment } from '../utils/environment';
import { Formatter } from './Formatter';
import { Colorizer } from './Colorizer';
import { ColorName } from '../types';

/**
 * Printer module abstracts output logic for both terminal and browser environments.
 */
export class Printer {
  private static formatter: Formatter = new Formatter();

  /**
   * Set whether to use colors in the output
   * @param useColors Whether to enable colors
   */
  public static setUseColors(useColors: boolean): void {
    this.formatter = new Formatter(useColors);
  }

  /**
   * Prints a log message to console.
   * Handles browser or terminal output.
   * @param message The formatted message
   */
  public static print(message: string): void {
    if (isBrowserEnvironment()) {
      // Browser: Apply styles using CSS
      console.log('%c' + message, 'font-family: monospace;');
    } else {
      // Node (Terminal): Output without CSS (ANSI escape codes used internally)
      console.log(message);
    }
  }

  /**
   * Print progress bar visually.
   * @param bar The filled bar string
   * @param percent The percentage string
   */
  public static printProgress(bar: string, percent: string): void {
    if (isBrowserEnvironment()) {
      // Browser: Print directly
      console.log(`${bar} ${percent}`);
    } else {
      // Node (Terminal): Use stdout for inline updates
      process.stdout.write(`\r${bar} ${percent}`);
      if (parseFloat(percent) >= 100) process.stdout.write('\n');
    }
  }

  /**
   * Print tabular data with proper formatting for both environments.
   * @param data Array of objects
   * @param headerColors Optional colors to apply to the header row
   */
  public static printTable(
    data: Record<string, any>[],
    headerColors: ColorName[] = ['brightWhite', 'bold']
  ): void {
    if (isBrowserEnvironment()) {
      // Browser: Use console.table for better formatting
      console.table(data);
    } else {
      // Node (Terminal): Format as ASCII table
      if (data.length === 0) {
        console.log('Empty table (no data)');
        return;
      }

      // Get all column names
      const columns = Object.keys(data[0]);

      // Find the maximum width needed for each column
      const columnWidths: Record<string, number> = {};
      columns.forEach(column => {
        // Calculate max width considering the header and all data values
        columnWidths[column] = Math.max(
          column.length,
          ...data.map(row => String(row[column] ?? '').length)
        );
      });

      // Calculate total table width
      const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width + 3, 1);
      console.log('─'.repeat(totalWidth)); // horizontal line above the table

      // Top border
      let border = '┌' + columns.map(col => '─'.repeat(columnWidths[col] + 2)).join('┬') + '┐';
      console.log(border);

      // Header row (with colors)
      let headerRow = '│';
      columns.forEach(col => {
        const paddedCol = ` ${col.padEnd(columnWidths[col])} `;
        const coloredCol = Colorizer.applyColors(paddedCol, headerColors);
        headerRow += `${coloredCol}│`;
      });
      console.log(headerRow);

      // Separator after header
      border = '├' + columns.map(col => '─'.repeat(columnWidths[col] + 2)).join('┼') + '┤';
      console.log(border);

      // Data rows
      data.forEach(row => {
        let dataRow = '│';
        columns.forEach(col => {
          const value = row[col] ?? '';
          dataRow += ` ${String(value).padEnd(columnWidths[col])} │`;
        });
        console.log(dataRow);
      });

      // Bottom border
      border = '└' + columns.map(col => '─'.repeat(columnWidths[col] + 2)).join('┴') + '┘';
      console.log(border);
    }
  }
}
