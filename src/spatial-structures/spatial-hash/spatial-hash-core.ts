/**
 * Core Spatial Hashing Algorithm Implementation
 *
 * @file Core class and public API for the spatial hash
 * @module algorithms/spatialHashCore
 */

import { SpatialHashConfig, SpatialHashStats, SpatialObject, QueryResult } from "./spatial-hash-types";
// utils imported indirectly by ops
import type { SpatialDataType } from "../../types/spatial-types";
import { getRectCells } from "./spatial-hash-geometry";
import {
  queryRectImpl,
  queryRadiusImpl,
  findNearestImpl,
  getAllObjectsImpl,
  getStatsImpl,
  cleanupEmptyCells,
  resizeReindexImpl,
  insertImpl,
  removeImpl,
} from "./spatial-hash-ops";
import { checkAutoResizeImpl, checkCleanupImpl } from "./spatial-hash-maintenance";

/**
 * SpatialHash provides efficient spatial partitioning for 2D objects.
 */
export class SpatialHash<T extends SpatialDataType = SpatialDataType> {
  private cells = new Map<string, Array<SpatialObject<T>>>();
  private objectToCells = new Map<string | number, Set<string>>();
  private config: SpatialHashConfig;
  private stats = {
    queryCount: 0,
    insertCount: 0,
    removeCount: 0,
  };
  private lastCleanup = Date.now();

  /**
   * Create a SpatialHash instance.
   *
   * @param config Partial configuration overriding defaults
   */
  constructor(config: Partial<SpatialHashConfig> = {}) {
    this.config = {
      cellSize: 100,
      maxObjectsPerCell: 50,
      enableAutoResize: true,
      resizeThreshold: 0.8,
      cleanupInterval: 60000, // 1 minute
      ...config,
    };
  }

  /**
   * Insert an object into the spatial hash.
   *
   * @param object The spatial object to insert
   */
  insert(object: SpatialObject & { data: T }): void {
    insertImpl<T>({ cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats }, object);
    this.checkAutoResize();
    this.checkCleanup();
  }

  /**
   * Remove an object from the spatial hash.
   *
   * @param objectId Unique object identifier
   * @returns True when object was removed, false if not found
   */
  remove(objectId: string | number): boolean {
    return removeImpl<T>({ cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats }, objectId);
  }

  /**
   * Update an object's position in the spatial hash.
   *
   * @param object The updated object
   * @returns True when object existed and was updated
   */
  update(object: SpatialObject & { data: T }): boolean {
    if (this.remove(object.id)) {
      this.insert(object);
      return true;
    }
    return false;
  }

  /**
   * Query for objects in a rectangular area.
   *
   * @param x Rectangle left coordinate
   * @param y Rectangle top coordinate
   * @param width Rectangle width
   * @param height Rectangle height
   * @returns Array of objects intersecting the rectangle
   */
  queryRect(x: number, y: number, width: number, height: number): Array<SpatialObject & { data: T }> {
    return queryRectImpl<T>(
      { cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats },
      x,
      y,
      width,
      height
    );
  }

  /**
   * Query for objects within a radius of a point.
   *
   * @param centerX Query center x
   * @param centerY Query center y
   * @param radius Query radius
   * @returns Array of objects with distances and cell keys, sorted nearest first
   */
  queryRadius(centerX: number, centerY: number, radius: number): Array<QueryResult<T>> {
    return queryRadiusImpl<T>(
      { cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats },
      centerX,
      centerY,
      radius
    );
  }

  /**
   * Find the nearest object to a point.
   *
   * @param x Query x
   * @param y Query y
   * @param maxDistance Optional maximum search radius
   * @returns Nearest query result or null if none found
   */
  findNearest(x: number, y: number, maxDistance?: number): QueryResult<T> | null {
    return findNearestImpl<T>(
      { cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats },
      x,
      y,
      maxDistance
    );
  }

  /**
   * Get all objects currently stored in the hash.
   *
   * @returns Array of unique objects
   */
  getAllObjects(): Array<SpatialObject & { data: T }> {
    return getAllObjectsImpl<T>({ cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats });
  }

  /**
   * Clear all objects and statistics.
   */
  clear(): void {
    this.cells.clear();
    this.objectToCells.clear();
    this.stats.queryCount = 0;
    this.stats.insertCount = 0;
    this.stats.removeCount = 0;
  }

  /**
   * Gather statistics about the current hash state.
   *
   * @returns Snapshot statistics
   */
  getStats(): SpatialHashStats {
    return getStatsImpl<T>({ cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats });
  }

  /**
   * Resize the spatial hash with a new cell size.
   *
   * @param newCellSize New cell size in world units
   */
  resize(newCellSize: number): void {
    if (newCellSize === this.config.cellSize) return;
    const oldCells = this.cells;
    const oldObjectToCells = this.objectToCells;
    this.config.cellSize = newCellSize;
    this.cells = new Map();
    this.objectToCells = new Map();
    resizeReindexImpl<T>(oldCells, oldObjectToCells, (o) => this.insert(o));
  }

  /**
   * Compute the set of cell keys an object occupies.
   *
   * @param object Spatial object with position and optional size
   * @returns Set of cell keys in "x,y" form
   */
  private getObjectCells(object: SpatialObject): Set<string> {
    const width = object.width || 0;
    const height = object.height || 0;
    return getRectCells(this.config.cellSize, object.x, object.y, width, height);
  }

  /**
   * Evaluate auto-resize conditions.
   */
  private checkAutoResize(): void {
    if (!this.config.enableAutoResize) return;

    checkAutoResizeImpl(this.config, {
      getAverageObjectsPerCell: () => this.getStats().averageObjectsPerCell,
      resize: (s: number) => this.resize(s),
    });
  }

  /**
   * Run periodic cleanup based on configured interval.
   */
  private checkCleanup(): void {
    const now = Date.now();
    this.lastCleanup = checkCleanupImpl(now, this.lastCleanup, this.config.cleanupInterval, () => this.cleanup());
  }

  /**
   * Remove empty cells to keep memory usage low.
   */
  private cleanup(): void {
    cleanupEmptyCells({ cells: this.cells, objectToCells: this.objectToCells, config: this.config, stats: this.stats });
  }
}
