# PAW Performance Optimization Report

## Overview

PAW (Performance Adaptive Workflows) provides algorithm selection, memory pooling, and performance caching for the algorithms package. This report documents the current implementation and empirical benchmark results.

## Benchmark Results

### Current Performance (April 2026)

| Test Case                     | Speedup | Standard Time | Optimized Time | Memory Delta |
| ----------------------------- | ------- | ------------- | -------------- | ------------ |
| Micro Grid - Rapid Fire       | 1.98x   | 18.18ms       | 9.20ms         | +17.2MB      |
| Small Grid - Low Complexity   | 1.25x   | 88.15ms       | 70.48ms        | +0.5MB       |
| Medium Grid - High Complexity | 1.09x   | 196.57ms      | 180.95ms       | +11.8MB      |
| Medium Grid - Standard        | 1.03x   | 688.98ms      | 671.73ms       | -2.1MB       |
| Very Large Grid - Stress Test | 1.03x   | 34,786ms      | 33,879ms       | +5.9MB       |
| Small Grid - High Complexity  | 0.93x   | 67.73ms       | 73.11ms        | +4.6MB       |
| Large Grid - High Complexity  | 0.95x   | 237.93ms      | 249.75ms       | +13.4MB      |
| Large Grid - Standard         | 0.91x   | 2,579ms       | 2,849ms        | +18.9MB      |

**Summary Statistics:**

- Average Speedup: 1.14x
- Best Speedup: 1.98x (Micro Grid)
- Worst Speedup: 0.91x (Large Grid Standard)

### Performance Analysis

The benchmarks show mixed results:

- **Micro grids (10x10)**: Significant improvement (1.98x) due to efficient memory pooling
- **Small to medium grids**: Modest improvements (1.03x - 1.25x)
- **Large grids (100x100+)**: Performance regression (0.91x - 0.95x) - overhead exceeds benefits
- **High complexity**: Minimal improvement or regression

### Optimization Opportunities

Based on benchmark analysis:

1. **Algorithm Selection Logic**: Many tests show minimal speedup, indicating selection logic needs refinement
2. **Memory Pooling**: Inefficient for large grids - overhead exceeds allocation savings
3. **Large Grid Clustering**: Performance could be improved with better clustering strategies
4. **High Complexity Workloads**: Need specialized algorithms for complex patterns

## Implementation

### Core Components

#### Memory Pool

Location: `src/optimization/core/optimized-memory-pool.ts`

Provides object pooling for frequently used data structures:
- SpatialHash instances with O(1) indexed access
- UnionFind instances with size matching
- CollisionArray with pre-allocated capacity
- Float32Array buffers for numerical operations

```typescript
class OptimizedMemoryPool {
  getSpatialHash(config?: any): SpatialHash
  getUnionFind(size: number): UnionFind
  getCollisionArray(): CollisionPair[]
  getTypedArray(size: number): Float32Array
  releaseSpatialHash(spatialHash: SpatialHash): void
  releaseUnionFind(unionFind: UnionFind): void
  releaseCollisionArray(array: CollisionPair[]): void
  releaseTypedArray(buffer: Float32Array): void
  getStats(): MemoryPoolStats
}
```

#### Performance Cache

Location: `src/optimization/core/performance-cache.ts`

Multi-level caching system with LRU eviction:
- GridClassificationCache: Caches grid size classifications
- ComplexityCalculationCache: Memoizes complexity calculations
- AlgorithmResultCache: Caches algorithm selection results with expiration

```typescript
class PerformanceCacheManager {
  getGridClassification(key: ClassificationCacheKey): string | null
  setGridClassification(key: ClassificationCacheKey, classification: string): void
  getComplexity(key: ComplexityCacheKey): number | null
  setComplexity(key: ComplexityCacheKey, complexity: number): void
  getAlgorithmResult(key: AlgorithmCacheKey): AlgorithmSelection | null
  setAlgorithmResult(key: AlgorithmCacheKey, result: AlgorithmSelection): void
  getStats(): CacheStatistics
  clearAll(): void
  setEnabled(enabled: boolean): void
}
```

#### Adaptive Clustering

Location: `src/algorithms/pathfinding/hpa-star/adaptive-clustering.ts`

Dynamic cluster sizing for HPA* pathfinding based on grid characteristics:
- Grid analysis (obstacle density, complexity, aspect ratio)
- Optimal cluster size calculation
- Density-aware clustering
- Performance tracking

