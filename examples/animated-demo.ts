/**
 * MagicLogger Animated Demo - Visual Spectacle Edition
 * 
 * This demo showcases MagicLogger's rich styling capabilities through
 * dynamic, colorful animations and practical examples.
 *
 * Run with: npx ts-node examples/animated-demo.ts
 */

import { Logger, COLORS, type ColorName } from '../src/index';

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
  
  return Array.from(text).map((char, i) => {
    if (char === ' ') return char;
    const progress = i / steps;
    const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
    const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
    const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);
    return `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
  }).join('');
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
    '╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝'
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
  const tagline = gradientText('✨ Beautiful Terminal Styling Made Magical ✨', 'cyan', 'magenta');
  console.log(tagline);
  
  await sleep(1000);
}

/**
 * Demonstrate inline styling with multiple colors in one message
 */
async function inlineStyleShowcase(logger: Logger): Promise<void> {
  logger.header('  🎨 INLINE STYLE MIXING  ', ['brightWhite', 'bgMagenta', 'bold']);
  await sleep(500);

  // Multiple styles in one message
  logger.info('<red.bold>ERROR:</> <yellow>Warning level</> <green>OK status</> <cyan.underline>Information</> <magenta.italic>Note</>');
  await sleep(300);

  // Gradient-like effect with multiple colors
  logger.info(
    '<red>R</><yellow>A</><green>I</><cyan>N</><blue>B</><magenta>O</><red>W</> ' +
    '<dim>meets</> ' +
    '<bold.underline>MagicLogger</>'
  );
  await sleep(300);

  // Complex nested styling
  logger.info('<bgBlue.white> SYSTEM </> <gray>|</> <green.bold>✓ Connected</> <gray>|</> <yellow>⚡ 42ms</> <gray>|</> <cyan.dim>user@host</>');
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
  logger.header('  ⚡ ANIMATED PROGRESS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Animated progress bar
  logger.custom('Downloading packages...', ['cyan'], 'TASK');
  for (let i = 0; i <= 100; i += 10) {
    logger.progressBar(i, 30);
    await sleep(100);
  }
  logger.success('✓ Download complete!');
  await sleep(300);

  // Loading spinner simulation
  const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  process.stdout.write('\n');
  for (let i = 0; i < 20; i++) {
    const spinner = spinners[i % spinners.length];
    const colors = ['cyan', 'blue', 'magenta'];
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
  logger.header('  🔗 CHAINABLE STYLE API  ', ['brightWhite', 'bgGreen', 'bold']);
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
    logger.s.bgBlue.white.bold(' STATUS ') + ' ' +
    logger.s.green('●') + ' Active | ' +
    logger.s.yellow('◐') + ' Pending | ' +
    logger.s.red('●') + ' Failed'
  );
  await sleep(500);
}

/**
 * Template literal styling with fmt
 */
async function templateLiteralStyling(logger: Logger): Promise<void> {
  logger.header('  📝 TEMPLATE LITERALS  ', ['brightWhite', 'bgCyan', 'bold']);
  await sleep(500);

  const errorCount = 3;
  const warningCount = 7;
  const duration = 1234;

  logger.info(logger.fmt`
    @red.bold{Errors: ${errorCount}} | 
    @yellow{Warnings: ${warningCount}} | 
    @green{Duration: ${duration}ms}
  `);
  await sleep(300);

  const username = 'alice';
  const action = 'deployed';
  const environment = 'production';
  
  logger.info(logger.fmt`
    @cyan.bold{${username}} @dim{successfully} @green.bold{${action}} @dim{to} @magenta.underline{${environment}}
  `);
  await sleep(500);
}

/**
 * Real-world examples with beautiful formatting
 */
async function realWorldExamples(logger: Logger): Promise<void> {
  logger.header('  🚀 REAL-WORLD EXAMPLES  ', ['brightWhite', 'bgRed', 'bold']);
  await sleep(500);

  // API Request Log
  logger.info('<bgGreen.black> GET </> <cyan>/api/users/123</> <green.bold>200 OK</> <dim>42ms</>');
  await sleep(200);
  
  logger.info('<bgYellow.black> POST </> <cyan>/api/auth/login</> <yellow.bold>401 Unauthorized</> <dim>15ms</>');
  await sleep(200);
  
  logger.info('<bgRed.white> DELETE </> <cyan>/api/posts/456</> <red.bold>500 Error</> <dim>234ms</>');
  await sleep(300);

  // Deployment Status
  logger.custom(
    '<green>✓</> Deployment <cyan.bold>v3.2.1</> to <magenta.bold>production</> <green.bold>successful</>',
    ['white'],
    'DEPLOY'
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
    `CPU: ${cpuUsage > 80 ? logger.s.red.bold(`${cpuUsage}%`) : logger.s.green(`${cpuUsage}%`)} | ` +
    `MEM: ${memUsage > 80 ? logger.s.red.bold(`${memUsage}%`) : logger.s.green(`${memUsage}%`)} | ` +
    `DISK: ${diskUsage > 80 ? logger.s.red.bold(`${diskUsage}%`) : logger.s.green(`${diskUsage}%`)}`
  );
  await sleep(500);
}

/**
 * Beautiful data table with colors
 */
async function colorfulTableDemo(logger: Logger): Promise<void> {
  logger.header('  📊 COLORFUL DATA TABLES  ', ['brightWhite', 'bgMagenta', 'bold']);
  await sleep(500);

  // Performance metrics table
  const metrics = [
    { 
      endpoint: logger.s.cyan('/api/users'),
      method: logger.s.green.bold('GET'),
      p50: logger.s.green('45ms'),
      p95: logger.s.yellow('120ms'),
      p99: logger.s.red('250ms'),
      status: logger.s.green.bold('✓')
    },
    {
      endpoint: logger.s.cyan('/api/posts'),
      method: logger.s.blue.bold('POST'),
      p50: logger.s.green('23ms'),
      p95: logger.s.green('67ms'),
      p99: logger.s.yellow('145ms'),
      status: logger.s.green.bold('✓')
    },
    {
      endpoint: logger.s.cyan('/api/auth'),
      method: logger.s.yellow.bold('PUT'),
      p50: logger.s.yellow('89ms'),
      p95: logger.s.red('203ms'),
      p99: logger.s.red.bold('412ms'),
      status: logger.s.yellow.bold('!')
    }
  ];

  logger.table(metrics, ['brightCyan', 'bold']);
  await sleep(800);
}

/**
 * Animated art and decorations
 */
async function asciiArtAnimations(logger: Logger): Promise<void> {
  logger.header('  🎭 ASCII ART & DECORATIONS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Animated box drawing
  const boxTop = '╔══════════════════════════════╗';
  const boxMid = '║  🌟 MagicLogger Features 🌟  ║';
  const boxBot = '╚══════════════════════════════╝';
  
  logger.info(logger.s.cyan.bold(boxTop));
  await sleep(100);
  logger.info(logger.s.cyan.bold(boxMid));
  await sleep(100);
  logger.info(logger.s.cyan.bold(boxBot));
  await sleep(300);

  // Feature list with icons
  const features = [
    { icon: '🎨', text: 'Rich color support', color: 'red' },
    { icon: '⚡', text: 'High performance', color: 'yellow' },
    { icon: '🔧', text: 'Flexible API', color: 'blue' },
    { icon: '📊', text: 'Beautiful tables', color: 'green' },
    { icon: '🌈', text: 'Rainbow effects', color: 'magenta' },
    { icon: '✨', text: 'Pure magic', color: 'cyan' }
  ];

  for (const feature of features) {
    const colored = logger.color(feature.color as ColorName, 'bold');
    logger.info(`  ${feature.icon} ${colored(feature.text)}`);
    await sleep(200);
  }
  await sleep(500);
}

/**
 * Grand finale with all effects combined
 */
async function grandFinale(logger: Logger): Promise<void> {
  logger.header('  🎆 GRAND FINALE  ', ['brightWhite', 'bgRed', 'bold']);
  await sleep(500);

  // Countdown
  for (let i = 3; i > 0; i--) {
    const size = 4 - i;
    const color = ['red', 'yellow', 'green'][3 - i] as ColorName;
    const text = '█'.repeat(size * 2);
    logger.info(logger.color(color, 'bold')(`    ${i}... ${text}`));
    await sleep(500);
  }

  // Explosion of colors
  console.log('');
  const finalMessage = '✨ 🌈 MagicLogger - Making Logs Beautiful! 🌈 ✨';
  const rainbow = rainbowText(finalMessage);
  console.log(rainbow);
  console.log('');
  
  await sleep(500);

  // Links and info
  logger.link('https://github.com/manicinc/magiclogger', '🔗 GitHub Repository');
  logger.link('https://npmjs.com/package/magiclogger', '📦 NPM Package');
  
  await sleep(500);
  
  // Thank you message with gradient
  const thanks = gradientText('Thank you for watching! Happy logging! 🚀', 'magenta', 'cyan');
  console.log('\n' + thanks + '\n');
}

/**
 * Main demo runner
 */
async function runAnimatedDemo(): Promise<void> {
  const logger = new Logger();

  try {
    await showAnimatedLogo(logger);
    await sleep(1000);

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

    await asciiArtAnimations(logger);
    await sleep(1000);

    await grandFinale(logger);

  } catch (error) {
    logger.error('Demo encountered an error:', error);
  }
}

// Run the demo if executed directly
runAnimatedDemo().catch(console.error);

export { runAnimatedDemo };