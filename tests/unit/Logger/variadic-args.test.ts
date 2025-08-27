import { FullLogger as Logger, meta, err } from '../../../src';

describe('Logger variadic args & meta wrappers', () => {
  let originalConsoleLog: Console['log'];
  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });
  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('keeps back-compat: (string, object) treats object as meta only (not printed)', () => {
    const logger = new Logger({ useColors: false });
    logger.info('Started', { requestId: 'r1' });
    expect(console.log).toHaveBeenCalled();
    const msg = (console.log as jest.Mock).mock.calls[0][0] as string;
    expect(msg).toContain('Started');
    expect(msg).not.toContain('requestId');
  });

  it('prints console-like variadic args', () => {
    const logger = new Logger({ useColors: false, prettyPrint: 'json' });
    logger.info('Data:', { a: 1, b: 2 }, [3, 4]);
    const msg = (console.log as jest.Mock).mock.calls.pop()?.[0] as string;
    expect(msg).toContain('Data:');
    expect(msg).toMatch(/\{\s*"a":\s*1,\s*"b":\s*2\s*\}/);
    expect(msg).toContain('[3, 4]');
  });

  it('does not print wrapped meta and attaches error as meta', () => {
    const logger = new Logger({ useColors: false });
    const e = new Error('boom');
    logger.error('Failed', err(e), meta({ requestId: 'r2' }));
    const msg = (console.log as jest.Mock).mock.calls.pop()?.[0] as string;
    expect(msg).toContain('Failed');
    expect(msg).not.toContain('boom');
  });

  it('treats trailing Error as meta.error (not printed)', () => {
    const logger = new Logger({ useColors: false });
    logger.error('Oops', new Error('kaboom'));
    const msg = (console.log as jest.Mock).mock.calls.pop()?.[0] as string;
    expect(msg).toContain('Oops');
    expect(msg).not.toContain('kaboom');
  });
});
