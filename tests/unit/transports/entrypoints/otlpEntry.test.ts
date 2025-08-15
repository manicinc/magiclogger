describe('otlp transport entrypoint', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('registers factory, exports helpers, and enforces required options', async () => {
    // Import entrypoint (registration happens on import)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const otlpMod = require('../../../../src/transports/otlp');
    const { TransportRegistry } = await import('../../../../src/transports');

    // Exported symbols
    expect(otlpMod.OTLPTransport).toBeDefined();
    expect(typeof otlpMod.createOTLPTransport).toBe('function');

    // Registry integration
    expect(TransportRegistry.has('otlp')).toBe(true);

    type MinimalConfig = { type: string; name?: string; serviceName?: string } & Record<
      string,
      unknown
    >;
    type FactoryFn = (cfg: MinimalConfig) => { name: string };

    const factory = TransportRegistry.get('otlp') as FactoryFn | undefined;
    expect(factory).toBeDefined();
    if (!factory) return;

    // Missing serviceName should throw
    expect(() => factory({ type: 'otlp', name: 'missing' })).toThrow(
      'OTLPTransport requires serviceName'
    );

    // Valid creation via factory
    const t1 = factory({ type: 'otlp', serviceName: 'svc-a' });
    expect(t1.name).toBe('otlp');

    // Helper should set name if provided
    const t2 = otlpMod.createOTLPTransport('svc-b', {
      name: 'custom-otlp',
      endpoint: 'http://localhost:4318',
    });
    expect(t2.name).toBe('custom-otlp');
  });
});
