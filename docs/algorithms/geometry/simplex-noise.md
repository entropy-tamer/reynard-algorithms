# Simplex Noise

> Mathematical theory and implementation details for Simplex Noise

## Mathematical Theory

**Mathematical Foundation**:

- **Simplex Grid**: Uses equilateral triangles in 2D, tetrahedra in 3D
- **Gradient Vectors**: Predefined gradient vectors for each grid point
- **Falloff Function**: Smooth interpolation between grid points
- **Frequency**: Controls the scale of the noise pattern

**Key Properties**:

- **Lower Computational Cost**: Fewer operations than Perlin noise
- **Better Visual Quality**: Smoother gradients and fewer artifacts
- **Scalable**: Supports 2D, 3D, and 4D noise generation

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { SimplexNoise } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
