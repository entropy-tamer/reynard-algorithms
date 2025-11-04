/**
 * Collision pair utilities for Sweep and Prune algorithm
 *
 * Provides utilities for creating, managing, and filtering collision pairs.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-collision
 */

import type { AABB, CollisionPair, Endpoint } from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";

/**
 * Check if two AABBs overlap on a specific axis
 */
export function aabbsOverlapOnAxis(aabb1: AABB, aabb2: AABB, axis: number): boolean {
  if (axis === 0) {
    return aabb1.minX < aabb2.maxX && aabb2.minX < aabb1.maxX;
  } else {
    return aabb1.minY < aabb2.maxY && aabb2.minY < aabb1.maxY;
  }
}

/**
 * Check if two AABBs overlap
 */
export function aabbsOverlap(aabb1: AABB, aabb2: AABB): boolean {
  return aabb1.minX < aabb2.maxX && aabb2.minX < aabb1.maxX && aabb1.minY < aabb2.maxY && aabb2.minY < aabb1.maxY;
}

/**
 * Generate unique ID for a collision pair
 */
export function getPairId(aabb1: AABB, aabb2: AABB): string {
  const id1 = String(aabb1.id);
  const id2 = String(aabb2.id);
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}

/**
 * Create a collision pair from two AABBs
 */
export function createCollisionPair(
  aabb1: AABB,
  aabb2: AABB,
  activePairs: Map<string, CollisionPair>
): CollisionPair {
  const pairId = getPairId(aabb1, aabb2);
  const existingPair = activePairs.get(pairId);

  if (existingPair) {
    existingPair.active = true;
    existingPair.lastUpdate = Date.now();
    return existingPair;
  }

  const newPair: CollisionPair = {
    aabb1,
    aabb2,
    active: true,
    lastUpdate: Date.now(),
  };

  activePairs.set(pairId, newPair);
  return newPair;
}

/**
 * Filter collision pairs based on second axis results
 */
export function filterCollisionPairs(
  pairs: CollisionPair[],
  secondAxisPairs: CollisionPair[],
  emitEvent: (type: SweepPruneEventType, data?: any) => void
): void {
  const secondAxisPairIds = new Set(secondAxisPairs.map(pair => getPairId(pair.aabb1, pair.aabb2)));

  for (const pair of pairs) {
    const pairId = getPairId(pair.aabb1, pair.aabb2);
    pair.active = secondAxisPairIds.has(pairId);

    if (!pair.active) {
      emitEvent(SweepPruneEventType.COLLISION_PAIR_LOST, { pair });
    }
  }
}

/**
 * Find intersection of collision pairs from multiple axes
 */
export function intersectCollisionPairs(axisPairArrays: CollisionPair[][]): CollisionPair[] {
  if (axisPairArrays.length === 0) return [];
  if (axisPairArrays.length === 1) return axisPairArrays[0];

  // Start with first axis pairs
  let result = axisPairArrays[0];

  // Intersect with each subsequent axis
  for (let i = 1; i < axisPairArrays.length; i++) {
    const currentAxisPairs = axisPairArrays[i];
    const currentAxisPairIds = new Set(currentAxisPairs.map(pair => getPairId(pair.aabb1, pair.aabb2)));

    result = result.filter(pair => {
      const pairId = getPairId(pair.aabb1, pair.aabb2);
      return currentAxisPairIds.has(pairId);
    });
  }

  return result;
}

