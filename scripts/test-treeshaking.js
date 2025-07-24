#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Tree-Shaking Test Script
 * 
 * This script verifies that tree-shaking works correctly by:
 * 1. Building test bundles with different import patterns
 * 2. Analyzing bundle sizes
 * 3. Verifying that unused code is not included
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test cases for tree-shaking
const testCases = [
  {
    name: 'Core Logger Only',
    code: `
      import { Logger } from 'magiclogger';
      const logger = new Logger();
      logger.info('test');
    `,
    expectedSize: 15000 // ~15KB
  },
  {
    name: 'Console Transport',
    code: `
      import { Logger } from 'magiclogger';
      import { ConsoleTransport } from 'magiclogger/transports/console';
      const logger = new Logger({
        transports: [new ConsoleTransport()]
      });
      logger.info('test');
    `,
    expectedSize: 18000 // ~18KB
  },
  {
    name: 'Winston Compatibility',
    code: `
      import { createWinstonCompatible } from 'magiclogger/compatibility/winston';
      const logger = createWinstonCompatible();
      logger.info('test');
    `,
    expectedSize: 25000 // ~25KB
  },
  {
    name: 'Types Only',
    code: `
      import type { LoggerOptions, LogLevel } from 'magiclogger';
      const config: LoggerOptions = { id: 'test' };
      console.log(config);
    `,
    expectedSize: 1000 // ~1KB (minimal runtime code)
  }
];

async function runTest(testCase, index) {
  const testDir = path.join(__dirname, '../temp-tests');
  const testFile = path.join(testDir, `test-${index}.ts`);
  
  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Write test file
  fs.writeFileSync(testFile, testCase.code);
  
  try {
    // Build with esbuild for size analysis
    const outFile = path.join(testDir, `bundle-${index}.js`);
    execSync(`npx esbuild ${testFile} --bundle --minify --outfile=${outFile} --platform=node --format=esm`, {
      stdio: 'pipe'
    });
    
    // Get bundle size
    const stats = fs.statSync(outFile);
    const size = stats.size;
    
    // Check if size is within expected range (±20%)
    const tolerance = testCase.expectedSize * 0.2;
    const isWithinRange = Math.abs(size - testCase.expectedSize) <= tolerance;
    
    console.log(`✓ ${testCase.name}: ${size} bytes (expected: ~${testCase.expectedSize} bytes) ${isWithinRange ? '✅' : '❌'}`);
    
    return { name: testCase.name, size, expected: testCase.expectedSize, pass: isWithinRange };
  } catch (error) {
    console.log(`✗ ${testCase.name}: Build failed - ${error.message}`);
    return { name: testCase.name, size: 0, expected: testCase.expectedSize, pass: false };
  }
}

async function main() {
  console.log('🌲 Running Tree-Shaking Tests\n');
  
  // Build the library first
  try {
    console.log('Building MagicLogger...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Build complete\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
  
  // Run tests
  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const result = await runTest(testCases[i], i);
    results.push(result);
  }
  
  // Summary
  console.log('\n📊 Tree-Shaking Test Results:');
  console.log('====================================');
  
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.pass ? '✅ PASS' : '❌ FAIL';
    const efficiency = result.size > 0 ? ((result.expected - result.size) / result.expected * 100).toFixed(1) : 0;
    console.log(`${status} ${result.name}: ${result.size}B (${efficiency}% efficient)`);
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  // Cleanup
  const testDir = path.join(__dirname, '../temp-tests');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  
  if (passed === total) {
    console.log('🎉 All tree-shaking tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tree-shaking tests failed. Check bundle configuration.');
    process.exit(1);
  }
}

main().catch(console.error);
