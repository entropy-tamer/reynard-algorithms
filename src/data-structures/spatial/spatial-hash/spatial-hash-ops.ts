/**
 * Operational helpers for SpatialHash methods
 *
 * @file Logic extracted from SpatialHash methods to keep the class concise
 * @module algorithms/spatialHashOps
 */

import type { SpatialHashConfig, SpatialHashStats, SpatialObject, QueryResult } from "./spatial-hash-types";
import type { SpatialDataType } from "../../../core/types/spatial-types";
import { estimateMemoryUsage } from "./spatial-hash-utils";
import { getRectCells, getRadiusCells, isObjectInRect, getDistance } from "./spatial-hash-geometry";

export interface SpatialHashState<T extends SpatialDataType> {
  cells: Map<string, Array<SpatialObject<T>>>;
  objectToCells: Map<string | number, Set<string>>;
  config: SpatialHashConfig;
  stats: { queryCount: number; insertCount: number; removeCount: number };
}

/**
 *
 * @param state
 * @param object
 * @example
 */
export function insertImpl<T extends SpatialDataType>(
  state: SpatialHashState<T>,
  object: SpatialObject & { data: T }
): void {
  const width = object.width || 0;
  const height = object.height || 0;
  const cellKeys = getRectCells(state.config.cellSize, object.x, object.y, width, height);

  for (const cellKey of Array.from(cellKeys)) {
    if (!state.cells.has(cellKey)) state.cells.set(cellKey, []);
    state.cells.get(cellKey)!.push(object);
  }
  state.objectToCells.set(object.id, cellKeys);
  state.stats.insertCount++;
}

/**
 *
 * @param state
 * @param objectId
 * @example
 */
export function removeImpl<T extends SpatialDataType>(state: SpatialHashState<T>, objectId: string | number): boolean {
  const cellKeys = state.objectToCells.get(objectId);
  if (!cellKeys) return false;
  for (const cellKey of Array.from(cellKeys)) {
    const cell = state.cells.get(cellKey);
    if (!cell) continue;
    const index = cell.findIndex(obj => obj.id === objectId);
    if (index !== -1) {
      cell.splice(index, 1);
      if (cell.length === 0) state.cells.delete(cellKey);
    }
  }
  state.objectToCells.delete(objectId);
  state.stats.removeCount++;
  return true;
}

/**
 *
 * @param state
 * @param x
 * @param y
 * @param width
 * @param height
 * @example
 */
export function queryRectImpl<T extends SpatialDataType>(
  state: SpatialHashState<T>,
  x: number,
  y: number,
  width: number,
  height: number
): Array<SpatialObject & { data: T }> {
  const cellKeys = getRectCells(state.config.cellSize, x, y, width, height);
  const results = new Map<string | number, SpatialObject & { data: T }>();

  for (const cellKey of Array.from(cellKeys)) {
    const cell = state.cells.get(cellKey);
    if (!cell) continue;
    for (const obj of cell) {
      if (isObjectInRect(obj, x, y, width, height) && obj.data !== undefined) {
        results.set(obj.id, obj as SpatialObject & { data: T });
      }
    }
  }

  state.stats.queryCount++;
  return Array.from(results.values());
}

/**
 *
 * @param state
 * @param centerX
 * @param centerY
 * @param radius
 * @example
 */
export function queryRadiusImpl<T extends SpatialDataType>(
  state: SpatialHashState<T>,
  centerX: number,
  centerY: number,
  radius: number
): Array<QueryResult<T>> {
  const cellKeys = getRadiusCells(state.config.cellSize, centerX, centerY, radius);
  const results: Array<QueryResult<T>> = [];

  for (const cellKey of Array.from(cellKeys)) {
    const cell = state.cells.get(cellKey);
    if (!cell) continue;
    for (const obj of cell) {
      const distance = getDistance(centerX, centerY, obj.x, obj.y);
      if (distance <= radius) {
        results.push({ object: obj, distance, cellKey });
      }
    }
  }

  state.stats.queryCount++;
  return results.sort((a, b) => a.distance - b.distance);
}

/**
 *
 * @param state
 * @param x
 * @param y
 * @param maxDistance
 * @example
 */
export function findNearestImpl<T extends SpatialDataType>(
  state: SpatialHashState<T>,
  x: number,
  y: number,
  maxDistance?: number
): QueryResult<T> | null {
  const radius = maxDistance || state.config.cellSize * 2;
  const results = queryRadiusImpl(state, x, y, radius);
  if (results.length === 0) return queryRadiusImpl(state, x, y, radius * 2)[0] || null;
  return results[0];
}

/**
 *
 * @param state
 * @example
 */
export function getAllObjectsImpl<T extends SpatialDataType>(
  state: SpatialHashState<T>
): Array<SpatialObject & { data: T }> {
  const objects = new Map<string | number, SpatialObject & { data: T }>();
  for (const cell of Array.from(state.cells.values())) {
    for (const obj of cell) {
      if (obj.data !== undefined) {
        objects.set(obj.id, obj as SpatialObject & { data: T });
      }
    }
  }
  return Array.from(objects.values());
}

/**
 *
 * @param state
 * @example
 */
export function getStatsImpl<T extends SpatialDataType>(state: SpatialHashState<T>): SpatialHashStats {
  let totalObjects = 0;
  let maxObjectsInCell = 0;

  for (const cell of Array.from(state.cells.values())) {
    totalObjects += cell.length;
    maxObjectsInCell = Math.max(maxObjectsInCell, cell.length);
  }

  const emptyCells =
    state.cells.size === 0 ? 0 : Array.from(state.cells.values()).filter(cell => cell.length === 0).length;

  return {
    totalCells: state.cells.size,
    totalObjects,
    averageObjectsPerCell: state.cells.size > 0 ? totalObjects / state.cells.size : 0,
    maxObjectsInCell,
    emptyCells,
    memoryUsage: estimateMemoryUsage(state.cells.size, totalObjects, state.objectToCells.size),
    queryCount: state.stats.queryCount,
    insertCount: state.stats.insertCount,
    removeCount: state.stats.removeCount,
  };
}

/**
 *
 * @param state
 * @example
 */
export function cleanupEmptyCells<T extends SpatialDataType>(state: SpatialHashState<T>): void {
  for (const [cellKey, cell] of Array.from(state.cells.entries())) {
    if (cell.length === 0) state.cells.delete(cellKey);
  }
}

/**
 * Reindex all objects after a cell size change.
 * @param oldCells
 * @param oldObjectToCells
 * @param insert
 * @example
 */
export function resizeReindexImpl<T extends SpatialDataType>(
  oldCells: Map<string, Array<SpatialObject<T>>>,
  oldObjectToCells: Map<string | number, Set<string>>,
  insert: (obj: SpatialObject<T> & { data: T }) => void
): void {
  for (const [objectId, cellKeys] of Array.from(oldObjectToCells.entries())) {
    const firstCellKey = Array.from(cellKeys)[0];
    const object = oldCells.get(firstCellKey)?.find((obj: SpatialObject<T>) => obj.id === objectId);
    if (object && object.data !== undefined) insert(object as SpatialObject<T> & { data: T });
  }
}
