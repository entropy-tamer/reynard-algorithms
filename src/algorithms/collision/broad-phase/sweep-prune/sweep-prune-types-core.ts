/**
 * Sweep and Prune Collision Detection Core Types
 *
 * Core type definitions for the Sweep and Prune collision detection algorithm.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

/**
 * Represents a 2D axis-aligned bounding box
 */
export interface AABB {
  /** Minimum x coordinate */
  minX: number;
  /** Minimum y coordinate */
  minY: number;
  /** Maximum x coordinate */
  maxX: number;
  /** Maximum y coordinate */
  maxY: number;
  /** Unique identifier */
  id: string | number;
  /** Additional data */
  data?: any;
}

/**
 * Represents an endpoint of an AABB on a specific axis
 */
export interface Endpoint {
  /** The AABB this endpoint belongs to */
  aabb: AABB;
  /** Whether this is a start (min) or end (max) endpoint */
  isStart: boolean;
  /** The coordinate value on the axis */
  value: number;
  /** The axis this endpoint is on (0 = x, 1 = y) */
  axis: number;
}

/**
 * Represents a potential collision pair
 */
export interface CollisionPair {
  /** First AABB in the pair */
  aabb1: AABB;
  /** Second AABB in the pair */
  aabb2: AABB;
  /** Whether this pair is currently active (overlapping) */
  active: boolean;
  /** Last update timestamp */
  lastUpdate: number;
}

/**
 * Result of sweep and prune collision detection
 */
export interface SweepPruneResult {
  /** Array of collision pairs found */
  collisionPairs: CollisionPair[];
  /** Total number of AABBs processed */
  totalAABBs: number;
  /** Number of active collision pairs */
  activeCollisions: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Number of endpoints processed */
  endpointsProcessed: number;
  /** Number of axis sweeps performed */
  axisSweeps: number;
}
