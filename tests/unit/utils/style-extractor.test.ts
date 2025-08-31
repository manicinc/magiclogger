// File: tests/unit/utils/style-extractor.test.ts

import { extractStyles, applyStyles, optimizeStyleRanges, validateStyleRanges } from '../../../src/utils/style-extractor';
import type { StyleRange } from '../../../src/types/transport';

describe('Style Extractor', () => {
  describe('extractStyles', () => {
    it('should extract plain text and styles from angle bracket syntax', () => {
      const input = '<red.bold>Error:</> User <cyan>john@example.com</> not found';
      const result = extractStyles(input);
      
      expect(result.plainText).toBe('Error: User john@example.com not found');
      expect(result.styles).toEqual([
        [0, 6, 'red.bold'],    // "Error:" is at indices 0-5 (6 chars)
        [12, 28, 'cyan']       // "john@example.com" starts at 12 and is 16 chars long
      ]);
    });
    
    it('should handle consecutive styles', () => {
      const input = '<yellow>Warning:</> <red.bold>CRITICAL</> issue detected';
      const result = extractStyles(input);
      
      expect(result.plainText).toBe('Warning: CRITICAL issue detected');
      expect(result.styles).toEqual([
        [0, 8, 'yellow'],
        [9, 17, 'red.bold']
      ]);
    });
    
    it('should handle text without styles', () => {
      const input = 'Plain text message without any styling';
      const result = extractStyles(input);
      
      expect(result.plainText).toBe(input);
      expect(result.styles).toBeUndefined();
    });
    
    it('should handle empty styled segments', () => {
      const input = '<red></> Empty style';
      const result = extractStyles(input);
      
      expect(result.plainText).toBe(' Empty style');
      expect(result.styles).toBeUndefined(); // No styles for empty content
    });
    
    it('should handle multiple styles in sequence', () => {
      const input = '<green>✓</> <yellow>⚠</> <red>✗</>';
      const result = extractStyles(input);
      
      expect(result.plainText).toBe('✓ ⚠ ✗');
      expect(result.styles).toEqual([
        [0, 1, 'green'],
        [2, 3, 'yellow'],
        [4, 5, 'red']
      ]);
    });
  });
  
  describe('applyStyles', () => {
    it('should reconstruct styled text from plain text and ranges', () => {
      const plainText = 'Error: User john@example.com not found';
      const styles: StyleRange[] = [
        [0, 6, 'red.bold'],
        [12, 28, 'cyan']  // Fixed: john@example.com is 16 chars, ending at index 28
      ];
      
      const result = applyStyles(plainText, styles);
      expect(result).toBe('<red.bold>Error:</> User <cyan>john@example.com</> not found');
    });
    
    it('should handle custom style application function', () => {
      const plainText = 'Test message';
      const styles: StyleRange[] = [[0, 4, 'bold']];
      
      const result = applyStyles(plainText, styles, (text, style) => `[${style}]${text}[/${style}]`);
      expect(result).toBe('[bold]Test[/bold] message');
    });
    
    it('should handle empty styles array', () => {
      const plainText = 'Plain text';
      const result = applyStyles(plainText, []);
      
      expect(result).toBe('Plain text');
    });
    
    it('should handle undefined styles', () => {
      const plainText = 'Plain text';
      const result = applyStyles(plainText, undefined);
      
      expect(result).toBe('Plain text');
    });
    
    it('should sort and apply styles in correct order', () => {
      const plainText = 'ABC DEF GHI';
      const styles: StyleRange[] = [
        [8, 11, 'blue'],   // GHI
        [0, 3, 'red'],     // ABC
        [4, 7, 'green']    // DEF
      ];
      
      const result = applyStyles(plainText, styles);
      expect(result).toBe('<red>ABC</> <green>DEF</> <blue>GHI</>');
    });
  });
  
  describe('optimizeStyleRanges', () => {
    it('should merge adjacent ranges with same style', () => {
      const styles: StyleRange[] = [
        [0, 5, 'red'],
        [5, 10, 'red'],
        [10, 15, 'red']
      ];
      
      const optimized = optimizeStyleRanges(styles);
      expect(optimized).toEqual([[0, 15, 'red']]);
    });
    
    it('should merge overlapping ranges with same style', () => {
      const styles: StyleRange[] = [
        [0, 8, 'bold'],
        [5, 12, 'bold']
      ];
      
      const optimized = optimizeStyleRanges(styles);
      expect(optimized).toEqual([[0, 12, 'bold']]);
    });
    
    it('should not merge ranges with different styles', () => {
      const styles: StyleRange[] = [
        [0, 5, 'red'],
        [5, 10, 'blue'],
        [10, 15, 'red']
      ];
      
      const optimized = optimizeStyleRanges(styles);
      expect(optimized).toEqual(styles);
    });
    
    it('should handle single range', () => {
      const styles: StyleRange[] = [[0, 10, 'green']];
      const optimized = optimizeStyleRanges(styles);
      
      expect(optimized).toEqual(styles);
    });
    
    it('should handle empty array', () => {
      const optimized = optimizeStyleRanges([]);
      expect(optimized).toEqual([]);
    });
  });
  
  describe('validateStyleRanges', () => {
    it('should validate correct style ranges', () => {
      const plainText = 'Hello World';
      const styles: StyleRange[] = [
        [0, 5, 'red'],
        [6, 11, 'blue']
      ];
      
      expect(validateStyleRanges(plainText, styles)).toBe(true);
    });
    
    it('should reject ranges exceeding text bounds', () => {
      const plainText = 'Hello';
      const styles: StyleRange[] = [[0, 10, 'red']]; // Exceeds length
      
      expect(validateStyleRanges(plainText, styles)).toBe(false);
    });
    
    it('should reject negative start indices', () => {
      const plainText = 'Hello';
      const styles: StyleRange[] = [[-1, 3, 'red']];
      
      expect(validateStyleRanges(plainText, styles)).toBe(false);
    });
    
    it('should reject ranges where start >= end', () => {
      const plainText = 'Hello';
      const styles: StyleRange[] = [[3, 3, 'red']]; // Empty range
      
      expect(validateStyleRanges(plainText, styles)).toBe(false);
    });
    
    it('should accept undefined styles', () => {
      const plainText = 'Hello';
      expect(validateStyleRanges(plainText, undefined)).toBe(true);
    });
    
    it('should accept empty styles array', () => {
      const plainText = 'Hello';
      expect(validateStyleRanges(plainText, [])).toBe(true);
    });
  });
});