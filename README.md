# reynard-algorithms

> Algorithm primitives and data structures for Reynard applications

A comprehensive collection of reusable algorithmic building blocks with automatic optimization, memory pooling, and performance monitoring. Built with the PAW optimization framework for maximum efficiency.

## Features

- **🦊 Optimized Algorithms** - Automatic algorithm selection with memory pooling and performance monitoring
- **🔧 PAW Optimization Framework** - Intelligent heuristic-based algorithm selection with performance monitoring
- **⚡ Performance Utilities** - Comprehensive benchmarking, profiling, and monitoring tools

### Data Structures

- **🔗 Union-Find** - Efficient set operations, cycle detection, and connected components
- **🌸 Bloom Filter** - Space-efficient probabilistic data structure for membership testing
- **⚡ Priority Queue** - Binary heap implementation with O(log n) operations
- **🔄 LRU Cache** - Least Recently Used cache with O(1) access operations
- **📊 Fenwick Tree** - Binary Indexed Tree for efficient range sum queries
- **📅 Interval Tree** - Efficient interval overlap queries and range operations
- **🌳 Segment Tree** - Range query and update operations in O(log n) time
- **🔤 Trie** - Prefix tree for efficient string operations and autocomplete

### Spatial Structures

- **🗺️ Spatial Hashing** - Efficient spatial partitioning and nearest neighbor queries
- **🌲 Quadtree** - Recursive spatial partitioning for 2D spatial queries
- **🌳 R-Tree** - Balanced tree structure for efficient spatial indexing
- **🌲 K-d Tree** - Multi-dimensional space partitioning for nearest neighbor searches
- **🧊 Octree** - 3D spatial partitioning for efficient 3D queries and ray tracing
- **📦 BVH** - Bounding Volume Hierarchy for collision detection and ray tracing

### Geometry Operations

- **📐 Basic Geometry** - Complete 2D geometric calculations and transformations (Point, Vector, Line, Rectangle, Circle, Polygon)
- **📏 Bresenham's Line** - Efficient line drawing algorithm for pixel-perfect graphics
- **🔺 Delaunay Triangulation** - Optimal triangulation using Bowyer-Watson algorithm
- **🛡️ Convex Hull** - Multiple algorithms (Graham Scan, Jarvis March, QuickHull)
- **🏔️ Marching Squares** - Contour generation from scalar field data
- **🌊 Simplex Noise** - High-quality procedural noise generation (2D, 3D, 4D)
- **🎯 Poisson Disk Sampling** - High-quality point distribution algorithms
- **🌊 Wave Function Collapse** - Constraint-based procedural generation
- **🔷 Voronoi Diagram** - Space partitioning for nearest neighbor queries and coverage analysis
- **✂️ Polygon Clipping** - Boolean operations on polygons (Sutherland-Hodgman, Weiler-Atherton)
- **⚡ Line Segment Intersection** - Efficient intersection detection using Bentley-Ottmann algorithm
- **📐 OBB** - Oriented Bounding Box for rotated object collision detection
- **📏 Min Bounding Box** - Minimum area rectangle using rotating calipers algorithm

### Collision Detection

- **💥 AABB Collision Detection** - Advanced collision detection with spatial optimization
- **🔀 SAT Collision** - Separating Axis Theorem for convex polygon collision detection
- **🔄 Sweep and Prune** - Broad-phase collision detection for dynamic scenes

### Pathfinding Algorithms

- **⭐ A\* Pathfinding** - Optimal pathfinding with multiple heuristics and caching
- **⚡ JPS** - Jump Point Search for optimized grid-based pathfinding
- **📐 Theta\*** - Any-angle pathfinding for smooth path generation
- **🌊 Flow Field** - Potential field pathfinding for crowd simulation
- **🏗️ HPA\*** - Hierarchical Pathfinding for large-scale pathfinding

## Installation

```bash
npm install @entropy-tamer/reynard-algorithms
```

## Quick Start

```typescript
import { UnionFind, PriorityQueue, AABB } from '@entropy-tamer/reynard-algorithms';

// Union-Find for connected components
const uf = new UnionFind(10);
uf.union(0, 1);
console.log(uf.connected(0, 1)); // true

// Priority Queue for efficient ordering
const pq = new PriorityQueue<number>();
pq.push(3, 1);
pq.push(1, 3);
console.log(pq.pop()); // 1 (highest priority)

// AABB collision detection
const box1 = new AABB(0, 0, 10, 10);
const box2 = new AABB(5, 5, 15, 15);
console.log(box1.intersects(box2)); // true
```

## Documentation

For detailed documentation, mathematical theory, and comprehensive examples, see the [Documentation](./docs/README.md) directory.

### Key Documentation Sections

- **[Mathematical Theory](./docs/mathematical-theory/)** - Mathematical foundations and proofs
- **[Algorithm Guides](./docs/algorithms/)** - Detailed implementation guides
- **[Examples](./docs/examples/)** - Usage examples and best practices
- **[Performance Analysis](./docs/performance/)** - Benchmarks and optimization strategies

## Performance

All algorithms include comprehensive performance monitoring and optimization:

- **Memory Pooling** - Automatic memory management for high-frequency operations
- **Benchmarking** - Built-in performance measurement tools
- **Optimization** - PAW framework for automatic algorithm selection
- **Monitoring** - Real-time performance tracking and analysis

## Examples

See the [examples](./examples/) directory for complete usage examples:

- **[Basic Usage](./examples/basic-usage.ts)** - Getting started with core algorithms
- **[Game Engine Integration](./examples/game-engine-integration.ts)** - Using algorithms in game development

## API Reference

### Data Structures

```typescript
// Union-Find
class UnionFind {
  constructor(size: number);
  find(x: number): number;
  union(x: number, y: number): boolean;
  connected(x: number, y: number): boolean;
}

// Priority Queue
class PriorityQueue<T> {
  push(item: T, priority: number): void;
  pop(): T | undefined;
  peek(): T | undefined;
  size(): number;
  isEmpty(): boolean;
}

// LRU Cache
class LRUCache<K, V> {
  constructor(capacity: number);
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
}
```

### Geometry

```typescript
// Basic shapes
class Point { x: number; y: number; }
class Vector { x: number; y: number; }
class Rectangle { x: number; y: number; width: number; height: number; }
class Circle { x: number; y: number; radius: number; }

// Collision detection
class AABB {
  constructor(x: number, y: number, width: number, height: number);
  intersects(other: AABB): boolean;
  contains(point: Point): boolean;
}
```

### Pathfinding

```typescript
// A* Pathfinding
class AStar {
  findPath(start: Point, goal: Point, grid: Grid): Point[];
  setHeuristic(heuristic: HeuristicFunction): void;
}

// Flow Field
class FlowField {
  generate(goal: Point, obstacles: Obstacle[]): void;
  getDirection(position: Point): Vector;
}
```

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Related Packages

- **[reynard-core](../core/)** - Core Reynard framework utilities
- **[reynard-ui](../ui/)** - UI components and primitives
- **[reynard-testing](../testing/)** - Testing utilities and helpers

---

For more information, visit the [Reynard Documentation](https://github.com/entropy-tamer/reynard) or check out our [examples](./examples/).
