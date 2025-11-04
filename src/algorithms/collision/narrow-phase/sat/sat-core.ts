/**
 * Separating Axis Theorem (SAT) Collision Detection Core Implementation
 *
 * Main SAT class that orchestrates collision detection using modular components.
 * Provides comprehensive collision detection between convex polygons using
 * the SAT algorithm with optimizations including caching, early termination,
 * and bounding circle optimization.
 *
 * @module algorithms/geometry/collision/sat
 */

import type {
  ConvexPolygon,
  SATCollisionResult,
  SATConfig,
  SATOptions,
  SATEventHandler,
  TransformMatrix,
  SATBatchResult,
} from "./sat-types";
import { DEFAULT_SAT_CONFIG, DEFAULT_SAT_OPTIONS } from "./sat-types";
import { performSATTest } from "./sat-collision";
import { findContactPoints } from "./sat-contact";
import { SATCache } from "./sat-cache";
import { SATStatsManager } from "./sat-stats";
import { transformPolygon } from "./sat-geometry";

/**
 * Separating Axis Theorem Collision Detection Implementation
 *
 * Provides comprehensive collision detection between convex polygons using
 * the SAT algorithm with optimizations including caching, early termination,
 * and bounding circle optimization.
 */
export class SAT {
  private config: SATConfig;
  private cache: SATCache;
  private statsManager: SATStatsManager;

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<SATOptions> = {}) {
    const opts = { ...DEFAULT_SAT_OPTIONS, ...options };
    this.config = { ...DEFAULT_SAT_CONFIG, ...opts.config };
    this.cache = new SATCache(opts.cacheSize);
    this.statsManager = new SATStatsManager(opts.enableStats, opts.enableDebug);

    // Add event handlers if provided
    if (opts.eventHandlers) {
      for (const handler of opts.eventHandlers) {
        this.statsManager.addEventHandler(handler);
      }
    }
  }

  /**
   * Test collision between two convex polygons using SAT
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Collision detection result
   * @example
   */
  testCollision(polygon1: ConvexPolygon, polygon2: ConvexPolygon): SATCollisionResult {
    const startTime = performance.now();
    this.statsManager.emitEvent("collision_test_started" as any, { polygon1, polygon2 });

    try {
      // Check cache first
      const cacheKey = this.cache.getCacheKey(polygon1, polygon2);
      if (this.cache.hasResult(cacheKey)) {
        const cached = this.cache.getResult(cacheKey)!;
        this.statsManager.emitEvent("cache_hit" as any, { cacheKey });
        this.statsManager.updateCacheHitRate(true);
        this.statsManager.updateStats(cached, 0);
        return cached;
      }

      this.statsManager.emitEvent("cache_miss" as any, { cacheKey });

      // Perform SAT collision test
      const result = performSATTest(polygon1, polygon2, this.config);

      // Find contact points if needed
      if (this.config.findContactPoints && result.colliding && result.separationAxis) {
        result.contactPoints = findContactPoints(polygon1, polygon2, result.separationAxis, this.config);
      }

      // Cache result
      this.cache.setResult(cacheKey, polygon1, polygon2, result);

      const executionTime = performance.now() - startTime;
      this.statsManager.updateStats(result, executionTime);
      this.statsManager.updateCacheHitRate(false);

      if (result.colliding) {
        this.statsManager.emitEvent("collision_detected" as any, result);
      } else {
        this.statsManager.emitEvent("no_collision" as any, result);
      }

      this.statsManager.emitEvent("collision_test_completed" as any, result);

      return result;
    } catch (error) {
      const result: SATCollisionResult = {
        colliding: false,
        mtv: null,
        overlap: 0,
        separationAxis: null,
        contactPoints: [],
        penetrationDepth: 0,
        executionTime: performance.now() - startTime,
        axesTested: 0,
        success: false,
      };

      this.statsManager.updateStats(result, result.executionTime);
      this.statsManager.emitEvent("collision_test_completed" as any, result);

      return result;
    }
  }

  /**
   * Test collision between multiple polygon pairs
   *
   * @param polygonPairs Array of polygon pairs to test
   * @returns Batch collision test results
   * @example
   */
  testBatchCollisions(polygonPairs: Array<{ polygon1: ConvexPolygon; polygon2: ConvexPolygon }>): SATBatchResult {
    const startTime = performance.now();
    const results: Array<{ polygon1Id: string | number; polygon2Id: string | number; result: SATCollisionResult }> = [];
    let collisionCount = 0;

    for (const { polygon1, polygon2 } of polygonPairs) {
      const result = this.testCollision(polygon1, polygon2);
      results.push({
        polygon1Id: polygon1.id || this.getPolygonHash(polygon1),
        polygon2Id: polygon2.id || this.getPolygonHash(polygon2),
        result,
      });

      if (result.colliding) {
        collisionCount++;
      }
    }

    const totalExecutionTime = performance.now() - startTime;

    return {
      results,
      totalExecutionTime,
      collisionCount,
      stats: this.statsManager.getStats(),
    };
  }

  /**
   * Transform a polygon and test collision
   *
   * @param polygon The polygon to transform
   * @param transform The transformation to apply
   * @param otherPolygon The other polygon to test against
   * @returns Collision detection result
   * @example
   */
  testTransformedCollision(
    polygon: ConvexPolygon,
    transform: TransformMatrix,
    otherPolygon: ConvexPolygon
  ): SATCollisionResult {
    const transformedPolygon = this.transformPolygon(polygon, transform);
    return this.testCollision(transformedPolygon, otherPolygon);
  }

  /**
   * Transform a polygon using a transformation matrix
   *
   * @param polygon The polygon to transform
   * @param transform The transformation matrix
   * @returns Transformed polygon
   * @example
   */
  private transformPolygon(polygon: ConvexPolygon, transform: TransformMatrix): ConvexPolygon {
    return transformPolygon(polygon, transform);
  }

  /**
   * Add event handler
   *
   * @param handler Event handler function
   * @example
   */
  addEventHandler(handler: SATEventHandler): void {
    this.statsManager.addEventHandler(handler);
  }

  /**
   * Remove event handler
   *
   * @param handler Event handler function
   * @example
   */
  removeEventHandler(handler: SATEventHandler): void {
    this.statsManager.removeEventHandler(handler);
  }

  /**
   * Get current statistics
   *
   * @returns Current statistics
   * @example
   */
  getStats() {
    return this.statsManager.getStats();
  }

  /**
   * Get performance metrics
   *
   * @returns Performance metrics
   * @example
   */
  getPerformanceMetrics() {
    const metrics = this.statsManager.getPerformanceMetrics();
    const cacheStats = this.cache.getStats();
    return {
      ...metrics,
      cacheSize: cacheStats.totalSize,
    };
  }

  /**
   * Clear cache
   * @example
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset statistics
   * @example
   */
  resetStats(): void {
    this.statsManager.resetStats();
  }

  /**
   * Update configuration
   *
   * @param newConfig New configuration options
   * @example
   */
  updateConfig(newConfig: Partial<SATConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generate hash for polygon (simple hash based on vertex count and center)
   *
   * @param polygon The polygon
   * @returns Hash string
   * @example
   */
  private getPolygonHash(polygon: ConvexPolygon): string {
    return `${polygon.vertices.length}-${polygon.center.x}-${polygon.center.y}`;
  }
}
