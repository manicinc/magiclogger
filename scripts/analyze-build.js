/* eslint-env node */
import { readFileSync, existsSync, writeFileSync } from 'fs';
import * as path from 'path';
import { gzipSync } from 'zlib';
import prettyBytes from 'pretty-bytes';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const README_PATH = path.join(__dirname, '..', 'README.md');

const FILES = [
  { file: 'index.cjs', label: 'CJS' },
  { file: 'index.js', label: 'ESM' },
  { file: 'index.d.ts', label: 'Types' }
];

// Thresholds (bytes). Overridable via env.
const CHECK_MODE = (process.env.BUNDLE_CHECK_MODE || 'gzip').toLowerCase();
const MAX_ESM_SIZE = parseInt(process.env.BUNDLE_MAX_ESM || '', 10) || 30 * 1024;
const MAX_CJS_SIZE = parseInt(process.env.BUNDLE_MAX_CJS || '', 10) || 35 * 1024;
const MAX_ESM_GZIP = parseInt(process.env.BUNDLE_MAX_ESM_GZIP || '', 10) || 40 * 1024;
const MAX_CJS_GZIP = parseInt(process.env.BUNDLE_MAX_CJS_GZIP || '', 10) || 50 * 1024;

/**
 * Generate a markdown table for file sizes
 */
function generateTable(files) {
  const header = `| File | Format | Raw Size | Gzip |`;
  const rows = files.map(({ file, label, size, gzip }) => 
    `| \`${file}\` | ${label} | ${size} | ${gzip} |`
  ).join('\n');
  return `${header}\n|------|--------|----------|------|\n${rows}`;
}

/**
 * Remove legacy bundle_size badges (the old ambiguous ones)
 * This only removes the specific legacy badge, nothing else
 */
function removeLegacyBundleBadge(readme) {
  // Only target the specific legacy badge pattern
  const regex = /<img[^>]*src=["']https:\/\/img\.shields\.io\/badge\/bundle_size-[^"']+["'][^>]*>/gi;
  return readme.replace(regex, '');
}

/**
 * Measure a bundled scenario in bytes (gzipped)
 * @param {Array<{path: string, symbols?: string[]}>} imports - Modules to import
 */
