/**
 * Collision Detection Core
 *
 * Core collision detection algorithms and utilities
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/optimization/collisionDetectionCore
 */
import type { AABB, CollisionResult } from "../narrow-phase/aabb/aabb-types";
import type { SpatialHash } from "../../../data-structures/spatial/spatial-hash/spatial-hash-core";
import type { CollisionObjectData } from "../../../core/types/spatial-types";
export interface CollisionPair {
    a: number;
    b: number;
    result: CollisionResult;
}
export interface CollisionCache {
    cache: Map<string, CollisionResult>;
    stats: {
        cacheHits: number;
    };
    config: {
        enableCaching: boolean;
        cacheSize: number;
    };
}
/**
 * Check collision with caching support
 * @param a
 * @param b
 * @param cache
 * @example
 */
export declare function checkCollisionWithCache(a: AABB, b: AABB, cache: CollisionCache): CollisionResult;
/**
 * Generate cache key for AABB pair
 * @param a
 * @param b
 * @example
 */
export declare function generateCacheKey(a: AABB, b: AABB): string;
/**
 * Naive O(n²) collision detection for small datasets
 * @param aabbs
 * @param cache
 * @example
 */
export declare function naiveCollisionDetection(aabbs: AABB[], cache: CollisionCache): CollisionPair[];
/**
 * Spatial hash optimized collision detection
 * @param aabbs
 * @param spatialHash
 * @param cache
 * @example
 */
export declare function spatialCollisionDetection(aabbs: AABB[], spatialHash: SpatialHash<CollisionObjectData>, cache: CollisionCache): CollisionPair[];
//# sourceMappingURL=collision-detection-core.d.ts.map