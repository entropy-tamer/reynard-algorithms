# Priority Queue

> Mathematical theory and implementation details for Priority Queue

## Mathematical Theory

**Binary Heap Properties**:

- **Heap Property**: In a max-heap, parent priority ≥ children priority
- **Complete Binary Tree**: All levels are filled except possibly the last level
- **Height**: $h = \lfloor \log_2(n) \rfloor$ where $n$ is the number of elements

**Index Relationships**:

- **Parent Index**: $\text{parent}(i) = \lfloor \frac{i-1}{2} \rfloor$
- **Left Child**: $\text{left}(i) = 2i + 1$
- **Right Child**: $\text{right}(i) = 2i + 2$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { PriorityQueue } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
