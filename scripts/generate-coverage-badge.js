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
  
  // Replace the coverage badge in the README
  readmeContent = readmeContent.replace(
    /!\[Test Coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-\d+%25-[a-z]+\.svg\)/,
    `![Test Coverage](https://img.shields.io/badge/coverage-${roundedCoverage}%25-${getCoverageColor(roundedCoverage)}.svg)`
  );
  
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
  
  // Update the test-coverage.md file
  const coverageDocPath = path.join(__dirname, '..', 'docs', 'test-coverage.md');
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