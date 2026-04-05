/**
 * Core algorithm implementations for Sweep and Prune
 *
 * Provides the main sweep and prune algorithm implementations including
 * single-axis, multi-axis, and spatially-partitioned variants.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-algorithms
 */
import type { AABB, CollisionPair, SweepPruneConfig, SweepPruneResult } from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";
export interface SweepPruneContext {
    config: SweepPruneConfig;
    activeCollisionPairs: Map<string, CollisionPair>;
    emitEvent: (type: SweepPruneEventType, data?: any) => void;
    performSingleAxisSweepPrune: (aabbs: AABB[]) => SweepPruneResult;
}
/**
 * Perform the core sweep and prune algorithm
 * @param aabbs
 * @param context
 * @example
 */
export declare function performSweepPrune(aabbs: AABB[], context: SweepPruneContext): SweepPruneResult;
/**
 * Perform sweep and prune on a single axis
 * @param aabbs
 * @param context
 * @example
 */
export declare function performSingleAxisSweepPrune(aabbs: AABB[], context: SweepPruneContext): SweepPruneResult;
/**
 * Perform sweep and prune on multiple axes simultaneously
 * @param aabbs
 * @param context
 * @example
 */
export declare function performMultiAxisSweepPrune(aabbs: AABB[], context: SweepPruneContext): SweepPruneResult;
/**
 * Perform sweep and prune with spatial partitioning
 * @param aabbs
 * @param context
 * @example
 */
export declare function performSpatialPartitionedSweepPrune(aabbs: AABB[], context: SweepPruneContext): SweepPruneResult;
//# sourceMappingURL=sweep-prune-algorithms.d.ts.map