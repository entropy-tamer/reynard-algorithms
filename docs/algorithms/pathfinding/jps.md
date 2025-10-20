# JPS

> Mathematical theory and implementation details for JPS

## Mathematical Theory

JPS eliminates redundant path exploration by identifying "jump points" - nodes that are essential for finding optimal paths. The algorithm uses pruning rules to skip nodes that can be reached more efficiently through other paths.

**Key Properties**:

- **Symmetry Elimination**: Removes redundant path exploration
- **Jump Point Identification**: Identifies critical nodes for optimal paths
- **Pruning Rules**: Skips intermediate nodes that don't contribute to optimality

**Mathematical Foundation**:

For a grid with obstacles, JPS identifies jump points using these rules:

1. **Forced Neighbors**: A neighbor is forced if it's the only way to reach certain nodes
2. **Natural Neighbors**: Neighbors that don't require forced neighbor checks
3. **Jump Conditions**: A node is a jump point if it has forced neighbors or is the goal

**Pruning Rules**:

- **Horizontal/Vertical**: Jump if forced neighbor exists or goal is reached
- **Diagonal**: Jump if any horizontal/vertical direction has forced neighbors
- **Jump Distance**: Continue jumping until obstacle, forced neighbor, or goal

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { JPS } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
