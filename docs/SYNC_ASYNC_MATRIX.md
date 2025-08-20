# Should You Use AsyncLogger?

| Scenario                | Recommendation | Reason                          |
|------------------------|---------------|----------------------------------|
| Development/Local      | Logger (sync) | Immediate feedback, easier debugging |
| Production API (<100 RPS) | Logger (sync) | Simplicity outweighs performance |
| Production API (>100 RPS) | AsyncLogger   | Performance critical             |
| Background Jobs        | AsyncLogger   | Non-blocking processing          |
| CLI Tools              | Logger (sync) | Users expect immediate output    |
| Lambda/Serverless      | Logger (sync) | Short-lived, needs guaranteed delivery |
| Long-running Services  | AsyncLogger   | Efficiency over time             |
