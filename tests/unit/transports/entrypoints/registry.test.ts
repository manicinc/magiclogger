describe('TransportRegistry core', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('registers, queries, lists and clears factories', async () => {
    const { TransportRegistry } = await import('../../../../src/transports');
    TransportRegistry.clear();
    expect(TransportRegistry.getTypes()).toHaveLength(0);
    type MinimalConfig = import('../../../../src/types/transport').TransportConfig;
    TransportRegistry.register('x', (_cfg: MinimalConfig) => ({
      name: 'x',
      enabled: true,
      log: () => void 0,
      close: () => void 0,
      shouldLog: () => true,
    }));
    expect(TransportRegistry.has('x')).toBe(true);
    const fac = TransportRegistry.get('x');
    expect(fac && fac({ type: 'console' } as MinimalConfig).name).toBe('x');
    expect(TransportRegistry.getTypes()).toContain('x');
    TransportRegistry.clear();
    expect(TransportRegistry.has('x')).toBe(false);
  });
});
