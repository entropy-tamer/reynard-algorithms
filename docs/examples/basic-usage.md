# Basic Usage Examples

This guide provides practical examples of using the reynard-algorithms package in your applications.

## Union-Find

Union-Find is perfect for connected components, cycle detection, and network analysis.

```typescript
import { UnionFind } from '@entropy-tamer/reynard-algorithms';

// Initialize with 10 elements
const uf = new UnionFind(10);

// Connect elements
uf.union(0, 1);
uf.union(1, 2);
uf.union(3, 4);

// Check connections
console.log(uf.connected(0, 2)); // true (0-1-2 are connected)
console.log(uf.connected(0, 3)); // false (different components)

// Find root representatives
console.log(uf.find(0)); // 0 (or 1 or 2, depending on path compression)
console.log(uf.find(3)); // 3 (or 4)
```

## Priority Queue

Use PriorityQueue for efficient ordering and task scheduling.

```typescript
import { PriorityQueue } from '@entropy-tamer/reynard-algorithms';

// Create a priority queue (lower numbers = higher priority)
const pq = new PriorityQueue<string>();

// Add items with priorities
pq.push('urgent task', 1);
pq.push('normal task', 5);
pq.push('low priority task', 10);

// Process items in priority order
while (!pq.isEmpty()) {
  const task = pq.pop();
  console.log(`Processing: ${task}`);
}
// Output: Processing: urgent task
//         Processing: normal task
//         Processing: low priority task
```

## LRU Cache

LRU Cache provides efficient caching with automatic eviction.

```typescript
import { LRUCache } from '@entropy-tamer/reynard-algorithms';

// Create cache with capacity of 3
const cache = new LRUCache<string, number>(3);

// Add items
cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

// Access items (makes them recently used)
console.log(cache.get('a')); // 1

// Add new item (evicts least recently used 'b')
cache.set('d', 4);

console.log(cache.has('b')); // false (evicted)
console.log(cache.has('a')); // true (still in cache)
```

## AABB Collision Detection

Axis-Aligned Bounding Box collision detection for games and simulations.

```typescript
import { AABB, Point } from '@entropy-tamer/reynard-algorithms';

// Create bounding boxes
const player = new AABB(10, 10, 20, 30); // x, y, width, height
const obstacle = new AABB(25, 20, 15, 15);

// Check collision
if (player.intersects(obstacle)) {
  console.log('Collision detected!');
}

// Check if point is inside
const mousePos = new Point(15, 25);
if (player.contains(mousePos)) {
  console.log('Mouse is over player');
}
```

## Spatial Hashing

Efficient spatial partitioning for collision detection and queries.

```typescript
import { SpatialHash } from '@entropy-tamer/reynard-algorithms';

// Create spatial hash with cell size of 50
const spatialHash = new SpatialHash(50);

// Add objects
const obj1 = { id: 1, x: 25, y: 25, width: 10, height: 10 };
const obj2 = { id: 2, x: 30, y: 30, width: 10, height: 10 };

spatialHash.insert(obj1);
spatialHash.insert(obj2);

// Query nearby objects
const nearby = spatialHash.query(25, 25, 20, 20);
console.log(nearby.length); // 2 (both objects are nearby)
```

## A* Pathfinding

Optimal pathfinding for games and navigation.

```typescript
import { AStar, Point } from '@entropy-tamer/reynard-algorithms';

// Create pathfinder
const pathfinder = new AStar();

// Define grid (0 = walkable, 1 = obstacle)
const grid = [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0]
];

// Find path from top-left to bottom-right
const start = new Point(0, 0);
const goal = new Point(4, 4);

const path = pathfinder.findPath(start, goal, grid);
console.log(path); // Array of points representing the optimal path
```

## Performance Monitoring

All algorithms include built-in performance monitoring.

```typescript
import { Benchmark } from '@entropy-tamer/reynard-algorithms';

// Create benchmark
const benchmark = new Benchmark('Union-Find Operations');

// Measure performance
benchmark.start();
for (let i = 0; i < 1000000; i++) {
  uf.union(i % 1000, (i + 1) % 1000);
}
benchmark.end();

console.log(benchmark.getResults());
// Output: { operations: 1000000, time: 45.2, opsPerSecond: 22123893 }
```

## Memory Pooling

Automatic memory management for high-frequency operations.

```typescript
import { MemoryPool } from '@entropy-tamer/reynard-algorithms';

// Create memory pool for AABB objects
const pool = new MemoryPool(() => new AABB(0, 0, 0, 0));

// Get object from pool
const aabb = pool.get();
aabb.x = 10;
aabb.y = 20;
aabb.width = 30;
aabb.height = 40;

// Use the object...

// Return to pool when done
pool.release(aabb);
```

## Best Practices

1. **Use appropriate data structures** for your use case
2. **Monitor performance** with built-in benchmarking tools
3. **Leverage memory pooling** for high-frequency operations
4. **Choose the right algorithm** based on your data size and access patterns
5. **Use spatial structures** for collision detection and spatial queries

For more advanced examples, see the [Game Engine Integration](./game-engine-integration.md) guide.
