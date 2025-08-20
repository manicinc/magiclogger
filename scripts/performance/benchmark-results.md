Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
2025-08-20T01:01:43.781Z [INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 789.5 | 126,663 |
| Winston (Sync, Plain) | 100,000 | 1213.1 | 82,430 |
| Bunyan (Sync, Styled) | 100,000 | 1218.1 | 82,092 |
| Bunyan (Sync, Plain) | 100,000 | 1270.6 | 78,703 |
| Pino (Sync, Plain) | 100,000 | 1516.7 | 65,931 |
| Pino (Sync, Styled) | 100,000 | 1573.9 | 63,537 |
| MagicLogger (Sync, Plain) | 100,000 | 2375.6 | 42,094 |
| MagicLogger (Sync, Styled) | 100,000 | 3122.6 | 32,025 |
| MagicLogger (Async, Plain) | 100,000 | 545.5 | 183,322 |
| MagicLogger (Async, Styled) | 100,000 | 724.4 | 138,050 |
| Pino (Async, Styled) | 100,000 | 751.2 | 133,112 |
| Pino (Async, Plain) | 100,000 | 1090.6 | 91,696 |
| Winston (Async, Plain) | 100,000 | 1517.2 | 65,911 |
| Winston (Async, Styled) | 100,000 | 1841.5 | 54,304 |

### Winners
- Sync Plain: Winston (Sync, Plain) (82,430 ops/sec) — MagicLogger: 42,094 ops/sec
- Sync Styled: Winston (Sync, Styled) (126,663 ops/sec) — MagicLogger: 32,025 ops/sec
- Async Plain: MagicLogger (Async, Plain) (183,322 ops/sec)
- Async Styled: MagicLogger (Async, Styled) (138,050 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 32,025 ops/sec
  Winston (Sync, Styled): 126,663 ops/sec
  → MagicLogger is 3.96x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 138,050 ops/sec
  Pino (Async, Styled): 133,112 ops/sec
  → MagicLogger is 1.04x faster

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
