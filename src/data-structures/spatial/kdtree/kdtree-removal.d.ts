/**
 * KD-Tree Removal Operations
 *
 * Handles point removal and tree rebalancing
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, KdNode, KdTreeConfig, KdTreeStats, KdTreeResult, KdTreeEventHandler } from "./kdtree-types";
/**
 * Remove a point from the KD-Tree
 *
 * @param root Root node
 * @param point Point to remove
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and result
 * @example
 */
export declare function removePoint(root: KdNode | null, point: Point, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[]): {
    root: KdNode | null;
    result: KdTreeResult;
};
/**
 * Clear all points from the tree
 *
 * @param root Root node
 * @param _root
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Result
 * @example
 */
export declare function clearTree(_root: KdNode | null, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[]): KdTreeResult;
//# sourceMappingURL=kdtree-removal.d.ts.map