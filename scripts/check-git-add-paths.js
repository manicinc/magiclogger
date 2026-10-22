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
// Where the commands are read:
// - a workflow, a git hook or a .sh file: every line that is not a comment, read on into the
//   next line when it ends in a backslash; a ${{ }} expression counts as a value set at run time;
// - package.json: each script of the parsed file;
// - a .js, .cjs or .mjs file: the string literal around the command, its escapes decoded.
// The words after "git add" are split the way a POSIX shell splits them before expansion:
// quotes and backslashes are removed, a redirection (2>/dev/null) goes with its target, and the
// command ends at an unquoted newline, ;, &, |, ( or ), or at a # that starts a word. Options
// are skipped. Every other word must match a tracked file as a pathspec (git ls-files
// --error-unmatch), from the repository root, where workflow steps and npm scripts run; a
// pattern such as docs/*.md must match at least one. A file that a step creates before adding
// it belongs in the repository first. A word holding $ or a backquote (a value the run sets),
// an unquoted { (brace expansion) or pathspec magic (a leading :) is listed as not checked, and
// a quote that does not close fails the check.
//
// Before the scan the script runs its own cases (selfTest), the badge step's command among them.
//
// Run it from the repository: node scripts/check-git-add-paths.js
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const self = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(self), '..');

const GIT_ADD = /\bgit\s+add(?![\w.-])/g;
const SHELL_COMMENT_LINE = /^\s*#/;
const JS_COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*)/;
const EXPRESSION = /\$\{\{[^}\n]*\}\}/g;
const JS_ESCAPES = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', 0: '\0' };

/**
 * Splits the shell command that goes on at `from` in `text` into words, as a POSIX shell reads
 * them before expansion, up to the end of the command.
 *
 * @param {string} text Shell source.
 * @param {number} from Offset just after "git add".
 * @returns {{ text: string, dynamic: boolean, brace: boolean }[]} The words. `dynamic` marks a
 *   $ or a backquote outside single quotes, `brace` an unquoted {.
 * @throws {Error} When a quote does not close.
 */
function shellWords(text, from) {
  const words = [];
  let word = null;
  let redirect = false;
  const begin = () => (word ??= { text: '', dynamic: false, brace: false, quoted: false });
  const end = () => {
    if (word && !redirect) words.push(word);
    if (word) redirect = false;
    word = null;
  };
  let i = from;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\') {
      if (text[i + 1] === '\n') {
        i += 2; // a line continuation
      } else if (text[i + 1] === '\r' && text[i + 2] === '\n') {
        i += 3;
      } else {
        begin().quoted = true;
        word.text += text[i + 1] ?? '';
        i += 2;
      }
      continue;
    }
    if (ch === "'") {
      const close = text.indexOf("'", i + 1);
      if (close < 0) throw new Error('a single quote does not close');
      begin().quoted = true;
      word.text += text.slice(i + 1, close);
      i = close + 1;
      continue;
    }
    if (ch === '"') {
      begin().quoted = true;
      for (i++; text[i] !== '"'; i++) {
        if (i >= text.length) throw new Error('a double quote does not close');
        if (text[i] === '\\' && '"\\$`\n'.includes(text[i + 1] ?? 'x')) {
          i++;
          if (text[i] !== '\n') word.text += text[i];
          continue;
        }
        if (text[i] === '$' || text[i] === '`') word.dynamic = true;
        word.text += text[i];
      }
      i++;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      end();
      i++;
      continue;
    }
    if ('\n;&|()'.includes(ch)) break;
    if (ch === '#' && !word) break; // a comment
    if (ch === '<' || ch === '>') {
      // A file descriptor written against the operator (the 2 of 2>) belongs to the redirection.
      if (word && !word.quoted && /^\d+$/.test(word.text)) word = null;
      end();
      i++;
      if ('<>&|'.includes(text[i] ?? 'x')) i++;
      redirect = true;
      continue;
    }
    begin();
    if (ch === '$' || ch === '`') word.dynamic = true;
    if (ch === '{') word.brace = true;
    word.text += ch;
    i++;
  }
  end();
  return words.map(({ text: value, dynamic, brace }) => ({ text: value, dynamic, brace }));
}

/**
 * Reads the words of the command at `from`, or the reason they cannot be read.
 *
 * @param {string} text Shell source.
 * @param {number} from Offset just after "git add".
 * @param {number} line Line number to report.
 * @returns {{ line: number, words?: object[], error?: string }}
 */
function read(text, from, line) {
  try {
    return { line, words: shellWords(text, from) };
  } catch (error) {
    return { line, error: error.message };
  }
}

/**
 * Tells whether column `col` of a shell line sits in a comment, after an unquoted # that
 * starts a word.
 *
 * @param {string} line One line of shell source.
 * @param {number} col Column to test.
 * @returns {boolean}
 */
function inComment(line, col) {
  let quote = null;
  for (let i = 0; i < col; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"') i++;
    } else if (ch === '\\') {
      i++;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return true;
    }
  }
  return false;
}