```typescript
class AdaptiveClustering {
  static analyzeGrid(grid: number[], width: number, height: number): GridAnalysis
  static generateAdaptiveClusters(grid: number[], config: HPAConfig): ClusterGenerationResult
  static getPerformanceStats(): PerformanceStats
  static resetCaches(): void
  static configure(config: Partial<AdaptiveClusteringConfig>): void
}
```

### Testing

Test file: `src/optimization/core/__tests__/optimizations.test.ts`

Comprehensive test suite covering:
- Memory pool operations (spatial hash, union-find, collision arrays, typed arrays)
- Adaptive clustering (grid analysis, cluster generation, caching)
- Performance caching (LRU cache, grid classification, complexity calculation, algorithm results)
- Integration tests
- Global cache access

### Profiling Infrastructure

Location: `src/optimization/profiling/`

Zero-overhead profiling hooks that are only active in benchmark/test environments:
- `hooks.ts`: Timing, memory snapshots, allocation monitoring
- `profiling-types.ts`: Type definitions for performance metrics
- `micro-benchmarks.ts`: Component-level benchmarks
- `index.ts`: Integration layer with `@PAWProfile` decorator support

Environment detection:
- Production: All profiling disabled (zero overhead)
- Development: Conservative profiling enabled
- Benchmark: Full profiling with detailed tracking
- Test: Complete profiling for analysis

## Usage

### Basic Memory Pool Usage

```typescript
import { OptimizedMemoryPool } from '@entropy-tamer/reynard-algorithms';

const pool = new OptimizedMemoryPool({
  spatialHashPoolSize: 50,
  unionFindPoolSize: 100,
  collisionArrayPoolSize: 200,
});

// Allocate objects
const hash = pool.getSpatialHash({ cellSize: 100 });
const uf = pool.getUnionFind(100);
const array = pool.getCollisionArray();
const buffer = pool.getTypedArray(512);

// Use objects...
array.push({ id: 1, bodyA: 1, bodyB: 2 });
buffer[0] = 1.0;

// Release back to pool
pool.releaseSpatialHash(hash);
pool.releaseUnionFind(uf);
pool.releaseCollisionArray(array);
pool.releaseTypedArray(buffer);

// Get statistics
const stats = pool.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Memory saved: ${stats.memorySaved} bytes`);
```

### Performance Caching

```typescript
import { performanceCache } from '@entropy-tamer/reynard-algorithms';

// Cache grid classification
const gridKey = { objectCount: 1000, gridSize: 32 };
performanceCache.setGridClassification(gridKey, 'medium');

// Retrieve from cache
const classification = performanceCache.getGridClassification(gridKey);

// Get cache statistics
const stats = performanceCache.getStats();
console.log(`Overall hit rate: ${stats.overall.overallHitRate}%`);
console.log(`Total memory usage: ${stats.overall.totalMemoryUsage} bytes`);
```

### Adaptive Clustering

```typescript
import { AdaptiveClustering } from '@entropy-tamer/reynard-algorithms';

const grid = new Array(2500).fill(0); // 50x50 grid
const config = {
  width: 50,
  height: 50,
  clusterSize: 15,
};

const result = AdaptiveClustering.generateAdaptiveClusters(grid, config);

console.log(`Clusters created: ${result.stats.clustersCreated}`);
console.log(`Adaptive cluster size: ${result.stats.adaptiveClusterSize}`);
console.log(`Generation time: ${result.stats.generationTime}ms`);
console.log(`Grid analysis:`, result.stats.gridAnalysis);
```

### Profiling

```typescript
import { pawPerformance, PAWProfile } from '@entropy-tamer/reynard-algorithms';

// Method-level profiling
@PAWProfile('algorithm-selection', { trackMemory: true })
selectOptimalAlgorithm(workload: WorkloadCharacteristics) {
  // Implementation
}

// Manual timing
const endTiming = pawPerformance.startTiming('grid-classification');
// ... operation
const duration = endTiming();

// Memory tracking
const memory = pawPerformance.trackMemory('memory-pool');
memory.snapshot();
memory.trackAllocation('spatial-hash', 1024);
```

## Running Benchmarks

### PAW Benchmark Suite

```bash
cd packages/core/algorithms
pnpm tsx benchmark-paw.ts
```

This runs the comprehensive PAW benchmark suite and saves results to `benchmark-reports/`.

### Vitest Benchmarks

```bash
cd packages/core/algorithms
pnpm test src/__tests__/paw-optimization-benchmark.test.ts
```

### Profiling Benchmarks

```bash
# Enable profiling
REYNARD_BENCHMARK=true pnpm test src/optimization/profiling/__tests__/
```
