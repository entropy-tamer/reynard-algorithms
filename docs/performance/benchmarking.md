# Benchmarking Guide

This guide covers performance benchmarking and optimization strategies for the reynard-algorithms package.

## Built-in Benchmarking

All algorithms include comprehensive performance monitoring and benchmarking capabilities.

### Basic Benchmarking

```typescript
import { Benchmark } from '@entropy-tamer/reynard-algorithms';

// Create a benchmark
const benchmark = new Benchmark('Union-Find Operations');

// Start timing
benchmark.start();

// Perform operations
for (let i = 0; i < 1000000; i++) {
  uf.union(i % 1000, (i + 1) % 1000);
}

// End timing
benchmark.end();

// Get results
const results = benchmark.getResults();
console.log(`Operations: ${results.operations}`);
console.log(`Time: ${results.time}ms`);
console.log(`Ops/sec: ${results.opsPerSecond}`);
```

### Memory Benchmarking

```typescript
import { MemoryBenchmark } from '@entropy-tamer/reynard-algorithms';

const memoryBenchmark = new MemoryBenchmark('Memory Usage Test');

memoryBenchmark.start();
// Perform memory-intensive operations
memoryBenchmark.end();

const memoryResults = memoryBenchmark.getResults();
console.log(`Memory used: ${memoryResults.memoryUsed} bytes`);
console.log(`Peak memory: ${memoryResults.peakMemory} bytes`);
console.log(`Memory efficiency: ${memoryResults.efficiency}%`);
```

## Performance Monitoring

### Real-time Performance Tracking

```typescript
import { PerformanceMonitor } from '@entropy-tamer/reynard-algorithms';

const monitor = new PerformanceMonitor();

// Track different operations
monitor.startOperation('collision-detection');
// ... collision detection code ...
monitor.endOperation('collision-detection');

monitor.startOperation('pathfinding');
// ... pathfinding code ...
monitor.endOperation('pathfinding');

// Get performance report
const report = monitor.getReport();
console.log(report);
```

### Frame Rate Monitoring

```typescript
import { FrameRateMonitor } from '@entropy-tamer/reynard-algorithms';

const frameMonitor = new FrameRateMonitor();

// In your game loop
function gameLoop() {
  frameMonitor.startFrame();
  
  // Game logic here
  
  frameMonitor.endFrame();
  
  // Check if we need to adjust performance
  if (frameMonitor.getAverageFPS() < 60) {
    console.log('Performance warning: FPS below target');
  }
}
```

## Algorithm-Specific Benchmarks

### Union-Find Performance

```typescript
import { UnionFind } from '@entropy-tamer/reynard-algorithms';

function benchmarkUnionFind() {
  const sizes = [100, 1000, 10000, 100000];
  
  for (const size of sizes) {
    const uf = new UnionFind(size);
    const benchmark = new Benchmark(`Union-Find ${size} elements`);
    
    benchmark.start();
    
    // Perform random unions
    for (let i = 0; i < size * 2; i++) {
      const a = Math.floor(Math.random() * size);
      const b = Math.floor(Math.random() * size);
      uf.union(a, b);
    }
    
    benchmark.end();
    
    const results = benchmark.getResults();
    console.log(`${size} elements: ${results.opsPerSecond} ops/sec`);
  }
}
```

### Spatial Hash Performance

```typescript
import { SpatialHash } from '@entropy-tamer/reynard-algorithms';

function benchmarkSpatialHash() {
  const objectCounts = [100, 1000, 10000];
  const cellSizes = [25, 50, 100];
  
  for (const count of objectCounts) {
    for (const cellSize of cellSizes) {
      const spatialHash = new SpatialHash(cellSize);
      const objects = [];
      
      // Create test objects
      for (let i = 0; i < count; i++) {
        const obj = {
          id: i,
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          width: 10,
          height: 10
        };
        objects.push(obj);
        spatialHash.insert(obj);
      }
      
      const benchmark = new Benchmark(`Spatial Hash ${count} objects, cell size ${cellSize}`);
      benchmark.start();
      
      // Perform queries
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        spatialHash.query(x, y, 50, 50);
      }
      
      benchmark.end();
      
      const results = benchmark.getResults();
      console.log(`${count} objects, cell ${cellSize}: ${results.opsPerSecond} queries/sec`);
    }
  }
}
```

### A* Pathfinding Performance

```typescript
import { AStar, Point } from '@entropy-tamer/reynard-algorithms';

function benchmarkAStar() {
  const gridSizes = [50, 100, 200];
  const obstacleRatios = [0.1, 0.2, 0.3];
  
  for (const size of gridSizes) {
    for (const ratio of obstacleRatios) {
      const grid = createTestGrid(size, size, ratio);
      const pathfinder = new AStar();
      
      const benchmark = new Benchmark(`A* ${size}x${size} grid, ${ratio * 100}% obstacles`);
      benchmark.start();
      
      // Perform pathfinding
      for (let i = 0; i < 100; i++) {
        const start = new Point(0, 0);
        const goal = new Point(size - 1, size - 1);
        pathfinder.findPath(start, goal, grid);
      }
      
      benchmark.end();
      
      const results = benchmark.getResults();
      console.log(`${size}x${size}, ${ratio * 100}% obstacles: ${results.opsPerSecond} paths/sec`);
    }
  }
}

function createTestGrid(width: number, height: number, obstacleRatio: number): number[][] {
  const grid = Array(height).fill(null).map(() => Array(width).fill(0));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.random() < obstacleRatio) {
        grid[y][x] = 1;
      }
    }
  }
  
  return grid;
}
```

