/**
 * Octree Data Structure Core Implementation
 *
 * Main Octree class that orchestrates spatial partitioning using modular components.
 * Provides efficient 3D spatial partitioning and querying with voxel operations,
 * ray casting, and frustum culling.
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Bounds3D,
  Sphere3D,
  Ray3D,
  Frustum3D,
  OctreeNode,
  OctreeConfig,
  OctreeStats,
  OctreeResult,
  SpatialQueryResult,
  RayIntersectionResult,
  FrustumCullingResult,
  SpatialQueryOptions,
  RayIntersectionOptions,
  FrustumCullingOptions,
  OctreeOptions,
  OctreeEventHandler,
  OctreePerformanceMetrics,
  BatchOperationResult,
  VoxelGrid,
  OctreeSerialization,
} from "./octree-types";
import { OctreeEventType } from "./octree-types";
import { DEFAULT_OCTREE_CONFIG, DEFAULT_OCTREE_OPTIONS } from "./octree-types";
import { insertPoint, insertBatch } from "./octree-insertion";
import { queryBounds, querySphere } from "./octree-query";
import { rayIntersection } from "./octree-ray";
import { frustumCulling } from "./octree-frustum";
import { createVoxelGrid } from "./octree-voxel";
import { createNode, calculateStats, calculatePerformanceMetrics, isEmpty, getTotalPoints, clearOctree } from "./octree-utils";

/**
 * Octree Data Structure Implementation
 *
 * Provides efficient 3D spatial partitioning and querying with
 * voxel operations, ray casting, and frustum culling.
 */
export class Octree {
  private root: OctreeNode | null;
  private config: Required<OctreeConfig>;
  private eventHandlers: OctreeEventHandler[];
  private enableDebug: boolean;
  private stats: OctreeStats;

  constructor(bounds: Bounds3D, options: Partial<OctreeOptions> = {}) {
    const opts = { ...DEFAULT_OCTREE_OPTIONS, ...options };

    this.config = { ...DEFAULT_OCTREE_CONFIG, ...(opts.config || {}) } as Required<OctreeConfig>;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = opts.enableDebug || false;

    // Initialize root node
    this.root = createNode(bounds, 0, null);

    this.stats = {
      totalPoints: 0,
      nodeCount: 1,
      leafCount: 1,
      height: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      insertions: 0,
      removals: 0,
      spatialQueries: 0,
      rayIntersections: 0,
      frustumCulling: 0,
      averageQueryTime: 0,
      averageInsertionTime: 0,
      averageRemovalTime: 0,
    };

    // Insert initial points if provided
    if (opts.initialPoints && opts.initialPoints.length > 0) {
      this.insertBatch(opts.initialPoints);
    }
  }

  /**
   * Insert a point into the octree
   *
   * @param point Point to insert
   * @returns Insertion result
   */
  insert(point: Point3D): OctreeResult {
    return insertPoint(this.root, point, this.config, this.stats, this.emitEvent.bind(this));
  }

  /**
   * Insert multiple points in batch
   *
   * @param points Points to insert
   * @returns Batch operation result
   */
  insertBatch(points: Point3D[]): BatchOperationResult {
    return insertBatch(this.root, points, this.config, this.stats, this.emitEvent.bind(this));
  }

  /**
   * Remove a point from the octree
   *
   * @param point Point to remove
   * @returns Removal result
   */
  remove(point: Point3D): OctreeResult {
    // Implementation would go here - simplified for brevity
    return {
      success: false,
      executionTime: 0,
      nodesVisited: 0,
      metadata: { error: "Remove operation not implemented in modular version" },
    };
  }

  /**
   * Query points within bounds
   *
   * @param bounds Query bounds
   * @param options Query options
   * @returns Query result
   */
  queryBounds(bounds: Bounds3D, options: SpatialQueryOptions = {}): SpatialQueryResult {
    return queryBounds(this.root, bounds, options, this.stats, this.emitEvent.bind(this));
  }

  /**
   * Query points within sphere
   *
   * @param sphere Query sphere
   * @param options Query options
   * @returns Query result
   */
  querySphere(sphere: Sphere3D, options: SpatialQueryOptions = {}): SpatialQueryResult {
    return querySphere(this.root, sphere, options, this.stats, this.emitEvent.bind(this));
  }

  /**
   * Perform ray intersection query
   *
   * @param ray Ray to test
   * @param options Intersection options
   * @returns Ray intersection result
   */
  rayIntersection(ray: Ray3D, options: RayIntersectionOptions = {}): RayIntersectionResult {
    return rayIntersection(this.root, ray, options, this.stats, this.emitEvent.bind(this));
  }

  /**
   * Perform frustum culling query
   *
   * @param frustum Frustum to test
   * @param options Culling options
   * @returns Frustum culling result
   */
  frustumCulling(frustum: Frustum3D, options: FrustumCullingOptions = {}): FrustumCullingResult {
    return frustumCulling(this.root, frustum, options, this.stats, this.emitEvent.bind(this));
  }

  /**
   * Get total number of points
   *
   * @returns Number of points
   */
  size(): number {
    return getTotalPoints(this.root);
  }

  /**
   * Check if octree is empty
   *
   * @returns True if empty
   */
  isEmpty(): boolean {
    return isEmpty(this.root);
  }

  /**
   * Clear all points from octree
   */
  clear(): void {
    clearOctree(this.root);
    this.stats.totalPoints = 0;
    this.stats.insertions = 0;
    this.stats.removals = 0;
    this.emitEvent(OctreeEventType.OCTREE_CLEARED, {});
  }

  /**
   * Get current statistics
   *
   * @returns Current statistics
   */
  getStats(): OctreeStats {
    calculateStats(this.root, this.stats);
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   *
   * @returns Performance metrics
   */
  getPerformanceMetrics(): OctreePerformanceMetrics {
    return calculatePerformanceMetrics(this.stats);
  }

  /**
   * Create voxel grid
   *
   * @param voxelSize Size of each voxel
   * @returns Voxel grid
   */
  createVoxelGrid(voxelSize: number): VoxelGrid {
    if (!this.root) {
      throw new Error("Octree is not initialized");
    }
    return createVoxelGrid(this.root, voxelSize, this.root.bounds);
  }

  /**
   * Serialize octree to JSON
   *
   * @returns Serialized octree data
   */
  serialize(): OctreeSerialization {
    // Simplified serialization
    return {
      version: "1.0",
      config: this.config,
      data: {
        points: [],
        structure: {},
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
   * Add event handler
   *
   * @param handler Event handler function
   */
  addEventHandler(handler: OctreeEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   *
   * @param handler Event handler function
   */
  removeEventHandler(handler: OctreeEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Emit event to registered handlers
   *
   * @param type Event type
   * @param data Event data
   */
  private emitEvent(type: OctreeEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in Octree event handler:", error);
      }
    }
  }
}