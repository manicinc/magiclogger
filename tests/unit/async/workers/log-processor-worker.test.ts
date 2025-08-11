// File: tests/unit/async/workers/log-processor.worker.test.ts

import type { LogEntry } from '../../../../src/types/transport';

/**
 * Mock Worker implementation for testing.
 * This replaces the actual Web Worker in test environment.
 */
class MockWorker {
  public onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners: Map<string, Array<(event: MessageEvent) => void>> = new Map();
  private messageQueue: MessageEvent[] = [];
  private closed = false;
  // Keep track of the latest configuration to simulate destination-specific behavior
  private currentConfig: Record<string, unknown> = {};

  constructor(scriptURL: string, _options?: WorkerOptions) {
    // Validate script URL
    if (!scriptURL.includes('log-processor.worker')) {
      throw new Error(`Invalid worker script: ${scriptURL}`);
    }

    // Simulate worker initialization
    setTimeout(() => {
      if (!this.closed) {
        this.dispatchEvent(new MessageEvent('message', {
          data: { type: 'ready' }
        }));
      }
    }, 0);
  }

  /**
   * Post message to worker (mocked).
   */
  postMessage(message: unknown, _transfer?: Transferable[]): void {
    if (this.closed) {
      throw new Error('Worker has been closed');
    }

    // Process message in next tick to simulate async behavior
    setTimeout(() => {
      if (!this.closed) {
        this.handleWorkerMessage(message as Record<string, unknown>);
      }
    }, 0);
  }

  /**
   * Add event listener.
   */
  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  /**
   * Remove event listener.
   */
  removeEventListener(type: string, listener: (event: MessageEvent) => void): void {
    const listeners = this.listeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Terminate the worker.
   */
  terminate(): void {
    this.closed = true;
    this.listeners.clear();
    this.messageQueue = [];
  }

  /**
   * Dispatch event to listeners.
   */
  private dispatchEvent(event: MessageEvent): boolean {
    const listeners = this.listeners.get(event.type) || [];
    listeners.forEach(listener => listener(event));

    if (event.type === 'message' && this.onmessage) {
      this.onmessage(event);
    }

    return true;
  }

  /**
   * Handle incoming worker messages (simulated processing).
   */
  private handleWorkerMessage(data: Record<string, unknown>): void {
    const { type, entries, config } = data;

    switch (type) {
      case 'logs':
        if (entries && Array.isArray(entries)) {
          this.processLogs(entries as LogEntry[]);
        }
        break;

      case 'config':
        if (config) {
          this.updateConfig(config as Record<string, unknown>);
        }
        break;

      case 'shutdown':
        this.terminate();
        break;

      default:
        this.sendError(`Unknown message type: ${type}`);
    }
  }

  /**
   * Simulate log processing.
   */
  private processLogs(entries: LogEntry[]): void {
    // Simulate processing time
    const processingTime = Math.random() * 10;

    setTimeout(() => {
      if (this.closed) return;

      // Emit pre-processing readiness messages based on destination
      const destination = this.currentConfig.destination as string | undefined;
      if (destination === 'file') {
        // Simulate preparing file destination
        this.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'file-ready',
            data: {
              prepared: true,
              // include a mock file reference or metadata
              file: 'mock-log-file.log'
            }
          }
        }));
      } else if (destination === 'network') {
        // Simulate network batch being ready
        this.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'network-ready',
            batch: {
              endpoint: this.currentConfig.endpoint,
              count: entries.length,
            }
          }
        }));
      }

      // Finally, emit processed message
      this.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'processed',
          count: entries.length,
          metrics: {
            processed: entries.length,
            errors: 0,
            avgProcessingTime: processingTime,
            lastBatchSize: entries.length,
          }
        }
      }));
    }, processingTime);
  }

  /**
   * Simulate config update.
   */
  private updateConfig(config: Record<string, unknown>): void {
    // Merge with existing config and notify
    this.currentConfig = { ...this.currentConfig, ...config };
    this.dispatchEvent(new MessageEvent('message', {
      data: {
        type: 'config-updated',
        config: { ...this.currentConfig }
      }
    }));
  }

  /**
   * Send error message.
   */
  private sendError(message: string): void {
    this.dispatchEvent(new MessageEvent('message', {
      data: {
        type: 'error',
        error: message
      }
    }));
  }
}

// Replace global Worker with MockWorker in tests
(global as Record<string, unknown>).Worker = MockWorker;

