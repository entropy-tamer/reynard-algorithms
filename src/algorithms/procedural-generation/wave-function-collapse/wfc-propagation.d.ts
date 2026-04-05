/**
 * @file Wave Function Collapse propagation and entropy operations
 */
/**
 * Wave Function Collapse Propagation Operations
 *
 * Handles constraint propagation and entropy calculation
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */
import type { Cell, Constraint, Position3D } from "./wave-function-collapse-types";
/**
 * Propagate constraints after a cell collapse
 *
 * @param grid Grid of cells
 * @param constraints Array of constraints
 * @param position Position of collapsed cell
 * @param collapsedTile Tile that was collapsed to
 * @param _collapsedTile
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if propagation was successful (no contradictions)
 * @example
 */
export declare function propagateConstraints(grid: Cell[][][], constraints: Constraint[], position: Position3D, _collapsedTile: string, width: number, height: number, depth: number): boolean;
/**
 * Calculate entropy for a cell
 *
 * @param cell Cell to calculate entropy for
 * @returns Entropy value
 * @example
 */
export declare function calculateEntropy(cell: Cell): number;
/**
 * Find cell with minimum entropy
 *
 * @param grid Grid of cells
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns Position of cell with minimum entropy, or null if all collapsed
 * @example
 */
export declare function findMinimumEntropyCell(grid: Cell[][][], width: number, height: number, depth: number): Position3D | null;
/**
 * Collapse a cell to a specific tile
 *
 * @param cell Cell to collapse
 * @param _tile Tile to collapse to
 * @param _random Random number generator
 * @example
 */
export declare function collapseCell(cell: Cell, _tile: any, _random: () => number): void;
/**
 * Select a random tile from possible tiles
 *
 * @param cell Cell to select tile for
 * @param random Random number generator
 * @returns Selected tile
 * @example
 */
export declare function selectRandomTile(cell: Cell, random: () => number): any;
/**
 * Check if grid is fully collapsed
 *
 * @param grid Grid of cells
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if all cells are collapsed
 * @example
 */
export declare function isGridFullyCollapsed(grid: Cell[][][], width: number, height: number, depth: number): boolean;
//# sourceMappingURL=wfc-propagation.d.ts.map