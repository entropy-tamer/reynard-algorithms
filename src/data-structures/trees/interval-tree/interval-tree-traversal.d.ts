import type { Interval, IntervalTreeNode, IntervalTreeTraversalResult, TraversalOptions, IntervalTreeEventHandler } from "./interval-tree-types";
/**
 *
 * @param root
 * @param options
 * @param eventHandlers
 * @example
 */
export declare function traverseTree(root: IntervalTreeNode | null, options?: Partial<TraversalOptions>, eventHandlers?: IntervalTreeEventHandler[]): IntervalTreeTraversalResult;
/**
 *
 * @param root
 * @example
 */
export declare function getAllIntervals(root: IntervalTreeNode | null): Interval[];
/**
 *
 * @param root
 * @param interval
 * @example
 */
export declare function findInterval(root: IntervalTreeNode | null, interval: Interval): IntervalTreeNode | null;
/**
 *
 * @param root
 * @param interval
 * @example
 */
export declare function containsInterval(root: IntervalTreeNode | null, interval: Interval): boolean;
//# sourceMappingURL=interval-tree-traversal.d.ts.map