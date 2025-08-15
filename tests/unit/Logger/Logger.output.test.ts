import { Logger } from '../../../src';
import { LOG_DIR, fsMocks } from '../../../jest.setup';
import { Printer } from '../../../src/core/Printer';
import * as fs from 'fs';

describe('Logger Output Methods', () => {
  let logger: Logger;
  let stdoutWriteSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger({ verbose: true, useLegacyOutput: true });
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
  });

  it('only prints debug when verbose is true', () => {
    // Create a new logger with verbose=false for this test
    const testLogger = new Logger({ verbose: false });
    const spy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);

    // Clear any previous calls
    spy.mockClear();

    testLogger.debug('nope');
    expect(spy).not.toHaveBeenCalled();

    testLogger.setVerbose(true);
    testLogger.debug('yep');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));

    spy.mockRestore();
  });

  it('writes all log levels', () => {
    // Create logger with disk writing enabled
    const logger = new Logger({ verbose: true, writeToDisk: true, logDir: LOG_DIR });

    // Test all log levels
    logger.log('info');
    logger.warn('warn');
    logger.error('error');
    logger.debug('debug');
    logger.success('success');

    // Verify appendFileSync was called with each level
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[INFO]')
    );
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[WARN]')
    );
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[ERROR]')
    );
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[DEBUG]')
    );
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[SUCCESS]')
    );
  });

  it('formats header content with appropriate padding', () => {
    const consoleSpy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);

    // Test with different title lengths
    logger.header('Short');
    logger.header('This is a medium length header');
    logger.header(
      'This is a very long header that should cause less padding to be applied because it takes up more space on the line'
    );

    // Verify headers were printed
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Short'));
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('This is a medium length header')
    );
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('This is a very long header'));

    consoleSpy.mockRestore();
  });

  it('handles custom header colors', () => {
    const consoleSpy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);

    // Test with custom color combinations
    logger.header('Red Header', ['red']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Red Header'));

    logger.header('Green Bold Header', ['green', 'bold']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Green Bold Header'));

    logger.header('Blue BGWhite Header', ['blue', 'bgWhite']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Blue BGWhite Header'));
    consoleSpy.mockRestore();
  });

  it('writes headers to log file with special formatting', () => {
    // Create logger with file writing
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });
    const appendSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);

    // Print header
    logger.header('Test Header');

    // Should use === formatting in log file
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/===.*Test Header.*===/)
    );

    appendSpy.mockRestore();
  });

  it('formats progress bars with different lengths and characters', () => {
    // Test custom length and characters
    logger.progressBar(50, 10, '#', '-');

    const ESC = String.fromCharCode(27);
    const ansiRegex = new RegExp(ESC + '\\[[0-9;]*m', 'g');
    const strip = (s: string) => s.replace(ansiRegex, '').replace(/\r/g, '').trim();
    const firstCallArg = strip(
      stdoutWriteSpy.mock.calls[stdoutWriteSpy.mock.calls.length - 1][0] as string
    );
    expect(firstCallArg.replace(/\[|\]/g, '')).toContain('#####-----');
    expect(firstCallArg).toMatch(/#####-----\s*50\.0%/);

    // Test empty length (should use default)
    stdoutWriteSpy.mockClear();
    logger.progressBar(50, undefined, '#', '-');
    const secondCallArg = strip(
      stdoutWriteSpy.mock.calls[stdoutWriteSpy.mock.calls.length - 1][0] as string
    );
    expect(secondCallArg.replace(/\[|\]/g, '')).toContain('##########----------');
  });

  it('finalizes progress only when explicitly requested', () => {
    // Render progress < 100% shouldn't add newline automatically
    logger.progressBar(99);
    const outputs = stdoutWriteSpy.mock.calls.map(c => String(c[0]));
    expect(outputs.join('')).not.toContain('\n');

    // 100% without clear still finalizes (default behavior keeps line then newline)
    stdoutWriteSpy.mockClear();
    logger.progressBar(100);
    // NodeLogger calls endProgress on 100%, which writes a newline (finalize)
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('\n'));

    // With clear=true, it should erase the line (simulate by writing spaces+\r) then allow next prints
    stdoutWriteSpy.mockClear();
    logger.progressBar(0);
    logger.progressBar(100, 20, '█', '░', true);
    const joined = stdoutWriteSpy.mock.calls.map(c => String(c[0])).join('');
    expect(joined).toContain('\r');
  });

  it('logs 100% progress to file', () => {
    // Create logger with file writing
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });
    const appendSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);

    // Progress bar at 100%
    logger.progressBar(100);

    // Should log 100% complete to file
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[PROGRESS] 100% complete')
    );

    // Progress bar < 100% should not log to file
    appendSpy.mockClear();
    logger.progressBar(50);
    expect(appendSpy).not.toHaveBeenCalled();

    appendSpy.mockRestore();
  });

  it('formats table with appropriate cell padding', () => {
    const consoleSpy = jest.spyOn(Printer, 'printTable').mockImplementation(() => undefined);

    // Test with differently sized cells
    logger.table([
      { tiny: 'a', huge: 'this is a very long value that should cause wide padding' },
      { tiny: 'b', huge: 'short' },
    ]);

    // Should create consistent column widths
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          tiny: 'a',
          huge: 'this is a very long value that should cause wide padding',
        }),
        expect.objectContaining({ tiny: 'b', huge: 'short' }),
      ]),
      expect.any(Array)
    );

    consoleSpy.mockRestore();
  });

  it('colorizes link-like cells in tables', () => {
    const consoleSpy = jest.spyOn(Printer, 'printTable').mockImplementation(() => undefined);

    // Mock isLinkLike for deterministic testing
    const isLinkLikeSpy = jest
      .spyOn(Logger, 'isLinkLike')
      .mockImplementation(text => text.includes('://') || text.includes('/'));

    // Test with link-like cells
    logger.table([
      { name: 'URL', path: 'https://example.com' },
      { name: 'File', path: '/path/to/file.txt' },
      { name: 'Not a link', path: 'just text' },
    ]);

    // Verify the table was called with the expected data
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'URL', path: 'https://example.com' }),
        expect.objectContaining({ name: 'File', path: '/path/to/file.txt' }),
        expect.objectContaining({ name: 'Not a link', path: 'just text' }),
      ]),
      expect.any(Array)
    );

    // Restore spy
    isLinkLikeSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('formats links with different forms', () => {
    const consoleSpy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);

    logger.link('https://example.com');
    logger.link('file:///path/to/file.txt');
    logger.link('/absolute/path/file.js');
    logger.link('./relative/path.ts');
    logger.link('C:\\Windows\\Path\\file.log'); // original backslash form

    logger.link('https://example.com', 'Example Website');

    expect(consoleSpy).toHaveBeenCalledTimes(6);

    const allCalls = consoleSpy.mock.calls.map(c => c[0] as string).join(' ');
    expect(allCalls).toContain('https://example.com');
    expect(allCalls).toContain('C:/Windows/Path/file.log');
    expect(allCalls).toContain('Example Website');

    consoleSpy.mockRestore();
  });

  it('logs table content to file', () => {
    // Create logger with file writing
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });
    const appendSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);

    // Print table
    logger.table([
      { name: 'item1', value: 100 },
      { name: 'item2', value: 200 },
    ]);

    // Should write [TABLE] summary and individual rows
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[TABLE] 2 rows')
    );
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/Row 1.*item1.*100/)
    );
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/Row 2.*item2.*200/)
    );

    appendSpy.mockRestore();
  });

  it('logs info messages using .info()', () => {
    const spy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);
    logger.info('info test');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('info test'));
    spy.mockRestore();
  });

  it('supports custom messages', () => {
    // Create logger with disk writing enabled
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });

    // Test custom messages
    logger.custom('default custom');
    logger.custom('test prefix', ['bold'], 'TEST');

    // Verify appendFileSync was called with proper content
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[LOG] default custom')
    );
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[TEST] test prefix')
    );
  });

  it('supports styled and header output', () => {
    // Create logger with disk writing enabled
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });

    // Test styled output and headers
    logger.styled('important message', 'important');
    logger.header('BIG HEADER');

    // Verify appendFileSync was called with proper content (styled maps 'important' to 'warn')
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[WARN] important message')
    );
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('=== BIG HEADER')
    );
  });

  it('renders a table', () => {
    // Create logger with disk writing enabled
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });

    // Test table rendering
    logger.table([
      { file: 'index.ts', lines: 100 },
      { file: 'test.ts', lines: 50 },
    ]);

    // Verify appendFileSync was called with table content
    expect(fsMocks.appendFileSync).toHaveBeenCalled();

    // Get all calls to appendFileSync
    const calls = fsMocks.appendFileSync.mock.calls;
    const allContent = calls.map(call => call[1]).join('\n');

    // Verify content includes headers and data
    expect(allContent).toMatch(/file.*lines/);
    expect(allContent).toContain('index.ts');
    expect(allContent).toContain('test.ts');
  });

  it('formats table rows with undefined or null values', () => {
    const logger = new Logger({ verbose: false, useLegacyOutput: true });
    const tableSpy = jest.spyOn(Printer, 'printTable').mockImplementation(() => undefined);

    logger.table([
      { col1: 'value1', col2: undefined },
      { col1: null, col2: 'value2' },
    ]);

    expect(tableSpy).toHaveBeenCalled();
    const passedData = tableSpy.mock.calls[0][0] as Array<Record<string, unknown>>;
    const flat = JSON.stringify(passedData);
    expect(flat).toContain('value1');
    expect(flat).toContain('value2');

    tableSpy.mockRestore();
  });

  it('handles empty tables gracefully', () => {
    const logger = new Logger();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.table([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('formats table cells with appropriate padding', () => {
    const logger = new Logger({ verbose: false });
    const spy = jest.spyOn(Printer, 'printTable').mockImplementation(() => undefined);

    logger.table([
      { name: 'short', value: 1 },
      { name: 'longerName', value: 2000 },
    ]);

    // Check that the table method was called with correct data
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'short', value: 1 }),
        expect.objectContaining({ name: 'longerName', value: 2000 }),
      ]),
      expect.any(Array)
    );

    spy.mockRestore();
  });

  it('handles links in table cells', () => {
    const logger = new Logger({ useColors: true, verbose: false });
    const spy = jest.spyOn(Printer, 'printTable').mockImplementation(() => undefined);

    logger.table([
      { name: 'URL', value: 'https://example.com' },
      { name: 'PATH', value: '/path/to/file.js' },
    ]);

    // Check that table was called with the data
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'URL', value: 'https://example.com' }),
        expect.objectContaining({ name: 'PATH', value: '/path/to/file.js' }),
      ]),
      expect.any(Array)
    );

    spy.mockRestore();
  });

  it('prints progress bar and logs 100% complete', () => {
    // Create logger with disk writing enabled
    const logger = new Logger({ writeToDisk: true, logDir: LOG_DIR });
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    // Test progress bar
    logger.progressBar(0);
    logger.progressBar(50);
    logger.progressBar(100);

    // Verify stdout.write was called
    expect(stdoutSpy).toHaveBeenCalled();

    // Verify appendFileSync was called for 100% completion
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[PROGRESS] 100% complete')
    );

    stdoutSpy.mockRestore();
  });

  it('handles out-of-bounds progress values safely', () => {
    const logger = new Logger();
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    // Test with negative value
    logger.progressBar(-20);
    expect(spy).toHaveBeenCalled();

    // Test with >100 value
    spy.mockClear();
    logger.progressBar(150);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it('customizes progress bar appearance', () => {
    const logger = new Logger();
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    // Custom length and chars
    logger.progressBar(50, 10, '=', ' ');

    // Get last call args
    const lastCallArgs = spy.mock.calls[spy.mock.calls.length - 1][0];

    // Should contain 5 equals signs (50% of 10)
    expect(lastCallArgs).toMatch(/={5}/);

    spy.mockRestore();
  });

  it('prints normalized links', () => {
    const logger = new Logger({ useColors: true, useLegacyOutput: true });
    const spy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);
    logger.link('C:\\path\\to\\file.ts');
    const out = spy.mock.calls.map(c => c[0] as string).join('');
    expect(out).toContain('C:/path/to/file.ts');
    spy.mockRestore();
  });

  it('supports link with description', () => {
    const logger = new Logger({ useColors: true, useLegacyOutput: true });
    const spy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);
    logger.link('https://example.com', 'Example Website');

    // Get all the calls and join them
    const out = spy.mock.calls.map(c => c[0] as string).join('');
    expect(out).toContain('Example Website');
    expect(out).toContain('https://example.com');
    spy.mockRestore();
  });

  it('supports all log levels through the log method', () => {
    const logger = new Logger({ verbose: true, useLegacyOutput: true });
    const spy = jest.spyOn(Printer, 'print').mockImplementation(() => undefined);

    logger.log('info message', 'info');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));

    spy.mockClear();
    logger.log('warning message', 'warn');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));

    spy.mockClear();
    logger.log('error message', 'error');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));

    spy.mockClear();
    logger.log('debug message', 'debug');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));

    spy.mockClear();
    logger.log('success message', 'success');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[SUCCESS]'));

    // Test default level
    spy.mockClear();
    logger.log('default level');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));

    spy.mockRestore();
  });

  it('writes to log file when file logging is enabled', async () => {
    // Create logger with disk writing disabled initially and useLegacyOutput to ensure file operations work
    const logger = new Logger({ writeToDisk: false, logDir: LOG_DIR, useLegacyOutput: true });

    // Initially, not writing to disk
    logger.info('message before enabling');
    expect(fsMocks.appendFileSync).not.toHaveBeenCalled();

    // Enable file logging - this will initialize the file manager
    fsMocks.writeFileSync.mockClear();
    logger.setFileLogging(true);

    // Wait a bit for async initialization
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(fsMocks.writeFileSync).toHaveBeenCalled();

    // Now appendFileSync should be called for new messages
    fsMocks.appendFileSync.mockClear();
    logger.info('message after enabling');
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('message after enabling')
    );
  });
});
