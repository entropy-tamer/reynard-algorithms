/**
 * Flow Field Cache Operations
 *
 * Handles caching and optimization for flow field generation
 * to improve performance and reduce redundant calculations.
 *
 * @module algorithms/pathfinding/flow-field
 */

import type { Point, CellType, FlowFieldResult, FlowFieldOptions, FlowFieldConfig } from "./flow-field-types";

/**
 * Cache manager for flow field results
 */
export class FlowFieldCache {
  private cache: Map<string, FlowFieldResult> = new Map();
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
   * Get cached flow field result
   *
   * @param key Cache key
   * @returns Cached result or null
   * @example
   */
  get(key: string): FlowFieldResult | null {
    const result = this.cache.get(key);
    if (result) {
      this.hitCount++;
      return result;
    }
    this.missCount++;
    return null;
  }

  /**
   * Store flow field result in cache
   *
   * @param key Cache key
   * @param result Flow field result
   * @example
   */
  set(key: string, result: FlowFieldResult): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    this.cache.set(key, result);
  }

  /**
   * Clear all cached results
   * @example
   */
  clear(): void {
    this.cache.clear();
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
    size: number;
    maxSize: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
  } {
    const totalRequests = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
    };
  }

  /**
   * Evict oldest entry from cache
   * @example
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }
}

/**
 * Generate cache key for flow field parameters
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param goals Array of goal points
 * @param options Flow field options
 * @param config Flow field configuration
 * @returns Cache key string
 * @example
 */
export function generateCacheKey(
  grid: CellType[],
  width: number,
  height: number,
  goals: Point[],
  options: FlowFieldOptions,
  config: FlowFieldConfig
): string {
  const gridHash = hashGrid(grid);
  const goalsHash = hashGoals(goals);
  const optionsHash = hashOptions(options);
  const configHash = hashConfig(config);

  return `${width}x${height}_${gridHash}_${goalsHash}_${optionsHash}_${configHash}`;
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
 * Hash goals for cache key generation
 *
 * @param goals Array of goal points
 * @returns Goals hash string
 * @example
 */
function hashGoals(goals: Point[]): string {
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });

  return sortedGoals.map(goal => `${goal.x},${goal.y}`).join("|");
}

/**
 * Hash options for cache key generation
 *
 * @param options Flow field options
 * @returns Options hash string
 * @example
 */
function hashOptions(options: FlowFieldOptions): string {
  const relevantOptions = {
    returnIntegrationField: options.returnIntegrationField,
    returnFlowField: options.returnFlowField,
    normalizeFlowVectors: options.normalizeFlowVectors,
    useEarlyTermination: options.useEarlyTermination,
    useGoalBounding: options.useGoalBounding,
    useMultiGoal: options.useMultiGoal,
  };

  return JSON.stringify(relevantOptions);
}

/**
 * Hash configuration for cache key generation
 *
 * @param config Flow field configuration
 * @returns Configuration hash string
 * @example
 */
function hashConfig(config: FlowFieldConfig): string {
  const relevantConfig = {
    allowDiagonal: config.allowDiagonal,
    diagonalOnlyWhenClear: config.diagonalOnlyWhenClear,
    cardinalCost: config.cardinalCost,
    diagonalCost: config.diagonalCost,
    useManhattanDistance: config.useManhattanDistance,
    useEuclideanDistance: config.useEuclideanDistance,
  };

  return JSON.stringify(relevantConfig);
}

/**
 * Check if cache key exists
 *
 * @param cache Cache instance
 * @param key Cache key
 * @returns True if key exists
 * @example
 */
export function hasCacheKey(cache: FlowFieldCache, key: string): boolean {
  return cache.get(key) !== null;
}

/**
 * Get cache size
 *
 * @param cache Cache instance
 * @returns Current cache size
 * @example
 */
export function getCacheSize(cache: FlowFieldCache): number {
  return cache.getStats().size;
}

/**
 * Check if cache is full
 *
 * @param cache Cache instance
 * @returns True if cache is full
 * @example
 */
export function isCacheFull(cache: FlowFieldCache): boolean {
  const stats = cache.getStats();
  return stats.size >= stats.maxSize;
}

/**
 * Get cache hit rate
 *
 * @param cache Cache instance
 * @returns Hit rate as percentage
 * @example
 */
export function getCacheHitRate(cache: FlowFieldCache): number {
  return cache.getStats().hitRate * 100;
}

/**
 * Optimize cache by removing least recently used entries
 *
 * @param cache Cache instance
 * @param targetSize Target cache size
 * @example
 */
export function optimizeCache(cache: FlowFieldCache, targetSize: number): void {
  const stats = cache.getStats();
  if (stats.size > targetSize) {
    const entriesToRemove = stats.size - targetSize;
    for (let i = 0; i < entriesToRemove; i++) {
      // Remove first entry (oldest)
      const firstKey = cache["cache"].keys().next().value;
      if (firstKey) {
        cache["cache"].delete(firstKey);
      }
    }
  }
}

/**
 * Create cache key from flow field parameters
 *
 * @param params Flow field parameters
 * @param params.grid
 * @param params.width
 * @param params.height
 * @param params.goals
 * @param params.options
 * @param params.config
 * @returns Cache key
 * @example
 */
export function createCacheKey(params: {
  grid: CellType[];
  width: number;
  height: number;
  goals: Point[];
  options: FlowFieldOptions;
  config: FlowFieldConfig;
}): string {
  return generateCacheKey(params.grid, params.width, params.height, params.goals, params.options, params.config);
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
