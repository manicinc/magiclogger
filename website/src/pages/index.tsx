import type {ReactNode} from 'react';
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import InteractiveDemo from '@site/src/components/InteractiveDemo';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          🌈 {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Get Started - 2min ⚡
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://github.com/manicinc/magiclogger"
            style={{marginLeft: '1rem'}}>
            View on GitHub 🐙
          </Link>
        </div>
        
        {/* Quick Install Commands */}
        <div className={styles.quickInstall}>
          <Heading as="h3" className={styles.quickInstallTitle}>
            📦 Quick Install
          </Heading>
          <div className={styles.installCommands}>
            <CodeBlock language="bash" className={styles.installCommand}>npm install magiclogger</CodeBlock>
            <CodeBlock language="bash" className={styles.installCommand}>yarn add magiclogger</CodeBlock>
            <CodeBlock language="bash" className={styles.installCommand}>pnpm add magiclogger</CodeBlock>
          </div>
        </div>
      </div>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
    </header>
  );
}

function ExamplesSection() {
  const [activeTab, setActiveTab] = React.useState('quickstart');

  const examples = {
    quickstart: {
      title: '🚀 Quick Start',
      description: 'Get up and running in seconds with zero configuration',
      code: `import { Logger } from 'magiclogger';

// Zero config - just import and use!
const logger = new Logger();

logger.info('🌈 Welcome to MagicLogger!');
logger.success('✅ Zero configuration required');
logger.warn('⚠️ Beautiful colors out of the box');
logger.error('❌ And error handling too!');

// Advanced features work immediately
logger.table([
  { name: 'Alice', age: 30, city: 'New York' },
  { name: 'Bob', age: 25, city: 'Los Angeles' }
]);

logger.progress(75); // Beautiful progress bars
logger.header('SECTION HEADER'); // Visual organization`,
      language: 'typescript'
    },
    browser: {
      title: '🌐 Browser & CDN',
      description: 'Works everywhere - Node.js, browsers, and CDN',
      code: `<!-- CDN Integration -->
<script src="https://unpkg.com/magiclogger"></script>
<script>
  const logger = new MagicLogger.Logger({ 
    storage: true,  // Browser localStorage
    theme: 'cyberpunk' 
  });
  
  logger.info('🌐 Browser logging enabled!');
  logger.download(); // Download logs as file
</script>

<!-- Module Integration -->
<script type="module">
  import { Logger } from 'https://unpkg.com/magiclogger/index.mjs';
  
  const logger = new Logger({ 
    storeInBrowser: true,
    maxStoredLogs: 1000 
  });
  
  // Same API works everywhere
  logger.success('Module loaded successfully!');
  
  // Browser-specific features
  const logs = logger.getLogs();
  logger.downloadLogs('app-logs.txt');
</script>`,
      language: 'html'
    },
    styling: {
      title: '🎨 Custom Styling',
      description: 'Full control over colors, styles, and visual elements',
      code: `import { Logger } from 'magiclogger';

const logger = new Logger({ theme: 'rainbow' });

// Custom colors and styles
logger.custom('Database connected', ['green', 'bold'], 'DB');
logger.custom('Cache miss', ['yellow', 'italic'], 'CACHE');
logger.custom('API Error', ['red', 'underline'], 'API');

// Colorize specific parts of messages
logger.colorParts('File uploaded: document.pdf (2.4MB) ✓', {
  'document.pdf': ['cyan', 'underline'],
  '2.4MB': ['green', 'bold'],
  '✓': ['green']
});

// Style presets for consistency
logger.styled('Critical system alert', 'important');
logger.styled('Debug information', 'debug');
logger.styled('Performance data', 'performance');

// Visual elements
logger.header('🔧 SYSTEM DIAGNOSTICS');
logger.progressBar(65, 40, '█', '░'); // Custom progress bar
logger.separator('=');`,
      language: 'typescript'
    },
    compatibility: {
      title: '🔄 Drop-in Replacement',
      description: 'Replace console, Winston, Bunyan, or Pino with zero code changes',
      code: `import { 
  enhanceConsole,
  createWinstonCompatible,
  createBunyanCompatible,
  createPinoCompatible 
} from 'magiclogger';

// 1. Enhanced Console (no code changes needed!)
const { logger, restoreConsole } = enhanceConsole({ 
  writeToDisk: true 
});

console.log('Standard console.log with colors!');
console.success('New method available!'); // Enhanced capability
console.header('ENHANCED CONSOLE'); // Visual organization

// 2. Winston Compatible
const winstonLogger = createWinstonCompatible({ 
  level: 'debug',
  verbose: true 
});
winstonLogger.info('Existing Winston code works!');

// 3. Bunyan Compatible  
const bunyanLogger = createBunyanCompatible({ 
  name: 'my-app' 
});
bunyanLogger.info({ userId: 123 }, 'User action logged');

// 4. Pino Compatible
const pinoLogger = createPinoCompatible();
pinoLogger.info('Pino-style logging with MagicLogger power');`,
      language: 'typescript'
    },
    advanced: {
      title: '⚡ Advanced Features',
      description: 'File logging, performance tracking, and data visualization',
      code: `import { Logger } from 'magiclogger';

const logger = new Logger({
  writeToDisk: true,           // Auto file logging
  logDir: './app-logs',        // Custom directory
  storeInBrowser: true,        // Browser localStorage
  logRetentionDays: 14,        // Auto cleanup
  verbose: true                // Debug mode
});

// Performance monitoring
const timer = logger.performance('api-call', async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// Complex data visualization
logger.table([
  { 
    service: 'Auth', 
    status: '✅ Healthy', 
    response: '45ms',
    load: '12%' 
  },
  { 
    service: 'Database', 
    status: '⚠️ Slow', 
    response: '340ms',
    load: '78%' 
  },
  { 
    service: 'Cache', 
    status: '❌ Down', 
    response: 'N/A',
    load: 'N/A' 
  }
]);

// Dynamic configuration
logger.setLogDir('./new-logs', true);
logger.setVerbose(false);
logger.setColorsEnabled(true);

// Get current log file path
const logPath = logger.getPath();
logger.info(\`Logs saved to: \${logPath}\`);`,
      language: 'typescript'
    },
    themes: {
      title: '🎭 Themes & Presets',
      description: 'Beautiful predefined themes and custom configurations',
      code: `import { Logger } from 'magiclogger';

// Predefined themes
const cyberpunkLogger = new Logger({ theme: 'cyberpunk' });
const darkLogger = new Logger({ theme: 'dark' });
const rainbowLogger = new Logger({ theme: 'rainbow' });
const minimalLogger = new Logger({ theme: 'minimal' });

// Theme showcase
cyberpunkLogger.info('🔮 Cyberpunk theme active');
darkLogger.warn('🌙 Dark theme for professionals');
rainbowLogger.success('🌈 Rainbow theme for fun');
minimalLogger.error('⚡ Minimal theme for focus');

// Custom theme configuration
const customLogger = new Logger({
  theme: {
    primary: 'magenta',
    secondary: 'cyan', 
    accent: 'yellow',
    info: ['blue', 'bold'],
    warn: ['yellow', 'italic'],
    error: ['red', 'underline'],
    success: ['green', 'bold'],
    debug: ['gray', 'dim']
  }
});

// Style presets
customLogger.styled('Application starting', 'startup');
customLogger.styled('Database connected', 'database');
customLogger.styled('User authenticated', 'auth');
customLogger.styled('Request processed', 'api');`,
      language: 'typescript'
    }
  };

  return (
    <div className={styles.examplesSection}>
      <div className="text--center margin-bottom--lg">
        <Heading as="h2" className={styles.sectionTitle}>
          📚 Comprehensive Examples
        </Heading>
        <p className={styles.sectionSubtitle}>
          From basic usage to advanced features - everything you need to get started
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {Object.entries(examples).map(([key, example]) => (
          <button
            key={key}
            className={clsx(
              styles.tabButton,
              activeTab === key && styles.tabButtonActive
            )}
            onClick={() => setActiveTab(key)}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <h3 className={styles.tabTitle}>
            {examples[activeTab].title}
          </h3>
          <p className={styles.tabDescription}>
            {examples[activeTab].description}
          </p>
        </div>
        
        <div className={styles.codeContainer}>
          <CodeBlock 
            language={examples[activeTab].language} 
            className={styles.exampleCode}
            title={`${examples[activeTab].title.replace(/[^\w\s]/g, '').trim()} Example`}
          >
            {examples[activeTab].code}
          </CodeBlock>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link 
            className="button button--primary button--sm"
            to="/dashboard">
            🚀 Try Dashboard
          </Link>
          <Link 
            className="button button--outline button--sm"
            to="https://github.com/manicinc/magiclogger/tree/master/examples"
            target="_blank">
            📁 More Examples
          </Link>
          <Link 
            className="button button--outline button--sm"
            to="/docs/api_usage">
            📖 Full Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - The Most Colorful Logging Library`}
      description="MagicLogger - Beautiful, fast, and feature-rich logging for TypeScript/JavaScript. Zero dependencies, cross-platform, with 256 colors and advanced features.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <InteractiveDemo />
        <ExamplesSection />
      </main>
    </Layout>
  );
}