# MagicLogger Performance Benchmark Results

Last updated: 2025-09-14T16:06:22.982Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino (Manual ANSI Async)            | 242,559 |    0.004 | 0.002 | 0.005 | 0.013 | 6.651 |
| Pino                                | 217,470 |    0.004 | 0.002 | 0.007 | 0.013 | 21.118 |
| Pino (Pretty)                       | 146,839 |    0.006 | 0.004 | 0.006 | 0.084 | 0.403 |
| Winston (Sync + Styled)             | 131,493 |    0.007 | 0.002 | 0.017 | 0.054 | 14.956 |
| Winston (Plain)                     | 115,032 |    0.008 | 0.002 | 0.013 | 0.065 | 11.636 |
| MagicLogger (Sync)                  |  95,395 |    0.010 | 0.001 | 0.005 | 0.014 | 9.829 |
| Pino (Manual ANSI)                  |  68,826 |    0.014 | 0.010 | 0.025 | 0.063 | 10.135 |
| MagicLogger (Async)                 |  37,141 |    0.026 | 0.016 | 0.048 | 0.184 | 13.798 |
| MagicLogger (Async + Styles)        |  25,034 |    0.040 | 0.030 | 0.072 | 0.192 | 6.663 |
| MagicLogger (Sync + Styles)         |  23,972 |    0.041 | 0.018 | 0.048 | 0.182 | 28.653 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
