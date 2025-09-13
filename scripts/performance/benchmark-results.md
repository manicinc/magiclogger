# MagicLogger Performance Benchmark Results

Last updated: 2025-09-13T22:55:42.675Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 222,911 |    0.004 | 0.002 | 0.006 | 0.015 | 19.905 |
| Winston (Plain)                     | 167,742 |    0.005 | 0.002 | 0.007 | 0.049 | 5.478 |
| Pino (Manual ANSI Async)            | 146,765 |    0.007 | 0.003 | 0.005 | 0.033 | 11.121 |
| Pino (Pretty)                       | 138,206 |    0.007 | 0.004 | 0.007 | 0.053 | 1.328 |
| MagicLogger (Sync)                  | 125,132 |    0.008 | 0.001 | 0.005 | 0.011 | 8.379 |
| MagicLogger (Async)                 |  96,050 |    0.010 | 0.006 | 0.017 | 0.079 | 2.761 |
| Winston (Sync + Styled)             |  83,714 |    0.010 | 0.002 | 0.020 | 0.063 | 34.135 |
| MagicLogger (Async + Styles)        |  56,000 |    0.018 | 0.007 | 0.035 | 0.153 | 29.062 |
| Pino (Manual ANSI)                  |  27,060 |    0.036 | 0.018 | 0.072 | 0.303 | 7.172 |
| MagicLogger (Sync + Styles)         |  13,910 |    0.071 | 0.020 | 0.076 | 0.361 | 88.291 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
