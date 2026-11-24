/**
 * SAT Cache Management
 *
 * Caching utilities for the Separating Axis Theorem collision detection.
 * Handles result caching, axis caching, and cache management.
 *
 * @module algorithms/geometry/collision/sat
 */

import type { ConvexPolygon, ProjectionAxis, SATCollisionResult, SATCacheEntry } from "./sat-types";

/**
 * Cache manager for SAT collision results and axes
 */
export class SATCache {
  private resultCache: Map<string, SATCacheEntry>;
  private axisCache: Map<string, ProjectionAxis[]>;
  private maxCacheSize: number;

  /**
   * Creates empty result and axis caches with an upper bound on stored entries.
   *
   * @param maxCacheSize Maximum number of entries kept before least-recently-used eviction.
   */
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
   * @example
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
   * @example
   */
  setResult(cacheKey: string, polygon1: ConvexPolygon, polygon2: ConvexPolygon, result: SATCollisionResult): void {
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
   * @example
   */
  getAxes(cacheKey: string): ProjectionAxis[] | null {
    return this.axisCache.get(cacheKey) || null;
  }

  /**
   * Cache axes
   *
   * @param cacheKey Cache key
   * @param axes Axes to cache
   * @example
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
   * @example
   */
  getCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string {
    // A caller-supplied `id` is not a geometry identity: two unrelated
    // polygons both named "a" used to share one cache entry and the second
    // test received the first one's collision result. Always include the
    // vertex geometry, even when ids are present.
    const id1 = `${polygon1.id ?? ""}:${this.getPolygonHash(polygon1)}`;
    const id2 = `${polygon2.id ?? ""}:${this.getPolygonHash(polygon2)}`;
    return `${id1}-${id2}`;
  }

  /**
   * Generate cache key for axes
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Axis cache key
   * @example
   */
  getAxisCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string {
    return `axes-${this.getCacheKey(polygon1, polygon2)}`;
  }

  /**
   * Generate hash for polygon (simple hash based on vertex count and center)
   *
   * @param polygon The polygon
   * @returns Hash string
   * @example
   */
  private getPolygonHash(polygon: ConvexPolygon): string {
    // Center plus vertex count is not enough: differently sized squares share
    // a center and would alias. Hash every vertex.
    return polygon.vertices.map(vertex => `${vertex.x},${vertex.y}`).join(";");
  }

  /**
   * Evict least recently used cache entry
   * @example
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
   * @example
   */
  clear(): void {
    this.resultCache.clear();
    this.axisCache.clear();
  }

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
   * @example
   */
  hasResult(cacheKey: string): boolean {
    return this.resultCache.has(cacheKey);
  }

  /**
   * Check if cache has axes
   *
   * @param cacheKey Cache key
   * @returns True if axes exist in cache
   * @example
   */
  hasAxes(cacheKey: string): boolean {
    return this.axisCache.has(cacheKey);
  }

  /**
   * Remove specific result from cache
   *
   * @param cacheKey Cache key
   * @returns True if result was removed
   * @example
   */
  removeResult(cacheKey: string): boolean {
    return this.resultCache.delete(cacheKey);
  }

  /**
   * Remove specific axes from cache
   *
   * @param cacheKey Cache key
   * @returns True if axes were removed
   * @example
   */
  removeAxes(cacheKey: string): boolean {
    return this.axisCache.delete(cacheKey);
  }
}
