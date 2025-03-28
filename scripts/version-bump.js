#!/usr/bin/env node
/**
 * Comprehensive version bump script for local development
 * Usage: node scripts/version-bump.js [patch|minor|major]
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

// Comprehensive logging function
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m' // Yellow
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
}

try {
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
  
  // Generate coverage badge
  log('Generating coverage badge...', 'warning');
  execSync('npm run test:coverage:badge', { stdio: 'inherit' });

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

  // Stage changes
  log('Staging changes...', 'warning');
  execSync('git add package.json package-lock.json CHANGELOG.md README.md docs/test-coverage.md', { stdio: 'inherit' });
  
  // Commit changes
  log('Creating commit...', 'warning');
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  
  // Create tag
  log('Creating git tag...', 'warning');
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  
  log('\n🎉 Version bump completed successfully!', 'success');
  log('Next steps:', 'info');
  log('  1. Verify changes', 'info');
  log('  2. Run: git push && git push --tags', 'info');
  log('  3. Trigger npm publish via CI/CD', 'info');

} catch (error) {
  log(`Error during version bump: ${error.message}`, 'error');
  process.exit(1);
}