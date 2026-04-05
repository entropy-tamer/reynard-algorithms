/**
 * Separating Axis Theorem (SAT) Collision Detection Core Implementation
 *
 * Main SAT class that orchestrates collision detection using modular components.
 * Provides comprehensive collision detection between convex polygons using
 * the SAT algorithm with optimizations including caching, early termination,
 * and bounding circle optimization.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { ConvexPolygon, SATCollisionResult, SATConfig, SATOptions, SATEventHandler, TransformMatrix, SATBatchResult } from "./sat-types";
/**
 * Separating Axis Theorem Collision Detection Implementation
 *
 * Provides comprehensive collision detection between convex polygons using
 * the SAT algorithm with optimizations including caching, early termination,
 * and bounding circle optimization.
 */
export declare class SAT {
    private config;
    private cache;
    private statsManager;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<SATOptions>);
    /**
     * Test collision between two convex polygons using SAT
     *
     * @param polygon1 First polygon
     * @param polygon2 Second polygon
     * @returns Collision detection result
     * @example
     */
    testCollision(polygon1: ConvexPolygon, polygon2: ConvexPolygon): SATCollisionResult;
    /**
     * Test collision between multiple polygon pairs
     *
     * @param polygonPairs Array of polygon pairs to test
     * @returns Batch collision test results
     * @example
     */
    testBatchCollisions(polygonPairs: Array<{
        polygon1: ConvexPolygon;
        polygon2: ConvexPolygon;
    }>): SATBatchResult;
    /**
     * Transform a polygon and test collision
     *
     * @param polygon The polygon to transform
     * @param transform The transformation to apply
     * @param otherPolygon The other polygon to test against
     * @returns Collision detection result
     * @example
     */
    testTransformedCollision(polygon: ConvexPolygon, transform: TransformMatrix, otherPolygon: ConvexPolygon): SATCollisionResult;
    /**
     * Transform a polygon using a transformation matrix
     *
     * @param polygon The polygon to transform
     * @param transform The transformation matrix
     * @returns Transformed polygon
     * @example
     */
    private transformPolygon;
    /**
     * Add event handler
     *
     * @param handler Event handler function
     * @example
     */
    addEventHandler(handler: SATEventHandler): void;
    /**
     * Remove event handler
     *
     * @param handler Event handler function
     * @example
     */
    removeEventHandler(handler: SATEventHandler): void;
    /**
     * Get current statistics
     *
     * @returns Current statistics
     * @example
     */
    getStats(): import("./sat-types").SATStats;
    /**
     * Get performance metrics
     *
     * @returns Performance metrics
     * @example
     */
    getPerformanceMetrics(): {
        cacheSize: number;
        memoryUsage: number;
        cacheHitRate: number;
        averageTestTime: number;
        performanceScore: number;
    };
    /**
     * Clear cache
     * @example
     */
    clearCache(): void;
    /**
     * Reset statistics
     * @example
     */
    resetStats(): void;
    /**
     * Update configuration
     *
     * @param newConfig New configuration options
     * @example
     */
    updateConfig(newConfig: Partial<SATConfig>): void;
    /**
     * Generate hash for polygon (simple hash based on vertex count and center)
     *
     * @param polygon The polygon
     * @returns Hash string
     * @example
     */
    private getPolygonHash;
}
//# sourceMappingURL=sat-core.d.ts.map