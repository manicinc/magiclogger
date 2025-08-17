# utils

Tree-shakeable utilities that are optional to import:

- Sampler: probabilistic and deterministic sampling for log entries
- RateLimiter: sliding window, fixed, token bucket options
- Redactor: robust PII/sensitive data redaction (patterns, strategies, tokenization)
- QueueManager: backpressure handling with drop policies and metrics

Import only what you need, e.g.:

```ts
import { Sampler } from 'magiclogger/utils/Sampler';
```

These are not exported from the root index to preserve minimal bundles by default.
