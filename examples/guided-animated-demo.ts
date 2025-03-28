/**
 * MagicLogger Animated Demo
 *
 * This script showcases MagicLogger's visual capabilities through
 * animated demonstrations with eye-catching effects and practical examples.
 * Each demo includes the API calls used, making it educational as well.
 *
 * Run with one of these commands:
 *   - ESM:       node dist/examples/animated-demo.js
 *   - TypeScript: npx ts-node examples/animated-demo.ts
 */

import { Logger, COLORS, ColorName, StylePreset } from '../src';
import { ANSI } from '../src/constants/ansi';

// Helper function to pause execution
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a rainbow text effect by applying different colors to each character
 */
function rainbowText(text: string): string {
  const colors: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

  return Array.from(text)
    .map((char, i) => {
      const colorIndex = i % colors.length;
      const color = colors[colorIndex];
      return `${COLORS[color as keyof typeof COLORS]}${char}${COLORS.reset}`;
    })
    .join('');
}

/**
 * Creates a typewriter effect by revealing text character by character
 */
async function typewriterEffect(text: string, speed = 10): Promise<void> {
  for (let i = 0; i <= text.length; i++) {
    // Clear line and write partial text
    process.stdout.write(`\r${ANSI.ERASE_LINE}${text.substring(0, i)}`);
    await sleep(speed);
  }
  console.log(); // New line after complete
}

/**
 * Creates a spinning animation
 */
async function spinnerAnimation(text: string, duration = 2000): Promise<void> {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const colors: ColorName[] = ['cyan', 'green', 'yellow', 'blue', 'magenta'];
  const startTime = Date.now();
  let i = 0;

  while (Date.now() - startTime < duration) {
    const frame = frames[i % frames.length];
    const color = colors[Math.floor(i / 2) % colors.length];
    process.stdout.write(
      `\r${COLORS[color as keyof typeof COLORS]}${frame}${COLORS.reset} ${text}`
    );
    i++;
    await sleep(80);
  }

  process.stdout.write(`\r${ANSI.ERASE_LINE}${COLORS.green}✓${COLORS.reset} ${text}\n`);
}

/**
 * Creates a pulsing text effect
 */
async function pulsingText(text: string, cycles = 5): Promise<void> {
  const brightColors: ColorName[] = [
    'brightRed',
    'brightYellow',
    'brightGreen',
    'brightCyan',
    'brightBlue',
    'brightMagenta',
  ];
  const normalColors: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

  for (let i = 0; i < cycles; i++) {
    for (let phase = 0; phase < 2; phase++) {
      const colorSet = phase === 0 ? normalColors : brightColors;
      const colorIndex = i % colorSet.length;
      const color = colorSet[colorIndex];

      process.stdout.write(
        `\r${ANSI.ERASE_LINE}${COLORS[color as keyof typeof COLORS]}${text}${COLORS.reset}`
      );
      await sleep(200);
    }
  }
  console.log(); // New line after complete
}

/**
 * Displays API usage example in a styled box
 */
