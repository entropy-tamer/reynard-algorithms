/**
 * AABB Batch Collision Detection
 *
 * Efficient batch processing for multiple AABB collision checks.
 * Supports both naive O(n²) and optimized spatial hashing approaches.
 *
 * @module algorithms/aabbBatchCollision
 */
import type { AABB, AABBSpatialHashConfig, CollisionResult } from "./aabb-types";
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
export declare function batchCollisionDetection(aabbs: AABB[], options?: {
    maxDistance?: number;
    includeSelf?: boolean;
    spatialHash?: AABBSpatialHashConfig;
}): Array<{
    index1: number;
    index2: number;
    result: CollisionResult;
}>;
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
export declare function batchCollisionWithSpatialHash(aabbs: AABB[], options: {
    maxDistance?: number;
    includeSelf?: boolean;
    spatialHash?: AABBSpatialHashConfig;
}): Array<{
    index1: number;
    index2: number;
    result: CollisionResult;
}>;
//# sourceMappingURL=aabb-batch-collision.d.ts.map