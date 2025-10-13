# Marching Squares

> Mathematical theory and implementation details for Marching Squares

## Mathematical Theory

**Mathematical Foundation**:

- **Grid Cell**: Each cell has 4 corner values forming a 2D scalar field
- **Interpolation**: Linear interpolation along cell edges to find contour intersections
- **Case Table**: 16 possible configurations based on corner values relative to threshold
- **Contour Generation**: Connect interpolated points to form continuous contours

**Key Properties**:

- **Scalar Field**: Works with any 2D scalar field data
- **Contour Lines**: Generates smooth contour lines at specified thresholds
- **Topology**: Preserves topological relationships in the field

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { MarchingSquares } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
