# Interval Tree

> Mathematical theory and implementation details for Interval Tree

## Mathematical Theory

**Mathematical Foundation**:

- **Interval**: $[start, end]$ where $start \leq end$
- **Overlap**: Two intervals $[a, b]$ and $[c, d]$ overlap if $\max(a, c) \leq \min(b, d)$
- **Tree Structure**: Balanced binary search tree with intervals as nodes

**Key Properties**:

- **Node Key**: Interval start point
- **Max Endpoint**: Maximum endpoint in subtree rooted at node
- **Search Space**: Only search subtrees where max endpoint ≥ query start

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { IntervalTree } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
