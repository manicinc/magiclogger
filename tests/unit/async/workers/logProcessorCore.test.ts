// Updated import to new kebab-case file name
import {
  createInitialState,
  formatEntries,
  prepareFileData,
  batchForNetwork,
  processLogs,
  updateConfig,
  type WorkerConfig,
  type WorkerState,
} from '../../../../src/async/workers/log-processor-core';
import type { LogEntry } from '../../../../src/types/transport';

// Minimal stub of LogEntry fulfilling required fields for processor
type TestEntry = Pick<
  LogEntry,
  'timestamp' | 'timestampMs' | 'level' | 'message' | 'metadata' | 'tags' | 'context' | 'id'
>;

function makeEntries(n = 3): TestEntry[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: `id-${i}`,
    timestamp: new Date(1700000000000 + i).toISOString(),
    timestampMs: 1700000000000 + i,
    level: 'info',
    message: `m${i}`,
    metadata: { idx: i },
    tags: i % 2 ? ['a', 'b'] : undefined,
    context: i % 2 ? { comp: 'x' } : undefined,
  }));
}

describe('logProcessorCore', () => {
  it('formats entries as json objects', () => {
    const state = createInitialState();
    state.config.formatType = 'json';
    const entries = makeEntries();
    const out = formatEntries(entries, state.config);
    expect(Array.isArray(out)).toBe(true);
    expect((out as { message: string }[])[0].message).toBe('m0');
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
    const out = formatEntries(entries, state.config) as TestEntry[];
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
    const res = processLogs(state as WorkerState, makeEntries(2));
    expect(res.fileData).toBeDefined();
    expect(res.metrics.processed).toBe(2);
  });

  it('processes logs for network destination and returns batch', () => {
    const state = createInitialState();
    state.config.destination = 'network';
    state.config.endpoint = 'https://x';
    const res = processLogs(state as WorkerState, makeEntries(3));
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
  // Messages posted back by worker stub
  interface ProcessedMessage {
    type: string;
    [k: string]: unknown;
  }
  // Outbound messages to worker
  interface ConfigMessage {
    type: 'config';
    config: Partial<WorkerConfig>;
  }
  interface LogsMessage {
    type: 'logs';
    entries: TestEntry[];
  }
  interface ShutdownMessage {
    type: 'shutdown';
  }
  type WorkerMessage = ConfigMessage | LogsMessage | ShutdownMessage;

  const posted: ProcessedMessage[] = [];
  const originalSelf = (globalThis as { self?: unknown }).self;
  let handleWorkerMessage: (msg: WorkerMessage) => void;
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).self = {
      postMessage: (msg: ProcessedMessage) => {
        posted.push(msg);
      },
      addEventListener: () => {
        /* listener stub */ return undefined;
      },
      close: () => {
        /* close stub */ return undefined;
      },
    } as unknown;
    ({ handleWorkerMessage } = await import('../../../../src/async/workers/log-processor.worker'));
  });
  afterAll(() => {
    (globalThis as unknown as Record<string, unknown>).self = originalSelf as unknown;
  });
  it('handles config then logs then shutdown', () => {
    handleWorkerMessage({
      type: 'config',
      config: { destination: 'network', endpoint: 'https://e' },
    });
    handleWorkerMessage({ type: 'logs', entries: makeEntries(1) });
    handleWorkerMessage({ type: 'shutdown' });
    expect(posted.find(m => m.type === 'processed')).toBeTruthy();
  });
});
