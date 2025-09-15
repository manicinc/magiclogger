#!/usr/bin/env node
/**
 * MagicLogger Performance Benchmark Suite
 * 
 * Comprehensive benchmark testing all transports including AsyncFileTransport
 * Compares with Pino and tests both styled and unstyled output
 */

import { Logger } from '../../dist/index.js';
import { AsyncLogger } from '../../dist/async/logger.js';
import { SyncFileTransport } from '../../dist/transports/SyncFileTransport.js';
import { AsyncFileTransport } from '../../dist/transports/AsyncFileTransport.js';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import bunyan from 'bunyan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ITERATIONS = parseInt(process.env.BENCHMARK_ITERATIONS) || 20000;
const WARMUP = 100;
const TEST_DIR = path.join(__dirname, 'bench-output');
const UPDATE_README = process.argv.includes('--update');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Track active transports for cleanup
const activeTransports = new Set();

// Setup test directory
function setupTestDir() {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  const files = fs.readdirSync(TEST_DIR);
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(TEST_DIR, file));
    } catch {}
  }
}

// Cleanup test directory
function cleanupTestDir() {
  setTimeout(() => {
    try {
      if (fs.existsSync(TEST_DIR)) {
        const files = fs.readdirSync(TEST_DIR);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(TEST_DIR, file));
          } catch {}
        }
        fs.rmdirSync(TEST_DIR);
      }
    } catch {}
  }, 1000);
}

