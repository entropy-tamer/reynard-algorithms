/**
 * SAT Cache Management
 *
 * Caching utilities for the Separating Axis Theorem collision detection.
 * Handles result caching, axis caching, and cache management.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { ConvexPolygon, ProjectionAxis, SATCollisionResult } from "./sat-types";
/**
 * Cache manager for SAT collision results and axes
 */
export declare class SATCache {
    private resultCache;
    private axisCache;
    private maxCacheSize;
    /**
     *
     * @param maxCacheSize
     * @example
     */
    constructor(maxCacheSize?: number);
    /**
     * Get cached collision result
     *
     * @param cacheKey Cache key
     * @returns Cached result or null if not found
     * @example
     */
    getResult(cacheKey: string): SATCollisionResult | null;
    /**
     * Cache collision result
     *
     * @param cacheKey Cache key
     * @param polygon1 First polygon
     * @param polygon2 Second polygon
     * @param result Collision result
     * @example
     */
    setResult(cacheKey: string, polygon1: ConvexPolygon, polygon2: ConvexPolygon, result: SATCollisionResult): void;
    /**
     * Get cached axes
     *
     * @param cacheKey Cache key
     * @returns Cached axes or null if not found
     * @example
     */
    getAxes(cacheKey: string): ProjectionAxis[] | null;
    /**
     * Cache axes
     *
     * @param cacheKey Cache key
     * @param axes Axes to cache
     * @example
     */
    setAxes(cacheKey: string, axes: ProjectionAxis[]): void;
    /**
     * Generate cache key for two polygons
     *
     * @param polygon1 First polygon
     * @param polygon2 Second polygon
     * @returns Cache key
     * @example
     */
    getCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string;
    /**
     * Generate cache key for axes
     *
     * @param polygon1 First polygon
     * @param polygon2 Second polygon
     * @returns Axis cache key
     * @example
     */
    getAxisCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string;
    /**
     * Generate hash for polygon (simple hash based on vertex count and center)
     *
     * @param polygon The polygon
     * @returns Hash string
     * @example
     */
    private getPolygonHash;
    /**
     * Evict least recently used cache entry
     * @example
     */
    private evictLeastRecentlyUsed;
    /**
     * Clear all caches
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
        resultCacheSize: number;
        axisCacheSize: number;
        totalSize: number;
        maxSize: number;
    };
    /**
     * Check if cache has a result
     *
     * @param cacheKey Cache key
     * @returns True if result exists in cache
     * @example
     */
    hasResult(cacheKey: string): boolean;
    /**
     * Check if cache has axes
     *
     * @param cacheKey Cache key
     * @returns True if axes exist in cache
     * @example
     */
    hasAxes(cacheKey: string): boolean;
    /**
     * Remove specific result from cache
     *
     * @param cacheKey Cache key
     * @returns True if result was removed
     * @example
     */
    removeResult(cacheKey: string): boolean;
    /**
     * Remove specific axes from cache
     *
     * @param cacheKey Cache key
     * @returns True if axes were removed
     * @example
     */
    removeAxes(cacheKey: string): boolean;
}
//# sourceMappingURL=sat-cache.d.ts.map