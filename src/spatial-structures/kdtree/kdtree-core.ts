/**
 * K-d Tree Data Structure Core Implementation
 *
 * Main KdTree class that orchestrates tree operations using modular components
 * for building, searching, nearest neighbor queries, range queries, and removal.
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
import { insertPoint, insertBatch, rebuildTree } from "./kdtree-build";
import { searchPoint, containsPoint, getAllPoints } from "./kdtree-search";
import { findNearestNeighbor, findKNearestNeighbors } from "./kdtree-nearest";
import { performRangeQuery, findPointsInRadius } from "./kdtree-range";
import { removePoint, clearTree } from "./kdtree-removal";
import { 
  calculateTreeStats, 
  getTreeSize, 
  isTreeEmpty, 
  getPerformanceMetrics, 
  serializeTree,
  resetStats 
} from "./kdtree-utils";

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
   * Insert a single point into the tree.
   */
  insert(point: Point): KdTreeResult {
    const result = insertPoint(
      this.root,
      point,
      this.config,
      this.stats,
      this.eventHandlers,
      0
    );

    this.root = result.root;
    return result.result;
  }

  /**
   * Insert multiple points in batch.
   */
  insertBatch(points: Point[]): BatchOperationResult {
    const result = insertBatch(
      this.root,
      points,
      this.config,
      this.stats,
      this.eventHandlers
    );

    this.root = result.root;
    return result.result;
  }

  /**
   * Search for a point in the tree.
   */
  search(point: Point): boolean {
    const result = searchPoint(
      this.root,
      point,
      this.config,
      this.stats,
      this.eventHandlers
    );

    return result.success;
  }

  /**
   * Check if tree contains a point.
   */
  contains(point: Point): boolean {
    return containsPoint(
      this.root,
      point,
      this.config,
      this.stats,
      this.eventHandlers
    );
  }

  /**
   * Find nearest neighbor to a query point.
   */
  nearestNeighbor(queryPoint: Point, options: NearestNeighborOptions = {}): NearestNeighborResult {
    return findNearestNeighbor(
      this.root,
      queryPoint,
      this.config,
      this.stats,
      this.eventHandlers,
      options
    );
  }

  /**
   * Find k nearest neighbors to a query point.
   */
  kNearestNeighbors(queryPoint: Point, options: Partial<KNearestNeighborsOptions> = {}): KNearestNeighborsResult {
    return findKNearestNeighbors(
      this.root,
      queryPoint,
      this.config,
      this.stats,
      this.eventHandlers,
      { k: options.k ?? 1, ...options }
    );
  }

  /**
   * Perform range query on the tree.
   */
  rangeQuery(bounds: BoundingBox, options: Partial<RangeQueryOptions> = {}): RangeQueryResult {
    return performRangeQuery(
      this.root,
      bounds,
      this.config,
      this.stats,
      this.eventHandlers,
      { bounds, ...options }
    );
  }

  /**
   * Find points within a radius of a center point.
   */
  findPointsInRadius(center: Point, radius: number, options: Partial<RangeQueryOptions> = {}): RangeQueryResult {
    return findPointsInRadius(
      this.root,
      center,
      radius,
      this.config,
      this.stats,
      this.eventHandlers,
      options
    );
  }

  /**
   * Remove a point from the tree.
   */
  remove(point: Point): KdTreeResult {
    const result = removePoint(
      this.root,
      point,
      this.config,
      this.stats,
      this.eventHandlers
    );

    this.root = result.root;
    return result.result;
  }

  /**
   * Clear all points from the tree.
   */
  clear(): void {
    const result = clearTree(this.root, this.stats, this.eventHandlers);
    if (result.success) {
      this.root = null;
    }
  }

  /**
   * Get the number of points in the tree.
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
   * Get current tree statistics.
   */
  getStats(): KdTreeStats {
    calculateTreeStats(this.root, this.config, this.stats);
    return { ...this.stats };
  }

  /**
   * Get performance metrics.
   */
  getPerformanceMetrics(): KdTreePerformanceMetrics {
    return getPerformanceMetrics(this.stats);
  }

  /**
   * Rebuild the entire tree.
   */
  rebuild(): KdTreeResult {
    const allPoints = getAllPoints(this.root);
    const result = rebuildTree(allPoints, this.config, this.stats, this.eventHandlers);
    
    this.root = result.root;
    return result.result;
  }

  /**
   * Serialize the tree to JSON.
   */
  serialize(): KdTreeSerialization {
    return serializeTree(this.root, this.config, this.stats);
  }

  /**
   * Add event handler.
   */
  addEventHandler(handler: KdTreeEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler.
   */
  removeEventHandler(handler: KdTreeEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Enable or disable debug mode.
   */
  setDebugMode(enabled: boolean): void {
    this.enableDebug = enabled;
  }

  /**
   * Get all points in the tree.
   */
  getAllPoints(): Point[] {
    return getAllPoints(this.root);
  }

  /**
   * Reset all statistics.
   */
  resetStats(): void {
    resetStats(this.stats);
  }
}