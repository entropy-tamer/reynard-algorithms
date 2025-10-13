# Bloom Filter

> Mathematical theory and implementation details for Bloom Filter

## Mathematical Theory

**Mathematical Foundation**:
A Bloom Filter consists of a bit array of size $m$ and $k$ independent hash functions. For optimal performance:

**Optimal Bit Array Size**:
$$m = -\frac{n \cdot \ln(p)}{(\ln(2))^2}$$

**Optimal Number of Hash Functions**:
$$k = \frac{m}{n} \cdot \ln(2)$$

**False Positive Rate**:
$$P_{false} = \left(1 - e^{-\frac{kn}{m}}\right)^k$$

Where:

- $n$ = expected number of elements
- $p$ = desired false positive rate
- $m$ = bit array size
- $k$ = number of hash functions

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { BloomFilter } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
