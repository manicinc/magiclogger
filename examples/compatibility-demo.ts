/**
 * MagicLogger: Console Enhancement Dem
 *
 * This interactive demo shows how MagicLogger enhances the standard console
 * with powerful formatting and visualization capabilities.
 */

import { enhanceConsole } from 'magiclogger';

// Show default console behavior before enhancement
console.log('\n=== STANDARD CONSOLE (BEFORE ENHANCEMENT) ===');
console.log('Regular log message');
console.warn('Warning message');
console.error('Error message');

console.log('\nStandard console has limited formatting options:');
console.log(' - No color support');
console.log(' - No visual elements');
console.log(' - No additional methods\n');

// Enhance the console with MagicLogger
console.log('Enhancing console with MagicLogger...\n');
const { restoreConsole, logger } = enhanceConsole();

console.log('Logger object: ', logger);

// Show enhanced console output
console.log('=== ENHANCED CONSOLE ===');
console.log('Standard methods still work as expected');
console.warn('Warnings are styled');
console.error('Errors are highlighted');

// Demonstrate new methods
console.log('\n=== NEW CAPABILITIES ===');

// Success messages
console.success('Operation completed successfully');

// Headers for visual organization
console.header('APPLICATION STATUS');

// Custom prefixes and styling
console.custom('Custom prefix message', ['cyan'], 'CONFIG');

// Colorized parts of messages
console.colorParts('Found error in file.js on line 42', {
  error: ['red', 'bold'],
  'file.js': ['cyan', 'underline'],
  'line 42': ['yellow'],
});

// Progress visualization
console.log('\n=== PROGRESS VISUALIZATION ===');
console.log('Starting download...');

// Simulate progress updates
let progress = 0;
const interval = setInterval(() => {
  progress += 10;
  console.progress(progress);

  if (progress >= 100) {
    clearInterval(interval);
    downloadComplete();
  }
}, 300);

// Continuation after progress completes
function downloadComplete() {
  console.log('\n');
  console.success('Download complete!');

  // Show table output
  console.header('FILE STATISTICS');
  console.table([
    { file: 'data.json', size: '1.2MB', modified: 'Today' },
    { file: 'image.png', size: '3.8MB', modified: 'Yesterday' },
    { file: 'document.pdf', size: '2.5MB', modified: '3 days ago' },
  ]);

  // Text styling with color functions
  console.log('\n=== ADVANCED TEXT STYLING ===');
  const highlight = console.colorize('yellow', 'bold');
  const link = console.colorize('cyan', 'underline');

  console.log(
    `${highlight('IMPORTANT:')} Check out our docs at ${link('https://example.com/docs')}`
  );

  // Restore original console
  console.log('\n=== RESTORING ORIGINAL CONSOLE ===');
  restoreConsole();

  // Verify original console is restored
  console.log('Back to standard console');

  try {
    // This should fail as the method no longer exists
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.success('This should fail');
  } catch (error) {
    console.log('✓ Successfully restored (enhanced methods no longer available)');
  }

  console.log('\nThank you for trying MagicLogger!');
  console.log(
    'For more examples and documentation, visit: https://github.com/yourusername/magiclogger'
  );
}
