/**
 * Sweep and Prune Collision Detection Module
 *
 * Clean exports for the Sweep and Prune collision detection implementation.
 * Provides efficient broad-phase collision detection using the sweep and prune
 * algorithm with optimizations and spatial partitioning.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

// Export core implementation
export { SweepPrune } from './sweep-prune-core';

// Export all types and interfaces
export type {
  AABB,
  Endpoint,
  CollisionPair,
  SweepPruneResult,
  SweepPruneConfig,
  SweepPruneStats,
  SweepPruneEvent,
  SweepPruneEventType,
  SweepPruneEventHandler,
  SweepPruneOptions,
  SweepPruneCacheEntry,
  SweepPrunePerformanceMetrics,
  SpatialCell,
  IncrementalUpdate,
  BatchUpdateResult,
  SortingOptions,
  AxisSweepResult,
  MultiAxisSweepResult,
} from './sweep-prune-types';

// Export default configurations and common AABBs
export {
  DEFAULT_SWEEP_PRUNE_CONFIG,
  DEFAULT_SWEEP_PRUNE_OPTIONS,
  COMMON_AABBS,
} from './sweep-prune-types';
