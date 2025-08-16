/*
  Performance benchmark for MagicLogger vs popular loggers.
  - Measures ops/sec for various logging scenarios
  - Compares: MagicLogger (sync/async, styled/unstyled), pino, winston, bunyan
  - Suppresses all output to avoid I/O skewing results
  
  Usage:
    npx tsx perf-bench.ts
    npm run bench:ts
*/

// Use local built dist to avoid requiring an installed package
import { Logger } from '../../dist/index.js';
// Import runtime AsyncLogger from local dist; types are inferred as any from JS
import { AsyncLogger } from '../../dist/async/logger.js';
// (No type imports required)

import { Writable } from 'stream';
import { fileURLToPath } from 'url';
import path from 'path';
import { NullTransport } from '../../dist/transports/null.js';
// no fs/os needed when targeting OS null device

// Optional styling lib for external logger styled cases
type ChalkLike = { green: { bold: (s: string) => string } };
let chalk: ChalkLike | null = null;

function getChalkLike(mod: unknown): ChalkLike | null {
  if (typeof mod !== 'object' || mod === null) return null;
  const candidates: unknown[] = [
    (mod as { default?: unknown }).default,
    mod
  ];
  for (const c of candidates) {
    if (typeof c === 'object' && c !== null) {
      const green = (c as Record<string, unknown>)['green'];
      if (typeof green === 'object' && green !== null) {
        const bold = (green as Record<string, unknown>)['bold'];
        if (typeof bold === 'function') {
          return c as ChalkLike;
        }
      }
    }
  }
  return null;
}

try {
  const mod: unknown = await import('chalk');
  chalk = getChalkLike(mod);
} catch {
  console.warn('Chalk not available; external logger Styled cases will be plain');
}

// External loggers (optional peer deps)
type ExternalLogger = { info: (...args: unknown[]) => unknown };
type CreatePino = (opts: unknown, stream?: unknown) => ExternalLogger;
type PinoModule = { 
  default: CreatePino;
  destination?: (opts: unknown) => unknown;
};
type WinstonNS = {
  createLogger: (opts: unknown) => ExternalLogger;
  transports: { Stream: new (opts: unknown) => unknown };
  format: { simple: () => unknown };
};
type BunyanNS = { createLogger: (opts: unknown) => ExternalLogger };

let pino: CreatePino | null = null;
let pinoDestination: ((opts: unknown) => unknown) | null = null;
let winston: unknown = null;
let bunyan: unknown = null;

try { 
  const pinoModule = await import('pino') as unknown as PinoModule;
  pino = pinoModule.default;
  pinoDestination = pinoModule.destination || null;
} catch (e) { 
  console.warn('Pino not available for benchmark'); 
}

try { 
  winston = await import('winston'); 
} catch (e) { 
  console.warn('Winston not available for benchmark'); 
}

try { 
  bunyan = (await import('bunyan')).default; 
} catch (e) { 
  console.warn('Bunyan not available for benchmark'); 
}

// Null stream to suppress external logger output
class NullStream extends Writable {
  _write(_chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    setImmediate(callback); // Async to simulate real I/O
  }
}

// Synchronous null stream for true sync comparison
class SyncNullStream extends Writable {
  _write(_chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    callback(); // Immediate callback for sync behavior
  }
}

// Counter stream to ensure writes are happening
class CounterStream extends Writable {
  count: number;
  
  constructor() {
    super();
    this.count = 0;
  }
  
  _write(_chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    this.count++;
    setImmediate(callback);
  }
}

// Benchmark configuration
interface BenchmarkResult {
  name: string;
  iterations: number;
  ms: number;
  opsSec: number;
  opsSecFormatted: string;
}

const ITERATIONS = 100_000;
const WARMUP_ITERATIONS = 5_000;

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

