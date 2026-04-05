/**
 * Spatial Collision Optimizer
 *
 * Advanced collision detection system that uses spatial partitioning
 * to optimize collision queries and reduce computational complexity
 * from O(n²) to O(n) average case.
 *
 * @module algorithms/geometry/collision/optimization/spatialCollisionOptimizer
 */
import type { AABB } from "../narrow-phase/aabb/aabb-types";
import { type CollisionPair } from "./collision-detection-core";
import { type SpatialCollisionConfig, type SpatialCollisionStats } from "./spatial-collision-stats";
export type { AABB, CollisionResult } from "../narrow-phase/aabb/aabb-types";
export type { SpatialCollisionConfig, SpatialCollisionStats } from "./spatial-collision-stats";
/**
 *
 */
export declare class SpatialCollisionOptimizer {
    private spatialHash;
    private config;
    private collisionCache;
    private stats;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<SpatialCollisionConfig>);
    /**
     * Detect collisions using spatial optimization
     * @param aabbs
     * @example
     */
    detectCollisions(aabbs: AABB[]): CollisionPair[];
    /**
     * Naive O(n²) collision detection for small datasets
     * @param aabbs
     * @example
     */
    private naiveCollisionDetection;
    /**
     * Spatial hash optimized collision detection
     * @param aabbs
     * @example
     */
    private spatialCollisionDetection;
    /**
     * Get performance statistics
     * @example
     */
    getStats(): SpatialCollisionStats;
    /**
     * Clear collision cache
     * @example
     */
    clearCache(): void;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<SpatialCollisionConfig>): void;
}
//# sourceMappingURL=spatial-collision-optimizer.d.ts.map