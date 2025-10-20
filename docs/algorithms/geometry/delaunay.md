# Delaunay

> Mathematical theory and implementation details for Delaunay

## Mathematical Theory

**Mathematical Foundation**:

- **Delaunay Property**: No point lies inside the circumcircle of any triangle
- **Bowyer-Watson Algorithm**: Incremental insertion with cavity retriangulation
- **Circumcircle Test**: Point $P$ is inside circumcircle of triangle $ABC$ if:
  $$
  \begin{vmatrix}
  A_x & A_y & A_x^2 + A_y^2 & 1 \\
  B_x & B_y & B_x^2 + B_y^2 & 1 \\
  C_x & C_y & C_x^2 + C_y^2 & 1 \\
  P_x & P_y & P_x^2 + P_y^2 & 1
  \end{vmatrix} > 0
  $$

**Key Properties**:

- **Max-Min Angle**: Maximizes minimum angle in triangulation
- **Empty Circle**: No point inside any triangle's circumcircle
- **Dual Graph**: Voronoi diagram is the dual of Delaunay triangulation

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { Delaunay } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
