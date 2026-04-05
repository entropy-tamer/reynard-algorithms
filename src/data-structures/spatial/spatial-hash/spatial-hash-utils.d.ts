/**
 * Utility functions for Spatial Hashing Algorithm
 *
 * @module algorithms/spatialHashUtils
 */
import { SpatialObject } from "./spatial-hash-types";
import { SpatialHash } from "./spatial-hash-core";
import type { SpatialDataType } from "../../../core/types/spatial-types";
/**
 * Utility function to create a spatial hash optimized for a specific use case
 * @param objects
 * @param options
 * @param options.targetCellSize
 * @param options.maxObjectsPerCell
 * @example
 */
export declare function createOptimizedSpatialHash<T extends SpatialDataType = SpatialDataType>(objects: Array<SpatialObject<T>>, options?: {
    targetCellSize?: number;
    maxObjectsPerCell?: number;
}): SpatialHash<T>;
/**
 * Calculate optimal cell size based on object distribution
 * @param objects
 * @example
 */
export declare function calculateOptimalCellSize(objects: Array<SpatialObject>): number;
/**
 * Estimate memory usage for spatial hash data structures
 * @param cellCount
 * @param objectCount
 * @param objectToCellCount
 * @example
 */
export declare function estimateMemoryUsage(cellCount: number, objectCount: number, objectToCellCount: number): number;
//# sourceMappingURL=spatial-hash-utils.d.ts.map