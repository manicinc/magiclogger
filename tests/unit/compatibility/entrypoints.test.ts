// File: tests/unit/compatibility/entrypoints.test.ts
// Purpose: Exercise the lightweight compatibility entrypoint shim files so they register coverage.

// Compatibility shim entrypoints coverage
// Use relative path imports to avoid ts-jest moduleNameMapper path resolution issues for subpath entrypoints
import { BaseCompatibleLogger } from '../../../src/compatibility/base';
import { createBunyanCompatible } from '../../../src/compatibility/bunyan';
import { enhanceConsole } from '../../../src/compatibility/console';
import { createPinoCompatible, levels, levelNames } from '../../../src/compatibility/pino';
import { createWinstonCompatible } from '../../../src/compatibility/winston';

// Minimal tests – full behavioral coverage exists in dedicated compatibility suites.
describe('compatibility entrypoint shims', () => {
  it('exports BaseCompatibleLogger from base shim', () => {
    expect(typeof BaseCompatibleLogger).toBe('function');
  });

  it('pino shim exports factory and level maps', () => {
    const logger = createPinoCompatible({ level: 'info', prettyPrint: false });
    logger.info('shim test'); // ensure instantiated without error
    expect(levels).toMatchObject({
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    });
    expect(levelNames[30 as keyof typeof levelNames]).toBe('info');
  });

  it('bunyan shim creates a logger', () => {
    const bunyan = createBunyanCompatible({ name: 'bunyan-shim-test' });
    // Basic method presence sanity
    expect(typeof bunyan.info).toBe('function');
  });

  it('winston shim creates a logger', () => {
    const winston = createWinstonCompatible({ level: 'debug' });
    winston.debug('debug message');
    expect(typeof winston.error).toBe('function');
  });

  it('console shim enhances and restores console', () => {
    const originalLog = console.log;
    const { restoreConsole } = enhanceConsole();
    // Narrow typing for extended console to avoid any
    type ConsoleWithSuccess = Console & { success?: (msg: string, ...rest: unknown[]) => void };
    const extendedConsole: ConsoleWithSuccess = console as ConsoleWithSuccess;
    expect(typeof extendedConsole.success).toBe('function');
    console.log('test');
    restoreConsole();
    expect(console.log).toBe(originalLog); // restored
  });
});
