# Theta*

> Mathematical theory and implementation details for Theta*

## Mathematical Theory

Theta*extends A* by allowing line-of-sight checks between nodes, enabling any-angle movement and smoother paths. It uses parent pointers that can point to any ancestor, not just immediate parents.

**Key Properties**:

- **Any-Angle Movement**: Allows movement in any direction
- **Line-of-Sight Checks**: Determines if direct paths are obstacle-free
- **Parent Pointer Updates**: Updates parent pointers to non-adjacent nodes

**Mathematical Foundation**:

For nodes $n$ and $s$ (start), Theta* checks:

1. **Line-of-Sight**: $LOS(parent(s), n) = \text{true}$ if direct path is obstacle-free
2. **Parent Update**: If $LOS(parent(s), n)$, then $parent(n) = parent(s)$
3. **Path Smoothing**: Direct paths replace grid-based paths when possible

**Line-of-Sight Algorithm**:

Using Bresenham's line algorithm to check if all grid cells along the line are free:

```
for each cell (x,y) on line from (x0,y0) to (x1,y1):
    if grid[x][y] is obstacle:
        return false
return true
```

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { Theta } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
