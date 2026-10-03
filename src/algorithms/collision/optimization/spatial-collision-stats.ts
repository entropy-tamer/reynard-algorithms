/**
 * Spatial Collision Statistics and Configuration
 *
 * Statistics tracking and configuration management
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/optimization/spatialCollisionStats
 */

export interface SpatialCollisionConfig {
  cellSize: number;
  maxObjectsPerCell: number;
  enableCaching: boolean;
  cacheSize: number;
  hybridThreshold: number;
}

export interface SpatialCollisionStats {
  totalQueries: number;
  spatialQueries: number;
  naiveQueries: number;
  cacheHits: number;
  averageQueryTime: number;
  objectsProcessed: number;
}

/**
 * Create default configuration
 * @param overrides
 * @example
 */
export function createDefaultConfig(overrides: Partial<SpatialCollisionConfig> = {}): SpatialCollisionConfig {
  // Drop explicitly-undefined keys before merging. A plain `{...defaults,
  // ...overrides}` spread lets `undefined` clobber a default, which produces a
  // config that type-checks against `number` but behaves as `NaN`/`false` at
  // runtime. That failure is silent: `aabbs.length < undefined` is `false`, so
  // the optimizer always takes the spatial branch and finds nothing.
  const defined: Partial<SpatialCollisionConfig> = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      defined[key as keyof SpatialCollisionConfig] = value as never;
    }
  }

  return {
    cellSize: 100,
    maxObjectsPerCell: 50,
    // Measured at n=1000 AABBs: the cache is a net LOSS even when it works.
    // The candidate working set is ~7.5k distinct pairs but the default
    // cacheSize is 1k, so it thrashes to a 0% hit rate (0 hits across repeated
    // identical queries). Raising cacheSize so it fits gives ~100% hits and is
    // STILL slower: 26.4ms cached vs 15.5ms uncached at n=1000. Building the
    // string key per candidate costs more than the checkCollision call it
    // saves. Off by default; opt in only for a workload that re-checks the same
    // pairs with a cache large enough for the working set.
    enableCaching: false,
    cacheSize: 1000,
    hybridThreshold: 100,
    ...defined,
  };
}

/**
 * Create initial statistics
 * @example
 */
export function createInitialStats(): SpatialCollisionStats {
  return {
    totalQueries: 0,
    spatialQueries: 0,
    naiveQueries: 0,
    cacheHits: 0,
    averageQueryTime: 0,
    objectsProcessed: 0,
  };
}

/**
 * Update average query time
 * @param stats
 * @param duration
 * @example
 */
export function updateAverageQueryTime(stats: SpatialCollisionStats, duration: number): void {
  stats.averageQueryTime = (stats.averageQueryTime * (stats.totalQueries - 1) + duration) / stats.totalQueries;
}
