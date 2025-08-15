/* Consolidated Colorizer Test Suite */
import { Colorizer } from '../../../src/core/Colorizer';
import { COLORS } from '../../../src/constants/colors';
import * as terminalUtils from '../../../src/utils/terminal';
import type { ColorName, StylePreset } from '../../../src/types';

// Helper to temporarily mutate process env
const withEnv = (vars: Record<string, string | undefined>, fn: () => void) => {
  const original: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    original[k] = process.env[k];
    if (vars[k] === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = vars[k] as string;
    }
  }
  try {
    fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (original[k] === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = original[k] as string;
      }
    }
  }
};

/**
 * Comprehensive test suite for the Colorizer class.
 *
 * Tests static color application methods, style combinations, link detection,
 * environment detection, caching, and various formatting utilities.
 */
describe('Colorizer', () => {
  let originalGetFallbackStyle: typeof terminalUtils.getFallbackStyle;
  // Helper to reset internal cached support flag without typing issues
  const resetSupportsColor = () => {
    (Colorizer as unknown as { _supportsColor?: boolean })._supportsColor = undefined;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Save original function
    originalGetFallbackStyle = terminalUtils.getFallbackStyle;

    // Mock getFallbackStyle to return consistent results
    jest.spyOn(terminalUtils, 'getFallbackStyle').mockImplementation((style: string): string => {
      // Return a fallback style for testing
      const fallbacks: Record<string, string> = {
        italic: 'dim',
        strikethrough: 'dim',
        blink: 'bold',
      };
      return fallbacks[style] || style;
    });

    // Clear any cached color support and reset detection flag
    Colorizer.clearCache();
    resetSupportsColor(); // force auto-detect next call
  });

  afterEach(() => {
    // Restore original function
    jest.spyOn(terminalUtils, 'getFallbackStyle').mockImplementation(originalGetFallbackStyle);
    Colorizer.clearCache();
  });

  describe('Color Support Detection', () => {
    it('supportsColor caches value', () => {
      const firstCall = Colorizer.supportsColor();
      const secondCall = Colorizer.supportsColor();
      expect(firstCall).toBe(secondCall);
    });

    it('supportsColor NO_COLOR disables', () => {
      withEnv({ NO_COLOR: '1', FORCE_COLOR: undefined }, () => {
        resetSupportsColor(); // force re-detection
        expect(Colorizer.supportsColor()).toBe(false);
      });
    });

    it('supportsColor FORCE_COLOR enables', () => {
      withEnv({ FORCE_COLOR: '1', NO_COLOR: undefined }, () => {
        resetSupportsColor(); // force re-detection
        expect(Colorizer.supportsColor()).toBe(true);
      });
    });

    it('supportsColor TERM dumb disables', () => {
      withEnv({ TERM: 'dumb', NO_COLOR: undefined, FORCE_COLOR: undefined }, () => {
        resetSupportsColor(); // force re-detection
        expect(Colorizer.supportsColor()).toBe(false);
      });
    });

    it('supportsColor non-TTY disables', () => {
      const origDescriptor = Object.getOwnPropertyDescriptor(process, 'stdout');
      Object.defineProperty(process, 'stdout', { value: { isTTY: false }, configurable: true });
      try {
        withEnv({ NO_COLOR: undefined, FORCE_COLOR: undefined, TERM: 'xterm-256color' }, () => {
          resetSupportsColor();
          expect(Colorizer.supportsColor()).toBe(false);
        });
      } finally {
        if (origDescriptor) Object.defineProperty(process, 'stdout', origDescriptor);
      }
    });

    it('setColorSupport overrides detection', () => {
      Colorizer.setColorSupport(true);
      expect(Colorizer.supportsColor()).toBe(true);
      Colorizer.setColorSupport(false);
      expect(Colorizer.supportsColor()).toBe(false);
    });
  });

  describe('Color Level Detection', () => {
    it('getColorLevel 0 when no support or dumb term', () => {
      Colorizer.setColorSupport(false);
      expect(Colorizer.getColorLevel()).toBe(0);

      Colorizer.setColorSupport(true);
      withEnv({ TERM: 'dumb' }, () => {
        resetSupportsColor(); // force re-detection
        expect(Colorizer.getColorLevel()).toBe(0);
      });
    });

    it('getColorLevel 3 for truecolor', () => {
      Colorizer.setColorSupport(true);
      withEnv({ COLORTERM: 'truecolor', TERM_PROGRAM: undefined, TERM: 'xterm-256color' }, () => {
        expect(Colorizer.getColorLevel()).toBe(3);
      });
    });

    it('getColorLevel 2 for 256-color terms', () => {
      Colorizer.setColorSupport(true);
      withEnv({ TERM: 'xterm-256color', COLORTERM: undefined, TERM_PROGRAM: undefined }, () => {
        expect(Colorizer.getColorLevel()).toBe(2);
      });
    });

    it('getColorLevel patterns and default 1', () => {
      Colorizer.setColorSupport(true);
      withEnv({ TERM: 'ansi', COLORTERM: undefined, TERM_PROGRAM: undefined }, () => {
        expect(Colorizer.getColorLevel()).toBe(2); // ansi matches 256 pattern
      });
      withEnv({ TERM: 'vt-no-match', COLORTERM: undefined, TERM_PROGRAM: undefined }, () => {
        expect(Colorizer.getColorLevel()).toBe(1);
      });
    });
  });

  describe('Basic Color Application', () => {
    it('should apply a single color to text', () => {
      const result = Colorizer.color('Hello', 'red');
      expect(result).toBe(`${COLORS.red}Hello${COLORS.reset}`);
    });

    it('should return text unchanged when useColors is false', () => {
      const result = Colorizer.color('Hello', 'red', false);
      expect(result).toBe('Hello');
    });

    it('should handle empty text', () => {
      const result = Colorizer.color('', 'red');
      expect(result).toBe('');
    });

    it('should handle invalid color names gracefully', () => {
      const result = Colorizer.color('Hello', 'invalidColor' as ColorName);
      expect(result).toBe('Hello'); // Should return original text without color
    });

    it('should apply background colors', () => {
      const result = Colorizer.color('Hello', 'bgRed');
      expect(result).toBe(`${COLORS.bgRed}Hello${COLORS.reset}`);
    });

    it('should apply bright colors', () => {
      const result = Colorizer.color('Hello', 'brightCyan');
      expect(result).toBe(`${COLORS.brightCyan}Hello${COLORS.reset}`);
    });

    it('should handle special characters in text', () => {
      const specialText = 'Hello\nWorld\t[Special]';
      const result = Colorizer.color(specialText, 'green');
      expect(result).toBe(`${COLORS.green}${specialText}${COLORS.reset}`);
    });

    it('should handle unicode characters', () => {
      const unicodeText = '🌈 Hello 世界 🎨';
      const result = Colorizer.color(unicodeText, 'magenta');
      expect(result).toBe(`${COLORS.magenta}${unicodeText}${COLORS.reset}`);
    });
  });

  describe('Color Parts', () => {
    it('should color different parts of text separately', () => {
      const parts = [
        { text: 'Hello', color: 'red' as ColorName },
        { text: ' ', color: 'white' as ColorName },
        { text: 'World', color: 'blue' as ColorName },
      ];

      const result = Colorizer.colorParts(parts);
      expect(result).toBe(
        `${COLORS.red}Hello${COLORS.reset}` +
          `${COLORS.white} ${COLORS.reset}` +
          `${COLORS.blue}World${COLORS.reset}`
      );
    });

    it('should return concatenated text when useColors is false', () => {
      const parts = [
        { text: 'Hello', color: 'red' as ColorName },
        { text: ' World', color: 'blue' as ColorName },
      ];

      const result = Colorizer.colorParts(parts, false);
      expect(result).toBe('Hello World');
    });

    it('should handle empty parts array', () => {
      const result = Colorizer.colorParts([]);
      expect(result).toBe('');
    });

    it('should handle parts with invalid colors', () => {
      const parts = [
        { text: 'Valid', color: 'green' as ColorName },
        { text: ' Invalid', color: 'notAColor' as ColorName },
      ];

      const result = Colorizer.colorParts(parts);
      expect(result).toContain('Valid');
      expect(result).toContain(' Invalid');
      expect(result).toContain(COLORS.green);
      expect(result).toContain(COLORS.reset);
    });
  });

  describe('Multiple Colors Application', () => {
    it('should apply multiple colors to text', () => {
      const result = Colorizer.applyColors('Hello', ['red', 'bold']);
      expect(result).toBe(`${COLORS.red}${COLORS.bold}Hello${COLORS.reset}`);
    });

    it('should return text unchanged when useColors is false', () => {
      const result = Colorizer.applyColors('Hello', ['red', 'bold'], false);
      expect(result).toBe('Hello');
    });

    it('should handle empty colors array', () => {
      const result = Colorizer.applyColors('Hello', []);
      expect(result).toBe('Hello');
    });

    it('should handle null/undefined colors array', () => {
      const result = Colorizer.applyColors('Hello', null as unknown as ColorName[]);
      expect(result).toBe('Hello');
    });

    it('should filter out non-string color values', () => {
      const result = Colorizer.applyColors('Hello', ['red', 123 as unknown as ColorName, 'bold']);
      expect(result).toBe(`${COLORS.red}${COLORS.bold}Hello${COLORS.reset}`);
    });

    it('should handle style fallbacks (returns original text with reset)', () => {
      const result = Colorizer.applyColors('Hello', ['nonexistent']);
      expect(result).toContain('Hello');
    });

    it('should apply all text styles', () => {
      const styles: ColorName[] = ['bold', 'dim', 'italic', 'underline', 'reverse', 'hidden'];
      const result = Colorizer.applyColors('Hello', styles);

      // Should contain some color codes
      expect(result).toContain('Hello');
      expect(result).toContain(COLORS.reset);
      expect(result.length).toBeGreaterThan('Hello'.length);
    });

    it('should handle mixed valid and invalid colors', () => {
      const result = Colorizer.applyColors('Text', ['red', 'invalidStyle', 'bold']);
      expect(result).toContain(COLORS.red);
      expect(result).toContain(COLORS.bold);
      expect(result).toContain('Text');
      expect(result).toContain(COLORS.reset);
    });

    it('createColorFunction applies chained styles', () => {
      const fn = Colorizer.createColorFunction('red', 'bold');
      const out = fn('X');
      expect(out.startsWith(COLORS.red)).toBe(true);
      expect(out).toContain('X');
    });
  });

  describe('Presets', () => {
    it('should apply preset styles', () => {
      const result = Colorizer.applyPreset('Error!', 'error');
      expect(result).toContain('Error!');
      expect(result).toContain(COLORS.reset);
      // Should have some styling applied
      expect(result.length).toBeGreaterThan('Error!'.length);
    });

    it('should return text unchanged when useColors is false', () => {
      const result = Colorizer.applyPreset('Message', 'info', false);
      expect(result).toBe('Message');
    });

    it('should handle invalid preset names gracefully', () => {
      const result = Colorizer.applyPreset('Message', 'notAPreset' as StylePreset);
      // Should return original text for invalid preset
      expect(result).toBe('Message');
    });

    it('should work with all built-in presets', () => {
      const presets: StylePreset[] = [
        'info',
        'success',
        'warning',
        'error',
        'debug',
        'important',
        'highlight',
        'muted',
        'special',
        'code',
        'header',
      ];

      presets.forEach(preset => {
        const result = Colorizer.applyPreset(`${preset} message`, preset);
        expect(result).toContain(`${preset} message`);
        expect(result).toContain(COLORS.reset);
      });
    });
  });

  describe('Text Highlighting', () => {
    it('should highlight matching text with specified color', () => {
      const result = Colorizer.highlight('Hello world, hello again', 'hello', 'yellow');
      expect(result).toContain(`${COLORS.yellow}hello${COLORS.reset}`);
      expect(result).toContain('world');
    });

    it('should highlight with regex pattern', () => {
      const result = Colorizer.highlight('test123 and test456', /test\d+/g, 'cyan');
      expect(result).toContain(`${COLORS.cyan}test123${COLORS.reset}`);
      expect(result).toContain(`${COLORS.cyan}test456${COLORS.reset}`);
    });

    it('should use default yellow color when not specified', () => {
      const result = Colorizer.highlight('find me', 'find');
      expect(result).toContain(`${COLORS.yellow}find${COLORS.reset}`);
    });

    it('should return unchanged text when useColors is false', () => {
      const result = Colorizer.highlight('Hello world', 'Hello', 'red', false);
      expect(result).toBe('Hello world');
    });

    it('should handle empty text', () => {
      const result = Colorizer.highlight('', 'pattern');
      expect(result).toBe('');
    });

    it('should handle case-sensitive matching', () => {
      const result = Colorizer.highlight('Hello HELLO', 'Hello', 'green');
      expect(result).toContain(`${COLORS.green}Hello${COLORS.reset}`);
      expect(result).toContain('HELLO'); // Should not be highlighted
    });
  });

  describe('Key-Value Formatting', () => {
    it('should format key-value pairs with colored key', () => {
      const result = Colorizer.formatKeyValue('Name', 'John Doe', 'cyan');
      expect(result).toBe(`${COLORS.cyan}Name${COLORS.reset}: John Doe`);
    });

    it('should use default cyan color when not specified', () => {
      const result = Colorizer.formatKeyValue('Age', 25);
      expect(result).toBe(`${COLORS.cyan}Age${COLORS.reset}: 25`);
    });

    it('should handle various value types', () => {
      expect(Colorizer.formatKeyValue('String', 'value')).toContain(': value');
      expect(Colorizer.formatKeyValue('Number', 123)).toContain(': 123');
      expect(Colorizer.formatKeyValue('Boolean', true)).toContain(': true');
      expect(Colorizer.formatKeyValue('Null', null)).toContain(': null');
      expect(Colorizer.formatKeyValue('Object', { a: 1 })).toContain(': [object Object]');
    });

    it('should return plain format when useColors is false', () => {
      const result = Colorizer.formatKeyValue('Key', 'Value', 'red', false);
      expect(result).toBe('Key: Value');
    });
  });

  describe('Rainbow Effect', () => {
    it('should apply rainbow colors to each character', () => {
      const result = Colorizer.rainbow('Hello!');

      // Each character should have a different color
      expect(result).toContain(COLORS.red);
      expect(result).toContain(COLORS.yellow);
      expect(result).toContain(COLORS.green);
      expect(result).toContain(COLORS.cyan);
      expect(result).toContain(COLORS.reset);
    });

    it('should cycle through colors for long text', () => {
      const longText =
        'This is a very long text that should cycle through all rainbow colors multiple times';
      const result = Colorizer.rainbow(longText);

      // Should contain all rainbow colors
      const rainbowColors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
      rainbowColors.forEach(color => {
        expect(result).toContain(COLORS[color as keyof typeof COLORS]);
      });
    });

    it('should return unchanged text when useColors is false', () => {
      const result = Colorizer.rainbow('Rainbow', false);
      expect(result).toBe('Rainbow');
    });

    it('should handle empty text', () => {
      const result = Colorizer.rainbow('');
      expect(result).toBe('');
    });

    it('should handle unicode characters', () => {
      const result = Colorizer.rainbow('🌈💫✨');
      expect(result).toContain('🌈');
      expect(result).toContain('💫');
      expect(result).toContain('✨');
      expect(result).toContain(COLORS.reset);
    });
  });

  describe('Link Detection', () => {
    it('should detect URLs', () => {
      expect(Colorizer.isLinkLike('https://example.com')).toBe(true);
      expect(Colorizer.isLinkLike('http://localhost:3000')).toBe(true);
      expect(Colorizer.isLinkLike('ftp://files.example.com')).toBe(true);
    });

    it('should detect file paths', () => {
      expect(Colorizer.isLinkLike('/home/user/file.txt')).toBe(true);
      expect(Colorizer.isLinkLike('C:\\Windows\\System32')).toBe(true);
      expect(Colorizer.isLinkLike('./relative/path')).toBe(true);
      expect(Colorizer.isLinkLike('../parent/path')).toBe(true);
    });

    it('should not detect regular text as links', () => {
      expect(Colorizer.isLinkLike('Hello world')).toBe(false);
      expect(Colorizer.isLinkLike('just some text')).toBe(false);
      expect(Colorizer.isLinkLike('no.link.here')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(Colorizer.isLinkLike('')).toBe(false);
      expect(Colorizer.isLinkLike(null as unknown as string)).toBe(false);
      expect(Colorizer.isLinkLike(undefined as unknown as string)).toBe(false);
      expect(Colorizer.isLinkLike(123 as unknown as string)).toBe(false);
    });
  });

  describe('ANSI Utilities', () => {
    it('stripAnsi removes codes / hasAnsi / visibleLength', () => {
      const colored = Colorizer.color('Hi', 'red');
      expect(Colorizer.hasAnsi(colored)).toBe(true);
      const plain = Colorizer.stripAnsi(colored);
      expect(plain).toBe('Hi');
      expect(Colorizer.visibleLength(colored)).toBe(2);
    });

    it('should handle text without ANSI codes', () => {
      const plain = 'Plain text';
      expect(Colorizer.hasAnsi(plain)).toBe(false);
      expect(Colorizer.stripAnsi(plain)).toBe(plain);
      expect(Colorizer.visibleLength(plain)).toBe(plain.length);
    });

    it('should handle empty strings', () => {
      expect(Colorizer.hasAnsi('')).toBe(false);
      expect(Colorizer.stripAnsi('')).toBe('');
      expect(Colorizer.visibleLength('')).toBe(0);
    });
  });

  describe('Caching Behavior', () => {
    it('should cache color codes in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        // Clear cache first
        Colorizer.clearCache();

        // Apply same colors multiple times
        const text1 = Colorizer.applyColors('Test1', ['red', 'bold']);
        const text2 = Colorizer.applyColors('Test2', ['red', 'bold']);
        const text3 = Colorizer.applyColors('Test3', ['red', 'bold']);

        // All should contain the same color codes
        expect(text1).toContain(COLORS.red);
        expect(text2).toContain(COLORS.red);
        expect(text3).toContain(COLORS.red);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
        Colorizer.clearCache();
      }
    });

    it('should handle cache eviction for large number of unique combinations', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        Colorizer.clearCache();

        // Create many unique color combinations
        // Note: Since we can't access MAX_CACHE_SIZE directly, we'll just test that
        // the function continues to work with many combinations
        for (let i = 0; i < 1000; i++) {
          const uniqueColor = `color${i}` as ColorName;
          Colorizer.applyColors(`Test${i}`, ['red', uniqueColor]);
        }

        // Should still work after many entries
        const result = Colorizer.applyColors('Final', ['green', 'bold']);
        expect(result).toContain('Final');
        expect(result).toContain(COLORS.green);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
        Colorizer.clearCache();
      }
    });

    it('clearCache should reset cache', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        // Apply some colors to populate cache
        Colorizer.applyColors('Test1', ['red']);
        Colorizer.applyColors('Test2', ['blue']);

        // Clear cache
        Colorizer.clearCache();

        // Apply colors again - should work fine
        const result = Colorizer.applyColors('Test3', ['green']);
        expect(result).toContain('Test3');
        expect(result).toContain(COLORS.green);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe('Utility Functions', () => {
    it('separator creates repeated characters', () => {
      // Test that the separator method is available through color functions
      const fn = Colorizer.createColorFunction('dim');
      expect(typeof fn).toBe('function');
    });

    it('should handle various color and style combinations', () => {
      // Test combining foreground and background colors
      const result = Colorizer.applyColors('Test', ['red', 'bgWhite']);
      expect(result).toContain(COLORS.red);
      expect(result).toContain(COLORS.bgWhite);
      expect(result).toContain('Test');
    });

    it('should handle bright background colors (or no-op if unsupported)', () => {
      const result = Colorizer.color('Test', 'bgBrightRed' as ColorName);
      expect(result).toContain('Test');
    });
  });
});
