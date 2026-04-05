/**
 * Octree Insertion Operations
 *
 * Handles point insertion, batch insertion, and recursive insertion logic
 * for the Octree data structure.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Point3D, OctreeNode, OctreeConfig, OctreeResult, BatchOperationResult, OctreeStats } from "./octree-types";
import { OctreeEventType } from "./octree-types";
/**
 * Insert a single point into the octree
 *
 * @param root Root node of the octree
 * @param point Point to insert
 * @param config Octree configuration
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Insertion result
 * @example
 */
export declare function insertPoint(root: OctreeNode | null, point: Point3D, config: Required<OctreeConfig>, stats: OctreeStats, emitEvent: (type: OctreeEventType, data?: any) => void): OctreeResult;
/**
 * Insert multiple points in batch
 *
 * @param root Root node of the octree
 * @param points Points to insert
 * @param config Octree configuration
 * @param stats Statistics object to update
 * @param emitEvent Event emission function
 * @returns Batch operation result
 * @example
 */
export declare function insertBatch(root: OctreeNode | null, points: Point3D[], config: Required<OctreeConfig>, stats: OctreeStats, emitEvent: (type: OctreeEventType, data?: any) => void): BatchOperationResult;
//# sourceMappingURL=octree-insertion.d.ts.map