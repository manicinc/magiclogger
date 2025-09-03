/**
 * MagicLogger Guided Interactive Demo
 *
 * An interactive, step-by-step journey through MagicLogger's capabilities
 * with user prompts and visual explanations.
 *
 * Run with: npx ts-node examples/guided-animated-demo.ts
 */

import * as readline from 'readline';
import { Logger, COLORS, type ColorName } from '../dist/index.js';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to wait for user input
const waitForEnter = (): Promise<void> => {
  return new Promise(resolve => {
    rl.question('\n    Press ENTER to continue...', () => {
      process.stdout.write('\x1b[1A\x1b[2K'); // Clear the prompt line
      resolve();
    });
  });
};

// Helper function to pause execution
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Clear screen helper
const clearScreen = () => process.stdout.write('\x1Bc');

/**
 * Creates a rainbow gradient effect
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
 * Animated text reveal effect
 */
async function animateText(text: string, color: ColorName = 'cyan', delay = 30): Promise<void> {
  const colorCode = COLORS[color];
  for (const char of text) {
    process.stdout.write(colorCode + char + COLORS.reset);
    await sleep(delay);
  }
  process.stdout.write('\n');
}

/**
 * Draw a decorative box around text
 */
function drawBox(text: string, color: ColorName = 'cyan'): string[] {
  const width = text.length + 4;
  const colorCode = COLORS[color];
  const reset = COLORS.reset;

  const top = colorCode + '╔' + '═'.repeat(width - 2) + '╗' + reset;
  const middle = colorCode + '║ ' + reset + text + colorCode + ' ║' + reset;
  const bottom = colorCode + '╚' + '═'.repeat(width - 2) + '╝' + reset;

  return [top, middle, bottom];
}

/**
 * Interactive introduction
 */
async function introduction(logger: Logger): Promise<void> {
  clearScreen();

  // Animated logo
  console.log('\n');
  const logo = rainbowText('✨ MagicLogger Interactive Demo ✨');
  console.log(logo);
  console.log('\n');

  await animateText('Welcome to the MagicLogger guided tour!', 'cyan', 40);
  await sleep(500);

  logger.info('<dim>This interactive demo will guide you through:</>');
  console.log('');

  const features = [
    '🎨 Multiple styling syntaxes',
    '🌈 Rainbow and gradient effects',
    '⚡ Dynamic color mixing',
    '📊 Beautiful data visualization',
    '🔧 Practical real-world examples',
  ];

  for (const feature of features) {
    await sleep(200);
    logger.info(`  ${feature}`);
  }

  await waitForEnter();
}

/**
 * Chapter 1: Basic Styling Syntax
 */
async function chapter1_BasicStyling(logger: Logger): Promise<void> {
  clearScreen();
  logger.header('  📚 Chapter 1: STYLING SYNTAX  ', ['brightWhite', 'bgBlue', 'bold']);
  console.log('');

  await animateText('MagicLogger offers THREE different ways to style your logs:', 'yellow');
  console.log('');

  // Method 1: Inline tags
  logger.custom('Method 1: Inline Tags', ['cyan', 'bold'], '1️⃣');
  await sleep(300);

  logger.info("Code: logger.info('<red>Error:</> <yellow>Warning!</>')");
  logger.info('Result: <red>Error:</> <yellow>Warning!</>');
  console.log('');
  await sleep(500);

  // Method 2: Chainable API
  logger.custom('Method 2: Chainable Style API', ['green', 'bold'], '2️⃣');
  await sleep(300);

  logger.info("Code: logger.s.red.bold('Error:') + logger.s.yellow('Warning!')");
  logger.info('Result: ' + logger.s.red.bold('Error: ') + logger.s.yellow('Warning!'));
  console.log('');
  await sleep(500);

  // Method 3: Template literals
  logger.custom('Method 3: Template Literals', ['magenta', 'bold'], '3️⃣');
  await sleep(300);

  logger.info('Code: logger.fmt`@red.bold{Error:} @yellow{Warning!}`');
  logger.info('Result: ' + logger.fmt`@red.bold{Error:} @yellow{Warning!}`);

  await waitForEnter();
}

