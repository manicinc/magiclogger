// src/constants/paths.ts

/**
 * File extensions that are commonly used in code projects
 */
export const CODE_FILE_EXTENSIONS_ARRAY = [
  'js',
  'ts',
  'jsx',
  'tsx',
  'mjs',
  'cjs', // JavaScript/TypeScript
  'html',
  'css',
  'scss',
  'sass', // Web
  'json',
  'md',
  'txt',
  'log', // Common data/docs
  'sh',
  'yml',
  'yaml',
  'ini',
  'toml', // Config
  'svg',
  'png',
  'jpg',
  'jpeg', // Images
];

/**
 * Regular expression pattern to match file extensions that are commonly used in code projects
 */
export const CODE_FILE_EXTENSIONS = CODE_FILE_EXTENSIONS_ARRAY.join('|');

/**
 * Regular expression elements for matching different types of paths
 */
export const PATH_REGEX_ELEMENTS = [
  '((?:https?|ftp):\\/\\/[^\\s]+)', // URLs (HTTP, HTTPS, FTP)
  '(file:\\/\\/[^\\s]+)', // File protocol
  `(\\/[^\\s]+\\.(${CODE_FILE_EXTENSIONS}))`, // Unix absolute
  `(\\.\\/[^\\s]+\\.(${CODE_FILE_EXTENSIONS}))`, // relative
  `([a-zA-Z]:\\\\[^\\s]+\\.(${CODE_FILE_EXTENSIONS}))`, // Windows
];

/**
 * Regular expression for matching paths in text
 * Supports URLs, file paths (Unix & Windows), and relative paths
 */
export const PATH_REGEX = new RegExp(PATH_REGEX_ELEMENTS.join('|'), 'gi');

/**
 * Regular expression to detect if a string is a path or URL
 * Used for checking individual strings
 */
export const IS_PATH_REGEX = new RegExp(
  `^((?:https?|ftp):\\/\\/|file:\\/\\/|www\\.|\\.\\/|\\.\\.\\/|\\/|[a-zA-Z]:\\\\).+$|\\.(${CODE_FILE_EXTENSIONS})$`,
  'i'
);
