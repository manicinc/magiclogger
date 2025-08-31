import fs from 'fs';
import os from 'os';
import path from 'path';

import { Printer } from '../../../src/core/Printer';
import { SyncLogger, isSyncLogger, createSyncLogger } from '../../../src/sync/SyncLogger';

describe('SyncLogger', () => {
  let printSpy: jest.SpyInstance;
  let realFs: typeof fs;

  beforeAll(() => {
    // Save the real fs implementation
    realFs = jest.requireActual('fs');
  });

  beforeEach(() => {
    printSpy = jest.spyOn(Printer, 'print').mockImplementation(() => {
      /* noop */
    });

    // For SyncLogger tests, we need the real fs, not the mocked one
    // Restore real fs methods that SyncLogger uses
    // Use Object.assign to properly restore the methods
    Object.assign(fs, {
      appendFileSync: realFs.appendFileSync,
      openSync: realFs.openSync,
      closeSync: realFs.closeSync,
      writeSync: realFs.writeSync,
      fsyncSync: realFs.fsyncSync,
      statSync: realFs.statSync,
      fstatSync: realFs.fstatSync,
      readFileSync: realFs.readFileSync,
      unlinkSync: realFs.unlinkSync,
      existsSync: realFs.existsSync,
      mkdirSync: realFs.mkdirSync,
    });
  });

  afterEach(() => {
    printSpy.mockRestore();
  });

  it('creates a sync logger and type guard works', () => {
    const logger = new SyncLogger({ useConsole: false });
    expect(isSyncLogger(logger)).toBe(true);
  });

  it('supports factory createSyncLogger', () => {
    const logger = createSyncLogger({ useConsole: false });
    expect(isSyncLogger(logger)).toBe(true);
  });

  it('prints info/warn/debug/success via Printer', () => {
    const logger = new SyncLogger({ useConsole: true });
    logger.info('hello');
    logger.warn('be careful');
    logger.debug('details');
    logger.success('done');
    // At least 4 prints called with level prefixes in message
    expect(printSpy).toHaveBeenCalled();
    const printed = printSpy.mock.calls.map(c => String(c[0]));
    expect(printed.some(m => m.toUpperCase().includes('[INFO]'))).toBe(true);
    expect(printed.some(m => m.toUpperCase().includes('[WARN]'))).toBe(true);
    expect(printed.some(m => m.toUpperCase().includes('[DEBUG]'))).toBe(true);
    expect(printed.some(m => m.toUpperCase().includes('[SUCCESS]'))).toBe(true);
  });

  it('logs error with Error meta', () => {
    const logger = new SyncLogger({ useConsole: true });
    const err = new Error('boom');
    logger.error('failed', err);
    const printed = printSpy.mock.calls.map(c => String(c[0]));
    expect(printed.some(m => m.toUpperCase().includes('[ERROR]'))).toBe(true);
  });

  it('supports custom log level via log()', () => {
    const logger = new SyncLogger({ useConsole: true });
    logger.log('tracing...', 'trace');
    const printed = printSpy.mock.calls.map(c => String(c[0]));
    expect(printed.some(m => m.toUpperCase().includes('[TRACE]'))).toBe(true);
  });

  it('writes JSON lines to file and flushes/close works', async () => {
    const tmp = path.join(
      os.tmpdir(),
      `synclogger-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
    );

    // Create logger and write logs
    const logger = new SyncLogger({ file: tmp, useConsole: false, forceFlush: true });

    logger.info('file hello', { a: 1 });
    logger.warn('file warn', { b: 2 });

    logger.flush();

    // Check write count before closing
    const writeCount = logger.getWriteCount();
    expect(writeCount).toBe(2);

    await logger.close(); // Close the file to ensure all data is written

    // Read and parse the file
    const content = fs.readFileSync(tmp, 'utf8');

    const lines = content
      .trim()
      .split(/\r?\n/)
      .filter(line => line.trim() !== '');

    // Check we got 2 lines
    expect(lines).toHaveLength(2);

    // Parse first line (info)
    const first = JSON.parse(lines[0]);
    expect(first.level).toBe('info');
    expect(first.message).toBe('file hello');
    // plainMessage field removed in favor of styles
    expect(first.meta).toEqual({ a: 1 });

    // Parse second line (warn)
    const last = JSON.parse(lines[1]);
    expect(last.level).toBe('warn');
    expect(last.message).toBe('file warn');
    // plainMessage field removed in favor of styles
    expect(last.meta).toEqual({ b: 2 });

    // flush() should not throw even when already flushed
    logger.flush();

    await logger.close();
    // second close should be a no-op
    await logger.close();

    // Cleanup temp file
    fs.unlinkSync(tmp);
  });

  it('provides getFilePath', () => {
    const tmp = path.join(
      os.tmpdir(),
      `synclogger-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
    );
    const logger = new SyncLogger({ file: tmp, useConsole: false });
    expect(logger.getFilePath()).toBe(tmp);

    // Only delete the file if it exists (it won't exist unless we write to it)
    if (fs.existsSync(tmp)) {
      fs.unlinkSync(tmp);
    }
  });

  it('fmt template and style builder s return strings', () => {
    const logger = new SyncLogger({ useConsole: false, useColors: true });
    const styled = logger.s.red.bold('Error!');
    expect(typeof styled).toBe('string');
    const templated = logger.fmt`@red{Error:} ${'bad'}`;
    expect(typeof templated).toBe('string');
  });

  it('header, separator, progressBar print output', () => {
    const logger = new SyncLogger({ useConsole: true });
    printSpy.mockClear();
    logger.header('CONFIG');
    logger.separator('=', 10);
    logger.progressBar(25, 10);
    const printed = printSpy.mock.calls.map(c => String(c[0]));
    expect(printed.some(m => m.includes('===='))).toBe(true);
    expect(printed.some(m => m.includes('========'))).toBe(true);
    expect(printed.some(m => m.includes('[■■■■')) || printed.some(m => m.includes('['))).toBe(true);
  });
});
