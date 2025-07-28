// File: tests/unit/async/AsyncBuffer.test.ts

import { AsyncBuffer } from '../../../src/async/AsyncBuffer';
import type { LogEntry } from '../../../src/types/transport';

describe('AsyncBuffer', () => {
  let buffer: AsyncBuffer;
  let mockFlushHandler: jest.Mock;
  let flushPromiseResolve: () => void;
  let flushPromise: Promise<void>;

  // Helper to create a mock log entry
  const createLogEntry = (id: string): LogEntry => ({
    id,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    level: 'info',
    message: `Test message ${id}`,
    plainMessage: `Test message ${id}`,
  });

  // Helper to wait for next tick
  const nextTick = () => new Promise(resolve => setImmediate(resolve));

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Create a controlled promise for flush testing
    flushPromise = new Promise(resolve => {
      flushPromiseResolve = resolve;
    });
    
    mockFlushHandler = jest.fn().mockReturnValue(flushPromise);
  });

  afterEach(() => {
    jest.useRealTimers();
    if (buffer) {
      buffer.close();
    }
  });

  describe('constructor', () => {
    it('should create buffer with default options', () => {
      buffer = new AsyncBuffer({ onFlush: mockFlushHandler });
      
      const stats = buffer.getStats();
      expect(stats.capacity).toBe(10000);
      expect(stats.size).toBe(0);
      expect(stats.utilization).toBe(0);
    });

    it('should create buffer with custom options', () => {
      buffer = new AsyncBuffer({
        size: 100,
        flushInterval: 500,
        flushSize: 50,
        onFlush: mockFlushHandler,
        overflowStrategy: 'drop-newest',
        enableMetrics: true,
      });
      
      const stats = buffer.getStats();
      expect(stats.capacity).toBe(100);
      expect(stats.metrics).toBeDefined();
    });

    it('should start flush timer if interval > 0', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        flushInterval: 200,
      });
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 200);
    });

    it('should not start flush timer if interval <= 0', () => {
      // Create spy before creating buffer
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(() => {
        throw new Error('setInterval should not be called');
      });
      
      // This should not throw an error if timer is not started
      expect(() => {
        buffer = new AsyncBuffer({
          onFlush: mockFlushHandler,
          flushInterval: 0,
        });
      }).not.toThrow();
      
      setIntervalSpy.mockRestore();
    });
  });

  describe('add', () => {
    beforeEach(() => {
      buffer = new AsyncBuffer({
        size: 5,
        flushSize: 3,
        flushInterval: 0, // Disable auto-flush
        onFlush: mockFlushHandler,
      });
    });

    it('should add entries to buffer', () => {
      const entry1 = createLogEntry('1');
      const entry2 = createLogEntry('2');
      
      expect(buffer.add(entry1)).toBe(true);
      expect(buffer.add(entry2)).toBe(true);
      
      expect(buffer.getSize()).toBe(2);
      expect(buffer.isEmpty()).toBe(false);
      expect(buffer.isFull()).toBe(false);
    });

    it('should trigger flush when flushSize is reached', () => {
      const entries = Array.from({ length: 3 }, (_, i) => createLogEntry(String(i)));
      
      entries.forEach(entry => buffer.add(entry));
      
      expect(mockFlushHandler).toHaveBeenCalledTimes(1);
      expect(mockFlushHandler).toHaveBeenCalledWith(entries);
      expect(buffer.getSize()).toBe(0);
    });

    it('should handle drop-oldest overflow strategy', () => {
      buffer = new AsyncBuffer({
        size: 3,
        flushInterval: 0,
        onFlush: mockFlushHandler,
        overflowStrategy: 'drop-oldest',
        enableMetrics: true,
      });
      
      // Fill buffer
      const entries = Array.from({ length: 4 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      // Buffer should contain entries 1, 2, 3 (entry 0 dropped)
      buffer.flush();
      
      expect(mockFlushHandler).toHaveBeenCalledWith([
        entries[1],
        entries[2],
        entries[3],
      ]);
      
      const stats = buffer.getStats();
      expect(stats.metrics?.totalDropped).toBe(1);
    });

    it('should handle drop-newest overflow strategy', () => {
      buffer = new AsyncBuffer({
        size: 3,
        flushInterval: 0,
        onFlush: mockFlushHandler,
        overflowStrategy: 'drop-newest',
        enableMetrics: true,
      });
      
      // Fill buffer
      const entries = Array.from({ length: 4 }, (_, i) => createLogEntry(String(i)));
      const addResults = [
        buffer.add(entries[0]),
        buffer.add(entries[1]),
        buffer.add(entries[2]),
      ];
      const added = buffer.add(entries[3]);
      
      expect(addResults[0]).toBe(true);
      expect(addResults[1]).toBe(true);
      expect(addResults[2]).toBe(true);
      expect(added).toBe(false); // Fourth entry dropped
      
      buffer.flush();
      expect(mockFlushHandler).toHaveBeenCalledWith([
        entries[0],
        entries[1],
        entries[2],
      ]);
      
      const stats = buffer.getStats();
      expect(stats.metrics?.totalDropped).toBe(1);
    });

    it('should handle block overflow strategy', () => {
      buffer = new AsyncBuffer({
        size: 3,
        flushInterval: 0,
        onFlush: mockFlushHandler,
        overflowStrategy: 'block',
        enableMetrics: true,
      });
      
      // Fill buffer
      const entries = Array.from({ length: 4 }, (_, i) => createLogEntry(String(i)));
      entries.slice(0, 3).forEach(entry => buffer.add(entry));
      
      // Fourth entry should be dropped (block not fully implemented)
      const added = buffer.add(entries[3]);
      expect(added).toBe(false);
      
      const stats = buffer.getStats();
      expect(stats.metrics?.totalDropped).toBe(1);
    });

    it('should reject entries when closing', async () => {
      const entry = createLogEntry('1');
      
      // Start closing
      const closePromise = buffer.close();
      
      // Try to add
      expect(buffer.add(entry)).toBe(false);
      
      await closePromise;
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      buffer = new AsyncBuffer({
        size: 10,
        flushInterval: 0,
        onFlush: mockFlushHandler,
        enableMetrics: true,
      });
    });

    it('should flush all entries', () => {
      const entries = Array.from({ length: 5 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      buffer.flush();
      
      expect(mockFlushHandler).toHaveBeenCalledWith(entries);
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle empty buffer', () => {
      buffer.flush();
      expect(mockFlushHandler).not.toHaveBeenCalled();
    });

    it('should prevent concurrent flushes', () => {
      const entries = Array.from({ length: 3 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      // First flush
      buffer.flush();
      expect(mockFlushHandler).toHaveBeenCalledTimes(1);
      
      // Second flush should be ignored
      buffer.flush();
      expect(mockFlushHandler).toHaveBeenCalledTimes(1);
    });

    it('should update metrics on flush', () => {
      const entries = Array.from({ length: 3 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      buffer.flush();
      
      const stats = buffer.getStats();
      expect(stats.metrics?.totalAdded).toBe(3);
      expect(stats.metrics?.totalFlushed).toBe(3);
      expect(stats.metrics?.flushCount).toBe(1);
      expect(stats.metrics?.avgFlushSize).toBe(3);
    });

    it('should handle sync flush handler errors', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Flush failed');
      });
      
      buffer = new AsyncBuffer({
        onFlush: errorHandler,
        flushInterval: 0,
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      buffer.add(createLogEntry('1'));
      buffer.flush();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncBuffer] Flush handler error:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle async flush handler errors', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Async flush failed'));
      
      buffer = new AsyncBuffer({
        onFlush: errorHandler,
        flushInterval: 0,
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      buffer.add(createLogEntry('1'));
      buffer.flush();
      
      await nextTick();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AsyncBuffer] Flush handler error:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('flushAndWait', () => {
    it('should flush and wait for completion', async () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        flushInterval: 0,
      });
      
      const entries = Array.from({ length: 3 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      const flushPromise = buffer.flushAndWait();
      
      // Resolve the handler promise
      flushPromiseResolve();
      
      await flushPromise;
      
      expect(mockFlushHandler).toHaveBeenCalledWith(entries);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should resolve immediately for empty buffer', async () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        flushInterval: 0,
      });
      
      await buffer.flushAndWait();
      
      expect(mockFlushHandler).not.toHaveBeenCalled();
    });

    it('should handle sync flush handler', async () => {
      const syncHandler = jest.fn();
      
      buffer = new AsyncBuffer({
        onFlush: syncHandler,
        flushInterval: 0,
      });
      
      buffer.add(createLogEntry('1'));
      await buffer.flushAndWait();
      
      expect(syncHandler).toHaveBeenCalled();
    });

    it('should handle rejected promises', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Failed'));
      
      buffer = new AsyncBuffer({
        onFlush: errorHandler,
        flushInterval: 0,
      });
      
      buffer.add(createLogEntry('1'));
      
      // Should not throw
      await buffer.flushAndWait();
      
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('automatic flushing', () => {
    it('should auto-flush on interval', () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        flushInterval: 100,
      });
      
      const entries = Array.from({ length: 3 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      expect(mockFlushHandler).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(mockFlushHandler).toHaveBeenCalledWith(entries);
    });

    it('should not auto-flush when closing', async () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        flushInterval: 100,
      });
      
      buffer.add(createLogEntry('1'));
      
      // Start closing
      const closePromise = buffer.close();
      
      jest.advanceTimersByTime(100);
      
      // Should flush once during close, not from timer
      await closePromise;
      
      expect(mockFlushHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('close', () => {
    it('should stop timer and flush remaining entries', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        flushInterval: 100,
      });
      
      const entries = Array.from({ length: 3 }, (_, i) => createLogEntry(String(i)));
      entries.forEach(entry => buffer.add(entry));
      
      await buffer.close();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(mockFlushHandler).toHaveBeenCalledWith(entries);
      expect(buffer.getSize()).toBe(0);
    });

    it('should clear buffer references', async () => {
      buffer = new AsyncBuffer({
        size: 5,
        onFlush: mockFlushHandler,
      });
      
      buffer.add(createLogEntry('1'));
      
      await buffer.close();
      
      // Buffer should be cleared
      const stats = buffer.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('metrics', () => {
    it('should track metrics when enabled', () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        enableMetrics: true,
        flushInterval: 0,
        overflowStrategy: 'drop-oldest',
        size: 3,
      });
      
      // Add entries
      Array.from({ length: 5 }, (_, i) => createLogEntry(String(i)))
        .forEach(entry => buffer.add(entry));
      
      // Flush
      buffer.flush();
      
      const stats = buffer.getStats();
      expect(stats.metrics).toEqual({
        totalAdded: 5,
        totalFlushed: 3,
        totalDropped: 2,
        flushCount: 1,
        lastFlushTime: expect.any(Number),
        avgFlushSize: 3,
      });
    });

    it('should not include metrics when disabled', () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        enableMetrics: false,
      });
      
      const stats = buffer.getStats();
      expect(stats.metrics).toBeUndefined();
    });

    it('should reset metrics', () => {
      buffer = new AsyncBuffer({
        onFlush: mockFlushHandler,
        enableMetrics: true,
        flushInterval: 0,
      });
      
      // Add and flush
      buffer.add(createLogEntry('1'));
      buffer.flush();
      
      // Reset
      buffer.resetMetrics();
      
      const stats = buffer.getStats();
      expect(stats.metrics).toEqual({
        totalAdded: 0,
        totalFlushed: 0,
        totalDropped: 0,
        flushCount: 0,
        lastFlushTime: 0,
        avgFlushSize: 0,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle single-entry buffer', () => {
      buffer = new AsyncBuffer({
        size: 1,
        onFlush: mockFlushHandler,
        flushInterval: 0,
      });
      
      const entry1 = createLogEntry('1');
      const entry2 = createLogEntry('2');
      
      expect(buffer.add(entry1)).toBe(true);
      expect(buffer.isFull()).toBe(true);
      
      // Should drop oldest
      expect(buffer.add(entry2)).toBe(true);
      
      buffer.flush();
      expect(mockFlushHandler).toHaveBeenCalledWith([entry2]);
    });

    it('should handle rapid add/flush cycles', () => {
      buffer = new AsyncBuffer({
        size: 100,
        flushSize: 10,
        onFlush: mockFlushHandler,
        flushInterval: 0,
      });
      
      // Rapid cycles
      for (let cycle = 0; cycle < 10; cycle++) {
        const entries = Array.from({ length: 10 }, (_, i) => 
          createLogEntry(`${cycle}-${i}`)
        );
        entries.forEach(entry => buffer.add(entry));
      }
      
      expect(mockFlushHandler).toHaveBeenCalledTimes(10);
    });

    it('should handle null entries in buffer gracefully', () => {
      buffer = new AsyncBuffer({
        size: 5,
        onFlush: mockFlushHandler,
        flushInterval: 0,
      });
      
      // Add some entries
      buffer.add(createLogEntry('1'));
      buffer.add(createLogEntry('2'));
      
      // Manually corrupt buffer (simulating edge case)
      (buffer as unknown as { buffer: (LogEntry | null)[] }).buffer[1] = null;
      
      // Flush should handle null gracefully
      buffer.flush();
      
      expect(mockFlushHandler).toHaveBeenCalledWith([
        createLogEntry('1'),
      ]);
    });
  });
});