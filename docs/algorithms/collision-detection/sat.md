# SAT

> Mathematical theory and implementation details for SAT

## Mathematical Theory

SAT is based on the principle that two convex shapes are separated if and only if there exists a line such that the projections of both shapes onto this line do not overlap.

**Key Properties**:

- **Convex Shapes Only**: Works only with convex polygons
- **Projection-Based**: Uses projections onto separating axes
- **MTV Calculation**: Computes minimum translation vector for collision response
- **Axis Generation**: Tests all face normals and edge cross products

**Mathematical Foundation**:

**Projection Formula**:
For a point $P$ and axis $\vec{n}$: $proj(P) = P \cdot \vec{n}$

**Projection Interval**:
For a polygon with vertices $\{V_1, V_2, ..., V_n\}$:

- **Min Projection**: $min\_proj = \min_{i} V_i \cdot \vec{n}$
- **Max Projection**: $max\_proj = \max_{i} V_i \cdot \vec{n}$

**Separation Test**:
Two polygons are separated if for any axis $\vec{n}$:
$$max\_proj_1 < min\_proj_2 \text{ or } max\_proj_2 < min\_proj_1$$

**MTV Calculation**:
If collision occurs, MTV is the minimum overlap distance:
$$MTV = \min_{i} |overlap_i| \cdot \vec{n}_i$$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { SAT } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
