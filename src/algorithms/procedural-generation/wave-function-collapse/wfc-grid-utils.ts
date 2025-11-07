/**
 * @file Grid Utility Functions
 *
 * Utility functions for querying and analyzing generated Wave Function Collapse grids.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type { Position3D } from "./wave-function-collapse-types";

/**
 * Get tile frequency distribution
 *
 * @param grid Generated grid
 * @returns Map of tile frequencies
 */
export function getTileFrequencyDistribution(grid: any[][][]): Map<string, number> {
  const frequencies = new Map<string, number>();
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid[z][y][x];
        if (tile) {
          frequencies.set(tile, (frequencies.get(tile) || 0) + 1);
        }
      }
    }
  }

  return frequencies;
}

/**
 * Check if grid contains specific tile
 *
 * @param grid Generated grid
 * @param tileId Tile ID to search for
 * @returns True if tile is found
 */
export function gridContainsTile(grid: any[][][], tileId: string): boolean {
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[z][y][x] === tileId) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get positions of specific tile
 *
 * @param grid Generated grid
 * @param tileId Tile ID to search for
 * @returns Array of positions where tile is found
 */
export function getTilePositions(grid: any[][][], tileId: string): Position3D[] {
  const positions: Position3D[] = [];
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[z][y][x] === tileId) {
          positions.push({ x, y, z });
        }
      }
    }
  }

  return positions;
}
