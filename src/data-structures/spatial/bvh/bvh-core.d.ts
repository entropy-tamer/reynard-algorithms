/**
 * BVH (Bounding Volume Hierarchy) Data Structure Core Implementation
 *
 * Main BVH class that orchestrates spatial queries using modular components.
 * Provides efficient ray tracing and spatial queries with SAH-based construction
 * and dynamic refitting capabilities.
 *
 * @module algorithms/spatial-structures/bvh
 */
import type { AABB, Ray3D, Primitive, BVHStats, BVHResult, RayIntersectionResult, AABBIntersectionResult, RayIntersectionOptions, AABBIntersectionOptions, BVHOptions, BVHEventHandler, BVHPerformanceMetrics, BatchOperationResult, BVHSerialization } from "./bvh-types";
/**
 * BVH Data Structure Implementation
 *
 * Provides efficient ray tracing and spatial queries with
 * SAH-based construction and dynamic refitting capabilities.
 */
export declare class BVH {
    private root;
    private config;
    private eventHandlers;
    private enableDebug;
    private stats;
    private primitives;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<BVHOptions>);
    /**
     * Insert a primitive into the BVH
     *
     * @param primitive Primitive to insert
     * @returns Insertion result
     * @example
     */
    insert(primitive: Primitive): BVHResult;
    /**
     * Insert multiple primitives in batch
     *
     * @param primitives Primitives to insert
     * @returns Batch operation result
     * @example
     */
    insertBatch(primitives: Primitive[]): BatchOperationResult;
    /**
     * Remove a primitive from the BVH
     *
     * @param primitiveId ID of primitive to remove
     * @returns Removal result
     * @example
     */
    remove(primitiveId: string | number): BVHResult;
    /**
     * Perform ray intersection query
     *
     * @param ray Ray to test
     * @param options Intersection options
     * @returns Ray intersection result
     * @example
     */
    rayIntersection(ray: Ray3D, options?: RayIntersectionOptions): RayIntersectionResult;
    /**
     * Perform AABB intersection query
     *
     * @param aabb AABB to test
     * @param options Intersection options
     * @returns AABB intersection result
     * @example
     */
    aabbIntersection(aabb: AABB, options?: AABBIntersectionOptions): AABBIntersectionResult;
    /**
     * Get total number of primitives
     *
     * @returns Number of primitives
     * @example
     */
    size(): number;
    /**
     * Check if BVH is empty
     *
     * @returns True if empty
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clear all primitives from BVH
     * @example
     */
    clear(): void;
    /**
     * Rebuild the entire BVH tree
     *
     * @returns Rebuild result
     * @example
     */
    rebuild(): BVHResult;
    /**
     * Get current statistics
     *
     * @returns Current statistics
     * @example
     */
    getStats(): BVHStats;
    /**
     * Get performance metrics
     *
     * @returns Performance metrics
     * @example
     */
    getPerformanceMetrics(): BVHPerformanceMetrics;
    /**
     * Serialize BVH to JSON
     *
     * @returns Serialized BVH data
     * @example
     */
    serialize(): BVHSerialization;
    /**
     * Add event handler
     *
     * @param handler Event handler function
     * @example
     */
    addEventHandler(handler: BVHEventHandler): void;
    /**
     * Remove event handler
     *
     * @param handler Event handler function
     * @example
     */
    removeEventHandler(handler: BVHEventHandler): void;
    /**
     * Check if primitive is valid
     *
     * @param primitive Primitive to validate
     * @returns True if primitive is valid
     * @example
     */
    private isValidPrimitive;
    /**
     * Update statistics
     * @example
     */
    private updateStats;
    /**
     * Emit event to registered handlers
     *
     * @param type Event type
     * @param data Event data
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=bvh-core.d.ts.map