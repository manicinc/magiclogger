Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
[INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 3710.9 | 26,947 |
| Winston (Sync, Plain) | 100,000 | 3845.6 | 26,004 |
| Bunyan (Sync, Styled) | 100,000 | 4340.8 | 23,037 |
| Bunyan (Sync, Plain) | 100,000 | 5140.8 | 19,452 |
| Pino (Sync, Plain) | 100,000 | 6176.4 | 16,191 |
| Pino (Sync, Styled) | 100,000 | 7448.4 | 13,426 |
| MagicLogger (Sync, Plain) | 100,000 | 8532.3 | 11,720 |
| MagicLogger (Sync, Styled) | 100,000 | 11490.5 | 8,703 |
| Pino (Async, Plain) | 100,000 | 1678.0 | 59,594 |
| MagicLogger (Async, Plain) | 100,000 | 1799.8 | 55,562 |
| Pino (Async, Styled) | 100,000 | 2123.6 | 47,089 |
| MagicLogger (Async, Styled) | 100,000 | 2301.2 | 43,456 |
| Winston (Async, Styled) | 100,000 | 4506.7 | 22,189 |
| Winston (Async, Plain) | 100,000 | 4905.4 | 20,386 |

### Winners
- Sync Plain: Winston (Sync, Plain) (26,004 ops/sec) — MagicLogger: 11,720 ops/sec
- Sync Styled: Winston (Sync, Styled) (26,947 ops/sec) — MagicLogger: 8,703 ops/sec
- Async Plain: Pino (Async, Plain) (59,594 ops/sec) — MagicLogger: 55,562 ops/sec
- Async Styled: Pino (Async, Styled) (47,089 ops/sec) — MagicLogger: 43,456 ops/sec

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 8,703 ops/sec
  Winston (Sync, Styled): 26,947 ops/sec
  → MagicLogger is 3.10x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 43,456 ops/sec
  Pino (Async, Styled): 47,089 ops/sec
  → MagicLogger is 1.08x slower

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
