/**
 * Operational helpers for SpatialHash methods
 *
 * @file Logic extracted from SpatialHash methods to keep the class concise
 * @module algorithms/spatialHashOps
 */
import type { SpatialHashConfig, SpatialHashStats, SpatialObject, QueryResult } from "./spatial-hash-types";
import type { SpatialDataType } from "../../../core/types/spatial-types";
export interface SpatialHashState<T extends SpatialDataType> {
    cells: Map<string, Array<SpatialObject<T>>>;
    objectToCells: Map<string | number, Set<string>>;
    config: SpatialHashConfig;
    stats: {
        queryCount: number;
        insertCount: number;
        removeCount: number;
    };
}
/**
 *
 * @param state
 * @param object
 * @example
 */
export declare function insertImpl<T extends SpatialDataType>(state: SpatialHashState<T>, object: SpatialObject & {
    data: T;
}): void;
/**
 *
 * @param state
 * @param objectId
 * @example
 */
export declare function removeImpl<T extends SpatialDataType>(state: SpatialHashState<T>, objectId: string | number): boolean;
/**
 *
 * @param state
 * @param x
 * @param y
 * @param width
 * @param height
 * @example
 */
export declare function queryRectImpl<T extends SpatialDataType>(state: SpatialHashState<T>, x: number, y: number, width: number, height: number): Array<SpatialObject & {
    data: T;
}>;
/**
 *
 * @param state
 * @param centerX
 * @param centerY
 * @param radius
 * @example
 */
export declare function queryRadiusImpl<T extends SpatialDataType>(state: SpatialHashState<T>, centerX: number, centerY: number, radius: number): Array<QueryResult<T>>;
/**
 *
 * @param state
 * @param x
 * @param y
 * @param maxDistance
 * @example
 */
export declare function findNearestImpl<T extends SpatialDataType>(state: SpatialHashState<T>, x: number, y: number, maxDistance?: number): QueryResult<T> | null;
/**
 *
 * @param state
 * @example
 */
export declare function getAllObjectsImpl<T extends SpatialDataType>(state: SpatialHashState<T>): Array<SpatialObject & {
    data: T;
}>;
/**
 *
 * @param state
 * @example
 */
export declare function getStatsImpl<T extends SpatialDataType>(state: SpatialHashState<T>): SpatialHashStats;
/**
 *
 * @param state
 * @example
 */
export declare function cleanupEmptyCells<T extends SpatialDataType>(state: SpatialHashState<T>): void;
/**
 * Reindex all objects after a cell size change.
 * @param oldCells
 * @param oldObjectToCells
 * @param insert
 * @example
 */
export declare function resizeReindexImpl<T extends SpatialDataType>(oldCells: Map<string, Array<SpatialObject<T>>>, oldObjectToCells: Map<string | number, Set<string>>, insert: (obj: SpatialObject<T> & {
    data: T;
}) => void): void;
//# sourceMappingURL=spatial-hash-ops.d.ts.map