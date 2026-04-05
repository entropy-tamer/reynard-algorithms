/**
 * KD-Tree Nearest Neighbor Operations
 *
 * Handles nearest neighbor and k-nearest neighbors queries
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, KdNode, KdTreeConfig, KdTreeStats, NearestNeighborResult, KNearestNeighborsResult, NearestNeighborOptions, KNearestNeighborsOptions, KdTreeEventHandler } from "./kdtree-types";
/**
 * Find nearest neighbor to a query point
 *
 * @param root Root node
 * @param queryPoint Query point
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Search options
 * @param _options
 * @returns Nearest neighbor result
 * @example
 */
export declare function findNearestNeighbor(root: KdNode | null, queryPoint: Point, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[], _options?: NearestNeighborOptions): NearestNeighborResult;
/**
 * Find k nearest neighbors to a query point
 *
 * @param root Root node
 * @param queryPoint Query point
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Search options
 * @returns K nearest neighbors result
 * @example
 */
export declare function findKNearestNeighbors(root: KdNode | null, queryPoint: Point, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[], options: KNearestNeighborsOptions): KNearestNeighborsResult;
//# sourceMappingURL=kdtree-nearest.d.ts.map