#!/usr/bin/env node
/**
 * Comprehensive Changelog Generation Script
 * Pulls commits from GitHub and formats them for release
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration from package.json or a separate config file
const packageJson = require('../package.json');

// GitHub repository details
const [owner, repo] = packageJson.repository.url
  .replace('https://github.com/', '')
  .replace('.git', '')
  .split('/');

// Create Octokit instance with optional GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Commit categorization
const commitCategories = {
  feat: 'Features',
  fix: 'Bug Fixes',
  docs: 'Documentation',
  style: 'Style Changes',
  refactor: 'Refactoring',
  perf: 'Performance Improvements',
  test: 'Test Updates',
  chore: 'Maintenance',
  build: 'Build System',
  ci: 'Continuous Integration'
};

async function generateChangelog(fromTag = null, toTag = 'HEAD') {
  try {
    // Get the latest tag if not provided
    if (!fromTag) {
      fromTag = execSync('git describe --tags --abbrev=0').toString().trim();
    }

    // Fetch commits between tags
    const commits = await fetchCommitsBetweenTags(fromTag, toTag);

    // Categorize and format commits
    const categorizedCommits = categorizeCommits(commits);

    // Generate markdown changelog
    return generateMarkdownChangelog(categorizedCommits, fromTag, toTag);
  } catch (error) {
    console.error('Error generating changelog:', error);
    process.exit(1);
  }
}

async function fetchCommitsBetweenTags(fromTag, toTag) {
  try {
    // Use git log to get commits between tags
    const commitLog = execSync(`git log ${fromTag}..${toTag} --pretty=format:"%h|%s|%b"`).toString();
    
    return commitLog.split('\n')
      .map(line => {
        const [hash, subject, body] = line.split('|');
        return { hash, subject, body };
      })
      .filter(commit => commit.subject.trim() !== '');
  } catch (error) {
    console.error('Error fetching git commits:', error);
    return [];
  }
}

function categorizeCommits(commits) {
  const categorized = Object.keys(commitCategories).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});

  // Uncategorized commits
  categorized.other = [];

  commits.forEach(commit => {
    const matchedCategory = Object.keys(commitCategories).find(category => 
      commit.subject.toLowerCase().startsWith(`${category}:`)
    );

    if (matchedCategory) {
      categorized[matchedCategory].push({
        message: commit.subject.replace(`${matchedCategory}:`, '').trim(),
        body: commit.body
      });
    } else {
      categorized.other.push({
        message: commit.subject,
        body: commit.body
      });
    }
  });

  return categorized;
}

function generateMarkdownChangelog(categorizedCommits, fromTag, toTag) {
  const today = new Date().toISOString().split('T')[0];
  let changelog = `## [Unreleased]\n\n`;

  // Add commits for each category
  Object.keys(commitCategories).forEach(category => {
    if (categorizedCommits[category].length > 0) {
      changelog += `### ${commitCategories[category]}\n\n`;
      categorizedCommits[category].forEach(commit => {
        changelog += `- ${commit.message}\n`;
      });
      changelog += '\n';
    }
  });

  // Add other/uncategorized commits if any
  if (categorizedCommits.other.length > 0) {
    changelog += `### Other Changes\n\n`;
    categorizedCommits.other.forEach(commit => {
      changelog += `- ${commit.message}\n`;
    });
    changelog += '\n';
  }

  return changelog;
}

// Main execution
async function main() {
  const changelog = await generateChangelog();
  
  // Path to CHANGELOG.md
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  
  // Read existing changelog
  let existingChangelog = '';
  if (fs.existsSync(changelogPath)) {
    existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  }

  // Prepend new changelog to existing content
  const updatedChangelog = `# Changelog\n\n${changelog}${existingChangelog}`;
  
  // Write updated changelog
  fs.writeFileSync(changelogPath, updatedChangelog);
  
  console.log('Changelog generated successfully!');
}

// Run the script
main();