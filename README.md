# reynard-algorithms

> Algorithm primitives and data structures for Reynard applications

A comprehensive collection of reusable algorithmic building blocks with automatic optimization, memory pooling, and
performance monitoring. Built with the PAW optimization framework for maximum efficiency.

## Features

- **🦊 Optimized Algorithms** - Automatic algorithm selection with memory pooling and performance monitoring
- **🔧 PAW Optimization Framework** - Intelligent workload analysis and adaptive optimization
- **🔗 Union-Find Algorithm** - Efficient set operations, cycle detection, and connected components
- **💥 AABB Collision Detection** - Advanced collision detection with spatial optimization
- **🗺️ Spatial Hashing** - Efficient spatial partitioning and nearest neighbor queries
- **⚡ Performance Utilities** - Comprehensive benchmarking, profiling, and monitoring tools
- **📐 Geometry Operations** - Complete 2D geometric calculations and transformations

## Installation

```bash
npm install reynard-algorithms
```

## Quick Start

```typescript
import {
  // Optimized algorithms with automatic selection
  detectCollisions,
  PerformanceMonitor,
  OptimizationConfig,

  // Core algorithms
  UnionFind,
  detectCycle,
  findConnectedComponents,
  SpatialHash,

  // Performance utilities
  PerformanceTimer,
  PerformanceBenchmark,
  throttle,
  debounce,

  // Geometry operations
  checkCollision,
  PointOps,
  VectorOps,
  RectangleOps,
  CircleOps,
} from "reynard-algorithms";

// 🦊 Optimized collision detection with automatic algorithm selection
const aabbs = [
  { x: 0, y: 0, width: 100, height: 100 },
  { x: 50, y: 50, width: 100, height: 100 },
  { x: 200, y: 200, width: 50, height: 50 },
];
const collisions = detectCollisions(aabbs);
console.log(`Found ${collisions.length} collisions`);

// 🔧 Performance monitoring and optimization
const monitor = new PerformanceMonitor();
const stats = monitor.getPerformanceStats();
console.log(`Current performance: ${stats.averageExecutionTime}ms`);

// 🔗 Union-Find for connected components
const uf = new UnionFind(10);
uf.union(0, 1);
uf.union(1, 2);
console.log(uf.connected(0, 2)); // true

// 🗺️ Spatial hashing for efficient queries
const spatialHash = new SpatialHash({ cellSize: 100 });
spatialHash.insert({ id: "1", x: 50, y: 50, data: { name: "object1" } });
const nearby = spatialHash.queryRadius(0, 0, 100);

// ⚡ Performance timing and benchmarking
const timer = new PerformanceTimer();
timer.start();
// ... perform operation
const duration = timer.stop();

// 📐 Geometry operations
const point1 = PointOps.create(0, 0);
const point2 = PointOps.create(3, 4);
const distance = PointOps.distance(point1, point2); // 5
```

## API Reference

### Optimized Algorithms

The optimized algorithms module provides automatic algorithm selection, memory pooling, and
performance monitoring for maximum efficiency.

```typescript
import {
  detectCollisions,
  performSpatialQuery,
  PerformanceMonitor,
  OptimizationConfig,
  configureOptimization,
  cleanup,
} from "reynard-algorithms";

// Automatic collision detection with optimization
const aabbs = [
  { x: 0, y: 0, width: 100, height: 100 },
  { x: 50, y: 50, width: 100, height: 100 },
];
const collisions = detectCollisions(aabbs);

// Performance monitoring
const monitor = new PerformanceMonitor();
const stats = monitor.getPerformanceStats();
const recommendations = monitor.getOptimizationRecommendations();

// Configuration management
const config = new OptimizationConfig({
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  algorithmSelectionStrategy: "adaptive",
});
```

### 🔧 PAW Optimization Framework

The PAW (Performance-Aware Workload) optimization framework provides intelligent algorithm selection and
memory management.

```typescript
import {
  AlgorithmSelector,
  EnhancedMemoryPool,
  OptimizedCollisionAdapter,
  type WorkloadCharacteristics,
  type MemoryPoolConfig,
} from "reynard-algorithms";

// Algorithm selection based on workload characteristics
const selector = new AlgorithmSelector();
const characteristics: WorkloadCharacteristics = {
  objectCount: 1000,
  spatialDistribution: "clustered",
  updateFrequency: "high",
};
const optimalAlgorithm = selector.selectOptimalAlgorithm(characteristics);

// Enhanced memory pooling
const memoryPool = new EnhancedMemoryPool({
  initialSize: 1024,
  growthFactor: 2,
  maxSize: 10240,
});

// Optimized collision adapter
const adapter = new OptimizedCollisionAdapter({
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  performanceThresholds: {
    maxExecutionTime: 16,
    maxMemoryUsage: 50 * 1024 * 1024,
    minHitRate: 90,
  },
});
```

