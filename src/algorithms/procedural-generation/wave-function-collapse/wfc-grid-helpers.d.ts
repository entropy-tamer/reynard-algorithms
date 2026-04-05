/**
 * @file Wave Function Collapse Grid Helpers
 * @description Grid conversion and constraint resolution utilities
 */
import type { Tile, Constraint, Pattern, Cell, WaveFunctionCollapseAnalysisOptions } from "./wave-function-collapse-types";
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
 * @example
 */
export declare function resolveConstraints(tiles: Tile[], constraints: Constraint[], options: GridGenerationOptions): Constraint[];
/**
 * Validate constraints against tiles
 * @param constraints Constraints to validate
 * @param tiles Available tiles
 * @example
 */
export declare function validateConstraints(constraints: Constraint[], tiles: Tile[]): void;
/**
 * Convert 3D grid to 2D result format
 * @param grid 3D grid (depth=1 for 2D)
 * @param width Grid width
 * @param height Grid height
 * @returns 2D result grid
 * @example
 */
export declare function convertGrid2DToResult(grid: Cell[][][], width: number, height: number): string[][];
//# sourceMappingURL=wfc-grid-helpers.d.ts.map