describe('http transport entrypoint', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('registers factory and supports createHTTPTransport helper + error branch', async () => {
    // Import entrypoint (registration happens on import)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const httpMod = require('../../../../src/transports/http');
    const { TransportRegistry } = await import('../../../../src/transports');

    expect(TransportRegistry.has('http')).toBe(true);

    const t1 = httpMod.createHTTPTransport('https://api.example.com/ingest');
    // Implementation uses hostname directly (dots preserved)
    expect(t1.name).toBe('http-api.example.com');

    type MinimalConfig = { type: string; name?: string; url?: string };
    type FactoryFn = (cfg: MinimalConfig) => { name: string };
    const factory = TransportRegistry.get('http') as FactoryFn | undefined;
    expect(factory).toBeDefined();
    if (!factory) return;

    expect(() => factory({ type: 'http', name: 'x' })).toThrow('HTTPTransport requires url option');

    const t2 = factory({ type: 'http', name: 'customHttp', url: 'https://logs.example.org' });
    expect(t2.name).toBe('customHttp');
  });
});
