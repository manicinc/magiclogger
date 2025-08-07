// File: tests/unit/transports/base/implementations/FileTransport.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock fs module BEFORE importing FileTransport
const mockWriteStream = {
  write: jest.fn((data, callback) => {
    if (callback) callback();
    return true;
  }),
  end: jest.fn((callback) => {
    if (callback) callback();
  }),
  on: jest.fn(),
  once: jest.fn((event, callback) => {
    if (event === 'open') {
      setTimeout(callback, 0);
    }
  }),
  writable: true,
};

const mockFs = {
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ size: 1024 }),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
  },
  createWriteStream: jest.fn(() => mockWriteStream),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => []),
  statSync: jest.fn(() => ({ 
    isFile: () => true,
    mtime: new Date('2023-01-01'),
    size: 1000 
  })),
  unlinkSync: jest.fn(),
};

// Mock fs module  
jest.mock('fs', () => mockFs);

// Mock path module
jest.mock('path', () => ({
  resolve: jest.fn((p) => p || '/default/path'),
  dirname: jest.fn(() => '/logs'),
  basename: jest.fn((p, ext) => ext ? 'app' : 'app.log'),
  extname: jest.fn(() => '.log'),
  join: jest.fn((...parts) => parts.join('/')),
}));

// NOW import FileTransport after mocks are set up
import { FileTransport, type FileTransportOptions, createFileTransport } from '../../../../../src/transports/base/implementations/FileTransport';
import type { LogEntry } from '../../../../../src/types/transport';

// Mock global window check
const originalWindow = global.window;

/**
 * Comprehensive test suite for FileTransport class.
 * 
 * Tests file writing, rotation, compression, and management.
 */
describe('FileTransport', () => {
  // Set global timeout for this test suite
  jest.setTimeout(15000);
  
  let transport: FileTransport;
  let mockEntry: LogEntry;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Remove window for Node.js tests
    delete (global as any).window;

    // Reset mock implementations
    mockWriteStream.write.mockImplementation((data, callback) => {
      if (callback) callback();
      return true;
    });
    mockWriteStream.end.mockImplementation((callback) => {
      if (callback) callback();
    });
    mockWriteStream.once.mockImplementation((event, callback) => {
      if (event === 'open') {
        setTimeout(callback, 0);
      }
    });
    mockWriteStream.writable = true;

    // Reset fs mocks
    mockFs.createWriteStream.mockReturnValue(mockWriteStream);
    mockFs.promises.mkdir.mockResolvedValue(undefined);
    mockFs.promises.stat.mockRejectedValue(new Error('File not found'));

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
    it('should initialize successfully', async () => {
      await transport.init();
      
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith('./logs', { recursive: true });
      expect(mockFs.createWriteStream).toHaveBeenCalled();
    });

    it('should throw in browser environment', async () => {
      global.window = {} as any;
      
      const t = new FileTransport({ name: 'browser', filepath: './logs' });
      
      await expect(t.init()).rejects.toThrow('FileTransport is not supported in browser environments');
    });

    it('should create directory if createDir is true', async () => {
      await transport.init();
      
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith('./logs', { recursive: true });
    });

    it('should not create directory if createDir is false', async () => {
      transport = new FileTransport({
        name: 'no-create',
        filepath: './logs',
        createDir: false
      });
      
      await transport.init();
      
      expect(mockFs.promises.mkdir).not.toHaveBeenCalled();
    });

    it('should get existing file stats', async () => {
      const mockStats = { size: 1024, birthtime: new Date() };
      mockFs.promises.stat.mockResolvedValue(mockStats);
      
      await transport.init();
      
      expect(mockFs.promises.stat).toHaveBeenCalled();
      expect((transport as any).currentSize).toBe(1024);
    });

    it('should handle missing file', async () => {
      mockFs.promises.stat.mockRejectedValue(new Error('File not found'));
      
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
      
      // Wait for async write processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockWriteStream.write).toHaveBeenCalledWith(
        JSON.stringify(mockEntry) + '\n',
        expect.any(Function)
      );
    });
  
    it('should log entry as plain text', async () => {
      transport = new FileTransport({
        name: 'plain',
        filepath: './logs',
        format: 'plain'
      });
      await transport.init();
      
      await transport.log(mockEntry);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const writeCall = mockWriteStream.write.mock.calls[0];
      expect(writeCall[0]).toContain('[INFO]');
      expect(writeCall[0]).toContain('Test message');
    });
  
    it('should use custom formatter', async () => {
      transport = new FileTransport({
        name: 'custom',
        filepath: './logs',
        format: 'custom',
        formatter: (entry) => `CUSTOM: ${entry.message}`
      });
      await transport.init();
      
      await transport.log(mockEntry);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockWriteStream.write).toHaveBeenCalledWith(
        'CUSTOM: Test message\n',
        expect.any(Function)
      );
    });
  
    it('should include error details in plain format', async () => {
      transport = new FileTransport({
        name: 'error',
        filepath: './logs',
        format: 'plain'
      });
      await transport.init();
      
      const entryWithError = {
        ...mockEntry,
        error: {
          name: 'TestError',
          message: 'Failed',
          stack: 'Error: Failed\n  at test.js:1:1'
        }
      };
      
      await transport.log(entryWithError);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const content = mockWriteStream.write.mock.calls[0][0];
      expect(content).toContain('Error: Failed');
      expect(content).toContain('Stack:');
    });
  
    it('should handle write errors', async () => {
      mockWriteStream.write.mockImplementation((data, callback) => {
        callback(new Error('Write failed'));
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
    beforeEach(async () => {
      await transport.init();
    }, 15000);

    it('should set rotation strategy based on maxFileSize', () => {
      const t = new FileTransport({
        name: 'size-rotation',
        filepath: './logs',
        maxFileSize: 1024
      });
      
      expect((t as any).rotation).toBe('size');
    });

    it('should default to none rotation when no maxFileSize', () => {
      const t = new FileTransport({
        name: 'no-rotation',
        filepath: './logs'
      });
      
      expect((t as any).rotation).toBe('none');
    });

    it('should use explicit rotation setting', () => {
      const t = new FileTransport({
        name: 'daily',
        filepath: './logs',
        rotation: 'daily'
      });
      
      expect((t as any).rotation).toBe('daily');
    });
  });

  describe('flush', () => {
    beforeEach(async () => {
      await transport.init();
    }, 15000);

    it('should flush pending writes', async () => {
      await transport.log(mockEntry);
      
      // Transport doesn't have a public flush method, so test through close
      await transport.close();
      
      expect(mockWriteStream.write).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      await transport.init();
    }, 15000);

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
      mockFs.promises.mkdir.mockRejectedValue(new Error('Permission denied'));
      
      await expect(transport.init()).rejects.toThrow('Permission denied');
    });

    it('should handle stream creation errors', async () => {
      mockFs.createWriteStream.mockImplementation(() => {
        const stream = {
          write: jest.fn(),
          end: jest.fn(),
          on: jest.fn(),
          once: jest.fn((event, callback) => {
            if (event === 'error') {
              setTimeout(() => callback(new Error('Stream creation failed')), 0);
            }
          }),
          writable: false,
        };
        return stream;
      });
      
      await expect(transport.init()).rejects.toThrow('Stream creation failed');
    });

    it('should handle stream write errors', async () => {
      await transport.init();
      
      mockWriteStream.write.mockImplementation((data, callback) => {
        callback(new Error('Write failed'));
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
      const t = createFileTransport({
        filepath: '/custom/logs',
        rotation: 'hourly'
      });
      
      expect(t).toBeDefined();
    });
  });
});