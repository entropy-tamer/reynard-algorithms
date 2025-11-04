/**
 * Theta* Cache Operations
 *
 * Handles caching and optimization for Theta* pathfinding
 * to improve performance and reduce redundant calculations.
 *
 * @module algorithms/pathfinding/theta-star
 */

import type { Point, ThetaStarResult, ThetaStarConfig, ThetaStarOptions } from "./theta-star-types";
import type { CellType } from "./theta-star-types";

/**
 * Cache manager for Theta* pathfinding results
 */
export class ThetaStarCache {
  private pathCache: Map<string, ThetaStarResult> = new Map();
  private lineOfSightCache: Map<string, boolean> = new Map();
  private maxSize: number;
  private hitCount: number = 0;
  private missCount: number = 0;

  /**
   *
   * @param maxSize
   * @example
   */
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached pathfinding result
   *
   * @param key Cache key
   * @returns Cached result or null
   * @example
   */
  getPath(key: string): ThetaStarResult | null {
    const result = this.pathCache.get(key);
    if (result) {
      this.hitCount++;
      return result;
    }
    this.missCount++;
    return null;
  }

  /**
   * Store pathfinding result in cache
   *
   * @param key Cache key
   * @param result Pathfinding result
   * @example
   */
  setPath(key: string, result: ThetaStarResult): void {
    if (this.pathCache.size >= this.maxSize) {
      this.evictOldestPath();
    }
    this.pathCache.set(key, result);
  }

  /**
   * Get cached line of sight result
   *
   * @param key Cache key
   * @returns Cached result or null
   * @example
   */
  getLineOfSight(key: string): boolean | null {
    const result = this.lineOfSightCache.get(key);
    if (result !== undefined) {
      this.hitCount++;
      return result;
    }
    this.missCount++;
    return null;
  }

  /**
   * Store line of sight result in cache
   *
   * @param key Cache key
   * @param result Line of sight result
   * @example
   */
  setLineOfSight(key: string, result: boolean): void {
    this.lineOfSightCache.set(key, result);
  }

