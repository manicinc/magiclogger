# MagicLogger Performance Benchmark Results

Last updated: 2025-09-14T12:18:11.641Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Note
MagicLogger includes OpenTelemetry/MAGIC schema overhead by default.
Winston/Pino benchmarks don't include OTel plugins (would add ~20-30% overhead).

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino (Pretty)                       | 340,501 |    0.003 | 0.002 | 0.003 | 0.008 | 0.121 |
| Pino                                | 333,417 |    0.003 | 0.001 | 0.006 | 0.012 | 2.559 |
| Pino (Manual ANSI Async)            | 276,912 |    0.003 | 0.003 | 0.004 | 0.008 | 5.122 |
| MagicLogger (Async + Styles)        | 263,268 |    0.004 | 0.000 | 0.001 | 0.185 | 2.160 |
| Winston (Sync + Styled)             | 241,623 |    0.004 | 0.001 | 0.010 | 0.039 | 6.222 |
| Winston (Plain)                     | 228,578 |    0.004 | 0.001 | 0.007 | 0.037 | 6.131 |
| MagicLogger (Sync)                  | 169,258 |    0.006 | 0.001 | 0.004 | 0.007 | 7.326 |
| MagicLogger (Async)                 | 165,327 |    0.006 | 0.000 | 0.001 | 0.313 | 3.093 |
| Pino (Manual ANSI)                  |  76,765 |    0.013 | 0.011 | 0.020 | 0.040 | 4.330 |
| MagicLogger (Sync + Styles)         |  31,243 |    0.032 | 0.010 | 0.027 | 0.082 | 48.944 |

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
