# Segment Tree

> Mathematical theory and implementation details for Segment Tree

## Mathematical Theory

**Mathematical Foundation**:

- **Tree Structure**: Complete binary tree where each node represents a range
- **Leaf Nodes**: Represent individual array elements
- **Internal Nodes**: Represent ranges and store aggregate information
- **Tree Height**: $h = \lceil \log_2(n) \rceil$ where $n$ is the array size

**Key Operations**:

- **Range Query**: Query aggregate over range $[l, r]$
- **Point Update**: Update single element
- **Range Update**: Update all elements in range (with lazy propagation)

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { SegmentTree } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
