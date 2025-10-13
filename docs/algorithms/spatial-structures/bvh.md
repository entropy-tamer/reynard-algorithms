# BVH

> Mathematical theory and implementation details for BVH

## Mathematical Theory

A BVH organizes geometric primitives in a tree structure where each node contains a bounding volume (typically an AABB) that encompasses all primitives in its subtree.

**Key Properties**:

- **Hierarchical Structure**: Each node bounds all its children
- **Surface Area Heuristic (SAH)**: Optimizes tree structure for ray tracing performance
- **Top-Down Construction**: Builds tree by recursively partitioning primitives

**Mathematical Foundation**:

For a set of primitives $P = \{p_1, p_2, ..., p_n\}$:

1. **Bounding Volume**: $BV(node) = \bigcup_{p \in node} bounds(p)$
2. **Surface Area**: $SA(BV) = 2(wh + hd + wd)$ for AABB with width $w$, height $h$, depth $d$
3. **SAH Cost**: $C = C_t + \frac{SA(left)}{SA(parent)} \cdot N_{left} \cdot C_i + \frac{SA(right)}{SA(parent)} \cdot N_{right} \cdot C_i$

Where:

- $C_t$ = traversal cost
- $C_i$ = intersection cost
- $N_{left}, N_{right}$ = number of primitives in left/right subtrees

**Splitting Strategies**:

- **Spatial Median**: Split at geometric center
- **Object Median**: Split at median primitive
- **SAH Optimization**: Choose split that minimizes expected cost

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { BVH } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
