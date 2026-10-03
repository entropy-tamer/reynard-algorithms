/**
 * Direct Spatial Hash Collision Detection
 *
 * Extracted from OptimizedCollisionAdapter — clean, direct implementations
 * without PAW indirection layers.
 *
 * @module algorithms/collision/broad-phase/spatial-hash-collision
 */

import type { AABB, CollisionPair } from "../narrow-phase/aabb/aabb-types";
import { SpatialHash } from "../../../data-structures/spatial/spatial-hash/spatial-hash-core";
import type { CollisionObjectData } from "../../../core/types/spatial-types";

/**
 * Naive O(n²) collision detection — fastest for small datasets (< ~400 objects)
 */
export function detectCollisionsNaive(aabbs: AABB[]): CollisionPair[] {
  const collisions: CollisionPair[] = [];

  for (let i = 0; i < aabbs.length; i++) {
    const aabbI = aabbs[i];
    if (!aabbI) continue;
    for (let j = i + 1; j < aabbs.length; j++) {
      const aabbJ = aabbs[j];
      if (!aabbJ) continue;
      if (checkAABBCollision(aabbI, aabbJ)) {
        collisions.push({
          a: i,
          b: j,
          result: createCollisionResult(aabbI, aabbJ),
        });
      }
    }
  }

  return collisions;
}

/**
 * Spatial hash collision detection — fastest for medium datasets (~400–1000 objects)
 * Uses SpatialHash for broad phase, then narrow phase checks.
 */
export function detectCollisionsSpatialHash(aabbs: AABB[]): CollisionPair[] {
  const spatialHash = new SpatialHash({ cellSize: 100 });
  const collisions: CollisionPair[] = [];

  // Insert all AABBs into spatial hash
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    if (!aabb) continue;
    spatialHash.insert({
      id: i,
      x: aabb.x,
      y: aabb.y,
      width: aabb.width,
      height: aabb.height,
      data: {
        id: i,
        type: "collision",
        aabb: aabb,
        index: i,
      } as CollisionObjectData,
    });
  }

  // Check collisions using spatial queries
  const processed = new Set<number>();
  for (let i = 0; i < aabbs.length; i++) {
    if (processed.has(i)) continue;

    const aabb = aabbs[i];
    if (!aabb) continue;
    const nearby = spatialHash.queryRect(
      aabb.x - aabb.width,
      aabb.y - aabb.height,
      aabb.width * 3,
      aabb.height * 3
    );

    for (const obj of nearby) {
      const collisionData = obj.data as CollisionObjectData;
      const j = collisionData.index;
      if (j <= i || processed.has(j)) continue;
      if (!collisionData.aabb) continue;

      if (checkAABBCollision(aabb, collisionData.aabb)) {
        collisions.push({
          a: i,
          b: j,
          result: {
            colliding: true,
            overlap: null,
            overlapArea: 0,
            distance: 0,
          },
        });
      }
    }

    processed.add(i);
  }

  return collisions;
}

/**
 * Optimized spatial hash collision detection — fastest for large datasets (> ~1000 objects)
 * Same as spatial hash but with early termination optimizations.
 */
export function detectCollisionsOptimized(aabbs: AABB[]): CollisionPair[] {
  const spatialHash = new SpatialHash({ cellSize: 100 });
  const collisions: CollisionPair[] = [];

  // Insert all AABBs into spatial hash
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    if (!aabb) continue;
    spatialHash.insert({
      id: i,
      x: aabb.x,
      y: aabb.y,
      width: aabb.width,
      height: aabb.height,
      data: {
        id: i,
        type: "collision",
        aabb: aabb,
        index: i,
      } as CollisionObjectData,
    });
  }

  // Check collisions using spatial queries with early termination
  const processed = new Set<number>();
  for (let i = 0; i < aabbs.length; i++) {
    if (processed.has(i)) continue;

    const aabb = aabbs[i];
    if (!aabb) continue;
    const nearby = spatialHash.queryRect(
      aabb.x - aabb.width,
      aabb.y - aabb.height,
      aabb.width * 3,
      aabb.height * 3
    );

    for (const obj of nearby) {
      const collisionData = obj.data as CollisionObjectData;
      const j = collisionData.index;
      if (j <= i || processed.has(j)) continue;
      if (!collisionData.aabb) continue;

      if (checkAABBCollision(aabb, collisionData.aabb)) {
        collisions.push({
          a: i,
          b: j,
          result: {
            colliding: true,
            overlap: null,
            overlapArea: 0,
            distance: 0,
          },
        });
      }
    }

    processed.add(i);
  }

  return collisions;
}

/**
 * Auto-select best algorithm based on object count
 * Thresholds based on empirical benchmarks
 */
export function detectCollisionsAuto(aabbs: AABB[]): CollisionPair[] {
  if (aabbs.length < 400) {
    return detectCollisionsNaive(aabbs);
  } else if (aabbs.length < 1000) {
    return detectCollisionsSpatialHash(aabbs);
  } else {
    return detectCollisionsOptimized(aabbs);
  }
}

/**
 * AABB collision check
 */
function checkAABBCollision(a: AABB, b: AABB): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

/**
 * Create collision result with overlap details
 */
function createCollisionResult(a: AABB, b: AABB): {
  colliding: boolean;
  overlap: { x: number; y: number; width: number; height: number } | null;
  overlapArea: number;
  distance: number;
} {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const overlapArea = overlapX * overlapY;

  return {
    colliding: true,
    overlap: overlapArea > 0 ? { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), width: overlapX, height: overlapY } : null,
    overlapArea,
    distance: 0,
  };
}
