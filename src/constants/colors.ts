// File: src/constants/colors.ts

/**
 * ANSI escape codes for colors and styles.
 * This provides the actual escape sequences for terminal formatting.
 */
export const COLORS = {
  // Reset
  reset: '\x1b[0m',
  
  // Text styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',
  hidden: '\x1b[8m',
  strikethrough: '\x1b[9m',
  blink: '\x1b[5m',
  
  // Foreground colors
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
  
  // Bright foreground colors
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
} as const;

/**
 * ANSI_CODES is an alias for COLORS for backward compatibility
 */
export const ANSI_CODES = COLORS;

/**
 * Style reset codes for specific styles
 */
export const RESET_CODES: Record<string, string> = {
  bold: '\x1b[22m',
  dim: '\x1b[22m',
  italic: '\x1b[23m',
  underline: '\x1b[24m',
  blink: '\x1b[25m',
  inverse: '\x1b[27m',
  hidden: '\x1b[28m',
  strikethrough: '\x1b[29m',
  bgReset: '\x1b[49m',
  fgReset: '\x1b[39m',
};