/**
 * Core Spatial Hashing Algorithm Implementation
 *
 * @file Core class and public API for the spatial hash
 * @module algorithms/spatialHashCore
 */
import { QueryResult, SpatialHashConfig, SpatialHashStats, SpatialObject } from "./spatial-hash-types";
import type { SpatialDataType } from "../../../core/types/spatial-types";
/**
 * SpatialHash provides efficient spatial partitioning for 2D objects.
 */
export declare class SpatialHash<T extends SpatialDataType = SpatialDataType> {
    private cells;
    private objectToCells;
    private config;
    private stats;
    private lastCleanup;
    private _isResizing;
    /**
     * Create a SpatialHash instance.
     *
     * @param config Partial configuration overriding defaults
     * @example
     */
    constructor(config?: Partial<SpatialHashConfig>);
    /**
     * Insert an object into the spatial hash.
     *
     * @param object The spatial object to insert
     * @example
     */
    insert(object: SpatialObject & {
        data: T;
    }): void;
    /**
     * Remove an object from the spatial hash.
     *
     * @param objectId Unique object identifier
     * @returns True when object was removed, false if not found
     * @example
     */
    remove(objectId: string | number): boolean;
    /**
     * Update an object's position in the spatial hash.
     *
     * @param object The updated object
     * @returns True when object existed and was updated
     * @example
     */
    update(object: SpatialObject & {
        data: T;
    }): boolean;
    /**
     * Query for objects in a rectangular area.
     *
     * @param x Rectangle left coordinate
     * @param y Rectangle top coordinate
     * @param width Rectangle width
     * @param height Rectangle height
     * @returns Array of objects intersecting the rectangle
     * @example
     */
    queryRect(x: number, y: number, width: number, height: number): Array<SpatialObject & {
        data: T;
    }>;
    /**
     * Query for objects within a radius of a point.
     *
     * @param centerX Query center x
     * @param centerY Query center y
     * @param radius Query radius
     * @returns Array of objects with distances and cell keys, sorted nearest first
     * @example
     */
    queryRadius(centerX: number, centerY: number, radius: number): Array<QueryResult<T>>;
    /**
     * Find the nearest object to a point.
     *
     * @param x Query x
     * @param y Query y
     * @param maxDistance Optional maximum search radius
     * @returns Nearest query result or null if none found
     * @example
     */
    findNearest(x: number, y: number, maxDistance?: number): QueryResult<T> | null;
    /**
     * Get all objects currently stored in the hash.
     *
     * @returns Array of unique objects
     * @example
     */
    getAllObjects(): Array<SpatialObject & {
        data: T;
    }>;
    /**
     * Clear all objects and statistics.
     * @example
     */
    clear(): void;
    /**
     * Gather statistics about the current hash state.
     *
     * @returns Snapshot statistics
     * @example
     */
    getStats(): SpatialHashStats;
    /**
     * Resize the spatial hash with a new cell size.
     *
     * @param newCellSize New cell size in world units
     * @example
     */
    resize(newCellSize: number): void;
    /**
     * Evaluate auto-resize conditions.
     * @example
     */
    private checkAutoResize;
    /**
     * Run periodic cleanup based on configured interval.
     * @example
     */
    private checkCleanup;
    /**
     * Remove empty cells to keep memory usage low.
     * @example
     */
    private cleanup;
}
//# sourceMappingURL=spatial-hash-core.d.ts.map