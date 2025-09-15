// File: tests/unit/transports/formatters/JSONFormatter.test.ts
import { JSONFormatter, JSONFormatters } from '../../../../src/transports/formatters/JSONFormatter';
import type { LogEntry } from '../../../../src/types/transport';

const makeEntry = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: '1',
  timestamp: 1704067200000,
  level: 'info',
  message: 'hello',
  context: { a: { b: { c: 1 } } },
  metadata: { pid: 123 },
  tags: ['a'],
  ...over,
});

describe('JSONFormatter', () => {
  it('formats single entry compact', () => {
    const f = new JSONFormatter({ includeSchema: false });
    const out = f.format(makeEntry());
    expect(out).toContain('"message":"hello"');
  });

  it('includeFields and excludeFields precedence', () => {
    const f = new JSONFormatter({
      includeFields: ['timestamp', 'level', 'message', 'context'],
      excludeFields: ['context'],
      includeSchema: false,
    });
    const out = JSON.parse(f.format(makeEntry()));
    expect(out).toHaveProperty('timestamp');
    expect(out).not.toHaveProperty('context');
  });

  it('flattens nested objects with depth limit', () => {
    const f = new JSONFormatter({ flatten: true, maxFlattenDepth: 2, includeSchema: false });
    const out = JSON.parse(f.format(makeEntry()));
    expect(out['context.a.b']).toBeDefined();
  });

  it('formatBatch produces array', () => {
    const f = new JSONFormatter({ includeSchema: false });
    const out = JSON.parse(f.formatBatch([makeEntry(), makeEntry({ id: '2' })]));
    expect(out).toHaveLength(2);
  });

  it('formatNDJSON produces two lines', () => {
    const f = new JSONFormatter({ includeSchema: false });
    const nd = f.formatNDJSON([makeEntry(), makeEntry({ id: '2' })]);
    expect(nd.trim().split('\n')).toHaveLength(2);
  });

  it('replacer handles Error', () => {
    const f = new JSONFormatter({ includeSchema: false });
    const err = new Error('boom');
    const serial = f.createReplacer()('error', err);
    expect(serial).toHaveProperty('message', 'boom');
  });

  it('stream formatter appends newline', () => {
    const f = new JSONFormatter({ includeSchema: false });
    const line = f.getStreamFormatter()(makeEntry());
    expect(line.endsWith('\n')).toBe(true);
  });

  it('presets instantiate', () => {
    expect(JSONFormatters.compact()).toBeInstanceOf(JSONFormatter);
    expect(JSONFormatters.pretty()).toBeInstanceOf(JSONFormatter);
    expect(JSONFormatters.flat()).toBeInstanceOf(JSONFormatter);
    expect(JSONFormatters.minimal()).toBeInstanceOf(JSONFormatter);
    expect(JSONFormatters.extended()).toBeInstanceOf(JSONFormatter);
  });
});
