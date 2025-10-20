# K-d Tree

> Mathematical theory and implementation details for K-d Tree

## Mathematical Theory

A k-d tree is a binary tree where each node represents a k-dimensional point. The tree is constructed by recursively partitioning the space using hyperplanes perpendicular to one of the coordinate axes.

**Key Properties**:

- **Splitting Dimension**: At each level, points are split along a different dimension (cycling through all k dimensions)
- **Median Selection**: The median point along the splitting dimension becomes the root
- **Balanced Structure**: The tree maintains approximate balance through median selection

**Mathematical Foundation**:

For a point set $P = \{p_1, p_2, ..., p_n\}$ in k-dimensional space:

1. **Splitting Function**: $split\_dim = level \bmod k$
2. **Median Selection**: $median = \text{median}(P[split\_dim])$
3. **Partitioning**: $P_{left} = \{p \in P : p[split\_dim] < median\}$, $P_{right} = \{p \in P : p[split\_dim] > median\}$

**Distance Metrics**:

- **Euclidean Distance**: $d(p,q) = \sqrt{\sum_{i=1}^{k}(p_i - q_i)^2}$
- **Manhattan Distance**: $d(p,q) = \sum_{i=1}^{k}|p_i - q_i|$
- **Chebyshev Distance**: $d(p,q) = \max_{i=1}^{k}|p_i - q_i|$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { KdTree } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
