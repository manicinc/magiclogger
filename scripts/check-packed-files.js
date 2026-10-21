/* eslint-env node */
// Fails when the package npm would publish lacks a file that package.json names:
// main, module, types and every target of exports.
//
// npm publish runs prepublishOnly, then packs the directory, and packing runs
// prepare before the file list is taken (pacote), so a prepare that deletes dist
// publishes a package without its code: magiclogger 0.1.0 on npm holds
// package.json, LICENSE.md and README.md only. npm 10's pacote runs prepare even
// under --ignore-scripts, so the files on disk are read before packing instead.
//
// Run it after the build: pnpm run build && node scripts/check-packed-files.js
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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

/** The paths `npm pack --dry-run --json` lists, lifecycle scripts run as npm publish runs them. */
function packedFiles() {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--foreground-scripts=false'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 1 << 26,
  });
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

const builtBeforePacking = new Set([...named].filter(file => existsSync(path.join(root, file))));
const published = packedFiles();

const lostWhenPacked = [...builtBeforePacking].filter(file => !published.has(file)).sort();
const neverBuilt = [...named].filter(file => !builtBeforePacking.has(file)).sort();

function report(title, files) {
  if (files.length === 0) return;
  console.error(`${title} (${files.length}):`);
  for (const file of files) console.error(`  ${file}`);
}

report('Named in package.json and built, but missing from the packed package', lostWhenPacked);
report('Named in package.json, but not on disk after the build', neverBuilt);

if (lostWhenPacked.length || neverBuilt.length) {
  process.exit(1);
}
console.log(
  `${manifest.name}@${manifest.version}: ${published.size} files packed, ` +
    `every one of the ${named.size} files package.json names among them`
);
