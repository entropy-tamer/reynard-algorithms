/**
 * Theta* Path Smoothing Operations
 *
 * Handles path optimization and smoothing
 * for the Theta* pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */
import type { PathOptimizationOptions, PathOptimizationResult, Point } from "./theta-star-types";
import { CellType } from "./theta-star-types";
/**
 * Optimize path by removing redundant points and smoothing
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param options Optimization options
 * @returns Optimization result
 * @example
 */
export declare function optimizePath(path: Point[], grid: CellType[], width: number, height: number, options?: Partial<PathOptimizationOptions>): PathOptimizationResult;
/**
 * Remove redundant points from path
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns Path with redundant points removed
 * @example
 */
export declare function removeRedundantPoints(path: Point[], grid: CellType[], width: number, height: number): Point[];
/**
 * Smooth path using iterative relaxation
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param factor Smoothing factor (0-1)
 * @param maxIterations Maximum smoothing iterations
 * @returns Smoothed path
 * @example
 */
export declare function smoothPath(path: Point[], grid: CellType[], width: number, height: number, factor: number, maxIterations: number): Point[];
/**
 * Apply path compression to remove unnecessary waypoints
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param _height
 * @returns Compressed path
 * @example
 */
export declare function compressPath(path: Point[], grid: CellType[], width: number, _height: number): Point[];
/**
 * Apply path relaxation to smooth sharp turns
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param relaxationFactor Relaxation factor (0-1)
 * @returns Relaxed path
 * @example
 */
export declare function relaxPath(path: Point[], grid: CellType[], width: number, height: number, relaxationFactor?: number): Point[];
//# sourceMappingURL=theta-star-smoothing.d.ts.map