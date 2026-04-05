/**
 * Theta* Cache Operations
 *
 * Handles caching and optimization for Theta* pathfinding
 * to improve performance and reduce redundant calculations.
 *
 * @module algorithms/pathfinding/theta-star
 */
import type { CellType, Point, ThetaStarConfig, ThetaStarOptions, ThetaStarResult } from "./theta-star-types";
/**
 * Cache manager for Theta* pathfinding results
 */
export declare class ThetaStarCache {
    private pathCache;
    private lineOfSightCache;
    private maxSize;
    private hitCount;
    private missCount;
    /**
     *
     * @param maxSize
     * @example
     */
    constructor(maxSize?: number);
    /**
     * Get cached pathfinding result
     *
     * @param key Cache key
     * @returns Cached result or null
     * @example
     */
    getPath(key: string): ThetaStarResult | null;
    /**
     * Store pathfinding result in cache
     *
     * @param key Cache key
     * @param result Pathfinding result
     * @example
     */
    setPath(key: string, result: ThetaStarResult): void;
    /**
     * Get cached line of sight result
     *
     * @param key Cache key
     * @returns Cached result or null
     * @example
     */
    getLineOfSight(key: string): boolean | null;
    /**
     * Store line of sight result in cache
     *
     * @param key Cache key
     * @param result Line of sight result
     * @example
     */
    setLineOfSight(key: string, result: boolean): void;
    /**
     * Clear all cached results
     * @example
     */
    clear(): void;
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
    };
    /**
     * Evict oldest path from cache
     * @example
     */
    private evictOldestPath;
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
export declare function generatePathCacheKey(grid: CellType[], width: number, height: number, start: Point, goal: Point, options: ThetaStarOptions, config: ThetaStarConfig): string;
/**
 * Generate cache key for line of sight check
 *
 * @param from Source point
 * @param to Destination point
 * @returns Cache key string
 * @example
 */
export declare function generateLineOfSightCacheKey(from: Point, to: Point): string;
/**
 * Check if cache key exists
 *
 * @param cache Cache instance
 * @param key Cache key
 * @returns True if key exists
 * @example
 */
export declare function hasPathCacheKey(cache: ThetaStarCache, key: string): boolean;
/**
 * Check if line of sight cache key exists
 *
 * @param cache Cache instance
 * @param key Cache key
 * @returns True if key exists
 * @example
 */
export declare function hasLineOfSightCacheKey(cache: ThetaStarCache, key: string): boolean;
/**
 * Get cache size
 *
 * @param cache Cache instance
 * @returns Current cache size
 * @example
 */
export declare function getCacheSize(cache: ThetaStarCache): number;
/**
 * Check if cache is full
 *
 * @param cache Cache instance
 * @returns True if cache is full
 * @example
 */
export declare function isCacheFull(cache: ThetaStarCache): boolean;
/**
 * Get cache hit rate
 *
 * @param cache Cache instance
 * @returns Hit rate as percentage
 * @example
 */
export declare function getCacheHitRate(cache: ThetaStarCache): number;
/**
 * Optimize cache by removing least recently used entries
 *
 * @param cache Cache instance
 * @param targetSize Target cache size
 * @example
 */
export declare function optimizeCache(cache: ThetaStarCache, targetSize: number): void;
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
export declare function createPathCacheKey(params: {
    grid: CellType[];
    width: number;
    height: number;
    start: Point;
    goal: Point;
    options: ThetaStarOptions;
    config: ThetaStarConfig;
}): string;
/**
 * Create line of sight cache key
 *
 * @param from Source point
 * @param to Destination point
 * @returns Cache key
 * @example
 */
export declare function createLineOfSightCacheKey(from: Point, to: Point): string;
/**
 * Validate cache key format
 *
 * @param key Cache key to validate
 * @returns True if key format is valid
 * @example
 */
export declare function validateCacheKey(key: string): boolean;
/**
 * Extract dimensions from cache key
 *
 * @param key Cache key
 * @returns Dimensions object or null if invalid
 * @example
 */
export declare function extractDimensionsFromKey(key: string): {
    width: number;
    height: number;
} | null;
//# sourceMappingURL=theta-star-cache.d.ts.map