/**
 * Chapter 2: Rainbow and Multi-Color Effects
 */
async function chapter2_RainbowEffects(logger: Logger): Promise<void> {
  clearScreen();
  logger.header('  🌈 Chapter 2: RAINBOW EFFECTS  ', ['brightWhite', 'bgMagenta', 'bold']);
  console.log('');

  await animateText("Let's create some colorful magic!", 'cyan');
  console.log('');

  // Rainbow text demo
  logger.custom('Rainbow Text Effect', ['white'], '🌈');
  await sleep(300);

  const rainbow1 = '<red>R</><yellow>A</><green>I</><cyan>N</><blue>B</><magenta>O</><red>W</>';
  logger.info('Inline rainbow: ' + rainbow1);
  await sleep(300);

  // Gradient effect
  logger.custom('Gradient Colors', ['white'], '🎨');
  await sleep(300);

  logger.info(
    '<red>█</><red.dim>█</><yellow.dim>█</><yellow>█</><green>█</><cyan>█</><blue>█</><blue.dim>█</><magenta.dim>█</><magenta>█</>'
  );
  await sleep(300);

  // Mixed styles rainbow
  logger.custom('Mixed Style Rainbow', ['white'], '✨');
  await sleep(300);

  logger.info(
    '<red.bold>B</><yellow.italic>E</><green.underline>A</><cyan.bold>U</><blue.dim>T</><magenta.bold>I</><red.italic>F</><yellow.underline>U</><green.bold>L</>'
  );
  await sleep(500);

  // Animated color wave
  logger.custom('Color Wave Animation', ['white'], '🌊');
  for (let i = 0; i < 3; i++) {
    process.stdout.write('\r');
    const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
    const shifted = [...colors.slice(i), ...colors.slice(0, i)];
    const wave = shifted
      .map(c => `${COLORS[c as ColorName]}${'█'.repeat(3)}${COLORS.reset}`)
      .join('');
    process.stdout.write(wave);
    await sleep(300);
  }
  console.log('');

  await waitForEnter();
}

/**
 * Chapter 3: Real-World Use Cases
 */
async function chapter3_RealWorldExamples(logger: Logger): Promise<void> {
  clearScreen();
  logger.header('  💼 Chapter 3: REAL-WORLD EXAMPLES  ', ['brightWhite', 'bgGreen', 'bold']);
  console.log('');

  await animateText('Practical examples you can use in your projects:', 'yellow');
  console.log('');

  // HTTP Request Logging
  logger.custom('HTTP Request Logging', ['cyan', 'bold'], '🌐');
  await sleep(300);

  const requests = [
    { method: 'GET', path: '/api/users', status: 200, time: 45, color: 'green' },
    { method: 'POST', path: '/api/login', status: 401, time: 123, color: 'yellow' },
    { method: 'DELETE', path: '/api/posts/1', status: 500, time: 567, color: 'red' },
  ];

  for (const req of requests) {
    const methodColor = req.color as ColorName;
    const statusColor = req.status < 300 ? 'green' : req.status < 500 ? 'yellow' : 'red';

    logger.info(
      logger.s[methodColor].bold(req.method.padEnd(7)) +
        ' ' +
        logger.s.cyan(req.path.padEnd(20)) +
        ' ' +
        logger.s[statusColor].bold(req.status.toString()) +
        ' ' +
        logger.s.dim(`${req.time}ms`)
    );
    await sleep(200);
  }
  console.log('');

  // Database Query Logging
  logger.custom('Database Operations', ['yellow', 'bold'], '🗄️');
  await sleep(300);

  logger.info(
    '<green>✓</> <dim>SELECT * FROM users WHERE</> <cyan>id = 123</> <green.dim>(45ms)</>'
  );
  logger.info(
    "<yellow>⚠</> <dim>UPDATE posts SET</> <cyan>status = 'draft'</> <yellow.dim>(234ms - slow)</>"
  );
  logger.info(
    '<red>✗</> <dim>DELETE FROM sessions</> <red.bold>ERROR: Connection timeout</> <red.dim>(5000ms)</>'
  );
  console.log('');
  await sleep(500);

  // Build Process Status
  logger.custom('Build Process', ['magenta', 'bold'], '🔨');
  await sleep(300);

  const buildSteps = [
    { step: 'Clean', status: 'done', icon: '✓', color: 'green' },
    { step: 'Compile', status: 'done', icon: '✓', color: 'green' },
    { step: 'Bundle', status: 'running', icon: '⚡', color: 'yellow' },
    { step: 'Optimize', status: 'pending', icon: '○', color: 'gray' },
    { step: 'Deploy', status: 'pending', icon: '○', color: 'gray' },
  ];

  for (const build of buildSteps) {
    const icon = logger.s[build.color as ColorName](build.icon);
    const step =
      build.status === 'running'
        ? logger.s.yellow.bold(build.step)
        : build.status === 'done'
        ? logger.s.green(build.step)
        : logger.s.gray(build.step);

    logger.info(`  ${icon} ${step}`);
    await sleep(150);
  }

  await waitForEnter();
}

