/**
 * Script to generate a coverage badge from Jest coverage reports
 * and update the test-coverage.md file with the latest report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the coverage summary
const coverageSummaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

try {
  // Check if coverage summary exists
  if (!fs.existsSync(coverageSummaryPath)) {
    console.error('Coverage summary not found. Run jest --coverage first.');
    process.exit(1);
  }

  // Read the coverage data
  const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
  const totalCoverage = coverageData.total;
  
  // Calculate overall coverage (using line coverage as the primary metric)
  const lineCoverage = totalCoverage.lines.pct;
  const roundedCoverage = Math.round(lineCoverage);
  
  // Read the current README
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Replace existing coverage badge in README (Markdown or HTML). If missing, insert alongside other badges.
  const mdBadgeRegex = /!\[Test Coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-[a-z]+\.svg\)/i;
  const htmlBadgeRegex = /<img[^>]*src=["']https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-[a-z]+\.svg["'][^>]*alt=["']Test Coverage["'][^>]*>/i;
  const newBadge = `<img src="https://img.shields.io/badge/coverage-${roundedCoverage}%25-${getCoverageColor(roundedCoverage)}.svg" alt="Test Coverage">`;

  if (mdBadgeRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(mdBadgeRegex, newBadge);
  } else if (htmlBadgeRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(htmlBadgeRegex, newBadge);
  } else {
    // Insert into the badges block if present
    const badgesBlockRegex = /<p align="center">([\s\S]*?)<\/p>/i;
    if (badgesBlockRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(badgesBlockRegex, (full, inner) => {
        // Add the badge just before the size badges if possible, else append
        return `<p align="center">\n${inner.trim()}\n  ${newBadge}\n</p>`;
      });
    } else {
      // Prepend a badges block
      readmeContent = `<p align="center">\n  ${newBadge}\n</p>\n\n` + readmeContent;
    }
  }
  
  // Write the updated README
  fs.writeFileSync(readmePath, readmeContent);
  
  // Read the latest coverage report from lcov-report/index.html
  const lcovReportPath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');
  let lcovContent = fs.readFileSync(lcovReportPath, 'utf8');
  
  // Extract the coverage table
  const tableMatch = lcovContent.match(/<table class="coverage-summary">([\s\S]*?)<\/table>/);
  let coverageTable = '';
  
  if (tableMatch && tableMatch[1]) {
    const tableContent = tableMatch[1];
    
    // Convert HTML table to markdown
    // This is a simple conversion and may need adjustments
    const rows = tableContent.match(/<tr>([\s\S]*?)<\/tr>/g);
    
    if (rows) {
      // Process header row
      const headerCells = rows[0].match(/<th[^>]*>([\s\S]*?)<\/th>/g);
      if (headerCells) {
        coverageTable += '| ' + headerCells.map(cell => {
          const content = cell.replace(/<[^>]*>/g, '').trim();
          return content;
        }).join(' | ') + ' |\n';
        
        // Add separator row
        coverageTable += '|' + headerCells.map(() => '---------|').join('') + '\n';
      }
      
      // Process data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if (cells) {
          coverageTable += '| ' + cells.map(cell => {
            const content = cell.replace(/<[^>]*>/g, '').trim();
            return content;
          }).join(' | ') + ' |\n';
        }
      }
    }
  }
  
  // If we couldn't extract the table properly, use a simplified format
  if (!coverageTable) {
    coverageTable = `
--------------------------------|---------|----------|---------|---------|-------------------
File                            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------|---------|----------|---------|---------|-------------------
All files                       |   ${totalCoverage.statements.pct.toFixed(2)} |    ${totalCoverage.branches.pct.toFixed(2)} |   ${totalCoverage.functions.pct.toFixed(2)} |   ${totalCoverage.lines.pct.toFixed(2)} |                   
--------------------------------|---------|----------|---------|---------|-------------------
`;
  }
  
  // Update the coverage doc (support both kebab/underscore names)
  const docKebab = path.join(__dirname, '..', 'docs', 'test-coverage.md');
  const docSnake = path.join(__dirname, '..', 'docs', 'test_coverage.md');
  const coverageDocPath = fs.existsSync(docKebab) ? docKebab : fs.existsSync(docSnake) ? docSnake : docSnake;

  // If the file doesn't exist, create a minimal template so replacements succeed
  if (!fs.existsSync(coverageDocPath)) {
    const initial = `# Test Coverage\n\nLatest coverage summary:\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n````\n`;
    // ensure docs dir exists
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(coverageDocPath, initial);
  }

  let coverageDoc = fs.readFileSync(coverageDocPath, 'utf8');
  
  // Replace the coverage table section
  coverageDoc = coverageDoc.replace(
    /```\n[\s\S]*?```/,
    '```\n' + coverageTable.trim() + '\n```'
  );
  
  // Update the coverage breakdown
  coverageDoc = coverageDoc.replace(
    /- \*\*Statements\*\*: [\d.]+% covered/,
    `- **Statements**: ${totalCoverage.statements.pct.toFixed(2)}% covered`
  );
  
  coverageDoc = coverageDoc.replace(
    /- \*\*Branches\*\*: [\d.]+% covered/,
    `- **Branches**: ${totalCoverage.branches.pct.toFixed(2)}% covered`
  );
  
  coverageDoc = coverageDoc.replace(
    /- \*\*Functions\*\*: [\d.]+% covered/,
    `- **Functions**: ${totalCoverage.functions.pct.toFixed(2)}% covered`
  );
  
  coverageDoc = coverageDoc.replace(
    /- \*\*Lines\*\*: [\d.]+% covered/,
    `- **Lines**: ${totalCoverage.lines.pct.toFixed(2)}% covered`
  );
  
  // Write the updated coverage doc
  fs.writeFileSync(coverageDocPath, coverageDoc);
  
  console.log(`Updated coverage badge to ${roundedCoverage}% and test-coverage.md`);

} catch (error) {
  console.error('Error generating coverage badge:', error);
  process.exit(1);
}

/**
 * Get the appropriate color for a coverage percentage
 */
function getCoverageColor(coverage) {
  if (coverage >= 90) return 'brightgreen';
  if (coverage >= 80) return 'green';
  if (coverage >= 70) return 'yellowgreen';
  if (coverage >= 60) return 'yellow';
  if (coverage >= 50) return 'orange';
  return 'red';
}