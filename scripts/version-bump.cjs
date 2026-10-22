#!/usr/bin/env node
/**
 * Comprehensive version bump script for local development
 * Usage: node scripts/version-bump.cjs [patch|minor|major]
 *
 * CommonJS, hence .cjs: package.json sets "type": "module", which makes a .js file an ES
 * module, and require is not defined there.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version bump type from command line arguments
const bumpType = process.argv[2] || 'patch';
const validBumpTypes = ['patch', 'minor', 'major'];

// Validate bump type
if (!validBumpTypes.includes(bumpType)) {
  console.error(`Invalid bump type: ${bumpType}. Must be one of: ${validBumpTypes.join(', ')}`);
  process.exit(1);
}

/**
 * Prints a message in the colour of its type.
 *
 * @param {string} message
 * @param {'info' | 'success' | 'error' | 'warning'} [type]
 */
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m' // Yellow
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
}

/**
 * Lists the changes the release commit would take in besides the bump: everything already
 * staged, and uncommitted changes in src/ and in the files this script stages (package.json,
 * CHANGELOG.md, README.md). npm version runs the package's "version" script, which formats src/
 * and stages all of it, and this script commits the whole index.
 *
 * @returns {string} One line per change, empty when there are none.
 */
function changesTheReleaseWouldTake() {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  const changed = execSync(
    'git status --porcelain --untracked-files=all -- src package.json CHANGELOG.md README.md',
    { encoding: 'utf8' }
  ).trim();
  return [staged, changed].filter(Boolean).join('\n');
}

try {
  // A change of your own would ship in the release commit and its tag.
  const pending = changesTheReleaseWouldTake();
  if (pending) {
    log('Commit or stash these changes first; the release commit would include them:', 'error');
    console.log(pending);
    process.exit(1);
  }

  // Pre-bump checks
  log('Running pre-bump checks...', 'warning');
  
  // Run tests
  log('Running tests...');
  execSync('npm test', { stdio: 'inherit' });
  
  // Run linting
  log('Running linter...');
  execSync('npm run lint', { stdio: 'inherit' });
  
  // Bump version
  log(`Bumping ${bumpType} version...`, 'warning');
  const output = execSync(`npm version ${bumpType} --no-git-tag-version`).toString().trim();
  const newVersion = output.replace('v', '');
  
  log(`Version bumped to ${newVersion}`, 'success');

  // Update README version badge
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  const versionBadge = `![Version](https://img.shields.io/badge/version-${newVersion}-blue.svg)`;
  const versionRegex = /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[^)]*\.svg\)/;

  readmeContent = readmeContent.replace(versionRegex, versionBadge);
  fs.writeFileSync(readmePath, readmeContent);

  // Prepare CHANGELOG
  log('Updating CHANGELOG.md...', 'warning');
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  let changelog = fs.existsSync(changelogPath) 
    ? fs.readFileSync(changelogPath, 'utf8')
    : '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  
  // Retrieve git logs
  let gitLogs;
  try {
    gitLogs = execSync('git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"').toString().trim();
  } catch (error) {
    gitLogs = execSync('git log --pretty=format:"- %s"').toString().trim();
  }
  
  if (!gitLogs) {
    gitLogs = '- No changes documented';
  }
  
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `## [${newVersion}] - ${today}\n\n${gitLogs}\n\n`;
  
  changelog = changelog.replace(
    /# Changelog.*?\n\n/s,
    match => `${match}${newEntry}`
  );
  
  fs.writeFileSync(changelogPath, changelog);

  // Stage the files this script writes. git add stages nothing when one of its paths matches no
  // file (scripts/check-git-add-paths.js checks that in CI).
  log('Staging changes...', 'warning');
  execSync('git add package.json CHANGELOG.md README.md', { stdio: 'inherit' });
  
  // Commit changes
  log('Creating commit...', 'warning');
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  
  // Create tag
  log('Creating git tag...', 'warning');
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  
  log('\n🎉 Version bump completed successfully!', 'success');
  log('Next steps:', 'info');
  log('  1. Verify changes', 'info');
  // The tag workflow (release.yml) publishes nothing to npm, and semantic-release takes the
  // highest v* tag as the last release, so the version goes to npm before the tag is pushed.
  log('  2. Run: npm publish (with your own npm login)', 'info');
  log('  3. Then: git push && git push --tags', 'info');

} catch (error) {
  log(`Error during version bump: ${error.message}`, 'error');
  process.exit(1);
}