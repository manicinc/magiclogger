/* eslint-env node */
// Loads magiclogger as a consumer does, through require and through import, and logs one line
// through each entry point. The runtime-floor job in ci.yml copies this file into a folder
// where npm installed the packed package and runs it on the Node version that engines.node in
// package.json names, so a build that needs a newer Node than engines claims fails in CI
// rather than in a consumer's require. magiclogger 0.1.1 declared Node 14, and its CommonJS
// entry loads class static blocks, which Node parses from 16.11.0.
//
// It runs on that oldest Node itself, so it keeps to syntax every supported line parses.
'use strict';

const assert = require('assert');

/** Calls fn with the console and the standard streams captured; returns what they received. */
function captured(fn) {
  const seen = [];
  const keep = function () {
    seen.push(Array.prototype.join.call(arguments, ' '));
    return true;
  };
  const saved = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    out: process.stdout.write,
    err: process.stderr.write,
  };
  console.log = console.info = console.warn = console.error = keep;
  process.stdout.write = process.stderr.write = keep;
  try {
    fn();
  } finally {
    console.log = saved.log;
    console.info = saved.info;
    console.warn = saved.warn;
    console.error = saved.error;
    process.stdout.write = saved.out;
    process.stderr.write = saved.err;
  }
  return seen.join('\n');
}

function check(entry, api) {
  assert.strictEqual(typeof api.createLogger, 'function', entry + ': createLogger is exported');
  const marker = 'runtime floor check through ' + entry;
  const output = captured(function () {
    api.createLogger({ mode: 'sync', useColors: false }).info(marker);
  });
  assert.ok(output.indexOf(marker) !== -1, entry + ': the logger wrote ' + JSON.stringify(output));
  console.log('ok: ' + entry + ' on Node ' + process.versions.node);
}

check('require', require('magiclogger'));

import('magiclogger')
  .then(function (api) {
    check('import', api);
  })
  .catch(function (error) {
    console.error(error);
    process.exitCode = 1;
  })
  .then(function () {
    // A transport may hold a handle open; the checks are done either way.
    setTimeout(function () {
      process.exit();
    }, 200).unref();
  });
