/**
 * @module algorithms/pathfinding/theta-star/line-of-sight
 * @description Line-of-sight checking algorithms for Theta* pathfinding.
 */
import type { Point, LineOfSightOptions, LineOfSightResult } from "./theta-star-types";
import { CellType } from "./theta-star-types";
/**
 * Line-of-sight checking algorithms for Theta* pathfinding.
 */
export declare class LineOfSight {
    /**
     * Checks if there's a line of sight between two points using Bresenham's line algorithm.
     * @param grid - The grid as a 1D array.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param options - Line-of-sight options.
     * @returns Line-of-sight result.
     * @example
     */
    static checkBresenham(grid: CellType[], from: Point, to: Point, width: number, height: number, options?: LineOfSightOptions): LineOfSightResult;
    /**
     * Checks if there's a line of sight between two points using DDA (Digital Differential Analyzer).
     * @param grid - The grid as a 1D array.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param options - Line-of-sight options.
     * @returns Line-of-sight result.
     * @example
     */
    static checkDDA(grid: CellType[], from: Point, to: Point, width: number, height: number, options?: LineOfSightOptions): LineOfSightResult;
    /**
     * Checks if there's a line of sight between two points using ray casting.
     * @param grid - The grid as a 1D array.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param options - Line-of-sight options.
     * @returns Line-of-sight result.
     * @example
     */
    static checkRayCasting(grid: CellType[], from: Point, to: Point, width: number, height: number, options?: LineOfSightOptions): LineOfSightResult;
    /**
     * Checks if there's a line of sight between two points using the best available method.
     * @param grid - The grid as a 1D array.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param options - Line-of-sight options.
     * @returns Line-of-sight result.
     * @example
     */
    static check(grid: CellType[], from: Point, to: Point, width: number, height: number, options?: LineOfSightOptions): LineOfSightResult;
    /**
     * Generates points along a line using Bresenham's algorithm.
     * @param from - Starting point.
     * @param to - Ending point.
     * @returns Array of points along the line.
     * @example
     */
    private static bresenhamLine;
    /**
     * Casts a ray from one point to another.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param maxDistance - Maximum distance to cast.
     * @param _maxDistance
     * @returns Array of points along the ray.
     * @example
     */
    private static castRay;
    /**
     * Calculates the distance between two points.
     * @param a - First point.
     * @param b - Second point.
     * @returns Distance.
     * @example
     */
    private static distance;
    private static _memoDistance?;
    /**
     * Checks if two points are equal.
     * @param a - First point.
     * @param b - Second point.
     * @param tolerance - Numerical tolerance.
     * @returns True if points are equal.
     * @example
     */
    private static pointsEqual;
    /**
     * Checks if a point is within grid bounds.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if point is within bounds.
     * @example
     */
    private static isWithinBounds;
    /**
     * Checks if a cell is walkable.
     * @param grid - The grid.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if cell is walkable.
     * @example
     */
    private static isWalkable;
}
//# sourceMappingURL=line-of-sight.d.ts.map