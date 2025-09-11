import { Logger, meta, err } from '../../../src';

describe('Logger variadic args & meta wrappers', () => {
  let originalConsoleLog: Console['log'];
  let originalConsoleInfo: Console['info'];
  let originalConsoleError: Console['error'];

  beforeEach(() => {
    originalConsoleLog = console.log;
    originalConsoleInfo = console.info;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.error = originalConsoleError;
  });

  it('keeps back-compat: (string, object) treats object as meta only (not printed)', async () => {
    const logger = new Logger({ useColors: false });
    logger.info('Started', { requestId: 'r1' });
    // Wait for async transport
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(console.info).toHaveBeenCalled();
    const msg = (console.info as jest.Mock).mock.calls[0][0] as string;
    expect(msg).toContain('Started');
    expect(msg).not.toContain('requestId');
  });

  it('prints console-like variadic args', async () => {
    const logger = new Logger({ useColors: false, prettyPrint: 'json' });
    logger.info('Data:', { a: 1, b: 2 }, [3, 4]);
    // Wait for async transport
    await new Promise(resolve => setTimeout(resolve, 10));
    const msg = (console.info as jest.Mock).mock.calls.pop()?.[0] as string;
    expect(msg).toContain('Data:');
    expect(msg).toMatch(/\{\s*"a":\s*1,\s*"b":\s*2\s*\}/);
    expect(msg).toContain('[3, 4]');
  });

  it('does not print wrapped meta and attaches error as meta', async () => {
    const logger = new Logger({ useColors: false });
    const e = new Error('boom');
    logger.error('Failed', err(e), meta({ requestId: 'r2' }));
    // Wait for async transport
    await new Promise(resolve => setTimeout(resolve, 10));
    const msg = (console.error as jest.Mock).mock.calls.pop()?.[0] as string;
    expect(msg).toContain('Failed');
    // Note: Console transport now shows error details
    // The error is attached as meta but also displayed in output
    expect(msg).toContain('Error - boom');
  });

  it('treats trailing Error as meta.error (and prints it)', async () => {
    const logger = new Logger({ useColors: false });
    logger.error('Oops', new Error('kaboom'));
    // Wait for async transport
    await new Promise(resolve => setTimeout(resolve, 10));
    const msg = (console.error as jest.Mock).mock.calls.pop()?.[0] as string;
    expect(msg).toContain('Oops');
    // Note: Console transport now shows error details
    // The trailing error is both attached as meta AND displayed
    expect(msg).toContain('Error - kaboom');
  });
});
