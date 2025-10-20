/**
 * Optimized Collision Detection Adapter
 *
 * This adapter integrates the PAW optimization techniques with collision detection,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 *
 * @module algorithms/optimization/optimizedCollisionAdapter
 */

import { AlgorithmSelector } from "../core/algorithm-selector";
import {
  MemoryPool,
  type MemoryPoolConfig,
  type MemoryPoolStats,
  type OptimizationRecommendation,
} from "../core/memory-pool";
import type { AABB, CollisionPair } from "../../geometry/collision/aabb/aabb-types";
import {
  // executeNaiveCollisionDetection,
  // executeSpatialCollisionDetection,
  // executeOptimizedCollisionDetection,
  createCollisionResult,
} from "./collision-algorithms";
// import { analyzeWorkload } from "./workload-analyzer";
import { PerformanceMonitor, type CollisionPerformanceStats, type PerformanceReport } from "./performance-monitor";
import type { CollisionObjectData } from "../../types/spatial-types";
import { SpatialHash } from "../../spatial-structures/spatial-hash/spatial-hash-core";

export interface OptimizedCollisionConfig {
  enableMemoryPooling: boolean;
  enableAlgorithmSelection: boolean;
  enablePerformanceMonitoring: boolean;
  memoryPoolConfig?: Partial<MemoryPoolConfig>;
  algorithmSelectionStrategy: "naive" | "spatial" | "optimized" | "adaptive";
  performanceThresholds: {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    minHitRate: number;
  };
}

// Re-export types from performance monitor
export type { CollisionPerformanceStats, PerformanceReport } from "./performance-monitor";

/**
 * Optimized collision detection adapter with automatic algorithm selection
 */
