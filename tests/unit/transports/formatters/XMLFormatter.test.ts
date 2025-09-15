// File: tests/unit/transports/formatters/XMLFormatter.test.ts
import { XMLFormatter } from '../../../../src/transports/formatters/XMLFormatter';
import type { LogEntry } from '../../../../src/types/transport';

const baseEntry: LogEntry = {
  id: 'x1',
  timestamp: Date.now(),
  level: 'info',
  message: 'Hello <World>',
  context: { user: 'alice', nested: { a: 1 } },
  metadata: { meta: true },
  tags: ['t1'],
};

describe('XMLFormatter (standalone file)', () => {
  it('formats single entry with escaping', () => {
    const xf = new XMLFormatter();
    const xml = xf.format(baseEntry);
    expect(xml).toContain('<log');
    expect(xml).toContain('&lt;World&gt;');
    expect(xml).toContain('<context>');
  });

  it('formats batch with declaration and root', () => {
    const xf = new XMLFormatter();
    const doc = xf.formatBatch([baseEntry, { ...baseEntry, id: 'x2' }]);
    expect(doc.startsWith('<?xml')).toBe(true);
    expect(doc).toContain('<logs>');
    expect(doc.match(/<log /g)?.length).toBe(2);
  });
});
