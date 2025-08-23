import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        'api_usage',
        'ASYNC_INTEGRATION',
      ],
    },
    {
      type: 'category',
      label: '📋 Architecture',
      items: [
        'ARCHITECTURE',
        'TRANSPORTS',
        'MAGICLOG_SCHEMA',
        'PERFORMANCE_ARCHITECTURE',
        'SYNC_ASYNC_MATRIX',
      ],
    },
    {
      type: 'category',
      label: '🔧 Features',
      items: [
        'browser_storage',
        'styling',
        'formatters',
        'context-and-tags',
        'terminal_support',
      ],
    },
    {
      type: 'category',
      label: '📊 Testing & Quality',
      items: [
        'test_coverage',
        'codecov',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Development',
      items: [
        'development',
        'contributing',
        'build_instructions',
        'git_workflow',
        'publishing',
        'cicd',
        'deployment',
      ],
    },
    {
      type: 'category',
      label: '⚡ Performance',
      items: [
        'PERFORMANCE_TRADEOFFS',
      ],
    },
  ],
};

export default sidebars;
