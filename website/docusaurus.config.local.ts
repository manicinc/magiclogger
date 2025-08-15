import type { Config } from '@docusaurus/types';
import baseConfig from './docusaurus.config';

// Local-only config to serve docs at root (http://localhost:3000/)
// without changing the production GitHub Pages baseUrl.
const config: Config = {
  ...baseConfig,
  url: 'http://localhost:3000',
  baseUrl: '/',
};

export default config;
