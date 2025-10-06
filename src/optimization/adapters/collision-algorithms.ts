/**
 * Collision Detection Algorithms
 *
 * Pure collision detection implementations for different strategies.
 * Each algorithm is focused and optimized for specific use cases.
 *
 * @module algorithms/optimization/collisionAlgorithms
 */

import type { AABB, CollisionPair, CollisionResult } from "../../geometry/collision/aabb-types";
import type { CollisionObjectData } from "../../types/spatial-types";
import { SpatialHash } from "../../spatial-hash/spatial-hash-core";
import { EnhancedMemoryPool } from "../core/enhanced-memory-pool";

/**
 * Basic collision detection between two AABBs
 */
export function checkCollision(a: AABB, b: AABB): boolean {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

/**
 * Create detailed collision result
 */
export function createCollisionResult(a: AABB, b: AABB): CollisionResult {
  const colliding = checkCollision(a, b);

  if (!colliding) {
    return {
      colliding: false,
      distance: Infinity,
      overlap: null,
      overlapArea: 0,
    };
  }

  // Calculate overlap area
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const overlapArea = overlapX * overlapY;

  // Calculate distance between centers
  const centerA = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  const centerB = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const distance = Math.sqrt(Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2));

  return {
    colliding: true,
    distance,
    overlap: {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY,
    },
    overlapArea: overlapX * overlapY,
  };
}

/**
 * Naive O(n²) collision detection
 */
export function executeNaiveCollisionDetection(aabbs: AABB[]): CollisionPair[] {
  const collisions: CollisionPair[] = [];

  for (let i = 0; i < aabbs.length; i++) {
    for (let j = i + 1; j < aabbs.length; j++) {
      if (checkCollision(aabbs[i], aabbs[j])) {
        collisions.push({
          a: i,
          b: j,
          result: createCollisionResult(aabbs[i], aabbs[j]),
        });
      }
    }
  }

  return collisions;
}

/**
 * Spatial hash-based collision detection
 */
export function executeSpatialCollisionDetection(aabbs: AABB[], memoryPool: EnhancedMemoryPool): CollisionPair[] {
  // For medium datasets, use naive approach as it's faster
  if (aabbs.length < 300) {
    return executeNaiveCollisionDetection(aabbs);
  }

  const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
  const collisions = memoryPool.getCollisionArray();

  try {
    // Insert all AABBs
    for (let i = 0; i < aabbs.length; i++) {
      spatialHash.insert({
        id: i,
        x: aabbs[i].x,
        y: aabbs[i].y,
        width: aabbs[i].width,
        height: aabbs[i].height,
        data: {
          id: i,
          type: "collision",
          aabb: aabbs[i],
          index: i,
        },
      });
    }

    // Check collisions using spatial queries
    const processed = memoryPool.getProcessedSet();

    try {
      for (let i = 0; i < aabbs.length; i++) {
        if (processed.has(i)) continue;

        const aabb = aabbs[i];
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

          if (checkCollision(aabb, collisionData.aabb)) {
            collisions.push({
              a: i,
              b: j,
              result: createCollisionResult(aabb, collisionData.aabb),
            });
          }
        }

        processed.add(i);
      }

      return [...collisions];
    } finally {
      memoryPool.returnProcessedSet(processed);
    }
  } finally {
    memoryPool.returnSpatialHash(spatialHash);
    memoryPool.returnCollisionArray(collisions);
  }
}

/**
 * Optimized collision detection (currently same as spatial)
 */
export function executeOptimizedCollisionDetection(aabbs: AABB[], memoryPool: EnhancedMemoryPool): CollisionPair[] {
  return executeSpatialCollisionDetection(aabbs, memoryPool);
}
