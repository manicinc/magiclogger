# MagicLogger Performance Benchmark Results

Last updated: 2025-09-14T14:14:48.112Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Note
MagicLogger includes OpenTelemetry/MAGIC schema overhead by default.
Winston/Pino benchmarks don't include OTel plugins (would add ~20-30% overhead).

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 401,031 |    0.002 | 0.001 | 0.003 | 0.009 | 0.388 |
| Winston (Plain)                     | 333,449 |    0.003 | 0.001 | 0.006 | 0.024 | 4.800 |
| MagicLogger (Async + Styles)        | 260,273 |    0.004 | 0.000 | 0.001 | 0.183 | 2.562 |
| Winston (Sync + Styled)             | 240,345 |    0.004 | 0.001 | 0.011 | 0.032 | 1.836 |
| Pino (Pretty)                       | 235,988 |    0.004 | 0.003 | 0.006 | 0.014 | 0.562 |
| Pino (Manual ANSI Async)            | 231,411 |    0.004 | 0.003 | 0.004 | 0.011 | 7.540 |
| MagicLogger (Async)                 | 207,322 |    0.005 | 0.000 | 0.001 | 0.266 | 2.426 |
| MagicLogger (Sync)                  | 206,362 |    0.005 | 0.001 | 0.003 | 0.014 | 4.784 |
| Pino (Manual ANSI)                  |  72,586 |    0.014 | 0.012 | 0.019 | 0.033 | 4.450 |
| MagicLogger (Sync + Styles)         |  55,419 |    0.018 | 0.008 | 0.023 | 0.054 | 7.947 |

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
