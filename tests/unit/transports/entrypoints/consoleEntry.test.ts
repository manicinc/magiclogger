import type { TransportConfig } from '../../../../src/types/transport';

describe('console transport entrypoint', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('registers and creates console transport with default and custom names', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const consoleMod = require('../../../../src/transports/console');
    const { TransportRegistry } = await import('../../../../src/transports');
    expect(TransportRegistry.has('console')).toBe(true);

    const t1 = consoleMod.createConsoleTransport();
    expect(t1.name).toBe('console');

    const factory = TransportRegistry.get('console');
    expect(factory).toBeDefined();
    if (!factory) return;

    const cfg: TransportConfig = { type: 'console', name: 'customConsole' };
    const t2 = factory(cfg);
    expect(t2.name).toBe('customConsole');
  });
});
