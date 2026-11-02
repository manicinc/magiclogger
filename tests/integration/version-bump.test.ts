// File: tests/integration/version-bump.test.ts

/**
 * scripts/version-bump.cjs is the release path by hand. semantic-release tags and publishes with
 * nothing committed, so package.json on master stays behind the highest v* tag. These tests run
 * the script in a scratch repository with real git and npm: the version it picks has to come after
 * every version already tagged on the branch, or its tag and its npm publish meet a released one.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

jest.setTimeout(60_000);

const script = path.join(__dirname, '..', '..', 'scripts', 'version-bump.cjs');

const env = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.com',
  GIT_COMMITTER_NAME: 'Fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.com',
};

describe('scripts/version-bump.cjs', () => {
  let dir: string;

  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: dir, env, encoding: 'utf8' }).trim();

  /** Makes a repository on master at this package.json version, with nothing left to commit. */
  function repository(version: string) {
    const manifest = {
      name: 'fixture',
      version,
      scripts: { test: 'node -e 0', lint: 'node -e 0' },
    };
    writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(path.join(dir, 'CHANGELOG.md'), '# Changelog\n\n');
    writeFileSync(path.join(dir, 'README.md'), '# Fixture\n');
    mkdirSync(path.join(dir, 'scripts'));
    copyFileSync(script, path.join(dir, 'scripts', 'version-bump.cjs'));
    git('init', '-q', '-b', 'master');
    git('add', '-A');
    git('commit', '-q', '-m', 'chore: start');
  }

  /** Runs the script as npm run version:bump does; version is package.json's afterwards. */
  function bump(type: string) {
    const result = spawnSync('node', ['scripts/version-bump.cjs', type], {
      cwd: dir,
      env,
      encoding: 'utf8',
    });
    const { version } = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    return { status: result.status, output: `${result.stdout}${result.stderr}`, version };
  }

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'version-bump-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('bumps past the highest tag when a release left package.json behind', () => {
    repository('0.1.1');
    git('tag', 'v0.1.0');
    git('tag', 'v0.1.2');

    const { status, output, version } = bump('patch');

    expect(output).not.toContain('already exists');
    expect(status).toBe(0);
    expect(version).toBe('0.1.3');
    expect(git('tag', '--list', 'v0.1.3')).toBe('v0.1.3');
    expect(git('log', '-1', '--format=%s')).toBe('chore: release v0.1.3');
  });

  it('applies the bump type to that tag', () => {
    repository('0.1.1');
    git('tag', 'v0.1.2');

    const { status, version } = bump('minor');

    expect(status).toBe(0);
    expect(version).toBe('0.2.0');
  });

  it('orders tags as versions, not as text', () => {
    repository('0.1.1');
    git('tag', 'v0.1.9');
    git('tag', 'v0.1.10');

    const { status, version } = bump('patch');

    expect(status).toBe(0);
    expect(version).toBe('0.1.11');
  });

  it('bumps from package.json when it is ahead of every tag', () => {
    repository('0.3.0');
    git('tag', 'v0.1.2');

    const { status, version } = bump('patch');

    expect(status).toBe(0);
    expect(version).toBe('0.3.1');
  });

  it('counts release tags on this branch only', () => {
    repository('0.1.1');
    git('tag', 'v0.2.0-rc.1');
    git('tag', 'vnext');
    git('checkout', '-q', '-b', 'other');
    git('commit', '-q', '--allow-empty', '-m', 'chore: elsewhere');
    git('tag', 'v0.9.0');
    git('checkout', '-q', 'master');

    const { status, version } = bump('patch');

    expect(status).toBe(0);
    expect(version).toBe('0.1.2');
  });
});
