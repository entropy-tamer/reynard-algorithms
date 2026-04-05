/**
 * @module algorithms/geometry/algorithms/bresenham/bresenham-core
 * @description Implements Bresenham's Line Algorithm for efficient line drawing.
 */
import { Point, BresenhamConfig, BresenhamResult, LineDrawingOptions, LineDrawingResult, MultiLineOptions, MultiLineResult } from "./bresenham-types";
/**
 * The BresenhamLine class provides an efficient implementation of Bresenham's Line Algorithm
 * for drawing lines on a pixel grid. It's particularly useful for computer graphics,
 * game development, and any application that needs to draw lines efficiently.
 *
 * @example
 * ```typescript
 * const bresenham = new BresenhamLine();
 * const result = bresenham.drawLine({ x: 0, y: 0 }, { x: 10, y: 5 });
 * console.log(result.points); // Array of points representing the line
 * ```
 */
export declare class BresenhamLine {
    private config;
    /**
     * Creates an instance of BresenhamLine.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<BresenhamConfig>);
    /**
     * Draws a line between two points using Bresenham's algorithm.
     * @param start - The starting point.
     * @param end - The ending point.
     * @param options - Optional line drawing options.
     * @returns A LineDrawingResult object with the generated points and statistics.
     * @example
     */
    drawLine(start: Point, end: Point, options?: Partial<LineDrawingOptions>): LineDrawingResult;
    /**
     * Draws multiple lines between consecutive points.
     * @param points - Array of points to connect with lines.
     * @param options - Optional multi-line drawing options.
     * @returns A MultiLineResult object with all generated lines and statistics.
     * @example
     */
    drawMultiLine(points: Point[], options?: Partial<MultiLineOptions>): MultiLineResult;
    /**
     * Draws a line using the basic Bresenham algorithm (without additional features).
     * @param start - The starting point.
     * @param end - The ending point.
     * @returns A BresenhamResult object with the generated points and statistics.
     * @example
     */
    drawBasicLine(start: Point, end: Point): BresenhamResult;
    /**
     * Generates points for a line using Bresenham's algorithm with additional features.
     * @param start - The starting point.
     * @param end - The ending point.
     * @param options - Line drawing options.
     * @returns Array of points representing the line.
     * @example
     */
    private generateLinePoints;
    /**
     * Generates points for a line using the basic Bresenham algorithm.
     * @param start - The starting point.
     * @param end - The ending point.
     * @param options - Optional configuration options.
     * @returns Array of points representing the line.
     * @example
     */
    private generateBasicLinePoints;
    /**
     * Calculates the distance between two points.
     * @param start - The starting point.
     * @param end - The ending point.
     * @returns The Euclidean distance between the points.
     * @example
     */
    static distance(start: Point, end: Point): number;
    /**
     * Calculates the Manhattan distance between two points.
     * @param start - The starting point.
     * @param end - The ending point.
     * @returns The Manhattan distance between the points.
     * @example
     */
    static manhattanDistance(start: Point, end: Point): number;
    /**
     * Calculates the Chebyshev distance between two points.
     * @param start - The starting point.
     * @param end - The ending point.
     * @returns The Chebyshev distance between the points.
     * @example
     */
    static chebyshevDistance(start: Point, end: Point): number;
    /**
     * Checks if a point is on a line segment.
     * @param point - The point to check.
     * @param start - The start of the line segment.
     * @param end - The end of the line segment.
     * @param tolerance - Tolerance for floating point comparison.
     * @returns True if the point is on the line segment.
     * @example
     */
    static isPointOnLine(point: Point, start: Point, end: Point, tolerance?: number): boolean;
    /**
     * Finds the closest point on a line segment to a given point.
     * @param point - The point to find the closest point for.
     * @param start - The start of the line segment.
     * @param end - The end of the line segment.
     * @returns The closest point on the line segment.
     * @example
     */
    static closestPointOnLine(point: Point, start: Point, end: Point): Point;
    /**
     * Generates a circle using Bresenham's circle algorithm.
     * @param center - The center of the circle.
     * @param radius - The radius of the circle.
     * @param options - Optional configuration options.
     * @returns Array of points representing the circle.
     * @example
     */
    static drawCircle(center: Point, radius: number, options?: Partial<BresenhamConfig>): Point[];
}
//# sourceMappingURL=bresenham-core.d.ts.map