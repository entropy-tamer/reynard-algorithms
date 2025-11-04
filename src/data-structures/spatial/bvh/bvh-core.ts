/**
 * BVH (Bounding Volume Hierarchy) Data Structure Core Implementation
 *
 * Main BVH class that orchestrates spatial queries using modular components.
 * Provides efficient ray tracing and spatial queries with SAH-based construction
 * and dynamic refitting capabilities.
 *
 * @module algorithms/spatial-structures/bvh
 */

import type {
  AABB,
  Ray3D,
  Primitive,
  BVHNode,
  BVHBuildConfig,
  BVHStats,
  BVHResult,
  RayIntersectionResult,
  AABBIntersectionResult,
  RayIntersectionOptions,
  AABBIntersectionOptions,
  BVHOptions,
  BVHEventHandler,
  BVHPerformanceMetrics,
  BatchOperationResult,
  BVHSerialization,
} from "./bvh-types";
import { BVHEventType } from "./bvh-types";
import { DEFAULT_BVH_CONFIG, DEFAULT_BVH_OPTIONS } from "./bvh-types";
import { buildTree } from "./bvh-build";
import { rayIntersection, aabbIntersection } from "./bvh-query";
import { traverseTree, collectAllPrimitives } from "./bvh-traversal";
import { refitTree, updatePrimitive } from "./bvh-refit";

/**
 * BVH Data Structure Implementation
 *
 * Provides efficient ray tracing and spatial queries with
 * SAH-based construction and dynamic refitting capabilities.
 */
