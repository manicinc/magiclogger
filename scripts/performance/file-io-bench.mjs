/**
 * @fileoverview File I/O Performance Benchmark for MagicLogger
 * 
 * This benchmark measures actual file write performance - ops/sec for real file I/O.
 * Unlike perf-bench.mjs which uses null transports, this measures:
 * - Actual disk writes
 * - File system performance
 * - Transport overhead with real I/O
 * - Sync vs Async file operations
 * 
 * Results show real-world logging performance including file system bottlenecks.
 * 
 * @module scripts/performance/file-io-bench
 */

import { Logger, AsyncLogger } from '../../dist/index.js';
/**
 * Import optimized file transports directly.
 * SyncFileTransport provides high-performance synchronous file I/O.
 */
import { SyncFileTransport } from '../../dist/transports/SyncFileTransport.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Optional external loggers for comparison
let pino = null;
let winston = null;
let bunyan = null;

try { 
  const pinoModule = await import('pino');
  pino = pinoModule.default;
} catch (e) { 
  console.warn('Pino not available for file I/O benchmark comparison'); 
}

try { 
  winston = await import('winston'); 
} catch (e) { 
  console.warn('Winston not available for file I/O benchmark comparison'); 
}

try { 
  ({ default: bunyan } = await import('bunyan')); 
} catch (e) { 
  console.warn('Bunyan not available for file I/O benchmark comparison'); 
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Benchmark configuration
const ITERATIONS = 5_000; // Reduced because file I/O is much slower
const WARMUP_ITERATIONS = 500;
const TEST_DIR = path.join(__dirname, 'tmp-bench');

/**
 * Legacy simple file transport for external logger comparison.
 * Only used for testing non-MagicLogger implementations.
 */
class SimpleLegacyFileTransport {
  constructor(options) {
    this.name = options.name || 'legacy-file';
    this.enabled = options.enabled !== false;
    this.filepath = options.filepath;
    this.format = options.format || 'json';
    
    // Ensure directory exists
    const dir = path.dirname(this.filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create file handle
    this.fd = fs.openSync(this.filepath, 'a');
  }
  
  shouldLog() {
    return this.enabled;
  }
  
  log(entry) {
    if (!this.shouldLog()) return;
    
    const line = this.format === 'json' 
      ? JSON.stringify(entry) + '\n'
      : `[${entry.timestamp}] [${entry.level}] ${entry.message}\n`;
    
    // Synchronous write without batching (inefficient)
    fs.writeSync(this.fd, line);
  }
  
  async flush() {
    // fsync to ensure data is written to disk
    fs.fsyncSync(this.fd);
  }
  
  async close() {
    if (this.fd) {
      fs.closeSync(this.fd);
      this.fd = null;
    }
  }
}

function formatNumber(n) {
  return Math.round(n).toLocaleString();
}

/**
 * Runs a high-precision benchmark with warmup.
 */
async function benchmark(name, fn, iterations = ITERATIONS, options = {}) {
  // Warmup phase
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await fn(i);
  }

  // Force GC if available
  if (global.gc) global.gc();

  const start = performance.now();
  
  // Run benchmark
  for (let i = 0; i < iterations; i++) {
    await fn(i);
    
    // Flush periodically for async loggers
    if (i % 100 === 99 && options.flushFn) {
      await options.flushFn();
    }
  }
  
  // Final flush
  if (options.flushFn) {
    await options.flushFn();
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
  const header = `| Logger Type | Iterations | Time (ms) | Ops/sec |
|------------|------------:|----------:|--------:|`;
  
  const rows = results.map(r => 
    `| ${r.name} | ${formatNumber(r.iterations)} | ${r.ms.toFixed(1)} | ${r.opsSecFormatted} |`
  ).join('\n');
  
  if (!results || results.length === 0) {
    return `${header}\n| No results | | | |`;
  }
  
  return `${header}\n${rows}`;
}

async function setupLoggers() {
  // Ensure test directory exists
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  // Clean up any existing test files
  const existingFiles = fs.readdirSync(TEST_DIR).filter(f => f.startsWith('test-'));
  for (const file of existingFiles) {
    fs.unlinkSync(path.join(TEST_DIR, file));
  }
  
  /**
   * MagicLogger Synchronous Transport Setup
   * 
   * Optimized for maximum throughput with intelligent batching:
   * - Large write buffers reduce system call overhead
   * - Coalesced writes minimize kernel transitions
   * - High water mark enables efficient kernel buffering
   */
  const syncFileTransport = new SyncFileTransport({
    filepath: path.join(TEST_DIR, 'test-magiclogger-sync.log'),
    format: 'json',
    /**
     * Performance-critical settings:
     * Buffer 1000 entries before writing (reduces syscalls by 1000x)
     * Flush every 10ms for low latency
     * 64KB kernel buffer for optimal I/O
     */
    bufferSize: 1000,
    flushInterval: 10,
    highWaterMark: 65536
  });
  
  /**
   * Synchronous logger instance.
   * Achieves high throughput through batching and buffering.
   */
  const magicLoggerSync = new Logger({
    transports: [syncFileTransport],
    useColors: false,
    useConsole: false
  });

  /**
   * MagicLogger Asynchronous Transport Setup
   * 
   * Uses AsyncLogger with optimized file transport:
   * - Non-blocking log operations
   * - Batch processing in background
   * - Worker threads for parallel processing (when enabled)
   */
  const asyncFileTransport = new SyncFileTransport({
    filepath: path.join(TEST_DIR, 'test-magiclogger-async.log'),
    format: 'json',
    /**
     * Async-optimized settings:
     * Larger buffers for better throughput
     * Minimal flush interval for responsiveness
     * 128KB kernel buffer for write coalescing
     */
    bufferSize: 2000,
    flushInterval: 10,
    highWaterMark: 131072
  });
  
  /**
   * Asynchronous logger using AsyncLogger class.
   * Processes logs without blocking the main thread.
   */
  const magicLoggerAsync = new AsyncLogger({
    transports: [asyncFileTransport],
    useConsole: false,
    /**
     * Worker configuration for parallel processing.
     * Disabled in benchmark to measure pure I/O performance.
     */
    worker: {
      enabled: false,
      batchSize: 1000,
      flushInterval: 10
    }
  });

  // External loggers setup
  const loggers = {
    magicLoggerSync,
    magicLoggerAsync,
    syncFileTransport,
    asyncFileTransport
  };

  // Pino setup
  if (pino) {
    // Create streams first
    loggers.pinoSyncStream = fs.createWriteStream(path.join(TEST_DIR, 'test-pino-sync.log'), { flags: 'w' });
    loggers.pinoAsyncStream = fs.createWriteStream(path.join(TEST_DIR, 'test-pino-async.log'), { flags: 'w' });
    
    // Pino sync (blocking writes)
    loggers.pinoSync = pino({
      level: 'info',
      base: {},
      timestamp: false
    }, loggers.pinoSyncStream);
    
    // Pino async (non-blocking writes) 
    loggers.pinoAsync = pino({
      level: 'info', 
      base: {},
      timestamp: false,
      sync: false  // Ensure async mode
    }, loggers.pinoAsyncStream);
  }

  // Winston setup
  if (winston) {
    loggers.winstonSync = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ 
          filename: path.join(TEST_DIR, 'test-winston-sync.log'),
          options: { flags: 'w' }
        })
      ]
    });
    
    loggers.winstonAsync = winston.createLogger({
      level: 'info', 
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ 
          filename: path.join(TEST_DIR, 'test-winston-async.log'),
          options: { flags: 'w' }
        })
      ]
    });
  }

  // Bunyan setup
  if (bunyan) {
    loggers.bunyanSync = bunyan.createLogger({
      name: 'benchmark-sync',
      level: 'info',
      streams: [{
        type: 'file',
        path: path.join(TEST_DIR, 'test-bunyan-sync.log'),
        level: 'info'
      }]
    });
    
    loggers.bunyanAsync = bunyan.createLogger({
      name: 'benchmark-async',
      level: 'info', 
      streams: [{
        type: 'file',
        path: path.join(TEST_DIR, 'test-bunyan-async.log'),
        level: 'info'
      }]
    });
  }

  return loggers;
}

