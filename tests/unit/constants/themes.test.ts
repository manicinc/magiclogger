// File: tests/constants/themes.test.ts

import {
  DEFAULT_THEME,
  DARK_THEME,
  LIGHT_THEME,
  MINIMAL_THEME,
} from 'magiclogger/constants/themes';
import type { ColorName } from 'magiclogger/types';

describe('Theme Constants', () => {
  describe('DEFAULT_THEME', () => {
    it('should have all required log level styles', () => {
      expect(DEFAULT_THEME.info).toBeDefined();
      expect(DEFAULT_THEME.success).toBeDefined();
      expect(DEFAULT_THEME.warning).toBeDefined();
      expect(DEFAULT_THEME.error).toBeDefined();
      expect(DEFAULT_THEME.debug).toBeDefined();
    });

    it('should have correct style arrays for log levels', () => {
      expect(DEFAULT_THEME.info).toEqual(['cyan', 'bold']);
      expect(DEFAULT_THEME.success).toEqual(['green', 'bold']);
      expect(DEFAULT_THEME.warning).toEqual(['yellow', 'bold']);
      expect(DEFAULT_THEME.error).toEqual(['brightRed', 'bold']);
      expect(DEFAULT_THEME.debug).toEqual(['gray', 'italic']);
    });

    it('should have UI element styles', () => {
      expect(DEFAULT_THEME.header).toEqual(['brightWhite', 'bgBlue', 'bold']);
      expect(DEFAULT_THEME.link).toEqual(['brightCyan', 'underline']);
      expect(DEFAULT_THEME.separator).toEqual(['gray']);
    });

    it('should have data display styles', () => {
      expect(DEFAULT_THEME.key).toEqual(['cyan']);
      expect(DEFAULT_THEME.value).toEqual(['white']);
      expect(DEFAULT_THEME.number).toEqual(['yellow']);
      expect(DEFAULT_THEME.string).toEqual(['green']);
      expect(DEFAULT_THEME.boolean).toEqual(['magenta']);
      expect(DEFAULT_THEME.null).toEqual(['gray', 'italic']);
    });

    it('should have status styles', () => {
      expect(DEFAULT_THEME.active).toEqual(['green', 'bold']);
      expect(DEFAULT_THEME.inactive).toEqual(['gray', 'dim']);
      expect(DEFAULT_THEME.pending).toEqual(['yellow']);
      expect(DEFAULT_THEME.complete).toEqual(['green']);
      expect(DEFAULT_THEME.failed).toEqual(['red']);
    });

    it('should have special styles', () => {
      expect(DEFAULT_THEME.important).toEqual(['magenta', 'bold', 'underline']);
      expect(DEFAULT_THEME.highlight).toEqual(['brightYellow', 'bold']);
      expect(DEFAULT_THEME.muted).toEqual(['dim']);
      expect(DEFAULT_THEME.special).toEqual(['brightCyan', 'bold']);
      expect(DEFAULT_THEME.code).toEqual(['brightGreen']);
    });

    it('should only contain valid color names', () => {
      const validColors = new Set<ColorName>([
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        'gray',
        'brightBlack',
        'brightRed',
        'brightGreen',
        'brightYellow',
        'brightBlue',
        'brightMagenta',
        'brightCyan',
        'brightWhite',
        'bgBlack',
        'bgRed',
        'bgGreen',
        'bgYellow',
        'bgBlue',
        'bgMagenta',
        'bgCyan',
        'bgWhite',
        'bold',
        'dim',
        'italic',
        'underline',
        'blink',
        'reverse',
        'hidden',
        'strikethrough',
        'inverse',
      ]);

      const styleArrays = Object.values(DEFAULT_THEME).filter(Array.isArray) as string[][];
      styleArrays.forEach(styles => {
        styles.forEach(style => {
          expect(validColors.has(style as ColorName)).toBe(true);
        });
      });
    });
  });

  describe('DARK_THEME', () => {
    it('should extend DEFAULT_THEME', () => {
      // Check that it has all DEFAULT_THEME keys
      Object.keys(DEFAULT_THEME).forEach(key => {
        expect(DARK_THEME).toHaveProperty(key);
      });
    });

    it('should override specific styles for dark theme', () => {
      expect(DARK_THEME.info).toEqual(['brightCyan']);
      expect(DARK_THEME.warn).toEqual(['brightYellow']);
      expect(DARK_THEME.error).toEqual(['brightRed']);
      expect(DARK_THEME.debug).toEqual(['gray']);
      expect(DARK_THEME.success).toEqual(['brightGreen']);
    });

    it('should maintain other styles from DEFAULT_THEME', () => {
      expect(DARK_THEME.header).toEqual(DEFAULT_THEME.header);
      expect(DARK_THEME.link).toEqual(DEFAULT_THEME.link);
      expect(DARK_THEME.separator).toEqual(DEFAULT_THEME.separator);
    });
  });

  describe('LIGHT_THEME', () => {
    it('should extend DEFAULT_THEME', () => {
      Object.keys(DEFAULT_THEME).forEach(key => {
        expect(LIGHT_THEME).toHaveProperty(key);
      });
    });

    it('should override specific styles for light theme', () => {
      expect(LIGHT_THEME.info).toEqual(['blue']);
      expect(LIGHT_THEME.warn).toEqual(['yellow']);
      expect(LIGHT_THEME.error).toEqual(['red']);
      expect(LIGHT_THEME.debug).toEqual(['gray']);
      expect(LIGHT_THEME.success).toEqual(['green']);
    });

    it('should use non-bright colors for better visibility on light backgrounds', () => {
      // Light theme should avoid bright colors which may be hard to see on light backgrounds
      const logLevelStyles = [
        LIGHT_THEME.info,
        LIGHT_THEME.warn,
        LIGHT_THEME.error,
        LIGHT_THEME.debug,
        LIGHT_THEME.success,
      ];

      logLevelStyles.forEach(styles => {
        styles.forEach(style => {
          // Skip style attributes, only validate color tokens
          if (typeof style === 'string' && (style.includes('bold') || style.includes('italic')))
            return;
          expect((style as string).startsWith('bright')).toBe(false);
        });
      });
    });
  });

  describe('MINIMAL_THEME', () => {
    it('should extend DEFAULT_THEME', () => {
      Object.keys(DEFAULT_THEME).forEach(key => {
        expect(MINIMAL_THEME).toHaveProperty(key);
      });
    });

    it('should use minimal styling (white) for all log levels', () => {
      expect(MINIMAL_THEME.info).toEqual(['white']);
      expect(MINIMAL_THEME.warn).toEqual(['white']);
      expect(MINIMAL_THEME.error).toEqual(['white']);
      expect(MINIMAL_THEME.debug).toEqual(['white']);
      expect(MINIMAL_THEME.success).toEqual(['white']);
    });

    it('should maintain other non-log-level styles from DEFAULT_THEME', () => {
      expect(MINIMAL_THEME.header).toEqual(DEFAULT_THEME.header);
      expect(MINIMAL_THEME.link).toEqual(DEFAULT_THEME.link);
      expect(MINIMAL_THEME.key).toEqual(DEFAULT_THEME.key);
      expect(MINIMAL_THEME.value).toEqual(DEFAULT_THEME.value);
    });
  });

  describe('Theme Structure', () => {
    const themes = [DEFAULT_THEME, DARK_THEME, LIGHT_THEME, MINIMAL_THEME];

    it('should have consistent structure for all themes', () => {
      const defaultKeys = Object.keys(DEFAULT_THEME).sort();
      themes.forEach(theme => {
        const themeKeys = Object.keys(theme).sort();
        expect(themeKeys).toEqual(defaultKeys);
      });
    });

    it('should have non-empty style arrays for all themes', () => {
      themes.forEach(theme => {
        (Object.entries(theme) as Array<[string, string[]]>).forEach(([_key, value]) => {
          expect(Array.isArray(value)).toBe(true);
          expect(value.length).toBeGreaterThan(0);
          value.forEach(style => {
            expect(typeof style).toBe('string');
            expect((style as string).length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should not have duplicate styles in arrays for all themes', () => {
      themes.forEach(theme => {
        (Object.entries(theme) as Array<[string, string[]]>).forEach(([_key, value]) => {
          const uniqueStyles = new Set(value);
          expect(uniqueStyles.size).toBe(value.length);
        });
      });
    });
  });

  describe('Theme Compatibility', () => {
    it('should be compatible with TypeScript types', () => {
      // This test ensures that themes match the expected type structure
      const testTheme: Record<string, ColorName[]> = DEFAULT_THEME;
      expect(testTheme).toBeDefined();

      // Ensure all values are ColorName arrays
      Object.values(testTheme).forEach(value => {
        expect(Array.isArray(value)).toBe(true);
      });
    });

    it('should be JSON serializable', () => {
      const themes = [DEFAULT_THEME, DARK_THEME, LIGHT_THEME, MINIMAL_THEME];

      themes.forEach(theme => {
        const json = JSON.stringify(theme);
        const parsed = JSON.parse(json);
        expect(parsed).toEqual(theme);
      });
    });

    it('should be mergeable for customization', () => {
      const customTheme: Record<string, ColorName[]> = {
        ...DEFAULT_THEME,
        info: ['magenta', 'bold'],
        custom: ['cyan', 'underline'],
      };

      expect(customTheme.info).toEqual(['magenta', 'bold']);
      expect(customTheme.success).toEqual(DEFAULT_THEME.success);
      expect(customTheme.custom).toEqual(['cyan', 'underline']);
    });
  });
});
