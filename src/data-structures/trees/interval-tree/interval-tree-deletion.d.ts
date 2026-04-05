/**
 * Interval Tree Deletion Operations
 *
 * Handles interval deletion and AVL tree rebalancing
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */
import type { Interval, IntervalTreeNode, IntervalTreeConfig, IntervalTreeStats, IntervalTreeEventHandler } from "./interval-tree-types";
/**
 * Delete an interval from the tree
 *
 * @param root Current root node
 * @param interval Interval to delete
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and success status
 * @example
 */
export declare function deleteInterval(root: IntervalTreeNode | null, interval: Interval, config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): {
    root: IntervalTreeNode | null;
    success: boolean;
};
/**
 * Clear all intervals from the tree
 *
 * @param root Current root node
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Result
 * @example
 */
export declare function clearTree(root: IntervalTreeNode | null, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): {
    root: IntervalTreeNode | null;
    success: boolean;
};
//# sourceMappingURL=interval-tree-deletion.d.ts.map