async function benchmark(name: string, fn: () => void | Promise<void>, iterations = ITERATIONS): Promise<BenchmarkResult> {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await fn();
  }

  // Force garbage collection if available
  if (global.gc) global.gc();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  const ms = performance.now() - start;
  const opsSec = (iterations / (ms / 1000));
  
  return {
    name,
    iterations,
    ms,
    opsSec,
    opsSecFormatted: formatNumber(opsSec)
  };
}

function createResultsTable(results: BenchmarkResult[]): string {
  const header = `| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|`;
  
  const rows = results.map(r => 
    `| ${r.name} | ${formatNumber(r.iterations)} | ${r.ms.toFixed(1)} | ${r.opsSecFormatted} |`
  ).join('\n');
  
  return `${header}\n${rows}`;
}

async function setupLoggers() {
  const nullStream = new NullStream();
  const syncNullStream = new SyncNullStream();
  const counterStream = new CounterStream();
  
  // Cross-platform OS null device path
  const nullFile = process.platform === 'win32' ? 'NUL' : '/dev/null';
  
  // MagicLogger configurations
  const magicLoggerSync = new Logger({
    transports: [new NullTransport()],
    useColors: false
  } as unknown as ConstructorParameters<typeof Logger>[0]);

  const magicLoggerSyncStyled = new Logger({
    transports: [new NullTransport()],
    useColors: true
  } as unknown as ConstructorParameters<typeof Logger>[0]);

  // For async, simulate real I/O with the counter stream
  const magicLoggerAsync = new AsyncLogger(
    {
      onFlush: async (logs: unknown[]) => {
        // Simulate real async write
        await new Promise(resolve => setImmediate(resolve));
        counterStream.count += logs.length;
      },
      buffer: { size: 8192, flushInterval: 1000, flushSize: 1000 },
      useWorkers: false,
    },
    (_level, message, meta) => ({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: _level as unknown as string,
      message,
      plainMessage: message,
      context: meta
    })
  );

  const magicLoggerAsyncStyled = new AsyncLogger(
    {
      onFlush: async (logs: unknown[]) => {
        // Simulate real async write
        await new Promise(resolve => setImmediate(resolve));
        counterStream.count += logs.length;
      },
      buffer: { size: 8192, flushInterval: 1000, flushSize: 1000 },
      useWorkers: false,
    },
    (_level, message, meta) => ({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: _level as unknown as string,
      message,
      plainMessage: message,
      context: meta
    })
  );

  // External loggers
  let pinoLoggerSync: ExternalLogger | null = null;
  let pinoLoggerAsync: ExternalLogger | null = null;
  let winstonLoggerSync: ExternalLogger | null = null;
  let winstonLoggerAsync: ExternalLogger | null = null;
  let bunyanLoggerSync: ExternalLogger | null = null;

  if (pino && pinoDestination) {
    // Pino with sync writes to file
    pinoLoggerSync = pino(
      {
        level: 'info',
        enabled: true,
        base: {},
        timestamp: false,
        sync: true
      },
      pinoDestination({
        dest: nullFile,
        sync: true
      })
    );

    // Pino with async writes (default behavior with stream)
    pinoLoggerAsync = pino({
      level: 'info',
      enabled: true,
      base: {},
      timestamp: false,
      sync: false
    }, nullStream);
  } else if (pino) {
    // Fallback if pinoDestination not available
    pinoLoggerSync = pino({
      level: 'info',
      enabled: true,
      base: {},
      timestamp: false
    }, nullStream);
    
    pinoLoggerAsync = pinoLoggerSync; // Use same for both
  }

  if (winston) {
    const w = winston as WinstonNS;
    
    // Winston SYNC - using simple format and sync stream
    winstonLoggerSync = w.createLogger({
      level: 'info',
      format: w.format.simple(),
      transports: [
        new w.transports.Stream({
          stream: syncNullStream,
          silent: false
        })
      ]
    });

    // Winston ASYNC - with potential buffering
    winstonLoggerAsync = w.createLogger({
      level: 'info',
      format: w.format.simple(),
      transports: [
        new w.transports.Stream({
          stream: nullStream,
          silent: false
        })
      ]
    });
  }

  if (bunyan) {
    const b = bunyan as BunyanNS;
    // Bunyan is always synchronous by design
    bunyanLoggerSync = b.createLogger({
      name: 'benchmark',
      level: 'info',
      streams: [{
        type: 'stream',
        stream: syncNullStream,
        level: 'info'
      }]
    });
  }

  return {
    magicLoggerSync,
    magicLoggerSyncStyled,
    magicLoggerAsync,
    magicLoggerAsyncStyled,
    pinoLoggerSync,
    pinoLoggerAsync,
    winstonLoggerSync,
    winstonLoggerAsync,
    bunyanLoggerSync,
    nullFile,
    counterStream
  };
}

