/**
 * Core Spatial Hashing Algorithm Implementation
 *
 * A highly optimized spatial partitioning system for efficient spatial queries,
 * nearest neighbor searches, and collision detection optimization.
 *
 * @module algorithms/spatialHashCore
 */

import { SpatialHashConfig, SpatialHashStats, SpatialObject, QueryResult } from "./spatial-hash-types";
import { estimateMemoryUsage } from "./spatial-hash-utils";
import type { SpatialDataType } from "../../types/spatial-types";

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
   * Insert an object into the spatial hash
   */
  insert(object: SpatialObject & { data: T }): void {
    const cellKeys = this.getObjectCells(object);

    for (const cellKey of Array.from(cellKeys)) {
      if (!this.cells.has(cellKey)) {
        this.cells.set(cellKey, []);
      }
      this.cells.get(cellKey)!.push(object);
    }

    this.objectToCells.set(object.id, cellKeys);
    this.stats.insertCount++;

    this.checkAutoResize();
    this.checkCleanup();
  }

  /**
   * Remove an object from the spatial hash
   */
  remove(objectId: string | number): boolean {
    const cellKeys = this.objectToCells.get(objectId);
    if (!cellKeys) return false;

    for (const cellKey of Array.from(cellKeys)) {
      const cell = this.cells.get(cellKey);
      if (cell) {
        const index = cell.findIndex(obj => obj.id === objectId);
        if (index !== -1) {
          cell.splice(index, 1);
          if (cell.length === 0) {
            this.cells.delete(cellKey);
          }
        }
      }
    }

    this.objectToCells.delete(objectId);
    this.stats.removeCount++;
    return true;
  }

  /**
   * Update an object's position in the spatial hash
   */
  update(object: SpatialObject & { data: T }): boolean {
    if (this.remove(object.id)) {
      this.insert(object);
      return true;
    }
    return false;
  }

  /**
   * Query for objects in a rectangular area
   */
  queryRect(x: number, y: number, width: number, height: number): Array<SpatialObject & { data: T }> {
    const cellKeys = this.getRectCells(x, y, width, height);
    const results = new Map<string | number, SpatialObject & { data: T }>();

    for (const cellKey of Array.from(cellKeys)) {
      const cell = this.cells.get(cellKey);
      if (cell) {
        for (const obj of cell) {
          if (this.isObjectInRect(obj, x, y, width, height) && obj.data !== undefined) {
            results.set(obj.id, obj as SpatialObject & { data: T });
          }
        }
      }
    }

    this.stats.queryCount++;
    return Array.from(results.values());
  }

  /**
   * Query for objects within a radius of a point
   */
  queryRadius(centerX: number, centerY: number, radius: number): Array<QueryResult<T>> {
    const cellKeys = this.getRadiusCells(centerX, centerY, radius);
    const results: Array<QueryResult<T>> = [];

    for (const cellKey of Array.from(cellKeys)) {
      const cell = this.cells.get(cellKey);
      if (cell) {
        for (const obj of cell) {
          const distance = this.getDistance(centerX, centerY, obj.x, obj.y);
          if (distance <= radius) {
            results.push({
              object: obj,
              distance,
              cellKey,
            });
          }
        }
      }
    }

    this.stats.queryCount++;
    return results.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find the nearest object to a point
   */
  findNearest(x: number, y: number, maxDistance?: number): QueryResult<T> | null {
    const radius = maxDistance || this.config.cellSize * 2;
    const results = this.queryRadius(x, y, radius);

    if (results.length === 0) {
      // Expand search if no results found
      const expandedResults = this.queryRadius(x, y, radius * 2);
      return expandedResults[0] || null;
    }

    return results[0];
  }

  /**
   * Get all objects in the spatial hash
   */
  getAllObjects(): Array<SpatialObject & { data: T }> {
    const objects = new Map<string | number, SpatialObject & { data: T }>();

    for (const cell of Array.from(this.cells.values())) {
      for (const obj of cell) {
        if (obj.data !== undefined) {
          objects.set(obj.id, obj as SpatialObject & { data: T });
        }
      }
    }

    return Array.from(objects.values());
  }

  /**
   * Clear all objects from the spatial hash
   */
  clear(): void {
    this.cells.clear();
    this.objectToCells.clear();
    this.stats.queryCount = 0;
    this.stats.insertCount = 0;
    this.stats.removeCount = 0;
  }

  /**
   * Get statistics about the spatial hash
   */
  getStats(): SpatialHashStats {
    let totalObjects = 0;
    let maxObjectsInCell = 0;
    let emptyCells = 0;

    for (const cell of Array.from(this.cells.values())) {
      totalObjects += cell.length;
      maxObjectsInCell = Math.max(maxObjectsInCell, cell.length);
    }

    emptyCells = this.cells.size === 0 ? 0 : Array.from(this.cells.values()).filter(cell => cell.length === 0).length;

    return {
      totalCells: this.cells.size,
      totalObjects,
      averageObjectsPerCell: this.cells.size > 0 ? totalObjects / this.cells.size : 0,
      maxObjectsInCell,
      emptyCells,
      memoryUsage: estimateMemoryUsage(this.cells.size, totalObjects, this.objectToCells.size),
      queryCount: this.stats.queryCount,
      insertCount: this.stats.insertCount,
      removeCount: this.stats.removeCount,
    };
  }

  /**
   * Resize the spatial hash with a new cell size
   */
  resize(newCellSize: number): void {
    if (newCellSize === this.config.cellSize) return;

    const oldCells = this.cells;
    const oldObjectToCells = this.objectToCells;

    this.config.cellSize = newCellSize;
    this.cells = new Map();
    this.objectToCells = new Map();

    // Reinsert all objects with new cell size
    for (const [objectId, cellKeys] of Array.from(oldObjectToCells.entries())) {
      const firstCellKey = Array.from(cellKeys)[0];
      const object = oldCells.get(firstCellKey)?.find((obj: SpatialObject<T>) => obj.id === objectId);
      if (object && object.data !== undefined) {
        this.insert(object as SpatialObject<T> & { data: T });
      }
    }
  }

  private getObjectCells(object: SpatialObject): Set<string> {
    const width = object.width || 0;
    const height = object.height || 0;
    return this.getRectCells(object.x, object.y, width, height);
  }

  private getRectCells(x: number, y: number, width: number, height: number): Set<string> {
    const minCellX = Math.floor(x / this.config.cellSize);
    const maxCellX = Math.floor((x + width) / this.config.cellSize);
    const minCellY = Math.floor(y / this.config.cellSize);
    const maxCellY = Math.floor((y + height) / this.config.cellSize);

    const cellKeys = new Set<string>();
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        cellKeys.add(`${cellX},${cellY}`);
      }
    }
    return cellKeys;
  }

  private getRadiusCells(centerX: number, centerY: number, radius: number): Set<string> {
    const minCellX = Math.floor((centerX - radius) / this.config.cellSize);
    const maxCellX = Math.floor((centerX + radius) / this.config.cellSize);
    const minCellY = Math.floor((centerY - radius) / this.config.cellSize);
    const maxCellY = Math.floor((centerY + radius) / this.config.cellSize);

    const cellKeys = new Set<string>();
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        cellKeys.add(`${cellX},${cellY}`);
      }
    }
    return cellKeys;
  }

  private isObjectInRect(
    object: SpatialObject,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean {
    const objWidth = object.width || 0;
    const objHeight = object.height || 0;

    return (
      object.x < rectX + rectWidth &&
      object.x + objWidth > rectX &&
      object.y < rectY + rectHeight &&
      object.y + objHeight > rectY
    );
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private checkAutoResize(): void {
    if (!this.config.enableAutoResize) return;

    const stats = this.getStats();
    const loadFactor = stats.averageObjectsPerCell / this.config.maxObjectsPerCell;

    if (loadFactor > this.config.resizeThreshold) {
      const newCellSize = this.config.cellSize * 1.5;
      this.resize(newCellSize);
    }
  }

  private checkCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.config.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  private cleanup(): void {
    // Remove empty cells
    for (const [cellKey, cell] of Array.from(this.cells.entries())) {
      if (cell.length === 0) {
        this.cells.delete(cellKey);
      }
    }
  }
}
