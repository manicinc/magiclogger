describe('file transport entrypoint', () => {
  beforeEach(() => { jest.resetModules(); });

  it('registers factory and supports createFileTransport helper + error branch', async () => {
    // Import entrypoint (may already be registered from previous tests; that's fine)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fileMod = require('../../../../src/transports/file');
    const { TransportRegistry } = await import('../../../../src/transports');

    expect(TransportRegistry.has('file')).toBe(true);

    // createFileTransport helper sanitizes name
    const t1 = fileMod.createFileTransport('logs/app.log');
    expect(t1.name).toMatch(/^file-logs-app-log$/);

    type MinimalConfig = { type: string; name?: string; filepath?: string };
    type FactoryFn = (cfg: MinimalConfig) => { name: string };
    const factory = TransportRegistry.get('file') as FactoryFn | undefined;
    expect(factory).toBeDefined();
    if (!factory) return; // abort further checks

    // Error branch: missing filepath
    expect(() => factory({ type: 'file', name: 'x' })).toThrow('FileTransport requires filepath option');

    // Success branch: custom name preserved
    const t2 = factory({ type: 'file', name: 'customFile', filepath: './out/app.log' });
    expect(t2.name).toBe('customFile');
  });
});
