/**
 * K-d Tree Data Structure Core Implementation
 *
 * Main KdTree class that orchestrates tree operations using modular components
 * for building, searching, nearest neighbor queries, range queries, and removal.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, BoundingBox, KdTreeStats, KdTreeResult, NearestNeighborResult, KNearestNeighborsResult, RangeQueryResult, NearestNeighborOptions, KNearestNeighborsOptions, RangeQueryOptions, KdTreeOptions, KdTreeEventHandler, KdTreePerformanceMetrics, BatchOperationResult, KdTreeSerialization } from "./kdtree-types";
/**
 * K-d Tree Data Structure Implementation
 *
 * Provides efficient k-dimensional point storage and querying with
 * nearest neighbor search, range queries, and performance monitoring.
 */
export declare class KdTree {
    private root;
    private config;
    private eventHandlers;
    private stats;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<KdTreeOptions>);
    /**
     * Insert a single point into the tree.
     * @param point
     * @example
     */
    insert(point: Point): KdTreeResult;
    /**
     * Insert multiple points in batch.
     * @param points
     * @example
     */
    insertBatch(points: Point[]): BatchOperationResult;
    /**
     * Search for a point in the tree.
     * @param point
     * @example
     */
    search(point: Point): boolean;
    /**
     * Check if tree contains a point.
     * @param point
     * @example
     */
    contains(point: Point): boolean;
    /**
     * Find nearest neighbor to a query point.
     * @param queryPoint
     * @param options
     * @example
     */
    nearestNeighbor(queryPoint: Point, options?: NearestNeighborOptions): NearestNeighborResult;
    /**
     * Find k nearest neighbors to a query point.
     * @param queryPoint
     * @param options
     * @example
     */
    kNearestNeighbors(queryPoint: Point, options?: Partial<KNearestNeighborsOptions>): KNearestNeighborsResult;
    /**
     * Perform range query on the tree.
     * @param bounds
     * @param options
     * @example
     */
    rangeQuery(bounds: BoundingBox, options?: Partial<RangeQueryOptions>): RangeQueryResult;
    /**
     * Find points within a radius of a center point.
     * @param center
     * @param radius
     * @param options
     * @example
     */
    findPointsInRadius(center: Point, radius: number, options?: Partial<RangeQueryOptions>): RangeQueryResult;
    /**
     * Remove a point from the tree.
     * @param point
     * @example
     */
    remove(point: Point): KdTreeResult;
    /**
     * Clear all points from the tree.
     * @example
     */
    clear(): void;
    /**
     * Get the number of points in the tree.
     * @example
     */
    size(): number;
    /**
     * Check if the tree is empty.
     * @example
     */
    isEmpty(): boolean;
    /**
     * Get current tree statistics.
     * @example
     */
    getStats(): KdTreeStats;
    /**
     * Get performance metrics.
     * @example
     */
    getPerformanceMetrics(): KdTreePerformanceMetrics;
    /**
     * Rebuild the entire tree.
     * @example
     */
    rebuild(): KdTreeResult;
    /**
     * Serialize the tree to JSON.
     * @example
     */
    serialize(): KdTreeSerialization;
    /**
     * Add event handler.
     * @param handler
     * @example
     */
    addEventHandler(handler: KdTreeEventHandler): void;
    /**
     * Remove event handler.
     * @param handler
     * @example
     */
    removeEventHandler(handler: KdTreeEventHandler): void;
    /**
     * Enable or disable debug mode.
     * @param enabled
     * @param _enabled
     * @example
     */
    setDebugMode(_enabled: boolean): void;
    /**
     * Get all points in the tree.
     * @example
     */
    getAllPoints(): Point[];
    /**
     * Reset all statistics.
     * @example
     */
    resetStats(): void;
}
//# sourceMappingURL=kdtree-core.d.ts.map