# MagicLogger Performance Benchmark Results

Last updated: 2025-09-13T04:47:24.474Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Winston (Plain)                     | 253,133 |    0.004 | 0.002 | 0.006 | 0.027 | 6.031 |
| Pino                                | 248,414 |    0.004 | 0.002 | 0.005 | 0.014 | 16.019 |
| Pino (Manual ANSI Async)            | 228,100 |    0.004 | 0.003 | 0.004 | 0.021 | 6.704 |
| MagicLogger (Async)                 | 203,385 |    0.005 | 0.001 | 0.003 | 0.116 | 3.729 |
| Winston (Sync + Styled)             | 196,214 |    0.005 | 0.001 | 0.013 | 0.042 | 9.275 |
| Pino (Pretty)                       | 186,048 |    0.005 | 0.004 | 0.006 | 0.014 | 0.507 |
| MagicLogger (Sync)                  | 176,452 |    0.005 | 0.001 | 0.002 | 0.005 | 7.562 |
| Pino (Manual ANSI)                  |  71,232 |    0.014 | 0.009 | 0.024 | 0.081 | 6.426 |
| MagicLogger (Async + Styles)        |  31,138 |    0.032 | 0.019 | 0.060 | 0.343 | 11.371 |
| MagicLogger (Sync + Styles)         |  29,005 |    0.034 | 0.016 | 0.041 | 0.160 | 20.115 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
