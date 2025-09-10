// File: tests/parsers/TemplateParser.test.ts

import { TemplateParser } from 'magiclogger/parsers/TemplateParser';
import { Colorizer } from 'magiclogger/core/Colorizer';

describe('TemplateParser', () => {
  let parser: TemplateParser;

  beforeEach(() => {
    TemplateParser.clearCache();
    parser = new TemplateParser();
  });

  describe('Basic Functionality', () => {
    it('should create a TemplateParser instance', () => {
      expect(parser).toBeDefined();
    });

    it('should create with colors disabled', () => {
      const noColorParser = new TemplateParser(false);
      const result = noColorParser.parseString('@red{test}');
      expect(result).toBe('test');
      expect(result).not.toContain('\x1b[');
    });

    it('should handle empty templates', () => {
      const result = parser.parse``;
      expect(result).toBe('');
    });

    it('should handle plain text without styles', () => {
      const result = parser.parse`This is plain text`;
      expect(result).toBe('This is plain text');
    });
  });

  describe('@ Syntax Parsing', () => {
    it('should parse single style', () => {
      const result = parser.parseString('@red{Error}');
      expect(result).toContain('\x1b[31m'); // red
      expect(result).toContain('Error');
      expect(result).toContain('\x1b[0m'); // reset
    });

    it('should parse multiple styles with dots', () => {
      const result = parser.parseString('@red.bold.underline{Error}');
      expect(result).toContain('\x1b[31m'); // red
      expect(result).toContain('\x1b[1m'); // bold
      expect(result).toContain('\x1b[4m'); // underline
      expect(result).toContain('Error');
    });

    it('should parse multiple styled segments', () => {
      const result = parser.parseString('@red{Error:} @yellow{Warning} @green{Success}');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('Error:');
      expect(result).toContain('\x1b[33m');
      expect(result).toContain('Warning');
      expect(result).toContain('\x1b[32m');
      expect(result).toContain('Success');
    });

    it('should handle nested braces correctly', () => {
      const result = parser.parseString('@red{Error: {details}}');
      expect(result).toContain('Error: {details}');
    });

    it('should handle empty style content', () => {
      const result = parser.parseString('@red{}');
      expect(result).toBe('');
    });

    it('should handle styles with special characters', () => {
      const result = parser.parseString('@red{!@#$%^&*()}');
      expect(result).toContain('!@#$%^&*()');
    });
  });

  describe('Angle Bracket Syntax', () => {
    it('should parse single style with angle brackets', () => {
      const result = parser.parseAngleBrackets('<red>Error</>');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('Error');
      expect(result).toContain('\x1b[0m');
    });

    it('should parse multiple styles with dots', () => {
      const result = parser.parseAngleBrackets('<red.bold.underline>Error</>');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('\x1b[1m');
      expect(result).toContain('\x1b[4m');
      expect(result).toContain('Error');
    });

    it('should parse multiple segments', () => {
      const result = parser.parseAngleBrackets(
        '<red>Error</> <yellow>Warning</> <green>Success</>'
      );
      expect(result).toContain('Error');
      expect(result).toContain('Warning');
      expect(result).toContain('Success');
    });

    it('should handle nested angle brackets', () => {
      const result = parser.parseAngleBrackets('<red>Outer <yellow>Inner</> Back</>');
      expect(result).toContain('Outer');
      expect(result).toContain('Inner');
      expect(result).toContain('Back');
    });

    it('should handle empty content', () => {
      const result = parser.parseAngleBrackets('<red></>');
      expect(result).toBe('');
    });

    it('should strip angle bracket syntax when colors disabled', () => {
      const noColorParser = new TemplateParser(false);
      const result = noColorParser.parseAngleBrackets('<red.bold>Error</> text');
      expect(result).toBe('Error text');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  describe('Template Literal Parsing', () => {
    it('should parse template with variables', () => {
      const name = 'John';
      const result = parser.parse`@green{Hello ${name}}`;
      expect(result).toContain('Hello John');
      expect(result).toContain('\x1b[32m');
    });

    it('should handle multiple variables', () => {
      const user = 'Alice';
      const action = 'logged in';
      const result = parser.parse`@cyan{${user}} @yellow{${action}}`;
      expect(result).toContain('Alice');
      expect(result).toContain('logged in');
    });

    it('should handle complex templates', () => {
      const error = 'Connection failed';
      const code = 500;
      const result = parser.parse`@red.bold{Error:} ${error} @yellow{(code: ${code})}`;
      expect(result).toContain('Error:');
      expect(result).toContain('Connection failed');
      expect(result).toContain('(code: 500)');
    });

    it('should handle variables inside styled text', () => {
      const level = 'critical';
      const result = parser.parse`@red{System is at ${level} level}`;
      expect(result).toContain('System is at critical level');
    });

    it('should handle empty variables', () => {
      const empty = '';
      const result = parser.parse`@red{Value: ${empty}}`;
      expect(result).toContain('Value: ');
    });

    it('should handle null/undefined variables', () => {
      const nullVar = null;
      const undefinedVar = undefined;
      const result = parser.parse`@red{Null: ${nullVar}, Undefined: ${undefinedVar}}`;
      expect(result).toContain('Null: null');
      expect(result).toContain('Undefined: undefined');
    });

    it('should handle numeric variables', () => {
      const num = 42;
      const float = 3.14;
      const result = parser.parse`@yellow{Integer: ${num}, Float: ${float}}`;
      expect(result).toContain('Integer: 42');
      expect(result).toContain('Float: 3.14');
    });

    it('should handle object variables', () => {
      const obj = { toString: () => 'custom object' };
      const result = parser.parse`@blue{Object: ${obj}}`;
      expect(result).toContain('Object: custom object');
    });
  });

  describe('Mixed Syntax', () => {
    it('should parse both @ and angle bracket syntax', () => {
      const result = parser.parseMixed('@red{Error:} <yellow>Warning</> detected');
      expect(result).toContain('Error:');
      expect(result).toContain('Warning');
      expect(result).toContain('detected');
    });

    it('should handle complex mixed syntax', () => {
      const result = parser.parseMixed(
        '<green>Success</> @yellow.bold{Warning} <red.underline>Error</>'
      );
      expect(result).toContain('Success');
      expect(result).toContain('Warning');
      expect(result).toContain('Error');
    });

    it('should process angle brackets before @ syntax', () => {
      // This ensures proper precedence
      const result = parser.parseMixed('<red>@green{text}</red>');
      // The angle brackets should be processed first
      expect(result).toContain('text');
    });
  });

  describe('Caching', () => {
    it('should cache parsed templates', () => {
      const template = '@red{test}';
      const result1 = parser.parseString(template);
      const result2 = parser.parseString(template);
      expect(result1).toBe(result2);
    });

    it('should clear cache', () => {
      const template = '@red{test}';
      parser.parseString(template);

      TemplateParser.clearCache();

      const parser2 = new TemplateParser();
      const result = parser2.parseString(template);
      expect(result).toContain('test');
    });
  });

  describe('Style Validation', () => {
    it('should ignore invalid styles', () => {
      const result = parser.parseString('@invalidStyle{text}');
      expect(result).toBe('text'); // Invalid style is ignored
    });

    it('should handle mixed valid and invalid styles', () => {
      const result = parser.parseString('@red.invalidStyle.bold{text}');
      expect(result).toContain('\x1b[31m'); // red
      expect(result).toContain('\x1b[1m'); // bold
      expect(result).toContain('text');
    });

    it('should handle empty style strings', () => {
      const result = parser.parseString('@{text}');
      expect(result).toBe('text');
    });

    it('should handle styles with only dots', () => {
      const result = parser.parseString('@...{text}');
      expect(result).toBe('text');
    });
  });

  describe('Static Methods', () => {
    describe('escape', () => {
      it('should escape special characters', () => {
        const escaped = TemplateParser.escape('Use @{} or <> for styling');
        expect(escaped).toBe('Use \\@{} or \\<\\> for styling');
      });

      it('should handle multiple occurrences', () => {
        const escaped = TemplateParser.escape('@red{text} <blue>other</>');
        expect(escaped).toBe('\\@red{text} \\<blue\\>other\\</\\>');
      });
    });

    describe('unescape', () => {
      it('should unescape special characters', () => {
        const unescaped = TemplateParser.unescape('Use \\@{} or \\<\\> for styling');
        expect(unescaped).toBe('Use @{} or <> for styling');
      });
    });

    describe('validate', () => {
      it('should validate correct template', () => {
        const result = TemplateParser.validate('@red{text} <blue>other</>');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect unmatched braces', () => {
        const result = TemplateParser.validate('@red{text');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Unclosed brace(s) in template');
      });

      it('should detect unexpected closing brace', () => {
        const result = TemplateParser.validate('text}');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Unexpected closing brace');
      });

      it('should detect unmatched angle brackets', () => {
        const result = TemplateParser.validate('<red>text');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Unclosed angle bracket(s) in template');
      });

      it('should detect empty styles', () => {
        const result = TemplateParser.validate('@{text}');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Empty style');
      });

      it('should validate complex templates', () => {
        const result = TemplateParser.validate(
          '@red.bold{Error:} <yellow>Warning</> @green{Success}'
        );
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('convertSyntax', () => {
      it('should convert @ syntax to angle brackets', () => {
        const result = TemplateParser.convertSyntax('@red{Error:} @yellow{Warning}', 'at', 'angle');
        expect(result).toBe('<red>Error:</> <yellow>Warning</>');
      });

      it('should convert angle brackets to @ syntax', () => {
        const result = TemplateParser.convertSyntax(
          '<red>Error:</> <yellow>Warning</>',
          'angle',
          'at'
        );
        expect(result).toBe('@red{Error:} @yellow{Warning}');
      });

      it('should handle complex styles in conversion', () => {
        const result = TemplateParser.convertSyntax('@red.bold.underline{Error}', 'at', 'angle');
        expect(result).toBe('<red.bold.underline>Error</>');
      });

      it('should return unchanged if from and to are the same', () => {
        const text = '@red{test}';
        const result = TemplateParser.convertSyntax(text, 'at', 'at');
        expect(result).toBe(text);
      });

      it('should handle empty content', () => {
        const result = TemplateParser.convertSyntax('@red{}', 'at', 'angle');
        expect(result).toBe('<red></>');
      });
    });
  });

  describe('Helper Methods', () => {
    it('should create formatter function', () => {
      const fmt = parser.createFormatter();
      const result = fmt`@red{Error:} ${500}`;
      expect(result).toContain('Error:');
      expect(result).toContain('500');
    });

    it('should create bracket parser function', () => {
      const parseBrackets = parser.createBracketParser();
      const result = parseBrackets('<red>Error:</> Failed');
      expect(result).toContain('Error:');
      expect(result).toContain('Failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longText = 'a'.repeat(10000);
      const result = parser.parseString(`@red{${longText}}`);
      expect(result).toContain(longText);
    });

    it('should handle special characters in content', () => {
      const result = parser.parseString('@red{${}[]()<>}');
      expect(result).toContain('${}[]()<>');
    });

    it('should handle unicode characters', () => {
      const result = parser.parseString('@red{🎨 🖌️ 🎭}');
      expect(result).toContain('🎨 🖌️ 🎭');
    });

    it('should handle newlines in content', () => {
      const result = parser.parseString('@red{line1\nline2\nline3}');
      expect(result).toContain('line1\nline2\nline3');
    });

    it('should handle tabs and other whitespace', () => {
      const result = parser.parseString('@red{text\twith\ttabs}');
      expect(result).toContain('text\twith\ttabs');
    });

    it('should handle escaped characters', () => {
      const result = parser.parseString('@red{text with \\n escape}');
      expect(result).toContain('text with \\n escape');
    });

    it('should handle adjacent style tags', () => {
      const result = parser.parseString('@red{A}@blue{B}@green{C}');
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
    });

    it('should handle style at start and end', () => {
      const result = parser.parseString('@red{start} middle @blue{end}');
      expect(result).toContain('start');
      expect(result).toContain('middle');
      expect(result).toContain('end');
    });

    it('should handle multiple consecutive spaces', () => {
      const result = parser.parseString('@red{text    with    spaces}');
      expect(result).toContain('text    with    spaces');
    });
  });

  describe('Performance', () => {
    it('should handle rapid parsing efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        parser.parseString(`@red{test${i}}`);
      }

      const duration = Date.now() - start;
      // Add grace time for performance tests:
      // - CI environments often have variable CPU availability
      // - Windows has different timer resolution and process scheduling
      // - System load can cause variance in execution time
      // - 450ms allows for JIT warmup and garbage collection pauses
      const threshold = process.env.CI || process.platform === 'win32' ? 450 : 250;
      expect(duration).toBeLessThan(threshold);
    });

    it('should benefit from caching', () => {
      const template = '@red.bold.underline{Complex styled text}';

      const start1 = Date.now();
      for (let i = 0; i < 100; i++) {
        parser.parseString(template);
      }
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      for (let i = 0; i < 100; i++) {
        parser.parseString(template);
      }
      const duration2 = Date.now() - start2;

      // Cached parsing should be faster or equal
      expect(duration2).toBeLessThanOrEqual(duration1 + 5);
    });
  });

  describe('Integration with Colorizer', () => {
    it('should use Colorizer.applyColors internally', () => {
      const spy = jest.spyOn(Colorizer, 'applyColors');

      parser.parseString('@red.bold{test}');

      expect(spy).toHaveBeenCalledWith('test', ['red', 'bold'], true);

      spy.mockRestore();
    });

    it('should pass useColors setting to Colorizer', () => {
      const spy = jest.spyOn(Colorizer, 'applyColors');

      const noColorParser = new TemplateParser(false);
      noColorParser.parseAngleBrackets('<red>test</>');

      // When colors are disabled, it shouldn't call Colorizer at all
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe('All Color Support', () => {
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

    it('should support all colors in @ syntax', () => {
      const aliasSet = new Set(['grey', 'bgGrey', 'inverse']);
      allColors.forEach(color => {
        const result = parser.parseString(`@${color}{test}`);
        const hasAnsi = result.includes('\x1b[');
        const shouldHaveAnsi = !aliasSet.has(color);
        expect(hasAnsi).toBe(shouldHaveAnsi);
      });
    });

    it('should support all colors in angle bracket syntax', () => {
      const aliasSet = new Set(['grey', 'bgGrey', 'inverse']);
      allColors.forEach(color => {
        const result = parser.parseAngleBrackets(`<${color}>test</>`);
        const hasAnsi = result.includes('\x1b[');
        const shouldHaveAnsi = !aliasSet.has(color);
        expect(hasAnsi).toBe(shouldHaveAnsi);
      });
    });
  });
});
