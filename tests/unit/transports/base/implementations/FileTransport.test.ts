/**
 * @fileoverview Tests for FileTransport (alias for AsyncFileTransport)
 */

import { FileTransport } from '../../../../../src/transports/file';
import { AsyncFileTransport } from '../../../../../src/transports/base/implementations/AsyncFileTransport';
import SonicBoom from 'sonic-boom';
import type { LogEntry } from '../../../../../src/types/transport';

// Mock sonic-boom
jest.mock('sonic-boom');

describe('FileTransport', () => {
  let mockSonicBoom: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSonicBoom = {
      write: jest.fn(),
      flush: jest.fn((cb?: () => void) => cb && cb()),
      flushSync: jest.fn(),
      end: jest.fn((cb?: () => void) => cb && cb()),
      destroy: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      destroyed: false,
    };
    (SonicBoom as unknown as jest.Mock).mockReturnValue(mockSonicBoom);
  });

  describe('Alias verification', () => {
    it('should be an alias for AsyncFileTransport', () => {
      expect(FileTransport).toBe(AsyncFileTransport);
    });

    it('should create AsyncFileTransport instance', () => {
      const transport = new FileTransport({
        name: 'file',
        filepath: '/tmp/test.log',
      });
      expect(transport).toBeInstanceOf(AsyncFileTransport);
    });
  });

  describe('Basic functionality', () => {
    it('should initialize with sonic-boom', async () => {
      const transport = new FileTransport({
        name: 'file',
        filepath: '/tmp/test.log',
        minLength: 4096,
        maxWrite: 16384,
      });

      await transport.init();

      expect(SonicBoom).toHaveBeenCalledWith({
        dest: '/tmp/test.log',
        append: true,
        mkdir: true,
        retryEAGAIN: true,
        minLength: 4096,
        maxWrite: 16384,
        mode: 0o666,
        sync: false,
        fsync: false,
      });
    });

    it('should write log entries as JSON by default', async () => {
      const transport = new FileTransport({
        name: 'file',
        filepath: '/tmp/test.log',
      });

      await transport.init();

      // Set the sonic property to our mock
      (transport as any).sonic = mockSonicBoom;

      const entry: LogEntry = {
        id: '123',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
      };

      // Call the synchronous log method directly
      (transport as any).logSync(entry);

      // Flush the batch to trigger write
      (transport as any).flushBatch();

      expect(mockSonicBoom.write).toHaveBeenCalledWith(JSON.stringify(entry) + '\n');
    });

    it('should write plain text when format is plain', async () => {
      const transport = new FileTransport({
        name: 'file',
        filepath: '/tmp/test.log',
        format: 'plain',
      });

      await transport.init();

      // Set the sonic property to our mock
      (transport as any).sonic = mockSonicBoom;

      const entry: LogEntry = {
        id: '123',
        timestamp: Date.now(),
        level: 'info',
        message: 'Test message',
        loggerId: 'test-logger',
      };

      // Call the synchronous log method directly
      (transport as any).logSync(entry);

      // Flush the batch to trigger write
      (transport as any).flushBatch();

      expect(mockSonicBoom.write).toHaveBeenCalledWith(expect.stringContaining('Test message\n'));
    });

    it('should flush on close', async () => {
      const transport = new FileTransport({
        name: 'file',
        filepath: '/tmp/test.log',
      });

      await transport.init();

      // Set the sonic property to our mock
      (transport as any).sonic = mockSonicBoom;

      await transport.close();

      // Check that destroy was called (as per AsyncFileTransport implementation)
      expect(mockSonicBoom.destroy).toHaveBeenCalled();
    });
  });
});
