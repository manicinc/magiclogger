/**
 * @fileoverview Tests for FileWorkerTransport (worker-based file transport)
 * Covers initialization, buffering, auto-flush, explicit flush, close, and error handling.
 */

import { FileWorkerTransport } from '../../../../src/transports/worker/FileWorkerTransport';
import type { LogEntry } from '../../../../src/types/transport';
import { Worker } from 'worker_threads';

// Mock worker_threads so we don't spawn real workers
jest.mock('worker_threads', () => ({
  Worker: jest.fn(),
}));

interface MockWorker {
  postMessage: jest.Mock;
  on: jest.Mock;
  once: jest.Mock;
  terminate: jest.Mock<Promise<void>, []>;
}

describe('FileWorkerTransport', () => {
  let mockWorker: MockWorker;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorker = {
      postMessage: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      terminate: jest.fn().mockResolvedValue(undefined),
    } as unknown as MockWorker;
    (Worker as unknown as jest.Mock).mockImplementation(() => mockWorker);
  });

  function makeEntry(i = 0): LogEntry {
    return {
      id: `${i}`,
      timestamp: Date.now(),
      level: 'info',
      message: `Msg ${i}`,
    } as LogEntry;
  }

  it('initializes worker with provided path and options', () => {
    const transport = new FileWorkerTransport({ path: 'logs/app.log' });
    expect(transport.name).toBe('file-worker');
    expect(Worker).toHaveBeenCalled();
  });

  it('buffers entries until bufferSize reached', async () => {
    const transport = new FileWorkerTransport({
      path: 'logs/app.log',
      bufferSize: 2,
      flushInterval: 0,
    });
    await transport.log(makeEntry(1));
    expect(mockWorker.postMessage).not.toHaveBeenCalled();
    await transport.log(makeEntry(2));
    // Should auto flush batch of 2
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'WRITE_BATCH',
      entries: expect.any(Array),
    });
  });

  it('flush() sends current buffer and issues FLUSH message', async () => {
    const transport = new FileWorkerTransport({
      path: 'logs/app.log',
      bufferSize: 100,
      flushInterval: 0,
    });
    await transport.log(makeEntry(1));
    await transport.flush();
    expect(mockWorker.postMessage).toHaveBeenNthCalledWith(1, {
      type: 'WRITE_BATCH',
      entries: expect.any(Array),
    });
    expect(mockWorker.postMessage).toHaveBeenNthCalledWith(2, { type: 'FLUSH' });
  });

  it('close() flushes and sends SHUTDOWN', async () => {
    const transport = new FileWorkerTransport({
      path: 'logs/app.log',
      bufferSize: 10,
      flushInterval: 0,
    });
    await transport.log(makeEntry(1));
    // Simulate exit event immediately when registered via once
    (mockWorker.once as jest.Mock).mockImplementation((event: string, handler: () => void) => {
      if (event === 'exit') {
        // call on next tick to simulate async
        setImmediate(handler);
      }
      return mockWorker;
    });
    await transport.close();
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'WRITE_BATCH',
      entries: expect.any(Array),
    });
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'FLUSH' });
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'SHUTDOWN' });
  });

  it('handles worker error and exit events', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      return undefined;
    });
    new FileWorkerTransport({ path: 'logs/app.log', flushInterval: 0 });
    // Simulate error handler registration call
    type HandlerCall = [event: string, handler: (...args: unknown[]) => unknown];
    const calls = mockWorker.on.mock.calls as unknown as HandlerCall[];
    const errorHandler = calls.find((c: HandlerCall) => c[0] === 'error')?.[1];
    const exitHandler = calls.find((c: HandlerCall) => c[0] === 'exit')?.[1];
    errorHandler?.(new Error('boom'));
    exitHandler?.(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('does nothing on flush when no worker / empty buffer', async () => {
    const transport = new FileWorkerTransport({ path: 'logs/app.log', flushInterval: 0 });
    // Simulate worker died
    // @ts-expect-error intentional test of missing worker
    (transport as { worker: unknown | null }).worker = null;
    await transport.flush();
    expect(mockWorker.postMessage).not.toHaveBeenCalled();
  });

  it('does not create flush timer when flushInterval=0', () => {
    const transport = new FileWorkerTransport({ path: 'logs/app.log', flushInterval: 0 });
    // Access private via cast for test purposes
    const internal = transport as unknown as { flushTimer?: NodeJS.Timeout | null };
    expect(internal.flushTimer).toBeFalsy();
  });
});
