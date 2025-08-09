// File: tests/unit/transports/base/implementations/FileTransport.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// Use fs mock/spies provided by global jest.setup instead of redefining 'fs' here
import { fsMocks as fsMockFromSetup } from '../../../../../jest.setup';
import * as fs from 'fs';

// Local write stream mock
const mockWriteStream = {
  write: jest.fn((data: any, callback?: (err?: Error | null) => void) => {
    if (callback) callback();
    return true;
  }),
  end: jest.fn((callback?: () => void) => {
    if (callback) callback();
  }),
  on: jest.fn(),
  once: jest.fn((event: string, callback: (...args: any[]) => void) => {
    if (event === 'open') {
      setTimeout(callback, 0);
    }
  }),
  writable: true as boolean,
};

// Mock path module (unchanged)
jest.mock('path', () => ({
  resolve: jest.fn((p: string) => p || '/default/path'),
  dirname: jest.fn(() => '/logs'),
  basename: jest.fn((p: string, ext?: string) => (ext ? 'app' : 'app.log')),
  extname: jest.fn(() => '.log'),
  join: jest.fn((...parts: string[]) => parts.join('/')),
}));

// NOW import FileTransport after spies/mocks are set up
import { FileTransport, type FileTransportOptions, createFileTransport } from '../../../../../src/transports/base/implementations/FileTransport';
import type { LogEntry } from '../../../../../src/types/transport';

// Spies for fs.promises API we assert against
let mkdirSpy: jest.SpyInstance;
let statSpy: jest.SpyInstance;

// Mock global window check
const originalWindow = (global as any).window;

/**
 * Comprehensive test suite for FileTransport class.
 */
