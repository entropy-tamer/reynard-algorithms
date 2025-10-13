# Union-Find

> Mathematical theory and implementation details for Union-Find

## Mathematical Theory

**Disjoint Set Union (DSU)** is a data structure that tracks a collection of elements partitioned into a number of disjoint (non-overlapping) subsets. It provides near-constant-time operations to:

1. **Find**: Determine which subset a particular element is in
2. **Union**: Join two subsets into a single subset

**Mathematical Model**:

- Let $S = \{1, 2, 3, ..., n\}$ be a set of $n$ elements
- A partition of $S$ is a collection of disjoint subsets $P = \{S_1, S_2, ..., S_k\}$ such that $\bigcup_{i=1}^{k} S_i = S$ and $S_i \cap S_j = \emptyset$ for $i \neq j$
- Each subset has a representative element (root)

**Key Mathematical Properties**:

1. **Equivalence Relation**: The "connected" relation is reflexive, symmetric, and transitive
2. **Partition Property**: Union operations maintain the partition property
3. **Representative Uniqueness**: Each subset has exactly one representative

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { UnionFind } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
