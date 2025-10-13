# Octree

> Mathematical theory and implementation details for Octree

## Mathematical Theory

An octree recursively subdivides 3D space into eight octants, creating a hierarchical structure where each node represents a cubic region of space.

**Key Properties**:

- **Octant Division**: Each node splits into 8 children (2×2×2 grid)
- **Depth Limiting**: Maximum depth prevents infinite subdivision
- **Point Distribution**: Points are distributed among octants based on spatial location

**Mathematical Foundation**:

For a 3D point $p = (x, y, z)$ and octree node with bounds $[x_{min}, x_{max}] \times [y_{min}, y_{max}] \times [z_{min}, z_{max}]$:

1. **Octant Index**: $octant = 4 \cdot (x \geq x_{mid}) + 2 \cdot (y \geq y_{mid}) + (z \geq z_{mid})$
2. **Midpoint Calculation**: $x_{mid} = \frac{x_{min} + x_{max}}{2}$, $y_{mid} = \frac{y_{min} + y_{max}}{2}$, $z_{mid} = \frac{z_{min} + z_{max}}{2}$
3. **Subdivision**: Each octant gets bounds $[x_{min}^{new}, x_{max}^{new}] \times [y_{min}^{new}, y_{max}^{new}] \times [z_{min}^{new}, z_{max}^{new}]$

**Volume Calculations**:

- **Node Volume**: $V = (x_{max} - x_{min}) \times (y_{max} - y_{min}) \times (z_{max} - z_{min})$
- **Volume Ratio**: $\frac{V_{child}}{V_{parent}} = \frac{1}{8}$ for each octant

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { Octree } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
