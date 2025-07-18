// File: tests/unit/transports/base/TransportManager.test.ts

import { TransportManager } from '../../../../src/transports/base/TransportManager';
import { Transport } from '../../../../src/transports/base/Transport';
import { EventEmitter } from 'events';
import type { LogEntry, TransportManagerOptions, LogLevel } from '../../../../src/types/transport';

/**
 * Mock transport implementation for testing
 */
class MockTransport extends EventEmitter implements Transport {
  public name: string;
  public enabled: boolean;
  public logCalls: LogEntry[] = [];
  public batchCalls: LogEntry[][] = [];
  public initCalled = false;
  public closeCalled = false;
  public shouldLogValue = true;
  public throwOnLog = false;
  public throwOnInit = false;

  constructor(name: string, enabled = true) {
    super();
    this.name = name;
    this.enabled = enabled;
  }

  async init(): Promise<void> {
    if (this.throwOnInit) {
      throw new Error(`${this.name} init failed`);
    }
    this.initCalled = true;
  }

  async log(entry: LogEntry): Promise<void> {
    if (this.throwOnLog) {
      throw new Error(`${this.name} log failed`);
    }
    this.logCalls.push(entry);
  }

  async logBatch(entries: LogEntry[]): Promise<void> {
    this.batchCalls.push(entries);
  }

  shouldLog(entry: LogEntry): boolean {
    return this.shouldLogValue;
  }

  async close(): Promise<void> {
    this.closeCalled = true;
  }

  async flush(): Promise<void> {
    // No-op for mock
  }

  getStats(): any {
    return {
      processed: this.logCalls.length,
      succeeded: this.logCalls.length,
      failed: 0
    };
  }
}

/**
 * Comprehensive test suite for TransportManager class.
 * 
 * Tests transport lifecycle, routing, aggregation, and error handling.
 */
