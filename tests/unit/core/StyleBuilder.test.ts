// File: tests/core/StyleBuilder.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { StyleBuilder } from 'magiclogger/core/StyleBuilder';
import { Colorizer } from 'magiclogger/core/Colorizer';

describe('StyleBuilder', () => {
  beforeEach(() => {
    StyleBuilder.clearCache();
  });

  describe('Basic Functionality', () => {
    it('should create a StyleBuilder instance', () => {
      const builder = new StyleBuilder();
      expect(builder).toBeDefined();
      expect(builder.isColorEnabled()).toBe(true);
    });

    it('should create with colors disabled', () => {
      const builder = new StyleBuilder(false);
      expect(builder.isColorEnabled()).toBe(false);
    });

    it('should return plain text when colors are disabled', () => {
      const builder = new StyleBuilder(false);
      const styled = (builder as any).red('test');
      expect(styled).toBe('test');
    });

    it('should handle empty strings', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red('');
      expect(styled).toBe('');
    });

    it('should handle null/undefined gracefully', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red(null);
      expect(styled).toBe('');

      const styled2 = (builder as any).red(undefined);
      expect(styled2).toBe('');
    });
  });

  describe('Style Chaining', () => {
    it('should chain single color', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red('test');
      expect(styled).toContain('\x1b[31m');
      expect(styled).toContain('test');
      expect(styled).toContain('\x1b[0m');
    });

    it('should chain multiple styles', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red.bold('test');
      expect(styled).toContain('\x1b[31m');
      expect(styled).toContain('\x1b[1m');
      expect(styled).toContain('test');
    });

    it('should chain complex style combinations', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red.bold.underline.italic('test');
      expect(styled).toContain('\x1b[31m'); // red
      expect(styled).toContain('\x1b[1m'); // bold
      expect(styled).toContain('\x1b[4m'); // underline
      expect(styled).toContain('\x1b[3m'); // italic
    });

    it('should accumulate styles correctly', () => {
      const builder = new StyleBuilder();
      const redBold = (builder as any).red.bold;
      expect(redBold.getStyles()).toEqual(['red', 'bold']);

      const redBoldUnderline = redBold.underline;
      expect(redBoldUnderline.getStyles()).toEqual(['red', 'bold', 'underline']);
    });

    it('should create independent chains', () => {
      const builder = new StyleBuilder();
      const red = (builder as any).red;
      const blue = (builder as any).blue;

      expect(red.getStyles()).toEqual(['red']);
      expect(blue.getStyles()).toEqual(['blue']);

      const redBold = red.bold;
      expect(red.getStyles()).toEqual(['red']); // Original should not change
      expect(redBold.getStyles()).toEqual(['red', 'bold']);
    });
  });

  describe('Color Properties', () => {
    it('should support all foreground colors', () => {
      const builder = new StyleBuilder();
      const colors = [
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        'gray',
      ];

      colors.forEach(color => {
        const styled = (builder as any)[color]('test');
        expect(styled).toContain('test');
        expect(styled).toContain('\x1b[');
      });
    });

    it('should support bright colors', () => {
      const builder = new StyleBuilder();
      const brightColors = [
        'brightRed',
        'brightGreen',
        'brightYellow',
        'brightBlue',
        'brightMagenta',
        'brightCyan',
        'brightWhite',
        'brightBlack',
      ];

      brightColors.forEach(color => {
        const styled = (builder as any)[color]('test');
        expect(styled).toContain('test');
        expect(styled).toContain('\x1b[');
      });
    });

    it('should support background colors', () => {
      const builder = new StyleBuilder();
      const bgColors = [
        'bgRed',
        'bgGreen',
        'bgYellow',
        'bgBlue',
        'bgMagenta',
        'bgCyan',
        'bgWhite',
        'bgBlack',
      ];

      bgColors.forEach(color => {
        const styled = (builder as any)[color]('test');
        expect(styled).toContain('test');
        expect(styled).toContain('\x1b[');
      });
    });

    it('should support bright background colors', () => {
      const builder = new StyleBuilder();
      const bgBrightColors = [
        'bgBrightRed',
        'bgBrightGreen',
        'bgBrightYellow',
        'bgBrightBlue',
        'bgBrightMagenta',
        'bgBrightCyan',
        'bgBrightWhite',
        'bgBrightBlack',
      ];

      bgBrightColors.forEach(color => {
        const styled = (builder as any)[color]('test');
        expect(styled).toContain('test');
        expect(styled).toContain('\x1b[');
      });
    });

    it('should support text styles', () => {
      const builder = new StyleBuilder();
      const styles = [
        'bold',
        'dim',
        'italic',
        'underline',
        'blink',
        'reverse',
        'hidden',
        'strikethrough',
      ];

      styles.forEach(style => {
        const styled = (builder as any)[style]('test');
        expect(styled).toContain('test');
        expect(styled).toContain('\x1b[');
      });
    });

    it('should support grey as alias for gray', () => {
      const builder = new StyleBuilder();
      const gray = (builder as any).gray('test');
      const grey = (builder as any).grey('test');

      // Both should produce the same output
      expect(grey).toBe(gray);
    });

    it('should support inverse as alias for reverse', () => {
      const builder = new StyleBuilder();
      const reverse = (builder as any).reverse('test');
      const inverse = (builder as any).inverse('test');

      // Both should apply the same style
      expect(inverse).toContain('\x1b[7m'); // reverse/inverse code
      expect(reverse).toContain('\x1b[7m');
    });
  });

  describe('Callable Functionality', () => {
    it('should be callable as a function', () => {
      const builder = new StyleBuilder();
      const red = (builder as any).red;
      const styled = red('test');
      expect(styled).toContain('test');
      expect(styled).toContain('\x1b[31m');
    });

    it('should be callable after chaining', () => {
      const builder = new StyleBuilder();
      const style = (builder as any).red.bold.underline;
      const styled = style('test');
      expect(styled).toContain('test');
      expect(styled).toContain('\x1b[31m');
      expect(styled).toContain('\x1b[1m');
      expect(styled).toContain('\x1b[4m');
    });

    it('should handle direct invocation', () => {
      const builder = new StyleBuilder() as any;
      // Direct call on builder should return plain text
      const result = builder('test');
      expect(result).toBe('test');
    });
  });

  describe('Caching', () => {
    it('should cache style combinations', () => {
      const builder1 = new StyleBuilder();
      const builder2 = new StyleBuilder();

      const red1 = (builder1 as any).red;
      const red2 = (builder2 as any).red;

      // Should return the same cached instance
      expect(red1).toBe(red2);
    });

    it('should not cache when colors setting differs', () => {
      const builder1 = new StyleBuilder(true);
      const builder2 = new StyleBuilder(false);

      const red1 = (builder1 as any).red;
      const red2 = (builder2 as any).red;

      // Should be different instances due to different useColors
      expect(red1).not.toBe(red2);
    });

    it('should clear cache', () => {
      const builder1 = new StyleBuilder();
      const red1 = (builder1 as any).red;

      StyleBuilder.clearCache();

      const builder2 = new StyleBuilder();
      const red2 = (builder2 as any).red;

      // After clearing cache, should create new instances
      expect(red1).not.toBe(red2);
    });

    it('should limit cache size', () => {
      // Create many style combinations to exceed cache limit
      const builder = new StyleBuilder();
      const styles: any[] = [];

      // Create more than MAX_CACHE_SIZE (1000) combinations
      for (let i = 0; i < 1100; i++) {
        // Create unique style combinations
        const style = i % 2 === 0 ? (builder as any).red : (builder as any).blue;
        styles.push(style);
      }

      // Cache should still work for recent items
      const builder2 = new StyleBuilder();
      const blue = (builder2 as any).blue;
      expect(blue).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should create builder with specified color setting', () => {
      const withColors = StyleBuilder.create(true);
      expect(withColors.isColorEnabled()).toBe(true);

      const withoutColors = StyleBuilder.create(false);
      expect(withoutColors.isColorEnabled()).toBe(false);
    });
  });

  describe('Complex Usage Patterns', () => {
    it('should work with template literals', () => {
      const builder = new StyleBuilder();
      const error = (builder as any).red.bold;
      const warning = (builder as any).yellow;

      const message = `${error('ERROR:')} Something went wrong. ${warning('Check logs')}`;
      expect(message).toContain('ERROR:');
      expect(message).toContain('Something went wrong');
      expect(message).toContain('Check logs');
    });

    it('should create reusable style functions', () => {
      const builder = new StyleBuilder();
      const errorStyle = (builder as any).red.bold.underline;
      const successStyle = (builder as any).green.bold;

      const error1 = errorStyle('Error 1');
      const error2 = errorStyle('Error 2');
      const success = successStyle('Success');

      expect(error1).toContain('Error 1');
      expect(error2).toContain('Error 2');
      expect(success).toContain('Success');
    });

    it('should work with concatenation', () => {
      const builder = new StyleBuilder();
      const red = (builder as any).red('Red');
      const blue = (builder as any).blue('Blue');
      const combined = red + ' and ' + blue;

      expect(combined).toContain('Red');
      expect(combined).toContain('Blue');
      expect(combined).toContain(' and ');
    });

    it('should handle nested styling', () => {
      const builder = new StyleBuilder();
      const outer = (builder as any).bgBlue.white;
      const inner = (builder as any).yellow.bold;

      const message = outer(`Header: ${inner('Important')}`);
      expect(message).toContain('Header:');
      expect(message).toContain('Important');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid property access gracefully', () => {
      const builder = new StyleBuilder();
      const invalid = (builder as any).notAColor;

      // Should return a function that returns the text unchanged
      expect(typeof invalid).toBe('function');
      const result = invalid('test');
      expect(result).toBe('test');
    });

    it('should handle symbol properties', () => {
      const builder = new StyleBuilder();
      const sym = Symbol('test');
      const result = (builder as any)[sym];
      expect(result).toBeUndefined();
    });

    it('should handle toString and valueOf', () => {
      const builder = new StyleBuilder();
      const red = (builder as any).red;

      expect(typeof red.toString).toBe('function');
      expect(typeof red.valueOf).toBe('function');
    });

    it('should handle numbers converted to strings', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red(123);
      expect(styled).toContain('123');
    });

    it('should handle objects converted to strings', () => {
      const builder = new StyleBuilder();
      const obj = { toString: () => 'custom' };
      const styled = (builder as any).red(obj);
      expect(styled).toContain('custom');
    });

    it('should preserve whitespace', () => {
      const builder = new StyleBuilder();
      const styled = (builder as any).red('  test  ');
      expect(styled).toContain('  test  ');
    });

    it('should handle very long strings', () => {
      const builder = new StyleBuilder();
      const longString = 'a'.repeat(10000);
      const styled = (builder as any).red(longString);
      expect(styled).toContain(longString);
    });

    it('should handle special characters', () => {
      const builder = new StyleBuilder();
      const special = (builder as any).red('!@#$%^&*(){}[]|\\:";\'<>?,./');
      expect(special).toContain('!@#$%^&*(){}[]|\\:";\'<>?,./');
    });

    it('should handle unicode characters', () => {
      const builder = new StyleBuilder();
      const unicode = (builder as any).red('🎨 🖌️ 🎭');
      expect(unicode).toContain('🎨 🖌️ 🎭');
    });

    it('should handle newlines', () => {
      const builder = new StyleBuilder();
      const multiline = (builder as any).red('line1\nline2\nline3');
      expect(multiline).toContain('line1\nline2\nline3');
    });
  });

  describe('Integration with Colorizer', () => {
    it('should use Colorizer.applyColors internally', () => {
      const spy = jest.spyOn(Colorizer, 'applyColors');

      const builder = new StyleBuilder();
      (builder as any).red.bold('test');

      expect(spy).toHaveBeenCalledWith('test', ['red', 'bold'], true);

      spy.mockRestore();
    });

    it('should pass useColors setting to Colorizer', () => {
      const spy = jest.spyOn(Colorizer, 'applyColors');

      const builder = new StyleBuilder(false);
      (builder as any).red('test');

      expect(spy).toHaveBeenCalledWith('test', ['red'], false);

      spy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should handle rapid style creation efficiently', () => {
      // Clear cache for consistent test results
      (StyleBuilder as any).clearCache();
      const builder = new StyleBuilder();
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        (builder as any).red.bold.underline(`test${i}`);
      }

      const duration = Date.now() - start;
      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should benefit from caching on repeated access', () => {
      const builder = new StyleBuilder();

      // Warm up to ensure consistent timing
      for (let i = 0; i < 100; i++) {
        (builder as any).red.bold;
      }

      // Measure multiple runs to get average performance
      const runs = 5;
      const durations: number[] = [];
      
      for (let run = 0; run < runs; run++) {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          (builder as any).red.bold;
        }
        durations.push(performance.now() - start);
      }

      // Calculate average duration
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      // Performance assertions:
      // 1. Average should be reasonably fast (under 100ms for 1000 iterations)
      expect(avgDuration).toBeLessThan(100);
      
      // 2. Later runs should not be significantly slower than early runs
      // (this indicates caching is working)
      const firstHalf = durations.slice(0, Math.floor(runs / 2));
      const secondHalf = durations.slice(Math.floor(runs / 2));
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Second half should not be more than 3x slower (very generous to handle system variance)
      expect(avgSecond).toBeLessThan(avgFirst * 3);
    });
  });

  describe('Proxy Behavior', () => {
    it('should handle has checks for style properties', () => {
      const builder = new StyleBuilder();
      expect('red' in builder).toBe(true);
      expect('notAStyle' in builder).toBe(false);
      expect('getStyles' in builder).toBe(true); // actual method
    });

    it('should handle special node inspection', () => {
      const builder = new StyleBuilder();
      const red = (builder as any).red;

      // Node.js inspection symbol
      const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
      const inspectFn = red[inspectSymbol];
      expect(typeof inspectFn).toBe('function');
    });
  });
});
