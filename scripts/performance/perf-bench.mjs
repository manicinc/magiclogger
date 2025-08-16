/*
  Performance benchmark for MagicLogger vs popular loggers.
  - Measures ops/sec for various logging scenarios
  - Compares: MagicLogger (sync/async, styled/unstyled), pino, winston, bunyan
  - Suppresses all output to avoid I/O skewing results
  
  Usage:
    node perf-bench.mjs
    npm run bench
*/

// Use local built dist to avoid requiring an installed package
import { Logger } from '../../dist/index.js';
import { AsyncLogger } from '../../dist/async/logger.js';
import { Writable } from 'stream';
import { fileURLToPath } from 'url';
import path from 'path';
import { NullTransport } from '../../dist/transports/null.js';

// Optional styling lib for external logger styled cases
let chalk = null;
try {
  ({ default: chalk } = await import('chalk'));
} catch {
  console.warn('Chalk not available; external logger Styled cases will be plain');
}

// External loggers (optional peer deps)
let pino = null;
let winston = null;
let bunyan = null;

try { 
  ({ default: pino } = await import('pino')); 
} catch (e) { 
  console.warn('Pino not available for benchmark'); 
}

try { 
  winston = await import('winston'); 
} catch (e) { 
  console.warn('Winston not available for benchmark'); 
}

try { 
  ({ default: bunyan } = await import('bunyan')); 
} catch (e) { 
  console.warn('Bunyan not available for benchmark'); 
}

// Null stream to suppress external logger output
class NullStream extends Writable {
  _write(_chunk, _encoding, callback) {
    setImmediate(callback); // Async to simulate real I/O
  }
}

// Synchronous null stream for true sync comparison
class SyncNullStream extends Writable {
  _write(_chunk, _encoding, callback) {
    callback(); // Immediate callback for sync behavior
  }
}

// Counter stream to ensure writes are happening
class CounterStream extends Writable {
  constructor() {
    super();
    this.count = 0;
  }
  
  _write(_chunk, _encoding, callback) {
    this.count++;
    setImmediate(callback);
  }
}

// Benchmark configuration
const ITERATIONS = 100_000;
const WARMUP_ITERATIONS = 5_000;

function formatNumber(n) {
  return Math.round(n).toLocaleString();
}