### Union-Find Algorithm

```typescript
import { UnionFind, detectCycle, findConnectedComponents } from "reynard-algorithms";

const uf = new UnionFind(10);
uf.union(0, 1);
uf.connected(0, 1); // true
uf.getSetSize(0); // 2
uf.getStats(); // Performance statistics

// Utility functions
const hasCycle = detectCycle([
  [0, 1],
  [1, 2],
  [2, 0],
]); // true
const components = findConnectedComponents([
  [0, 1],
  [2, 3],
]); // [[0, 1], [2, 3]]
```

### AABB Collision Detection

```typescript
import { checkCollision, batchCollisionDetection, AABB } from "reynard-algorithms";

const aabb1: AABB = { x: 0, y: 0, width: 100, height: 100 };
const aabb2: AABB = { x: 50, y: 50, width: 100, height: 100 };

const result = checkCollision(aabb1, aabb2);
console.log(result.colliding); // true
console.log(result.overlapArea); // 2500

// Batch collision detection
const aabbs = [aabb1, aabb2, { x: 200, y: 200, width: 50, height: 50 }];
const collisions = batchCollisionDetection(aabbs);
```

### Spatial Hashing

```typescript
import { SpatialHash, createOptimizedSpatialHash } from "reynard-algorithms";

const spatialHash = new SpatialHash<{ name: string }>({
  cellSize: 100,
  maxObjectsPerCell: 50,
});

spatialHash.insert({
  id: "1",
  x: 50,
  y: 50,
  data: { name: "object1" },
});

const objectsInRect = spatialHash.queryRect(0, 0, 100, 100);
const objectsInRadius = spatialHash.queryRadius(0, 0, 100);
const nearest = spatialHash.findNearest(0, 0);
```

### ⚡ Performance Utilities

Comprehensive performance monitoring and optimization toolkit with useful features.

```typescript
import {
  // Core performance utilities
  PerformanceTimer,
  PerformanceBenchmark,
  measureAsync,
  measureSync,

  // Memory monitoring
  MemoryMonitor,
  MemoryLeakDetector,

  // Frame rate monitoring
  FrameRateMonitor,

  // Throttling and debouncing
  throttle,
  debounce,

  // Performance budgets
  PerformanceBudgetChecker,

  // Memory pool optimizations
  MemoryPoolCore,
  MemoryPoolUtils,
} from "reynard-algorithms";

// High-precision performance timing
const timer = new PerformanceTimer();
timer.start();
// ... perform operation
const duration = timer.stop();

// Memory monitoring and leak detection
const monitor = new MemoryMonitor();
const usage = monitor.measure();
const leakDetector = new MemoryLeakDetector();
const leaks = leakDetector.detectLeaks();

// Frame rate monitoring
const frameMonitor = new FrameRateMonitor();
frameMonitor.start();
const fps = frameMonitor.getCurrentFPS();

// Advanced benchmarking
const benchmark = new PerformanceBenchmark();
const metrics = await benchmark.run(() => {
  // Function to benchmark
}, 10);

// Performance budgets
const budgetChecker = new PerformanceBudgetChecker({
  maxExecutionTime: 16,
  maxMemoryUsage: 50 * 1024 * 1024,
});
const isWithinBudget = budgetChecker.checkPerformance(metrics);

// Throttling and debouncing
const throttledFn = throttle(() => console.log("throttled"), 1000);
const debouncedFn = debounce(() => console.log("debounced"), 500);
```

### 📐 Geometry Operations

Complete 2D geometry toolkit with collision detection, shape algorithms, and transformations.

