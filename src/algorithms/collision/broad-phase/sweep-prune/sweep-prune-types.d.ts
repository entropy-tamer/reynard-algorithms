/**
 * @file Sweep and Prune Collision Detection Types
 *
 * Comprehensive type definitions for the Sweep and Prune collision detection
 * algorithm. This module re-exports all types from specialized modules for
 * convenience and backwards compatibility.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */
export type { AABB, Endpoint, CollisionPair, SweepPruneResult } from "./sweep-prune-types-core";
export type { SweepPruneConfig, SweepPruneStats, SweepPruneEvent, SweepPruneEventHandler, SweepPruneOptions, SweepPruneCacheEntry, SweepPrunePerformanceMetrics, } from "./sweep-prune-types-config";
export type { SpatialCell, IncrementalUpdate, BatchUpdateResult, SortingOptions, AxisSweepResult, MultiAxisSweepResult, } from "./sweep-prune-types-advanced";
export { SweepPruneEventType } from "./sweep-prune-types-config";
export { DEFAULT_SWEEP_PRUNE_CONFIG, DEFAULT_SWEEP_PRUNE_OPTIONS, COMMON_AABBS } from "./sweep-prune-constants";
//# sourceMappingURL=sweep-prune-types.d.ts.map