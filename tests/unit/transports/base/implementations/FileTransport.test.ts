// File: tests/unit/transports/base/implementations/FileTransport.test.ts

import { FileTransport } from '../../../../../src/transports/base/implementations/FileTransport';
import { FileManager } from '../../../../../src/core/FileManager';
import type { LogEntry, FileTransportOptions } from '../../../../../src/types/transport';
import path from 'path';

// Mock FileManager
jest.mock('../../../../../src/core/FileManager');

// Mock dynamic imports
const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  appendFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  rename: jest.fn(),
  unlink: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  mkdir: jest.fn(),
  constants: { F_OK: 0 },
  createReadStream: jest.fn(),
  createWriteStream: jest.fn()
};

const mockZlib = {
  createGzip: jest.fn()
};

// Mock global window check
const originalWindow = global.window;

/**
 * Comprehensive test suite for FileTransport class.
 * 
 * Tests file writing, rotation, compression, and management.
 */
describe('FileTransport', () => {
  let transport: FileTransport;
  let mockFileManager: jest.Mocked<FileManager>;
  let mockEntry: LogEntry;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Remove window for Node.js tests
    delete (global as any).window;

    // Setup FileManager mock
    mockFileManager = {
      initLogFile: jest.fn().mockResolvedValue('/logs/test.log'),
      appendToFile: jest.fn(),
      cleanupOldLogs: jest.fn(),
      getLogFile: jest.fn().mockReturnValue('/logs/test.log'),
      getLogDir: jest.fn().mockReturnValue('/logs'),
      setLogDir: jest.fn(),
      getLogRetentionDays: jest.fn().mockReturnValue(30),
      setLogRetentionDays: jest.fn(),
      resolveLogDir: jest.fn((dir) => dir),
      cleanupDirectory: jest.fn()
    };
    (FileManager as jest.MockedClass<typeof FileManager>).mockImplementation(() => mockFileManager);

    // Mock dynamic imports
    jest.doMock('fs', () => mockFs, { virtual: true });
    jest.doMock('zlib', () => mockZlib, { virtual: true });

    transport = new FileTransport({
      name: 'file',
      filepath: './logs'
    });

    // Set fs module on transport for testing
    (transport as any).fs = mockFs;
    (transport as any).zlib = mockZlib;

    mockEntry = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      plainMessage: 'Test message',
      loggerId: 'test-logger',
      tags: ['test'],
      context: { test: true }
    };
  });

  afterEach(() => {
    // Restore window
    if (originalWindow) {
      global.window = originalWindow;
    }
  });

  describe('constructor', () => {
    it('should initialize with required filepath', () => {
      const t = new FileTransport({ name: 'test', filepath: '/logs' });
      expect(t.name).toBe('test');
    });

    it('should throw if filepath is missing', () => {
      expect(() => new FileTransport({ name: 'test' } as FileTransportOptions))
        .toThrow('FileTransport requires filepath option');
    });

    it('should initialize with all options', () => {
      const t = new FileTransport({
        name: 'full',
        filepath: '/custom/logs',
        isDirectory: false,
        maxFileSize: 5242880,
        maxFiles: 10,
        compress: true,
        rotation: 'hourly',
        append: false,
        encoding: 'ascii',
        includeTimestamp: false,
        createDir: false,
        retentionDays: 7,
        eol: '\r\n'
      });
      
      expect(t).toBeDefined();
    });

    it('should use default options', () => {
      const t = new FileTransport({
        name: 'defaults',
        filepath: './logs'
      });
      
      // Test through behavior since properties are private
      expect(t).toBeDefined();
    });
  });

  describe('initialization', () => {
    it('should load Node.js modules', async () => {
      await transport.init();
      
      expect((transport as any).fs).toBeDefined();
    });

    it('should throw in browser environment', async () => {
      global.window = {} as any;
      
      const t = new FileTransport({ name: 'browser', filepath: './logs' });
      
      await expect(t.init()).rejects.toThrow('FileTransport is not supported in browser environments');
    });

    it('should initialize file manager in directory mode', async () => {
      mockFs.existsSync.mockReturnValue(true);
      
      await transport.init();
      
      expect(FileManager).toHaveBeenCalledWith('./logs', 30);
      expect(mockFileManager.initLogFile).toHaveBeenCalled();
    });

    it('should initialize single file mode', async () => {
      transport = new FileTransport({
        name: 'single',
        filepath: '/logs/app.log',
        isDirectory: false
      });
      (transport as any).fs = mockFs;
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.stat.mockImplementation((_, cb) => cb(null, { size: 0 }));
      
      await transport.init();
      
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        path.dirname('/logs/app.log'),
        { recursive: true },
        expect.any(Function)
      );
    });

    it('should create file if not exists', async () => {
      transport = new FileTransport({
        name: 'create',
        filepath: '/logs/new.log',
        isDirectory: false,
        append: false
      });
      (transport as any).fs = mockFs;
      
      mockFs.access.mockImplementation((_, __, cb) => cb(new Error('Not found')));
      mockFs.writeFile.mockImplementation((_, __, ___, cb) => cb(null));
      
      await transport.init();
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/logs/new.log',
        '',
        { encoding: 'utf8' },
        expect.any(Function)
      );
    });

    it('should clean up old logs on init', async () => {
      await transport.init();
      
      expect(mockFileManager.cleanupOldLogs).toHaveBeenCalled();
    });

    it('should update file size on init', async () => {
      mockFs.stat.mockImplementation((_, cb) => cb(null, { size: 1024 }));
      
      await transport.init();
      
      expect((transport as any).currentFileSize).toBe(1024);
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      mockFs.appendFile.mockImplementation((_, __, ___, cb) => cb(null));
      // Ensure transport is properly initialized
      await transport.init();
      // Set currentFile to ensure writeToFile doesn't fail
      (transport as any).currentFile = '/logs/test.log';
    });
  
    it('should log entry as JSON', async () => {
      await transport.log(mockEntry);
      
      // Wait for scheduled write
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      expect(mockFs.appendFile).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(mockEntry) + '\n',
        { encoding: 'utf8' },
        expect.any(Function)
      );
    });
  
    it('should log entry as plain text', async () => {
      transport = new FileTransport({
        name: 'plain',
        filepath: './logs',
        format: 'plain'
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      // Initialize and set currentFile
      await transport.init();
      (transport as any).currentFile = '/logs/test.log';
      
      await transport.log(mockEntry);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      const writeCall = mockFs.appendFile.mock.calls[0];
      expect(writeCall[1]).toContain('[INFO]');
      expect(writeCall[1]).toContain('Test message');
    });
  
    it('should use custom formatter', async () => {
      transport = new FileTransport({
        name: 'custom',
        filepath: './logs',
        format: 'custom',
        formatter: (entry) => `CUSTOM: ${entry.message}`
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      // Initialize and set currentFile
      await transport.init();
      (transport as any).currentFile = '/logs/test.log';
      
      await transport.log(mockEntry);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      expect(mockFs.appendFile).toHaveBeenCalledWith(
        expect.any(String),
        'CUSTOM: Test message\n',
        { encoding: 'utf8' },
        expect.any(Function)
      );
    });
  
    it('should include error details in plain format', async () => {
      transport = new FileTransport({
        name: 'error',
        filepath: './logs',
        format: 'plain'
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      // Initialize and set currentFile
      await transport.init();
      (transport as any).currentFile = '/logs/test.log';
      
      const entryWithError = {
        ...mockEntry,
        error: {
          name: 'TestError',
          message: 'Failed',
          stack: 'Error: Failed\n  at test.js:1:1'
        }
      };
      
      await transport.log(entryWithError);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      const content = mockFs.appendFile.mock.calls[0][1];
      expect(content).toContain('Error: Failed');
      expect(content).toContain('Stack:');
    });
  
    it('should batch writes', async () => {
      // Log multiple entries quickly
      for (let i = 0; i < 5; i++) {
        await transport.log({ ...mockEntry, id: `test-${i}` });
      }
      
      // Should not write immediately
      expect(mockFs.appendFile).not.toHaveBeenCalled();
      
      // Advance timer to trigger write
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Should write all at once
      expect(mockFs.appendFile).toHaveBeenCalledTimes(1);
      const content = mockFs.appendFile.mock.calls[0][1];
      expect(content.split('\n').length).toBe(6); // 5 logs + empty line
    });
  
    it('should flush immediately on large batch', async () => {
      // Log many entries
      for (let i = 0; i < 100; i++) {
        await transport.log({ ...mockEntry, id: `test-${i}` });
      }
      
      // Should flush immediately
      await Promise.resolve();
      expect(mockFs.appendFile).toHaveBeenCalled();
    });
  
    it('should handle write errors', async () => {
      mockFs.appendFile.mockImplementation((_, __, ___, cb) => cb(new Error('Write failed')));
      
      await expect(transport.log(mockEntry)).rejects.toThrow('Write failed');
    });
  
    it('should update file size after write', async () => {
      await transport.log(mockEntry);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      expect((transport as any).currentFileSize).toBeGreaterThan(0);
    });
  });

  describe('rotation', () => {
    beforeEach(async () => {
      mockFs.appendFile.mockImplementation((_, __, ___, cb) => cb(null));
      mockFs.rename.mockImplementation((_, __, cb) => cb(null));
      mockFs.writeFile.mockImplementation((_, __, ___, cb) => cb(null));
      mockFs.readdir.mockImplementation((_, cb) => cb(null, []));
      await transport.init();
    });

    it('should rotate by size', async () => {
      transport = new FileTransport({
        name: 'size-rotation',
        filepath: './logs',
        rotation: 'size',
        maxFileSize: 100
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      (transport as any).currentFileSize = 150; // Over limit
      
      await transport.log(mockEntry);
      
      expect(mockFileManager.initLogFile).toHaveBeenCalled();
    });

    it('should rotate daily', async () => {
      transport = new FileTransport({
        name: 'daily',
        filepath: './logs',
        rotation: 'daily'
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      
      // Set last check to yesterday
      const yesterday = Date.now() - 25 * 60 * 60 * 1000;
      (transport as any).lastRotationCheck = yesterday;
      
      await transport.log(mockEntry);
      
      // Advance time to trigger check
      jest.advanceTimersByTime(60001);
      
      expect(mockFileManager.initLogFile).toHaveBeenCalled();
    });

    it('should rotate hourly', async () => {
      transport = new FileTransport({
        name: 'hourly',
        filepath: './logs',
        rotation: 'hourly'
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      
      // Set last check to last hour
      const lastHour = new Date();
      lastHour.setHours(lastHour.getHours() - 1);
      (transport as any).lastRotationCheck = lastHour.getTime();
      
      await transport.log(mockEntry);
      
      jest.advanceTimersByTime(60001);
      
      expect(mockFileManager.initLogFile).toHaveBeenCalled();
    });

    it('should not rotate when rotation is none', async () => {
      transport = new FileTransport({
        name: 'no-rotation',
        filepath: './logs',
        rotation: 'none'
      });
      (transport as any).fs = mockFs;
      (transport as any).fileManager = mockFileManager;
      (transport as any).currentFileSize = 10000000; // Very large
      
      await transport.log(mockEntry);
      
      expect(mockFileManager.initLogFile).not.toHaveBeenCalled();
    });

    it('should rotate single file', async () => {
      transport = new FileTransport({
        name: 'single-rotate',
        filepath: '/logs/app.log',
        isDirectory: false,
        rotation: 'size',
        maxFileSize: 100
      });
      (transport as any).fs = mockFs;
      (transport as any).currentFileSize = 150;
      (transport as any).currentFile = '/logs/app.log';
      
      await transport.log(mockEntry);
      
      // Flush to trigger rotation
      await transport.flush();
      
      expect(mockFs.rename).toHaveBeenCalled();
      const renameCall = mockFs.rename.mock.calls[0];
      expect(renameCall[0]).toBe('/logs/app.log');
      expect(renameCall[1]).toMatch(/app-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.*\.log/);
    });

    it('should compress rotated files', async () => {
      const mockGzip = { pipe: jest.fn().mockReturnThis(), on: jest.fn() };
      const mockReadStream = { pipe: jest.fn().mockReturnThis() };
      const mockWriteStream = {};
      
      mockFs.createReadStream.mockReturnValue(mockReadStream);
      mockFs.createWriteStream.mockReturnValue(mockWriteStream);
      mockZlib.createGzip.mockReturnValue(mockGzip);
      
      // Set up event handler
      mockGzip.on.mockImplementation((event, handler) => {
        if (event === 'finish') {
          handler();
        }
        return mockGzip;
      });
      
      transport = new FileTransport({
        name: 'compress',
        filepath: '/logs/app.log',
        isDirectory: false,
        compress: true,
        rotation: 'size',
        maxFileSize: 100
      });
      (transport as any).fs = mockFs;
      (transport as any).zlib = mockZlib;
      (transport as any).currentFileSize = 150;
      (transport as any).currentFile = '/logs/app.log';
      
      await transport.log(mockEntry);
      await transport.flush();
      
      expect(mockZlib.createGzip).toHaveBeenCalled();
      expect(mockFs.unlink).toHaveBeenCalled();
    });

    it('should cleanup old rotated files', async () => {
      mockFs.readdir.mockImplementation((_, cb) => cb(null, [
        'app-2024-01-01T00-00-00.log',
        'app-2024-01-02T00-00-00.log',
        'app-2024-01-03T00-00-00.log.gz',
        'other.txt'
      ]));
      
      mockFs.stat.mockImplementation((file, cb) => {
        const mtime = new Date();
        mtime.setDate(mtime.getDate() - 10); // 10 days old
        cb(null, { mtime });
      });
      
      transport = new FileTransport({
        name: 'cleanup',
        filepath: '/logs/app.log',
        isDirectory: false,
        rotation: 'size',
        maxFiles: 2,
        maxFileSize: 100
      });
      (transport as any).fs = mockFs;
      (transport as any).currentFileSize = 150;
      (transport as any).currentFile = '/logs/app.log';
      
      await transport.log(mockEntry);
      await transport.flush();
      
      // Should delete old files
      expect(mockFs.unlink).toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    beforeEach(async () => {
      mockFs.appendFile.mockImplementation((_, __, ___, cb) => cb(null));
      await transport.init();
    });

    it('should flush pending writes', async () => {
      await transport.log(mockEntry);
      
      // Should not write immediately
      expect(mockFs.appendFile).not.toHaveBeenCalled();
      
      await transport.flush();
      
      expect(mockFs.appendFile).toHaveBeenCalled();
    });

    it('should clear write timer', async () => {
      await transport.log(mockEntry);
      
      expect(jest.getTimerCount()).toBe(1);
      
      await transport.flush();
      
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      mockFs.appendFile.mockImplementation((_, __, ___, cb) => cb(null));
      await transport.init();
    });

    it('should flush before closing', async () => {
      const flushSpy = jest.spyOn(transport, 'flush');
      
      await transport.log(mockEntry);
      await transport.close();
      
      expect(flushSpy).toHaveBeenCalled();
    });

    it('should close file stream if open', async () => {
      const mockStream = { end: jest.fn((cb) => cb()) };
      (transport as any).fileStream = mockStream;
      
      await transport.close();
      
      expect(mockStream.end).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await transport.init();
    });

    it('should handle directory creation errors', async () => {
      mockFs.mkdir.mockImplementation((_, __, cb) => cb(new Error('Permission denied')));
      
      transport = new FileTransport({
        name: 'error',
        filepath: '/restricted/logs',
        isDirectory: false
      });
      (transport as any).fs = mockFs;
      
      await expect(transport.init()).rejects.toThrow('Permission denied');
    });

    it('should handle file creation errors', async () => {
      mockFs.writeFile.mockImplementation((_, __, ___, cb) => cb(new Error('Disk full')));
      mockFs.access.mockImplementation((_, __, cb) => cb(new Error('Not found')));
      
      transport = new FileTransport({
        name: 'error',
        filepath: '/logs/new.log',
        isDirectory: false
      });
      (transport as any).fs = mockFs;
      
      await expect(transport.init()).rejects.toThrow('Disk full');
    });

    it('should handle rotation errors', async () => {
      mockFs.rename.mockImplementation((_, __, cb) => cb(new Error('Rename failed')));
      
      transport = new FileTransport({
        name: 'error',
        filepath: '/logs/app.log',
        isDirectory: false,
        rotation: 'size',
        maxFileSize: 100
      });
      (transport as any).fs = mockFs;
      (transport as any).currentFileSize = 150;
      (transport as any).currentFile = '/logs/app.log';
      
      await expect(transport.log(mockEntry)).rejects.toThrow();
    });

    it('should handle compression errors', async () => {
      const mockGzip = { 
        pipe: jest.fn().mockReturnThis(), 
        on: jest.fn((event, handler) => {
          if (event === 'error') {
            handler(new Error('Compression failed'));
          }
          return mockGzip;
        })
      };
      
      mockZlib.createGzip.mockReturnValue(mockGzip);
      mockFs.createReadStream.mockReturnValue({ pipe: jest.fn() });
      mockFs.createWriteStream.mockReturnValue({});
      
      transport = new FileTransport({
        name: 'compress-error',
        filepath: '/logs/app.log',
        isDirectory: false,
        compress: true
      });
      (transport as any).fs = mockFs;
      (transport as any).zlib = mockZlib;
      
      await expect((transport as any).compressFile('/logs/test.log'))
        .rejects.toThrow('Compression failed');
    });
  });

  describe('factory function', () => {
    it('should create transport with defaults', () => {
      const { createFileTransport } = require('../../../../../src/transports/base/implementations/FileTransport');
      
      const t = createFileTransport();
      
      expect(t.name).toBe('file');
      expect(t.enabled).toBe(true);
    });

    it('should merge options', () => {
      const { createFileTransport } = require('../../../../../src/transports/base/implementations/FileTransport');
      
      const t = createFileTransport({
        filepath: '/custom/logs',
        rotation: 'hourly'
      });
      
      expect(t).toBeDefined();
    });
  });
});