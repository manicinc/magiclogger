Starting MagicLogger Performance Benchmark

Configuration:
  Iterations: 100,000
  Warmup: 5,000
  Output: Suppressed (null transport/stream)

Setting up loggers...
Running benchmarks...

=== SYNCHRONOUS OPERATIONS ===
2025-08-16T04:23:48.521Z [INFO] User authentication successful

=== ASYNCHRONOUS OPERATIONS ===

Verification: Counter stream received 0 writes

=== SYNCHRONOUS PERFORMANCE RESULTS ===
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Bunyan (Sync, Styled) | 100,000 | 2955.6 | 33,834 |
| Winston (Sync, Styled) | 100,000 | 3104.1 | 32,215 |
| Winston (Sync, Plain) | 100,000 | 3427.2 | 29,179 |
| Bunyan (Sync, Plain) | 100,000 | 3574.7 | 27,974 |
| Pino (Sync, Plain) | 100,000 | 3632.4 | 27,530 |
| Pino (Sync, Styled) | 100,000 | 3802.0 | 26,302 |
| MagicLogger (Sync, Plain) | 100,000 | 12321.0 | 8,116 |
| MagicLogger (Sync, Styled) | 100,000 | 13182.6 | 7,586 |

=== ASYNCHRONOUS PERFORMANCE RESULTS ===
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| MagicLogger (Async, Plain) | 100,000 | 967.8 | 103,327 |
| MagicLogger (Async, Styled) | 100,000 | 1347.3 | 74,225 |
| Pino (Async, Styled) | 100,000 | 1492.7 | 66,994 |
| Pino (Async, Plain) | 100,000 | 2628.9 | 38,038 |
| Winston (Async, Styled) | 100,000 | 2648.0 | 37,765 |
| Winston (Async, Plain) | 100,000 | 2681.5 | 37,293 |

Markdown Output (Combined):
<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Bunyan (Sync, Styled) | 100,000 | 2955.6 | 33,834 |
| Winston (Sync, Styled) | 100,000 | 3104.1 | 32,215 |
| Winston (Sync, Plain) | 100,000 | 3427.2 | 29,179 |
| Bunyan (Sync, Plain) | 100,000 | 3574.7 | 27,974 |
| Pino (Sync, Plain) | 100,000 | 3632.4 | 27,530 |
| Pino (Sync, Styled) | 100,000 | 3802.0 | 26,302 |
| MagicLogger (Sync, Plain) | 100,000 | 12321.0 | 8,116 |
| MagicLogger (Sync, Styled) | 100,000 | 13182.6 | 7,586 |
| MagicLogger (Async, Plain) | 100,000 | 967.8 | 103,327 |
| MagicLogger (Async, Styled) | 100,000 | 1347.3 | 74,225 |
| Pino (Async, Styled) | 100,000 | 1492.7 | 66,994 |
| Pino (Async, Plain) | 100,000 | 2628.9 | 38,038 |
| Winston (Async, Styled) | 100,000 | 2648.0 | 37,765 |
| Winston (Async, Plain) | 100,000 | 2681.5 | 37,293 |

### Winners
- Sync Plain: Winston (Sync, Plain) (29,179 ops/sec) — MagicLogger: 8,116 ops/sec
- Sync Styled: Bunyan (Sync, Styled) (33,834 ops/sec) — MagicLogger: 7,586 ops/sec
- Async Plain: MagicLogger (Async, Plain) (103,327 ops/sec)
- Async Styled: MagicLogger (Async, Styled) (74,225 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 7,586 ops/sec
  Bunyan (Sync, Styled): 33,834 ops/sec
  → MagicLogger is 4.46x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 74,225 ops/sec
  Pino (Async, Styled): 66,994 ops/sec
  → MagicLogger is 1.11x faster

*Generated via scripts/performance/perf-bench.mjs.*
<!-- PERF_TABLE_END -->

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 7,586 ops/sec
  Bunyan (Sync, Styled): 33,834 ops/sec
  → MagicLogger is 4.46x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 74,225 ops/sec
  Pino (Async, Styled): 66,994 ops/sec
  → MagicLogger is 1.11x faster

Fastest Sync: Bunyan (Sync, Styled) (33,834 ops/sec)
Fastest Async: MagicLogger (Async, Plain) (103,327 ops/sec)

Legend:
  • Sync = True synchronous operations (blocking I/O)
  • Async = Buffered/async operations (non-blocking)
  • Plain = Minimal formatting
  • Styled = Color/template formatting applied
  • All output suppressed via null transport/stream
