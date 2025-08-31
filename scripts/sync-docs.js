#!/usr/bin/env node

/**
 * Sync documentation from docs/ to website/docs/
 * This ensures we maintain a single source of truth for documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '..', 'docs');
const TARGET_DIR = path.join(__dirname, '..', 'website', 'docs');

// Files to sync from docs/ to website/docs/
const DOCS_TO_SYNC = [
  'ARCHITECTURE.md',
  'transports.md',
  'MAGIC_SCHEMA.md',
  'api_usage.md',
  'browser_storage.md',
  'build_instructions.md',
  'cicd.md',
  'codecov.md',
  'context-and-tags.md',
  'contributing.md',
  'deployment.md',
  'development.md',
  'documentation-structure.md',
  'formatters.md',
  'git_workflow.md',
  'intro.md',
  'publishing.md',
  'styling.md',
  'terminal_support.md',
  'test_coverage.md',
];

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Sync each documentation file
DOCS_TO_SYNC.forEach((file) => {
  const sourcePath = path.join(SOURCE_DIR, file);
  const targetPath = path.join(TARGET_DIR, file);

  if (fs.existsSync(sourcePath)) {
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Add frontmatter if it doesn't exist
    let finalContent = content;
    if (!content.startsWith('---')) {
      // Derive id from filename (kebab to snake where needed) and preserve case for known UPPER ids
      const baseName = path.basename(file, '.md');
      const upperIds = new Set(['ARCHITECTURE', 'MAGIC_SCHEMA', 'TRANSPORTS']);
      const id = upperIds.has(baseName)
        ? baseName
        : baseName.replace(/-/g, '_');
      const title = (upperIds.has(baseName)
        ? baseName
        : baseName.replace(/-/g, ' '))
        .replace(/\b\w/g, (c) => c.toUpperCase());

      finalContent = `---
id: ${id}
title: ${title}
---

${content}`;
    }
    
    fs.writeFileSync(targetPath, finalContent);
    console.log(`✓ Synced ${file}`);
  } else {
    console.warn(`⚠ Source file not found: ${file}`);
  }
});

console.log('\n✅ Documentation sync complete!');
console.log('Docs are maintained in docs/ and synced to website/docs/ for Docusaurus.');