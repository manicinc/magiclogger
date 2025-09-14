# MagicLogger Performance Benchmark Results

Last updated: 2025-09-14T15:06:38.877Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## Note
MagicLogger includes OpenTelemetry/MAGIC schema overhead by default.
Winston/Pino benchmarks don't include OTel plugins (would add ~20-30% overhead).

## Results

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino                                | 238,365 |    0.004 | 0.002 | 0.007 | 0.014 | 5.741 |
| Pino (Manual ANSI Async)            | 216,022 |    0.004 | 0.004 | 0.005 | 0.013 | 1.963 |
| Pino (Pretty)                       | 189,861 |    0.005 | 0.003 | 0.005 | 0.017 | 0.978 |
| Winston (Plain)                     | 153,741 |    0.006 | 0.002 | 0.010 | 0.063 | 8.401 |
| MagicLogger (Sync)                  | 147,906 |    0.006 | 0.001 | 0.004 | 0.010 | 9.598 |
| MagicLogger (Async + Styles)        | 142,323 |    0.007 | 0.001 | 0.001 | 0.346 | 5.988 |
| Winston (Sync + Styled)             | 136,527 |    0.007 | 0.002 | 0.013 | 0.045 | 10.013 |
| MagicLogger (Async)                 | 118,849 |    0.008 | 0.000 | 0.001 | 0.314 | 4.080 |
| Pino (Manual ANSI)                  |  42,176 |    0.023 | 0.016 | 0.036 | 0.141 | 5.481 |
| MagicLogger (Sync + Styles)         |  29,741 |    0.033 | 0.015 | 0.040 | 0.153 | 26.758 |

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
