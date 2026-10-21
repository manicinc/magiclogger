/* eslint-env node */
// Fails when a git add in a workflow, a package.json script, a git hook or a script under
// scripts/ names a path that matches no file in the repository.
//
// git add checks every path it is given before it stages anything, and one that matches
// nothing stops it ("fatal: pathspec ... did not match any files") with none of the others
// staged. The release workflow's coverage badge step ran
//   git add README.md docs/test-coverage.md docs/test_coverage.md 2>/dev/null || true
// docs/test-coverage.md does not exist, the redirect and || true hid the error, and the step
// committed nothing on every run (Release run 39660472604, job 119431829023).
//
// Each path must match a tracked file (git ls-files --error-unmatch), read from the repository
// root, where workflow steps and npm scripts run; a file that a step creates before adding it
// belongs in the repository first. The arguments end at a quote
// (the end of the string a script passes to execSync), a shell operator, a redirect or a
// comment; options, paths with a shell variable or a glob, and comment lines are skipped.
//
// Run it from the repository: node scripts/check-git-add-paths.js
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const self = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(self), '..');

const tracked = execFileSync(
  'git',
  ['ls-files', '-z', '--', '.github/workflows', '.husky', 'package.json', 'scripts'],
  { cwd: root, encoding: 'utf8' }
)
  .split('\0')
  .filter(Boolean);

const scanned = file =>
  file.startsWith('.github/workflows/')
    ? /\.ya?ml$/.test(file)
    : file.startsWith('.husky/') ||
      path.basename(file) === 'package.json' ||
      /\.(?:c|m)?js$|\.sh$/.test(file);

const sources = tracked.filter(
  file => scanned(file) && path.resolve(root, file) !== path.resolve(self)
);

const GIT_ADD = /\bgit\s+add\b/g;
const COMMENT = /^\s*(?:#|\/\/|\/\*|\*)/;
const COMMAND_END = /['"`]|&&|\|\|?|;|\)|\s#|\s\d*[<>]|[<>]/;

function namedPaths(args) {
  const paths = [];
  let options = true;
  for (const word of args.split(COMMAND_END)[0].trim().split(/\s+/)) {
    if (!word) continue;
    if (options && word === '--') {
      options = false;
    } else if (options && word.startsWith('-')) {
      // An option such as -A or -u.
    } else if (!/[$*?[{]/.test(word)) {
      paths.push(word);
    }
  }
  return paths;
}

function matchesTrackedFile(pathspec) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', '--', pathspec], {
      cwd: root,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

const commands = [];
for (const file of sources) {
  const lines = readFileSync(path.join(root, file), 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (COMMENT.test(line)) return;
    for (const match of line.matchAll(GIT_ADD)) {
      const args = line.slice(match.index + match[0].length);
      commands.push({ where: `${file}:${index + 1}`, paths: namedPaths(args) });
    }
  });
}

const missing = [];
for (const command of commands) {
  for (const pathspec of command.paths) {
    if (!matchesTrackedFile(pathspec)) missing.push(`${command.where}: ${pathspec}`);
  }
}

// The messages quote "git add" so that the scan above, run on this file, would find no paths.
if (missing.length) {
  console.error(
    `${missing.length} path(s) given to "git add" match no tracked file, so the command stages nothing:`
  );
  for (const entry of missing) console.error(`  ${entry}`);
  process.exit(1);
}

console.log(`${commands.length} "git add" command(s); each path matches a tracked file:`);
for (const command of commands) {
  console.log(`  ${command.where}: ${command.paths.join(' ') || '(options only)'}`);
}
