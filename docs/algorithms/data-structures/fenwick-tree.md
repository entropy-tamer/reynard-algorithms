# Fenwick Tree

> Mathematical theory and implementation details for Fenwick Tree

## Mathematical Theory

**Mathematical Foundation**:

- **Index Manipulation**: Uses bit manipulation for efficient traversal
- **Range Sum**: $\text{sum}(i) = \sum_{j=1}^{i} \text{arr}[j]$
- **Point Update**: Update element at index $i$ and propagate changes

**Key Operations**:

- **LSB (Least Significant Bit)**: $\text{lsb}(i) = i \& (-i)$
- **Parent Index**: $\text{parent}(i) = i - \text{lsb}(i)$
- **Next Index**: $\text{next}(i) = i + \text{lsb}(i)$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { FenwickTree } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
