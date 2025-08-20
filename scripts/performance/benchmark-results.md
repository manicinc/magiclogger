Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
2025-08-20T05:10:22.747Z [INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Winston (Sync, Styled) | 100,000 | 989.2 | 101,093 |
| Pino (Sync, Plain) | 100,000 | 1541.2 | 64,885 |
| Bunyan (Sync, Styled) | 100,000 | 1654.2 | 60,452 |
| Winston (Sync, Plain) | 100,000 | 1772.2 | 56,428 |
| Pino (Sync, Styled) | 100,000 | 2083.2 | 48,002 |
| Bunyan (Sync, Plain) | 100,000 | 2252.1 | 44,403 |
| MagicLogger (Sync, Styled) | 100,000 | 2462.7 | 40,606 |
| MagicLogger (Sync, Plain) | 100,000 | 3134.7 | 31,901 |
| Pino (Async, Plain) | 100,000 | 365.2 | 273,803 |
| Pino (Async, Styled) | 100,000 | 396.1 | 252,481 |
| MagicLogger (Async, Styled) | 100,000 | 506.5 | 197,436 |
| MagicLogger (Async, Plain) | 100,000 | 509.4 | 196,325 |
| Winston (Async, Styled) | 100,000 | 1388.7 | 72,009 |
| Winston (Async, Plain) | 100,000 | 1739.6 | 57,484 |

### Winners
- Sync Plain: Pino (Sync, Plain) (64,885 ops/sec) — MagicLogger: 31,901 ops/sec
- Sync Styled: Winston (Sync, Styled) (101,093 ops/sec) — MagicLogger: 40,606 ops/sec
- Async Plain: Pino (Async, Plain) (273,803 ops/sec) — MagicLogger: 196,325 ops/sec
- Async Styled: Pino (Async, Styled) (252,481 ops/sec) — MagicLogger: 197,436 ops/sec

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 40,606 ops/sec
  Winston (Sync, Styled): 101,093 ops/sec
  → MagicLogger is 2.49x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 197,436 ops/sec
  Pino (Async, Styled): 252,481 ops/sec
  → MagicLogger is 1.28x slower

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