/**
 * Finds the git add commands in shell source: a workflow, a git hook or a shell script.
 *
 * @param {string} source The file's text.
 * @returns {{ line: number, words?: object[], error?: string }[]}
 */
function shellCommands(source) {
  const text = source.replace(EXPRESSION, '$EXPRESSION');
  const commands = [];
  let offset = 0;
  text.split('\n').forEach((line, index) => {
    if (!SHELL_COMMENT_LINE.test(line)) {
      for (const match of line.matchAll(GIT_ADD)) {
        if (inComment(line, match.index)) continue;
        commands.push(read(text, offset + match.index + match[0].length, index + 1));
      }
    }
    offset += line.length + 1;
  });
  return commands;
}

/**
 * Returns the JavaScript string literal on `line` that holds column `index`, decoded, with
 * `at`, the column's offset in the decoded text, or null when no literal holds it. A template
 * literal's ${...} becomes $EXPRESSION.
 *
 * @param {string} line One line of JavaScript.
 * @param {number} index Column of the command.
 * @returns {{ text: string, at: number } | null}
 */
function stringAround(line, index) {
  for (let i = 0; i < line.length; i++) {
    const quote = line[i];
    if (quote === '/' && line[i + 1] === '/') return null;
    if (quote !== "'" && quote !== '"' && quote !== '`') continue;
    const start = i;
    let text = '';
    let at = -1;
    for (i++; i < line.length && line[i] !== quote; i++) {
      if (i === index) at = text.length;
      if (line[i] === '\\') {
        i++;
        text += JS_ESCAPES[line[i]] ?? line[i] ?? '';
      } else if (quote === '`' && line[i] === '$' && line[i + 1] === '{') {
        const close = line.indexOf('}', i);
        text += '$EXPRESSION';
        i = close < 0 ? line.length : close;
      } else {
        text += line[i];
      }
    }
    if (start < index && index < i) return at < 0 ? null : { text, at };
  }
  return null;
}

/**
 * Finds the git add commands in JavaScript source, each read as the shell command its string
 * literal holds.
 *
 * @param {string} source The file's text.
 * @returns {{ line: number, words?: object[], error?: string }[]}
 */
function jsCommands(source) {
  const commands = [];
  source.split('\n').forEach((line, index) => {
    if (JS_COMMENT_LINE.test(line)) return;
    for (const match of line.matchAll(GIT_ADD)) {
      // Outside a literal on this line (in a template literal begun on an earlier line), the
      // rest of the line is read as shell.
      const literal = stringAround(line, match.index);
      const text = literal ? literal.text : line;
      const at = literal ? literal.at : match.index;
      commands.push(read(text, at + match[0].length, index + 1));
    }
  });
  return commands;
}

/**
 * Finds the git add commands in a package.json's scripts.
 *
 * @param {string} source The file's text.
 * @returns {{ line: number, words?: object[], error?: string }[]}
 */
function packageScriptCommands(source) {
  const lines = source.split('\n');
  const scriptsAt = lines.findIndex(line => /"scripts"\s*:/.test(line));
  const commands = [];
  for (const [name, script] of Object.entries(JSON.parse(source).scripts ?? {})) {
    const key = `${JSON.stringify(name)}:`;
    const line = lines.findIndex((text, index) => index > scriptsAt && text.includes(key)) + 1;
    for (const match of String(script).matchAll(GIT_ADD)) {
      commands.push(read(String(script), match.index + match[0].length, line));
    }
  }
  return commands;
}

/**
 * Sorts the words after "git add" into the pathspecs to check and the words that only the run
 * can settle; options are dropped.
 *
 * @param {{ text: string, dynamic: boolean, brace: boolean }[]} words
 * @returns {{ paths: string[], unchecked: string[] }}
 */
function operands(words) {
  const paths = [];
  const unchecked = [];
  let options = true;
  for (const { text, dynamic, brace } of words) {
    if (options && text === '--') options = false;
    else if (options && text.startsWith('-') && text !== '-') continue;
    else if (dynamic || brace || text.startsWith(':')) unchecked.push(text);
    else paths.push(text);
  }
  return { paths, unchecked };
}

/**
 * Tells whether a pathspec matches a tracked file.
 *
 * @param {string} pathspec A path, a directory or a pattern.
 * @returns {boolean}
 */
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

/**
 * Returns the pathspecs that match no tracked file.
 *
 * @param {string[]} paths
 * @returns {string[]}
 */
function missing(paths) {
  return paths.filter(pathspec => !matchesTrackedFile(pathspec));
}

/**
 * Runs the reading cases and the lookups the scan relies on; exits on a failure.
 */
