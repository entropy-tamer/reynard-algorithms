# Line Segment Intersection

> Mathematical theory and implementation details for Line Segment Intersection

## Mathematical Theory

The Bentley-Ottmann algorithm uses a sweep line that moves across the plane, maintaining a status structure of active line segments and processing intersection events.

**Key Properties**:

- **Sweep Line**: Moves from left to right across the plane
- **Status Structure**: Maintains active segments sorted by y-coordinate
- **Event Queue**: Processes segment endpoints and intersections
- **Intersection Detection**: Finds intersections between adjacent segments

**Mathematical Foundation**:

**Sweep Line Algorithm**:

1. **Event Processing**: Handle segment endpoints and intersections
2. **Status Maintenance**: Keep active segments sorted by y-coordinate
3. **Intersection Detection**: Check adjacent segments in status structure
4. **Event Scheduling**: Schedule new intersection events

**Intersection Formula**:

For line segments $L_1: P_1 + t_1(P_2 - P_1)$ and $L_2: Q_1 + t_2(Q_2 - Q_1)$:

$$\begin{bmatrix} t_1 \\ t_2 \end{bmatrix} = \frac{1}{(P_2 - P_1) \times (Q_2 - Q_1)} \begin{bmatrix} (Q_1 - P_1) \times (Q_2 - Q_1) \\ (P_2 - P_1) \times (Q_1 - P_1) \end{bmatrix}$$

Intersection exists if $0 \leq t_1, t_2 \leq 1$.

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { LineSegmentIntersection } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
