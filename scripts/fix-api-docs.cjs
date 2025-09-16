#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all HTML files in the API docs directory
const apiDocsDir = path.join(__dirname, '..', 'website', 'static', 'api');
const htmlFiles = glob.sync(path.join(apiDocsDir, '**/*.html'));

console.log(`Processing ${htmlFiles.length} HTML files...`);

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Add favicon links after <title> tag
  if (!content.includes('favicon.ico') && content.includes('</title>')) {
    content = content.replace(
      '</title>',
      `</title>
<link rel="icon" type="image/x-icon" href="/api/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/api/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/api/favicon-16x16.png">`
    );
    modified = true;
  }

  // Update navigation - add Home link to magiclog.io
  if (content.includes('<div id="tsd-toolbar-links">')) {
    // Check if Home link doesn't already exist
    if (!content.includes('href="https://magiclog.io"')) {
      content = content.replace(
        '<div id="tsd-toolbar-links">',
        '<div id="tsd-toolbar-links"><a href="https://magiclog.io">🏠 Home</a>'
      );
      modified = true;
    }
  }

  // Update the main README section to match the actual README style
  if (file.endsWith('index.html')) {
    // Update the logo image path
    content = content.replace(
      'src="media/magiclog-primary-no-subtitle-transparent-4x.png"',
      'src="https://raw.githubusercontent.com/manicinc/magiclogger/master/website/static/img/magiclog-primary-no-subtitle-transparent-4x.png"'
    );

    // Add centered documentation links like in README
    const docLinksHtml = `<p align="center">
  <a href="https://magiclog.io"><strong>🌐 Documentation & Website</strong></a> •
  <a href="https://magiclog.io/api/"><strong>📚 API Reference</strong></a>
</p>`;

    // Insert after the logo if not already present
    if (!content.includes('Documentation & Website') && content.includes('</p>')) {
      const logoEndIndex = content.indexOf('</p>', content.indexOf('magiclog-primary'));
      if (logoEndIndex > -1) {
        content = content.slice(0, logoEndIndex + 4) + '\n' + docLinksHtml + content.slice(logoEndIndex + 4);
        modified = true;
      }
    }

    // Update badge URLs to use correct sizes (47KB instead of 36KB)
    content = content.replace(/core_gzip-36kb/g, 'core_gzip-47kb');
    content = content.replace(/core_console_gzip-36kb/g, 'core_console_gzip-47kb');
    content = content.replace(/core_transports_gzip-41kb/g, 'core_transports_gzip-51kb');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Updated ${path.relative(apiDocsDir, file)}`);
  }
});

console.log('API docs post-processing complete!');