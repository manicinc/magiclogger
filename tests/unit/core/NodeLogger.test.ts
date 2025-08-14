/**
 * Unit tests for NodeLogger class
 * 
 * Tests Node.js-specific logging functionality including file logging,
 * ANSI styling, context/tag management, and various output methods.
 * 
 * @module tests/unit/core/NodeLogger.test
 */

// Mock dependencies BEFORE imports
jest.mock('../../../src/core/FileManager');
jest.mock('../../../src/core/Formatter');
jest.mock('../../../src/core/ContextManager');
jest.mock('../../../src/core/TagManager');

import { NodeLogger } from '../../../src/core/NodeLogger';
import { FileManager } from '../../../src/core/FileManager';
import { Formatter } from '../../../src/core/Formatter';
import { ContextManager } from '../../../src/core/ContextManager';
import { TagManager } from '../../../src/core/TagManager';
import { ColorName } from '../../../src/types';

// Get the mocked classes
const MockedFileManager = FileManager as jest.MockedClass<typeof FileManager>;
const MockedFormatter = Formatter as jest.MockedClass<typeof Formatter>;
const MockedContextManager = ContextManager as jest.MockedClass<typeof ContextManager>;
const MockedTagManager = TagManager as jest.MockedClass<typeof TagManager>;

describe('NodeLogger', () => {
  let logger: NodeLogger;
  let mockFileManager: jest.Mocked<FileManager>;
  let mockFormatter: jest.Mocked<Formatter>;
  
  // Store original console methods
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks first
    jest.clearAllMocks();
    
    // Setup console spies
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Setup mock implementations
    mockFileManager = {
      initLogFile: jest.fn().mockResolvedValue('/test/log.log'),
      initLogFileSync: jest.fn().mockReturnValue('/test/log.log'),
      appendToFile: jest.fn().mockReturnValue(true),
      getLogFile: jest.fn().mockReturnValue('/test/log.log'),
      getLogDir: jest.fn().mockReturnValue('/test'),
      setLogDir: jest.fn(),
      getLogRetentionDays: jest.fn().mockReturnValue(30),
      setLogRetentionDays: jest.fn(),
      cleanupOldLogs: jest.fn().mockResolvedValue(undefined),
      cleanupDirectory: jest.fn().mockResolvedValue(undefined),
      resolveLogDir: jest.fn().mockImplementation(dir => dir),
    } as unknown as jest.Mocked<FileManager>;
    
    mockFormatter = {
      colorize: jest.fn().mockImplementation((text, _colors) => `[COLORED]${text}[/COLORED]`),
      preserveLinks: jest.fn().mockImplementation(text => text),
      stripAnsi: jest.fn().mockImplementation(text => text),
      format: jest.fn().mockImplementation(text => text),
      setUseColors: jest.fn(),
      clearCache: jest.fn(),
      formatTimestamp: jest.fn().mockImplementation(() => '12:34:56'),
      formatDuration: jest.fn().mockImplementation(() => '1.2s'),
    } as unknown as jest.Mocked<Formatter>;
    
    // Reset mock implementations - this ensures fresh constructors are called
    MockedFileManager.mockClear();
    MockedFormatter.mockClear();
    MockedContextManager.mockClear();
    MockedTagManager.mockClear();
    
    // Mock constructor implementations BEFORE creating any instances
    MockedFileManager.mockImplementation(() => mockFileManager);
    MockedFormatter.mockImplementation(() => mockFormatter);
    
    // Mock ContextManager and TagManager constructors
    MockedContextManager.mockImplementation(() => ({
      getContext: jest.fn().mockReturnValue({}),
      setContext: jest.fn(),
      updateContext: jest.fn(),
      clearContext: jest.fn(),
      hasContext: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<ContextManager>));
    
    MockedTagManager.mockImplementation(() => ({
      getTags: jest.fn().mockReturnValue([]),
      setTags: jest.fn(),
      addTag: jest.fn(),
      removeTag: jest.fn(),
      clearTags: jest.fn(),
      hasTags: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<TagManager>));
    
    // Create logger instance AFTER all mocks are set up
    logger = new NodeLogger();
    
    // Force the logger to use our mock fileManager and formatter
    Object.defineProperty(logger, 'fileManager', {
      value: mockFileManager,
      writable: true,
      configurable: true
    });
    Object.defineProperty(logger, 'formatter', {
      value: mockFormatter,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor and initialization', () => {
    it('should initialize with default options', () => {
      const defaultLogger = new NodeLogger();
      
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger.isVerbose()).toBe(false);
      expect(defaultLogger.areColorsEnabled()).toBe(true);
    });

    it('should initialize with custom options', () => {
      const customLogger = new NodeLogger({
        verbose: true,
        useColors: false,
        writeToDisk: true,
        logDir: '/custom/logs',
        logRetentionDays: 14
      });
      
      expect(customLogger.isVerbose()).toBe(true);
      expect(customLogger.areColorsEnabled()).toBe(false);
      expect(customLogger.isWriteToDiskEnabled()).toBe(true);
    });

    it('should initialize file manager when writeToDisk is true', () => {
      // Add debugging to understand what's happening
      console.log('MockedFileManager before test:', typeof MockedFileManager);
      console.log('MockedFileManager mock calls before:', MockedFileManager.mock?.calls?.length || 'no mock');
      
      new NodeLogger({ writeToDisk: true });
      
      console.log('MockedFileManager mock calls after:', MockedFileManager.mock?.calls?.length || 'no mock');
      console.log('MockedFileManager mock instances:', MockedFileManager.mock?.instances?.length || 'no mock');
      
      // Check if FileManager was instantiated (indicating file logging is enabled)
      console.log('FileManager instances created:', MockedFileManager.mock?.instances?.length || 0);
      
      expect(MockedFileManager).toHaveBeenCalled();
      expect(mockFileManager.initLogFileSync).toHaveBeenCalled();
    });

    it('should handle file initialization failure gracefully', () => {
      // Setup mock to fail during initialization
      const fileManagerMock = {
        ...mockFileManager,
        initLogFileSync: jest.fn().mockImplementation(() => {
          throw new Error('Permission denied');
        })
      } as unknown as jest.Mocked<FileManager>;
      
      (FileManager as jest.MockedClass<typeof FileManager>).mockImplementation(() => fileManagerMock);
      
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[NodeLogger] Failed to initialize log file:',
        expect.any(Error)
      );
      expect(fileLogger.isWriteToDiskEnabled()).toBe(false);
    });

    it('should initialize context manager when context provided', () => {
      const contextLogger = new NodeLogger({
        context: { userId: 123, sessionId: 'abc' }
      });
      
      expect(MockedContextManager).toHaveBeenCalled();
      expect(contextLogger.getContextManager()).toBeDefined();
    });

    it('should initialize tag manager when tags provided', () => {
      const tagLogger = new NodeLogger({
        tags: ['api', 'production']
      });
      
      expect(MockedTagManager).toHaveBeenCalled();
      expect(tagLogger.getTagManager()).toBeDefined();
    });
  });

  describe('basic logging methods', () => {
    it('should log info messages', () => {
      // Set up console.log spy since Printer.print calls console.log in test environment
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logger.info('Info message');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[INFO]', expect.any(Array));
  expect(mockFormatter.preserveLinks).toHaveBeenCalledWith(expect.stringContaining('Info message'));
      // Check that console.log was called (what Printer.print actually does)
      expect(consoleLogSpy).toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[WARN]', expect.any(Array));
  expect(mockFormatter.preserveLinks).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Error message');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[ERROR]', expect.any(Array));
  expect(mockFormatter.preserveLinks).toHaveBeenCalledWith(expect.stringContaining('Error message'));
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log debug messages only when verbose is true', () => {
      logger.debug('Debug message');
      
      // Should not log when verbose is false
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      logger.setVerbose(true);
      logger.debug('Debug message 2');
      
      // Should log when verbose is true
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log success messages', () => {
      logger.success('Success message');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[SUCCESS]', expect.any(Array));
  expect(mockFormatter.preserveLinks).toHaveBeenCalledWith(expect.stringContaining('Success message'));
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('custom logging method', () => {
    it('should log with custom prefix and colors', () => {
      logger.custom('Custom message', ['red', 'bold'], 'CUSTOM');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[CUSTOM]', ['red', 'bold']);
      expect(mockFormatter.preserveLinks).toHaveBeenCalledWith('Custom message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should use default colors when not provided', () => {
      logger.custom('Message', undefined, 'PREFIX');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[PREFIX]', ['white']);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should use default prefix when not provided', () => {
      logger.custom('Message', ['green']);
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('[LOG]', ['green']);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should write to file when enabled', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.custom('Test', ['blue'], 'TEST');
      
  expect(mockFileManager.appendToFile).toHaveBeenCalledWith(expect.stringContaining('[TEST] Test'));
    });
  });

  describe('styled logging method', () => {
    it('should apply preset styles', () => {
      logger.styled('Styled message', 'info');
      
      expect(mockFormatter.colorize).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle custom preset styles', () => {
      logger.addPreset('custom', ['magenta', 'underline']);
      logger.styled('Custom styled', 'custom' as 'info');
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should write styled messages to file', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.styled('Message', 'error');
      
  expect(mockFileManager.appendToFile).toHaveBeenCalledWith(expect.stringContaining('[ERROR] Message'));
    });
  });

  describe('header method', () => {
    it('should create header with default colors', () => {
      logger.header('Section Title');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        expect.stringContaining('Section Title'),
        ['brightWhite', 'bgBlue', 'bold']
      );
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should create header with custom colors', () => {
      logger.header('Custom Header', ['red', 'bgWhite']);
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        expect.any(String),
        ['red', 'bgWhite']
      );
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should pad header to 80 characters', () => {
      logger.header('Short');
      
      const colorizeCall = mockFormatter.colorize.mock.calls[0];
      const paddedText = colorizeCall[0];
      
      // Should be padded to approximately 80 chars
      expect(paddedText.length).toBeGreaterThanOrEqual(75);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should write header to file with formatting', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.header('Header');
      
      expect(mockFileManager.appendToFile).toHaveBeenCalledWith(
        expect.stringContaining('=== Header')
      );
    });
  });

  describe('table method', () => {
    const tableData = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ];

    it('should print table with default header colors', () => {
      logger.table(tableData);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should print table with custom header colors', () => {
      logger.table(tableData, ['red', 'underline'] as ColorName[]);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should write table summary to file', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.table(tableData);
      
      expect(mockFileManager.appendToFile).toHaveBeenCalledWith('[TABLE] 2 rows');
      expect(mockFileManager.appendToFile).toHaveBeenCalledWith(
        expect.stringContaining('Row 1:')
      );
      expect(mockFileManager.appendToFile).toHaveBeenCalledWith(
        expect.stringContaining('Row 2:')
      );
    });

    it('should handle empty table', () => {
      logger.table([]);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('link method', () => {
    it('should format and display links', () => {
      logger.link('https://example.com', 'Example Site');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        '[Example Site]',
        ['brightCyan', 'underline']
      );
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should use URL as label when description not provided', () => {
      logger.link('https://example.com');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        '[https://example.com]',
        ['brightCyan', 'underline']
      );
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should normalize Windows paths', () => {
      logger.link('C:\\Users\\Documents\\file.txt', 'File');
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should write link to file', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.link('https://example.com', 'Example');
      
      expect(mockFileManager.appendToFile).toHaveBeenCalledWith(
        'Example: https://example.com'
      );
    });
  });

  describe('progressBar method', () => {
    it('should display progress bar', () => {
      logger.progressBar(50);
      
      expect(mockFormatter.colorize).toHaveBeenCalledTimes(2); // Complete and incomplete parts
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle 0% progress', () => {
      logger.progressBar(0);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle 100% progress', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.progressBar(100);
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(mockFileManager.appendToFile).toHaveBeenCalledWith(
        '[PROGRESS] 100% complete'
      );
    });

    it('should handle custom bar length', () => {
      logger.progressBar(50, 30);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle custom characters', () => {
      logger.progressBar(50, 20, '=', '-');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('='.repeat(10), ['green']);
      expect(mockFormatter.colorize).toHaveBeenCalledWith('-'.repeat(10), ['gray']);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should clamp progress to 0-100 range', () => {
      logger.progressBar(-10);
      expect(consoleLogSpy).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      logger.progressBar(150);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not use colors when disabled', () => {
      const noColorLogger = new NodeLogger({ useColors: false });
      
      noColorLogger.progressBar(50);
      
      // Should still call printProgress but without colored formatting
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('color method', () => {
    it('should return a colorizing function', () => {
      const redText = logger.color('red');
      
      expect(typeof redText).toBe('function');
      
      redText('test');
      expect(mockFormatter.colorize).toHaveBeenCalledWith('test', ['red']);
    });

    it('should handle multiple colors', () => {
      const styledText = logger.color('red', 'bold', 'underline');
      
      styledText('test');
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        'test',
        ['red', 'bold', 'underline']
      );
    });
  });

  describe('colorize method', () => {
    it('should directly colorize text', () => {
      logger.colorize('test', ['blue', 'italic']);
      
      expect(mockFormatter.colorize).toHaveBeenCalledWith('test', ['blue', 'italic']);
    });
  });

  describe('colorParts method', () => {
    it('should color different parts of a message', () => {
      const result = logger.colorParts('Hello world test', {
        'Hello': ['red'],
        'world': ['blue'],
        'test': ['green']
      });
      
      // Should call colorize for each part
      expect(mockFormatter.colorize).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle empty color map', () => {
      const result = logger.colorParts('test message', {});
      
      expect(result).toBe('test message');
    });

    it('should handle non-string message', () => {
      const result = logger.colorParts(123 as unknown as string, { '123': ['red'] });
      
      expect(result).toBeDefined();
    });

    it('should skip coloring when colors disabled', () => {
      const noColorLogger = new NodeLogger({ useColors: false });
      
      const result = noColorLogger.colorParts('test', { 'test': ['red'] });
      
      expect(result).toBe('test');
    });

    it('should handle overlapping parts', () => {
      const result = logger.colorParts('test testing', {
        'test': ['red'],
        'testing': ['blue']
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('separator method', () => {
    it('should print separator line with default character', () => {
      logger.separator();
      
      // Should print line of dashes
      expect(mockFormatter.colorize).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should print separator with custom character', () => {
      logger.separator('=', 30);
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('file logging functionality', () => {
    it('should get log file path', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      const path = fileLogger.getLogFilePath();
      
      expect(path).toBe('/test/log.log');
    });

    it('should return null when file logging disabled', () => {
      const path = logger.getLogFilePath();
      
      expect(path).toBeNull();
    });

    it('should enable file logging', () => {
      logger.setFileLogging(true);
      
      expect(MockedFileManager).toHaveBeenCalled();
      expect(mockFileManager.initLogFile).toHaveBeenCalled();
    });

    it('should disable file logging', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.setFileLogging(false);
      
      expect(fileLogger.isWriteToDiskEnabled()).toBe(false);
    });

    it('should handle file logging enable failure', async () => {
      mockFileManager.initLogFile.mockRejectedValue(new Error('Permission denied'));
      
      logger.setFileLogging(true);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize log file:',
        expect.any(Error)
      );
      expect(logger.isWriteToDiskEnabled()).toBe(false);
    });

    it('should get log directory', () => {
      const dir = logger.getLogDirectory();
      
      expect(dir).toBeDefined();
    });

    it('should set log directory', () => {
      logger.setLogDirectory('/new/logs', false);
      
      expect(mockFileManager.setLogDir).toHaveBeenCalledWith('/new/logs');
    });

    it('should reinitialize log file when setting directory', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.setLogDirectory('/new/logs', true);
      
      expect(mockFileManager.setLogDir).toHaveBeenCalledWith('/new/logs');
      expect(mockFileManager.initLogFile).toHaveBeenCalled();
    });

    it('should get log retention days', () => {
      const days = logger.getLogRetentionDays();
      
      expect(days).toBe(30);
    });

    it('should set log retention days', () => {
      logger.setLogRetentionDays(14, false);
      
      expect(mockFileManager.setLogRetentionDays).toHaveBeenCalledWith(14);
    });

    it('should clean old logs when setting retention', () => {
      logger.setLogRetentionDays(7, true);
      
      expect(mockFileManager.setLogRetentionDays).toHaveBeenCalledWith(7);
      expect(mockFileManager.cleanupOldLogs).toHaveBeenCalled();
    });

    it('should enforce minimum retention days', () => {
      logger.setLogRetentionDays(0);
      
      expect(mockFileManager.setLogRetentionDays).toHaveBeenCalledWith(1);
    });
  });

  describe('cleanupOldLogs method', () => {
    it('should cleanup old logs when file manager exists', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      
      fileLogger.cleanupOldLogs();
      
      expect(mockFileManager.cleanupOldLogs).toHaveBeenCalled();
    });

    it('should create temporary file manager for cleanup when none exists', () => {
      logger.cleanupOldLogs();
      
      // Should create temporary FileManager
      expect(MockedFileManager).toHaveBeenCalled();
    });
  });

  describe('theme management', () => {
    it('should set and apply theme', () => {
      const theme = {
        info: ['cyan'] as ColorName[],
        error: ['brightRed', 'bold'] as ColorName[]
      };
      
      logger.setTheme(theme);
      
      expect(logger.getTheme()).toMatchObject(theme);
    });

    it('should use theme colors for log levels', () => {
      logger.setTheme({
        info: ['magenta'] as ColorName[]
      });
      
      logger.info('Themed message');
      
      // Should use theme color for info level
      expect(mockFormatter.colorize).toHaveBeenCalledWith(
        '[INFO]',
        expect.arrayContaining(['magenta'])
      );
    });
  });

  describe('color management', () => {
    it('should enable colors and update formatter', () => {
      logger.setColorsEnabled(true);
      
      expect(mockFormatter.setUseColors).toHaveBeenCalledWith(true);
    });

    it('should disable colors and update formatter', () => {
      logger.setColorsEnabled(false);
      
      expect(mockFormatter.setUseColors).toHaveBeenCalledWith(false);
    });
  });

  describe('inherited LoggerBase methods', () => {
    it('should support log method with different levels', () => {
      logger.log('Info message', 'info');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      jest.clearAllMocks();
      
      logger.log('Error message', 'error');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should get and set verbose mode', () => {
      expect(logger.isVerbose()).toBe(false);
      
      logger.setVerbose(true);
      expect(logger.isVerbose()).toBe(true);
    });

    it('should add and remove custom presets', () => {
      logger.addPreset('myPreset', ['yellow', 'italic']);
      
      // Use the custom preset
      logger.styled('Message', 'myPreset' as 'info');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      logger.removePreset('myPreset');
    });

    it('should get configuration', () => {
      const config = logger.getConfig();
      
      expect(config).toHaveProperty('verbose');
      expect(config).toHaveProperty('useColors');
      expect(config).toHaveProperty('theme');
    });

    it('should update configuration', () => {
      logger.updateConfig({
        verbose: true,
        useColors: false,
        id: 'test-logger'
      });
      
      const config = logger.getConfig();
      expect(config.verbose).toBe(true);
      expect(config.useColors).toBe(false);
      expect(config.id).toBe('test-logger');
    });

    it('should emit events', () => {
      const listener = jest.fn();
      logger.on('log', listener);
      
      logger.info('Test');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Test'
        })
      );
    });

    it('should get performance stats', () => {
      logger.info('Test 1');
      logger.info('Test 2');
      
      const stats = logger.getPerformanceStats();
      
      expect(stats).toHaveProperty('info');
      expect(stats.info).toHaveProperty('count');
      expect(stats.info.count).toBe(2);
    });

    it('should reset performance stats', () => {
      logger.info('Test');
      logger.resetPerformanceStats();
      
      const stats = logger.getPerformanceStats();
      expect(stats).toEqual({});
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined messages gracefully', () => {
      expect(() => logger.info(null as unknown as string)).not.toThrow();
      expect(() => logger.info(undefined as unknown as string)).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      
      expect(() => logger.info(longMessage)).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle special characters in messages', () => {
      const specialMessage = '!@#$%^&*()_+-=[]{}|;:\'"<>,.?/\\`~\n\t\r';
      
      expect(() => logger.info(specialMessage)).not.toThrow();
    });

    it('should handle unicode in messages', () => {
      const unicodeMessage = '你好世界 🌍 emojis 👍';
      
      expect(() => logger.info(unicodeMessage)).not.toThrow();
    });

    it('should handle circular references in table data', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      
      expect(() => logger.table([circular])).not.toThrow();
    });

    it('should handle file write failures gracefully', () => {
      const fileLogger = new NodeLogger({ writeToDisk: true });
      mockFileManager.appendToFile.mockReturnValue(false);
      
      // Should continue logging even if file write fails
      expect(() => fileLogger.info('Test')).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle formatter errors gracefully', () => {
      mockFormatter.colorize.mockImplementation(() => {
        throw new Error('Formatter error');
      });
      
      // Should still attempt to print
      expect(() => logger.info('Test')).not.toThrow();
    });

    it('should handle invalid color names', () => {
      expect(() => logger.custom('Test', ['invalidColor' as ColorName])).not.toThrow();
    });

    it('should handle invalid preset names', () => {
      expect(() => logger.styled('Test', 'invalidPreset' as 'info')).not.toThrow();
    });

    it('should clean up resources on destroy', () => {
      const listener = jest.fn();
      logger.on('log', listener);
      
      logger.destroy();
      
      // Should remove all listeners
      logger.emit('log', { test: true });
      expect(listener).not.toHaveBeenCalled();
    });
  });
});