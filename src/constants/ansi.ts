/**
 * ANSI Escape Sequences
 *
 * Comprehensive collection of ANSI escape sequences for terminal control and styling
 */

/**
 * Extended ANSI escape sequences for advanced terminal functionality
 */
export const ANSI = {
  // Basic control
  RESET: '\x1b[0m',
  CLEAR_SCREEN: '\x1b[2J',
  CLEAR_LINE: '\x1b[2K',

  // Cursor movement
  CURSOR_HOME: '\x1b[H',
  CURSOR_SAVE: '\x1b[s',
  CURSOR_RESTORE: '\x1b[u',
  CURSOR_UP: (n = 1) => `\x1b[${n}A`,
  CURSOR_DOWN: (n = 1) => `\x1b[${n}B`,
  CURSOR_RIGHT: (n = 1) => `\x1b[${n}C`,
  CURSOR_LEFT: (n = 1) => `\x1b[${n}D`,
  CURSOR_NEXT_LINE: (n = 1) => `\x1b[${n}E`, // Move to beginning of next line
  CURSOR_PREV_LINE: (n = 1) => `\x1b[${n}F`, // Move to beginning of previous line
  CURSOR_COLUMN: (n = 1) => `\x1b[${n}G`, // Move to column n
  CURSOR_POSITION: (row: number, col: number) => `\x1b[${row};${col}H`,
  CURSOR_REQUEST_POSITION: '\x1b[6n', // Reports cursor position as ESC[n;mR

  // Text styles (standard)
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  ITALIC: '\x1b[3m',
  UNDERLINE: '\x1b[4m',
  BLINK: '\x1b[5m',
  REVERSE: '\x1b[7m',
  HIDDEN: '\x1b[8m',
  STRIKETHROUGH: '\x1b[9m',

  // Reset individual styles
  RESET_BOLD_DIM: '\x1b[22m',
  RESET_ITALIC: '\x1b[23m',
  RESET_UNDERLINE: '\x1b[24m',
  RESET_BLINK: '\x1b[25m',
  RESET_REVERSE: '\x1b[27m',
  RESET_HIDDEN: '\x1b[28m',
  RESET_STRIKETHROUGH: '\x1b[29m',

  // Advanced text styles (less widely supported)
  DOUBLE_UNDERLINE: '\x1b[21m',
  CURLY_UNDERLINE: '\x1b[4:3m',
  DOTTED_UNDERLINE: '\x1b[4:4m',
  DASHED_UNDERLINE: '\x1b[4:5m',

  // Standard foreground colors
  FG_BLACK: '\x1b[30m',
  FG_RED: '\x1b[31m',
  FG_GREEN: '\x1b[32m',
  FG_YELLOW: '\x1b[33m',
  FG_BLUE: '\x1b[34m',
  FG_MAGENTA: '\x1b[35m',
  FG_CYAN: '\x1b[36m',
  FG_WHITE: '\x1b[37m',
  FG_DEFAULT: '\x1b[39m',

  // Standard background colors
  BG_BLACK: '\x1b[40m',
  BG_RED: '\x1b[41m',
  BG_GREEN: '\x1b[42m',
  BG_YELLOW: '\x1b[43m',
  BG_BLUE: '\x1b[44m',
  BG_MAGENTA: '\x1b[45m',
  BG_CYAN: '\x1b[46m',
  BG_WHITE: '\x1b[47m',
  BG_DEFAULT: '\x1b[49m',

  // Bright foreground colors
  FG_BRIGHT_BLACK: '\x1b[90m',
  FG_BRIGHT_RED: '\x1b[91m',
  FG_BRIGHT_GREEN: '\x1b[92m',
  FG_BRIGHT_YELLOW: '\x1b[93m',
  FG_BRIGHT_BLUE: '\x1b[94m',
  FG_BRIGHT_MAGENTA: '\x1b[95m',
  FG_BRIGHT_CYAN: '\x1b[96m',
  FG_BRIGHT_WHITE: '\x1b[97m',

  // Bright background colors
  BG_BRIGHT_BLACK: '\x1b[100m',
  BG_BRIGHT_RED: '\x1b[101m',
  BG_BRIGHT_GREEN: '\x1b[102m',
  BG_BRIGHT_YELLOW: '\x1b[103m',
  BG_BRIGHT_BLUE: '\x1b[104m',
  BG_BRIGHT_MAGENTA: '\x1b[105m',
  BG_BRIGHT_CYAN: '\x1b[106m',
  BG_BRIGHT_WHITE: '\x1b[107m',

  // Erase functions
  ERASE_DISPLAY: '\x1b[J', // Erase from cursor until end of screen
  ERASE_DISPLAY_START: '\x1b[1J', // Erase from cursor to beginning of screen
  ERASE_DISPLAY_ALL: '\x1b[2J', // Erase entire screen
  ERASE_SAVED_LINES: '\x1b[3J', // Erase saved lines
  ERASE_LINE: '\x1b[K', // Erase from cursor to end of line
  ERASE_LINE_START: '\x1b[1K', // Erase start of line to the cursor
  ERASE_LINE_ALL: '\x1b[2K', // Erase entire line

  // Color utilities
  FG_COLOR: (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`,
  BG_COLOR: (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`,
  FG_COLOR_256: (code: number) => `\x1b[38;5;${code}m`,
  BG_COLOR_256: (code: number) => `\x1b[48;5;${code}m`,

  // Hyperlinks (OSC 8 - supported in some terminals)
  HYPERLINK: (url: string, text: string) => `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`,

  // Window title (OSC 0/2 - supported in some terminals)
  SET_TITLE: (title: string) => `\x1b]0;${title}\x07`,
  SET_ICON_TITLE: (title: string) => `\x1b]1;${title}\x07`,
  SET_WINDOW_TITLE: (title: string) => `\x1b]2;${title}\x07`,

  // Cursor styles
  CURSOR_BLOCK: '\x1b[2 q',
  CURSOR_UNDERLINE: '\x1b[4 q',
  CURSOR_BAR: '\x1b[6 q',
  CURSOR_BLINKING_BLOCK: '\x1b[1 q',
  CURSOR_BLINKING_UNDERLINE: '\x1b[3 q',
  CURSOR_BLINKING_BAR: '\x1b[5 q',

  // Private modes
  CURSOR_HIDE: '\x1b[?25l',
  CURSOR_SHOW: '\x1b[?25h',
  SCREEN_SAVE: '\x1b[?47h',
  SCREEN_RESTORE: '\x1b[?47l',
  ALTERNATE_BUFFER_ENABLE: '\x1b[?1049h',
  ALTERNATE_BUFFER_DISABLE: '\x1b[?1049l',

  // Terminal features
  ENABLE_MOUSE: '\x1b[?1000h\x1b[?1002h\x1b[?1003h', // Enable mouse tracking
  DISABLE_MOUSE: '\x1b[?1003l\x1b[?1002l\x1b[?1000l', // Disable mouse tracking
  ENABLE_LINE_WRAP: '\x1b[?7h',
  DISABLE_LINE_WRAP: '\x1b[?7l',

  // Bell/alert
  BELL: '\x07',
};