/**
 * Chapter 4: Data Visualization
 */
async function chapter4_DataVisualization(logger: Logger): Promise<void> {
  clearScreen();
  logger.header('  📊 Chapter 4: DATA VISUALIZATION  ', ['brightWhite', 'bgCyan', 'bold']);
  console.log('');

  await animateText('Transform your data into visual insights:', 'yellow');
  console.log('');

  // Progress bars with colors
  logger.custom('Task Progress', ['cyan', 'bold'], '📈');
  await sleep(300);

  const tasks = [
    { name: 'Download', progress: 100, color: 'green' },
    { name: 'Process', progress: 75, color: 'yellow' },
    { name: 'Upload', progress: 30, color: 'blue' },
    { name: 'Verify', progress: 0, color: 'gray' },
  ];

  for (const task of tasks) {
    const filled = Math.floor(task.progress / 5);
    const empty = 20 - filled;
    const bar =
      logger.s[task.color as ColorName]('█'.repeat(filled)) + logger.s.gray('░'.repeat(empty));
    const percent = logger.s[task.color as ColorName].bold(`${task.progress}%`);

    logger.info(`  ${task.name.padEnd(10)} [${bar}] ${percent}`);
    await sleep(200);
  }
  console.log('');

  // Performance metrics
  logger.custom('Performance Metrics', ['magenta', 'bold'], '⚡');
  await sleep(300);

  const metrics = [
    { metric: 'CPU', value: 45, unit: '%' },
    { metric: 'Memory', value: 2.3, unit: 'GB' },
    { metric: 'Disk I/O', value: 125, unit: 'MB/s' },
    { metric: 'Network', value: 890, unit: 'Mb/s' },
  ];

  logger.table(
    metrics.map(m => ({
      Metric: logger.s.cyan(m.metric),
      Value:
        m.value < 50
          ? logger.s.green.bold(m.value.toString())
          : m.value < 80
          ? logger.s.yellow.bold(m.value.toString())
          : logger.s.red.bold(m.value.toString()),
      Unit: logger.s.dim(m.unit),
    })),
    { headerColor: ['brightMagenta', 'bold'] }
  );

  await waitForEnter();
}

/**
 * Chapter 5: Advanced Styling Techniques
 */
