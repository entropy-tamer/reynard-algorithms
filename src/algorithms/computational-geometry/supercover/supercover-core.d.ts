/**
 * @file Supercover line algorithm (grid traversal covering all intersected cells).
 * @module algorithms/geometry/algorithms/supercover/supercover-core
 * @description Supercover line algorithm (grid traversal covering all intersected cells).
 */
export interface Point2D {
    x: number;
    y: number;
}
export interface SupercoverLineResult {
    points: Point2D[];
    pointCount: number;
    success: boolean;
}
/**
 * Supercover line: returns every grid cell the line passes through.
 * Based on Amanatides & Woo style grid traversal with integer rounding.
 */
export declare class SupercoverLine {
    /**
     * Compute the supercover path between two points on an integer grid.
     * Includes every grid cell the line passes through, including both endpoints.
     *
     * @param start - Inclusive start point; coordinates are floored to grid indices
     * @param end - Inclusive end point; coordinates are floored to grid indices
     * @returns Result containing ordered grid cells and metadata
     * @example
     * // Basic usage
     * const result = SupercoverLine.draw({ x: 0, y: 0 }, { x: 3, y: 2 })
     * console.log(result.points)
     */
    static draw(start: Point2D, end: Point2D): SupercoverLineResult;
}
export declare const Supercover: {
    draw: typeof SupercoverLine.draw;
};
//# sourceMappingURL=supercover-core.d.ts.map