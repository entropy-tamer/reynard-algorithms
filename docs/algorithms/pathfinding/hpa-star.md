# HPA*

> Mathematical theory and implementation details for HPA*

## Mathematical Theory

HPA* works by clustering the map into abstract regions, finding high-level paths between clusters, then refining the path at the detailed level. This reduces the search space dramatically for large maps.

**Key Properties**:

- **Hierarchical Abstraction**: Multiple levels of map representation
- **Cluster Decomposition**: Groups nearby areas into clusters
- **Path Refinement**: Converts abstract paths to detailed paths

**Mathematical Foundation**:

1. **Clustering**: Partition map into clusters $C = \{c_1, c_2, ..., c_k\}$
2. **Entrance Detection**: Find entrances between clusters $E = \{e_1, e_2, ..., e_m\}$
3. **Abstract Graph**: $G_{abstract} = (C, E)$ where edges represent cluster connections
4. **Path Refinement**: Convert abstract path to detailed path using local A*

**Cluster Size**: Typically 10×10 to 20×20 grid cells for optimal performance.

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { HPA } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