function showApiUsage(title: string, code: string): void {
  const lines = code.trim().split('\n');
  const width = Math.max(...lines.map(line => line.length)) + 4;

  const topBorder = `┌${'─'.repeat(width)}┐`;
  const bottomBorder = `└${'─'.repeat(width)}┘`;

  console.log();
  console.log(`${COLORS.brightCyan}${COLORS.bold}🔍 API Usage: ${title}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${topBorder}${COLORS.reset}`);

  lines.forEach(line => {
    // Apply syntax highlighting for keywords
    const coloredLine = line
      .replace(
        /(\bconst\b|\blet\b|\bfunction\b|\bawait\b|\breturn\b|\basync\b|\bfor\b|\bif\b)/g,
        `${COLORS.brightMagenta}$1${COLORS.brightGreen}`
      )
      .replace(/(\blogger\.[\w.]+)/g, `${COLORS.brightYellow}$1${COLORS.brightGreen}`)
      .replace(/(["'`].*?["'`])/g, `${COLORS.brightCyan}$1${COLORS.brightGreen}`);

    console.log(
      `${COLORS.cyan}│${COLORS.reset} ${COLORS.brightGreen}${coloredLine.padEnd(width - 1)}${
        COLORS.reset
      }${COLORS.cyan}│${COLORS.reset}`
    );
  });

  console.log(`${COLORS.cyan}${bottomBorder}${COLORS.reset}`);
  console.log();
}

/**
 * Show formatted table example
 */
async function showTableExample(logger: Logger): Promise<void> {
  logger.header('  TABLE FORMATTING  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom(
    'MagicLogger provides beautiful table formatting for structured data',
    ['cyan'],
    'TABLES'
  );
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Table Formatting',
    `
// Create a data array of objects with consistent properties
const userData = [
  { id: 1, username: 'alice', role: 'Admin', lastLogin: '2023-05-15', status: 'Active' },
  { id: 2, username: 'bob', role: 'User', lastLogin: '2023-05-10', status: 'Inactive' },
  { id: 3, username: 'charlie', role: 'Editor', lastLogin: '2023-05-14', status: 'Active' }
];

// Display the data as a formatted table with custom header colors
logger.table(userData, ['brightGreen', 'bold']);
  `
  );

  await sleep(500);

  // Sample data for the table
  const userData = [
    { id: 1, username: 'alice', role: 'Admin', lastLogin: '2023-05-15', status: 'Active' },
    { id: 2, username: 'bob', role: 'User', lastLogin: '2023-05-10', status: 'Inactive' },
    { id: 3, username: 'charlie', role: 'Editor', lastLogin: '2023-05-14', status: 'Active' },
    { id: 4, username: 'dave', role: 'User', lastLogin: '2023-05-01', status: 'Locked' },
    { id: 5, username: 'eve', role: 'Moderator', lastLogin: '2023-05-12', status: 'Active' },
  ];

  // Print the table with custom header colors
  logger.table(userData, ['brightGreen', 'bold']);

  await sleep(800);
}

/**
 * Demonstrate color factory functions
 */
async function colorFactoryDemo(logger: Logger): Promise<void> {
  logger.header('  COLOR FACTORY FUNCTIONS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom('Create reusable color functions for consistent styling', ['cyan'], 'COLORS');
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Color Factory',
    `
// Create reusable color functions
const highlight = logger.color('yellow', 'bold');
const code = logger.color('brightGreen');
const error = logger.color('brightRed', 'bold');
const path = logger.color('brightCyan', 'underline');

// Use them in your output for consistent styling
console.log(\`\${highlight('Important:')} Check the logs at \${path('./logs/app.log')}\`);
console.log(\`Use \${code('logger.color()')} to create reusable styles\`);
  `
  );

  await sleep(1500);

  // Create the color functions
  const highlight = logger.color('yellow', 'bold');
  const code = logger.color('brightGreen');
  const error = logger.color('brightRed', 'bold');
  const path = logger.color('brightCyan', 'underline');
  const success = logger.color('green', 'bold');

  // Use them in examples
  console.log(`${highlight('Important:')} MagicLogger provides powerful styling capabilities`);
  await sleep(300);

  console.log(`Create styled text with ${code("logger.color('colorName', 'styleName')")}`);
  await sleep(300);

  console.log(
    `${error('Warning:')} Once you start using MagicLogger, other loggers will seem boring!`
  );
  await sleep(300);

  console.log(`Check documentation at ${path('https://github.com/yourusername/magiclogger')}`);
  await sleep(300);

  console.log(`${success('Pro tip:')} Combine with ${code('colorParts()')} for selective styling`);
  await sleep(800);
}

/**
 * Demonstrate selective colorization
 */
async function colorPartsDemo(logger: Logger): Promise<void> {
  logger.header('  SELECTIVE COLORIZATION  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom('Apply different colors to specific parts of messages', ['cyan'], 'COLORIZE');
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Selective Color Parts',
    `
// Apply different colors to specific parts of a message
const formattedLog = logger.colorParts(
  'Error: Failed to connect to database "users_db" on localhost:5432 - Connection timeout',
  {
    'Error:': ['brightRed', 'bold'],             // Error prefix in bright red and bold
    'users_db': ['yellow', 'underline'],         // Database name highlighted and underlined
    'localhost:5432': ['cyan'],                  // Server address in cyan
    'Connection timeout': ['red', 'italic']      // Error description in red italic
  }
);

console.log(formattedLog);
  `
  );

  await sleep(1500);

  // Show examples of colorParts
  console.log(
    logger.colorParts(
      'Error: Failed to connect to database "users_db" on localhost:5432 - Connection timeout',
      {
        'Error:': ['brightRed', 'bold'],
        users_db: ['yellow', 'underline'],
        'localhost:5432': ['cyan'],
        'Connection timeout': ['red', 'italic'],
      }
    )
  );
  await sleep(400);

  console.log(
    logger.colorParts('Success: User signup completed for john.doe@example.com (User ID: 12345)', {
      'Success:': ['green', 'bold'],
      'john.doe@example.com': ['brightYellow', 'underline'],
      'User ID: 12345': ['cyan', 'bold'],
    })
  );
  await sleep(400);

  console.log(
    logger.colorParts('API Request: GET /api/users?page=1&limit=10 - Response: 200 OK (45ms)', {
      'API Request:': ['blue', 'bold'],
      GET: ['brightBlue', 'bold'],
      '/api/users?page=1&limit=10': ['brightBlue', 'underline'],
      '200 OK': ['green', 'bold'],
      '45ms': ['magenta'],
    })
  );
  await sleep(800);
}

/**
 * Demonstrate progress bars
 */
async function progressBarDemo(logger: Logger): Promise<void> {
  logger.header('  PROGRESS TRACKING  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom('Visualize progress with customizable progress bars', ['cyan'], 'PROGRESS');
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Progress Bars',
    `
// Basic progress bar
logger.progressBar(50);  // 50% complete with default style

// Customized progress bar
logger.progressBar(
  75,                // Progress percentage (0-100)
  30,                // Length of the bar in characters
  '▓',               // Character for completed portion
  '░'                // Character for incomplete portion
);

// Animated progress example
for (let i = 0; i <= 100; i += 10) {
  logger.progressBar(i, 40, '█', '░');
  await sleep(200);  // Update every 200ms
}
  `
  );

  await sleep(1500);

  // Basic progress example
  logger.custom('Basic progress bar (50%)', ['blue'], 'EXAMPLE 1');
  logger.progressBar(50);
  await sleep(500);

  // Custom styling example
  logger.custom('Custom progress bar styling (75%)', ['blue'], 'EXAMPLE 2');
  logger.progressBar(75, 30, '▓', '░');
  await sleep(500);

  // Animated progress example
  logger.custom('Animated progress (with delay between updates)', ['blue'], 'EXAMPLE 3');
  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 40, '█', '░');
    await sleep(50);
  }

  await sleep(500);
  logger.success('Progress tracking complete');
  await sleep(800);
}

