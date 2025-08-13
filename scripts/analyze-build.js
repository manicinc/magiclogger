/* eslint-env node */
import { readFileSync, existsSync, writeFileSync } from 'fs';
import * as path from 'path';
import { gzipSync } from 'zlib';
import prettyBytes from 'pretty-bytes';
import { fileURLToPath } from 'url';

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
const MAX_ESM_SIZE = parseInt(process.env.BUNDLE_MAX_ESM || '', 10) || 30 * 1024; // 30 KB default
const MAX_CJS_SIZE = parseInt(process.env.BUNDLE_MAX_CJS || '', 10) || 35 * 1024; // 35 KB default

function generateTable(files) {
  const header = `| File | Format | Raw Size | Gzip |`;
  const rows = files.map(({ file, label, size, gzip }) => `| \`${file}\` | ${label} | ${size} | ${gzip} |`).join('\n');
  return `${header}\n|------|--------|----------|------|\n${rows}`;
}

function updateSizeBadge(readme, esmBytes) {
  const kb = Math.round(esmBytes / 1024);
  // Replace shields.io badge numeric value (bundle_size-<num>kb-)
  const badgeRegex = /(bundle_size-)(\d+)(kb-)/i;
  if (badgeRegex.test(readme)) {
    readme = readme.replace(badgeRegex, (_, p1, _num, p3) => `${p1}${kb}kb${p3}`);
  }
  return readme;
}

function injectIntoReadme(table, esmBytes) {
  let readme = readFileSync(README_PATH, 'utf8');
  readme = updateSizeBadge(readme, esmBytes);

  const sectionHeader = `## 📦 Build Output Sizes`;
  const sectionRegex = new RegExp(`## 📦 Build Output Sizes[\\s\\S]*?(?=\\n## |$)`, 'm');
  const newSection = `${sectionHeader}\n\n${table}\n\n*Generated via \`scripts/analyze-build.js\`.*`;
  if (sectionRegex.test(readme)) {
    readme = readme.replace(sectionRegex, newSection);
  } else {
    readme = readme + `\n\n${newSection}`;
  }
  writeFileSync(README_PATH, readme);
  console.log('✅ README updated (sizes + badge).');
}

function main() {
  const checkMode = process.argv.includes('--check');
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

  // Threshold checks
  let failed = false;
  if (esm && esm.sizeBytes > MAX_ESM_SIZE) {
    console.error(`❌ ESM bundle exceeds threshold: ${esm.sizeBytes} > ${MAX_ESM_SIZE}`);
    failed = true;
  }
  if (cjs && cjs.sizeBytes > MAX_CJS_SIZE) {
    console.error(`❌ CJS bundle exceeds threshold: ${cjs.sizeBytes} > ${MAX_CJS_SIZE}`);
    failed = true;
  }

  const table = generateTable(results);

  if (checkMode) {
    console.log(table);
    if (failed) process.exit(2);
    console.log('✅ Size check passed.');
    return;
  }

  injectIntoReadme(table, esm ? esm.sizeBytes : 0);
  if (failed) {
    console.error('⚠️ Sizes exceed thresholds (README still updated).');
    process.exit(2);
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('analyze-build.js')) {
  main();
}
