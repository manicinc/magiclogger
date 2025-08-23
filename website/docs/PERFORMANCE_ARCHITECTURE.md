# Synchronous vs Asynchronous Design Philosophy

MagicLogger intentionally defaults to synchronous logging, despite the 13x performance advantage of async. This design decision prioritizes:

1. **Principle of Least Surprise**: Developers expect console.log behavior
2. **Debugging Simplicity**: Logs appear in execution order
3. **Crash Safety**: No log loss on unexpected termination
4. **Progressive Enhancement**: Async is opt-in when needed

The AsyncLogger exists as an explicit performance optimization for applications that:
- Can handle graceful shutdown
- Prioritize throughput over immediacy
- Understand the trade-offs of buffered logging
