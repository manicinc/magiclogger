/**
 * Style Test for Magiclogger
 * 
 * This script tests all available styles to ensure they're working properly
 * in the current terminal environment.
 */

import { Logger, COLORS } from 'magiclogger';

const logger = new Logger({ useColors: true });

// Helper function to test ANSI codes directly
function testRawANSI() {
  console.log('\nTesting direct ANSI codes:');
  console.log('\x1b[1mBold with direct ANSI code\x1b[0m');
  console.log('\x1b[2mDim with direct ANSI code\x1b[0m');
  console.log('\x1b[3mItalic with direct ANSI code\x1b[0m');
  console.log('\x1b[4mUnderline with direct ANSI code\x1b[0m');
  console.log('\x1b[5mBlink with direct ANSI code\x1b[0m');
  console.log('\x1b[7mReverse with direct ANSI code\x1b[0m');
  console.log('\x1b[8mHidden with direct ANSI code\x1b[0m (this should be invisible)');
  console.log('\x1b[9mStrikethrough with direct ANSI code\x1b[0m');
}

// Test color codes from the COLORS object
function testColorCodes() {
  console.log('\nTesting COLORS object constants:');
  console.log(`${COLORS.bold}Bold using COLORS.bold${COLORS.reset}`);
  console.log(`${COLORS.dim}Dim using COLORS.dim${COLORS.reset}`);
  console.log(`${COLORS.italic}Italic using COLORS.italic${COLORS.reset}`);
  console.log(`${COLORS.underline}Underline using COLORS.underline${COLORS.reset}`);
  console.log(`${COLORS.blink}Blink using COLORS.blink${COLORS.reset}`);
  console.log(`${COLORS.reverse}Reverse using COLORS.reverse${COLORS.reset}`);
  console.log(`${COLORS.hidden}Hidden using COLORS.hidden${COLORS.reset} (should be invisible)`);
  console.log(`${COLORS.strikethrough}Strikethrough using COLORS.strikethrough${COLORS.reset}`);
}

// Test using the logger's color method
function testLoggerColor() {
  console.log('\nTesting logger.color() method:');
  const boldStyle = logger.color('bold');
  const dimStyle = logger.color('dim');
  const italicStyle = logger.color('italic');
  const underlineStyle = logger.color('underline');
  const blinkStyle = logger.color('blink');
  const reverseStyle = logger.color('reverse');
  const strikethroughStyle = logger.color('strikethrough');
  
  console.log(boldStyle('Bold text using logger.color()'));
  console.log(dimStyle('Dim text using logger.color()'));
  console.log(italicStyle('Italic text using logger.color()'));
  console.log(underlineStyle('Underline text using logger.color()'));
  console.log(blinkStyle('Blink text using logger.color()'));
  console.log(reverseStyle('Reverse text using logger.color()'));
  console.log(strikethroughStyle('Strikethrough text using logger.color()'));
}

// Test using combined styles
function testCombinedStyles() {
  console.log('\nTesting combined styles:');
  const boldGreen = logger.color('bold', 'green');
  const underlineCyan = logger.color('underline', 'cyan');
  const italicYellow = logger.color('italic', 'yellow');
  
  console.log(boldGreen('Bold Green text with combined styles'));
  console.log(underlineCyan('Underlined Cyan text with combined styles'));
  console.log(italicYellow('Italic Yellow text with combined styles'));
  console.log(`${COLORS.red}${COLORS.bold}Red Bold using multiple COLORS constants${COLORS.reset}`);
}

// Test terminal capabilities
function testTerminalCapabilities() {
  console.log('\nTesting terminal capabilities:');
  
  const envInfo = {
    'Terminal': process.env.TERM || 'unknown',
    'Platform': process.platform,
    'Node Version': process.version,
    'COLOR Support': process.stdout.hasColors() ? 'Yes' : 'No',
    'Color Depth': process.stdout.getColorDepth ? process.stdout.getColorDepth() : 'unknown'
  };
  
  console.log('Environment Information:');
  Object.entries(envInfo).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

// Main function
function runTest() {
  console.clear();
  console.log('='.repeat(60));
  console.log('MAGIC LOGGER STYLE TEST');
  console.log('='.repeat(60));
  console.log('\nThis script tests different styling methods to check terminal compatibility.\n');
  
  testRawANSI();
  testColorCodes();
  testLoggerColor();
  testCombinedStyles();
  testTerminalCapabilities();
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('\nIf styles are not displaying correctly, your terminal may not support all ANSI styles.');
  console.log('Common issues:');
  console.log('1. Italic, strikethrough, and blink are not supported in all terminals');
  console.log('2. Windows terminals sometimes have limited ANSI support');
  console.log('3. Some terminal emulators need to be configured to support advanced styles');
}

runTest();