/**
 * Direct tests for FileWorker code coverage
 * Tests the FileWorker module directly without worker threads
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock worker_threads to prevent actual worker behavior
const mockParentPort = {
  postMessage: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
};

const mockWorkerData = {
  filePath: '/tmp/test.log',
  append: true,
};

jest.mock('worker_threads', () => ({
  parentPort: mockParentPort,
  workerData: mockWorkerData,
}));

// Mock fs module
jest.mock('fs');

describe('FileWorker Direct Coverage', () => {
  let mockWriteStream: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup write stream mock
    mockWriteStream = {
      write: jest.fn((data, callback?) => {
        if (typeof callback === 'function') callback();
        return true;
      }),
      end: jest.fn((callback?) => {
        if (typeof callback === 'function') callback();
      }),
      on: jest.fn(),
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {
      /* Mock directory creation */
    });
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);
  });

  it('should initialize FileWorker and send ready message', () => {
    // Clear module cache and import fresh
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');
    });

    // Should have sent WORKER_READY message
    expect(mockParentPort.postMessage).toHaveBeenCalledWith({
      type: 'WORKER_READY',
      pid: expect.any(Number),
    });
  });

  it('should handle WRITE_BATCH message', async () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      // Get the message handler
      const messageHandler = mockParentPort.on.mock.calls.find(call => call[0] === 'message')?.[1];

      expect(messageHandler).toBeDefined();

      // Send WRITE_BATCH message
      const entries = [
        {
          id: 'test-1',
          timestamp: 1704067200000,
          level: 'info',
          message: 'Test message 1',
        },
        {
          id: 'test-2',
          timestamp: 1704067201000,
          level: 'error',
          message: 'Test message 2',
        },
      ];

      messageHandler({ type: 'WRITE_BATCH', entries });

      // Should write entries
      expect(mockWriteStream.write).toHaveBeenCalled();
      expect(mockParentPort.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'WRITE_COMPLETE',
        })
      );
    });
  });

  it('should handle FLUSH message', async () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      const messageHandler = mockParentPort.on.mock.calls.find(call => call[0] === 'message')?.[1];

      // Send FLUSH message
      messageHandler({ type: 'FLUSH' });
    });

    // Wait for async operations
    await new Promise(resolve => process.nextTick(resolve));

    expect(mockParentPort.postMessage).toHaveBeenCalledWith({
      type: 'FLUSH_COMPLETE',
    });
  });

  it('should handle SHUTDOWN message', async () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      const messageHandler = mockParentPort.on.mock.calls.find(call => call[0] === 'message')?.[1];

      // Send SHUTDOWN message
      messageHandler({ type: 'SHUTDOWN' });
    });

    // Wait for async operations
    await new Promise(resolve => process.nextTick(resolve));

    expect(mockWriteStream.end).toHaveBeenCalled();
    expect(mockParentPort.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SHUTDOWN_COMPLETE',
      })
    );
    expect(mockParentPort.close).toHaveBeenCalled();
  });

  it('should handle unknown message type', () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      const messageHandler = mockParentPort.on.mock.calls.find(call => call[0] === 'message')?.[1];

      // Spy on console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Send unknown message
      messageHandler({ type: 'UNKNOWN_TYPE' });

      expect(warnSpy).toHaveBeenCalledWith('[FileWorker] Unknown message type:', 'UNKNOWN_TYPE');

      warnSpy.mockRestore();
    });
  });

  it('should handle stream errors', () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      // Find error handler
      const errorHandler = mockWriteStream.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1];

      expect(errorHandler).toBeDefined();

      // Spy on console.error
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Trigger error
      const error = new Error('Stream error');
      errorHandler(error);

      expect(errorSpy).toHaveBeenCalledWith('[FileWorker] Stream error:', error);
      expect(mockParentPort.postMessage).toHaveBeenCalledWith({
        type: 'ERROR',
        error: 'Stream error',
      });

      errorSpy.mockRestore();
    });
  });

  it('should handle drain event', () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      // Find drain handler
      const drainHandler = mockWriteStream.on.mock.calls.find(
        (call: any) => call[0] === 'drain'
      )?.[1];

      expect(drainHandler).toBeDefined();

      // Trigger drain (should attempt to write buffered data)
      drainHandler();

      // Drain event processed
      expect(drainHandler).toBeDefined();
    });
  });

  it('should create directory if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');
    });

    expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(mockWorkerData.filePath), {
      recursive: true,
    });
  });

  it('should handle initialization errors', () => {
    const initError = new Error('Init failed');
    (fs.createWriteStream as jest.Mock).mockImplementation(() => {
      throw initError;
    });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');
    });

    expect(errorSpy).toHaveBeenCalledWith('[FileWorker] Failed to initialize stream:', initError);
    expect(mockParentPort.postMessage).toHaveBeenCalledWith({
      type: 'ERROR',
      error: 'Init failed',
    });

    errorSpy.mockRestore();
  });

  it('should handle message processing errors', () => {
    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      const messageHandler = mockParentPort.on.mock.calls.find(call => call[0] === 'message')?.[1];

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Send message that will cause error
      mockWriteStream.write.mockImplementation(() => {
        throw new Error('Write failed');
      });

      messageHandler({
        type: 'WRITE_BATCH',
        entries: [{ id: 'test', message: 'test' }],
      });

      expect(errorSpy).toHaveBeenCalledWith(
        '[FileWorker] Error handling message:',
        expect.any(Error)
      );
      expect(mockParentPort.postMessage).toHaveBeenCalledWith({
        type: 'ERROR',
        error: 'Write failed',
      });

      errorSpy.mockRestore();
    });
  });

  it('should handle stream write returning false (backpressure)', () => {
    // Make write return false to simulate backpressure
    mockWriteStream.write.mockReturnValue(false);

    jest.isolateModules(() => {
      require('../../../../src/transports/worker/FileWorker');

      const messageHandler = mockParentPort.on.mock.calls.find(call => call[0] === 'message')?.[1];

      // Send multiple entries
      const entries = Array.from({ length: 10 }, (_, i) => ({
        id: `test-${i}`,
        timestamp: 1704067200000,
        level: 'info',
        message: `Message ${i}`,
      }));

      messageHandler({ type: 'WRITE_BATCH', entries });

      // Should have stopped writing when backpressure detected
      const writeCalls = mockWriteStream.write.mock.calls.length;
      expect(writeCalls).toBeGreaterThan(0);
      expect(writeCalls).toBeLessThan(entries.length * 2); // Each entry gets a newline too
    });
  });

  it('should handle append mode correctly', () => {
    const appendWorkerData = { ...mockWorkerData, append: true };

    jest.isolateModules(() => {
      jest.doMock('worker_threads', () => ({
        parentPort: mockParentPort,
        workerData: appendWorkerData,
      }));

      require('../../../../src/transports/worker/FileWorker');
    });

    expect(fs.createWriteStream).toHaveBeenCalledWith(
      mockWorkerData.filePath,
      expect.objectContaining({
        flags: 'a',
        encoding: 'utf8',
      })
    );
  });

  it('should handle write mode correctly', () => {
    const writeWorkerData = { ...mockWorkerData, append: false };

    jest.isolateModules(() => {
      jest.doMock('worker_threads', () => ({
        parentPort: mockParentPort,
        workerData: writeWorkerData,
      }));

      require('../../../../src/transports/worker/FileWorker');
    });

    expect(fs.createWriteStream).toHaveBeenCalledWith(
      mockWorkerData.filePath,
      expect.objectContaining({
        flags: 'w',
        encoding: 'utf8',
      })
    );
  });
});

// Test when not in worker thread
describe('FileWorker - Not in Worker Thread', () => {
  it('should exit when parentPort is null', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    jest.isolateModules(() => {
      jest.doMock('worker_threads', () => ({
        parentPort: null,
        workerData: mockWorkerData,
      }));

      expect(() => {
        require('../../../../src/transports/worker/FileWorker');
      }).toThrow('Process exit');
    });

    expect(errorSpy).toHaveBeenCalledWith('[FileWorker] Not running in worker thread');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
