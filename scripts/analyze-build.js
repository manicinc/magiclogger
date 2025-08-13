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
// MODE can be 'gzip' (default) or 'raw'.
const CHECK_MODE = (process.env.BUNDLE_CHECK_MODE || 'gzip').toLowerCase();
const MAX_ESM_SIZE = parseInt(process.env.BUNDLE_MAX_ESM || '', 10) || 30 * 1024; // raw default
const MAX_CJS_SIZE = parseInt(process.env.BUNDLE_MAX_CJS || '', 10) || 35 * 1024; // raw default
const MAX_ESM_GZIP = parseInt(process.env.BUNDLE_MAX_ESM_GZIP || '', 10) || 40 * 1024; // 40 KB gz default
const MAX_CJS_GZIP = parseInt(process.env.BUNDLE_MAX_CJS_GZIP || '', 10) || 50 * 1024; // 50 KB gz default

function generateTable(files) {
  const header = `| File | Format | Raw Size | Gzip |`;
  const rows = files.map(({ file, label, size, gzip }) => `| \`${file}\` | ${label} | ${size} | ${gzip} |`).join('\n');
  return `${header}\n|------|--------|----------|------|\n${rows}`;
}

function updateNamedBadge(readme, label, bytes) {
  const kb = Math.max(1, Math.round((bytes || 0) / 1024));
  const regex = new RegExp(`(${label}-)(\\d+)(kb(?:kb)?-)`, 'i');
  if (regex.test(readme)) {
    return readme.replace(regex, (_, p1, _num, p3) => `${p1}${kb}${p3}`);
  }
  return readme;
}

function ensureNamedBadge(readme, label, bytes) {
  const kb = Math.max(1, Math.round((bytes || 0) / 1024));
  const existing = new RegExp(`https://img.shields.io/badge/${label}-\\d+kb(?:kb)?-brightgreen`, 'i');
  const url = `https://img.shields.io/badge/${label}-${kb}kb-brightgreen`;
  if (existing.test(readme)) return updateNamedBadge(readme, label, bytes);

  // Insert into the main badges <p> block, just before its closing </p>
  const blockRegex = /(<p align="center">[\s\S]*?https:\/\/img\.shields\.io\/badge[\s\S]*?)(<\/p>)/i;
  if (blockRegex.test(readme)) {
    return readme.replace(blockRegex, `$1  <img src="${url}" alt="${label}">$2`);
  }
  // Fallback: append to top of README
  return `<p align="center">  <img src="${url}" alt="${label}"></p>\n` + readme;
}

function removeAllNamedBadges(readme, label) {
  const imgRegex = new RegExp(`<img[^>]*src=["']https://img\\.shields\\.io/badge/${label}-[^"']+-brightgreen["'][^>]*>\\s*`, 'gi');
  return readme.replace(imgRegex, '').replace(/\n\s*\n/g, '\n');
}

function removeLegacyBundleBadge(readme) {
  const bundleRegex = /<img[^>]*src=["']https:\/\/img\.shields\.io\/badge\/bundle_size-[^"']+["'][^>]*>\s*/gi;
  return readme.replace(bundleRegex, '').replace(/\n\s*\n/g, '\n');
}

// Measure a bundled scenario in bytes (gzip). Each import can specify symbols to ensure retention.
// imports: Array<{ path: string, symbols?: string[] }>
async function measureScenarioGzip(imports) {
  const contents = imports
    .map((m, i) => {
      const p = m.path.replace(/"/g, '\\"');
      if (m.symbols && m.symbols.length) {
        const syms = m.symbols.join(', ');
        // Reference on globalThis to prevent tree-shaking
        return `import { ${syms} } from "${p}";\n(globalThis.__ml_keep ||= []).push(${syms});`;
      }
      return `import * as m${i} from "${p}";\n(globalThis.__ml_keep ||= []).push(m${i});`;
    })
    .join('\n');
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
    platform: 'node', // use node to satisfy built-in deps like events, path, zlib, etc.
    target: ['es2020'],
    minify: true,
  logLevel: 'silent',
    write: false,
  });
  const out = result.outputFiles?.[0]?.text || '';
  return gzipSync(Buffer.from(out, 'utf8')).length;
}

