/**
 * KD-Tree Search Operations
 *
 * Handles point search and contains operations
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, KdNode, KdTreeConfig, KdTreeStats, KdTreeResult, KdTreeEventHandler } from "./kdtree-types";
/**
 * Search for a point in the KD-Tree
 *
 * @param root Root node
 * @param point Point to search for
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 * @example
 */
export declare function searchPoint(root: KdNode | null, point: Point, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[]): KdTreeResult;
/**
 * Check if tree contains a point
 *
 * @param root Root node
 * @param point Point to check
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param _stats
 * @param _eventHandlers
 * @returns True if point exists
 * @example
 */
export declare function containsPoint(root: KdNode | null, point: Point, config: Required<KdTreeConfig>, _stats: KdTreeStats, _eventHandlers: KdTreeEventHandler[]): boolean;
/**
 * Find all points in the tree
 *
 * @param root Root node
 * @returns Array of all points
 * @example
 */
export declare function getAllPoints(root: KdNode | null): Point[];
/**
 * Find points within a specific range for one dimension
 *
 * @param root Root node
 * @param dimension Dimension to search
 * @param minValue Minimum value
 * @param maxValue Maximum value
 * @param config KD-Tree configuration
 * @returns Array of points in range
 * @example
 */
export declare function findPointsInRange(root: KdNode | null, dimension: number, minValue: number, maxValue: number, config: Required<KdTreeConfig>): Point[];
//# sourceMappingURL=kdtree-search.d.ts.map