async function measureScenarioGzip(imports) {
  // Build the import statements
  const contents = imports
    .map((m, i) => {
      const p = m.path.replace(/"/g, '\\"');
      if (m.symbols && m.symbols.length) {
        const syms = m.symbols.join(', ');
        // Keep references to prevent tree-shaking
        return `import { ${syms} } from "${p}";\n(globalThis.__ml_keep ||= []).push(${syms});`;
      }
      return `import * as m${i} from "${p}";\n(globalThis.__ml_keep ||= []).push(m${i});`;
    })
    .join('\n');

  // Bundle with esbuild
  const result = await build({
    stdin: {
      contents,
      resolveDir: path.join(__dirname, '..'),
      sourcefile: 'scenario-entry.js',
      loader: 'js',
    },
    bundle: true,
    splitting: false,
    format: 'esm',
    platform: 'node',
    target: ['es2020'],
    minify: true,
    logLevel: 'silent',
    write: false,
  });

  const out = result.outputFiles?.[0]?.text || '';
  return gzipSync(Buffer.from(out, 'utf8')).length;
}

/**
 * Measure all bundle scenarios
 */
async function measureAllScenarios() {
  const scenarios = {
    // Core scenarios
    'Core (bare minimum)': [
      { path: './dist/index.js', symbols: ['Logger'] },
    ],
    'Core + Console Transport': [
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/transports/console.js', symbols: ['ConsoleTransport'] },
    ],
    'Core + File Transport': [
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/transports/file.js', symbols: ['FileTransport'] },
    ],
    'Core + HTTP Transport': [
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/transports/http.js', symbols: ['HTTPTransport'] },
    ],
    'Core + All Basic Transports': [
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/transports/console.js', symbols: ['ConsoleTransport'] },
      { path: './dist/transports/file.js', symbols: ['FileTransport'] },
      { path: './dist/transports/stream.js', symbols: ['StreamTransport'] },
      { path: './dist/transports/http.js', symbols: ['HTTPTransport'] },
    ],
    
    // Sync Logger scenarios
    'SyncLogger Only (tree-shaken)': [
      { path: './dist/sync/logger.js', symbols: ['SyncLogger'] },
    ],
    'AsyncLogger + SyncLogger': [
      { path: './dist/index.js', symbols: ['Logger', 'SyncLogger'] },
    ],
    
    // Individual transports (to show tree-shaking)
    'Console Transport Only': [
      { path: './dist/transports/console.js', symbols: ['ConsoleTransport'] },
    ],
    'File Transport Only': [
      { path: './dist/transports/file.js', symbols: ['FileTransport'] },
    ],
    'HTTP Transport Only': [
      { path: './dist/transports/http.js', symbols: ['HTTPTransport'] },
    ],
    
    
    // Validation (optional, tree-shakeable)
    'Core + Schema Validation': [
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/validation/index.js', symbols: ['SchemaValidator', 'string', 'number', 'object'] },
    ],
    'Validation Module Only': [
      { path: './dist/validation/index.js', symbols: ['SchemaValidator', 'string', 'number', 'object', 'array'] },
    ],
    
    // Extensions (tree-shakeable)
    'Extensions: Sampler Only': [
      { path: './dist/extensions/sampler.js', symbols: ['Sampler'] },
    ],
    'Extensions: RateLimiter Only': [
      { path: './dist/extensions/rate-limiter.js', symbols: ['RateLimiter'] },
    ],
    'Extensions: Redactor Only': [
      { path: './dist/extensions/redactor.js', symbols: ['Redactor'] },
    ],
  };
  
  const results = {};
  console.log('📏 Measuring bundle sizes (all scenarios for console output)...');
  
  for (const [name, imports] of Object.entries(scenarios)) {
    try {
      const size = await measureScenarioGzip(imports);
      results[name] = size;
      console.log(`  ${name}: ${prettyBytes(size)}`);
    } catch (e) {
      console.warn(`  ⚠️ Could not measure ${name}`);
    }
  }
  
  // Log detailed breakdown to console for visibility
  console.log('\n📊 Detailed Bundle Analysis:');
  console.log('\nCore Scenarios:');
  ['Core (bare minimum)', 'Core + Console Transport', 'Core + File Transport', 'Core + HTTP Transport', 'Core + All Basic Transports']
    .forEach(name => {
      if (results[name]) console.log(`  ${name}: ${prettyBytes(results[name])}`);
    });
  
  console.log('\nIndividual Transports:');
  ['Console Transport Only', 'File Transport Only', 'HTTP Transport Only']
    .forEach(name => {
      if (results[name]) console.log(`  ${name}: ${prettyBytes(results[name])}`);
    });
  
  console.log('\nOptional Features:');
  ['Core + Schema Validation', 'Validation Module Only']
    .forEach(name => {
      if (results[name]) console.log(`  ${name}: ${prettyBytes(results[name])}`);
    });
  
  console.log('\nExtensions:');
  ['Extensions: Sampler Only', 'Extensions: RateLimiter Only', 'Extensions: Redactor Only']
    .forEach(name => {
      if (results[name]) console.log(`  ${name}: ${prettyBytes(results[name])}`);
    });
  
  return results;
}

/**
 * Update or add a badge in the badges block WITHOUT fucking up formatting
 */
function updateOrAddBadge(badgesBlock, label, bytes) {
  const kb = Math.max(1, Math.round((bytes || 0) / 1024));
  const newUrl = `https://img.shields.io/badge/${label}-${kb}kb-brightgreen.svg`;
  
  // Check if this specific badge already exists
  const existingRegex = new RegExp(
    `<img[^>]*src=["']https://img\\.shields\\.io/badge/${label}-\\d+kb-brightgreen\\.svg["'][^>]*>`,
    'i'
  );
  
  if (existingRegex.test(badgesBlock)) {
    // Update existing badge - just replace the URL
    return badgesBlock.replace(existingRegex, 
      `<img src="${newUrl}" alt="${label}">`
    );
  } else {
    // Add new badge right before closing </p>
    // Preserve whatever spacing/formatting exists
    return badgesBlock.replace(
      /<\/p>/i,
      ` <img src="${newUrl}" alt="${label}">\n</p>`
    );
  }
}

/**
 * Main function to update README with new sizes and badges
 * This is the critical function that was fucking everything up before
 */
async function injectIntoReadme(table) {
  let readme = readFileSync(README_PATH, 'utf8');
  
  // Fix any accidental double 'kbkb' in badge URLs (common typo)
  readme = readme.replace(/-(\d+)kbkb-/gi, '-$1kb-');
  
  // Remove old-style ambiguous bundle_size badges if they exist
  readme = removeLegacyBundleBadge(readme);
  
  // Measure all scenarios
  const allMeasurements = await measureAllScenarios();
  
  // Extract key measurements for badges
  const coreGz = allMeasurements['Core (bare minimum)'] || 0;
  const coreConsoleGz = allMeasurements['Core + Console Transport'] || 0;
  const coreTransportsGz = allMeasurements['Core + All Basic Transports'] || 0;

  // UPDATE BADGES - Do this in ONE operation on the badges block
  // to avoid multiple regex passes fucking things up
  console.log('🏷️  Updating badges...');
  const badgesBlockRegex = /<p align="center">([\s\S]*?)<\/p>/i;
  const badgesMatch = readme.match(badgesBlockRegex);
  
  if (badgesMatch) {
    let badgesBlock = badgesMatch[0];
    
    // Update each badge in the block
    const badges = [
      { label: 'core_gzip', bytes: coreGz },
      { label: 'core_console_gzip', bytes: coreConsoleGz },
      { label: 'core_transports_gzip', bytes: coreTransportsGz }
    ];
    
    for (const { label, bytes } of badges) {
      if (bytes > 0) {
        badgesBlock = updateOrAddBadge(badgesBlock, label, bytes);
      }
    }
    
    // Replace the entire badges block at once
    readme = readme.replace(badgesBlockRegex, badgesBlock);
  } else {
    console.warn('  ⚠️ No badges block found in README');
  }

  // UPDATE BUILD OUTPUT SECTION - Only write essential core info to README
  console.log('📊 Updating build output section with essential info only...');
  const sectionHeader = `## 📦 Build Output Sizes`;
  const sectionRegex = new RegExp(
    `${sectionHeader}[\\s\\S]*?(?=\\n## |$)`,
    'm'
  );
  
  // Only include the most essential core scenarios in README
  const essentialScenarios = [
    ['Core (bare minimum)', allMeasurements['Core (bare minimum)']],
    ['Core + Console Transport', allMeasurements['Core + Console Transport']],
    ['Core + File Transport', allMeasurements['Core + File Transport']],
    ['Core + HTTP Transport', allMeasurements['Core + HTTP Transport']],
    ['Core + All Basic Transports', allMeasurements['Core + All Basic Transports']],
  ].filter(([_, size]) => size)
    .map(([name, size]) => `| ${name} | ${prettyBytes(size)} |`)
    .join('\n');
  
  // Simple, clean section with only essential info
  const newSection = `${sectionHeader}\n\n${table}\n\n### Core Bundle Sizes (gzipped)\n\n| Scenario | Size |\n|----------|------|\n${essentialScenarios}\n\n*Generated via \`scripts/analyze-build.js\`.*`;
  
  if (sectionRegex.test(readme)) {
    // Replace existing section
    readme = readme.replace(sectionRegex, newSection);
  } else {
    // Add new section at the end
    readme = readme + `\n\n${newSection}`;
  }
  
  // Write the updated README
  writeFileSync(README_PATH, readme);
  console.log('✅ README updated successfully!');
}

/**
 * Main entry point
 */
async function main() {
  const checkMode = process.argv.includes('--check');
  
  // Analyze the build files
  const results = FILES.map(({ file, label }) => {
    const fullPath = path.join(DIST_DIR, file);
    if (!existsSync(fullPath)) return null;
    
    const raw = readFileSync(fullPath);
    const sizeBytes = raw.length;
    const gzipBytes = gzipSync(raw).length;
    
    return {
      file,
      label,
      sizeBytes,
      gzipBytes,
      size: prettyBytes(sizeBytes),
      gzip: prettyBytes(gzipBytes)
    };
  }).filter(Boolean);

  if (!results.length) {
    console.warn('⚠️ No build files found to analyze.');
    process.exit(checkMode ? 1 : 0);
  }

  const esm = results.find(r => r.file === 'index.js');
  const cjs = results.find(r => r.file === 'index.cjs');

  // Check thresholds
  let failed = false;
  if (CHECK_MODE === 'gzip') {
    if (esm && esm.gzipBytes > MAX_ESM_GZIP) {
      console.error(`❌ ESM bundle (gzip) exceeds threshold: ${esm.gzipBytes} > ${MAX_ESM_GZIP}`);
      failed = true;
    }
    if (cjs && cjs.gzipBytes > MAX_CJS_GZIP) {
      console.error(`❌ CJS bundle (gzip) exceeds threshold: ${cjs.gzipBytes} > ${MAX_CJS_GZIP}`);
      failed = true;
    }
  } else {
    if (esm && esm.sizeBytes > MAX_ESM_SIZE) {
      console.error(`❌ ESM bundle exceeds threshold: ${esm.sizeBytes} > ${MAX_ESM_SIZE}`);
      failed = true;
    }
    if (cjs && cjs.sizeBytes > MAX_CJS_SIZE) {
      console.error(`❌ CJS bundle exceeds threshold: ${cjs.sizeBytes} > ${MAX_CJS_SIZE}`);
      failed = true;
    }
  }

  const table = generateTable(results);

  if (checkMode) {
    // Just check, don't update
    console.log(table);
    if (failed) process.exit(2);
    console.log('✅ Size check passed.');
    return;
  }

  // Update the README
  await injectIntoReadme(table);
  
  if (failed) {
    console.error('⚠️ Sizes exceed thresholds (README still updated).');
    process.exit(2);
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('analyze-build.js')) {
  main().catch(err => {
    console.error('💥 Analyze failed:', err);
    process.exit(1);
  });
}