  /**
   * Clear all cached results
   * @example
   */
  clear(): void {
    this.pathCache.clear();
    this.lineOfSightCache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   * @example
   */
  getStats(): {
    pathCacheSize: number;
    lineOfSightCacheSize: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
  } {
    const totalRequests = this.hitCount + this.missCount;
    return {
      pathCacheSize: this.pathCache.size,
      lineOfSightCacheSize: this.lineOfSightCache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
    };
  }

  /**
   * Evict oldest path from cache
   * @example
   */
  private evictOldestPath(): void {
    const firstKey = this.pathCache.keys().next().value;
    if (firstKey) {
      this.pathCache.delete(firstKey);
    }
  }
}

/**
 * Generate cache key for pathfinding parameters
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param start Starting point
 * @param goal Goal point
 * @param options Pathfinding options
 * @param config Theta* configuration
 * @returns Cache key string
 * @example
 */
export function generatePathCacheKey(
  grid: CellType[],
  width: number,
  height: number,
  start: Point,
  goal: Point,
  options: ThetaStarOptions,
  config: ThetaStarConfig
): string {
  const gridHash = hashGrid(grid);
  const startKey = pointToKey(start);
  const goalKey = pointToKey(goal);
  const optionsHash = hashOptions(options);
  const configHash = hashConfig(config);

  return `${width}x${height}_${gridHash}_${startKey}_${goalKey}_${optionsHash}_${configHash}`;
}

/**
 * Generate cache key for line of sight check
 *
 * @param from Source point
 * @param to Destination point
 * @returns Cache key string
 * @example
 */
export function generateLineOfSightCacheKey(from: Point, to: Point): string {
  return `${pointToKey(from)}-${pointToKey(to)}`;
}

/**
 * Hash grid for cache key generation
 *
 * @param grid Grid of cell types
 * @returns Grid hash string
 * @example
 */
function hashGrid(grid: CellType[]): string {
  // Simple hash based on grid content
  let hash = 0;
  for (let i = 0; i < grid.length; i++) {
    hash = ((hash << 5) - hash + grid[i]) & 0xffffffff;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Hash options for cache key generation
 *
 * @param options Pathfinding options
 * @returns Options hash string
 * @example
 */
function hashOptions(options: ThetaStarOptions): string {
  const relevantOptions = {
    useEuclideanDistance: options.useEuclideanDistance,
    useTieBreaking: options.useTieBreaking,
    useLazyEvaluation: options.useLazyEvaluation,
    useGoalBounding: options.useGoalBounding,
    maxIterations: options.maxIterations,
  };

  return JSON.stringify(relevantOptions);
}

/**
 * Hash configuration for cache key generation
 *
 * @param config Theta* configuration
 * @returns Configuration hash string
 * @example
 */
function hashConfig(config: ThetaStarConfig): string {
  const relevantConfig = {
    allowDiagonal: config.allowDiagonal,
    diagonalOnlyWhenClear: config.diagonalOnlyWhenClear,
    useTieBreaking: config.useTieBreaking,
    useLazyEvaluation: config.useLazyEvaluation,
    useGoalBounding: config.useGoalBounding,
  };

  return JSON.stringify(relevantConfig);
}

/**
 * Convert point to string key
 *
 * @param point Point to convert
 * @returns String key
 * @example
 */
function pointToKey(point: Point): string {
  return `${point.x},${point.y}`;
}

/**
 * Check if cache key exists
 *
 * @param cache Cache instance
 * @param key Cache key
 * @returns True if key exists
 * @example
 */
export function hasPathCacheKey(cache: ThetaStarCache, key: string): boolean {
  return cache.getPath(key) !== null;
}

/**
 * Check if line of sight cache key exists
 *
 * @param cache Cache instance
 * @param key Cache key
 * @returns True if key exists
 * @example
 */
export function hasLineOfSightCacheKey(cache: ThetaStarCache, key: string): boolean {
  return cache.getLineOfSight(key) !== null;
}

/**
 * Get cache size
 *
 * @param cache Cache instance
 * @returns Current cache size
 * @example
 */
export function getCacheSize(cache: ThetaStarCache): number {
  const stats = cache.getStats();
  return stats.pathCacheSize + stats.lineOfSightCacheSize;
}

/**
 * Check if cache is full
 *
 * @param cache Cache instance
 * @returns True if cache is full
 * @example
 */
export function isCacheFull(cache: ThetaStarCache): boolean {
  const stats = cache.getStats();
  return stats.pathCacheSize >= cache["maxSize"];
}

/**
 * Get cache hit rate
 *
 * @param cache Cache instance
 * @returns Hit rate as percentage
 * @example
 */
export function getCacheHitRate(cache: ThetaStarCache): number {
  return cache.getStats().hitRate * 100;
}

/**
 * Optimize cache by removing least recently used entries
 *
 * @param cache Cache instance
 * @param targetSize Target cache size
 * @example
 */
export function optimizeCache(cache: ThetaStarCache, targetSize: number): void {
  const stats = cache.getStats();
  if (stats.pathCacheSize > targetSize) {
    const entriesToRemove = stats.pathCacheSize - targetSize;
    for (let i = 0; i < entriesToRemove; i++) {
      // Remove first entry (oldest)
      const firstKey = cache["pathCache"].keys().next().value;
      if (firstKey) {
        cache["pathCache"].delete(firstKey);
      }
    }
  }
}

/**
 * Create cache key from pathfinding parameters
 *
 * @param params Pathfinding parameters
 * @param params.grid
 * @param params.width
 * @param params.height
 * @param params.start
 * @param params.goal
 * @param params.options
 * @param params.config
 * @returns Cache key
 * @example
 */
export function createPathCacheKey(params: {
  grid: CellType[];
  width: number;
  height: number;
  start: Point;
  goal: Point;
  options: ThetaStarOptions;
  config: ThetaStarConfig;
}): string {
  return generatePathCacheKey(
    params.grid,
    params.width,
    params.height,
    params.start,
    params.goal,
    params.options,
    params.config
  );
}

/**
 * Create line of sight cache key
 *
 * @param from Source point
 * @param to Destination point
 * @returns Cache key
 * @example
 */
export function createLineOfSightCacheKey(from: Point, to: Point): string {
  return generateLineOfSightCacheKey(from, to);
}

/**
 * Validate cache key format
 *
 * @param key Cache key to validate
 * @returns True if key format is valid
 * @example
 */
export function validateCacheKey(key: string): boolean {
  // Basic validation for cache key format
  return typeof key === "string" && key.length > 0 && key.includes("_");
}

/**
 * Extract dimensions from cache key
 *
 * @param key Cache key
 * @returns Dimensions object or null if invalid
 * @example
 */
export function extractDimensionsFromKey(key: string): { width: number; height: number } | null {
  const match = key.match(/^(\d+)x(\d+)_/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  return null;
}