async function chapter5_AdvancedTechniques(logger: Logger): Promise<void> {
  clearScreen();
  logger.header('  🎯 Chapter 5: ADVANCED TECHNIQUES  ', ['brightWhite', 'bgRed', 'bold']);
  console.log('');

  await animateText('Master the art of log styling:', 'yellow');
  console.log('');

  // Conditional styling
  logger.custom('Conditional Styling', ['cyan', 'bold'], '🎨');
  await sleep(300);

  const values = [15, 45, 78, 92, 100];
  logger.info('Temperature readings:');

  for (const temp of values) {
    const style =
      temp < 30
        ? logger.s.blue
        : temp < 60
        ? logger.s.green
        : temp < 80
        ? logger.s.yellow
        : logger.s.red.bold;

    logger.info(`  Sensor: ${style(`${temp}°C`)} ${temp > 80 ? '🔥 WARNING!' : ''}`);
    await sleep(200);
  }
  console.log('');

  // Nested structures
  logger.custom('Nested Data Structures', ['green', 'bold'], '🌳');
  await sleep(300);

  logger.info('<cyan>root</> {');
  logger.info('  <yellow>config</>: {');
  logger.info('    <green>debug</>: <blue.bold>true</>,');
  logger.info('    <green>port</>: <magenta.bold>3000</>,');
  logger.info('    <green>ssl</>: <red.bold>false</>');
  logger.info('  },');
  logger.info('  <yellow>status</>: <green.bold>"healthy"</>');
  logger.info('}');
  console.log('');

  // Animation frames
  logger.custom('Animation Frames', ['magenta', 'bold'], '🎬');
  await sleep(300);

  const frames = [
    '[    ]',
    '[=   ]',
    '[==  ]',
    '[=== ]',
    '[====]',
    '[ ===]',
    '[  ==]',
    '[   =]',
    '[    ]',
  ];

  for (const frame of frames) {
    process.stdout.write('\r  Loading: ' + logger.s.cyan.bold(frame));
    await sleep(150);
  }
  process.stdout.write('\r  Loading: ' + logger.s.green.bold('[DONE]') + '    \n');

  await waitForEnter();
}

/**
 * Grand Finale
 */
async function grandFinale(logger: Logger): Promise<void> {
  clearScreen();
  logger.header('  🎆 GRAND FINALE  ', ['brightWhite', 'bgMagenta', 'bold']);
  console.log('');

  await animateText("You've mastered MagicLogger!", 'cyan', 50);
  console.log('');

  // Certificate of completion
  const box = drawBox('🏆 MagicLogger Expert 🏆', 'yellow');
  for (const line of box) {
    console.log('    ' + line);
    await sleep(100);
  }
  console.log('');

  // Summary of capabilities
  logger.info("<dim>You've learned how to:</dim>");

  const skills = [
    '<green>✓</> Use multiple styling syntaxes',
    '<green>✓</> Create rainbow and gradient effects',
    '<green>✓</> Build real-world logging solutions',
    '<green>✓</> Visualize data beautifully',
    '<green>✓</> Apply advanced styling techniques',
  ];

  for (const skill of skills) {
    await sleep(200);
    logger.info(`  ${skill}`);
  }
  console.log('');

  // Final rainbow message
  const finalMsg = rainbowText('🌈 Happy Logging with MagicLogger! 🌈');
  console.log(finalMsg);
  console.log('');

  // Links
  logger.info(`📚 Documentation: ${logger.s.cyan.underline('https://github.com/manicinc/magiclogger')}`);
  logger.info(`📦 NPM Package: ${logger.s.cyan.underline('https://npmjs.com/package/magiclogger')}`);
  console.log('');

  await animateText('Thank you for taking the MagicLogger tour!', 'magenta', 40);
}

/**
 * Main interactive demo runner
 */
async function runGuidedDemo(): Promise<void> {
  const logger = new Logger();

  try {
    await introduction(logger);
    await chapter1_BasicStyling(logger);
    await chapter2_RainbowEffects(logger);
    await chapter3_RealWorldExamples(logger);
    await chapter4_DataVisualization(logger);
    await chapter5_AdvancedTechniques(logger);
    await grandFinale(logger);
  } catch (error) {
    logger.error('Demo error:', error);
  } finally {
    rl.close();
  }
}

// Run the demo if executed directly
runGuidedDemo().catch(console.error);

export { runGuidedDemo };
