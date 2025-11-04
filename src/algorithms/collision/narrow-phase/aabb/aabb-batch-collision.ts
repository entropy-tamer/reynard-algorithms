/**
 * AABB Batch Collision Detection
 *
 * Efficient batch processing for multiple AABB collision checks.
 * Supports both naive O(n²) and optimized spatial hashing approaches.
 *
 * @module algorithms/aabbBatchCollision
 */

import type { AABB, AABBSpatialHashConfig, CollisionResult } from "./aabb-types";
import { SpatialHash } from "../../../../data-structures/spatial/spatial-hash/spatial-hash-core";
import { checkCollision } from "./aabb-collision";

/**
 * Batch collision detection for multiple AABBs
 * @param aabbs
 * @param options
 * @param options.maxDistance
 * @param options.includeSelf
 * @param options.spatialHash
 * @returns Array of collision pairs with indices and collision results
 * @example
 */
export function batchCollisionDetection(
  aabbs: AABB[],
  options: {
    maxDistance?: number;
    includeSelf?: boolean;
    spatialHash?: AABBSpatialHashConfig;
  } = {}
): Array<{ index1: number; index2: number; result: CollisionResult }> {
  const { maxDistance, includeSelf = false, spatialHash } = options;
  const collisions: Array<{
    index1: number;
    index2: number;
    result: CollisionResult;
  }> = [];

  if (spatialHash?.enableOptimization && aabbs.length > 100) {
    return batchCollisionWithSpatialHash(aabbs, options);
  }

  for (let i = 0; i < aabbs.length; i++) {
    for (let j = includeSelf ? i : i + 1; j < aabbs.length; j++) {
      const result = checkCollision(aabbs[i], aabbs[j]);

      if (result.colliding && (!maxDistance || result.distance <= maxDistance)) {
        collisions.push({
          index1: i,
          index2: j,
          result,
        });
      }
    }
  }

  return collisions;
}

/**
 * Batch collision detection using spatial hashing
 * @param aabbs
 * @param options
 * @param options.maxDistance
 * @param options.includeSelf
 * @param options.spatialHash
 * @returns Array of collision pairs with indices and collision results
 * @example
 */
export function batchCollisionWithSpatialHash(
  aabbs: AABB[],
  options: {
    maxDistance?: number;
    includeSelf?: boolean;
    spatialHash?: AABBSpatialHashConfig;
  }
): Array<{ index1: number; index2: number; result: CollisionResult }> {
  const { maxDistance, includeSelf = false, spatialHash } = options;
  const collisions: Array<{
    index1: number;
    index2: number;
    result: CollisionResult;
  }> = [];

  if (!spatialHash) {
    return batchCollisionDetection(aabbs, options);
  }

  const hash = new SpatialHash({
    cellSize: spatialHash.cellSize,
    maxObjectsPerCell: spatialHash.maxObjectsPerCell || 50,
  });

  // Insert all AABBs into spatial hash
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    hash.insert({
      id: i,
      x: aabb.x,
      y: aabb.y,
      width: aabb.width,
      height: aabb.height,
      data: aabb as any,
    });
  }

  // Query for collisions
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    const candidates = hash.queryRect(aabb.x, aabb.y, aabb.width, aabb.height);

    for (const candidate of candidates) {
      const j = candidate.id as number;
      if (!includeSelf && i >= j) continue;

      const result = checkCollision(aabbs[i], aabbs[j]);

      if (result.colliding && (!maxDistance || result.distance <= maxDistance)) {
        collisions.push({
          index1: i,
          index2: j,
          result,
        });
      }
    }
  }

  return collisions;
}