describe('LogProcessorWorker', () => {
  let worker: Worker;
  let onMessage: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    onMessage = jest.fn();
    onError = jest.fn();
    worker = new Worker('log-processor.worker.ts');
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError as EventListener);
  });

  afterEach(() => {
    worker.terminate();
    jest.clearAllMocks();
  });

  describe('Worker Initialization', () => {
    it('should send ready message on initialization', async () => {
      await new Promise<void>((resolve) => {
        const handleMessage = (event: MessageEvent) => {
          expect(event.data).toEqual({ type: 'ready' });
          resolve();
        };

        worker.addEventListener('message', handleMessage);
      });
    });

    it('should handle invalid worker script', () => {
      expect(() => {
        new Worker('invalid-worker.js');
      }).toThrow('Invalid worker script');
    });
  });

  describe('Log Processing', () => {
    it('should process log entries successfully', async () => {
      const entries: LogEntry[] = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'Test message 1',
          plainMessage: 'Test message 1',
          tags: ['test'],
          context: { type: 'test-context' },
          metadata: { test: true }
        },
        {
          id: 'log-2',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'error',
          message: 'Test message 2',
          plainMessage: 'Test message 2',
          tags: ['error'],
          context: { type: 'test-context' },
          metadata: { error: true }
        }
      ];

      const processedPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'processed') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries
      });

      await processedPromise;

      // Verify the result by checking the mock calls
      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'processed'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.count).toBe(2);
      expect(lastMessage[0].data.metrics).toEqual({
        processed: 2,
        errors: 0,
        avgProcessingTime: expect.any(Number),
        lastBatchSize: 2
      });
    });

    it('should handle empty entries array', async () => {
      const processedPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'processed') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries: []
      });

      await processedPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'processed'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.count).toBe(0);
      expect(lastMessage[0].data.metrics.processed).toBe(0);
    });

    it('should handle large batches', async () => {
      const largeEntries: LogEntry[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: `Message ${i}`,
        plainMessage: `Message ${i}`,
        tags: ['bulk'],
        context: { type: 'bulk-test' },
        metadata: { index: i }
      }));

      const processedPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'processed') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries: largeEntries
      });

      await processedPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'processed'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.count).toBe(1000);
      expect(lastMessage[0].data.metrics.lastBatchSize).toBe(1000);
    });
  });

  describe('Configuration Management', () => {
    it('should update worker configuration', async () => {
      const config = {
        formatType: 'json' as const,
        batchSize: 200,
        destination: 'network' as const,
        endpoint: 'https://logs.example.com'
      };

      const configPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'config-updated') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'config',
        config
      });

      await configPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'config-updated'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.config).toEqual(config);
    });

    it('should handle partial config updates', async () => {
      const partialConfig = {
        batchSize: 500
      };

      const configPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'config-updated') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'config',
        config: partialConfig
      });

      await configPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'config-updated'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.config.batchSize).toBe(500);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown message types', async () => {
      const errorPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'error') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'invalid',
        data: 'test'
      });

      await errorPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'error'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.error).toBe('Unknown message type: invalid');
    });

    it('should handle malformed messages gracefully', async () => {
      const errorPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'error') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: null
      });

      await errorPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'error'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.error).toContain('Unknown message type');
    });
  });

  describe('Worker Lifecycle', () => {
    it('should handle shutdown message', async () => {
      const terminateSpy = jest.spyOn(worker, 'terminate');
      
      worker.postMessage({
        type: 'shutdown'
      });

      // Give time for async processing
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(terminateSpy).toHaveBeenCalled();
    });

    it('should not process messages after termination', () => {
      worker.terminate();

      expect(() => {
        worker.postMessage({
          type: 'logs',
          entries: []
        });
      }).toThrow('Worker has been closed');
    });

    it('should clean up event listeners on termination', () => {
      const listener = jest.fn();
      worker.addEventListener('message', listener);
      
      worker.terminate();
      
      // Attempt to trigger event after termination
      expect(() => {
        worker.postMessage({ type: 'test' });
      }).toThrow();
    });
  });

  describe('Performance Metrics', () => {
    it('should track processing time metrics', async () => {
      const entries: LogEntry[] = Array.from({ length: 100 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: `Message ${i}`,
        plainMessage: `Message ${i}`,
        tags: ['perf-test'],
        context: { type: 'performance' },
        metadata: { index: i }
      }));

      const metricsPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'processed') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries
      });

      await metricsPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'processed'
      );
      expect(lastMessage).toBeDefined();
      const { metrics } = lastMessage[0].data;
      expect(metrics.avgProcessingTime).toBeGreaterThan(0);
      expect(metrics.avgProcessingTime).toBeLessThan(100);
    });
  });

  describe('Format Processing', () => {
    beforeEach(async () => {
      // Configure worker for different format types
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'config-updated') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);

        worker.postMessage({
          type: 'config',
          config: {
            formatType: 'json',
            destination: 'console'
          }
        });
      });
    });

    it('should process logs with JSON format', async () => {
      const entries: LogEntry[] = [{
        id: 'test-1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'JSON format test',
        plainMessage: 'JSON format test',
        metadata: { format: 'json' }
      }];

      const processedPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'processed') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries
      });

      await processedPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'processed'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.count).toBe(1);
    });

    it('should handle file destination preparation', async () => {
      // First update config for file destination
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'config-updated') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);

        worker.postMessage({
          type: 'config',
          config: {
            formatType: 'text',
            destination: 'file'
          }
        });
      });

      // Then send logs
      const entries: LogEntry[] = [{
        id: 'file-1',
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: 'File destination test',
        plainMessage: 'File destination test'
      }];

      const fileReadyPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'file-ready') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries
      });

      await fileReadyPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'file-ready'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.data).toBeTruthy();
    });

    it('should handle network destination batching', async () => {
      // Configure for network destination
      await new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'config-updated') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);

        worker.postMessage({
          type: 'config',
          config: {
            formatType: 'json',
            destination: 'network',
            endpoint: 'https://logs.example.com',
            batchSize: 10
          }
        });
      });

      const entries: LogEntry[] = Array.from({ length: 5 }, (_, i) => ({
        id: `net-${i}`,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        level: 'info',
        message: `Network message ${i}`,
        plainMessage: `Network message ${i}`
      }));

      const networkReadyPromise = new Promise<void>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'network-ready') {
            worker.removeEventListener('message', handler);
            resolve();
          }
        };
        worker.addEventListener('message', handler);
      });

      worker.postMessage({
        type: 'logs',
        entries
      });

      await networkReadyPromise;

      const lastMessage = onMessage.mock.calls.find(
        call => call[0].data.type === 'network-ready'
      );
      expect(lastMessage).toBeDefined();
      expect(lastMessage[0].data.batch).toBeTruthy();
      expect(lastMessage[0].data.batch.endpoint).toBe('https://logs.example.com');
      expect(lastMessage[0].data.batch.count).toBe(5);
    });
  });
});

