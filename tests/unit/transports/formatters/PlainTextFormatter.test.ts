// File: tests/unit/transports/formatters/PlainTextFormatter.test.ts
import {
  PlainTextFormatter,
  PlainTextFormatters,
} from '../../../../src/transports/formatters/PlainTextFormatter';
import type { LogEntry } from '../../../../src/types/transport';

type Entry = LogEntry;

const mkEntry = (extra: Partial<Entry> = {}): Entry => ({
  id: 'e1',
  timestamp: Date.now(),
  level: 'info',
  message: 'Test msg',
  metadata: { meta: 'x' },
  context: { user: 'bob', method: 'GET', path: '/x', status: 200, duration: 42 },
  tags: ['tag1', 'tag2'],
  ...extra,
});

describe('PlainTextFormatter', () => {
  it('default formatting includes level and message', () => {
    const f = new PlainTextFormatter({ includeStack: false });
    const line = f.format(mkEntry());
    expect(line).toContain('INFO');
    expect(line).toContain('Test msg');
  });

  it('template formatting works', () => {
    const f = new PlainTextFormatter({
      template: '[{timestamp}] {level} {message}',
      includeStack: false,
    });
    const line = f.format(mkEntry());
    expect(line).toMatch(/\[.*\] INFO Test msg/);
  });

  it('respects maxLineLength (applies to main line only)', () => {
    const f = new PlainTextFormatter({
      maxLineLength: 10,
      truncationIndicator: '...',
      includeContext: false,
      includeMetadata: false,
      includeStack: false,
    });
    const line = f.format(mkEntry({ message: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', context: undefined }));
    expect(line.endsWith('...')).toBe(true);
    expect(line.length).toBe(10); // truncated length
  });

  it('includes stack and error details', () => {
    const err = new Error('boom');
    (err as Error & { stack: string }).stack = 'Error: boom\n at line';
    const errorShape: NonNullable<Entry['error']> = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: 'EFAIL',
    };
    const f = new PlainTextFormatter({
      includeStack: true,
      includeContext: false,
      includeMetadata: false,
    });
    const out = f.format(mkEntry({ error: errorShape, context: undefined }));
    expect(out).toContain('Error: boom');
    expect(out).toContain('Stack:');
    expect(out).toContain('Details:'); // extra property captured
  });

  it('batch formatting joins lines (single-line entries)', () => {
    const f = new PlainTextFormatter({
      includeStack: false,
      includeContext: false,
      includeMetadata: false,
    });
    const out = f.formatBatch([
      mkEntry({ context: undefined, metadata: undefined }),
      mkEntry({ context: undefined, metadata: undefined }),
    ]);
    const lines = out.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).not.toContain('Context:');
  });

  it('presets create instances', () => {
    expect(PlainTextFormatters.simple()).toBeInstanceOf(PlainTextFormatter);
    expect(PlainTextFormatters.detailed()).toBeInstanceOf(PlainTextFormatter);
    expect(PlainTextFormatters.syslog()).toBeInstanceOf(PlainTextFormatter);
    expect(PlainTextFormatters.apache()).toBeInstanceOf(PlainTextFormatter);
    expect(PlainTextFormatters.minimal()).toBeInstanceOf(PlainTextFormatter);
  });
});
