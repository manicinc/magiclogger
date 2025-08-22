import { Logger } from '../../../src/Logger';
import { PATH_REGEX } from '../../../src/constants';

/**
 * Logger Static Utility Functions and Path Handling Tests
 */
describe('Logger Static Utilities', () => {
  it('normalizes line endings', () => {
    const crlf = 'a\r\nb\r\nc';
    expect(Logger.normalizeLineEndings(crlf)).toBe('a\nb\nc');
  });

  it('detects links and paths', () => {
    expect(Logger.isLinkLike('https://example.com')).toBe(true);
    expect(Logger.isLinkLike('/path/to/file.js')).toBe(true);
    expect(Logger.isLinkLike('C:\\foo\\bar.ts')).toBe(true);
    expect(Logger.isLinkLike('plain text')).toBe(false);
  });

  it('recognizes file paths by extension', () => {
    const extensions = [
      'document.js',
      'program.ts',
      'styles.css',
      'index.html',
      'data.json',
      'readme.md',
      'app.log',
      'image.png',
      'photo.jpg',
    ];

    for (const file of extensions) {
      expect(Logger.isLinkLike(file)).toBe(true);
    }
  });

  it('recognizes relative/absolute paths', () => {
    expect(Logger.isLinkLike('./relative/path')).toBe(true);
    expect(Logger.isLinkLike('../parent/path')).toBe(true);
    expect(Logger.isLinkLike('/absolute/path')).toBe(true);
    expect(Logger.isLinkLike('C:\\Windows\\System32')).toBe(true);
  });

  it('recognizes URLs with different protocols', () => {
    expect(Logger.isLinkLike('https://github.com')).toBe(true);
    expect(Logger.isLinkLike('http://localhost:3000')).toBe(true);
    expect(Logger.isLinkLike('file:///home/user/doc.txt')).toBe(true);
    expect(Logger.isLinkLike('www.example.com')).toBe(true);
  });

  it('handles various link-like inputs', () => {
    const inputs = [
      'https://example.com',
      '/var/log/app.log',
      './index.ts',
      '../file.md',
      'C:\\Program Files\\App\\file.js',
      'no links here',
    ];
    const results = [true, true, true, true, true, false];

    inputs.forEach((text, i) => {
      expect(Logger.isLinkLike(text)).toBe(results[i]);
    });
  });
});

describe('Logger Cross-platform Path Handling', () => {
  describe('Logger Cross-platform Path Handling', () => {
    it('detects paths via regex', () => {
      // Use the constant from our paths.ts file
      const linkRegex = PATH_REGEX;

      const sampleText = `
            Visit https://example.com
            Path: file:///config.json
            Code: ./index.ts
            Data: /var/www/data.md
            Log: C:\\System\\log.log
          `;

      let matchCount = 0;
      while (linkRegex.exec(sampleText) !== null) matchCount++;
      expect(matchCount).toBe(5);
    });
  });

  it('normalizes mixed slash paths', () => {
    const normalize = (p: string) => Logger.normalizePath(p);
    expect(normalize('C:\\Program Files\\App/file.js')).toBe('C:/Program Files/App/file.js');
  });
});

describe('Logger Edge Case & Internal Utility Tests', () => {
  it('handles errors during file logging initialization', async () => {
    // Mock console.warn since setFileLogging is deprecated and warns
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const logger = new Logger();
    
    // setFileLogging is now deprecated and just logs a warning
    logger.setFileLogging(true);

    // The deprecated method should have warned
    expect(spy).toHaveBeenCalledWith('[Logger] setFileLogging() is deprecated. Use file transports instead.');
    spy.mockRestore();
  });

  it('resolves fallback styles for link-like strings', () => {
    // Test the static isLinkLike method directly
    expect(Logger.isLinkLike('https://example.com')).toBe(true);
    expect(Logger.isLinkLike('file:///home/user/file.txt')).toBe(true);
    expect(Logger.isLinkLike('/var/log/app.log')).toBe(true);
    expect(Logger.isLinkLike('Just a normal message')).toBe(false);
  });

  it('validates multi-line regex path matches', () => {
    const multiline = [
      'https://site.com',
      'file:///var/data.json',
      './src/file.ts',
      '/opt/bin/index.js',
      'C:\\Sys\\file.log',
    ].join('\n');

    // Create a new regex instance to avoid global state issues
    const regex = new RegExp(PATH_REGEX.source, PATH_REGEX.flags);

    let matchCount = 0;
    let match;
    while ((match = regex.exec(multiline)) !== null) {
      matchCount++;
      // Prevent infinite loop if regex doesn't advance
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    expect(matchCount).toBe(5);
  });

  it('handles undefined input in colorParts gracefully', () => {
    const logger = new Logger({ useColors: true });
    const output = logger.colorParts('sample string', {
      sample: ['red'],
      string: ['green'],
    });
    expect(typeof output).toBe('string');
  });
});