/**
 * Demonstrate styled presets
 */
async function stylePresetsDemo(logger: Logger): Promise<void> {
  logger.header('  STYLE PRESETS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom('Use predefined style combinations for consistent visuals', ['cyan'], 'PRESETS');
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Style Presets',
    `
// Use predefined style combinations with logger.styled()
logger.styled('This is important information', 'important');
logger.styled('Operation completed successfully', 'success');
logger.styled('Warning about potential issues', 'warning');
logger.styled('Error message for failures', 'error');
logger.styled('Subtle information or context', 'muted');
logger.styled('Code sample or command', 'code');

// Available presets:
// 'info', 'success', 'warning', 'error', 'debug', 
// 'important', 'highlight', 'muted', 'special', 'code', 'header'
  `
  );

  await sleep(1500);

  // Display all available style presets with examples and their component styles
  const allPresets: StylePreset[] = [
    'info',
    'success',
    'warning',
    'error',
    'debug',
    'important',
    'highlight',
    'muted',
    'special',
    'code',
    'header',
  ];

  for (const preset of allPresets) {
    logger.styled(`This message uses the "${preset}" preset style with logger.styled()`, preset);
    await sleep(300);
  }

  await sleep(800);
}

/**
 * Demonstrate custom prefixes and styling
 */
async function customStyleDemo(logger: Logger): Promise<void> {
  logger.header('  CUSTOM STYLING WITH PREFIXES  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom('Create messages with custom prefixes and styling', ['cyan'], 'CUSTOM');
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Custom Styling',
    `
// Basic custom styling with default white color
logger.custom('Custom message with default styling', ['white'], 'PREFIX');

// Custom styling with multiple colors/styles combined
logger.custom(
  'Message with multiple styles applied',
  ['brightGreen', 'bold', 'italic'],  // Array of styles to apply
  'STYLED'                            // Custom prefix label
);

// Domain-specific styling examples
logger.custom('Database connected successfully', ['green', 'bold'], 'DB');
logger.custom('Authentication token expired', ['red', 'bold'], 'AUTH');
logger.custom('Request processed in 45ms', ['blue'], 'API');
  `
  );

  await sleep(1500);

  // Basic custom styling
  logger.custom('Basic custom message with default white color', ['white'], 'BASIC');
  await sleep(300);

  // Custom styling with multiple colors/styles
  logger.custom(
    'Custom styling with multiple attributes combined',
    ['brightGreen', 'bold', 'italic'],
    'COMBINED'
  );
  await sleep(300);

  // Domain-specific styling examples
  logger.custom(
    'Database connection established to mongodb://localhost:27017',
    ['cyan', 'bold'],
    'DATABASE'
  );
  await sleep(300);

  logger.custom('Authentication token verified for user@example.com', ['green', 'bold'], 'AUTH');
  await sleep(300);

  logger.custom('Token validation failed: signature mismatch', ['red', 'bold'], 'AUTH');
  await sleep(300);

  logger.custom('GET /api/users?page=1&limit=10 (200 OK, 45ms)', ['blue'], 'API');
  await sleep(300);

  logger.custom('Memory usage: 128MB (24% increase)', ['magenta'], 'SYSTEM');
  await sleep(800);
}

