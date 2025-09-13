#!/usr/bin/env node

import { AsyncLogger } from '../../dist/async/logger.js';
import { performance } from 'perf_hooks';

async function test() {
  console.log('Testing AsyncLogger performance...');
  
  const logger = new AsyncLogger({
    useConsole: false,
    transports: [],
    worker: { enabled: false }
  });
  
  await logger.waitForReady();
  
  const iterations = 10000;
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    logger.info(`Test message ${i}`);
  }
  
  await logger.flush();
  const duration = performance.now() - start;
  
  const opsPerSec = Math.round((iterations / duration) * 1000);
  console.log(`Performance: ${opsPerSec.toLocaleString()} ops/sec`);
  console.log(`Duration: ${duration.toFixed(2)}ms for ${iterations} logs`);
  console.log(`Average: ${(duration / iterations).toFixed(4)}ms per log`);
  
  await logger.close();
}

test().catch(console.error);