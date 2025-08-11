// File: tests/unit/transports/base/implementations/StreamTransport.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from 'events';
import { Transform } from 'stream';

// Narrow callback type used by mock write/end overloads
type WriteCallback = (error?: Error | null) => void;

// Mock stream class
class MockWritableStream extends EventEmitter {
  writable = true;
  writableLength = 0;
  writableHighWaterMark = 16384;
  bytesWritten = 0;
  private buffer: string[] = [];
  private canWrite = true;

  write(chunk: unknown, encoding?: unknown, callback?: WriteCallback): boolean {
    // Handle overloaded signatures
    let cb: WriteCallback | undefined;
    if (typeof encoding === 'function') {
      cb = encoding as WriteCallback;
    } else if (typeof callback === 'function') {
      cb = callback;
    }

    const data = Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk);
    this.buffer.push(data);
    this.bytesWritten += Buffer.byteLength(data);
    this.writableLength = this.buffer.length;

    if (cb) {
      setImmediate(() => cb(null));
    }

    // Simulate backpressure
    if (this.buffer.length > 5) {
      this.canWrite = false;
      setImmediate(() => {
        this.canWrite = true;
        this.emit('drain');
      });
      return false;
    }

    return this.canWrite;
  }

  end(chunk?: unknown, encoding?: unknown, callback?: WriteCallback): void {
    if (chunk) {
      this.write(chunk, encoding as unknown as WriteCallback);
    }
    
    const cb = (typeof chunk === 'function' ? (chunk as WriteCallback) :
               typeof encoding === 'function' ? (encoding as WriteCallback) :
               callback) as WriteCallback | undefined;

    this.writable = false;
    this.emit('finish');
    if (cb) setImmediate(() => cb(null));
  }

  cork(): void {
    // Mock cork
  }

  uncork(): void {
    // Mock uncork
  }

  flush(callback: (error?: Error | null) => void): void {
    this.buffer = [];
    setImmediate(() => callback(null));
  }

  getBuffer(): string[] {
    return [...this.buffer];
  }

  simulateError(error: Error): void {
    this.emit('error', error);
  }

  simulateClose(): void {
    this.writable = false;
    this.emit('close');
  }
}

