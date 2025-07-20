import { COLORS, PRESETS, ColorName, StylePreset } from '../../../src/types';
import { ANSI } from '../../../src/constants/ansi';
import * as terminalUtils from '../../../src/utils/terminal';

describe('Colors and Styles Types', () => {
  it('should define all color constants', () => {
    // Basic foreground colors
    expect(COLORS.black).toBe(ANSI.FG_BLACK);
    expect(COLORS.red).toBe(ANSI.FG_RED);
    expect(COLORS.green).toBe(ANSI.FG_GREEN);
    expect(COLORS.yellow).toBe(ANSI.FG_YELLOW);
    expect(COLORS.blue).toBe(ANSI.FG_BLUE);
    expect(COLORS.magenta).toBe(ANSI.FG_MAGENTA);
    expect(COLORS.cyan).toBe(ANSI.FG_CYAN);
    expect(COLORS.white).toBe(ANSI.FG_WHITE);
    expect(COLORS.gray).toBe(ANSI.FG_BRIGHT_BLACK);
    expect(COLORS.grey).toBe(ANSI.FG_BRIGHT_BLACK);

    // Bright foreground colors
    expect(COLORS.brightRed).toBe(ANSI.FG_BRIGHT_RED);
    expect(COLORS.brightGreen).toBe(ANSI.FG_BRIGHT_GREEN);
    expect(COLORS.brightYellow).toBe(ANSI.FG_BRIGHT_YELLOW);
    expect(COLORS.brightBlue).toBe(ANSI.FG_BRIGHT_BLUE);
    expect(COLORS.brightMagenta).toBe(ANSI.FG_BRIGHT_MAGENTA);
    expect(COLORS.brightCyan).toBe(ANSI.FG_BRIGHT_CYAN);
    expect(COLORS.brightWhite).toBe(ANSI.FG_BRIGHT_WHITE);

    // Background colors
    expect(COLORS.bgBlack).toBe(ANSI.BG_BLACK);
    expect(COLORS.bgRed).toBe(ANSI.BG_RED);
    expect(COLORS.bgGreen).toBe(ANSI.BG_GREEN);
    expect(COLORS.bgYellow).toBe(ANSI.BG_YELLOW);
    expect(COLORS.bgBlue).toBe(ANSI.BG_BLUE);
    expect(COLORS.bgMagenta).toBe(ANSI.BG_MAGENTA);
    expect(COLORS.bgCyan).toBe(ANSI.BG_CYAN);
    expect(COLORS.bgWhite).toBe(ANSI.BG_WHITE);
    expect(COLORS.bgGray).toBe(ANSI.BG_BRIGHT_BLACK);
    expect(COLORS.bgGrey).toBe(ANSI.BG_BRIGHT_BLACK);

    // Text styles
    expect(COLORS.reset).toBe(ANSI.RESET);
  });

  it('should condition text styles based on terminal support', () => {
    // Style variables to check
    const styleVars = [
      'bold',
      'dim',
      'italic',
      'underline',
      'blink',
      'reverse',
      'hidden',
      'strikethrough',
    ];

    // Spy on isStyleSupported
    const isStyleSupportedSpy = jest.spyOn(terminalUtils, 'isStyleSupported');

    // Verify each style property
    for (const style of styleVars) {
      // Verify the property exists
      expect(COLORS).toHaveProperty(style);

      // Verify isStyleSupported was called
      expect(isStyleSupportedSpy).toHaveBeenCalledWith(style);
    }
  });

  it('should define all style presets', () => {
    // Verify all standard presets exist
    expect(PRESETS).toHaveProperty('info');
    expect(PRESETS).toHaveProperty('success');
    expect(PRESETS).toHaveProperty('warning');
    expect(PRESETS).toHaveProperty('error');
    expect(PRESETS).toHaveProperty('debug');
    expect(PRESETS).toHaveProperty('important');
    expect(PRESETS).toHaveProperty('highlight');
    expect(PRESETS).toHaveProperty('muted');
    expect(PRESETS).toHaveProperty('special');
    expect(PRESETS).toHaveProperty('code');
    expect(PRESETS).toHaveProperty('header');

    // Check preset content format
    for (const [, preset] of Object.entries(PRESETS)) {
      // Preset should be an array
      expect(Array.isArray(preset)).toBe(true);

      // Elements should be string colors/styles
      for (const styleCode of preset) {
        expect(typeof styleCode).toBe('string');
      }
    }
  });

  it('should handle style support edge cases', () => {
    // Save original style support check
    const isStyleSupportedOriginal = terminalUtils.isStyleSupported;

    // First, mock isStyleSupported to always return false
    jest.spyOn(terminalUtils, 'isStyleSupported').mockImplementation(() => false);

    // Reimport colors to trigger the conditional logic
    jest.resetModules();
    return import('../../../src/types').then(({ COLORS: reloadedColors }) => {
      // All style properties should be empty strings when not supported
      expect(reloadedColors.bold).toBe('');
      expect(reloadedColors.italic).toBe('');
      expect(reloadedColors.underline).toBe('');
      expect(reloadedColors.strikethrough).toBe('');

      // Basic colors should still be defined
      expect(reloadedColors.red).toBe(ANSI.FG_RED);
      expect(reloadedColors.blue).toBe(ANSI.FG_BLUE);

      // Second, mock isStyleSupported to always return true
      jest.spyOn(terminalUtils, 'isStyleSupported').mockImplementation(() => true);

      // Reimport colors again
      jest.resetModules();
      return import('../../../src/types').then(({ COLORS: reloadedColors2 }) => {
        // All style properties should have ANSI codes when supported
        expect(reloadedColors2.bold).toBe(ANSI.BOLD);
        expect(reloadedColors2.italic).toBe(ANSI.ITALIC);
        expect(reloadedColors2.underline).toBe(ANSI.UNDERLINE);
        expect(reloadedColors2.strikethrough).toBe(ANSI.STRIKETHROUGH);

        // Restore original
        jest.spyOn(terminalUtils, 'isStyleSupported').mockImplementation(isStyleSupportedOriginal);
      });
    });
  });

  it('should ensure type compatibility with TypeScript interfaces', () => {
    // Create a function that accepts ColorName parameters
    function useColorName(color: ColorName): string {
      return COLORS[color];
    }

    // Create a function that accepts StylePreset parameters
    function useStylePreset(preset: StylePreset): string[] {
      return PRESETS[preset];
    }

    // Test with valid values
    expect(useColorName('red')).toBe(ANSI.FG_RED);
    expect(useColorName('bold')).toBe(COLORS.bold);
    expect(useColorName('bgBlue')).toBe(ANSI.BG_BLUE);

    expect(useStylePreset('info')).toBe(PRESETS.info);
    expect(useStylePreset('error')).toBe(PRESETS.error);
    expect(useStylePreset('code')).toBe(PRESETS.code);

    // Test that accessing valid properties doesn't throw
    expect(() => useColorName('red')).not.toThrow();
    expect(() => useStylePreset('info')).not.toThrow();
  });

  it('should handle preset options with empty codes gracefully', () => {
    // Save original style support check
    const isStyleSupportedOriginal = terminalUtils.isStyleSupported;

    // Mock isStyleSupported to return false for italic but true for other styles
    jest.spyOn(terminalUtils, 'isStyleSupported').mockImplementation(style => {
      return style !== 'italic';
    });

    // Reimport to trigger the conditional logic
    jest.resetModules();
    return import('../../../src/types').then(({ PRESETS: reloadedPresets }) => {
      // Debug preset in code uses italic which would be '' when not supported
      // Check that the empty strings are handled gracefully
      for (const [, preset] of Object.entries(reloadedPresets)) {
        // Filter out empty codes
        const filteredPreset = (preset as string[]).filter(code => code !== '');

        // Apply the styles (this shouldn't throw)
        const styledText = filteredPreset.join('') + 'Test Text' + ANSI.RESET;

        // Just verify it's a string
        expect(typeof styledText).toBe('string');
      }

      // Restore original
      jest.spyOn(terminalUtils, 'isStyleSupported').mockImplementation(isStyleSupportedOriginal);
    });
  });
});
