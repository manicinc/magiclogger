/**
 * Unit tests for FileManager class
 *
 * Tests file system operations including log file creation, rotation,
 * cleanup, and error handling for both Node.js and browser environments.
 *
 * @module tests/unit/core/FileManager.test
 */

import { FileManager } from '../../../src/core/FileManager';
import { isBrowserEnvironment } from '../../../src/utils/environment';
import { fsMocks, createStatsMock } from '../../../jest.setup';
import * as path from 'path';
import * as fs from 'fs';

// Mock environment detection
jest.mock('../../../src/utils/environment', () => ({
  isBrowserEnvironment: jest.fn().mockReturnValue(false),
  isNodeEnvironment: jest.fn().mockReturnValue(true),
}));

describe('FileManager', () => {
  let fileManager: FileManager;
  const testLogDir = '/test/logs';
  const testRetentionDays = 7;

  // Store console.error spy for error handling tests
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    fsMocks.resetAll();

    // Setup console.error spy
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Setup default mock responses for fs operations
    fsMocks.existsSync.mockReturnValue(false);
    fsMocks.mkdirSync.mockImplementation(() => undefined);
    fsMocks.writeFileSync.mockImplementation(() => undefined);
    fsMocks.appendFileSync.mockImplementation(() => undefined);
    fsMocks.readdirSync.mockReturnValue([]);
    fsMocks.unlinkSync.mockImplementation(() => undefined);
    fsMocks.rmdirSync.mockImplementation(() => undefined);
    fsMocks.rmSync.mockImplementation(() => undefined);
    fsMocks.statSync.mockReturnValue(createStatsMock());

    // Create FileManager instance with test directory
    fileManager = new FileManager(testLogDir, testRetentionDays);
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('constructor and initialization', () => {
    it('should initialize with provided directory and retention days', () => {
      expect(fileManager.getLogDir()).toContain('logs');
      expect(fileManager.getLogRetentionDays()).toBe(testRetentionDays);
    });

    it('should handle relative directory paths', () => {
      const relativeManager = new FileManager('./logs', 30);
      const dir = relativeManager.getLogDir();

      // Should be resolved to absolute path
      expect(path.isAbsolute(dir)).toBe(true);
      expect(dir).toContain('logs');
    });

    it('should handle absolute directory paths', () => {
      const absolutePath = '/absolute/path/to/logs';
      const absoluteManager = new FileManager(absolutePath, 30);

      expect(absoluteManager.getLogDir()).toBe(absolutePath);
    });

    it('should use default retention days when not provided', () => {
      const defaultManager = new FileManager(testLogDir);

      expect(defaultManager.getLogRetentionDays()).toBe(30);
    });

    it('should handle Windows-style paths', () => {
      const windowsPath = 'C:\\Users\\logs';
      const windowsManager = new FileManager(windowsPath, 15);

      expect(windowsManager.getLogDir()).toBeDefined();
    });

    it('should handle browser environment gracefully', () => {
      (isBrowserEnvironment as jest.Mock).mockReturnValue(true);

      const browserManager = new FileManager('logs', 30);

      expect(browserManager).toBeDefined();
      expect(browserManager.getLogDir()).toBeDefined();

      // Reset to Node environment
      (isBrowserEnvironment as jest.Mock).mockReturnValue(false);
    });

    it('should handle empty string as directory', () => {
      const emptyDirManager = new FileManager('', 30);

      // Should resolve to current directory + empty string
      expect(emptyDirManager.getLogDir()).toBeDefined();
    });
  });

  describe('resolveLogDir method', () => {
    it('should resolve relative paths to absolute paths', () => {
      const resolved = fileManager.resolveLogDir('./logs');

      expect(path.isAbsolute(resolved)).toBe(true);
      expect(resolved).toContain('logs');
    });

    it('should keep absolute paths unchanged', () => {
      const absolutePath = '/absolute/path/to/logs';
      const resolved = fileManager.resolveLogDir(absolutePath);

      expect(resolved).toBe(absolutePath);
    });

    it('should resolve parent directory references', () => {
      const resolved = fileManager.resolveLogDir('../logs');

      expect(path.isAbsolute(resolved)).toBe(true);
    });

    it('should resolve current directory reference', () => {
      const resolved = fileManager.resolveLogDir('.');

      expect(path.isAbsolute(resolved)).toBe(true);
    });

    it('should throw TypeError for non-string input', () => {
      expect(() => fileManager.resolveLogDir(123 as unknown as string)).toThrow(TypeError);
      expect(() => fileManager.resolveLogDir(123 as unknown as string)).toThrow(
        'The "path" argument must be of type string'
      );
    });

    it('should throw TypeError for null input', () => {
      expect(() => fileManager.resolveLogDir(null as unknown as string)).toThrow(TypeError);
    });

    it('should throw TypeError for undefined input', () => {
      expect(() => fileManager.resolveLogDir(undefined as unknown as string)).toThrow(TypeError);
    });

    it('should throw TypeError for object input', () => {
      expect(() => fileManager.resolveLogDir({} as unknown as string)).toThrow(TypeError);
    });

    it('should handle paths with spaces', () => {
      const pathWithSpaces = '/path with spaces/logs';
      const resolved = fileManager.resolveLogDir(pathWithSpaces);

      expect(resolved).toBe(pathWithSpaces);
    });
  });

  describe('initLogFile method (async)', () => {
    it('should create log directory if it does not exist', async () => {
      fsMocks.existsSync.mockReturnValue(false);

      const logFile = await fileManager.initLogFile();

      expect(fsMocks.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
      expect(logFile).not.toBeNull();
    });

    it('should not create directory if it already exists', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      await fileManager.initLogFile();

      expect(fsMocks.mkdirSync).not.toHaveBeenCalled();
    });

    it('should create log file with timestamp in filename', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      const logFile = await fileManager.initLogFile();

      expect(logFile).not.toBeNull();
      expect(logFile).toContain('log-');
      expect(logFile).toContain('.log');

      // Should have ISO timestamp format (with dashes replacing colons/dots)
      expect(logFile).toMatch(/log-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
    });

    it('should write initial header to log file', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      await fileManager.initLogFile();

      expect(fsMocks.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.log'),
        expect.stringContaining('--- Log Start:')
      );
    });

    it('should include timestamp in header', async () => {
      await fileManager.initLogFile();

      const writeCall = fsMocks.writeFileSync.mock.calls[0];
      const content = writeCall[1];

      expect(content).toContain('--- Log Start:');
      // Should have a date/time string
      expect(content).toMatch(/\d/); // Contains digits
    });

    it('should handle directory creation errors', async () => {
      fsMocks.existsSync.mockReturnValue(false);
      fsMocks.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await fileManager.initLogFile();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[FileManager] Failed to initialize log file:',
        expect.any(Error)
      );
    });

    it('should handle file write errors', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const result = await fileManager.initLogFile();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[FileManager] Failed to initialize log file:',
        expect.any(Error)
      );
    });

    it('should handle permission errors', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      const result = await fileManager.initLogFile();

      expect(result).toBeNull();
      expect(fileManager.getLogFile()).toBeNull();
    });

    it('should return same file on multiple calls', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      const file1 = await fileManager.initLogFile();
      const file2 = fileManager.getLogFile();

      expect(file1).toBe(file2);
    });
  });

  describe('initLogFileSync method (synchronous)', () => {
    it('should synchronously create log file', () => {
      fsMocks.existsSync.mockReturnValue(true);

      const logFile = fileManager.initLogFileSync();

      expect(logFile).not.toBeNull();
      expect(fsMocks.writeFileSync).toHaveBeenCalled();
    });

    it('should create directory if needed', () => {
      fsMocks.existsSync.mockReturnValue(false);

      fileManager.initLogFileSync();

      expect(fsMocks.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('should throw error on failure', () => {
      fsMocks.existsSync.mockReturnValue(false);
      fsMocks.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => fileManager.initLogFileSync()).toThrow('Permission denied');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should set log file to null on error', () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      expect(() => fileManager.initLogFileSync()).toThrow();
      expect(fileManager.getLogFile()).toBeNull();
    });

    it('should generate unique filenames', () => {
      fsMocks.existsSync.mockReturnValue(true);

      const manager1 = new FileManager(testLogDir);
      const manager2 = new FileManager(testLogDir);

      // Small delay to ensure different timestamps
      const file1 = manager1.initLogFileSync();

      // Mock a slight time difference
      jest.advanceTimersByTime(1);

      const file2 = manager2.initLogFileSync();

      // Files should have different timestamps
      expect(file1).not.toBe(file2);
    });
  });

  describe('appendToFile method', () => {
    beforeEach(async () => {
      // Initialize log file first
      fsMocks.existsSync.mockReturnValue(true);
      await fileManager.initLogFile();
    });

    it('should append content to log file', () => {
      const content = 'Test log entry';
      const result = fileManager.appendToFile(content);

      expect(result).toBe(true);
      expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.log'),
        `${content}\n`
      );
    });

    it('should add newline after content', () => {
      fileManager.appendToFile('no newline');

      const appendCall = fsMocks.appendFileSync.mock.calls[0];
      const content = appendCall[1];

      expect(content).toBe('no newline\n');
    });

    it('should return false if no log file is initialized', () => {
      const newManager = new FileManager(testLogDir);
      const result = newManager.appendToFile('test');

      expect(result).toBe(false);
      expect(fsMocks.appendFileSync).not.toHaveBeenCalled();
    });

    it('should handle append errors gracefully', () => {
      fsMocks.appendFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const result = fileManager.appendToFile('test');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[FileManager] Failed to append to log file:',
        expect.any(Error)
      );
    });

    it('should reset log file on write error', () => {
      fsMocks.appendFileSync.mockImplementation(() => {
        throw new Error('File corrupted');
      });

      fileManager.appendToFile('test');

      expect(fileManager.getLogFile()).toBeNull();
    });

    it('should handle empty content', () => {
      const result = fileManager.appendToFile('');

      expect(result).toBe(true);
      expect(fsMocks.appendFileSync).toHaveBeenCalledWith(expect.any(String), '\n');
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      const result = fileManager.appendToFile(longContent);

      expect(result).toBe(true);
      expect(fsMocks.appendFileSync).toHaveBeenCalled();
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Line 1\nLine 2\tTabbed\r\nWindows line';
      const result = fileManager.appendToFile(specialContent);

      expect(result).toBe(true);
      expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
        expect.any(String),
        `${specialContent}\n`
      );
    });

    it('should handle unicode content', () => {
      const unicodeContent = '你好世界 🌍 émojis 👍';
      const result = fileManager.appendToFile(unicodeContent);

      expect(result).toBe(true);
      expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
        expect.any(String),
        `${unicodeContent}\n`
      );
    });
  });

  describe('cleanupOldLogs method', () => {
    it('should remove files older than retention period', async () => {
      const now = Date.now();
      const oldFileTime = now - 8 * 24 * 60 * 60 * 1000; // 8 days old
      const newFileTime = now - 2 * 24 * 60 * 60 * 1000; // 2 days old

      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['old.log', 'new.log'] as unknown as fs.Dirent[]);

      // Mock stat calls for each file
      fsMocks.statSync
        .mockReturnValueOnce(
          createStatsMock({
            isDirectory: false,
            mtimeMs: oldFileTime,
          })
        )
        .mockReturnValueOnce(
          createStatsMock({
            isDirectory: false,
            mtimeMs: newFileTime,
          })
        );

      await fileManager.cleanupOldLogs();

      // Should only delete the old file
      expect(fsMocks.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fsMocks.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old.log'));
    });

    it('should skip directories during cleanup', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['subdir', 'file.log'] as unknown as fs.Dirent[]);

      // First is directory, second is old file
      fsMocks.statSync
        .mockReturnValueOnce(
          createStatsMock({
            isDirectory: true,
            mtimeMs: 0,
          })
        )
        .mockReturnValueOnce(
          createStatsMock({
            isDirectory: false,
            mtimeMs: 0,
          })
        );

      await fileManager.cleanupOldLogs();

      // Should only try to delete the file
      expect(fsMocks.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fsMocks.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('file.log'));
    });

    it('should handle non-existent directory gracefully', async () => {
      fsMocks.existsSync.mockReturnValue(false);

      await fileManager.cleanupOldLogs();

      // Should not attempt to read or delete
      expect(fsMocks.readdirSync).not.toHaveBeenCalled();
      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle file deletion errors', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['protected.log'] as unknown as fs.Dirent[]);
      fsMocks.statSync.mockReturnValue(
        createStatsMock({
          isDirectory: false,
          mtimeMs: 0,
        })
      );
      fsMocks.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await fileManager.cleanupOldLogs();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing file'),
        expect.any(Error)
      );
    });

    it('should handle readdir errors', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await fileManager.cleanupOldLogs();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[FileManager] Failed to clean up old logs:',
        expect.any(Error)
      );
    });

    it('should handle stat errors for individual files', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['error.log'] as unknown as fs.Dirent[]);
      fsMocks.statSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await fileManager.cleanupOldLogs();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing file'),
        expect.any(Error)
      );
      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
    });

    it('should delete files exactly at retention cutoff', async () => {
      const now = Date.now();
      const cutoffTime = now - 7 * 24 * 60 * 60 * 1000 - 1; // Just past cutoff

      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['cutoff.log'] as unknown as fs.Dirent[]);
      fsMocks.statSync.mockReturnValue(
        createStatsMock({
          isDirectory: false,
          mtimeMs: cutoffTime,
        })
      );

      await fileManager.cleanupOldLogs();

      expect(fsMocks.unlinkSync).toHaveBeenCalled();
    });

    it('should keep files just under retention cutoff', async () => {
      const now = Date.now();
      const justUnderCutoff = now - 7 * 24 * 60 * 60 * 1000 + 1000; // 1 second under

      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['keep.log'] as unknown as fs.Dirent[]);
      fsMocks.statSync.mockReturnValue(
        createStatsMock({
          isDirectory: false,
          mtimeMs: justUnderCutoff,
        })
      );

      await fileManager.cleanupOldLogs();

      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle empty directory', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue([]);

      await fileManager.cleanupOldLogs();

      expect(fsMocks.statSync).not.toHaveBeenCalled();
      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
    });

    it('should process multiple files correctly', async () => {
      const now = Date.now();
      const veryOld = now - 30 * 24 * 60 * 60 * 1000;
      const old = now - 10 * 24 * 60 * 60 * 1000;
      const recent = now - 1 * 24 * 60 * 60 * 1000;

      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue([
        'very-old.log',
        'old.log',
        'recent.log',
      ] as unknown as fs.Dirent[]);

      fsMocks.statSync
        .mockReturnValueOnce(createStatsMock({ isDirectory: false, mtimeMs: veryOld }))
        .mockReturnValueOnce(createStatsMock({ isDirectory: false, mtimeMs: old }))
        .mockReturnValueOnce(createStatsMock({ isDirectory: false, mtimeMs: recent }));

      await fileManager.cleanupOldLogs();

      // Should delete very-old and old, but not recent
      expect(fsMocks.unlinkSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanupDirectory method', () => {
    it('should recursively delete directory contents', async () => {
      const testDir = '/test/cleanup';

      fsMocks.existsSync.mockReturnValue(true);

      // First readdir returns files and subdirectory
      fsMocks.readdirSync
        .mockReturnValueOnce(['file1.txt', 'subdir', 'file2.txt'] as unknown as fs.Dirent[])
        .mockReturnValueOnce(['nested.txt'] as unknown as fs.Dirent[]); // Contents of subdir

      // Mock stat calls
      fsMocks.statSync
        .mockReturnValueOnce(createStatsMock({ isDirectory: false })) // file1.txt
        .mockReturnValueOnce(createStatsMock({ isDirectory: true })) // subdir
        .mockReturnValueOnce(createStatsMock({ isDirectory: false })) // nested.txt
        .mockReturnValueOnce(createStatsMock({ isDirectory: false })); // file2.txt

      await fileManager.cleanupDirectory(testDir);

      // Should delete all files and the subdirectory
      expect(fsMocks.unlinkSync).toHaveBeenCalledTimes(3); // 3 files
      expect(fsMocks.rmdirSync).toHaveBeenCalledTimes(1); // 1 directory
    });

    it('should handle non-existent directory', async () => {
      fsMocks.existsSync.mockReturnValue(false);

      await fileManager.cleanupDirectory('/non/existent');

      expect(fsMocks.readdirSync).not.toHaveBeenCalled();
      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle empty directory', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue([]);

      await fileManager.cleanupDirectory('/empty');

      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
      expect(fsMocks.rmdirSync).not.toHaveBeenCalled();
    });

    it('should handle file deletion errors gracefully', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['protected.txt'] as unknown as fs.Dirent[]);
      fsMocks.statSync.mockReturnValue(createStatsMock({ isDirectory: false }));
      fsMocks.unlinkSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await fileManager.cleanupDirectory('/test');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error cleaning directory'),
        expect.any(Error)
      );
    });

    it('should handle directory deletion errors gracefully', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync
        .mockReturnValueOnce(['subdir'] as unknown as fs.Dirent[])
        .mockReturnValueOnce([]);
      fsMocks.statSync.mockReturnValue(createStatsMock({ isDirectory: true }));
      fsMocks.rmdirSync.mockImplementation(() => {
        throw new Error('Directory not empty');
      });

      await fileManager.cleanupDirectory('/test');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error cleaning directory'),
        expect.any(Error)
      );
    });

    it('should handle deeply nested directories', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      // Mock nested structure: dir1/dir2/dir3/file.txt
      fsMocks.readdirSync
        .mockReturnValueOnce(['dir1'] as unknown as fs.Dirent[])
        .mockReturnValueOnce(['dir2'] as unknown as fs.Dirent[])
        .mockReturnValueOnce(['dir3'] as unknown as fs.Dirent[])
        .mockReturnValueOnce(['file.txt'] as unknown as fs.Dirent[]);

      fsMocks.statSync
        .mockReturnValueOnce(createStatsMock({ isDirectory: true }))
        .mockReturnValueOnce(createStatsMock({ isDirectory: true }))
        .mockReturnValueOnce(createStatsMock({ isDirectory: true }))
        .mockReturnValueOnce(createStatsMock({ isDirectory: false }));

      await fileManager.cleanupDirectory('/root');

      // Should delete file and all directories
      expect(fsMocks.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fsMocks.rmdirSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('getters and setters', () => {
    it('should get log file path', () => {
      const logFile = fileManager.getLogFile();

      // Initially null
      expect(logFile).toBeNull();
    });

    it('should get log file after initialization', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      await fileManager.initLogFile();

      const logFile = fileManager.getLogFile();

      expect(logFile).not.toBeNull();
      expect(logFile).toContain('.log');
    });

    it('should get log directory', () => {
      const dir = fileManager.getLogDir();

      expect(dir).toContain('logs');
      expect(path.isAbsolute(dir)).toBe(true);
    });

    it('should set log directory', () => {
      const newDir = '/new/log/directory';

      fileManager.setLogDir(newDir);

      expect(fileManager.getLogDir()).toBe(newDir);
    });

    it('should resolve relative path when setting directory', () => {
      fileManager.setLogDir('./relative/logs');

      const dir = fileManager.getLogDir();
      expect(path.isAbsolute(dir)).toBe(true);
    });

    it('should use default directory for empty string', () => {
      fileManager.setLogDir('');

      const dir = fileManager.getLogDir();
      expect(dir).toContain('logs');
    });

    it('should handle null as empty string', () => {
      fileManager.setLogDir(null as unknown as string);

      const dir = fileManager.getLogDir();
      expect(dir).toContain('logs');
    });

    it('should get log retention days', () => {
      const days = fileManager.getLogRetentionDays();

      expect(days).toBe(testRetentionDays);
    });

    it('should set log retention days', () => {
      fileManager.setLogRetentionDays(14);

      expect(fileManager.getLogRetentionDays()).toBe(14);
    });

    it('should enforce minimum retention of 1 day', () => {
      fileManager.setLogRetentionDays(0);

      expect(fileManager.getLogRetentionDays()).toBe(1);
    });

    it('should handle negative retention days', () => {
      fileManager.setLogRetentionDays(-5);

      expect(fileManager.getLogRetentionDays()).toBe(1);
    });

    it('should handle null retention days', () => {
      fileManager.setLogRetentionDays(null as unknown as number);

      expect(fileManager.getLogRetentionDays()).toBe(1);
    });

    it('should handle very large retention days', () => {
      fileManager.setLogRetentionDays(365 * 10); // 10 years

      expect(fileManager.getLogRetentionDays()).toBe(3650);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle simultaneous operations', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      // Simultaneous init and append
      const initPromise = fileManager.initLogFile();
      const appendResult = fileManager.appendToFile('concurrent');

      await initPromise;

      // Append should fail before init completes
      expect(appendResult).toBe(false);
    });

    it('should handle file system full error', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        const error: NodeJS.ErrnoException = new Error('ENOSPC: no space left on device');
        error.code = 'ENOSPC';
        throw error;
      });

      const result = await fileManager.initLogFile();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle file already exists error', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        const error: NodeJS.ErrnoException = new Error('EEXIST: file already exists');
        error.code = 'EEXIST';
        throw error;
      });

      const result = await fileManager.initLogFile();

      expect(result).toBeNull();
    });

    it('should handle network drive errors', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        const error: NodeJS.ErrnoException = new Error('ETIMEDOUT: network timeout');
        error.code = 'ETIMEDOUT';
        throw error;
      });

      const result = await fileManager.initLogFile();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle readonly file system', () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.writeFileSync.mockImplementation(() => {
        const error: NodeJS.ErrnoException = new Error('EROFS: read-only file system');
        error.code = 'EROFS';
        throw error;
      });

      expect(() => fileManager.initLogFileSync()).toThrow('EROFS');
    });

    it('should handle invalid filename characters', async () => {
      // This would be caught by the OS, but test our handling
      const invalidPath = '/test/<>:|?.log';
      const invalidManager = new FileManager(invalidPath);

      fsMocks.mkdirSync.mockImplementation(() => {
        throw new Error('Invalid filename');
      });

      const result = await invalidManager.initLogFile();

      expect(result).toBeNull();
    });

    it('should handle symlink as directory', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['symlink'] as unknown as fs.Dirent[]);

      // Mock stat to indicate it's a symlink (neither file nor directory)
      const symlinkStats = createStatsMock({ isDirectory: false });
      symlinkStats.isSymbolicLink = () => true;
      fsMocks.statSync.mockReturnValue(symlinkStats);

      await fileManager.cleanupOldLogs();

      // Should not try to delete symlinks
      expect(fsMocks.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle very long file paths', async () => {
      const longPath = '/test/' + 'a'.repeat(255) + '.log';
      const longManager = new FileManager(longPath);

      fsMocks.existsSync.mockReturnValue(true);

      const result = await longManager.initLogFile();

      // Should handle long paths (OS may truncate)
      expect(result).toBeDefined();
    });

    it('should cleanup after multiple init calls', async () => {
      fsMocks.existsSync.mockReturnValue(true);

      await fileManager.initLogFile();
      const firstFile = fileManager.getLogFile();

      await fileManager.initLogFile();
      const secondFile = fileManager.getLogFile();

      // Should reuse same file
      expect(firstFile).toBe(secondFile);
    });

    it('should handle concurrent cleanup operations', async () => {
      fsMocks.existsSync.mockReturnValue(true);
      fsMocks.readdirSync.mockReturnValue(['file1.log', 'file2.log'] as unknown as fs.Dirent[]);
      fsMocks.statSync.mockReturnValue(
        createStatsMock({
          isDirectory: false,
          mtimeMs: 0,
        })
      );

      // Run multiple cleanups simultaneously
      const cleanup1 = fileManager.cleanupOldLogs();
      const cleanup2 = fileManager.cleanupOldLogs();

      await Promise.all([cleanup1, cleanup2]);

      // Should handle concurrent operations
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Failed to clean up old logs')
      );
    });
  });
});