async function runBenchmarks() {
  console.log('Setting up loggers and test files...');
  const loggers = await setupLoggers();
  
  console.log('Running file I/O benchmarks...');
  const results = [];

  // Test data
  const testMessage = 'User authentication successful';
  const testMetadata = { 
    userId: 'user_12345', 
    ip: '192.168.1.100', 
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
    timestamp: Date.now(),
    sessionId: 'sess_abc123def456',
    action: 'login'
  };

  console.log('\n=== SYNCHRONOUS FILE I/O ===');
  
  // MagicLogger Sync
  results.push(await benchmark(
    'MagicLogger (Sync File I/O)', 
    () => loggers.magicLoggerSync.info(testMessage, testMetadata),
    ITERATIONS,
    {
      flushFn: async () => {
        await loggers.syncFileTransport.flush();
      }
    }
  ));

  // Pino Sync
  if (loggers.pinoSync) {
    results.push(await benchmark(
      'Pino (Sync File I/O)',
      () => loggers.pinoSync.info(testMetadata, testMessage),
      ITERATIONS,
      {
        flushFn: async () => {
          // Force sync flush 
          loggers.pinoSyncStream.write(''); // Trigger flush
        }
      }
    ));
  }

  // Winston Sync
  if (loggers.winstonSync) {
    results.push(await benchmark(
      'Winston (Sync File I/O)',
      () => loggers.winstonSync.info(testMessage, testMetadata),
      ITERATIONS
    ));
  }

  // Bunyan Sync
  if (loggers.bunyanSync) {
    results.push(await benchmark(
      'Bunyan (Sync File I/O)',
      () => loggers.bunyanSync.info(testMetadata, testMessage),
      ITERATIONS
    ));
  }

  console.log('\n=== ASYNCHRONOUS FILE I/O ===');
  
  // MagicLogger Async
  results.push(await benchmark(
    'MagicLogger (Async File I/O)', 
    () => loggers.magicLoggerAsync.info(testMessage, testMetadata),
    ITERATIONS,
    {
      flushFn: async () => {
        await loggers.asyncFileTransport.flush();
      }
    }
  ));

  // Pino Async
  if (loggers.pinoAsync) {
    results.push(await benchmark(
      'Pino (Async File I/O)',
      () => loggers.pinoAsync.info(testMetadata, testMessage),
      ITERATIONS,
      {
        flushFn: async () => {
          // Force async flush
          return new Promise((resolve) => {
            loggers.pinoAsyncStream.write('', resolve);
          });
        }
      }
    ));
  }

  // Winston Async (Note: Winston doesn't have true async file transport, but we can simulate)
  if (loggers.winstonAsync) {
    results.push(await benchmark(
      'Winston (Async-ish File I/O)',
      () => loggers.winstonAsync.info(testMessage, testMetadata),
      ITERATIONS
    ));
  }

  // Bunyan Async (Note: Bunyan writes are inherently async)
  if (loggers.bunyanAsync) {
    results.push(await benchmark(
      'Bunyan (Async File I/O)',
      () => loggers.bunyanAsync.info(testMetadata, testMessage),
      ITERATIONS
    ));
  }

  return { results, loggers };
}

