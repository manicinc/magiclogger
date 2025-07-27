import { Logger } from '../../../src';
import { LOG_DIR, fsMocks } from '../../../jest.setup';
import * as fs from 'fs';

// Define types for options to improve type safety
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

describe('Logger Output Methods', () => {
  let logger: Logger;
  let stdoutWriteSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger({ verbose: true });
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
  });

  it('only prints debug when verbose is true', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Clear any previous calls
    spy.mockClear();

    logger.debug('nope');
    expect(spy).not.toHaveBeenCalled();

    logger.setVerbose(true);
    logger.debug('yep');
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
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Test with different title lengths
    logger.header('Short');
    logger.header('This is a medium length header');
    logger.header(
      'This is a very long header that should cause less padding to be applied because it takes up more space on the line'
    );

    // Verify padding calculation
    const calls = consoleSpy.mock.calls.map(c => c[0] as string);

    // Short title should have more padding
    const shortPadding = calls[0].length;
    const mediumPadding = calls[1].length;
    const longPadding = calls[2].length;

    // Each call should have decreasing padding as the title gets longer
    expect(shortPadding).toBeGreaterThan(mediumPadding);
    expect(mediumPadding).toBeGreaterThan(longPadding);

    consoleSpy.mockRestore();
  });

  it('handles custom header colors', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    // Test with custom color combinations
    logger.header('Red Header', ['red']);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Red Header'),
      expect.any(String)
    );

    logger.header('Green Bold Header', ['green', 'bold']);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Green Bold Header'),
      expect.any(String)
    );

    logger.header('Blue BGWhite Header', ['blue', 'bgWhite']);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Blue BGWhite Header'),
      expect.any(String)
    );
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

    // Should format progress bar with 5 completed and 5 incomplete segments
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringMatching(/#####-----/));

    // Test empty length (should use default)
    stdoutWriteSpy.mockClear();
    logger.progressBar(50, undefined, '#', '-');

    // Should format with default length (20)
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringMatching(/##########+----------/));
  });

  it('prints newline when progress reaches 100%', () => {
    // Test with progress < 100%
    logger.progressBar(99);

    // Should not print newline
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.not.stringContaining('\n'));

    // Test with progress = 100%
    stdoutWriteSpy.mockClear();
    logger.progressBar(100);

    // Should print newline
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('\n'));
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
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Test with differently sized cells
    logger.table([
      { tiny: 'a', huge: 'this is a very long value that should cause wide padding' },
      { tiny: 'b', huge: 'short' },
    ]);

    // Should create consistent column widths
    const calls = consoleSpy.mock.calls.map(c => c[0] as string);
    const headerRow = calls[0];
    // const separator = calls[1];
    const dataRow1 = calls[2];
    const dataRow2 = calls[3];

    // Headers should be padded
    expect(headerRow).toContain('tiny');
    expect(headerRow).toContain('huge');

    // All data rows should be same length as header
    expect(dataRow1.length).toBe(headerRow.length);
    expect(dataRow2.length).toBe(headerRow.length);

    // Second row should have padding to match first row's column width
    expect(dataRow2).toContain('short');
    expect(dataRow2.indexOf('short') + 'short'.length).toBeLessThan(dataRow2.length);

    consoleSpy.mockRestore();
  });

  it('colorizes link-like cells in tables', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

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

    // Verify output to check for color codes on link-like cells
    const calls = consoleSpy.mock.calls.map(c => c[0] as string).join('\n');

    // Links should have color codes
    expect(calls).toContain('\x1b['); // Should have ANSI codes

    // Restore spy
    isLinkLikeSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('formats links with different forms', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Test various link formats
    logger.link('https://example.com');
    logger.link('file:///path/to/file.txt');
    logger.link('/absolute/path/file.js');
    logger.link('./relative/path.ts');
    logger.link('C:\\Windows\\Path\\file.log');

    // With descriptions
    logger.link('https://example.com', 'Example Website');

    // Verify all links are normalized and colorized
    const calls = consoleSpy.mock.calls.map(c => c[0] as string);

    // Each link should be colorized
    for (const call of calls) {
      expect(call).toContain('\x1b['); // Should have ANSI codes
    }

    // Windows path should be normalized
    expect(calls[4]).toContain('C:/Windows/Path/file.log');

    // Description should be included
    expect(calls[5]).toContain('Example Website');

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

    // Should write header, separator, and data rows
    expect(appendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/name.*value/)
    );
    expect(appendSpy).toHaveBeenCalledWith(expect.any(String), expect.stringMatching(/-+-/));
    expect(appendSpy).toHaveBeenCalledWith(expect.any(String), expect.stringMatching(/item1.*100/));
    expect(appendSpy).toHaveBeenCalledWith(expect.any(String), expect.stringMatching(/item2.*200/));

    appendSpy.mockRestore();
  });

  it('logs info messages using .info()', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
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

    // Verify appendFileSync was called with proper content
    expect(fsMocks.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[IMPORTANT]')
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
    const logger = new Logger();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Test with undefined and null values
    logger.table([
      { col1: 'value1', col2: undefined },
      { col1: null, col2: 'value2' },
    ]);

    // FIX: table method calls console.log 4 times (header, separator, row1, row2)
    expect(consoleSpy).toHaveBeenCalledTimes(4);

    // The rows should be properly padded despite undefined/null values
    const calls = consoleSpy.mock.calls.map(call => call[0]);
    expect(calls.some(call => typeof call === 'string' && call.includes('value1'))).toBe(true);
    expect(calls.some(call => typeof call === 'string' && call.includes('value2'))).toBe(true);

    consoleSpy.mockRestore();
  });

  it('handles empty tables gracefully', () => {
    const logger = new Logger();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.table([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('formats table cells with appropriate padding', () => {
    const logger = new Logger();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    logger.table([
      { name: 'short', value: 1 },
      { name: 'longerName', value: 2000 },
    ]);

    // Check that the header uses appropriate column widths
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/name\s+\| value/));

    spy.mockRestore();
  });

  it('handles links in table cells', () => {
    const logger = new Logger({ useColors: true });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    logger.table([
      { name: 'URL', value: 'https://example.com' },
      { name: 'PATH', value: '/path/to/file.js' },
    ]);

    // Check that links are colorized
    const callArgs = spy.mock.calls.map(call => call[0]);
    const callsStr = callArgs.join('\n');
    expect(callsStr).toContain('\x1b['); // ANSI escape for color

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
    const logger = new Logger({ useColors: true });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.link('C:\\path\\to\\file.ts');
    const out = spy.mock.calls.map(c => c[0] as string).join('');
    expect(out).toContain('C:/path/to/file.ts');
    spy.mockRestore();
  });

  it('supports link with description', () => {
    const logger = new Logger({ useColors: true, useLegacyOutput: true });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.link('https://example.com', 'Example Website');
    const out = spy.mock.calls.map(c => c[0] as string).join('');
    expect(out).toContain('Example Website');
    expect(out).toContain('https://example.com');
    spy.mockRestore();
  });

  it('supports all log levels through the log method', () => {
    const logger = new Logger({ verbose: true, useLegacyOutput: true });
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    logger.log('info message', 'info');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));

    logger.log('warning message', 'warn');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));

    logger.log('error message', 'error');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));

    logger.log('debug message', 'debug');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));

    logger.log('success message', 'success');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[SUCCESS]'));

    // Test default level
    logSpy.mockClear();
    logger.log('default level');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));

    // Invalid level falls back to info
    logSpy.mockClear();
    logger.log('invalid level', 'invalid' as LogLevel);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));

    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
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
