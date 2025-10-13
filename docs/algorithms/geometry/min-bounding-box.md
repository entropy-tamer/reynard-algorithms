# Minimum Bounding Box

> Mathematical theory and implementation details for Minimum Bounding Box

## Mathematical Theory

The minimum bounding box problem seeks the rectangle with minimum area that contains all input points. The rotating calipers algorithm provides an optimal solution by rotating the rectangle around the convex hull.

**Key Properties**:

- **Optimal Solution**: Finds the true minimum area rectangle
- **Convex Hull**: Uses convex hull to reduce problem complexity
- **Rotating Calipers**: Rotates rectangle to find minimum area
- **Edge Cases**: Handles collinear and degenerate cases

**Mathematical Foundation**:

**Rotating Calipers Algorithm**:

1. **Convex Hull**: Compute convex hull of point set
2. **Initial Rectangle**: Find rectangle aligned with first edge
3. **Rotation**: Rotate rectangle to align with each hull edge
4. **Minimum**: Track rectangle with minimum area

**Area Calculation**:
For rectangle with width $w$ and height $h$: $A = w \cdot h$

**Convex Hull**: Use Graham scan or Andrew's monotone chain algorithm.

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { MinimumBoundingBox } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