async function runBenchmarks() {
  console.log('Setting up loggers...');
  const loggers = await setupLoggers();
  
  console.log('Running benchmarks...');
  const results: BenchmarkResult[] = [];

  // Test data
  const testMessage = 'User authentication successful';
  const testMetadata = { 
    userId: 'user_12345', 
    ip: '192.168.1.100', 
    userAgent: 'Mozilla/5.0', 
    timestamp: Date.now() 
  };

  console.log('\n=== SYNCHRONOUS OPERATIONS ===');
  
  // MagicLogger Sync (Plain)
  results.push(await benchmark(
    'MagicLogger (Sync, Plain)', 
    () => loggers.magicLoggerSync.info(testMessage, testMetadata)
  ));

  // MagicLogger Sync (Styled)
  results.push(await benchmark(
    'MagicLogger (Sync, Styled)', 
    () => loggers.magicLoggerSyncStyled.info(
      loggers.magicLoggerSyncStyled.s.green.bold('✔') + ' ' + testMessage,
      testMetadata
    )
  ));

  // Pino Sync
  if (loggers.pinoLoggerSync) {
    results.push(await benchmark(
      'Pino (Sync, Plain)', 
      () => { loggers.pinoLoggerSync?.info(testMetadata, testMessage); }
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Pino (Sync, Styled)', 
  () => { loggers.pinoLoggerSync?.info(testMetadata, styledMsg); }
    ));
  }

  // Winston Sync
  if (loggers.winstonLoggerSync) {
    results.push(await benchmark(
      'Winston (Sync, Plain)', 
  () => { loggers.winstonLoggerSync?.info(testMessage, testMetadata); }
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Winston (Sync, Styled)', 
  () => { loggers.winstonLoggerSync?.info(styledMsg, testMetadata); }
    ));
  }

  // Bunyan (always sync)
  if (loggers.bunyanLoggerSync) {
    results.push(await benchmark(
      'Bunyan (Sync, Plain)', 
  () => { loggers.bunyanLoggerSync?.info(testMetadata, testMessage); }
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Bunyan (Sync, Styled)', 
  () => { loggers.bunyanLoggerSync?.info(testMetadata, styledMsg); }
    ));
  }

  console.log('\n=== ASYNCHRONOUS OPERATIONS ===');

  // MagicLogger Async (Plain)  
  results.push(await benchmark(
    'MagicLogger (Async, Plain)', 
    () => loggers.magicLoggerAsync.info(testMessage, testMetadata)
  ));

  // MagicLogger Async (Styled)
  results.push(await benchmark(
    'MagicLogger (Async, Styled)', 
    () => loggers.magicLoggerAsyncStyled.info(
      `<green.bold>✔</> ${testMessage}`,
      testMetadata
    )
  ));

  // Pino Async
  if (loggers.pinoLoggerAsync) {
    results.push(await benchmark(
      'Pino (Async, Plain)', 
  () => { loggers.pinoLoggerAsync?.info(testMetadata, testMessage); }
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Pino (Async, Styled)', 
  () => { loggers.pinoLoggerAsync?.info(testMetadata, styledMsg); }
    ));
  }

  // Winston Async
  if (loggers.winstonLoggerAsync) {
    results.push(await benchmark(
      'Winston (Async, Plain)', 
  () => { loggers.winstonLoggerAsync?.info(testMessage, testMetadata); }
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Winston (Async, Styled)', 
  () => { loggers.winstonLoggerAsync?.info(styledMsg, testMetadata); }
    ));
  }

  // Verify async loggers actually processed logs
  console.log(`\nVerification: Counter stream received ${loggers.counterStream.count} writes`);

  return { results, loggers };
}

