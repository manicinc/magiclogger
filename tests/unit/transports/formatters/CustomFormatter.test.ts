// File: tests/unit/transports/formatters/CustomFormatter.test.ts
import { CustomFormatter as BaseCustomFormatter, XMLFormatter as IndexXMLFormatter, CSVFormatter as IndexCSVFormatter, FunctionFormatter } from '../../../../src/transports/formatters/index';
import type { LogEntry } from '../../../../src/types/transport';

const entry: LogEntry = {
  id: '1',
  timestamp: new Date('2024-01-01T00:00:00Z').toISOString(),
  timestampMs: Date.now(),
  level: 'info',
  message: 'Hello',
  metadata: { k: 'v' },
  context: { a: 1 },
  tags: ['x'],
};

class UpperFormatter extends BaseCustomFormatter {
  format(e: LogEntry): string { return e.message.toUpperCase(); }
}

describe('CustomFormatter (index exports)', () => {
  it('allows subclass overriding format', () => {
    const f = new UpperFormatter();
    expect(f.format(entry)).toBe('HELLO');
  });

  it('formatBatch joins lines from base implementation', () => {
    const f = new UpperFormatter();
    const out = f.formatBatch([entry, entry]) as string;
    expect(out.split('\n')).toHaveLength(2);
  });

  it('XMLFormatter outputs xml', () => {
    const xf = new IndexXMLFormatter();
    const xml = xf.format(entry);
    expect(xml).toContain('<log');
    expect(xml).toContain('<message>');
  });

  it('CSVFormatter outputs csv rows via formatBatch', () => {
    const cf = new IndexCSVFormatter();
    const csv = cf.formatBatch([entry]);
    expect(csv).toContain('timestamp'); // header line
    expect(csv.trim().split('\n')[1].split(',').length).toBeGreaterThan(3);
  });

  it('FunctionFormatter formats via provided function', () => {
    const ff = new FunctionFormatter(e => `${e.level}:${e.message}`);
    expect(ff.format(entry)).toBe('info:Hello');
  });
});
