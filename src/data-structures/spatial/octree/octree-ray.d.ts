/**
 * Octree Ray Intersection Operations
 *
 * Handles ray casting and intersection testing for the Octree data structure.
 * Provides efficient ray-octree intersection queries.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Ray3D, OctreeNode, RayIntersectionOptions, RayIntersectionResult, OctreeStats } from "./octree-types";
import { OctreeEventType } from "./octree-types";
/**
 * Perform ray intersection query
 *
 * @param root Root node of the octree
 * @param ray Ray to test
 * @param options Intersection options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Ray intersection result
 * @example
 */
export declare function rayIntersection(root: OctreeNode | null, ray: Ray3D, options: RayIntersectionOptions | undefined, stats: OctreeStats, emitEvent: (type: OctreeEventType, data?: any) => void): RayIntersectionResult;
//# sourceMappingURL=octree-ray.d.ts.map