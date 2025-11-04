/**
 * Sweep and Prune Collision Detection Advanced Types
 *
 * Advanced type definitions for spatial partitioning, incremental updates,
 * batch operations, and sorting for the Sweep and Prune algorithm.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

import type { AABB, Endpoint, CollisionPair } from "./sweep-prune-types-core";

/**
 * Spatial partitioning cell for large datasets
 */
export interface SpatialCell {
  /** Cell boundaries */
  bounds: AABB;
  /** AABBs in this cell */
  aabbs: AABB[];
  /** Whether this cell is active */
  active: boolean;
}

/**
 * Incremental update information
 */
export interface IncrementalUpdate {
  /** AABB that was updated */
  aabb: AABB;
  /** Previous AABB bounds */
  previousBounds: AABB;
  /** Type of update */
  updateType: "add" | "remove" | "update";
  /** Timestamp of update */
  timestamp: number;
}

/**
 * Batch update result
 */
export interface BatchUpdateResult {
  /** Number of AABBs added */
  added: number;
  /** Number of AABBs removed */
  removed: number;
  /** Number of AABBs updated */
  updated: number;
  /** New collision pairs found */
  newCollisionPairs: CollisionPair[];
  /** Lost collision pairs */
  lostCollisionPairs: CollisionPair[];
  /** Execution time */
  executionTime: number;
}

/**
 * Sorting algorithm options
 */
export interface SortingOptions {
  /** Algorithm to use for sorting */
  algorithm: "insertion" | "quick" | "merge" | "tim" | "auto";
  /** Whether to use stable sorting */
  stable: boolean;
  /** Custom comparison function */
  compareFunction?: (a: Endpoint, b: Endpoint) => number;
}

/**
 * Axis sweep result
 */
export interface AxisSweepResult {
  /** Axis that was swept (0 = x, 1 = y) */
  axis: number;
  /** Number of endpoints processed */
  endpointsProcessed: number;
  /** Number of collision pairs found on this axis */
  collisionPairsFound: number;
  /** Execution time for this axis */
  executionTime: number;
  /** Whether this axis was the limiting factor */
  isLimiting: boolean;
}

/**
 * Multi-axis sweep result
 */
export interface MultiAxisSweepResult {
  /** Results for each axis */
  axisResults: AxisSweepResult[];
  /** Combined collision pairs from all axes */
  combinedCollisionPairs: CollisionPair[];
  /** Total execution time */
  totalExecutionTime: number;
  /** Most efficient axis */
  mostEfficientAxis: number;
}



