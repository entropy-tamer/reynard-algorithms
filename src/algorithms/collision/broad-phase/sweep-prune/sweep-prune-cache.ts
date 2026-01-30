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
export function getCacheKey(aabbs: AABB[]): string {
  const sortedIds = aabbs.map(aabb => String(aabb.id)).sort();
  return sortedIds.join(",");
}

/**
 * Cache collision result
 * @param cacheKey
 * @param collisionPairs
 * @param cache
 * @param cacheSize
 * @example
 */
export function cacheResult(
  cacheKey: string,
  collisionPairs: CollisionPair[],
  cache: Map<string, SweepPruneCacheEntry>,
  cacheSize: number
): void {
  if (cache.size >= cacheSize) {
    // Remove least recently used entry
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(cacheKey, {
    aabbHash: cacheKey,
    collisionPairs,
    timestamp: Date.now(),
    accessCount: 1,
  });
}
