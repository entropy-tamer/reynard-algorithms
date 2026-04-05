/**
 * Interval Tree Search Operations
 *
 * Handles interval search, overlap detection, and containment queries
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */
import type { Interval, IntervalTreeNode, IntervalTreeConfig, IntervalTreeStats, IntervalSearchResult, IntervalOverlapResult, IntervalTreeEventHandler } from "./interval-tree-types";
/**
 * Search for intervals that overlap with a query interval
 *
 * @param root Root node
 * @param queryInterval Query interval
 * @param config Interval tree configuration
 * @param _config
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 * @example
 */
export declare function searchOverlapping(root: IntervalTreeNode | null, queryInterval: Interval, _config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): IntervalSearchResult;
/**
 * Search for intervals that contain a point
 *
 * @param root Root node
 * @param point Query point
 * @param config Interval tree configuration
 * @param _config
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 * @example
 */
export declare function searchContaining(root: IntervalTreeNode | null, point: number, _config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): IntervalSearchResult;
/**
 * Search for intervals that are contained within a query interval
 *
 * @param root Root node
 * @param queryInterval Query interval
 * @param config Interval tree configuration
 * @param _config
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Search result
 * @example
 */
export declare function searchContainedIn(root: IntervalTreeNode | null, queryInterval: Interval, _config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): IntervalSearchResult;
/**
 * Check if an interval overlaps with any interval in the tree
 *
 * @param root Root node
 * @param interval Interval to check
 * @param config Interval tree configuration
 * @param _config
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Overlap result
 * @example
 */
export declare function checkOverlap(root: IntervalTreeNode | null, interval: Interval, _config: IntervalTreeConfig, stats: IntervalTreeStats, eventHandlers: IntervalTreeEventHandler[]): IntervalOverlapResult;
//# sourceMappingURL=interval-tree-search.d.ts.map