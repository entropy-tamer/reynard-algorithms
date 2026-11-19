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
 * Registers an object in every grid cell its bounds overlap and records the cell list by id.
 *
 * Increases the insert counter; objects spanning multiple cells are stored in each one.
 *
 * @param state Mutable spatial-hash state (cells, id-to-cells map, counters).
 * @param object Spatial object to insert, including its typed data payload.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Removes an object from all cells it occupies and deletes cells that become empty.
 *
 * @param state Mutable spatial-hash state.
 * @param objectId Id of the object to remove.
 * @returns `true` when the object had a cell mapping and was removed, `false` otherwise.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Returns the distinct objects fully contained in a rectangle, drawn from the cells it touches.
 *
 * Results are deduplicated by id and the query counter is increased.
 *
 * @param state Mutable spatial-hash state.
 * @param x Left edge of the query rectangle.
 * @param y Top edge of the query rectangle.
 * @param width Rectangle width.
 * @param height Rectangle height.
 * @returns Unique objects whose bounds lie inside the rectangle.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Collect every object registered in a cell overlapping the given rect, without
 * the containment filter that {@link queryRectImpl} applies.
 *
 * `insertImpl` registers each object in EVERY cell its bounds span, so any two
 * overlapping rects share at least one cell. Querying the cells a rect touches
 * therefore returns a superset of everything that actually overlaps it.
 *
 * Use this for broad-phase culling, where the caller intends to run an exact
 * overlap test on each candidate. `queryRect` is the wrong tool there: it keeps
 * only objects fully CONTAINED in the rect, so a candidate that merely overlaps
 * the query rect by a few pixels is dropped before the exact test ever sees it.
 *
 * @param state
 * @param x
 * @param y
 * @param width
 * @param height
 * @example
 */
export function queryCellsImpl<T extends SpatialDataType>(
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
			if (obj.data !== undefined) {
				results.set(obj.id, obj as SpatialObject & { data: T });
			}
		}
	}

	state.stats.queryCount++;
	return Array.from(results.values());
}

/**
 * Finds objects within `radius` of a point, scanning the covered cells and sorting by distance.
 *
 * Objects at exactly the radius are included; results carry the object, distance, and cell key.
 *
 * @param state Mutable spatial-hash state.
 * @param centerX X coordinate of the query center.
 * @param centerY Y coordinate of the query center.
 * @param radius Search radius.
 * @returns Candidates within the radius, nearest first.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Returns the closest object to a point, expanding the search radius when the first ring is empty.
 *
 * Without `maxDistance`, the initial radius is twice the cell size and doubles once on a miss.
 *
 * @param state Mutable spatial-hash state.
 * @param x X coordinate of the query point.
 * @param y Y coordinate of the query point.
 * @param maxDistance Optional upper bound on the initial search radius.
 * @returns The nearest candidate, or `null` when no object is found.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function findNearestImpl<T extends SpatialDataType>(
  state: SpatialHashState<T>,
  x: number,
  y: number,
  maxDistance?: number
): QueryResult<T> | null {
  const radius = maxDistance || state.config.cellSize * 2;
  const results = queryRadiusImpl(state, x, y, radius);
  if (results.length === 0) {
    const expandedResults = queryRadiusImpl(state, x, y, radius * 2);
    return expandedResults[0] ?? null;
  }
  return results[0] ?? null;
}

/**
 * Collects every distinct object stored across all cells, keyed by object id.
 *
 * @param state Mutable spatial-hash state.
 * @returns All registered objects with a defined data payload.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Computes aggregate cell and object statistics, including a memory estimate and operation counters.
 *
 * @param state Mutable spatial-hash state.
 * @returns Cell counts, occupancy figures, memory usage, and query/insert/remove totals.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Deletes any cell whose object array is empty, leaving populated cells untouched.
 *
 * @param state Mutable spatial-hash state.
 * Complexity: see `catalog-data-structures-spatial-spatial-hash` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
    if (!firstCellKey) continue;
    const object = oldCells.get(firstCellKey)?.find((obj: SpatialObject<T>) => obj.id === objectId);
    if (object && object.data !== undefined) insert(object as SpatialObject<T> & { data: T });
  }
}
