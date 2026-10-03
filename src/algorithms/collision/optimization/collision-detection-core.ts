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

/**
 * Naive O(n²) collision detection for small datasets
 *
 * There is deliberately no per-pair result cache here. Both broad phases test
 * every unordered pair EXACTLY ONCE per call -- the naive loop runs `j > i`, and
 * the spatial loop skips `j <= i` because those pairs were already handled at
 * index j. A value-keyed cache therefore cannot produce a single hit inside a
 * call; it can only "hit" when a caller re-runs detection over an identical,
 * unmoved array, which is an artifact of benchmark loops rather than a real
 * workload.
 *
 * The cache that used to live here also measured as a net LOSS even in that
 * favourable case. At n=1000 AABBs the candidate working set is ~7.5k distinct
 * pairs against a default capacity of 1k, so it thrashed to a 0% hit rate.
 * Sizing the cache so it actually fit produced a 99.9% hit rate (149260 hits)
 * and was STILL slower -- 26.4ms cached vs 15.5ms uncached -- because building
 * the eight-field string key per candidate cost more than the `checkCollision`
 * call it existed to avoid. `checkCollision` is a pure function of its
 * arguments and the values are all available inline, so there is nothing to
 * look up.
 *
 * If whole-result memoization is ever wanted for callers that re-query a static
 * scene, that is the right shape: one memo of the returned pairs, invalidated by
 * the caller. It is a different feature from a per-pair cache, which could never
 * pay for itself.
 *
 * @param aabbs
 * @example
 */
export function naiveCollisionDetection(aabbs: AABB[]): CollisionPair[] {
  const collisions: CollisionPair[] = [];

  for (let i = 0; i < aabbs.length; i++) {
    const aabbA = aabbs[i];
    if (!aabbA) continue;

    for (let j = i + 1; j < aabbs.length; j++) {
      const aabbB = aabbs[j];
      if (!aabbB) continue;

      const result = checkCollision(aabbA, aabbB);
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
 * @example
 */
export function spatialCollisionDetection(
  aabbs: AABB[],
  spatialHash: SpatialHash<CollisionObjectData>
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

      const result = checkCollision(aabb, otherAabb);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }
  }

  return collisions;
}