export class BVH {
  private root: BVHNode | null;
  private config: Required<BVHBuildConfig>;
  private eventHandlers: BVHEventHandler[];
  private enableDebug: boolean;
  private stats: BVHStats;
  private primitives: Map<string | number, Primitive>;

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<BVHOptions> = {}) {
    const opts = { ...DEFAULT_BVH_OPTIONS, ...options };

    this.config = { ...DEFAULT_BVH_CONFIG, splitCandidates: 8, ...(opts.config || {}) } as Required<BVHBuildConfig>;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = (opts as any).enableDebug || false;
    this.primitives = new Map();

    this.root = null;

    this.stats = {
      totalPrimitives: 0,
      nodeCount: 0,
      leafCount: 0,
      height: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      averageRayIntersectionTime: 0,
      averageAABBIntersectionTime: 0,
      averageNodesVisitedPerRay: 0,
      averagePrimitivesTestedPerRay: 0,
      insertions: 0,
      removals: 0,
      rayIntersections: 0,
      aabbIntersections: 0,
      averageQueryTime: 0,
      averageBuildTime: 0,
      averageRefitTime: 0,
    };

    // Insert initial primitives if provided
    if (opts.initialPrimitives && opts.initialPrimitives.length > 0) {
      this.insertBatch(opts.initialPrimitives);
    }
  }

  /**
   * Insert a primitive into the BVH
   *
   * @param primitive Primitive to insert
   * @returns Insertion result
   * @example
   */
  insert(primitive: Primitive): BVHResult {
    const startTime = performance.now();

    if (!this.isValidPrimitive(primitive)) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: "Invalid primitive" },
      };
    }

    this.primitives.set(primitive.id, primitive);

    if (this.root === null) {
      this.root = buildTree([primitive], this.config, this.stats, this.emitEvent.bind(this) as any);
    } else {
      const allPrimitives = Array.from(this.primitives.values());
      this.root = buildTree(allPrimitives, this.config, this.stats, this.emitEvent.bind(this) as any);
    }

    this.updateStats();
    const executionTime = performance.now() - startTime;
    this.emitEvent(BVHEventType.PRIMITIVE_INSERTED, { primitive, executionTime });

    return {
      success: true,
      executionTime,
      nodesVisited: 0,
      metadata: { primitiveId: primitive.id },
    };
  }

  /**
   * Insert multiple primitives in batch
   *
   * @param primitives Primitives to insert
   * @returns Batch operation result
   * @example
   */
  insertBatch(primitives: Primitive[]): BatchOperationResult {
    const startTime = performance.now();
    const results: BVHResult[] = [];
    const validPrimitives: Primitive[] = [];
    const errors: string[] = [];

    for (const primitive of primitives) {
      if (this.isValidPrimitive(primitive)) {
        validPrimitives.push(primitive);
        this.primitives.set(primitive.id, primitive);
        results.push({
          success: true,
          executionTime: 0,
          nodesVisited: 0,
          metadata: { primitiveId: primitive.id },
        });
      } else {
        results.push({
          success: false,
          executionTime: 0,
          nodesVisited: 0,
          metadata: { error: "Invalid primitive" },
        });
        errors.push("Invalid primitive");
      }
    }

    if (validPrimitives.length > 0) {
      this.root = buildTree(validPrimitives, this.config, this.stats, this.emitEvent.bind(this) as any);
      this.updateStats();
    }

    const executionTime = performance.now() - startTime;

    return {
      success: errors.length === 0,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      errors,
      executionTime,
      results,
    };
  }

  /**
   * Remove a primitive from the BVH
   *
   * @param primitiveId ID of primitive to remove
   * @returns Removal result
   * @example
   */
  remove(primitiveId: string | number): BVHResult {
    const startTime = performance.now();

    if (!this.primitives.has(primitiveId)) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: "Primitive not found" },
      };
    }

    this.primitives.delete(primitiveId);

    if (this.primitives.size === 0) {
      this.root = null;
    } else {
      const allPrimitives = Array.from(this.primitives.values());
      this.root = buildTree(allPrimitives, this.config, this.stats, this.emitEvent.bind(this) as any);
    }

    this.updateStats();
    const executionTime = performance.now() - startTime;
    this.emitEvent(BVHEventType.PRIMITIVE_REMOVED, { primitiveId, executionTime });

    return {
      success: true,
      executionTime,
      nodesVisited: 0,
      metadata: { primitiveId },
    };
  }

  /**
   * Perform ray intersection query
   *
   * @param ray Ray to test
   * @param options Intersection options
   * @returns Ray intersection result
   * @example
   */
  rayIntersection(ray: Ray3D, options: RayIntersectionOptions = {}): RayIntersectionResult {
    return rayIntersection(this.root, ray, options, this.stats, this.emitEvent.bind(this) as any);
  }

  /**
   * Perform AABB intersection query
   *
   * @param aabb AABB to test
   * @param options Intersection options
   * @returns AABB intersection result
   * @example
   */
  aabbIntersection(aabb: AABB, options: AABBIntersectionOptions = {}): AABBIntersectionResult {
    return aabbIntersection(this.root, aabb, options, this.stats, this.emitEvent.bind(this) as any);
  }

  /**
   * Get total number of primitives
   *
   * @returns Number of primitives
   * @example
   */
  size(): number {
    return this.primitives.size;
  }

  /**
   * Check if BVH is empty
   *
   * @returns True if empty
   * @example
   */
  isEmpty(): boolean {
    return this.primitives.size === 0;
  }

  /**
   * Clear all primitives from BVH
   * @example
   */
  clear(): void {
    this.primitives.clear();
    this.root = null;
    this.stats.totalPrimitives = 0;
    this.stats.insertions = 0;
    this.stats.removals = 0;
    this.emitEvent(BVHEventType.TREE_REBUILT, {});
  }

  /**
   * Rebuild the entire BVH tree
   *
   * @returns Rebuild result
   * @example
   */
  rebuild(): BVHResult {
    const startTime = performance.now();
    const allPrimitives = Array.from(this.primitives.values());

    this.root = buildTree(allPrimitives, this.config, this.stats, this.emitEvent.bind(this) as any);
    this.updateStats();

    const executionTime = performance.now() - startTime;
    this.emitEvent(BVHEventType.TREE_REBUILT, { executionTime });

    return {
      success: true,
      executionTime,
      nodesVisited: this.stats.nodeCount,
      metadata: { primitiveCount: allPrimitives.length },
    };
  }

  /**
   * Get current statistics
   *
   * @returns Current statistics
   * @example
   */
  getStats(): BVHStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   *
   * @returns Performance metrics
   * @example
   */
  getPerformanceMetrics(): BVHPerformanceMetrics {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        (this.stats.totalPrimitives > 0 ? 1 : 0) * 30 +
          ((this.stats.averageQueryTime ?? 0) < 1 ? 1 : Math.max(0, 1 - (this.stats.averageQueryTime ?? 0) / 10)) * 40 +
          (this.stats.nodeCount > 0 ? Math.min(1, this.stats.leafCount / this.stats.nodeCount) : 0) * 30
      )
    );

    return {
      memoryUsage: this.stats.memoryUsage,
      averageRayIntersectionTime: this.stats.averageRayIntersectionTime ?? 0,
      averageAABBIntersectionTime: this.stats.averageAABBIntersectionTime ?? 0,
      performanceScore,
      balanceRatio: this.stats.nodeCount > 0 ? Math.min(1, this.stats.leafCount / this.stats.nodeCount) : 0,
      queryEfficiency: 1,
      sahQuality: 1,
    };
  }

  /**
   * Serialize BVH to JSON
   *
   * @returns Serialized BVH data
   * @example
   */
  serialize(): BVHSerialization {
    return {
      version: "1.0",
      config: this.config,
      data: {
        primitives: Array.from(this.primitives.values()),
        structure: this.root,
      },
      metadata: {
        totalPrimitives: this.stats.totalPrimitives,
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
   * @example
   */
  addEventHandler(handler: BVHEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   *
   * @param handler Event handler function
   * @example
   */
  removeEventHandler(handler: BVHEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Check if primitive is valid
   *
   * @param primitive Primitive to validate
   * @returns True if primitive is valid
   * @example
   */
  private isValidPrimitive(primitive: Primitive): boolean {
    return primitive && primitive.id !== undefined && primitive.id !== null;
  }

  /**
   * Update statistics
   * @example
   */
  private updateStats(): void {
    this.stats.totalPrimitives = this.primitives.size;
    this.stats.insertions = (this.stats.insertions ?? 0) + 1;
  }

  /**
   * Emit event to registered handlers
   *
   * @param type Event type
   * @param data Event data
   * @example
   */
  private emitEvent(type: BVHEventType, data?: any): void {
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
        console.error("Error in BVH event handler:", error);
      }
    }
  }
}
