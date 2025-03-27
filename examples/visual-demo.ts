/**
 * Magiclogger Style Demo
 * 
 * This script demonstrates all styling features of the Magiclogger
 * with detailed examples, descriptions, and visual formatting.
 * 
 * Run with one of these commands:
 *   - ESM (modern):   node --experimental-specifier-resolution=node examples/style-demo.js
 *   - CommonJS:       node examples/style-demo.cjs
 *   - TypeScript:     npx ts-node-esm examples/style-demo.ts
 */

import { Logger, COLORS, PRESETS, ColorName, StylePreset } from 'magiclogger';

// Helper function to pause execution
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main demo function that showcases all styling capabilities
 */
async function runStyleDemo(): Promise<void> {
  // Create a logger with colors enabled and file logging
  const logger = new Logger({
    useColors: true,
    writeToDisk: false,
    verbose: true,
  });

  // Clear the screen and show a welcome message
  console.clear();
  
  console.log('\n');
  logger.header('  MAGIC LOGGER STYLE GUIDE  ', ['brightWhite', 'bgMagenta', 'bold']);
  console.log('\n');
  
  await sleep(1000);
  
  //=============================================================================
  // SECTION 1: BUILT-IN LOGGING LEVELS & STYLING
  //=============================================================================
  logger.header('1. BUILT-IN LOGGING LEVELS & STYLING');
  console.log('Magiclogger provides several built-in logging methods with pre-defined styling:');
  await sleep(800);
  
  // Standard log - Cyan prefix
  logger.log('Standard information message (logger.log)');
  await sleep(600);
  
  // Success log - Green prefix
  logger.success('Success message for completed operations (logger.success)');
  await sleep(600);
  
  // Warning log - Yellow prefix
  logger.warn('Warning message for potential issues (logger.warn)');
  await sleep(600);
  
  // Error log - Bright red prefix
  logger.error('Error message for failures (logger.error)');
  await sleep(600);
  
  // Debug log - Gray, italic prefix (only shown when verbose: true)
  logger.debug('Debug message for troubleshooting (logger.debug)');
  await sleep(1000);
  
  //=============================================================================
  // SECTION 2: STYLE PRESETS
  //=============================================================================
  console.log('\n');
  logger.header('2. STYLE PRESETS');
  console.log('Magiclogger includes pre-defined style combinations called "presets":');
  await sleep(800);
  
  // Display all available style presets with examples and their component styles
  const allPresets: StylePreset[] = [
    'info', 'success', 'warning', 'error', 'debug', 
    'important', 'highlight', 'muted', 'special', 'code', 'header'
  ];
  
  // Show each preset with its component styles
  for (const preset of allPresets) {
    // Extract the color names used in this preset
    const colorNames = PRESETS[preset]
      .map(colorCode => {
        // Find the color name by its code
        const entry = Object.entries(COLORS).find(([_, code]) => code === colorCode);
        return entry ? entry[0] : 'unknown';
      })
      .join(', ');
    
    // Display the preset and its components
    console.log(`\n${preset.toUpperCase()} preset - uses: [${colorNames}]`);
    logger.styled(`This message uses the "${preset}" preset style with logger.styled()`, preset);
    await sleep(500);
  }
  
  // Example of how to use the styled method
  console.log('\nUsage example:');
  console.log(`  logger.styled('This is an important message', 'important');`);
  await sleep(1000);
  
  //=============================================================================
  // SECTION 3: CUSTOM STYLING WITH PREFIXES
  //=============================================================================
  console.log('\n');
  logger.header('3. CUSTOM STYLING WITH PREFIXES');
  console.log('Create your own styled messages with custom prefixes and color combinations:');
  await sleep(800);
  
  // Basic custom styling
  logger.custom('Basic custom message with default white color', ['white'], 'BASIC');
  await sleep(400);
  
  // Custom styling with multiple colors/styles
  logger.custom('Custom styling with multiple attributes combined', ['brightGreen', 'bold', 'italic'], 'COMBINED');
  await sleep(400);
  
  // Domain-specific styling examples
  logger.custom('Database connection established to mongodb://localhost:27017', ['cyan', 'bold'], 'DATABASE');
  await sleep(400);
  
  logger.custom('Authentication token verified for user@example.com', ['green', 'bold'], 'AUTH');
  await sleep(400);
  
  logger.custom('Token validation failed: signature mismatch', ['red', 'bold'], 'AUTH');
  await sleep(400);
  
  logger.custom('GET /api/users?page=1&limit=10 (200 OK, 45ms)', ['blue'], 'API');
  await sleep(400);
  
  logger.custom('Memory usage: 128MB (24% increase)', ['magenta'], 'SYSTEM');
  await sleep(400);
  
  // Semantic status indicators with symbols
  logger.custom('Operation completed successfully (duration: 235ms)', ['green', 'bold'], '✓');
  await sleep(400);
  
  logger.custom('Operation failed (reason: connection timeout)', ['red', 'bold'], '✗');
  await sleep(400);
  
  logger.custom('Operation in progress (elapsed: 5s)', ['yellow', 'bold'], '⧖');
  await sleep(400);
  
  // Usage example
  console.log('\nUsage example:');
  console.log(`  logger.custom('Custom message', ['red', 'bold'], 'PREFIX');`);
  await sleep(1000);
  
  //=============================================================================
  // SECTION 4: COLOR FACTORY FUNCTIONS
  //=============================================================================
  console.log('\n');
  logger.header('4. COLOR FACTORY FUNCTIONS');
  console.log('Create reusable color functions for consistent styling throughout your app:');
  await sleep(800);
  
  // Create reusable color functions
  const highlight = logger.color('yellow', 'bold');
  const code = logger.color('brightGreen');
  const error = logger.color('brightRed', 'bold');
  const success = logger.color('green', 'bold');
  const path = logger.color('brightCyan', 'underline');
  const metric = logger.color('magenta', 'bold');
  
  // Use the color functions in log messages
  console.log(`Use ${highlight('magiclogger')} to add beautiful formatting to your CLI apps!`);
  await sleep(400);
  
  console.log(`Import the package with ${code('import { Logger } from "magiclogger";')}`);
  await sleep(400);
  
  console.log(`Task status: ${success('COMPLETED')} (duration: ${metric('45ms')}, result: ${success('success')})`);
  await sleep(400);
  
  console.log(`Task status: ${error('FAILED')} (error: ${error('timeout')}, check logs at ${path('./logs/app.log')})`);
  await sleep(400);
  
  // Usage example
  console.log('\nUsage example:');
  console.log(`  const highlight = logger.color('yellow', 'bold');`);
  console.log(`  console.log(\`Important \${highlight('highlighted')}\`);`);
  await sleep(1000);
  
  //=============================================================================
  // SECTION 5: SELECTIVELY COLORIZING MESSAGE PARTS
  //=============================================================================
  console.log('\n');
  logger.header('5. SELECTIVELY COLORIZING MESSAGE PARTS');
  console.log('Apply different colors to specific parts of a message:');
  await sleep(800);
  
  // User activity logs with colored parts
  console.log(logger.colorParts(
    'User john.doe@example.com logged in from 192.168.1.100 at 2023-05-15T14:30:00Z',
    {
      'john.doe@example.com': ['brightYellow', 'underline'],
      '192.168.1.100': ['cyan', 'bold'],
      '2023-05-15T14:30:00Z': ['green']
    }
  ));
  await sleep(400);
  
  // API request logs with colored parts
  console.log(logger.colorParts(
    'HTTP Request: GET /api/users?page=1&limit=10 - Response: 200 OK (45ms)',
    {
      'GET': ['brightBlue', 'bold'],
      '/api/users?page=1&limit=10': ['brightBlue', 'underline'],
      '200 OK': ['green', 'bold'],
      '45ms': ['magenta']
    }
  ));
  await sleep(400);
  
  // Error messages with colored parts
  console.log(logger.colorParts(
    'Error: Failed to connect to database "users_db" on localhost:5432 - ETIMEDOUT',
    {
      'Error:': ['brightRed', 'bold'],
      'users_db': ['yellow', 'underline'],
      'localhost:5432': ['cyan'],
      'ETIMEDOUT': ['red', 'italic']
    }
  ));
  await sleep(400);
  
  // Code examples with colored parts
  console.log(logger.colorParts(
    'Fix: Change import { Logger } from "./logger" to import { Logger } from "magiclogger"',
    {
      'Fix:': ['green', 'bold'],
      'import { Logger } from "./logger"': ['red', 'strikethrough'],
      'import { Logger } from "magiclogger"': ['brightGreen']
    }
  ));
  await sleep(400);
  
  // Usage example
  console.log('\nUsage example:');
  console.log(`  logger.colorParts('Message with parts', {`);
  console.log(`    'parts': ['green', 'bold'],`);
  console.log(`    'Message': ['blue']`);
  console.log(`  });`);
  await sleep(1000);
  
  //=============================================================================
  // SECTION 6: ADVANCED STYLE COMBINATIONS
  //=============================================================================
  console.log('\n');
  logger.header('6. ADVANCED STYLE COMBINATIONS');
  console.log('Combine multiple styles for maximum visual impact:');
  await sleep(800);
  
  // Combining background and foreground colors
  logger.custom('Light text on dark background', ['brightWhite', 'bgBlue'], 'CONTRAST');
  await sleep(400);
  
  // Using reverse to swap colors
  logger.custom('Reversed colors for emphasis', ['green', 'reverse', 'bold'], 'REVERSE');
  await sleep(400);
  
  // Maximum emphasis with multiple styles
  logger.custom('Critical system alert - Immediate action required', ['brightWhite', 'bgRed', 'bold'], 'CRITICAL');
  await sleep(400);
  
  // Using dim with bright colors for subtle effects
  logger.custom('Subtle notification with reduced brightness', ['brightCyan', 'dim'], 'SUBTLE');
  await sleep(400);
  
  // Using colors with strikethrough
  logger.custom('Deprecated: This method will be removed in v2.0', ['brightYellow', 'strikethrough'], 'DEPRECATED');
  await sleep(400);
  
  // Creating badge styles
  console.log('\nCustom badge styles:');
  
  const createBadge = (text: string, type: 'info'|'warning'|'error'|'success') => {
    const styles: Record<string, ColorName[]> = {
      'info': ['brightWhite', 'bgBlue'],
      'warning': ['black', 'bgYellow'],
      'error': ['brightWhite', 'bgRed'],
      'success': ['brightWhite', 'bgGreen']
    };
    
    return `${COLORS[styles[type][0]]}${COLORS[styles[type][1]]} ${text} ${COLORS.reset}`;
  };
  
  console.log(`${createBadge('INFO', 'info')} Regular information message`);
  await sleep(300);
  console.log(`${createBadge('WARNING', 'warning')} Warning about potential issues`);
  await sleep(300);
  console.log(`${createBadge('ERROR', 'error')} Critical error message`);
  await sleep(300);
  console.log(`${createBadge('SUCCESS', 'success')} Operation completed successfully`);
  await sleep(1000);
  
  //=============================================================================
  // SECTION 7: AVAILABLE COLORS & STYLES
  //=============================================================================
  console.log('\n');
  logger.header('7. AVAILABLE COLORS & STYLES');
  console.log('Magiclogger provides a rich set of colors and style modifiers:');
  await sleep(800);
  
  // Foreground colors
  console.log('\nForeground Colors:');
  let colorRow = '';
  const colors = [
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray',
    'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'
  ];
  
  for (const color of colors) {
    colorRow += `${COLORS[color as keyof typeof COLORS]}■ ${color}${COLORS.reset}   `;
    if (colorRow.length > 80) {
      console.log(colorRow);
      colorRow = '';
      await sleep(200);
    }
  }
  if (colorRow) console.log(colorRow);
  await sleep(600);
  
  // Background colors
  console.log('\nBackground Colors:');
  colorRow = '';
  const bgColors = [
    'bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgGray'
  ];
  
  for (const color of bgColors) {
    colorRow += `${COLORS[color as keyof typeof COLORS]} ${color} ${COLORS.reset}  `;
    if (colorRow.length > 80) {
      console.log(colorRow);
      colorRow = '';
      await sleep(200);
    }
  }
  if (colorRow) console.log(colorRow);
  await sleep(600);
  
  // Style modifiers
  console.log('\nStyle Modifiers:');
  const styles = ['bold', 'dim', 'italic', 'underline', 'blink', 'reverse', 'hidden', 'strikethrough'];
  for (const style of styles) {
    console.log(`${COLORS[style as keyof typeof COLORS]}This text uses the ${style} style${COLORS.reset}`);
    await sleep(200);
  }
  await sleep(1000);
  
  //=============================================================================
  // SECTION 8: PRACTICAL APPLICATION EXAMPLES
  //=============================================================================
  console.log('\n');
  logger.header('8. PRACTICAL APPLICATION EXAMPLES');
  console.log('Real-world examples of using Logger styles in application contexts:');
  await sleep(800);
  
  // Example 1: Server startup sequence
  console.log('\nExample 1: Server Startup Sequence');
  await sleep(400);
  
  logger.custom('Starting server initialization...', ['brightCyan', 'bold'], 'SERVER');
  await sleep(300);
  logger.custom('Loading configuration from .env file', ['cyan'], 'CONFIG');
  await sleep(300);
  logger.custom('Connecting to database at mongodb://localhost:27017', ['cyan'], 'DATABASE');
  await sleep(300);
  logger.custom('Database connected successfully', ['green'], 'DATABASE');
  await sleep(300);
  logger.custom('Loading middleware components', ['cyan'], 'MIDDLEWARE');
  await sleep(300);
  logger.custom('Registering 24 API routes', ['cyan'], 'ROUTER');
  await sleep(300);
  logger.custom('Server started on http://localhost:3000', ['brightGreen', 'bold'], 'SERVER');
  await sleep(300);
  logger.custom('Ready to accept connections', ['green', 'italic'], 'SERVER');
  await sleep(800);
  
  // Example 2: CLI tool execution
  console.log('\nExample 2: CLI Tool Execution');
  await sleep(400);
  
  logger.header('  RUNNING BUILD PROCESS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(300);
  logger.custom('Cleaning output directory', ['blue'], 'STEP 1/5');
  await sleep(300);
  
  console.log('Removing old build files...');
  for (let i = 0; i <= 100; i += 20) {
    logger.progressBar(i, 30, '■', '□');
    await sleep(200);
  }
  
  await sleep(300);
  logger.custom('Transpiling TypeScript files', ['blue'], 'STEP 2/5');
  await sleep(300);
  
  console.log('Processing source files...');
  for (let i = 0; i <= 100; i += 10) {
    logger.progressBar(i, 30, '■', '□');
    await sleep(150);
  }
  
  await sleep(300);
  logger.custom('Running tests', ['blue'], 'STEP 3/5');
  await sleep(300);
  
  console.log(logger.colorParts(
    'PASS  src/utils.test.ts (15 tests, 1.2s)',
    { 'PASS': ['green', 'bold'], '15 tests': ['cyan'], '1.2s': ['magenta'] }
  ));
  
  console.log(logger.colorParts(
    'PASS  src/logger.test.ts (8 tests, 0.8s)',
    { 'PASS': ['green', 'bold'], '8 tests': ['cyan'], '0.8s': ['magenta'] }
  ));
  
  console.log(logger.colorParts(
    'FAIL  src/api.test.ts (12 tests, 3 failed, 1.5s)',
    { 'FAIL': ['red', 'bold'], '12 tests': ['cyan'], '3 failed': ['red'], '1.5s': ['magenta'] }
  ));
  
  await sleep(300);
  logger.custom('Test failures detected! Check the error logs', ['red', 'bold'], '✗');
  await sleep(800);
  
  //=============================================================================
  // SECTION 9: BEST PRACTICES
  //=============================================================================
  console.log('\n');
  logger.header('9. STYLING BEST PRACTICES');
  console.log('Guidelines for effective use of styles in your applications:');
  await sleep(800);
  
  console.log('\n1. ' + logger.colorParts(
    'Use consistent colors for similar message types across your application',
    { 'consistent colors': ['yellow', 'bold'] }
  ));
  
  console.log('\n2. ' + logger.colorParts(
    'Reserve bright colors and bold for important information or errors',
    { 'important information': ['brightYellow'], 'errors': ['brightRed'] }
  ));
  
  console.log('\n3. ' + logger.colorParts(
    'Use dim styles for supplementary or less important details',
    { 'supplementary': ['dim'], 'less important details': ['dim'] }
  ));
  
  console.log('\n4. ' + logger.colorParts(
    'Apply underline to links, file paths or elements the user might interact with',
    { 'underline': ['underline'], 'links': ['brightCyan', 'underline'], 'file paths': ['brightCyan', 'underline'] }
  ));
  
  console.log('\n5. ' + logger.colorParts(
    'Create and reuse color functions for maintaining a consistent visual language',
    { 'reuse color functions': ['green', 'bold'], 'consistent visual language': ['green'] }
  ));
  
  await sleep(1000);
  
  //=============================================================================
  // FINAL SECTION: CONCLUSION
  //=============================================================================
  console.log('\n');
  logger.header('STYLE GUIDE COMPLETE', ['brightWhite', 'bgGreen', 'bold']);
  await sleep(800);
  
  logger.log('You now have a complete reference for all the styling capabilities in Magiclogger!');
  await sleep(600);
  
  logger.custom('Try these styles in your own applications for enhanced readability', ['brightCyan'], 'TIP');
  await sleep(600);
  
  logger.custom('Document the styling conventions you use for your team', ['brightCyan'], 'TIP');
  await sleep(600);
  
  console.log('\n');
  logger.header('  THANK YOU FOR USING MAGIC LOGGER!  ', ['brightWhite', 'bgMagenta', 'bold']);
  console.log('\n');
}

// Run the demo
runStyleDemo().catch(console.error);