# MagicLogger Performance Benchmark Results

Last updated: 2025-09-13T15:07:56.526Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 288,505 |    0.003 | 0.002 | 0.005 | 0.013 | 1.691 |
| Winston (Plain)                     | 176,142 |    0.005 | 0.002 | 0.008 | 0.050 | 9.128 |
| Pino (Pretty)                       | 147,489 |    0.006 | 0.004 | 0.006 | 0.075 | 0.776 |
| Winston (Sync + Styled)             | 137,708 |    0.007 | 0.001 | 0.012 | 0.048 | 11.944 |
| MagicLogger (Sync)                  | 116,286 |    0.008 | 0.001 | 0.005 | 0.014 | 11.550 |
| Pino (Manual ANSI Async)            |  76,136 |    0.013 | 0.004 | 0.006 | 0.033 | 48.847 |
| MagicLogger (Async)                 |  68,732 |    0.014 | 0.009 | 0.026 | 0.076 | 3.720 |
| MagicLogger (Sync + Styles)         |  31,181 |    0.032 | 0.015 | 0.038 | 0.144 | 16.580 |
| MagicLogger (Async + Styles)        |  22,979 |    0.043 | 0.031 | 0.093 | 0.261 | 8.021 |
| Pino (Manual ANSI)                  |  20,404 |    0.048 | 0.017 | 0.138 | 0.507 | 10.484 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
