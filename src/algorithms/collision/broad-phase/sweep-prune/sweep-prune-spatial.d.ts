/**
 * Spatial partitioning utilities for Sweep and Prune algorithm
 *
 * Provides spatial partitioning for efficient collision detection on large datasets.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-spatial
 */
import type { AABB, SpatialCell, SweepPruneConfig } from "./sweep-prune-types";
import type { CollisionPair } from "./sweep-prune-types";
/**
 * Partition AABBs into spatial cells
 * @param aabbs
 * @param config
 * @example
 */
export declare function partitionAABBs(aabbs: AABB[], config: SweepPruneConfig): Map<string, SpatialCell>;
/**
 * Get spatial cell key for an AABB
 * @param aabb
 * @param config
 * @example
 */
export declare function getSpatialCellKey(aabb: AABB, config: SweepPruneConfig): string;
/**
 * Get bounds for a spatial cell
 * @param cellKey
 * @param config
 * @example
 */
export declare function getCellBounds(cellKey: string, config: SweepPruneConfig): AABB;
/**
 * Check for collisions between adjacent spatial cells
 * @param cells
 * @param activePairs
 * @example
 */
export declare function checkInterCellCollisions(cells: Map<string, SpatialCell>, activePairs: Map<string, CollisionPair>): CollisionPair[];
//# sourceMappingURL=sweep-prune-spatial.d.ts.map