describe('FileTransport', () => {
  jest.setTimeout(15000);

  let transport: FileTransport;
  let mockEntry: LogEntry;

  beforeEach(() => {
    jest.clearAllMocks();

    delete (global as any).window;

    // Reset write stream mock
    mockWriteStream.write.mockImplementation((data: any, callback?: (err?: Error | null) => void) => {
      if (callback) callback();
      return true;
    });
    mockWriteStream.end.mockImplementation((callback?: () => void) => {
      if (callback) callback();
    });
    mockWriteStream.once.mockImplementation((event: string, callback: (...args: any[]) => void) => {
      if (event === 'open') {
        setTimeout(callback, 0);
      }
    });
    mockWriteStream.writable = true;

    // Ensure createWriteStream returns our mock stream
    (fsMockFromSetup.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream as any);

    // Prepare fs.promises spies and defaults
    mkdirSpy = jest.spyOn((fs as any).promises, 'mkdir').mockResolvedValue(undefined as any);
    statSpy = jest.spyOn((fs as any).promises, 'stat').mockRejectedValue(new Error('File not found'));

    transport = new FileTransport({
      name: 'file',
      filepath: './logs'
    });

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
    } as LogEntry;
  });

  afterEach(() => {
    if (originalWindow) {
      (global as any).window = originalWindow;
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
      
      expect(t).toBeDefined();
    });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await transport.init();
      
      expect(mkdirSpy).toHaveBeenCalledWith('./logs', { recursive: true });
      expect((fsMockFromSetup.createWriteStream as jest.Mock)).toHaveBeenCalled();
    });

    it('should throw in browser environment', async () => {
      (global as any).window = {} as any;
      const t = new FileTransport({ name: 'browser', filepath: './logs' });
      await expect(t.init()).rejects.toThrow('FileTransport is not supported in browser environments');
    });

    it('should create directory if createDir is true', async () => {
      await transport.init();
      expect(mkdirSpy).toHaveBeenCalledWith('./logs', { recursive: true });
    });

    it('should not create directory if createDir is false', async () => {
      transport = new FileTransport({ name: 'no-create', filepath: './logs', createDir: false });
      await transport.init();
      expect(mkdirSpy).not.toHaveBeenCalled();
    });

    it('should get existing file stats', async () => {
      const mockStats = { size: 1024, birthtime: new Date() } as any;
      statSpy.mockResolvedValueOnce(mockStats);
      await transport.init();
      expect(statSpy).toHaveBeenCalled();
      expect((transport as any).currentSize).toBe(1024);
    });

    it('should handle missing file', async () => {
      statSpy.mockRejectedValueOnce(new Error('File not found'));
      await transport.init();
      expect((transport as any).currentSize).toBe(0);
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      await transport.init();
    }, 15000);
  
    it('should log entry as JSON', async () => {
      await transport.log(mockEntry);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockWriteStream.write).toHaveBeenCalledWith(
        JSON.stringify(mockEntry) + '\n',
        expect.any(Function)
      );
    });
  
    it('should log entry as plain text', async () => {
      transport = new FileTransport({ name: 'plain', filepath: './logs', format: 'plain' });
      await transport.init();
      await transport.log(mockEntry);
      await new Promise(resolve => setTimeout(resolve, 10));
      const writeCall = (mockWriteStream.write as jest.Mock).mock.calls[0];
      expect(writeCall[0]).toContain('[INFO]');
      expect(writeCall[0]).toContain('Test message');
    });
  
    it('should use custom formatter', async () => {
      transport = new FileTransport({ name: 'custom', filepath: './logs', format: 'custom', formatter: (e) => `CUSTOM: ${e.message}` });
      await transport.init();
      await transport.log(mockEntry);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockWriteStream.write).toHaveBeenCalledWith('CUSTOM: Test message\n', expect.any(Function));
    });
  
    it('should include error details in plain format', async () => {
      transport = new FileTransport({ name: 'error', filepath: './logs', format: 'plain' });
      await transport.init();
      const entryWithError = { ...mockEntry, error: { name: 'TestError', message: 'Failed', stack: 'Error: Failed\n  at test.js:1:1' } } as any;
      await transport.log(entryWithError);
      await new Promise(resolve => setTimeout(resolve, 10));
      const content = (mockWriteStream.write as jest.Mock).mock.calls[0][0];
      expect(content).toContain('Error: Failed');
      expect(content).toContain('Stack:');
    });
  
    it('should handle write errors', async () => {
      (mockWriteStream.write as jest.Mock).mockImplementation((data: any, callback?: (err?: Error | null) => void) => {
        if (callback) callback(new Error('Write failed'));
        return false;
      });
      await expect(transport.log(mockEntry)).rejects.toThrow('Write failed');
    });
  
    it('should update file size after write', async () => {
      await transport.log(mockEntry);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect((transport as any).currentSize).toBeGreaterThan(0);
    });
  });

  describe('rotation', () => {
    beforeEach(async () => { await transport.init(); }, 15000);

    it('should set rotation strategy based on maxFileSize', () => {
      const t = new FileTransport({ name: 'size-rotation', filepath: './logs', maxFileSize: 1024 });
      expect((t as any).rotation).toBe('size');
    });

    it('should default to none rotation when no maxFileSize', () => {
      const t = new FileTransport({ name: 'no-rotation', filepath: './logs' });
      expect((t as any).rotation).toBe('none');
    });

    it('should use explicit rotation setting', () => {
      const t = new FileTransport({ name: 'daily', filepath: './logs', rotation: 'daily' });
      expect((t as any).rotation).toBe('daily');
    });
  });

  describe('flush', () => {
    beforeEach(async () => { await transport.init(); }, 15000);

    it('should flush pending writes', async () => {
      await transport.log(mockEntry);
      await transport.close();
      expect(mockWriteStream.write).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    beforeEach(async () => { await transport.init(); }, 15000);

    it('should flush before closing', async () => {
      const flushSpy = jest.spyOn(transport as any, 'processQueue');
      await transport.log(mockEntry);
      await transport.close();
      expect(flushSpy).toHaveBeenCalled();
    });

    it('should close file stream if open', async () => {
      await transport.close();
      expect(mockWriteStream.end).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle directory creation errors', async () => {
      mkdirSpy.mockRejectedValueOnce(new Error('Permission denied'));
      await expect(transport.init()).rejects.toThrow('Permission denied');
    });

    it('should handle stream creation errors', async () => {
      (fsMockFromSetup.createWriteStream as jest.Mock).mockImplementation(() => {
        return {
          write: jest.fn(),
          end: jest.fn(),
          on: jest.fn(),
          once: jest.fn((event: string, callback: (...args: any[]) => void) => {
            if (event === 'error') {
              setTimeout(() => callback(new Error('Stream creation failed')), 0);
            }
          }),
          writable: false,
        } as any;
      });
      await expect(transport.init()).rejects.toThrow('Stream creation failed');
    });

    it('should handle stream write errors', async () => {
      await transport.init();
      (mockWriteStream.write as jest.Mock).mockImplementation((data: any, callback?: (err?: Error | null) => void) => {
        if (callback) callback(new Error('Write failed'));
        return false;
      });
      await expect(transport.log(mockEntry)).rejects.toThrow('Write failed');
    });
  });

  describe('factory function', () => {
    it('should create transport with defaults', () => {
      const t = createFileTransport();
      expect(t.name).toBe('file');
      expect(t.enabled).toBe(true);
    });

    it('should merge options', () => {
      const t = createFileTransport({ filepath: '/custom/logs', rotation: 'hourly' });
      expect(t).toBeDefined();
    });
  });
});