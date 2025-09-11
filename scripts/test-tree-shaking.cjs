#!/usr/bin/env node
/*
  Minimal tree-shaking smoke test.
  - Assumes build artifacts exist in dist/ from a prior step.
  - Loads the built ESM or CJS entry to ensure it imports successfully.
  - Scans the bundle for a few obvious dev-only patterns.
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

function fail(msg, err) {
  console.error(msg);
  if (err) console.error(err.stack || err.message || err);
  process.exit(1);
}

try {
  const pkgRoot = path.resolve(__dirname, '..');
  const distDir = path.join(pkgRoot, 'dist');
  const distEsm = path.join(distDir, 'index.js');
  const distCjs = path.join(distDir, 'index.cjs');

  if (!fs.existsSync(distDir)) {
    fail('dist/ directory not found. Run the build step first.');
  }
  if (!fs.existsSync(distEsm) && !fs.existsSync(distCjs)) {
    fail('Built index entry not found in dist/.');
  }

  const target = fs.existsSync(distEsm) ? distEsm : distCjs;
  const code = fs.readFileSync(target, 'utf8');

  // Heuristic checks: ensure there are no obvious dev-only strings
  const forbidden = [/__TEST__/, /console\.assert\(/];
  for (const rx of forbidden) {
    if (rx.test(code)) {
      fail(`Tree-shaking check failed: found forbidden pattern ${rx}`);
    }
  }

  // Basic import smoke test via dynamic require (for CJS) or ESM import for ESM
  try {
    if (target.endsWith('.cjs')) {
      require(target);
    } else {
      const url = pathToFileURL(target).href;
      const out = spawnSync(process.execPath, ['-e', `import('${url}')`], {
        stdio: 'inherit',
      });
      if (out.status !== 0) {
        fail('Failed to import ESM bundle');
      }
    }
  } catch (e) {
    fail('Failed to load built bundle', e);
  }

  console.log('Tree-shaking smoke test passed.');
  process.exit(0);
} catch (err) {
  fail('Unexpected error in tree-shaking test', err);
}
