/**
 * AABB Spatial Hashing
 *
 * Optimized spatial partitioning system for efficient collision detection.
 * Uses spatial hashing to reduce collision checks from O(n²) to O(n) in many cases.
 *
 * @module algorithms/aabbSpatialHash
 */

import type { AABB } from "../../computational-geometry/collision/aabb-types";

/**
 * Spatial hash for optimized collision detection
 */
export class SpatialHash {
  private cells = new Map<string, number[]>();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private getAABBCells(aabb: AABB): string[] {
    const minCellX = Math.floor(aabb.x / this.cellSize);
    const maxCellX = Math.floor((aabb.x + aabb.width) / this.cellSize);
    const minCellY = Math.floor(aabb.y / this.cellSize);
    const maxCellY = Math.floor((aabb.y + aabb.height) / this.cellSize);

    const cells: string[] = [];
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    return cells;
  }

  insert(index: number, aabb: AABB): void {
    const cells = this.getAABBCells(aabb);
    for (const cell of cells) {
      if (!this.cells.has(cell)) {
        this.cells.set(cell, []);
      }
      this.cells.get(cell)!.push(index);
    }
  }

  query(aabb: AABB): number[] {
    const cells = this.getAABBCells(aabb);
    const candidates = new Set<number>();

    for (const cell of cells) {
      const cellObjects = this.cells.get(cell);
      if (cellObjects) {
        for (const index of cellObjects) {
          candidates.add(index);
        }
      }
    }

    return Array.from(candidates);
  }

  clear(): void {
    this.cells.clear();
  }
}
