# Convex Hull

> Mathematical theory and implementation details for Convex Hull

## Mathematical Theory

**Mathematical Foundation**:

- **Convex Hull**: Smallest convex set containing all points
- **Graham Scan**: Sort by polar angle, use stack to build hull
- **Jarvis March**: Gift wrapping algorithm, $O(nh)$ where $h$ is hull size
- **QuickHull**: Divide and conquer approach, $O(n \log n)$ average case

**Key Properties**:

- **Graham Scan**: $O(n \log n)$ time complexity
- **Jarvis March**: $O(nh)$ where $h$ is number of hull points
- **QuickHull**: $O(n \log n)$ average case, $O(n^2)$ worst case

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { ConvexHull } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
