/**
 * Interval Tree Data Structure Core Implementation
 *
 * Implementation of the Interval Tree data structure with comprehensive
 * features including interval search, overlap detection, and AVL balancing.
 *
 * Mathematical Theory:
 * An Interval Tree is a balanced binary search tree where each node stores
 * an interval. The tree is organized by the start points of intervals,
 * and each node maintains the maximum end point in its subtree. This allows
 * for efficient:
 * - Insertion: O(log n) where n is number of intervals
 * - Deletion: O(log n) where n is number of intervals
 * - Search: O(log n + k) where k is number of overlapping intervals
 * - Overlap detection: O(log n) where n is number of intervals
 *
 * Space Complexity: O(n) where n is the number of intervals.
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
      memoryUsage: 0,
    };

    // Insert initial intervals if provided
    if (opts.initialIntervals && opts.initialIntervals.length > 0) {
      this.insertBatch(opts.initialIntervals);
    }
  }

  /**
   * Insert an interval into the tree
   *
   * @param interval The interval to insert
   * @returns True if insertion was successful
   */
  insert(interval: Interval): boolean {
    const startTime = performance.now();

    try {
      if (!this.isValidInterval(interval)) {
        return false;
      }

      if (this.stats.totalIntervals >= this.config.maxIntervals!) {
        return false;
      }

      if (!this.config.allowDuplicates && this.contains(interval)) {
        return false;
      }

      this.root = this.insertRecursive(this.root, interval);

      // Update statistics
      this.stats.totalIntervals++;
      this.stats.totalNodes = this.countNodes();
      this.stats.height = this.getHeight();
      this.stats.averageIntervalLength = this.calculateAverageIntervalLength();
      this.stats.totalInserts++;

      this.emitEvent(IntervalTreeEventType.INTERVAL_INSERTED, { interval });

      return true;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalInserts - 1) + executionTime) / this.stats.totalInserts;
      }
    }
  }

  /**
   * Delete an interval from the tree
   *
   * @param interval The interval to delete
   * @returns True if deletion was successful
   */
  delete(interval: Interval): boolean {
    const startTime = performance.now();

    try {
      if (!this.isValidInterval(interval)) {
        return false;
      }

      const initialSize = this.stats.totalIntervals;
      this.root = this.deleteRecursive(this.root, interval);

      if (this.stats.totalIntervals < initialSize) {
        // Update statistics
        this.stats.totalNodes = this.countNodes();
        this.stats.height = this.getHeight();
        this.stats.averageIntervalLength = this.calculateAverageIntervalLength();
        this.stats.totalDeletes++;

        this.emitEvent(IntervalTreeEventType.INTERVAL_DELETED, { interval });
        return true;
      }

      return false;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalDeletes - 1) + executionTime) / this.stats.totalDeletes;
      }
    }
  }

  /**
   * Search for intervals that overlap with a given interval
   *
   * @param queryInterval The interval to search for overlaps
   * @returns Search result
   */
  searchOverlapping(queryInterval: Interval): IntervalSearchResult {
    const startTime = performance.now();
    const nodesVisited = { count: 0 };

    try {
      if (!this.isValidInterval(queryInterval)) {
        return {
          intervals: [],
          count: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
        };
      }

      const overlappingIntervals: Interval[] = [];
      this.searchOverlappingRecursive(this.root, queryInterval, overlappingIntervals, nodesVisited);

      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }

      this.emitEvent(IntervalTreeEventType.INTERVAL_SEARCHED, {
        queryInterval,
        resultCount: overlappingIntervals.length,
      });

      return {
        intervals: overlappingIntervals,
        count: overlappingIntervals.length,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count,
      };
    } catch (error) {
      return {
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count,
      };
    }
  }

  /**
   * Search for intervals that contain a given point
   *
   * @param point The point to search for
   * @returns Search result
   */
  searchContaining(point: number): IntervalSearchResult {
    const startTime = performance.now();
    const nodesVisited = { count: 0 };

    try {
      const containingIntervals: Interval[] = [];
      this.searchContainingRecursive(this.root, point, containingIntervals, nodesVisited);

      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }

      return {
        intervals: containingIntervals,
        count: containingIntervals.length,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count,
      };
    } catch (error) {
      return {
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count,
      };
    }
  }

  /**
   * Search for intervals that are contained within a given interval
   *
   * @param queryInterval The interval to search within
   * @returns Search result
   */
  searchContainedIn(queryInterval: Interval): IntervalSearchResult {
    const startTime = performance.now();
    const nodesVisited = { count: 0 };

    try {
      if (!this.isValidInterval(queryInterval)) {
        return {
          intervals: [],
          count: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
        };
      }

      const containedIntervals: Interval[] = [];
      this.searchContainedInRecursive(this.root, queryInterval, containedIntervals, nodesVisited);

      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }

      return {
        intervals: containedIntervals,
        count: containedIntervals.length,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count,
      };
    } catch (error) {
      return {
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count,
      };
    }
  }

  /**
   * Check if an interval overlaps with any interval in the tree
   *
   * @param interval The interval to check
   * @returns Overlap result
   */
  checkOverlap(interval: Interval): IntervalOverlapResult {
    const startTime = performance.now();

    try {
      if (!this.isValidInterval(interval)) {
        return {
          overlaps: false,
          executionTime: performance.now() - startTime,
        };
      }

      const overlappingInterval = this.findFirstOverlap(this.root, interval);

      return {
        overlaps: overlappingInterval !== null,
        overlappingInterval: overlappingInterval || undefined,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        overlaps: false,
        executionTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Check if the tree contains a specific interval
   *
   * @param interval The interval to check
   * @returns True if the interval exists in the tree
   */
  contains(interval: Interval): boolean {
    return this.findInterval(this.root, interval) !== null;
  }

  /**
   * Get the size of the tree (number of intervals)
   *
   * @returns Number of intervals in the tree
   */
  size(): number {
    return this.stats.totalIntervals;
  }

  /**
   * Check if the tree is empty
   *
   * @returns True if the tree is empty
   */
  isEmpty(): boolean {
    return this.stats.totalIntervals === 0;
  }

  /**
   * Clear all intervals from the tree
   */
  clear(): void {
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
      memoryUsage: 0,
    };

    this.emitEvent(IntervalTreeEventType.TREE_CLEARED, {});
  }

  /**
   * Insert multiple intervals in batch
   *
   * @param intervals Array of intervals to insert
   * @returns Batch operation result
   */
  insertBatch(intervals: Interval[]): BatchOperationResult {
    const startTime = performance.now();
    const results: boolean[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    for (const interval of intervals) {
      try {
        const result = this.insert(interval);
        results.push(result);
        if (result) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to insert interval: [${interval.start}, ${interval.end}]`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error inserting interval [${interval.start}, ${interval.end}]: ${error}`);
      }
    }

    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results,
    };
  }

  /**
   * Traverse the tree with custom options
   *
   * @param options Traversal options
   * @returns Traversal result
   */
  traverse(options: Partial<TraversalOptions> = {}): IntervalTreeTraversalResult {
    const startTime = performance.now();
    const opts: TraversalOptions = {
      order: TraversalOrder.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false,
      ...options,
    };

    const intervals: Interval[] = [];
    const nodesVisited = { count: 0 };

    this.traverseRecursive(this.root, intervals, nodesVisited, opts);

    return {
      intervals,
      count: intervals.length,
      executionTime: performance.now() - startTime,
      nodesVisited: nodesVisited.count,
    };
  }

  /**
   * Get all intervals in the tree
   *
   * @returns Array of all intervals
   */
  getAllIntervals(): Interval[] {
    const intervals: Interval[] = [];
    const nodesVisited = { count: 0 };

    this.traverseRecursive(this.root, intervals, nodesVisited, {
      order: TraversalOrder.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false,
    });

    return intervals;
  }

  /**
   * Serialize the tree to a JSON format
   *
   * @returns Serialized tree data
   */
  serialize(): IntervalTreeSerialization {
    const data = this.serializeNode(this.root);

    return {
      version: "1.0",
      config: this.config,
      data,
      metadata: {
        totalIntervals: this.stats.totalIntervals,
        totalNodes: this.stats.totalNodes,
        height: this.stats.height,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a tree from JSON format
   *
   * @param serialized Serialized tree data
   * @returns True if deserialization was successful
   */
  deserialize(serialized: IntervalTreeSerialization): boolean {
    try {
      this.clear();
      this.config = serialized.config;
      this.root = this.deserializeNode(serialized.data);

      // Recalculate statistics
      this.stats.totalIntervals = serialized.metadata.totalIntervals;
      this.stats.totalNodes = serialized.metadata.totalNodes;
      this.stats.height = serialized.metadata.height;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add event handler
   */
  addEventHandler(handler: IntervalTreeEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: IntervalTreeEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   */
  getStats(): IntervalTreeStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): IntervalTreePerformanceMetrics {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageSearchTime / 10) * 40 +
          Math.max(0, 1 - this.stats.totalNodes / 10000) * 30 +
          Math.max(0, 1 - this.stats.memoryUsage / 1000000) * 30
      )
    );

    const balanceFactor = this.calculateBalanceFactor();

    return {
      memoryUsage: this.stats.memoryUsage,
      averageSearchTime: this.stats.averageSearchTime,
      averageInsertTime: this.stats.averageSearchTime, // Using same value for now
      averageDeleteTime: this.stats.averageSearchTime, // Using same value for now
      performanceScore,
      balanceFactor,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IntervalTreeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private helper methods

  /**
   * Validate an interval
   */
  private isValidInterval(interval: Interval): boolean {
    return interval.start <= interval.end;
  }

  /**
   * Create a new interval tree node
   */
  private createNode(interval: Interval): IntervalTreeNode {
    return {
      interval,
      max: interval.end,
      left: null,
      right: null,
      height: 1,
      size: 1,
    };
  }

  /**
   * Get the height of a node
   */
  private getNodeHeight(node: IntervalTreeNode | null): number {
    return node ? node.height : 0;
  }

  /**
   * Get the balance factor of a node
   */
  private getBalanceFactor(node: IntervalTreeNode | null): number {
    if (!node) return 0;
    return this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
  }

  /**
   * Update the height and max values of a node
   */
  private updateNode(node: IntervalTreeNode): void {
    node.height = 1 + Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right));
    node.max = Math.max(
      node.interval.end,
      node.left ? node.left.max : -Infinity,
      node.right ? node.right.max : -Infinity
    );
    node.size = 1 + (node.left ? node.left.size : 0) + (node.right ? node.right.size : 0);
  }

  /**
   * Right rotate a node
   */
  private rightRotate(y: IntervalTreeNode): IntervalTreeNode {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateNode(y);
    this.updateNode(x);

    return x;
  }

  /**
   * Left rotate a node
   */
  private leftRotate(x: IntervalTreeNode): IntervalTreeNode {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateNode(x);
    this.updateNode(y);

    return y;
  }

  /**
   * Insert an interval recursively
   */
  private insertRecursive(node: IntervalTreeNode | null, interval: Interval): IntervalTreeNode {
    if (!node) {
      return this.createNode(interval);
    }

    if (interval.start < node.interval.start) {
      node.left = this.insertRecursive(node.left, interval);
    } else if (interval.start > node.interval.start) {
      node.right = this.insertRecursive(node.right, interval);
    } else {
      // Equal start points - check if duplicates are allowed
      if (this.config.allowDuplicates) {
        node.right = this.insertRecursive(node.right, interval);
      } else {
        return node; // Duplicate not allowed
      }
    }

    this.updateNode(node);

    if (this.config.useAVLBalancing) {
      return this.balanceNode(node);
    }

    return node;
  }

  /**
   * Delete an interval recursively
   */
  private deleteRecursive(node: IntervalTreeNode | null, interval: Interval): IntervalTreeNode | null {
    if (!node) {
      return null;
    }

    if (interval.start < node.interval.start) {
      node.left = this.deleteRecursive(node.left, interval);
    } else if (interval.start > node.interval.start) {
      node.right = this.deleteRecursive(node.right, interval);
    } else {
      // Found the node to delete
      if (node.interval.end === interval.end) {
        // Exact match found
        if (!node.left || !node.right) {
          const temp = node.left || node.right;
          if (!temp) {
            this.stats.totalIntervals--;
            return null;
          }
          this.stats.totalIntervals--;
          return temp;
        }

        // Node has two children
        const successor = this.getMinValueNode(node.right);
        node.interval = successor.interval;
        node.right = this.deleteRecursive(node.right, successor.interval);
      } else {
        // Same start, different end - continue searching
        node.right = this.deleteRecursive(node.right, interval);
      }
    }

    this.updateNode(node);

    if (this.config.useAVLBalancing) {
      return this.balanceNode(node);
    }

    return node;
  }

  /**
   * Get the node with minimum value
   */
  private getMinValueNode(node: IntervalTreeNode): IntervalTreeNode {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  /**
   * Balance a node using AVL rotations
   */
  private balanceNode(node: IntervalTreeNode): IntervalTreeNode {
    const balance = this.getBalanceFactor(node);

    // Left Left Case
    if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
      return this.rightRotate(node);
    }

    // Right Right Case
    if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
      return this.leftRotate(node);
    }

    // Left Right Case
    if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
      node.left = this.leftRotate(node.left!);
      return this.rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
      node.right = this.rightRotate(node.right!);
      return this.leftRotate(node);
    }

    return node;
  }

  /**
   * Search for overlapping intervals recursively
   */
  private searchOverlappingRecursive(
    node: IntervalTreeNode | null,
    queryInterval: Interval,
    results: Interval[],
    nodesVisited: { count: number }
  ): void {
    if (!node) return;

    nodesVisited.count++;

    // Check if current interval overlaps with query
    if (this.intervalsOverlap(node.interval, queryInterval)) {
      results.push(node.interval);
    }

    // If left child exists and its max is >= query start, search left
    if (node.left && node.left.max >= queryInterval.start) {
      this.searchOverlappingRecursive(node.left, queryInterval, results, nodesVisited);
    }

    // If right child exists and node start <= query end, search right
    if (node.right && node.interval.start <= queryInterval.end) {
      this.searchOverlappingRecursive(node.right, queryInterval, results, nodesVisited);
    }
  }

  /**
   * Search for intervals containing a point recursively
   */
  private searchContainingRecursive(
    node: IntervalTreeNode | null,
    point: number,
    results: Interval[],
    nodesVisited: { count: number }
  ): void {
    if (!node) return;

    nodesVisited.count++;

    // Check if current interval contains the point
    if (node.interval.start <= point && point <= node.interval.end) {
      results.push(node.interval);
    }

    // If left child exists and its max >= point, search left
    if (node.left && node.left.max >= point) {
      this.searchContainingRecursive(node.left, point, results, nodesVisited);
    }

    // If right child exists and node start <= point, search right
    if (node.right && node.interval.start <= point) {
      this.searchContainingRecursive(node.right, point, results, nodesVisited);
    }
  }

  /**
   * Search for intervals contained within a query interval recursively
   */
  private searchContainedInRecursive(
    node: IntervalTreeNode | null,
    queryInterval: Interval,
    results: Interval[],
    nodesVisited: { count: number }
  ): void {
    if (!node) return;

    nodesVisited.count++;

    // Check if current interval is contained within query
    if (queryInterval.start <= node.interval.start && node.interval.end <= queryInterval.end) {
      results.push(node.interval);
    }

    // If left child exists and its max >= query start, search left
    if (node.left && node.left.max >= queryInterval.start) {
      this.searchContainedInRecursive(node.left, queryInterval, results, nodesVisited);
    }

    // If right child exists and node start <= query end, search right
    if (node.right && node.interval.start <= queryInterval.end) {
      this.searchContainedInRecursive(node.right, queryInterval, results, nodesVisited);
    }
  }

  /**
   * Find the first overlapping interval
   */
  private findFirstOverlap(node: IntervalTreeNode | null, queryInterval: Interval): Interval | null {
    if (!node) return null;

    // Check if current interval overlaps with query
    if (this.intervalsOverlap(node.interval, queryInterval)) {
      return node.interval;
    }

    // If left child exists and its max is >= query start, search left
    if (node.left && node.left.max >= queryInterval.start) {
      const leftResult = this.findFirstOverlap(node.left, queryInterval);
      if (leftResult) return leftResult;
    }

    // If right child exists and node start <= query end, search right
    if (node.right && node.interval.start <= queryInterval.end) {
      return this.findFirstOverlap(node.right, queryInterval);
    }

    return null;
  }

  /**
   * Find a specific interval in the tree
   */
  private findInterval(node: IntervalTreeNode | null, interval: Interval): IntervalTreeNode | null {
    if (!node) return null;

    if (interval.start < node.interval.start) {
      return this.findInterval(node.left, interval);
    } else if (interval.start > node.interval.start) {
      return this.findInterval(node.right, interval);
    } else {
      // Same start point - check end point
      if (interval.end === node.interval.end) {
        return node;
      } else {
        return this.findInterval(node.right, interval);
      }
    }
  }

  /**
   * Check if two intervals overlap
   */
  private intervalsOverlap(interval1: Interval, interval2: Interval): boolean {
    return interval1.start <= interval2.end && interval2.start <= interval1.end;
  }

  /**
   * Traverse the tree recursively
   */
  private traverseRecursive(
    node: IntervalTreeNode | null,
    intervals: Interval[],
    nodesVisited: { count: number },
    options: TraversalOptions
  ): void {
    if (!node) return;

    nodesVisited.count++;

    if (options.order === TraversalOrder.PRE_ORDER) {
      intervals.push(node.interval);
    }

    if (node.left) {
      this.traverseRecursive(node.left, intervals, nodesVisited, options);
    }

    if (options.order === TraversalOrder.IN_ORDER) {
      intervals.push(node.interval);
    }

    if (node.right) {
      this.traverseRecursive(node.right, intervals, nodesVisited, options);
    }

    if (options.order === TraversalOrder.POST_ORDER) {
      intervals.push(node.interval);
    }
  }

  /**
   * Count total nodes in the tree
   */
  private countNodes(): number {
    const count = { count: 0 };
    this.traverseRecursive(this.root, [], count, {
      order: TraversalOrder.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false,
    });
    return count.count;
  }

  /**
   * Get the height of the tree
   */
  private getHeight(): number {
    return this.getNodeHeight(this.root);
  }

  /**
   * Calculate average interval length
   */
  private calculateAverageIntervalLength(): number {
    const intervals = this.getAllIntervals();
    if (intervals.length === 0) return 0;

    const totalLength = intervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
    return totalLength / intervals.length;
  }

  /**
   * Calculate balance factor of the tree
   */
  private calculateBalanceFactor(): number {
    return this.getBalanceFactor(this.root);
  }

  /**
   * Serialize a node to JSON
   */
  private serializeNode(node: IntervalTreeNode | null): any {
    if (!node) return null;

    return {
      interval: node.interval,
      max: node.max,
      height: node.height,
      size: node.size,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right),
    };
  }

  /**
   * Deserialize a node from JSON
   */
  private deserializeNode(data: any): IntervalTreeNode | null {
    if (!data) return null;

    const node: IntervalTreeNode = {
      interval: data.interval,
      max: data.max,
      height: data.height,
      size: data.size,
      left: this.deserializeNode(data.left),
      right: this.deserializeNode(data.right),
    };

    return node;
  }

  /**
   * Emit event to registered handlers
   */
  private emitEvent(type: IntervalTreeEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event: IntervalTreeEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in IntervalTree event handler:", error);
      }
    }
  }
}

// Import default options
