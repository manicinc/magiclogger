const fs = require('fs');
const path = require('path');

// Import the generated TypeDoc sidebar if it exists
let typedocSidebar = null;
const sidebarPath = path.join(__dirname, 'api', 'typedoc-sidebar.cjs');
if (fs.existsSync(sidebarPath)) {
  try {
    typedocSidebar = require(sidebarPath);
  } catch (e) {
    console.warn('Failed to load TypeDoc sidebar:', e);
  }
}

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.
 */
const sidebars = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '📖 API & Usage',
      items: [
        'api-reference',
        'advanced-usage',
        {
          type: 'link',
          label: 'Full API Documentation',
          href: '/api/',
        },
      ],
    },
    {
      type: 'category',
      label: '📋 Architecture',
      items: ['architecture', 'TRANSPORTS', 'magic-schema'],
    },
    {
      type: 'category',
      label: '🔧 Features',
      items: ['browser_storage', 'styling', 'custom_colors', 'formatters', 'context-and-tags', 'terminal_support'],
    },
    {
      type: 'category',
      label: '📊 Testing & Quality',
      items: ['test_coverage', 'codecov'],
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
  ],
  // Add TypeDoc API sidebar if it exists and has valid items
  ...(typedocSidebar && typedocSidebar.items && typedocSidebar.items.length > 0
    ? { apiSidebar: typedocSidebar.items } 
    : {}), // Don't create apiSidebar if TypeDoc hasn't been generated yet
};

module.exports = sidebars;
