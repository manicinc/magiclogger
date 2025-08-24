Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
2025-08-21T17:52:12.133Z [INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Pino (Sync, Styled) | 100,000 | 2252.1 | 44,404 |
| Pino (Sync, Plain) | 100,000 | 2534.3 | 39,458 |
| MagicLogger (Sync, Plain) | 100,000 | 2561.4 | 39,041 |
| Bunyan (Sync, Styled) | 100,000 | 3183.6 | 31,411 |
| Winston (Sync, Styled) | 100,000 | 4075.0 | 24,540 |
| Winston (Sync, Plain) | 100,000 | 4288.4 | 23,319 |
| Bunyan (Sync, Plain) | 100,000 | 4503.6 | 22,204 |
| MagicLogger (Sync, Styled) | 100,000 | 4610.1 | 21,692 |
| MagicLogger (Async, Plain) | 100,000 | 1518.7 | 65,844 |
| MagicLogger (Async, Styled) | 100,000 | 1831.7 | 54,593 |
| Pino (Async, Styled) | 100,000 | 2316.8 | 43,163 |
| Pino (Async, Plain) | 100,000 | 2321.3 | 43,080 |
| Winston (Async, Styled) | 100,000 | 2328.2 | 42,952 |
| Winston (Async, Plain) | 100,000 | 3177.0 | 31,476 |

### Winners
- Sync Plain: Pino (Sync, Plain) (39,458 ops/sec) — MagicLogger: 39,041 ops/sec
- Sync Styled: Pino (Sync, Styled) (44,404 ops/sec) — MagicLogger: 21,692 ops/sec
- Async Plain: MagicLogger (Async, Plain) (65,844 ops/sec)
- Async Styled: MagicLogger (Async, Styled) (54,593 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 21,692 ops/sec
  Pino (Sync, Styled): 44,404 ops/sec
  → MagicLogger is 2.05x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 54,593 ops/sec
  Pino (Async, Styled): 43,163 ops/sec
  → MagicLogger is 1.26x faster

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
