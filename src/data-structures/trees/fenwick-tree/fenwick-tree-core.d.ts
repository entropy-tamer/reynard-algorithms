/**
 * Fenwick Tree (Binary Indexed Tree) Data Structure Core Implementation
 *
 * Implementation of the Fenwick Tree (Binary Indexed Tree) data structure with comprehensive
 * features including range queries, range updates, and efficient prefix sum operations.
 *
 * Mathematical Theory:
 * A Fenwick Tree is a data structure that supports efficient range sum queries and
 * point updates. It uses the binary representation of indices to achieve O(log n)
 * time complexity for both operations.
 *
 * Key operations:
 * - Build: O(n log n) time complexity
 * - Query: O(log n) time complexity
 * - Point Update: O(log n) time complexity
 * - Range Update: O(log n) time complexity (with range update technique)
 *
 * Space Complexity: O(n) where n is the number of elements.
 *
 * @module algorithms/data-structures/fenwick-tree
 */
import type { FenwickTreeConfig, FenwickTreeQueryResult, FenwickTreeUpdateResult, FenwickTreeRangeUpdateResult, FenwickTreeStats, FenwickTreeEventHandler, FenwickTreeOptions, FenwickTreePerformanceMetrics, BatchOperationResult, FenwickTreeSerialization } from "./fenwick-tree-types";
/**
 * Fenwick Tree (Binary Indexed Tree) Data Structure Implementation
 *
 * Provides efficient range sum queries and updates with support for
 * range updates and configurable indexing.
 */
export declare class FenwickTree {
    private tree;
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
    constructor(options?: Partial<FenwickTreeOptions>);
    /**
     * Build the Fenwick tree from the current array
     *
     * @returns True if build was successful
     * @example
     */
    build(): boolean;
    /**
     * Query the sum from index 0 to index (inclusive)
     *
     * @param index End index of the query
     * @returns Query result
     * @example
     */
    query(index: number): FenwickTreeQueryResult;
    /**
     * Query the sum from start index to end index (inclusive)
     *
     * @param start Start index of the range
     * @param end End index of the range
     * @returns Query result
     * @example
     */
    queryRange(start: number, end: number): FenwickTreeQueryResult;
    /**
     * Update a single element in the Fenwick tree
     *
     * @param index Index of the element to update
     * @param value New value
     * @returns Update result
     * @example
     */
    updatePoint(index: number, value: number): FenwickTreeUpdateResult;
    /**
     * Update a range of elements in the Fenwick tree
     *
     * @param start Start index of the range
     * @param end End index of the range
     * @param value Update value
     * @returns Update result
     * @example
     */
    updateRange(start: number, end: number, value: number): FenwickTreeRangeUpdateResult;
    /**
     * Get the value at a specific index
     *
     * @param index Index to query
     * @returns Value at the index
     * @example
     */
    get(index: number): number | null;
    /**
     * Set the value at a specific index
     *
     * @param index Index to set
     * @param value New value
     * @returns True if successful
     * @example
     */
    set(index: number, value: number): boolean;
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
        value: number;
    }>): BatchOperationResult;
    /**
     * Get all elements in the array
     *
     * @returns Array of all elements
     * @example
     */
    getAllElements(): number[];
    /**
     * Serialize the tree to a JSON format
     *
     * @returns Serialized tree data
     * @example
     */
    serialize(): FenwickTreeSerialization;
    /**
     * Deserialize a tree from JSON format
     *
     * @param serialized Serialized tree data
     * @returns True if deserialization was successful
     * @example
     */
    deserialize(serialized: FenwickTreeSerialization): boolean;
    /**
     * Add event handler
     * @param handler
     * @example
     */
    addEventHandler(handler: FenwickTreeEventHandler): void;
    /**
     * Remove event handler
     * @param handler
     * @example
     */
    removeEventHandler(handler: FenwickTreeEventHandler): void;
    /**
     * Get current statistics
     * @example
     */
    getStats(): FenwickTreeStats;
    /**
     * Get performance metrics
     * @example
     */
    getPerformanceMetrics(): FenwickTreePerformanceMetrics;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<FenwickTreeConfig>): void;
    /**
     * Add a value to the tree at a specific index
     * @param index
     * @param value
     * @param nodesUpdated
     * @param nodesUpdatedRef
     * @param nodesUpdatedRef.count
     * @example
     */
    private add;
    /**
     * Query the tree recursively
     * @param index
     * @param nodesVisited
     * @param nodesVisitedRef
     * @param nodesVisitedRef.count
     * @example
     */
    private queryRecursive;
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
//# sourceMappingURL=fenwick-tree-core.d.ts.map