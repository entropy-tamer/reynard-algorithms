/**
 * K-d Tree Data Structure
 *
 * A space-partitioning data structure for organizing points in k-dimensional space.
 * Provides efficient nearest neighbor search, range queries, and spatial operations.
 *
 * @module algorithms/spatial-structures/kdtree
 */

export { KdTree } from "./kdtree-core";
export type {
  Point,
  Point2D,
  Point3D,
  BoundingBox,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  KdTreeResult,
  NearestNeighborResult,
  KNearestNeighborsResult,
  RangeQueryResult,
  NearestNeighborOptions,
  KNearestNeighborsOptions,
  RangeQueryOptions,
  KdTreeOptions,
  KdTreeEvent,
  KdTreeEventHandler,
  KdTreePerformanceMetrics,
  BatchOperationResult,
  KdTreeSerialization,
} from "./kdtree-types";
export { KdTreeEventType } from "./kdtree-types";
export { DEFAULT_KD_TREE_CONFIG, DEFAULT_KD_TREE_OPTIONS } from "./kdtree-types";
