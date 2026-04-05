/**
 * Octree Frustum Culling Operations
 *
 * Handles frustum culling and visibility testing for the Octree data structure.
 * Provides efficient frustum-octree intersection queries for rendering optimization.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Frustum3D, OctreeNode, FrustumCullingOptions, FrustumCullingResult, OctreeStats } from "./octree-types";
import { OctreeEventType } from "./octree-types";
/**
 * Perform frustum culling query
 *
 * @param root Root node of the octree
 * @param frustum Frustum to test
 * @param options Culling options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Frustum culling result
 * @example
 */
export declare function frustumCulling(root: OctreeNode | null, frustum: Frustum3D, options: FrustumCullingOptions | undefined, stats: OctreeStats, emitEvent: (type: OctreeEventType, data?: any) => void): FrustumCullingResult;
//# sourceMappingURL=octree-frustum.d.ts.map