```typescript
import {
  // Collision detection
  checkCollision,
  batchCollisionDetection,
  type AABB,
  type CollisionPair,

  // Shape algorithms
  PointOps,
  LineOps,
  RectangleOps,
  CircleOps,
  PolygonOps,

  // Vector operations
  VectorOps,

  // Transformations
  TransformOps,

  // Types
  type Point,
  type Vector,
  type Line,
  type Rectangle,
  type Circle,
  type Polygon,
} from "reynard-algorithms";

// AABB collision detection
const aabb1: AABB = { x: 0, y: 0, width: 100, height: 100 };
const aabb2: AABB = { x: 50, y: 50, width: 100, height: 100 };
const collision = checkCollision(aabb1, aabb2);
console.log(collision.colliding); // true
console.log(collision.overlapArea); // 2500

// Point operations
const point1 = PointOps.create(0, 0);
const point2 = PointOps.create(3, 4);
const distance = PointOps.distance(point1, point2); // 5
const midpoint = PointOps.midpoint(point1, point2); // { x: 1.5, y: 2 }

// Vector operations
const vector1 = VectorOps.create(1, 0);
const vector2 = VectorOps.create(0, 1);
const dot = VectorOps.dot(vector1, vector2); // 0
const magnitude = VectorOps.magnitude(vector1); // 1

// Rectangle operations
const rect = RectangleOps.create(0, 0, 100, 50);
const area = RectangleOps.area(rect); // 5000
const center = RectangleOps.center(rect); // { x: 50, y: 25 }

// Circle operations
const circle = CircleOps.create(0, 0, 50);
const circumference = CircleOps.circumference(circle); // ~314.16
const intersects = CircleOps.intersects(circle, point1); // true

// Polygon operations
const polygon = PolygonOps.create([
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
]);
const polygonArea = PolygonOps.area(polygon); // 100
const contains = PolygonOps.contains(polygon, { x: 5, y: 5 }); // true

// Transform operations
const transform = TransformOps.combine(TransformOps.translate(10, 20), TransformOps.scale(2, 2));
const transformedPoint = TransformOps.applyToPoint(transform, point1);
```

## Performance Considerations

### Optimized Algorithms Performance

- **Automatic Algorithm Selection**: Intelligently chooses optimal algorithms based on workload characteristics
- **Memory Pooling**: Eliminates allocation overhead with pre-allocated memory pools
- **Performance Monitoring**: Real-time performance tracking with adaptive optimization
- **Time Complexity**: O(1) to O(n log n) depending on selected algorithm and workload
- **Space Complexity**: O(n) with memory pooling optimizations

### 🔧 PAW Optimization Framework Performance

- **Workload Analysis**: Analyzes object count, spatial distribution, and update frequency
- **Adaptive Selection**: Automatically switches between naive, spatial, and optimized algorithms
- **Memory Management**: Enhanced memory pooling with configurable growth strategies
- **Performance Thresholds**: Configurable limits for execution time, memory usage, and hit rates

### Union-Find Algorithm Performance

- **Time Complexity**: O(α(n)) for union and find operations (where α is the inverse Ackermann function)
- **Space Complexity**: O(n) where n is the number of elements
- **Optimizations**: Path compression and union by rank for optimal performance

### AABB Collision Detection Performance

- **Time Complexity**: O(1) for single collision check, O(n²) for naive batch detection
- **Space Complexity**: O(n) for batch detection
- **Optimizations**: Spatial hashing, batch processing, and memory pooling for large datasets

### Spatial Hashing Performance

- **Time Complexity**: O(1) average case for queries, O(n) worst case
- **Space Complexity**: O(n) where n is the number of objects
- **Optimizations**: Dynamic cell sizing, automatic cleanup, and memory-efficient storage

### Performance Utilities Performance

- **Memory Overhead**: Minimal for basic operations with memory pooling
- **Accuracy**: High-precision timing using `performance.now()` with microsecond precision
- **Optimizations**: Memory leak detection, frame rate monitoring, and performance budgets
- **Monitoring**: Real-time performance tracking with comprehensive statistics

### Geometry Operations Performance

- **Time Complexity**: O(1) for most operations, O(n) for polygon operations
- **Space Complexity**: O(1) for most operations, O(n) for polygon operations
- **Optimizations**: Efficient mathematical calculations, minimal object creation, and optimized algorithms

## Advanced Features

### Memory Pool Management

The algorithms package includes memory pool management for high-performance applications:

```typescript
import { EnhancedMemoryPool, MemoryPoolCore } from "reynard-algorithms";

// Configure memory pools for different workloads
const collisionPool = new EnhancedMemoryPool({
  initialSize: 1024,
  growthFactor: 2,
  maxSize: 10240,
});

const spatialPool = new EnhancedMemoryPool({
  initialSize: 2048,
  growthFactor: 1.5,
  maxSize: 20480,
});
```

### Performance Budgets

Set and monitor performance budgets to ensure optimal application performance:

```typescript
import { PerformanceBudgetChecker } from "reynard-algorithms";

const budget = new PerformanceBudgetChecker({
  maxExecutionTime: 16, // 60fps target
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB limit
  maxFrameDrops: 5, // Allow 5 frame drops per second
});

// Check if current performance is within budget
const isWithinBudget = budget.checkPerformance(currentMetrics);
```

### Algorithm Selection Strategies

Choose from multiple algorithm selection strategies based on your application needs:

- **`naive`**: Always use the simplest algorithm
- **`spatial`**: Always use spatial partitioning
- **`optimized`**: Always use the most optimized algorithm
- **`adaptive`**: Automatically select based on workload analysis (recommended)

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Type checking
npm run typecheck

# Build the package
npm run build
```

## License

MIT License - see [LICENSE](../../../LICENSE.md) for details.
