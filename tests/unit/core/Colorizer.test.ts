// File: tests/unit/core/Colorizer.test.ts

import { Colorizer } from '../../../src/core/Colorizer';
import { COLORS } from '../../../src/constants';
import * as terminalUtils from '../../../src/utils/terminal';
import type { ColorName, StylePreset } from '../../../src/types';

/**
 * Comprehensive test suite for the Colorizer class.
 * 
 * Tests static color application methods, style combinations, link detection,
 * and various formatting utilities.
 */
describe('Colorizer', () => {
  let originalGetFallbackStyle: typeof terminalUtils.getFallbackStyle;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Save original function
    originalGetFallbackStyle = terminalUtils.getFallbackStyle;
    
    // Mock getFallbackStyle to return consistent results
    jest.spyOn(terminalUtils, 'getFallbackStyle').mockImplementation((style: string): string => {
      // Return a fallback style for testing
      const fallbacks: Record<string, string> = {
        'italic': 'dim',
        'strikethrough': 'dim',
        'blink': 'bold'
      };
      return fallbacks[style] || style;
    });
  });

  afterEach(() => {
    // Restore original function
    jest.spyOn(terminalUtils, 'getFallbackStyle').mockImplementation(originalGetFallbackStyle);
  });

  describe('color', () => {
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

  describe('colorParts', () => {
    it('should color different parts of text separately', () => {
      const parts = [
        { text: 'Hello', color: 'red' as ColorName },
        { text: ' ', color: 'white' as ColorName },
        { text: 'World', color: 'blue' as ColorName }
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
        { text: ' World', color: 'blue' as ColorName }
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
        { text: ' Invalid', color: 'notAColor' as ColorName }
      ];
      
      const result = Colorizer.colorParts(parts);
      expect(result).toContain('Valid');
      expect(result).toContain(' Invalid');
      expect(result).toContain(COLORS.green);
      expect(result).toContain(COLORS.reset);
    });
  });

  describe('applyColors', () => {
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

    it('should handle style fallbacks', () => {
      // Use a style that's not directly available to trigger fallback
      const result = Colorizer.applyColors('Hello', ['nonexistent']);
      // Should check for fallback style
      expect(terminalUtils.getFallbackStyle).toHaveBeenCalledWith('nonexistent');
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
  });

  describe('applyPreset', () => {
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
        'info', 'success', 'warning', 'error', 'debug',
        'important', 'highlight', 'muted', 'special', 'code', 'header'
      ];

      presets.forEach(preset => {
        const result = Colorizer.applyPreset(`${preset} message`, preset);
        expect(result).toContain(`${preset} message`);
        expect(result).toContain(COLORS.reset);
      });
    });
  });

  describe('highlight', () => {
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

  describe('formatKeyValue', () => {
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

  describe('rainbow', () => {
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
      const longText = 'This is a very long text that should cycle through all rainbow colors multiple times';
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

  describe('isLinkLike', () => {
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
});