import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';
import fs from 'fs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MagicLogger',
  tagline: 'The most colorful TypeScript/JavaScript logging library 🌈',
  favicon: 'img/icon/favicon-32x32.png',

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

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Configure to use docs from parent directory
          path: '../docs',
          // Edit links point to GitHub
          editUrl: 'https://github.com/manicinc/magiclogger/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Edit links point to GitHub
          editUrl: 'https://github.com/manicinc/magiclogger/tree/main/my-website/blog/',
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
    image: 'img/magiclogger-primary-white-4x.png',
    navbar: {
      title: 'MagicLogger',
      logo: {
        alt: 'MagicLogger Logo',
        // Use transparent variant on light mode and dark variant on dark mode
        // so the logo is always visible and on-brand
        src: 'img/magiclogger-primary-no-subtitle-transparent-4x.png',
        srcDark: 'img/magiclogger-primary-no-subtitle-dark-4x.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/manicinc/magiclogger',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
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
  // Plugin to alias 'magiclogger' to the local dist build during docs build/serve.
  // Falls back to a local shim when dist isn't built so the site still compiles.
  plugins: [
    function magicloggerLocalAliasPlugin() {
      return {
        name: 'magiclogger-local-alias',
        // Provide aliases for both client and server builds
        // Use ESM bundle for client and CJS bundle for server (SSR)
        // so that both compilers can resolve the local package without publishing.
        // Docusaurus will merge this with its own webpack config.
        configureWebpack(_config: unknown, isServer: boolean) {
          const repoRoot = path.resolve(__dirname, '..');
          const distEsmBrowser = path.join(repoRoot, 'dist', 'browser', 'index.js');
          const distCjs = path.join(repoRoot, 'dist', 'index.cjs');
          const shimPath = path.join(__dirname, 'src', 'shims', 'magiclogger.ts');
          const targetCandidate = isServer ? distCjs : distEsmBrowser;
          const target = fs.existsSync(targetCandidate)
            ? targetCandidate
            : (fs.existsSync(shimPath) ? shimPath : undefined);
          return {
            resolve: {
              fallback: isServer
                ? {}
                : {
                    fs: false,
                    path: false,
                    os: false,
                    zlib: false,
                    module: false,
                    events: false,
                    'node:fs': false,
                    'node:path': false,
                  },
              alias: target
                ? {
                    // Exact match and bare import support
                    magiclogger: target,
                    magiclogger$: target,
                  }
                : {},
            },
          };
        },
      };
    },
  ],
};

export default config;
