# MagicLogger Performance Benchmark Results

Last updated: 2025-09-15T22:17:37.567Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 560,285 |    0.002 | 0.001 | 0.003 | 0.004 | 4.808 |
| Winston (Sync + Styled)             | 446,027 |    0.002 | 0.001 | 0.002 | 0.035 | 4.662 |
| Winston (Plain)                     | 306,954 |    0.003 | 0.001 | 0.003 | 0.049 | 0.633 |
| Pino (Pretty)                       | 274,431 |    0.004 | 0.003 | 0.004 | 0.008 | 0.097 |
| MagicLogger (Sync)                  | 269,587 |    0.003 | 0.001 | 0.003 | 0.008 | 4.547 |
| MagicLogger (Async)                 | 165,694 |    0.006 | 0.003 | 0.007 | 0.032 | 5.305 |
| MagicLogger (Async + Styles)        | 116,404 |    0.008 | 0.005 | 0.010 | 0.034 | 8.074 |
| Bunyan (Styled)                     |  99,468 |    0.010 | 0.007 | 0.017 | 0.029 | 6.036 |
| Bunyan                              |  84,515 |    0.012 | 0.008 | 0.020 | 0.045 | 8.435 |
| MagicLogger (Sync + Styles)         |  80,502 |    0.012 | 0.005 | 0.016 | 0.031 | 8.340 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
