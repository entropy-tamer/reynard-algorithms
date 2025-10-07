/**
 * Clean exports for core algorithm classes
 * This file provides organized exports from the modular directory structure
 */

// ============================================================================
// CORE DATA STRUCTURES
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
// Note: Trie implementation is incomplete, commenting out for now
// export { Trie } from "./data-structures/trie/trie-core";
// export type { TrieNode, TrieConfig, TrieSearchResult } from "./data-structures/trie/trie-types";

// ============================================================================
// SPATIAL STRUCTURES
// ============================================================================

// Quadtree
export { Quadtree } from "./spatial-structures/quadtree";
export type {
  Point as QuadtreePoint,
  Rectangle as QuadtreeRectangle,
  QuadtreeData,
  QuadtreeNode,
  QuadtreeConfig,
  QuadtreeStats,
  QuadtreeQueryResult,
  CircleQuery,
  RectangleQuery,
  PointQuery,
  QuadtreeOptions,
  QuadtreeEvent,
  QuadtreeEventType,
  QuadtreeEventHandler,
  QuadtreeTraversalResult,
  QuadtreeCollisionResult,
  QuadtreeNearestNeighborResult,
  QuadtreePerformanceMetrics,
} from "./spatial-structures/quadtree";

// R-Tree
export { RTree } from "./spatial-structures/rtree/rtree-core";
export type {
  Point as RTreePoint,
  Rectangle as RTreeRectangle,
  RTreeEntry,
  RTreeNode,
  RTreeConfig,
  RTreeStats,
  RTreeQueryResult,
  RTreeQueryOptions,
  RTreeInsertResult,
  RTreeDeleteResult,
} from "./spatial-structures/rtree/rtree-types";

// ============================================================================
// GEOMETRY OPERATIONS
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

// Bresenham's Line Algorithm
export { BresenhamLine } from "./geometry/algorithms/bresenham/bresenham-core";
export type {
  Point as BresenhamPoint,
  Pixel,
  BresenhamConfig,
  BresenhamResult,
  LineDrawingOptions,
  LineDrawingResult,
  MultiLineOptions,
  MultiLineResult,
} from "./geometry/algorithms/bresenham/bresenham-types";

// Delaunay Triangulation
export { DelaunayTriangulation } from "./geometry/algorithms/delaunay/delaunay-core";
export type {
  Point as DelaunayPoint,
  Triangle,
  Edge as DelaunayEdge,
  Circumcircle,
  DelaunayConfig,
  DelaunayStats,
  DelaunayResult,
  TriangulationQueryOptions,
  TriangulationQueryResult,
  MeshGenerationOptions,
  Mesh,
  ConstrainedDelaunayOptions,
  ConstrainedDelaunayResult,
} from "./geometry/algorithms/delaunay/delaunay-types";

// Convex Hull Algorithms
export { ConvexHull } from "./geometry/algorithms/convex-hull/convex-hull-core";
export type {
  Point as ConvexHullPoint,
  Vector,
  HullEdge,
  ConvexHullAlgorithm,
  ConvexHullConfig,
  ConvexHullStats,
  ConvexHullResult,
  HullAnalysisOptions,
  HullAnalysis,
  HullComparisonOptions,
  HullComparison,
  HullSimplificationOptions,
  HullSimplificationResult,
} from "./geometry/algorithms/convex-hull/convex-hull-types";

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

// ============================================================================
// PATHFINDING ALGORITHMS
// ============================================================================

// A* Pathfinding Algorithm
// Note: A* implementation is incomplete, commenting out for now
// export { AStar } from "./pathfinding/astar/astar-core";
// export type { GridNode, AStarConfig, PathNode, PathResult, HeuristicFunction } from "./pathfinding/astar/astar-types";
// export { manhattan, euclidean, chebyshev } from "./pathfinding/astar/heuristics";

// ============================================================================
// COLLISION DETECTION
// ============================================================================

// Separating Axis Theorem (SAT) Collision Detection
// Note: Polygon and Vector types are already exported from geometry module above
// export { satCollision } from "./geometry/collision/sat/sat-core";
// export type { Projection, SATResult, OverlapResult } from "./geometry/collision/sat/sat-types";

// Sweep and Prune Broad-Phase Collision Detection
// Note: Sweep and Prune implementation is incomplete, commenting out for now
// export { SweepAndPrune } from "./geometry/collision/sweep-prune/sweep-prune-core";
// export type { AABB, EndPoint, Axis, SweepAndPruneConfig, PotentialCollisionPair, SweepAndPruneResult } from "./geometry/collision/sweep-prune/sweep-prune-types";

// Existing AABB collision detection types and functions
export type { AABB as AABBCollision, CollisionPair, CollisionResult } from "./computational-geometry/collision/aabb-types";
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
  SpatialCollisionOptimizer,
} from "./computational-geometry/collision";

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
