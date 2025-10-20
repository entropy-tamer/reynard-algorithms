# LRU Cache

> Mathematical theory and implementation details for LRU Cache

## Mathematical Theory

**Data Structure Design**:

- **Doubly-Linked List**: Maintains access order (head = most recent, tail = least recent)
- **Hash Map**: Provides O(1) key-to-node lookup
- **Cache Eviction**: When size exceeds maxSize, remove tail node (least recently used)

**Access Pattern**:

1. **Cache Hit**: Move node to head of list
2. **Cache Miss**: Add new node to head, evict tail if necessary
3. **Update**: Move existing node to head

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { LRUCache } from "@entropy-tamer/reynard-algorithms";
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
