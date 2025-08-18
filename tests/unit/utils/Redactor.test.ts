// File: tests/unit/utils/Redactor.test.ts

import { Redactor } from '../../../src/utils/Redactor';

describe('Redactor', () => {
  it('masks emails and credit cards with standard preset', () => {
    const r = new Redactor({ preset: 'standard' });
    const input = 'Contact me at john.doe@example.com and CC 4111-1111-1111-1111';
    const out = r.redact(input) as string;
    expect(out).not.toContain('john.doe@example.com');
    expect(out).toMatch(/\*+@example\.com/);
    expect(out).toMatch(/\*{4}-\*{4}-\*{4}-1111/);
  });

  it('redacts deep object fields', () => {
    const r = new Redactor({ preset: 'strict' });
    const obj = {
      user: { email: 'a@b.com' },
      payment: { card: '4242 4242 4242 4242' },
      nested: [{ phone: '+1 (555) 123-4567' }],
    };
    const out = r.redact(obj) as unknown as {
      user: { email: string };
      payment: { card: string };
      nested: Array<{ phone: string }>;
    };
    expect(out.user.email).not.toBe('a@b.com');
    expect(String(out.payment.card)).toContain('****');
    expect(String(out.nested[0].phone)).toContain('***');
  });
});
