/**
 * Clean exports for core algorithm classes
 * This file provides organized exports from the modular directory structure
 */

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

// Union-Find data structure
export { UnionFind } from "./union-find/union-find-core";
export type { UnionFindStats, UnionFindNode } from "./union-find/union-find-types";

// Spatial Hash data structure
export { SpatialHash } from "./spatial-hash/spatial-hash-core";
export type {
  SpatialHashConfig,
  SpatialHashStats,
  SpatialObject,
  QueryResult,
} from "./spatial-hash/spatial-hash-types";

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
// COLLISION DETECTION
// ============================================================================

// Collision detection types and functions
export type { AABB, CollisionPair, CollisionResult } from "./geometry/collision/aabb-types";
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
} from "./geometry/collision";

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
