# AABB

> Mathematical theory and implementation details for AABB

## Mathematical Theory

**AABB Definition**:
An AABB is defined by its minimum corner point and dimensions:
$$A = (x, y, w, h)$$
where:

- $(x, y)$ is the top-left corner
- $w$ is the width (extent along x-axis)
- $h$ is the height (extent along y-axis)

**Geometric Properties**:

- **Left edge**: $x$
- **Right edge**: $x + w$
- **Top edge**: $y$
- **Bottom edge**: $y + h$
- **Center**: $(x + w/2, y + h/2)$
- **Area**: $w \times h$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { AABB } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
