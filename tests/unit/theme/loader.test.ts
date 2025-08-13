/* Theme loader (Node) tests */
describe('theme/loader (node)', () => {
  type FsMock = { existsSync: jest.Mock; readFileSync: jest.Mock };

  function mockFs(exists: boolean, contents?: string, throws?: Error) {
    jest.doMock('fs', () => ({
      existsSync: jest.fn((p: string) => (p.includes('themes.json') ? exists : false)),
      readFileSync: jest.fn(() => {
        if (throws) throw throws; return contents ?? '{}';
      }),
    }), { virtual: true });
  }

  beforeEach(() => { jest.resetModules(); });

  it('loads themes when themes.json exists', async () => {
    mockFs(true, JSON.stringify({ dark: { info: ['cyan'] } }));
    const mod = await import('../../../src/theme/loader');
    const themes = mod.loadThemes();
    expect(themes.dark.info).toEqual(['cyan']);
    expect(mod.getTheme('dark')?.info).toEqual(['cyan']);
    expect(mod.listThemes()).toContain('dark');
  });

  it('warns and returns empty when file missing', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    mockFs(false);
    const mod = await import('../../../src/theme/loader');
    const themes = mod.loadThemes();
    expect(Object.keys(themes).length).toBe(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('handles invalid JSON', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    mockFs(true, '{ invalid');
    const mod = await import('../../../src/theme/loader');
    const themes = mod.loadThemes();
    expect(themes).toEqual({});
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('handles read errors', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    mockFs(true, undefined, new Error('read fail'));
    const mod = await import('../../../src/theme/loader');
    const themes = mod.loadThemes();
    expect(themes).toEqual({});
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('caches results when NODE_ENV not test', async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const fsImpl: FsMock = { existsSync: jest.fn(() => true), readFileSync: jest.fn(() => JSON.stringify({ one: { info: ['red'] } })) } as unknown as FsMock;
    jest.doMock('fs', () => fsImpl, { virtual: true });
    jest.resetModules();
    const mod = await import('../../../src/theme/loader');
    mod.loadThemes();
    mod.loadThemes();
    expect(fsImpl.readFileSync).toHaveBeenCalledTimes(1);
    process.env.NODE_ENV = origEnv;
  });
});
