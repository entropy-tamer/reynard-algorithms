/**
 * reynard-algorithms
 *
 * Algorithm primitives and data structures for Reynard applications.
 * A comprehensive collection of reusable algorithmic building blocks with
 * automatic optimization and performance monitoring.
 */

// Core algorithm classes, geometry operations, and performance utilities
export {
  UnionFind,
  SpatialHash,
  PointOps,
  LineOps,
  RectangleOps,
  CircleOps,
  PolygonOps,
  PerformanceTimer,
  MemoryMonitor,
  throttle,
  debounce,
  batchCollisionDetection,
  batchCollisionWithSpatialHash,
  type Point,
  type Rectangle,
  type Circle,
  type Polygon,
  type AABB,
  type CollisionResult,
} from "./exports";
