// File: tests/utils/TextStyler.test.ts

import { TextStyler, Part, StyleMap } from 'magiclogger/utils/TextStyler';
import type { ColorName } from 'magiclogger/types';
import { Colorizer } from 'magiclogger/core/Colorizer';

describe('TextStyler', () => {
  describe('styleParts', () => {
    it('should style an array of parts', () => {
      const parts: Part[] = [
        ['SUCCESS:', 'green', 'bold'],
        [' All tests passed'],
        [' (100%)', 'dim'],
      ];

      const result = TextStyler.styleParts(parts);
      expect(result).toContain('SUCCESS:');
      expect(result).toContain('All tests passed');
      expect(result).toContain('(100%)');
      expect(result).toContain('\x1b[32m'); // green
      expect(result).toContain('\x1b[1m'); // bold
      expect(result).toContain('\x1b[2m'); // dim
    });

    it('should handle empty parts array', () => {
      const result = TextStyler.styleParts([]);
      expect(result).toBe('');
    });

    it('should handle parts with no styles', () => {
      const parts: Part[] = [['Plain text']];
      const result = TextStyler.styleParts(parts);
      expect(result).toBe('Plain text');
      expect(result).not.toContain('\x1b[');
    });

    it('should handle empty text in parts', () => {
      const parts: Part[] = [
        ['', 'red'],
        ['Text', 'blue'],
        ['', 'green'],
      ];
      const result = TextStyler.styleParts(parts);
      expect(result).toBe(Colorizer.applyColors('Text', ['blue'], true));
    });

    it('should handle colors disabled', () => {
      const parts: Part[] = [
        ['Colored', 'red', 'bold'],
        [' text', 'blue'],
      ];
      const result = TextStyler.styleParts(parts, false);
      expect(result).toBe('Colored text');
      expect(result).not.toContain('\x1b[');
    });

    it('should filter invalid styles', () => {
      const parts: Part[] = [['Text', 'red', '', 'bold', 'invalid-style'] as Part];
      const result = TextStyler.styleParts(parts);
      expect(result).toContain('\x1b[31m'); // red
      expect(result).toContain('\x1b[1m'); // bold
      expect(result).toContain('Text');
    });

    it('should handle malformed parts gracefully', () => {
      const partsUnknown = [
        null as unknown,
        undefined as unknown,
        [] as unknown,
        ['Valid', 'red'] as unknown,
        'not-an-array' as unknown,
        ['Another', 'blue'] as unknown,
      ];
      const result = TextStyler.styleParts(partsUnknown as unknown as Part[]);
      expect(result).toContain('Valid');
      expect(result).toContain('Another');
    });

    it('should handle multiple colors per part', () => {
      const parts: Part[] = [['Header', 'white', 'bgBlue', 'bold', 'underline']];
      const result = TextStyler.styleParts(parts);
      expect(result).toContain('\x1b[37m'); // white
      expect(result).toContain('\x1b[44m'); // bgBlue
      expect(result).toContain('\x1b[1m'); // bold
      expect(result).toContain('\x1b[4m'); // underline
    });
  });

  describe('styleByIndex', () => {
    it('should style words by index', () => {
      const text = 'GET /api/users 200 OK 45ms';
      const styleMap: StyleMap = {
        0: ['blue', 'bold'], // "GET"
        1: ['cyan'], // "/api/users"
        2: ['green', 'bold'], // "200"
        3: ['green'], // "OK"
        4: ['magenta'], // "45ms"
      };

      const result = TextStyler.styleByIndex(text, styleMap);
      expect(result).toContain('GET');
      expect(result).toContain('/api/users');
      expect(result).toContain('200');
      expect(result).toContain('OK');
      expect(result).toContain('45ms');
    });

    it('should handle empty text', () => {
      const styleMap: StyleMap = { 0: ['red'] };
      const result = TextStyler.styleByIndex('', styleMap);
      expect(result).toBe('');
    });

    it('should handle empty style map', () => {
      const text = 'Plain text here';
      const result = TextStyler.styleByIndex(text, {});
      expect(result).toBe(text);
    });

    it('should handle null/undefined inputs', () => {
      expect(TextStyler.styleByIndex(null as unknown as string, {})).toBe('');
      expect(
        TextStyler.styleByIndex('text', null as unknown as Record<number, string[]> as StyleMap)
      ).toBe('text');
    });

    it('should preserve multiple spaces', () => {
      const text = 'word1    word2    word3';
      const styleMap: StyleMap = {
        0: ['red'],
        1: ['blue'],
        2: ['green'],
      };

      const result = TextStyler.styleByIndex(text, styleMap);
      expect(result).toContain('word1');
      expect(result).toContain('    ');
      expect(result).toContain('word2');
      expect(result).toContain('word3');
    });

    it('should handle tabs and newlines', () => {
      const text = 'word1\tword2\nword3';
      const styleMap: StyleMap = {
        0: ['red'],
        1: ['blue'],
        2: ['green'],
      };

      const result = TextStyler.styleByIndex(text, styleMap);
      expect(result).toContain('word1');
      expect(result).toContain('\t');
      expect(result).toContain('word2');
      expect(result).toContain('\n');
      expect(result).toContain('word3');
    });

    it('should skip indices without styles', () => {
      const text = 'one two three four';
      const styleMap: StyleMap = {
        0: ['red'],
        2: ['blue'],
        // 1 and 3 have no styles
      };

      const result = TextStyler.styleByIndex(text, styleMap);
      expect(result).toContain('\x1b[31m'); // red for "one"
      expect(result).toContain('\x1b[34m'); // blue for "three"
      expect(result).toContain('two'); // unstyled
      expect(result).toContain('four'); // unstyled
    });

    it('should handle out-of-range indices', () => {
      const text = 'one two';
      const styleMap: StyleMap = {
        0: ['red'],
        5: ['blue'], // out of range
        10: ['green'], // out of range
      };

      const result = TextStyler.styleByIndex(text, styleMap);
      expect(result).toContain('\x1b[31m'); // red for "one"
      expect(result).not.toContain('\x1b[34m'); // blue not applied
      expect(result).not.toContain('\x1b[32m'); // green not applied
    });

    it('should handle colors disabled', () => {
      const text = 'one two three';
      const styleMap: StyleMap = {
        0: ['red'],
        1: ['blue'],
        2: ['green'],
      };

      const result = TextStyler.styleByIndex(text, styleMap, false);
      expect(result).toBe('one two three');
      expect(result).not.toContain('\x1b[');
    });

    it('should filter invalid styles', () => {
      const text = 'word';
      const styleMap: StyleMap = {
        0: ['red', '', 'bold', 'invalid-color' as unknown as ColorName],
      };

      const result = TextStyler.styleByIndex(text, styleMap);
      expect(result).toContain('\x1b[31m'); // red
      expect(result).toContain('\x1b[1m'); // bold
    });
  });

  describe('parseBrackets', () => {
    it('should parse single style with angle brackets', () => {
      const result = TextStyler.parseBrackets('<red>Error</>');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('Error');
      expect(result).toContain('\x1b[0m');
    });

    it('should parse multiple styles with dots', () => {
      const result = TextStyler.parseBrackets('<red.bold.underline>Error</>');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('\x1b[1m');
      expect(result).toContain('\x1b[4m');
      expect(result).toContain('Error');
    });

    it('should parse multiple segments', () => {
      const result = TextStyler.parseBrackets('<green>Success</> <yellow>Warning</> <red>Error</>');
      expect(result).toContain('Success');
      expect(result).toContain('Warning');
      expect(result).toContain('Error');
    });

    it('should handle nested brackets', () => {
      const result = TextStyler.parseBrackets('<red>Outer <yellow>Inner</> Back</>');
      expect(result).toContain('Outer');
      expect(result).toContain('Inner');
      expect(result).toContain('Back');
    });

    it('should handle empty content', () => {
      const result = TextStyler.parseBrackets('<red></>');
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      const result = TextStyler.parseBrackets('');
      expect(result).toBe('');
    });

    it('should preserve text without brackets', () => {
      const result = TextStyler.parseBrackets('Plain text without styling');
      expect(result).toBe('Plain text without styling');
    });

    it('should strip brackets when colors disabled', () => {
      const result = TextStyler.parseBrackets('<red.bold>Error</> text', false);
      expect(result).toBe('Error text');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('\x1b[');
    });

    it('should handle complex nested structures', () => {
      const text = '<bgBlue.white>Header: <yellow.bold>Important</> message</>';
      const result = TextStyler.parseBrackets(text);
      expect(result).toContain('Header:');
      expect(result).toContain('Important');
      expect(result).toContain('message');
    });

    it('should handle adjacent tags', () => {
      const result = TextStyler.parseBrackets('<red>A</><blue>B</><green>C</>');
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
    });

    it('should handle special characters in content', () => {
      const result = TextStyler.parseBrackets('<red>!@#$%^&*()[]{}</>');
      expect(result).toContain('!@#$%^&*()[]{}');
    });

    it('should handle very long content', () => {
      const longText = 'a'.repeat(10000);
      const result = TextStyler.parseBrackets(`<red>${longText}</>`);
      expect(result).toContain(longText);
    });

    it('should handle maximum nesting depth', () => {
      // Prevent infinite loops with excessive nesting
      let nested = 'core';
      for (let i = 0; i < 110; i++) {
        nested = `<red>${nested}</>`;
      }

      const result = TextStyler.parseBrackets(nested);
      expect(result).toContain('core');
    });
  });

  describe('parseStyleString', () => {
    it('should parse dot-separated styles', () => {
      const styles = TextStyler.parseStyleString('red.bold.underline');
      expect(styles).toEqual(['red', 'bold', 'underline']);
    });

    it('should handle single style', () => {
      const styles = TextStyler.parseStyleString('green');
      expect(styles).toEqual(['green']);
    });

    it('should handle empty string', () => {
      const styles = TextStyler.parseStyleString('');
      expect(styles).toEqual([]);
    });

    it('should handle closing tag indicators', () => {
      expect(TextStyler.parseStyleString('/')).toEqual([]);
      expect(TextStyler.parseStyleString('</>')).toEqual([]);
    });

    it('should filter invalid styles', () => {
      const styles = TextStyler.parseStyleString('red.invalid.bold.notacolor');
      expect(styles).toEqual(['red', 'bold']);
    });

    it('should handle uppercase and trim', () => {
      const styles = TextStyler.parseStyleString(' RED . BOLD . underline ');
      expect(styles).toEqual(['red', 'bold', 'underline']);
    });

    it('should handle all valid color names', () => {
      const allColors = [
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        'gray',
        'grey',
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
        'bgGray',
        'bgGrey',
        'bgBrightBlack',
        'bgBrightRed',
        'bgBrightGreen',
        'bgBrightYellow',
        'bgBrightBlue',
        'bgBrightMagenta',
        'bgBrightCyan',
        'bgBrightWhite',
        'bold',
        'dim',
        'italic',
        'underline',
        'blink',
        'reverse',
        'inverse',
        'hidden',
        'strikethrough',
      ];

      allColors.forEach(color => {
        const styles = TextStyler.parseStyleString(color);
        // Handle normalizations
        let expected = color.toLowerCase();
        
        // Special normalizations
        if (expected === 'grey') {
          expected = 'gray';
        } else if (expected.startsWith('bright') && expected !== 'brightblack' && 
                   expected !== 'brightred' && expected !== 'brightgreen' && 
                   expected !== 'brightyellow' && expected !== 'brightblue' && 
                   expected !== 'brightmagenta' && expected !== 'brightcyan' && 
                   expected !== 'brightwhite') {
          // Already camelCase bright colors stay as-is
          expected = color;
        } else if (expected.startsWith('bright')) {
          // Normalize brightblack -> brightBlack, etc.
          expected = 'bright' + expected.slice(6).charAt(0).toUpperCase() + expected.slice(7);
        } else if (expected.startsWith('bgbright')) {
          // Normalize bgbrightblack -> bgBrightBlack, etc.
          expected = 'bgBright' + expected.slice(8).charAt(0).toUpperCase() + expected.slice(9);
        } else if (expected.startsWith('bg') && expected !== 'bgblack' && 
                   expected !== 'bgred' && expected !== 'bggreen' && 
                   expected !== 'bgyellow' && expected !== 'bgblue' && 
                   expected !== 'bgmagenta' && expected !== 'bgcyan' && 
                   expected !== 'bgwhite' && expected !== 'bggray' && 
                   expected !== 'bggrey') {
          // Already camelCase bg colors stay as-is
          expected = color;
        } else if (expected.startsWith('bg')) {
          // Normalize bgred -> bgRed, etc.
          const colorPart = expected.slice(2);
          if (colorPart === 'grey') {
            expected = 'bgGray';
          } else if (colorPart === 'gray') {
            expected = 'bgGray';
          } else {
            expected = 'bg' + colorPart.charAt(0).toUpperCase() + colorPart.slice(1);
          }
        }
        
        expect(styles).toContain(expected);
      });
    });

    it('should handle dots at start and end', () => {
      const styles = TextStyler.parseStyleString('.red.bold.');
      expect(styles).toEqual(['red', 'bold']);
    });

    it('should handle multiple consecutive dots', () => {
      const styles = TextStyler.parseStyleString('red...bold');
      expect(styles).toEqual(['red', 'bold']);
    });
  });

  describe('combinedStyle', () => {
    it('should combine bracket parsing with additional parts', () => {
      const result = TextStyler.combinedStyle('<red>Error:</> Connection failed', {
        additionalParts: [[' [CRITICAL]', 'red', 'bold', 'blink']],
        useColors: true,
      });

      expect(result).toContain('Error:');
      expect(result).toContain('Connection failed');
      expect(result).toContain('[CRITICAL]');
    });

    it('should combine with style map', () => {
      const result = TextStyler.combinedStyle('one two three', {
        styleMap: { 1: ['blue', 'bold'] },
        useColors: true,
      });

      expect(result).toContain('one');
      expect(result).toContain('two'); // styled
      expect(result).toContain('three');
    });

    it('should apply all styling methods in order', () => {
      const result = TextStyler.combinedStyle('<green>Status:</> Running smoothly', {
        styleMap: { 2: ['yellow'] }, // "smoothly"
        additionalParts: [[' ✓', 'green', 'bold']],
        useColors: true,
      });

      expect(result).toContain('Status:');
      expect(result).toContain('Running');
      expect(result).toContain('smoothly');
      expect(result).toContain('✓');
    });

    it('should handle colors disabled', () => {
      const result = TextStyler.combinedStyle('<red>Error</> occurred', {
        additionalParts: [[' [INFO]', 'blue']],
        useColors: false,
      });

      expect(result).toBe('Error occurred [INFO]');
      expect(result).not.toContain('\x1b[');
    });

    it('should handle empty options', () => {
      const result = TextStyler.combinedStyle('Plain text', {});
      expect(result).toBe('Plain text');
    });
  });

  describe('stripStyles', () => {
    it('should strip ANSI codes', () => {
      const styled = '\x1b[31m\x1b[1mError\x1b[0m';
      const result = TextStyler.stripStyles(styled);
      expect(result).toBe('Error');
    });

    it('should handle text without codes', () => {
      const result = TextStyler.stripStyles('Plain text');
      expect(result).toBe('Plain text');
    });

    it('should strip complex ANSI sequences', () => {
      const styled = '\x1b[38;5;196mExtended\x1b[0m \x1b[48;2;255;0;0mRGB\x1b[0m';
      const result = TextStyler.stripStyles(styled);
      expect(result).toBe('Extended RGB');
    });
  });

  describe('visibleLength', () => {
    it('should count visible characters only', () => {
      const styled = '\x1b[31mRed\x1b[0m';
      const length = TextStyler.visibleLength(styled);
      expect(length).toBe(3); // "Red"
    });

    it('should handle plain text', () => {
      const length = TextStyler.visibleLength('Plain text');
      expect(length).toBe(10);
    });

    it('should handle empty string', () => {
      const length = TextStyler.visibleLength('');
      expect(length).toBe(0);
    });

    it('should handle complex styled text', () => {
      const styled = '\x1b[31m\x1b[1mBold Red\x1b[0m \x1b[34mBlue\x1b[0m';
      const length = TextStyler.visibleLength(styled);
      expect(length).toBe(13); // "Bold Red Blue"
    });
  });

  describe('validateStyleMap', () => {
    it('should validate correct style map', () => {
      const text = 'one two three';
      const styleMap: StyleMap = {
        0: ['red'],
        1: ['blue'],
        2: ['green'],
      };

      const result = TextStyler.validateStyleMap(text, styleMap);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect empty text', () => {
      const result = TextStyler.validateStyleMap('', { 0: ['red'] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text is empty');
    });

    it('should detect invalid indices', () => {
      const text = 'one two';
      const styleMap = {
        'not-a-number': ['red'],
        '-1': ['blue'],
        '5': ['green'], // out of bounds
      } as unknown as Record<string, string[]> as unknown as StyleMap;

      const result = TextStyler.validateStyleMap(text, styleMap);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid index: not-a-number');
      expect(result.errors).toContain('Negative index: -1');
      expect(result.errors).toContain('Index 5 out of bounds (text has 2 words)');
    });

    it('should detect non-array styles', () => {
      const text = 'word';
      const styleMap = {
        0: 'red', // not an array
      } as unknown as StyleMap;

      const result = TextStyler.validateStyleMap(text, styleMap);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Styles for index 0 must be an array');
    });

    it('should detect invalid style types', () => {
      const text = 'word';
      const styleMap = {
        0: [123 as unknown as never, 'red', null as unknown as never, 'blue'],
      } as unknown as StyleMap;

      const result = TextStyler.validateStyleMap(text, styleMap);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid style type at index 0');
    });

    it('should handle text with only whitespace correctly', () => {
      const text = '   ';
      const styleMap: StyleMap = { 0: ['red'] };

      const result = TextStyler.validateStyleMap(text, styleMap);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Index 0 out of bounds (text has 0 words)');
    });
  });

  describe('escapeBrackets', () => {
    it('should escape angle brackets', () => {
      const result = TextStyler.escapeBrackets('Use <red>color</> syntax');
      expect(result).toBe('Use \\<red\\>color\\</\\> syntax');
    });

    it('should handle multiple brackets', () => {
      const result = TextStyler.escapeBrackets('<><><>');
      expect(result).toBe('\\<\\>\\<\\>\\<\\>');
    });

    it('should handle text without brackets', () => {
      const result = TextStyler.escapeBrackets('No brackets here');
      expect(result).toBe('No brackets here');
    });
  });

  describe('unescapeBrackets', () => {
    it('should unescape angle brackets', () => {
      const result = TextStyler.unescapeBrackets('Use \\<red\\>color\\</\\> syntax');
      expect(result).toBe('Use <red>color</> syntax');
    });

    it('should handle text without escaped brackets', () => {
      const result = TextStyler.unescapeBrackets('No escaped brackets');
      expect(result).toBe('No escaped brackets');
    });
  });

  describe('Integration with Colorizer', () => {
    it('should use Colorizer.applyColors internally', () => {
      const spy = jest.spyOn(Colorizer, 'applyColors');

      TextStyler.styleParts([['text', 'red', 'bold']]);

      expect(spy).toHaveBeenCalledWith('text', ['red', 'bold'], true);

      spy.mockRestore();
    });

    it('should use Colorizer.stripAnsi for stripStyles', () => {
      const spy = jest.spyOn(Colorizer, 'stripAnsi');

      TextStyler.stripStyles('\x1b[31mRed\x1b[0m');

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('should use Colorizer.visibleLength', () => {
      const spy = jest.spyOn(Colorizer, 'visibleLength');

      TextStyler.visibleLength('\x1b[31mRed\x1b[0m');

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should handle large style maps efficiently', () => {
      const words = Array.from({ length: 100 }, (_, i) => `word${i}`);
      const text = words.join(' ');
      const styleMap: StyleMap = {};

      // Style every word
      for (let i = 0; i < 100; i++) {
        styleMap[i] = ['red', 'bold'];
      }

      const start = Date.now();
      TextStyler.styleByIndex(text, styleMap);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should handle deeply nested brackets efficiently', () => {
      let nested = 'core';
      for (let i = 0; i < 50; i++) {
        nested = `<red>${nested}</>`;
      }

      const start = Date.now();
      TextStyler.parseBrackets(nested);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle many bracket segments efficiently', () => {
      const segments = Array.from({ length: 100 }, (_, i) => `<red>segment${i}</>`);
      const text = segments.join(' ');

      const start = Date.now();
      TextStyler.parseBrackets(text);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
