/**
 * MagicLogger Animated Demo - Visual Spectacle Edition
 *
 * This demo showcases MagicLogger's rich styling capabilities through
 * dynamic, colorful animations and practical examples.
 *
 * Run with: npx tsx examples/animated-demo.ts
 */

import { Logger, COLORS, type ColorName } from '../dist/index.js';

// Helper function to pause execution
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Clear screen helper
const clearScreen = () => process.stdout.write('\x1Bc');

/**
 * Creates a rainbow gradient effect across text
 */
function rainbowText(text: string): string {
  const colors: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  return Array.from(text)
    .map((char, i) => {
      if (char === ' ') return char;
      const color = colors[i % colors.length];
      return `${COLORS[color]}${char}${COLORS.reset}`;
    })
    .join('');
}

/**
 * Creates a gradient effect between two colors
 */
function gradientText(text: string, _startColor: ColorName, _endColor: ColorName): string {
  const startRGB = { r: 255, g: 0, b: 0 }; // Simplified for demo
  const endRGB = { r: 0, g: 0, b: 255 };
  const steps = text.length;

  return Array.from(text)
    .map((char, i) => {
      if (char === ' ') return char;
      const progress = i / steps;
      const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
      const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
      const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);
      return `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
    })
    .join('');
}

/**
 * Show the MagicLogger logo with animated effects
 */
async function showAnimatedLogo(_logger: Logger): Promise<void> {
  clearScreen();

  const lines = [
    '███╗   ███╗ █████╗  ██████╗ ██╗ ██████╗',
    '████╗ ████║██╔══██╗██╔════╝ ██║██╔════╝',
    '██╔████╔██║███████║██║  ███╗██║██║     ',
    '██║╚██╔╝██║██╔══██║██║   ██║██║██║     ',
    '██║ ╚═╝ ██║██║  ██║╚██████╔╝██║╚██████╗',
    '╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝ ╚═════╝',
    '',
    '██╗      ██████╗  ██████╗  ██████╗ ███████╗██████╗ ',
    '██║     ██╔═══██╗██╔════╝ ██╔════╝ ██╔════╝██╔══██╗',
    '██║     ██║   ██║██║  ███╗██║  ███╗█████╗  ██████╔╝',
    '██║     ██║   ██║██║   ██║██║   ██║██╔══╝  ██╔══██╗',
    '███████╗╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║',
    '╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝',
  ];

  // Animated reveal with rainbow effect
  for (let i = 0; i < lines.length; i++) {
    const rainbowed = rainbowText(lines[i]);
    console.log(rainbowed);
    await sleep(100);
  }

  await sleep(500);
  console.log('');

  // Tagline with gradient
  const tagline = gradientText(
    '✨ Beautiful Terminal & Browser Logs Styling Made Magical ✨',
    'cyan',
    'magenta'
  );
  console.log(tagline);

  await sleep(1000);
}

/**
 * Demonstrate inline styling with multiple colors in one message
 */
async function inlineStyleShowcase(logger: Logger): Promise<void> {
  // Header
  console.log();
  logger.header('  🎨 INLINE STYLE MIXING  ', ['brightWhite', 'bgMagenta', 'bold']);
  console.log('═'.repeat(50));
  await sleep(500);

  // Multiple styles in one message
  logger.info(
    '<red.bold>ERROR:</> <yellow>Warning level</> <green>OK status</> <cyan.underline>Information</> <magenta.italic>Note</>'
  );
  await sleep(300);

  // Gradient-like effect with multiple colors
  logger.info(
    '<red>R</><yellow>A</><green>I</><cyan>N</><blue>B</><magenta>O</><red>W</> ' +
      '<dim>meets</> ' +
      '<bold.underline>MagicLogger</>'
  );
  await sleep(300);

  // Complex nested styling
  logger.info(
    '<bgBlue.white> SYSTEM </> <gray>|</> <green.bold>✓ Connected</> <gray>|</> <yellow>⚡ 42ms</> <gray>|</> <cyan.dim>user@host</>'
  );
  await sleep(300);

  // Status indicators with colors
  logger.info(
    '🔴 <red.bold>Critical</> ' +
      '🟡 <yellow.bold>Warning</> ' +
      '🟢 <green.bold>Success</> ' +
      '🔵 <blue.bold>Info</> ' +
      '🟣 <magenta.bold>Debug</>'
  );
  await sleep(500);
}

/**
 * Show animated progress bars and loading effects
 */
async function animatedProgressDemo(logger: Logger): Promise<void> {
  console.log();
  logger.header('  ⚡ ANIMATED PROGRESS  ', ['brightWhite', 'bgBlue', 'bold']);
  console.log('═'.repeat(50));
  await sleep(500);

  // Animated progress bar
  logger.info(logger.s.cyan('Downloading packages...'));
  for (let i = 0; i <= 100; i += 10) {
    process.stdout.write(
      '\r' + logger.s.dim(`[${'█'.repeat(Math.floor(i / 3.3)).padEnd(30)}] ${i}%`)
    );
    await sleep(100);
  }
  process.stdout.write('\n');
  logger.success('✓ Download complete!');
  await sleep(300);

  // Loading spinner simulation
  const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  process.stdout.write('\n');
  for (let i = 0; i < 20; i++) {
    const spinner = spinners[i % spinners.length];
    const colors = ['cyan', 'blue', 'magenta'] as ColorName[];
    const color = colors[i % colors.length];
    process.stdout.write(`\r${COLORS[color]}${spinner}${COLORS.reset} Processing...`);
    await sleep(100);
  }
  process.stdout.write('\r✅ Processing complete!    \n');
  await sleep(500);
}

/**
 * Demonstrate the chainable style API
 */
async function chainableStyleAPI(logger: Logger): Promise<void> {
  console.log();
  logger.header('  🔗 CHAINABLE STYLE API  ', ['brightWhite', 'bgGreen', 'bold']);
  console.log('═'.repeat(50));
  await sleep(500);

  // Using the .s (style) API
  logger.info(
    logger.s.red.bold('Error: ') +
      logger.s.yellow('File not found: ') +
      logger.s.cyan.underline('/path/to/file.js')
  );
  await sleep(300);

  logger.info(
    logger.s.green.bold('✓ Success: ') +
      'Deployed ' +
      logger.s.cyan.bold('v2.4.1') +
      ' to ' +
      logger.s.magenta.underline('production')
  );
  await sleep(300);

  // Complex chaining
  logger.info(
    logger.s.bgBlue.white.bold(' STATUS ') +
      ' ' +
      logger.s.green('●') +
      ' Active | ' +
      logger.s.yellow('◐') +
      ' Pending | ' +
      logger.s.red('●') +
      ' Failed'
  );
  await sleep(500);
}

/**
 * Template literal styling with fmt
 */
async function templateLiteralStyling(logger: Logger): Promise<void> {
  console.log();
  logger.header('  📝 TEMPLATE LITERALS  ', ['brightWhite', 'bgCyan', 'bold']);
  console.log('═'.repeat(50));
  await sleep(500);

  const errorCount = 3;
  const warningCount = 7;
  const duration = 1234;

  // Using template literals with @ syntax
  logger.info(
    logger.s.red.bold(`Errors: ${errorCount}`) +
      ' | ' +
      logger.s.yellow(`Warnings: ${warningCount}`) +
      ' | ' +
      logger.s.green(`Duration: ${duration}ms`)
  );
  await sleep(300);

  const username = 'alice';
  const action = 'deployed';
  const environment = 'production';

  logger.info(
    logger.s.cyan.bold(username) +
      ' ' +
      logger.s.dim('successfully') +
      ' ' +
      logger.s.green.bold(action) +
      ' ' +
      logger.s.dim('to') +
      ' ' +
      logger.s.magenta.underline(environment)
  );
  await sleep(500);
}

/**
 * Beautiful data table with colors and proper borders
 */
async function colorfulTableDemo(logger: Logger): Promise<void> {
  console.log();
  logger.header('  📊 COLORFUL DATA TABLES  ', ['brightWhite', 'bgMagenta', 'bold']);
  logger.separator('═', 50, ['cyan']);
  await sleep(500);

  // Table data with pre-styled values using logger.s
  const tableData = [
    {
      endpoint: logger.s.cyan('/api/users'),
      method: logger.s.green.bold('GET'),
      p50: logger.s.green('45ms'),
      p95: logger.s.yellow('120ms'),
      p99: logger.s.red('250ms'),
      status: logger.s.green.bold('✓'),
    },
    {
      endpoint: logger.s.cyan('/api/posts'),
      method: logger.s.blue.bold('POST'),
      p50: logger.s.green('23ms'),
      p95: logger.s.yellow('67ms'),
      p99: logger.s.red('145ms'),
      status: logger.s.green.bold('✓'),
    },
    {
      endpoint: logger.s.cyan('/api/auth'),
      method: logger.s.magenta.bold('PUT'),
      p50: logger.s.green('89ms'),
      p95: logger.s.yellow('203ms'),
      p99: logger.s.red('412ms'),
      status: logger.s.yellow.bold('!'),
    },
  ];

  // Use the new table method with double borders
  logger.table(tableData, {
    border: 'double',
    headerColor: ['brightWhite', 'bold'],
    borderColor: ['blue'],
  });

  await sleep(500);
}

/**
 * Real-world examples with beautiful formatting
 */
async function realWorldExamples(logger: Logger): Promise<void> {
  console.log();
  logger.header('  🚀 REAL-WORLD EXAMPLES  ', ['brightWhite', 'bgRed', 'bold']);
  console.log('═'.repeat(50));
  await sleep(500);

  // API Request Log
  logger.info('<bgGreen.black> GET </> <cyan>/api/users/123</> <green.bold>200 OK</> <dim>42ms</>');
  await sleep(200);

  logger.info(
    '<bgYellow.black> POST </> <cyan>/api/auth/login</> <yellow.bold>401 Unauthorized</> <dim>15ms</>'
  );
  await sleep(200);

  logger.info(
    '<bgRed.white> DELETE </> <cyan>/api/posts/456</> <red.bold>500 Error</> <dim>234ms</>'
  );
  await sleep(300);

  // Deployment Status
  logger.info(
    logger.s.white('DEPLOY: ') +
      logger.s.green('✓') +
      ' Deployment ' +
      logger.s.cyan.bold('v3.2.1') +
      ' to ' +
      logger.s.magenta.bold('production') +
      ' ' +
      logger.s.green.bold('successful')
  );
  await sleep(300);

  // Git-style diff
  logger.info('<green>+ Added new feature: Dark mode support</>');
  logger.info('<red>- Removed deprecated API endpoint</>');
  logger.info('<yellow>~ Modified user authentication flow</>');
  await sleep(300);

  // System monitoring
  const cpuUsage = 78;
  const memUsage = 45;
  const diskUsage = 92;

  logger.info(
    `CPU: ${
      cpuUsage > 80 ? logger.s.red.bold(`${cpuUsage}%`) : logger.s.green(`${cpuUsage}%`)
    } | ` +
      `MEM: ${
        memUsage > 80 ? logger.s.red.bold(`${memUsage}%`) : logger.s.green(`${memUsage}%`)
      } | ` +
      `DISK: ${
        diskUsage > 80 ? logger.s.red.bold(`${diskUsage}%`) : logger.s.green(`${diskUsage}%`)
      }`
  );
  await sleep(500);
}

/**
 * Show ASCII art and decorations
 */
async function asciiArtAndDecorations(logger: Logger): Promise<void> {
  console.log();
  logger.header('  🎭 ASCII ART & DECORATIONS  ', ['black', 'bgYellow', 'bold']);
  logger.separator('═', 50, ['yellow']);
  await sleep(500);

  // Box drawing using the new box method
  logger.box('🌟 MagicLogger Features 🌟', {
    border: 'double',
    borderColor: ['cyan'],
    color: ['yellow', 'bold'],
    padding: 2,
  });
  await sleep(300);

  // Feature list using the new list method
  logger.list(
    [
      'Rich color support',
      'High performance',
      'Flexible API',
      'Beautiful tables',
      'Rainbow effects',
      'Pure magic',
    ],
    {
      bullet: '✨',
      bulletColor: ['yellow'],
      itemColor: ['white'],
      indent: 2,
    }
  );

  await sleep(500);
}

/**
 * Grand finale with animation
 */
async function grandFinale(logger: Logger): Promise<void> {
  console.log();
  logger.header('  🎆 GRAND FINALE  ', ['brightWhite', 'bgMagenta', 'bold']);
  console.log('═'.repeat(50));
  await sleep(500);

  // Countdown
  for (let i = 3; i > 0; i--) {
    console.log('  ' + logger.s.yellow.bold(`${i}...`) + ' ' + logger.s.red('█'.repeat(i * 2)));
    await sleep(500);
  }

  // Final message with rainbow effect
  console.log('\n' + rainbowText('✨ 🌈 MagicLogger - Making Logs Beautiful! 🌈 ✨'));
  console.log('');
  await sleep(500);

  // Links
  logger.info(
    '[Link] 🔗 GitHub Repository: ' +
      logger.s.cyan.underline('https://github.com/manicinc/magiclogger')
  );
  logger.info(
    '[Link] 📦 NPM Package: ' + logger.s.cyan.underline('https://npmjs.com/package/magiclogger')
  );

  console.log('\n' + logger.s.green.bold('Thank you for watching! Happy logging! 🚀'));
}

/**
 * Main demo runner
 */
async function runDemo(): Promise<void> {
  const logger = new Logger({
    useColors: true,
    useConsole: true,
  });

  try {
    await showAnimatedLogo(logger);
    await sleep(500);

    await inlineStyleShowcase(logger);
    await sleep(1000);

    await chainableStyleAPI(logger);
    await sleep(1000);

    await templateLiteralStyling(logger);
    await sleep(1000);

    await animatedProgressDemo(logger);
    await sleep(1000);

    await colorfulTableDemo(logger);
    await sleep(1000);

    await realWorldExamples(logger);
    await sleep(1000);

    await asciiArtAndDecorations(logger);
    await sleep(1000);

    await grandFinale(logger);
  } catch (error) {
    logger.error('Demo failed:', error);
  }
}

// Run the demo
runDemo().catch(console.error);
