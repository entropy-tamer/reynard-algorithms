/**
 * Segment Tree Data Structure Core Implementation
 *
 * Implementation of the Segment Tree data structure with comprehensive
 * features including range queries, range updates, lazy propagation,
 * and configurable aggregation functions.
 *
 * Mathematical Theory:
 * A Segment Tree is a data structure that allows efficient range queries
 * and range updates on an array. It divides the array into segments and
 * stores aggregated information about each segment.
 *
 * Key operations:
 * - Build: O(n) time complexity
 * - Query: O(log n) time complexity
 * - Point Update: O(log n) time complexity
 * - Range Update: O(log n) time complexity (with lazy propagation)
 *
 * Space Complexity: O(n) where n is the number of elements.
 *
 * @module algorithms/data-structures/segment-tree
 */
import type { SegmentTreeConfig, SegmentTreeQueryResult, SegmentTreeUpdateResult, SegmentTreeStats, SegmentTreeEventHandler, SegmentTreeOptions, SegmentTreePerformanceMetrics, BatchOperationResult, SegmentTreeSerialization, TraversalOptions, TraversalResult } from "./segment-tree-types";
/**
 * Segment Tree Data Structure Implementation
 *
 * Provides efficient range queries and updates with support for
 * lazy propagation and configurable aggregation functions.
 */
export declare class SegmentTree<T> {
    private root;
    private config;
    private eventHandlers;
    private enableStats;
    private enableDebug;
    private stats;
    private array;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<SegmentTreeOptions<T>>);
    /**
     * Build the segment tree from the current array
     *
     * @returns True if build was successful
     * @example
     */
    build(): boolean;
    /**
     * Query a range in the segment tree
     *
     * @param start Start index of the range
     * @param end End index of the range
     * @returns Query result
     * @example
     */
    query(start: number, end: number): SegmentTreeQueryResult<T>;
    /**
     * Update a single element in the segment tree
     *
     * @param index Index of the element to update
     * @param value New value
     * @returns Update result
     * @example
     */
    updatePoint(index: number, value: T): SegmentTreeUpdateResult;
    /**
     * Update a range of elements in the segment tree
     *
     * @param start Start index of the range
     * @param end End index of the range
     * @param value Update value
     * @returns Update result
     * @example
     */
    updateRange(start: number, end: number, value: T): SegmentTreeUpdateResult;
    /**
     * Get the value at a specific index
     *
     * @param index Index to query
     * @returns Value at the index
     * @example
     */
    get(index: number): T | null;
    /**
     * Set the value at a specific index
     *
     * @param index Index to set
     * @param value New value
     * @returns True if successful
     * @example
     */
    set(index: number, value: T): boolean;
    /**
     * Get the size of the array
     *
     * @returns Number of elements
     * @example
     */
    size(): number;
    /**
     * Check if the tree is empty
     *
     * @returns True if empty
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clear the tree
     * @example
     */
    clear(): void;
    /**
     * Update multiple elements in batch
     *
     * @param updates Array of {index, value} pairs
     * @returns Batch operation result
     * @example
     */
    updateBatch(updates: Array<{
        index: number;
        value: T;
    }>): BatchOperationResult;
    /**
     * Traverse the tree with custom options
     *
     * @param options Traversal options
     * @returns Traversal result
     * @example
     */
    traverse(options?: Partial<TraversalOptions>): TraversalResult<T>;
    /**
     * Get all elements in the array
     *
     * @returns Array of all elements
     * @example
     */
    getAllElements(): T[];
    /**
     * Serialize the tree to a JSON format
     *
     * @returns Serialized tree data
     * @example
     */
    serialize(): SegmentTreeSerialization<T>;
    /**
     * Deserialize a tree from JSON format
     *
     * @param serialized Serialized tree data
     * @returns True if deserialization was successful
     * @example
     */
    deserialize(serialized: SegmentTreeSerialization<T>): boolean;
    /**
     * Add event handler
     * @param handler
     * @example
     */
    addEventHandler(handler: SegmentTreeEventHandler): void;
    /**
     * Remove event handler
     * @param handler
     * @example
     */
    removeEventHandler(handler: SegmentTreeEventHandler): void;
    /**
     * Get current statistics
     * @example
     */
    getStats(): SegmentTreeStats;
    /**
     * Get performance metrics
     * @example
     */
    getPerformanceMetrics(): SegmentTreePerformanceMetrics;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<SegmentTreeConfig<T>>): void;
    /**
     * Build the segment tree recursively
     * @param start
     * @param end
     * @example
     */
    private buildRecursive;
    /**
     * Query the segment tree recursively
     * @param node
     * @param start
     * @param end
     * @param nodesVisited
     * @example
     */
    private queryRecursive;
    /**
     * Update a point in the segment tree recursively
     * @param node
     * @param index
     * @param value
     * @param nodesUpdated
     * @example
     */
    private updatePointRecursive;
    /**
     * Update a range in the segment tree recursively
     * @param node
     * @param start
     * @param end
     * @param value
     * @param nodesUpdated
     * @example
     */
    private updateRangeRecursive;
    /**
     * Traverse the tree recursively
     * @param node
     * @param values
     * @param nodesVisited
     * @param options
     * @example
     */
    private traverseRecursive;
    /**
     * Count total nodes in the tree
     * @example
     */
    private countNodes;
    /**
     *
     * @param node
     * @example
     */
    private countNodesFrom;
    /**
     * Get the height of the tree
     * @example
     */
    private getHeight;
    /**
     * Calculate height of a node
     * @param node
     * @example
     */
    private calculateHeight;
    /**
     * Calculate memory usage
     * @example
     */
    private calculateMemoryUsage;
    /**
     * Emit event to registered handlers
     * @param type
     * @param data
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=segment-tree-core.d.ts.map