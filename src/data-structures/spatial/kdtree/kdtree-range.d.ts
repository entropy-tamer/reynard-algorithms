/**
 * KD-Tree Range Query Operations
 *
 * Handles range queries and spatial searches
 * for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, BoundingBox, KdNode, KdTreeConfig, KdTreeStats, RangeQueryResult, RangeQueryOptions, KdTreeEventHandler } from "./kdtree-types";
/**
 * Perform range query on KD-Tree
 *
 * @param root Root node
 * @param bounds Bounding box for query
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Query options
 * @returns Range query result
 * @example
 */
export declare function performRangeQuery(root: KdNode | null, bounds: BoundingBox, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[], options?: Partial<RangeQueryOptions>): RangeQueryResult;
/**
 * Find points within a radius of a center point
 *
 * @param root Root node
 * @param center Center point
 * @param radius Search radius
 * @param config KD-Tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @param options Query options
 * @returns Range query result
 * @example
 */
export declare function findPointsInRadius(root: KdNode | null, center: Point, radius: number, config: Required<KdTreeConfig>, stats: KdTreeStats, eventHandlers: KdTreeEventHandler[], options?: Partial<RangeQueryOptions>): RangeQueryResult;
//# sourceMappingURL=kdtree-range.d.ts.map