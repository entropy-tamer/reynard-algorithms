/**
 * Collision pair utilities for Sweep and Prune algorithm
 *
 * Provides utilities for creating, managing, and filtering collision pairs.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-collision
 */
import type { AABB, CollisionPair } from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";
/**
 * Check if two AABBs overlap on a specific axis
 * @param aabb1
 * @param aabb2
 * @param axis
 * @example
 */
export declare function aabbsOverlapOnAxis(aabb1: AABB, aabb2: AABB, axis: number): boolean;
/**
 * Check if two AABBs overlap
 * @param aabb1
 * @param aabb2
 * @example
 */
export declare function aabbsOverlap(aabb1: AABB, aabb2: AABB): boolean;
/**
 * Generate unique ID for a collision pair
 * @param aabb1
 * @param aabb2
 * @example
 */
export declare function getPairId(aabb1: AABB, aabb2: AABB): string;
/**
 * Create a collision pair from two AABBs
 * @param aabb1
 * @param aabb2
 * @param activePairs
 * @example
 */
export declare function createCollisionPair(aabb1: AABB, aabb2: AABB, activePairs: Map<string, CollisionPair>): CollisionPair;
/**
 * Filter collision pairs based on second axis results
 * @param pairs
 * @param secondAxisPairs
 * @param emitEvent
 * @example
 */
export declare function filterCollisionPairs(pairs: CollisionPair[], secondAxisPairs: CollisionPair[], emitEvent: (type: SweepPruneEventType, data?: any) => void): void;
/**
 * Find intersection of collision pairs from multiple axes
 * @param axisPairArrays
 * @example
 */
export declare function intersectCollisionPairs(axisPairArrays: CollisionPair[][]): CollisionPair[];
//# sourceMappingURL=sweep-prune-collision.d.ts.map