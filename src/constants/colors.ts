// File: src/constants/colors.ts

import type { ColorName } from '../types';

/**
 * ANSI escape codes for terminal colors and styles.
 * 
 * @const ANSI_CODES
 */
export const ANSI_CODES: Record<ColorName | string, string> = {
  // Reset
  reset: '\x1b[0m',
  
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  grey: '\x1b[90m', // Alias
  
  // Bright text colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgGray: '\x1b[100m',
  bgGrey: '\x1b[100m', // Alias
  
  // Bright background colors
  bgBrightRed: '\x1b[101m',
  bgBrightGreen: '\x1b[102m',
  bgBrightYellow: '\x1b[103m',
  bgBrightBlue: '\x1b[104m',
  bgBrightMagenta: '\x1b[105m',
  bgBrightCyan: '\x1b[106m',
  bgBrightWhite: '\x1b[107m',
  
  // Styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',
  hidden: '\x1b[8m',
  strikethrough: '\x1b[9m',
  
  // Style resets
  boldReset: '\x1b[22m',
  dimReset: '\x1b[22m',
  italicReset: '\x1b[23m',
  underlineReset: '\x1b[24m',
  inverseReset: '\x1b[27m',
  hiddenReset: '\x1b[28m',
  strikethroughReset: '\x1b[29m',
  
  // Background reset
  bgReset: '\x1b[49m',
};

/**
 * Available colors for terminal output.
 * 
 * @const COLORS
 */
export const COLORS = {
  // Standard colors
  black: 'black',
  red: 'red',
  green: 'green',
  yellow: 'yellow',
  blue: 'blue',
  magenta: 'magenta',
  cyan: 'cyan',
  white: 'white',
  gray: 'gray',
  
  // Bright colors
  brightRed: 'brightRed',
  brightGreen: 'brightGreen',
  brightYellow: 'brightYellow',
  brightBlue: 'brightBlue',
  brightMagenta: 'brightMagenta',
  brightCyan: 'brightCyan',
  brightWhite: 'brightWhite',
} as const;

/**
 * Color names for browser console CSS.
 * Maps color names to CSS color values.
 * 
 * @const BROWSER_COLORS
 */
export const BROWSER_COLORS: Record<ColorName, string> = {
  // Text colors
  black: 'color: #000000',
  red: 'color: #ff0000',
  green: 'color: #00ff00',
  yellow: 'color: #ffff00',
  blue: 'color: #0000ff',
  magenta: 'color: #ff00ff',
  cyan: 'color: #00ffff',
  white: 'color: #ffffff',
  gray: 'color: #808080',
  grey: 'color: #808080',
  
  // Bright colors
  brightRed: 'color: #ff6666',
  brightGreen: 'color: #66ff66',
  brightYellow: 'color: #ffff66',
  brightBlue: 'color: #6666ff',
  brightMagenta: 'color: #ff66ff',
  brightCyan: 'color: #66ffff',
  brightWhite: 'color: #ffffff',
  
  // Background colors
  bgBlack: 'background-color: #000000',
  bgRed: 'background-color: #ff0000',
  bgGreen: 'background-color: #00ff00',
  bgYellow: 'background-color: #ffff00',
  bgBlue: 'background-color: #0000ff',
  bgMagenta: 'background-color: #ff00ff',
  bgCyan: 'background-color: #00ffff',
  bgWhite: 'background-color: #ffffff',
  bgGray: 'background-color: #808080',
  bgGrey: 'background-color: #808080',
  
  // Bright background colors
  bgBrightRed: 'background-color: #ff6666',
  bgBrightGreen: 'background-color: #66ff66',
  bgBrightYellow: 'background-color: #ffff66',
  bgBrightBlue: 'background-color: #6666ff',
  bgBrightMagenta: 'background-color: #ff66ff',
  bgBrightCyan: 'background-color: #66ffff',
  bgBrightWhite: 'background-color: #ffffff',
  
  // Styles
  bold: 'font-weight: bold',
  dim: 'opacity: 0.7',
  italic: 'font-style: italic',
  underline: 'text-decoration: underline',
  inverse: 'filter: invert(1)',
  hidden: 'visibility: hidden',
  strikethrough: 'text-decoration: line-through',
} as any;