# MagicLogger Performance Benchmark Results

Last updated: 2025-09-14T22:58:09.224Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino (Pretty)                       | 488,472 |    0.002 | 0.002 | 0.002 | 0.003 | 0.058 |
| Winston (Plain)                     | 331,389 |    0.003 | 0.001 | 0.006 | 0.032 | 0.880 |
| Winston (Sync + Styled)             | 285,554 |    0.003 | 0.002 | 0.007 | 0.027 | 1.869 |
| Pino (Manual ANSI Async)            | 257,027 |    0.004 | 0.003 | 0.004 | 0.012 | 6.163 |
| Pino                                | 234,556 |    0.004 | 0.002 | 0.005 | 0.009 | 27.495 |
| MagicLogger (Sync)                  | 166,303 |    0.006 | 0.001 | 0.003 | 0.007 | 7.137 |
| MagicLogger (Async)                 | 144,379 |    0.007 | 0.000 | 0.002 | 0.320 | 5.104 |
| MagicLogger (Async + Styles)        | 114,633 |    0.009 | 0.003 | 0.007 | 0.231 | 4.774 |
| MagicLogger (Sync + Styles)         | 104,299 |    0.009 | 0.003 | 0.010 | 0.020 | 16.140 |
| Pino (Manual ANSI)                  |  68,999 |    0.014 | 0.009 | 0.025 | 0.100 | 4.693 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
