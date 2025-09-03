Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
[INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Bunyan (Sync, Styled) | 100,000 | 878.5 | 113,824 |
| Winston (Sync, Styled) | 100,000 | 919.3 | 108,775 |
| Pino (Sync, Styled) | 100,000 | 1023.1 | 97,743 |
| Bunyan (Sync, Plain) | 100,000 | 1087.7 | 91,937 |
| Winston (Sync, Plain) | 100,000 | 1098.3 | 91,051 |
| Pino (Sync, Plain) | 100,000 | 1175.1 | 85,096 |
| MagicLogger (Sync, Plain) | 100,000 | 1734.0 | 57,671 |
| MagicLogger (Sync, Styled) | 100,000 | 1987.5 | 50,316 |
| Pino (Async, Styled) | 100,000 | 390.7 | 255,949 |
| MagicLogger (Async, Styled) | 100,000 | 419.8 | 238,199 |
| MagicLogger (Async, Plain) | 100,000 | 471.8 | 211,947 |
| Pino (Async, Plain) | 100,000 | 737.7 | 135,555 |
| Winston (Async, Styled) | 100,000 | 872.2 | 114,647 |
| Winston (Async, Plain) | 100,000 | 968.5 | 103,252 |

### Winners
- Sync Plain: Bunyan (Sync, Plain) (91,937 ops/sec) — MagicLogger: 57,671 ops/sec
- Sync Styled: Bunyan (Sync, Styled) (113,824 ops/sec) — MagicLogger: 50,316 ops/sec
- Async Plain: MagicLogger (Async, Plain) (211,947 ops/sec)
- Async Styled: Pino (Async, Styled) (255,949 ops/sec) — MagicLogger: 238,199 ops/sec

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 50,316 ops/sec
  Bunyan (Sync, Styled): 113,824 ops/sec
  → MagicLogger is 2.26x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 238,199 ops/sec
  Pino (Async, Styled): 255,949 ops/sec
  → MagicLogger is 1.07x slower

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->
