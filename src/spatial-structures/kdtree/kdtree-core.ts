/**
 * K-d Tree Data Structure Core Implementation
 *
 * Implementation of the K-d Tree data structure with comprehensive
 * features including k-dimensional point storage, nearest neighbor search,
 * range queries, and performance monitoring.
 *
 * Mathematical Theory:
 * A K-d tree is a space-partitioning data structure for organizing points
 * in k-dimensional space. It's a binary tree where each non-leaf node
 * represents a splitting hyperplane that divides the space into two parts.
 *
 * Key formulas:
 * - Construction: O(n log n) with median finding
 * - Search: O(log n) average, O(n) worst case
 * - Nearest neighbor: O(log n) average case
 * - Range query: O(n^(1-1/k) + m) where m is the number of results
 *
 * Where:
 * - n = number of points
 * - k = number of dimensions
 * - m = number of points in query result
 *
 * @module algorithms/spatial-structures/kdtree
 */

import type {
  Point,
  BoundingBox,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  KdTreeResult,
  NearestNeighborResult,
  KNearestNeighborsResult,
  RangeQueryResult,
  NearestNeighborOptions,
  KNearestNeighborsOptions,
  RangeQueryOptions,
  KdTreeOptions,
  KdTreeEvent,
  KdTreeEventHandler,
  KdTreePerformanceMetrics,
  BatchOperationResult,
  KdTreeSerialization,
} from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";
import { DEFAULT_KD_TREE_CONFIG, DEFAULT_KD_TREE_OPTIONS } from "./kdtree-types";

/**
 * K-d Tree Data Structure Implementation
 *
 * Provides efficient k-dimensional point storage and querying with
 * nearest neighbor search, range queries, and performance monitoring.
 */