function selfTest() {
  const failures = [];
  const expect = (label, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      const got = JSON.stringify(actual);
      failures.push(`${label}: got ${got}, expected ${JSON.stringify(expected)}`);
    }
  };
  // [reader, source, paths, unchecked]; null paths when no command is to be found.
  const cases = [
    [
      shellCommands,
      'git add README.md docs/test-coverage.md docs/test_coverage.md 2>/dev/null || true',
      ['README.md', 'docs/test-coverage.md', 'docs/test_coverage.md'],
      [],
    ],
    [
      shellCommands,
      "git add README.md 'docs/test-coverage.md'",
      ['README.md', 'docs/test-coverage.md'],
      [],
    ],
    [
      shellCommands,
      'git add "docs/a b.md" \\\n  README.md && git commit -m x',
      ['docs/a b.md', 'README.md'],
      [],
    ],
    [shellCommands, '      - run: git add -A -- src docs/*.md # docs', ['src', 'docs/*.md'], []],
    [
      shellCommands,
      'git add "$FILE" ${{ inputs.path }} docs/{a,b}.md src',
      ['src'],
      ['$FILE', '$EXPRESSION', 'docs/{a,b}.md'],
    ],
    [shellCommands, 'git add a>out 2>&1 b; git commit', ['a', 'b'], []],
    [shellCommands, '  # git add nothing', null, null],
    [shellCommands, 'echo done # then git add nothing', null, null],
    [
      jsCommands,
      "  execSync('git add package.json CHANGELOG.md README.md', { stdio: 'inherit' });",
      ['package.json', 'CHANGELOG.md', 'README.md'],
      [],
    ],
    [
      jsCommands,
      '  execSync("git add \\"docs/a b.md\\" README.md");',
      ['docs/a b.md', 'README.md'],
      [],
    ],
    [jsCommands, '  execSync(`git add ${file} README.md`);', ['README.md'], ['$EXPRESSION']],
    [
      packageScriptCommands,
      '{\n  "scripts": {\n    "version": "npm run format && git add -A src"\n  }\n}',
      ['src'],
      [],
    ],
  ];
  for (const [reader, source, paths, unchecked] of cases) {
    const found = reader(source);
    const label = `${reader.name} ${JSON.stringify(source)}`;
    if (paths === null) {
      expect(label, found.length, 0);
    } else if (found.length !== 1 || found[0].error) {
      failures.push(`${label}: got ${JSON.stringify(found)}, expected one command`);
    } else {
      expect(label, operands(found[0].words), { paths, unchecked });
    }
  }
  expect('a quote that does not close', Boolean(shellCommands("git add 'docs/x")[0]?.error), true);
  // The badge step's command: of its three paths, docs/test-coverage.md matches nothing.
  const badgeStep = shellCommands(cases[0][1])[0];
  expect('the badge step', missing(operands(badgeStep.words).paths), ['docs/test-coverage.md']);
  const lookups = ['package.json', 'src', '*.json', 'no-such-path', '*.no-such-extension'];
  expect('lookups', lookups.map(matchesTrackedFile), [true, true, true, false, false]);
  if (failures.length) {
    console.error(`self-test: ${failures.length} case(s) fail:`);
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }
  console.log(`self-test: ${cases.length + 3} cases pass`);
}

/**
 * Reads every git add in the scanned files and fails on a path that matches no tracked file.
 */
function check() {
  const kindOf = file => {
    if (file.startsWith('.github/workflows/')) return /\.ya?ml$/.test(file) ? shellCommands : null;
    if (file.startsWith('.husky/') || file.endsWith('.sh')) return shellCommands;
    if (path.basename(file) === 'package.json') return packageScriptCommands;
    return /\.[cm]?js$/.test(file) ? jsCommands : null;
  };
  const files = execFileSync(
    'git',
    ['ls-files', '-z', '--', '.github/workflows', '.husky', 'package.json', 'scripts'],
    { cwd: root, encoding: 'utf8' }
  )
    .split('\0')
    .filter(file => file && kindOf(file) && path.resolve(root, file) !== path.resolve(self));

  const commands = [];
  for (const file of files) {
    const found = kindOf(file)(readFileSync(path.join(root, file), 'utf8'));
    for (const command of found) commands.push({ where: `${file}:${command.line}`, ...command });
  }

  const failures = [];
  for (const command of commands) {
    if (command.error) {
      failures.push(`${command.where}: its words cannot be read (${command.error})`);
      continue;
    }
    command.operands = operands(command.words);
    for (const pathspec of missing(command.operands.paths)) {
      failures.push(`${command.where}: ${pathspec} matches no tracked file`);
    }
  }

  if (failures.length) {
    console.error(
      `${failures.length} problem(s) with "git add" commands; a path that matches no tracked ` +
        'file stops the command before it stages anything:'
    );
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }

  console.log(`${commands.length} "git add" command(s); each path matches a tracked file:`);
  for (const { where, operands: found } of commands) {
    const unchecked = found.unchecked.length ? ` (not checked: ${found.unchecked.join(' ')})` : '';
    console.log(`  ${where}: ${found.paths.join(' ') || '(options only)'}${unchecked}`);
  }
}

selfTest();
check();
