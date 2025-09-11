/**
 * @fileoverview Tests for AsyncLoggerWorker (clean version)
 */
import type { LogEntry } from '../../../src/types/transport';

// Helper to build log entries satisfying LogEntry
const buildEntries = (n: number): LogEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    level: 'info',
    message: `msg-${i}`,
  }));

describe('AsyncLoggerWorker core behavior', () => {
  let consoleErrorSpy: jest.SpyInstance | undefined;
  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
      consoleErrorSpy = undefined;
    }
    // Run all pending timers then restore
    try {
      jest.runOnlyPendingTimers();
    } catch {
      /* ignore */
    }
    jest.useRealTimers();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('exits when not provided worker context', async () => {
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as unknown as (code?: number) => never);
    const errSpy = jest.spyOn(console, 'error').mockImplementation((): void => {
      /* noop */
    });
    jest.doMock('node:worker_threads', () => ({ parentPort: null, workerData: undefined }));
    await import('../../../src/async/AsyncLoggerWorker');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errSpy).toHaveBeenCalledWith('AsyncLoggerWorker must be run as a worker thread');
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  describe('WorkerState simulated', () => {
    let postMessage: jest.Mock;
    interface WorkerStateLike {
      processBatch(entries: LogEntry[]): void;
      flush(): void;
      shutdown(): void;
      getStats(): { processed: number; bufferSize: number; batches: number; errors: number };
    }
    let exported: {
      WorkerState: new (cfg: {
        workerId: number;
        batchSize?: number;
        flushInterval?: number;
        enableCompression?: boolean;
      }) => WorkerStateLike;
    };

    const mockWorkerEnv = () => {
      jest.doMock('node:worker_threads', () => ({
        parentPort: {
          postMessage: (...args: unknown[]) => {
            postMessage(...args);
          },
          on: (_event: string, _handler: (m: unknown) => void) => {
            /* capture not needed */
          },
        },
        workerData: { workerId: 1 },
      }));
    };

    beforeEach(async () => {
      postMessage = jest.fn();
      mockWorkerEnv();
      exported = await import('../../../src/async/AsyncLoggerWorker');
    });

    it('signals READY on construct', () => {
      expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'READY' }));
    });

    it('buffers then flushes when batchSize reached', () => {
      const { WorkerState } = exported;
      postMessage.mockClear();
      const state = new WorkerState({ workerId: 2, batchSize: 3, flushInterval: 1_000 });
      state.processBatch(buildEntries(2));
      expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'ACK' }));
      state.processBatch(buildEntries(1)); // triggers flush
      const stats = state.getStats();
      expect(stats.processed).toBe(3);
      expect(stats.bufferSize).toBe(0);
    });

    it('periodic flush runs on interval', () => {
      jest.useFakeTimers();
      const { WorkerState } = exported;
      const state = new WorkerState({ workerId: 3, batchSize: 50, flushInterval: 10 });
      state.processBatch(buildEntries(5));
      // Not yet flushed
      expect(state.getStats().processed).toBe(0);
      jest.advanceTimersByTime(15);
      expect(state.getStats().processed).toBe(5);
    });

    it('sends METRICS every 10 batches', () => {
      const { WorkerState } = exported;
      postMessage.mockClear();
      const state = new WorkerState({ workerId: 4, batchSize: 1, flushInterval: 0 });
      for (let i = 0; i < 10; i++) state.processBatch(buildEntries(1));
      const metricsMsg = postMessage.mock.calls.find(c => c[0].type === 'METRICS');
      expect(metricsMsg).toBeTruthy();
    });

    it('records errors from serialization failure', () => {
      const { WorkerState } = exported;
      interface Circular {
        a: number;
        self?: Circular;
      }
      const circular: Circular = { a: 1 };
      circular.self = circular;
      // flushInterval 0 so no periodic timer triggers after test end
      const state = new WorkerState({ workerId: 5, batchSize: 10, flushInterval: 0 });
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (state as unknown as { buffer: LogEntry[] }).buffer = [
        {
          id: 'x',
          timestamp: new Date().toISOString(),
          timestampMs: Date.now(),
          level: 'info',
          message: 'c',
          context: { circular },
        },
      ];
      state.flush();
      expect(state.getStats().errors).toBeGreaterThanOrEqual(1);
    });

    it('shutdown performs final flush and metrics', () => {
      const { WorkerState } = exported;
      postMessage.mockClear();
      const state = new WorkerState({ workerId: 6, batchSize: 100, flushInterval: 5_000 });
      state.processBatch(buildEntries(2));
      state.shutdown();
      const types = postMessage.mock.calls.map(c => c[0].type);
      expect(types).toContain('METRICS');
    });
  });
});
