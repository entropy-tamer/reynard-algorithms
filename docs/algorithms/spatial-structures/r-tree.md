# R-Tree

> Mathematical theory and implementation details for R-Tree

## Mathematical Theory

**Mathematical Foundation**:

- **Balanced Tree**: All leaves at same level
- **Min/Max Entries**: Each node contains between $m$ and $M$ entries
- **Bounding Rectangle**: Each node has minimum bounding rectangle (MBR)
- **Tree Height**: $h = \lceil \log_M(n) \rceil$ where $n$ is number of objects
- **Overlap Minimization**: Minimizes overlap between bounding rectangles

**Key Properties**:

- **Spatial Indexing**: Efficient spatial access and queries
- **Balanced Structure**: Guarantees logarithmic search time
- **Range Queries**: Fast spatial range queries

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { RTree } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
