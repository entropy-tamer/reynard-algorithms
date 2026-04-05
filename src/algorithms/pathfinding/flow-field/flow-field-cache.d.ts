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
export declare class FlowFieldCache {
    private cache;
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
     * Get cached flow field result
     *
     * @param key Cache key
     * @returns Cached result or null
     * @example
     */
    get(key: string): FlowFieldResult | null;
    /**
     * Store flow field result in cache
     *
     * @param key Cache key
     * @param result Flow field result
     * @example
     */
    set(key: string, result: FlowFieldResult): void;
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
        size: number;
        maxSize: number;
        hitCount: number;
        missCount: number;
        hitRate: number;
    };
    /**
     * Evict oldest entry from cache
     * @example
     */
    private evictOldest;
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
export declare function generateCacheKey(grid: CellType[], width: number, height: number, goals: Point[], options: FlowFieldOptions, config: FlowFieldConfig): string;
/**
 * Check if cache key exists
 *
 * @param cache Cache instance
 * @param key Cache key
 * @returns True if key exists
 * @example
 */
export declare function hasCacheKey(cache: FlowFieldCache, key: string): boolean;
/**
 * Get cache size
 *
 * @param cache Cache instance
 * @returns Current cache size
 * @example
 */
export declare function getCacheSize(cache: FlowFieldCache): number;
/**
 * Check if cache is full
 *
 * @param cache Cache instance
 * @returns True if cache is full
 * @example
 */
export declare function isCacheFull(cache: FlowFieldCache): boolean;
/**
 * Get cache hit rate
 *
 * @param cache Cache instance
 * @returns Hit rate as percentage
 * @example
 */
export declare function getCacheHitRate(cache: FlowFieldCache): number;
/**
 * Optimize cache by removing least recently used entries
 *
 * @param cache Cache instance
 * @param targetSize Target cache size
 * @example
 */
export declare function optimizeCache(cache: FlowFieldCache, targetSize: number): void;
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
export declare function createCacheKey(params: {
    grid: CellType[];
    width: number;
    height: number;
    goals: Point[];
    options: FlowFieldOptions;
    config: FlowFieldConfig;
}): string;
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
//# sourceMappingURL=flow-field-cache.d.ts.map