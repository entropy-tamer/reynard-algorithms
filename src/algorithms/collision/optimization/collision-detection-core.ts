/**
 * Collision Detection Core
 *
 * Core collision detection algorithms and utilities
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/optimization/collisionDetectionCore
 */

import type { AABB, CollisionResult } from "../narrow-phase/aabb/aabb-types";
import { checkCollision } from "../narrow-phase/aabb/aabb-collision";
import type { SpatialHash } from "../../../data-structures/spatial/spatial-hash/spatial-hash-core";
import type { CollisionObjectData } from "../../../core/types/spatial-types";

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
 * @param a
 * @param b
 * @param cache
 * @example
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
 * @param a
 * @param b
 * @example
 */
export function generateCacheKey(a: AABB, b: AABB): string {
  return `${a.x},${a.y},${a.width},${a.height}|${b.x},${b.y},${b.width},${b.height}`;
}

/**
 * Naive O(n²) collision detection for small datasets
 * @param aabbs
 * @param cache
 * @example
 */
export function naiveCollisionDetection(aabbs: AABB[], cache: CollisionCache): CollisionPair[] {
  const collisions: CollisionPair[] = [];

  for (let i = 0; i < aabbs.length; i++) {
    const aabbA = aabbs[i];
    if (!aabbA) continue;

    for (let j = i + 1; j < aabbs.length; j++) {
      const aabbB = aabbs[j];
      if (!aabbB) continue;

      const result = checkCollisionWithCache(aabbA, aabbB, cache);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }
  }

  return collisions;
}

/**
 * Spatial hash optimized collision detection
 * @param aabbs
 * @param spatialHash
 * @param cache
 * @example
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

  // Check collisions using spatial queries.
  //
  // Broad-phase culling only needs a SUPERSET of the candidates, so this uses
  // `queryCells` rather than `queryRect`. `insertImpl` registers every object in
  // every cell its AABB spans, so two overlapping AABBs necessarily share at
  // least one grid cell; querying the cells this AABB touches therefore cannot
  // miss an overlapping partner. `queryRect` would be wrong here because it
  // keeps only candidates fully CONTAINED in the rect, discarding partners that
  // overlap it by a few pixels -- and it would discard this AABB's own
  // candidates in every direction.
  //
  // `checkCollision` below is the exact test that turns this superset into the
  // true collision set.
  //
  // The previous query rect was anchored at the top-left corner and expanded
  // backwards by the AABB's own size -- `queryRect(x - w, y - h, w * 3, h * 3)`,
  // covering [x-w, x+2w]. That is not a superset of the AABB's own span: an
  // overlapping AABB whose body reaches into this one from further left or
  // above than this AABB's own width/height is never returned. The spatial
  // branch silently dropped 96.9% of true collision pairs at n=500 (4 found
  // where naive found 208 at n=100), with no error raised. The naive branch
  // was always correct; only the threshold switch at n >= hybridThreshold
  // exposed the loss.
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    if (!aabb) continue;

    const nearby = spatialHash.queryCells(aabb.x, aabb.y, aabb.width, aabb.height);

    for (const obj of nearby) {
      const j = obj.data.index;
      // Pairs are only reported from the lower index, so each pair is tested
      // exactly once. Any overlapping j < i was already handled at index j.
      if (j <= i) continue;

      const otherAabb = obj.data.aabb;
      if (!otherAabb) continue;

      const result = checkCollisionWithCache(aabb, otherAabb, cache);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }
  }

  return collisions;
}
