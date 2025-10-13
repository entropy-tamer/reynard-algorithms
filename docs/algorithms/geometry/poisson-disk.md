# Poisson Disk

> Mathematical theory and implementation details for Poisson Disk

## Mathematical Theory

**Mathematical Foundation**:

- **Minimum Distance**: Each point maintains minimum distance $r$ from all other points
- **Rejection Sampling**: Generate candidate points and reject if too close to existing points
- **Grid Optimization**: Use spatial grid to accelerate distance checks
- **Dart Throwing**: Random placement with rejection for efficiency

**Key Properties**:

- **Blue Noise**: Produces blue noise characteristics
- **Uniform Distribution**: Maintains uniform density
- **Minimum Distance**: Guarantees minimum separation between points

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { PoissonDisk } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
