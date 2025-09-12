# MagicLogger Performance Benchmark Results

Last updated: 2025-09-12T08:01:22.769Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| MagicLogger (Async)                 | 184,196 |    0.005 | 0.001 | 0.002 | 0.007 | 9.897 |
| MagicLogger (Async + Styles)        | 163,853 |    0.006 | 0.001 | 0.002 | 0.008 | 13.563 |
| Winston (Plain)                     | 154,444 |    0.006 | 0.002 | 0.010 | 0.039 | 13.017 |
| Pino                                | 145,998 |    0.006 | 0.002 | 0.007 | 0.020 | 22.968 |
| Pino (Manual ANSI Async)            | 131,021 |    0.007 | 0.004 | 0.006 | 0.026 | 12.577 |
| Pino (Pretty)                       | 122,875 |    0.008 | 0.004 | 0.005 | 0.022 | 3.528 |
| MagicLogger (Sync)                  | 115,250 |    0.008 | 0.001 | 0.005 | 0.011 | 11.390 |
| Winston (Sync + Styled)             | 101,924 |    0.009 | 0.002 | 0.026 | 0.071 | 24.010 |
| Pino (Manual ANSI)                  |  39,516 |    0.025 | 0.016 | 0.043 | 0.159 | 11.547 |
| MagicLogger (Sync + Styles)         |  17,087 |    0.058 | 0.019 | 0.057 | 0.304 | 105.531 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
