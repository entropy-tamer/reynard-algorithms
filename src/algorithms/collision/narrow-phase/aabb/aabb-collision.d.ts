/**
 * AABB (Axis-Aligned Bounding Box) Collision Detection
 *
 * Core collision detection algorithms for axis-aligned bounding boxes.
 * Provides the fundamental collision checking functionality.
 *
 * @module algorithms/aabbCollision
 */
import type { AABB, CollisionResult } from "./aabb-types";
/**
 * Check if two AABBs overlap
 * @param a
 * @param b
 * @example
 */
export declare function checkCollision(a: AABB, b: AABB): CollisionResult;
//# sourceMappingURL=aabb-collision.d.ts.map