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
 * @example
 */
export declare function getTileFrequencyDistribution(grid: any[][][]): Map<string, number>;
/**
 * Check if grid contains specific tile
 *
 * @param grid Generated grid
 * @param tileId Tile ID to search for
 * @returns True if tile is found
 * @example
 */
export declare function gridContainsTile(grid: any[][][], tileId: string): boolean;
/**
 * Get positions of specific tile
 *
 * @param grid Generated grid
 * @param tileId Tile ID to search for
 * @returns Array of positions where tile is found
 * @example
 */
export declare function getTilePositions(grid: any[][][], tileId: string): Position3D[];
//# sourceMappingURL=wfc-grid-utils.d.ts.map