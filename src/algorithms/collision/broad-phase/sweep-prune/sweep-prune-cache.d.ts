/**
 * Cache management for Sweep and Prune algorithm
 *
 * Provides caching utilities for collision detection results.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-cache
 */
import type { AABB, CollisionPair, SweepPruneCacheEntry } from "./sweep-prune-types";
/**
 * Generate cache key for AABB set
 * @param aabbs
 * @example
 */
export declare function getCacheKey(aabbs: AABB[]): string;
/**
 * Cache collision result
 * @param cacheKey
 * @param collisionPairs
 * @param cache
 * @param cacheSize
 * @example
 */
export declare function cacheResult(cacheKey: string, collisionPairs: CollisionPair[], cache: Map<string, SweepPruneCacheEntry>, cacheSize: number): void;
//# sourceMappingURL=sweep-prune-cache.d.ts.map