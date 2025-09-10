# MagicLogger Performance Benchmark Results

Last updated: 2025-09-10T23:31:24.438Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Winston (Sync + Styled)             | 236,182 |    0.004 | 0.002 | 0.010 | 0.031 | 8.124 |
| Winston (Plain)                     | 220,298 |    0.004 | 0.002 | 0.007 | 0.035 | 8.229 |
| Pino                                | 203,354 |    0.005 | 0.002 | 0.006 | 0.016 | 22.240 |
| MagicLogger (Async + Styles)        | 203,303 |    0.005 | 0.001 | 0.002 | 0.005 | 15.709 |
| Pino (Pretty)                       | 192,491 |    0.005 | 0.004 | 0.005 | 0.011 | 0.586 |
| MagicLogger (Async)                 | 182,454 |    0.005 | 0.001 | 0.002 | 0.013 | 15.360 |
| Pino (Manual ANSI Async)            | 182,359 |    0.005 | 0.003 | 0.005 | 0.016 | 10.082 |
| MagicLogger (Sync)                  | 116,814 |    0.008 | 0.001 | 0.005 | 0.011 | 9.698 |
| Pino (Manual ANSI)                  |  54,918 |    0.018 | 0.013 | 0.028 | 0.092 | 6.675 |
| MagicLogger (Sync + Styles)         |  30,026 |    0.033 | 0.015 | 0.036 | 0.137 | 23.094 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
