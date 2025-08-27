Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
[INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 2547.3 | 39,257 |
| Winston (Sync, Plain) | 100,000 | 2552.4 | 39,180 |
| Bunyan (Sync, Plain) | 100,000 | 2870.4 | 34,838 |
| Pino (Sync, Plain) | 100,000 | 3565.5 | 28,047 |
| MagicLogger (Sync, Plain) | 100,000 | 3583.1 | 27,909 |
| Pino (Sync, Styled) | 100,000 | 3708.7 | 26,964 |
| Bunyan (Sync, Styled) | 100,000 | 3807.0 | 26,268 |
| MagicLogger (Sync, Styled) | 100,000 | 6364.5 | 15,712 |
| Pino (Async, Styled) | 100,000 | 1231.6 | 81,192 |
| MagicLogger (Async, Plain) | 100,000 | 1637.9 | 61,055 |
| MagicLogger (Async, Styled) | 100,000 | 1837.7 | 54,415 |
| Pino (Async, Plain) | 100,000 | 2781.6 | 35,951 |
| Winston (Async, Plain) | 100,000 | 2859.5 | 34,971 |
| Winston (Async, Styled) | 100,000 | 2958.1 | 33,805 |

### Winners
- Sync Plain: Winston (Sync, Plain) (39,180 ops/sec) — MagicLogger: 27,909 ops/sec
- Sync Styled: Winston (Sync, Styled) (39,257 ops/sec) — MagicLogger: 15,712 ops/sec
- Async Plain: MagicLogger (Async, Plain) (61,055 ops/sec)
- Async Styled: Pino (Async, Styled) (81,192 ops/sec) — MagicLogger: 54,415 ops/sec

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 15,712 ops/sec
  Winston (Sync, Styled): 39,257 ops/sec
  → MagicLogger is 2.50x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 54,415 ops/sec
  Pino (Async, Styled): 81,192 ops/sec
  → MagicLogger is 1.49x slower

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
