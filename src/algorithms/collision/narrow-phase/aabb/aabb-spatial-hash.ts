/**
 * AABB Spatial Hashing
 *
 * Optimized spatial partitioning system for efficient collision detection.
 * Uses spatial hashing to reduce collision checks from O(n²) to O(n) in many cases.
 *
 * @module algorithms/aabbSpatialHash
 */

import type { AABB } from "./aabb-types";

/**
 * Spatial hash for optimized collision detection
 */
export class SpatialHash {
  private cells = new Map<string, number[]>();
  private cellSize: number;

  /**
   * Creates an empty spatial hash with square cells of the given side length.
   * Larger cells hold more objects per bucket; smaller cells spread objects across more buckets.
   *
   * @param cellSize Side length of one grid cell in world units.
   */
  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  /**
   * Maps an AABB to the string keys of every grid cell it overlaps.
   * Cell coordinates are floor-divided by the cell size on both axes, so a box
   * spanning a boundary contributes to each cell it touches.
   *
   * @param aabb Box whose overlapping cell keys are computed.
   * @returns Keys of all cells covered by the box.
   */
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

  /**
   * Registers an object index in every cell that its AABB overlaps.
   *
   * @param index Object identifier to store in the affected cells.
   * @param aabb Box whose cells receive the index.
   */
  insert(index: number, aabb: AABB): void {
    const cells = this.getAABBCells(aabb);
    for (const cell of cells) {
      if (!this.cells.has(cell)) {
        this.cells.set(cell, []);
      }
      this.cells.get(cell)!.push(index);
    }
  }

  /**
   * Collects the distinct object indices sharing at least one cell with the query AABB.
   * These are broad-phase candidates, not confirmed collisions; an index appearing in
   * several overlapping cells is returned once.
   *
   * @param aabb Query box whose cells are scanned.
   * @returns Deduplicated candidate object indices.
   * Complexity: see `catalog-algorithms-collision-narrow-phase-aabb` in ~/src/foxtools/registry/algorithms/ (unknown: no machine-readable bound recorded; the guide is authoritative).
   */
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

  /**
   * Removes every cell bucket, leaving the spatial hash empty.
   */
  clear(): void {
    this.cells.clear();
  }
}
