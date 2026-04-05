/**
 * BVH Query Operations
 *
 * Handles ray intersection queries and AABB intersection queries
 * for the BVH data structure with efficient traversal.
 *
 * @module algorithms/spatial-structures/bvh
 */
import type { Ray3D, AABB, BVHNode, RayIntersectionOptions, AABBIntersectionOptions, RayIntersectionResult, AABBIntersectionResult, BVHStats } from "./bvh-types";
import { BVHEventType } from "./bvh-types";
/**
 * Perform ray intersection query
 *
 * @param root Root node of the BVH
 * @param ray Ray to test
 * @param options Intersection options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Ray intersection result
 * @example
 */
export declare function rayIntersection(root: BVHNode | null, ray: Ray3D, options: RayIntersectionOptions | undefined, stats: BVHStats, emitEvent: (type: BVHEventType, data?: any) => void): RayIntersectionResult;
/**
 * Perform AABB intersection query
 *
 * @param root Root node of the BVH
 * @param aabb AABB to test
 * @param options Intersection options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns AABB intersection result
 * @example
 */
export declare function aabbIntersection(root: BVHNode | null, aabb: AABB, options: AABBIntersectionOptions | undefined, stats: BVHStats, emitEvent: (type: BVHEventType, data?: any) => void): AABBIntersectionResult;
//# sourceMappingURL=bvh-query.d.ts.map