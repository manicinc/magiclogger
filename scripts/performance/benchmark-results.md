# MagicLogger Performance Benchmark Results

Last updated: 2025-09-12T04:36:30.286Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino (Manual ANSI Async)            | 191,520 |    0.005 | 0.003 | 0.005 | 0.032 | 8.057 |
| Pino                                | 178,801 |    0.005 | 0.002 | 0.007 | 0.016 | 16.130 |
| Pino (Pretty)                       | 143,539 |    0.006 | 0.005 | 0.008 | 0.024 | 0.367 |
| Winston (Sync + Styled)             | 110,502 |    0.008 | 0.002 | 0.014 | 0.066 | 18.417 |
| Winston (Plain)                     | 108,378 |    0.008 | 0.002 | 0.008 | 0.061 | 18.650 |
| MagicLogger (Async)                 |  85,209 |    0.010 | 0.001 | 0.002 | 0.010 | 25.816 |
| MagicLogger (Async + Styles)        |  77,206 |    0.013 | 0.001 | 0.002 | 0.010 | 61.991 |
| MagicLogger (Sync)                  |  64,144 |    0.015 | 0.001 | 0.005 | 0.016 | 46.695 |
| Pino (Manual ANSI)                  |  44,882 |    0.022 | 0.015 | 0.035 | 0.127 | 10.273 |
| MagicLogger (Sync + Styles)         |  16,868 |    0.058 | 0.021 | 0.075 | 0.356 | 34.894 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
