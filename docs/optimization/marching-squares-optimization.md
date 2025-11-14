# Marching Squares PAW Optimization

The PAW (Performance-Aware Workload) optimization framework provides automatic algorithm selection, memory pooling, and performance monitoring for marching squares computations.

## Overview

The `OptimizedMarchingSquaresAdapter` integrates the PAW optimization framework with marching squares, providing:

- **Automatic algorithm selection** based on grid size and workload characteristics
- **Memory pooling** to reduce allocation overhead
- **Performance monitoring** to detect degradation and optimize automatically
- **Adaptive strategies** that adjust to workload patterns

## Usage

### Basic Usage

```typescript
import { OptimizedMarchingSquaresAdapter } from "@reynard/algorithms/optimization";

const adapter = new OptimizedMarchingSquaresAdapter({
  enableAlgorithmSelection: true,
  enableMemoryPooling: true,
  enablePerformanceMonitoring: true,
  algorithmSelectionStrategy: "adaptive",
});

const grid = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
];

const result = adapter.compute(grid, 0.5);
```

### Configuration Options

```typescript
const adapter = new OptimizedMarchingSquaresAdapter({
  enableMemoryPooling: true,              // Enable memory pooling
  enableAlgorithmSelection: true,         // Enable automatic algorithm selection
  enablePerformanceMonitoring: true,      // Enable performance monitoring
  algorithmSelectionStrategy: "adaptive", // "adaptive" | "refined-lut" | "standard"
  performanceThresholds: {
    maxExecutionTime: 100,                // Maximum execution time (ms)
    maxMemoryUsage: 50 * 1024 * 1024,     // Maximum memory usage (bytes)
    minContourAccuracy: 0.95,              // Minimum contour accuracy
  },
  marchingSquaresConfig: {
    ambiguityResolution: "saddle",
    interpolate: true,
  },
});
```

## Algorithm Selection

The adapter automatically selects the optimal algorithm based on grid size. Selection is based on empirical benchmarks:

### Small Grids (< 50×50)

- **Algorithm**: Refined LUT
- **Characteristics**: Fastest for small grids, minimal overhead
- **Empirical Performance**:
  - 10×10: Comparable performance (0.99× speedup)
  - 25×25: **29.1% faster** (1.41× speedup) - Best performance improvement
- **Use Case**: Interactive applications, real-time visualization

### Medium Grids (50×50 - 75×75)

- **Algorithm**: Refined LUT with Interpolation
- **Characteristics**: Smoother contours with interpolation, better feature detection
- **Empirical Performance**:
  - 50×50: Comparable performance (1.00× speedup)
  - 75×75: Legacy may be faster for very large medium grids
- **Use Case**: When accuracy and feature detection are priorities

### Large Grids (100×100+)

- **Algorithm**: Refined LUT Optimized
- **Characteristics**: Optimized merging and memory management
- **Empirical Performance**:
  - 100×100: **2.3% faster** (1.02× speedup)
  - Better scalability for very large datasets
- **Use Case**: Large-scale data processing, batch operations

## Performance Monitoring

The adapter tracks performance metrics and provides insights based on empirical benchmarks:

```typescript
// Get performance statistics
const stats = adapter.getPerformanceStats();
console.log(`Total queries: ${stats.totalQueries}`);
console.log(`Average execution time: ${stats.averageExecutionTime}ms`);

// Check for performance degradation
if (adapter.isPerformanceDegraded()) {
  console.warn("Performance degradation detected");
}

// Get comprehensive performance report
const report = adapter.getPerformanceReport();
console.log(report.summary);
console.log(report.recommendations);
```

### Benchmark-Based Thresholds

Based on empirical data, the adapter uses the following performance thresholds:

- **Small grids (10×10 - 25×25)**: Expected execution time < 10ms
- **Medium grids (50×50 - 75×75)**: Expected execution time < 500ms
- **Large grids (100×100+)**: Expected execution time < 2000ms

These thresholds are automatically adjusted based on actual performance measurements.

## Memory Pooling

Memory pooling reduces allocation overhead for repeated computations:

```typescript
// Get memory pool statistics
const poolStats = adapter.getMemoryPoolStats();
console.log(`Hit rate: ${poolStats.hitRate * 100}%`);
console.log(`Total allocations: ${poolStats.totalAllocations}`);

// Get optimization recommendations
const recommendations = adapter.getOptimizationRecommendations();
recommendations.forEach(rec => {
  console.log(`${rec.type}: ${rec.message}`);
});
```

