import { PATH_REGEX, IS_PATH_REGEX, CODE_FILE_EXTENSIONS } from '../../../src/constants';

describe('Path Constants and Regular Expressions', () => {
  it('CODE_FILE_EXTENSIONS contains common file extensions', () => {
    expect(CODE_FILE_EXTENSIONS).toContain('js');
    expect(CODE_FILE_EXTENSIONS).toContain('ts');
    expect(CODE_FILE_EXTENSIONS).toContain('md');
    expect(CODE_FILE_EXTENSIONS).toContain('log');
  });

  it('PATH_REGEX correctly matches different path formats', () => {
    const testCases = [
      { input: 'https://example.com/file.js', shouldMatch: true },
      { input: 'file:///var/log/app.log', shouldMatch: true },
      { input: '/usr/local/bin/script.sh', shouldMatch: true },
      { input: './relative/path/file.ts', shouldMatch: true },
      { input: 'C:\\Windows\\System32\\file.log', shouldMatch: true },
      { input: 'Just some text', shouldMatch: false },
    ];

    testCases.forEach(({ input, shouldMatch }) => {
      const regex = new RegExp(PATH_REGEX);
      expect(regex.test(input)).toBe(shouldMatch);
    });
  });

  it('IS_PATH_REGEX correctly identifies path-like strings', () => {
    const testCases = [
      { input: 'https://example.com', shouldMatch: true },
      { input: 'file:///var/log/app.log', shouldMatch: true },
      { input: '/usr/local/bin', shouldMatch: true },
      { input: './relative/path', shouldMatch: true },
      { input: 'C:\\Windows\\System32', shouldMatch: true },
      { input: 'script.js', shouldMatch: true },
      { input: 'document.md', shouldMatch: true },
      { input: 'Just some text', shouldMatch: false },
    ];

    testCases.forEach(({ input, shouldMatch }) => {
      expect(IS_PATH_REGEX.test(input)).toBe(shouldMatch);
    });
  });
});