async function main() {
  
  try {
    console.log('Starting MagicLogger Performance Benchmark\n');
    console.log('Configuration:');
    console.log(`  Iterations: ${formatNumber(ITERATIONS)}`);
    console.log(`  Warmup: ${formatNumber(WARMUP_ITERATIONS)}`);
    console.log('  Output: Suppressed (null transport/stream)\n');
    
  const { results, loggers } = await runBenchmarks();
    
    // Separate sync and async results
    const syncResults = results.filter(r => r.name.includes('Sync'));
    const asyncResults = results.filter(r => r.name.includes('Async'));
    
    // Sort each group by operations per second (descending)
    syncResults.sort((a, b) => b.opsSec - a.opsSec);
    asyncResults.sort((a, b) => b.opsSec - a.opsSec);
    
    console.log('\n=== SYNCHRONOUS PERFORMANCE RESULTS ===');
    console.log(createResultsTable(syncResults));
    
    console.log('\n=== ASYNCHRONOUS PERFORMANCE RESULTS ===');
    console.log(createResultsTable(asyncResults));
    
    // Combined + winners for README
    const allResults = [...syncResults, ...asyncResults];

    // Winners summary with MagicLogger comparison when not the winner
    const pickWinner = (arr: typeof allResults) => arr.length ? arr.reduce((a, b) => (a.opsSec > b.opsSec ? a : b)) : null;
    const syncPlain = syncResults.filter(r => r.name.includes('Sync') && r.name.includes('Plain'));
    const syncStyled = syncResults.filter(r => r.name.includes('Sync') && r.name.includes('Styled'));
    const asyncPlain = asyncResults.filter(r => r.name.includes('Async') && r.name.includes('Plain'));
    const asyncStyled = asyncResults.filter(r => r.name.includes('Async') && r.name.includes('Styled'));

    const formatLine = (label: string, winner: typeof allResults[number] | null, pool: typeof allResults) => {
      if (!winner) return null;
      const ml = pool.find(r => r.name.startsWith('MagicLogger'));
      const mlSuffix = ml && !winner.name.startsWith('MagicLogger')
        ? ` — MagicLogger: ${ml.opsSecFormatted} ops/sec`
        : '';
      return `- ${label}: ${winner.name} (${winner.opsSecFormatted} ops/sec)${mlSuffix}`;
    };

    const wSyncPlain = pickWinner(syncPlain);
    const wSyncStyled = pickWinner(syncStyled);
    const wAsyncPlain = pickWinner(asyncPlain);
    const wAsyncStyled = pickWinner(asyncStyled);

    const winnersMarkdown = [
      '### Winners',
      '',
      formatLine('Sync Plain', wSyncPlain, syncPlain),
      formatLine('Sync Styled', wSyncStyled, syncStyled),
      formatLine('Async Plain', wAsyncPlain, asyncPlain),
      formatLine('Async Styled', wAsyncStyled, asyncStyled),
    ].filter(Boolean).join('\n');

    // Build Key Comparisons block (also included in README PERF_TABLE)
    const buildKeyComparisons = () => {
      const lines: string[] = ['=== KEY COMPARISONS ==='];

      // MagicLogger Sync Styled vs fastest other sync
      const magicSyncStyled = syncResults.find(r => r.name === 'MagicLogger (Sync, Styled)');
      const otherSyncResults = syncResults.filter(r => !r.name.includes('MagicLogger'));
      if (magicSyncStyled && otherSyncResults.length > 0) {
        const fastestOtherSync = otherSyncResults[0];
        const syncRatio = magicSyncStyled.opsSec / fastestOtherSync.opsSec;
        lines.push(
          '',
          'Synchronous Styled Performance:',
          `  MagicLogger (Sync, Styled): ${magicSyncStyled.opsSecFormatted} ops/sec`,
          `  ${fastestOtherSync.name}: ${fastestOtherSync.opsSecFormatted} ops/sec`,
          syncRatio > 1
            ? `  → MagicLogger is ${syncRatio.toFixed(2)}x faster`
            : `  → MagicLogger is ${(1 / syncRatio).toFixed(2)}x slower`
        );
      }

      // MagicLogger Async Styled vs fastest other async
      const magicAsyncStyled = asyncResults.find(r => r.name === 'MagicLogger (Async, Styled)');
      const otherAsyncResults = asyncResults.filter(r => !r.name.includes('MagicLogger'));
      if (magicAsyncStyled && otherAsyncResults.length > 0) {
        const fastestOtherAsync = otherAsyncResults[0];
        const asyncRatio = magicAsyncStyled.opsSec / fastestOtherAsync.opsSec;
        lines.push(
          '',
          'Asynchronous Styled Performance:',
          `  MagicLogger (Async, Styled): ${magicAsyncStyled.opsSecFormatted} ops/sec`,
          `  ${fastestOtherAsync.name}: ${fastestOtherAsync.opsSecFormatted} ops/sec`,
          asyncRatio > 1
            ? `  → MagicLogger is ${asyncRatio.toFixed(2)}x faster`
            : `  → MagicLogger is ${(1 / asyncRatio).toFixed(2)}x slower`
        );
      }

      return lines.join('\n');
    };

    const keyComparisonsBlock = buildKeyComparisons();

    // Markdown output for documentation (table + winners + key comparisons)
    console.log('\nMarkdown Output (Combined):');
    const markdownTable = `<!-- PERF_TABLE_START -->
${createResultsTable(allResults)}

${winnersMarkdown}

${keyComparisonsBlock}

*Generated via scripts/performance/perf-bench.ts*
<!-- PERF_TABLE_END -->`;
    console.log(markdownTable);

    // Also print Key comparisons to console (duplicating for clarity)
    console.log('\n' + keyComparisonsBlock);

    // Performance analysis
    if (syncResults.length > 0) {
      const fastestSync = syncResults[0];
      console.log(`\nFastest Sync Overall: ${fastestSync.name} (${fastestSync.opsSecFormatted} ops/sec)`);
    }
    
    if (asyncResults.length > 0) {
      const fastestAsync = asyncResults[0];
      console.log(`Fastest Async Overall: ${fastestAsync.name} (${fastestAsync.opsSecFormatted} ops/sec)`);
    }

    // Legend for clarity
    console.log('\nLegend:');
    console.log('  • Sync = True synchronous operations (blocking I/O)');
    console.log('  • Async = Buffered/async operations (non-blocking)');
    console.log('  • Plain = Minimal formatting');
    console.log('  • Styled = Color/template formatting applied');
    console.log('  • All output suppressed via null transport/stream');

    // Cleanup async loggers - wait for flush
    const { magicLoggerAsync, magicLoggerAsyncStyled } = loggers;
    if (magicLoggerAsync && typeof magicLoggerAsync.close === 'function') {
      await magicLoggerAsync.close();
    }
    if (magicLoggerAsyncStyled && typeof magicLoggerAsyncStyled.close === 'function') {
      await magicLoggerAsyncStyled.close();
    }

  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  } finally {
    // nothing to clean up
  }
}

// Export for external usage
export { benchmark, setupLoggers, createResultsTable };

// Run if this file is executed directly
// Robust ESM "is main" check (handles Windows paths and file:// URLs)
const __filename = fileURLToPath(import.meta.url);
const isMain = (() => {
  try {
    const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return path.resolve(__filename) === invoked;
  } catch {
    return false;
  }
})();

if (isMain) {
  main().catch(console.error);
}