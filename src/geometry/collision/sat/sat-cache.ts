/**
 * SAT Cache Management
 *
 * Caching utilities for the Separating Axis Theorem collision detection.
 * Handles result caching, axis caching, and cache management.
 *
 * @module algorithms/geometry/collision/sat
 */

import type {
  ConvexPolygon,
  ProjectionAxis,
  SATCollisionResult,
  SATCacheEntry,
} from "./sat-types";

/**
 * Cache manager for SAT collision results and axes
 */
export class SATCache {
  private resultCache: Map<string, SATCacheEntry>;
  private axisCache: Map<string, ProjectionAxis[]>;
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 1024) {
    this.resultCache = new Map();
    this.axisCache = new Map();
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Get cached collision result
   *
   * @param cacheKey Cache key
   * @returns Cached result or null if not found
   */
  getResult(cacheKey: string): SATCollisionResult | null {
    const entry = this.resultCache.get(cacheKey);
    if (entry) {
      entry.accessCount++;
      return { ...entry.result };
    }
    return null;
  }

  /**
   * Cache collision result
   *
   * @param cacheKey Cache key
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @param result Collision result
   */
  setResult(
    cacheKey: string,
    polygon1: ConvexPolygon,
    polygon2: ConvexPolygon,
    result: SATCollisionResult
  ): void {
    if (this.resultCache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.resultCache.set(cacheKey, {
      polygon1Id: polygon1.id || this.getPolygonHash(polygon1),
      polygon2Id: polygon2.id || this.getPolygonHash(polygon2),
      result,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Get cached axes
   *
   * @param cacheKey Cache key
   * @returns Cached axes or null if not found
   */
  getAxes(cacheKey: string): ProjectionAxis[] | null {
    return this.axisCache.get(cacheKey) || null;
  }

  /**
   * Cache axes
   *
   * @param cacheKey Cache key
   * @param axes Axes to cache
   */
  setAxes(cacheKey: string, axes: ProjectionAxis[]): void {
    this.axisCache.set(cacheKey, axes);
  }

  /**
   * Generate cache key for two polygons
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Cache key
   */
  getCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string {
    const id1 = polygon1.id || this.getPolygonHash(polygon1);
    const id2 = polygon2.id || this.getPolygonHash(polygon2);
    return `${id1}-${id2}`;
  }

  /**
   * Generate cache key for axes
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Axis cache key
   */
  getAxisCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string {
    const id1 = polygon1.id || this.getPolygonHash(polygon1);
    const id2 = polygon2.id || this.getPolygonHash(polygon2);
    return `axes-${id1}-${id2}`;
  }

  /**
   * Generate hash for polygon (simple hash based on vertex count and center)
   *
   * @param polygon The polygon
   * @returns Hash string
   */
  private getPolygonHash(polygon: ConvexPolygon): string {
    return `${polygon.vertices.length}-${polygon.center.x}-${polygon.center.y}`;
  }

  /**
   * Evict least recently used cache entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.resultCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.resultCache.delete(oldestKey);
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.resultCache.clear();
    this.axisCache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  getStats(): {
    resultCacheSize: number;
    axisCacheSize: number;
    totalSize: number;
    maxSize: number;
  } {
    return {
      resultCacheSize: this.resultCache.size,
      axisCacheSize: this.axisCache.size,
      totalSize: this.resultCache.size + this.axisCache.size,
      maxSize: this.maxCacheSize,
    };
  }

  /**
   * Check if cache has a result
   *
   * @param cacheKey Cache key
   * @returns True if result exists in cache
   */
  hasResult(cacheKey: string): boolean {
    return this.resultCache.has(cacheKey);
  }

  /**
   * Check if cache has axes
   *
   * @param cacheKey Cache key
   * @returns True if axes exist in cache
   */
  hasAxes(cacheKey: string): boolean {
    return this.axisCache.has(cacheKey);
  }

  /**
   * Remove specific result from cache
   *
   * @param cacheKey Cache key
   * @returns True if result was removed
   */
  removeResult(cacheKey: string): boolean {
    return this.resultCache.delete(cacheKey);
  }

  /**
   * Remove specific axes from cache
   *
   * @param cacheKey Cache key
   * @returns True if axes were removed
   */
  removeAxes(cacheKey: string): boolean {
    return this.axisCache.delete(cacheKey);
  }
}

