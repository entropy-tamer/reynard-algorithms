/**
 * Collision Detection Algorithms
 *
 * Pure collision detection implementations for different strategies.
 * Each algorithm is focused and optimized for specific use cases.
 *
 * @module algorithms/optimization/collisionAlgorithms
 */

import type { AABB, CollisionPair, CollisionResult } from "../../algorithms/collision/narrow-phase/aabb/aabb-types";
import type { CollisionObjectData } from "../../core/types/spatial-types";
// import { SpatialHash } from "../../data-structures/spatial/spatial-hash/spatial-structures/spatial-hash-core";
import { MemoryPool } from "../core/memory-pool";
import { validateAABBsForCollision, assertValidAABB } from "../../algorithms/collision/narrow-phase/aabb/aabb-validation";
import { getAlgorithmConfig } from "../../config/algorithm-config";

/**
 * Basic collision detection between two AABBs
 * @param a
 * @param b
 * @example
 */
export function checkCollision(a: AABB, b: AABB): boolean {
  // Validate AABBs before collision detection
  const validation = validateAABBsForCollision(a, b);
  if (!validation.isValid) {
    throw new Error(`Invalid AABBs for collision detection: ${validation.errors.join(", ")}`);
  }

  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

/**
 * Create detailed collision result
 * @param a
 * @param b
 * @example
 */
export function createCollisionResult(a: AABB, b: AABB): CollisionResult {
  // Validate AABBs before creating collision result
  const validation = validateAABBsForCollision(a, b);
  if (!validation.isValid) {
    throw new Error(`Invalid AABBs for collision result: ${validation.errors.join(", ")}`);
  }

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
    overlapArea,
  };
}

/**
 * Naive O(n²) collision detection
 * @param aabbs
 * @example
 */
export function executeNaiveCollisionDetection(aabbs: AABB[]): CollisionPair[] {
  // Validate input array
  if (!Array.isArray(aabbs)) {
    throw new Error("AABBs must be provided as an array");
  }

  if (aabbs.length === 0) {
    return [];
  }

  if (aabbs.length === 1) {
    return [];
  }

  // Validate each AABB in the array
  for (let i = 0; i < aabbs.length; i++) {
    try {
      assertValidAABB(aabbs[i]);
    } catch (error) {
      throw new Error(`Invalid AABB at index ${i}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

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
 * @param aabbs
 * @param memoryPool
 * @example
 */
export function executeSpatialCollisionDetection(aabbs: AABB[], memoryPool: MemoryPool): CollisionPair[] {
  // Validate input array
  if (!Array.isArray(aabbs)) {
    throw new Error("AABBs must be provided as an array");
  }

  if (aabbs.length === 0) {
    return [];
  }

  if (aabbs.length === 1) {
    return [];
  }

  // Validate each AABB in the array
  for (let i = 0; i < aabbs.length; i++) {
    try {
      assertValidAABB(aabbs[i]);
    } catch (error) {
      throw new Error(`Invalid AABB at index ${i}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get configurable threshold from algorithm config
  const config = getAlgorithmConfig();
  const spatialThreshold = config.thresholds.naiveToSpatial;

  // For medium datasets, use naive approach as it's faster
  if (aabbs.length < spatialThreshold) {
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
 * @param aabbs
 * @param memoryPool
 * @example
 */
export function executeOptimizedCollisionDetection(aabbs: AABB[], memoryPool: MemoryPool): CollisionPair[] {
  return executeSpatialCollisionDetection(aabbs, memoryPool);
}