export class KdTree {
  private root: KdNode | null;
  private config: Required<KdTreeConfig>;
  private eventHandlers: KdTreeEventHandler[];
  private enableDebug: boolean;
  private stats: KdTreeStats;

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<KdTreeOptions> = {}) {
    const opts = { ...DEFAULT_KD_TREE_OPTIONS, ...options };

    this.config = { ...DEFAULT_KD_TREE_CONFIG, ...(opts.config || {}) } as Required<KdTreeConfig>;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = false;

    this.root = null;

    this.stats = {
      totalPoints: 0,
      dimensions: this.config.dimensions,
      height: 0,
      nodeCount: 0,
      leafCount: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      insertions: 0,
      searches: 0,
      nearestNeighborQueries: 0,
      rangeQueries: 0,
      averageSearchTime: 0,
      averageNearestNeighborTime: 0,
      averageRangeQueryTime: 0,
    };

    // Insert initial points if provided
    if (opts.initialPoints && opts.initialPoints.length > 0) {
      this.insertBatch(opts.initialPoints);
    }
  }

  /**
   * Insert a point into the K-d tree.
   * @param point
   * @example
   */
  insert(point: Point): KdTreeResult {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      // Validate point
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" },
        };
      }

      // Check for duplicates if not allowed
      if (!this.config.allowDuplicates && this.contains(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Duplicate point not allowed" },
        };
      }

      this.root = this.insertRecursive(this.root, point, 0, 0);
      nodesVisited = this.stats.nodeCount;

      this.stats.insertions++;
      this.stats.totalPoints++;
      this.updateStats();

      const executionTime = performance.now() - startTime;
      this.stats.averageSearchTime =
        (this.stats.averageSearchTime * (this.stats.insertions - 1) + executionTime) / this.stats.insertions;

      this.emitEvent(KdTreeEventType.POINT_INSERTED, { point, executionTime });

      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { point },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Insert multiple points in batch.
   * @param points
   * @example
   */
  insertBatch(points: Point[]): BatchOperationResult {
    const startTime = performance.now();
    const results: KdTreeResult[] = [];
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const point of points) {
      const result = this.insert(point);
      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push(result.metadata?.error || "Unknown error");
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
   * Search for a point in the tree.
   * @param point
   * @example
   */
  search(point: Point): boolean {
    const startTime = performance.now();
    this.stats.searches++;

    const found = this.searchRecursive(this.root, point, 0);

    const executionTime = performance.now() - startTime;
    this.stats.averageSearchTime =
      (this.stats.averageSearchTime * (this.stats.searches - 1) + executionTime) / this.stats.searches;

    this.emitEvent(KdTreeEventType.SEARCH_PERFORMED, { point, found, executionTime });

    return found;
  }

  /**
   * Check if the tree contains a point.
   * @param point
   * @example
   */
  contains(point: Point): boolean {
    return this.search(point);
  }

  /**
   * Find the nearest neighbor to a query point.
   * @param queryPoint
   * @param options
   * @example
   */
  nearestNeighbor(queryPoint: Point, options: NearestNeighborOptions = {}): NearestNeighborResult {
    const startTime = performance.now();
    this.stats.nearestNeighborQueries++;

    let bestPoint: Point | null = null;
    let bestDistance = options.maxDistance || Infinity;
    let nodesVisited = 0;

    if (this.root) {
      const result = this.nearestNeighborRecursive(this.root, queryPoint, 0, bestPoint, bestDistance, options, 0);
      bestPoint = result.point;
      bestDistance = result.distance;
      nodesVisited = result.nodesVisited;
    }

    const executionTime = performance.now() - startTime;
    this.stats.averageNearestNeighborTime =
      (this.stats.averageNearestNeighborTime * (this.stats.nearestNeighborQueries - 1) + executionTime) /
      this.stats.nearestNeighborQueries;

    this.emitEvent(KdTreeEventType.NEAREST_NEIGHBOR_QUERY, {
      queryPoint,
      result: bestPoint,
      distance: bestDistance,
      executionTime,
    });

    return {
      point: bestPoint,
      distance: bestDistance,
      executionTime,
      nodesVisited,
      success: bestPoint !== null,
    };
  }

  /**
   * Find k nearest neighbors to a query point.
   * @param queryPoint
   * @param options
   * @example
   */
  kNearestNeighbors(queryPoint: Point, options: KNearestNeighborsOptions = {}): KNearestNeighborsResult {
    const startTime = performance.now();
    this.stats.nearestNeighborQueries++;

    const k = options.k || 1;
    const neighbors: Array<{ point: Point; distance: number }> = [];
    let nodesVisited = 0;

    if (this.root) {
      const result = this.kNearestNeighborsRecursive(this.root, queryPoint, 0, neighbors, k, options, 0);
      nodesVisited = result.nodesVisited;
    }

    // Sort by distance
    neighbors.sort((a, b) => a.distance - b.distance);

    const executionTime = performance.now() - startTime;
    this.stats.averageNearestNeighborTime =
      (this.stats.averageNearestNeighborTime * (this.stats.nearestNeighborQueries - 1) + executionTime) /
      this.stats.nearestNeighborQueries;

    this.emitEvent(KdTreeEventType.NEAREST_NEIGHBOR_QUERY, {
      queryPoint,
      k,
      results: neighbors,
      executionTime,
    });

    return {
      points: neighbors,
      executionTime,
      nodesVisited,
      success: neighbors.length > 0,
    };
  }

  /**
   * Perform a range query within a bounding box.
   * @param bounds
   * @param options
   * @example
   */
  rangeQuery(bounds: BoundingBox, options: RangeQueryOptions = {}): RangeQueryResult {
    const startTime = performance.now();
    this.stats.rangeQueries++;

    const points: Point[] = [];
    let nodesVisited = 0;

    if (this.root) {
      nodesVisited = this.rangeQueryRecursive(this.root, bounds, 0, points, options, 0);
    }

    const executionTime = performance.now() - startTime;
    this.stats.averageRangeQueryTime =
      (this.stats.averageRangeQueryTime * (this.stats.rangeQueries - 1) + executionTime) / this.stats.rangeQueries;

    this.emitEvent(KdTreeEventType.RANGE_QUERY, {
      bounds,
      results: points,
      executionTime,
    });

    return {
      points,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true,
    };
  }

  /**
   * Remove a point from the tree.
   * @param point
   * @example
   */
  remove(point: Point): KdTreeResult {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" },
        };
      }

      const removed = this.removeRecursive(this.root, point, 0);
      if (removed) {
        this.stats.totalPoints--;
        this.updateStats();
        nodesVisited = this.stats.nodeCount;

        this.emitEvent(KdTreeEventType.POINT_REMOVED, { point });

        return {
          success: true,
          executionTime: performance.now() - startTime,
          nodesVisited,
          metadata: { point },
        };
      } else {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point not found" },
        };
      }
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Clear all points from the tree.
   * @example
   */
  clear(): void {
    this.root = null;
    this.stats.totalPoints = 0;
    this.stats.nodeCount = 0;
    this.stats.leafCount = 0;
    this.stats.height = 0;
    this.updateStats();
  }

  /**
   * Get the size of the tree.
   * @example
   */
  size(): number {
    return this.stats.totalPoints;
  }

  /**
   * Check if the tree is empty.
   * @example
   */
  isEmpty(): boolean {
    return this.root === null;
  }

  /**
   * Get statistics about the tree.
   * @example
   */
  getStats(): KdTreeStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics.
   * @example
   */
  getPerformanceMetrics(): KdTreePerformanceMetrics {
    return {
      memoryUsage: this.stats.memoryUsage,
      averageSearchTime: this.stats.averageSearchTime,
      averageInsertTime: this.stats.averageSearchTime, // Using averageSearchTime as fallback
      averageNearestNeighborTime: this.stats.averageNearestNeighborTime,
      averageRangeQueryTime: this.stats.averageRangeQueryTime,
      performanceScore: this.calculatePerformanceScore(),
      balanceRatio: this.calculateBalanceRatio(),
      queryEfficiency: this.calculateQueryEfficiency(),
    };
  }

  /**
   * Rebuild the tree for better balance.
   * @example
   */
  rebuild(): KdTreeResult {
    const startTime = performance.now();

    try {
      const points = this.getAllPoints();
      this.clear();
      this.insertBatch(points);

      const executionTime = performance.now() - startTime;
      this.emitEvent(KdTreeEventType.TREE_REBUILT, { executionTime });

      return {
        success: true,
        executionTime,
        nodesVisited: this.stats.nodeCount,
        metadata: { pointsRebuilt: points.length },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Serialize the tree to JSON.
   * @example
   */
  serialize(): KdTreeSerialization {
    return {
      version: "1.0.0",
      config: this.config,
      data: {
        points: this.getAllPoints(),
        structure: this.serializeTreeStructure(),
      },
      metadata: {
        totalPoints: this.stats.totalPoints,
        height: this.stats.height,
        nodeCount: this.stats.nodeCount,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a tree from JSON.
   * @param data
   * @example
   */
  static deserialize(data: KdTreeSerialization): KdTree {
    const tree = new KdTree({ config: data.config });
    if (data.data.points.length > 0) {
      tree.insertBatch(data.data.points);
    }
    return tree;
  }

  // Private helper methods

  /**
   *
   * @param node
   * @param point
   * @param depth
   * @param parentDepth
   * @example
   */
  private insertRecursive(node: KdNode | null, point: Point, depth: number, parentDepth: number): KdNode {
    if (node === null) {
      const newNode: KdNode = {
        point,
        dimension: depth % this.config.dimensions,
        left: null,
        right: null,
        parent: null,
        depth: parentDepth,
      };
      return newNode;
    }

    const dimension = node.dimension;
    const pointCoord = point.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];

    if (pointCoord < nodeCoord) {
      node.left = this.insertRecursive(node.left, point, depth + 1, parentDepth + 1);
      node.left.parent = node;
    } else {
      node.right = this.insertRecursive(node.right, point, depth + 1, parentDepth + 1);
      node.right.parent = node;
    }

    return node;
  }

  /**
   *
   * @param node
   * @param point
   * @param depth
   * @example
   */
  private searchRecursive(node: KdNode | null, point: Point, depth: number): boolean {
    if (node === null) {
      return false;
    }

    if (this.pointsEqual(node.point, point)) {
      return true;
    }

    const dimension = node.dimension;
    const pointCoord = point.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];

    if (pointCoord < nodeCoord) {
      return this.searchRecursive(node.left, point, depth + 1);
    } else {
      return this.searchRecursive(node.right, point, depth + 1);
    }
  }

  /**
   *
   * @param node
   * @param queryPoint
   * @param depth
   * @param bestPoint
   * @param bestDistance
   * @param options
   * @param nodesVisited
   * @example
   */
  private nearestNeighborRecursive(
    node: KdNode,
    queryPoint: Point,
    depth: number,
    bestPoint: Point | null,
    bestDistance: number,
    options: NearestNeighborOptions,
    nodesVisited: number
  ): { point: Point | null; distance: number; nodesVisited: number } {
    nodesVisited++;

    if (!options.includeSelf && this.pointsEqual(node.point, queryPoint)) {
      // Skip the query point itself
    } else {
      const distance = this.calculateDistance(node.point, queryPoint, options.distanceFunction);
      if (distance < bestDistance) {
        bestPoint = node.point;
        bestDistance = distance;
      }
    }

    const dimension = node.dimension;
    const queryCoord = queryPoint.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];

    // Determine which subtree to search first
    let primaryChild: KdNode | null;
    let secondaryChild: KdNode | null;

    if (queryCoord < nodeCoord) {
      primaryChild = node.left;
      secondaryChild = node.right;
    } else {
      primaryChild = node.right;
      secondaryChild = node.left;
    }

    // Search primary subtree
    if (primaryChild) {
      const result = this.nearestNeighborRecursive(
        primaryChild,
        queryPoint,
        depth + 1,
        bestPoint,
        bestDistance,
        options,
        nodesVisited
      );
      bestPoint = result.point;
      bestDistance = result.distance;
      nodesVisited = result.nodesVisited;
    }

    // Check if we need to search secondary subtree
    if (secondaryChild) {
      const distanceToPlane = Math.abs(queryCoord - nodeCoord);
      if (distanceToPlane < bestDistance) {
        const result = this.nearestNeighborRecursive(
          secondaryChild,
          queryPoint,
          depth + 1,
          bestPoint,
          bestDistance,
          options,
          nodesVisited
        );
        bestPoint = result.point;
        bestDistance = result.distance;
        nodesVisited = result.nodesVisited;
      }
    }

    return { point: bestPoint, distance: bestDistance, nodesVisited };
  }

  /**
   *
   * @param node
   * @param queryPoint
   * @param depth
   * @param neighbors
   * @param k
   * @param options
   * @param nodesVisited
   * @example
   */
  private kNearestNeighborsRecursive(
    node: KdNode,
    queryPoint: Point,
    depth: number,
    neighbors: Array<{ point: Point; distance: number }>,
    k: number,
    options: KNearestNeighborsOptions,
    nodesVisited: number
  ): { nodesVisited: number } {
    nodesVisited++;

    if (!options.includeSelf && this.pointsEqual(node.point, queryPoint)) {
      // Skip the query point itself
    } else {
      const distance = this.calculateDistance(node.point, queryPoint, options.distanceFunction);

      if (neighbors.length < k) {
        neighbors.push({ point: node.point, distance });
      } else if (distance < neighbors[neighbors.length - 1].distance) {
        neighbors[neighbors.length - 1] = { point: node.point, distance };
      }
    }

    const dimension = node.dimension;
    const queryCoord = queryPoint.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];

    // Determine which subtree to search first
    let primaryChild: KdNode | null;
    let secondaryChild: KdNode | null;

    if (queryCoord < nodeCoord) {
      primaryChild = node.left;
      secondaryChild = node.right;
    } else {
      primaryChild = node.right;
      secondaryChild = node.left;
    }

    // Search primary subtree
    if (primaryChild) {
      const result = this.kNearestNeighborsRecursive(
        primaryChild,
        queryPoint,
        depth + 1,
        neighbors,
        k,
        options,
        nodesVisited
      );
      nodesVisited = result.nodesVisited;
    }

    // Check if we need to search secondary subtree
    if (secondaryChild) {
      const distanceToPlane = Math.abs(queryCoord - nodeCoord);
      const maxDistance = neighbors.length > 0 ? neighbors[neighbors.length - 1].distance : Infinity;

      if (distanceToPlane < maxDistance) {
        const result = this.kNearestNeighborsRecursive(
          secondaryChild,
          queryPoint,
          depth + 1,
          neighbors,
          k,
          options,
          nodesVisited
        );
        nodesVisited = result.nodesVisited;
      }
    }

    return { nodesVisited };
  }

  /**
   *
   * @param node
   * @param bounds
   * @param depth
   * @param points
   * @param options
   * @param nodesVisited
   * @example
   */
  private rangeQueryRecursive(
    node: KdNode,
    bounds: BoundingBox,
    depth: number,
    points: Point[],
    options: RangeQueryOptions,
    nodesVisited: number
  ): number {
    nodesVisited++;

    // Check if current point is within bounds
    if (this.pointInBounds(node.point, bounds, options.inclusive)) {
      if (!options.filter || options.filter(node.point)) {
        points.push(node.point);
      }
    }

    const dimension = node.dimension;
    const nodeCoord = node.point.coordinates[dimension];
    const minCoord = bounds.min[dimension];
    const maxCoord = bounds.max[dimension];

    // Search left subtree if it might contain points in range
    if (node.left && nodeCoord >= minCoord) {
      nodesVisited = this.rangeQueryRecursive(node.left, bounds, depth + 1, points, options, nodesVisited);
    }

    // Search right subtree if it might contain points in range
    if (node.right && nodeCoord <= maxCoord) {
      nodesVisited = this.rangeQueryRecursive(node.right, bounds, depth + 1, points, options, nodesVisited);
    }

    return nodesVisited;
  }

  /**
   *
   * @param node
   * @param point
   * @param depth
   * @example
   */
  private removeRecursive(node: KdNode | null, point: Point, depth: number): KdNode | null {
    if (node === null) {
      return null;
    }

    if (this.pointsEqual(node.point, point)) {
      // Found the node to remove
      if (node.right) {
        // Find minimum in right subtree
        const minNode = this.findMin(node.right, node.dimension);
        node.point = minNode.point;
        node.right = this.removeRecursive(node.right, minNode.point, depth + 1);
      } else if (node.left) {
        // Find minimum in left subtree
        const minNode = this.findMin(node.left, node.dimension);
        node.point = minNode.point;
        node.left = this.removeRecursive(node.left, minNode.point, depth + 1);
      } else {
        // Leaf node
        return null;
      }
      return node;
    }

    const dimension = node.dimension;
    const pointCoord = point.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];

    if (pointCoord < nodeCoord) {
      node.left = this.removeRecursive(node.left, point, depth + 1);
    } else {
      node.right = this.removeRecursive(node.right, point, depth + 1);
    }

    return node;
  }

  /**
   *
   * @param node
   * @param dimension
   * @example
   */
  private findMin(node: KdNode, dimension: number): KdNode {
    if (node.dimension === dimension) {
      if (node.left === null) {
        return node;
      }
      return this.findMin(node.left, dimension);
    }

    let minNode = node;
    if (node.left) {
      const leftMin = this.findMin(node.left, dimension);
      if (leftMin.point.coordinates[dimension] < minNode.point.coordinates[dimension]) {
        minNode = leftMin;
      }
    }
    if (node.right) {
      const rightMin = this.findMin(node.right, dimension);
      if (rightMin.point.coordinates[dimension] < minNode.point.coordinates[dimension]) {
        minNode = rightMin;
      }
    }

    return minNode;
  }

  /**
   *
   * @param point
   * @example
   */
  private isValidPoint(point: Point): boolean {
    if (!point || !Array.isArray(point.coordinates)) {
      return false;
    }
    if (point.coordinates.length !== this.config.dimensions) {
      return false;
    }
    return point.coordinates.every(coord => typeof coord === "number" && isFinite(coord));
  }

  /**
   *
   * @param p1
   * @param p2
   * @example
   */
  private pointsEqual(p1: Point, p2: Point): boolean {
    if (p1.coordinates.length !== p2.coordinates.length) {
      return false;
    }
    return p1.coordinates.every((coord, i) => Math.abs(coord - p2.coordinates[i]) < this.config.tolerance);
  }

  /**
   *
   * @param p1
   * @param p2
   * @param customDistance
   * @example
   */
  private calculateDistance(p1: Point, p2: Point, customDistance?: (p1: Point, p2: Point) => number): number {
    if (customDistance) {
      return customDistance(p1, p2);
    }

    // Euclidean distance
    let sum = 0;
    for (let i = 0; i < p1.coordinates.length; i++) {
      const diff = p1.coordinates[i] - p2.coordinates[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   *
   * @param point
   * @param bounds
   * @param inclusive
   * @example
   */
  private pointInBounds(point: Point, bounds: BoundingBox, inclusive: boolean = true): boolean {
    for (let i = 0; i < point.coordinates.length; i++) {
      const coord = point.coordinates[i];
      const min = bounds.min[i];
      const max = bounds.max[i];

      if (inclusive) {
        if (coord < min || coord > max) {
          return false;
        }
      } else {
        if (coord <= min || coord >= max) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   *
   * @example
   */
  private getAllPoints(): Point[] {
    const points: Point[] = [];
    this.collectPoints(this.root, points);
    return points;
  }

  /**
   *
   * @param node
   * @param points
   * @example
   */
  private collectPoints(node: KdNode | null, points: Point[]): void {
    if (node === null) {
      return;
    }
    points.push(node.point);
    this.collectPoints(node.left, points);
    this.collectPoints(node.right, points);
  }

  /**
   *
   * @example
   */
  private updateStats(): void {
    this.stats.nodeCount = this.countNodes(this.root);
    this.stats.leafCount = this.countLeaves(this.root);
    this.stats.height = this.calculateHeight(this.root);
    this.stats.averageDepth = this.calculateAverageDepth(this.root);
    this.stats.maxDepth = this.calculateMaxDepth(this.root);
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  /**
   *
   * @param node
   * @example
   */
  private countNodes(node: KdNode | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  /**
   *
   * @param node
   * @example
   */
  private countLeaves(node: KdNode | null): number {
    if (node === null) {
      return 0;
    }
    if (node.left === null && node.right === null) {
      return 1;
    }
    return this.countLeaves(node.left) + this.countLeaves(node.right);
  }

  /**
   *
   * @param node
   * @example
   */
  private calculateHeight(node: KdNode | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right));
  }

  /**
   *
   * @param node
   * @example
   */
  private calculateAverageDepth(node: KdNode | null): number {
    if (node === null) {
      return 0;
    }
    const depths: number[] = [];
    this.collectDepths(node, 0, depths);
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }

  /**
   *
   * @param node
   * @param depth
   * @param depths
   * @example
   */
  private collectDepths(node: KdNode | null, depth: number, depths: number[]): void {
    if (node === null) {
      return;
    }
    if (node.left === null && node.right === null) {
      depths.push(depth);
    }
    this.collectDepths(node.left, depth + 1, depths);
    this.collectDepths(node.right, depth + 1, depths);
  }

  /**
   *
   * @param node
   * @example
   */
  private calculateMaxDepth(node: KdNode | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + Math.max(this.calculateMaxDepth(node.left), this.calculateMaxDepth(node.right));
  }

  /**
   *
   * @example
   */
  private estimateMemoryUsage(): number {
    // Rough estimate: each node + point data
    const nodeSize = 64; // Approximate size of a KdNode
    const pointSize = this.config.dimensions * 8; // 8 bytes per coordinate
    return this.stats.nodeCount * (nodeSize + pointSize);
  }

  /**
   *
   * @example
   */
  private calculatePerformanceScore(): number {
    // Simple performance score based on query times
    const maxTime = 100; // 100ms as maximum
    const searchScore = Math.max(0, 100 - (this.stats.averageSearchTime / maxTime) * 100);
    const nnScore = Math.max(0, 100 - (this.stats.averageNearestNeighborTime / maxTime) * 100);
    const rangeScore = Math.max(0, 100 - (this.stats.averageRangeQueryTime / maxTime) * 100);

    return (searchScore + nnScore + rangeScore) / 3;
  }

  /**
   *
   * @example
   */
  private calculateBalanceRatio(): number {
    if (this.stats.nodeCount === 0) {
      return 1;
    }
    const idealHeight = Math.ceil(Math.log2(this.stats.nodeCount + 1));
    return Math.max(0, 1 - (this.stats.height - idealHeight) / idealHeight);
  }

  /**
   *
   * @example
   */
  private calculateQueryEfficiency(): number {
    if (this.stats.searches === 0) {
      return 1;
    }
    const idealVisits = Math.log2(this.stats.nodeCount + 1);
    const actualVisits = this.stats.averageSearchTime; // Rough proxy
    return Math.max(0, 1 - (actualVisits - idealVisits) / idealVisits);
  }

  /**
   *
   * @example
   */
  private serializeTreeStructure(): any {
    return this.serializeNode(this.root);
  }

  /**
   *
   * @param node
   * @example
   */
  private serializeNode(node: KdNode | null): any {
    if (node === null) {
      return null;
    }
    return {
      point: node.point,
      dimension: node.dimension,
      depth: node.depth,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right),
    };
  }

  /**
   *
   * @param type
   * @param data
   * @example
   */
  private emitEvent(type: KdTreeEventType, data?: any): void {
    if (this.eventHandlers.length === 0) {
      return;
    }

    const event: KdTreeEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        if (this.enableDebug) {
          console.error("Error in K-d Tree event handler:", error);
        }
      }
    }
  }
}
