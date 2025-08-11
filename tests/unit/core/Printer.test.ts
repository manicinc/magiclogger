/**
 * Unit tests for Printer class
 * 
 * Tests cross-platform output handling, table formatting, progress bars,
 * buffering, and terminal utilities.
 * 
 * @module tests/unit/core/Printer.test
 */

import { Printer } from '../../../src/core/Printer';
import { isBrowserEnvironment } from '../../../src/utils/environment';
import { ColorName } from '../../../src/types';

// Mock environment detection to control browser vs Node behavior
jest.mock('../../../src/utils/environment', () => ({
  isBrowserEnvironment: jest.fn().mockReturnValue(false),
  isNodeEnvironment: jest.fn().mockReturnValue(true),
}));

describe('Printer', () => {
  // Spy references for console and process methods
  let consoleLogSpy: jest.SpyInstance;
  let consoleTableSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleClearSpy: jest.SpyInstance;
  let processStdoutWriteSpy: jest.SpyInstance;
  let processStderrWriteSpy: jest.SpyInstance;
  
  // Store original NODE_ENV to restore after tests
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset environment mocks to default (Node environment)
    (isBrowserEnvironment as jest.Mock).mockReturnValue(false);
    
    // Reset NODE_ENV to test
    process.env.NODE_ENV = 'test';
    
    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleClearSpy = jest.spyOn(console, 'clear').mockImplementation();
    
    // Setup process.stdout/stderr spies if in Node environment
    if (typeof process !== 'undefined') {
      processStdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
      processStderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    }
    
    // Configure Printer to use the spied console methods
    Printer.configure({ 
      useColors: true, 
      timestamps: false,
      timestampFormat: 'HH:mm:ss.SSS', // Ensure default format is preserved
      console: {
        log: consoleLogSpy,
        table: consoleTableSpy,
        error: consoleErrorSpy,
        clear: consoleClearSpy
      }
    });
    Printer.clearBuffer();
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('configuration', () => {
    it('should configure printer with custom options', () => {
      Printer.configure({
        useColors: false,
        timestamps: true,
        timestampFormat: 'HH:mm:ss'
      });
      
      // Print message to test configuration
      Printer.print('test message');
      
      // In test environment, should use console.log
      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      // Should include timestamp in HH:mm:ss format
      expect(call).toMatch(/\d{2}:\d{2}:\d{2} test message/);
    });

    it('should configure with partial options', () => {
      Printer.configure({ timestamps: true });
      
      Printer.print('test');
      
      // Should have timestamp with default format
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3} test/);
    });

    it('should preserve existing configuration when not overridden', () => {
      Printer.configure({ useColors: false });
      Printer.configure({ timestamps: true });
      
      // useColors should still be false
      Printer.setUseColors(true); // This would change it
      Printer.print('test');
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('setUseColors', () => {
    it('should enable colors', () => {
      Printer.setUseColors(true);
      
      // Color setting should be applied (internal state)
      Printer.print('test');
      expect(consoleLogSpy).toHaveBeenCalledWith('test');
    });

    it('should disable colors', () => {
      Printer.setUseColors(false);
      
      // Colors should be disabled (internal state)
      Printer.print('test');
      expect(consoleLogSpy).toHaveBeenCalledWith('test');
    });
  });

  describe('print method', () => {
    it('should print to console.log in test environment', () => {
      process.env.NODE_ENV = 'test';
      
      Printer.print('test message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
      expect(processStdoutWriteSpy).not.toHaveBeenCalled();
    });

    it('should print to stdout in production Node environment', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.print('production message');
      
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('production message\n');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should print to console with styling in browser environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.print('browser message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '%cbrowser message',
        'font-family: monospace;'
      );
    });

    it('should add timestamps when configured', () => {
      Printer.configure({ 
        timestamps: true,
        timestampFormat: 'HH:mm:ss.SSS'
      });
      
      Printer.print('timestamped message');
      
      const call = consoleLogSpy.mock.calls[0][0];
      // Should have timestamp prefix
      expect(call).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3} timestamped message$/);
    });

    it('should handle empty string', () => {
      Printer.print('');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('');
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:\'"<>,.?/\\`~\n\t';
      
      Printer.print(special);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(special);
    });
  });

  describe('buffering', () => {
    it('should buffer messages when buffering is enabled', () => {
      Printer.startBuffering();
      
      Printer.print('buffered 1');
      Printer.print('buffered 2');
      Printer.print('buffered 3');
      
      // Should not print immediately
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should flush buffer when buffering is stopped', () => {
      Printer.startBuffering();
      
      Printer.print('message 1');
      Printer.print('message 2');
      
      Printer.stopBuffering();
      
      // Should flush all buffered messages
      expect(consoleLogSpy).toHaveBeenCalledWith('message 1\nmessage 2');
    });

    it('should manually flush buffer', () => {
      Printer.startBuffering();
      
      Printer.print('manual 1');
      Printer.print('manual 2');
      
      Printer.flush();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('manual 1\nmanual 2');
      
      // Buffer should be empty after flush
      Printer.flush();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1); // No second call
      
      Printer.stopBuffering();
    });

    it('should auto-flush when buffer reaches max size', () => {
      Printer.startBuffering();
      
      // Fill buffer beyond MAX_BUFFER_SIZE (1000)
      for (let i = 0; i < 1001; i++) {
        Printer.print(`message ${i}`);
      }
      
      // Should have auto-flushed at least once
      expect(consoleLogSpy).toHaveBeenCalled();
      
      Printer.stopBuffering();
    });

    it('should clear buffer without flushing', () => {
      Printer.startBuffering();
      
      Printer.print('will be cleared');
      Printer.print('also cleared');
      
      Printer.clearBuffer();
      Printer.flush();
      
      // Nothing should be printed
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      Printer.stopBuffering();
    });

    it('should handle empty buffer flush', () => {
      Printer.startBuffering();
      Printer.flush();
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      Printer.stopBuffering();
    });

    it('should buffer printLines calls', () => {
      Printer.startBuffering();
      
      Printer.printLines(['line1', 'line2', 'line3']);
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      Printer.flush();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('line1\nline2\nline3');
      
      Printer.stopBuffering();
    });
  });

  describe('printLines method', () => {
    it('should print multiple lines at once', () => {
      const lines = ['line1', 'line2', 'line3'];
      
      Printer.printLines(lines);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('line1\nline2\nline3');
    });

    it('should handle empty array', () => {
      Printer.printLines([]);
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle single line', () => {
      Printer.printLines(['single']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('single');
    });

    it('should print to stdout in production', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.printLines(['prod1', 'prod2']);
      
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('prod1\nprod2\n');
    });

    it('should handle lines with special characters', () => {
      Printer.printLines(['line\twith\ttabs', 'line\nwith\nnewlines']);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('printError method', () => {
    it('should print to stderr in Node environment', () => {
      Printer.printError('error message');
      
      expect(processStderrWriteSpy).toHaveBeenCalledWith('error message\n');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should print to console.error in browser environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printError('browser error');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('browser error');
      expect(processStderrWriteSpy).not.toHaveBeenCalled();
    });

    it('should handle multiline error messages', () => {
      Printer.printError('Error line 1\nError line 2');
      
      expect(processStderrWriteSpy).toHaveBeenCalledWith('Error line 1\nError line 2\n');
    });
  });

  describe('printProgress method', () => {
    it('should print progress bar in browser as simple log', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printProgress('[██████    ]', '60%');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[██████    ] 60%');
    });

    it('should update progress inline in terminal (production)', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.printProgress('[██████    ]', '60%');
      
      // Should clear line and update
      const calls = processStdoutWriteSpy.mock.calls;
      expect(calls.some(call => call[0].includes('\r'))).toBe(true);
      expect(calls.some(call => call[0].includes('60%'))).toBe(true);
    });

    it('should show label when provided', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printProgress('[████      ]', '40%', { 
        label: 'Downloading' 
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Downloading [████      ] 40%');
    });

    it('should show elapsed time when requested', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      // Initialize progress (sets start time)
      Printer.printProgress('[██        ]', '20%', { showTime: true });
      
      // Progress update should show time
      Printer.printProgress('[████      ]', '40%', { showTime: true });
      
      // Should have been called with time info
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should show speed when current and total provided', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.printProgress('[████      ]', '40%', {
        showSpeed: true,
        current: 40,
        total: 100
      });
      
      // Should include speed calculation
      const calls = processStdoutWriteSpy.mock.calls;
      const hasSpeed = calls.some(call => 
        typeof call[0] === 'string' && call[0].includes('/s')
      );
      expect(hasSpeed).toBe(true);
    });

    it('should show current/total counts', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printProgress('[█████     ]', '50%', {
        current: 50,
        total: 100
      });
      
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('50/100');
    });

    it('should add newline at 100% completion in terminal', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.printProgress('[██████████]', '100%');
      
      // Should write newline at completion
      const calls = processStdoutWriteSpy.mock.calls;
      const hasNewline = calls.some(call => 
        typeof call[0] === 'string' && call[0].includes('\n')
      );
      expect(hasNewline).toBe(true);
    });

    it('should handle 0% progress', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printProgress('[          ]', '0%');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[          ] 0%');
    });

    it('should handle fractional percentages', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printProgress('[███       ]', '33.3%');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[███       ] 33.3%');
    });
  });

  describe('printTable method', () => {
    const sampleData = [
      { name: 'Alice', age: 30, city: 'New York', active: true },
      { name: 'Bob', age: 25, city: 'Los Angeles', active: false },
      { name: 'Charlie', age: 35, city: 'Chicago', active: true }
    ];

    it('should use console.table in browser environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.printTable(sampleData);
      
      expect(consoleTableSpy).toHaveBeenCalledWith(sampleData);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should format ASCII table in terminal environment', () => {
      Printer.printTable(sampleData);
      
      // Should print formatted table lines
      expect(consoleLogSpy).toHaveBeenCalled();
      
      // Get all output
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should contain table elements
      expect(output).toContain('name');
      expect(output).toContain('age');
      expect(output).toContain('city');
      expect(output).toContain('Alice');
      expect(output).toContain('Bob');
    });

    it('should handle empty data array', () => {
      Printer.printTable([]);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Empty table (no data)');
    });

    it('should add index column when requested', () => {
      Printer.printTable(sampleData, ['white'] as ColorName[], { 
        showIndex: true 
      });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should have index column
      expect(output).toContain('#');
      expect(output).toContain('1');
      expect(output).toContain('2');
      expect(output).toContain('3');
    });

    it('should truncate long values with maxColumnWidth', () => {
      const longData = [
        { text: 'This is a very long text that should be truncated' },
        { text: 'Short' }
      ];
      
      Printer.printTable(longData, ['white'] as ColorName[], { 
        maxColumnWidth: 10,
        truncate: true 
      });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should truncate long text
      expect(output).toContain('...');
    });

    it('should not truncate when truncate is false', () => {
      const longData = [
        { text: 'This text should not be truncated even though it is long' }
      ];
      
      Printer.printTable(longData, ['white'] as ColorName[], { 
        maxColumnWidth: 10,
        truncate: false 
      });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should contain full text
      expect(output).toContain('This text should not be truncated');
    });

    it('should handle single border style', () => {
      Printer.printTable(sampleData, ['white'] as ColorName[], { 
        borderStyle: 'single' 
      });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should contain single-line box characters
      expect(output).toContain('┌');
      expect(output).toContain('│');
      expect(output).toContain('└');
    });

    it('should handle double border style', () => {
      Printer.printTable(sampleData, ['white'] as ColorName[], { 
        borderStyle: 'double' 
      });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should contain double-line box characters
      expect(output).toContain('╔');
      expect(output).toContain('║');
      expect(output).toContain('╚');
    });

    it('should handle no border style', () => {
      Printer.printTable(sampleData, ['white'] as ColorName[], { 
        borderStyle: 'none' 
      });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should not contain border characters
      expect(output).not.toContain('┌');
      expect(output).not.toContain('│');
    });

    it('should handle compact mode', () => {
      Printer.printTable(sampleData, ['white'] as ColorName[], { 
        compact: true 
      });
      
      // Compact mode reduces separator lines
      const normalCalls = consoleLogSpy.mock.calls.length;
      
      jest.clearAllMocks();
      
      Printer.printTable(sampleData, ['white'] as ColorName[], { 
        compact: false 
      });
      
      const nonCompactCalls = consoleLogSpy.mock.calls.length;
      
      // Non-compact should have more lines (separators)
      expect(nonCompactCalls).toBeGreaterThanOrEqual(normalCalls);
    });

    it('should handle various data types in cells', () => {
      const mixedData = [
        {
          string: 'text',
          number: 42,
          float: 3.14159,
          boolean: true,
          null: null,
          undefined: undefined,
          date: new Date('2024-01-01T00:00:00Z'),
          array: [1, 2, 3],
          object: { key: 'value', nested: true }
        }
      ];
      
      Printer.printTable(mixedData);
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Check formatting of different types
      expect(output).toContain('text');
      expect(output).toContain('42');
      expect(output).toContain('3.14159');
      expect(output).toContain('true');
      expect(output).toContain('null');
      expect(output).toContain('undefined');
      expect(output).toContain('[3 items]'); // Array representation
      expect(output).toContain('[Object]'); // Object representation
    });

    it('should handle inconsistent object keys', () => {
      const inconsistentData = [
        { a: 1, b: 2 },
        { b: 3, c: 4 },
        { a: 5, c: 6 }
      ];
      
      Printer.printTable(inconsistentData);
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should handle all unique keys
      expect(output).toContain('a');
      expect(output).toContain('b');
      expect(output).toContain('c');
    });

    it('should apply header colors', () => {
      const headerColors: ColorName[] = ['brightWhite', 'bold'];
      
      Printer.printTable(sampleData, headerColors);
      
      // Table should be printed (can't easily test colors in output)
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('printTree method', () => {
    const treeData = {
      root: {
        child1: 'value1',
        child2: {
          nested1: 'nested value',
          nested2: 42,
          nested3: {
            deep: 'very deep value'
          }
        },
        child3: null,
        child4: [1, 2, 3]
      }
    };

    it('should print tree structure with values', () => {
      Printer.printTree(treeData);
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should contain tree structure
      expect(output).toContain('root');
      expect(output).toContain('child1');
      expect(output).toContain('value1');
      expect(output).toContain('nested1');
      expect(output).toContain('nested value');
    });

    it('should respect max depth limit', () => {
      const deepTree = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'too deep'
              }
            }
          }
        }
      };
      
      Printer.printTree(deepTree, { maxDepth: 2 });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should show ellipsis for deep levels
      expect(output).toContain('...');
      expect(output).not.toContain('level5');
    });

    it('should hide values when showValues is false', () => {
      Printer.printTree(treeData, { showValues: false });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should show keys but not values
      expect(output).toContain('child1');
      expect(output).not.toContain('value1');
    });

    it('should show custom label', () => {
      Printer.printTree(treeData, { label: 'My Custom Tree' });
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('My Custom Tree');
    });

    it('should handle empty object', () => {
      Printer.printTree({});
      
      // Should still print something (at least the label)
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should use tree branch characters', () => {
      Printer.printTree(treeData);
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Should contain tree characters
      expect(output).toContain('├─');
      expect(output).toContain('└─');
    });

    it('should handle circular references gracefully', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      
      // Should not throw or infinite loop
      expect(() => Printer.printTree(circular, { maxDepth: 3 })).not.toThrow();
    });

    it('should apply colors when enabled', () => {
      Printer.printTree(treeData, { colors: true });
      
      // Should print (colors would be in ANSI codes)
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not apply colors when disabled', () => {
      Printer.printTree(treeData, { colors: false });
      
      // Should print without colors
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('terminal utilities', () => {
    it('should clear console in browser', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.clear();
      
      expect(consoleClearSpy).toHaveBeenCalled();
    });

    it('should clear terminal in Node', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(false);
      process.env.NODE_ENV = 'production';
      
      Printer.clear();
      
      // Should write clear sequence
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('\x1bc');
    });

    it('should get terminal size', () => {
      const size = Printer.getTerminalSize();
      
      expect(size).toHaveProperty('columns');
      expect(size).toHaveProperty('rows');
      expect(typeof size.columns).toBe('number');
      expect(typeof size.rows).toBe('number');
      expect(size.columns).toBeGreaterThan(0);
      expect(size.rows).toBeGreaterThan(0);
    });

    it('should return default size in browser', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      const size = Printer.getTerminalSize();
      
      expect(size.columns).toBe(80);
      expect(size.rows).toBe(24);
    });

    it('should detect TTY status', () => {
      const isTTY = Printer.isTTY();
      
      expect(typeof isTTY).toBe('boolean');
    });

    it('should return false for TTY in browser', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      const isTTY = Printer.isTTY();
      
      expect(isTTY).toBe(false);
    });

    it('should move cursor to position in terminal', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.moveCursor(10, 5);
      
      // Should write cursor position escape sequence
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('\x1b[5;10H');
    });

    it('should not move cursor in browser', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.moveCursor(10, 5);
      
      // Should not write anything
      expect(processStdoutWriteSpy).not.toHaveBeenCalled();
    });

    it('should save cursor position in terminal', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.saveCursor();
      
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('\x1b[s');
    });

    it('should restore cursor position in terminal', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.restoreCursor();
      
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('\x1b[u');
    });

    it('should hide cursor in terminal', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.hideCursor();
      
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('\x1b[?25l');
    });

    it('should show cursor in terminal', () => {
      process.env.NODE_ENV = 'production';
      
      Printer.showCursor();
      
      expect(processStdoutWriteSpy).toHaveBeenCalledWith('\x1b[?25h');
    });

    it('should not manipulate cursor in browser', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.saveCursor();
      Printer.restoreCursor();
      Printer.hideCursor();
      Printer.showCursor();
      
      expect(processStdoutWriteSpy).not.toHaveBeenCalled();
    });
  });

  describe('stream management', () => {
    it('should get current output stream', () => {
      const stream = Printer.getStream();
      
      expect(stream).toBeDefined();
    });

    it('should return console in browser environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      const stream = Printer.getStream();
      
      expect(stream).toBe(console);
    });

    it('should return stdout in Node environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(false);
      
      const stream = Printer.getStream();
      
      // Always check that stream exists
      expect(stream).toBeDefined();
      
      // In test environment, process.stdout should always be available
      expect(stream).toBe(process.stdout);
    });

    it('should redirect output to custom stream', () => {
      const mockStream = {
        write: jest.fn(),
        columns: 100,
        rows: 30
      } as unknown as NodeJS.WriteStream & { columns: number; rows: number };
      
      Printer.redirect(mockStream);
      
      // Test that output goes to new stream
      process.env.NODE_ENV = 'production';
      Printer.print('redirected output');
      
      expect(mockStream.write).toHaveBeenCalledWith('redirected output\n');
      expect(processStdoutWriteSpy).not.toHaveBeenCalled();
      
      // Reset for cleanup
      Printer.reset();
    });

    it('should not redirect in browser environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      const mockStream = { write: jest.fn() } as unknown as NodeJS.WriteStream;
      
      Printer.redirect(mockStream);
      Printer.print('test');
      
      // Should still use console in browser
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(mockStream.write).not.toHaveBeenCalled();
    });

    it('should reset to default stream', () => {
      const mockStream = { write: jest.fn() } as unknown as NodeJS.WriteStream;
      
      Printer.redirect(mockStream);
      Printer.reset();
      
      const stream = Printer.getStream();
      
      // In test environment, should reset to stdout
      expect(stream).toBe(process.stdout);
    });

    it('should handle reset in browser environment', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      Printer.reset();
      
      const stream = Printer.getStream();
      expect(stream).toBe(console);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      
      expect(() => Printer.print(longString)).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle unicode and emoji', () => {
      const unicode = '你好世界 🌍 émojis 👍 special: ñ ü ß';
      
      Printer.print(unicode);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(unicode);
    });

    it('should handle null columns in terminal size', () => {
      // Mock stdout without columns
      const originalColumns = process.stdout.columns;
      (process.stdout as { columns?: number }).columns = undefined;
      
      const size = Printer.getTerminalSize();
      
      expect(size.columns).toBe(80); // Should use default
      
      process.stdout.columns = originalColumns;
    });

    it('should handle undefined process in browser-like environment', () => {
      // Temporarily mock process as undefined
      const originalProcess = global.process;
      delete (global as { process?: NodeJS.Process }).process;
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      expect(() => Printer.print('test')).not.toThrow();
      
      // Restore
      (global as { process?: NodeJS.Process }).process = originalProcess;
    });

    it('should handle print with timestamps and long format', () => {
      Printer.configure({
        timestamps: true,
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS Z'
      });
      
      Printer.print('test');
      
      // Should not throw and should include formatted timestamp
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle concurrent buffering operations', () => {
      Printer.startBuffering();
      Printer.print('1');
      
      // Start again (should be no-op)
      Printer.startBuffering();
      Printer.print('2');
      
      Printer.flush();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('1\n2');
      
      Printer.stopBuffering();
    });

    it('should handle progress bar edge percentages', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);
      
      // Negative percentage
      Printer.printProgress('[          ]', '-10%');
      expect(consoleLogSpy).toHaveBeenCalledWith('[          ] -10%');
      
      // Over 100%
      Printer.printProgress('[██████████]', '150%');
      expect(consoleLogSpy).toHaveBeenCalledWith('[██████████] 150%');
    });

    it('should handle table with single row', () => {
      Printer.printTable([{ single: 'row' }]);
      
      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('single');
      expect(output).toContain('row');
    });

    it('should handle table with very wide columns', () => {
      const wideData = [
        { veryLongColumnName: 'a'.repeat(200) }
      ];
      
      Printer.printTable(wideData, ['white'] as ColorName[], {
        maxColumnWidth: 50,
        truncate: true
      });
      
      // Should handle without error
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});