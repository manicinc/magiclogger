Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
[INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 2268.7 | 44,078 |
| Bunyan (Sync, Plain) | 100,000 | 2520.1 | 39,682 |
| Bunyan (Sync, Styled) | 100,000 | 2562.0 | 39,032 |
| Winston (Sync, Plain) | 100,000 | 2636.9 | 37,923 |
| Pino (Sync, Styled) | 100,000 | 2880.4 | 34,718 |
| Pino (Sync, Plain) | 100,000 | 3000.7 | 33,325 |
| MagicLogger (Sync, Plain) | 100,000 | 3843.8 | 26,016 |
| MagicLogger (Sync, Styled) | 100,000 | 4534.1 | 22,055 |
| Pino (Async, Plain) | 100,000 | 798.3 | 125,261 |
| MagicLogger (Async, Styled) | 100,000 | 1182.4 | 84,575 |
| MagicLogger (Async, Plain) | 100,000 | 1266.4 | 78,966 |
| Pino (Async, Styled) | 100,000 | 1475.1 | 67,793 |
| Winston (Async, Styled) | 100,000 | 2507.4 | 39,882 |
| Winston (Async, Plain) | 100,000 | 3708.5 | 26,965 |

### Winners
- Sync Plain: Bunyan (Sync, Plain) (39,682 ops/sec) — MagicLogger: 26,016 ops/sec
- Sync Styled: Winston (Sync, Styled) (44,078 ops/sec) — MagicLogger: 22,055 ops/sec
- Async Plain: Pino (Async, Plain) (125,261 ops/sec) — MagicLogger: 78,966 ops/sec
- Async Styled: MagicLogger (Async, Styled) (84,575 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 22,055 ops/sec
  Winston (Sync, Styled): 44,078 ops/sec
  → MagicLogger is 2.00x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 84,575 ops/sec
  Pino (Async, Styled): 67,793 ops/sec
  → MagicLogger is 1.25x faster

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
