/**
 * Compare MagicLogger with Pino to understand the performance gap
 */

import { Logger } from '../../dist/index.js';
import { performance } from 'perf_hooks';
import fs from 'fs';

// Try to load Pino
let pino;
try {
  const pinoModule = await import('pino');
  pino = pinoModule.default;
} catch (e) {
  console.error('Pino not installed. Run: npm install pino');
  process.exit(1);
}

// Null transport for MagicLogger
class NullTransport {
  constructor() {
    this.name = 'null';
    this.enabled = true;
  }
  log(entry) {}
  shouldLog() { return true; }
  async close() {}
  async flush() {}
}

// Test configuration
const ITERATIONS = 100000;

async function benchmark(name, logFn) {
  const times = [];
  
  // Warmup
  for (let i = 0; i < 1000; i++) {
    logFn('warmup');
  }
  
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const opStart = performance.now();
    logFn('test message');
    times.push(performance.now() - opStart);
  }
  const total = performance.now() - start;
  
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p50 = times[Math.floor(times.length * 0.5)];
  const p99 = times[Math.floor(times.length * 0.99)];
  
  return {
    name,
    opsPerSec: Math.round(ITERATIONS / (total / 1000)),
    avg: (avg * 1000).toFixed(2),
    p50: (p50 * 1000).toFixed(2),
    p99: (p99 * 1000).toFixed(2)
  };
}

async function compareLoggers() {
  console.log('=== MagicLogger vs Pino Performance Comparison ===\n');
  console.log('Testing with null/extreme transport (no I/O)...\n');
  
  const results = [];
  
  // 1. Pino with destination to null (Windows compatible)
  const nullStream = fs.createWriteStream('nul'); // Windows null device
  const pinoNull = pino({ base: null }, nullStream);
  results.push(await benchmark('Pino (null stream)', (msg) => pinoNull.info(msg)));
  
  // 2. Pino with minimal config
  const pinoMinimal = pino({ 
    base: null,
    timestamp: false,
    formatters: {
      level: (label, number) => ({ level: number })
    }
  });
  results.push(await benchmark('Pino (minimal)', (msg) => pinoMinimal.info(msg)));
  
  // 3. MagicLogger with null transport
  const magicLogger = new Logger({
    useConsole: false,
    transports: [new NullTransport()]
  });
  results.push(await benchmark('MagicLogger (null)', (msg) => magicLogger.info(msg)));
  
  // 4. MagicLogger without any processing
  const minimalLogger = new Logger({
    useConsole: false,
    transports: []
  });
  results.push(await benchmark('MagicLogger (no transport)', (msg) => minimalLogger.info(msg)));
  
  // Print results
  console.log('| Logger | Ops/sec | Avg (µs) | P50 (µs) | P99 (µs) |');
  console.log('|--------|---------|----------|----------|----------|');
  results.forEach(r => {
    console.log(`| ${r.name.padEnd(26)} | ${r.opsPerSec.toLocaleString().padStart(7)} | ${r.avg.padStart(8)} | ${r.p50.padStart(8)} | ${r.p99.padStart(8)} |`);
  });
  
  console.log('\n=== Analysis ===\n');
  
  // Now let's analyze what Pino does differently
  console.log('Pino optimizations:');
  console.log('1. Uses binary format internally (not JSON during logging)');
  console.log('2. Defers serialization to worker thread');
  console.log('3. Uses integer log levels (no string comparisons)');
  console.log('4. Pre-compiled logging functions');
  console.log('5. Minimal object allocations');
  
  console.log('\nMagicLogger overhead:');
  console.log('1. Creates LogEntry object even with pooling');
  console.log('2. String-based log levels');
  console.log('3. Multiple property assignments');
  console.log('4. Style checking even for plain messages');
  console.log('5. Method call overhead (info -> log -> createLogEntry)');
  
  // Let's measure just the core operations
  console.log('\n=== Core Operation Costs ===\n');
  
  // Measure Pino's approach
  const pinoTimes = [];
  for (let i = 0; i < 100000; i++) {
    const start = performance.now();
    const obj = { msg: 'test', level: 30, time: Date.now() };
    pinoTimes.push(performance.now() - start);
  }
  console.log(`Pino-style object: ${(pinoTimes.reduce((a,b) => a+b, 0) / pinoTimes.length * 1000).toFixed(2)}µs`);
  
  // Measure MagicLogger's approach
  const magicTimes = [];
  for (let i = 0; i < 100000; i++) {
    const start = performance.now();
    const obj = {
      id: i.toString(),
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      level: 'info',
      message: 'test',
      loggerId: undefined,
      tags: undefined,
      context: undefined,
      error: undefined,
      metadata: undefined
    };
    magicTimes.push(performance.now() - start);
  }
  console.log(`MagicLogger object: ${(magicTimes.reduce((a,b) => a+b, 0) / magicTimes.length * 1000).toFixed(2)}µs`);
}

compareLoggers().catch(console.error);