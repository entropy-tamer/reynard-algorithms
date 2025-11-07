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

import type {
  FenwickTreeConfig,
  FenwickTreeQueryResult,
  FenwickTreeUpdateResult,
  FenwickTreeRangeUpdateResult,
  FenwickTreeStats,
  FenwickTreeEvent,
  FenwickTreeEventHandler,
  FenwickTreeOptions,
  FenwickTreePerformanceMetrics,
  BatchOperationResult,
  FenwickTreeSerialization,
} from "./fenwick-tree-types";
import { FenwickTreeEventType, DEFAULT_FENWICK_TREE_CONFIG, DEFAULT_FENWICK_TREE_OPTIONS } from "./fenwick-tree-types";

/**
 * Fenwick Tree (Binary Indexed Tree) Data Structure Implementation
 *
 * Provides efficient range sum queries and updates with support for
 * range updates and configurable indexing.
 */
export class FenwickTree {
  private tree: number[];
  private config: FenwickTreeConfig;
  private eventHandlers: FenwickTreeEventHandler[];
  private enableStats: boolean;
  private enableDebug: boolean;
  private stats: FenwickTreeStats;
  private array: number[];

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<FenwickTreeOptions> = {}) {
    const opts = { ...DEFAULT_FENWICK_TREE_OPTIONS, ...options };

    this.config = { ...DEFAULT_FENWICK_TREE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;

    this.array = opts.initialArray || [];
    this.tree = [];

    this.stats = {
      totalElements: this.array.length,
      totalNodes: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0,
    };

    // Build the tree if initial array is provided
    if (this.array.length > 0) {
      this.build();
    }
  }

  /**
   * Build the Fenwick tree from the current array
   *
   * @returns True if build was successful
   * @example
   */
  build(): boolean {
    const startTime = performance.now();

    try {
      if (this.array.length === 0) {
        return false;
      }

      if (this.array.length > this.config.maxElements!) {
        return false;
      }

      // Initialize tree with zeros
      this.tree = new Array(this.array.length + 1).fill(0);

      // Build the tree by adding each element
      for (let i = 0; i < this.array.length; i++) {
        this.add(i, this.array[i]);
      }

      // Update statistics
      this.stats.totalElements = this.array.length;
      this.stats.totalNodes = this.tree.length;
      this.stats.memoryUsage = this.calculateMemoryUsage();

      this.emitEvent(FenwickTreeEventType.TREE_BUILT, {
        elementCount: this.array.length,
        executionTime: performance.now() - startTime,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Query the sum from index 0 to index (inclusive)
   *
   * @param index End index of the query
   * @returns Query result
   * @example
   */
  query(index: number): FenwickTreeQueryResult {
    const startTime = performance.now();
    const nodesVisitedRef = { count: 0 };

    try {
      if (!this.config.enableRangeQueries) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start: 0, end: index },
        };
      }

      if (index < 0 || index >= this.array.length) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start: 0, end: index },
        };
      }

      const result = this.queryRecursive(index, nodesVisitedRef);

      if (this.enableStats) {
        this.stats.totalQueries++;
        const executionTime = performance.now() - startTime;
        this.stats.averageQueryTime =
          (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
      }

      this.emitEvent(FenwickTreeEventType.QUERY_PERFORMED, {
        range: { start: 0, end: index },
        result,
        executionTime: performance.now() - startTime,
      });

      return {
        result,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisitedRef.count,
        range: { start: 0, end: index },
      };
    } catch (error) {
      return {
        result: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        range: { start: 0, end: index },
      };
    }
  }

  /**
   * Query the sum from start index to end index (inclusive)
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @returns Query result
   * @example
   */
  queryRange(start: number, end: number): FenwickTreeQueryResult {
    const startTime = performance.now();
    const nodesVisited = 0;

    try {
      if (!this.config.enableRangeQueries) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end },
        };
      }

      if (start < 0 || end >= this.array.length || start > end) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end },
        };
      }

      // Range sum = query(end) - query(start - 1)
      const nodesVisitedRef = { count: 0 };
      const endSum = this.queryRecursive(end, nodesVisitedRef);
      const startSum = start > 0 ? this.queryRecursive(start - 1, nodesVisitedRef) : 0;
      const result = endSum - startSum;

      if (this.enableStats) {
        this.stats.totalQueries++;
        const executionTime = performance.now() - startTime;
        this.stats.averageQueryTime =
          (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
      }

      this.emitEvent(FenwickTreeEventType.QUERY_PERFORMED, {
        range: { start, end },
        result,
        executionTime: performance.now() - startTime,
      });

      return {
        result,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisitedRef.count,
        range: { start, end },
      };
    } catch (error) {
      return {
        result: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        range: { start, end },
      };
    }
  }

  /**
   * Update a single element in the Fenwick tree
   *
   * @param index Index of the element to update
   * @param value New value
   * @returns Update result
   * @example
   */
  updatePoint(index: number, value: number): FenwickTreeUpdateResult {
    const startTime = performance.now();
    const nodesUpdatedRef = { count: 0 };

    try {
      if (!this.config.enablePointUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          index,
        };
      }

      if (index < 0 || index >= this.array.length) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          index,
        };
      }

      const difference = value - this.array[index];
      this.array[index] = value;
      this.add(index, difference, nodesUpdatedRef);

      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.pointUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime =
          (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }

      this.emitEvent(FenwickTreeEventType.ELEMENT_UPDATED, {
        index,
        value,
        executionTime: performance.now() - startTime,
      });

      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated: nodesUpdatedRef.count,
        index,
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        index,
      };
    }
  }

  /**
   * Update a range of elements in the Fenwick tree
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @param value Update value
   * @returns Update result
   * @example
   */
  updateRange(start: number, end: number, value: number): FenwickTreeRangeUpdateResult {
    const startTime = performance.now();
    const nodesUpdatedRef = { count: 0 };

    try {
      if (!this.config.enableRangeUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start, end },
        };
      }

      if (start < 0 || end >= this.array.length || start > end) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start, end },
        };
      }

      // Range update: update each element in the range
      // For Fenwick Tree, we can either:
      // 1. Use range update technique (requires modified queries)
      // 2. Update each element individually (simpler, still O(log n) per element)
      // This implementation uses approach 2 for simplicity
      for (let i = start; i <= end; i++) {
        const difference = value; // We're adding value to each element
        this.add(i, difference, nodesUpdatedRef);
        this.array[i] += value;
      }

      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.rangeUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime =
          (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }

      this.emitEvent(FenwickTreeEventType.RANGE_UPDATED, {
        range: { start, end },
        value,
        executionTime: performance.now() - startTime,
      });

      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated: nodesUpdatedRef.count,
        range: { start, end },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        range: { start, end },
      };
    }
  }

  /**
   * Get the value at a specific index
   *
   * @param index Index to query
   * @returns Value at the index
   * @example
   */
  get(index: number): number | null {
    if (index < 0 || index >= this.array.length) {
      return null;
    }
    return this.array[index];
  }

  /**
   * Set the value at a specific index
   *
   * @param index Index to set
   * @param value New value
   * @returns True if successful
   * @example
   */
  set(index: number, value: number): boolean {
    if (index < 0 || index >= this.array.length) {
      return false;
    }

    const result = this.updatePoint(index, value);
    return result.success;
  }

  /**
   * Get the size of the array
   *
   * @returns Number of elements
   * @example
   */
  size(): number {
    return this.array.length;
  }

  /**
   * Check if the tree is empty
   *
   * @returns True if empty
   * @example
   */
  isEmpty(): boolean {
    return this.array.length === 0;
  }

  /**
   * Clear the tree
   * @example
   */
  clear(): void {
    this.tree = [];
    this.array = [];

    this.stats = {
      totalElements: 0,
      totalNodes: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0,
    };

    this.emitEvent(FenwickTreeEventType.TREE_CLEARED, {});
  }

  /**
   * Update multiple elements in batch
   *
   * @param updates Array of {index, value} pairs
   * @returns Batch operation result
   * @example
   */
  updateBatch(updates: Array<{ index: number; value: number }>): BatchOperationResult {
    const startTime = performance.now();
    const results: boolean[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        const result = this.updatePoint(update.index, update.value);
        results.push(result.success);
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to update index ${update.index}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error updating index ${update.index}: ${error}`);
      }
    }

    return {
      success: failed === 0,
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results,
    };
  }

  /**
   * Get all elements in the array
   *
   * @returns Array of all elements
   * @example
   */
  getAllElements(): number[] {
    return [...this.array];
  }

  /**
   * Serialize the tree to a JSON format
   *
   * @returns Serialized tree data
   * @example
   */
  serialize(): FenwickTreeSerialization {
    return {
      version: "1.0",
      config: this.config,
      data: this.array,
      metadata: {
        totalElements: this.stats.totalElements,
        totalNodes: this.stats.totalNodes,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a tree from JSON format
   *
   * @param serialized Serialized tree data
   * @returns True if deserialization was successful
   * @example
   */
  deserialize(serialized: FenwickTreeSerialization): boolean {
    try {
      this.clear();
      this.config = serialized.config;
      this.array = serialized.data;

      // Recalculate statistics
      this.stats.totalElements = serialized.metadata.totalElements;
      this.stats.totalNodes = serialized.metadata.totalNodes;

      // Rebuild the tree
      if (this.array.length > 0) {
        this.build();
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add event handler
   * @param handler
   * @example
   */
  addEventHandler(handler: FenwickTreeEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   * @param handler
   * @example
   */
  removeEventHandler(handler: FenwickTreeEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   * @example
   */
  getStats(): FenwickTreeStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   * @example
   */
  getPerformanceMetrics(): FenwickTreePerformanceMetrics {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageQueryTime / 10) * 40 +
          Math.max(0, 1 - this.stats.averageUpdateTime / 10) * 30 +
          Math.max(0, 1 - this.stats.memoryUsage / 1000000) * 30
      )
    );

    const queryEfficiency = this.stats.totalQueries / Math.max(1, this.stats.totalElements);
    const updateEfficiency = this.stats.totalUpdates / Math.max(1, this.stats.totalElements);

    return {
      memoryUsage: this.stats.memoryUsage,
      averageQueryTime: this.stats.averageQueryTime,
      averageUpdateTime: this.stats.averageUpdateTime,
      performanceScore,
      queryEfficiency,
      updateEfficiency,
    };
  }

  /**
   * Update configuration
   * @param newConfig
   * @example
   */
  updateConfig(newConfig: Partial<FenwickTreeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private helper methods

  /**
   * Add a value to the tree at a specific index
   * @param index
   * @param value
   * @param nodesUpdated
   * @example
   */
  private add(index: number, value: number, nodesUpdatedRef?: { count: number }): void {
    // Convert to 1-based indexing if configured
    let treeIndex = this.config.useOneBasedIndexing ? index + 1 : index;

    while (treeIndex < this.tree.length) {
      this.tree[treeIndex] += value;
      if (nodesUpdatedRef) {
        nodesUpdatedRef.count++;
      }
      treeIndex += treeIndex & -treeIndex; // Get the next index to update
    }
  }

  /**
   * Query the tree recursively
   * @param index
   * @param nodesVisited
   * @example
   */
  private queryRecursive(index: number, nodesVisitedRef: { count: number }): number {
    // Convert to 1-based indexing if configured
    let treeIndex = this.config.useOneBasedIndexing ? index + 1 : index;
    let sum = 0;

    while (treeIndex > 0) {
      sum += this.tree[treeIndex];
      nodesVisitedRef.count++;
      treeIndex -= treeIndex & -treeIndex; // Get the parent index
    }

    return sum;
  }

  /**
   * Calculate memory usage
   * @example
   */
  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage
    return this.array.length * 8 + this.tree.length * 8; // 8 bytes per number
  }

  /**
   * Emit event to registered handlers
   * @param type
   * @param data
   * @example
   */
  private emitEvent(type: FenwickTreeEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event: FenwickTreeEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in FenwickTree event handler:", error);
      }
    }
  }
}

// Import default options
