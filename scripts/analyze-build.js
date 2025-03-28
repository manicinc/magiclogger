const fs = require('fs');
const path = require('path');
const prettyBytes = require('pretty-bytes');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const README_PATH = path.join(__dirname, '..', 'README.md');

const FILES = [
  { file: 'index.js', label: 'CJS' },
  { file: 'index.mjs', label: 'ESM' },
  { file: 'index.d.ts', label: 'Types' }
];

function generateTable(files) {
  const header = `| File | Format | Size |\n|------|--------|------|`;
  const rows = files.map(({ file, label, size }) => {
    return `| \`${file}\` | ${label} | ${size} |`;
  }).join('\n');
  return `${header}\n${rows}`;
}

function injectIntoReadme(table) {
  let readme = fs.readFileSync(README_PATH, 'utf8');

  const sectionHeader = `## 📦 Build Output Sizes`;
  const sectionRegex = new RegExp(`## 📦 Build Output Sizes[\\s\\S]*?(?=\\n## |$)`, 'm');

  const newSection = `${sectionHeader}\n\n${table}\n\n*Generated via \`scripts/analyze-build.js\`.*`;

  if (sectionRegex.test(readme)) {
    readme = readme.replace(sectionRegex, newSection);
  } else {
    // Inject after the first heading
    readme = readme.replace(/^# Magiclogger.*?\n\n/, match => match + newSection + '\n\n');
  }

  fs.writeFileSync(README_PATH, readme);
  console.log('✅ README updated with build size table.');
}

function main() {
  const results = FILES.map(({ file, label }) => {
    const fullPath = path.join(DIST_DIR, file);
    if (!fs.existsSync(fullPath)) return null;
    const size = prettyBytes(fs.statSync(fullPath).size);
    return { file, label, size };
  }).filter(Boolean);

  const table = generateTable(results);
  injectIntoReadme(table);
}

main();
