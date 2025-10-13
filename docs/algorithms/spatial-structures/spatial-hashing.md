# Spatial Hashing

> Mathematical theory and implementation details for Spatial Hashing

## Mathematical Theory

**Spatial Partitioning**:
Spatial hashing divides 2D space into a uniform grid where each cell has size $s \times s$. This creates a mapping from continuous 2D coordinates to discrete grid cells.

**Grid Cell Mapping**:
For a point $(x, y)$ and cell size $s$:
$$\text{cell}_x = \left\lfloor \frac{x}{s} \right\rfloor$$
$$\text{cell}_y = \left\lfloor \frac{y}{s} \right\rfloor$$

**Hash Function**:
To map 2D grid coordinates to a 1D hash table, we use:
$$\text{hash}(x, y) = x \cdot p + y$$

Where $p$ is a large prime number (typically $p = 73856093$ or similar) to minimize hash collisions.

**Mathematical Properties**:

1. **Uniform Distribution**: Objects are distributed uniformly across cells
2. **Locality**: Objects in nearby cells are likely to be spatially close
3. **Efficiency**: Reduces search space from $O(n)$ to $O(k)$ where $k$ is objects per cell

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { SpatialHashing } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
