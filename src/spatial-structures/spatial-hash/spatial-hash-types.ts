/**
 * Type definitions for Spatial Hashing Algorithm
 *
 * @module algorithms/spatialHashTypes
 */

import type { SpatialDataType } from "../../types/spatial-types";

export interface SpatialHashConfig {
  cellSize: number;
  maxObjectsPerCell: number;
  enableAutoResize: boolean;
  resizeThreshold: number;
  cleanupInterval: number;
}

export interface SpatialHashStats {
  totalCells: number;
  totalObjects: number;
  averageObjectsPerCell: number;
  maxObjectsInCell: number;
  emptyCells: number;
  memoryUsage: number;
  queryCount: number;
  insertCount: number;
  removeCount: number;
}

export interface SpatialObject<T extends SpatialDataType = SpatialDataType> {
  readonly id: string | number;
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly height?: number;
  readonly data: T;
}

export interface QueryResult<T extends SpatialDataType = SpatialDataType> {
  readonly object: SpatialObject<T>;
  readonly distance: number;
  readonly cellKey: string;
}
