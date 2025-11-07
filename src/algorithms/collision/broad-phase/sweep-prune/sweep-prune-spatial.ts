/**
 * Spatial partitioning utilities for Sweep and Prune algorithm
 *
 * Provides spatial partitioning for efficient collision detection on large datasets.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-spatial
 */

import type { AABB, SpatialCell, SweepPruneConfig } from "./sweep-prune-types";
import { createCollisionPair, aabbsOverlap, getPairId } from "./sweep-prune-collision";
import type { CollisionPair } from "./sweep-prune-types";

/**
 * Partition AABBs into spatial cells
 */
export function partitionAABBs(aabbs: AABB[], config: SweepPruneConfig): Map<string, SpatialCell> {
  const cells = new Map<string, SpatialCell>();

  for (const aabb of aabbs) {
    const cellKey = getSpatialCellKey(aabb, config);

    if (!cells.has(cellKey)) {
      cells.set(cellKey, {
        bounds: getCellBounds(cellKey, config),
        aabbs: [],
        active: true,
      });
    }

    cells.get(cellKey)!.aabbs.push(aabb);
  }

  return cells;
}

/**
 * Get spatial cell key for an AABB
 */
export function getSpatialCellKey(aabb: AABB, config: SweepPruneConfig): string {
  const cellX = Math.floor(aabb.minX / config.spatialCellSize);
  const cellY = Math.floor(aabb.minY / config.spatialCellSize);
  return `${cellX},${cellY}`;
}

/**
 * Get bounds for a spatial cell
 */
export function getCellBounds(cellKey: string, config: SweepPruneConfig): AABB {
  const [cellX, cellY] = cellKey.split(",").map(Number);
  const cellSize = config.spatialCellSize;

  return {
    minX: cellX * cellSize,
    minY: cellY * cellSize,
    maxX: (cellX + 1) * cellSize,
    maxY: (cellY + 1) * cellSize,
    id: `cell-${cellKey}`,
  };
}

/**
 * Check for collisions between adjacent spatial cells
 */
export function checkInterCellCollisions(
  cells: Map<string, SpatialCell>,
  activePairs: Map<string, CollisionPair>
): CollisionPair[] {
  const interCellPairs: CollisionPair[] = [];

  for (const [cellKey, cell] of cells) {
    const [cellX, cellY] = cellKey.split(",").map(Number);

    // Check adjacent cells
    const adjacentCells = [`${cellX + 1},${cellY}`, `${cellX},${cellY + 1}`, `${cellX + 1},${cellY + 1}`];

    for (const adjacentKey of adjacentCells) {
      const adjacentCell = cells.get(adjacentKey);
      if (adjacentCell) {
        // Check collisions between AABBs in adjacent cells
        for (const aabb1 of cell.aabbs) {
          for (const aabb2 of adjacentCell.aabbs) {
            if (aabbsOverlap(aabb1, aabb2)) {
              interCellPairs.push(createCollisionPair(aabb1, aabb2, activePairs));
            }
          }
        }
      }
    }
  }

  return interCellPairs;
}












