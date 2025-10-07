/**
 * Collision Detection Core
 *
 * Core collision detection algorithms and utilities
 * for the spatial collision optimizer.
 *
 * @module algorithms/computational-geometry/collision/collisionDetectionCore
 */

import type { AABB, CollisionResult } from "./aabb-types";
import { checkCollision } from "./aabb-collision";
import type { SpatialHash } from "../../spatial-structures/spatial-hash/spatial-hash-core";
import type { CollisionObjectData } from "../../types/spatial-types";

export interface CollisionPair {
  a: number;
  b: number;
  result: CollisionResult;
}

export interface CollisionCache {
  cache: Map<string, CollisionResult>;
  stats: { cacheHits: number };
  config: { enableCaching: boolean; cacheSize: number };
}

/**
 * Check collision with caching support
 */
export function checkCollisionWithCache(a: AABB, b: AABB, cache: CollisionCache): CollisionResult {
  if (!cache.config.enableCaching) {
    return checkCollision(a, b);
  }

  const cacheKey = generateCacheKey(a, b);

  if (cache.cache.has(cacheKey)) {
    cache.stats.cacheHits++;
    return cache.cache.get(cacheKey)!;
  }

  const result = checkCollision(a, b);
  cache.cache.set(cacheKey, result);

  // Limit cache size
  if (cache.cache.size > cache.config.cacheSize) {
    const firstKey = cache.cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.cache.delete(firstKey);
    }
  }

  return result;
}

/**
 * Generate cache key for AABB pair
 */
export function generateCacheKey(a: AABB, b: AABB): string {
  return `${a.x},${a.y},${a.width},${a.height}|${b.x},${b.y},${b.width},${b.height}`;
}

/**
 * Naive O(n²) collision detection for small datasets
 */
export function naiveCollisionDetection(aabbs: AABB[], cache: CollisionCache): CollisionPair[] {
  const collisions: CollisionPair[] = [];

  for (let i = 0; i < aabbs.length; i++) {
    for (let j = i + 1; j < aabbs.length; j++) {
      const result = checkCollisionWithCache(aabbs[i], aabbs[j], cache);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }
  }

  return collisions;
}

/**
 * Spatial hash optimized collision detection
 */
export function spatialCollisionDetection(
  aabbs: AABB[],
  spatialHash: SpatialHash<CollisionObjectData>,
  cache: CollisionCache
): CollisionPair[] {
  const collisions: CollisionPair[] = [];

  // Clear and rebuild spatial hash
  spatialHash.clear();

  // Insert all AABBs
  aabbs.forEach((aabb, index) => {
    spatialHash.insert({
      id: index,
      x: aabb.x,
      y: aabb.y,
      width: aabb.width,
      height: aabb.height,
      data: {
        id: index,
        type: "collision",
        aabb,
        index,
      },
    });
  });

  // Check collisions using spatial queries
  const processed = new Set<number>();

  for (let i = 0; i < aabbs.length; i++) {
    if (processed.has(i)) continue;

    const aabb = aabbs[i];
    const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);

    for (const obj of nearby) {
      const j = obj.data.index;
      if (j <= i || processed.has(j)) continue;

      const result = checkCollisionWithCache(aabb, obj.data.aabb, cache);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }

    processed.add(i);
  }

  return collisions;
}