/**
 * Integration tests for worker with actual log processing
 */
describe('LogProcessorWorker Integration', () => {
  let worker: Worker;

  beforeEach(() => {
    worker = new Worker('log-processor.worker.ts');
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should handle rapid message sequences', async () => {
    let processedCount = 0;
    const expectedBatches = 10;

    await new Promise<void>((resolve) => {
      worker.addEventListener('message', (event: MessageEvent) => {
        if (event.data.type === 'processed') {
          processedCount++;
          if (processedCount === expectedBatches) {
            resolve();
          }
        }
      });

      // Send multiple batches rapidly
      for (let i = 0; i < expectedBatches; i++) {
        worker.postMessage({
          type: 'logs',
          entries: [{
            id: `rapid-${i}`,
            timestamp: new Date().toISOString(),
            timestampMs: Date.now(),
            level: 'info',
            message: `Rapid message ${i}`,
            plainMessage: `Rapid message ${i}`
          }]
        });
      }
    });

    expect(processedCount).toBe(expectedBatches);
  });

  it('should handle config changes during processing', async () => {
    let configUpdates = 0;
    let logsProcessed = 0;

    await new Promise<void>((resolve) => {
      worker.addEventListener('message', (event: MessageEvent) => {
        if (event.data.type === 'config-updated') {
          configUpdates++;
        } else if (event.data.type === 'processed') {
          logsProcessed++;
        }
        
        if (configUpdates >= 2 && logsProcessed >= 2) {
          resolve();
        }
      });

      // Interleave config updates and log processing
      worker.postMessage({
        type: 'config',
        config: { batchSize: 50 }
      });

      worker.postMessage({
        type: 'logs',
        entries: [{ 
          id: 'log-1',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'First log',
          plainMessage: 'First log'
        }]
      });

      worker.postMessage({
        type: 'config',
        config: { batchSize: 100 }
      });

      worker.postMessage({
        type: 'logs',
        entries: [{
          id: 'log-2',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'Second log',
          plainMessage: 'Second log'
        }]
      });
    });

    expect(configUpdates).toBeGreaterThanOrEqual(2);
    expect(logsProcessed).toBeGreaterThanOrEqual(2);
  });
});