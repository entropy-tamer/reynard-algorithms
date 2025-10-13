/**
 * Spatial Collision Optimizer
 *
 * Advanced collision detection system that uses spatial partitioning
 * to optimize collision queries and reduce computational complexity
 * from O(n²) to O(n) average case.
 *
 * @module algorithms/geometry/collision/optimization/spatialCollisionOptimizer
 */

import { SpatialHash } from "../../../spatial-structures/spatial-hash/spatial-hash-core";
import type { AABB, CollisionResult } from "../aabb/aabb-types";
import type { CollisionObjectData } from "../../../types/spatial-types";
import {
  naiveCollisionDetection,
  spatialCollisionDetection,
  type CollisionPair,
  type CollisionCache,
} from "./collision-detection-core";
import {
  type SpatialCollisionConfig,
  type SpatialCollisionStats,
  createDefaultConfig,
  createInitialStats,
  updateAverageQueryTime,
} from "./spatial-collision-stats";

// Re-export types for external use
export type { AABB, CollisionResult } from "../aabb/aabb-types";
export type { SpatialCollisionConfig, SpatialCollisionStats } from "./spatial-collision-stats";

export class SpatialCollisionOptimizer {
  private spatialHash: SpatialHash<CollisionObjectData>;
  private config: SpatialCollisionConfig;
  private collisionCache: CollisionCache;
  private stats: SpatialCollisionStats;

  constructor(config: Partial<SpatialCollisionConfig> = {}) {
    this.config = createDefaultConfig(config);

    this.spatialHash = new SpatialHash({
      cellSize: this.config.cellSize,
      maxObjectsPerCell: this.config.maxObjectsPerCell,
    });

    this.collisionCache = {
      cache: new Map<string, CollisionResult>(),
      stats: { cacheHits: 0 },
      config: {
        enableCaching: this.config.enableCaching,
        cacheSize: this.config.cacheSize,
      },
    };

    this.stats = createInitialStats();
  }

  /**
   * Detect collisions using spatial optimization
   */
  detectCollisions(aabbs: AABB[]): CollisionPair[] {
    const start = performance.now();
    this.stats.totalQueries++;
    this.stats.objectsProcessed = aabbs.length;

    // Choose algorithm based on object count
    const collisions =
      aabbs.length < this.config.hybridThreshold
        ? this.naiveCollisionDetection(aabbs)
        : this.spatialCollisionDetection(aabbs);

    const duration = performance.now() - start;
    updateAverageQueryTime(this.stats, duration);

    return collisions;
  }

  /**
   * Naive O(n²) collision detection for small datasets
   */
  private naiveCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    this.stats.naiveQueries++;
    return naiveCollisionDetection(aabbs, this.collisionCache);
  }

  /**
   * Spatial hash optimized collision detection
   */
  private spatialCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    this.stats.spatialQueries++;
    return spatialCollisionDetection(aabbs, this.spatialHash, this.collisionCache);
  }

  /**
   * Get performance statistics
   */
  getStats(): SpatialCollisionStats {
    return {
      ...this.stats,
      cacheHits: this.collisionCache.stats.cacheHits,
    };
  }

  /**
   * Clear collision cache
   */
  clearCache(): void {
    this.collisionCache.cache.clear();
    this.collisionCache.stats.cacheHits = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SpatialCollisionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update collision cache config
    this.collisionCache.config = {
      enableCaching: this.config.enableCaching,
      cacheSize: this.config.cacheSize,
    };

    if (newConfig.cellSize || newConfig.maxObjectsPerCell) {
      this.spatialHash = new SpatialHash({
        cellSize: this.config.cellSize,
        maxObjectsPerCell: this.config.maxObjectsPerCell,
      });
    }
  }
}
