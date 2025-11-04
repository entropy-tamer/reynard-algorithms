/**
 * Separating Axis Theorem (SAT) Collision Detection Module
 *
 * Clean exports for the SAT collision detection implementation.
 * Provides comprehensive collision detection between convex polygons using
 * the Separating Axis Theorem with optimizations and caching.
 *
 * @module algorithms/geometry/collision/sat
 */

// Export core implementation
export { SAT } from "./sat-core";

// Export all types and interfaces
export type {
  Vector2D,
  Point2D,
  LineSegment,
  ConvexPolygon,
  ProjectionAxis,
  Projection,
  SATCollisionResult,
  SATConfig,
  SATStats,
  SATEvent,
  SATEventType,
  SATEventHandler,
  SATOptions,
  SATCacheEntry,
  SATPerformanceMetrics,
  ContactPoint,
  DetailedCollisionInfo,
  SATBatchResult,
  TransformMatrix,
  TransformedPolygon,
} from "./sat-types";

// Export default configurations and common polygons
export { DEFAULT_SAT_CONFIG, DEFAULT_SAT_OPTIONS, COMMON_POLYGONS } from "./sat-types";
