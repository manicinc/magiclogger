# MagicLogger Performance Benchmark Results

Last updated: 2025-09-14T14:30:37.873Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Note
MagicLogger includes OpenTelemetry/MAGIC schema overhead by default.
Winston/Pino benchmarks don't include OTel plugins (would add ~20-30% overhead).

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Winston (Sync + Styled)             | 283,313 |    0.003 | 0.001 | 0.009 | 0.035 | 4.893 |
| Pino                                | 252,124 |    0.004 | 0.002 | 0.005 | 0.017 | 5.322 |
| Pino (Manual ANSI Async)            | 243,727 |    0.004 | 0.003 | 0.004 | 0.010 | 8.659 |
| Winston (Plain)                     | 238,849 |    0.004 | 0.002 | 0.007 | 0.033 | 5.667 |
| MagicLogger (Async + Styles)        | 236,940 |    0.004 | 0.000 | 0.001 | 0.178 | 3.920 |
| MagicLogger (Sync)                  | 171,419 |    0.006 | 0.001 | 0.003 | 0.006 | 7.505 |
| MagicLogger (Async)                 | 161,925 |    0.006 | 0.000 | 0.001 | 0.290 | 3.277 |
| Pino (Pretty)                       | 151,861 |    0.006 | 0.003 | 0.006 | 0.017 | 3.291 |
| Pino (Manual ANSI)                  |  77,037 |    0.013 | 0.011 | 0.020 | 0.049 | 1.742 |
| MagicLogger (Sync + Styles)         |  47,408 |    0.021 | 0.009 | 0.026 | 0.067 | 23.090 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4

## Notes
- All loggers process the same structured data payload
- File I/O uses real filesystem writes (not memory)
- Results include both styled and unstyled output
- Benchmarks measure actual main thread blocking time
