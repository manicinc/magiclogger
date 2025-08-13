import { fs, path, os, BROWSER_POLYFILLS } from '../../../src/utils/browser-polyfills';

describe('browser-polyfills', () => {
  it('exports aggregated object', () => {
    expect(BROWSER_POLYFILLS.fs).toBe(fs);
    expect(BROWSER_POLYFILLS.path).toBe(path);
    expect(BROWSER_POLYFILLS.os).toBe(os);
  });
  it('provides expected fs shape', () => {
    expect(typeof fs.readFileSync).toBe('function');
    expect(typeof fs.existsSync).toBe('function');
  });
  it('path join behaves predictably', () => {
    const joined = path.join('a', 'b', 'c');
    expect(joined).toBe('a/b/c');
  });
  it('os platform returns browser', () => {
    expect(os.platform()).toBe('browser');
  });
});