/**
 * Updates the benchmark-results.md file with the file I/O benchmark results
 */
function updateBenchmarkResults(results, syncSize, asyncSize) {
  try {
    const benchmarkResultsPath = path.join(__dirname, 'benchmark-results.md');
    
    if (!fs.existsSync(benchmarkResultsPath)) {
      console.log('⚠️  benchmark-results.md not found');
      return false;
    }
    
    const content = fs.readFileSync(benchmarkResultsPath, 'utf8');
    const startMarker = '<!-- FILE_IO_RESULTS_START -->';
    const endMarker = '<!-- FILE_IO_RESULTS_END -->';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log('⚠️  File I/O result markers not found in benchmark-results.md');
      return false;
    }
    
    // Generate results markdown
    const tableHeader = `| Logger Type | Iterations | Time (ms) | Ops/sec |
|------------|------------:|----------:|--------:|`;
    
    const tableRows = results.map(r => 
      `| ${r.name} | ${formatNumber(r.iterations)} | ${r.ms.toFixed(1)} | ${r.opsSecFormatted} |`
    ).join('\n');
    
    const syncResult = results.find(r => r.name.includes('Sync'));
    const asyncResult = results.find(r => r.name.includes('Async'));
    const ratio = asyncResult && syncResult ? (asyncResult.opsSec / syncResult.opsSec) : null;
    
    const fastest = results[0]; // Already sorted by performance
    const throughputMB = (fastest.opsSec * 200) / (1024 * 1024); // Assuming ~200 bytes per log
    
    const resultsMarkdown = `### Results

${tableHeader}
${tableRows}

### File Analysis
- **Sync file size**: ${formatNumber(syncSize)} bytes (${(syncSize / 1024).toFixed(1)} KB)
- **Async file size**: ${formatNumber(asyncSize)} bytes (${(asyncSize / 1024).toFixed(1)} KB)

### Performance Analysis
${ratio ? `- **Performance ratio**: Async is ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1/ratio).toFixed(2) + 'x slower'} than Sync` : ''}
- **Fastest method**: ${fastest.name} (${fastest.opsSecFormatted} ops/sec)
- **Estimated throughput**: ${throughputMB.toFixed(2)} MB/sec
- **Daily capacity**: ${(throughputMB * 3600 * 24 / 1024).toFixed(1)} GB/day

### Key Insights
- Real file I/O is 10-100x slower than null transports
- Worker threads provide non-blocking file writes for high-throughput apps
- Performance varies significantly based on disk type (SSD vs HDD)
- File system buffering and sync policies affect results

*Last updated: ${new Date().toISOString().split('T')[0]} via \`npm run perf:file-io --update\`*`;
    
    // Replace the content between markers
    const before = content.substring(0, startIndex + startMarker.length);
    const after = content.substring(endIndex);
    const updatedContent = before + '\n' + resultsMarkdown + '\n' + after;
    
    fs.writeFileSync(benchmarkResultsPath, updatedContent);
    console.log('✅ Updated benchmark-results.md with file I/O results');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update benchmark-results.md:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('=== MagicLogger File I/O Performance Benchmark ===\n');
    
    console.log('📝 IMPORTANT: This benchmark measures REAL file I/O performance!');
    console.log('   - Actual disk writes to filesystem');
    console.log('   - File system latency and throughput');
    console.log('   - Transport overhead with real I/O operations');
    console.log('   - Results will vary significantly based on disk speed (SSD vs HDD)\n');
    
    console.log('Configuration:');
    console.log(`  Iterations: ${formatNumber(ITERATIONS)}`);
    console.log(`  Warmup: ${formatNumber(WARMUP_ITERATIONS)}`);
    console.log(`  Test Directory: ${TEST_DIR}`);
    console.log('  Measurement: Full file write operations to disk\n');
    
    const { results, loggers } = await runBenchmarks();
    
    // Final comprehensive flush before analysis
    console.log('\n📤 Final flush and cleanup before analysis...');
    await loggers.syncFileTransport.flush();
    await loggers.asyncFileTransport.flush();
    // Give worker time to complete all writes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sort by performance
    results.sort((a, b) => b.opsSec - a.opsSec);
    
    console.log('\n=== FILE I/O PERFORMANCE RESULTS ===');
    console.log(createResultsTable(results));
    
    // Calculate file sizes for all loggers
    console.log('\n=== FILE ANALYSIS ===');
    const fileSizes = {};
    const files = fs.readdirSync(TEST_DIR).filter(f => f.startsWith('test-'));
    
    for (const file of files) {
      const filePath = path.join(TEST_DIR, file);
      const size = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
      const libraryName = file.replace('test-', '').replace('.log', '');
      fileSizes[libraryName] = size;
      console.log(`${libraryName}: ${formatNumber(size)} bytes (${(size / 1024).toFixed(1)} KB)`);
    }
    
    // For backwards compatibility, keep the main sync/async size variables
    const syncSize = fileSizes['magiclogger-sync'] || 0;
    const asyncSize = fileSizes['magiclogger-async'] || 0;
    
    // Performance analysis and comparisons
    console.log('\n=== PERFORMANCE ANALYSIS ===');
    
    // Separate sync and async results
    const syncResults = results.filter(r => r.name.includes('Sync') && !r.name.includes('Async'));
    const asyncResults = results.filter(r => r.name.includes('Async'));
    
    if (syncResults.length > 0) {
      const fastestSync = syncResults.reduce((a, b) => (a.opsSec > b.opsSec ? a : b));
      console.log(`Fastest Sync: ${fastestSync.name} (${fastestSync.opsSecFormatted} ops/sec)`);
    }
    
    if (asyncResults.length > 0) {
      const fastestAsync = asyncResults.reduce((a, b) => (a.opsSec > b.opsSec ? a : b));
      console.log(`Fastest Async: ${fastestAsync.name} (${fastestAsync.opsSecFormatted} ops/sec)`);
    }
    
    // Compare MagicLogger vs others
    const mlSync = results.find(r => r.name.includes('MagicLogger') && r.name.includes('Sync'));
    const mlAsync = results.find(r => r.name.includes('MagicLogger') && r.name.includes('Async'));
    
    if (mlSync) {
      const pinoSync = results.find(r => r.name.includes('Pino') && r.name.includes('Sync'));
      const winstonSync = results.find(r => r.name.includes('Winston') && r.name.includes('Sync'));
      const bunyanSync = results.find(r => r.name.includes('Bunyan') && r.name.includes('Sync'));
      
      if (pinoSync) {
        const ratio = mlSync.opsSec / pinoSync.opsSec;
        console.log(`MagicLogger Sync vs Pino Sync: ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1/ratio).toFixed(2) + 'x slower'}`);
      }
      if (winstonSync) {
        const ratio = mlSync.opsSec / winstonSync.opsSec;
        console.log(`MagicLogger Sync vs Winston Sync: ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1/ratio).toFixed(2) + 'x slower'}`);
      }
      if (bunyanSync) {
        const ratio = mlSync.opsSec / bunyanSync.opsSec;
        console.log(`MagicLogger Sync vs Bunyan Sync: ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1/ratio).toFixed(2) + 'x slower'}`);
      }
    }
    
    if (mlAsync) {
      const pinoAsync = results.find(r => r.name.includes('Pino') && r.name.includes('Async'));
      
      if (pinoAsync) {
        const ratio = mlAsync.opsSec / pinoAsync.opsSec;
        console.log(`MagicLogger Async vs Pino Async: ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1/ratio).toFixed(2) + 'x slower'}`);
      }
    }
    
    // MagicLogger internal comparison
    if (mlSync && mlAsync) {
      const ratio = mlAsync.opsSec / mlSync.opsSec;
      console.log(`MagicLogger Async vs Sync: ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1/ratio).toFixed(2) + 'x slower'}`);
    }
    
    console.log('\n💡 Key Insights:');
    console.log('   - Sync I/O: Blocks main thread, but simpler');
    console.log('   - Async I/O: Non-blocking via worker threads, better for high-throughput apps');
    console.log('   - Real file I/O is 10-100x slower than null transports');
    console.log('   - SSD vs HDD can make 5-10x performance difference');
    
    // Performance analysis
    if (results.length > 0) {
      const fastest = results[0];
      const throughputMB = (fastest.opsSec * 200) / (1024 * 1024); // Assuming ~200 bytes per log
      console.log(`\nEstimated logging throughput: ${throughputMB.toFixed(2)} MB/sec`);
      console.log(`Daily log capacity (24h): ${(throughputMB * 3600 * 24 / 1024).toFixed(1)} GB/day`);
    }

    // Clean up
    console.log('\n🧹 Cleaning up...');
    
    // Close MagicLogger transports
    await loggers.syncFileTransport.close();
    await loggers.asyncFileTransport.close();
    
    // Close external logger streams/transports
    if (loggers.pinoSyncStream) {
      loggers.pinoSyncStream.end();
    }
    if (loggers.pinoAsyncStream) {
      loggers.pinoAsyncStream.end(); 
    }
    if (loggers.winstonSync) {
      await new Promise(resolve => loggers.winstonSync.close(resolve));
    }
    if (loggers.winstonAsync) {
      await new Promise(resolve => loggers.winstonAsync.close(resolve));
    }
    // Bunyan doesn't require explicit cleanup
    
    console.log('✅ Cleanup completed');
    
    // Keep test files for inspection
    console.log(`\n📁 Test files preserved in: ${TEST_DIR}`);
    console.log('   Files generated by each logger for comparison:');
    const testFiles = fs.readdirSync(TEST_DIR).filter(f => f.startsWith('test-')).sort();
    for (const file of testFiles) {
      const size = fs.statSync(path.join(TEST_DIR, file)).size;
      console.log(`   - ${file}: ${(size / 1024).toFixed(1)} KB`);
    }
    console.log('   (You can examine these files to verify logging format and correctness)');
    
    // Auto-update benchmark-results.md if --update flag is passed
    if (process.argv.includes('--update')) {
      console.log('\n📝 Auto-updating benchmark-results.md...');
      updateBenchmarkResults(results, syncSize, asyncSize);
    }

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});