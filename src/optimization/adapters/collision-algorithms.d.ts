/**
 * Collision Detection Algorithms
 *
 * Pure collision detection implementations for different strategies.
 * Each algorithm is focused and optimized for specific use cases.
 *
 * @module algorithms/optimization/collisionAlgorithms
 */
import type { AABB, CollisionPair, CollisionResult } from "../../algorithms/collision/narrow-phase/aabb/aabb-types";
import { MemoryPool } from "../core/memory-pool";
/**
 * Basic collision detection between two AABBs
 * @param a
 * @param b
 * @example
 */
export declare function checkCollision(a: AABB, b: AABB): boolean;
/**
 * Create detailed collision result
 * @param a
 * @param b
 * @example
 */
export declare function createCollisionResult(a: AABB, b: AABB): CollisionResult;
/**
 * Naive O(n²) collision detection
 * @param aabbs
 * @example
 */
export declare function executeNaiveCollisionDetection(aabbs: AABB[]): CollisionPair[];
/**
 * Spatial hash-based collision detection
 * @param aabbs
 * @param memoryPool
 * @example
 */
export declare function executeSpatialCollisionDetection(aabbs: AABB[], memoryPool: MemoryPool): CollisionPair[];
/**
 * Optimized collision detection (currently same as spatial)
 * @param aabbs
 * @param memoryPool
 * @example
 */
export declare function executeOptimizedCollisionDetection(aabbs: AABB[], memoryPool: MemoryPool): CollisionPair[];
//# sourceMappingURL=collision-algorithms.d.ts.map