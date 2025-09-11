# MagicLogger Performance Benchmark Results

Last updated: 2025-09-11T13:21:25.367Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 443,133 |    0.002 | 0.001 | 0.005 | 0.009 | 0.540 |
| Pino (Manual ANSI Async)            | 316,090 |    0.003 | 0.002 | 0.004 | 0.007 | 7.309 |
| Winston (Sync + Styled)             | 287,066 |    0.003 | 0.001 | 0.008 | 0.029 | 8.255 |
| Pino (Pretty)                       | 231,927 |    0.004 | 0.004 | 0.004 | 0.012 | 0.101 |
| Winston (Plain)                     | 212,986 |    0.004 | 0.002 | 0.007 | 0.031 | 12.794 |
| MagicLogger (Async)                 | 196,760 |    0.005 | 0.001 | 0.002 | 0.010 | 5.224 |
| MagicLogger (Async + Styles)        | 169,096 |    0.006 | 0.001 | 0.001 | 0.004 | 16.609 |
| MagicLogger (Sync)                  | 135,311 |    0.007 | 0.001 | 0.005 | 0.010 | 7.090 |
| Pino (Manual ANSI)                  |  85,714 |    0.011 | 0.008 | 0.020 | 0.048 | 2.259 |
| MagicLogger (Sync + Styles)         |  51,415 |    0.019 | 0.008 | 0.026 | 0.068 | 11.651 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