async function benchmark(name, fn, iterations = ITERATIONS) {
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

function createResultsTable(results) {
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
  
  // Cross-platform OS null device
  const NULL_DEVICE = process.platform === 'win32' ? 'NUL' : '/dev/null';
  
  // MagicLogger configurations
  const magicLoggerSync = new Logger({
    transports: [new NullTransport()],
    useColors: false
  });

  const magicLoggerSyncStyled = new Logger({
    transports: [new NullTransport()],
    useColors: true
  });

  // For async, simulate real I/O with the counter stream
  const magicLoggerAsync = new AsyncLogger(
    {
      onFlush: async (logs) => {
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
      level: _level,
      message,
      plainMessage: message,
      context: meta
    })
  );

  const magicLoggerAsyncStyled = new AsyncLogger(
    {
      onFlush: async (logs) => {
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
      level: _level,
      message,
      plainMessage: message,
      context: meta
    })
  );

  // External loggers
  let pinoLoggerSync = null;
  let pinoLoggerAsync = null;
  let winstonLoggerSync = null;
  let winstonLoggerAsync = null;
  let bunyanLoggerSync = null;

  if (pino) {
    const syncDest = pino.destination ? pino.destination({ dest: NULL_DEVICE, sync: true }) : syncNullStream;
    pinoLoggerSync = pino({
      level: 'info',
      enabled: true,
      base: {},
      timestamp: false,
      sync: true
    }, syncDest);

    const asyncDest = pino.destination ? pino.destination({ dest: NULL_DEVICE, sync: false }) : nullStream;
    pinoLoggerAsync = pino({
      level: 'info',
      enabled: true,
      base: {},
      timestamp: false,
      sync: false
    }, asyncDest);
  }

  if (winston) {
    // Winston SYNC - using simple format and sync stream
    winstonLoggerSync = winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Stream({
          stream: syncNullStream,
          silent: false
        })
      ]
    });

    // Winston ASYNC - with potential buffering
    winstonLoggerAsync = winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Stream({
          stream: nullStream,
          silent: false
        })
      ]
    });
  }

  if (bunyan) {
    // Bunyan is always synchronous by design
    bunyanLoggerSync = bunyan.createLogger({
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
    counterStream
  };
}

async function runBenchmarks() {
  console.log('Setting up loggers...');
  const loggers = await setupLoggers();
  
  console.log('Running benchmarks...');
  const results = [];

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
      () => loggers.pinoLoggerSync.info(testMetadata, testMessage)
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Pino (Sync, Styled)', 
      () => loggers.pinoLoggerSync.info(testMetadata, styledMsg)
    ));
  }

  // Winston Sync
  if (loggers.winstonLoggerSync) {
    results.push(await benchmark(
      'Winston (Sync, Plain)', 
      () => loggers.winstonLoggerSync.info(testMessage, testMetadata)
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Winston (Sync, Styled)', 
      () => loggers.winstonLoggerSync.info(styledMsg, testMetadata)
    ));
  }

  // Bunyan (always sync)
  if (loggers.bunyanLoggerSync) {
    results.push(await benchmark(
      'Bunyan (Sync, Plain)', 
      () => loggers.bunyanLoggerSync.info(testMetadata, testMessage)
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Bunyan (Sync, Styled)', 
      () => loggers.bunyanLoggerSync.info(testMetadata, styledMsg)
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
      () => loggers.pinoLoggerAsync.info(testMetadata, testMessage)
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Pino (Async, Styled)', 
      () => loggers.pinoLoggerAsync.info(testMetadata, styledMsg)
    ));
  }

  // Winston Async
  if (loggers.winstonLoggerAsync) {
    results.push(await benchmark(
      'Winston (Async, Plain)', 
      () => loggers.winstonLoggerAsync.info(testMessage, testMetadata)
    ));
    const styledMsg = chalk ? chalk.green.bold('✔') + ' ' + testMessage : '✔ ' + testMessage;
    results.push(await benchmark(
      'Winston (Async, Styled)', 
      () => loggers.winstonLoggerAsync.info(styledMsg, testMetadata)
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
    const pickWinner = (arr) => arr.length ? arr.reduce((a, b) => (a.opsSec > b.opsSec ? a : b)) : null;
    const syncPlain = syncResults.filter(r => r.name.includes('Sync') && r.name.includes('Plain'));
    const syncStyled = syncResults.filter(r => r.name.includes('Sync') && r.name.includes('Styled'));
    const asyncPlain = asyncResults.filter(r => r.name.includes('Async') && r.name.includes('Plain'));
    const asyncStyled = asyncResults.filter(r => r.name.includes('Async') && r.name.includes('Styled'));

    const formatLine = (label, winner, pool) => {
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
      let lines = ['=== KEY COMPARISONS ==='];

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
      const magicAsyncStyledDetail = asyncResults.find(r => r.name === 'MagicLogger (Async, Styled)');
      const otherAsyncResults = asyncResults.filter(r => !r.name.includes('MagicLogger'));
      if (magicAsyncStyledDetail && otherAsyncResults.length > 0) {
        const fastestOtherAsync = otherAsyncResults[0];
        const asyncRatio = magicAsyncStyledDetail.opsSec / fastestOtherAsync.opsSec;
        lines.push(
          '',
          'Asynchronous Styled Performance:',
          `  MagicLogger (Async, Styled): ${magicAsyncStyledDetail.opsSecFormatted} ops/sec`,
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

*Generated via scripts/performance/perf-bench.mjs.*
<!-- PERF_TABLE_END -->`;
    console.log(markdownTable);

    // Also print Key comparisons to console (duplicating for clarity)
    console.log('\n' + keyComparisonsBlock);

    // Performance analysis
    if (syncResults.length > 0) {
      const fastestSync = syncResults[0];
      console.log(`\nFastest Sync: ${fastestSync.name} (${fastestSync.opsSecFormatted} ops/sec)`);
    }
    
    if (asyncResults.length > 0) {
      const fastestAsync = asyncResults[0];
      console.log(`Fastest Async: ${fastestAsync.name} (${fastestAsync.opsSecFormatted} ops/sec)`);
    }

    // Legend for clarity
    console.log('\nLegend:');
    console.log('  • Sync = True synchronous operations (blocking I/O)');
    console.log('  • Async = Buffered/async operations (non-blocking)');
    console.log('  • Plain = Minimal formatting');
    console.log('  • Styled = Color/template formatting applied');
    console.log('  • All output suppressed via null transport/stream');

    // Cleanup async loggers - wait for flush
    if (loggers.magicLoggerAsync && typeof loggers.magicLoggerAsync.close === 'function') {
      await loggers.magicLoggerAsync.close();
    }
    if (loggers.magicLoggerAsyncStyled && typeof loggers.magicLoggerAsyncStyled.close === 'function') {
      await loggers.magicLoggerAsyncStyled.close();
    }

  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
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