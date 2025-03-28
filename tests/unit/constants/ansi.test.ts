import { ANSI } from '../../../src/constants/ansi';

describe('ANSI Constants', () => {
  describe('Basic Control Sequences', () => {
    it('should have basic control sequences', () => {
      expect(ANSI.RESET).toBe('\x1b[0m');
      expect(ANSI.CLEAR_SCREEN).toBe('\x1b[2J');
      expect(ANSI.CLEAR_LINE).toBe('\x1b[2K');
    });
  });

  describe('Cursor Movement Sequences', () => {
    it('should have cursor position and movement constants', () => {
      expect(ANSI.CURSOR_HOME).toBe('\x1b[H');
      expect(ANSI.CURSOR_SAVE).toBe('\x1b[s');
      expect(ANSI.CURSOR_RESTORE).toBe('\x1b[u');
      expect(ANSI.CURSOR_REQUEST_POSITION).toBe('\x1b[6n');
    });

    it('should have cursor movement functions with defaults', () => {
      // Test with default arguments
      expect(ANSI.CURSOR_UP()).toBe('\x1b[1A');
      expect(ANSI.CURSOR_DOWN()).toBe('\x1b[1B');
      expect(ANSI.CURSOR_RIGHT()).toBe('\x1b[1C');
      expect(ANSI.CURSOR_LEFT()).toBe('\x1b[1D');
      expect(ANSI.CURSOR_NEXT_LINE()).toBe('\x1b[1E');
      expect(ANSI.CURSOR_PREV_LINE()).toBe('\x1b[1F');
      expect(ANSI.CURSOR_COLUMN()).toBe('\x1b[1G');
    });

    it('should have cursor movement functions with custom values', () => {
      // Test with custom arguments
      expect(ANSI.CURSOR_UP(5)).toBe('\x1b[5A');
      expect(ANSI.CURSOR_DOWN(10)).toBe('\x1b[10B');
      expect(ANSI.CURSOR_RIGHT(15)).toBe('\x1b[15C');
      expect(ANSI.CURSOR_LEFT(20)).toBe('\x1b[20D');
      expect(ANSI.CURSOR_NEXT_LINE(3)).toBe('\x1b[3E');
      expect(ANSI.CURSOR_PREV_LINE(4)).toBe('\x1b[4F');
      expect(ANSI.CURSOR_COLUMN(8)).toBe('\x1b[8G');
    });

    it('should have cursor position function', () => {
      expect(ANSI.CURSOR_POSITION(5, 10)).toBe('\x1b[5;10H');
      expect(ANSI.CURSOR_POSITION(20, 30)).toBe('\x1b[20;30H');
    });
  });

  describe('Text Styling Sequences', () => {
    it('should have standard text style constants', () => {
      expect(ANSI.BOLD).toBe('\x1b[1m');
      expect(ANSI.DIM).toBe('\x1b[2m');
      expect(ANSI.ITALIC).toBe('\x1b[3m');
      expect(ANSI.UNDERLINE).toBe('\x1b[4m');
      expect(ANSI.BLINK).toBe('\x1b[5m');
      expect(ANSI.REVERSE).toBe('\x1b[7m');
      expect(ANSI.HIDDEN).toBe('\x1b[8m');
      expect(ANSI.STRIKETHROUGH).toBe('\x1b[9m');
    });

    it('should have reset style constants', () => {
      expect(ANSI.RESET_BOLD_DIM).toBe('\x1b[22m');
      expect(ANSI.RESET_ITALIC).toBe('\x1b[23m');
      expect(ANSI.RESET_UNDERLINE).toBe('\x1b[24m');
      expect(ANSI.RESET_BLINK).toBe('\x1b[25m');
      expect(ANSI.RESET_REVERSE).toBe('\x1b[27m');
      expect(ANSI.RESET_HIDDEN).toBe('\x1b[28m');
      expect(ANSI.RESET_STRIKETHROUGH).toBe('\x1b[29m');
    });

    it('should have advanced text style constants', () => {
      expect(ANSI.DOUBLE_UNDERLINE).toBe('\x1b[21m');
      expect(ANSI.CURLY_UNDERLINE).toBe('\x1b[4:3m');
      expect(ANSI.DOTTED_UNDERLINE).toBe('\x1b[4:4m');
      expect(ANSI.DASHED_UNDERLINE).toBe('\x1b[4:5m');
    });
  });

  describe('Color Sequences', () => {
    it('should have standard foreground color constants', () => {
      expect(ANSI.FG_BLACK).toBe('\x1b[30m');
      expect(ANSI.FG_RED).toBe('\x1b[31m');
      expect(ANSI.FG_GREEN).toBe('\x1b[32m');
      expect(ANSI.FG_YELLOW).toBe('\x1b[33m');
      expect(ANSI.FG_BLUE).toBe('\x1b[34m');
      expect(ANSI.FG_MAGENTA).toBe('\x1b[35m');
      expect(ANSI.FG_CYAN).toBe('\x1b[36m');
      expect(ANSI.FG_WHITE).toBe('\x1b[37m');
      expect(ANSI.FG_DEFAULT).toBe('\x1b[39m');
    });

    it('should have standard background color constants', () => {
      expect(ANSI.BG_BLACK).toBe('\x1b[40m');
      expect(ANSI.BG_RED).toBe('\x1b[41m');
      expect(ANSI.BG_GREEN).toBe('\x1b[42m');
      expect(ANSI.BG_YELLOW).toBe('\x1b[43m');
      expect(ANSI.BG_BLUE).toBe('\x1b[44m');
      expect(ANSI.BG_MAGENTA).toBe('\x1b[45m');
      expect(ANSI.BG_CYAN).toBe('\x1b[46m');
      expect(ANSI.BG_WHITE).toBe('\x1b[47m');
      expect(ANSI.BG_DEFAULT).toBe('\x1b[49m');
    });

    it('should have bright foreground color constants', () => {
      expect(ANSI.FG_BRIGHT_BLACK).toBe('\x1b[90m');
      expect(ANSI.FG_BRIGHT_RED).toBe('\x1b[91m');
      expect(ANSI.FG_BRIGHT_GREEN).toBe('\x1b[92m');
      expect(ANSI.FG_BRIGHT_YELLOW).toBe('\x1b[93m');
      expect(ANSI.FG_BRIGHT_BLUE).toBe('\x1b[94m');
      expect(ANSI.FG_BRIGHT_MAGENTA).toBe('\x1b[95m');
      expect(ANSI.FG_BRIGHT_CYAN).toBe('\x1b[96m');
      expect(ANSI.FG_BRIGHT_WHITE).toBe('\x1b[97m');
    });

    it('should have bright background color constants', () => {
      expect(ANSI.BG_BRIGHT_BLACK).toBe('\x1b[100m');
      expect(ANSI.BG_BRIGHT_RED).toBe('\x1b[101m');
      expect(ANSI.BG_BRIGHT_GREEN).toBe('\x1b[102m');
      expect(ANSI.BG_BRIGHT_YELLOW).toBe('\x1b[103m');
      expect(ANSI.BG_BRIGHT_BLUE).toBe('\x1b[104m');
      expect(ANSI.BG_BRIGHT_MAGENTA).toBe('\x1b[105m');
      expect(ANSI.BG_BRIGHT_CYAN).toBe('\x1b[106m');
      expect(ANSI.BG_BRIGHT_WHITE).toBe('\x1b[107m');
    });

    it('should have color utility functions', () => {
      // RGB colors
      expect(ANSI.FG_COLOR(255, 0, 0)).toBe('\x1b[38;2;255;0;0m');
      expect(ANSI.BG_COLOR(0, 255, 0)).toBe('\x1b[48;2;0;255;0m');

      // 256 color mode
      expect(ANSI.FG_COLOR_256(16)).toBe('\x1b[38;5;16m');
      expect(ANSI.BG_COLOR_256(200)).toBe('\x1b[48;5;200m');
    });
  });

  describe('Erase Sequences', () => {
    it('should have erase display sequences', () => {
      expect(ANSI.ERASE_DISPLAY).toBe('\x1b[J');
      expect(ANSI.ERASE_DISPLAY_START).toBe('\x1b[1J');
      expect(ANSI.ERASE_DISPLAY_ALL).toBe('\x1b[2J');
      expect(ANSI.ERASE_SAVED_LINES).toBe('\x1b[3J');
    });

    it('should have erase line sequences', () => {
      expect(ANSI.ERASE_LINE).toBe('\x1b[K');
      expect(ANSI.ERASE_LINE_START).toBe('\x1b[1K');
      expect(ANSI.ERASE_LINE_ALL).toBe('\x1b[2K');
    });
  });

  describe('Advanced Features', () => {
    it('should have hyperlink function', () => {
      const expected = '\x1b]8;;https://example.com\x1b\\Click here\x1b]8;;\x1b\\';
      expect(ANSI.HYPERLINK('https://example.com', 'Click here')).toBe(expected);
    });

    it('should have title setting functions', () => {
      expect(ANSI.SET_TITLE('Window Title')).toBe('\x1b]0;Window Title\x07');
      expect(ANSI.SET_ICON_TITLE('Icon Title')).toBe('\x1b]1;Icon Title\x07');
      expect(ANSI.SET_WINDOW_TITLE('Window Title')).toBe('\x1b]2;Window Title\x07');
    });

    it('should have cursor style constants', () => {
      expect(ANSI.CURSOR_BLOCK).toBe('\x1b[2 q');
      expect(ANSI.CURSOR_UNDERLINE).toBe('\x1b[4 q');
      expect(ANSI.CURSOR_BAR).toBe('\x1b[6 q');
      expect(ANSI.CURSOR_BLINKING_BLOCK).toBe('\x1b[1 q');
      expect(ANSI.CURSOR_BLINKING_UNDERLINE).toBe('\x1b[3 q');
      expect(ANSI.CURSOR_BLINKING_BAR).toBe('\x1b[5 q');
    });

    it('should have private mode sequences', () => {
      expect(ANSI.CURSOR_HIDE).toBe('\x1b[?25l');
      expect(ANSI.CURSOR_SHOW).toBe('\x1b[?25h');
      expect(ANSI.SCREEN_SAVE).toBe('\x1b[?47h');
      expect(ANSI.SCREEN_RESTORE).toBe('\x1b[?47l');
      expect(ANSI.ALTERNATE_BUFFER_ENABLE).toBe('\x1b[?1049h');
      expect(ANSI.ALTERNATE_BUFFER_DISABLE).toBe('\x1b[?1049l');
    });

    it('should have terminal feature sequences', () => {
      expect(ANSI.ENABLE_MOUSE).toBe('\x1b[?1000h\x1b[?1002h\x1b[?1003h');
      expect(ANSI.DISABLE_MOUSE).toBe('\x1b[?1003l\x1b[?1002l\x1b[?1000l');
      expect(ANSI.ENABLE_LINE_WRAP).toBe('\x1b[?7h');
      expect(ANSI.DISABLE_LINE_WRAP).toBe('\x1b[?7l');
    });

    it('should have bell constant', () => {
      expect(ANSI.BELL).toBe('\x07');
    });
  });
});
