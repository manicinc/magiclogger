import { describe, it, expect } from '@jest/globals';
import {
  isStyledPart,
  isWordStyleMap,
  isStyleBuilder,
  type StyledPart,
  type WordStyleMap,
  type IStyleBuilder,
} from '../../../src/types/styling';

describe('styling type guards', () => {
  describe('isStyledPart', () => {
    it('should return true for valid StyledPart with just text', () => {
      const part: StyledPart = ['Hello'];
      expect(isStyledPart(part)).toBe(true);
    });

    it('should return true for valid StyledPart with text and styles', () => {
      const part: StyledPart = ['Hello', 'red', 'bold'];
      expect(isStyledPart(part)).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(isStyledPart([])).toBe(false);
    });

    it('should return false for non-array', () => {
      expect(isStyledPart('not an array')).toBe(false);
      expect(isStyledPart(123)).toBe(false);
      expect(isStyledPart(null)).toBe(false);
      expect(isStyledPart(undefined)).toBe(false);
      expect(isStyledPart({})).toBe(false);
    });

    it('should return false if first element is not a string', () => {
      expect(isStyledPart([123, 'red'])).toBe(false);
      expect(isStyledPart([null, 'bold'])).toBe(false);
      expect(isStyledPart([{}, 'cyan'])).toBe(false);
    });

    it('should return false if any style is not a string', () => {
      expect(isStyledPart(['Hello', 'red', 123])).toBe(false);
      expect(isStyledPart(['Hello', null, 'bold'])).toBe(false);
      expect(isStyledPart(['Hello', 'cyan', {}])).toBe(false);
    });
  });

  describe('isWordStyleMap', () => {
    it('should return true for valid WordStyleMap', () => {
      const map: WordStyleMap = {
        0: ['red', 'bold'],
        2: ['yellow'],
        5: ['cyan', 'underline'],
      };
      expect(isWordStyleMap(map)).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isWordStyleMap({})).toBe(true);
    });

    it('should return false for null', () => {
      expect(isWordStyleMap(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isWordStyleMap('not an object')).toBe(false);
      expect(isWordStyleMap(123)).toBe(false);
      expect(isWordStyleMap(undefined)).toBe(false);
    });

    it('should return true for array (which is an object)', () => {
      expect(isWordStyleMap([])).toBe(true);
    });

    it('should return false if keys are not numeric', () => {
      expect(isWordStyleMap({ abc: ['red'] })).toBe(false);
      expect(isWordStyleMap({ '1.5': ['blue'] })).toBe(false);
    });

    it('should return false if values are not string arrays', () => {
      expect(isWordStyleMap({ 0: 'red' })).toBe(false);
      expect(isWordStyleMap({ 1: [123] })).toBe(false);
      expect(isWordStyleMap({ 2: ['red', null] })).toBe(false);
      expect(isWordStyleMap({ 3: {} })).toBe(false);
    });

    it('should handle string keys that are valid integers', () => {
      const map = {
        '0': ['red'],
        '10': ['blue'],
      };
      expect(isWordStyleMap(map)).toBe(true);
    });
  });

  describe('isStyleBuilder', () => {
    it('should return true for valid IStyleBuilder', () => {
      const builder: IStyleBuilder = Object.assign((text: string) => text, {
        red: {} as IStyleBuilder,
        green: {} as IStyleBuilder,
        blue: {} as IStyleBuilder,
        yellow: {} as IStyleBuilder,
        magenta: {} as IStyleBuilder,
        cyan: {} as IStyleBuilder,
        white: {} as IStyleBuilder,
        black: {} as IStyleBuilder,
        gray: {} as IStyleBuilder,
        grey: {} as IStyleBuilder,
        brightRed: {} as IStyleBuilder,
        brightGreen: {} as IStyleBuilder,
        brightYellow: {} as IStyleBuilder,
        brightBlue: {} as IStyleBuilder,
        brightMagenta: {} as IStyleBuilder,
        brightCyan: {} as IStyleBuilder,
        brightWhite: {} as IStyleBuilder,
        brightBlack: {} as IStyleBuilder,
        bgRed: {} as IStyleBuilder,
        bgGreen: {} as IStyleBuilder,
        bgYellow: {} as IStyleBuilder,
        bgBlue: {} as IStyleBuilder,
        bgMagenta: {} as IStyleBuilder,
        bgCyan: {} as IStyleBuilder,
        bgWhite: {} as IStyleBuilder,
        bgBlack: {} as IStyleBuilder,
        bgGray: {} as IStyleBuilder,
        bgGrey: {} as IStyleBuilder,
        bgBrightRed: {} as IStyleBuilder,
        bgBrightGreen: {} as IStyleBuilder,
        bgBrightYellow: {} as IStyleBuilder,
        bgBrightBlue: {} as IStyleBuilder,
        bgBrightMagenta: {} as IStyleBuilder,
        bgBrightCyan: {} as IStyleBuilder,
        bgBrightWhite: {} as IStyleBuilder,
        bgBrightBlack: {} as IStyleBuilder,
        bold: {} as IStyleBuilder,
        dim: {} as IStyleBuilder,
        italic: {} as IStyleBuilder,
        underline: {} as IStyleBuilder,
        blink: {} as IStyleBuilder,
        reverse: {} as IStyleBuilder,
        inverse: {} as IStyleBuilder,
        hidden: {} as IStyleBuilder,
        strikethrough: {} as IStyleBuilder,
      });
      expect(isStyleBuilder(builder)).toBe(true);
    });

    it('should return true for minimal valid IStyleBuilder', () => {
      const builder = Object.assign((text: string) => text, {
        red: {},
        green: {},
        blue: {},
      });
      expect(isStyleBuilder(builder)).toBe(true);
    });

    it('should return false for non-function', () => {
      expect(isStyleBuilder('not a function')).toBe(false);
      expect(isStyleBuilder(123)).toBe(false);
      expect(isStyleBuilder(null)).toBe(false);
      expect(isStyleBuilder(undefined)).toBe(false);
      expect(isStyleBuilder({})).toBe(false);
      expect(isStyleBuilder([])).toBe(false);
    });

    it('should return false for function missing required properties', () => {
      const invalidBuilder = (text: string) => text;
      expect(isStyleBuilder(invalidBuilder)).toBe(false);
    });

    it('should return false for function with only some properties', () => {
      const partialBuilder = Object.assign((text: string) => text, {
        red: {},
        green: {},
        // missing blue
      });
      expect(isStyleBuilder(partialBuilder)).toBe(false);
    });
  });
});
