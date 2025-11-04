/**
 * Quadtree Module
 *
 * Clean exports for the Quadtree spatial data structure implementation.
 * Provides efficient spatial partitioning and querying for 2D objects.
 *
 * @module algorithms/spatialStructures/quadtree
 */

// Export core implementation
export { Quadtree } from "./quadtree-core";

// Export all types and interfaces
export type {
  Point,
  Rectangle,
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
} from "./quadtree-types";