describe('StreamTransport', () => {
  let StreamTransport: any;
  let transport: any;
  let mockStream: MockWritableStream;
  let entry: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Dynamic import after mocks
    ({ StreamTransport } = await import('../../../../../src/transports/base/implementations/StreamTransport'));
    
    mockStream = new MockWritableStream();
    
    entry = {
      id: 'test-id',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'Test message',
      context: { test: true }
    };
  });

  describe('constructor', () => {
    it('creates transport with required options', () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      expect(transport.name).toBe('stream');
    });

    it('accepts encoding configuration', () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        encoding: 'base64'
      });
      expect(transport.name).toBe('stream');
    });

    it('accepts autoClose option', () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        autoClose: true
      });
      expect(transport.name).toBe('stream');
    });
  });

  describe('initialization', () => {
    it('initializes with writable stream', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      
      await expect(transport.init()).resolves.not.toThrow();
    });

    it('throws error for non-writable stream', async () => {
      mockStream.writable = false;
      
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      
      await expect(transport.init()).rejects.toThrow('Stream is not writable');
    });

    it('sets up event handlers', async () => {
      const drainSpy = jest.spyOn(mockStream, 'on');
      
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      
      await transport.init();
      
      expect(drainSpy).toHaveBeenCalledWith('drain', expect.any(Function));
      expect(drainSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(drainSpy).toHaveBeenCalledWith('close', expect.any(Function));
      expect(drainSpy).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('writes JSON formatted logs by default', async () => {
      await transport.log(entry);
      
      const buffer = mockStream.getBuffer();
      expect(buffer).toHaveLength(1);
      
      const written = buffer[0];
      expect(written).toContain('Test message');
      expect(written).toContain('\n');
      
      // Should be valid JSON (minus newline)
      const json = JSON.parse(written.trim());
      expect(json.message).toBe('Test message');
    });

    it('writes plain text format', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        format: 'plain'
      });
      await transport.init();
      
      await transport.log(entry);
      
      const buffer = mockStream.getBuffer();
      const written = buffer[0];
      
      expect(written).toContain('[info]');
      expect(written).toContain('Test message');
    });

    it('uses custom formatter', async () => {
      const formatter = jest.fn((entry: any) => `CUSTOM: ${entry.message}`);
      
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        format: 'custom',
        formatter
      });
      await transport.init();
      
      await transport.log(entry);
      
      expect(formatter).toHaveBeenCalledWith(entry);
      
      const buffer = mockStream.getBuffer();
      expect(buffer[0]).toBe('CUSTOM: Test message\n');
    });

    it('handles batch logging efficiently', async () => {
      const entries = [
        entry,
        { ...entry, id: 'test-id-2' },
        { ...entry, id: 'test-id-3' }
      ];
      
      await transport.logBatch(entries);
      
      const buffer = mockStream.getBuffer();
      // Should write as single combined chunk
      expect(buffer).toHaveLength(1);
      
      const lines = buffer[0].trim().split('\n');
      expect(lines).toHaveLength(3);
    });

    it('uses platform-specific line endings', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
      
      await transport.log(entry);
      
      const buffer = mockStream.getBuffer();
      expect(buffer[0]).toContain('\r\n');
      
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('backpressure handling', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('queues writes during backpressure', async () => {
      const backpressureHandler = jest.fn();
      transport.on('backpressure', backpressureHandler);
      
      // Fill buffer to trigger backpressure
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(transport.log({ ...entry, id: `test-${i}` }));
      }
      
      // Wait a bit for backpressure to occur
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(backpressureHandler).toHaveBeenCalled();
      
      // Wait for all to complete
      await Promise.all(promises);
    });

    it('processes queue when stream drains', async () => {
      // Fill buffer to trigger backpressure
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(transport.log({ ...entry, id: `test-${i}` }));
      }
      
      // Trigger drain event
      mockStream.emit('drain');
      
      // All should complete
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    it('drops writes when queue is full', async () => {
      // Set a very small max queue size
      (transport as any).maxQueueSize = 2;
      
      // Fill the stream buffer first
      for (let i = 0; i < 6; i++) {
        mockStream.write(`filler-${i}`);
      }
      
      // Now try to queue many items
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          transport.log({ ...entry, id: `test-${i}` })
            .catch((e: Error) => e.message)
        );
      }
      
      const results = await Promise.all(promises);
      
      // Some should fail with queue full error
      expect(results.some(r => r === 'Stream queue is full')).toBe(true);
      
      const stats = transport.getStats();
      expect(stats.custom?.stream.queueSize).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('handles stream errors', async () => {
      const errorHandler = jest.fn();
      transport.on('error', errorHandler);
      
      const error = new Error('Stream error');
      mockStream.simulateError(error);
      
      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('disables transport after too many errors', async () => {
      const disabledHandler = jest.fn();
      transport.on('disabled', disabledHandler);
      
      // Simulate multiple errors
      for (let i = 0; i < 11; i++) {
        mockStream.simulateError(new Error(`Error ${i}`));
      }
      
      expect(disabledHandler).toHaveBeenCalledWith({
        reason: 'Too many stream errors',
        errorCount: 10
      });
      
      expect(transport.enabled).toBe(false);
    });

    it('handles write errors', async () => {
      // Make write throw an error
      mockStream.write = jest.fn().mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      await expect(transport.log(entry)).rejects.toThrow('Write failed');
    });

    it('handles stream not writable error', async () => {
      mockStream.writable = false;
      
      await expect(transport.log(entry)).rejects.toThrow('Stream is not writable');
    });
  });

  describe('stream events', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('handles stream close event', () => {
      const closeHandler = jest.fn();
      transport.on('streamClosed', closeHandler);
      
      mockStream.simulateClose();
      
      expect(closeHandler).toHaveBeenCalled();
      expect((transport as any).isWritable).toBe(false);
    });

    it('handles stream finish event', () => {
      const finishHandler = jest.fn();
      transport.on('streamFinished', finishHandler);
      
      mockStream.emit('finish');
      
      expect(finishHandler).toHaveBeenCalled();
      expect((transport as any).isWritable).toBe(false);
    });

    it('handles pipe event', () => {
      const pipeHandler = jest.fn();
      transport.on('piped', pipeHandler);
      
      const sourceStream = new EventEmitter();
      mockStream.emit('pipe', sourceStream);
      
      expect(pipeHandler).toHaveBeenCalledWith({ source: sourceStream });
    });

    it('handles unpipe event', () => {
      const unpipeHandler = jest.fn();
      transport.on('unpipe', unpipeHandler);
      
      const sourceStream = new EventEmitter();
      mockStream.emit('unpipe', sourceStream);
      
      expect(unpipeHandler).toHaveBeenCalledWith({ source: sourceStream });
    });
  });

  describe('stream methods', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('flushes stream', async () => {
      await transport.log(entry);
      
      const flushSpy = jest.spyOn(mockStream, 'flush');
      
      await transport.flush();
      
      expect(flushSpy).toHaveBeenCalled();
    });

    it('corks and uncorks stream', () => {
      const corkSpy = jest.spyOn(mockStream, 'cork');
      const uncorkSpy = jest.spyOn(mockStream, 'uncork');
      
      transport.cork();
      expect(corkSpy).toHaveBeenCalled();
      
      transport.uncork();
      expect(uncorkSpy).toHaveBeenCalled();
    });

    it('pipes to another stream', () => {
      const destinationStream = new MockWritableStream();
      const pipeSpy = jest.spyOn(Transform.prototype, 'pipe');
      
      const result = transport.pipe(destinationStream);
      
      expect(result).toBe(destinationStream);
      expect(pipeSpy).toHaveBeenCalled();
      
      pipeSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('closes stream when autoClose is true', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        autoClose: true
      });
      await transport.init();
      
      const endSpy = jest.spyOn(mockStream, 'end');
      
      await transport.close();
      
      expect(endSpy).toHaveBeenCalled();
    });

    it('does not close stream when autoClose is false', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        autoClose: false
      });
      await transport.init();
      
      const endSpy = jest.spyOn(mockStream, 'end');
      
      await transport.close();
      
      expect(endSpy).not.toHaveBeenCalled();
    });

    it('flushes before closing', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        autoClose: true
      });
      await transport.init();
      
      // Add some data
      await transport.log(entry);
      
      const flushSpy = jest.spyOn(mockStream, 'flush');
      
      await transport.close();
      
      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('provides stream-specific stats', async () => {
      await transport.log(entry);
      
      const stats = transport.getStats();
      
      expect(stats.name).toBe('stream');
      expect(stats.custom?.stream).toBeDefined();
      expect(stats.custom?.stream.writable).toBe(true);
      expect(stats.custom?.stream.queueSize).toBe(0);
      expect(stats.custom?.stream.errorCount).toBe(0);
      expect(stats.custom?.stream.bytesWritten).toBeGreaterThan(0);
      expect(stats.custom?.stream.bufferSize).toBeDefined();
      expect(stats.custom?.stream.highWaterMark).toBe(16384);
    });
  });

  describe('health check', () => {
    beforeEach(async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream
      });
      await transport.init();
    });

    it('reports healthy when stream is writable', async () => {
      const healthy = await transport.isHealthy();
      expect(healthy).toBe(true);
    });

    it('reports unhealthy when stream is not writable', async () => {
      mockStream.writable = false;
      
      const healthy = await transport.isHealthy();
      expect(healthy).toBe(false);
    });

    it('reports unhealthy when too many errors', async () => {
      // Simulate errors
      for (let i = 0; i < 10; i++) {
        mockStream.simulateError(new Error(`Error ${i}`));
      }
      
      const healthy = await transport.isHealthy();
      expect(healthy).toBe(false);
    });

    it('reports unhealthy when queue is nearly full', async () => {
      // Manually set queue size to 80% of max
      (transport as any).queue = new Array(800).fill({});
      
      const healthy = await transport.isHealthy();
      expect(healthy).toBe(false);
    });
  });

  describe('encoding', () => {
    it('handles different buffer encodings', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        encoding: 'base64'
      });
      await transport.init();
      
      await transport.log(entry);
      
      const stats = transport.getStats();
      expect(stats.logged).toBe(1);
    });

    it('converts strings to buffers when needed', async () => {
      transport = new StreamTransport({
        name: 'stream',
        stream: mockStream,
        encoding: 'hex'
      });
      await transport.init();
      
      await transport.log(entry);
      
      const buffer = mockStream.getBuffer();
      expect(buffer).toHaveLength(1);
    });
  });
});