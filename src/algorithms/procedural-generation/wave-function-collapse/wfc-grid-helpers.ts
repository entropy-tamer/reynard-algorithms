/**
 * @file Wave Function Collapse Grid Helpers
 * @description Grid conversion and constraint resolution utilities
 */

import type { Tile, Constraint, Pattern, Cell, WaveFunctionCollapseAnalysisOptions } from "./wave-function-collapse-types";
import { generateConstraintsFromPatterns, validateConstraints as validateConstraintsUtil, generateConstraintsFromSockets } from "./wfc-constraint";

export type GridGenerationOptions = {
  patterns2D?: Pattern[];
  patterns3D?: Pattern[];
  analysisOptions?: WaveFunctionCollapseAnalysisOptions;
};

/**
 * Resolve constraints from tiles and options
 * @param tiles Available tiles
 * @param constraints Explicit constraints
 * @param options Generation options
 * @returns Resolved constraints
 */
export function resolveConstraints(tiles: Tile[], constraints: Constraint[], options: GridGenerationOptions): Constraint[] {
  if (constraints && constraints.length > 0) {
    return constraints;
  }
  if (tiles.some(t => t.sockets2D || t.sockets3D)) {
    return generateConstraintsFromSockets(tiles);
  }
  if (options.patterns2D) {
    return generateConstraintsFromPatterns(options.patterns2D);
  }
  if (options.patterns3D) {
    return generateConstraintsFromPatterns(options.patterns3D);
  }
  return [];
}

/**
 * Validate constraints against tiles
 * @param constraints Constraints to validate
 * @param tiles Available tiles
 */
export function validateConstraints(constraints: Constraint[], tiles: Tile[]): void {
  if (!validateConstraintsUtil(constraints, tiles)) {
    throw new Error("Invalid constraints for provided tiles");
  }
}

/**
 * Convert 3D grid to 2D result format
 * @param grid 3D grid (depth=1 for 2D)
 * @param width Grid width
 * @param height Grid height
 * @returns 2D result grid
 */
export function convertGrid2DToResult(grid: Cell[][][], width: number, height: number): string[][] {
  const resultGrid: string[][] = [];
  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    for (let x = 0; x < width; x++) {
      const cell = grid[0][y][x];
      row.push(cell.isCollapsed ? cell.possibleTiles[0] : "");
    }
    resultGrid.push(row);
  }
  return resultGrid;
}

