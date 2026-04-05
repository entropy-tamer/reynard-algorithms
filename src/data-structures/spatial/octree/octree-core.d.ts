/**
 * Octree Data Structure Core Implementation
 *
 * Main Octree class that orchestrates spatial partitioning using modular components.
 * Provides efficient 3D spatial partitioning and querying with voxel operations,
 * ray casting, and frustum culling.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Point3D, Bounds3D, Sphere3D, Ray3D, Frustum3D, OctreeStats, OctreeResult, SpatialQueryResult, RayIntersectionResult, FrustumCullingResult, SpatialQueryOptions, RayIntersectionOptions, FrustumCullingOptions, OctreeOptions, OctreeEventHandler, OctreePerformanceMetrics, BatchOperationResult, VoxelGrid, OctreeSerialization } from "./octree-types";
/**
 * Octree Data Structure Implementation
 *
 * Provides efficient 3D spatial partitioning and querying with
 * voxel operations, ray casting, and frustum culling.
 */
export declare class Octree {
    private root;
    private config;
    private eventHandlers;
    private enableDebug;
    private stats;
    /**
     *
     * @param bounds
     * @param options
     * @example
     */
    constructor(bounds: Bounds3D, options?: Partial<OctreeOptions>);
    /**
     * Insert a point into the octree
     *
     * @param point Point to insert
     * @returns Insertion result
     * @example
     */
    insert(point: Point3D): OctreeResult;
    /**
     * Insert multiple points in batch
     *
     * @param points Points to insert
     * @returns Batch operation result
     * @example
     */
    insertBatch(points: Point3D[]): BatchOperationResult;
    /**
     * Remove a point from the octree
     *
     * @param point Point to remove
     * @param _point
     * @returns Removal result
     * @example
     */
    remove(_point: Point3D): OctreeResult;
    /**
     * Query points within bounds
     *
     * @param bounds Query bounds
     * @param options Query options
     * @returns Query result
     * @example
     */
    queryBounds(bounds: Bounds3D, options?: SpatialQueryOptions): SpatialQueryResult;
    /**
     * Query points within sphere
     *
     * @param sphere Query sphere
     * @param options Query options
     * @returns Query result
     * @example
     */
    querySphere(sphere: Sphere3D, options?: SpatialQueryOptions): SpatialQueryResult;
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
     * Perform frustum culling query
     *
     * @param frustum Frustum to test
     * @param options Culling options
     * @returns Frustum culling result
     * @example
     */
    frustumCulling(frustum: Frustum3D, options?: FrustumCullingOptions): FrustumCullingResult;
    /**
     * Get total number of points
     *
     * @returns Number of points
     * @example
     */
    size(): number;
    /**
     * Check if octree is empty
     *
     * @returns True if empty
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clear all points from octree
     * @example
     */
    clear(): void;
    /**
     * Get current statistics
     *
     * @returns Current statistics
     * @example
     */
    getStats(): OctreeStats;
    /**
     * Get performance metrics
     *
     * @returns Performance metrics
     * @example
     */
    getPerformanceMetrics(): OctreePerformanceMetrics;
    /**
     * Create voxel grid
     *
     * @param voxelSize Size of each voxel
     * @returns Voxel grid
     * @example
     */
    createVoxelGrid(voxelSize: number): VoxelGrid;
    /**
     * Serialize octree to JSON
     *
     * @returns Serialized octree data
     * @example
     */
    serialize(): OctreeSerialization;
    /**
     * Add event handler
     *
     * @param handler Event handler function
     * @example
     */
    addEventHandler(handler: OctreeEventHandler): void;
    /**
     * Remove event handler
     *
     * @param handler Event handler function
     * @example
     */
    removeEventHandler(handler: OctreeEventHandler): void;
    /**
     * Emit event to registered handlers
     *
     * @param type Event type
     * @param data Event data
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=octree-core.d.ts.map