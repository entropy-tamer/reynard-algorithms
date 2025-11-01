/**
 * Interval Tree Core Implementation
 *
 * Main IntervalTree class that orchestrates tree operations
 * using modular components for insertion, deletion, search, balancing, and utilities.
 *
 * @module algorithms/data-structures/interval-tree
 */

import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalSearchResult,
  IntervalOverlapResult,
  IntervalTreeTraversalResult,
  IntervalTreeStats,
  IntervalTreeEvent,
  IntervalTreeEventHandler,
  IntervalTreeOptions,
  IntervalTreePerformanceMetrics,
  TraversalOptions,
  BatchOperationResult,
  IntervalTreeSerialization,
} from "./interval-tree-types";
import { TraversalOrder } from "./interval-tree-types";
import {
  IntervalTreeEventType,
  DEFAULT_INTERVAL_TREE_CONFIG,
  DEFAULT_INTERVAL_TREE_OPTIONS,
} from "./interval-tree-types";
import { insertInterval, insertBatch } from "./interval-tree-insertion";
import { deleteInterval, clearTree } from "./interval-tree-deletion";
import { searchOverlapping, searchContaining, searchContainedIn, checkOverlap } from "./interval-tree-search";
import { balanceNode } from "./interval-tree-balancing";
import { 
  getTreeSize, 
  isTreeEmpty, 
  getTreeHeight, 
  calculateTreeStats, 
  getPerformanceMetrics, 
  resetStats
} from "./interval-tree-stats";
import { serializeTree, deserializeTree } from "./interval-tree-serialization";
import {
  traverseTree,
  getAllIntervals,
  findInterval,
  containsInterval,
} from "./interval-tree-traversal";

/**
 * Interval Tree Data Structure Implementation
 *
 * Provides efficient storage and retrieval of intervals with support for
 * overlap detection, range queries, and AVL balancing.
 */
export class IntervalTree {
  private root: IntervalTreeNode | null;
  private config: IntervalTreeConfig;
  private eventHandlers: IntervalTreeEventHandler[];
  private enableStats: boolean;
  private enableDebug: boolean;
  private stats: IntervalTreeStats;

  constructor(options: Partial<IntervalTreeOptions> = {}) {
    const opts = { ...DEFAULT_INTERVAL_TREE_OPTIONS, ...options };

    this.config = { ...DEFAULT_INTERVAL_TREE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;

    this.root = null;

    this.stats = {
      totalIntervals: 0,
      totalNodes: 0,
      height: 0,
      averageIntervalLength: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      averageInsertTime: 0,
      averageDeleteTime: 0,
      memoryUsage: 0,
    };

    // Insert initial intervals if provided
    if (opts.initialIntervals && opts.initialIntervals.length > 0) {
      this.insertBatch(opts.initialIntervals);
    }
  }

  /**
   * Insert an interval into the tree.
   */
  insert(interval: Interval): boolean {
    const result = insertInterval(
      this.root,
      interval,
      this.config,
      this.stats,
      this.eventHandlers
    );

    this.root = result.root;
    return result.success;
  }

  /**
   * Delete an interval from the tree.
   */
  delete(interval: Interval): boolean {
    const result = deleteInterval(
      this.root,
      interval,
      this.config,
      this.stats,
      this.eventHandlers
    );

    this.root = result.root;
    return result.success;
  }

  /**
   * Search for intervals that overlap with a query interval.
   */
  searchOverlapping(queryInterval: Interval): IntervalSearchResult {
    return searchOverlapping(
      this.root,
      queryInterval,
      this.config,
      this.stats,
      this.eventHandlers
    );
  }

  /**
   * Search for intervals that contain a point.
   */
  searchContaining(point: number): IntervalSearchResult {
    return searchContaining(
      this.root,
      point,
      this.config,
      this.stats,
      this.eventHandlers
    );
  }

  /**
   * Search for intervals that are contained within a query interval.
   */
  searchContainedIn(queryInterval: Interval): IntervalSearchResult {
    return searchContainedIn(
      this.root,
      queryInterval,
      this.config,
      this.stats,
      this.eventHandlers
    );
  }

  /**
   * Check if an interval overlaps with any interval in the tree.
   */
  checkOverlap(interval: Interval): IntervalOverlapResult {
    return checkOverlap(
      this.root,
      interval,
      this.config,
      this.stats,
      this.eventHandlers
    );
  }

  /**
   * Check if tree contains an interval.
   */
  contains(interval: Interval): boolean {
    return containsInterval(this.root, interval);
  }

  /**
   * Get the number of intervals in the tree.
   */
  size(): number {
    return getTreeSize(this.root);
  }

  /**
   * Check if the tree is empty.
   */
  isEmpty(): boolean {
    return isTreeEmpty(this.root);
  }

  /**
   * Clear all intervals from the tree.
   */
  clear(): void {
    const result = clearTree(this.root, this.stats, this.eventHandlers);
    if (result.success) {
      this.root = result.root;
    }
  }

  /**
   * Insert multiple intervals in batch.
   */
  insertBatch(intervals: Interval[]): BatchOperationResult {
    const result = insertBatch(
      this.root,
      intervals,
      this.config,
      this.stats,
      this.eventHandlers
    );

    this.root = result.root;
    return result.result;
  }

  /**
   * Traverse the tree in specified order.
   */
  traverse(options: Partial<TraversalOptions> = {}): IntervalTreeTraversalResult {
    return traverseTree(this.root, options, this.eventHandlers);
  }

  /**
   * Get all intervals in the tree.
   */
  getAllIntervals(): Interval[] {
    return getAllIntervals(this.root);
  }

  /**
   * Serialize the tree to JSON.
   */
  serialize(): IntervalTreeSerialization {
    return serializeTree(this.root, this.stats);
  }

  /**
   * Deserialize tree from JSON.
   */
  deserialize(serialized: IntervalTreeSerialization): boolean {
    try {
      this.root = deserializeTree(serialized);
      this.stats = { ...serialized.stats };
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add event handler.
   */
  addEventHandler(handler: IntervalTreeEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler.
   */
  removeEventHandler(handler: IntervalTreeEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics.
   */
  getStats(): IntervalTreeStats {
    calculateTreeStats(this.root, this.stats);
    return { ...this.stats };
  }

  /**
   * Get performance metrics.
   */
  getPerformanceMetrics(): IntervalTreePerformanceMetrics {
    return getPerformanceMetrics(this.stats);
  }

  /**
   * Reset all statistics.
   */
  resetStats(): void {
    resetStats(this.stats);
  }

  /**
   * Enable or disable statistics collection.
   */
  setStatsEnabled(enabled: boolean): void {
    this.enableStats = enabled;
  }

  /**
   * Enable or disable debug mode.
   */
  setDebugMode(enabled: boolean): void {
    this.enableDebug = enabled;
  }

  /**
   * Get tree height.
   */
  getHeight(): number {
    return getTreeHeight(this.root);
  }

  /**
   * Find a specific interval in the tree.
   */
  findInterval(interval: Interval): IntervalTreeNode | null {
    return findInterval(this.root, interval);
  }
}