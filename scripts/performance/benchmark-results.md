# MagicLogger Performance Benchmark Results

Last updated: 2025-09-11T03:27:30.663Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 447,549 |    0.002 | 0.001 | 0.004 | 0.009 | 2.778 |
| Winston (Sync + Styled)             | 440,654 |    0.002 | 0.001 | 0.009 | 0.022 | 1.106 |
| Pino (Pretty)                       | 381,665 |    0.003 | 0.002 | 0.003 | 0.006 | 0.126 |
| Winston (Plain)                     | 377,443 |    0.002 | 0.001 | 0.005 | 0.020 | 6.159 |
| MagicLogger (Async)                 | 335,722 |    0.003 | 0.001 | 0.001 | 0.004 | 6.104 |
| MagicLogger (Async + Styles)        | 269,124 |    0.004 | 0.001 | 0.001 | 0.003 | 14.924 |
| Pino (Manual ANSI Async)            | 259,877 |    0.004 | 0.003 | 0.004 | 0.016 | 5.857 |
| MagicLogger (Sync)                  | 155,381 |    0.006 | 0.001 | 0.003 | 0.008 | 7.262 |
| Pino (Manual ANSI)                  | 100,590 |    0.010 | 0.007 | 0.015 | 0.037 | 10.489 |
| MagicLogger (Sync + Styles)         |  40,895 |    0.024 | 0.009 | 0.026 | 0.098 | 27.379 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
