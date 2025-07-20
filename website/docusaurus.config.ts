import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MagicLogger',
  tagline: 'The most colorful TypeScript/JavaScript logging library 🌈',
  favicon: 'img/icon/favicon.ico', // Changed from 'img/favicon.ico'

  // Set the production url of your site here
  url: 'https://manicinc.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/magiclogger/',

  // GitHub pages deployment config.
  organizationName: 'manicinc', // Usually your GitHub org/user name.
  projectName: 'magiclogger', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Custom webpack configuration
  plugins: [
    function (_context, _options) {
      return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer) {
          if (!isServer) {
            // Only apply polyfills, don't modify other webpack settings
            config.resolve = config.resolve || {};
            config.resolve.fallback = {
              ...config.resolve.fallback,
              "path": require.resolve("path-browserify"),
              "os": require.resolve("os-browserify/browser"),
              "fs": false,
              "zlib": require.resolve("browserify-zlib"),
              "assert": require.resolve("assert/"),
              "stream": require.resolve("stream-browserify"),
              "util": require.resolve("util/"),
            };
          }
          return {};
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Configure to use docs from parent directory
          path: '../docs',
          // Edit links point to GitHub
          editUrl:
            'https://github.com/manicinc/magiclogger/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Edit links point to GitHub
          editUrl:
            'https://github.com/manicinc/magiclogger/tree/main/website/blog/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/magiclogger-primary-no-subtitle-transparent-4x.png', // Changed from generic social card
    navbar: {
      title: 'MagicLogger',
      logo: {
        alt: 'MagicLogger Logo',
        src: 'img/magiclogger-icon.svg', // This should show your logo
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '📚 Documentation',
        },
        {
          href: '/docs/api_usage',
          label: '🔧 API Reference',
          position: 'left',
        },
        {
          href: 'https://github.com/manicinc/magiclogger/tree/master/examples',
          label: '💡 Examples',
          position: 'left',
        },
        { to: '/blog', label: '📝 Blog', position: 'left' },
        {
          href: 'https://github.com/manicinc/magiclogger',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Manic Agency Logo',
        src: 'img/magiclogger-icon.svg',
        href: 'https://manic.agency',
        width: 40,
        height: 40,
      },
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/api_usage',
            },
            {
              label: 'API Reference',
              to: '/docs/api_usage',
            },
            {
              label: 'Compatibility Guide',
              to: '/docs/compatibility',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/manicinc/magiclogger',
            },
            {
              label: 'npm Package',
              href: 'https://www.npmjs.com/package/magiclogger',
            },
          ],
        },
        {
          title: 'Manic.agency',
          items: [
            {
              label: 'Website',
              href: 'https://manic.agency',
            },
            {
              label: 'Contact',
              href: 'mailto:team@manic.agency',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Manic.agency. The most colorful logging library. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
