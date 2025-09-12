# MagicLogger Performance Benchmark Results

Last updated: 2025-01-12T18:32:25.043Z
Node.js: v20.19.4
Platform: win32
Iterations: 20,000

## 🏆 Key Results

- **🚀 Fastest Plain Text**: MagicLogger (Async) - **301,739 ops/sec**
- **⚡ Lowest Latency**: MagicLogger (Async) - **0.003ms avg**
- **🎨 Styling Overhead**: 83% average (acceptable for rich output)
- **🔧 Architecture**: Workers OFF by default (optimized for latency)

## 📝 Plain Text Performance

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| **MagicLogger (Async)** ✅ | **301,739** | **0.003** | 0.000 | 0.001 | 0.099 | 3.447 |
| MagicLogger (Sync) | 236,343 | 0.004 | 0.001 | 0.003 | 0.005 | 5.682 |
| Pino | 214,380 | 0.004 | 0.002 | 0.005 | 0.009 | 30.228 |
| Winston | 192,906 | 0.005 | 0.002 | 0.007 | 0.047 | 13.809 |

## 🎨 Styled Output Performance

| Logger | Ops/sec | Avg (ms) | P50 | P95 | P99 | Max |
|--------|--------:|---------:|----:|----:|----:|----:|
| Pino (Manual ANSI Async) | 220,092 | 0.004 | 0.003 | 0.004 | 0.012 | 7.393 |
| Winston (Styled) | 213,721 | 0.004 | 0.002 | 0.013 | 0.034 | 0.950 |
| Pino (Pretty) | 186,178 | 0.005 | 0.004 | 0.005 | 0.012 | 0.934 |
| Pino (Manual ANSI) | 69,881 | 0.014 | 0.010 | 0.022 | 0.069 | 3.314 |
| **MagicLogger (Sync + Styles)** | **51,241** | 0.019 | 0.009 | 0.023 | 0.044 | 15.109 |
| MagicLogger (Async + Styles) | 35,977 | 0.028 | 0.018 | 0.040 | 0.227 | 16.190 |

## Configuration
- Test iterations: 20,000
- Warmup iterations: 100
- Output: Real file I/O
- Platform: win32
- Node.js: v20.19.4