// Benchmark a logger configuration
async function benchmarkLogger(name, setupFn, iterations = ITERATIONS, useStyled = false) {
  const blockingTimes = [];
  
  try {
    // Setup logger
    const { logger, cleanup } = await setupFn();
    
    // Test data
    const testData = {
      timestamp: Date.now(),
      requestId: 'req-123456',
      userId: 'user-789',
      action: 'GET /api/users',
      duration: 45,
      status: 200
    };
    
    // Warmup
    for (let i = 0; i < WARMUP; i++) {
      if (useStyled) {
        logger.info(`<green>✓</> Request <cyan>${i}</> completed`);
      } else {
        logger.info(`Request warmup ${i}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Benchmark
    const totalStart = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const blockStart = performance.now();
      
      if (useStyled) {
        logger.info(`<green>✓</> Request <cyan>${i}</> in <yellow>${testData.duration}ms</>`);
      } else {
        logger.info(`Request processed ${i} in ${testData.duration}ms`);
      }
      
      const blockEnd = performance.now();
      blockingTimes.push(blockEnd - blockStart);
    }
    
    const totalTime = performance.now() - totalStart;
    
    // Cleanup with timeout protection
    if (cleanup) {
      const cleanupPromise = cleanup();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      
      try {
        await Promise.race([cleanupPromise, timeoutPromise]);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Calculate statistics
    blockingTimes.sort((a, b) => a - b);
    const avg = blockingTimes.reduce((a, b) => a + b, 0) / blockingTimes.length;
    const p50 = blockingTimes[Math.floor(blockingTimes.length * 0.5)];
    const p95 = blockingTimes[Math.floor(blockingTimes.length * 0.95)];
    const p99 = blockingTimes[Math.floor(blockingTimes.length * 0.99)];
    const max = blockingTimes[blockingTimes.length - 1];
    
    return {
      name,
      iterations,
      totalMs: totalTime,
      opsPerSec: Math.round(iterations / (totalTime / 1000)),
      blocking: { avg, p50, p95, p99, max }
    };
  } catch (error) {
    console.error(`  ${colors.red}✗ Failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Create results table
function createResultsTable(results) {
  const validResults = results.filter(r => r !== null);
  if (validResults.length === 0) return 'No successful benchmarks';
  
  validResults.sort((a, b) => b.opsPerSec - a.opsPerSec);
  
  const lines = [];
  lines.push('| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |');
  lines.push('|--------|--------:|---------:|----:|----:|----:|----:|');
  
  for (const r of validResults) {
    lines.push(
      `| ${r.name.padEnd(35)} | ${r.opsPerSec.toLocaleString().padStart(7)} | ${r.blocking.avg.toFixed(3).padStart(8)} | ${r.blocking.p50.toFixed(3)} | ${r.blocking.p95.toFixed(3)} | ${r.blocking.p99.toFixed(3)} | ${r.blocking.max.toFixed(3)} |`
    );
  }
  
  return lines.join('\n');
}

// Main benchmark function
async function runBenchmarks() {
  console.log(`${colors.bright}${colors.cyan}=== MagicLogger Real-World Performance Benchmark ===${colors.reset}\n`);
  console.log(`📊 Measuring ACTUAL production metrics:`);
  console.log(`   - Main thread blocking (responsiveness)`);
  console.log(`   - Real file I/O throughput`);
  console.log(`   - Latency percentiles`);
  console.log(`   - BOTH styled and unstyled output\n`);
  
  console.log(`Configuration:`);
  console.log(`  Iterations: ${ITERATIONS.toLocaleString()}`);
  console.log(`  Output: Real file I/O`);
  console.log(`  Payload: Realistic application data\n`);
  
  setupTestDir();
  
  const plainResults = [];
  const styledResults = [];
  
  try {
    // ========================================
    // PLAIN TEXT BENCHMARKS
    // ========================================
    console.log(`${colors.bright}📝 === TESTING PLAIN TEXT (No Styling) ===${colors.reset}\n`);
    
    // 1. Sync  
    console.log('Testing MagicLogger (Sync - Plain)...');
    const syncResult = await benchmarkLogger('MagicLogger (Sync)', async () => {
      const transport = new SyncFileTransport({
        filepath: path.join(TEST_DIR, 'sync.log'),
        bufferSize: 1000,  // Default buffering for better performance
        flushInterval: 50
      });
      
      activeTransports.add(transport);
      
      const logger = new Logger({
        useColors: false,
        transports: [transport],
        useConsole: false
      });
      
      return { 
        logger,
        cleanup: async () => {
          await transport.close();
          activeTransports.delete(transport);
        }
      };
    });
    if (syncResult) plainResults.push(syncResult);
    
    // 2. Async with Worker Threads
    console.log('Testing MagicLogger (Async - Plain)...');
    const asyncResult = await benchmarkLogger('MagicLogger (Async)', async () => {
      const transport = new AsyncFileTransport({
        filepath: path.join(TEST_DIR, 'async.log')
      });
      
      await transport.init();
      activeTransports.add(transport);
      
      // Use AsyncLogger without workers for consistent comparison
      const logger = new AsyncLogger({
        useColors: false,
        transports: [transport],
        useConsole: false,
        useWorkers: false  // Disable workers for accurate comparison
      });
      
      await logger.waitForReady();
      
      return { 
        logger,
        cleanup: async () => {
          try {
            await logger.flush();
            await logger.close();
            await transport.close();
          } catch {}
          activeTransports.delete(transport);
        }
      };
    });
    if (asyncResult) plainResults.push(asyncResult);
    
    // Removed old third mode (buffered) - now we only have sync and async
    
    // 3. Winston Plain
    console.log('Testing Winston (Plain)...');
    try {
      const winstonPlainResult = await benchmarkLogger('Winston (Plain)', async () => {
        const logger = winston.createLogger({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()  // JSON structured logging like MagicLogger
          ),
          transports: [
            new winston.transports.File({
              filename: path.join(TEST_DIR, 'winston-plain.log')
            })
          ]
        });

        return { logger };
      });
      if (winstonPlainResult) plainResults.push(winstonPlainResult);
    } catch (e) {
      console.log(`  ${colors.yellow}⚠ Winston test failed: ${e.message}${colors.reset}`);
    }
    
    // 4. Bunyan Plain
    console.log('Testing Bunyan (Plain)...');
    try {
      // Create a write stream for better performance
      const bunyanStream = fs.createWriteStream(path.join(TEST_DIR, 'bunyan.log'), {
        flags: 'a',
        highWaterMark: 64 * 1024  // 64KB buffer
      });

      const bunyanResult = await benchmarkLogger('Bunyan', async () => {
        const logger = bunyan.createLogger({
          name: 'benchmark',
          src: false,  // Disable source location tracking for performance
          streams: [{
            level: 'info',
            stream: bunyanStream
          }]
        });

        return {
          logger,
          cleanup: async () => {
            bunyanStream.end();
          }
        };
      });
      if (bunyanResult) plainResults.push(bunyanResult);
    } catch (e) {
      console.log(`  ${colors.yellow}⚠ Bunyan test failed: ${e.message}${colors.reset}`);
    }

    // 5. Pino
    console.log('Testing Pino (Plain)...');
    let pinoStream = null;
    try {
      const pinoModule = await import('pino');
      const pino = pinoModule.default;
      
      const pinoResult = await benchmarkLogger('Pino', async () => {
        pinoStream = pino.destination({ 
          dest: path.join(TEST_DIR, 'pino.log'),
          sync: false
        });
        
        const logger = pino({
          base: null,  // Still exclude base fields for fair comparison
          timestamp: true,  // Include timestamp like MagicLogger
          formatters: {
            level: (label) => {
              return { level: label };
            }
          }
        }, pinoStream);
        
        return { 
          logger,
          cleanup: async () => {
            // Don't destroy the stream here, do it later
          }
        };
      });
      
      if (pinoResult) plainResults.push(pinoResult);
    } catch {
      console.log('  Pino not available');
    }
    
    // ========================================
    // STYLED OUTPUT BENCHMARKS
    // ========================================
    console.log(`\n${colors.bright}🎨 === TESTING STYLED OUTPUT ===${colors.reset}\n`);
    
    // 1. Sync Styled
    console.log('Testing MagicLogger (Sync - Styled)...');
    const styledSync = await benchmarkLogger('MagicLogger (Sync + Styles)', async () => {
      const transport = new SyncFileTransport({
        filepath: path.join(TEST_DIR, 'sync-styled.log'),
        bufferSize: 1000,  // Default buffering for better performance
        flushInterval: 50
      });
      
      activeTransports.add(transport);
      
      const logger = new Logger({
        useColors: true,
        transports: [transport],
        useConsole: false
      });
      
      return { 
        logger,
        cleanup: async () => {
          await transport.close();
          activeTransports.delete(transport);
        }
      };
    }, ITERATIONS, true);
    if (styledSync) styledResults.push(styledSync);
    
    // 2. Async Styled (styles processed in MAIN thread, not workers)
    console.log('Testing MagicLogger (Async - Styled)...');
    const styledAsync = await benchmarkLogger('MagicLogger (Async + Styles)', async () => {
      const transport = new AsyncFileTransport({
        filepath: path.join(TEST_DIR, 'async-styled.log')
      });

      await transport.init();
      activeTransports.add(transport);

      // Use AsyncLogger with styles processed in MAIN thread for accurate comparison
      const logger = new AsyncLogger({
        useColors: true,  // Enable styling
        transports: [transport],
        useConsole: false,
        useWorkers: false  // Process styles in main thread, not workers
      });
      
      await logger.waitForReady();
      
      return { 
        logger,
        cleanup: async () => {
          try {
            await logger.flush();
            await logger.close();
            await transport.close();
          } catch {}
          activeTransports.delete(transport);
        }
      };
    }, ITERATIONS, true);
    if (styledAsync) styledResults.push(styledAsync);
    
    // 3. Winston Styled
    console.log('Testing Winston (Sync + Styled)...');
    try {
      const winstonStyledResult = await benchmarkLogger('Winston (Sync + Styled)', async () => {
        const logger = winston.createLogger({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.json()  // JSON structured logging with colors
          ),
          transports: [
            new winston.transports.File({
              filename: path.join(TEST_DIR, 'winston-styled.log')
            })
          ]
        });

        return { logger };
      }, ITERATIONS, false);
      if (winstonStyledResult) styledResults.push(winstonStyledResult);
    } catch (e) {
      console.log(`  ${colors.yellow}⚠ Winston test failed: ${e.message}${colors.reset}`);
    }
    
    // 4. Bunyan Styled (with colors)
    console.log('Testing Bunyan (Styled)...');
    try {
      // Create a write stream for better performance
      const bunyanStyledStream = fs.createWriteStream(path.join(TEST_DIR, 'bunyan-styled.log'), {
        flags: 'a',
        highWaterMark: 64 * 1024  // 64KB buffer
      });

      const bunyanStyledResult = await benchmarkLogger('Bunyan (Styled)', async () => {
        const logger = bunyan.createLogger({
          name: 'benchmark',
          src: false,  // Disable source location for performance
          streams: [{
            level: 'info',
            stream: bunyanStyledStream
          }]
        });

        return {
          logger,
          cleanup: async () => {
            bunyanStyledStream.end();
          }
        };
      }, ITERATIONS, false);
      if (bunyanStyledResult) styledResults.push(bunyanStyledResult);
    } catch (e) {
      console.log(`  ${colors.yellow}⚠ Bunyan styled test failed: ${e.message}${colors.reset}`);
    }

    // 5. Pino with pino-pretty (async worker thread)
    console.log('Testing Pino (Pretty - Async Worker)...');
    try {
      const pinoModule = await import('pino');
      const pino = pinoModule.default;
      
      const pinoPrettyResult = await benchmarkLogger('Pino (Pretty)', async () => {
        const transport = pino.transport({
          target: 'pino-pretty',
          options: {
            destination: path.join(TEST_DIR, 'pino-pretty.log'),
            colorize: true,
            translateTime: false,
            ignore: 'pid,hostname'
          }
        });
        
        const logger = pino({
          base: null,  // Still exclude base fields for fair comparison
          timestamp: true  // Include timestamp for structured logging
        }, transport);
        
        return { 
          logger,
          cleanup: async () => {
            try {
              transport.end();
            } catch {}
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        };
      }, Math.min(ITERATIONS, 2000), true); // Limit iterations for pino-pretty to avoid timeout
      
      if (pinoPrettyResult) styledResults.push(pinoPrettyResult);
    } catch (e) {
      console.log('  Pino Pretty not available:', e.message);
    }
    
    // Clean up pino stream if it exists
    if (pinoStream) {
      try {
        pinoStream.destroy();
      } catch {}
    }
    
  } catch (error) {
    console.error(`\n${colors.red}Benchmark error: ${error.message}${colors.reset}`);
  }
  
  // ========================================
  // RESULTS
  // ========================================
  console.log(`\n${colors.bright}${colors.green}=== RESULTS ===${colors.reset}\n`);
  
  if (plainResults.length > 0) {
    console.log(`${colors.bright}📝 PLAIN TEXT PERFORMANCE:${colors.reset}`);
    console.log(createResultsTable(plainResults));
  }
  
  if (styledResults.length > 0) {
    console.log(`\n${colors.bright}🎨 STYLED OUTPUT PERFORMANCE:${colors.reset}`);
    console.log(createResultsTable(styledResults));
  }
  
  // Styling overhead analysis
  if (plainResults.length > 0 && styledResults.length > 0) {
    console.log(`\n${colors.bright}=== STYLING OVERHEAD ANALYSIS ===${colors.reset}\n`);
    
    const comparisons = [];
    for (const plain of plainResults) {
      const styled = styledResults.find(s => {
        const plainType = plain.name.split('(')[1]?.split(')')[0];
        return s.name.includes(plainType);
      });
      if (styled) {
        const overhead = ((1 - styled.opsPerSec / plain.opsPerSec) * 100).toFixed(1);
        comparisons.push({
          type: plain.name.split('(')[1]?.split(')')[0] || plain.name,
          plain: plain.opsPerSec,
          styled: styled.opsPerSec,
          overhead: `${overhead}%`
        });
      }
    }
    
    if (comparisons.length > 0) {
      console.log('| Type | Plain (ops/sec) | Styled (ops/sec) | Overhead |');
      console.log('|------|-----------------|------------------|----------|');
      comparisons.forEach(c => {
        console.log(`| ${c.type.padEnd(12)} | ${c.plain.toLocaleString().padStart(15)} | ${c.styled.toLocaleString().padStart(16)} | ${c.overhead.padStart(8)} |`);
      });
      
      const avgOverhead = comparisons.reduce((sum, c) => sum + parseFloat(c.overhead), 0) / comparisons.length;
      console.log(`\nAverage styling overhead: ${avgOverhead.toFixed(1)}%`);
    }
  }
  
  // Key insights
  console.log(`\n${colors.bright}${colors.yellow}=== KEY INSIGHTS ===${colors.reset}\n`);
  
  const allResults = [...plainResults, ...styledResults].filter(r => r !== null);
  if (allResults.length > 0) {
    allResults.sort((a, b) => b.opsPerSec - a.opsPerSec);
    
    const fastest = allResults[0];
    const slowest = allResults[allResults.length - 1];
    
    console.log(`🚀 Fastest: ${fastest.name} (${fastest.opsPerSec.toLocaleString()} ops/sec)`);
    console.log(`🐌 Slowest: ${slowest.name} (${slowest.opsPerSec.toLocaleString()} ops/sec)`);
    console.log(`📊 Speed difference: ${(fastest.opsPerSec / slowest.opsPerSec).toFixed(1)}x`);
    
    const lowestBlocking = allResults.reduce((min, r) => 
      r.blocking.avg < min.blocking.avg ? r : min
    );
    console.log(`⚡ Lowest blocking: ${lowestBlocking.name} (${lowestBlocking.blocking.avg.toFixed(3)}ms avg)`);
    
    // Async vs Sync comparison
    const asyncPlain = plainResults.find(r => r.name.includes('Async'));
    const syncPlain = plainResults.find(r => r.name.includes('Sync'));
    if (asyncPlain && syncPlain) {
      console.log(`\n📈 Async vs Sync:`);
      console.log(`   Async: ${asyncPlain.opsPerSec.toLocaleString()} ops/sec`);
      console.log(`   Sync:  ${syncPlain.opsPerSec.toLocaleString()} ops/sec`);
      if (asyncPlain.opsPerSec > syncPlain.opsPerSec) {
        console.log(`   Async is ${(asyncPlain.opsPerSec / syncPlain.opsPerSec).toFixed(1)}x faster`);
      } else {
        console.log(`   Sync is ${(syncPlain.opsPerSec / asyncPlain.opsPerSec).toFixed(1)}x faster`);
      }
    }
  }
  
  // Update README if requested
  if (UPDATE_README) {
    console.log(`\n${colors.bright}📝 Updating benchmark results...${colors.reset}`);
    await updateBenchmarkResults(allResults);
  }
  
  console.log(`\n${colors.bright}${colors.green}✅ Benchmark complete!${colors.reset}`);
  
  // Clean up any remaining transports
  for (const transport of activeTransports) {
    try {
      if (transport.close) await transport.close();
    } catch {}
  }
  activeTransports.clear();
  
  cleanupTestDir();
}

// Update benchmark results file
async function updateBenchmarkResults(results) {
  const resultsPath = path.join(__dirname, 'benchmark-results.md');
  
  try {
    const content = `# MagicLogger Performance Benchmark Results

Last updated: ${new Date().toISOString()}
Node.js: ${process.version}
Platform: ${process.platform}
Iterations: ${ITERATIONS.toLocaleString()}

## Results

${createResultsTable(results)}

## Configuration
- Test iterations: ${ITERATIONS.toLocaleString()}
- Warmup iterations: ${WARMUP}
- Output: Real file I/O
- Platform: ${process.platform}
- Node.js: ${process.version}
`;
    
    fs.writeFileSync(resultsPath, content);
    console.log('✓ Benchmark results updated');
  } catch (error) {
    console.error('Failed to update results:', error.message);
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\nBenchmark interrupted. Cleaning up...');
  
  // Close all active transports
  for (const transport of activeTransports) {
    try {
      if (transport.close) transport.close();
    } catch {}
  }
  
  cleanupTestDir();
  process.exit(0);
});

// Handle uncaught errors to prevent crash from async file operations
process.on('uncaughtException', (error) => {
  if (error.code === 'EBADF' && error.message.includes('bad file descriptor')) {
    // Ignore file descriptor cleanup errors
    return;
  }
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Suppress theme warnings
process.env.MAGICLOGGER_SILENCE_THEME_WARNINGS = '1';

// Run benchmarks
runBenchmarks().catch(error => {
  console.error('Benchmark failed:', error);
  cleanupTestDir();
  process.exit(1);
});