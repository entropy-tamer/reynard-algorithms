/**
 * Octree Query Operations
 *
 * Handles spatial queries including bounds queries, sphere queries,
 * and nearest neighbor searches for the Octree data structure.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Bounds3D, Sphere3D, OctreeNode, SpatialQueryOptions, SpatialQueryResult, OctreeStats } from "./octree-types";
import { OctreeEventType } from "./octree-types";
/**
 * Query points within bounds
 *
 * @param root Root node of the octree
 * @param bounds Query bounds
 * @param options Query options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Query result
 * @example
 */
export declare function queryBounds(root: OctreeNode | null, bounds: Bounds3D, options: SpatialQueryOptions | undefined, stats: OctreeStats, emitEvent: (type: OctreeEventType, data?: any) => void): SpatialQueryResult;
/**
 * Query points within sphere
 *
 * @param root Root node of the octree
 * @param sphere Query sphere
 * @param options Query options
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Query result
 * @example
 */
export declare function querySphere(root: OctreeNode | null, sphere: Sphere3D, options: SpatialQueryOptions | undefined, stats: OctreeStats, emitEvent: (type: OctreeEventType, data?: any) => void): SpatialQueryResult;
//# sourceMappingURL=octree-query.d.ts.map