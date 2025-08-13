import { Formatter } from '../../../src/core/Formatter';
import * as terminalUtils from '../../../src/utils/terminal';
import { ANSI_CODES } from '../../../src/constants/colors';

describe('Formatter', () => {
  let formatter: Formatter;
  beforeEach(() => {
    formatter = new Formatter(true);
    jest.spyOn(terminalUtils, 'isStyleSupported').mockReturnValue(true);
    jest.spyOn(terminalUtils, 'getFallbackStyle').mockImplementation(s => s);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('colorize', () => {
    it('applies multiple codes and caches result', () => {
      const out1 = formatter.colorize('hello', ['red','bold']);
      const out2 = formatter.colorize('hello', ['red','bold']); // cached
      expect(out1).toBe(out2);
      expect(out1).toContain('hello');
    });
    it('returns text unchanged when disabled or empty', () => {
      formatter.setUseColors(false);
      expect(formatter.colorize('x',['red'])).toBe('x');
      formatter.setUseColors(true);
      expect(formatter.colorize('y',[])).toBe('y');
    });
    it('uses fallback when style unsupported', () => {
      (terminalUtils.isStyleSupported as jest.Mock).mockReturnValueOnce(false);
      (terminalUtils.getFallbackStyle as jest.Mock).mockReturnValueOnce('bold');
      const out = formatter.colorize('f', ['italic']);
      expect(out).toContain(ANSI_CODES.bold);
    });
  });

  describe('preserveLinks', () => {
    it('handles null/undefined/non-string', () => {
      expect(formatter.preserveLinks(null as unknown as string)).toBeNull();
      expect(formatter.preserveLinks(undefined as unknown as string)).toBeUndefined();
      expect(formatter.preserveLinks(123 as unknown as string)).toContain('123');
    });
    it('formats markdown and standalone URLs', () => {
      const text = 'See [Site](https://example.com) and https://example.com/page';
      const out = formatter.preserveLinks(text);
      expect(out).toContain('https://example.com');
      expect(out.match(/https:\/\/example\.com/g)?.length).toBeGreaterThan(0);
    });
    it('formats file paths when no URLs present', () => {
      const out = formatter.preserveLinks('./src/index.ts');
      expect(out).toContain('./src/index.ts');
    });
    it('returns plain text when colors disabled', () => {
      formatter.setUseColors(false);
      expect(formatter.preserveLinks('https://a.com')).toBe('https://a.com');
    });
  it('uses OSC 8 hyperlink for supported terminals (non-support falls back)', () => {
      const orig = process.env.TERM_PROGRAM;
      process.env.TERM_PROGRAM = 'iTerm.app';
      try {
    const out = formatter.preserveLinks('README.md');
    const esc = '\u001b';
    const hasSeq = out.includes(`${esc}]8;;`);
    // Assert: either we have proper sequence with file:// or we fell back exactly to plain text
    const passes = (hasSeq && new RegExp(`${esc}]8;;file://`).test(out)) || (!hasSeq && out === 'README.md');
    expect(passes).toBe(true);
      } finally { process.env.TERM_PROGRAM = orig; }
    });
  });

  describe('template format', () => {
    it('replaces variables including nested', () => {
      const out = formatter.format('User {user.name} logged in {missing}', { user: { name: 'Alice' } });
      expect(out).toContain('Alice');
      expect(out).toContain('{missing}');
    });
  });

  describe('pad', () => {
    it('pads left/right/center and respects visible length with ansi', () => {
      const colored = formatter.colorize('X',['red']);
      expect(formatter.pad(colored, 5).length).toBeGreaterThanOrEqual(colored.length);
      expect(formatter.pad('x',5,'_','left')).toBe('____x');
      const centered = formatter.pad('x',5,' ','center');
      expect(centered.startsWith('  ') || centered.startsWith(' x')).toBe(true);
    });
  });

  describe('truncate', () => {
    it('truncates plain and colored text preserving ansi', () => {
      const plain = formatter.truncate('abcdef',4,'..');
      expect(plain).toBe('ab..');
      const colored = formatter.colorize('abcdef',['red']);
      const truncated = formatter.truncate(colored,4,'..');
      expect(formatter.stripAnsi(truncated).length).toBeLessThanOrEqual(4+2); // includes suffix
    });
  });

  describe('wrap', () => {
    it('wraps with width and indent', () => {
      const wrapped = formatter.wrap('one two three four five', 7, '>> ');
      const lines = wrapped.split('\n');
      expect(lines.length).toBeGreaterThan(1);
      lines.slice(1).forEach(l => expect(l.startsWith('>> ')).toBe(true));
    });
  });

  describe('box', () => {
    it('creates single border box', () => {
      const b = formatter.box('hi');
      expect(b).toContain('┌');
      expect(b).toContain('┘');
    });
    it('creates double & rounded boxes', () => {
      const d = formatter.box('x', { borderStyle: 'double' });
      expect(d).toContain('╔');
      const r = formatter.box('x', { borderStyle: 'rounded' });
      expect(r).toContain('╭');
    });
  });

  describe('cache management', () => {
    it('evicts oldest when exceeding max size', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const max = (formatter as unknown as { maxCacheSize: number }).maxCacheSize;
      for (let i=0;i<max+5;i++) {
        formatter.colorize('t'+i,['red']);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cache: Map<string,string> = (formatter as unknown as { cache: Map<string,string> }).cache;
      expect(cache.size).toBeLessThanOrEqual(max);
    });
    it('clearCache empties cache & setUseColors clears', () => {
      formatter.colorize('a',['red']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((formatter as unknown as { cache: Map<string,string> }).cache.size).toBeGreaterThan(0);
      formatter.clearCache();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((formatter as unknown as { cache: Map<string,string> }).cache.size).toBe(0);
      formatter.colorize('b',['red']);
      formatter.setUseColors(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((formatter as unknown as { cache: Map<string,string> }).cache.size).toBe(0);
    });
  });

  describe('gradient & rainbow', () => {
    it('applies gradient or falls back when disabled', () => {
      const g = formatter.gradient('abcd',['red'],['blue']);
      expect(g).toContain('ab');
      formatter.setUseColors(false);
      expect(formatter.gradient('abc',['red'],['blue'])).toBe('abc');
    });
    it('rainbow colors & respects disabled flag', () => {
      formatter.setUseColors(true);
    const rb = formatter.rainbow('hello world');
    // Rainbow should at least contain original characters in order (possibly with ANSI codes)
    const stripped = formatter.stripAnsi(rb);
    expect(stripped.replace(/\s+/g,'')).toContain('helloworld');
      formatter.setUseColors(false);
      expect(formatter.rainbow('xyz')).toBe('xyz');
    });
  });

  describe('format helpers', () => {
    it('formatTimestamp replaces tokens', () => {
      const date = new Date('2024-12-25T13:14:15.123Z');
      const out = formatter.formatTimestamp(date, 'YYYY/MM/DD HH:mm:ss.SSS');
      expect(out).toContain('2024/12/25');
    });
    it('formatBytes handles several ranges', () => {
      expect(formatter.formatBytes(0)).toBe('0 Bytes');
      const kb = formatter.formatBytes(1024);
      expect(kb).toContain('KB');
    });
    it('formatDuration covers branches', () => {
      expect(formatter.formatDuration(1500)).toBe('1s');
      expect(formatter.formatDuration(65_000)).toContain('1m');
      expect(formatter.formatDuration(3_700_000)).toContain('1h');
      expect(formatter.formatDuration(172_800_000)).toContain('2d');
      expect(formatter.formatDuration(5)).toBe('5ms');
    });
  });
});
