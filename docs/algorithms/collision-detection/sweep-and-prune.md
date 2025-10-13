# Sweep and Prune

> Mathematical theory and implementation details for Sweep and Prune

## Mathematical Theory

Sweep and Prune reduces the collision detection problem from $O(n^2)$ to $O(n \log n + k)$ where $k` is the number of overlapping pairs by exploiting spatial coherence.

**Key Properties**:

- **Broad-Phase**: Eliminates obviously non-colliding pairs
- **Spatial Coherence**: Exploits object movement patterns
- **Incremental Updates**: Efficiently handles dynamic scenes
- **Multi-Axis**: Can use 1D, 2D, or 3D sorting

**Mathematical Foundation**:

**Endpoint Representation**:
For object $i$ with AABB $[x_{min}^i, x_{max}^i] \times [y_{min}^i, y_{max}^i]$:

- **Start Endpoint**: $(x_{min}^i, i, 'start')$
- **End Endpoint**: $(x_{max}^i, i, 'end')$

**Overlap Detection**:
Two objects $i$ and $j$ overlap if:
$$x_{min}^i \leq x_{max}^j \text{ and } x_{min}^j \leq x_{max}^i$$

**Active Set Maintenance**:

- **Insert**: Add object to active set when start endpoint encountered
- **Remove**: Remove object from active set when end endpoint encountered
- **Collision Check**: Check all pairs in active set

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { SweepandPrune } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
