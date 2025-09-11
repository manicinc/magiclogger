/* eslint-env node */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const README = path.join(ROOT, 'README.md');
const BENCH_SCRIPT = path.join(ROOT, 'scripts', 'performance', 'perf-bench.mjs');

function runBench() {
  // Check if benchmark script exists
  if (!existsSync(BENCH_SCRIPT)) {
    console.error(`Benchmark script not found at: ${BENCH_SCRIPT}`);
    process.exit(1);
  }

  // Build local dist so benchmarks import from ../../dist
  console.log('Building project...');
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true
  });
  
  if (build.status !== 0) {
    console.error('Build failed. Trying to run benchmark anyway...');
    // Don't exit, try to run benchmark with existing dist
  }

  console.log('Running benchmarks...');
  const res = spawnSync('node', [BENCH_SCRIPT], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024 // Increase buffer to 50MB for large outputs
  });

  if (res.error) {
    console.error('Failed to spawn benchmark process:', res.error);
    process.exit(1);
  }

  if (res.status !== 0) {
    console.error('Benchmark failed with exit code:', res.status);
    console.error('stderr:', res.stderr);
    console.error('stdout:', res.stdout);
    process.exit(1);
  }

  if (!res.stdout) {
    console.error('No output from benchmark');
    process.exit(1);
  }

  return res.stdout;
}

function extractBlock(output) {
  const match = output.match(/<!-- PERF_TABLE_START -->([\s\S]*?)<!-- PERF_TABLE_END -->/);
  if (!match) {
    console.error('No PERF_TABLE block found in benchmark output');
    console.error('Output received:', output.substring(0, 500));
    throw new Error('No PERF_TABLE block in output');
  }
  return `<!-- PERF_TABLE_START -->\n${match[1].trim()}\n<!-- PERF_TABLE_END -->`;
}

function updateReadme(block) {
  if (!existsSync(README)) {
    console.error(`README.md not found at: ${README}`);
    process.exit(1);
  }

  const md = readFileSync(README, 'utf8');
  const regex = /<!-- PERF_TABLE_START -->[\s\S]*?<!-- PERF_TABLE_END -->/g;
  const matches = md.match(regex);
  
  if (!matches) {
    console.log('No existing performance table found in README. Adding one...');
    // Find a good place to insert the table
    const perfSectionRegex = /## Performance/i;
    if (perfSectionRegex.test(md)) {
      // Insert after Performance heading
      const next = md.replace(perfSectionRegex, (match) => {
        return `${match}\n\n${block}`;
      });
      writeFileSync(README, next);
    } else {
      // Append at the end
      const next = md + `\n\n## Performance\n\n${block}\n`;
      writeFileSync(README, next);
    }
  } else {
    console.log(`Found ${matches.length} performance table(s) in README. Updating...`);
    // Replace all occurrences
    const next = md.replace(regex, block);
    writeFileSync(README, next);
  }
}

try {
  console.log('Starting performance benchmark update...');
  const out = runBench();
  const block = extractBlock(out);
  updateReadme(block);
  console.log('✅ Successfully updated README performance table.');
  
  // Also save the full output
  const outputPath = path.join(ROOT, 'scripts', 'performance', 'benchmark-results.md');
  writeFileSync(outputPath, out);
  console.log(`✅ Saved full benchmark output to ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to update performance table:', error.message);
  process.exit(1);
}