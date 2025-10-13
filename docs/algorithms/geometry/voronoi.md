# Voronoi

> Mathematical theory and implementation details for Voronoi

## Mathematical Theory

A Voronoi diagram divides space into cells where each cell contains all points closest to a particular site. It's the dual of the Delaunay triangulation and has applications in nearest neighbor queries, coverage analysis, and mesh generation.

**Key Properties**:

- **Dual Relationship**: Voronoi diagram is dual to Delaunay triangulation
- **Nearest Neighbor**: Each cell contains points closest to its site
- **Convex Cells**: All Voronoi cells are convex polygons
- **Edge Properties**: Edges are perpendicular bisectors of site connections

**Mathematical Foundation**:

For a set of sites $S = \{s_1, s_2, ..., s_n\}$, the Voronoi cell of site $s_i$ is:

$$V(s_i) = \{p \in \mathbb{R}^2 : d(p, s_i) \leq d(p, s_j) \text{ for all } j \neq i\}$$

Where $d(p, s_i)$ is the Euclidean distance between point $p$ and site $s_i$.

**Fortune's Algorithm**:

Uses a sweep line approach with a beach line data structure:

1. **Sweep Line**: Moves from top to bottom
2. **Beach Line**: Parabolic arcs representing equidistant points
3. **Event Processing**: Site events and circle events
4. **Cell Construction**: Builds Voronoi cells incrementally

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { Voronoi } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
