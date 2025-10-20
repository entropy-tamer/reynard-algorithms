/**
 * Collision Detection Algorithms Module
 *
 * General-purpose collision detection algorithms including SAT (Separating Axis Theorem)
 * and Sweep and Prune broad-phase collision detection.
 *
 * @module algorithms/geometry/collision/algorithms
 */

// Export SAT collision detection
export { SAT } from "../sat/sat-core";
export type { Projection, SATCollisionResult } from "../sat/sat-types";

// Export Sweep and Prune collision detection (excluding conflicting types)
export { SweepPrune } from "../sweep-prune/sweep-prune-core";
export type {
  Endpoint,
  SweepPruneConfig,
  SweepPruneResult,
  AABB as SweepPruneAABB,
} from "../sweep-prune/sweep-prune-types";