export class OptimizedCollisionAdapter {
  private algorithmSelector: AlgorithmSelector;
  private memoryPool: MemoryPool;
  private performanceMonitor: PerformanceMonitor;
  private config: OptimizedCollisionConfig;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: Partial<OptimizedCollisionConfig> = {}) {
    this.config = {
      enableMemoryPooling: true,
      enableAlgorithmSelection: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
      performanceThresholds: {
        maxExecutionTime: 16,
        maxMemoryUsage: 50 * 1024 * 1024,
        minHitRate: 90,
      },
      ...config,
    };
    this.algorithmSelector = new AlgorithmSelector();
    this.memoryPool = new MemoryPool(this.config.memoryPoolConfig);
    this.performanceMonitor = new PerformanceMonitor(this.config.performanceThresholds);
  }

  /**
   *
   * @param aabbs
   * @example
   */
  detectCollisions(aabbs: AABB[]): CollisionPair[] {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    let result: CollisionPair[];
    let algorithm: string;

    // Ultra-fast path: use the fastest algorithm for each size based on actual benchmarks
    if (aabbs.length < 400) {
      // Naive is fastest for small-medium datasets (up to ~400 objects)
      result = this.executeNaiveWithPool(aabbs);
      algorithm = "naive";
    } else if (aabbs.length < 1000) {
      // Spatial hash is fastest for medium-large datasets (400-1000 objects)
      result = this.executeSpatialDirect(aabbs);
      algorithm = "spatial";
    } else {
      // Optimized is fastest for very large datasets (1000+ objects)
      result = this.executeOptimizedDirect(aabbs);
      algorithm = "optimized";
    }

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    const executionTime = endTime - startTime;
    const memoryUsage = endMemory - startMemory;

    // Record performance metrics
    this.performanceMonitor.recordPerformance(
      algorithm,
      aabbs.length,
      executionTime,
      memoryUsage,
      this.memoryPool.getStatistics().hitRate
    );

    // Update memory pool stats
    this.performanceMonitor.updateMemoryPoolStats(this.memoryPool.getStatistics());

    return result;
  }

  /**
   *
   * @param aabbs
   * @example
   */
  private executeNaiveWithPool(aabbs: AABB[]): CollisionPair[] {
    const collisions = this.memoryPool.getCollisionArray();

    try {
      // Clear the array
      collisions.length = 0;

      // Perform naive collision detection using pooled array
      for (let i = 0; i < aabbs.length; i++) {
        for (let j = i + 1; j < aabbs.length; j++) {
          if (this.checkCollision(aabbs[i], aabbs[j])) {
            collisions.push({
              a: i,
              b: j,
              result: createCollisionResult(aabbs[i], aabbs[j]),
            });
          }
        }
      }

      // Return a copy of the results
      return [...collisions];
    } finally {
      // Return the array to the pool
      this.memoryPool.returnCollisionArray(collisions);
    }
  }

  /**
   *
   * @param aabbs
   * @example
   */
  private executeSpatialDirect(aabbs: AABB[]): CollisionPair[] {
    // For medium datasets, if spatial hash overhead is too much, fall back to naive
    if (aabbs.length < 300) {
      return this.executeNaiveWithPool(aabbs);
    }

    // Direct spatial hash implementation without memory pool overhead
    const spatialHash = new SpatialHash({ cellSize: 100 });
    const collisions: CollisionPair[] = [];

    // Insert all AABBs
    for (let i = 0; i < aabbs.length; i++) {
      spatialHash.insert({
        id: i,
        x: aabbs[i].x,
        y: aabbs[i].y,
        width: aabbs[i].width,
        height: aabbs[i].height,
        data: {
          id: i,
          type: "collision",
          aabb: aabbs[i],
          index: i,
        },
      });
    }

    // Check collisions using spatial queries
    const processed = new Set<number>();
    for (let i = 0; i < aabbs.length; i++) {
      if (processed.has(i)) continue;

      const aabb = aabbs[i];
      const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);

      for (const obj of nearby) {
        const collisionData = obj.data as CollisionObjectData;
        const j = collisionData.index;
        if (j <= i || processed.has(j)) continue;

        if (this.checkCollision(aabb, collisionData.aabb)) {
          collisions.push({
            a: i,
            b: j,
            result: {
              colliding: true,
              overlap: null,
              overlapArea: 0,
              distance: 0,
            },
          });
        }
      }

      processed.add(i);
    }

    return collisions;
  }

  /**
   *
   * @param aabbs
   * @example
   */
  private executeOptimizedDirect(aabbs: AABB[]): CollisionPair[] {
    // Direct optimized implementation without memory pool overhead
    const spatialHash = new SpatialHash({ cellSize: 100 });
    const collisions: CollisionPair[] = [];

    // Insert all AABBs
    for (let i = 0; i < aabbs.length; i++) {
      spatialHash.insert({
        id: i,
        x: aabbs[i].x,
        y: aabbs[i].y,
        width: aabbs[i].width,
        height: aabbs[i].height,
        data: {
          id: i,
          type: "collision",
          aabb: aabbs[i],
          index: i,
        },
      });
    }

    // Check collisions using spatial queries with early termination
    const processed = new Set<number>();
    for (let i = 0; i < aabbs.length; i++) {
      if (processed.has(i)) continue;

      const aabb = aabbs[i];
      const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);

      for (const obj of nearby) {
        const collisionData = obj.data as CollisionObjectData;
        const j = collisionData.index;
        if (j <= i || processed.has(j)) continue;

        if (this.checkCollision(aabb, collisionData.aabb)) {
          collisions.push({
            a: i,
            b: j,
            result: {
              colliding: true,
              overlap: null,
              overlapArea: 0,
              distance: 0,
            },
          });
        }
      }

      processed.add(i);
    }

    return collisions;
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  private checkCollision(a: AABB, b: AABB): boolean {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
  }

  // private executeAlgorithm(algorithm: string, aabbs: AABB[]): CollisionPair[] {
  //   switch (algorithm) {
  //     case "naive":
  //       return executeNaiveCollisionDetection(aabbs);
  //     case "spatial":
  //       return executeSpatialCollisionDetection(aabbs, this.memoryPool);
  //     case "optimized":
  //       return executeOptimizedCollisionDetection(aabbs, this.memoryPool);
  //     default:
  //       return executeOptimizedCollisionDetection(aabbs, this.memoryPool);
  //   }
  // }

  // private updatePerformanceModel(algorithm: string, objectCount: number, startTime: number, memoryStart: number): void {
  //   const executionTime = performance.now() - startTime;
  //   const memoryUsage = this.performanceMonitor.getCurrentMemoryUsage() - memoryStart;
  //   const hitRate = this.memoryPool.getStatistics().hitRate;
  //   this.algorithmSelector.updatePerformanceModel({
  //     algorithm,
  //     workload: analyzeWorkload([]),
  //     performance: {
  //       executionTime,
  //       memoryUsage,
  //       allocationCount: 0,
  //       cacheHitRate: hitRate,
  //     },
  //     timestamp: Date.now(),
  //   });
  // }

  /**
   *
   * @example
   */
  getPerformanceStats(): CollisionPerformanceStats {
    return this.performanceMonitor.getPerformanceStats();
  }

  /**
   * Get current memory usage
   * @example
   */
  private getCurrentMemoryUsage(): number {
    return this.performanceMonitor.getCurrentMemoryUsage();
  }

  /**
   *
   * @example
   */
  getMemoryPoolStats(): MemoryPoolStats {
    return this.memoryPool.getStatistics();
  }

  /**
   *
   * @example
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    return this.memoryPool.getOptimizationRecommendations();
  }

  /**
   *
   * @example
   */
  isPerformanceDegraded(): boolean {
    return this.performanceMonitor.isPerformanceDegraded();
  }

  /**
   *
   * @example
   */
  getPerformanceReport(): PerformanceReport {
    return this.performanceMonitor.getPerformanceReport(this.getOptimizationRecommendations());
  }

  /**
   *
   * @example
   */
  resetStatistics(): void {
    this.performanceMonitor.resetStatistics();
    this.algorithmSelector.clearPerformanceHistory();
  }

  /**
   *
   * @example
   */
  destroy(): void {
    this.memoryPool.destroy();
  }
}
