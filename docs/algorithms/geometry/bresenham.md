# Bresenham

> Mathematical theory and implementation details for Bresenham

## Mathematical Theory

**Mathematical Foundation**:

- **Line Equation**: $y = mx + b$ where $m = \frac{\Delta y}{\Delta x}$
- **Decision Variable**: $d = 2\Delta y - \Delta x$ for slope $|m| \leq 1$
- **Error Accumulation**: Track cumulative error to determine next pixel

**Key Properties**:

- **Integer Arithmetic**: Uses only integer operations
- **Pixel-Perfect**: Generates exact pixel representation of line
- **Efficiency**: $O(\max(|\Delta x|, |\Delta y|))$ time complexity

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { Bresenham } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