async function injectIntoReadme(table) {
  let readme = readFileSync(README_PATH, 'utf8');
  // Normalize any accidental double 'kbkb' occurrences
  readme = readme.replace(/-(\d+)kbkb-/gi, '-$1kb-');
  // Remove legacy ambiguous bundle size badge
  readme = removeLegacyBundleBadge(readme);
  // Scenario gzip sizes
  let coreGz = 0;
  let coreConsoleGz = 0;
  let coreTransportsGz = 0;
  let compatAllGz = 0;
  try {
    coreGz = await measureScenarioGzip([
      { path: './dist/index.js', symbols: ['Logger'] },
    ]);
  } catch (e) { /* ignore */ }
  try {
    coreConsoleGz = await measureScenarioGzip([
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/transports/console.js', symbols: ['ConsoleTransport'] },
    ]);
  } catch (e) { /* ignore */ }
  try {
    coreTransportsGz = await measureScenarioGzip([
      { path: './dist/index.js', symbols: ['Logger'] },
      { path: './dist/transports/console.js', symbols: ['ConsoleTransport'] },
      { path: './dist/transports/file.js', symbols: ['FileTransport'] },
      { path: './dist/transports/stream.js', symbols: ['StreamTransport'] },
      { path: './dist/transports/http.js', symbols: ['HTTPTransport'] },
    ]);
  } catch (e) { /* ignore */ }
  try {
    // Measure all compatibility layers bundled
    compatAllGz = await measureScenarioGzip([
      { path: './dist/compatibility/index.js' },
    ]);
  } catch (e) { /* ignore */ }

  // Ensure our labeled badges are present and updated
  readme = removeAllNamedBadges(readme, 'core_gzip');
  readme = ensureNamedBadge(readme, 'core_gzip', coreGz || 0);
  readme = removeAllNamedBadges(readme, 'core_console_gzip');
  readme = ensureNamedBadge(readme, 'core_console_gzip', coreConsoleGz || 0);
  readme = removeAllNamedBadges(readme, 'core_transports_gzip');
  readme = ensureNamedBadge(readme, 'core_transports_gzip', coreTransportsGz || 0);
  readme = removeAllNamedBadges(readme, 'compat_gzip');
  readme = ensureNamedBadge(readme, 'compat_gzip', compatAllGz || 0);

  const sectionHeader = `## 📦 Build Output Sizes`;
  const sectionRegex = new RegExp(`## 📦 Build Output Sizes[\\s\\S]*?(?=\n## |$)`, 'm');
  const scenarios = [
    coreGz ? `| core (esm, gzip) | ${prettyBytes(coreGz)} |` : null,
    coreConsoleGz ? `| core + console (esm, gzip) | ${prettyBytes(coreConsoleGz)} |` : null,
    coreTransportsGz ? `| core + all core transports (esm, gzip) | ${prettyBytes(coreTransportsGz)} |` : null,
    compatAllGz ? `| all compatibility layers (esm, gzip) | ${prettyBytes(compatAllGz)} |` : null,
  ].filter(Boolean).join('\n');
  const scenarioBlock = scenarios ? `\n\n### Reference bundle sizes (gzip)\n\n| Scenario | Size |\n|----------|------|\n${scenarios}` : '';
  const newSection = `${sectionHeader}\n\n${table}${scenarioBlock}\n\n*Generated via \`scripts/analyze-build.js\`.*`;
  if (sectionRegex.test(readme)) {
    readme = readme.replace(sectionRegex, newSection);
  } else {
    readme = readme + `\n\n${newSection}`;
  }
  writeFileSync(README_PATH, readme);
  console.log('✅ README updated (sizes + badge).');
}

async function main() {
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
    console.log(table);
    if (failed) process.exit(2);
    console.log('✅ Size check passed.');
    return;
  }

  await injectIntoReadme(table);
  if (failed) {
    console.error('⚠️ Sizes exceed thresholds (README still updated).');
    process.exit(2);
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('analyze-build.js')) {
  main().catch(err => {
    console.error('Analyze failed:', err);
    process.exit(1);
  });
}
