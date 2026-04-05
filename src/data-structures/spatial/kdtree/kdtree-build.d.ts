/**
 * KD-Tree Build Operations
 *
 * Handles tree construction, insertion, and rebuilding
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, KdNode, KdTreeConfig, KdTreeStats, KdTreeResult, BatchOperationResult, KdTreeEventHandler } from "./kdtree-types";
/**
 * Insert a point into the KD-Tree
 *
 * @param root Current root node
 * @param point Point to insert
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param depth Current depth
 * @returns New root node and result
 * @example
 */
export declare function insertPoint(root: KdNode | null, point: Point, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[], depth?: number): {
    root: KdNode;
    result: KdTreeResult;
};
/**
 * Insert multiple points in batch
 *
 * @param root Current root node
 * @param points Array of points to insert
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and batch result
 * @example
 */
export declare function insertBatch(root: KdNode | null, points: Point[], config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[]): {
    root: KdNode | null;
    result: BatchOperationResult;
};
/**
 * Rebuild the entire tree
 *
 * @param points Array of all points
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and result
 * @example
 */
export declare function rebuildTree(points: Point[], config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[]): {
    root: KdNode | null;
    result: KdTreeResult;
};
//# sourceMappingURL=kdtree-build.d.ts.map