/**
 * Demonstrate server monitoring with live updates and API usage
 */
async function serverMonitoringDemo(logger: Logger): Promise<void> {
  logger.header('  LIVE SERVER MONITORING  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  logger.custom('Real-time server metrics monitoring example', ['cyan', 'bold'], 'MONITOR');
  await sleep(300);

  // Show API usage
  showApiUsage(
    'Server Monitoring',
    `
// Create color functions for different status levels
const criticalColor = logger.color('red', 'bold');
const warningColor = logger.color('yellow');
const goodColor = logger.color('green');

// Display color-coded metrics based on thresholds
console.log(\`CPU Usage: \${
  metrics.cpu > 30 ? criticalColor(\`\${metrics.cpu}%\`) :
  metrics.cpu > 20 ? warningColor(\`\${metrics.cpu}%\`) :
  goodColor(\`\${metrics.cpu}%\`)
}\`);

// Log appropriate warning level based on metrics
if (metrics.cpu > 30) {
  logger.warn(\`High CPU usage detected: \${metrics.cpu}%\`);
}
  `
  );

  await sleep(1900);

  // Server metrics
  const metrics = {
    cpu: 12,
    memory: 34,
    requests: 0,
    responseTime: 45,
    errorRate: 0,
  };

  // Update metrics over time
  for (let i = 0; i < 8; i++) {
    // Clear previous metrics
    for (let j = 0; j < 5; j++) {
      process.stdout.write(ANSI.CURSOR_UP(1));
      process.stdout.write(ANSI.ERASE_LINE);
    }

    // Update metric values
    metrics.cpu = 10 + Math.floor(Math.random() * 30);
    metrics.memory = 30 + Math.floor(Math.random() * 15);
    metrics.requests += Math.floor(Math.random() * 50);
    metrics.responseTime = 40 + Math.floor(Math.random() * 80);
    metrics.errorRate = Math.random() < 0.3 ? Math.random() * 2 : 0;

    // Display metrics with appropriate colors
    const cpuColor: ColorName = metrics.cpu > 30 ? 'red' : metrics.cpu > 20 ? 'yellow' : 'green';
    const memColor: ColorName =
      metrics.memory > 40 ? 'red' : metrics.memory > 35 ? 'yellow' : 'green';
    const rtColor: ColorName =
      metrics.responseTime > 90 ? 'red' : metrics.responseTime > 60 ? 'yellow' : 'green';
    const errColor: ColorName =
      metrics.errorRate > 1 ? 'red' : metrics.errorRate > 0 ? 'yellow' : 'green';

    console.log(`CPU Usage:      ${logger.color(cpuColor)(`${metrics.cpu}%`)}`);
    console.log(`Memory Usage:   ${logger.color(memColor)(`${metrics.memory}%`)}`);
    console.log(`Requests:       ${metrics.requests} total`);
    console.log(`Response Time:  ${logger.color(rtColor)(`${metrics.responseTime}ms`)}`);
    console.log(`Error Rate:     ${logger.color(errColor)(`${metrics.errorRate.toFixed(2)}%`)}`);

    // Add alerts for concerning metrics
    if (metrics.cpu > 30) {
      logger.warn(`High CPU usage detected: ${metrics.cpu}%`);
    }

    if (metrics.responseTime > 90) {
      logger.warn(`Slow response times: ${metrics.responseTime}ms`);
    }

    if (metrics.errorRate > 1) {
      logger.error(`Elevated error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    await sleep(500);
  }

  logger.success('Monitoring completed');
}

/**
 * Show a realistic log analysis demo
 */
async function logAnalysisDemo(logger: Logger): Promise<void> {
  logger.header('  LOG ANALYSIS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Show API usage
  showApiUsage(
    'Log Analysis',
    `
// Use colorParts for highlighting specific elements in log entries
console.log(
  logger.colorParts(
    '[2023-05-15 14:32:01] ERROR: Failed login attempt for user admin from 198.51.100.32',
    {
      'ERROR': ['brightRed', 'bold'],
      'Failed login attempt': ['red'],
      'admin': ['brightYellow', 'underline'],
      '198.51.100.32': ['cyan', 'bold']
    }
  )
);

// Display analysis results as a formatted table
logger.table([
  { severity: 'CRITICAL', category: 'Security', count: 3, source: 'Auth Service' },
  { severity: 'WARNING', category: 'Performance', count: 12, source: 'API Gateway' }
]);
  `
  );

  await sleep(1500);

  // Start log processing animation
  logger.custom('Processing application logs...', ['cyan'], 'ANALYSIS');
  await spinnerAnimation('Scanning logfiles for patterns', 2000);
  await sleep(300);

  // Show log examples with selective colorization
  logger.custom('Found suspicious log patterns:', ['yellow', 'bold'], 'SECURITY');
  await sleep(500);

  console.log(
    logger.colorParts(
      '[2023-05-15 14:32:01] ERROR: Failed login attempt for user admin from 198.51.100.32 - Invalid credentials',
      {
        ERROR: ['brightRed', 'bold'],
        'Failed login attempt': ['red'],
        admin: ['brightYellow', 'underline'],
        '198.51.100.32': ['cyan', 'bold'],
      }
    )
  );
  await sleep(300);

  console.log(
    logger.colorParts(
      '[2023-05-15 14:35:12] ERROR: Failed login attempt for user admin from 198.51.100.32 - Invalid credentials',
      {
        ERROR: ['brightRed', 'bold'],
        'Failed login attempt': ['red'],
        admin: ['brightYellow', 'underline'],
        '198.51.100.32': ['cyan', 'bold'],
      }
    )
  );
  await sleep(300);

  console.log(
    logger.colorParts(
      '[2023-05-15 14:38:45] ERROR: Failed login attempt for user admin from 198.51.100.32 - Account locked',
      {
        ERROR: ['brightRed', 'bold'],
        'Failed login attempt': ['red'],
        admin: ['brightYellow', 'underline'],
        '198.51.100.32': ['cyan', 'bold'],
        'Account locked': ['brightRed', 'bold'],
      }
    )
  );
  await sleep(500);

  // Show analysis results
  logger.custom('Analysis complete', ['green'], 'ANALYSIS');
  await sleep(300);

  logger.table([
    { severity: 'CRITICAL', category: 'Security', count: 3, source: 'Auth Service' },
    { severity: 'WARNING', category: 'Performance', count: 12, source: 'API Gateway' },
    { severity: 'INFO', category: 'System', count: 156, source: 'Various' },
  ]);

  await sleep(500);
  logger.custom(
    'Possible brute force attack detected from IP 198.51.100.32',
    ['red', 'bold'],
    'ALERT'
  );
  await sleep(300);
  logger.custom('Added IP to blocklist', ['green'], 'ACTION');
}

/**
 * Enhanced deployment demo with visual effects
 */
async function deploymentDemo(logger: Logger): Promise<void> {
  logger.header('  DEPLOYMENT PIPELINE  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Show API usage
  showApiUsage(
    'Deployment Pipeline',
    `
// Create a progress bar with custom characters and length
for (let i = 0; i <= 100; i += 5) {
  logger.progressBar(i, 40, '█', '░');
  await sleep(50);
}

// Use a spinner animation for tasks without precise progress
await spinnerAnimation('Optimizing build assets', 1500);

// Use typewriter effect for step-by-step processes
await typewriterEffect('Uploading assets to CDN...', 5);

// Style success messages
logger.header('  DEPLOYMENT SUCCESSFUL  ', ['brightWhite', 'bgGreen', 'bold']);
  `
  );

  await sleep(1500);

  logger.custom('Starting deployment to production', ['cyan', 'bold'], 'DEPLOY');
  await sleep(500);

  // Stage 1: Build
  logger.custom('Building application...', ['blue'], 'STAGE 1/4');
  await sleep(300);

  for (let i = 0; i <= 100; i += 5) {
    logger.progressBar(i, 40, '█', '░');
    await sleep(50);
  }

  await spinnerAnimation('Optimizing build assets', 1500);
  logger.success('Build completed successfully (450 files, 2.3MB)');
  await sleep(500);

  // Stage 2: Testing
  logger.custom('Running automated tests...', ['blue'], 'STAGE 2/4');
  await sleep(300);

  const testingSummary = [
    { type: 'Unit Tests', status: 'PASS', count: 342 },
    { type: 'Integration Tests', status: 'PASS', count: 128 },
    { type: 'E2E Tests', status: 'PASS', count: 24 },
  ];

  for (const testSuite of testingSummary) {
    await sleep(300);
    console.log(
      logger.colorParts(`${testSuite.status} ${testSuite.type} (${testSuite.count} tests)`, {
        PASS: ['green', 'bold'],
        [testSuite.count.toString()]: ['cyan'],
      })
    );
  }

  logger.success('All tests passed successfully');
  await sleep(500);

  // Stage 3: Database Migration
  logger.custom('Running database migrations...', ['blue'], 'STAGE 3/4');
  await sleep(300);

  console.log(
    logger.colorParts('Migration: Add user_preferences table...', {
      'Migration:': ['cyan', 'bold'],
      'Add user_preferences table': ['brightWhite'],
    })
  );
  await sleep(200);

  console.log(
    logger.colorParts('Migration: Update authentication schema...', {
      'Migration:': ['cyan', 'bold'],
      'Update authentication schema': ['brightWhite'],
    })
  );
  await sleep(200);

  console.log(
    logger.colorParts('Migration: Create indices for performance...', {
      'Migration:': ['cyan', 'bold'],
      'Create indices for performance': ['brightWhite'],
    })
  );
  await sleep(500);

  await spinnerAnimation('Verifying database integrity', 1000);
  logger.success('Database migrations completed successfully');
  await sleep(500);

  // Stage 4: Deployment
  logger.custom('Deploying to production servers...', ['blue'], 'STAGE 4/4');
  await sleep(300);

  await typewriterEffect('Uploading assets to CDN...', 5);
  await sleep(300);

  await typewriterEffect('Updating load balancer configuration...', 5);
  await sleep(300);

  await typewriterEffect('Performing canary deployment to 10% of servers...', 5);
  await sleep(300);

  await typewriterEffect('Monitoring health checks...', 5);
  await sleep(300);

  await typewriterEffect('Scaling to 100% of production fleet...', 5);
  await sleep(500);

  // Final success message
  logger.header('  DEPLOYMENT SUCCESSFUL  ', ['brightWhite', 'bgGreen', 'bold']);
  await sleep(300);

  console.log();
  console.log(
    logger.colorParts(
      'Deployment completed in 3m 42s (Build: 1m 15s, Test: 45s, DB: 32s, Deploy: 1m 10s)',
      {
        '3m 42s': ['brightGreen', 'bold'],
        'Build: 1m 15s': ['cyan'],
        'Test: 45s': ['cyan'],
        'DB: 32s': ['cyan'],
        'Deploy: 1m 10s': ['cyan'],
      }
    )
  );
  console.log();

  logger.custom('Application is now live at https://example.com', ['green', 'bold'], 'URL');
}

/**
 * Service health check demo with visual status indicators
 */
async function healthCheckDemo(logger: Logger): Promise<void> {
  logger.header('  SYSTEM HEALTH CHECK  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Show API usage
  showApiUsage(
    'Health Check Status',
    `
// Use color functions for dynamic status indicators
const statusColor = 
  service.status === 'ONLINE' ? 'green' :
  service.status === 'DEGRADED' ? 'yellow' : 'red';

// Display colored status text
console.log(\`\${logger.color(statusColor)(statusText)}\`);

// Log appropriate message based on status
if (service.status === 'DEGRADED') {
  logger.warn(\`\${service.name} is experiencing high latency\`);
} else if (service.status === 'OFFLINE') {
  logger.error(\`\${service.name} is not responding\`);
}
  `
  );

  await sleep(1500);

  logger.custom('Performing comprehensive health check of all services...', ['cyan'], 'HEALTH');
  await sleep(300);

  // Define services with random status
  const services = [
    { name: 'API Gateway', status: Math.random() > 0.2 ? 'ONLINE' : 'DEGRADED' },
    { name: 'Authentication Service', status: Math.random() > 0.1 ? 'ONLINE' : 'OFFLINE' },
    { name: 'User Database', status: 'ONLINE' },
    { name: 'Payment Processor', status: Math.random() > 0.3 ? 'ONLINE' : 'DEGRADED' },
    { name: 'Notification Service', status: Math.random() > 0.2 ? 'ONLINE' : 'OFFLINE' },
    { name: 'Content Delivery Network', status: 'ONLINE' },
    { name: 'Analytics Engine', status: Math.random() > 0.1 ? 'ONLINE' : 'DEGRADED' },
    { name: 'Search Service', status: Math.random() > 0.2 ? 'ONLINE' : 'OFFLINE' },
  ];

  // Check each service with a spinner animation
  for (const service of services) {
    await spinnerAnimation(`Checking ${service.name}`, 800);

    // Display status with appropriate color
    const statusColor: ColorName =
      service.status === 'ONLINE' ? 'green' : service.status === 'DEGRADED' ? 'yellow' : 'red';

    const statusText = `${service.name.padEnd(25)}: ${service.status}`;
    console.log(`  ${logger.color(statusColor)(statusText)}`);

    // Add detailed message for non-online services
    if (service.status === 'DEGRADED') {
      logger.warn(`${service.name} is experiencing high latency`);
    } else if (service.status === 'OFFLINE') {
      logger.error(`${service.name} is not responding`);
    }

    await sleep(200);
  }

  await sleep(500);

  // Summary section
  console.log();
  logger.custom('Health Check Summary', ['brightWhite', 'bgBlue'], 'SUMMARY');

  const onlineCount = services.filter(s => s.status === 'ONLINE').length;
  const degradedCount = services.filter(s => s.status === 'DEGRADED').length;
  const offlineCount = services.filter(s => s.status === 'OFFLINE').length;

  console.log(`  ${logger.color('green')(`✓ Online:   ${onlineCount}/${services.length}`)}`);
  if (degradedCount > 0) {
    console.log(`  ${logger.color('yellow')(`⚠ Degraded: ${degradedCount}/${services.length}`)}`);
  }
  if (offlineCount > 0) {
    console.log(`  ${logger.color('red')(`✗ Offline:  ${offlineCount}/${services.length}`)}`);
  }

  console.log();

  // Overall status
  if (offlineCount > 0) {
    logger.error('System is in CRITICAL state - Immediate attention required');
  } else if (degradedCount > 0) {
    logger.warn('System is in DEGRADED state - Monitor closely');
  } else {
    logger.success('System is HEALTHY - All services operating normally');
  }
}

/**
 * Basic logging methods demo
 */
async function basicLoggingDemo(logger: Logger): Promise<void> {
  logger.header('  BASIC LOGGING METHODS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Show API usage
  showApiUsage(
    'Basic Logging',
    `
// Standard info message
logger.info('Application started successfully');

// Success message with green styling
logger.success('User registration completed');

// Warning message with yellow styling
logger.warn('Disk space is running low (15% remaining)');

// Error message with bright red styling
logger.error('Failed to connect to database');

// Debug message (only shown when verbose:true)
logger.debug('Auth token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...');

// Universal log method with different levels
logger.log('Message with default info level');
logger.log('Warning message example', 'warn');
logger.log('Error message example', 'error');
  `
  );

  await sleep(1500);

  logger.custom(
    'MagicLogger provides standard logging levels with enhanced styling',
    ['cyan'],
    'BASICS'
  );
  await sleep(300);

  // Standard logging methods
  logger.info('Application started successfully');
  await sleep(300);

  logger.success('User registration completed');
  await sleep(300);

  logger.warn('Disk space is running low (15% remaining)');
  await sleep(300);

  logger.error('Failed to connect to database');
  await sleep(300);

  logger.debug('Auth token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  await sleep(500);

  // Universal log method
  logger.custom('Universal log method with different levels:', ['blue'], 'UNIVERSAL');
  await sleep(300);

  logger.log('Message with default info level');
  await sleep(300);

  logger.log('Warning message example', 'warn');
  await sleep(300);

  logger.log('Error message example', 'error');
  await sleep(300);

  logger.log('Debug message example', 'debug');
  await sleep(300);

  logger.log('Success message example', 'success');
  await sleep(500);
}

/**
 * Rainbow text demo
 */
async function rainbowDemo(logger: Logger): Promise<void> {
  logger.header('  RAINBOW TEXT EFFECTS  ', ['brightWhite', 'bgBlue', 'bold']);
  await sleep(500);

  // Show API usage
  showApiUsage(
    'Rainbow Text Effect',
    `
// Rainbow text using ANSI color codes
function rainbowText(text) {
  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  
  return Array.from(text).map((char, i) => {
    const colorIndex = i % colors.length;
    const color = colors[colorIndex];
    return \`\${COLORS[color]}\${char}\${COLORS.reset}\`;
  }).join('');
}

// Example usage
console.log(rainbowText('✨ MagicLogger - Beautiful terminal styling ✨'));
  `
  );

  await sleep(1500);

  logger.custom('Create eye-catching multicolored text with rainbow effects', ['cyan'], 'RAINBOW');
  await sleep(300);

  console.log(rainbowText('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨'));
  await sleep(300);

  console.log(rainbowText('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄'));
  await sleep(300);

  console.log();
  console.log(rainbowText('  ✨  MagicLogger - Beautiful terminal styling  ✨  '));
  console.log();

  await sleep(300);
  console.log(rainbowText('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄'));
  await sleep(300);

  console.log(rainbowText('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨'));
  await sleep(500);
}

/**
 * Main demo function that showcases all features with visual flair
 */
async function runAnimatedDemo(): Promise<void> {
  // Create a logger with colors enabled
  const logger = new Logger({
    useColors: true,
    verbose: true,
  });

  // Clear screen and show title
  console.clear();
  console.log('\n');

  // Animated title sequence
  await pulsingText('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨', 3);
  console.log('\n');

  console.log(rainbowText('       ███╗   ███╗ █████╗  ██████╗ ██╗ ██████╗'));
  console.log(rainbowText('       ████╗ ████║██╔══██╗██╔════╝ ██║██╔════╝'));
  console.log(rainbowText('       ██╔████╔██║███████║██║  ███╗██║██║     '));
  console.log(rainbowText('       ██║╚██╔╝██║██╔══██║██║   ██║██║██║     '));
  console.log(rainbowText('       ██║ ╚═╝ ██║██║  ██║╚██████╔╝██║╚██████╗'));
  console.log(rainbowText('       ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝ ╚═════╝'));
  console.log('\n');
  console.log(rainbowText('  ██╗      ██████╗  ██████╗  ██████╗ ███████╗██████╗'));
  console.log(rainbowText('  ██║     ██╔═══██╗██╔════╝ ██╔════╝ ██╔════╝██╔══██╗'));
  console.log(rainbowText('  ██║     ██║   ██║██║  ███╗██║  ███╗█████╗  ██████╔╝'));
  console.log(rainbowText('  ██║     ██║   ██║██║   ██║██║   ██║██╔══╝  ██╔══██╗'));
  console.log(rainbowText('  ███████╗╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║'));
  console.log(rainbowText('  ╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝'));
  console.log('\n');

  await pulsingText('✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨', 3);
  console.log('\n');

  await sleep(1000);

  // Introduction
  logger.header('  WELCOME TO MAGICLOGGER  ', ['brightWhite', 'bgMagenta', 'bold']);
  await sleep(800);

  logger.info('Starting enhanced demonstration of MagicLogger capabilities');
  await sleep(500);

  logger.custom(
    'This demo showcases API usage, animations, and practical use cases',
    ['cyan'],
    'DEMO'
  );
  await sleep(1000);

  // Run the basic logging demo
  await basicLoggingDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run the rainbow text demo
  await rainbowDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run the style presets demo
  await stylePresetsDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run the custom styling demo
  await customStyleDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run the table formatting demo
  await showTableExample(logger);
  console.log('\n');
  await sleep(1000);

  // Run the color factory demo
  await colorFactoryDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run the color parts demo
  await colorPartsDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run the progress bar demo
  await progressBarDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run server monitoring demo
  await serverMonitoringDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run log analysis demo
  await logAnalysisDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run deployment demo
  await deploymentDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Run health check demo
  await healthCheckDemo(logger);
  console.log('\n');
  await sleep(1000);

  // Final flourish
  logger.header('  DEMO COMPLETE!  ', ['brightWhite', 'bgMagenta', 'bold']);
  await sleep(500);

  console.log(rainbowText('Thank you for exploring MagicLogger!'));
  await sleep(300);

  logger.custom('For more information and documentation, visit:', ['cyan'], 'INFO');
  logger.custom('https://github.com/yourusername/magiclogger', ['brightCyan', 'underline'], 'URL');

  await sleep(500);
  console.log('\n');

  logger.styled('MagicLogger - Beautiful terminal styling made simple', 'special');
  console.log('\n');
}

// Run the demo
runAnimatedDemo().catch(console.error);
