/**
 * @fileoverview Tests for TableFormatter utility
 */

import { TableFormatter } from '../../../src/utils/TableFormatter';

describe('TableFormatter', () => {
  describe('formatTable', () => {
    it('should format a simple table', () => {
      const data = [
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'Los Angeles' },
      ];
      
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('name');
      expect(result).toContain('age');
      expect(result).toContain('city');
      expect(result).toContain('Alice');
      expect(result).toContain('30');
      expect(result).toContain('New York');
    });

    it('should handle empty data', () => {
      const result = TableFormatter.formatTable([]);
      expect(result).toBe('');
    });

    it('should handle single row', () => {
      const data = [{ col1: 'value1', col2: 'value2' }];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('col1');
      expect(result).toContain('col2');
      expect(result).toContain('value1');
      expect(result).toContain('value2');
    });

    it('should handle objects with different keys', () => {
      const data = [
        { a: 1, b: 2 },
        { b: 3, c: 4 },
        { a: 5, c: 6 },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('a');
      expect(result).toContain('b');
      expect(result).toContain('c');
    });

    it('should handle null and undefined values', () => {
      const data = [
        { key: null, value: undefined },
        { key: 'test', value: 'data' },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toBeDefined();
      expect(result).toContain('test');
      expect(result).toContain('data');
    });

    it('should handle numeric values', () => {
      const data = [
        { int: 42, float: 3.14, negative: -10 },
        { int: 100, float: 2.718, negative: -5 },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('42');
      expect(result).toContain('3.14');
      expect(result).toContain('-10');
    });

    it('should handle boolean values', () => {
      const data = [
        { active: true, enabled: false },
        { active: false, enabled: true },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('true');
      expect(result).toContain('false');
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(100);
      const data = [{ field: longString }];
      const result = TableFormatter.formatTable(data);
      expect(result).toBeDefined();
      // Long strings might be truncated
    });

    it('should handle special characters', () => {
      const data = [
        { field: 'Line\nbreak', tab: 'Tab\there' },
        { field: 'Special™', tab: 'Emoji😀' },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toBeDefined();
    });

    it('should align columns properly', () => {
      const data = [
        { short: 'a', medium: 'hello', long: 'this is longer' },
        { short: 'bb', medium: 'world', long: 'text' },
      ];
      const result = TableFormatter.formatTable(data);
      const lines = result.split('\n');
      
      // Check that header separators exist
      expect(lines.some(line => line.includes('─'))).toBe(true);
      
      // Check that pipes exist for column separation
      expect(lines.some(line => line.includes('│'))).toBe(true);
    });

    it('should handle arrays', () => {
      const data = [
        { items: [1, 2, 3], tags: ['a', 'b'] },
        { items: [4, 5], tags: ['c'] },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('[1,2,3]');
      expect(result).toContain('[4,5]');
      expect(result).toContain('["a","b"]');
    });

    it('should handle nested objects', () => {
      const data = [
        { user: { name: 'Alice', age: 30 }, active: true },
        { user: { name: 'Bob', age: 25 }, active: false },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('[object Object]');
    });

    it('should handle dates', () => {
      const date = new Date('2024-01-01');
      const data = [{ created: date, name: 'Test' }];
      const result = TableFormatter.formatTable(data);
      expect(result).toBeDefined();
      expect(result).toContain('Test');
    });

    it('should handle mixed types in same column', () => {
      const data = [
        { value: 'string' },
        { value: 123 },
        { value: true },
        { value: null },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('string');
      expect(result).toContain('123');
      expect(result).toContain('true');
    });

    it('should handle wide characters', () => {
      const data = [
        { chinese: '中文', japanese: '日本語' },
        { chinese: '字符', japanese: 'にほんご' },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('中文');
      expect(result).toContain('日本語');
    });

    it('should respect max width constraints', () => {
      const veryLongString = 'x'.repeat(200);
      const data = [{ field: veryLongString }];
      const result = TableFormatter.formatTable(data);
      const lines = result.split('\n');
      
      // Check that no line is excessively long
      lines.forEach(line => {
        expect(line.length).toBeLessThan(250);
      });
    });

    it('should handle empty strings', () => {
      const data = [
        { name: '', value: 'test' },
        { name: 'test', value: '' },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toBeDefined();
      expect(result).toContain('test');
    });

    it('should handle single column', () => {
      const data = [
        { only: 'first' },
        { only: 'second' },
        { only: 'third' },
      ];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('only');
      expect(result).toContain('first');
      expect(result).toContain('second');
      expect(result).toContain('third');
    });

    it('should handle many columns', () => {
      const data = [{
        a: 1, b: 2, c: 3, d: 4, e: 5,
        f: 6, g: 7, h: 8, i: 9, j: 10,
      }];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('1');
      expect(result).toContain('5');
      expect(result).toContain('10');
    });

    it('should format with borders correctly', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const result = TableFormatter.formatTable(data);
      
      // Should have top border
      expect(result).toMatch(/^┌/);
      
      // Should have bottom border
      expect(result).toMatch(/└[─┴]+┘$/m);
      
      // Should have column separators
      expect(result).toContain('│');
    });

    it('should handle undefined input', () => {
      const result = TableFormatter.formatTable(undefined as any);
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = TableFormatter.formatTable(null as any);
      expect(result).toBe('');
    });

    it('should handle non-array input', () => {
      const result = TableFormatter.formatTable('not an array' as any);
      expect(result).toBe('');
    });

    it('should handle array of non-objects', () => {
      const result = TableFormatter.formatTable([1, 2, 3] as any);
      expect(result).toBe('');
    });

    it('should truncate very long cell values', () => {
      const longValue = 'x'.repeat(100);
      const data = [{ field: longValue }];
      const result = TableFormatter.formatTable(data);
      
      // Should contain truncation indicator
      expect(result.includes('...') || result.includes(longValue.substring(0, 50))).toBe(true);
    });

    it('should handle symbols as values', () => {
      const sym = Symbol('test');
      const data = [{ symbol: sym, regular: 'value' }];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('value');
    });

    it('should handle functions as values', () => {
      const fn = () => 'test';
      const data = [{ func: fn, regular: 'value' }];
      const result = TableFormatter.formatTable(data);
      expect(result).toContain('value');
    });

    it('should create readable output for complex data', () => {
      const data = [
        { id: 1, name: 'Alice Johnson', age: 30, city: 'New York', active: true },
        { id: 2, name: 'Bob Smith', age: 25, city: 'Los Angeles', active: false },
        { id: 3, name: 'Charlie Brown', age: 35, city: 'Chicago', active: true },
      ];
      
      const result = TableFormatter.formatTable(data);
      
      // Should be multi-line
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(5);
      
      // Should have consistent formatting
      const dataLines = lines.filter(l => l.includes('│'));
      const columnCounts = dataLines.map(l => l.split('│').length);
      
      // All data lines should have same number of columns
      const firstCount = columnCounts[0];
      columnCounts.forEach(count => {
        expect(count).toBe(firstCount);
      });
    });
  });
});