describe('TransportManager', () => {
  let manager: TransportManager;
  let mockEntry: LogEntry;
  let transport1: MockTransport;
  let transport2: MockTransport;
  let transport3: MockTransport;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    manager = new TransportManager();

    transport1 = new MockTransport('transport1');
    transport2 = new MockTransport('transport2');
    transport3 = new MockTransport('transport3');

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
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const m = new TransportManager();
      expect(m).toBeDefined();
      expect(m.list()).toEqual([]);
    });

    it('should initialize with custom options', () => {
      const options: TransportManagerOptions = {
        defaultTimeout: 5000,
        stopOnSuccess: true,
        errorHandler: jest.fn(),
        enableAggregation: true,
        aggregation: {
          interval: 30000,
          targets: ['metrics'],
          fields: ['level', 'tags']
        }
      };
      
      const m = new TransportManager(options);
      expect(m).toBeDefined();
    });

    it('should set max listeners', () => {
      const m = new TransportManager();
      expect(m.getMaxListeners()).toBe(50);
    });

    it('should initialize aggregation when enabled', () => {
      const m = new TransportManager({
        enableAggregation: true,
        aggregation: { interval: 1000 }
      });
      
      // Timer should be started
      expect(jest.getTimerCount()).toBe(1);
    });
  });

  describe('add transport', () => {
    it('should add transport successfully', async () => {
      await manager.add(transport1);
      
      expect(manager.list()).toEqual(['transport1']);
      expect(transport1.initCalled).toBe(true);
    });

    it('should add multiple transports', async () => {
      await manager.add(transport1);
      await manager.add(transport2);
      await manager.add(transport3);
      
      expect(manager.list()).toEqual(['transport1', 'transport2', 'transport3']);
    });

    it('should respect priority ordering', async () => {
      await manager.add(transport1, 1);
      await manager.add(transport2, 3);
      await manager.add(transport3, 2);
      
      // Should be ordered by priority (highest first)
      expect(manager.list()).toEqual(['transport2', 'transport3', 'transport1']);
    });

    it('should throw if transport already exists', async () => {
      await manager.add(transport1);
      
      await expect(manager.add(transport1))
        .rejects.toThrow("Transport 'transport1' already exists");
    });

    it('should throw if manager is closing', async () => {
      manager.close(); // Start closing
      
      await expect(manager.add(transport1))
        .rejects.toThrow('Cannot add transport: manager is closing');
    });

    it('should set up error handling', async () => {
      const errorSpy = jest.fn();
      manager.on('transportError', errorSpy);
      
      await manager.add(transport1);
      
      const error = new Error('Test error');
      transport1.emit('error', error, mockEntry);
      
      expect(errorSpy).toHaveBeenCalledWith('transport1', error, mockEntry);
    });

    it('should emit transportAdded event', async () => {
      const addedSpy = jest.fn();
      manager.on('transportAdded', addedSpy);
      
      await manager.add(transport1);
      
      expect(addedSpy).toHaveBeenCalledWith('transport1');
    });

    it('should handle init errors', async () => {
      transport1.throwOnInit = true;
      
      await expect(manager.add(transport1))
        .rejects.toThrow('transport1 init failed');
    });
  });

  describe('remove transport', () => {
    beforeEach(async () => {
      await manager.add(transport1);
      await manager.add(transport2);
    });

    it('should remove transport successfully', async () => {
      await manager.remove('transport1');
      
      expect(manager.list()).toEqual(['transport2']);
      expect(transport1.closeCalled).toBe(true);
    });

    it('should throw if transport not found', async () => {
      await expect(manager.remove('nonexistent'))
        .rejects.toThrow("Transport 'nonexistent' not found");
    });

    it('should emit transportRemoved event', async () => {
      const removedSpy = jest.fn();
      manager.on('transportRemoved', removedSpy);
      
      await manager.remove('transport1');
      
      expect(removedSpy).toHaveBeenCalledWith('transport1');
    });
  });

  describe('get transport', () => {
    beforeEach(async () => {
      await manager.add(transport1);
    });

    it('should get transport by name', () => {
      expect(manager.get('transport1')).toBe(transport1);
    });

    it('should return undefined for unknown transport', () => {
      expect(manager.get('unknown')).toBeUndefined();
    });
  });

  describe('setEnabled', () => {
    beforeEach(async () => {
      await manager.add(transport1);
    });

    it('should enable transport', () => {
      manager.setEnabled('transport1', false);
      manager.setEnabled('transport1', true);
      
      expect(transport1.enabled).toBe(true);
    });

    it('should disable transport', () => {
      manager.setEnabled('transport1', false);
      
      expect(transport1.enabled).toBe(false);
    });

    it('should throw if transport not found', () => {
      expect(() => manager.setEnabled('unknown', true))
        .toThrow("Transport 'unknown' not found");
    });

    it('should emit transportToggled event', () => {
      const toggledSpy = jest.fn();
      manager.on('transportToggled', toggledSpy);
      
      manager.setEnabled('transport1', false);
      
      expect(toggledSpy).toHaveBeenCalledWith('transport1', false);
    });
  });

  describe('log routing', () => {
    beforeEach(async () => {
      await manager.add(transport1);
      await manager.add(transport2);
      await manager.add(transport3);
    });

    it('should log to all transports', async () => {
      await manager.log(mockEntry);
      
      expect(transport1.logCalls).toHaveLength(1);
      expect(transport2.logCalls).toHaveLength(1);
      expect(transport3.logCalls).toHaveLength(1);
    });

    it('should skip disabled transports', async () => {
      transport2.enabled = false;
      
      await manager.log(mockEntry);
      
      expect(transport1.logCalls).toHaveLength(1);
      expect(transport2.logCalls).toHaveLength(0);
      expect(transport3.logCalls).toHaveLength(1);
    });

    it('should respect shouldLog filtering', async () => {
      transport2.shouldLogValue = false;
      
      await manager.log(mockEntry);
      
      expect(transport1.logCalls).toHaveLength(1);
      expect(transport2.logCalls).toHaveLength(0);
      expect(transport3.logCalls).toHaveLength(1);
    });

    it('should emit noTransports event', async () => {
      const noTransportsSpy = jest.fn();
      manager.on('noTransports', noTransportsSpy);
      
      // Remove all transports
      await manager.remove('transport1');
      await manager.remove('transport2');
      await manager.remove('transport3');
      
      await manager.log(mockEntry);
      
      expect(noTransportsSpy).toHaveBeenCalledWith(mockEntry);
    });

    it('should not log when closing', async () => {
      manager.close(); // Start closing
      
      await manager.log(mockEntry);
      
      expect(transport1.logCalls).toHaveLength(0);
    });

    it('should emit logged event', async () => {
      const loggedSpy = jest.fn();
      manager.on('logged', loggedSpy);
      
      await manager.log(mockEntry);
      
      expect(loggedSpy).toHaveBeenCalledWith(
        mockEntry,
        ['transport1', 'transport2', 'transport3']
      );
    });
  });

  describe('stopOnSuccess mode', () => {
    beforeEach(async () => {
      manager = new TransportManager({ stopOnSuccess: true });
      await manager.add(transport1, 3);
      await manager.add(transport2, 2);
      await manager.add(transport3, 1);
    });

    it('should stop after first success', async () => {
      await manager.log(mockEntry);
      
      // Only highest priority transport should be called
      expect(transport1.logCalls).toHaveLength(1);
      expect(transport2.logCalls).toHaveLength(0);
      expect(transport3.logCalls).toHaveLength(0);
    });

    it('should try next transport on failure', async () => {
      transport1.throwOnLog = true;
      
      await manager.log(mockEntry);
      
      expect(transport1.logCalls).toHaveLength(0);
      expect(transport2.logCalls).toHaveLength(1);
      expect(transport3.logCalls).toHaveLength(0);
    });

    it('should try all transports if needed', async () => {
      transport1.throwOnLog = true;
      transport2.throwOnLog = true;
      
      await manager.log(mockEntry);
      
      expect(transport3.logCalls).toHaveLength(1);
    });

    it('should emit allTransportsFailed event', async () => {
      const failedSpy = jest.fn();
      manager.on('allTransportsFailed', failedSpy);
      
      transport1.throwOnLog = true;
      transport2.throwOnLog = true;
      transport3.throwOnLog = true;
      
      await manager.log(mockEntry);
      
      expect(failedSpy).toHaveBeenCalledWith(
        mockEntry,
        expect.arrayContaining([
          { transport: 'transport1', error: expect.any(Error) },
          { transport: 'transport2', error: expect.any(Error) },
          { transport: 'transport3', error: expect.any(Error) }
        ])
      );
    });

    it('should skip transports that should not log', async () => {
      transport1.shouldLogValue = false;
      
      await manager.log(mockEntry);
      
      // Should skip transport1 and use transport2
      expect(transport1.logCalls).toHaveLength(0);
      expect(transport2.logCalls).toHaveLength(1);
      expect(transport3.logCalls).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await manager.add(transport1);
      await manager.add(transport2);
    });

    it('should handle partial failures', async () => {
      const partialSpy = jest.fn();
      manager.on('partialFailure', partialSpy);
      
      transport1.throwOnLog = true;
      
      await manager.log(mockEntry);
      
      expect(partialSpy).toHaveBeenCalledWith(
        mockEntry,
        ['transport2'],
        [{ transport: 'transport1', error: expect.any(Error) }]
      );
    });

    it('should apply timeout', async () => {
      manager = new TransportManager({ defaultTimeout: 100 });
      
      // Create slow transport
      const slowTransport = new MockTransport('slow');
      slowTransport.log = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );
      
      await manager.add(slowTransport);
      await manager.log(mockEntry);
      
      // Should timeout
      expect(slowTransport.log).toHaveBeenCalled();
    });

    it('should call global error handler', async () => {
      const errorHandler = jest.fn();
      manager = new TransportManager({ errorHandler });
      
      await manager.add(transport1);
      
      const error = new Error('Test error');
      transport1.emit('error', error, mockEntry);
      
      expect(errorHandler).toHaveBeenCalledWith(error, transport1, mockEntry);
    });

    it('should handle error handler exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      manager = new TransportManager({
        errorHandler: () => { throw new Error('Handler error'); }
      });
      
      await manager.add(transport1);
      transport1.emit('error', new Error('Test'));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in error handler:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('aggregation', () => {
    let aggregationManager: TransportManager;
    let metricsTransport: MockTransport;

    beforeEach(async () => {
      metricsTransport = new MockTransport('metrics');
      
      aggregationManager = new TransportManager({
        enableAggregation: true,
        aggregation: {
          interval: 1000,
          targets: ['metrics'],
          fields: ['level', 'loggerId', 'tags']
        }
      });
      
      await aggregationManager.add(transport1);
      await aggregationManager.add(metricsTransport);
    });

    it('should aggregate log statistics', async () => {
      await aggregationManager.log(mockEntry);
      await aggregationManager.log({ ...mockEntry, level: 'error' });
      await aggregationManager.log({ ...mockEntry, level: 'error' });
      
      // Trigger aggregation
      jest.advanceTimersByTime(1000);
      
      // Check metrics transport received aggregation
      expect(metricsTransport.logCalls).toHaveLength(1);
      const aggEntry = metricsTransport.logCalls[0];
      
      expect(aggEntry.loggerId).toBe('transport-manager');
      expect(aggEntry.tags).toContain('aggregation');
      expect(aggEntry.context?.stats).toMatchObject({
        total: 3,
        byLevel: { info: 1, error: 2 },
        errorRate: 2/3
      });
    });

    it('should track by logger ID', async () => {
      await aggregationManager.log({ ...mockEntry, loggerId: 'logger1' });
      await aggregationManager.log({ ...mockEntry, loggerId: 'logger2' });
      await aggregationManager.log({ ...mockEntry, loggerId: 'logger1' });
      
      jest.advanceTimersByTime(1000);
      
      const aggEntry = metricsTransport.logCalls[0];
      expect(aggEntry.context?.stats.byLogger).toEqual({
        logger1: 2,
        logger2: 1
      });
    });

    it('should track by tags', async () => {
      await aggregationManager.log({ ...mockEntry, tags: ['api', 'v1'] });
      await aggregationManager.log({ ...mockEntry, tags: ['api', 'v2'] });
      await aggregationManager.log({ ...mockEntry, tags: ['api'] });
      
      jest.advanceTimersByTime(1000);
      
      const aggEntry = metricsTransport.logCalls[0];
      expect(aggEntry.context?.stats.byTags).toEqual({
        api: 3,
        v1: 1,
        v2: 1
      });
    });

    it('should calculate average size', async () => {
      await aggregationManager.log(mockEntry);
      await aggregationManager.log({ ...mockEntry, message: 'x'.repeat(100) });
      
      jest.advanceTimersByTime(1000);
      
      const aggEntry = metricsTransport.logCalls[0];
      expect(aggEntry.context?.stats.avgSize).toBeGreaterThan(0);
    });

    it('should emit aggregation event', async () => {
      const aggSpy = jest.fn();
      aggregationManager.on('aggregation', aggSpy);
      
      await aggregationManager.log(mockEntry);
      
      jest.advanceTimersByTime(1000);
      
      expect(aggSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 1,
          byLevel: { info: 1 }
        })
      );
    });

    it('should reset stats after aggregation', async () => {
      await aggregationManager.log(mockEntry);
      
      jest.advanceTimersByTime(1000);
      
      // Log more after aggregation
      await aggregationManager.log({ ...mockEntry, level: 'warn' });
      
      jest.advanceTimersByTime(1000);
      
      // Second aggregation should only have new log
      const secondAgg = metricsTransport.logCalls[1];
      expect(secondAgg.context?.stats.total).toBe(1);
      expect(secondAgg.context?.stats.byLevel).toEqual({ warn: 1 });
    });

    it('should limit buffer size', async () => {
      // Add many logs
      for (let i = 0; i < 15000; i++) {
        await aggregationManager.log({ ...mockEntry, id: `log-${i}` });
      }
      
      // Buffer should be limited to prevent memory issues
      // Internal implementation limits to 5000 when > 10000
      expect(aggregationManager['logBuffer'].length).toBeLessThanOrEqual(5000);
    });

    it('should handle aggregation target errors', async () => {
      metricsTransport.throwOnLog = true;
      
      await aggregationManager.log(mockEntry);
      
      // Should not throw when aggregation fails
      jest.advanceTimersByTime(1000);
      
      // Error should be handled
      expect(metricsTransport.logCalls).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await manager.add(transport1);
      await manager.add(transport2);
    });

    it('should get stats from all transports', () => {
      transport1.logCalls = [mockEntry];
      transport2.logCalls = [mockEntry, mockEntry];
      
      const stats = manager.getStats();
      
      expect(stats).toHaveProperty('transport1');
      expect(stats).toHaveProperty('transport2');
      expect(stats.transport1.processed).toBe(1);
      expect(stats.transport2.processed).toBe(2);
    });

    it('should include manager stats', () => {
      const stats = manager.getStats();
      
      expect(stats._manager).toMatchObject({
        transportCount: 2,
        activeTransports: 2,
        aggregationEnabled: false
      });
    });

    it('should include aggregation stats when enabled', () => {
      manager = new TransportManager({ enableAggregation: true });
      
      const stats = manager.getStats();
      
      expect(stats._manager.aggregationEnabled).toBe(true);
      expect(stats._manager.currentAggregation).toBeDefined();
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      await manager.add(transport1);
      await manager.add(transport2);
    });

    it('should close all transports', async () => {
      await manager.close();
      
      expect(transport1.closeCalled).toBe(true);
      expect(transport2.closeCalled).toBe(true);
    });

    it('should emit closing and closed events', async () => {
      const closingSpy = jest.fn();
      const closedSpy = jest.fn();
      
      manager.on('closing', closingSpy);
      manager.on('closed', closedSpy);
      
      await manager.close();
      
      expect(closingSpy).toHaveBeenCalled();
      expect(closedSpy).toHaveBeenCalled();
    });

    it('should stop aggregation timer', async () => {
      manager = new TransportManager({
        enableAggregation: true,
        aggregation: { interval: 1000 }
      });
      
      expect(jest.getTimerCount()).toBe(1);
      
      await manager.close();
      
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should flush final aggregation', async () => {
      const metricsTransport = new MockTransport('metrics');
      
      manager = new TransportManager({
        enableAggregation: true,
        aggregation: {
          interval: 60000,
          targets: ['metrics']
        }
      });
      
      await manager.add(metricsTransport);
      await manager.log(mockEntry);
      
      await manager.close();
      
      // Should have flushed aggregation
      expect(metricsTransport.logCalls).toHaveLength(1);
    });

    it('should handle close errors', async () => {
      transport1.close = jest.fn().mockRejectedValue(new Error('Close failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await manager.close();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error closing transport 'transport1':",
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should clear transports map', async () => {
      await manager.close();
      
      expect(manager.list()).toEqual([]);
    });

    it('should prevent multiple closes', async () => {
      await manager.close();
      await manager.close();
      
      // Should only close once
      expect(transport1.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('transport priority', () => {
    it('should maintain priority order', async () => {
      await manager.add(new MockTransport('low'), 1);
      await manager.add(new MockTransport('high'), 10);
      await manager.add(new MockTransport('medium'), 5);
      
      expect(manager.list()).toEqual(['high', 'medium', 'low']);
    });

    it('should reorder when adding with priority', async () => {
      await manager.add(transport1, 5);
      await manager.add(transport2, 5);
      await manager.add(transport3, 10);
      
      expect(manager.list()).toEqual(['transport3', 'transport1', 'transport2']);
    });
  });
});