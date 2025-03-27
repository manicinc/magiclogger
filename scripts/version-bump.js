#!/usr/bin/env node
/**
 * Manual version bump script for local testing
 * Usage: node scripts/version-bump.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version bump type from command line arguments
const bumpType = process.argv[2] || 'patch';
const validBumpTypes = ['patch', 'minor', 'major'];

if (!validBumpTypes.includes(bumpType)) {
  console.error(`Invalid bump type: ${bumpType}. Must be one of: ${validBumpTypes.join(', ')}`);
  process.exit(1);
}

try {
  // Run tests and lint to ensure quality
  console.log('Running tests and linting...');
  execSync('npm test && npm run lint', { stdio: 'inherit' });

  // Generate coverage badge
  console.log('Generating coverage badge...');
  execSync('npm run test:coverage:badge', { stdio: 'inherit' });

  // Bump the version
  console.log(`Bumping ${bumpType} version...`);
  const output = execSync(`npm version ${bumpType} --no-git-tag-version`).toString().trim();
  const newVersion = output.replace('v', '');
  
  console.log(`Version bumped to ${newVersion}`);
  
  // Update CHANGELOG.md
  console.log('Updating CHANGELOG.md...');
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  let changelog = '';
  
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }
  
  // Get git logs since last tag
  let gitLogs;
  try {
    gitLogs = execSync('git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"').toString();
  } catch (error) {
    // If no previous tag exists
    gitLogs = execSync('git log --pretty=format:"- %s"').toString();
  }
  
  if (!gitLogs.trim()) {
    gitLogs = '- No changes documented';
  }
  
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `## [${newVersion}] - ${today}\n\n${gitLogs}\n\n`;
  
  // Insert new entry after the header
  changelog = changelog.replace(
    /# Changelog.*?\n\n/s,
    match => `${match}${newEntry}`
  );
  
  fs.writeFileSync(changelogPath, changelog);
  
  console.log('CHANGELOG.md updated');
  
  // Stage the changes
  console.log('Staging changes...');
  execSync('git add package.json package-lock.json CHANGELOG.md README.md docs/test-coverage.md', { stdio: 'inherit' });
  
  // Create commit
  console.log('Creating commit...');
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  
  // Create tag
  console.log('Creating git tag...');
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  
  console.log(`\nVersion ${newVersion} prepared! To finish, run:`);
  console.log('  git push && git push --tags');
  console.log('Then the CI will handle npm publishing.');

} catch (error) {
  console.error('Error during version bump:', error.message);
  process.exit(1);
}