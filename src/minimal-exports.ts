/**
 * Minimal exports for core algorithm classes
 * This file provides only the working exports without problematic modules
 */

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

// Performance monitoring and optimization
export { PerformanceTimer } from "./performance/timer";
export { MemoryMonitor, MemoryLeakDetector } from "./performance/memory";
export { PerformanceBenchmark, measureAsync, measureSync } from "./performance/benchmark";
export { FrameRateMonitor } from "./performance/framerate";
export { throttle, debounce } from "./performance/throttle";
export { PerformanceBudgetChecker } from "./performance/budget";

// Memory Pool utilities
export { MemoryPool } from "./performance/memory-pool-core";
export type {
  PooledObject,
  PerformanceMemoryPoolConfig,
  PerformanceMemoryPoolStats,
} from "./performance/memory-pool-core";
export * from "./performance/memory-pool-utils";

// ============================================================================
// CORE DATA STRUCTURES (Working ones only)
// ============================================================================

// Union-Find data structure
export { UnionFind } from "./data-structures/union-find/union-find-core";
export type { UnionFindStats, UnionFindNode } from "./data-structures/union-find/union-find-types";

// Spatial Hash data structure
export { SpatialHash } from "./spatial-structures/spatial-hash/spatial-hash-core";
export type {
  SpatialHashConfig,
  SpatialHashStats,
  SpatialObject,
  QueryResult,
} from "./spatial-structures/spatial-hash/spatial-hash-types";

// Priority Queue / Binary Heap
export { PriorityQueue } from "./data-structures/priority-queue";
export type {
  PriorityQueueNode,
  PriorityQueueConfig,
  PriorityQueueStats,
  PriorityQueueComparator,
  PriorityQueueOptions,
  PriorityQueuePeekResult,
  PriorityQueueBatchResult,
  PriorityQueueEvent,
  PriorityQueueEventType,
  PriorityQueueEventHandler,
  PriorityQueueIteratorResult,
} from "./data-structures/priority-queue";

// LRU Cache
export { LRUCache } from "./data-structures/lru-cache";
export type {
  LRUCacheNode,
  LRUCacheConfig,
  LRUCacheStats,
  LRUCacheEntry,
  LRUCacheOptions,
  LRUCacheEvent,
  LRUCacheEventType,
  LRUCacheEventHandler,
  LRUCacheIteratorResult,
  LRUCacheBatchResult,
  LRUCacheSnapshot,
  LRUCachePerformanceMetrics,
} from "./data-structures/lru-cache";

// Trie (Prefix Tree)
export { Trie } from "./data-structures/trie/trie-core";
export type { TrieNode, TrieConfig, TrieSearchResult } from "./data-structures/trie/trie-types";

// Bloom Filter
export { BloomFilter } from "./data-structures/bloom-filter/bloom-filter-core";
export type { BloomFilterConfig, BloomFilterStats } from "./data-structures/bloom-filter/bloom-filter-types";

// Fenwick Tree (Binary Indexed Tree)
export { FenwickTree } from "./data-structures/fenwick-tree/fenwick-tree-core";
export type { FenwickTreeConfig, FenwickTreeStats } from "./data-structures/fenwick-tree/fenwick-tree-types";

// Interval Tree
export { IntervalTree } from "./data-structures/interval-tree/interval-tree-core";
export type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalTreeStats,
} from "./data-structures/interval-tree/interval-tree-types";

// Segment Tree
export { SegmentTree } from "./data-structures/segment-tree/segment-tree-core";
export type {
  SegmentTreeNode,
  SegmentTreeConfig,
  SegmentTreeStats,
} from "./data-structures/segment-tree/segment-tree-types";

// ============================================================================
// GEOMETRY OPERATIONS (Working ones only)
// ============================================================================

// Geometry types and operations
export type { Point } from "./geometry/shapes/point-algorithms";
export type { Vector } from "./geometry/vectors/vector-algorithms";
export type { Line, Rectangle, Circle, Polygon } from "./geometry/shapes/shapes";
export type { Transform } from "./geometry/transformations/transformation-algorithms";

// Geometry operation classes
export { PointOps } from "./geometry/shapes/point-algorithms";
export { VectorOps } from "./geometry/vectors/vector-algorithms";
export { LineOps } from "./geometry/shapes/line-algorithms";
export { RectangleOps } from "./geometry/shapes/rectangle-algorithms";
export { CircleOps } from "./geometry/shapes/circle-algorithms";
export { PolygonOps } from "./geometry/shapes/polygon-algorithms";
export { TransformOps } from "./geometry/transformations/transformation-algorithms";

// ============================================================================
// COLLISION DETECTION (Working ones only)
// ============================================================================

// Separating Axis Theorem (SAT) Collision Detection
export { SAT } from "./geometry/collision/sat/sat-core";
export type { Projection, SATCollisionResult } from "./geometry/collision/sat/sat-types";

// Sweep and Prune Broad-Phase Collision Detection
export { SweepPrune } from "./geometry/collision/sweep-prune/sweep-prune-core";
export type {
  AABB as SweepPruneAABB,
  Endpoint,
  SweepPruneConfig,
  SweepPruneResult,
} from "./geometry/collision/sweep-prune/sweep-prune-types";

// AABB collision detection types and functions
export type { AABB as AABBCollision, CollisionPair, CollisionResult } from "./geometry/collision/aabb/aabb-types";
export {
  checkCollision,
  batchCollisionDetection,
  batchCollisionWithSpatialHash,
  pointInAABB,
  areAABBsTouching,
  expandAABB,
  unionAABB,
  intersectionAABB,
  containsAABB,
} from "./geometry/collision/aabb";

// Spatial collision optimization
export { SpatialCollisionOptimizer } from "./geometry/collision/optimization";

// ============================================================================
// OPTIMIZATION FRAMEWORK
// ============================================================================

// Optimization and algorithm selection
export {
  detectCollisions,
  performSpatialQuery,
  PerformanceMonitor,
  OptimizationConfig,
  configureOptimization,
  cleanup,
} from "./optimized";
