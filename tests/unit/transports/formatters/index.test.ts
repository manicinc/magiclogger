// File: tests/unit/transports/formatters/index.test.ts
import { XMLFormatter, CSVFormatter, CustomFormatter } from '../../../../src/transports/formatters';
import type { LogEntry } from '../../../../src/types/transport';

const entry: LogEntry = {
  id: 'idx',
  timestamp: new Date('2024-01-01T00:00:00Z').toISOString(),
  timestampMs: Date.now(),
  level: 'info',
  message: 'Index test',
  metadata: { foo: 'bar' },
  context: { nested: { a: 1 } },
  tags: ['a', 'b'],
};

class LowerFormatter extends CustomFormatter {
  format(e: LogEntry) {
    return e.message.toLowerCase();
  }
}

describe('formatters/index exports', () => {
  it('XMLFormatter formats batch with declaration', () => {
    const xf = new XMLFormatter();
    const doc = xf.formatBatch([entry]);
    expect(doc).toContain('<logs>');
  });

  it('CSVFormatter includes headers', () => {
    const cf = new CSVFormatter();
    const csv = cf.formatBatch([entry]);
    expect(csv.split('\n')[0]).toContain('timestamp');
  });

  it('CustomFormatter subclass works', () => {
    const lf = new LowerFormatter();
    expect(lf.format(entry)).toBe('index test');
  });
});
