# Adaptive Memoization Guide

## Overview

The Reynard algorithms package includes a hybrid adaptive memoization system that automatically optimizes performance for repeated mathematical operations while maintaining safety through runtime monitoring.

## Key Features

- **Adaptive Control**: Automatically enables/disables memoization based on hit rates and overhead
- **PAW Integration**: Hooks into Performance Analysis Workbench for automatic tuning
- **Configurable Policies**: Per-function tuning with global defaults
- **Runtime Safety**: Auto-disable when overhead exceeds benefit
- **Memory Management**: LRU cache with TTL and size limits

## Usage

### Basic Integration

```typescript
import { adaptiveMemo } from '@reynard/algorithms/utils';

// Wrap expensive functions with adaptive memo
const expensiveCalc = adaptiveMemo(
  (x: number, y: number) => Math.sqrt(x * x + y * y),
  { 
    maxSize: 1024, 
    minHitRate: 0.7, 
    windowSize: 500 
  },
  (x: number, y: number) => `${x}|${y}` // custom key generator
);
```

### Policy Configuration

```typescript
import { setMemoPolicy, getMemoStats } from '@reynard/algorithms/utils';

// Adjust policy at runtime
setMemoPolicy('euclideanDistance', {
  maxSize: 2048,
  minHitRate: 0.8,
  overheadBudgetMs: 0.01
});

// Monitor performance
const stats = getMemoStats('euclideanDistance');
console.log(`Hit rate: ${stats.hitRate}, Overhead: ${stats.avgOverheadMs}ms`);
```

## Where to Apply Memoization

### ✅ Good Candidates

- **Heuristics**: A* pathfinding distance calculations
- **Collision Detection**: AABB union/intersection, SAT projections
- **Spatial Queries**: Repeated nearest neighbor searches
- **Geometry**: Vector normalization, distance calculations
- **Composite Operations**: Multi-step mathematical computations

### ❌ Avoid

- **Primitive Math**: Simple `Math.sqrt()`, `Math.sin()` in tight loops
- **Frequently Changing Inputs**: Random or highly variable parameters
- **Memory-Critical Code**: Where cache overhead is unacceptable
- **Deterministic Requirements**: Where caching affects correctness

## Performance Tuning

### Policy Parameters

- `maxSize`: Maximum cache entries (default: 1024)
- `minHitRate`: Minimum hit rate to keep memo enabled (default: 0.7)
- `overheadBudgetMs`: Maximum allowed overhead per call (default: 0.02ms)
- `windowSize`: Sliding window for statistics (default: 500)
- `minSamples`: Minimum samples before making decisions (default: 200)

### Monitoring

```typescript
import { memoRegistry } from '@reynard/algorithms/utils';

// Get all memo statistics
const allStats = memoRegistry.getAllStats();

// Check specific function
const distanceStats = memoRegistry.getStats('euclideanDistance');
if (distanceStats.hitRate < 0.5) {
  console.warn('Low hit rate detected, consider disabling memo');
}
```

## Integration Examples

### Pathfinding

```typescript
// A* heuristics with adaptive memo
export const euclideanDistance = (() => {
  const memo = adaptiveMemo(
    (from: Point, to: Point) => Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2),
    { maxSize: 4096, minHitRate: 0.6 },
    (from: Point, to: Point) => `${from.x}|${from.y}|${to.x}|${to.y}`
  );
  return (from: Point, to: Point) => memo(from, to);
})();
```

### Collision Detection

```typescript
// AABB operations with adaptive memo
const unionAABB = adaptiveMemo(
  (a: AABB, b: AABB) => {
    const minX = Math.min(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxX = Math.max(a.x + a.width, b.x + b.width);
    const maxY = Math.max(a.y + a.height, b.y + b.height);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  },
  { maxSize: 4096, minHitRate: 0.6 },
  (a: AABB, b: AABB) => `${a.x}|${a.y}|${a.width}|${a.height}::${b.x}|${b.y}|${b.width}|${b.height}`
);
```

## Environment Controls

- `ALG_MEMO_ON=0`: Disable all memoization globally
- `ALG_MEMO_ON=1`: Enable memoization (default)

## Best Practices

1. **Start Conservative**: Use small cache sizes and high hit rate thresholds
2. **Monitor Performance**: Regularly check hit rates and overhead
3. **Profile Before Optimizing**: Use microbenchmarks to validate benefits
4. **Key Design**: Create efficient, collision-resistant key generators
5. **Memory Awareness**: Set appropriate TTL and size limits
6. **Test Edge Cases**: Verify behavior with degenerate inputs

## Troubleshooting

### Low Hit Rates

- Check if inputs are actually repeated
- Verify key generator produces consistent keys
- Consider increasing `windowSize` for better statistics

### High Overhead

- Reduce `maxSize` to limit memory usage
- Increase `minHitRate` threshold
- Check if function is too simple to benefit from memoization

### Memory Growth

- Set appropriate `ttlMs` for cache expiration
- Monitor cache size with `getMemoStats()`
- Consider disabling memo for rarely-used functions

## Microbenchmarks

Run performance tests with:

```bash
RUN_MEMO_BENCH=1 pnpm tsx packages/core/algorithms/src/utils/__bench__/memo-*.bench.ts
```

Available benchmarks:

- `memo-heuristics.bench.ts`: A* pathfinding heuristics
- `memo-aabb.bench.ts`: AABB collision operations  
- `memo-sat.bench.ts`: SAT collision detection
- `memo-geometry.bench.ts`: Vector operations
