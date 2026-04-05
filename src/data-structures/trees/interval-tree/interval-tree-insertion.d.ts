/**
 * Interval Tree Insertion Operations
 *
 * Handles interval insertion and AVL tree balancing
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */
import type { Interval, IntervalTreeNode, IntervalTreeConfig, IntervalTreeStats, IntervalTreeEventHandler, BatchOperationResult } from "./interval-tree-types";
/**
 * Insert an interval into the tree
 *
 * @param root Current root node
 * @param interval Interval to insert
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and success status
 * @example
 */
export declare function insertInterval(root: IntervalTreeNode | null, interval: Interval, config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): {
    root: IntervalTreeNode | null;
    success: boolean;
};
/**
 * Insert multiple intervals in batch
 *
 * @param root Current root node
 * @param intervals Array of intervals to insert
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and batch result
 * @example
 */
export declare function insertBatch(root: IntervalTreeNode | null, intervals: Interval[], config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): {
    root: IntervalTreeNode | null;
    result: BatchOperationResult;
};
//# sourceMappingURL=interval-tree-insertion.d.ts.map