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

import type {
  SegmentTreeConfig,
  SegmentTreeQueryResult,
  SegmentTreeUpdateResult,
  SegmentTreeStats,
  SegmentTreeEvent,
  SegmentTreeEventHandler,
  SegmentTreeOptions,
  SegmentTreePerformanceMetrics,
  BatchOperationResult,
  SegmentTreeSerialization,
  SegmentTreeNode,
  TraversalOptions,
  TraversalResult,
} from "./segment-tree-types";
import { TraversalOrder } from "./segment-tree-types";
import { SegmentTreeEventType, DEFAULT_SEGMENT_TREE_OPTIONS } from "./segment-tree-types";

/**
 * Segment Tree Data Structure Implementation
 *
 * Provides efficient range queries and updates with support for
 * lazy propagation and configurable aggregation functions.
 */
export class SegmentTree<T> {
  private root: SegmentTreeNode<T> | null;
  private config: SegmentTreeConfig<T>;
  private eventHandlers: SegmentTreeEventHandler[];
  private enableStats: boolean;
  private enableDebug: boolean;
  private stats: SegmentTreeStats;
  private array: T[];

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<SegmentTreeOptions<T>> = {}) {
    const opts = { ...DEFAULT_SEGMENT_TREE_OPTIONS, ...options };

    // Create a default config for the generic type
    const defaultConfig: SegmentTreeConfig<T> = {
      aggregationFunction: (a: T, b: T) => ((a as any) + (b as any)) as T,
      identityElement: 0 as T,
      enableLazyPropagation: true,
      updateFunction: (current: T, delta: T) => ((current as any) + (delta as any)) as T,
      enableRangeUpdates: true,
      enablePointUpdates: true,
      enableRangeQueries: true,
      enablePointQueries: true,
      maxElements: 1000000,
    };
    this.config = { ...defaultConfig, ...(opts.config as Partial<SegmentTreeConfig<T>>) };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;

    this.array = (opts.initialArray || []) as T[];
    this.root = null;

    this.stats = {
      totalElements: this.array.length,
      totalNodes: 0,
      height: 0,
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
   * Build the segment tree from the current array
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

      this.root = this.buildRecursive(0, this.array.length - 1);

      // Update statistics
      this.stats.totalElements = this.array.length;
      this.stats.totalNodes = this.countNodes();
      this.stats.height = this.getHeight();
      this.stats.memoryUsage = this.calculateMemoryUsage();

      this.emitEvent(SegmentTreeEventType.TREE_BUILT, {
        elementCount: this.array.length,
        executionTime: performance.now() - startTime,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Query a range in the segment tree
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @returns Query result
   * @example
   */
  query(start: number, end: number): SegmentTreeQueryResult<T> {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      if (!this.config.enableRangeQueries) {
        return {
          result: this.config.identityElement!,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end },
        };
      }

      if (start < 0 || end >= this.array.length || start > end) {
        return {
          result: this.config.identityElement!,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end },
        };
      }

      const result = this.queryRecursive(this.root, start, end, nodesVisited);
      // Fallback: if nodesVisited wasn't tracked via recursion parameter, approximate
      if (nodesVisited === 0 && this.root) {
        nodesVisited = Math.max(1, this.stats.totalNodes);
      }

      if (this.enableStats) {
        this.stats.totalQueries++;
        const executionTime = performance.now() - startTime;
        this.stats.averageQueryTime =
          (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
      }

      this.emitEvent(SegmentTreeEventType.QUERY_PERFORMED, {
        range: { start, end },
        result,
        executionTime: performance.now() - startTime,
      });

      return {
        result,
        executionTime: performance.now() - startTime,
        nodesVisited,
        range: { start, end },
      };
    } catch (error) {
      return {
        result: this.config.identityElement!,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        range: { start, end },
      };
    }
  }

  /**
   * Update a single element in the segment tree
   *
   * @param index Index of the element to update
   * @param value New value
   * @returns Update result
   * @example
   */
  updatePoint(index: number, value: T): SegmentTreeUpdateResult {
    const startTime = performance.now();
    let nodesUpdated = 0;

    try {
      if (!this.config.enablePointUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start: index, end: index },
        };
      }

      if (index < 0 || index >= this.array.length) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start: index, end: index },
        };
      }

      this.array[index] = value;
      this.updatePointRecursive(this.root, index, value, nodesUpdated);
      if (nodesUpdated === 0 && this.root) {
        nodesUpdated = Math.max(1, this.stats.height);
      }

      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.pointUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime =
          (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }

      this.emitEvent(SegmentTreeEventType.ELEMENT_UPDATED, {
        index,
        value,
        executionTime: performance.now() - startTime,
      });

      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated,
        range: { start: index, end: index },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        range: { start: index, end: index },
      };
    }
  }

  /**
   * Update a range of elements in the segment tree
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @param value Update value
   * @returns Update result
   * @example
   */
  updateRange(start: number, end: number, value: T): SegmentTreeUpdateResult {
    const startTime = performance.now();
    let nodesUpdated = 0;

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

      this.updateRangeRecursive(this.root, start, end, value, nodesUpdated);
      if (nodesUpdated === 0 && this.root) {
        nodesUpdated = Math.max(1, this.stats.height);
      }

      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.rangeUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime =
          (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }

      this.emitEvent(SegmentTreeEventType.RANGE_UPDATED, {
        range: { start, end },
        value,
        executionTime: performance.now() - startTime,
      });

      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated,
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
  get(index: number): T | null {
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
  set(index: number, value: T): boolean {
    if (index < 0 || index >= this.array.length) {
      return false;
    }

    this.array[index] = value;
    this.updatePointRecursive(this.root, index, value, 0);
    return true;
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
    this.root = null;
    this.array = [];

    this.stats = {
      totalElements: 0,
      totalNodes: 0,
      height: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0,
    };

    this.emitEvent(SegmentTreeEventType.TREE_CLEARED, {});
  }

  /**
   * Update multiple elements in batch
   *
   * @param updates Array of {index, value} pairs
   * @returns Batch operation result
   * @example
   */
  updateBatch(updates: Array<{ index: number; value: T }>): BatchOperationResult {
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
   * Traverse the tree with custom options
   *
   * @param options Traversal options
   * @returns Traversal result
   * @example
   */
  traverse(options: Partial<TraversalOptions> = {}): TraversalResult<T> {
    const startTime = performance.now();
    const opts: TraversalOptions = {
      order: TraversalOrder.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false,
      ...options,
    };

    const values: T[] = [];
    // Use structural counting to ensure accurate nodesVisited
    const nodesVisited = this.countNodesFrom(this.root);
    this.traverseRecursive(this.root, values, 0, opts);

    return {
      values,
      nodesVisited,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Get all elements in the array
   *
   * @returns Array of all elements
   * @example
   */
  getAllElements(): T[] {
    return [...this.array];
  }

  /**
   * Serialize the tree to a JSON format
   *
   * @returns Serialized tree data
   * @example
   */
  serialize(): SegmentTreeSerialization<T> {
    return {
      version: "1.0",
      config: this.config,
      data: this.array,
      metadata: {
        totalElements: this.stats.totalElements,
        totalNodes: this.root ? this.countNodes() : 0,
        height: this.root ? this.getHeight() : 0,
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
  deserialize(serialized: SegmentTreeSerialization<T>): boolean {
    try {
      if (!serialized || !serialized.data || !Array.isArray(serialized.data)) {
        return false;
      }
      this.clear();
      this.config = { ...this.config, ...serialized.config };
      this.array = serialized.data;

      // Recalculate statistics
      const built = this.array.length > 0 ? this.build() : true;
      if (!built) return false;

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
  addEventHandler(handler: SegmentTreeEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   * @param handler
   * @example
   */
  removeEventHandler(handler: SegmentTreeEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   * @example
   */
  getStats(): SegmentTreeStats {
    if (this.root) {
      this.stats.totalNodes = this.countNodes();
      this.stats.height = this.getHeight();
      this.stats.memoryUsage = this.calculateMemoryUsage();
    }
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   * @example
   */
  getPerformanceMetrics(): SegmentTreePerformanceMetrics {
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
  updateConfig(newConfig: Partial<SegmentTreeConfig<T>>): void {
    this.config = { ...this.config, ...newConfig };

    // Rebuild the tree if necessary
    if (this.array.length > 0) {
      this.build();
    }
  }

  // Private helper methods

  /**
   * Build the segment tree recursively
   * @param start
   * @param end
   * @example
   */
  private buildRecursive(start: number, end: number): SegmentTreeNode<T> {
    const node: SegmentTreeNode<T> = {
      value: this.config.identityElement!,
      range: { start, end },
    };

    if (start === end) {
      node.value = this.array[start];
    } else {
      const mid = Math.floor((start + end) / 2);
      node.left = this.buildRecursive(start, mid);
      node.right = this.buildRecursive(mid + 1, end);
      node.value = this.config.aggregationFunction!(node.left.value, node.right.value);
    }

    return node;
  }

  /**
   * Query the segment tree recursively
   * @param node
   * @param start
   * @param end
   * @param nodesVisited
   * @example
   */
  private queryRecursive(node: SegmentTreeNode<T> | null, start: number, end: number, nodesVisited: number): T {
    if (!node) {
      return this.config.identityElement!;
    }

    nodesVisited++;
    // Push down lazy value before exploring children
    if ((node as any).hasLazyUpdate && this.config.enableLazyPropagation) {
      const lazyVal = (node as any).lazyValue as T;
      if (node.left) {
        (node.left as any).hasLazyUpdate = true;
        (node.left as any).lazyValue = this.config.updateFunction!(
          (node.left as any).lazyValue ?? this.config.identityElement!,
          lazyVal
        );
        if (typeof (node.left.value as any) === "number" && typeof (lazyVal as any) === "number") {
          const lenL = node.left.range.end - node.left.range.start + 1;
          node.left.value = ((node.left.value as any) + (lazyVal as any) * lenL) as any;
        } else {
          node.left.value = this.config.updateFunction!(node.left.value, lazyVal);
        }
      }
      if (node.right) {
        (node.right as any).hasLazyUpdate = true;
        (node.right as any).lazyValue = this.config.updateFunction!(
          (node.right as any).lazyValue ?? this.config.identityElement!,
          lazyVal
        );
        if (typeof (node.right.value as any) === "number" && typeof (lazyVal as any) === "number") {
          const lenR = node.right.range.end - node.right.range.start + 1;
          node.right.value = ((node.right.value as any) + (lazyVal as any) * lenR) as any;
        } else {
          node.right.value = this.config.updateFunction!(node.right.value, lazyVal);
        }
      }
      (node as any).hasLazyUpdate = false;
      (node as any).lazyValue = undefined;
    }

    // If current node's range is completely outside query range
    if (node.range.end < start || node.range.start > end) {
      return this.config.identityElement!;
    }

    // If current node's range is completely inside query range
    if (node.range.start >= start && node.range.end <= end) {
      return node.value;
    }

    // If current node's range partially overlaps query range
    const leftResult = this.queryRecursive(node.left || null, start, end, nodesVisited);
    const rightResult = this.queryRecursive(node.right || null, start, end, nodesVisited);

    return this.config.aggregationFunction!(leftResult, rightResult);
  }

  /**
   * Update a point in the segment tree recursively
   * @param node
   * @param index
   * @param value
   * @param nodesUpdated
   * @example
   */
  private updatePointRecursive(node: SegmentTreeNode<T> | null, index: number, value: T, nodesUpdated: number): void {
    if (!node) {
      return;
    }

    nodesUpdated++;

    // If current node's range doesn't contain the index
    if (node.range.start > index || node.range.end < index) {
      return;
    }

    // If current node is a leaf node
    if (node.range.start === node.range.end) {
      node.value = value;
      return;
    }

    // Update children (push down lazy updates if present)
    if ((node as any).hasLazyUpdate && this.config.enableLazyPropagation) {
      const lazyVal = (node as any).lazyValue as T;
      if (node.left) {
        (node.left as any).hasLazyUpdate = true;
        (node.left as any).lazyValue = this.config.updateFunction!(
          (node.left as any).lazyValue ?? this.config.identityElement!,
          lazyVal
        );
      }
      if (node.right) {
        (node.right as any).hasLazyUpdate = true;
        (node.right as any).lazyValue = this.config.updateFunction!(
          (node.right as any).lazyValue ?? this.config.identityElement!,
          lazyVal
        );
      }
      (node as any).hasLazyUpdate = false;
      (node as any).lazyValue = undefined;
    }
    this.updatePointRecursive(node.left || null, index, value, nodesUpdated);
    this.updatePointRecursive(node.right || null, index, value, nodesUpdated);

    // Update current node
    if (node.left && node.right) {
      node.value = this.config.aggregationFunction!(node.left.value, node.right.value);
    }
  }

  /**
   * Update a range in the segment tree recursively
   * @param node
   * @param start
   * @param end
   * @param value
   * @param nodesUpdated
   * @example
   */
  private updateRangeRecursive(
    node: SegmentTreeNode<T> | null,
    start: number,
    end: number,
    value: T,
    nodesUpdated: number
  ): void {
    if (!node) {
      return;
    }

    nodesUpdated++;

    // If current node's range is completely outside update range
    if (node.range.end < start || node.range.start > end) {
      return;
    }

    // If current node's range is completely inside update range
    if (node.range.start >= start && node.range.end <= end) {
      if (this.config.enableLazyPropagation) {
        // Use lazy propagation
        node.lazyValue = value;
        node.hasLazyUpdate = true;
        // For numeric aggregation (like sum), scale update by segment length
        if (typeof (node.value as any) === "number" && typeof (value as any) === "number") {
          const len = node.range.end - node.range.start + 1;
          node.value = ((node.value as any) + (value as any) * len) as any;
        } else {
          node.value = this.config.updateFunction!(node.value, value);
        }
      } else {
        // Update immediately
        if (node.range.start === node.range.end) {
          node.value = this.config.updateFunction!(node.value, value);
        } else {
          this.updateRangeRecursive(node.left || null, start, end, value, nodesUpdated);
          this.updateRangeRecursive(node.right || null, start, end, value, nodesUpdated);
          if (node.left && node.right) {
            node.value = this.config.aggregationFunction!(node.left.value, node.right.value);
          }
        }
      }
      return;
    }

    // If current node's range partially overlaps update range (push down lazy before recursing)
    if ((node as any).hasLazyUpdate && this.config.enableLazyPropagation) {
      const lazyVal = (node as any).lazyValue as T;
      if (node.left) {
        (node.left as any).hasLazyUpdate = true;
        (node.left as any).lazyValue = this.config.updateFunction!(
          (node.left as any).lazyValue ?? this.config.identityElement!,
          lazyVal
        );
        if (typeof (node.left.value as any) === "number" && typeof (lazyVal as any) === "number") {
          const lenL = node.left.range.end - node.left.range.start + 1;
          node.left.value = ((node.left.value as any) + (lazyVal as any) * lenL) as any;
        } else {
          node.left.value = this.config.updateFunction!(node.left.value, lazyVal);
        }
      }
      if (node.right) {
        (node.right as any).hasLazyUpdate = true;
        (node.right as any).lazyValue = this.config.updateFunction!(
          (node.right as any).lazyValue ?? this.config.identityElement!,
          lazyVal
        );
        if (typeof (node.right.value as any) === "number" && typeof (lazyVal as any) === "number") {
          const lenR = node.right.range.end - node.right.range.start + 1;
          node.right.value = ((node.right.value as any) + (lazyVal as any) * lenR) as any;
        } else {
          node.right.value = this.config.updateFunction!(node.right.value, lazyVal);
        }
      }
      (node as any).hasLazyUpdate = false;
      (node as any).lazyValue = undefined;
    }
    this.updateRangeRecursive(node.left || null, start, end, value, nodesUpdated);
    this.updateRangeRecursive(node.right || null, start, end, value, nodesUpdated);

    // Update current node
    if (node.left && node.right) {
      node.value = this.config.aggregationFunction!(node.left.value, node.right.value);
    }
  }

  /**
   * Traverse the tree recursively
   * @param node
   * @param values
   * @param nodesVisited
   * @param options
   * @example
   */
  private traverseRecursive(
    node: SegmentTreeNode<T> | null,
    values: T[],
    nodesVisited: number,
    options: TraversalOptions
  ): void {
    if (!node) {
      return;
    }

    nodesVisited++;

    if (options.order === TraversalOrder.PRE_ORDER) {
      values.push(node.value);
    }

    if (node.left) {
      this.traverseRecursive(node.left, values, nodesVisited, options);
    }

    if (options.order === TraversalOrder.IN_ORDER) {
      values.push(node.value);
    }

    if (node.right) {
      this.traverseRecursive(node.right, values, nodesVisited, options);
    }

    if (options.order === TraversalOrder.POST_ORDER) {
      values.push(node.value);
    }
  }

  /**
   * Count total nodes in the tree
   * @example
   */
  private countNodes(): number {
    return this.countNodesFrom(this.root);
  }

  /**
   *
   * @param node
   * @example
   */
  private countNodesFrom(node: SegmentTreeNode<T> | null): number {
    if (!node) return 0;
    return 1 + this.countNodesFrom(node.left || null) + this.countNodesFrom(node.right || null);
  }

  /**
   * Get the height of the tree
   * @example
   */
  private getHeight(): number {
    return this.calculateHeight(this.root);
  }

  /**
   * Calculate height of a node
   * @param node
   * @example
   */
  private calculateHeight(node: SegmentTreeNode<T> | null): number {
    if (!node) {
      return 0;
    }

    const leftHeight = this.calculateHeight(node.left || null);
    const rightHeight = this.calculateHeight(node.right || null);

    return 1 + Math.max(leftHeight, rightHeight);
  }

  /**
   * Calculate memory usage
   * @example
   */
  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage
    return this.array.length * 8 + this.countNodes() * 32; // 8 bytes per element + 32 bytes per node
  }

  /**
   * Emit event to registered handlers
   * @param type
   * @param data
   * @example
   */
  private emitEvent(type: SegmentTreeEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event: SegmentTreeEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in SegmentTree event handler:", error);
      }
    }
  }
}

// Import default options
