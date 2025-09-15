// File: tests/unit/transports/formatters/indexFormatterExports.test.ts
// Purpose: Cover index.ts export logic for formatters (XMLFormatter, CSVFormatter via index path) and ensure formatBatch behavior.
import { CSVFormatter } from '../../../../src/transports/formatters';
import { XMLFormatter } from '../../../../src/transports/formatters/XMLFormatter';
import { CustomFormatter } from '../../../../src/transports/formatters/BaseFormatter';
import type { LogEntry } from '../../../../src/types/transport';

const entry: LogEntry = {
  id: 'idx1',
  timestamp: 1704067200000,
  level: 'info',
  message: 'Hi',
  metadata: { x: 1 },
  context: { y: 2 },
  tags: ['a'],
};

class PassFormatter extends CustomFormatter {
  format(e: LogEntry): string {
    return e.message;
  }
}

describe('formatters index exports', () => {
  it('XMLFormatter via index formats single and batch', () => {
    const xf = new XMLFormatter();
    const single = xf.format(entry);
    expect(single).toContain('<log');
    const batch = xf.formatBatch([entry, entry]);
    expect(batch.split('\n').some(l => l.includes('<logs>') || l.includes('</logs>'))).toBe(true);
  });

  it('CSVFormatter via index formats batch with header', () => {
    const cf = new CSVFormatter();
    const csv = cf.formatBatch([entry]);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toContain('timestamp');
    expect(lines).toHaveLength(2);
  });

  it('CustomFormatter base formatBatch joins with newline', () => {
    const pf = new PassFormatter();
    const out = pf.formatBatch([entry, entry]) as string;
    expect(out.trim().split('\n')).toHaveLength(2);
  });
});
