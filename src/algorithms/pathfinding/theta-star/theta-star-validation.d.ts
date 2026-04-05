/**
 * Theta* Validation Operations
 *
 * Handles input validation, grid validation, and error checking
 * for the Theta* pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */
import type { GridValidationOptions, GridValidationResult, Point } from "./theta-star-types";
import { CellType } from "./theta-star-types";
/**
 * Validate grid for Theta* pathfinding
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param options Validation options
 * @returns Validation result
 * @example
 */
export declare function validateGrid(grid: CellType[], width: number, height: number, options?: Partial<GridValidationOptions>): GridValidationResult;
/**
 * Validate pathfinding parameters
 *
 * @param start Starting point
 * @param goal Goal point
 * @param width Grid width
 * @param height Grid height
 * @returns Validation result
 * @example
 */
export declare function validatePathfindingParams(start: Point, goal: Point, width: number, height: number): {
    isValid: boolean;
    errors: string[];
};
/**
 * Validate path for correctness
 *
 * @param path Path to validate
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns Validation result
 * @example
 */
export declare function validatePath(path: Point[], grid: CellType[], width: number, height: number): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
//# sourceMappingURL=theta-star-validation.d.ts.map