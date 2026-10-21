/* eslint-env node */
// Fails when the package npm would publish lacks a file that package.json names
// (main, module, types and every target of exports), or loses a file that was on
// disk before npm packed it.
//
// npm publish runs prepublishOnly, then packs the directory; packing runs prepare
// before the file list is taken (pacote), so a prepare that deletes dist publishes
// a package without its code. magiclogger 0.1.0 on npm holds package.json,
// LICENSE.md and README.md only.
//
// Run it after the build: pnpm run build && node scripts/check-packed-files.js
// It packs twice without writing a tarball: once with --ignore-scripts (the files
// on disk that the files field keeps) and once as publish packs (lifecycle
// scripts run).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

/** Adds every string a field holds, nested conditions included, as a root-relative path. */
function collectTargets(value, into) {
  if (typeof value === 'string') {
    into.add(path.posix.normalize(value));
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectTargets(nested, into);
  }
  return into;
}

/** The paths `npm pack --dry-run --json` lists; lifecycle output, if any, comes before the JSON. */
function packedFiles(extraArgs) {
  const out = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--foreground-scripts=false', ...extraArgs],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 26 }
  );
  const start = out.search(/^\[/m);
  if (start === -1) throw new Error(`npm pack printed no JSON:\n${out}`);
  const [packed] = JSON.parse(out.slice(start));
  return new Set(packed.files.map(file => file.path));
}

const named = new Set();
for (const field of ['main', 'module', 'types']) {
  if (typeof manifest[field] === 'string') collectTargets(manifest[field], named);
}
collectTargets(manifest.exports, named);

const onDisk = packedFiles(['--ignore-scripts']);
const published = packedFiles([]);

const lostWhenPacked = [...onDisk].filter(file => !published.has(file)).sort();
const notPublished = [...named].filter(file => onDisk.has(file) && !published.has(file)).sort();
const notThere = [...named].filter(file => !onDisk.has(file)).sort();

function report(title, files) {
  if (files.length === 0) return;
  console.error(`${title} (${files.length}):`);
  for (const file of files) console.error(`  ${file}`);
}

report('On disk, but lost when npm packs (a lifecycle script removed them)', lostWhenPacked);
report('Named in package.json, built, and lost when npm packs', notPublished);
report('Named in package.json, and not there to pack (not built, or outside files)', notThere);

if (lostWhenPacked.length || notPublished.length || notThere.length) {
  process.exit(1);
}
console.log(
  `${manifest.name}@${manifest.version}: ${published.size} files packed, ` +
    `every one of the ${named.size} files package.json names among them`
);