## Memory Pool Performance

### Memory Pool Benchmarking

```typescript
import { MemoryPool } from '@entropy-tamer/reynard-algorithms';

function benchmarkMemoryPool() {
  const pool = new MemoryPool(() => new AABB(0, 0, 0, 0));
  
  const benchmark = new Benchmark('Memory Pool Operations');
  benchmark.start();
  
  // Test allocation and deallocation
  for (let i = 0; i < 100000; i++) {
    const aabb = pool.get();
    aabb.x = i;
    aabb.y = i;
    aabb.width = 10;
    aabb.height = 10;
    
    // Simulate some work
    const area = aabb.width * aabb.height;
    
    pool.release(aabb);
  }
  
  benchmark.end();
  
  const results = benchmark.getResults();
  const stats = pool.getStats();
  
  console.log(`Pool operations: ${results.opsPerSecond} ops/sec`);
  console.log(`Pool efficiency: ${stats.efficiency}%`);
  console.log(`Pool size: ${stats.size}`);
}
```

## Performance Optimization Strategies

### Algorithm Selection

```typescript
import { AlgorithmSelector } from '@entropy-tamer/reynard-algorithms';

const selector = new AlgorithmSelector();

// The selector automatically chooses the best algorithm based on data size
const bestAlgorithm = selector.selectAlgorithm('collision-detection', {
  objectCount: 1000,
  worldSize: { width: 1000, height: 1000 },
  updateFrequency: 60
});

console.log(`Best algorithm: ${bestAlgorithm}`);
```

### Memory Optimization

```typescript
import { MemoryOptimizer } from '@entropy-tamer/reynard-algorithms';

const optimizer = new MemoryOptimizer();

// Optimize memory usage for your specific use case
const optimizedConfig = optimizer.optimize({
  maxObjects: 10000,
  averageObjectSize: 32,
  memoryBudget: 1024 * 1024 // 1MB
});

console.log('Optimized configuration:', optimizedConfig);
```

### Performance Budgets

```typescript
import { PerformanceBudget } from '@entropy-tamer/reynard-algorithms';

const budget = new PerformanceBudget({
  targetFPS: 60,
  maxFrameTime: 16.67, // 60 FPS = 16.67ms per frame
  memoryLimit: 100 * 1024 * 1024 // 100MB
});

// Check if operations fit within budget
if (budget.canAfford('collision-detection', 1000)) {
  // Perform collision detection
  performCollisionDetection();
} else {
  // Skip or reduce quality
  console.log('Skipping collision detection to maintain performance');
}
```

## Profiling and Analysis

### Performance Profiling

```typescript
import { Profiler } from '@entropy-tamer/reynard-algorithms';

const profiler = new Profiler();

// Start profiling
profiler.start();

// Your application code here
runGameLoop();

// Stop profiling and get report
profiler.stop();
const profile = profiler.getProfile();

console.log('Performance Profile:');
console.log(`Total time: ${profile.totalTime}ms`);
console.log(`Hot spots:`, profile.hotSpots);
console.log(`Memory usage:`, profile.memoryUsage);
```

### Performance Regression Testing

```typescript
import { PerformanceTest } from '@entropy-tamer/reynard-algorithms';

const performanceTest = new PerformanceTest();

// Define performance expectations
performanceTest.expect('union-find', {
  minOpsPerSecond: 1000000,
  maxMemoryUsage: 1024 * 1024 // 1MB
});

performanceTest.expect('spatial-hash', {
  minOpsPerSecond: 100000,
  maxMemoryUsage: 512 * 1024 // 512KB
});

// Run tests
const results = performanceTest.run();

if (results.passed) {
  console.log('All performance tests passed!');
} else {
  console.log('Performance regression detected:', results.failures);
}
```

## Best Practices

1. **Profile before optimizing** - Always measure before making changes
2. **Use appropriate benchmarks** - Choose benchmarks that match your use case
3. **Monitor continuously** - Set up continuous performance monitoring
4. **Set performance budgets** - Define clear performance targets
5. **Test with realistic data** - Use data that matches your production environment
6. **Consider memory usage** - Don't just optimize for speed
7. **Use memory pools** - For high-frequency allocations
8. **Cache results** - When appropriate to avoid redundant calculations
9. **Choose the right algorithm** - Based on your data size and access patterns
10. **Monitor frame rates** - Especially important for real-time applications

## Performance Metrics

### Key Metrics to Monitor

- **Operations per second** - Raw throughput
- **Memory usage** - Peak and average memory consumption
- **Cache hit rates** - For caching algorithms
- **Frame rate** - For real-time applications
- **Latency** - Time for individual operations
- **Memory efficiency** - How well memory pools are utilized

### Benchmarking Tools

- **Built-in Benchmark** - For basic timing measurements
- **MemoryBenchmark** - For memory usage analysis
- **PerformanceMonitor** - For real-time monitoring
- **FrameRateMonitor** - For frame rate tracking
- **Profiler** - For detailed performance analysis
- **PerformanceTest** - For regression testing

This comprehensive benchmarking approach ensures optimal performance across all use cases and helps identify performance bottlenecks early in development.
