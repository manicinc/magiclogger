// File: tests/integration/lockfile-resolve.test.ts

/**
 * scripts/lockfile-resolve.sh is the Resolve step of .github/workflows/lockfile.yml. These
 * tests run it as the workflow does, with a stand-in pnpm that records its arguments. The
 * update input of a manual run reaches the script as UPDATE, and must reach pnpm as package
 * selectors only: an option such as --latest would move the whole workspace past the ranges
 * package.json keeps, and --no-save would leave the manifests out of step with the lockfile.
 */
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

const script = path.join(__dirname, '..', '..', 'scripts', 'lockfile-resolve.sh');

const updateCommand = [
  'update',
  '--recursive',
  '--include-workspace-root',
  '--depth',
  'Infinity',
  '--no-save',
  '--lockfile-only',
];

describe('lockfile.yml Resolve step (scripts/lockfile-resolve.sh)', () => {
  let dir: string;
  let bin: string;
  let argsFile: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'lockfile-resolve-'));
    bin = path.join(dir, 'bin');
    argsFile = path.join(dir, 'pnpm-args');
    mkdirSync(bin);
    const pnpm = path.join(bin, 'pnpm');
    writeFileSync(pnpm, `#!/bin/sh\nprintf '%s\\n' "$@" > '${argsFile}'\n`);
    chmodSync(pnpm, 0o755);
    // A folder that the pattern @docusaurus/* matches, were the shell to expand it.
    mkdirSync(path.join(dir, '@docusaurus', 'core'), { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /** Runs the step with UPDATE set; args is what pnpm received, or null when it never ran. */
  function resolve(update: string) {
    rmSync(argsFile, { force: true });
    const result = spawnSync('bash', [script], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, UPDATE: update },
    });
    const args = existsSync(argsFile)
      ? readFileSync(argsFile, 'utf8').split('\n').filter(Boolean)
      : null;
    return { status: result.status, args };
  }

  it('resolves the manifests alone when the input names no package', () => {
    expect(resolve('')).toEqual({ status: 0, args: ['install', '--lockfile-only'] });
    expect(resolve('   ')).toEqual({ status: 0, args: ['install', '--lockfile-only'] });
  });

  it('passes each name and pattern to pnpm update as written', () => {
    expect(resolve('qs  @docusaurus/* @aws-sdk/client-s3')).toEqual({
      status: 0,
      args: [...updateCommand, 'qs', '@docusaurus/*', '@aws-sdk/client-s3'],
    });
  });

  it.each(['--latest', 'qs -L', 'qs --global', '-r'])('refuses the option in %p', update => {
    expect(resolve(update)).toEqual({ status: 1, args: null });
  });

  // pnpm update name@version moves the package to that version whatever package.json declares,
  // and --no-save leaves the manifest behind the lockfile.
  it.each(['jest@30.0.0', 'qs @docusaurus/core@3.10.2', 'qs@6'])(
    'refuses the version in %p',
    update => {
      expect(resolve(update)).toEqual({ status: 1, args: null });
    }
  );

  // Each input writes a file when a shell runs it, so a script that ran the input before
  // refusing it would leave that file in the working folder.
  it.each(['qs;touch x', 'qs $(touch y)', 'qs`touch z`', 'qs|tee w', "qs'"])(
    'refuses the shell syntax in %p',
    update => {
      expect(resolve(update)).toEqual({ status: 1, args: null });
      expect(readdirSync(dir).sort()).toEqual(['@docusaurus', 'bin']);
    }
  );
});
