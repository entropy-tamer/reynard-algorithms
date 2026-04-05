/**
 * Interval Tree Core Implementation
 *
 * Main IntervalTree class that orchestrates tree operations
 * using modular components for insertion, deletion, search, balancing, and utilities.
 *
 * @module algorithms/data-structures/interval-tree
 */
import type { Interval, IntervalTreeNode, IntervalSearchResult, IntervalOverlapResult, IntervalTreeTraversalResult, IntervalTreeStats, IntervalTreeEventHandler, IntervalTreeOptions, IntervalTreePerformanceMetrics, TraversalOptions, BatchOperationResult, IntervalTreeSerialization } from "./interval-tree-types";
/**
 * Interval Tree Data Structure Implementation
 *
 * Provides efficient storage and retrieval of intervals with support for
 * overlap detection, range queries, and AVL balancing.
 */
export declare class IntervalTree {
    private root;
    private config;
    private eventHandlers;
    private _enableStats;
    private _enableDebug;
    private stats;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<IntervalTreeOptions>);
    /**
     * Insert an interval into the tree.
     * @param interval
     * @example
     */
    insert(interval: Interval): boolean;
    /**
     * Delete an interval from the tree.
     * @param interval
     * @example
     */
    delete(interval: Interval): boolean;
    /**
     * Search for intervals that overlap with a query interval.
     * @param queryInterval
     * @example
     */
    searchOverlapping(queryInterval: Interval): IntervalSearchResult;
    /**
     * Search for intervals that contain a point.
     * @param point
     * @example
     */
    searchContaining(point: number): IntervalSearchResult;
    /**
     * Search for intervals that are contained within a query interval.
     * @param queryInterval
     * @example
     */
    searchContainedIn(queryInterval: Interval): IntervalSearchResult;
    /**
     * Check if an interval overlaps with any interval in the tree.
     * @param interval
     * @example
     */
    checkOverlap(interval: Interval): IntervalOverlapResult;
    /**
     * Check if tree contains an interval.
     * @param interval
     * @example
     */
    contains(interval: Interval): boolean;
    /**
     * Get the number of intervals in the tree.
     * @example
     */
    size(): number;
    /**
     * Check if the tree is empty.
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clear all intervals from the tree.
     * @example
     */
    clear(): void;
    /**
     * Insert multiple intervals in batch.
     * @param intervals
     * @example
     */
    insertBatch(intervals: Interval[]): BatchOperationResult;
    /**
     * Traverse the tree in specified order.
     * @param options
     * @example
     */
    traverse(options?: Partial<TraversalOptions>): IntervalTreeTraversalResult;
    /**
     * Get all intervals in the tree.
     * @example
     */
    getAllIntervals(): Interval[];
    /**
     * Serialize the tree to JSON.
     * @example
     */
    serialize(): IntervalTreeSerialization;
    /**
     * Deserialize tree from JSON.
     * @param serialized
     * @example
     */
    deserialize(serialized: IntervalTreeSerialization): boolean;
    /**
     * Add event handler.
     * @param handler
     * @example
     */
    addEventHandler(handler: IntervalTreeEventHandler): void;
    /**
     * Remove event handler.
     * @param handler
     * @example
     */
    removeEventHandler(handler: IntervalTreeEventHandler): void;
    /**
     * Get current statistics.
     * @example
     */
    getStats(): IntervalTreeStats;
    /**
     * Get performance metrics.
     * @example
     */
    getPerformanceMetrics(): IntervalTreePerformanceMetrics;
    /**
     * Reset all statistics.
     * @example
     */
    resetStats(): void;
    /**
     * Enable or disable statistics collection.
     * @param enabled
     * @example
     */
    setStatsEnabled(enabled: boolean): void;
    /**
     * Check if statistics collection is enabled.
     * @returns True if statistics are enabled
     * @example
     */
    isStatsEnabled(): boolean;
    /**
     * Enable or disable debug mode.
     * @param enabled
     * @example
     */
    setDebugMode(enabled: boolean): void;
    /**
     * Check if debug mode is enabled.
     * @returns True if debug mode is enabled
     * @example
     */
    isDebugModeEnabled(): boolean;
    /**
     * Get tree height.
     * @example
     */
    getHeight(): number;
    /**
     * Find a specific interval in the tree.
     * @param interval
     * @example
     */
    findInterval(interval: Interval): IntervalTreeNode | null;
}
//# sourceMappingURL=interval-tree-core.d.ts.map