import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as path from 'path';
import * as fs from 'fs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MagicLog - Beautiful TypeScript & JavaScript Logging Library',
  tagline: 'The most colorful TypeScript/JavaScript logging library 🌈',
  favicon: 'img/icon/favicon-32x32.png',

  // Set the production url of your site here
  url: 'https://magiclog.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'manicinc', // Usually your GitHub org/user name.
  projectName: 'magiclogger', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: undefined, // Let Docusaurus decide based on hosting provider

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // SEO metadata
  metadata: [
    { name: 'keywords', content: 'logger, logging, typescript logger, javascript logger, node logger, nodejs logging, colorful logs, styled logs, terminal colors, console colors, structured logging, json logging, ndjson, log levels, debug logging, production logging, async logger, sync logger, file logging, http logging, log transport, winston alternative, pino alternative, bunyan alternative, log4js alternative, morgan alternative, debug tool, development tool, monitoring, observability, opentelemetry, tracing, log aggregation, log analysis, terminal output, cli colors, ansi colors, chalk alternative, log formatting, log rotation, log filtering, performance logging, error tracking, application monitoring, pretty print, log viewer, log management, elasticsearch logging, mongodb logging, redis logging, kafka logging, syslog, remote logging, cloud logging, aws cloudwatch, google cloud logging, azure monitor, datadog, splunk, loggly, papertrail, log streaming, real-time logs, log dashboard, log metrics, log alerts, typescript, javascript, node.js, npm package, open source, MIT license' },
    { name: 'author', content: 'Manic.agency' },
    { name: 'publisher', content: 'Manic.agency' },
    { name: 'copyright', content: 'Manic.agency' },
    { name: 'description', content: 'MagicLogger - A beautiful, fast, and feature-rich TypeScript/JavaScript logging library with colorful terminal output, structured JSON logging, multiple transports, and production-ready performance. Perfect alternative to Winston, Pino, and Bunyan.' },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'MagicLog' },
    { property: 'og:url', content: 'https://magiclog.io' },
    { property: 'og:title', content: 'MagicLog - Beautiful TypeScript & JavaScript Logging Library' },
    { property: 'og:description', content: 'The most colorful and feature-rich logging library for TypeScript and JavaScript. Beautiful terminal output, structured JSON, multiple transports, and blazing fast performance.' },
    { property: 'og:image', content: 'https://magiclog.io/img/magiclog-primary-no-subtitle-white-4x.png' },
    { property: 'og:image:alt', content: 'MagicLog Logo' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@manicagency' },
    { name: 'twitter:creator', content: '@manicagency' },
    { name: 'twitter:title', content: 'MagicLog - Beautiful TypeScript & JavaScript Logging' },
    { name: 'twitter:description', content: 'The most colorful logging library for TypeScript/JavaScript with styled terminal output and structured JSON logging.' },
    { name: 'twitter:image', content: 'https://magiclog.io/img/magiclog-primary-no-subtitle-white-4x.png' },
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'canonical',
        href: 'https://magiclog.io',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MagicLogger',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 'Manic.agency',
          url: 'https://manic.agency',
        },
        description: 'A beautiful, fast, and feature-rich TypeScript/JavaScript logging library',
        url: 'https://magiclog.io',
        softwareVersion: '0.1.0',
        keywords: 'logger, logging, typescript, javascript, nodejs, terminal, console, colors',
        license: 'https://opensource.org/licenses/MIT',
        maintainer: {
          '@type': 'Organization',
          name: 'Manic.agency',
          url: 'https://manic.agency',
        },
      }),
    },
  ],

  // Add static directories for API docs
  staticDirectories: ['static'],

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
          sidebarPath: './sidebars.js',
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
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        gtag: process.env.GOOGLE_ANALYTICS_ID ? {
          trackingID: process.env.GOOGLE_ANALYTICS_ID,
          anonymizeIP: true,
        } : undefined,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/magiclog-primary-no-subtitle-white-4x.png',
    navbar: {
      title: 'MagicLog',
      logo: {
        alt: 'MagicLog Logo',
        // Use transparent variant for both light and dark modes
        // The transparent logo works on both backgrounds
        src: 'img/magiclog-primary-no-subtitle-transparent-4x.png',
        srcDark: 'img/magiclog-primary-no-subtitle-transparent-4x.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'pathname:///api/',
          position: 'left',
          label: 'API Reference',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://manic.agency/contact',
          label: 'Contact',
          position: 'left',
          target: '_blank',
        },
        {
          to: '/dashboard',
          label: '✨ Magic Dashboard',
          position: 'left',
          className: 'navbar-dashboard-link',
          'aria-label': 'Magic Dashboard - Coming Soon',
        },
        {
          href: 'https://github.com/manicinc/magiclogger',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
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
              label: 'architecture',
              to: '/docs/architecture',
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
              href: 'https://manic.agency/contact',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://manic.agency" target="_blank" rel="noopener noreferrer">Manic.agency</a> - The most colorful logging library for TypeScript & JavaScript. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  // Plugin to alias 'magiclogger' to the local dist build during docs build/serve.
  // Falls back to a local shim when dist isn't built so the site still compiles.
  plugins: [
    // Combined Analytics Plugin (Google Analytics + Microsoft Clarity)
    require('./src/plugins/analyticsPlugin'),
    // TypeDoc plugin for API documentation
    [
      'docusaurus-plugin-typedoc',
      {
        // TypeDoc options
        entryPoints: ['../src/index.ts'],
        entryPointStrategy: 'resolve',
        tsconfig: '../tsconfig.json',
        out: 'api',
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
        watch: process.env.TYPEDOC_WATCH === 'true',
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
        excludeExternals: true,
        readme: 'none',
        exclude: [
          '**/node_modules/**',
          '**/tests/**',
          '**/examples/**',
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/utils/**',
          '**/validation/**',
        ],
      },
    ],
    function magicloggerLocalAliasPlugin() {
      return {
        name: 'magiclogger-local-alias',
        // Provide aliases for both client and server builds
        // Use ESM bundle for client and CJS bundle for server (SSR)
        // so that both compilers can resolve the local package without publishing.
        // Docusaurus will merge this with its own webpack config.
        configureWebpack(_config: unknown, isServer: boolean) {
          const repoRoot = path.resolve(__dirname, '..');
          const distEsmBrowser = path.join(repoRoot, 'dist', 'browser', 'src.cjs');
          const distCjs = path.join(repoRoot, 'dist', 'index.cjs');
          const shimPath = path.join(__dirname, 'src', 'shims', 'magiclogger.ts');
          const targetCandidate = isServer ? distCjs : distEsmBrowser;
          const target = fs.existsSync(targetCandidate)
            ? targetCandidate
            : fs.existsSync(shimPath)
            ? shimPath
            : undefined;
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
