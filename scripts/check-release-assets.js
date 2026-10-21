/* eslint-env node */
// Fails when two files that the GitHub release assets in .releaserc match share a name.
//
// @semantic-release/github 9 names every file an asset glob matches by its basename
// (lib/glob-assets.js) and uploads them into a draft release, which it publishes only
// after every upload. GitHub refuses a second asset with a name the release already
// holds (422: https://docs.github.com/en/rest/releases/assets#upload-a-release-asset),
// so a glob over dist, where index.js, logger.js and their declarations sit in several
// folders, fails the release after npm has published it and leaves the GitHub release
// a draft. The check runs the plugin's own glob over the built tree.
//
// Run it after the build: pnpm run build && node scripts/check-release-assets.js
import { readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(path.join(root, '.releaserc'), 'utf8'));

const github = (config.plugins || []).find(
  plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === '@semantic-release/github'
);
const assets = (Array.isArray(github) && github[1] && github[1].assets) || [];

// The package exports its entry only, so its glob module is loaded by file path.
const entry = createRequire(import.meta.url).resolve('@semantic-release/github');
const globModule = path.join(path.dirname(entry), 'lib', 'glob-assets.js');
const { default: globAssets } = await import(pathToFileURL(globModule).href);

const filesByName = new Map();
for (const asset of await globAssets({ cwd: root }, assets)) {
  const file = typeof asset === 'string' ? asset : asset.path;
  let stats;
  try {
    stats = statSync(path.resolve(root, file));
  } catch {
    // The plugin skips a path it cannot read, such as a tarball made during the release.
    continue;
  }
  // It skips a directory too.
  if (!stats.isFile()) continue;
  const name = (typeof asset === 'object' && asset.name) || path.basename(file);
  filesByName.set(name, [...(filesByName.get(name) || []), file]);
}

const repeated = [...filesByName].filter(([, files]) => files.length > 1);
if (repeated.length) {
  console.error(
    `Release assets that share a name (${repeated.length}); a GitHub release holds one asset per name:`
  );
  for (const [name, files] of repeated) console.error(`  ${name}: ${files.sort().join(', ')}`);
  process.exit(1);
}
console.log(`${filesByName.size} release assets on disk, each name once`);
