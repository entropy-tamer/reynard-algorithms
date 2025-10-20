# OBB

> Mathematical theory and implementation details for OBB

## Mathematical Theory

An OBB is defined by a center point, orientation vectors, and half-extents. It provides a tighter fit than AABB for rotated objects and is used in collision detection systems.

**Key Properties**:

- **Orientation**: Can be rotated to any angle
- **Tight Fit**: Minimizes volume for given point set
- **Collision Detection**: Used in SAT (Separating Axis Theorem)
- **Construction**: Built from point cloud or mesh data

**Mathematical Foundation**:

**OBB Definition**:

- **Center**: $C = \frac{1}{n} \sum_{i=1}^{n} P_i$
- **Orientation**: Principal component analysis of point set
- **Half-extents**: $h_i = \max_{j} |(P_j - C) \cdot \vec{u}_i|$

**Principal Component Analysis**:

1. **Covariance Matrix**: $C_{ij} = \frac{1}{n} \sum_{k=1}^{n} (P_{k,i} - \mu_i)(P_{k,j} - \mu_j)$
2. **Eigenvectors**: Find eigenvectors of covariance matrix
3. **Orientation**: Use eigenvectors as OBB axes

**Collision Detection**:
Using SAT with OBB axes as separating axes.

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { OBB } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