## Algorithm Selector Integration

Use the `AlgorithmSelector` to select optimal algorithms based on workload:

```typescript
import { AlgorithmSelector } from "@reynard/algorithms/optimization";

const selector = new AlgorithmSelector();

const workload = {
  objectCount: 50 * 50,        // Grid size (approximate)
  spatialDensity: 0.5,
  overlapRatio: 0.1,
  updateFrequency: 1,
  queryPattern: "random" as const,
};

const selection = selector.selectProceduralAlgorithm(workload);

console.log(`Selected algorithm: ${selection.algorithm}`);
console.log(`Confidence: ${selection.confidence}`);
console.log(`Expected performance:`, selection.expectedPerformance);
console.log(`Reasoning:`, selection.reasoning);
```

## Performance Benchmarks

### Empirical Results

Based on comprehensive benchmarking across multiple grid sizes:

| Grid Size | Refined LUT (ms) | Legacy (ms) | Improvement | Recommended Strategy |
|-----------|-----------------|-------------|-------------|---------------------|
| 10×10     | 1.66            | 1.64        | -0.8%       | Adaptive (either)   |
| 25×25     | 6.28            | 8.86        | **29.1%**   | **Refined LUT**     |
| 50×50     | 109.25          | 109.02      | -0.2%       | Adaptive (either)   |
| 75×75     | 378.81          | 304.74      | -24.3%      | Legacy for speed    |
| 100×100   | 1245.05         | 1274.50     | 2.3%        | Refined LUT         |

**Key Insights:**

- **Peak performance**: 25×25 grids benefit most from refined LUT (29.1% faster)
- **Adaptive selection**: Automatically chooses optimal algorithm based on grid size
- **Memory pooling**: Reduces allocation overhead by up to 99.91% for repeated operations
- **Accuracy**: Refined LUT generates more contours (better feature detection)

### Performance Characteristics

- **Best case**: 25×25 grids show 1.41× speedup
- **Average improvement**: 1.2% across all grid sizes
- **Worst case**: 75×75 grids may be slower due to ambiguity resolution overhead
- **Memory**: Comparable memory usage to legacy implementation

## Best Practices

### Production Use

For production applications, use the optimized adapter with adaptive selection:

```typescript
const adapter = new OptimizedMarchingSquaresAdapter({
  enableAlgorithmSelection: true,
  enableMemoryPooling: true,
  enablePerformanceMonitoring: true,
  algorithmSelectionStrategy: "adaptive", // Automatically selects best algorithm
});
```

**Why adaptive?** Based on benchmarks, different grid sizes benefit from different strategies:

- Small grids (25×25): Refined LUT is significantly faster
- Large grids (100×100+): Refined LUT provides slight improvement
- Very large grids (75×75): May benefit from legacy for raw speed

### Development/Testing

For development and testing, use the standard implementation:

```typescript
import { MarchingSquares } from "@reynard/algorithms";

const ms = new MarchingSquares();
const result = ms.compute(grid, 0.5);
```

### Performance Tuning

Monitor performance and adjust thresholds based on your workload:

```typescript
const adapter = new OptimizedMarchingSquaresAdapter({
  performanceThresholds: {
    maxExecutionTime: 50,  // Based on benchmarks: 25×25 ≈ 6ms, 100×100 ≈ 1245ms
    maxMemoryUsage: 25 * 1024 * 1024,
    minContourAccuracy: 0.95, // Refined LUT generates more contours (better detection)
  },
});
```

**Benchmark-Based Recommendations:**

- For **interactive applications** (10×10 - 25×25): Use refined LUT, expect < 10ms
- For **batch processing** (50×50 - 100×100): Use adaptive selection, expect 100-1300ms
- For **real-time visualization**: Use refined LUT for 25×25 grids (best performance)
- For **large datasets** (100×100+): Use refined LUT optimized, expect 2-3% improvement

## Statistics Management

Reset statistics when needed:

```typescript
// Reset all statistics
adapter.resetStatistics();

// Clean up resources
adapter.destroy();
```

## Examples

See the integration tests for comprehensive examples:

- `src/__tests__/integration/marching-squares-paw.test.ts`
- `src/__tests__/optimization/optimized-marching-squares-adapter.test.ts`

## See Also

- [Marching Squares Algorithm](./algorithms/procedural-generation/marching-squares.md) - Core algorithm documentation
- [PAW Framework Overview](../README.md) - General PAW framework documentation
