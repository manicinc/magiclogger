import { createInitialState, formatEntries, prepareFileData, batchForNetwork, processLogs, updateConfig, type WorkerConfig } from '../../../../src/async/workers/log-processor-core';
import type { LogEntry } from '../../../../src/types/transport';

function makeEntries(n = 3): LogEntry[] {
  return Array.from({ length: n }).map((_, i) => {
    const ts = 1700000000000 + i;
    return {
      id: `id-${i}`,
      timestamp: new Date(ts).toISOString(),
      timestampMs: ts,
      level: 'info',
      message: `m${i}`,
      metadata: { idx: i },
      tags: i % 2 ? ['a', 'b'] : undefined,
    } as LogEntry;
  });
}

describe('log-processor-core', () => {
  it('formats entries as json objects', () => {
    const state = createInitialState();
    state.config.formatType = 'json';
    const entries = makeEntries();
    const out = formatEntries(entries, state.config);
    expect(Array.isArray(out)).toBe(true);
    expect((out as Record<string, unknown>[])[0].message).toBe('m0');
  });

  it('formats entries as text lines', () => {
    const state = createInitialState();
    state.config.formatType = 'text';
    const entries = makeEntries(2);
    const out = formatEntries(entries, state.config) as string;
    expect(out.split('\n')).toHaveLength(2);
    expect(out).toContain('m0');
  });

  it('returns original entries for custom format', () => {
    const state = createInitialState();
    state.config.formatType = 'custom';
    const entries = makeEntries(1);
    const out = formatEntries(entries, state.config) as LogEntry[];
    expect(out[0].message).toBe('m0');
  });

  it('prepares file data from object array', () => {
    const arr = [{ a: 1 }];
    const str = prepareFileData(arr);
    expect(str).toContain('"a"');
  });

  it('creates network batch', () => {
    const batch = batchForNetwork([{ a: 1 }], 'https://example.com');
    expect(batch.endpoint).toBe('https://example.com');
    expect(batch.count).toBe(1);
  });

  it('processes logs for file destination and returns file data', () => {
    const state = createInitialState();
    state.config.destination = 'file';
    const res = processLogs(state, makeEntries(2));
    expect(res.fileData).toBeDefined();
    expect(res.metrics.processed).toBe(2);
  });

  it('processes logs for network destination and returns batch', () => {
    const state = createInitialState();
    state.config.destination = 'network';
    state.config.endpoint = 'https://x';
    const res = processLogs(state, makeEntries(3));
    expect(res.batch).toBeDefined();
    expect(res.batch?.count).toBe(3);
  });

  it('updates config immutably', () => {
    const original: WorkerConfig = { formatType: 'json', destination: 'console' };
    const updated = updateConfig(original, { destination: 'file', batchSize: 10 });
    expect(updated.destination).toBe('file');
    expect(original.destination).toBe('console');
  });
});

describe('worker wrapper handleWorkerMessage', () => {
  interface PostedMessage { type: string; [k: string]: unknown }
  const posted: PostedMessage[] = [];
  const originalSelf = (globalThis as unknown as { self?: unknown }).self as unknown;
  type WorkerMessage = { type: string; entries?: LogEntry[]; config?: WorkerConfig };
  let handleWorkerMessage: (msg: WorkerMessage) => void;
  beforeAll(async () => {
    (globalThis as unknown as { self: any }).self = { // eslint-disable-line @typescript-eslint/no-explicit-any
      postMessage: (msg: PostedMessage) => { posted.push(msg); },
      addEventListener: (_t: string, _l: unknown) => { return; },
      close: () => { return; },
    };
    const mod = await import('../../../../src/async/workers/log-processor.worker');
    handleWorkerMessage = mod.handleWorkerMessage;
  });
  afterAll(() => {
    (globalThis as unknown as { self: unknown }).self = originalSelf;
  });
  it('handles config then logs then shutdown', () => {
    handleWorkerMessage({ type: 'config', config: { destination: 'network', endpoint: 'https://e' } });
    handleWorkerMessage({ type: 'logs', entries: makeEntries(1) });
    handleWorkerMessage({ type: 'shutdown' });
    expect(posted.some(m => m.type === 'processed')).toBe(true);
  });
});
