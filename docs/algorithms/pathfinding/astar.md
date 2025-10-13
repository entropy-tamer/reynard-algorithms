# A*

> Mathematical theory and implementation details for A*

## Mathematical Theory

**Mathematical Foundation**:

- **Cost Function**: $f(n) = g(n) + h(n)$ where:
  - $g(n)$ = actual cost from start to node $n$
  - $h(n)$ = heuristic estimate from node $n$ to goal
- **Admissible Heuristic**: $h(n) \leq h^*(n)$ where $h^*(n)$ is true cost
- **Optimality**: Guarantees optimal solution when heuristic is admissible
- **Completeness**: Guarantees solution if one exists

**Key Properties**:

- **Optimal**: Finds shortest path when heuristic is admissible
- **Efficient**: Uses heuristic to focus search
- **Complete**: Always finds solution if one exists

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { A } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
