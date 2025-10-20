# Polygon Clipping

> Mathematical theory and implementation details for Polygon Clipping

## Mathematical Theory

Polygon clipping involves boolean operations on polygons using geometric algorithms. The choice of algorithm depends on the specific operation and polygon properties.

**Key Properties**:

- **Boolean Operations**: Union, intersection, difference, XOR
- **Algorithm Selection**: Sutherland-Hodgman for convex clipping, Weiler-Atherton for general polygons
- **Winding Number**: Determines polygon orientation and containment
- **Edge Classification**: Inside, outside, or intersecting edges

**Mathematical Foundation**:

**Sutherland-Hodgman Algorithm**:

1. **Edge Processing**: Process each clipping plane edge
2. **Vertex Classification**: Classify vertices as inside/outside
3. **Intersection Calculation**: Find edge-plane intersections
4. **Output Generation**: Generate clipped polygon vertices

**Weiler-Atherton Algorithm**:

1. **Edge List Construction**: Build edge lists for both polygons
2. **Intersection Detection**: Find all edge intersections
3. **Graph Traversal**: Traverse intersection graph
4. **Polygon Construction**: Build result polygons

**Intersection Formula**:

For line segment from $P_1$ to $P_2$ and clipping plane with normal $\vec{n}$ and point $P_0$:

$$t = \frac{\vec{n} \cdot (P_0 - P_1)}{\vec{n} \cdot (P_2 - P_1)}$$

Intersection point: $P = P_1 + t(P_2 - P_1)$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { PolygonClipping } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
