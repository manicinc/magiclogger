Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
2025-08-21T15:09:41.560Z [INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 2038.7 | 49,051 |
| Winston (Sync, Plain) | 100,000 | 2144.2 | 46,637 |
| Pino (Sync, Plain) | 100,000 | 3164.7 | 31,598 |
| Pino (Sync, Styled) | 100,000 | 3262.6 | 30,650 |
| Bunyan (Sync, Plain) | 100,000 | 3268.3 | 30,597 |
| Bunyan (Sync, Styled) | 100,000 | 3890.8 | 25,702 |
| MagicLogger (Sync, Styled) | 100,000 | 6122.0 | 16,334 |
| MagicLogger (Sync, Plain) | 100,000 | 9270.6 | 10,787 |
| Pino (Async, Plain) | 100,000 | 926.5 | 107,933 |
| MagicLogger (Async, Plain) | 100,000 | 1169.4 | 85,517 |
| MagicLogger (Async, Styled) | 100,000 | 1321.2 | 75,689 |
| Pino (Async, Styled) | 100,000 | 1419.2 | 70,461 |
| Winston (Async, Styled) | 100,000 | 2492.6 | 40,119 |
| Winston (Async, Plain) | 100,000 | 3372.4 | 29,653 |

### Winners
- Sync Plain: Winston (Sync, Plain) (46,637 ops/sec) — MagicLogger: 10,787 ops/sec
- Sync Styled: Winston (Sync, Styled) (49,051 ops/sec) — MagicLogger: 16,334 ops/sec
- Async Plain: Pino (Async, Plain) (107,933 ops/sec) — MagicLogger: 85,517 ops/sec
- Async Styled: MagicLogger (Async, Styled) (75,689 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 16,334 ops/sec
  Winston (Sync, Styled): 49,051 ops/sec
  → MagicLogger is 3.00x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 75,689 ops/sec
  Pino (Async, Styled): 70,461 ops/sec
  → MagicLogger is 1.07x faster

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
