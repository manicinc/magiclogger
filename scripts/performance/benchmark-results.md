<!-- PERF_TABLE_START -->
| Logger | Iterations | Time (ms) | Ops/sec |
|--------|------------:|----------:|--------:|
| Bunyan (Sync, Plain) | 100,000 | 855.9 | 116,840 |
| Pino (Sync, Plain) | 100,000 | 875.3 | 114,242 |
| Winston (Sync, Plain) | 100,000 | 945.6 | 105,751 |
| Winston (Sync, Styled) | 100,000 | 979.4 | 102,100 |
| Bunyan (Sync, Styled) | 100,000 | 1113.4 | 89,819 |
| Pino (Sync, Styled) | 100,000 | 1199.3 | 83,385 |
| MagicLogger (Sync, Plain) | 100,000 | 1279.6 | 78,150 |
| MagicLogger (Sync, Styled) | 100,000 | 1410.3 | 70,905 |
| MagicLogger (Async, Styled) | 100,000 | 399.7 | 250,185 |
| MagicLogger (Async, Plain) | 100,000 | 417.3 | 239,660 |
| Pino (Async, Styled) | 100,000 | 479.3 | 208,622 |
| Pino (Async, Plain) | 100,000 | 745.1 | 134,208 |
| Winston (Async, Plain) | 100,000 | 832.9 | 120,067 |
| Winston (Async, Styled) | 100,000 | 1114.2 | 89,749 |

### Winners
- Sync Plain: Bunyan (Sync, Plain) (116,840 ops/sec) — MagicLogger: 78,150 ops/sec
- Sync Styled: Winston (Sync, Styled) (102,100 ops/sec) — MagicLogger: 70,905 ops/sec
- Async Plain: MagicLogger (Async, Plain) (239,660 ops/sec)
- Async Styled: MagicLogger (Async, Styled) (250,185 ops/sec)

=== KEY COMPARISONS ===

Synchronous Styled Performance:
  MagicLogger (Sync, Styled): 70,905 ops/sec
  Winston (Sync, Styled): 102,100 ops/sec
  → MagicLogger is 1.44x slower

Asynchronous Styled Performance:
  MagicLogger (Async, Styled): 250,185 ops/sec
  Pino (Async, Styled): 208,622 ops/sec
  → MagicLogger is 1.20x faster

Note: External libraries' "Styled" cases use chalk for coloring (chalk + library) for fair comparison.

*Generated via scripts/performance/perf-bench.mjs*
<!-- PERF_TABLE_END -->