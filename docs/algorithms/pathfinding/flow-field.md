# Flow Field

> Mathematical theory and implementation details for Flow Field

## Mathematical Theory

Flow fields create a vector field that guides agents from any position to the goal. The field is generated using Dijkstra's algorithm to create an integration field, then converted to flow vectors.

**Key Properties**:

- **Potential Fields**: Scalar field representing distance to goal
- **Integration Field**: Generated using Dijkstra's algorithm
- **Flow Vectors**: Normalized gradients pointing toward the goal

**Mathematical Foundation**:

1. **Integration Field**: $I(x,y) = \min_{(x',y') \in neighbors} I(x',y') + cost(x',y')$
2. **Flow Vector**: $\vec{F}(x,y) = -\nabla I(x,y) = -\left(\frac{\partial I}{\partial x}, \frac{\partial I}{\partial y}\right)$
3. **Normalization**: $\vec{F}_{norm}(x,y) = \frac{\vec{F}(x,y)}{|\vec{F}(x,y)|}$

**Cost Function**:

- **Free Space**: $cost = 1$
- **Obstacles**: $cost = \infty$
- **Goal**: $cost = 0$

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { FlowField } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
