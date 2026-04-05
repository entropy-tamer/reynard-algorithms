/**
 * @file marching-squares-core.ts
 * @module algorithms/geometry/algorithms/marching-squares/marching-squares-core
 * @description Implements Marching Squares algorithm for generating contours from 2D scalar fields.
 */
import { MarchingSquaresConfig, MarchingSquaresQueryOptions, MarchingSquaresQueryResult, MarchingSquaresResult } from "./marching-squares-types";
/**
 * The MarchingSquares class provides an implementation of the Marching Squares algorithm
 * for generating contours from 2D scalar fields. It analyzes each cell in the field
 * and generates line segments that approximate the isosurface.
 *
 * @example
 * ```typescript
 * const marchingSquares = new MarchingSquares();
 * const scalarField = [
 *   [0.0, 0.0, 0.0],
 *   [0.0, 1.0, 0.0],
 *   [0.0, 0.0, 0.0],
 * ];
 * const result = marchingSquares.generateContours(scalarField, 1.0, 1.0);
 * console.log(result.contours.length); // Number of contours found
 * ```
 */
export declare class MarchingSquares {
    private config;
    /**
     * Creates an instance of MarchingSquares.
     * @param config - Optional configuration for the algorithm.
     * @example
     * ```typescript
     * const marchingSquares = new MarchingSquares({
     *   threshold: 0.5,
     *   simplifyContours: true
     * });
     * ```
     */
    constructor(config?: MarchingSquaresConfig);
    /**
     * Generates contours from a 2D scalar field using the marching squares algorithm.
     *
     * @param scalarField - 2D array of scalar values
     * @param cellWidth - Width of each cell in world units
     * @param cellHeight - Height of each cell in world units
     * @returns Result containing contours and statistics
     * @example
     * ```typescript
     * const result = marchingSquares.generateContours(scalarField, 1.0, 1.0);
     * console.log(`Found ${result.contours.length} contours`);
     * ```
     */
    generateContours(scalarField: number[][], cellWidth?: number, cellHeight?: number): MarchingSquaresResult;
    /**
     * Queries contours based on specified criteria.
     *
     * @param result - Result from generateContours
     * @param options - Query options
     * @returns Filtered contours and statistics
     * @example
     * ```typescript
     * const filtered = marchingSquares.queryContours(result, {
     *   minLength: 10,
     *   closedOnly: true
     * });
     * ```
     */
    queryContours(result: MarchingSquaresResult, options?: MarchingSquaresQueryOptions): MarchingSquaresQueryResult;
    /**
     * Validates the input scalar field.
     * @param scalarField - The 2D array to validate
     * @example
     * ```typescript
     * this.validateInput(scalarField);
     * ```
     */
    private validateInput;
    /**
     * Processes the scalar field and generates line segments.
     * @param scalarField - 2D array of scalar values
     * @param cellWidth - Width of each cell
     * @param cellHeight - Height of each cell
     * @returns Array of line segments
     * @example
     * ```typescript
     * const segments = this.processScalarField(scalarField, 1.0, 1.0);
     * ```
     */
    private processScalarField;
    /**
     * Processes a single cell and returns line segments for that cell.
     * @param cell - The marching squares cell to process
     * @returns Array of line segments for this cell
     * @example
     * ```typescript
     * const segments = this.processCell(cell);
     * ```
     */
    private processCell;
    /**
     * Returns the line segments for a given marching squares case.
     * @param caseIndex - The marching squares case index (0-15)
     * @param cell - The cell data
     * @returns Array of line segments
     * @example
     * ```typescript
     * const segments = this.getSegmentsForCase(5, cell);
     * ```
     */
    private getSegmentsForCase;
    /**
     * Calculates the intersection point of an edge with the isosurface.
     * @param cell - The cell data
     * @param edgeIndex - Index of the edge (0-3)
     * @returns Intersection point or null if no intersection
     * @example
     * ```typescript
     * const point = this.getEdgeIntersection(cell, 0);
     * ```
     */
    private getEdgeIntersection;
    /**
     * Connects line segments into continuous contours.
     * @param segments - Array of line segments to connect
     * @returns Array of connected contours
     * @example
     * ```typescript
     * const contours = this.connectSegmentsToContours(segments);
     * ```
     */
    private connectSegmentsToContours;
    /**
     * Builds a single contour by connecting segments.
     * @param segments - Array of all segments
     * @param startIndex - Index of the starting segment
     * @param used - Set of already used segment indices
     * @returns A connected contour
     * @example
     * ```typescript
     * const contour = this.buildContour(segments, 0, used);
     * ```
     */
    private buildContour;
    /**
     * Simplifies a contour by removing redundant vertices.
     * @param contour - The contour to simplify
     * @returns Simplified contour
     * @example
     * ```typescript
     * const simplified = this.simplifyContour(contour);
     * ```
     */
    private simplifyContour;
    /**
     * Calculates the distance from a point to a line segment.
     * @param point - The point to measure distance from
     * @param lineStart - Start point of the line segment
     * @param lineEnd - End point of the line segment
     * @returns Distance from point to line segment
     * @example
     * ```typescript
     * const distance = this.pointLineDistance(point, start, end);
     * ```
     */
    private pointLineDistance;
    /**
     * Calculates the total length of a contour.
     * @param contour - The contour to measure
     * @returns Total length of the contour
     * @example
     * ```typescript
     * const length = this.calculateContourLength(contour);
     * ```
     */
    private calculateContourLength;
    /**
     * Checks if a contour intersects with the given bounds.
     * @param contour - The contour to check
     * @param bounds - Bounding box [minX, minY, maxX, maxY]
     * @returns True if contour intersects bounds
     * @example
     * ```typescript
     * const intersects = this.contourIntersectsBounds(contour, bounds);
     * ```
     */
    private contourIntersectsBounds;
    /**
     * Checks if two points are approximately equal.
     * @param p1 - First point
     * @param p2 - Second point
     * @param tolerance - Comparison tolerance
     * @returns True if points are approximately equal
     * @example
     * ```typescript
     * const equal = this.pointsEqual(p1, p2, 1e-6);
     * ```
     */
    private pointsEqual;
}
//# sourceMappingURL=marching-squares-core.d.ts.map