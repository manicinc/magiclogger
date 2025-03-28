import { ANSI } from './ansi';
import { isStyleSupported } from '../utils/terminal';

export const COLORS = {
  // Foreground colors
  black: ANSI.FG_BLACK,
  red: ANSI.FG_RED,
  green: ANSI.FG_GREEN,
  yellow: ANSI.FG_YELLOW,
  blue: ANSI.FG_BLUE,
  magenta: ANSI.FG_MAGENTA,
  cyan: ANSI.FG_CYAN,
  white: ANSI.FG_WHITE,
  gray: ANSI.FG_BRIGHT_BLACK,
  grey: ANSI.FG_BRIGHT_BLACK,

  // Bright foreground
  brightRed: ANSI.FG_BRIGHT_RED,
  brightGreen: ANSI.FG_BRIGHT_GREEN,
  brightYellow: ANSI.FG_BRIGHT_YELLOW,
  brightBlue: ANSI.FG_BRIGHT_BLUE,
  brightMagenta: ANSI.FG_BRIGHT_MAGENTA,
  brightCyan: ANSI.FG_BRIGHT_CYAN,
  brightWhite: ANSI.FG_BRIGHT_WHITE,

  // Background colors
  bgBlack: ANSI.BG_BLACK,
  bgRed: ANSI.BG_RED,
  bgGreen: ANSI.BG_GREEN,
  bgYellow: ANSI.BG_YELLOW,
  bgBlue: ANSI.BG_BLUE,
  bgMagenta: ANSI.BG_MAGENTA,
  bgCyan: ANSI.BG_CYAN,
  bgWhite: ANSI.BG_WHITE,
  bgGray: ANSI.BG_BRIGHT_BLACK,
  bgGrey: ANSI.BG_BRIGHT_BLACK,

  // Text styles - Only use if supported by the terminal
  bold: isStyleSupported('bold') ? ANSI.BOLD : '',
  dim: isStyleSupported('dim') ? ANSI.DIM : '',
  italic: isStyleSupported('italic') ? ANSI.ITALIC : '',
  underline: isStyleSupported('underline') ? ANSI.UNDERLINE : '',
  blink: isStyleSupported('blink') ? ANSI.BLINK : '',
  reverse: isStyleSupported('reverse') ? ANSI.REVERSE : '',
  hidden: isStyleSupported('hidden') ? ANSI.HIDDEN : '',
  strikethrough: isStyleSupported('strikethrough') ? ANSI.STRIKETHROUGH : '',

  // Reset - always available
  reset: ANSI.RESET,
};
